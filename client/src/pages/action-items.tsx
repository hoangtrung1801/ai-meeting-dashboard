import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActionItem, Meeting } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionItemCard } from '@/components/dashboard/action-item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function ActionItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');

  // Fetch pending action items
  const { data: actionItems, isLoading } = useQuery<ActionItem[]>({
    queryKey: ['/api/action-items/pending'],
  });

  // Fetch meetings for reference
  const { data: meetings } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings'],
  });

  const getMeetingTitle = (meetingId: number): string => {
    const meeting = meetings?.find(m => m.id === meetingId);
    return meeting?.title || 'Unknown meeting';
  };

  // Filter action items based on search query and status filter
  const filteredActionItems = actionItems && actionItems.length > 0
    ? actionItems
      .filter(item => 
        (searchQuery === '' || 
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.assignee.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === 'all' || 
          (statusFilter === 'completed' && item.completed) ||
          (statusFilter === 'pending' && !item.completed))
      )
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          // Handle undefined dates
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortBy === 'assignee') {
          return a.assignee.localeCompare(b.assignee);
        } else { // createdAt
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
      })
    : [];

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
                  placeholder="Search action items..." 
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="ml-4 flex items-center md:ml-6">
            <Button className="bg-primary hover:bg-blue-600 text-white">
              <i className="fas fa-plus mr-2"></i> New Action Item
            </Button>
          </div>
        </div>
      </div>

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-dark">Action Items</h1>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="status-filter" className="text-sm whitespace-nowrap">Status:</Label>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="status-filter" className="w-[130px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="sort-by" className="text-sm whitespace-nowrap">Sort by:</Label>
              <Select 
                value={sortBy} 
                onValueChange={setSortBy}
              >
                <SelectTrigger id="sort-by" className="w-[130px]">
                  <SelectValue placeholder="Due Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="assignee">Assignee</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Items List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            // Loading state
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading action items...</p>
            </div>
          ) : filteredActionItems.length > 0 ? (
            <>
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total: {filteredActionItems.length} action item{filteredActionItems.length !== 1 ? 's' : ''}
              </div>
              <ul className="divide-y divide-gray-200">
                {filteredActionItems.map((item) => (
                  <ActionItemCard 
                    key={item.id} 
                    actionItem={item} 
                    meetingTitle={getMeetingTitle(item.meetingId)} 
                  />
                ))}
              </ul>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <i className="fas fa-tasks text-gray-400"></i>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No action items</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? "No action items found matching your search."
                  : "Get started by creating a new action item."}
              </p>
              <div className="mt-6">
                <Button>
                  <i className="fas fa-plus mr-2"></i> New Action Item
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
