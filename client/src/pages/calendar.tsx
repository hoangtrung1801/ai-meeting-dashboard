import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Meeting } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MeetingViewer } from '@/components/meeting/meeting-viewer';
import { NewMeetingModal } from '@/components/meeting/new-meeting-modal';
import { formatDate, formatDuration } from '@/lib/utils';

// Set up localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month");
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  
  // Fetch meetings
  const { data: meetings, isLoading } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings'],
  });
  
  // Fetch selected meeting details
  const { data: selectedMeeting } = useQuery<Meeting>({
    queryKey: ['/api/meetings', selectedMeetingId],
    queryFn: () => 
      fetch(`/api/meetings/${selectedMeetingId}`).then(res => res.json()),
    enabled: !!selectedMeetingId,
  });
  
  // Fetch transcript for selected meeting
  const { data: transcript } = useQuery({
    queryKey: ['/api/meetings', selectedMeetingId, 'transcript'],
    queryFn: () => 
      fetch(`/api/meetings/${selectedMeetingId}/transcript`).then(res => res.json()),
    enabled: !!selectedMeetingId,
  });
  
  // Fetch summary for selected meeting
  const { data: summary } = useQuery({
    queryKey: ['/api/meetings', selectedMeetingId, 'summary'],
    queryFn: () => 
      fetch(`/api/meetings/${selectedMeetingId}/summary`).then(res => res.json()),
    enabled: !!selectedMeetingId,
  });
  
  // Fetch action items for selected meeting
  const { data: actionItems } = useQuery({
    queryKey: ['/api/meetings', selectedMeetingId, 'action-items'],
    queryFn: () => 
      fetch(`/api/meetings/${selectedMeetingId}/action-items`).then(res => res.json()),
    enabled: !!selectedMeetingId,
  });
  
  // Format meetings for calendar view
  const calendarEvents = useMemo(() => {
    if (!meetings) return [];
    
    return meetings.map(meeting => {
      const start = new Date(meeting.date);
      const end = new Date(start.getTime() + meeting.duration * 60000);
      
      return {
        id: meeting.id,
        title: meeting.title,
        start,
        end,
        resource: meeting,
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
  const handleViewChange = (newView: 'month' | 'week' | 'day' | 'agenda') => {
    setView(newView);
  };

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      {/* Top Navigation */}
      <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
        {/* Search Bar */}
        <div className="flex-1 px-4 flex justify-between">
          <div className="flex-1 flex">
            <div className="w-full flex md:ml-0">
              <label htmlFor="search-field" className="sr-only">Search</label>
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
          <div className="ml-4 flex items-center md:ml-6">
            <Button 
              onClick={() => setIsNewMeetingModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
              size="sm"
            >
              <i className="fas fa-plus mr-2"></i> Schedule Meeting
            </Button>
          </div>
        </div>
      </div>

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-dark mb-4 md:mb-0">Meeting Calendar</h1>
          
          <div className="flex flex-wrap gap-3">
            <Select value={view} onValueChange={(val: any) => handleViewChange(val)}>
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
            
            <Button
              variant="outline"
              onClick={() => setDate(new Date())}
            >
              Today
            </Button>
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'month') {
                    newDate.setMonth(date.getMonth() - 1);
                  } else if (view === 'week') {
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
                  if (view === 'month') {
                    newDate.setMonth(date.getMonth() + 1);
                  } else if (view === 'week') {
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
                  style={{ height: '100%' }}
                  views={['month', 'week', 'day', 'agenda']}
                  view={view}
                  date={date}
                  onNavigate={handleNavigate}
                  onView={(newView: any) => handleViewChange(newView)}
                  onSelectEvent={handleEventSelect}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: event.resource.transcriptionComplete ? '#4f46e5' : '#9333ea',
                      borderColor: event.resource.transcriptionComplete ? '#4338ca' : '#7e22ce',
                    },
                  })}
                  dayPropGetter={(date) => {
                    const today = new Date();
                    if (
                      date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear()
                    ) {
                      return {
                        style: {
                          backgroundColor: 'rgba(79, 70, 229, 0.05)',
                        },
                      };
                    }
                    return {};
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Meetings Section */}
        <div>
          <h2 className="text-lg font-medium text-dark mb-4">Upcoming Meetings</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!isLoading && meetings && meetings.length > 0 ? (
              meetings
                .filter(meeting => new Date(meeting.date) > new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
                .map(meeting => (
                  <Card 
                    key={meeting.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedMeetingId(meeting.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{meeting.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        {formatDate(meeting.date)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <i className="fas fa-clock mr-2"></i>
                        {formatDuration(meeting.duration)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <i className="fas fa-users mr-2"></i>
                        {meeting.participants} participants
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="col-span-3 p-6 text-center bg-white rounded-lg shadow">
                <p className="text-gray-500">No upcoming meetings.</p>
                <Button 
                  onClick={() => setIsNewMeetingModalOpen(true)}
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
      
      {/* Meeting Viewer */}
      {selectedMeeting && (
        <MeetingViewer
          open={!!selectedMeetingId}
          onOpenChange={(open) => {
            if (!open) setSelectedMeetingId(null);
          }}
          title={selectedMeeting.title}
          date={formatDate(selectedMeeting.date)}
          duration={formatDuration(selectedMeeting.duration)}
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
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-sm text-gray-500">Assigned to: {item.assignee}</p>
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