import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    className={cn(
      'animate-pulse bg-white/10 rounded',
      className,
    )}
    {...props}
  />
);

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const SkeletonCard = ({ className, children, ...props }: SkeletonCardProps) => (
  <div
    className={cn('bg-white/5 border border-white/10 rounded-xl p-6', className)}
    {...props}
  >
    {children}
  </div>
);

export { Skeleton, SkeletonCard };
