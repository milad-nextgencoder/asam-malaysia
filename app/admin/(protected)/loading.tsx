export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-label="Loading admin dashboard" role="status">
      <span className="sr-only">Loading dashboard statistics, recent activity, and system status...</span>
      <div className="h-40 animate-pulse rounded-lg bg-[#17263a]" />
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg border border-border bg-white" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
        <div className="h-64 animate-pulse rounded-lg border border-border bg-white" />
        <div className="space-y-5">
          <div className="h-36 animate-pulse rounded-lg border border-border bg-white" />
          <div className="h-48 animate-pulse rounded-lg border border-border bg-white" />
        </div>
      </div>
    </div>
  );
}
