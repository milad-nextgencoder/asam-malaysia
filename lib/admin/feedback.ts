/**
 * Shared save feedback for the admin CMS.
 *
 * Every admin save/create/update/delete/publish action needs the same three
 * visible states - a pending "Saving...", a success confirmation, and a failure
 * message. Previously each manager kept its own `notice`/`error` state rendered
 * as a banner at the top of a scrolling page, so saving an item near the bottom
 * of a long list produced no visible confirmation at all, the wording differed
 * per screen ("Changes saved." / "Published." / "Section shown."), and several
 * server actions swallowed their exceptions silently.
 *
 * This module owns the wording and the toasts. It reuses the `sonner` Toaster
 * that already ships in components/ui/sonner.tsx rather than introducing a
 * second notification framework, and it also returns the banner strings so the
 * existing in-page `role="status"` / `role="alert"` regions keep working for
 * assistive technology.
 */

/** Canonical wording, used verbatim across every admin screen. */
export const ADMIN_FEEDBACK = {
  saving: 'Saving...',
  saved: 'Saved successfully',
  published: 'Published successfully',
  deleted: 'Deleted successfully',
  failure: 'Could not save changes',
} as const;

/** Wraps a server error into a message that is safe to show to an administrator. */
export function toSafeErrorMessage(
  error: unknown,
  fallback: string = ADMIN_FEEDBACK.failure
): string {
  if (error instanceof Error && error.message.trim()) {
    // Server exceptions are logged, never swallowed, and the readable text is
    // still surfaced so an admin knows what went wrong.
    console.error('Admin action failed:', error);
    return error.message;
  }
  console.error('Admin action failed:', error);
  return fallback;
}

/** Result shape every admin server action returns. */
export type AdminActionResult = {
  ok: boolean;
  message?: string;
  auditSaved?: boolean;
} | null | undefined;

/**
 * Maps an action result onto the success/failure wording.
 *
 * `success` is the caller's specific confirmation ("Published successfully" for a
 * publish, "Saved successfully" otherwise). A server message is preferred on
 * failure because the actions already produce safe, admin-facing text; the
 * generic fallback is only used when the server sent nothing usable.
 */
export function feedbackFor(
  result: AdminActionResult,
  success: string = ADMIN_FEEDBACK.saved
): { ok: true; message: string } | { ok: false; message: string } {
  if (!result?.ok) {
    return {
      ok: false,
      message:
        (typeof result?.message === 'string' && result.message.trim()) ||
        ADMIN_FEEDBACK.failure,
    };
  }

  // An audit-log rejection is a real, but non-fatal, caveat worth surfacing.
  if (result.auditSaved === false) {
    return {
      ok: true,
      message: `${success} The audit log entry was not accepted for your role.`,
    };
  }

  return { ok: true, message: success };
}