import { createClient } from '@/lib/supabase/server';
import { generateCertificatePDF } from '@/lib/member/certificate-pdf';
import { certificateDownloadResponse } from '@/lib/member/certificate-download';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: Request, { params: paramsPromise }: { params: Promise<{ 'member-id': string }> }) {
  const params = await paramsPromise;
  return certificateDownloadResponse(params['member-id'], {
    authorize: async (memberId) => {
      const supabase = await createClient();
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) return { code: 'PT401' };
      const { data, error } = await supabase.rpc('authorize_certificate_download', { p_member_id: memberId });
      return error || (data === true ? null : { code: 'PT403' });
    },
    render: generateCertificatePDF,
  });
}
