import { ShieldCheck, Search, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { MemberVerificationForm } from '@/components/member/member-verification-form';

export const metadata = {
  title: 'Verify Membership',
  description: 'Verify ASAM membership status using an official Member ID.',
};

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy/5">
            <ShieldCheck className="h-8 w-8 text-navy" />
          </div>
          <h1 className="font-display text-2xl font-bold text-navy">ASAM</h1>
          <p className="mt-1 text-sm text-gray-500">Membership Verification</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <h2 className="font-display text-xl font-bold text-gray-900">Verify an ASAM Member</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter an official ASAM Member ID (e.g., ASAM-2026-000001) to verify membership status.
          </p>

          <MemberVerificationForm />

          <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
              <Search className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-900">How to verify</p>
                <p className="mt-1 text-sm text-blue-700">
                  Enter the Member ID found on the member&apos;s digital membership card or in their member portal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-900">Valid membership</p>
                <p className="mt-1 text-sm text-green-700">
                  If the Member ID is valid, you will see the member&apos;s name, university, and approval date.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
              <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-900">Invalid membership</p>
                <p className="mt-1 text-sm text-red-700">
                  If the Member ID is not found or the membership is not active, you will see an appropriate message.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-gray-500">
              <strong>Example Member ID format:</strong> ASAM-2026-000001
            </p>
            <p className="mt-1 text-xs text-gray-500">
              You can also scan the QR code on a member&apos;s digital membership card to verify their membership.
            </p>
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
