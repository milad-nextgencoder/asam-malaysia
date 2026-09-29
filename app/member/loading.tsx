export default function MemberLoading() {
  return (
    <div className="space-y-6" aria-label="Loading member dashboard" role="status">
      <span className="sr-only">Loading your member profile...</span>
      <div className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-white" />
    </div>
  );
}
