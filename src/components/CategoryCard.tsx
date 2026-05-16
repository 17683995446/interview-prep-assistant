import { useNavigate } from 'react-router-dom';
import { Code, Brain, Layers, Server, Database, Terminal } from 'lucide-react';
import { Category } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface CategoryCardProps {
  category: Category;
  index: number;
}

const iconMap: Record<string, any> = {
  code: Code,
  brain: Brain,
  network: Layers,
  server: Server,
  database: Database,
  terminal: Terminal
};

export default function CategoryCard({ category, index }: CategoryCardProps) {
  const navigate = useNavigate();
  const Icon = iconMap[category.icon] || Code;
  const { isDark } = useTheme();

  return (
    <div
      className="group cursor-pointer fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => {
        navigate('/questions');
      }}
    >
      <div className={`relative glass-effect rounded-2xl p-6 border transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${isDark ? 'border-white/10' : 'border-slate-200'} hover:border-cyan-500/30`}>
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:neon-glow transition-all duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        
        <h3 className={`text-xl font-bold mb-2 group-hover:text-cyan-300 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {category.name}
        </h3>
        
        <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          {category.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-cyan-400 text-sm font-medium">
            {category.count} 道题
          </span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-cyan-500/20 transition-all duration-300 group-hover:translate-x-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
