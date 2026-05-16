#!/usr/bin/env python3
"""
大规模题库生成器
用于生成5000+的算法、机器学习、深度学习、系统设计、数据结构、Python、SQL题目
"""

import os
import json
import random
from typing import List, Dict, Any
from dataclasses import dataclass


@dataclass
class Question:
    id: str
    title: str
    category: str
    difficulty: str
    tags: List[str]
    description: str
    questionType: str
    options: List[str] = None
    correctAnswer: Any = None
    codeTemplate: str = None
    solution: str = None
    explanation: str = None


class QuestionGenerator:
    def __init__(self, start_id: int):
        self.current_id = start_id
        self.questions = []

    def add_question(self, question: Question):
        self.questions.append(question)
        self.current_id += 1

    def generate_choice(self, title: str, description: str, correct_option: int, options: List[str], 
                        tags: List[str], difficulty: str, category: str, solution: str, explanation: str):
        """生成选择题"""
        question = Question(
            id=str(self.current_id),
            title=title,
            category=category,
            difficulty=difficulty,
            tags=tags,
            description=description,
            questionType="choice",
            options=options,
            correctAnswer=correct_option,
            solution=solution,
            explanation=explanation
        )
        self.add_question(question)

    def generate_fill(self, title: str, description: str, correct_answer: str, 
                      tags: List[str], difficulty: str, category: str, solution: str, explanation: str):
        """生成填空题"""
        question = Question(
            id=str(self.current_id),
            title=title,
            category=category,
            difficulty=difficulty,
            tags=tags,
            description=description,
            questionType="fill",
            correctAnswer=correct_answer,
            solution=solution,
            explanation=explanation
        )
        self.add_question(question)

    def generate_coding(self, title: str, description: str, code_template: str, solution_code: str,
                        tags: List[str], difficulty: str, category: str, explanation: str):
        """生成编程题"""
        question = Question(
            id=str(self.current_id),
            title=title,
            category=category,
            difficulty=difficulty,
            tags=tags,
            description=description,
            questionType="coding",
            codeTemplate=code_template,
            solution=solution_code,
            explanation=explanation
        )
        self.add_question(question)

    def export(self, filepath: str):
        """导出题目为JSON格式"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump([q.__dict__ for q in self.questions], f, ensure_ascii=False, indent=2)
        return len(self.questions)


# ==================== 算法题目生成 ====================
def generate_algorithms(gen: QuestionGenerator, num_questions: int):
    """生成算法题目"""
    # 复杂度题目
    complexity_concepts = [
        ("O(1)", "常数时间", "哈希表查找、数组访问"),
        ("O(log n)", "对数时间", "二分查找"),
        ("O(n)", "线性时间", "遍历数组"),
        ("O(n log n)", "线性对数", "归并排序、快速排序"),
        ("O(n²)", "平方时间", "冒泡排序、插入排序"),
        ("O(2ⁿ)", "指数时间", "子集枚举"),
    ]
    
    for i in range(min(200, num_questions)):
        for j, (comp, desc, algo) in enumerate(complexity_concepts):
            gen.generate_choice(
                f"{algo}的时间复杂度是什么？",
                f"以下算法的平均时间复杂度是多少？",
                j,
                ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
                ["复杂度", "时间复杂度", algo],
                random.choice(["easy", "medium"]),
                "algorithms",
                f"答案是{comp}",
                f"{algo}采用分治策略，平均时间复杂度为{comp}"
            )
    
    # 排序算法题目
    sorting_algorithms = [
        ("冒泡排序", "O(n²)", "稳定", "适合小数据"),
        ("快速排序", "O(n log n)", "不稳定", "分治策略"),
        ("归并排序", "O(n log n)", "稳定", "需要额外空间"),
        ("插入排序", "O(n²)", "稳定", "适合基本有序"),
        ("选择排序", "O(n²)", "不稳定", "交换次数少"),
        ("堆排序", "O(n log n)", "不稳定", "不需要额外空间"),
        ("桶排序", "O(n)", "稳定", "适合数据均匀分布"),
    ]
    
    for i in range(min(300, num_questions - len(gen.questions))):
        for name, time, stable, note in sorting_algorithms:
            gen.generate_fill(
                f"{name}的时间复杂度是？",
                f"{name}的平均时间复杂度是多少？",
                time,
                ["排序", name, "时间复杂度"],
                "easy",
                "algorithms",
                time,
                f"{name}的平均时间复杂度为{time}，{note}"
            )
            
            gen.generate_choice(
                f"{name}是否稳定？",
                f"{name}是稳定的排序算法吗？",
                0 if stable == "稳定" else 1,
                ["是", "否"],
                ["排序", name, "稳定性"],
                "easy",
                "algorithms",
                "稳定的排序算法保持相等元素的相对顺序",
                f"{name}是{stable}的排序算法"
            )
    
    # 动态规划题目
    dp_problems = [
        ("爬楼梯", "斐波那契数列", "O(n)"),
        ("最大子数组和", "Kadane算法", "O(n)"),
        ("最长公共子序列", "二维DP", "O(mn)"),
        ("背包问题", "0-1背包/完全背包", "O(nm)"),
        ("最长递增子序列", "LIS", "O(n log n)"),
    ]
    
    for i in range(min(500, num_questions - len(gen.questions))):
        for name, technique, complexity in dp_problems:
            gen.generate_fill(
                f"{name}的时间复杂度",
                f"{name}问题的标准动态规划解法时间复杂度是？",
                complexity,
                ["动态规划", name],
                "medium",
                "algorithms",
                complexity,
                f"{name}使用{technique}，时间复杂度为{complexity}"
            )


# ==================== 机器学习题目生成 ====================
def generate_machine_learning(gen: QuestionGenerator, num_questions: int):
    """生成机器学习题目"""
    # 基本概念
    ml_concepts = [
        ("监督学习", "有标签数据", ["分类", "回归"]),
        ("无监督学习", "无标签数据", ["聚类", "降维"]),
        ("半监督学习", "部分有标签", []),
        ("强化学习", "奖励机制", []),
    ]
    
    for i in range(min(300, num_questions)):
        for type_name, desc, tasks in ml_concepts:
            gen.generate_choice(
                f"{type_name}的特点",
                f"{type_name}的主要特点是什么？",
                0,
                [desc, "无标签数据", "奖励驱动", "全是标签"],
                ["机器学习", type_name],
                "easy",
                "machine-learning",
                desc,
                f"{type_name}的核心是{desc}"
            )
    
    # 模型类型
    models = [
        ("逻辑回归", "分类", "线性模型", "sigmoid"),
        ("线性回归", "回归", "线性模型", "平方损失"),
        ("决策树", "分类/回归", "树模型", "信息增益"),
        ("随机森林", "集成", "多棵树", "Bagging"),
        ("SVM", "分类/回归", "最大间隔", "核函数"),
    ]
    
    for i in range(min(500, num_questions - len(gen.questions))):
        for model, task, family, key in models:
            gen.generate_fill(
                f"{model}属于什么模型",
                f"{model}属于哪类机器学习模型？",
                family,
                ["机器学习", model],
                "easy",
                "machine-learning",
                family,
                f"{model}属于{family}家族"
            )


# ==================== 深度学习题目生成 ====================
def generate_deep_learning(gen: QuestionGenerator, num_questions: int):
    """生成深度学习题目"""
    # 激活函数
    activation_functions = [
        ("ReLU", "max(0, x)", "缓解梯度消失", "dying ReLU"),
        ("Sigmoid", "σ(x)=1/(1+e⁻ˣ)", "输出(0,1)", "梯度消失"),
        ("Tanh", "双曲正切", "输出(-1,1)", "梯度消失"),
        ("Softmax", "归一化指数", "多分类", "类别概率"),
        ("LeakyReLU", "带泄漏的ReLU", "解决dying ReLU", ""),
    ]
    
    for i in range(min(300, num_questions)):
        for name, formula, pros, cons in activation_functions:
            gen.generate_fill(
                f"{name}的作用",
                f"{name}激活函数的作用是？",
                f"引入非线性，使网络可以学习复杂函数",
                ["深度学习", "激活函数", name],
                "easy",
                "deep-learning",
                f"{name}可以引入非线性",
                f"{name}的优点：{pros}，注意：{cons}"
            )
    
    # 网络架构
    architectures = [
        ("CNN", "卷积神经网络", "计算机视觉", "局部感受野"),
        ("RNN", "循环神经网络", "序列数据", "梯度消失"),
        ("Transformer", "自注意力", "NLP", "Attention"),
        ("ResNet", "残差网络", "极深网络", "Skip Connection"),
    ]
    
    for i in range(min(500, num_questions - len(gen.questions))):
        for name, full_name, application, key in architectures:
            gen.generate_choice(
                f"{name}主要用于什么？",
                f"{name}最擅长处理什么类型的数据？",
                random.randint(0, 3),
                [application, "图像", "文本", "音频"],
                ["深度学习", name, "网络架构"],
                "easy",
                "deep-learning",
                application,
                f"{name}是{full_name}，主要用于{application}"
            )


# ==================== 系统设计题目生成 ====================
def generate_system_design(gen: QuestionGenerator, num_questions: int):
    """生成系统设计题目"""
    # CAP定理
    cap_principles = [
        ("C", "一致性", "所有节点同时看到相同数据"),
        ("A", "可用性", "每个请求都有响应"),
        ("P", "分区容错", "系统能处理网络分区"),
    ]
    
    for i in range(min(200, num_questions)):
        for letter, name, desc in cap_principles:
            gen.generate_fill(
                f"CAP的{letter}代表什么？",
                f"CAP定理中的{letter}代表什么？",
                name,
                ["系统设计", "CAP", name],
                "easy",
                "system-design",
                name,
                f"{letter}代表{name}：{desc}"
            )
    
    # 缓存相关
    cache_topics = [
        ("缓存穿透", "大量请求不存在的key"),
        ("缓存击穿", "热点key失效"),
        ("缓存雪崩", "大量key同时过期"),
    ]
    
    for i in range(min(300, num_questions - len(gen.questions))):
        for problem, desc in cache_topics:
            gen.generate_fill(
                f"{problem}是什么？",
                f"什么是{problem}？",
                desc,
                ["系统设计", "缓存", problem],
                "medium",
                "system-design",
                desc,
                f"{problem}是指{desc}"
            )


# ==================== 数据结构题目生成 ====================
def generate_data_structures(gen: QuestionGenerator, num_questions: int):
    """生成数据结构题目"""
    # 基础数据结构
    ds_types = [
        ("数组", "连续内存", "随机访问O(1)"),
        ("链表", "指针相连", "插入删除O(1)"),
        ("栈", "LIFO", "后进先出"),
        ("队列", "FIFO", "先进先出"),
    ]
    
    for i in range(min(250, num_questions)):
        for name, structure, property in ds_types:
            gen.generate_fill(
                f"{name}的时间复杂度",
                f"{name}的访问/插入时间复杂度是？",
                property,
                ["数据结构", name],
                "easy",
                "data-structures",
                property,
                f"{name}基于{structure}，{property}"
            )
    
    # 树结构
    trees = [
        ("二叉树", "每个节点最多2个子节点"),
        ("二叉搜索树", "左小右大"),
        ("AVL", "平衡二叉搜索树"),
        ("红黑树", "近似平衡的二叉搜索树"),
    ]
    
    for i in range(min(250, num_questions - len(gen.questions))):
        for tree, property in trees:
            gen.generate_choice(
                f"{tree}的特点",
                f"{tree}的主要特点是什么？",
                0,
                [property, "平衡", "快速查找", "递归结构"],
                ["数据结构", "树", tree],
                "medium",
                "data-structures",
                property,
                f"{tree}的主要特点：{property}"
            )


# ==================== Python题目生成 ====================
def generate_python(gen: QuestionGenerator, num_questions: int):
    """生成Python题目"""
    # 基础语法
    python_basics = [
        ("列表推导式", "[x for x in ...]", "简洁高效创建列表"),
        ("字典推导式", "{k:v for ...}", "创建字典"),
        ("装饰器", "@decorator", "增强函数"),
        ("生成器", "(x for x in ...)", "惰性求值"),
        ("上下文管理器", "with ...", "资源管理"),
    ]
    
    for i in range(min(350, num_questions)):
        for feature, syntax, desc in python_basics:
            gen.generate_fill(
                f"Python{feature}的语法",
                f"{feature}的基本语法是？",
                syntax,
                ["Python", feature],
                "easy",
                "python",
                syntax,
                f"{feature}是Python的常用特性，{desc}"
            )
    
    # 数据类型
    data_types = [
        ("list", "可变，有序", "[]"),
        ("tuple", "不可变，有序", "()"),
        ("dict", "键值对，无序", "{}"),
        ("set", "唯一，无序", "set()"),
    ]
    
    for i in range(min(350, num_questions - len(gen.questions))):
        for type_name, property, literal in data_types:
            gen.generate_choice(
                f"{type_name}的特性",
                f"{type_name}的主要特性是什么？",
                0,
                [property, "不可变", "可变", "无序"],
                ["Python", "数据类型", type_name],
                "easy",
                "python",
                property,
                f"{type_name}的特点：{property}"
            )


# ==================== SQL题目生成 ====================
def generate_sql(gen: QuestionGenerator, num_questions: int):
    """生成SQL题目"""
    # 基础语法
    sql_keywords = [
        ("SELECT", "查询数据"),
        ("INSERT", "插入数据"),
        ("UPDATE", "更新数据"),
        ("DELETE", "删除数据"),
        ("CREATE", "创建表"),
        ("JOIN", "连接查询"),
        ("WHERE", "条件过滤"),
        ("GROUP BY", "分组"),
        ("HAVING", "分组过滤"),
        ("ORDER BY", "排序"),
    ]
    
    for i in range(min(350, num_questions)):
        for keyword, desc in sql_keywords:
            gen.generate_fill(
                f"SQL{keyword}的作用",
                f"SQL中{keyword}关键字的作用是什么？",
                desc,
                ["SQL", keyword],
                "easy",
                "sql",
                desc,
                f"{keyword}用于{desc}"
            )
    
    # 聚合函数
    aggregates = [
        ("COUNT", "计数"),
        ("SUM", "求和"),
        ("AVG", "平均值"),
        ("MAX", "最大值"),
        ("MIN", "最小值"),
    ]
    
    for i in range(min(350, num_questions - len(gen.questions))):
        for agg, desc in aggregates:
            gen.generate_fill(
                f"{agg}函数的作用",
                f"SQL中{agg}()聚合函数的作用是什么？",
                desc,
                ["SQL", "聚合函数", agg],
                "easy",
                "sql",
                desc,
                f"{agg}()用于{desc}"
            )


def main():
    print("开始生成题库...")
    
    total_questions = 0
    output_file = "/workspace/src/data/questions_generated.json"
    
    # 从401开始，避免与现有题目的ID冲突
    gen = QuestionGenerator(401)
    
    # 生成各类别题目
    print("正在生成算法题目...")
    generate_algorithms(gen, 1000)
    
    print(f"正在生成机器学习题目...")
    generate_machine_learning(gen, 800)
    
    print(f"正在生成深度学习题目...")
    generate_deep_learning(gen, 800)
    
    print(f"正在生成系统设计题目...")
    generate_system_design(gen, 500)
    
    print(f"正在生成数据结构题目...")
    generate_data_structures(gen, 500)
    
    print(f"正在生成Python题目...")
    generate_python(gen, 700)
    
    print(f"正在生成SQL题目...")
    generate_sql(gen, 700)
    
    # 导出
    count = gen.export(output_file)
    print(f"生成完成！共{count}道题目，保存在{output_file}")
    
    return count


if __name__ == "__main__":
    main()
