import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserAchievement, InterviewResult, DailyStudyRecord } from '@/types';

type UserState = {
  achievements: UserAchievement[];
  newAchievements: string[];
  interviewHistory: InterviewResult[];
  dailyRecords: DailyStudyRecord[];
  streakDays: number;
  totalPoints: number;
  lastActiveDate: string | null;
};

type UserActions = {
  unlockAchievement: (achievementId: string) => void;
  clearNewAchievements: () => void;
  addInterviewResult: (result: InterviewResult) => void;
  addDailyRecord: (record: Omit<DailyStudyRecord, 'id' | 'date'>) => void;
  incrementPoints: (points: number) => void;
  updateStreak: () => void;
  resetUser: () => void;
  getAchievementStatus: (achievementId: string) => boolean;
  getWeeklyStats: () => { days: number; questionsSolved: number };
  getTotalStats: () => {
    interviewsCompleted: number;
    averageAccuracy: number;
    totalTimeSpent: number;
  };
};

const initialState: UserState = {
  achievements: [],
  newAchievements: [],
  interviewHistory: [],
  dailyRecords: [],
  streakDays: 0,
  totalPoints: 0,
  lastActiveDate: null,
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      unlockAchievement: (achievementId) =>
        set((state) => {
          if (state.achievements.some((a) => a.achievementId === achievementId)) {
            return state;
          }
          return {
            achievements: [
              ...state.achievements,
              {
                achievementId,
                unlockedAt: new Date().toISOString(),
              },
            ],
            newAchievements: [...state.newAchievements, achievementId],
            totalPoints: state.totalPoints + 100,
          };
        }),

      clearNewAchievements: () => set({ newAchievements: [] }),

      addInterviewResult: (result) =>
        set((state) => ({
          interviewHistory: [result, ...state.interviewHistory],
          totalPoints: state.totalPoints + result.totalCorrect * 10,
        })),

      addDailyRecord: (record) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const existingRecord = state.dailyRecords.find((r) => r.date === today);

          if (existingRecord) {
            return {
              dailyRecords: state.dailyRecords.map((r) =>
                r.date === today
                  ? {
                      ...r,
                      questionsSolved: r.questionsSolved + record.questionsSolved,
                      timeSpentMinutes: r.timeSpentMinutes + record.timeSpentMinutes,
                      accuracy:
                        ((r.accuracy * r.questionsSolved + record.accuracy * record.questionsSolved) /
                          (r.questionsSolved + record.questionsSolved || 1)),
                    }
                  : r,
              ),
            };
          }

          return {
            dailyRecords: [
              ...state.dailyRecords,
              {
                id: `record-${Date.now()}`,
                date: today,
                ...record,
              },
            ],
          };
        }),

      incrementPoints: (points) =>
        set((state) => ({
          totalPoints: state.totalPoints + points,
        })),

      updateStreak: () =>
        set((state) => {
          const today = new Date();
          const lastActive = state.lastActiveDate ? new Date(state.lastActiveDate) : null;
          
          let newStreak = state.streakDays;
          
          if (!lastActive) {
            newStreak = 1;
          } else {
            const dayDiff = Math.floor(
              (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
            );
            if (dayDiff === 1) {
              newStreak++;
            } else if (dayDiff > 1) {
              newStreak = 1;
            }
          }

          return {
            streakDays: newStreak,
            lastActiveDate: today.toISOString().split('T')[0],
          };
        }),

      resetUser: () => set(initialState),

      getAchievementStatus: (achievementId) =>
        get().achievements.some((a) => a.achievementId === achievementId),

      getWeeklyStats: () => {
        const { dailyRecords } = get();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weekRecords = dailyRecords.filter(
          (r) => new Date(r.date) >= weekAgo,
        );
        return {
          days: weekRecords.length,
          questionsSolved: weekRecords.reduce((sum, r) => sum + r.questionsSolved, 0),
        };
      },

      getTotalStats: () => {
        const { interviewHistory, dailyRecords } = get();
        return {
          interviewsCompleted: interviewHistory.length,
          averageAccuracy:
            interviewHistory.length > 0
              ? interviewHistory.reduce((sum, r) => sum + r.accuracy, 0) / interviewHistory.length
              : 0,
          totalTimeSpent: dailyRecords.reduce((sum, r) => sum + r.timeSpentMinutes, 0),
        };
      },
    }),
    {
      name: 'user-store',
    },
  ),
);
