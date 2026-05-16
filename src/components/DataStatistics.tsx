import { useMemo } from 'react';
import { useAppStore } from '@/store';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
}

const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => (
  <div className={`card bg-base-200 shadow-xl`}>
    <div className="card-body p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base-content/60 text-sm">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-base-content/50 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-4xl ${color}`}>{icon}</div>
      </div>
    </div>
  </div>
);

export const DataStatistics = () => {
  const { questions, progress, favorites, achievements, streakDays, questionCompletions } = useAppStore();
  
  const stats = useMemo(() => {
    const totalQuestions = questions.length;
    const completedQuestions = Object.values(progress).filter(p => p.completed).length;
    const totalAttempts = Object.values(progress).reduce((sum, p) => sum + p.attempts, 0);
    const favoriteQuestions = favorites.length;
    const earnedAchievements = achievements.length;
    const totalAchievements = 10;
    
    const successCompletions = questionCompletions.filter(c => c.success).length;
    const totalCompletions = questionCompletions.length;
    const accuracy = totalCompletions > 0 ? (successCompletions / totalCompletions * 100).toFixed(1) : '0';
    const avgAttempts = completedQuestions > 0 ? (totalAttempts / completedQuestions).toFixed(1) : '0';
    
    return {
      totalQuestions,
      completedQuestions,
      completionRate: totalQuestions > 0 ? (completedQuestions / totalQuestions * 100).toFixed(1) : '0',
      totalAttempts,
      avgAttempts,
      favoriteQuestions,
      earnedAchievements,
      totalAchievements,
      achievementRate: totalAchievements > 0 ? (earnedAchievements / totalAchievements * 100).toFixed(0) : '0',
      accuracy,
      streakDays,
      totalCompletions
    };
  }, [questions, progress, favorites, achievements, streakDays, questionCompletions]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatCard
        title="总题目数"
        value={stats.totalQuestions}
        icon="📚"
        color="text-blue-500"
      />
      <StatCard
        title="已完成"
        value={stats.completedQuestions}
        subtitle={`完成率: ${stats.completionRate}%`}
        icon="✅"
        color="text-green-500"
      />
      <StatCard
        title="总尝试次数"
        value={stats.totalAttempts}
        subtitle={`平均: ${stats.avgAttempts}次/题`}
        icon="🎯"
        color="text-orange-500"
      />
      <StatCard
        title="准确率"
        value={`${stats.accuracy}%`}
        subtitle={`共 ${stats.totalCompletions} 次答题`}
        icon="📊"
        color="text-purple-500"
      />
      <StatCard
        title="收藏题目"
        value={stats.favoriteQuestions}
        icon="⭐"
        color="text-yellow-500"
      />
      <StatCard
        title="获得成就"
        value={`${stats.earnedAchievements}/${stats.totalAchievements}`}
        subtitle={`${stats.achievementRate}%`}
        icon="🏆"
        color="text-amber-500"
      />
      <StatCard
        title="连续学习"
        value={`${stats.streakDays}天`}
        icon="🔥"
        color="text-red-500"
      />
    </div>
  );
};

export default DataStatistics;
