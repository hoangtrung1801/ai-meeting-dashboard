import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NewMeetingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
    meetingId: z
        .string()
        .min(3, { message: "Meeting ID must be at least 3 characters" }),
    botId: z.string().min(1, { message: "Please select a bot" }),
    isRecording: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function NewMeetingModal({ open, onOpenChange }: NewMeetingModalProps) {
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            meetingId: "",
            botId: "",
            isRecording: true,
        },
    });

    const createMeetingMutation = useMutation({
        mutationFn: async (data: FormValues) => {
            // Prepare meeting data
            const meetingData = {
                botId: data.botId,
                userId: 1, // Current user
                status: "pending",
                meetingId: data.meetingId,
                isRecording: data.isRecording,
                transcription: "",
                summarization: "",
                outputUrl: "",
            };

            const response = await apiRequest(
                "POST",
                "/api/meetings",
                meetingData
            );
            return response.json();
        },
        onSuccess: () => {
            // Reset form and close modal
            form.reset();
            onOpenChange(false);

            // Invalidate meetings cache to refresh data
            queryClient.invalidateQueries({
                queryKey: ["/api/meetings/recent"],
            });

            toast({
                title: "Meeting started",
                description:
                    "Your meeting has been created and recording will start when you join.",
            });
        },
        onError: () => {
            toast({
                title: "Failed to create meeting",
                description:
                    "An error occurred while creating your meeting. Please try again.",
                variant: "destructive",
            });
        },
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
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Start New Recording
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Set up your meeting recording preferences.
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="meetingId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meeting ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter meeting ID"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="botId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bot ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter bot ID"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isRecording"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={field.onChange}
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                    </FormControl>
                                    <FormLabel className="text-sm text-gray-900">
                                        Enable recording
                                    </FormLabel>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-3 mt-5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMeetingMutation.isPending}
                            >
                                {createMeetingMutation.isPending
                                    ? "Starting..."
                                    : "Start Recording"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
