import React from 'react';

export const QuestionCardSkeleton = () => (
  <div className="animate-pulse bg-white/5 rounded-xl p-6 border border-white/10">
    <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-white/10 rounded"></div>
      <div className="h-4 bg-white/10 rounded w-5/6"></div>
    </div>
    <div className="flex gap-2 mt-4">
      <div className="h-6 w-16 bg-white/10 rounded-full"></div>
      <div className="h-6 w-20 bg-white/10 rounded-full"></div>
    </div>
  </div>
);

export const QuestionDetailSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="h-8 bg-white/10 rounded w-2/3"></div>
    <div className="flex gap-2">
      <div className="h-6 w-20 bg-white/10 rounded-full"></div>
      <div className="h-6 w-24 bg-white/10 rounded-full"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-white/10 rounded"></div>
      <div className="h-4 bg-white/10 rounded w-11/12"></div>
      <div className="h-4 bg-white/10 rounded w-4/5"></div>
    </div>
    <div className="h-64 bg-white/10 rounded-lg"></div>
    <div className="space-y-2">
      <div className="h-4 bg-white/10 rounded"></div>
      <div className="h-4 bg-white/10 rounded w-3/4"></div>
    </div>
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="animate-pulse bg-white/5 rounded-xl p-6 border border-white/10">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-5 bg-white/10 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-cyan-500/30 rounded-full w-1/3"></div>
    </div>
  </div>
);

export const ProgressSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="flex items-center justify-center">
      <div className="w-32 h-32 bg-white/10 rounded-full"></div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/5 rounded-lg p-4">
          <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-white/10 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export const ListItemSkeleton = () => (
  <div className="animate-pulse flex items-center gap-4 p-4 bg-white/5 rounded-lg">
    <div className="w-10 h-10 bg-white/10 rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-white/10 rounded w-3/4"></div>
      <div className="h-3 bg-white/10 rounded w-1/2"></div>
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="animate-pulse bg-white/5 rounded-xl p-6">
    <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-white/10 rounded-lg flex items-end justify-around p-4">
      {[40, 60, 45, 80, 55, 70, 50].map((height, i) => (
        <div 
          key={i} 
          className="bg-cyan-500/30 rounded-t w-8" 
          style={{ height: `${height}%` }}
        ></div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/5 rounded-xl p-6">
          <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-white/10 rounded w-2/3"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <div className="bg-white/5 rounded-xl p-6 space-y-4">
        <div className="h-6 bg-white/10 rounded w-1/3"></div>
        {[1, 2, 3, 4].map((i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
