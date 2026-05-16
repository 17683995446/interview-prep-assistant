import { memo, useMemo, useCallback } from 'react'
import QuestionCard from './QuestionCard'
import { Question } from '@/types'

interface QuestionListProps {
  questions: Question[]
  onQuestionClick: (id: string) => void
  onFavoriteClick: (id: string) => void
  searchQuery?: string
}

const QuestionList = memo(function QuestionList({ 
  questions, 
  onQuestionClick, 
  onFavoriteClick,
  searchQuery 
}: QuestionListProps) {
  const renderedQuestions = useMemo(() => 
    questions.map((question, index) => (
      <QuestionCard
        key={question.id}
        question={question}
        index={index}
        searchQuery={searchQuery}
      />
    ))
  , [questions, searchQuery])
  
  return (
    <div className="grid gap-4">
      {renderedQuestions}
    </div>
  )
})

export default QuestionList
