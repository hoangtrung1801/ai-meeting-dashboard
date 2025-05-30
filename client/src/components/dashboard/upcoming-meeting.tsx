import React from "react";
import { Meeting } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";

interface UpcomingMeetingProps {
    meeting: Meeting;
}

export function UpcomingMeeting({ meeting }: UpcomingMeetingProps) {
    return (
        <li className="hover:bg-gray-50">
            <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary truncate">
                        {meeting.meetingId}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                        <Link href={`/meetings/${meeting.id}`}>
                            <a className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                <i className="fas fa-video mr-1"></i> Join
                            </a>
                        </Link>
                    </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                            <i className="fas fa-clock flex-shrink-0 mr-1.5 text-gray-400"></i>
                            {formatDate(meeting.createdAt)}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <i className="fas fa-microphone flex-shrink-0 mr-1.5 text-gray-400"></i>
                            {meeting.isRecording
                                ? "Recording"
                                : "Not Recording"}
                        </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <i className="fas fa-circle flex-shrink-0 mr-1.5 text-gray-400"></i>
                        <p>{meeting.status}</p>
                    </div>
                </div>
            </div>
        </li>
    );
}
