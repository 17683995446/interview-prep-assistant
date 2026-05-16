import { useAppStore } from '@/store';
import { ImportResult, ExportData } from './dataService';
import { Progress, UserAchievement, Theme, InterviewResult, DailyStudyRecord } from '@/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const importFromJSON = async (file: File): Promise<ImportResult> => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: ['文件大小超过10MB限制']
    };
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.version || !data.progress) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: ['无效的数据格式：缺少必要字段']
      };
    }
    
    const state = useAppStore.getState();
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    if (data.progress && typeof data.progress === 'object') {
      Object.entries(data.progress).forEach(([id, progress]) => {
        try {
          if (typeof progress === 'object' && progress !== null) {
            state.progress[id] = progress as Progress;
            imported++;
          } else {
            skipped++;
          }
        } catch (e) {
          errors.push(`导入题目 ${id} 失败`);
          skipped++;
        }
      });
    }
    
    if (data.favorites && Array.isArray(data.favorites)) {
      data.favorites.forEach((id: string) => {
        if (typeof id === 'string' && !state.favorites.includes(id)) {
          state.favorites.push(id);
        }
      });
    }
    
    if (data.achievements && Array.isArray(data.achievements)) {
      data.achievements.forEach((achievement: UserAchievement) => {
        if (achievement.achievementId && 
            !state.achievements.some(a => a.achievementId === achievement.achievementId)) {
          state.achievements.push(achievement);
        }
      });
    }
    
    if (data.theme) {
      if (data.theme === 'light' || data.theme === 'dark') {
        state.theme = data.theme as Theme;
      }
    }
    
    if (data.streakDays !== undefined && typeof data.streakDays === 'number') {
      if (data.streakDays > state.streakDays) {
        state.streakDays = data.streakDays;
      }
    }
    
    if (data.interviewHistory && Array.isArray(data.interviewHistory)) {
      data.interviewHistory.forEach((result: InterviewResult) => {
        if (result.id && !state.interviewHistory.some(r => r.id === result.id)) {
          state.interviewHistory.push(result);
        }
      });
    }
    
    if (data.dailyRecords && Array.isArray(data.dailyRecords)) {
      data.dailyRecords.forEach((record: DailyStudyRecord) => {
        if (record.date && !state.dailyRecords.some(r => r.date === record.date)) {
          state.dailyRecords.push(record);
        }
      });
    }
    
    return { success: true, imported, skipped, errors };
  } catch (e: any) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [`解析文件失败: ${e.message}`]
    };
  }
};

export const validateImportFile = (file: File): Promise<{ valid: boolean; error?: string }> => {
  return new Promise((resolve) => {
    if (file.size > MAX_FILE_SIZE) {
      resolve({ valid: false, error: '文件大小超过10MB限制' });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.version || !data.progress) {
          resolve({ valid: false, error: '无效的数据格式' });
          return;
        }
        resolve({ valid: true });
      } catch {
        resolve({ valid: false, error: '无法解析JSON文件' });
      }
    };
    reader.onerror = () => {
      resolve({ valid: false, error: '读取文件失败' });
    };
    reader.readAsText(file);
  });
};

export const importProgress = (data: ExportData): boolean => {
  try {
    const state = useAppStore.getState();
    
    if (data.progress) {
      Object.entries(data.progress).forEach(([id, progress]) => {
        state.progress[id] = progress;
      });
    }
    
    return true;
  } catch {
    return false;
  }
};
