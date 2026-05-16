import { useState, useMemo } from 'react';
import { Trophy, Users, TrendingUp, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import ParticlesBackground from '@/components/ParticlesBackground';
import { useAppStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { RankUser } from '@/types';

type SortOption = 'points' | 'completed' | 'accuracy' | 'streak';

export default function Ranking() {
  const [sortBy, setSortBy] = useState<SortOption>('points');
  const { isDark } = useTheme();
  const { getRankings, getCurrentUserRank } = useAppStore();

  const rankings = useMemo(() => getRankings(sortBy), [getRankings, sortBy]);
  const currentUser = getCurrentUserRank();

  // 合并当前用户到排行榜并计算排名
  const allUsers = useMemo(() => {
    const users = [...rankings];
    const existingIndex = users.findIndex(u => u.id === 'current-user');
    if (existingIndex >= 0) {
      users.splice(existingIndex, 1);
    }
    users.push(currentUser);
    
    // 根据排序方式重新排序
    users.sort((a, b) => {
      switch (sortBy) {
        case 'completed':
          return b.completedQuestions - a.completedQuestions;
        case 'accuracy':
          return b.accuracy - a.accuracy;
        case 'streak':
          return b.streakDays - a.streakDays;
        case 'points':
        default:
          return b.totalPoints - a.totalPoints;
      }
    });
    
    return users;
  }, [rankings, currentUser, sortBy]);

  const currentUserRank = allUsers.findIndex(u => u.id === 'current-user') + 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Trophy className="w-5 h-5 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/30">
            <Trophy className="w-5 h-5 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-600/30">
            <Trophy className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            isDark ? 'bg-white/10 text-gray-400' : 'bg-slate-200 text-slate-600'
          }`}>
            {rank}
          </div>
        );
    }
  };

  const sortOptions = [
    { value: 'points', label: '总积分', icon: TrendingUp },
    { value: 'completed', label: '完成题目', icon: Target },
    { value: 'accuracy', label: '正确率', icon: Award },
    { value: 'streak', label: '连续天数', icon: Trophy },
  ];

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-12 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-500/30 mb-4">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">社区排行榜</span>
            </div>
            <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              超越自我，勇攀高峰
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              与来自全国各地的刷题达人一起进步
            </p>
          </div>

          {/* 当前用户排名卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-6 rounded-2xl glass-effect border ${
              isDark 
                ? 'bg-gradient-to-br from-cyan-500/10 to-pink-500/10 border-cyan-500/30' 
                : 'bg-gradient-to-br from-cyan-50 to-pink-50 border-cyan-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt="我的头像"
                    className="w-16 h-16 rounded-full border-4 border-cyan-500/50"
                  />
                  <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isDark 
                      ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white' 
                      : 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white'
                  }`}>
                    #{currentUserRank}
                  </div>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {currentUser.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    当前排名
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    {currentUser.completedQuestions}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                    完成题目
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                    {(currentUser.accuracy * 100).toFixed(0)}%
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                    正确率
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {currentUser.streakDays}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                    连续天数
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 排序选项 */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isActive = sortBy === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as SortOption)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                    isActive
                      ? isDark
                        ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/30'
                      : isDark
                        ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* 排行榜列表 */}
          <div className="space-y-3">
            {allUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl transition-all duration-300 ${
                  user.id === 'current-user'
                    ? isDark
                      ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border-2 border-cyan-500/50'
                      : 'bg-gradient-to-r from-cyan-100 to-pink-100 border-2 border-cyan-300'
                    : isDark
                      ? 'glass-effect border border-white/10 hover:border-white/20'
                      : 'glass-effect border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  {getRankIcon(index + 1)}
                  
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {user.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        📝 {user.completedQuestions} 题
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        ✅ {(user.accuracy * 100).toFixed(0)}%
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        🔥 {user.streakDays} 天
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent`}>
                      {user.totalPoints}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                      总积分
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 底部提示 */}
          <div className={`mt-12 text-center p-6 rounded-2xl ${
            isDark ? 'bg-white/5' : 'bg-slate-100'
          }`}>
            <p className={`${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              💡 每日坚持刷题，积累更多积分，提升你的排名！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
