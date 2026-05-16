import { useState } from 'react';
import { Question } from '@/types';
import { validateQuestion } from '@/utils/questionValidator';

interface QuestionImportProps {
  onImport: (questions: Question[]) => void;
  onCancel: () => void;
}

type ImportFormat = 'json' | 'csv' | 'markdown';

interface ImportResult {
  success: boolean;
  importedQuestions: Question[];
  errors: { question: any; errors: string[] }[];
  total: number;
  valid: number;
  invalid: number;
}

export default function QuestionImport({ onImport, onCancel }: QuestionImportProps) {
  const [format, setFormat] = useState<ImportFormat>('json');
  const [content, setContent] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const parseJSON = (content: string): Question[] => {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  };

  const parseCSV = (content: string): Question[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have header and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const questions: Question[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const question: any = {};

      headers.forEach((header, index) => {
        if (header === 'tags') {
          question[header] = values[index]?.split('|') || [];
        } else if (header === 'options') {
          question[header] = values[index]?.split('|') || [];
        } else if (header === 'correctanswer') {
          question.correctAnswer = parseInt(values[index]) || 0;
        } else {
          question[header] = values[index] || '';
        }
      });

      if (question.id && question.title && question.description) {
        questions.push(question as Question);
      }
    }

    return questions;
  };

  const parseMarkdown = (content: string): Question[] => {
    const sections = content.split(/^# /m).filter(s => s.trim());
    const questions: Question[] = [];

    sections.forEach((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim();
      const question: any = {
        id: `imported-${Date.now()}-${index}`,
        title: title,
        category: 'algorithms',
        difficulty: 'medium',
        tags: [],
        description: '',
        questionType: 'choice',
        options: [],
        solution: '',
        explanation: ''
      };

      let currentSection = '';
      let currentContent: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('## ')) {
          if (currentSection && currentContent.length > 0) {
            const text = currentContent.join('\n').trim();
            switch (currentSection.toLowerCase()) {
              case 'description':
                question.description = text;
                break;
              case 'options':
                question.options = text.split('\n').filter(o => o.match(/^[A-D]\./));
                break;
              case 'answer':
                if (text.match(/^[A-D]\./)) {
                  question.correctAnswer = ['A', 'B', 'C', 'D'].indexOf(text[0]);
                }
                break;
              case 'solution':
              case 'explanation':
                question[currentSection.toLowerCase()] = text;
                break;
            }
          }
          currentSection = line.replace('## ', '').trim();
          currentContent = [];
        } else {
          currentContent.push(line);
        }
      }

      if (question.description && question.options.length > 0) {
        questions.push(question as Question);
      }
    });

    return questions;
  };

  const handleImport = () => {
    setIsImporting(true);
    
    try {
      let questions: Question[];

      switch (format) {
        case 'json':
          questions = parseJSON(content);
          break;
        case 'csv':
          questions = parseCSV(content);
          break;
        case 'markdown':
          questions = parseMarkdown(content);
          break;
        default:
          throw new Error('Unsupported format');
      }

      const validQuestions: Question[] = [];
      const errors: { question: any; errors: string[] }[] = [];

      questions.forEach((q, index) => {
        const validation = validateQuestion(q);
        
        if (validation.isValid) {
          validQuestions.push({
            ...q,
            id: q.id || `imported-${Date.now()}-${index}`
          });
        } else {
          errors.push({ question: q, errors: validation.errors });
        }
      });

      const result: ImportResult = {
        success: errors.length === 0,
        importedQuestions: validQuestions,
        errors,
        total: questions.length,
        valid: validQuestions.length,
        invalid: errors.length
      };

      setImportResult(result);
    } catch (error: any) {
      setImportResult({
        success: false,
        importedQuestions: [],
        errors: [{ question: null, errors: [error.message] }],
        total: 0,
        valid: 0,
        invalid: 0
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = () => {
    if (importResult && importResult.importedQuestions.length > 0) {
      onImport(importResult.importedQuestions);
    }
  };

  const sampleJSON = `[
  {
    "title": "两数之和",
    "category": "algorithms",
    "difficulty": "easy",
    "tags": ["数组", "哈希表"],
    "description": "给定一个整数数组...",
    "questionType": "choice",
    "options": ["A. 方法1", "B. 方法2", "C. 方法3", "D. 方法4"],
    "correctAnswer": 0,
    "solution": "使用哈希表",
    "explanation": "详细解释..."
  }
]`;

  const sampleCSV = `title,category,difficulty,tags,description,questionType,options,correctAnswer,solution
两数之和,algorithms,easy,数组|哈希表,给定一个整数数组...,choice,A.方法1|B.方法2|C.方法3|D.方法4,0,使用哈希表,详细解释`;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        导入题目
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          选择导入格式
        </label>
        <div className="flex space-x-4">
          {(['json', 'csv', 'markdown'] as ImportFormat[]).map(f => (
            <label key={f} className="flex items-center">
              <input
                type="radio"
                name="format"
                value={f}
                checked={format === f}
                onChange={(e) => setFormat(e.target.value as ImportFormat)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">
                {f.toUpperCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {format.toUpperCase()} 内容
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
          placeholder={`请粘贴 ${format.toUpperCase()} 格式的题目数据`}
        />
      </div>

      <div className="mb-6">
        <button
          onClick={() => setContent(format === 'json' ? sampleJSON : format === 'csv' ? sampleCSV : '')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          查看 {format.toUpperCase()} 示例
        </button>
      </div>

      {content && (
        <div className="mb-4">
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isImporting ? '正在验证...' : '验证并预览'}
          </button>
        </div>
      )}

      {importResult && (
        <div className="space-y-4">
          <div className={`p-4 rounded-md ${importResult.success ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <h3 className="font-semibold mb-2">导入预览</h3>
            <div className="text-sm space-y-1">
              <p>总题数: {importResult.total}</p>
              <p className="text-green-600">有效题目: {importResult.valid}</p>
              {importResult.invalid > 0 && (
                <p className="text-red-600">无效题目: {importResult.invalid}</p>
              )}
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-semibold mb-2 text-red-800">验证错误</h3>
              <ul className="list-disc list-inside text-red-600 text-sm max-h-60 overflow-y-auto">
                {importResult.errors.slice(0, 10).map((err, index) => (
                  <li key={index}>
                    {err.question?.title || 'Unknown'}:
                    {err.errors.join(', ')}
                  </li>
                ))}
                {importResult.errors.length > 10 && (
                  <li>... 还有 {importResult.errors.length - 10} 个错误</li>
                )}
              </ul>
            </div>
          )}

          {importResult.valid > 0 && (
            <div className="flex justify-end space-x-4">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                确认导入 {importResult.valid} 道题目
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
