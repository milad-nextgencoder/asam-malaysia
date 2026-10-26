export const ADMIN_PAGE_SIZE = 50;
export function readDirectoryParams(params: Record<string, string | string[] | undefined> = {}) {
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const raw = Number(first(params.page));
  const page = Number.isSafeInteger(raw) && raw > 0 ? Math.min(raw, 100000) : 1;
  const q = (first(params.q) || '').trim().slice(0, 100);
  const candidate = first(params.status) || 'all';
  const status = ['all','draft','submitted','under_review','approved','rejected','new','read','replied','archived','published','active','inactive','coming_soon'].includes(candidate) ? candidate : 'all';
  return { page, q, status, offset: (page - 1) * ADMIN_PAGE_SIZE };
}
