import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  whopUserId: text("whop_user_id").notNull().unique(),
  whopExperienceId: text("whop_experience_id").notNull(),
  credits: text("credits").notNull().default("3"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const voiceModels = pgTable("voice_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fishAudioModelId: text("fish_audio_model_id").notNull(),
  title: text("title").notNull(),
  state: text("state").notNull().default("created"),
  audioFilePath: text("audio_file_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const generatedAudio = pgTable("generated_audio", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  voiceModelId: varchar("voice_model_id").notNull().references(() => voiceModels.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  audioUrl: text("audio_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  whopUserId: true,
  whopExperienceId: true,
});

export const insertVoiceModelSchema = createInsertSchema(voiceModels).pick({
  title: true,
}).extend({
  userId: z.string(),
});

export const insertGeneratedAudioSchema = createInsertSchema(generatedAudio).pick({
  text: true,
  voiceModelId: true,
}).extend({
  userId: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVoiceModel = z.infer<typeof insertVoiceModelSchema>;
export type VoiceModel = typeof voiceModels.$inferSelect;
export type InsertGeneratedAudio = z.infer<typeof insertGeneratedAudioSchema>;
export type GeneratedAudio = typeof generatedAudio.$inferSelect;
