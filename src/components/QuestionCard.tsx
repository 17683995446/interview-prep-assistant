import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Code, HelpCircle, PenTool, Heart } from 'lucide-react';
import { Question } from '@/types';
import { useAppStore } from '@/store';
import { memo, useCallback, useMemo } from 'react';

interface QuestionCardProps {
  question: Question;
  index: number;
  searchQuery?: string;
  onQuestionClick?: () => void;
  onFavoriteClick?: () => void;
}

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
  coding: '编程',
  choice: '选择',
  fill: '填空'
};

const questionTypeColors = {
  coding: 'bg-cyan-500/20 text-cyan-400',
  choice: 'bg-pink-500/20 text-pink-400',
  fill: 'bg-purple-500/20 text-purple-400'
};

const QuestionCard = memo(function QuestionCard({ 
  question, 
  index, 
  searchQuery,
  onQuestionClick,
  onFavoriteClick
}: QuestionCardProps) {
  const navigate = useNavigate();
  const progress = useAppStore((state) => state.progress[question.id]);
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorited = useMemo(() => favorites.includes(question.id), [favorites, question.id]);
  
  const TypeIcon = questionTypeIcons[question.questionType];

  const HighlightedText = useCallback(({ text }: { text: string }) => {
    if (!searchQuery) return <>{text}</>;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() 
            ? <mark key={i} className="bg-yellow-500/30 text-yellow-300">{part}</mark>
            : part
        )}
      </>
    );
  }, [searchQuery]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteClick) {
      onFavoriteClick();
    } else {
      toggleFavorite(question.id);
    }
  }, [toggleFavorite, question.id, onFavoriteClick]);

  const handleCardClick = useCallback(() => {
    if (onQuestionClick) {
      onQuestionClick();
    } else {
      navigate(`/question/${question.id}`);
    }
  }, [navigate, question.id, onQuestionClick]);

  const cardContent = useMemo(() => ({
    animationDelay: `${index * 0.05}s`
  }), [index]);

  return (
    <div
      className="group cursor-pointer fade-in"
      style={cardContent}
      onClick={handleCardClick}
    >
      <div className="relative glass-effect rounded-xl p-5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:scale-[1.02]">
        {progress?.completed && (
          <div className="absolute top-3 right-3" aria-label="已完成">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
        )}

        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 left-3 p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label={isFavorited ? "取消收藏" : "添加收藏"}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-pink-500 text-pink-500' : 'text-gray-400 group-hover:text-pink-400'}`} 
          />
        </button>

        <div className="flex items-start justify-between mb-3 mt-6">
          <div className="flex items-center gap-2 flex-1">
            <TypeIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors duration-300">
              <HighlightedText text={question.title} />
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[question.difficulty]}`}>
            {difficultyLabels[question.difficulty]}
          </span>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${questionTypeColors[question.questionType]}`}>
            {questionTypeLabels[question.questionType]}
          </span>
          
          {progress && (
            <span className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock className="w-3 h-3" />
              {progress.attempts} 次尝试
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {question.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-white/5 rounded-md text-xs text-gray-400 border border-white/10"
            >
              <HighlightedText text={tag} />
            </span>
          ))}
        </div>
        
        {question.questionType !== 'coding' && question.options && (
          <div className="mt-3 text-xs text-gray-500">
            {question.options.length} 个选项
          </div>
        )}
      </div>
    </div>
  );
});

QuestionCard.displayName = 'QuestionCard';

export default QuestionCard;
