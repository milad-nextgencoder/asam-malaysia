import { MemberRegisterForm } from '@/components/member/member-register-form';

export default function MemberRegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Register for an ASAM member account
          </p>
        </div>
        <MemberRegisterForm />
      </div>
    </div>
  );
}
