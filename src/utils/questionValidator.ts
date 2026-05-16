export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface QuestionValidationSchema {
  requiredFields: (keyof import('@/types').Question)[];
  optionalFields?: (keyof import('@/types').Question)[];
  customRules?: ((question: import('@/types').Question) => string | null)[];
}

export function validateQuestion(question: import('@/types').Question): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!question.id) {
    errors.push('Missing required field: id');
  }

  if (!question.title) {
    errors.push('Missing required field: title');
  } else if (question.title.length < 5) {
    warnings.push('Title is too short (less than 5 characters)');
  }

  if (!question.category) {
    errors.push('Missing required field: category');
  } else {
    const validCategories = [
      'algorithms',
      'machine-learning',
      'deep-learning',
      'system-design',
      'data-structures',
      'python',
      'sql'
    ];
    if (!validCategories.includes(question.category)) {
      errors.push(`Invalid category: ${question.category}. Must be one of: ${validCategories.join(', ')}`);
    }
  }

  if (!question.difficulty) {
    errors.push('Missing required field: difficulty');
  } else {
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(question.difficulty)) {
      errors.push(`Invalid difficulty: ${question.difficulty}. Must be one of: ${validDifficulties.join(', ')}`);
    }
  }

  if (!question.tags || !Array.isArray(question.tags) || question.tags.length === 0) {
    errors.push('Missing required field: tags (must be a non-empty array)');
  }

  if (!question.description) {
    errors.push('Missing required field: description');
  } else if (question.description.length < 10) {
    warnings.push('Description is too short (less than 10 characters)');
  }

  if (!question.questionType) {
    errors.push('Missing required field: questionType');
  } else {
    const validTypes = ['choice', 'fill', 'coding'];
    if (!validTypes.includes(question.questionType)) {
      errors.push(`Invalid questionType: ${question.questionType}. Must be one of: ${validTypes.join(', ')}`);
    }
  }

  if (question.questionType === 'choice') {
    if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
      errors.push('Choice questions must have at least 2 options');
    } else {
      if (question.options.length < 4) {
        warnings.push('Choice questions should have at least 4 options');
      }
      if (question.correctAnswer === undefined || question.correctAnswer === null) {
        errors.push('Choice questions must have a correctAnswer');
      } else if (typeof question.correctAnswer !== 'number' || 
                 question.correctAnswer < 0 || 
                 question.correctAnswer >= question.options.length) {
        errors.push('correctAnswer must be a valid index into options array');
      }
    }
  }

  if (!question.solution) {
    warnings.push('Missing field: solution (recommended)');
  } else if (question.solution.length < 10) {
    warnings.push('Solution is too short (less than 10 characters)');
  }

  if (!question.explanation) {
    warnings.push('Missing field: explanation (recommended)');
  } else if (question.explanation.length < 20) {
    warnings.push('Explanation is too short (less than 20 characters)');
  }

  if (question.questionType === 'coding') {
    if (!question.codeTemplate) {
      warnings.push('Coding questions should have a codeTemplate');
    }
    if (!question.testCases || !Array.isArray(question.testCases) || question.testCases.length === 0) {
      warnings.push('Coding questions should have at least one test case');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateQuestionBank(questions: import('@/types').Question[]): {
  totalQuestions: number;
  validQuestions: number;
  questionsWithErrors: { question: import('@/types').Question; errors: string[] }[];
  questionsWithWarnings: { question: import('@/types').Question; warnings: string[] }[];
  statistics: {
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    byQuestionType: Record<string, number>;
  };
} {
  const questionsWithErrors: { question: import('@/types').Question; errors: string[] }[] = [];
  const questionsWithWarnings: { question: import('@/types').Question; warnings: string[] }[] = [];
  
  const byCategory: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byQuestionType: Record<string, number> = {};

  questions.forEach(q => {
    const result = validateQuestion(q);
    
    if (result.errors.length > 0) {
      questionsWithErrors.push({ question: q, errors: result.errors });
    }
    
    if (result.warnings.length > 0) {
      questionsWithWarnings.push({ question: q, warnings: result.warnings });
    }

    byCategory[q.category] = (byCategory[q.category] || 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    byQuestionType[q.questionType] = (byQuestionType[q.questionType] || 0) + 1;
  });

  return {
    totalQuestions: questions.length,
    validQuestions: questions.length - questionsWithErrors.length,
    questionsWithErrors,
    questionsWithWarnings,
    statistics: {
      byCategory,
      byDifficulty,
      byQuestionType
    }
  };
}

export function calculateQualityScore(question: import('@/types').Question): number {
  let score = 0;

  if (question.solution && question.solution.length > 20) score += 25;
  else if (question.solution) score += 10;

  if (question.explanation && question.explanation.length > 50) score += 25;
  else if (question.explanation && question.explanation.length > 20) score += 15;

  if (question.tags && question.tags.length > 0) score += 10;
  if (question.tags && question.tags.length >= 3) score += 10;

  if (question.title && question.title.length > 10) score += 10;

  if (question.questionType === 'coding') {
    if (question.testCases && question.testCases.length > 0) score += 15;
    if (question.codeTemplate) score += 5;
  }

  return Math.min(100, score);
}

export function generateValidationReport(questions: import('@/types').Question[]): string {
  const validation = validateQuestionBank(questions);
  
  let report = '=== Question Bank Validation Report ===\n\n';
  report += `Total Questions: ${validation.totalQuestions}\n`;
  report += `Valid Questions: ${validation.validQuestions}\n`;
  report += `Questions with Errors: ${validation.questionsWithErrors.length}\n`;
  report += `Questions with Warnings: ${validation.questionsWithWarnings.length}\n\n`;

  report += '--- Statistics ---\n';
  report += 'By Category:\n';
  Object.entries(validation.statistics.byCategory).forEach(([cat, count]) => {
    report += `  ${cat}: ${count}\n`;
  });
  
  report += '\nBy Difficulty:\n';
  Object.entries(validation.statistics.byDifficulty).forEach(([diff, count]) => {
    report += `  ${diff}: ${count}\n`;
  });

  report += '\nBy Question Type:\n';
  Object.entries(validation.statistics.byQuestionType).forEach(([type, count]) => {
    report += `  ${type}: ${count}\n`;
  });

  if (validation.questionsWithErrors.length > 0) {
    report += '\n--- Questions with Errors ---\n';
    validation.questionsWithErrors.slice(0, 20).forEach((item, index) => {
      report += `\n${index + 1}. ${item.question.title || item.question.id}:\n`;
      item.errors.forEach(err => {
        report += `   - ${err}\n`;
      });
    });
    if (validation.questionsWithErrors.length > 20) {
      report += `\n... and ${validation.questionsWithErrors.length - 20} more\n`;
    }
  }

  return report;
}
