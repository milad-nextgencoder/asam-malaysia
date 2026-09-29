import { MemberForgotPasswordForm } from '@/components/member/member-forgot-password-form';

export default function MemberForgotPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email to receive a password reset link
          </p>
        </div>
        <MemberForgotPasswordForm />
      </div>
    </div>
  );
}
