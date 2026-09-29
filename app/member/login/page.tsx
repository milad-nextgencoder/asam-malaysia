import { MemberLoginForm } from '@/components/member/member-login-form';

interface MemberLoginPageProps {
  searchParams?: {
    error?: string | string[];
    notice?: string | string[];
  };
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function MemberLoginPage({ searchParams }: MemberLoginPageProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-gray-900">Member Sign In</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to your ASAM member account
          </p>
        </div>
        <MemberLoginForm
          initialError={firstValue(searchParams?.error)}
          initialNotice={firstValue(searchParams?.notice)}
        />
      </div>
    </div>
  );
}
