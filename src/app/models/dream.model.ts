export interface Dream {
  id: string;
  date: string;       // YYYY-MM-DD
  title: string;
  description?: string;
  audioPath?: string;
  type: 'good' | 'bad'; // Tipo de sueño: bueno o malo
  favorite?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface DreamStatistics {
  streakDays: number;
  totalDreams: number;
  goodDreams: number;
  badDreams: number;
}

export interface DreamsByDate {
  [date: string]: Dream[];
}

export interface UserProfile {
  name: string;
  email: string;
  darkMode: boolean;
}
