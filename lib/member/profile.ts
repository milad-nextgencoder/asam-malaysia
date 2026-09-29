import { createClient } from '@/lib/supabase/server';
import type { MemberProfile, MemberProfileInput, UniversityOption } from './types';

export async function ensureMemberProfile(
  userId: string,
  userMetadata?: Record<string, unknown>
): Promise<MemberProfile> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return existing;

  const fullName =
    (userMetadata?.full_name as string | undefined) ||
    (userMetadata?.name as string | undefined) ||
    null;

  const nameParts = fullName ? fullName.split(' ') : [];
  const firstName = nameParts[0] || null;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

  const { data: created, error } = await supabase
    .from('member_profiles')
    .insert({
      user_id: userId,
      email: (userMetadata?.email as string | undefined) || null,
      first_name: firstName,
      last_name: lastName,
      preferred_name: fullName,
    })
    .select('*')
    .maybeSingle();

  if (error && error.code !== '23505') throw error;

  if (!created) {
    const { data: retry } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return retry;
  }

  return created;
}

export async function getMemberProfile(userId: string): Promise<MemberProfile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

/**
 * Fetches all published universities for use in the profile form selector.
 * Returns an empty array if the query fails or no universities exist.
 */
export async function getPublishedUniversities(): Promise<UniversityOption[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('universities')
    .select('id, name, city, state')
    .eq('status', 'published')
    .order('name', { ascending: true });

  if (error || !data) return [];
  return data;
}

/**
 * Determines whether a member profile is "complete" based on the presence
 * of essential fields. Deterministic and server-side.
 *
 * A profile is considered complete when ALL of the following are non-empty
 * after trimming whitespace:
 * - first_name, last_name, preferred_name (identity)
 * - phone (contact)
 * - profile_photo_url (visual identity)
 * - university_id, program, faculty (academic)
 * - city, state (location)
 * - bio (personal introduction)
 */
export function calculateProfileCompletion(profile: {
  first_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
  phone: string | null;
  profile_photo_url: string | null;
  university_id: string | null;
  program: string | null;
  faculty: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
}): boolean {
  return Boolean(
    profile.first_name?.trim() &&
    profile.last_name?.trim() &&
    profile.preferred_name?.trim() &&
    profile.phone?.trim() &&
    profile.profile_photo_url?.trim() &&
    profile.university_id &&
    profile.program?.trim() &&
    profile.faculty?.trim() &&
    profile.city?.trim() &&
    profile.state?.trim() &&
    profile.bio?.trim()
  );
}

export async function updateMemberProfile(
  userId: string,
  input: MemberProfileInput
): Promise<MemberProfile> {
  const supabase = createClient();

  // First, get the current profile to merge with the input
  const { data: current } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Merge input over current values, but only include fields that are actually provided
  // This prevents null values from overwriting existing data
  const merged = { ...current } as MemberProfile;
  
  // Only update fields that are explicitly provided in the input
  if (input.first_name !== undefined) merged.first_name = input.first_name;
  if (input.middle_name !== undefined) merged.middle_name = input.middle_name;
  if (input.last_name !== undefined) merged.last_name = input.last_name;
  if (input.preferred_name !== undefined) merged.preferred_name = input.preferred_name;
  if (input.phone !== undefined) merged.phone = input.phone;
  if (input.profile_photo_url !== undefined) merged.profile_photo_url = input.profile_photo_url;
  if (input.university_id !== undefined) merged.university_id = input.university_id;
  if (input.program !== undefined) merged.program = input.program;
  if (input.faculty !== undefined) merged.faculty = input.faculty;
  if (input.city !== undefined) merged.city = input.city;
  if (input.state !== undefined) merged.state = input.state;
  if (input.bio !== undefined) merged.bio = input.bio;

  // Calculate profile completion
  const profile_completed = calculateProfileCompletion(merged);

  // Build update payload with only the fields that should be updated
  const updatePayload: Record<string, unknown> = { profile_completed };
  if (input.first_name !== undefined) updatePayload.first_name = input.first_name;
  if (input.middle_name !== undefined) updatePayload.middle_name = input.middle_name;
  if (input.last_name !== undefined) updatePayload.last_name = input.last_name;
  if (input.preferred_name !== undefined) updatePayload.preferred_name = input.preferred_name;
  if (input.phone !== undefined) updatePayload.phone = input.phone;
  if (input.profile_photo_url !== undefined) updatePayload.profile_photo_url = input.profile_photo_url;
  if (input.university_id !== undefined) updatePayload.university_id = input.university_id;
  if (input.program !== undefined) updatePayload.program = input.program;
  if (input.faculty !== undefined) updatePayload.faculty = input.faculty;
  if (input.city !== undefined) updatePayload.city = input.city;
  if (input.state !== undefined) updatePayload.state = input.state;
  if (input.bio !== undefined) updatePayload.bio = input.bio;

  const { data, error } = await supabase
    .from('member_profiles')
    .update(updatePayload)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
