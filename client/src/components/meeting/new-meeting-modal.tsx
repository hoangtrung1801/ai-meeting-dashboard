import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface NewMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  title: z.string().min(3, { message: 'Meeting name must be at least 3 characters' }),
  platformType: z.string().min(1, { message: 'Please select a platform' }),
  autoTranscribe: z.boolean().default(true),
  autoSummarize: z.boolean().default(true),
  extractActionItems: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

export function NewMeetingModal({ open, onOpenChange }: NewMeetingModalProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      platformType: 'Zoom',
      autoTranscribe: true,
      autoSummarize: true,
      extractActionItems: true
    }
  });
  
  const createMeetingMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Prepare meeting data
      const meetingData = {
        title: data.title,
        date: new Date().toISOString(),
        duration: 0, // Will be updated when meeting ends
        platformType: data.platformType,
        participants: 1, // Will be updated with actual participants
        transcriptionComplete: false,
        summaryComplete: false,
        userId: 1, // Current user
      };
      
      const response = await apiRequest('POST', '/api/meetings', meetingData);
      return response.json();
    },
    onSuccess: () => {
      // Reset form and close modal
      form.reset();
      onOpenChange(false);
      
      // Invalidate meetings cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/meetings/recent'] });
      
      toast({
        title: 'Meeting started',
        description: 'Your meeting has been created and recording will start when you join.'
      });
    },
    onError: () => {
      toast({
        title: 'Failed to create meeting',
        description: 'An error occurred while creating your meeting. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  const onSubmit = (data: FormValues) => {
    createMeetingMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary bg-opacity-10">
            <i className="fas fa-microphone text-primary"></i>
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Start New Recording</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Choose your meeting platform and set up your recording preferences.</p>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="platformType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Platform</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Webex">Webex</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Weekly Team Standup" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="autoTranscribe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-gray-900">Auto-transcribe meeting</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="autoSummarize"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-gray-900">Generate meeting summary</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="extractActionItems"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-gray-900">Extract action items</FormLabel>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-3 mt-5">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMeetingMutation.isPending}>
                {createMeetingMutation.isPending ? 'Starting...' : 'Start Recording'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
