import { MongoEntityManager, ObjectId } from "@mikro-orm/mongodb";
import {
    ActionItem,
    BotMeetingData,
    CreateActionItemDto,
    CreateMeetingDto,
    CreateSummaryDto,
    CreateTranscriptDto,
    CreateUserDto,
    Meeting,
    Summary,
    Transcript,
    User,
} from "@shared/schema";

export interface IStorage {
    // User operations
    getUser(id: string): Promise<User | null>;
    getUserByEmail(username: string): Promise<User | null>;
    createUser(user: CreateUserDto): Promise<User>;

    // Meeting operations
    getMeeting(id: string): Promise<Meeting | null>;
    getMeetingByBotId(botId: string): Promise<Meeting | null>;
    getMeetingsByUserId(userId: string): Promise<Meeting[]>;
    getRecentMeetings(userId: string, limit: number): Promise<Meeting[]>;
    createMeeting(meeting: CreateMeetingDto): Promise<Meeting>;
    updateMeeting(
        id: string,
        meeting: Partial<CreateMeetingDto>
    ): Promise<Meeting | null>;
    updateMeetingByBotId(
        botId: string,
        meeting: Partial<CreateMeetingDto>
    ): Promise<Meeting | null>;
    deleteMeeting(id: string): Promise<boolean>;

    // Bot integration
    syncBotMeeting(botMeeting: BotMeetingData): Promise<Meeting>;
    fetchAndSyncBotMeetings(): Promise<Meeting[]>;

    // Transcript operations
    getTranscript(meetingId: string): Promise<Transcript | null>;
    createTranscript(transcript: CreateTranscriptDto): Promise<Transcript>;

    // Summary operations
    getSummary(meetingId: string): Promise<Summary | null>;
    createSummary(summary: CreateSummaryDto): Promise<Summary>;

    // Action item operations
    getActionItems(meetingId: string): Promise<ActionItem[]>;
    getPendingActionItems(userId: string): Promise<ActionItem[]>;
    createActionItem(actionItem: CreateActionItemDto): Promise<ActionItem>;
    updateActionItem(
        id: string,
        actionItem: Partial<CreateActionItemDto>
    ): Promise<ActionItem | null>;
    deleteActionItem(id: string): Promise<boolean>;

    // Search operations
    searchMeetings(userId: string, query: string): Promise<Meeting[]>;
}

export class MongoStorage implements IStorage {
    constructor(private em: MongoEntityManager) {}

    // Helper method to get the current EntityManager
    private getEm(): MongoEntityManager {
        return this.em;
    }

    // User operations
    async getUser(id: string): Promise<User | null> {
        try {
            return await this.getEm().findOne(User, { _id: new ObjectId(id) });
        } catch (error) {
            console.error("Error in getUser:", error);
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.getEm().findOne(User, { email });
    }

    async createUser(userData: CreateUserDto): Promise<User> {
        const user = this.getEm().create(User, userData);
        await this.getEm().persistAndFlush(user);
        return user;
    }

    // Meeting operations
    async getMeeting(id: string): Promise<Meeting | null> {
        return this.getEm().findOne(Meeting, { _id: new ObjectId(id) });
    }

    async getMeetingByBotId(botId: string): Promise<Meeting | null> {
        return this.getEm().findOne(Meeting, { botId });
    }

    async getMeetingsByUserId(userId: string): Promise<Meeting[]> {
        return this.getEm().find(
            Meeting,
            { userId: new ObjectId(userId) },
            {
                orderBy: { createdAt: "DESC" },
            }
        );
    }

    async getRecentMeetings(userId: string, limit: number): Promise<Meeting[]> {
        console.log(
            "meetings",
            (await this.getEm().findAll(Meeting)).map((item) => item._id)
        );
        console.log(
            "Users",
            (await this.getEm().findAll(User)).map((item) => item._id)
        );
        return this.getEm().find(
            Meeting,
            // { user: userId },
            {},
            {
                orderBy: { createdAt: "DESC" },
                limit,
            }
        );
    }

    async createMeeting(meetingData: CreateMeetingDto): Promise<Meeting> {
        const meeting = this.getEm().create(Meeting, meetingData);
        await this.getEm().persistAndFlush(meeting);
        return meeting;
    }

    async updateMeeting(
        id: string,
        meetingData: Partial<CreateMeetingDto>
    ): Promise<Meeting | null> {
        const meeting = await this.getMeeting(id);
        if (!meeting) return null;

        this.getEm().assign(meeting, meetingData);
        await this.getEm().flush();
        return meeting;
    }

    async updateMeetingByBotId(
        botId: string,
        meetingData: Partial<CreateMeetingDto>
    ): Promise<Meeting | null> {
        const meeting = await this.getMeetingByBotId(botId);
        if (!meeting) return null;

        this.getEm().assign(meeting, meetingData);
        await this.getEm().flush();
        return meeting;
    }

    async deleteMeeting(id: string): Promise<boolean> {
        const meeting = await this.getMeeting(id);
        if (!meeting) return false;

        await this.getEm().removeAndFlush(meeting);
        return true;
    }

    // Bot integration
    async syncBotMeeting(botMeeting: BotMeetingData): Promise<Meeting> {
        const existingMeeting = await this.getMeetingByBotId(botMeeting._id);

        if (existingMeeting) {
            return this.updateMeeting(existingMeeting._id.toString(), {
                status: botMeeting.status,
                isRecording: botMeeting.isRecording,
                transcription: botMeeting.transcription,
                summarization: botMeeting.summarization,
                outputUrl: botMeeting.outputUrl,
            }) as Promise<Meeting>;
        }

        const user = await this.getUser(botMeeting.userId);
        if (!user) {
            throw new Error(`User not found: ${botMeeting.userId}`);
        }

        return this.createMeeting({
            botId: botMeeting._id,
            user,
            status: botMeeting.status,
            meetingId: botMeeting.meetingId,
            isRecording: botMeeting.isRecording,
            transcription: botMeeting.transcription,
            summarization: botMeeting.summarization,
            outputUrl: botMeeting.outputUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    async fetchAndSyncBotMeetings(): Promise<Meeting[]> {
        try {
            const response = await fetch(
                "http://localhost:3000/api/v1/bots/all"
            );
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch bot meetings: ${response.statusText}`
                );
            }

            const data = await response.json();
            const botMeetings: BotMeetingData[] = data.bots;

            const syncedMeetings: Meeting[] = [];
            for (const botMeeting of botMeetings) {
                try {
                    const syncedMeeting = await this.syncBotMeeting(botMeeting);
                    syncedMeetings.push(syncedMeeting);
                } catch (error) {
                    console.error(
                        `Failed to sync bot meeting ${botMeeting._id}:`,
                        error
                    );
                }
            }

            return syncedMeetings;
        } catch (error) {
            console.error("Error fetching bot meetings:", error);
            throw error;
        }
    }

    // Transcript operations
    async getTranscript(meetingId: string): Promise<Transcript | null> {
        return this.getEm().findOne(Transcript, { meeting: meetingId });
    }

    async createTranscript(
        transcriptData: CreateTranscriptDto
    ): Promise<Transcript> {
        const transcript = this.getEm().create(Transcript, transcriptData);
        await this.getEm().persistAndFlush(transcript);
        return transcript;
    }

    // Summary operations
    async getSummary(meetingId: string): Promise<Summary | null> {
        return this.getEm().findOne(Summary, { meeting: meetingId });
    }

    async createSummary(summaryData: CreateSummaryDto): Promise<Summary> {
        const summary = this.getEm().create(Summary, summaryData);
        await this.getEm().persistAndFlush(summary);
        return summary;
    }

    // Action item operations
    async getActionItems(meetingId: string): Promise<ActionItem[]> {
        return this.getEm().find(ActionItem, { meeting: meetingId });
    }

    async getPendingActionItems(userId: string): Promise<ActionItem[]> {
        const meetings = await this.getMeetingsByUserId(userId);
        const meetingIds = meetings.map((m) => m._id.toString());

        return this.getEm().find(ActionItem, {
            meeting: { $in: meetingIds },
            completed: false,
        });
    }

    async createActionItem(
        actionItemData: CreateActionItemDto
    ): Promise<ActionItem> {
        const actionItem = this.getEm().create(ActionItem, actionItemData);
        await this.getEm().persistAndFlush(actionItem);
        return actionItem;
    }

    async updateActionItem(
        id: string,
        actionItemData: Partial<CreateActionItemDto>
    ): Promise<ActionItem | null> {
        const actionItem = await this.getEm().findOne(ActionItem, {
            _id: new ObjectId(id),
        });
        if (!actionItem) return null;
        this.getEm().assign(actionItem, actionItemData);
        await this.getEm().flush();
        return actionItem;
    }

    async deleteActionItem(id: string): Promise<boolean> {
        const actionItem = await this.getEm().findOne(ActionItem, {
            _id: new ObjectId(id),
        });
        if (!actionItem) return false;
        await this.getEm().removeAndFlush(actionItem);
        return true;
    }

    // Search operations
    async searchMeetings(userId: string, query: string): Promise<Meeting[]> {
        return this.getEm().find(Meeting, {
            user: userId,
            meetingId: new RegExp(query, "i"),
        });
    }
}

// Remove the singleton pattern and export function
export function getStorage(em: MongoEntityManager): MongoStorage {
    return new MongoStorage(em);
}
