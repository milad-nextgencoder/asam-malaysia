import Link from 'next/link';
import { XCircle, ShieldCheck } from 'lucide-react';

export default function MemberNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <ShieldCheck className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-navy">ASAM</h1>
          <p className="mt-1 text-sm text-gray-500">Membership Verification</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="bg-red-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-white" />
              <div>
                <p className="font-semibold text-white">Member Not Found</p>
                <p className="text-xs text-white/80">This Member ID could not be found.</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600">
              The Member ID you entered does not match any current ASAM membership record. Please verify the ID and try again.
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4 text-center">
              <p className="text-xs text-gray-400">Verified via ASAM Member Portal</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-navy hover:underline">
            Return to ASAM website
          </Link>
        </div>
      </div>
    </div>
  );
}
