
export interface CalendarEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  color: string; // Tailwind bg color class
  duration: number; // in minutes
  description?: string;
  reminderType: 'none' | 'minutes' | 'hours' | 'days';
  reminderValue: number;
}

export interface ExtractedEvent {
  name: string;
  date: string;
  time: string;
  location: string;
  color: string;
  duration: number;
  description: string;
  reminderType?: 'none' | 'minutes' | 'hours' | 'days';
  reminderValue?: number;
}

export enum ViewMode {
  MONTH = 'MONTH',
  WEEK = 'WEEK',
  DAY = 'DAY'
}
