import Link from 'next/link';
import { ADMIN_PAGE_SIZE } from '@/lib/admin/pagination';

export function DirectoryPagination({ base, page, total, query = '', status = 'all' }: { base: string; page: number; total: number; query?: string; status?: string }) {
  const href = (next: number) => base + '?' + new URLSearchParams({ page: String(next), q: query, status }).toString();
  return <nav aria-label="Results pagination" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4 text-sm">
    <span>{total ? 'Showing ' + ((page - 1) * ADMIN_PAGE_SIZE + 1) + ' to ' + Math.min(page * ADMIN_PAGE_SIZE, total) + ' of ' + total : 'No matching results'}</span>
    <div className="flex items-center gap-4">{page > 1 && <Link href={href(page - 1)} className="font-semibold text-navy underline">Previous</Link>}
      <span>Page {page}</span>{page * ADMIN_PAGE_SIZE < total && <Link href={href(page + 1)} className="font-semibold text-navy underline">Next</Link>}</div>
  </nav>;
}
