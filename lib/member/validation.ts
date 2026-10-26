/** Shared, deterministic account and profile rules. Database rules enforce the same invariants. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function registrationError(input: { email: string; password: string; firstName: string; lastName: string }): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(input.email)) || input.email.length > 254) return 'Enter a valid email address.';
  if (!input.firstName.trim() || !input.lastName.trim() || input.firstName.trim().length > 100 || input.lastName.trim().length > 100) return 'Enter your first and last name (up to 100 characters each).';
  if (input.password.length < 8 || input.password.length > 128) return 'Use a password between 8 and 128 characters.';
  return null;
}

export const requiredProfileFields = {
  first_name: 'First name', last_name: 'Last name', preferred_name: 'Preferred name',
  phone: 'Phone number', profile_photo_url: 'Profile photo', university_id: 'University',
  program: 'Program', faculty: 'Faculty', city: 'City', state: 'State', bio: 'Introduction',
} as const;

export function profileProgress(profile: Partial<Record<keyof typeof requiredProfileFields, string | null>>) {
  const missing = (Object.keys(requiredProfileFields) as Array<keyof typeof requiredProfileFields>)
    .filter((key) => !profile[key]?.trim());
  const total = Object.keys(requiredProfileFields).length;
  return { missing, completed: total - missing.length, total, percentage: Math.round((total - missing.length) / total * 100) };
}

export function registrationMessage(user: { identities?: unknown[] } | null) {
  // Auth may deliberately return an obfuscated response for an existing email.
  // Never treat its returned ID as evidence that a new account was persisted.
  return user && Array.isArray(user.identities) && user.identities.length === 0
    ? 'Use your existing account to sign in, or reset your password. Another membership ID will not be created.'
    : 'Check your email to continue. If you already registered, sign in or reset your password using the same email.';
}

export function safeSiteLink(value: string | null | undefined): string | null {
  if (!value || value !== value.trim() || /[\\\u0000-\u001f]/.test(value)) return null;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
