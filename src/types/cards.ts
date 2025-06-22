export interface Slots {
  start: string;
  end: string;
  // room string or null
  roomName: string | null;
}

export interface Days {
  mon: Slots[];
  tue: Slots[];
  wed: Slots[];
  thu: Slots[];
  fri: Slots[];
  sat: Slots[];
  sun: Slots[];
}
export interface Markings {
  id: number;
  date: string;
  isPresent: boolean;
  timeSlot?: string; // Optional time slot info for multiple slots per day
}

export interface CardInterface {
  id: number;
  title: string;
  present: number;
  total: number;
  target_percentage: number;
  tagColor: string;
  days: Days;
  markedAt: Markings[];
  hasLimit: boolean;
  limit: number;
  limitType: string; // with-absent, without-absent
  defaultClassroom?: string; // Default classroom when no slots exist
}

export interface SelectedDayCard {
  time: string;
  card: CardInterface[];
}

export interface AiCardInterface {
  title: string;
  days: Days;
  target_percentage?: number;
  tagColor?: string;
}
