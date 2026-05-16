import { useAppStore } from '@/store';
import { Backup, ExportData } from './dataService';

const BACKUP_KEY = 'interview-prep-backups';
const MAX_BACKUPS = 10;

const getBackups = (): Backup[] => {
  const stored = localStorage.getItem(BACKUP_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const createBackup = async (): Promise<Backup> => {
  const state = useAppStore.getState();
  
  const data: ExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    progress: state.progress,
    favorites: state.favorites,
    achievements: state.achievements,
    theme: state.theme,
    streakDays: state.streakDays,
    interviewHistory: state.interviewHistory,
    dailyRecords: state.dailyRecords
  };
  
  const backup: Backup = {
    id: `backup-${Date.now()}`,
    date: new Date().toISOString(),
    size: new Blob([JSON.stringify(data)]).size,
    data
  };
  
  const backups = getBackups();
  backups.unshift(backup);
  
  if (backups.length > MAX_BACKUPS) {
    backups.pop();
  }
  
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
  
  return backup;
};

export const listBackups = (): Backup[] => {
  return getBackups();
};

export const restoreBackup = (backupId: string): boolean => {
  const backups = getBackups();
  const backup = backups.find(b => b.id === backupId);
  
  if (!backup) return false;
  
  const state = useAppStore.getState();
  const data = backup.data;
  
  if (data.progress) {
    state.progress = data.progress;
  }
  if (data.favorites) {
    state.favorites = data.favorites;
  }
  if (data.achievements) {
    state.achievements = data.achievements;
  }
  if (data.theme) {
    state.theme = data.theme;
  }
  if (data.streakDays !== undefined) {
    state.streakDays = data.streakDays;
  }
  
  return true;
};

export const deleteBackup = (backupId: string): boolean => {
  const backups = getBackups();
  const filtered = backups.filter(b => b.id !== backupId);
  
  if (filtered.length === backups.length) return false;
  
  localStorage.setItem(BACKUP_KEY, JSON.stringify(filtered));
  return true;
};

export const deleteAllBackups = (): void => {
  localStorage.removeItem(BACKUP_KEY);
};

export const getBackupInfo = (backupId: string): Backup | null => {
  const backups = getBackups();
  return backups.find(b => b.id === backupId) || null;
};

export const exportBackupToFile = (backupId: string): boolean => {
  const backup = getBackupInfo(backupId);
  if (!backup) return false;
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-${new Date(backup.date).toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return true;
};

export const importBackupFromFile = async (file: File): Promise<{ success: boolean; error?: string }> => {
  try {
    const text = await file.text();
    const backup = JSON.parse(text) as Backup;
    
    if (!backup.id || !backup.date || !backup.data) {
      return { success: false, error: '无效的备份文件格式' };
    }
    
    const backups = getBackups();
    const existingIndex = backups.findIndex(b => b.id === backup.id);
    
    if (existingIndex >= 0) {
      backups[existingIndex] = backup;
    } else {
      backups.unshift(backup);
      if (backups.length > MAX_BACKUPS) {
        backups.pop();
      }
    }
    
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
    
    return { success: true };
  } catch (e: any) {
    return { success: false, error: `导入失败: ${e.message}` };
  }
};
