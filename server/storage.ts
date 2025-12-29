import { 
  type User, 
  type InsertUser,
  type VoiceModel,
  type InsertVoiceModel,
  type GeneratedAudio,
  type InsertGeneratedAudio,
} from "@shared/schema";
import { ObjectId } from "mongodb";
import { getDB } from "./db";

// Helper function to convert MongoDB document to User
function toUser(doc: any): User | undefined {
  if (!doc) return undefined;
  return {
    _id: doc._id.toString(),
    whopUserId: doc.whopUserId,
    whopExperienceId: doc.whopExperienceId,
    credits: doc.credits,
    createdAt: doc.createdAt,
  };
}

// Helper function to convert MongoDB document to VoiceModel
function toVoiceModel(doc: any): VoiceModel | undefined {
  if (!doc) return undefined;
  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    fishAudioModelId: doc.fishAudioModelId,
    title: doc.title,
    state: doc.state,
    audioFilePath: doc.audioFilePath,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// Helper function to convert MongoDB document to GeneratedAudio
function toGeneratedAudio(doc: any): GeneratedAudio | undefined {
  if (!doc) return undefined;
  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    voiceModelId: doc.voiceModelId,
    text: doc.text,
    audioUrl: doc.audioUrl,
    createdAt: doc.createdAt,
  };
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByWhopId(whopUserId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserCredits(userId: string): Promise<number>;
  deductCredits(userId: string, amount: number): Promise<boolean>;
  addCredits(userId: string, amount: number): Promise<void>;

  // Voice Models
  getVoiceModel(id: string): Promise<VoiceModel | undefined>;
  getVoiceModelsByUserId(userId: string): Promise<VoiceModel[]>;
  createVoiceModel(model: InsertVoiceModel & { fishAudioModelId: string; audioFilePath?: string }): Promise<VoiceModel>;
  updateVoiceModelState(id: string, state: string): Promise<void>;
  updateVoiceModelTitle(id: string, title: string): Promise<void>;
  deleteVoiceModel(id: string): Promise<void>;

  // Generated Audio
  getGeneratedAudioByUserId(userId: string): Promise<GeneratedAudio[]>;
  createGeneratedAudio(audio: InsertGeneratedAudio & { audioUrl: string }): Promise<GeneratedAudio>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const db = getDB();
    const result = await db.collection('users').findOne({ _id: new ObjectId(id) });
    return toUser(result);
  }

  async getUserByWhopId(whopUserId: string): Promise<User | undefined> {
    const db = getDB();
    const result = await db.collection('users').findOne({ whopUserId });
    return toUser(result);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = getDB();
    const newUser = {
      ...insertUser,
      credits: "3",
      createdAt: new Date(),
    };
    const result = await db.collection('users').insertOne(newUser);
    return {
      _id: result.insertedId.toString(),
      ...newUser,
    };
  }

  async getUserCredits(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    return user ? parseInt(user.credits, 10) : 0;
  }

  async deductCredits(userId: string, amount: number): Promise<boolean> {
    const db = getDB();
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const currentCredits = parseInt(user.credits, 10);
    
    // Check if user has enough credits BEFORE attempting deduction
    if (currentCredits < amount) {
      return false;
    }
    
    // Atomic update: only deduct if credits haven't changed (prevents race conditions)
    const result = await db.collection('users').updateOne(
      {
        _id: new ObjectId(userId),
        credits: currentCredits.toString()
      },
      {
        $set: { credits: (currentCredits - amount).toString() }
      }
    );
    
    // If no documents were updated, credits changed (race condition) - retry
    if (result.modifiedCount === 0) {
      const updatedUser = await this.getUser(userId);
      if (updatedUser) {
        const newCredits = parseInt(updatedUser.credits, 10);
        if (newCredits >= amount) {
          // Retry if user still has enough credits
          return this.deductCredits(userId, amount);
        }
      }
      return false; // Insufficient credits or user not found
    }
    
    return true; // Successfully deducted
  }

  async addCredits(userId: string, amount: number): Promise<void> {
    const db = getDB();
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const currentCredits = parseInt(user.credits, 10);
    const newCredits = currentCredits + amount;
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { credits: newCredits.toString() } }
    );
  }

  async getVoiceModel(id: string): Promise<VoiceModel | undefined> {
    const db = getDB();
    const result = await db.collection('voice_models').findOne({ _id: new ObjectId(id) });
    return toVoiceModel(result);
  }

  async getVoiceModelsByUserId(userId: string): Promise<VoiceModel[]> {
    const db = getDB();
    const results = await db.collection('voice_models').find({ userId }).toArray();
    return results.map(doc => toVoiceModel(doc)!).filter(Boolean);
  }

  async createVoiceModel(model: InsertVoiceModel & { fishAudioModelId: string; audioFilePath?: string }): Promise<VoiceModel> {
    const db = getDB();
    const newModel = {
      ...model,
      state: "created",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('voice_models').insertOne(newModel);
    return {
      _id: result.insertedId.toString(),
      ...newModel,
    };
  }

  async updateVoiceModelState(id: string, state: string): Promise<void> {
    const db = getDB();
    await db.collection('voice_models').updateOne(
      { _id: new ObjectId(id) },
      { $set: { state, updatedAt: new Date() } }
    );
  }

  async updateVoiceModelTitle(id: string, title: string): Promise<void> {
    const db = getDB();
    await db.collection('voice_models').updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, updatedAt: new Date() } }
    );
  }

  async deleteVoiceModel(id: string): Promise<void> {
    const db = getDB();
    await db.collection('voice_models').deleteOne({ _id: new ObjectId(id) });
  }

  async getGeneratedAudioByUserId(userId: string): Promise<GeneratedAudio[]> {
    const db = getDB();
    const results = await db.collection('generated_audio').find({ userId }).toArray();
    return results.map(doc => toGeneratedAudio(doc)!).filter(Boolean);
  }

  async createGeneratedAudio(audio: InsertGeneratedAudio & { audioUrl: string }): Promise<GeneratedAudio> {
    const db = getDB();
    const newAudio = {
      ...audio,
      createdAt: new Date(),
    };
    const result = await db.collection('generated_audio').insertOne(newAudio);
    return {
      _id: result.insertedId.toString(),
      ...newAudio,
    };
  }
}

// For development, use database storage
export const storage = new DbStorage();
