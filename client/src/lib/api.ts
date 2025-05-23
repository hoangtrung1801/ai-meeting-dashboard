import { apiRequest } from "./queryClient";

export interface Meeting {
    id: string;
    title: string;
    description: string;
    startTime: string;
    duration: number;
    participants: string[];
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    type: "SCHEDULED" | "INSTANT";
    meetingLink?: string;
    isRecording: boolean;
    transcription: string;
    summarization: string;
    outputUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface MeetingResponse {
    meetings: Meeting[];
}

export interface MeetingDetailResponse {
    meeting: Meeting;
}

export interface TranscriptSegment {
    timestamp: string;
    speaker: string;
    text: string;
}

export interface Transcript {
    content: TranscriptSegment[];
}

export interface SummaryResponse {
    content: string;
}

export interface ActionItem {
    id: string;
    description: string;
    assignee: string;
    dueDate?: string;
    completed: boolean;
    createdAt: string;
}

export interface ActionItemsResponse {
    items: ActionItem[];
}

// API client functions
export const api = {
    async getMeetingsInRange(start: Date, end: Date): Promise<Meeting[]> {
        // const response = await fetch(
        //     `/api/meetings/range?start=${start.toISOString()}&end=${end.toISOString()}`
        // );
        // if (!response.ok) throw new Error("Failed to fetch meetings");
        // return response.json();
        const res = await apiRequest(
            "GET",
            `/api/meetings/range?start=${start.toISOString()}&end=${end.toISOString()}`
        );
        const data = await res.json();
        return data;
    },

    async getMeeting(id: string): Promise<Meeting> {
        const response = await fetch(`/api/meetings/${id}`);
        if (!response.ok) throw new Error("Failed to fetch meeting");
        const data: MeetingDetailResponse = await response.json();
        return data.meeting;
    },

    async getTranscript(id: string): Promise<Transcript> {
        const response = await fetch(`/api/meetings/${id}/transcript`);
        if (!response.ok) throw new Error("Failed to fetch transcript");
        const data: { content: string } = await response.json();
        try {
            return {
                content: JSON.parse(data.content),
            };
        } catch (e) {
            console.error("Error parsing transcript content:", e);
            return { content: [] };
        }
    },

    async getSummary(id: string): Promise<string> {
        const response = await fetch(`/api/meetings/${id}/summary`);
        if (!response.ok) throw new Error("Failed to fetch summary");
        const data: SummaryResponse = await response.json();
        return data.content;
    },

    async getActionItems(id: string): Promise<ActionItem[]> {
        const response = await fetch(`/api/meetings/${id}/action-items`);
        if (!response.ok) throw new Error("Failed to fetch action items");
        const data: ActionItemsResponse = await response.json();
        return data.items;
    },
};
