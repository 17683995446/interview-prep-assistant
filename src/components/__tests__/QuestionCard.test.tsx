import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuestionCard from '@/components/QuestionCard';
import { BrowserRouter } from 'react-router-dom';
import { useAppStore } from '@/store';

const mockQuestion = {
  id: '1',
  title: '测试题目',
  category: 'algorithms',
  difficulty: 'easy' as const,
  tags: ['算法', '数组'],
  description: '这是测试题目描述',
  questionType: 'choice' as const,
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 0,
  solution: '测试答案',
  explanation: '这是测试解析'
};

const mockCodingQuestion = {
  id: '2',
  title: '编程题目',
  category: 'algorithms',
  difficulty: 'medium' as const,
  tags: ['算法', '字符串'],
  description: '这是编程题目描述',
  questionType: 'coding' as const,
  solution: 'def solution(): pass',
  explanation: '这是编程题解析',
  codeTemplate: 'def solution():\n    pass',
  testCases: [{ input: 'test', output: 'test' }]
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('QuestionCard 组件测试', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: {},
      favorites: [],
      achievements: [],
      currentFilter: { category: null, difficulty: null, search: '' },
      theme: 'dark'
    });
  });

  it('应该正确显示题目信息', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} index={1} />);
    
    expect(screen.getByText('测试题目')).toBeInTheDocument();
    expect(screen.getByText('算法')).toBeInTheDocument();
    expect(screen.getByText('简单')).toBeInTheDocument();
  });

  it('应该正确显示卡片内容', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} index={1} />);
    expect(screen.getByText('测试题目')).toBeInTheDocument();
    expect(screen.getByText('简单')).toBeInTheDocument();
  });

  it('应该显示不同的卡片内容', () => {
    const differentQuestion = { ...mockQuestion, id: '5', title: '第五题' };
    renderWithRouter(<QuestionCard question={differentQuestion} index={5} />);
    expect(screen.getByText('第五题')).toBeInTheDocument();
  });

  it('应该正确处理点击事件', () => {
    const onClick = vi.fn();
    renderWithRouter(
      <QuestionCard question={mockQuestion} index={1} onQuestionClick={onClick} />
    );
    
    fireEvent.click(screen.getByText('测试题目'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('应该正确显示收藏状态', () => {
    useAppStore.setState({ favorites: ['1'] });
    renderWithRouter(<QuestionCard question={mockQuestion} index={1} />);
    
    const heartIcon = screen.getByRole('button', { name: /取消收藏/i });
    expect(heartIcon).toBeInTheDocument();
  });

  it('应该正确显示未收藏状态', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} index={1} />);
    
    const heartIcon = screen.getByRole('button', { name: /添加收藏/i });
    expect(heartIcon).toBeInTheDocument();
  });

  it('应该正确显示已完成状态', () => {
    useAppStore.setState({ 
      progress: { 
        '1': { 
          questionId: '1', 
          completed: true, 
          attempts: 1, 
          lastAttempt: new Date().toISOString() 
        } 
      } 
    });
    renderWithRouter(<QuestionCard question={mockQuestion} index={1} />);
    
    const completedIcon = screen.getByLabelText(/已完成/i);
    expect(completedIcon).toBeInTheDocument();
  });

  it('应该显示尝试次数', () => {
    useAppStore.setState({ 
      progress: { 
        '1': { 
          questionId: '1', 
          completed: false, 
          attempts: 3, 
          lastAttempt: new Date().toISOString() 
        } 
      } 
    });
    renderWithRouter(<QuestionCard question={mockQuestion} index={1} />);
    
    expect(screen.getByText(/3 次尝试/)).toBeInTheDocument();
  });

  it('应该显示选择题选项数量', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} index={1} />);
    
    expect(screen.getByText(/4 个选项/)).toBeInTheDocument();
  });

  it('应该显示标签', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} index={1} />);
    
    expect(screen.getByText('算法')).toBeInTheDocument();
    expect(screen.getByText('数组')).toBeInTheDocument();
  });

  it('应该显示不同难度的标签', () => {
    const easyQuestion = { ...mockQuestion, difficulty: 'easy' as const };
    renderWithRouter(<QuestionCard question={easyQuestion} index={1} />);
    expect(screen.getByText('简单')).toBeInTheDocument();
  });

  it('应该显示中等难度', () => {
    const mediumQuestion = { ...mockQuestion, difficulty: 'medium' as const };
    renderWithRouter(<QuestionCard question={mediumQuestion} index={1} />);
    expect(screen.getByText('中等')).toBeInTheDocument();
  });

  it('应该显示困难难度', () => {
    const hardQuestion = { ...mockQuestion, difficulty: 'hard' as const };
    renderWithRouter(<QuestionCard question={hardQuestion} index={1} />);
    expect(screen.getByText('困难')).toBeInTheDocument();
  });

  it('应该显示编程题类型', () => {
    renderWithRouter(<QuestionCard question={mockCodingQuestion} index={1} />);
    expect(screen.getByText('编程')).toBeInTheDocument();
  });

  it('应该显示选择类型标签', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} index={1} />);
    expect(screen.getByText('选择')).toBeInTheDocument();
  });

  it('应该高亮搜索关键词', () => {
    renderWithRouter(
      <QuestionCard question={mockQuestion} index={1} searchQuery="数组" />
    );
    
    const highlightedText = screen.getByText('数组');
    expect(highlightedText.tagName.toLowerCase()).toBe('mark');
  });

  it('应该切换收藏状态', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} index={1} />);
    
    const favoriteButton = screen.getByRole('button', { name: /添加收藏/i });
    fireEvent.click(favoriteButton);
    
    expect(screen.getByRole('button', { name: /取消收藏/i })).toBeInTheDocument();
  });

  it('应该调用自定义收藏回调', () => {
    const onFavoriteClick = vi.fn();
    renderWithRouter(
      <QuestionCard 
        question={mockQuestion} 
        index={1} 
        onFavoriteClick={onFavoriteClick}
      />
    );
    
    const favoriteButton = screen.getByRole('button', { name: /添加收藏/i });
    fireEvent.click(favoriteButton);
    
    expect(onFavoriteClick).toHaveBeenCalledTimes(1);
  });

  it('不应该在点击卡片时触发收藏', () => {
    const onQuestionClick = vi.fn();
    const onFavoriteClick = vi.fn();
    renderWithRouter(
      <QuestionCard 
        question={mockQuestion} 
        index={1} 
        onQuestionClick={onQuestionClick}
        onFavoriteClick={onFavoriteClick}
      />
    );
    
    const card = screen.getByText('测试题目');
    fireEvent.click(card);
    
    expect(onQuestionClick).toHaveBeenCalledTimes(1);
    expect(onFavoriteClick).not.toHaveBeenCalled();
  });

  it('收藏按钮点击不应该冒泡到卡片', () => {
    const onQuestionClick = vi.fn();
    renderWithRouter(
      <QuestionCard 
        question={mockQuestion} 
        index={1} 
        onQuestionClick={onQuestionClick}
      />
    );
    
    const favoriteButton = screen.getByRole('button', { name: /添加收藏/i });
    fireEvent.click(favoriteButton);
    
    expect(onQuestionClick).not.toHaveBeenCalled();
  });

  it('应该处理填空题类型', () => {
    const fillQuestion = {
      ...mockQuestion,
      questionType: 'fill' as const,
      id: '3'
    };
    renderWithRouter(<QuestionCard question={fillQuestion} index={1} />);
    expect(screen.getByText('填空')).toBeInTheDocument();
  });

  it('应该显示多个标签', () => {
    const multiTagQuestion = {
      ...mockQuestion,
      tags: ['标签1', '标签2', '标签3']
    };
    renderWithRouter(<QuestionCard question={multiTagQuestion} index={1} />);
    
    expect(screen.getByText('标签1')).toBeInTheDocument();
    expect(screen.getByText('标签2')).toBeInTheDocument();
    expect(screen.getByText('标签3')).toBeInTheDocument();
  });
});
