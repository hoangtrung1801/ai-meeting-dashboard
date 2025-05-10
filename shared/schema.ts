import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  avatarUrl: true,
});

// Meetings table
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // In minutes
  platformType: text("platform_type").notNull(), // Zoom, Teams, Google Meet, etc.
  participants: integer("participants").notNull(),
  recordingUrl: text("recording_url"),
  transcriptionComplete: boolean("transcription_complete").default(false),
  summaryComplete: boolean("summary_complete").default(false),
  userId: integer("user_id").notNull(),
});

export const insertMeetingSchema = createInsertSchema(meetings).pick({
  title: true,
  date: true,
  duration: true,
  platformType: true,
  participants: true,
  recordingUrl: true,
  transcriptionComplete: true,
  summaryComplete: true,
  userId: true,
});

// Transcripts table
export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  content: json("content").notNull(), // Array of transcript segments with speaker, text, and timestamp
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTranscriptSchema = createInsertSchema(transcripts).pick({
  meetingId: true,
  content: true,
});

// Summaries table
export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSummarySchema = createInsertSchema(summaries).pick({
  meetingId: true,
  content: true,
});

// ActionItems table
export const actionItems = pgTable("action_items", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  description: text("description").notNull(),
  assignee: text("assignee").notNull(),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActionItemSchema = createInsertSchema(actionItems).pick({
  meetingId: true,
  description: true,
  assignee: true,
  dueDate: true,
  completed: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;

export type Transcript = typeof transcripts.$inferSelect;
export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;

export type Summary = typeof summaries.$inferSelect;
export type InsertSummary = z.infer<typeof insertSummarySchema>;

export type ActionItem = typeof actionItems.$inferSelect;
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;

// Additional helper types
export interface TranscriptSegment {
  timestamp: string; // Format: 00:00:00
  speaker: string;
  text: string;
}

export type TranscriptContent = TranscriptSegment[];
