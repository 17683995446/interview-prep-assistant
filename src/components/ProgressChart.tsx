import { useMemo } from 'react'
import { Cell, ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface ProgressChartProps {
  completed: number
  total: number
  size?: number
  className?: string
}

const COLORS = ['#06b6d4', '#ec4899', '#a855f7', '#10b981', '#f59e0b']

export default function ProgressChart({ completed, total, size = 200, className }: ProgressChartProps) {
  const data = useMemo(() => [
    { name: '已完成', value: completed },
    { name: '未完成', value: total - completed },
  ], [completed, total])

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={cn('relative', className)}>
      <div className="flex flex-col items-center justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={size * 0.35}
                outerRadius={size * 0.48}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-gray-400 text-xs">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              {percentage}%
            </span>
            <span className="text-gray-400 text-sm mt-1">完成度</span>
          </div>
        </div>
      </div>
    </div>
  )
}
