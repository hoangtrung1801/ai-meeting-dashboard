import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  
  // Check if today
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (d.toDateString() === today.toDateString()) {
    return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit' 
    });
  }
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

export function formatTimeRange(date: Date | string, durationMinutes: number): string {
  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
  // If today or tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let datePrefix = '';
  
  if (startDate.toDateString() === today.toDateString()) {
    datePrefix = 'Today, ';
  } else if (startDate.toDateString() === tomorrow.toDateString()) {
    datePrefix = 'Tomorrow, ';
  } else {
    datePrefix = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + ', ';
  }
  
  return `${datePrefix}${startTime} - ${endTime}`;
}

export function getRelativeDueDate(date: Date | string | undefined): { text: string; status: 'overdue' | 'due-soon' | 'upcoming' } {
  if (!date) {
    return { text: 'No due date', status: 'upcoming' };
  }
  
  const dueDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  if (dueDate < today) {
    return { text: 'Overdue', status: 'overdue' };
  } else if (dueDate.toDateString() === today.toDateString()) {
    return { text: 'Due Today', status: 'due-soon' };
  } else if (dueDate.toDateString() === tomorrow.toDateString()) {
    return { text: 'Due Tomorrow', status: 'due-soon' };
  } else if (dueDate < threeDaysFromNow) {
    const days = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { text: `Due in ${days} days`, status: 'upcoming' };
  } else {
    return { 
      text: `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, 
      status: 'upcoming' 
    };
  }
}

export function getPlatformIcon(platform: string): string {
  const lowerPlatform = platform.toLowerCase();
  
  if (lowerPlatform.includes('zoom')) {
    return 'fab fa-zoom';
  } else if (lowerPlatform.includes('teams') || lowerPlatform.includes('microsoft')) {
    return 'fab fa-microsoft';
  } else if (lowerPlatform.includes('google') || lowerPlatform.includes('meet')) {
    return 'fab fa-google';
  } else if (lowerPlatform.includes('webex')) {
    return 'fas fa-video';
  } else {
    return 'fas fa-video';
  }
}
