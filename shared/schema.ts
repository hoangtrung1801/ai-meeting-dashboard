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

// Meeting status enum
export enum MeetingStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
}

// Meeting entity
@Entity({ tableName: "Bot" })
export class Meeting {
    @PrimaryKey({ type: "ObjectId" })
    _id!: ObjectId;

    @Property({ type: "string" })
    id!: string;

    @Property({ type: "string" })
    botId!: string;

    @ManyToOne(() => User)
    user!: User;

    @Enum(() => MeetingStatus)
    status: MeetingStatus = MeetingStatus.PENDING;

    @Property({ type: "string" })
    meetingId!: string;

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
    status: MeetingStatus;
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
    "_id" | "transcripts" | "summaries" | "actionItems"
>;
export type CreateTranscriptDto = Omit<Transcript, "_id">;
export type CreateSummaryDto = Omit<Summary, "_id">;
export type CreateActionItemDto = Omit<ActionItem, "_id">;
