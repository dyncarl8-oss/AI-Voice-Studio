import { 
  type User, 
  type InsertUser,
  type VoiceModel,
  type InsertVoiceModel,
  type GeneratedAudio,
  type InsertGeneratedAudio,
  users,
  voiceModels,
  generatedAudio
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByWhopId(whopUserId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.whopUserId, whopUserId)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUserCredits(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    return user ? parseInt(user.credits, 10) : 0;
  }

  async deductCredits(userId: string, amount: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const currentCredits = parseInt(user.credits, 10);
    
    // Check if user has enough credits BEFORE attempting deduction
    if (currentCredits < amount) {
      return false;
    }
    
    // Atomic update: only deduct if credits haven't changed (prevents race conditions)
    const result = await db.update(users)
      .set({ credits: (currentCredits - amount).toString() })
      .where(and(
        eq(users.id, userId),
        eq(users.credits, currentCredits.toString())
      ))
      .returning();
    
    // If no rows were updated, credits changed (race condition) - retry
    if (result.length === 0) {
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
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const currentCredits = parseInt(user.credits, 10);
    const newCredits = currentCredits + amount;
    
    await db.update(users)
      .set({ credits: newCredits.toString() })
      .where(eq(users.id, userId));
  }

  async getVoiceModel(id: string): Promise<VoiceModel | undefined> {
    const result = await db.select().from(voiceModels).where(eq(voiceModels.id, id)).limit(1);
    return result[0];
  }

  async getVoiceModelsByUserId(userId: string): Promise<VoiceModel[]> {
    return db.select().from(voiceModels).where(eq(voiceModels.userId, userId));
  }

  async createVoiceModel(model: InsertVoiceModel & { fishAudioModelId: string; audioFilePath?: string }): Promise<VoiceModel> {
    const result = await db.insert(voiceModels).values(model).returning();
    return result[0];
  }

  async updateVoiceModelState(id: string, state: string): Promise<void> {
    await db.update(voiceModels)
      .set({ state, updatedAt: new Date() })
      .where(eq(voiceModels.id, id));
  }

  async updateVoiceModelTitle(id: string, title: string): Promise<void> {
    await db.update(voiceModels)
      .set({ title, updatedAt: new Date() })
      .where(eq(voiceModels.id, id));
  }

  async deleteVoiceModel(id: string): Promise<void> {
    await db.delete(voiceModels).where(eq(voiceModels.id, id));
  }

  async getGeneratedAudioByUserId(userId: string): Promise<GeneratedAudio[]> {
    return db.select().from(generatedAudio).where(eq(generatedAudio.userId, userId));
  }

  async createGeneratedAudio(audio: InsertGeneratedAudio & { audioUrl: string }): Promise<GeneratedAudio> {
    const result = await db.insert(generatedAudio).values(audio).returning();
    return result[0];
  }
}

// For development, use database storage
export const storage = new DbStorage();
