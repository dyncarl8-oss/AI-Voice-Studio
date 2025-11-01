import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';

const FISH_AUDIO_API_URL = 'https://api.fish.audio';

export class FishAudioService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Create a voice model from an audio file
   */
  async createVoiceModel(params: {
    title: string;
    audioFilePath: string;
    description?: string;
  }): Promise<{
    _id: string;
    title: string;
    state: string;
    created_at: string;
  }> {
    const formData = new FormData();
    formData.append('type', 'tts');
    formData.append('title', params.title);
    formData.append('train_mode', 'fast');
    formData.append('visibility', 'private');
    
    if (params.description) {
      formData.append('description', params.description);
    }

    // Append the audio file
    formData.append('voices', createReadStream(params.audioFilePath));

    const response = await axios.post(`${FISH_AUDIO_API_URL}/model`, formData, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        ...formData.getHeaders(),
      },
    });

    return response.data;
  }

  /**
   * Get voice model details
   */
  async getModel(modelId: string): Promise<{
    _id: string;
    title: string;
    state: string;
    created_at: string;
    updated_at: string;
  }> {
    const response = await axios.get(`${FISH_AUDIO_API_URL}/model/${modelId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return response.data;
  }

  /**
   * List all voice models for the authenticated user
   */
  async listModels(): Promise<Array<{
    _id: string;
    title: string;
    state: string;
    created_at: string;
  }>> {
    const response = await axios.get(`${FISH_AUDIO_API_URL}/model`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return response.data;
  }

  /**
   * Delete a voice model
   */
  async deleteModel(modelId: string): Promise<void> {
    await axios.delete(`${FISH_AUDIO_API_URL}/model/${modelId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }

  /**
   * Generate text-to-speech audio using s1 model with emotion support
   * Emotions must be placed at the beginning of sentences in the text parameter
   * Example: "(happy) What a wonderful day! (sad) But I'll miss you."
   */
  async textToSpeech(params: {
    text: string;
    referenceId: string;
    format?: 'mp3' | 'wav' | 'pcm' | 'opus';
    temperature?: number;
    topP?: number;
  }): Promise<Buffer> {
    console.log('[Fish Audio TTS] Using model: s1');
    console.log('[Fish Audio TTS] Text with emotions:', params.text);
    console.log('[Fish Audio TTS] Reference ID:', params.referenceId);
    
    const response = await axios.post(
      `${FISH_AUDIO_API_URL}/v1/tts`,
      {
        text: params.text,
        reference_id: params.referenceId,
        format: params.format || 'mp3',
        normalize: true,
        mp3_bitrate: 128,
        temperature: params.temperature ?? 0.9,
        top_p: params.topP ?? 0.9,
        chunk_length: 200,
        latency: 'normal',
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'model': 's1',
        },
        responseType: 'arraybuffer',
      }
    );

    console.log('[Fish Audio TTS] Audio generated successfully');
    return Buffer.from(response.data);
  }
}

// Singleton instance
let fishAudioService: FishAudioService | null = null;

export function getFishAudioService(): FishAudioService {
  if (!process.env.FISH_AUDIO_API_KEY) {
    throw new Error('FISH_AUDIO_API_KEY environment variable is not set');
  }

  if (!fishAudioService) {
    fishAudioService = new FishAudioService(process.env.FISH_AUDIO_API_KEY);
  }

  return fishAudioService;
}
