import { Link } from 'react-router-dom';
import { AlertCircle, Clock, ArrowRight, BookOpen } from 'lucide-react';
import ParticlesBackground from '@/components/ParticlesBackground';
import { useIncorrectQuestions, useAppStore } from '@/store';

export default function MistakeBook() {
  const incorrectQuestions = useIncorrectQuestions();
  const { progress } = useAppStore();

  const totalErrors = incorrectQuestions.reduce((sum, q) => {
    return sum + (progress[q.id]?.attempts || 0);
  }, 0);

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              错题本
            </h1>
            <p className="text-gray-400">
              记录你的薄弱环节，针对性提升
            </p>
          </div>

          {incorrectQuestions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 fade-in">
                <div className="glass-effect rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{incorrectQuestions.length}</div>
                      <div className="text-gray-400">错题数量</div>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{totalErrors}</div>
                      <div className="text-gray-400">总错误次数</div>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {incorrectQuestions.length > 0 
                          ? Math.round(totalErrors / incorrectQuestions.length * 10) / 10 
                          : 0}
                      </div>
                      <div className="text-gray-400">平均错误次数</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {incorrectQuestions.map((question, index) => {
                  const questionProgress = progress[question.id];
                  const errorCount = questionProgress?.attempts || 0;
                  const lastAttempt = questionProgress?.lastAttempt 
                    ? new Date(questionProgress.lastAttempt).toLocaleDateString('zh-CN')
                    : '暂无记录';

                  return (
                    <div 
                      key={question.id}
                      className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-red-500/30 transition-all duration-300 fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl font-bold text-red-400">#{index + 1}</span>
                            <h3 className="text-lg font-semibold text-white">{question.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              question.difficulty === 'easy' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : question.difficulty === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {question.difficulty === 'easy' ? '简单' 
                               : question.difficulty === 'medium' ? '中等' : '困难'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-red-400">
                              <AlertCircle className="w-4 h-4" />
                              <span>错误次数: {errorCount}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>上次尝试: {lastAttempt}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <BookOpen className="w-4 h-4" />
                              <span>{question.category}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {question.tags.slice(0, 3).map((tag) => (
                              <span 
                                key={tag}
                                className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Link
                          to={`/question/${question.id}`}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 whitespace-nowrap"
                        >
                          去复习
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="glass-effect rounded-2xl p-12 border border-white/10 text-center fade-in">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
                <span className="text-6xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">太棒了！暂无错题！</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                继续保持！你的刷题正确率很高。
                如果想要挑战更多题目，可以去题库继续练习。
              </p>
              <Link
                to="/questions"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 neon-glow"
              >
                <BookOpen className="w-5 h-5" />
                去题库继续刷题
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}