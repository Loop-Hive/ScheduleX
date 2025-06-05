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
}

export interface SelectedDayCard {
  time: string;
  card: CardInterface[];
}
