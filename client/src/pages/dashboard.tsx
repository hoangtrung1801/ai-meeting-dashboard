import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Meeting, ActionItem } from "@shared/schema";
import { StatsCard } from "@/components/dashboard/stats-card";
import { MeetingCard } from "@/components/dashboard/meeting-card";
import { ActionItemCard } from "@/components/dashboard/action-item";
import { UpcomingMeeting } from "@/components/dashboard/upcoming-meeting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewMeetingModal } from "@/components/meeting/new-meeting-modal";
import { Link } from "wouter";

interface DashboardStats {
    totalMeetings: number;
    meetingMinutes: number;
    actionItems: number;
    completedActionItems: number;
    storageUsed: string;
}

export default function Dashboard() {
    const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Fetch dashboard stats
    const { data: stats, isLoading: isStatsLoading } = useQuery<DashboardStats>(
        {
            queryKey: ["/api/dashboard/stats"],
        }
    );

    // Fetch recent meetings
    const { data: recentMeetings, isLoading: isMeetingsLoading } = useQuery<
        Meeting[]
    >({
        queryKey: ["/api/meetings"],
    });

    // Fetch pending action items
    const { data: actionItems, isLoading: isActionItemsLoading } = useQuery<
        ActionItem[]
    >({
        queryKey: ["/api/action-items/pending"],
    });

    console.log({ recentMeetings });

    return (
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {/* Top Navigation */}
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
                <button
                    type="button"
                    className="md:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <span className="sr-only">Open sidebar</span>
                    <i className="fas fa-bars"></i>
                </button>

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
                                    placeholder="Search meetings, transcripts, or action items"
                                    type="search"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="ml-4 flex items-center md:ml-6">
                        <button
                            type="button"
                            className="bg-primary hover:bg-blue-600 p-1 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            onClick={() => setIsNewMeetingModalOpen(true)}
                        >
                            <span className="sr-only">Start new meeting</span>
                            <i className="fas fa-plus"></i>
                        </button>

                        {/* Notifications */}
                        <button
                            type="button"
                            className="ml-3 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <span className="sr-only">View notifications</span>
                            <i className="fas fa-bell"></i>
                        </button>

                        {/* Help */}
                        <button
                            type="button"
                            className="ml-3 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <span className="sr-only">View help</span>
                            <i className="fas fa-question-circle"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-dark">
                        Dashboard
                    </h1>

                    <div className="flex space-x-3">
                        <Button
                            onClick={() => setIsNewMeetingModalOpen(true)}
                            className="inline-flex items-center"
                        >
                            <i className="fas fa-plus mr-2"></i> New Meeting
                        </Button>

                        <Button
                            variant="outline"
                            className="inline-flex items-center"
                            asChild
                        >
                            <Link href="/settings">
                                <i className="fas fa-cog mr-2"></i> Preferences
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {isStatsLoading ? (
                        // Skeleton loading state
                        Array(4)
                            .fill(null)
                            .map((_, index) => (
                                <div
                                    key={index}
                                    className="bg-white overflow-hidden shadow rounded-lg h-[106px] animate-pulse"
                                >
                                    <div className="h-full flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-md bg-gray-200"></div>
                                        <div className="ml-5 space-y-2">
                                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                            <div className="h-6 w-12 bg-gray-300 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <>
                            <StatsCard
                                title="Total Meetings"
                                value={stats?.totalMeetings || 0}
                                icon="fas fa-video"
                                iconBgColor="bg-primary"
                            />

                            <StatsCard
                                title="Meeting Minutes"
                                value={stats?.meetingMinutes || 0}
                                icon="fas fa-clock"
                                iconBgColor="bg-secondary"
                            />

                            <StatsCard
                                title="Action Items"
                                value={stats?.actionItems || 0}
                                icon="fas fa-tasks"
                                iconBgColor="bg-accent"
                                additionalText={`${
                                    stats?.completedActionItems || 0
                                } completed`}
                            />

                            <StatsCard
                                title="Storage Used"
                                value={stats?.storageUsed || "0 GB"}
                                icon="fas fa-database"
                                iconBgColor="bg-gray-500"
                                additionalText="of 10 GB"
                            />
                        </>
                    )}
                </div>

                {/* Recent Meetings */}
                <div className="mb-8">
                    <h2 className="text-lg font-medium text-dark mb-4">
                        Recent Meetings
                    </h2>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {isMeetingsLoading ? (
                            // Skeleton loading state
                            Array(3)
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
                                ))
                        ) : recentMeetings && recentMeetings.length > 0 ? (
                            recentMeetings.map((meeting) => (
                                <MeetingCard
                                    key={meeting.id}
                                    meeting={meeting}
                                />
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-10">
                                <p className="text-gray-500">
                                    No recent meetings found.
                                </p>
                                <Button
                                    onClick={() =>
                                        setIsNewMeetingModalOpen(true)
                                    }
                                    variant="link"
                                    className="mt-2"
                                >
                                    Start your first meeting
                                </Button>
                            </div>
                        )}
                    </div>

                    {recentMeetings && recentMeetings.length > 0 && (
                        <div className="mt-4 text-center">
                            <Link href="/meetings">
                                <a className="text-primary hover:text-blue-700 font-medium">
                                    View all meetings{" "}
                                    <i className="fas fa-arrow-right ml-1"></i>
                                </a>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Action Items */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-dark">
                            Pending Action Items
                        </h2>
                        <Link href="/action-items">
                            <a className="text-sm text-primary hover:text-blue-700">
                                View all
                            </a>
                        </Link>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {isActionItemsLoading ? (
                                // Skeleton loading state
                                Array(3)
                                    .fill(null)
                                    .map((_, index) => (
                                        <li
                                            key={index}
                                            className="px-4 py-4 sm:px-6 animate-pulse"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                                <div className="h-5 w-24 bg-gray-200 rounded-full ml-auto"></div>
                                            </div>
                                            <div className="mt-2 flex items-center space-x-2">
                                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                <div className="h-4 w-40 bg-gray-200 rounded"></div>
                                            </div>
                                        </li>
                                    ))
                            ) : actionItems && actionItems.length > 0 ? (
                                actionItems
                                    .slice(0, 3)
                                    .map((item) => (
                                        <ActionItemCard
                                            key={item._id.toString()}
                                            actionItem={item}
                                        />
                                    ))
                            ) : (
                                <li className="px-4 py-10 text-center text-gray-500">
                                    No pending action items.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Upcoming Meetings */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-dark">
                            Upcoming Meetings
                        </h2>
                        <Link href="/meetings">
                            <a className="text-sm text-primary hover:text-blue-700">
                                View calendar
                            </a>
                        </Link>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {isMeetingsLoading ? (
                                // Skeleton loading state
                                Array(2)
                                    .fill(null)
                                    .map((_, index) => (
                                        <li
                                            key={index}
                                            className="px-4 py-4 sm:px-6 animate-pulse"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="mt-2 flex space-x-4">
                                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                                <div className="h-4 w-20 bg-gray-200 rounded ml-auto"></div>
                                            </div>
                                        </li>
                                    ))
                            ) : recentMeetings && recentMeetings.length > 0 ? (
                                // Use the first 2 meetings as "upcoming" for demo purposes
                                recentMeetings.slice(0, 2).map((meeting) => {
                                    // Clone meeting and adjust date to be in the future for demo
                                    const upcomingMeeting = {
                                        ...meeting,
                                        date: new Date(
                                            Date.now() + 24 * 60 * 60 * 1000
                                        ), // Tomorrow
                                    };
                                    return (
                                        <UpcomingMeeting
                                            key={meeting.id}
                                            meeting={upcomingMeeting}
                                        />
                                    );
                                })
                            ) : (
                                <li className="px-4 py-10 text-center text-gray-500">
                                    No upcoming meetings scheduled.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* New Meeting Modal */}
            <NewMeetingModal
                open={isNewMeetingModalOpen}
                onOpenChange={setIsNewMeetingModalOpen}
            />
        </main>
    );
}
