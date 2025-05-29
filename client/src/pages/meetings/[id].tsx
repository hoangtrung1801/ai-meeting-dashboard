import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Meeting, Utterance } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatDate, formatDuration } from "@/lib/utils";
import { ActionItemCard } from "@/components/dashboard/action-item";
import botApi from "@/lib/api/bot.api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Add new types for API responses
type TranscriptResponse = {
  content: string;
  utterances?: Utterance[];
};

type SummaryResponse = {
  content: string;
};

export default function MeetingDetail() {
  const { id } = useParams();
  const meetingId = id as string;
  const [activeTab, setActiveTab] = useState("transcript");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { toast } = useToast();

  // Helper function to format milliseconds to MM:SS format
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Fetch meeting details
  const { data: meeting, isLoading: isMeetingLoading } = useQuery<Meeting>({
    queryKey: ["/api/meetings", meetingId],
    queryFn: () =>
      fetch(`/api/meetings/${meetingId}`).then((res) => res.json()),
  });

  // Stop recording mutation
  const stopRecordingMutation = useMutation({
    mutationFn: async () => {
      if (!id) {
        throw new Error("Meeting ID is required to stop recording");
      }
      return await botApi.stopRecordingById(id);
    },
    onSuccess: () => {
      // Invalidate meeting data to refresh
      queryClient.invalidateQueries({
        queryKey: ["/api/meetings", meetingId],
      });

      toast({
        title: "Recording stopped",
        description: "The meeting recording has been stopped successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to stop recording",
        description:
          "An error occurred while stopping the recording. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch transcript
  const { data: transcript, isLoading: isTranscriptLoading } =
    useQuery<TranscriptResponse>({
      queryKey: ["/api/meetings", meetingId, "transcript"],
      queryFn: () =>
        fetch(`/api/meetings/${meetingId}/transcript`).then((res) =>
          res.json()
        ),
      enabled: !!meetingId,
    });

  // Fetch summary
  const { data: summary, isLoading: isSummaryLoading } =
    useQuery<SummaryResponse>({
      queryKey: ["/api/meetings", meetingId, "summary"],
      queryFn: () =>
        fetch(`/api/meetings/${meetingId}/summary`).then((res) => res.json()),
      enabled: !!meetingId,
    });

  // Fetch action items
  const { data: actionItems, isLoading: isActionItemsLoading } = useQuery({
    queryKey: ["/api/meetings", meetingId, "action-items"],
    queryFn: () =>
      fetch(`/api/meetings/${meetingId}/action-items`).then((res) =>
        res.json()
      ),
    enabled: !!meetingId,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilter = (speaker: string) => {
    if (activeFilters.includes(speaker)) {
      setActiveFilters(activeFilters.filter((filter) => filter !== speaker));
    } else {
      setActiveFilters([...activeFilters, speaker]);
    }
  };

  // Get unique speakers from transcript
  const getSpeakers = (): string[] => {
    if (meeting?.utterances?.length) {
      return Array.from(
        new Set(meeting.utterances.map((utterance) => utterance.speaker))
      );
    }

    if (!transcript?.content) return [];
    try {
      const content = JSON.parse(transcript.content);
      return Array.from(new Set(content.map((item: any) => item.speaker)));
    } catch (e) {
      console.error("Error parsing transcript content:", e);
      return [];
    }
  };

  // Filter transcript based on search and active speakers
  const getFilteredTranscript = () => {
    // If utterances are available, use them
    if (meeting?.utterances?.length) {
      return meeting.utterances.filter((utterance) => {
        const matchesSearch =
          searchQuery === "" ||
          utterance.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          utterance.speaker.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSpeaker =
          activeFilters.length === 0 ||
          activeFilters.includes(utterance.speaker);

        return matchesSearch && matchesSpeaker;
      });
    }

    // Fallback to content string if utterances aren't available
    if (!transcript?.content) return [];
    try {
      const content = JSON.parse(transcript.content);
      return content.filter((item: any) => {
        const matchesSearch =
          searchQuery === "" ||
          item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.speaker.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSpeaker =
          activeFilters.length === 0 || activeFilters.includes(item.speaker);

        return matchesSearch && matchesSpeaker;
      });
    } catch (e) {
      console.error("Error parsing transcript content:", e);
      return [];
    }
  };

  const filteredContent = getFilteredTranscript();
  const speakers = getSpeakers();

  console.log({ transcript });

  if (isMeetingLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Meeting not found
          </h1>
          <p className="text-gray-500 mb-6">
            The meeting you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/meetings">
            <Button>
              <i className="fas fa-arrow-left mr-2"></i> Back to Meetings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {meeting.title}
              </h1>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <i className="fas fa-calendar mr-2"></i>{" "}
                {formatDate(meeting.startTime || meeting.createdAt)}
                <span className="mx-2">•</span>
                <i className="fas fa-clock mr-2"></i>{" "}
                {formatDuration(meeting.duration)}
                <span className="mx-2">•</span>
                <i className="fas fa-users mr-2"></i>{" "}
                {meeting.participants?.length || 0} participants
                {meeting.isRecording && (
                  <>
                    <span className="mx-2">•</span>
                    <i className="fas fa-circle text-red-500 mr-2"></i>
                    <span className="text-red-600 font-medium">Recording</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              {meeting.isRecording && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => stopRecordingMutation.mutate()}
                  disabled={stopRecordingMutation.isPending}
                >
                  <i className="fas fa-stop mr-2"></i>
                  {stopRecordingMutation.isPending
                    ? "Stopping..."
                    : "Stop Recording"}
                </Button>
              )}
              <Button variant="outline" size="sm">
                <i className="fas fa-share-alt mr-2"></i> Share
              </Button>
              <Button variant="outline" size="sm">
                <i className="fas fa-download mr-2"></i> Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <Tabs
          defaultValue="transcript"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="actionItems">Action Items</TabsTrigger>
            <TabsTrigger value="recording">Recording</TabsTrigger>
          </TabsList>

          {/* Transcript Content */}
          <TabsContent value="transcript" className="mt-4">
            {isTranscriptLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading transcript...</p>
              </div>
            ) : transcript ? (
              <div className="bg-white p-6 rounded-lg shadow">
                {/* Search bar */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <Input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Search transcript"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>

                {/* Speaker filter */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {speakers.map((speaker: string) => (
                    <span
                      key={speaker}
                      className={`inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium ${
                        activeFilters.includes(speaker)
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {speaker}
                      <button
                        type="button"
                        className={`flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center ${
                          activeFilters.includes(speaker)
                            ? "text-white hover:bg-blue-600"
                            : "text-gray-400 hover:bg-gray-200"
                        } focus:outline-none`}
                        onClick={() => toggleFilter(speaker)}
                      >
                        <span className="sr-only">
                          {activeFilters.includes(speaker)
                            ? "Remove filter"
                            : "Add filter"}
                        </span>
                        <i
                          className={`fas fa-${
                            activeFilters.includes(speaker) ? "times" : "plus"
                          } text-xs`}
                        ></i>
                      </button>
                    </span>
                  ))}
                </div>

                {/* Transcript */}
                <div className="space-y-4 font-mono">
                  {meeting?.utterances && meeting.utterances.length > 0 ? (
                    filteredContent.map(
                      (utterance: Utterance, index: number) => (
                        <div
                          key={index}
                          className="pb-4 border-b border-gray-100"
                        >
                          <div className="flex items-center">
                            <div className="w-20 text-xs text-gray-500">
                              {formatTime(utterance.start)} -{" "}
                              {formatTime(utterance.end)}
                            </div>
                            <div className="font-medium text-sm text-gray-700 mr-2">
                              {utterance.speaker}:
                            </div>
                          </div>
                          <div className="pl-20 pt-2 flex flex-wrap gap-1 text-gray-500">
                            {utterance.text}
                          </div>
                        </div>
                      )
                    )
                  ) : transcript?.content ? (
                    transcript.content
                      .split("\n")
                      .map((line: string, index: number) => (
                        <div
                          key={index}
                          className="pb-2 border-b border-gray-100"
                        >
                          <div className="text-sm text-gray-600 leading-relaxed">
                            {line}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No transcript content available
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500">
                  No transcript available for this meeting.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Summary Content */}
          <TabsContent value="summary" className="mt-4">
            {isSummaryLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading summary...</p>
              </div>
            ) : summary?.content ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Meeting Summary
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {summary.content}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500">
                  No summary available for this meeting.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Action Items Content */}
          <TabsContent value="actionItems" className="mt-4">
            {isActionItemsLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading action items...</p>
              </div>
            ) : actionItems && actionItems.length > 0 ? (
              <div className="bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 p-6 pb-3">
                  Action Items
                </h3>
                <ul className="divide-y divide-gray-200">
                  {actionItems.map((item: any) => (
                    <ActionItemCard
                      key={item.id}
                      actionItem={item}
                      meetingTitle={meeting.title}
                    />
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12 bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500">
                  No action items for this meeting.
                </p>
                <Button className="mt-4" variant="outline">
                  <i className="fas fa-plus mr-2"></i> Add Action Item
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Recording Content */}
          <TabsContent value="recording" className="mt-4">
            <div className="bg-white p-6 rounded-lg shadow">
              {meeting?.outputUrl ? (
                <>
                  <div className="rounded-lg overflow-hidden bg-gray-900 max-w-3xl mx-auto aspect-video">
                    <video
                      className="w-full h-full"
                      controls
                      controlsList="nodownload"
                      src={meeting.outputUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="mt-6 flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(meeting.outputUrl, "_blank")}
                    >
                      <i className="fas fa-external-link-alt mr-2"></i> Open in
                      New Tab
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = meeting.outputUrl;
                        link.download = `meeting-recording-${meetingId}.mp4`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <i className="fas fa-download mr-2"></i> Download
                      Recording
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="rounded-lg overflow-hidden bg-gray-900 max-w-3xl mx-auto aspect-video flex items-center justify-center">
                    <i className="fas fa-video-slash text-6xl text-white opacity-70"></i>
                  </div>
                  <p className="mt-4 text-gray-500">
                    No recording available for this meeting.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
