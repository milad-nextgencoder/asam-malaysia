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
 *
 * Success is always a real PDF: generateCertificatePDF verifies the "%PDF-"
 * signature before returning, and this route re-checks it, so a 200 response can
 * never carry a JSON error body. Failures are JSON with a matching non-2xx status,
 * which the download button in the member portal detects and reports.
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

    // Final guard at the response boundary. A Uint8Array body is not a string, so
    // this is only reached if the generator's own check were ever bypassed.
    // Indexed rather than spread because the project targets es5.
    const isPdf =
      pdfBytes.length >= 4 &&
      pdfBytes[0] === 0x25 &&
      pdfBytes[1] === 0x50 &&
      pdfBytes[2] === 0x44 &&
      pdfBytes[3] === 0x46;
    if (!isPdf) {
      console.error(
        'Certificate PDF route refused a non-PDF body for member',
        memberId
      );
      return NextResponse.json(
        { error: 'The certificate could not be generated as a PDF.' },
        { status: 503 }
      );
    }

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ASAM-Certificate-${safeMemberId}.pdf"`,
        'Cache-Control': 'private, no-store',
        // Tells the browser the length is a byte count, not a character count, so
        // the download is not truncated on some mobile clients.
        'Content-Length': String(pdfBytes.length),
      },
    });
  } catch (error) {
    const status = error instanceof CertificatePdfError ? error.status : 500;
    const message = error instanceof CertificatePdfError ? error.message : 'Failed to generate PDF';

    // Server errors are logged rather than swallowed, so a misconfigured renderer
    // is diagnosable from the deployment logs.
    console.error('Certificate PDF error:', error);

    return NextResponse.json({ error: message }, { status });
  }
}

