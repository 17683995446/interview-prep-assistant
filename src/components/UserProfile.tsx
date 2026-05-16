import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, Calendar, Award } from 'lucide-react';
import { useAppStore, achievements } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import ShareButton from './ShareButton';

export default function UserProfile() {
  const { isDark } = useTheme();
  const { 
    progress, 
    streakDays, 
    achievements: userAchievements,
    getCategoryProgress,
    dailyRecords 
  } = useAppStore();

  const completedQuestions = Object.values(progress).filter(p => p.completed).length;
  const categoryProgress = getCategoryProgress();
  const totalDays = dailyRecords.length;
  
  // 计算正确率
  const totalAttempts = Object.values(progress).reduce((sum, p) => sum + p.attempts, 0);
  const accuracy = completedQuestions > 0 
    ? Math.round((completedQuestions / Math.max(completedQuestions, totalAttempts)) * 100) 
    : 0;

  const unlockedAchievements = achievements.filter(a => 
    userAchievements.some(ua => ua.achievementId === a.id)
  );

  const shareData = {
    type: 'progress' as const,
    title: '我的学习成就',
    description: `已完成 ${completedQuestions} 道题，连续学习 ${streakDays} 天！`,
  };

  return (
    <div className="space-y-6">
      {/* 个人信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-effect rounded-2xl border p-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                刷题达人
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                持续学习，持续进步
              </p>
            </div>
          </div>
          <ShareButton shareData={shareData} />
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                已完成
              </span>
            </div>
            <div className="text-3xl font-bold text-cyan-400">{completedQuestions}</div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                正确率
              </span>
            </div>
            <div className="text-3xl font-bold text-pink-400">{accuracy}%</div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                连续天数
              </span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{streakDays}</div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                成就
              </span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{unlockedAchievements.length}</div>
          </div>
        </div>
      </motion.div>

      {/* 分类进度 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-effect rounded-2xl border p-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}
      >
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          分类进度
        </h3>
        <div className="space-y-4">
          {categoryProgress.map((cat) => {
            const percentage = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
            return (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    {cat.category}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    {cat.completed}/{cat.total}
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 最新成就 */}
      {unlockedAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`glass-effect rounded-2xl border p-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}
        >
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            最新成就
          </h3>
          <div className="flex flex-wrap gap-3">
            {unlockedAchievements.slice(-5).reverse().map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-xl border ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-slate-50 border-slate-200'
                }`}
                title={achievement.description}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  {achievement.name}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
