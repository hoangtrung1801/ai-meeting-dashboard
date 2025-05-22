import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Meeting } from "@shared/schema";
import { MeetingCard } from "@/components/dashboard/meeting-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewMeetingModal } from "@/components/meeting/new-meeting-modal";
import { MeetingViewer } from "@/components/meeting/meeting-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDuration } from "@/lib/utils";

export default function Meetings() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
        null
    );
    const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);

    // Fetch all meetings
    const { data: meetings, isLoading } = useQuery<Meeting[]>({
        queryKey: ["/api/meetings"],
    });

    // Filter meetings based on search query
    const filteredMeetings =
        meetings && searchQuery
            ? meetings.filter((meeting) =>
                  meeting.meetingId
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
              )
            : meetings;

    // Get selected meeting details
    const selectedMeeting = selectedMeetingId
        ? meetings?.find((m) => m.id === selectedMeetingId)
        : null;

    // Fetch transcript for selected meeting
    const { data: transcript } = useQuery({
        queryKey: ["/api/meetings", selectedMeetingId, "transcript"],
        queryFn: () =>
            fetch(`/api/meetings/${selectedMeetingId}/transcript`).then((res) =>
                res.json()
            ),
        enabled: !!selectedMeetingId,
    });

    // Fetch summary for selected meeting
    const { data: summary } = useQuery({
        queryKey: ["/api/meetings", selectedMeetingId, "summary"],
        queryFn: () =>
            fetch(`/api/meetings/${selectedMeetingId}/summary`).then((res) =>
                res.json()
            ),
        enabled: !!selectedMeetingId,
    });

    // Fetch action items for selected meeting
    const { data: actionItems } = useQuery({
        queryKey: ["/api/meetings", selectedMeetingId, "action-items"],
        queryFn: () =>
            fetch(`/api/meetings/${selectedMeetingId}/action-items`).then(
                (res) => res.json()
            ),
        enabled: !!selectedMeetingId,
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {/* Top Navigation */}
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
                {/* Search Bar */}
                <div className="flex-1 px-4 flex justify-between">
                    <div className="flex-1 flex">
                        <div className="w-full flex md:ml-0">
                            <label htmlFor="search-field" className="sr-only">
                                Search
                            </label>
                            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                                    <i className="fas fa-search h-5 w-5 ml-3"></i>
                                </div>
                                <Input
                                    id="search-field"
                                    className="block w-full h-full pl-10 pr-3 py-2 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                                    placeholder="Search meetings..."
                                    type="search"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="ml-4 flex items-center md:ml-6">
                        <Button
                            onClick={() => setIsNewMeetingModalOpen(true)}
                            className="bg-primary hover:bg-blue-600 text-white"
                            size="sm"
                        >
                            <i className="fas fa-plus mr-2"></i> New Meeting
                        </Button>
                    </div>
                </div>
            </div>

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-dark">
                        Meetings
                    </h1>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" className="mb-6">
                    <TabsList>
                        <TabsTrigger value="all">All Meetings</TabsTrigger>
                        <TabsTrigger value="recent">Recent</TabsTrigger>
                        <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {Array(6)
                                    .fill(null)
                                    .map((_, index) => (
                                        <div
                                            key={index}
                                            className="bg-white shadow rounded-lg overflow-hidden animate-pulse"
                                        >
                                            <div className="h-48 bg-gray-200"></div>
                                            <div className="p-4 space-y-3">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-10 bg-gray-200 rounded"></div>
                                                <div className="flex justify-between">
                                                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                                                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : filteredMeetings && filteredMeetings.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredMeetings.map((meeting) => (
                                    <div
                                        key={meeting.id}
                                        onClick={() =>
                                            setSelectedMeetingId(meeting.id)
                                        }
                                    >
                                        <MeetingCard meeting={meeting} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">
                                    {searchQuery
                                        ? "No meetings found matching your search."
                                        : "No meetings found. Start by recording your first meeting!"}
                                </p>
                                <Button
                                    onClick={() =>
                                        setIsNewMeetingModalOpen(true)
                                    }
                                >
                                    Start New Meeting
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="recent" className="mt-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {Array(3)
                                    .fill(null)
                                    .map((_, index) => (
                                        <div
                                            key={index}
                                            className="bg-white shadow rounded-lg overflow-hidden animate-pulse"
                                        >
                                            <div className="h-48 bg-gray-200"></div>
                                            <div className="p-4 space-y-3">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-10 bg-gray-200 rounded"></div>
                                                <div className="flex justify-between">
                                                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                                                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : filteredMeetings && filteredMeetings.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredMeetings.slice(0, 3).map((meeting) => (
                                    <div
                                        key={meeting.id}
                                        onClick={() =>
                                            setSelectedMeetingId(meeting.id)
                                        }
                                    >
                                        <MeetingCard meeting={meeting} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500">
                                    No recent meetings found.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="scheduled" className="mt-6">
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">
                                No upcoming scheduled meetings.
                            </p>
                            <Button
                                onClick={() => setIsNewMeetingModalOpen(true)}
                            >
                                Schedule a Meeting
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* New Meeting Modal */}
            <NewMeetingModal
                open={isNewMeetingModalOpen}
                onOpenChange={setIsNewMeetingModalOpen}
            />

            {/* Meeting Viewer */}
            {selectedMeeting && (
                <MeetingViewer
                    open={!!selectedMeetingId}
                    onOpenChange={(open) => {
                        if (!open) setSelectedMeetingId(null);
                    }}
                    title={selectedMeeting.meetingId}
                    date={formatDate(selectedMeeting.createdAt)}
                    // duration={formatDuration(selectedMeeting?. || 0)}
                    duration={"0"}
                    transcript={transcript}
                    summary={summary?.content}
                    actionItems={
                        actionItems && actionItems.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {actionItems.map((item: any) => (
                                    <li key={item.id} className="py-4">
                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 mt-1 text-primary focus:ring-primary border-gray-300 rounded"
                                                checked={item.completed}
                                                readOnly
                                            />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {item.description}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Assigned to: {item.assignee}
                                                </p>
                                                {item.dueDate && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Due:{" "}
                                                        {new Date(
                                                            item.dueDate
                                                        ).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : null
                    }
                />
            )}
        </main>
    );
}
