/** The HTTP boundary is independently testable; authorization always precedes Chromium. */
type Dependencies = {
  authorize: (memberId: string) => Promise<{ code?: string; message?: string } | null>;
  render: (memberId: string) => Promise<Uint8Array>;
};
export async function certificateDownloadResponse(memberId: string, dependencies: Dependencies): Promise<Response> {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
  const failure = (message: string, status: number) => Response.json({ error: message }, {
    status, headers: { ...headers, ...(status === 429 ? { 'Retry-After': '60' } : {}) },
  });
  if (!/^[A-Za-z0-9-]{3,40}$/.test(memberId)) return failure('Certificate not found.', 404);
  try {
    const denied = await dependencies.authorize(memberId);
    if (denied) {
      const status = ({ PT401: 401, PT403: 403, PT429: 429 } as Record<string, number>)[denied.code || ''] || 503;
      const messages: Record<number, string> = {
        401: 'Sign in as the certificate owner to download this certificate.',
        403: 'You cannot download this certificate.',
        429: 'Please wait a minute before downloading again.',
        503: 'Certificate authorization is temporarily unavailable. Please try again.',
      };
      return failure(messages[status], status);
    }
    const bytes = await dependencies.render(memberId);
    if (bytes.length < 5 || String.fromCharCode(...Array.from(bytes.slice(0, 5))) !== '%PDF-') return failure('The certificate could not be generated as a PDF.', 503);
    return new Response(bytes, { headers: {
      ...headers, 'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="ASAM-Certificate-' + memberId + '.pdf"',
      'Content-Length': String(bytes.length),
    } });
  } catch (error) {
    console.error('Certificate download failed:', error);
    const status = error && typeof error === 'object' && 'status' in error && [400,404,429,503].includes(Number(error.status)) ? Number(error.status) : 503;
    return failure(status === 404 ? 'Certificate not found.' : 'The certificate could not be downloaded. Please try again shortly.', status);
  }
}
