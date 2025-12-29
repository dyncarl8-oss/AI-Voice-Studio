import { z } from "zod";

// User schema
export const insertUserSchema = z.object({
  whopUserId: z.string(),
  whopExperienceId: z.string(),
});

export const userSchema = insertUserSchema.extend({
  _id: z.string(),
  credits: z.string().default("3"),
  createdAt: z.string().or(z.date()).transform(val => typeof val === 'string' ? new Date(val) : val),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;

// Voice Model schema
export const insertVoiceModelSchema = z.object({
  userId: z.string(),
  title: z.string(),
});

export const voiceModelSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  fishAudioModelId: z.string(),
  title: z.string(),
  state: z.string().default("created"),
  audioFilePath: z.string().optional(),
  createdAt: z.string().or(z.date()).transform(val => typeof val === 'string' ? new Date(val) : val),
  updatedAt: z.string().or(z.date()).transform(val => typeof val === 'string' ? new Date(val) : val),
});

export type InsertVoiceModel = z.infer<typeof insertVoiceModelSchema>;
export type VoiceModel = z.infer<typeof voiceModelSchema>;

// Generated Audio schema
export const insertGeneratedAudioSchema = z.object({
  text: z.string(),
  voiceModelId: z.string(),
}).extend({
  userId: z.string(),
});

export const generatedAudioSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  voiceModelId: z.string(),
  text: z.string(),
  audioUrl: z.string(),
  createdAt: z.string().or(z.date()).transform(val => typeof val === 'string' ? new Date(val) : val),
});

export type InsertGeneratedAudio = z.infer<typeof insertGeneratedAudioSchema>;
export type GeneratedAudio = z.infer<typeof generatedAudioSchema>;
