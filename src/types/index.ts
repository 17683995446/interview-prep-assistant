export type QuestionType = 'coding' | 'choice' | 'fill';

export interface Question {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  description: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer?: string | number;
  codeTemplate?: string;
  solution: string;
  explanation: string;
  testCases?: Array<{
    input: string;
    output: string;
    description?: string;
    explanation?: string;
  }>;
}

export interface Progress {
  questionId?: string;
  completed: boolean;
  attempts: number;
  lastAttempt: string;
  completedAt?: string;
  timeSpent?: number;
  correct?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  count: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'completion' | 'mistakes' | 'favorites' | 'streak' | 'speed' | 'all-rounder';
  color: string;
  condition: (progress: any) => boolean;
  difficulty: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
}

// 模拟面试相关类型
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';
export type InterviewCategory = string | 'all';

export interface InterviewConfig {
  difficulty: DifficultyLevel;
  timeLimit: number; // 分钟
  questionCount: number;
  categories: InterviewCategory[];
}

export interface InterviewQuestion {
  question: Question;
  userAnswer?: string | number | null;
  isCorrect?: boolean;
  timeSpent?: number;
}

export interface InterviewResult {
  id: string;
  date: string;
  config: InterviewConfig;
  questions: InterviewQuestion[];
  totalTime: number;
  correctCount: number;
  totalCorrect?: number;
  totalCount: number;
  accuracy?: number;
}

export type InterviewPhase = 'welcome' | 'interview' | 'result';

// 学习数据分析相关类型
export interface DailyStudyRecord {
  id?: string;
  date: string; // YYYY-MM-DD
  questionsSolved?: number;
  questionsCompleted: number;
  timeSpent: number; // 秒
  timeSpentMinutes?: number;
  accuracy: number; // 0-1
}

export interface QuestionCompletion {
  questionId: string;
  completedAt: string;
  timeTaken: number; // 秒
  attempts: number;
  success: boolean;
}

export interface CategoryProgress {
  category: string;
  total: number;
  completed: number;
  accuracy: number;
  avgTimeTaken: number;
}

export interface Weakness {
  category: string;
  tags: string[];
  accuracy: number;
  priority: number;
}

export interface StudyReport {
  period: 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  totalQuestions: number;
  totalTime: number;
  accuracy: number;
  improvement: number; // 与上一周期对比的改进百分比
  strengths: string[];
  weaknesses: Weakness[];
  recommendations: string[];
}

// 排行榜相关类型
export interface RankUser {
  id: string;
  name: string;
  avatar: string;
  completedQuestions: number;
  accuracy: number;
  streakDays: number;
  totalPoints: number;
}

// 分享内容类型
export type ShareType = 'achievement' | 'progress' | 'interview' | 'question';

export interface ShareData {
  type: ShareType;
  title: string;
  description: string;
  image?: string;
  data?: Record<string, any>;
}

export type Theme = 'light' | 'dark';

