export interface VoiceModel {
  id: string;
  userId: string;
  fishAudioModelId: string;
  title: string;
  state: "created" | "training" | "trained" | "failed";
  audioFilePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedAudio {
  id: string;
  userId: string;
  voiceModelId: string;
  text: string;
  audioUrl: string;
  createdAt: string;
}

export const voiceApi = {
  async createVoiceModel(title: string, audioFile: File): Promise<VoiceModel> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('audio', audioFile);

    const response = await fetch('/api/voice-models', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create voice model');
    }

    return response.json();
  },

  async listVoiceModels(): Promise<VoiceModel[]> {
    const response = await fetch('/api/voice-models', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to list voice models');
    }

    return response.json();
  },

  async renameVoiceModel(id: string, title: string): Promise<void> {
    const response = await fetch(`/api/voice-models/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to rename voice model');
    }
  },

  async deleteVoiceModel(id: string): Promise<void> {
    const response = await fetch(`/api/voice-models/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete voice model');
    }
  },

  async generateSpeech(text: string, voiceModelId: string): Promise<GeneratedAudio & { audioBuffer: string }> {
    const response = await fetch('/api/generate-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceModelId }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate speech');
    }

    return response.json();
  },

  async listGeneratedAudio(): Promise<GeneratedAudio[]> {
    const response = await fetch('/api/generated-audio', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to list generated audio');
    }

    return response.json();
  },

  async getCredits(): Promise<{ credits: number }> {
    const response = await fetch('/api/credits', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get credits');
    }

    return response.json();
  },

  async getCreditPackages(): Promise<Array<{ id: string; credits: number; amount: number }>> {
    const response = await fetch('/api/credit-packages', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get credit packages');
    }

    return response.json();
  },

  async createCharge(packageId: string): Promise<any> {
    const response = await fetch('/api/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packageId }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create charge');
    }

    return response.json();
  },

  async processPayment(packageId: string, receiptId: string): Promise<{ success: boolean; credits: number }> {
    const response = await fetch('/api/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packageId, receiptId }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process payment');
    }

    return response.json();
  },
};
