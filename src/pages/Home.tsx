import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, TrendingUp, Target, Users } from 'lucide-react';
import ParticlesBackground from '@/components/ParticlesBackground';
import CategoryCard from '@/components/CategoryCard';
import { DashboardSkeleton } from '@/components/Skeleton';
import { categories } from '@/data/questions';
import { useProgressStats } from '@/store';
import { useTheme } from '@/hooks/useTheme';

export default function Home() {
  const navigate = useNavigate();
  const stats = useProgressStats();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
          <section className="text-center mb-16 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">AI/计算机面试刷题</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                征服面试
              </span>
              <br />
              <span className={isDark ? 'text-white' : 'text-slate-900'}>成就你的技术梦想</span>
            </h1>
            
            <p className={`text-lg max-w-2xl mx-auto mb-8 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              精选算法、机器学习、系统设计等核心题目，助你从容应对各大科技公司面试
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/questions')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 neon-glow flex items-center gap-2"
              >
                开始刷题
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate('/interview')}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 neon-glow flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                模拟面试
              </button>
              
              <button
                onClick={() => navigate('/ranking')}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 neon-glow flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                排行榜
              </button>
              
              <button
                onClick={() => navigate('/progress')}
                className={`px-8 py-4 glass-effect rounded-xl font-semibold hover:border-cyan-500/30 transition-all duration-300 flex items-center gap-2 ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-800'}`}
              >
                <TrendingUp className="w-5 h-5" />
                查看进度
              </button>
            </div>

            {stats.total > 0 && (
              <div className="mt-12 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{stats.completed}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>已完成</div>
                </div>
                <div className={`w-px h-12 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400">{stats.total}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>总题目</div>
                </div>
                <div className={`w-px h-12 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{stats.percentage}%</div>
                  <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>完成率</div>
                </div>
              </div>
            )}
          </section>

          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>题库分类</h2>
                <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>选择你想练习的领域</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
