'use client';

import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateProfile } from '@/app/member/actions/profile';
import { MemberProfilePhotoUpload } from './member-profile-photo-upload';
import type { MemberProfile, UniversityOption } from '@/lib/member/types';

interface MemberProfileFormProps {
  profile: MemberProfile;
  universities: UniversityOption[];
}

export function MemberProfileForm({ profile, universities }: MemberProfileFormProps) {
  const [firstName, setFirstName] = useState(profile.first_name || '');
  const [middleName, setMiddleName] = useState(profile.middle_name || '');
  const [lastName, setLastName] = useState(profile.last_name || '');
  const [preferredName, setPreferredName] = useState(profile.preferred_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [universityId, setUniversityId] = useState(profile.university_id || '');
  const [program, setProgram] = useState(profile.program || '');
  const [faculty, setFaculty] = useState(profile.faculty || '');
  const [city, setCity] = useState(profile.city || '');
  const [state, setState] = useState(profile.state || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');

    const payload = {
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      preferred_name: preferredName,
      phone,
      university_id: universityId || null,
      program,
      faculty,
      city,
      state,
      bio,
    };

    const result = await updateProfile(payload);

    if (!result.ok) {
      setError(result.message);
      setBusy(false);
      return;
    }

    setMessage('Profile saved successfully.');
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div
          className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-gray-900">Profile Photo</h3>
        <MemberProfilePhotoUpload
          currentPhotoUrl={profile.profile_photo_url}
          userId={profile.user_id}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-gray-900">Name</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-first-name">First Name</Label>
            <Input
              id="profile-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-middle-name">Middle Name</Label>
            <Input
              id="profile-middle-name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-last-name">Last Name</Label>
            <Input
              id="profile-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-preferred-name">Preferred Name</Label>
            <Input
              id="profile-preferred-name"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-gray-900">Contact</h3>

        <div className="space-y-2">
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={busy}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-gray-900">Academic</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>University</Label>

            <Select
              value={universityId || undefined}
              onValueChange={(value) => setUniversityId(value || '')}
              disabled={busy}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your university" />
              </SelectTrigger>

              <SelectContent>
                {universities.length === 0 && !universityId ? (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    No universities available
                  </div>
                ) : (
                  <>
                    {universityId &&
                      !universities.find((u) => u.id === universityId) && (
                        <SelectItem value={universityId}>
                          Current university (unpublished)
                        </SelectItem>
                      )}

                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id}>
                        {uni.name}{uni.state ? ` — ${uni.state}` : ''}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-program">Program / Field of Study</Label>
            <Input
              id="profile-program"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-faculty">Faculty / School</Label>
            <Input
              id="profile-faculty"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-gray-900">Location</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-city">City</Label>
            <Input
              id="profile-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-state">State</Label>
            <Input
              id="profile-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-gray-900">About</h3>

        <div className="space-y-2">
          <Label htmlFor="profile-bio">Bio</Label>

          <Textarea
            id="profile-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={busy}
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {busy ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}