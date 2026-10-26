import Link from 'next/link';
export function DirectorySearch({ query, status, statuses = [] }: { query: string; status: string; statuses?: string[] }) {
  return <form method="get" className="mb-4 flex flex-wrap gap-3 rounded-lg border bg-white p-4">
    <input aria-label="Search all records" name="q" defaultValue={query} maxLength={100} placeholder="Search all records" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" />
    {statuses.length > 0 && <select aria-label="Filter status" name="status" defaultValue={status} className="rounded-lg border px-3 py-2 text-sm"><option value="all">All statuses</option>{statuses.map(item=><option key={item} value={item}>{item.replaceAll('_',' ')}</option>)}</select>}
    <button className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">Search</button><Link href="?" className="self-center text-sm underline">Reset</Link>
  </form>;
}
