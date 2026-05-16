import { useState } from 'react';
import { Question, QuestionType } from '@/types';

interface QuestionEditorProps {
  initialQuestion?: Partial<Question>;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

export default function QuestionEditor({ initialQuestion, onSave, onCancel }: QuestionEditorProps) {
  const [formData, setFormData] = useState<Partial<Question>>({
    title: '',
    category: 'algorithms',
    difficulty: 'medium',
    tags: [],
    description: '',
    questionType: 'choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    codeTemplate: '',
    solution: '',
    explanation: '',
    ...initialQuestion
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const categories = [
    { id: 'algorithms', name: '算法' },
    { id: 'machine-learning', name: '机器学习' },
    { id: 'deep-learning', name: '深度学习' },
    { id: 'system-design', name: '系统设计' },
    { id: 'data-structures', name: '数据结构' },
    { id: 'python', name: 'Python' },
    { id: 'sql', name: 'SQL' }
  ];

  const handleChange = (field: keyof Question, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleChange('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    handleChange('options', newOptions);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.title?.trim()) {
      newErrors.push('标题不能为空');
    }
    if (!formData.description?.trim()) {
      newErrors.push('题目描述不能为空');
    }
    if (!formData.tags || formData.tags.length === 0) {
      newErrors.push('请至少添加一个标签');
    }
    if (formData.questionType === 'choice') {
      const validOptions = formData.options?.filter(o => o.trim()) || [];
      if (validOptions.length < 2) {
        newErrors.push('选择题至少需要2个选项');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const question: Question = {
      id: formData.id || `custom-${Date.now()}`,
      title: formData.title || '',
      category: formData.category || 'algorithms',
      difficulty: formData.difficulty || 'medium',
      tags: formData.tags || [],
      description: formData.description || '',
      questionType: formData.questionType || 'choice',
      options: formData.questionType === 'choice' 
        ? formData.options?.filter(o => o.trim())
        : undefined,
      correctAnswer: formData.questionType === 'choice' 
        ? formData.correctAnswer
        : undefined,
      codeTemplate: formData.questionType === 'coding' 
        ? formData.codeTemplate
        : undefined,
      solution: formData.solution || '',
      explanation: formData.explanation || ''
    };

    onSave(question);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {initialQuestion?.id ? '编辑题目' : '创建新题目'}
      </h2>

      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <ul className="list-disc list-inside text-red-600">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            标题
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="请输入题目标题"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              分类
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              难度
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            题型
          </label>
          <div className="flex space-x-4">
            {(['choice', 'fill', 'coding'] as QuestionType[]).map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="questionType"
                  value={type}
                  checked={formData.questionType === type}
                  onChange={(e) => handleChange('questionType', e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {type === 'choice' ? '选择题' : type === 'fill' ? '填空题' : '编程题'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            标签
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags?.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="输入标签后按回车添加"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              添加
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            题目描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="请输入题目描述"
          />
        </div>

        {formData.questionType === 'choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选项
            </label>
            <div className="space-y-2">
              {(formData.options || ['', '', '', '']).map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => handleChange('correctAnswer', index)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-600 dark:text-gray-400 w-6">{String.fromCharCode(65 + index)}.</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              点击单选按钮选择正确答案
            </p>
          </div>
        )}

        {formData.questionType === 'coding' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              代码模板
            </label>
            <textarea
              value={formData.codeTemplate}
              onChange={(e) => handleChange('codeTemplate', e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
              placeholder="请输入代码模板"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            答案解析
          </label>
          <textarea
            value={formData.solution}
            onChange={(e) => handleChange('solution', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="请输入答案解析"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            详细解释
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) => handleChange('explanation', e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="请输入详细解释"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
