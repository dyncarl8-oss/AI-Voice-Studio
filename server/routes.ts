import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { getFishAudioService } from "./services/fishAudio";
import { insertVoiceModelSchema, insertGeneratedAudioSchema } from "@shared/schema";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import jwt from "jsonwebtoken";
import { WhopServerSdk } from "@whop/api";
import { Webhook } from "standardwebhooks";

// Whop's public key for JWT verification (ES256)
const WHOP_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErz8a8vxvexHC0TLT91g7llOdDOsN
uYiGEfic4Qhni+HMfRBuUphOh7F3k8QgwZc9UlL0AHmyYqtbhL9NuJes6w==
-----END PUBLIC KEY-----`;

// Initialize Whop SDK
const whopSdk = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.WHOP_APP_ID || 'app_default',
});

// Server-side credit packages (single source of truth)
const CREDIT_PACKAGES = {
  'pkg_10': { credits: 10, amount: 100 },
  'pkg_25': { credits: 25, amount: 200 },
  'pkg_50': { credits: 50, amount: 350 },
  'pkg_100': { credits: 100, amount: 600 },
} as const;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3 and WAV files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Whop authentication middleware
  app.use(async (req, res, next) => {
    // Skip authentication for webhook endpoints (they use signature verification instead)
    // and for health check endpoint (used by monitoring services like cron-job.org)
    if (req.path.startsWith('/api/webhooks/') || req.path === '/health') {
      return next();
    }

    // Check if dev mode is explicitly enabled
    const isDevMode = process.env.NODE_ENV === 'development';
    
    try {
      // Get the user token from headers
      const userToken = req.headers['x-whop-user-token'] as string;
      
      if (!userToken) {
        // Only use dev user if explicitly in development mode
        if (isDevMode) {
          req.user = {
            whopUserId: 'dev_user_123',
            whopExperienceId: 'dev_exp_123',
          };
          return next();
        }
        // Production: reject requests without tokens
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
      }

      // Verify the JWT token with Whop's public key
      const decoded = jwt.verify(userToken, WHOP_PUBLIC_KEY, {
        algorithms: ['ES256'],
        issuer: 'urn:whopcom:exp-proxy'
      }) as { sub?: string; aud?: string };
      
      if (!decoded.sub) {
        throw new Error('Invalid token: missing user ID');
      }

      // Extract experience ID from the URL path
      // URL format: /experiences/:experienceId or just using API
      const experienceIdMatch = req.path.match(/\/experiences\/([^\/]+)/);
      const experienceId = experienceIdMatch?.[1] || decoded.aud || 'unknown';

      req.user = {
        whopUserId: decoded.sub,
        whopExperienceId: experienceId,
      };
      
      next();
    } catch (error) {
      console.error('Whop authentication error:', error);
      // Only fallback to dev user if explicitly in development mode
      if (isDevMode) {
        req.user = {
          whopUserId: 'dev_user_123',
          whopExperienceId: 'dev_exp_123',
        };
        return next();
      }
      // Production: reject invalid tokens
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  });

  // Ensure user exists in database
  app.use(async (req, res, next) => {
    if (req.user) {
      let user = await storage.getUserByWhopId(req.user.whopUserId);
      if (!user) {
        user = await storage.createUser({
          whopUserId: req.user.whopUserId,
          whopExperienceId: req.user.whopExperienceId,
        });
      }
      req.userId = user.id;
    }
    next();
  });

  // Create voice model
  app.post('/api/voice-models', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // Save file temporarily with sanitized filename
      const fileExtension = req.file.originalname.split('.').pop() || 'wav';
      const tempFilePath = join(tmpdir(), `voice_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`);
      await writeFile(tempFilePath, req.file.buffer);

      // Create voice model in Fish Audio
      const fishAudio = getFishAudioService();
      const fishModel = await fishAudio.createVoiceModel({
        title,
        audioFilePath: tempFilePath,
        description: `Voice model created by user`,
      });

      // Save to database
      const voiceModel = await storage.createVoiceModel({
        userId: req.userId,
        title,
        fishAudioModelId: fishModel._id,
        audioFilePath: tempFilePath,
      });

      // Clean up temp file after a delay (give Fish Audio time to process)
      setTimeout(async () => {
        try {
          await unlink(tempFilePath);
        } catch (err) {
          console.error('Error deleting temp file:', err);
        }
      }, 60000); // 1 minute

      res.json(voiceModel);
    } catch (error: any) {
      console.error('Error creating voice model:', error);
      res.status(500).json({ error: error.message || 'Failed to create voice model' });
    }
  });

  // List voice models
  app.get('/api/voice-models', async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const models = await storage.getVoiceModelsByUserId(req.userId);
      
      // Update model states from Fish Audio
      const fishAudio = getFishAudioService();
      const updatedModels = await Promise.all(
        models.map(async (model) => {
          try {
            const fishModel = await fishAudio.getModel(model.fishAudioModelId);
            if (fishModel.state !== model.state) {
              await storage.updateVoiceModelState(model.id, fishModel.state);
              model.state = fishModel.state;
            }
          } catch (err) {
            console.error('Error fetching model state:', err);
          }
          return model;
        })
      );

      res.json(updatedModels);
    } catch (error: any) {
      console.error('Error listing voice models:', error);
      res.status(500).json({ error: error.message || 'Failed to list voice models' });
    }
  });

  // Update voice model (rename)
  app.patch('/api/voice-models/:id', async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const model = await storage.getVoiceModel(req.params.id);
      if (!model) {
        return res.status(404).json({ error: 'Voice model not found' });
      }

      if (model.userId !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await storage.updateVoiceModelTitle(req.params.id, title);

      res.json({ success: true, title });
    } catch (error: any) {
      console.error('Error updating voice model:', error);
      res.status(500).json({ error: error.message || 'Failed to update voice model' });
    }
  });

  // Delete voice model
  app.delete('/api/voice-models/:id', async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const model = await storage.getVoiceModel(req.params.id);
      if (!model) {
        return res.status(404).json({ error: 'Voice model not found' });
      }

      if (model.userId !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Delete from Fish Audio
      const fishAudio = getFishAudioService();
      try {
        await fishAudio.deleteModel(model.fishAudioModelId);
      } catch (err) {
        console.error('Error deleting from Fish Audio:', err);
      }

      // Delete from database
      await storage.deleteVoiceModel(req.params.id);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting voice model:', error);
      res.status(500).json({ error: error.message || 'Failed to delete voice model' });
    }
  });

  // Generate speech
  app.post('/api/generate-speech', async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { text, voiceModelId } = req.body;
      if (!text || !voiceModelId) {
        return res.status(400).json({ error: 'Text and voice model ID are required' });
      }

      const model = await storage.getVoiceModel(voiceModelId);
      if (!model) {
        return res.status(404).json({ error: 'Voice model not found' });
      }

      if (model.userId !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (model.state !== 'trained') {
        return res.status(400).json({ error: 'Voice model is not ready. Please wait for training to complete.' });
      }

      // Check if user has credits (but don't deduct yet)
      const credits = await storage.getUserCredits(req.userId);
      if (credits < 1) {
        return res.status(403).json({ error: 'Insufficient credits. Please purchase more credits to generate speech.' });
      }

      // Generate audio first
      const fishAudio = getFishAudioService();
      const audioBuffer = await fishAudio.textToSpeech({
        text,
        referenceId: model.fishAudioModelId,
        format: 'mp3',
      });

      // Save audio to temp file and create a URL
      const audioFileName = `audio_${Date.now()}.mp3`;
      const audioFilePath = join(tmpdir(), audioFileName);
      await writeFile(audioFilePath, audioBuffer);

      // In a real app, you'd upload to S3 or similar
      // For now, we'll serve it as a base64 data URL
      const audioBase64 = audioBuffer.toString('base64');
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

      // Save to database
      const generatedAudio = await storage.createGeneratedAudio({
        userId: req.userId,
        voiceModelId,
        text,
        audioUrl,
      });

      // Only deduct credit after successful generation (atomic operation prevents double-spend)
      const deducted = await storage.deductCredits(req.userId, 1);
      if (!deducted) {
        // This can happen if credits were consumed by a concurrent request
        return res.status(403).json({ error: 'Insufficient credits. Credits may have been used by another request.' });
      }

      res.json({
        ...generatedAudio,
        audioBuffer: audioBuffer.toString('base64'),
      });
    } catch (error: any) {
      console.error('Error generating speech:', error);
      res.status(500).json({ error: error.message || 'Failed to generate speech' });
    }
  });

  // List generated audio
  app.get('/api/generated-audio', async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const audioList = await storage.getGeneratedAudioByUserId(req.userId);
      res.json(audioList);
    } catch (error: any) {
      console.error('Error listing generated audio:', error);
      res.status(500).json({ error: error.message || 'Failed to list generated audio' });
    }
  });

  // Get user credits
  app.get('/api/credits', async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const credits = await storage.getUserCredits(req.userId);
      res.json({ credits });
    } catch (error: any) {
      console.error('Error getting credits:', error);
      res.status(500).json({ error: error.message || 'Failed to get credits' });
    }
  });

  // Health check endpoint (no authentication required)
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Get available credit packages
  app.get('/api/credit-packages', async (req, res) => {
    const packages = Object.entries(CREDIT_PACKAGES).map(([id, pkg]) => ({
      id,
      credits: pkg.credits,
      amount: pkg.amount,
    }));
    res.json(packages);
  });

  // Create payment charge
  app.post('/api/charge', async (req, res) => {
    try {
      if (!req.userId || !req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { packageId } = req.body;
      if (!packageId) {
        return res.status(400).json({ error: 'Package ID is required' });
      }

      // Validate package exists and get trusted values from server
      const pkg = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];
      if (!pkg) {
        return res.status(400).json({ error: 'Invalid package ID' });
      }

      const result = await whopSdk.payments.chargeUser({
        amount: pkg.amount / 100, // Convert cents to dollars for Whop API
        currency: "usd",
        userId: req.user.whopUserId,
        metadata: {
          packageId,
          experienceId: req.user.whopExperienceId,
          appUserId: req.userId,
        },
      });

      console.log('=== CHARGE USER RESULT ===');
      console.log('Result keys:', Object.keys(result || {}));
      console.log('Has inAppPurchase:', !!result?.inAppPurchase);
      console.log('Full result:', JSON.stringify(result, null, 2));

      // According to Whop docs, chargeUser returns an object with inAppPurchase property
      if (!result?.inAppPurchase) {
        console.error('No inAppPurchase property found in result');
        throw new Error("Failed to create charge - no inAppPurchase object returned");
      }

      console.log('=== RETURNING inAppPurchase ===');
      console.log(JSON.stringify(result.inAppPurchase, null, 2));

      // Return the inAppPurchase object to the client with packageId
      return res.json({ ...result.inAppPurchase, packageId });
    } catch (error: any) {
      console.error('Error creating charge:', error);
      res.status(500).json({ error: error.message || 'Failed to create charge' });
    }
  });

  // Process successful payment (called by client after inAppPurchase modal succeeds)
  app.post('/api/process-payment', async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { packageId, receiptId } = req.body;
      if (!packageId || !receiptId) {
        return res.status(400).json({ error: 'Package ID and receipt ID are required' });
      }

      // Validate package exists and get trusted values from server
      const pkg = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];
      if (!pkg) {
        return res.status(400).json({ error: 'Invalid package ID' });
      }

      console.log(`Processing payment for user ${req.userId}, package ${packageId}, receipt ${receiptId}`);
      
      // Add credits to user account
      await storage.addCredits(req.userId, pkg.credits);
      console.log(`✓ Added ${pkg.credits} credits to user ${req.userId}`);

      const newCredits = await storage.getUserCredits(req.userId);
      
      return res.json({ success: true, credits: newCredits });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      res.status(500).json({ error: error.message || 'Failed to process payment' });
    }
  });

  // Test endpoint to verify webhook URL is reachable
  app.get('/api/webhooks/payment', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Webhook endpoint is reachable. Use POST to send webhooks.',
      timestamp: new Date().toISOString()
    });
  });

  // Webhook endpoint for payment validation
  app.post('/api/webhooks/payment', async (req, res) => {
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body type:', req.body instanceof Buffer ? 'Buffer' : typeof req.body);
    
    try {
      const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.error('WHOP_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }

      // Get raw body as string (express.raw middleware provides Buffer in req.body)
      const payload = req.body instanceof Buffer ? req.body.toString('utf-8') : JSON.stringify(req.body);
      
      // Check if signature headers are present
      const hasSignature = req.headers['webhook-signature'] || req.headers['x-webhook-signature'];
      
      let webhookData: any;
      
      if (hasSignature) {
        // Production mode: Validate webhook signature
        const headers: Record<string, string> = {
          'webhook-id': req.headers['webhook-id'] as string || req.headers['x-webhook-id'] as string || '',
          'webhook-timestamp': req.headers['webhook-timestamp'] as string || req.headers['x-webhook-timestamp'] as string || '',
          'webhook-signature': req.headers['webhook-signature'] as string || req.headers['x-webhook-signature'] as string || '',
        };

        // WHOP_WEBHOOK_SECRET is already base64 encoded - don't double-encode it
        const wh = new Webhook(webhookSecret);
        webhookData = wh.verify(payload, headers);
        console.log('✓ Webhook signature verified');
      } else {
        // Test mode: No signature validation (Whop test webhooks don't include signatures)
        console.warn('⚠️  WARNING: Processing webhook without signature verification (test mode)');
        webhookData = JSON.parse(payload);
      }
      
      // Whop uses 'type' field for webhooks (and 'action' for some SDK events)
      const eventType = webhookData.type || webhookData.action;
      console.log('Received webhook event type:', eventType);
      console.log('Full webhook data:', JSON.stringify(webhookData, null, 2));

      // Handle payment succeeded event
      if (eventType === 'payment.succeeded') {
        const payment = webhookData.data;
        
        // Test webhooks from Whop dashboard have null data
        if (!payment) {
          console.log('Test webhook received (no payment data) - returning success');
          return res.status(200).json({ success: true, message: 'Test webhook received' });
        }
        
        console.log('Payment data:', JSON.stringify(payment, null, 2));
        console.log('Payment metadata:', JSON.stringify(payment.metadata, null, 2));
        
        if (payment.metadata?.packageId && payment.metadata?.appUserId) {
          const packageId = payment.metadata.packageId as string;
          const userId = payment.metadata.appUserId as string;
          
          console.log(`Processing payment for user ${userId}, package ${packageId}`);
          
          // Look up trusted credit amount from server-side package definition
          const pkg = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];
          if (!pkg) {
            console.error(`Invalid package ID in webhook: ${packageId}`);
            return res.status(400).json({ error: 'Invalid package ID' });
          }
          
          await storage.addCredits(userId, pkg.credits);
          console.log(`✓ Added ${pkg.credits} credits to user ${userId} for package ${packageId}`);
        } else {
          console.error('Missing required metadata in payment webhook');
          console.error('Expected: packageId and appUserId');
          console.error('Received metadata:', payment.metadata);
        }
      }

      // Return 200 quickly to avoid retries
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      
      // Return 401 for signature validation failures
      if (error.message?.includes('signature') || error.message?.includes('validation')) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
      
      // Return 400 for other errors
      res.status(400).json({ error: error.message || 'Failed to process webhook' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        whopUserId: string;
        whopExperienceId: string;
      };
      userId?: string;
    }
  }
}
