#!/usr/bin/env python3
"""
合并现有题目和生成题目
"""
import json
import re

# 读取生成的题目
with open('/workspace/src/data/questions_generated.json', 'r', encoding='utf-8') as f:
    generated_questions = json.load(f)

# 读取现有的questions.ts文件（先读取一部分看格式）
with open('/workspace/src/data/questions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 从文件中提取categories部分
categories_match = re.search(r'export const categories: Category\[\] = \[(.*?)\];', content, re.DOTALL)
categories_part = categories_match.group(1) if categories_match else ''

# 从文件中提取questions部分
questions_match = re.search(r'export const questions: Question\[\] = \[(.*?)\];', content, re.DOTALL)
questions_part = questions_match.group(1) if questions_match else ''

# 解析现有题目（简化处理，直接字符串提取）
existing_questions_count = questions_part.count('{ id:')

# 统计各类别题目数
def count_by_category(questions):
    counts = {
        'algorithms': 0,
        'machine-learning': 0,
        'deep-learning': 0,
        'system-design': 0,
        'data-structures': 0,
        'python': 0,
        'sql': 0
    }
    for q in questions:
        if q['category'] in counts:
            counts[q['category']] += 1
    return counts

generated_counts = count_by_category(generated_questions)

# 初始count
initial_counts = {
    'algorithms': 60,
    'machine-learning': 70,
    'deep-learning': 60,
    'system-design': 50,
    'data-structures': 50,
    'python': 55,
    'sql': 55
}

# 更新count
final_counts = {}
for key in initial_counts:
    final_counts[key] = initial_counts[key] + generated_counts.get(key, 0)

print(f"现有题目: {existing_questions_count} 道")
print(f"生成题目: {len(generated_questions)} 道")
print(f"总题目数: {existing_questions_count + len(generated_questions)} 道")
print("\n各类别统计:")
for key in final_counts:
    print(f"{key}: {final_counts[key]} 道")

# 将生成的题目转换为TypeScript格式
def convert_to_ts(q):
    parts = []
    for key, value in q.items():
        if key in ['options', 'tags'] and isinstance(value, list):
            if value:
                value_str = "['" + "', '".join(value) + "']"
            else:
                value_str = '[]'
        elif isinstance(value, str):
            # 转义反引号和双引号
            value_str = f'`{value.replace("`", "\\`")}`'
        elif isinstance(value, bool):
            value_str = str(value).lower()
        elif value is None:
            continue  # 跳过None值
        else:
            value_str = str(value)
        parts.append(f'{key}: {value_str}')
    return '  { ' + ', '.join(parts) + ' }'

ts_questions = [convert_to_ts(q) for q in generated_questions]

# 重新生成整个文件
new_categories = f'''export const categories: Category[] = [
  {{ id: 'algorithms', name: '算法', icon: 'code', color: 'from-cyan-500 to-blue-500', description: '面试常见算法题，包括排序、搜索、动态规划等', count: {final_counts['algorithms']} }},
  {{ id: 'machine-learning', name: '机器学习', icon: 'brain', color: 'from-pink-500 to-purple-500', description: '机器学习基础、模型评估、特征工程等', count: {final_counts['machine-learning']} }},
  {{ id: 'deep-learning', name: '深度学习', icon: 'network', color: 'from-orange-500 to-red-500', description: '神经网络、CNN、RNN、Transformer等', count: {final_counts['deep-learning']} }},
  {{ id: 'system-design', name: '系统设计', icon: 'server', color: 'from-green-500 to-teal-500', description: '分布式系统、架构设计、性能优化', count: {final_counts['system-design']} }},
  {{ id: 'data-structures', name: '数据结构', icon: 'database', color: 'from-yellow-500 to-orange-500', description: '数组、链表、树、图等基础数据结构', count: {final_counts['data-structures']} }},
  {{ id: 'python', name: 'Python', icon: 'terminal', color: 'from-blue-600 to-indigo-600', description: 'Python编程基础、高级特性、最佳实践', count: {final_counts['python']} }},
  {{ id: 'sql', name: 'SQL', icon: 'database', color: 'from-emerald-500 to-teal-500', description: '数据库查询、数据分析、SQL优化', count: {final_counts['sql']} }}
];'''

# 把原有questions_part保留，并添加新题
new_content = f'''import {{ Question, Category }} from '@/types';

{new_categories}

export const questions: Question[] = [
{questions_part.strip()}
  ,
{',\n'.join(ts_questions)}
];
'''

with open('/workspace/src/data/questions.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("\n合并完成！")
