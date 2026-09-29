'use client';

import { useState, type ChangeEvent } from 'react';
import { Camera, LoaderCircle } from 'lucide-react';
import { uploadProfilePhoto } from '@/app/member/actions/profile';

interface MemberProfilePhotoUploadProps {
  currentPhotoUrl: string | null;
  userId: string;
}

export function MemberProfilePhotoUpload({ currentPhotoUrl }: MemberProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('photo', file);

    const result = await uploadProfilePhoto(formData);
    if (!result.ok) {
      setError(result.message);
      setUploading(false);
      return;
    }

    setPreview(result.url || null);
    setUploading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
          {preview || currentPhotoUrl ? (
            <img src={preview || currentPhotoUrl || ''} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">JPEG, PNG, or WebP. Max 5MB.</p>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}
