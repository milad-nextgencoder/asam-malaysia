import { NextResponse } from 'next/server';
import { generateCertificatePDF, CertificatePdfError } from '@/lib/member/certificate-pdf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MEMBER_ID_PATTERN = /^[A-Za-z0-9-]{3,40}$/;

/**
 * Streams the certificate as a PDF.
 *
 * The generator performs the single database read and reports precise statuses
 * (404 not found, 400 not active, 503 renderer unavailable), so this route does
 * not query the database a second time. Access is enforced by row level security
 * inside lib/member/certificate.ts.
 */
export async function GET(
  _request: Request,
  { params }: { params: { 'member-id': string } }
) {
  const memberId = params['member-id'];

  if (!MEMBER_ID_PATTERN.test(memberId)) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  try {
    const pdfBytes = await generateCertificatePDF(memberId);
    const safeMemberId = memberId.replace(/[^A-Za-z0-9-]/g, '');

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ASAM-Certificate-${safeMemberId}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    const status = error instanceof CertificatePdfError ? error.status : 500;
    const message = error instanceof CertificatePdfError ? error.message : 'Failed to generate PDF';

    if (status >= 500) {
      console.error('Certificate PDF error:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

