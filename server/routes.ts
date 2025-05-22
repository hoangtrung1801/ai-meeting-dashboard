import { MongoEntityManager } from "@mikro-orm/mongodb";
import { Meeting, MeetingStatus, User } from "@shared/schema";
import type { Express, Request, Response } from "express";
import { createServer } from "http";
import { z } from "zod";
import { getStorage } from "./storage";

// Validation schemas
const createUserSchema = z.object({
    username: z.string(),
    password: z.string(),
    fullName: z.string(),
    email: z.string().email(),
    avatarUrl: z.string().optional(),
});

const createMeetingSchema = z.object({
    botId: z.string(),
    user: z.instanceof(User),
    status: z.nativeEnum(MeetingStatus),
    meetingId: z.string(),
    isRecording: z.boolean(),
    transcription: z.string(),
    summarization: z.string(),
    outputUrl: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

const createActionItemSchema = z.object({
    meeting: z.instanceof(Meeting),
    description: z.string(),
    assignee: z.string(),
    dueDate: z.date().optional(),
    completed: z.boolean(),
    createdAt: z.date(),
});

export async function registerRoutes(app: Express) {
    const em = app.get("em") as MongoEntityManager;
    const storage = getStorage(em);

    // API routes
    const apiRouter = app.route("/api");

    // Current user info (mock for now)
    app.get("/api/me", async (req: Request, res: Response) => {
        try {
            const user = await storage.getUser("1");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({
                message: "Failed to fetch user",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });

    // Dashboard stats
    app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
        try {
            const userId = "1";
            const [meetings, pendingActionItems] = await Promise.all([
                storage.getMeetingsByUserId(userId),
                storage.getPendingActionItems(userId),
            ]);

            const stats = {
                totalMeetings: meetings.length,
                meetingMinutes: 0,
                actionItems: pendingActionItems.length,
                completedActionItems: pendingActionItems.filter(
                    (item) => item.completed
                ).length,
                storageUsed: "1.2 GB",
            };

            res.json(stats);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            res.status(500).json({
                message: "Failed to fetch dashboard stats",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });

    // Get recent meetings
    app.get("/api/meetings/recent", async (req: Request, res: Response) => {
        try {
            const userId = "1";
            const limit = parseInt(req.query.limit as string) || 6;
            const meetings = await storage.getRecentMeetings(userId, limit);
            res.json(meetings);
        } catch (error) {
            console.error("Error fetching recent meetings:", error);
            res.status(500).json({
                message: "Failed to fetch recent meetings",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });

    // Get all meetings
    app.get("/api/meetings", async (req: Request, res: Response) => {
        try {
            // const meetings = await storage.fetchAndSyncBotMeetings();
            const meetings = await storage.getRecentMeetings("", 10);
            console.log("meetings", meetings);
            res.json(meetings);
        } catch (error) {
            console.error("Error syncing bot meetings:", error);
            res.status(500).json({
                message: "Failed to sync bot meetings",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });

    // Get a specific meeting
    app.get("/api/meetings/:id", async (req: Request, res: Response) => {
        try {
            const meeting = await storage.getMeeting(req.params.id);
            if (!meeting) {
                return res.status(404).json({ message: "Meeting not found" });
            }
            res.json(meeting);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch meeting" });
        }
    });

    // Create a new meeting
    app.post("/api/meetings", async (req: Request, res: Response) => {
        try {
            const validationResult = createMeetingSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    message: "Invalid meeting data",
                    errors: validationResult.error,
                });
            }

            const meeting = await storage.createMeeting(validationResult.data);
            res.status(201).json(meeting);
        } catch (error) {
            res.status(500).json({ message: "Failed to create meeting" });
        }
    });

    // Update a meeting
    app.patch("/api/meetings/:id", async (req: Request, res: Response) => {
        try {
            const existingMeeting = await storage.getMeeting(req.params.id);
            if (!existingMeeting) {
                return res.status(404).json({ message: "Meeting not found" });
            }

            const validationResult = createMeetingSchema
                .partial()
                .safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    message: "Invalid meeting data",
                    errors: validationResult.error,
                });
            }

            const updatedMeeting = await storage.updateMeeting(
                req.params.id,
                validationResult.data
            );
            res.json(updatedMeeting);
        } catch (error) {
            res.status(500).json({ message: "Failed to update meeting" });
        }
    });

    // Delete a meeting
    app.delete("/api/meetings/:id", async (req: Request, res: Response) => {
        try {
            const success = await storage.deleteMeeting(req.params.id);
            if (!success) {
                return res.status(404).json({ message: "Meeting not found" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Failed to delete meeting" });
        }
    });

    // Get transcript for a meeting
    app.get(
        "/api/meetings/:id/transcript",
        async (req: Request, res: Response) => {
            try {
                const transcript = await storage.getTranscript(req.params.id);
                if (!transcript) {
                    return res
                        .status(404)
                        .json({ message: "Transcript not found" });
                }
                res.json(transcript);
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch transcript" });
            }
        }
    );

    // Get summary for a meeting
    app.get(
        "/api/meetings/:id/summary",
        async (req: Request, res: Response) => {
            try {
                const summary = await storage.getSummary(req.params.id);
                if (!summary) {
                    return res
                        .status(404)
                        .json({ message: "Summary not found" });
                }
                res.json(summary);
            } catch (error) {
                res.status(500).json({ message: "Failed to fetch summary" });
            }
        }
    );

    // Get action items for a meeting
    app.get(
        "/api/meetings/:id/action-items",
        async (req: Request, res: Response) => {
            try {
                const actionItems = await storage.getActionItems(req.params.id);
                res.json(actionItems);
            } catch (error) {
                res.status(500).json({
                    message: "Failed to fetch action items",
                });
            }
        }
    );

    // Get pending action items
    app.get(
        "/api/action-items/pending",
        async (req: Request, res: Response) => {
            try {
                const userId = "1"; // Using hardcoded user for demo
                const actionItems = await storage.getPendingActionItems(userId);
                res.json(actionItems);
            } catch (error) {
                res.status(500).json({
                    message: "Failed to fetch pending action items",
                });
            }
        }
    );

    // Create a new action item
    app.post("/api/action-items", async (req: Request, res: Response) => {
        try {
            const validationResult = createActionItemSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    message: "Invalid action item data",
                    errors: validationResult.error,
                });
            }

            const actionItem = await storage.createActionItem(
                validationResult.data
            );
            res.status(201).json(actionItem);
        } catch (error) {
            res.status(500).json({ message: "Failed to create action item" });
        }
    });

    // Update an action item
    app.patch("/api/action-items/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = createActionItemSchema
                .partial()
                .safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    message: "Invalid action item data",
                    errors: validationResult.error,
                });
            }

            const updatedActionItem = await storage.updateActionItem(
                req.params.id,
                validationResult.data
            );
            if (!updatedActionItem) {
                return res
                    .status(404)
                    .json({ message: "Action item not found" });
            }

            res.json(updatedActionItem);
        } catch (error) {
            res.status(500).json({ message: "Failed to update action item" });
        }
    });

    // Delete an action item
    app.delete("/api/action-items/:id", async (req: Request, res: Response) => {
        try {
            const success = await storage.deleteActionItem(req.params.id);
            if (!success) {
                return res
                    .status(404)
                    .json({ message: "Action item not found" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Failed to delete action item" });
        }
    });

    // Search meetings
    app.get("/api/search/meetings", async (req: Request, res: Response) => {
        try {
            const userId = "1"; // Using hardcoded user for demo
            const query = (req.query.q as string) || "";

            if (!query) {
                return res
                    .status(400)
                    .json({ message: "Search query is required" });
            }

            const meetings = await storage.searchMeetings(userId, query);
            res.json(meetings);
        } catch (error) {
            res.status(500).json({ message: "Search failed" });
        }
    });

    const httpServer = createServer(app);
    return httpServer;
}
