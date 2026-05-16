import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, ChevronRight, Trophy, Code, HelpCircle, PenTool, Heart } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import ParticlesBackground from '@/components/ParticlesBackground';
import CodeEditor from '@/components/CodeEditor';
import ShareButton from '@/components/ShareButton';
import { QuestionDetailSkeleton } from '@/components/Skeleton';
import { useAppStore } from '@/store';

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const difficultyLabels = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
};

const questionTypeIcons = {
  coding: Code,
  choice: HelpCircle,
  fill: PenTool
};

const questionTypeLabels = {
  coding: '编程题',
  choice: '选择题',
  fill: '填空题'
};

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showSolution, setShowSolution] = useState(false);
  const [code, setCode] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  
  const { questions, progress, markCompleted, incrementAttempts, favorites, toggleFavorite, checkAchievements } = useAppStore();
  
  const isFavorited = useMemo(() => 
    favorites.includes(id || ''),
    [favorites, id]
  );

  const question = useMemo(() => 
    questions.find(q => q.id === id),
    [questions, id]
  );
  
  const questionProgress = useMemo(() => 
    progress[id || ''],
    [progress, id]
  );

  useEffect(() => {
    if (question?.codeTemplate) {
      setCode(question.codeTemplate);
    }
    setSelectedAnswer(null);
    setFillAnswer('');
    setShowSolution(false);
    setAnswerSubmitted(false);
    setIsCorrect(null);
    setStartTime(Date.now());
    setIsLoading(false);
  }, [question]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (question) {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [id]);

  const handleAttempt = useCallback(() => {
    if (id) {
      incrementAttempts(id);
    }
  }, [id, incrementAttempts]);

  const handleMarkComplete = useCallback(() => {
    if (id && !questionProgress?.completed) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      markCompleted(id, timeTaken);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setTimeout(() => checkAchievements(), 100);
    }
  }, [id, questionProgress?.completed, markCompleted, startTime, checkAchievements]);

  const handleSubmit = useCallback(() => {
    handleAttempt();
    if (question.questionType === 'choice' && selectedAnswer !== null) {
      const correct = selectedAnswer === question.correctAnswer;
      setAnswerSubmitted(true);
      setIsCorrect(correct);
      if (correct) {
        handleMarkComplete();
      }
    } else if (question.questionType === 'fill') {
      const userAnswer = fillAnswer.trim().toLowerCase();
      const correctAnswer = question.solution.trim().toLowerCase();
      const correct = userAnswer === correctAnswer;
      setAnswerSubmitted(true);
      setIsCorrect(correct);
      if (correct) {
        handleMarkComplete();
      }
    } else {
      handleAttempt();
    }
  }, [question, selectedAnswer, fillAnswer, handleAttempt, handleMarkComplete]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (question.questionType === 'coding') {
        handleSubmit();
      }
    }
  }, [question.questionType, handleSubmit]);

  useEffect(() => {
    if (question.questionType === 'coding') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [question.questionType, handleKeyDown]);

  const handleResetCode = useCallback(() => {
    if (question?.codeTemplate) {
      setCode(question.codeTemplate);
    }
  }, [question?.codeTemplate]);

  if (!question) {
    if (isLoading) {
      return (
        <div className="min-h-screen relative">
          <ParticlesBackground />
          <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <QuestionDetailSkeleton />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">题目不存在</h2>
          <button
            onClick={() => navigate('/questions')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl text-white font-semibold"
          >
            返回题库
          </button>
        </div>
      </div>
    );
  }

  const TypeIcon = questionTypeIcons[question.questionType];

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.15}
        />
      )}
      
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/questions')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 fade-in"
          >
            <ArrowLeft className="w-5 h-5" />
            返回题库
          </button>

          <div className="glass-effect rounded-2xl border border-white/10 overflow-hidden fade-in">
            <div className="p-6 sm:p-8 border-b border-white/10">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TypeIcon className="w-6 h-6 text-cyan-400" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {question.title}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[question.difficulty]}`}>
                      {difficultyLabels[question.difficulty]}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-cyan-500/20 text-cyan-400">
                      {questionTypeLabels[question.questionType]}
                    </span>
                    {questionProgress?.completed && (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <Trophy className="w-4 h-4" />
                        已完成
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (id) {
                        toggleFavorite(id);
                        setTimeout(() => checkAchievements(), 100);
                      }
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    aria-label={isFavorited ? "取消收藏" : "添加收藏"}
                  >
                    <Heart 
                      className={`w-6 h-6 transition-colors ${isFavorited ? 'fill-pink-500 text-pink-500' : 'text-gray-400 hover:text-pink-400'}`} 
                    />
                  </button>
                  <ShareButton 
                    shareData={{
                      type: 'question',
                      title: question.title,
                      description: `快来一起刷这道${question.category}题吧！`,
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white/5 rounded-md text-sm text-gray-400 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">题目描述</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {question.description}
              </p>
            </div>

            {/* 编程题 - 显示代码编辑器 */}
            {question.questionType === 'coding' && question.codeTemplate && (
              <div className="p-6 sm:p-8 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">代码模板</h2>
                  <button
                    onClick={handleResetCode}
                    className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 font-medium hover:bg-yellow-500/30 transition-colors text-sm"
                  >
                    重置代码
                  </button>
                </div>
                <CodeEditor
                  code={code}
                  onChange={setCode}
                  language="python"
                  height="350px"
                />
                <p className="mt-2 text-sm text-gray-500">
                  提示：按 Ctrl+Enter 快速提交
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 font-medium hover:bg-cyan-500/30 transition-colors"
                  >
                    提交代码
                  </button>
                  {!questionProgress?.completed && (
                    <button
                      onClick={handleMarkComplete}
                      className="px-6 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      标记完成
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 选择题 - 显示选项 */}
            {question.questionType === 'choice' && question.options && (
              <div className="p-6 sm:p-8 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">请选择正确答案</h2>
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectOption = index === question.correctAnswer;
                    const showCorrectState = answerSubmitted && isCorrectOption;
                    const showWrongState = answerSubmitted && isSelected && !isCorrectOption;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => !answerSubmitted && setSelectedAnswer(index)}
                        disabled={answerSubmitted}
                        className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                          showCorrectState
                            ? 'border-green-500 bg-green-500/20 text-white animate-pulse'
                            : showWrongState
                            ? 'border-red-500 bg-red-500/20 text-white animate-shake'
                            : isSelected
                            ? 'border-cyan-500 bg-cyan-500/10 text-white'
                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-cyan-500/50'
                        } ${!answerSubmitted && 'cursor-pointer'} ${answerSubmitted && 'cursor-not-allowed opacity-80'}`}
                      >
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-current mr-3 text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                        {showCorrectState && (
                          <span className="ml-3 inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full text-white">
                            ✓
                          </span>
                        )}
                        {showWrongState && (
                          <span className="ml-3 inline-flex items-center justify-center w-6 h-6 bg-red-500 rounded-full text-white">
                            ✗
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {answerSubmitted && isCorrect !== null && (
                  <div className={`mt-4 p-4 rounded-xl border ${
                    isCorrect 
                      ? 'bg-green-500/20 border-green-500/50' 
                      : 'bg-red-500/20 border-red-500/50'
                  } animate-fade-in`}>
                    <p className={`font-semibold ${
                      isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isCorrect ? '🎉 回答正确！' : '❌ 回答错误'}
                    </p>
                    {!isCorrect && (
                      <p className="text-gray-300 mt-2">
                        正确答案：{String.fromCharCode(65 + (question.correctAnswer as number))}. {question.options[question.correctAnswer as number]}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="mt-4 flex gap-3">
                  {!answerSubmitted ? (
                    <button
                      onClick={handleSubmit}
                      disabled={selectedAnswer === null}
                      className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                        selectedAnswer !== null
                          ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30'
                          : 'bg-gray-500/20 border border-gray-500/30 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      提交答案
                    </button>
                  ) : !isCorrect ? (
                    <button
                      onClick={() => {
                        setAnswerSubmitted(false);
                        setIsCorrect(null);
                        setSelectedAnswer(null);
                      }}
                      className="px-6 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 font-medium hover:bg-yellow-500/30 transition-colors"
                    >
                      重新作答
                    </button>
                  ) : null}
                  {!questionProgress?.completed && (
                    <button
                      onClick={handleMarkComplete}
                      className="px-6 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      标记完成
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 填空题 - 显示输入框 */}
            {question.questionType === 'fill' && (
              <div className="p-6 sm:p-8 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">请填写答案</h2>
                <textarea
                  value={fillAnswer}
                  onChange={(e) => setFillAnswer(e.target.value)}
                  placeholder="在这里输入你的答案..."
                  disabled={answerSubmitted}
                  className={`w-full p-4 rounded-xl border text-white placeholder-gray-500 focus:outline-none transition-colors resize-none ${
                    answerSubmitted && isCorrect !== null
                      ? isCorrect
                        ? 'bg-green-500/20 border-green-500/50 focus:border-green-500'
                        : 'bg-red-500/20 border-red-500/50 focus:border-red-500'
                      : 'bg-white/5 border-white/10 focus:border-cyan-500/50'
                  }`}
                  rows={4}
                />
                
                {answerSubmitted && isCorrect !== null && (
                  <div className={`mt-4 p-4 rounded-xl border ${
                    isCorrect 
                      ? 'bg-green-500/20 border-green-500/50' 
                      : 'bg-red-500/20 border-red-500/50'
                  } animate-fade-in`}>
                    <p className={`font-semibold ${
                      isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isCorrect ? '🎉 回答正确！' : '❌ 回答错误'}
                    </p>
                    {!isCorrect && question.solution && (
                      <div className="mt-3">
                        <p className="text-gray-400 text-sm mb-1">正确答案：</p>
                        <p className="text-green-400 font-medium">{question.solution}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-4 flex gap-3">
                  {!answerSubmitted ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!fillAnswer.trim()}
                      className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                        fillAnswer.trim()
                          ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30'
                          : 'bg-gray-500/20 border border-gray-500/30 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      提交答案
                    </button>
                  ) : !isCorrect ? (
                    <button
                      onClick={() => {
                        setAnswerSubmitted(false);
                        setIsCorrect(null);
                        setFillAnswer('');
                      }}
                      className="px-6 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 font-medium hover:bg-yellow-500/30 transition-colors"
                    >
                      重新作答
                    </button>
                  ) : null}
                  {!questionProgress?.completed && (
                    <button
                      onClick={handleMarkComplete}
                      className="px-6 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      标记完成
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-white font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
              >
                {showSolution ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                {showSolution ? '隐藏答案' : '查看答案'}
              </button>

              {showSolution && (
                <div className="mt-6 space-y-6 fade-in">
                  {question.questionType === 'choice' && question.options && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        正确答案
                      </h3>
                      <div className="glass-effect rounded-xl p-4 border border-green-500/30">
                        <p className="text-green-400 font-medium text-lg">
                          {String.fromCharCode(65 + (question.correctAnswer as number))}. {question.options[question.correctAnswer as number]}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                      参考答案
                    </h3>
                    {question.solution.includes('def') || question.solution.includes('class') || question.solution.includes('import') ? (
                      <CodeEditor
                        code={question.solution}
                        onChange={() => {}}
                        language="python"
                        readOnly
                        height="auto"
                      />
                    ) : (
                      <div className="glass-effect rounded-xl p-4 border border-white/10">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {question.solution}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                      解题思路
                    </h3>
                    <div className="glass-effect rounded-xl p-4 border border-white/10">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
