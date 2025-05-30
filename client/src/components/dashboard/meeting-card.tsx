import React from "react";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import { Meeting } from "@shared/schema";

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  // Image URLs for different meeting types
  const MEETING_IMAGES = {
    "Product Strategy Meeting":
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400",
    "Weekly Team Standup":
      "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400",
    "Client Presentation":
      "https://pixabay.com/get/g1c493e3f630b79d4cac80420adc97b52764bad28ad39fc483097d4fa08e6ec93ae51daeb8fb422c31ea62b6b9ef9e6135465fd68c411ca8a0ebbdb14872c7628_1280.jpg",
  };

  // Get image URL based on meeting title or use default
  const getImageUrl = (title: string) => {
    const defaultImage =
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400";

    // for (const [key, url] of Object.entries(MEETING_IMAGES)) {
    //   if (title.includes(key)) {
    //     return url;
    //   }
    // }
    return defaultImage;
  };

  // Get status style based on meeting status
  const getStatusStyle = (status: string) => {
    const styles = {
      scheduled: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: "fa-clock",
        label: "Scheduled",
      },
      "in-progress": {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "fa-spinner fa-spin",
        label: "In Progress",
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: "fa-check-circle",
        label: "Completed",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "fa-times-circle",
        label: "Cancelled",
      },
    };

    return (
      styles[status.toLowerCase() as keyof typeof styles] || {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: "fa-circle",
        label: status,
      }
    );
  };

  const statusStyle = getStatusStyle(meeting.status);

  return (
    <Link href={`/meetings/${meeting.id}`}>
      <a className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="relative">
          <img
            className="h-48 w-full object-cover"
            // src={getImageUrl(meeting.meetingId)}
            src={getImageUrl(meeting.title)}
            alt={meeting.meetingId}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              {meeting.meetingId}
            </h3>
            <span
              className={`${statusStyle.bg} ${statusStyle.text} text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 shadow-sm`}
            >
              <i className={`fas ${statusStyle.icon}`}></i>
              {statusStyle.label}
            </span>
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <i className="fas fa-calendar mr-2"></i>
            <span>{formatDate(meeting.createdAt)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <i className="fas fa-microphone mr-2"></i>
            <span>{meeting.isRecording ? "Recording" : "Not Recording"}</span>
          </div>
          <div
            className="waveform w-full mb-3"
            style={{
              height: "40px",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='100%25' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,20 Q10,5 20,20 T40,20 T60,20 T80,20 T100,20 T120,20 T140,20 T160,20 T180,20 T200,20' stroke='%233B82F6' stroke-width='2' fill='none' /%3E%3C/svg%3E\")",
              backgroundRepeat: "repeat-x",
            }}
          ></div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:text-primary transition-colors">
                <i className="fas fa-play"></i>
              </button>
              <button className="p-2 text-gray-600 hover:text-primary transition-colors">
                <i className="fas fa-file-alt"></i>
              </button>
              <button className="p-2 text-gray-600 hover:text-primary transition-colors">
                <i className="fas fa-share-alt"></i>
              </button>
            </div>
            <div>
              {meeting.transcription && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <i className="fas fa-check-circle mr-1"></i> Transcribed
                </span>
              )}
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
