export interface Dream {
  id: string;
  date: string;       // YYYY-MM-DD
  title: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface DreamForStatistics {
  id: string;
  date: Date;
  isLucid: boolean;
  isNightmare: boolean;
  tags?: string[];
  createdAt: string;
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

export enum DreamType {
  LUCID,
  NORMAL,
  NIGHTMARE
}

export interface UserProfile {
  name: string;
  email: string;
  darkMode: boolean;
}

export enum OfficialTags {
  REGULAR = 'Regular',
  LUCID = 'Lucid',
  NIGHTMARE = 'Nightmare'
}

