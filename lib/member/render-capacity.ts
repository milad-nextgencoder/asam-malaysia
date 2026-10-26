/** Per-process resource guard; shared per-account quotas are enforced in PostgreSQL. */
export function createRenderCapacity(limit = 2) {
  let active = 0;
  return {
    acquire() { if (active >= limit) return false; active += 1; return true; },
    release() { active = Math.max(0, active - 1); },
  };
}
