import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertMeetingSchema, insertActionItemSchema, insertTranscriptSchema, insertSummarySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route("/api");
  
  // Current user info (mock for now)
  app.get("/api/me", (req: Request, res: Response) => {
    storage.getUser(1).then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't return password in the response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    });
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Using hardcoded user for demo
      const meetings = await storage.getMeetingsByUserId(userId);
      const pendingActionItems = await storage.getPendingActionItems(userId);
      
      // Calculate total meeting minutes
      const totalMeetingMinutes = meetings.reduce((sum, meeting) => sum + meeting.duration, 0);
      
      // Count completed action items
      const completedActionItems = await storage.getPendingActionItems(userId);
      const completedCount = completedActionItems.filter(item => item.completed).length;
      
      const stats = {
        totalMeetings: meetings.length,
        meetingMinutes: totalMeetingMinutes,
        actionItems: pendingActionItems.length,
        completedActionItems: completedCount,
        storageUsed: '1.2 GB', // Mocked value for demo
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get recent meetings
  app.get("/api/meetings/recent", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Using hardcoded user for demo
      const limit = parseInt(req.query.limit as string) || 6;
      const meetings = await storage.getRecentMeetings(userId, limit);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent meetings" });
    }
  });

  // Get all meetings
  app.get("/api/meetings", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Using hardcoded user for demo
      const meetings = await storage.getMeetingsByUserId(userId);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get a specific meeting
  app.get("/api/meetings/:id", async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const meeting = await storage.getMeeting(meetingId);
      
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
      // Validate request body
      const validationResult = insertMeetingSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid meeting data", errors: validationResult.error });
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
      const meetingId = parseInt(req.params.id);
      
      // Get current meeting to ensure it exists
      const existingMeeting = await storage.getMeeting(meetingId);
      if (!existingMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      // Validate request body (partial schema)
      const validationResult = insertMeetingSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid meeting data", errors: validationResult.error });
      }
      
      const updatedMeeting = await storage.updateMeeting(meetingId, validationResult.data);
      res.json(updatedMeeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  // Delete a meeting
  app.delete("/api/meetings/:id", async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const success = await storage.deleteMeeting(meetingId);
      
      if (!success) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // Get transcript for a meeting
  app.get("/api/meetings/:id/transcript", async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const transcript = await storage.getTranscript(meetingId);
      
      if (!transcript) {
        return res.status(404).json({ message: "Transcript not found" });
      }
      
      res.json(transcript);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transcript" });
    }
  });

  // Get summary for a meeting
  app.get("/api/meetings/:id/summary", async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const summary = await storage.getSummary(meetingId);
      
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }
      
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  // Get action items for a meeting
  app.get("/api/meetings/:id/action-items", async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const actionItems = await storage.getActionItems(meetingId);
      res.json(actionItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch action items" });
    }
  });

  // Get pending action items
  app.get("/api/action-items/pending", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Using hardcoded user for demo
      const actionItems = await storage.getPendingActionItems(userId);
      res.json(actionItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending action items" });
    }
  });

  // Create a new action item
  app.post("/api/action-items", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertActionItemSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid action item data", errors: validationResult.error });
      }
      
      const actionItem = await storage.createActionItem(validationResult.data);
      res.status(201).json(actionItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to create action item" });
    }
  });

  // Update an action item
  app.patch("/api/action-items/:id", async (req: Request, res: Response) => {
    try {
      const actionItemId = parseInt(req.params.id);
      
      // Validate request body (partial schema)
      const validationResult = insertActionItemSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid action item data", errors: validationResult.error });
      }
      
      const updatedActionItem = await storage.updateActionItem(actionItemId, validationResult.data);
      
      if (!updatedActionItem) {
        return res.status(404).json({ message: "Action item not found" });
      }
      
      res.json(updatedActionItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update action item" });
    }
  });

  // Delete an action item
  app.delete("/api/action-items/:id", async (req: Request, res: Response) => {
    try {
      const actionItemId = parseInt(req.params.id);
      const success = await storage.deleteActionItem(actionItemId);
      
      if (!success) {
        return res.status(404).json({ message: "Action item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete action item" });
    }
  });

  // Search meetings
  app.get("/api/search/meetings", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Using hardcoded user for demo
      const query = req.query.q as string || "";
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
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
