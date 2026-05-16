import { useState } from 'react';
import { useAppStore, achievements } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { Trophy, Calendar, Lock, CheckCircle2 } from 'lucide-react';

export default function Achievements() {
  const { achievements: userAchievements } = useAppStore();
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'completion', name: '题目完成' },
    { id: 'mistakes', name: '错题' },
    { id: 'favorites', name: '收藏' },
    { id: 'streak', name: '连续学习' },
    { id: 'speed', name: '快速答题' },
    { id: 'all-rounder', name: '全能' }
  ];

  const difficultyColors = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-500 to-amber-500',
    diamond: 'from-cyan-400 to-blue-500'
  };

  const difficultyLabels = {
    bronze: '青铜',
    silver: '白银',
    gold: '黄金',
    diamond: '钻石'
  };

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const isUnlocked = (achievementId: string) =>
    userAchievements.some(a => a.achievementId === achievementId);

  const getUnlockDate = (achievementId: string) => {
    const userAch = userAchievements.find(a => a.achievementId === achievementId);
    return userAch ? new Date(userAch.unlockedAt).toLocaleDateString('zh-CN') : null;
  };

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-10 fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              成就殿堂
            </h1>
            <p className="text-gray-400 text-lg">
              解锁 {unlockedCount}/{totalCount} 个成就
            </p>
          </div>

          {/* 进度条 */}
          <div className="glass-effect rounded-2xl p-6 border border-white/10 mb-8 fade-in">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-300 font-medium">总进度</span>
              <span className="text-cyan-400 font-bold">{Math.round((unlockedCount / totalCount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-pink-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-3 mb-8 fade-in">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white'
                    : isDark
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 成就网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement, index) => {
              const unlocked = isUnlocked(achievement.id);
              const unlockDate = getUnlockDate(achievement.id);

              return (
                <div
                  key={achievement.id}
                  className={`glass-effect rounded-2xl p-6 border transition-all duration-500 hover:scale-105 fade-in ${
                    unlocked
                      ? `border-white/10 ${isDark ? '' : 'bg-white shadow-lg'}`
                      : `border-white/5 opacity-60 ${isDark ? '' : 'bg-gray-50'}`
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* 成就图标 */}
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center text-4xl ${
                    unlocked ? 'shadow-lg' : 'grayscale'
                  }`}>
                    {unlocked ? achievement.icon : <Lock className="w-10 h-10" />}
                  </div>

                  {/* 难度标签 */}
                  <div className="text-center mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${difficultyColors[achievement.difficulty]} text-white`}>
                      {difficultyLabels[achievement.difficulty]}
                    </span>
                  </div>

                  {/* 成就名称 */}
                  <h3 className={`text-xl font-bold text-center mb-2 ${
                    unlocked ? 'text-white' : 'text-gray-500'
                  }`}>
                    {achievement.name}
                  </h3>

                  {/* 成就描述 */}
                  <p className={`text-center text-sm mb-4 ${
                    unlocked ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>

                  {/* 解锁状态 */}
                  {unlocked ? (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {unlockDate}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 text-sm">
                      未解锁
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 空状态 */}
          {filteredAchievements.length === 0 && (
            <div className="text-center py-20 glass-effect rounded-2xl border border-white/10">
              <p className="text-gray-400 text-lg">暂无该分类的成就</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
