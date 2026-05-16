import { Progress, UserAchievement, DailyStudyRecord, InterviewResult, Theme } from '@/types';

export interface ExportData {
  version: string;
  exportDate: string;
  progress: Record<string, Progress>;
  favorites: string[];
  achievements: UserAchievement[];
  theme: Theme;
  streakDays: number;
  interviewHistory: InterviewResult[];
  dailyRecords: DailyStudyRecord[];
}

export interface FullExport extends ExportData {
  questionCompletions?: any[];
}

export interface Favorite {
  questionId: string;
  addedAt: string;
}

export interface Achievement {
  achievementId: string;
  unlockedAt: string;
}

export interface Backup {
  id: string;
  date: string;
  size: number;
  data: ExportData;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

export interface DataService {
  exportProgress(): Promise<ExportData>;
  exportFavorites(): Promise<Favorite[]>;
  exportAchievements(): Promise<Achievement[]>;
  exportAll(): Promise<FullExport>;
  
  importProgress(data: ExportData): Promise<boolean>;
  importFavorites(data: Favorite[]): Promise<boolean>;
  importAll(data: FullExport): Promise<ImportResult>;
  
  createBackup(): Promise<Backup>;
  restoreBackup(backup: Backup): Promise<boolean>;
  listBackups(): Promise<Backup[]>;
  deleteBackup(id: string): Promise<boolean>;
}
