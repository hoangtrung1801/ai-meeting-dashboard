import { 
  users, User, InsertUser, 
  meetings, Meeting, InsertMeeting,
  transcripts, Transcript, InsertTranscript,
  summaries, Summary, InsertSummary,
  actionItems, ActionItem, InsertActionItem,
  TranscriptContent
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Meeting operations
  getMeeting(id: number): Promise<Meeting | undefined>;
  getMeetingsByUserId(userId: number): Promise<Meeting[]>;
  getRecentMeetings(userId: number, limit: number): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<boolean>;
  
  // Transcript operations
  getTranscript(meetingId: number): Promise<Transcript | undefined>;
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;
  
  // Summary operations
  getSummary(meetingId: number): Promise<Summary | undefined>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  
  // Action item operations
  getActionItems(meetingId: number): Promise<ActionItem[]>;
  getPendingActionItems(userId: number): Promise<ActionItem[]>;
  createActionItem(actionItem: InsertActionItem): Promise<ActionItem>;
  updateActionItem(id: number, actionItem: Partial<InsertActionItem>): Promise<ActionItem | undefined>;
  deleteActionItem(id: number): Promise<boolean>;

  // Search operations
  searchMeetings(userId: number, query: string): Promise<Meeting[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meetings: Map<number, Meeting>;
  private transcripts: Map<number, Transcript>;
  private summaries: Map<number, Summary>;
  private actionItems: Map<number, ActionItem>;
  private userId: number;
  private meetingId: number;
  private transcriptId: number;
  private summaryId: number;
  private actionItemId: number;

  constructor() {
    this.users = new Map();
    this.meetings = new Map();
    this.transcripts = new Map();
    this.summaries = new Map();
    this.actionItems = new Map();
    
    this.userId = 1;
    this.meetingId = 1;
    this.transcriptId = 1;
    this.summaryId = 1;
    this.actionItemId = 1;

    // Setup initial data
    this.setupMockData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Meeting operations
  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getMeetingsByUserId(userId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(
      (meeting) => meeting.userId === userId
    );
  }

  async getRecentMeetings(userId: number, limit: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values())
      .filter((meeting) => meeting.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.meetingId++;
    const meeting: Meeting = { ...insertMeeting, id };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: number, meetingData: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;

    const updatedMeeting = { ...meeting, ...meetingData };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    return this.meetings.delete(id);
  }

  // Transcript operations
  async getTranscript(meetingId: number): Promise<Transcript | undefined> {
    return Array.from(this.transcripts.values()).find(
      (transcript) => transcript.meetingId === meetingId
    );
  }

  async createTranscript(insertTranscript: InsertTranscript): Promise<Transcript> {
    const id = this.transcriptId++;
    const transcript: Transcript = {
      ...insertTranscript,
      id,
      createdAt: new Date(),
    };
    this.transcripts.set(id, transcript);
    return transcript;
  }

  // Summary operations
  async getSummary(meetingId: number): Promise<Summary | undefined> {
    return Array.from(this.summaries.values()).find(
      (summary) => summary.meetingId === meetingId
    );
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const id = this.summaryId++;
    const summary: Summary = {
      ...insertSummary,
      id,
      createdAt: new Date(),
    };
    this.summaries.set(id, summary);
    return summary;
  }

  // Action item operations
  async getActionItems(meetingId: number): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values()).filter(
      (actionItem) => actionItem.meetingId === meetingId
    );
  }

  async getPendingActionItems(userId: number): Promise<ActionItem[]> {
    // Get meetings for this user
    const userMeetingIds = Array.from(this.meetings.values())
      .filter(meeting => meeting.userId === userId)
      .map(meeting => meeting.id);
    
    // Find action items for these meetings that are not completed
    return Array.from(this.actionItems.values()).filter(
      (actionItem) => 
        userMeetingIds.includes(actionItem.meetingId) && 
        !actionItem.completed
    );
  }

  async createActionItem(insertActionItem: InsertActionItem): Promise<ActionItem> {
    const id = this.actionItemId++;
    const actionItem: ActionItem = {
      ...insertActionItem,
      id,
      createdAt: new Date(),
    };
    this.actionItems.set(id, actionItem);
    return actionItem;
  }

  async updateActionItem(id: number, actionItemData: Partial<InsertActionItem>): Promise<ActionItem | undefined> {
    const actionItem = this.actionItems.get(id);
    if (!actionItem) return undefined;

    const updatedActionItem = { ...actionItem, ...actionItemData };
    this.actionItems.set(id, updatedActionItem);
    return updatedActionItem;
  }

  async deleteActionItem(id: number): Promise<boolean> {
    return this.actionItems.delete(id);
  }

  // Search operations
  async searchMeetings(userId: number, query: string): Promise<Meeting[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.meetings.values())
      .filter((meeting) => 
        meeting.userId === userId && 
        meeting.title.toLowerCase().includes(lowercaseQuery)
      );
  }

  // Setup initial data for development
  private setupMockData() {
    // Demo user
    const user: User = {
      id: this.userId++,
      username: 'james',
      password: 'password',
      fullName: 'James Wilson',
      email: 'james@company.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100'
    };
    this.users.set(user.id, user);

    // Demo meetings
    const meeting1: Meeting = {
      id: this.meetingId++,
      title: 'Product Strategy Meeting',
      date: new Date(),
      duration: 32,
      platformType: 'Zoom',
      participants: 8,
      recordingUrl: 'https://example.com/recording1',
      transcriptionComplete: true,
      summaryComplete: true,
      userId: user.id
    };
    this.meetings.set(meeting1.id, meeting1);

    const meeting2: Meeting = {
      id: this.meetingId++,
      title: 'Weekly Team Standup',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      duration: 18,
      platformType: 'Microsoft Teams',
      participants: 12,
      recordingUrl: 'https://example.com/recording2',
      transcriptionComplete: true,
      summaryComplete: true,
      userId: user.id
    };
    this.meetings.set(meeting2.id, meeting2);

    const meeting3: Meeting = {
      id: this.meetingId++,
      title: 'Client Presentation',
      date: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      duration: 45,
      platformType: 'Google Meet',
      participants: 5,
      recordingUrl: 'https://example.com/recording3',
      transcriptionComplete: true,
      summaryComplete: true,
      userId: user.id
    };
    this.meetings.set(meeting3.id, meeting3);

    // Demo transcripts
    const transcript1Content: TranscriptContent = [
      {
        timestamp: '00:00:12',
        speaker: 'Alex Morgan',
        text: 'Good morning everyone. Let\'s get started with our product strategy meeting for Q3. We have a lot to cover today, so I want to make sure we stay focused.'
      },
      {
        timestamp: '00:00:35',
        speaker: 'Taylor Kim',
        text: 'Thanks, Alex. I\'ve prepared the market analysis report as we discussed last week. The data shows some interesting trends in user behavior that I think should inform our roadmap decisions.'
      },
      {
        timestamp: '00:00:58',
        speaker: 'Alex Morgan',
        text: 'Great, Taylor. Before we dive into that, let\'s quickly go over our current product performance. Jamie, can you give us a quick update on the metrics from the last release?'
      },
      {
        timestamp: '00:01:15',
        speaker: 'Jamie Smith',
        text: 'Absolutely. We\'ve seen a 15% increase in daily active users since the last release. The new features we launched are showing strong adoption rates, particularly the collaborative editing tool, which has a 42% usage rate among our enterprise customers.'
      },
      {
        timestamp: '00:01:42',
        speaker: 'Alex Morgan',
        text: 'That\'s encouraging to hear. One thing I want to make sure we address today is the feedback from our enterprise customers about the need for more advanced security features. We should add this to our roadmap for Q3 as a high priority item.'
      },
      {
        timestamp: '00:02:10',
        speaker: 'Taylor Kim',
        text: 'I agree. The market analysis shows that security concerns are top of mind for our target demographic. Additionally, we\'re seeing increased demand for better integration with third-party tools. This is something our competitors are starting to offer.'
      },
      {
        timestamp: '00:02:38',
        speaker: 'Jamie Smith',
        text: 'That\'s right. If we look at our customer support tickets, about 25% of feature requests are related to integrations with other productivity tools. I think we should prioritize building an API that third-party developers can use to integrate with our platform.'
      }
    ];

    const transcript1: Transcript = {
      id: this.transcriptId++,
      meetingId: meeting1.id,
      content: transcript1Content,
      createdAt: new Date()
    };
    this.transcripts.set(transcript1.id, transcript1);

    // Demo summaries
    const summary1: Summary = {
      id: this.summaryId++,
      meetingId: meeting1.id,
      content: 'The product strategy meeting for Q3 covered recent performance metrics, including a 15% increase in daily active users and 42% adoption of the collaborative editing tool among enterprise customers. Key priorities identified for the roadmap include enhanced security features for enterprise customers and developing an API for third-party integrations. Market analysis confirms these priorities align with customer demands and competitive landscape.',
      createdAt: new Date()
    };
    this.summaries.set(summary1.id, summary1);

    // Demo action items
    const actionItem1: ActionItem = {
      id: this.actionItemId++,
      meetingId: meeting1.id,
      description: 'Update product roadmap with new features discussed',
      assignee: 'Alex Morgan',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      completed: false,
      createdAt: new Date()
    };
    this.actionItems.set(actionItem1.id, actionItem1);

    const actionItem2: ActionItem = {
      id: this.actionItemId++,
      meetingId: meeting3.id,
      description: 'Schedule follow-up meeting with client to discuss feedback',
      assignee: 'Sarah Chen',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
      completed: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    };
    this.actionItems.set(actionItem2.id, actionItem2);

    const actionItem3: ActionItem = {
      id: this.actionItemId++,
      meetingId: meeting2.id,
      description: 'Review and approve UI design changes for mobile app',
      assignee: 'James Wilson',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      completed: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    };
    this.actionItems.set(actionItem3.id, actionItem3);
  }
}

export const storage = new MemStorage();
