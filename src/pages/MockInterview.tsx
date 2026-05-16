import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Target, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Question, 
  InterviewConfig, 
  InterviewPhase, 
  InterviewQuestion, 
  InterviewResult,
  DifficultyLevel 
} from '@/types';
import { questions, categories } from '@/data/questions';
import { useAppStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';

const difficultyMap: Record<DifficultyLevel, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  mixed: '混合'
};

export default function MockInterview() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { saveInterviewResult, markCompleted, incrementAttempts } = useAppStore();

  const [stage, setStage] = useState<InterviewPhase>('welcome');
  const [config, setConfig] = useState<InterviewConfig>({
    difficulty: 'medium',
    timeLimit: 30,
    questionCount: 10,
    categories: ['all']
  });
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化计时器
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            finishInterview();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
  }, [isPaused]);

  // 清理计时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 生成面试题目
  const generateQuestions = useCallback((config: InterviewConfig) => {
    let filteredQuestions = [...questions];

    if (config.difficulty !== 'mixed') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === config.difficulty);
    }

    if (!config.categories.includes('all')) {
      filteredQuestions = filteredQuestions.filter(q => config.categories.includes(q.category));
    }

    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, config.questionCount);
    
    return selected.map(q => ({ question: q }));
  }, []);

  const startInterview = () => {
    const generatedQuestions = generateQuestions(config);
    setInterviewQuestions(generatedQuestions);
    setCurrentIndex(0);
    setTimeRemaining(config.timeLimit * 60);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setIsPaused(false);
    setStage('interview');
    startTimer();
  };

  const answerQuestion = (answer: string | number | null) => {
    const question = interviewQuestions[currentIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    let isCorrect = false;

    if (question.question.questionType === 'choice' && question.question.options) {
      isCorrect = answer === question.question.correctAnswer;
    } else if (question.question.questionType === 'fill') {
      isCorrect = answer === question.question.correctAnswer;
    }

    const updatedQuestions = [...interviewQuestions];
    updatedQuestions[currentIndex] = {
      ...question,
      userAnswer: answer,
      isCorrect,
      timeSpent
    };
    setInterviewQuestions(updatedQuestions);

    incrementAttempts(question.question.id);
    if (isCorrect) {
      markCompleted(question.question.id, timeSpent);
    }

    if (currentIndex < interviewQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      finishInterview(updatedQuestions);
    }
  };

  const finishInterview = (finalQuestions = interviewQuestions) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const totalTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const correctCount = finalQuestions.filter(q => q.isCorrect).length;
    
    const result: InterviewResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      config,
      questions: finalQuestions,
      totalTime,
      correctCount,
      totalCount: finalQuestions.length
    };

    saveInterviewResult(result);
    setInterviewQuestions(finalQuestions);
    setStage('result');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : categoryId;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {stage === 'welcome' && (
            <WelcomeStage 
              key="welcome"
              config={config}
              setConfig={setConfig}
              onStart={startInterview}
              isDark={isDark}
            />
          )}
          
          {stage === 'interview' && (
            <InterviewStage 
              key="interview"
              questions={interviewQuestions}
              currentIndex={currentIndex}
              timeRemaining={timeRemaining}
              isPaused={isPaused}
              onAnswer={answerQuestion}
              onPause={() => setIsPaused(!isPaused)}
              onFinish={finishInterview}
              formatTime={formatTime}
              isDark={isDark}
            />
          )}
          
          {stage === 'result' && (
            <ResultStage 
              key="result"
              questions={interviewQuestions}
              config={config}
              timeTaken={startTime ? Math.floor((Date.now() - startTime) / 1000) : 0}
              getCategoryName={getCategoryName}
              onRestart={() => setStage('welcome')}
              onBack={() => navigate('/')}
              formatTime={formatTime}
              isDark={isDark}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function WelcomeStage({ 
  config, 
  setConfig, 
  onStart, 
  isDark 
}: { 
  config: InterviewConfig; 
  setConfig: (c: InterviewConfig) => void; 
  onStart: () => void;
  isDark: boolean;
}) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);

  const handleCategoryToggle = (category: string) => {
    let newCategories: string[];
    if (category === 'all') {
      newCategories = ['all'];
      setSelectedCategories(newCategories);
    } else {
      newCategories = selectedCategories.filter(c => c !== 'all');
      if (newCategories.includes(category)) {
        newCategories = newCategories.filter(c => c !== category);
      } else {
        newCategories.push(category);
      }
      if (newCategories.length === 0) {
        newCategories = ['all'];
      }
      setSelectedCategories(newCategories);
    }
    setConfig({ ...config, categories: newCategories });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 mb-6 neon-glow">
          <Target className="w-10 h-10 text-white" />
        </div>
        <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          模拟面试
        </h1>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          设置面试参数，开始你的真实模拟体验
        </p>
      </div>

      <div className="grid gap-6">
        <div className={`glass-effect rounded-2xl p-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Settings className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>难度设置</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(difficultyMap) as DifficultyLevel[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setConfig({ ...config, difficulty: diff })}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  config.difficulty === diff
                    ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white neon-glow'
                    : isDark
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {difficultyMap[diff]}
              </button>
            ))}
          </div>
        </div>

        <div className={`glass-effect rounded-2xl p-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Clock className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>时间限制</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[15, 30, 45, 60].map((time) => (
              <button
                key={time}
                onClick={() => setConfig({ ...config, timeLimit: time })}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  config.timeLimit === time
                    ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white neon-glow'
                    : isDark
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {time} 分钟
              </button>
            ))}
          </div>
        </div>

        <div className={`glass-effect rounded-2xl p-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Zap className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>题目数量</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[5, 10, 15, 20].map((count) => (
              <button
                key={count}
                onClick={() => setConfig({ ...config, questionCount: count })}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  config.questionCount === count
                    ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white neon-glow'
                    : isDark
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {count} 题
              </button>
            ))}
          </div>
        </div>

        <div className={`glass-effect rounded-2xl p-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>分类选择</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryToggle('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedCategories.includes('all')
                  ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white'
                  : isDark
                  ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部分类
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryToggle(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategories.includes(category.id)
                    ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white'
                    : isDark
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl text-white font-semibold text-lg hover:scale-105 transition-all duration-300 neon-glow flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" />
        开始面试
      </button>
    </motion.div>
  );
}

function InterviewStage({ 
  questions, 
  currentIndex, 
  timeRemaining, 
  isPaused, 
  onAnswer, 
  onPause, 
  onFinish, 
  formatTime,
  isDark
}: { 
  questions: InterviewQuestion[];
  currentIndex: number;
  timeRemaining: number;
  isPaused: boolean;
  onAnswer: (answer: string | number | null) => void;
  onPause: () => void;
  onFinish: () => void;
  formatTime: (s: number) => string;
  isDark: boolean;
}) {
  const [userInput, setUserInput] = useState('');
  const currentQ = questions[currentIndex].question;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSubmit = () => {
    if (currentQ.questionType === 'fill') {
      onAnswer(userInput);
      setUserInput('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-6"
    >
      <div className={`glass-effect rounded-2xl p-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-xl font-mono font-bold ${timeRemaining < 60 ? 'text-red-500' : isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <button
              onClick={onPause}
              className={`p-2 rounded-lg transition-all ${
                isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>
          <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            第 {currentIndex + 1} 题 / 共 {questions.length} 题
          </div>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isPaused ? (
        <div className={`glass-effect rounded-2xl p-12 text-center ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <Pause className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-slate-400'}`} />
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            面试暂停
          </h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            休息一下，准备好了再继续
          </p>
          <button
            onClick={onPause}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 neon-glow"
          >
            继续面试
          </button>
        </div>
      ) : (
        <>
          <div className={`glass-effect rounded-2xl p-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentQ.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                currentQ.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {difficultyMap[currentQ.difficulty]}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
              }`}>
                {currentQ.tags[0] || '综合'}
              </span>
            </div>

            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentQ.title}
            </h2>
            
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              {currentQ.description}
            </p>

            {currentQ.questionType === 'choice' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => onAnswer(index)}
                    className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-300 ${
                      isDark
                        ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-cyan-500/50'
                    }`}
                  >
                    <span className={`font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                      {String.fromCharCode(65 + index)}.{' '}
                    </span>
                    <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {currentQ.questionType === 'fill' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="请输入答案..."
                  className={`w-full px-4 py-4 rounded-xl bg-transparent border ${
                    isDark
                      ? 'border-white/20 focus:border-cyan-500 text-white placeholder-gray-500'
                      : 'border-slate-300 focus:border-cyan-500 text-slate-900 placeholder-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                />
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300"
                >
                  提交答案
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onFinish}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isDark
                  ? 'glass-effect border border-white/10 text-white hover:bg-white/5'
                  : 'glass-effect border border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              提前结束
            </button>
            {currentIndex < questions.length - 1 && (
              <button
                onClick={() => onAnswer(null)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                跳过
              </button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

function ResultStage({ 
  questions, 
  config, 
  timeTaken, 
  getCategoryName, 
  onRestart, 
  onBack, 
  formatTime,
  isDark
}: { 
  questions: InterviewQuestion[];
  config: InterviewConfig;
  timeTaken: number;
  getCategoryName: (id: string) => string;
  onRestart: () => void;
  onBack: () => void;
  formatTime: (s: number) => string;
  isDark: boolean;
}) {
  const correctCount = questions.filter(q => q.isCorrect).length;
  const totalCount = questions.length;
  const accuracy = Math.round((correctCount / totalCount) * 100);
  
  const categoryStats = questions.reduce((acc, q) => {
    const cat = q.question.category;
    if (!acc[cat]) {
      acc[cat] = { correct: 0, total: 0 };
    }
    acc[cat].total++;
    if (q.isCorrect) acc[cat].correct++;
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${getScoreColor(accuracy)} mb-6 neon-glow`}>
          <Award className="w-12 h-12 text-white" />
        </div>
        <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          面试结束！
        </h1>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          以下是你的表现分析
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`glass-effect rounded-2xl p-6 text-center ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${getScoreColor(accuracy)} bg-clip-text text-transparent`}>
            {accuracy}%
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>正确率</div>
        </div>
        <div className={`glass-effect rounded-2xl p-6 text-center ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
            {correctCount}/{totalCount}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>正确题目</div>
        </div>
        <div className={`glass-effect rounded-2xl p-6 text-center ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
            {formatTime(timeTaken)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>用时</div>
        </div>
      </div>

      {Object.keys(categoryStats).length > 0 && (
        <div className={`glass-effect rounded-2xl p-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            分类表现
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([cat, stats]) => {
              const catAcc = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={cat} className="flex items-center gap-4">
                  <div className={`w-32 text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    {getCategoryName(cat)}
                  </div>
                  <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-full bg-gradient-to-r ${getScoreColor(catAcc)} transition-all duration-500`}
                      style={{ width: `${catAcc}%` }}
                    />
                  </div>
                  <div className={`w-12 text-right text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                    {catAcc}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={`glass-effect rounded-2xl p-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          题目回顾
        </h3>
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {q.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {index + 1}. {q.question.title}
                  </div>
                  {!q.isCorrect && (
                    <div className="text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>正确答案：</span>
                      <span className={isDark ? 'text-green-400' : 'text-green-700'}>
                        {q.question.questionType === 'choice' && q.question.options
                          ? `${String.fromCharCode(65 + (q.question.correctAnswer as number))}. ${q.question.options[q.question.correctAnswer as number]}`
                          : q.question.correctAnswer
                        }
                      </span>
                    </div>
                  )}
                  {q.timeSpent && (
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                      用时 {formatTime(q.timeSpent)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all duration-300 ${
            isDark
              ? 'glass-effect border border-white/10 text-white hover:bg-white/5'
              : 'glass-effect border border-slate-200 text-slate-800 hover:bg-slate-50'
          }`}
        >
          返回首页
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 neon-glow flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          再来一次
        </button>
      </div>
    </motion.div>
  );
}
