import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className, type = 'text', ...props }: InputProps) => (
  <input
    type={type}
    className={cn(
      'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all',
      className,
    )}
    {...props}
  />
);

export { Input };
