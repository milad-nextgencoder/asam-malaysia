import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';
import { notFound } from 'next/navigation';
import { adminModules } from '@/lib/admin/modules';
import { AdminHomepageManager } from '@/components/admin/admin-homepage-manager';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection } from '@/lib/homepage/types';
import { contentConfig, pageContentModules, pageContentPageKeys, pageItemsModules, pageItemPageKeys, type ContentModule, type PageContentModule, type PageItemsModule } from '@/lib/admin/content-config';
import { AdminContentManager } from '@/components/admin/admin-content-manager';
import { AdminRemainingManager } from '@/components/admin/admin-remaining-manager';
import { requireAdmin, requireSuperAdmin } from '@/lib/supabase/admin';

interface AdminModulePageProps {
  params: { module: string };
}

export default async function AdminModulePage({ params }: AdminModulePageProps) {
  const restricted = ['settings', 'users', 'audit-logs'].includes(params.module);
  const identity = restricted ? await requireSuperAdmin() : await requireAdmin();
  if (params.module === 'homepage') {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('id, section_key, title, subtitle, description, image_url, button_text, button_url, secondary_button_text, secondary_button_url, display_order, visible, status, created_at, updated_at')
      .order('display_order', { ascending: true });
    return <AdminHomepageManager initialSections={(data ?? []) as HomepageSection[]} loadFailed={Boolean(error)} />;
  }

  if (['gallery', 'messages', 'settings', 'users', 'audit-logs'].includes(params.module)) {
    const supabase = createClient();
    let records: Record<string, any>[] = [];
    let settings: Record<string, any> | null = null;
    let loadFailed = false;
    if (params.module === 'gallery') {
      let result = await supabase.from('gallery_albums').select('*').order('display_order').range(0, 99);
      if (result.error) {
        // Existing rows remain manageable before the additive category migration is applied.
        result = await supabase.from('gallery_albums').select('id,name,description,cover_image_url,display_order,status,created_at,updated_at').order('display_order').range(0, 99);
      }
      records = result.data ?? []; loadFailed = Boolean(result.error);
    } else if (params.module === 'messages') {
      const result = await supabase.from('contact_messages').select('id,name,email,subject,message,status,created_at').order('created_at', { ascending: false }).range(0, 249);
      records = result.data ?? []; loadFailed = Boolean(result.error);
    } else if (params.module === 'settings') {
      const result = await supabase.from('site_settings').select('*').eq('singleton', true).maybeSingle();
      settings = result.data; loadFailed = Boolean(result.error);
    } else if (params.module === 'users') {
      const result = await supabase.from('admin_roles').select('user_id,role,created_at,updated_at').order('created_at');
      records = result.data ?? []; loadFailed = Boolean(result.error);
    } else {
      const result = await supabase.from('audit_logs').select('id,actor_user_id,action,entity_type,entity_id,metadata,created_at').order('created_at', { ascending: false }).range(0, 249);
      records = result.data ?? []; loadFailed = Boolean(result.error);
    }
    return <>
      {loadFailed && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">This information could not be loaded. Check your connection and administrator access.</p>}
      {params.module === 'settings' && !settings && <p role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">The existing singleton settings row is missing. This screen will not create a duplicate; restore the existing row through a reviewed database operation.</p>}
      <AdminRemainingManager module={params.module} records={records} settings={settings} role={identity.role} />
    </>;
  }

  if (pageContentModules.includes(params.module as PageContentModule)) {
    const sectionModule = params.module as PageContentModule;
    const itemModule = `${params.module}-items` as PageItemsModule;
    const supabase = createClient();
    const [sectionsResult, itemsResult] = await Promise.all([
      supabase.from('page_sections').select('*').eq('page_key', pageContentPageKeys[sectionModule]).order('display_order', { ascending: true }),
      supabase.from('page_items').select('*').eq('page_key', pageItemPageKeys[itemModule]).order('collection_key', { ascending: true }).order('display_order', { ascending: true }),
    ]);
    return <>
      {(sectionsResult.error || itemsResult.error) && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Some page content could not be loaded. Check the database migration and administrator access.</p>}
      <AdminContentManager module={sectionModule} initialRecords={sectionsResult.data ?? []} />
      <div className="my-8 border-t border-[#e1e4e8]" />
      <AdminContentManager module={itemModule} initialRecords={itemsResult.data ?? []} />
    </>;
  }

  if (pageItemsModules.includes(params.module as PageItemsModule)) notFound();

  if (params.module in contentConfig) {
    const contentType = params.module as ContentModule;
    const config = contentConfig[contentType];
    const supabase = createClient();
    let query = supabase.from(config.table).select('*');
    if (pageContentModules.includes(contentType as PageContentModule)) query = query.eq('page_key', pageContentPageKeys[contentType as PageContentModule]);
    query = config.ordered ? query.order('display_order', { ascending: true }) : query.order('created_at', { ascending: false });
    const { data, error } = await query;
    let departments: { id: string; name: string; number: string }[] = [];
    if (contentType === 'leadership') {
      const result = await supabase.from('departments').select('id,name,number').order('display_order', { ascending: true });
      departments = result.data ?? [];
    }
    return <>
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">The database content could not be loaded. Refresh after checking your connection and administrator access.</p>}
      <AdminContentManager module={contentType} initialRecords={data ?? []} departments={departments} />
    </>;
  }

  const moduleInfo = adminModules.find((item) => item.href === `/admin/${params.module}`);
  if (!moduleInfo) notFound();

  return (
    <section className="mx-auto flex min-h-[52vh] max-w-3xl items-center py-8">
      <div className="w-full rounded-lg border border-[#e3e5e8] bg-white p-6 shadow-sm sm:p-9">
        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[#ece7d9] bg-[#faf8f2] text-[#927535]">
          <Construction className="h-5 w-5" />
        </div>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a7c36]">
          Module not yet configured
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-[#172436]">{moduleInfo.label}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {moduleInfo.description} This page is a placeholder; no content has been added or changed.
        </p>
        <Link
          href="/admin"
          className="mt-7 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
