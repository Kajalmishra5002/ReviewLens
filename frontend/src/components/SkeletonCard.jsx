export default function SkeletonCard() {
  return (
    <div className="relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 p-5 shadow-lg h-full overflow-hidden">
      
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/60 dark:via-slate-700/20 to-transparent pointer-events-none" />

      {/* Image placeholder */}
      <div className="mb-5 rounded-xl bg-slate-100 dark:bg-slate-800 aspect-[4/3] animate-pulse" />

      {/* Badge row */}
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        <div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
      </div>

      {/* Title */}
      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mb-2" />
      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mb-4" />

      {/* Rating */}
      <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-3" />

      {/* Sentiment bar */}
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse mb-5" />

      {/* Price */}
      <div className="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mb-4" />

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
