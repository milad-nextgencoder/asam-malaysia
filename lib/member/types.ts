export interface MemberProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
  email: string | null;
  phone: string | null;
  profile_photo_url: string | null;
  university_id: string | null;
  program: string | null;
  faculty: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberProfileInput {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  preferred_name?: string;
  phone?: string;
  profile_photo_url?: string;
  university_id?: string | null;
  program?: string;
  faculty?: string;
  city?: string;
  state?: string;
  bio?: string;
}

export interface UniversityOption {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

export interface MembershipApplication {
  id: string;
  user_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  member_id: string | null;
  certificate_number: string | null;
  rejection_reason: string | null;
  application_submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}
