import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question, Progress, Achievement, UserAchievement, InterviewResult, DailyStudyRecord, QuestionCompletion, CategoryProgress, Weakness, StudyReport, RankUser } from '@/types';
import { questions } from '@/data/questions';

// 模拟排行榜数据
const mockRankUsers: RankUser[] = [
  {
    id: 'user-1',
    name: '码神小李',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
    completedQuestions: 248,
    accuracy: 0.92,
    streakDays: 45,
    totalPoints: 12500
  },
  {
    id: 'user-2',
    name: '算法大师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    completedQuestions: 235,
    accuracy: 0.88,
    streakDays: 38,
    totalPoints: 11800
  },
  {
    id: 'user-3',
    name: 'AI 探索者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    completedQuestions: 210,
    accuracy: 0.85,
    streakDays: 32,
    totalPoints: 10500
  },
  {
    id: 'user-4',
    name: '代码诗人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    completedQuestions: 189,
    accuracy: 0.82,
    streakDays: 28,
    totalPoints: 9450
  },
  {
    id: 'user-5',
    name: '刷题狂人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    completedQuestions: 175,
    accuracy: 0.79,
    streakDays: 25,
    totalPoints: 8750
  },
  {
    id: 'user-6',
    name: '技术栈',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie',
    completedQuestions: 156,
    accuracy: 0.77,
    streakDays: 22,
    totalPoints: 7800
  },
  {
    id: 'user-7',
    name: '全栈工程师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor',
    completedQuestions: 142,
    accuracy: 0.75,
    streakDays: 19,
    totalPoints: 7100
  },
  {
    id: 'user-8',
    name: '数据科学家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan',
    completedQuestions: 128,
    accuracy: 0.73,
    streakDays: 16,
    totalPoints: 6400
  },
  {
    id: 'user-9',
    name: '架构师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
    completedQuestions: 115,
    accuracy: 0.71,
    streakDays: 14,
    totalPoints: 5750
  },
  {
    id: 'user-10',
    name: '开发达人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley',
    completedQuestions: 98,
    accuracy: 0.68,
    streakDays: 12,
    totalPoints: 4900
  }
];

// 定义成就列表
export const achievements: Achievement[] = [
  {
    id: 'first-question',
    name: '初出茅庐',
    description: '完成第1道题目',
    icon: '🎯',
    category: 'completion',
    color: 'from-green-500 to-emerald-600',
    condition: (data: any) => data.completedCount >= 1,
    difficulty: 'bronze'
  },
  {
    id: 'ten-questions',
    name: '小有所成',
    description: '完成10道题目',
    icon: '🏅',
    category: 'completion',
    color: 'from-yellow-500 to-orange-600',
    condition: (data: any) => data.completedCount >= 10,
    difficulty: 'bronze'
  },
  {
    id: 'fifty-questions',
    name: '登堂入室',
    description: '完成50道题目',
    icon: '🥇',
    category: 'completion',
    color: 'from-blue-500 to-indigo-600',
    condition: (data: any) => data.completedCount >= 50,
    difficulty: 'silver'
  },
  {
    id: 'hundred-questions',
    name: '登峰造极',
    description: '完成100道题目',
    icon: '👑',
    category: 'completion',
    color: 'from-purple-500 to-pink-600',
    condition: (data: any) => data.completedCount >= 100,
    difficulty: 'gold'
  },
  {
    id: 'two-hundred-questions',
    name: '学富五车',
    description: '完成200道题目',
    icon: '📚',
    category: 'completion',
    color: 'from-red-500 to-rose-600',
    condition: (data: any) => data.completedCount >= 200,
    difficulty: 'diamond'
  },
  {
    id: 'mistake-fixer',
    name: '错题克星',
    description: '完成错题本所有题目',
    icon: '🛠️',
    category: 'mistakes',
    color: 'from-cyan-500 to-teal-600',
    condition: (data: any) => data.incorrectCount === 0 && data.hasAttempted,
    difficulty: 'silver'
  },
  {
    id: 'fifty-favorites',
    name: '收藏达人',
    description: '收藏50道题目',
    icon: '⭐',
    category: 'favorites',
    color: 'from-amber-500 to-yellow-600',
    condition: (data: any) => data.favoritesCount >= 50,
    difficulty: 'silver'
  },
  {
    id: 'seven-day-streak',
    name: '连续学习',
    description: '连续7天学习',
    icon: '🔥',
    category: 'streak',
    color: 'from-orange-500 to-red-600',
    condition: (data: any) => data.streakDays >= 7,
    difficulty: 'gold'
  },
  {
    id: 'speed-demon',
    name: '快速答题',
    description: '1分钟内完成题目',
    icon: '⚡',
    category: 'speed',
    color: 'from-pink-500 to-fuchsia-600',
    condition: (data: any) => data.hasFastCompletion,
    difficulty: 'bronze'
  },
  {
    id: 'all-rounder',
    name: '全能战士',
    description: '完成所有分类至少1题',
    icon: '🌟',
    category: 'all-rounder',
    color: 'from-violet-500 to-purple-600',
    condition: (data: any) => data.hasAllCategories,
    difficulty: 'gold'
  }
];

type Theme = 'light' | 'dark';

interface AppState {
  questions: Question[];
  progress: Record<string, Progress>;
  currentFilter: {
    category: string | null;
    difficulty: string | null;
    search: string;
  };
  favorites: string[];
  theme: Theme;
  achievements: UserAchievement[];
  newAchievements: string[];
  streakDays: number;
  lastStudyDate: string | null;
  hasFastCompletion: boolean;
  // 模拟面试相关状态
  interviewHistory: InterviewResult[];
  // 学习数据分析相关状态
  dailyRecords: DailyStudyRecord[];
  questionCompletions: QuestionCompletion[];
  // 排行榜相关状态
  rankUsers: RankUser[];
  currentUserRank: RankUser | null;
  setFilter: (filter: { category?: string | null; difficulty?: string | null; search?: string }) => void;
  toggleFavorite: (questionId: string) => void;
  markCompleted: (questionId: string, timeTaken?: number, success?: boolean) => void;
  incrementAttempts: (questionId: string) => void;
  toggleTheme: () => void;
  unlockAchievement: (achievementId: string) => void;
  clearNewAchievements: () => void;
  checkAchievements: () => void;
  saveInterviewResult: (result: InterviewResult) => void;
  // 学习数据分析方法
  getDailyRecords: (startDate?: string, endDate?: string) => DailyStudyRecord[];
  getCategoryProgress: () => CategoryProgress[];
  getWeaknesses: () => Weakness[];
  getStudyReport: (period: 'week' | 'month' | 'year') => StudyReport;
  getRecommendedQuestions: (count?: number) => Question[];
  // 排行榜方法
  getRankings: (sortBy?: 'completed' | 'accuracy' | 'streak' | 'points') => RankUser[];
  getCurrentUserRank: () => RankUser;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      questions,
      progress: {},
      currentFilter: { category: null, difficulty: null, search: '' },
      favorites: [],
      theme: 'dark',
      achievements: [],
      newAchievements: [],
      streakDays: 0,
      lastStudyDate: null,
      hasFastCompletion: false,
      interviewHistory: [],
      dailyRecords: [],
      questionCompletions: [],
      // 排行榜初始状态
      rankUsers: mockRankUsers,
      currentUserRank: null,
      
      setFilter: (filter) => 
        set((state) => ({
          currentFilter: { ...state.currentFilter, ...filter }
        })),
      
      toggleFavorite: (questionId) => {
        set((state) => {
          const isFavorited = state.favorites.includes(questionId);
          return {
            favorites: isFavorited
              ? state.favorites.filter(id => id !== questionId)
              : [...state.favorites, questionId]
          };
        });
        setTimeout(() => get().checkAchievements(), 100);
      },
      
      markCompleted: (questionId, timeTaken = 0, success = true) =>
        set((state) => {
          const now = new Date();
          const todayStr = now.toDateString();
          const todayDateStr = now.toISOString().split('T')[0];
          
          // 更新连续学习天数
          let newStreakDays = state.streakDays;
          let newLastStudyDate = state.lastStudyDate;
          
          if (state.lastStudyDate) {
            const lastDate = new Date(state.lastStudyDate);
            const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              newStreakDays += 1;
            } else if (diffDays > 1) {
              newStreakDays = 1;
            }
          } else {
            newStreakDays = 1;
          }
          
          newLastStudyDate = todayStr;
          
          // 检查快速答题
          let newHasFastCompletion = state.hasFastCompletion;
          if (timeTaken && timeTaken <= 60) {
            newHasFastCompletion = true;
          }
          
          // 更新每日学习记录
          const newDailyRecords = [...state.dailyRecords];
          const todayRecordIndex = newDailyRecords.findIndex(r => r.date === todayDateStr);
          
          if (todayRecordIndex >= 0) {
            newDailyRecords[todayRecordIndex] = {
              ...newDailyRecords[todayRecordIndex],
              questionsCompleted: newDailyRecords[todayRecordIndex].questionsCompleted + 1,
              timeSpent: newDailyRecords[todayRecordIndex].timeSpent + timeTaken,
              accuracy: success 
                ? ((newDailyRecords[todayRecordIndex].accuracy * newDailyRecords[todayRecordIndex].questionsCompleted) + 1) / (newDailyRecords[todayRecordIndex].questionsCompleted + 1)
                : (newDailyRecords[todayRecordIndex].accuracy * newDailyRecords[todayRecordIndex].questionsCompleted) / (newDailyRecords[todayRecordIndex].questionsCompleted + 1)
            };
          } else {
            newDailyRecords.push({
              date: todayDateStr,
              questionsCompleted: 1,
              timeSpent: timeTaken,
              accuracy: success ? 1 : 0
            });
          }
          
          // 更新题目完成记录
          const newQuestionCompletions = [...state.questionCompletions, {
            questionId,
            completedAt: now.toISOString(),
            timeTaken,
            attempts: state.progress[questionId]?.attempts || 0,
            success
          }];
          
          return {
            progress: {
              ...state.progress,
              [questionId]: {
                ...state.progress[questionId],
                questionId,
                completed: true,
                attempts: state.progress[questionId]?.attempts || 0,
                lastAttempt: now.toISOString()
              }
            },
            streakDays: newStreakDays,
            lastStudyDate: newLastStudyDate,
            hasFastCompletion: newHasFastCompletion,
            dailyRecords: newDailyRecords,
            questionCompletions: newQuestionCompletions
          };
        }),
      
      incrementAttempts: (questionId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [questionId]: {
              ...state.progress[questionId],
              questionId,
              completed: state.progress[questionId]?.completed || false,
              attempts: (state.progress[questionId]?.attempts || 0) + 1,
              lastAttempt: new Date().toISOString()
            }
          }
        })),
      
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        })),
        
      unlockAchievement: (achievementId) =>
        set((state) => {
          const alreadyUnlocked = state.achievements.some(a => a.achievementId === achievementId);
          if (alreadyUnlocked) return {};
          
          return {
            achievements: [
              ...state.achievements,
              {
                achievementId,
                unlockedAt: new Date().toISOString()
              }
            ],
            newAchievements: [...state.newAchievements, achievementId]
          };
        }),
        
      clearNewAchievements: () =>
        set(() => ({
          newAchievements: []
        })),
        
      checkAchievements: () => {
        const state = get();
        
        // 计算成就条件数据
        const completedCount = Object.values(state.progress).filter(p => p.completed).length;
        const incorrectCount = questions.filter(q => {
          const p = state.progress[q.id];
          return p && p.attempts > 0 && !p.completed;
        }).length;
        const hasAttempted = Object.values(state.progress).some(p => p.attempts > 0);
        const favoritesCount = state.favorites.length;
        
        // 检查是否完成所有分类
        const categories = [...new Set(questions.map(q => q.category))];
        const completedCategories = new Set<string>();
        Object.entries(state.progress).forEach(([id, p]) => {
          if (p.completed) {
            const q = questions.find(question => question.id === id);
            if (q) {
              completedCategories.add(q.category);
            }
          }
        });
        const hasAllCategories = categories.every(cat => completedCategories.has(cat));
        
        const data = {
          completedCount,
          incorrectCount,
          hasAttempted,
          favoritesCount,
          streakDays: state.streakDays,
          hasFastCompletion: state.hasFastCompletion,
          hasAllCategories
        };
        
        // 检查每个成就
        achievements.forEach(achievement => {
          if (!state.achievements.some(a => a.achievementId === achievement.id)) {
            if (achievement.condition(data)) {
              get().unlockAchievement(achievement.id);
            }
          }
        });
      },
      
      saveInterviewResult: (result) =>
        set((state) => ({
          interviewHistory: [result, ...state.interviewHistory]
        })),
      
      // 学习数据分析方法实现
      getDailyRecords: (startDate, endDate) => {
        const state = get();
        let records = [...state.dailyRecords];
        
        if (startDate) {
          records = records.filter(r => r.date >= startDate);
        }
        if (endDate) {
          records = records.filter(r => r.date <= endDate);
        }
        
        return records.sort((a, b) => a.date.localeCompare(b.date));
      },
      
      getCategoryProgress: () => {
        const state = get();
        const categories = [...new Set(state.questions.map(q => q.category))];
        
        return categories.map(category => {
          const categoryQuestions = state.questions.filter(q => q.category === category);
          const completedQuestions = categoryQuestions.filter(q => state.progress[q.id]?.completed);
          const completions = state.questionCompletions.filter(c => 
            categoryQuestions.some(q => q.id === c.questionId)
          );
          
          const total = categoryQuestions.length;
          const completed = completedQuestions.length;
          const accuracy = completions.length > 0 
            ? completions.filter(c => c.success).length / completions.length 
            : 0;
          const avgTimeTaken = completions.length > 0 
            ? completions.reduce((sum, c) => sum + c.timeTaken, 0) / completions.length 
            : 0;
          
          return {
            category,
            total,
            completed,
            accuracy,
            avgTimeTaken
          };
        });
      },
      
      getWeaknesses: () => {
        const state = get();
        const categoryProgress = state.getCategoryProgress();
        const tagStats: Record<string, { total: number; success: number }> = {};
        
        // 统计标签级别的表现
        state.questionCompletions.forEach(completion => {
          const question = state.questions.find(q => q.id === completion.questionId);
          if (question) {
            question.tags.forEach(tag => {
              if (!tagStats[tag]) {
                tagStats[tag] = { total: 0, success: 0 };
              }
              tagStats[tag].total++;
              if (completion.success) {
                tagStats[tag].success++;
              }
            });
          }
        });
        
        const weaknesses: Weakness[] = [];
        
        // 找出准确率低的分类和标签
        categoryProgress.forEach(cp => {
          if (cp.completed > 0 && cp.accuracy < 0.7) {
            const categoryTags = [...new Set(
              state.questions
                .filter(q => q.category === cp.category)
                .flatMap(q => q.tags)
            )];
            
            const weakTags = categoryTags.filter(tag => {
              const stats = tagStats[tag];
              return stats && stats.total > 0 && stats.success / stats.total < 0.7;
            });
            
            weaknesses.push({
              category: cp.category,
              tags: weakTags,
              accuracy: cp.accuracy,
              priority: (1 - cp.accuracy) * (cp.completed / cp.total)
            });
          }
        });
        
        return weaknesses.sort((a, b) => b.priority - a.priority);
      },
      
      getStudyReport: (period) => {
        const state = get();
        const now = new Date();
        const startDate = new Date();
        
        if (period === 'week') {
          startDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else {
          startDate.setFullYear(now.getFullYear() - 1);
        }
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = now.toISOString().split('T')[0];
        
        const records = state.getDailyRecords(startDateStr, endDateStr);
        const completions = state.questionCompletions.filter(c => 
          c.completedAt >= startDate.toISOString()
        );
        
        const totalQuestions = completions.length;
        const totalTime = records.reduce((sum, r) => sum + r.timeSpent, 0);
        const accuracy = completions.length > 0 
          ? completions.filter(c => c.success).length / completions.length 
          : 0;
        
        // 计算上一周期的数据用于对比
        const prevStartDate = new Date(startDate);
        const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;
        prevStartDate.setDate(prevStartDate.getDate() - periodDays);
        
        const prevCompletions = state.questionCompletions.filter(c => 
          c.completedAt >= prevStartDate.toISOString() && c.completedAt < startDate.toISOString()
        );
        
        const prevAccuracy = prevCompletions.length > 0 
          ? prevCompletions.filter(c => c.success).length / prevCompletions.length 
          : 0;
        const improvement = prevAccuracy > 0 ? (accuracy - prevAccuracy) / prevAccuracy * 100 : 0;
        
        // 找出优势和劣势
        const categoryProgress = state.getCategoryProgress();
        const strengths = categoryProgress
          .filter(cp => cp.accuracy >= 0.8 && cp.completed > 0)
          .map(cp => cp.category);
        
        const weaknesses = state.getWeaknesses();
        
        const recommendations: string[] = [];
        if (weaknesses.length > 0) {
          recommendations.push(`建议重点复习 ${weaknesses[0].category} 相关题目`);
          if (weaknesses[0].tags.length > 0) {
            recommendations.push(`特别关注以下知识点：${weaknesses[0].tags.slice(0, 3).join('、')}`);
          }
        }
        if (accuracy < 0.7) {
          recommendations.push('整体准确率有待提高，建议多做练习题');
        }
        if (records.length < periodDays / 2) {
          recommendations.push('建议保持每日学习习惯');
        }
        
        return {
          period,
          startDate: startDateStr,
          endDate: endDateStr,
          totalQuestions,
          totalTime,
          accuracy,
          improvement,
          strengths,
          weaknesses,
          recommendations
        };
      },
      
      getRecommendedQuestions: (count = 10) => {
        const state = get();
        const weaknesses = state.getWeaknesses();
        const recommended: Question[] = [];
        const usedIds = new Set<string>();

        // 1. 优先推荐薄弱分类的未完成题目
        weaknesses.forEach(weakness => {
          const questions = state.questions.filter(q => 
            q.category === weakness.category && 
            !state.progress[q.id]?.completed &&
            !usedIds.has(q.id)
          );

          // 优先推荐有薄弱标签的题目
          const tagPriorityQuestions = questions.filter(q => 
            q.tags.some(tag => weakness.tags.includes(tag))
          );

          tagPriorityQuestions.slice(0, Math.ceil(count / weaknesses.length)).forEach(q => {
            recommended.push(q);
            usedIds.add(q.id);
          });
        });

        // 2. 推荐需要复习的旧题目（已完成但很久之前的）
        const completedQuestions = state.questions.filter(q => 
          state.progress[q.id]?.completed && 
          !usedIds.has(q.id)
        );

        const sortedCompleted = completedQuestions.sort((a, b) => {
          const aDate = new Date(state.progress[a.id]!.lastAttempt);
          const bDate = new Date(state.progress[b.id]!.lastAttempt);
          return aDate.getTime() - bDate.getTime();
        });

        sortedCompleted.slice(0, Math.ceil(count / 3)).forEach(q => {
          recommended.push(q);
          usedIds.add(q.id);
        });

        // 3. 填充剩余名额，推荐未完成的题目
        const remainingQuestions = state.questions.filter(q => 
          !state.progress[q.id]?.completed && 
          !usedIds.has(q.id)
        );

        // 随机打乱
        for (let i = remainingQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remainingQuestions[i], remainingQuestions[j]] = [remainingQuestions[j], remainingQuestions[i]];
        }

        remainingQuestions.slice(0, count - recommended.length).forEach(q => {
          recommended.push(q);
        });

        return recommended.slice(0, count);
      },

      // 排行榜方法实现
      getRankings: (sortBy = 'points') => {
        const state = get();
        const users = [...state.rankUsers];
        
        switch (sortBy) {
          case 'completed':
            return users.sort((a, b) => b.completedQuestions - a.completedQuestions);
          case 'accuracy':
            return users.sort((a, b) => b.accuracy - a.accuracy);
          case 'streak':
            return users.sort((a, b) => b.streakDays - a.streakDays);
          case 'points':
          default:
            return users.sort((a, b) => b.totalPoints - a.totalPoints);
        }
      },

      getCurrentUserRank: () => {
        const state = get();
        const completedCount = Object.values(state.progress).filter(p => p.completed).length;
        const completions = state.questionCompletions;
        const accuracy = completions.length > 0 
          ? completions.filter(c => c.success).length / completions.length 
          : 0.7;
        
        const currentUser: RankUser = {
          id: 'current-user',
          name: '我',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
          completedQuestions: completedCount,
          accuracy: accuracy,
          streakDays: state.streakDays,
          totalPoints: completedCount * 50 + state.streakDays * 10
        };

        return currentUser;
      }
    }),
    {
      name: 'interview-prep-storage'
    }
  )
);

// Selector hooks for derived state
export const useFilteredQuestions = () => {
  const { questions, currentFilter } = useAppStore();
  return questions.filter(q => {
    const categoryMatch = !currentFilter.category || q.category === currentFilter.category;
    const difficultyMatch = !currentFilter.difficulty || q.difficulty === currentFilter.difficulty;
    
    const searchMatch = !currentFilter.search || 
      q.title.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
      q.description.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
      q.tags.some(tag => tag.toLowerCase().includes(currentFilter.search.toLowerCase()));
    
    return categoryMatch && difficultyMatch && searchMatch;
  });
};

export const useFavoriteQuestions = () => {
  const { questions, favorites } = useAppStore();
  return questions.filter(q => favorites.includes(q.id));
};

export const useIncorrectQuestions = () => {
  const { questions, progress } = useAppStore();
  return questions.filter(q => {
    const questionProgress = progress[q.id];
    return questionProgress && questionProgress.attempts > 0 && !questionProgress.completed;
  });
};

export const useProgressStats = () => {
  const { questions, progress } = useAppStore();
  const total = questions.length;
  const completed = Object.values(progress).filter(p => p.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percentage };
};
