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
  phone: z.string().trim().max(20).refine((value) => !value || value.length >= 6, 'Phone number is too short.').optional(),
  profile_photo_url: z.string().url().max(2048).optional(),
  university_id: z.string().uuid().optional().nullable(),
  program: z.string().trim().max(200).optional(),
  faculty: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(2000).optional(),
});

export async function updateProfile(input: MemberProfileInput) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId) return { ok: false as const, message: 'Not authenticated.' };

  const parsed = profileInputSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { ok: false as const, message: firstError?.message ?? 'Invalid input.' };
  }

  try {
    const profile = await updateMemberProfile(userId, parsed.data);
    revalidatePath('/member');
    revalidatePath('/member/profile');
    revalidatePath('/member/membership');
    return { ok: true as const, profile };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : 'Update failed.' };
  }
}

export async function uploadProfilePhoto(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId) return { ok: false as const, message: 'Not authenticated.' };

  const file = formData.get('photo') as File;
  if (!(file instanceof File) || file.size === 0) return { ok: false as const, message: 'No file provided.' };

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { ok: false as const, message: 'Invalid file type. Use JPEG, PNG, or WebP.' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { ok: false as const, message: 'File too large. Maximum 5MB.' };
  }

  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  const png = [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((byte, index) => signature[index] === byte);
  const webp = String.fromCharCode(...Array.from(signature.slice(0, 4))) === 'RIFF' && String.fromCharCode(...Array.from(signature.slice(8, 12))) === 'WEBP';
  if (!(file.type === 'image/jpeg' && jpeg || file.type === 'image/png' && png || file.type === 'image/webp' && webp)) return { ok: false as const, message: 'This file is not a valid JPEG, PNG, or WebP image.' };
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
    revalidatePath('/member/membership');
    return { ok: true as const, url: photoUrl };
  } catch {
    return { ok: false as const, message: 'Failed to update profile.' };
  }
}
