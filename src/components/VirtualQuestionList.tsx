import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { Question } from '@/types';
import QuestionCard from './QuestionCard';
import { QuestionCardSkeleton } from './Skeleton';

interface VirtualQuestionListProps {
  questions: Question[];
  searchQuery?: string;
}

const VirtualQuestionList: React.FC<VirtualQuestionListProps> = ({
  questions,
  searchQuery = '',
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return questions;
    }
    
    const query = searchQuery.toLowerCase();
    return questions.filter(
      (q) =>
        q.title.toLowerCase().includes(query) ||
        q.description.toLowerCase().includes(query) ||
        q.category.toLowerCase().includes(query) ||
        q.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [questions, searchQuery]);

  const renderedQuestions = useMemo(() => {
    return filteredQuestions.map((question, index) => (
      <QuestionCard
        key={question.id}
        question={question}
        index={index}
        searchQuery={searchQuery}
      />
    ));
  }, [filteredQuestions, searchQuery]);

  if (!isClient) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <QuestionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">没有找到匹配的题目</p>
        <p className="text-gray-500 mt-2">尝试调整搜索条件</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderedQuestions}
    </div>
  );
};

export default React.memo(VirtualQuestionList);
