'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { updateMemberProfile } from '@/lib/member/profile';
import type { MemberProfileInput } from '@/lib/member/types';

const profileInputSchema = z.object({
  first_name: z.string().trim().max(100).optional(),
  middle_name: z.string().trim().max(100).optional(),
  last_name: z.string().trim().max(100).optional(),
  preferred_name: z.string().trim().max(100).optional(),
  phone: z.string().trim().min(6, 'Phone number is too short.').max(20).optional(),
  profile_photo_url: z.string().url().max(2048).optional(),
  university_id: z.string().uuid().optional().nullable(),
  program: z.string().trim().max(200).optional(),
  faculty: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(2000).optional(),
});

export async function updateProfile(input: MemberProfileInput) {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) return { ok: false as const, message: 'Not authenticated.' };

  const parsed = profileInputSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { ok: false as const, message: firstError?.message ?? 'Invalid input.' };
  }

  try {
    const profile = await updateMemberProfile(userId, parsed.data);
    revalidatePath('/member');
    revalidatePath('/member/profile');
    return { ok: true as const, profile };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : 'Update failed.' };
  }
}

export async function uploadProfilePhoto(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) return { ok: false as const, message: 'Not authenticated.' };

  const file = formData.get('photo') as File;
  if (!file) return { ok: false as const, message: 'No file provided.' };

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { ok: false as const, message: 'Invalid file type. Use JPEG, PNG, or WebP.' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { ok: false as const, message: 'File too large. Maximum 5MB.' };
  }

  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
  const path = `member-profiles/${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('asam-public-media')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return { ok: false as const, message: 'Upload failed.' };

  const { data: urlData } = supabase.storage.from('asam-public-media').getPublicUrl(path);
  const photoUrl = urlData.publicUrl;

  try {
    await updateMemberProfile(userId, { profile_photo_url: photoUrl });
    revalidatePath('/member');
    revalidatePath('/member/profile');
    return { ok: true as const, url: photoUrl };
  } catch {
    return { ok: false as const, message: 'Failed to update profile.' };
  }
}
