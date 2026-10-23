import React from 'react';

export function LoadingSkeleton({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-800/80 rounded-lg"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-slate-800 rounded" />
        <div className="h-5 w-12 bg-slate-800 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-slate-800 rounded" />
      <div className="h-3 w-1/2 bg-slate-800/60 rounded" />
      <div className="pt-2 flex gap-2">
        <div className="h-7 w-20 bg-slate-800 rounded-lg" />
        <div className="h-7 w-16 bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}
