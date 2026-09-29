import Link from 'next/link';
import { XCircle, ShieldCheck } from 'lucide-react';

export default function CertificateNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Certificate Not Found</h1>
          <p className="mt-2 text-sm text-gray-600">
            The certificate you are looking for could not be found. Please verify the certificate number and try again.
          </p>
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-gray-500">
              If you believe this is an error, please contact ASAM administration.
            </p>
          </div>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy/90"
          >
            <ShieldCheck className="h-4 w-4" />
            Return to ASAM website
          </Link>
        </div>
      </div>
    </div>
  );
}
