'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ADMIN_FEEDBACK,
  feedbackFor,
  toSafeErrorMessage,
  type AdminActionResult,
} from '@/lib/admin/feedback';

/**
 * Admin action feedback for a single CMS screen.
 *
 * Gives every save/create/update/delete/publish action the same behaviour:
 * a pending state, a success or failure toast, a matching in-page banner, and a
 * re-entry guard so a double-tap cannot submit the same operation twice.
 *
 * The inline banner is retained deliberately: toasts are visual and transient,
 * while `role="status"` / `role="alert"` text is what screen readers announce.
 */
export function useAdminFeedback() {
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);

  const clear = useCallback(() => {
    setNotice('');
    setError('');
  }, []);

  /**
   * Runs an admin action with visible feedback and duplicate-submission protection.
   *
   * `inFlight` is a ref rather than derived state because two clicks in the same
   * tick would both observe the pre-update `pending` value; the ref is updated
   * synchronously, so the second call is rejected immediately.
   */
  const run = useCallback(
    async <T,>(
      action: () => Promise<AdminActionResult>,
      options: {
        /** Confirmation shown on success. */
        success?: string;
        /** Show the "Saving..." toast while the action runs. */
        loading?: boolean;
        /**
         * Called with the raw action result after a successful write, so callers
         * can apply server data (e.g. the saved record) before re-fetching.
         */
        onSuccess?: (result: Exclude<AdminActionResult, null | undefined>) => void;
      } = {}
    ): Promise<boolean> => {
      if (inFlight.current) return false;
      inFlight.current = true;

      const { success = ADMIN_FEEDBACK.saved, loading = true, onSuccess } = options;

      clear();
      setPending(true);

      // toast.loading returns an id (string | number) in sonner's typings, so the
      // handle is captured for an explicit dismiss instead of relying on the
      // returned toast object.
      let pendingToastId: string | number | undefined;
      if (loading) pendingToastId = toast.loading(ADMIN_FEEDBACK.saving);
      const dismissPending = () => {
        if (pendingToastId !== undefined) toast.dismiss(pendingToastId);
      };

      try {
        const result = await action();
        dismissPending();

        const outcome = feedbackFor(result, success);
        if (outcome.ok) {
          setNotice(outcome.message);
          toast.success(outcome.message);
          // The narrowed result is passed through so callers can apply the row
          // the server just wrote (e.g. the updated homepage section).
          onSuccess?.(result as Exclude<AdminActionResult, null | undefined>);
          return true;
        }

        setError(outcome.message);
        toast.error(outcome.message);
        return false;
      } catch (thrown) {
        dismissPending();
        const message = toSafeErrorMessage(thrown);
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setPending(false);
        inFlight.current = false;
      }
    },
    [clear]
  );

  return { run, notice, error, pending, clear, setNotice, setError };
}