'use client';

import { useCallback, useRef, useState } from 'react';

type Result = { ok: boolean; message?: string };
/** Synchronous double-submit guard, recoverable failures, and consistent accessible feedback. */
export function useMemberAction() {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const run = useCallback(async <T extends Result,>(
    action: () => Promise<T>,
    onSuccess?: (result: T) => void,
    successMessage = ''
  ): Promise<boolean> => {
    if (inFlight.current) return false;
    inFlight.current = true;
    setPending(true); setError(''); setNotice('');
    try {
      const result = await action();
      if (!result.ok) { setError(result.message || 'The request could not be completed. Please try again.'); return false; }
      setNotice(successMessage);
      onSuccess?.(result);
      return true;
    } catch {
      setError('Your connection was interrupted. Please try again.');
      return false;
    } finally { inFlight.current = false; setPending(false); }
  }, []);
  return { run, pending, error, notice };
}
