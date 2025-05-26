import { MeetingViewer } from "@/components/meeting/meeting-viewer";
import { NewMeetingModal } from "@/components/meeting/new-meeting-modal";
import { ScheduleMeetingModal } from "@/components/meeting/schedule-meeting-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, Meeting, Transcript } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import React, { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Set up localizer for react-big-calendar
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Meeting status enum for client-side use
const MeetingStatus = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

type MeetingStatusType = (typeof MeetingStatus)[keyof typeof MeetingStatus];

// Add custom event component
const MeetingEvent = ({ event }: { event: any }) => {
  const meeting = event.resource as Meeting;
  const startTime = meeting.startTime
    ? new Date(meeting.startTime)
    : new Date();
  const endTime = new Date(
    startTime.getTime() + (meeting.duration || 0) * 60000
  );

  const isValidStart = !isNaN(startTime.getTime());
  const isValidEnd = !isNaN(endTime.getTime());

  const formattedStart = isValidStart
    ? format(startTime, "HH:mm")
    : "Invalid time";
  const formattedEnd = isValidEnd ? format(endTime, "HH:mm") : "Invalid time";

  return (
    <div className="p-1 h-full">
      <div className="font-medium text-sm truncate">
        {meeting.title || "Untitled Meeting"}
      </div>
      <div className="text-xs text-gray-600">
        {formattedStart} - {formattedEnd}
      </div>
      <div className="text-xs text-gray-500 truncate">
        {meeting.participants?.length || 0} participants
      </div>
    </div>
  );
};

// Add calendar view configuration
const calendarConfig = {
  month: {
    formats: {
      dayFormat: "d",
      dayHeaderFormat: "EEEE",
      dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
        `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
    },
  },
  week: {
    formats: {
      dayFormat: "EEE d",
      dayHeaderFormat: "EEEE",
      dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
        `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
    },
  },
  day: {
    formats: {
      dayFormat: "EEEE, MMM d",
      dayHeaderFormat: "EEEE",
      dayRangeHeaderFormat: ({ start }: { start: Date }) =>
        format(start, "MMMM d, yyyy"),
    },
  },
  agenda: {
    formats: {
      dayFormat: "EEEE, MMM d",
      dayHeaderFormat: "EEEE",
      dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
        `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
    },
  },
};

// Add CustomToolbar component
const CustomToolbar = (toolbar: any) => {
  const goToToday = () => {
    toolbar.onNavigate("TODAY");
  };

  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };

  const goToView = (view: string) => {
    toolbar.onView(view);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={goToBack}>
            <i className="fas fa-chevron-left"></i>
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNext}>
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>
        <h2 className="text-lg font-semibold">{toolbar.label}</h2>
      </div>
      <div className="flex items-center space-x-2">
        <Select value={toolbar.view} onValueChange={goToView}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="agenda">Agenda</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default function CalendarView() {
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">(
    "month"
  );
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    null
  );
  const [date, setDate] = useState(new Date());
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isScheduleMeetingModalOpen, setIsScheduleMeetingModalOpen] =
    useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  // Calculate date range based on current view - expanded to show more meetings
  const getDateRange = useMemo(() => {
    const start = new Date();
    const end = new Date();

    // Show meetings from 6 months ago to 12 months in the future
    start.setMonth(start.getMonth() - 6);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    end.setMonth(end.getMonth() + 12);
    end.setDate(31);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }, []); // Remove dependencies to make it static

  // Fetch meetings for the current date range
  const { data: meetings, isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings/range", getDateRange.start, getDateRange.end],
    queryFn: () => api.getMeetingsInRange(getDateRange.start, getDateRange.end),
  });

  // Fetch selected meeting details
  const { data: selectedMeeting } = useQuery<Meeting>({
    queryKey: ["/api/meetings", selectedMeetingId],
    queryFn: () =>
      selectedMeetingId
        ? api.getMeeting(selectedMeetingId)
        : Promise.reject("No meeting ID"),
    enabled: !!selectedMeetingId,
  });

  // Fetch transcript for selected meeting
  const { data: transcript } = useQuery({
    queryKey: ["/api/meetings", selectedMeetingId, "transcript"],
    queryFn: () =>
      selectedMeetingId
        ? api.getTranscript(selectedMeetingId)
        : Promise.reject("No meeting ID"),
    enabled: !!selectedMeetingId,
  });

  // Fetch summary for selected meeting
  const { data: summary } = useQuery({
    queryKey: ["/api/meetings", selectedMeetingId, "summary"],
    queryFn: () =>
      selectedMeetingId
        ? api.getSummary(selectedMeetingId)
        : Promise.reject("No meeting ID"),
    enabled: !!selectedMeetingId,
  });

  // Fetch action items for selected meeting
  const { data: actionItems } = useQuery({
    queryKey: ["/api/meetings", selectedMeetingId, "action-items"],
    queryFn: () =>
      selectedMeetingId
        ? api.getActionItems(selectedMeetingId)
        : Promise.reject("No meeting ID"),
    enabled: !!selectedMeetingId,
  });

  // Update calendarEvents mapping
  const calendarEvents = useMemo(() => {
    if (!meetings) return [];

    return meetings.map((meeting) => {
      // Use startTime for scheduled meetings, createdAt for bot recordings
      const start = meeting.startTime
        ? new Date(meeting.startTime)
        : new Date(meeting.createdAt);
      const end = new Date(start.getTime() + (meeting.duration || 60) * 60000);
      const isValidStart = !isNaN(start.getTime());
      const isValidEnd = !isNaN(end.getTime());

      return {
        id: meeting.id,
        title: meeting.title || meeting.meetingId || "Untitled Meeting",
        start: isValidStart ? start : new Date(),
        end: isValidEnd ? end : new Date(start.getTime() + 60 * 60000),
        resource: meeting,
        allDay: false,
        desc: meeting.description || "",
        participants: meeting.participants || [],
        status: meeting.status,
        duration: meeting.duration,
        meetingLink: meeting.meetingLink,
      };
    });
  }, [meetings]);

  // Handle calendar event selection
  const handleEventSelect = (event: any) => {
    setSelectedMeetingId(event.id);
  };

  // Handle calendar date navigation
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  // Handle calendar view change
  const handleViewChange = (newView: "month" | "week" | "day" | "agenda") => {
    setView(newView);
  };

  console.log({ meetings });

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
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="ml-4 flex items-center md:ml-6 space-x-2">
            <Button
              onClick={() => setIsScheduleMeetingModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
              size="sm"
            >
              <i className="fas fa-calendar-plus mr-2"></i> Schedule Meeting
            </Button>
            <Button
              onClick={() => setIsNewMeetingModalOpen(true)}
              variant="outline"
              size="sm"
            >
              <i className="fas fa-microphone mr-2"></i> Start Recording
            </Button>
          </div>
        </div>
      </div>

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-dark mb-4 md:mb-0">
            Meeting Calendar
          </h1>

          <div className="flex flex-wrap gap-3">
            <Select
              value={view}
              onValueChange={(val: any) => handleViewChange(val)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setDate(new Date())}>
              Today
            </Button>

            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === "month") {
                    newDate.setMonth(date.getMonth() - 1);
                  } else if (view === "week") {
                    newDate.setDate(date.getDate() - 7);
                  } else {
                    newDate.setDate(date.getDate() - 1);
                  }
                  handleNavigate(newDate);
                }}
              >
                <i className="fas fa-chevron-left"></i>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === "month") {
                    newDate.setMonth(date.getMonth() + 1);
                  } else if (view === "week") {
                    newDate.setDate(date.getDate() + 7);
                  } else {
                    newDate.setDate(date.getDate() + 1);
                  }
                  handleNavigate(newDate);
                }}
              >
                <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <Card className="bg-white shadow overflow-hidden mb-6">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-[600px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-[600px] calendar-container">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  views={["month", "week", "day", "agenda"]}
                  view={view}
                  date={date}
                  onNavigate={handleNavigate}
                  onView={(newView: any) => handleViewChange(newView)}
                  onSelectEvent={handleEventSelect}
                  components={{
                    event: MeetingEvent,
                    toolbar: CustomToolbar,
                  }}
                  formats={
                    calendarConfig[view as keyof typeof calendarConfig]?.formats
                  }
                  eventPropGetter={(event) => {
                    const meeting = event.resource as Meeting;
                    let backgroundColor = "#9333ea";
                    let borderColor = "#7e22ce";

                    switch (meeting.status) {
                      case MeetingStatus.COMPLETED:
                        backgroundColor = "#4f46e5";
                        borderColor = "#4338ca";
                        break;
                      case MeetingStatus.IN_PROGRESS:
                        backgroundColor = "#0ea5e9";
                        borderColor = "#0284c7";
                        break;
                      case MeetingStatus.CANCELLED:
                        backgroundColor = "#ef4444";
                        borderColor = "#dc2626";
                        break;
                      case MeetingStatus.SCHEDULED:
                        backgroundColor = "#9333ea";
                        borderColor = "#7e22ce";
                        break;
                    }

                    return {
                      style: {
                        backgroundColor,
                        borderColor,
                        borderRadius: "4px",
                        opacity:
                          meeting.status === MeetingStatus.CANCELLED ? 0.7 : 1,
                        color: "white",
                        border: "none",
                        display: "block",
                        padding: "2px 5px",
                      },
                      className: "hover:opacity-90 transition-opacity",
                    };
                  }}
                  dayPropGetter={(date) => {
                    const today = new Date();
                    const isToday =
                      date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear();

                    const hasMeetings = calendarEvents.some((event) => {
                      const eventDate = new Date(event.start);
                      return (
                        eventDate.getDate() === date.getDate() &&
                        eventDate.getMonth() === date.getMonth() &&
                        eventDate.getFullYear() === date.getFullYear()
                      );
                    });

                    return {
                      style: {
                        backgroundColor: isToday
                          ? "rgba(79, 70, 229, 0.05)"
                          : hasMeetings
                          ? "rgba(147, 51, 234, 0.05)"
                          : undefined,
                      },
                      className: isToday
                        ? "font-bold"
                        : hasMeetings
                        ? "font-medium"
                        : undefined,
                    };
                  }}
                  tooltipAccessor={(event) => {
                    const meeting = event.resource as Meeting;
                    const start = new Date(event.start);
                    const end = new Date(event.end);
                    return `
                                            ${meeting.title}
                                            Time: ${format(
                                              start,
                                              "HH:mm"
                                            )} - ${format(end, "HH:mm")}
                                            Duration: ${
                                              meeting.duration
                                            } minutes
                                            Participants: ${
                                              meeting.participants?.length || 0
                                            }
                                            Status: ${meeting.status}
                                            ${
                                              meeting.description
                                                ? `\nDescription: ${meeting.description}`
                                                : ""
                                            }
                                            ${
                                              meeting.meetingLink
                                                ? `\nMeeting Link: ${meeting.meetingLink}`
                                                : ""
                                            }
                                        `;
                  }}
                  popup
                  selectable
                  onSelectSlot={({ start, end }) => {
                    // Handle slot selection for creating new meetings
                    setSelectedSlot({ start, end });
                    setIsScheduleMeetingModalOpen(true);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Meetings Section */}
        <div>
          <h2 className="text-lg font-medium text-dark mb-4">
            Upcoming Meetings
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!isLoading && meetings && meetings.length > 0 ? (
              meetings
                .filter((meeting) => {
                  const meetingDate = meeting.startTime
                    ? new Date(meeting.startTime)
                    : new Date(meeting.createdAt);
                  return meetingDate > new Date();
                })
                .sort((a, b) => {
                  const dateA = a.startTime
                    ? new Date(a.startTime)
                    : new Date(a.createdAt);
                  const dateB = b.startTime
                    ? new Date(b.startTime)
                    : new Date(b.createdAt);
                  return dateA.getTime() - dateB.getTime();
                })
                .slice(0, 3)
                .map((meeting) => (
                  <Card
                    key={meeting.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedMeetingId(meeting.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {meeting.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        {formatDate(meeting.startTime)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <i className="fas fa-clock mr-2"></i>
                        {formatDuration(meeting.duration)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <i className="fas fa-users mr-2"></i>
                        {meeting.participants.length} participants
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="col-span-3 p-6 text-center bg-white rounded-lg shadow">
                <p className="text-gray-500">No upcoming meetings.</p>
                <Button
                  onClick={() => setIsScheduleMeetingModalOpen(true)}
                  variant="link"
                  className="mt-2"
                >
                  Schedule a meeting
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Meeting Modal */}
      <NewMeetingModal
        open={isNewMeetingModalOpen}
        onOpenChange={setIsNewMeetingModalOpen}
      />

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        open={isScheduleMeetingModalOpen}
        onOpenChange={setIsScheduleMeetingModalOpen}
        initialDate={selectedSlot?.start}
        initialTime={
          selectedSlot?.start ? format(selectedSlot.start, "HH:mm") : undefined
        }
      />

      {/* Meeting Viewer */}
      {selectedMeeting && (
        <MeetingViewer
          open={!!selectedMeetingId}
          onOpenChange={(open) => {
            if (!open) setSelectedMeetingId(null);
          }}
          title={selectedMeeting.title}
          date={formatDate(selectedMeeting.startTime)}
          duration={formatDuration(selectedMeeting.duration)}
          transcript={transcript}
          summary={summary}
          actionItems={
            actionItems && actionItems.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {actionItems.map((item) => (
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
                            Due: {new Date(item.dueDate).toLocaleDateString()}
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
