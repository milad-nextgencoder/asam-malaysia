import { AdminLoginForm } from '@/components/admin/admin-login-form';

interface AdminLoginPageProps {
  searchParams?: {
    error?: string | string[];
    notice?: string | string[];
  };
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  return (
    <AdminLoginForm
      initialError={firstValue(searchParams?.error)}
      initialNotice={firstValue(searchParams?.notice)}
    />
  );
}
