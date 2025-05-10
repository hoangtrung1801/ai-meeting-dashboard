import React, { useState } from 'react';
import { Transcript, TranscriptContent } from '@shared/schema';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MeetingViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  date: string;
  duration: string;
  transcript?: Transcript;
  summary?: string;
  actionItems?: React.ReactNode;
}

export function MeetingViewer({
  open,
  onOpenChange,
  title,
  date,
  duration,
  transcript,
  summary,
  actionItems
}: MeetingViewerProps) {
  const [activeTab, setActiveTab] = useState('transcript');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilter = (speaker: string) => {
    if (activeFilters.includes(speaker)) {
      setActiveFilters(activeFilters.filter(filter => filter !== speaker));
    } else {
      setActiveFilters([...activeFilters, speaker]);
    }
  };

  // Get unique speakers from transcript
  const getSpeakers = () => {
    if (!transcript?.content) return [];
    const content = transcript.content as TranscriptContent;
    return Array.from(new Set(content.map(item => item.speaker)));
  };

  // Filter transcript based on search and active speakers
  const getFilteredTranscript = () => {
    if (!transcript?.content) return [];
    
    const content = transcript.content as TranscriptContent;
    return content.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.speaker.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesSpeaker = activeFilters.length === 0 || 
        activeFilters.includes(item.speaker);
        
      return matchesSearch && matchesSpeaker;
    });
  };

  const filteredContent = getFilteredTranscript();
  const speakers = getSpeakers();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        {/* Header */}
        <div className="py-4 px-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{date} ({duration})</p>
          </div>
          <button 
            type="button" 
            className="text-gray-400 hover:text-gray-500"
            onClick={() => onOpenChange(false)}
          >
            <span className="sr-only">Close panel</span>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="transcript" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-gray-200">
            <TabsList className="flex px-6 -mb-px">
              <TabsTrigger value="transcript" className="whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm">
                Transcript
              </TabsTrigger>
              <TabsTrigger value="summary" className="whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm">
                Summary
              </TabsTrigger>
              <TabsTrigger value="actionItems" className="whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm">
                Action Items
              </TabsTrigger>
              <TabsTrigger value="recording" className="whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm">
                Recording
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Transcript Content */}
          <TabsContent value="transcript" className="flex-1 p-0 overflow-auto">
            <div className="px-6 py-4">
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
                {speakers.map(speaker => (
                  <span 
                    key={speaker}
                    className={`inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium ${
                      activeFilters.includes(speaker) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {speaker}
                    <button 
                      type="button" 
                      className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-white hover:bg-blue-600 focus:outline-none"
                      onClick={() => toggleFilter(speaker)}
                    >
                      <span className="sr-only">
                        {activeFilters.includes(speaker) ? 'Remove filter' : 'Add filter'}
                      </span>
                      <i className={`fas fa-${activeFilters.includes(speaker) ? 'times' : 'plus'} text-xs`}></i>
                    </button>
                  </span>
                ))}
              </div>
              
              {/* Transcript */}
              <div className="space-y-4 font-mono">
                {filteredContent.length > 0 ? (
                  filteredContent.map((segment, index) => (
                    <div key={index} className="pb-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="w-16 text-xs text-gray-500">{segment.timestamp}</div>
                        <div className="font-medium text-sm text-gray-700">{segment.speaker}</div>
                      </div>
                      <div className="pl-16 pt-1 text-sm text-gray-600 leading-relaxed">
                        {segment.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No results found for your search.' : 'No transcript available'}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Summary Content */}
          <TabsContent value="summary" className="flex-1 p-6 overflow-auto">
            {summary ? (
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Meeting Summary</h3>
                <p className="text-gray-700 whitespace-pre-line">{summary}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No summary available for this meeting.
              </div>
            )}
          </TabsContent>
          
          {/* Action Items Content */}
          <TabsContent value="actionItems" className="flex-1 p-6 overflow-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Action Items</h3>
            {actionItems || (
              <div className="text-center py-8 text-gray-500">
                No action items for this meeting.
              </div>
            )}
          </TabsContent>
          
          {/* Recording Content */}
          <TabsContent value="recording" className="flex-1 p-6 overflow-auto">
            <div className="text-center">
              <div className="rounded-lg overflow-hidden bg-gray-900 max-w-3xl mx-auto aspect-video flex items-center justify-center">
                <i className="fas fa-play-circle text-6xl text-white opacity-70"></i>
              </div>
              <p className="mt-4 text-gray-500">
                Recording playback would be available here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Bottom controls */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <i className="fas fa-download mr-2"></i> Download
              </Button>
              <Button variant="outline" size="sm">
                <i className="fas fa-share-alt mr-2"></i> Share
              </Button>
            </div>
            <div>
              <Button size="sm">
                Edit Transcript
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
