export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 ${className}`}
    />
  );
}

/** 笔记卡片骨架 */
export function NoteCardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <Skeleton className="mb-2 h-6 w-3/4" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/** 待办行骨架 */
export function TodoRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 flex-1" />
    </div>
  );
}

/** 统计卡片骨架 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <Skeleton className="mb-2 h-4 w-16" />
      <Skeleton className="h-8 w-10" />
    </div>
  );
}
