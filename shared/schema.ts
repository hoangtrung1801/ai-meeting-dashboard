import {
    pgTable,
    text,
    serial,
    integer,
    boolean,
    timestamp,
    json,
} from "drizzle-orm/pg-core";
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

// Bot meeting data interface
export interface BotMeetingData {
    _id: string;
    userId: string;
    status: "pending" | "completed" | "failed";
    meetingId: string;
    isRecording: boolean;
    transcription: string;
    summarization: string;
    createdAt: string;
    updatedAt: string;
    outputUrl: string;
}

// Meetings table
export const meetings = pgTable("meetings", {
    id: serial("id").primaryKey(),
    botId: text("bot_id").notNull(), // Maps to _id in bot data
    userId: integer("user_id").notNull(),
    status: text("status").notNull().default("pending"),
    meetingId: text("meeting_id").notNull(),
    isRecording: boolean("is_recording").notNull().default(false),
    transcription: text("transcription").notNull().default(""),
    summarization: text("summarization").notNull().default(""),
    outputUrl: text("output_url").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMeetingSchema = createInsertSchema(meetings).pick({
    botId: true,
    userId: true,
    status: true,
    meetingId: true,
    isRecording: true,
    transcription: true,
    summarization: true,
    outputUrl: true,
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
