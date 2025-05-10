import React from 'react';
import { ActionItem } from '@shared/schema';
import { getRelativeDueDate } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface ActionItemCardProps {
  actionItem: ActionItem;
  meetingTitle?: string;
}

export function ActionItemCard({ actionItem, meetingTitle }: ActionItemCardProps) {
  const { toast } = useToast();
  
  const { text: dueDateText, status: dueDateStatus } = getRelativeDueDate(actionItem.dueDate);
  
  const handleCheckboxChange = async (checked: boolean) => {
    try {
      await apiRequest('PATCH', `/api/action-items/${actionItem.id}`, {
        completed: checked
      });
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['/api/action-items/pending'] });
      
      toast({
        title: checked ? "Action item completed" : "Action item marked as incomplete",
        description: actionItem.description,
      });
    } catch (error) {
      toast({
        title: "Error updating action item",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox 
              id={`action-${actionItem.id}`} 
              checked={actionItem.completed}
              onCheckedChange={handleCheckboxChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor={`action-${actionItem.id}`} className="ml-3 block text-sm font-medium text-gray-700">
              {actionItem.description}
            </label>
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              dueDateStatus === 'overdue' 
                ? 'bg-red-100 text-red-800' 
                : dueDateStatus === 'due-soon' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-blue-100 text-blue-800'
            }`}>
              {dueDateText}
            </span>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              <i className="fas fa-user-circle flex-shrink-0 mr-1.5 text-gray-400"></i>
              Assigned to: {actionItem.assignee}
            </p>
            {meetingTitle && (
              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                <i className="fas fa-video flex-shrink-0 mr-1.5 text-gray-400"></i>
                {meetingTitle}
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <i className="fas fa-calendar flex-shrink-0 mr-1.5 text-gray-400"></i>
            <p>
              Created on <time dateTime={actionItem.createdAt?.toString()}>
                {new Date(actionItem.createdAt || '').toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
