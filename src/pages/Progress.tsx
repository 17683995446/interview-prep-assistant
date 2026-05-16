import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, BookOpen, CheckCircle2, Clock, Target, AlertCircle, Award, TrendingUp } from 'lucide-react';
import ParticlesBackground from '@/components/ParticlesBackground';
import ProgressChart from '@/components/ProgressChart';
import UserProfile from '@/components/UserProfile';
import { useAppStore, useProgressStats, useIncorrectQuestions, achievements } from '@/store';

export default function Progress() {
  const { questions, progress, achievements: userAchievements } = useAppStore();
  const stats = useProgressStats();
  const incorrectQuestions = useIncorrectQuestions();
  
  const completedQuestions = useMemo(() => 
    questions.filter(q => progress[q.id]?.completed),
    [questions, progress]
  );
  
  const recentActivity = useMemo(() => 
    Object.entries(progress)
      .sort((a, b) => {
        const dateA = new Date(a[1].lastAttempt);
        const dateB = new Date(b[1].lastAttempt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5),
    [progress]
  );

  const unlockedAchievements = useMemo(() => {
    return achievements
      .filter(a => userAchievements.some(ua => ua.achievementId === a.id))
      .slice(0, 6);
  }, [userAchievements]);

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              学习进度
            </h1>
            <p className="text-gray-400 mb-4">
              追踪你的刷题历程
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 neon-glow"
            >
              <TrendingUp className="w-5 h-5" />
              查看学习仪表盘
            </Link>
          </div>

          {/* 用户资料 */}
          <div className="mb-8">
            <UserProfile />
          </div>

          {/* 成就卡片 */}
          <div className="glass-effect rounded-2xl p-6 border border-white/10 mb-8 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-400" />
                成就概览
              </h2>
              <Link
                to="/achievements"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center gap-1"
              >
                查看全部
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">
                已解锁 {userAchievements.length}/{achievements.length} 个成就
              </div>
              <div className="w-3/4 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-pink-500 h-full rounded-full"
                  style={{ width: `${(userAchievements.length / achievements.length) * 100}%` }}
                />
              </div>
            </div>
            {unlockedAchievements.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {unlockedAchievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}
                    title={`${achievement.name}: ${achievement.description}`}
                  >
                    {achievement.icon}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                还没有解锁成就，继续努力！
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1">
              <div className="glass-effect rounded-2xl p-8 border border-white/10 text-center fade-in">
                <ProgressChart 
                  completed={stats.completed} 
                  total={stats.total} 
                  size={220}
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-cyan-400">{stats.completed}</div>
                    <div className="text-gray-500 text-sm">已完成</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-pink-400">{stats.total - stats.completed}</div>
                    <div className="text-gray-500 text-sm">待完成</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 fade-in">
                <div className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{stats.completed}</div>
                      <div className="text-gray-400">完成题目</div>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-pink-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{stats.total}</div>
                      <div className="text-gray-400">题库总数</div>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{stats.percentage}%</div>
                      <div className="text-gray-400">完成率</div>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {Object.values(progress).reduce((sum, p) => sum + p.attempts, 0)}
                      </div>
                      <div className="text-gray-400">总尝试次数</div>
                    </div>
                  </div>
                </div>

                {incorrectQuestions.length > 0 && (
                  <Link
                    to="/mistakes"
                    className="glass-effect rounded-2xl p-6 border border-red-500/30 hover:border-red-500/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-3xl font-bold text-red-400">{incorrectQuestions.length}</div>
                        <div className="text-gray-400">错题待复习</div>
                      </div>
                      <span className="text-gray-500 group-hover:text-red-400 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {completedQuestions.length > 0 && (
              <div className="glass-effect rounded-2xl p-6 border border-white/10 fade-in">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  已完成题目
                </h2>
                <div className="space-y-3">
                  {completedQuestions.map((q) => (
                    <div key={q.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <span className="text-white font-medium">{q.title}</span>
                      <span className="text-green-400 text-sm">✓ 已完成</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentActivity.length > 0 && (
              <div className="glass-effect rounded-2xl p-6 border border-white/10 fade-in">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  最近活动
                </h2>
                <div className="space-y-3">
                  {recentActivity.map(([id, p]) => {
                    const q = questions.find(question => question.id === id);
                    if (!q) return null;
                    return (
                      <div key={id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="text-white text-sm truncate flex-1">{q.title}</span>
                        <span className="text-gray-500 text-xs ml-2">
                          {new Date(p.lastAttempt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completedQuestions.length === 0 && recentActivity.length === 0 && (
              <div className="lg:col-span-2 glass-effect rounded-2xl p-12 border border-white/10 text-center fade-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-pink-500/20 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">开始你的刷题之旅</h3>
                <p className="text-gray-400 mb-6">完成题目后，这里会显示你的学习进度</p>
                <button
                  onClick={() => window.location.href = '/questions'}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 neon-glow"
                >
                  去刷题
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
