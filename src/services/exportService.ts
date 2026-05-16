import { useAppStore } from '@/store';
import { ExportData } from './dataService';

export const exportToJSON = async (): Promise<Blob> => {
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
  
  const json = JSON.stringify(data, null, 2);
  return new Blob([json], { type: 'application/json' });
};

export const exportToCSV = async (): Promise<Blob> => {
  const state = useAppStore.getState();
  
  const headers = ['题目ID', '题目标题', '分类', '难度', '完成状态', '尝试次数', '上次尝试'];
  const rows = Object.entries(state.progress).map(([id, progress]) => {
    const question = state.questions.find(q => q.id === id);
    return [
      id,
      question?.title || '',
      question?.category || '',
      question?.difficulty || '',
      progress.completed ? '已完成' : '未完成',
      progress.attempts,
      progress.lastAttempt
    ].join(',');
  });
  
  const csvContent = [headers.join(','), ...rows].join('\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
};

export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportProgress = async (): Promise<ExportData> => {
  const state = useAppStore.getState();
  
  return {
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
};
