import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  Collection,
  OneToMany,
  ManyToOne,
} from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

// User entity
@Entity({ tableName: "User" })
export class User {
  @PrimaryKey({ type: "ObjectId" })
  _id!: ObjectId;

  @Property({ type: "string" })
  username!: string;

  @Property({ type: "string" })
  password!: string;

  @Property({ type: "string" })
  fullName!: string;

  @Property({ type: "string" })
  email!: string;

  @Property({ type: "string", nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Meeting, (meeting) => meeting.user)
  meetings = new Collection<Meeting>(this);
}

// Meeting type enum
export enum MeetingType {
  SCHEDULED = "scheduled",
  BOT = "bot",
}

// Meeting status enum
export enum MeetingStatus {
  PENDING = "pending",
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

// Meeting entity
@Entity({ tableName: "Bot" })
export class Meeting {
  @PrimaryKey({ type: "ObjectId" })
  _id!: ObjectId;

  @Property({ type: "string" })
  id!: string;

  @Property({ type: "string", nullable: true })
  botId?: string;

  @Property({ type: "ObjectId" })
  userId!: ObjectId;

  @ManyToOne(() => User)
  user!: User;

  @Enum(() => MeetingType)
  type: MeetingType = MeetingType.SCHEDULED;

  @Enum(() => MeetingStatus)
  status: MeetingStatus = MeetingStatus.PENDING;

  @Property({ type: "string" })
  title!: string;

  @Property({ type: "string" })
  description: string = "";

  @Property({ type: "date" })
  startTime!: Date;

  @Property({ type: "number" })
  duration!: number; // Duration in minutes

  @Property({ type: "array" })
  participants: string[] = []; // Array of participant emails

  @Property({ type: "string", nullable: true })
  meetingId?: string;

  @Property({ type: "string", nullable: true })
  meetingLink?: string;

  @Property({ type: "boolean" })
  isRecording: boolean = false;

  @Property({ type: "string" })
  transcription: string = "";

  @Property({ type: "string" })
  summarization: string = "";

  @Property({ type: "string" })
  outputUrl: string = "";

  @Property({ type: "date" })
  createdAt: Date = new Date();

  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => Transcript, (transcript) => transcript.meeting)
  transcripts = new Collection<Transcript>(this);

  @OneToMany(() => Summary, (summary) => summary.meeting)
  summaries = new Collection<Summary>(this);

  @OneToMany(() => ActionItem, (actionItem) => actionItem.meeting)
  actionItems = new Collection<ActionItem>(this);

  @Property({ type: "array", nullable: true })
  utterances: Utterance[] = []; // Detailed utterances from the meeting with speaker, text, and timing data
}

export interface UtteranceWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker: string;
}

export interface Utterance {
  speaker: string;
  text: string;
  confidence: number;
  start: number;
  end: number;
  words: UtteranceWord[];
}

// Transcript entity
@Entity()
export class Transcript {
  @PrimaryKey({ type: "ObjectId" })
  _id!: ObjectId;

  @ManyToOne(() => Meeting)
  meeting!: Meeting;

  @Property({ type: "array" })
  content!: TranscriptSegment[];

  @Property({ type: "date" })
  createdAt: Date = new Date();
}

// Summary entity
@Entity()
export class Summary {
  @PrimaryKey({ type: "ObjectId" })
  _id!: ObjectId;

  @ManyToOne(() => Meeting)
  meeting!: Meeting;

  @Property({ type: "string" })
  content!: string;

  @Property({ type: "date" })
  createdAt: Date = new Date();
}

// ActionItem entity
@Entity()
export class ActionItem {
  @PrimaryKey({ type: "ObjectId" })
  _id!: ObjectId;

  @ManyToOne(() => Meeting)
  meeting!: Meeting;

  @Property({ type: "string" })
  description!: string;

  @Property({ type: "string" })
  assignee!: string;

  @Property({ type: "date", nullable: true })
  dueDate?: Date;

  @Property({ type: "boolean" })
  completed: boolean = false;

  @Property({ type: "date" })
  createdAt: Date = new Date();
}

// Types
export interface TranscriptSegment {
  timestamp: string; // Format: 00:00:00
  speaker: string;
  text: string;
}

// Bot meeting data interface
export interface BotMeetingData {
  _id: string;
  userId: string;
  type: MeetingType;
  status: MeetingStatus;
  title?: string;
  description?: string;
  startTime?: Date;
  duration?: number;
  participants?: string[];
  meetingId: string;
  isRecording: boolean;
  transcription: string;
  summarization: string;
  createdAt: string;
  updatedAt: string;
  outputUrl: string;
}

// DTO types for creating entities
export type CreateUserDto = Omit<User, "_id" | "meetings">;
export type CreateMeetingDto = Omit<
  Meeting,
  "_id" | "userId" | "transcripts" | "summaries" | "actionItems" | "id"
>;
export type CreateTranscriptDto = Omit<Transcript, "_id">;
export type CreateSummaryDto = Omit<Summary, "_id">;
export type CreateActionItemDto = Omit<ActionItem, "_id">;
