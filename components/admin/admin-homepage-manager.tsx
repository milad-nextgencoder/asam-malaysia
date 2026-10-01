'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, LoaderCircle, Pencil, RotateCcw, Save, Send, X } from 'lucide-react';
import { recordHomepageImageUpload, reorderHomepageSections, saveHomepageSection, setHomepageVisibility } from '@/app/admin/actions/homepage';
import { ADMIN_FEEDBACK } from '@/lib/admin/feedback';
import { useAdminFeedback } from '@/lib/admin/use-admin-feedback';
import { createClient } from '@/lib/supabase/client';
import { homepageSectionGroups, type HomepageSection } from '@/lib/homepage/types';

type ManagerProps = { initialSections: HomepageSection[]; loadFailed?: boolean };
type EditorValue = {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  button_text: string;
  button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
  display_order: number;
  visible: boolean;
  status: HomepageSection['status'];
};

const fields: Array<{ name: keyof EditorValue; label: string; kind?: 'textarea' | 'url' | 'number'; helper?: string }> = [
  { name: 'title', label: 'Title / Heading' },
  { name: 'subtitle', label: 'Eyebrow / Subtitle' },
  { name: 'description', label: 'Description', kind: 'textarea' },
  { name: 'image_url', label: 'Image / Hero background image', kind: 'url', helper: 'Use a secure link or the image uploader. Existing image files are kept when replaced.' },
  { name: 'button_text', label: 'Button Text' },
  { name: 'button_url', label: 'Button URL', kind: 'url' },
  { name: 'secondary_button_text', label: 'Secondary Button Text' },
  { name: 'secondary_button_url', label: 'Secondary Button URL', kind: 'url' },
  { name: 'display_order', label: 'Display Order', kind: 'number' },
];

function toEditorValue(section: HomepageSection): EditorValue {
  return {
    title: section.title,
    subtitle: section.subtitle ?? '',
    description: section.description ?? '',
    image_url: section.image_url ?? '',
    button_text: section.button_text ?? '',
    button_url: section.button_url ?? '',
    secondary_button_text: section.secondary_button_text ?? '',
    secondary_button_url: section.secondary_button_url ?? '',
    display_order: section.display_order,
    visible: section.visible,
    status: section.status,
  };
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function statusStyle(status: string) {
  if (status === 'published') return 'bg-emerald-50 text-emerald-800 ring-emerald-200';
  if (status === 'archived') return 'bg-slate-100 text-slate-700 ring-slate-200';
  return 'bg-amber-50 text-amber-800 ring-amber-200';
}

export function AdminHomepageManager({ initialSections, loadFailed = false }: ManagerProps) {
  const [sections, setSections] = useState(initialSections);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  // Shared feedback gives these actions the same "Saving..." / "Saved
  // successfully" / "Published successfully" / "Could not save changes" treatment
  // as the content manager, plus a re-entry guard and a toast that stays visible
  // when the inline banner is scrolled out of view.
  const { run: runWithFeedback, notice, error: errorMessage, pending: working } =
    useAdminFeedback();
  const sortedGroups = useMemo(() => [...homepageSectionGroups].sort((a, b) => {
    const aOrder = Math.min(...a.keys.map((key) => sections.find((item) => item.section_key === key)?.display_order ?? 9999));
    const bOrder = Math.min(...b.keys.map((key) => sections.find((item) => item.section_key === key)?.display_order ?? 9999));
    return aOrder - bOrder;
  }), [sections]);

  const published = homepageSectionGroups.filter((group) => group.keys.every((key) => {
    const item = sections.find((section) => section.section_key === key);
    return item?.status === 'published' && item.visible;
  })).length;
  const drafts = homepageSectionGroups.filter((group) => group.keys.some((key) => sections.find((section) => section.section_key === key)?.status === 'draft')).length;
  const hidden = homepageSectionGroups.filter((group) => group.keys.some((key) => sections.find((section) => section.section_key === key)?.visible === false)).length;
  const lastUpdated = sections.reduce<string | null>((latest, item) => !latest || item.updated_at > latest ? item.updated_at : latest, null);

  function applySection(updated: Partial<HomepageSection> & { section_key: string }) {
    setSections((current) => current.map((item) => item.section_key === updated.section_key ? { ...item, ...updated } : item));
  }

  function visibility(group: (typeof homepageSectionGroups)[number], next: boolean) {
    const changed = group.keys.filter((key) => sections.some((item) => item.section_key === key));
    if (!changed.length) return;
    void runWithFeedback(() => setHomepageVisibility(changed, next), {
      success: next ? ADMIN_FEEDBACK.saved : ADMIN_FEEDBACK.saved,
      onSuccess: () =>
        setSections((current) => current.map((item) => changed.includes(item.section_key) ? { ...item, visible: next, updated_at: new Date().toISOString() } : item)),
    });
  }

  function moveGroup(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sortedGroups.length) return;
    const order = sortedGroups.map((item) => item.key);
    [order[index], order[target]] = [order[target], order[index]];
    void runWithFeedback(() => reorderHomepageSections(order), {
      success: ADMIN_FEEDBACK.saved,
      onSuccess: () =>
        setSections((current) =>
          current.map((item) => {
            const group = homepageSectionGroups.find((candidate) => candidate.keys.includes(item.section_key));
            const groupIndex = group ? order.indexOf(group.key) : -1;
            const memberIndex = group ? group.keys.indexOf(item.section_key) : 0;
            const displayOrder = groupIndex < 0 ? item.display_order : 1 + order.slice(0, groupIndex).reduce((sum, key) => sum + (homepageSectionGroups.find((candidate) => candidate.key === key)?.keys.length ?? 0), 0) + memberIndex;
            return groupIndex < 0 ? item : { ...item, display_order: displayOrder, updated_at: new Date().toISOString() };
          })
        ),
    });
  }

  function save(sectionKey: string, value: EditorValue, status: HomepageSection['status']) {
    void runWithFeedback(
      () => saveHomepageSection({ section_key: sectionKey, ...value, status }),
      {
        success: status === 'published' ? ADMIN_FEEDBACK.published : ADMIN_FEEDBACK.saved,
        onSuccess: (result) => {
          const section = (result as { section?: HomepageSection } | undefined)?.section;
          if (section) applySection(section as HomepageSection);
          if (status !== 'draft') setEditingKey(null);
        },
      }
    );
  }

  if (loadFailed) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">Homepage content could not be loaded. Please refresh or check the Supabase connection.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7437]">ASAM Content Studio</div>
            <h1 className="mt-2 font-display text-3xl font-bold text-[#101b2b] sm:text-4xl">HOMEPAGE MANAGEMENT</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Control the content and visual presentation of the ASAM public homepage.</p>
          </div>
          <div className="rounded-xl border border-[#e8e3d8] bg-[#faf9f6] px-4 py-3 text-sm">
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Last Updated</div>
            <div className="mt-1 font-semibold text-[#101b2b]">{formatDate(lastUpdated)}</div>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Summary label="Published" value={published} tone="green" />
          <Summary label="Drafts" value={drafts} tone="gold" />
          <Summary label="Hidden" value={hidden} tone="slate" />
        </div>
      </header>

      {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</div>}
      {errorMessage && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{errorMessage}</div>}

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d9d2c4] bg-white px-6 py-16 text-center shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#101b2b]">No homepage sections yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">No section records were returned from the existing homepage_sections table.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedGroups.map((group, index) => {
            const rows = group.keys.map((key) => sections.find((item) => item.section_key === key)).filter((row): row is HomepageSection => Boolean(row));
            if (!rows.length) return null;
            const groupUpdated = rows.reduce((latest, row) => !latest || row.updated_at > latest ? row.updated_at : latest, null as string | null);
            const visible = rows.every((row) => row.visible);
            const statuses = Array.from(new Set(rows.map((row) => row.status)));
            return (
              <article key={group.key} className="rounded-xl border border-[#e5e1d7] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex flex-col gap-1 pt-1">
                      <button type="button" disabled={working || index === 0} onClick={() => moveGroup(index, -1)} aria-label={`Move ${group.title} up`} title="Move up" className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /><span className="sr-only">Move up</span></button>
                      <button type="button" disabled={working || index === sortedGroups.length - 1} onClick={() => moveGroup(index, 1)} aria-label={`Move ${group.title} down`} title="Move down" className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /><span className="sr-only">Move down</span></button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-bold text-[#101b2b]">{group.title}</h2>
                        {statuses.map((status) => <span key={status} className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ring-1 ring-inset ${statusStyle(status)}`}>{status}</span>)}
                        <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${visible ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>{visible ? 'Visible' : 'Hidden'}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{group.description}</p>
                      <div className="mt-2 text-xs text-slate-500">Order {Math.min(...rows.map((row) => row.display_order))} · Updated {formatDate(groupUpdated)}</div>
                      {rows.length > 1 && <div className="mt-3 flex flex-wrap gap-2">{rows.map((row) => <button key={row.section_key} type="button" onClick={() => setEditingKey(row.section_key)} className="rounded-md border border-[#e5e1d7] px-3 py-1.5 text-xs font-semibold text-[#26364a] hover:bg-[#faf9f6]">Edit {row.title}</button>)}</div>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {rows.length === 1 && <button type="button" onClick={() => setEditingKey(rows[0].section_key)} className="inline-flex items-center gap-2 rounded-lg border border-[#d8d2c6] px-3 py-2 text-sm font-semibold text-[#25354a] hover:bg-[#faf9f6]"><Pencil className="h-4 w-4" /> Edit</button>}
                    <button type="button" disabled={working} onClick={() => visibility(group, !visible)} className="inline-flex items-center gap-2 rounded-lg border border-[#d8d2c6] px-3 py-2 text-sm font-semibold text-[#25354a] hover:bg-[#faf9f6]">{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{visible ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                {rows.length > 1 && editingKey && group.keys.includes(editingKey) && sections.find((item) => item.section_key === editingKey) && (
                  <SectionEditor key={editingKey} section={sections.find((item) => item.section_key === editingKey)!} working={working} onCancel={() => setEditingKey(null)} onSave={save} />
                )}
                {rows.length === 1 && editingKey === rows[0].section_key && <SectionEditor section={rows[0]} working={working} onCancel={() => setEditingKey(null)} onSave={save} />}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: number; tone: 'green' | 'gold' | 'slate' }) {
  const tones = { green: 'border-emerald-100 bg-emerald-50 text-emerald-900', gold: 'border-amber-100 bg-amber-50 text-amber-900', slate: 'border-slate-200 bg-slate-50 text-slate-800' };
  return <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}><div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></div>;
}

function SectionEditor({ section, working, onCancel, onSave }: {
  section: HomepageSection;
  working: boolean;
  onCancel: () => void;
  onSave: (key: string, value: EditorValue, status: HomepageSection['status']) => void;
}) {
  const [value, setValue] = useState(() => toEditorValue(section));
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  function update<K extends keyof EditorValue>(name: K, next: EditorValue[K]) {
    setValue((current) => ({ ...current, [name]: next }));
  }

  async function upload(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setUploadMessage('Choose a JPG, PNG, WebP, or GIF image.'); return;
    }
    if (file.size > 20 * 1024 * 1024) { setUploadMessage('Images must be 20 MB or smaller.'); return; }
    const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' } as Record<string, string>)[file.type];
    const path = `homepage/${crypto.randomUUID()}.${extension}`;
    setUploading(true); setUploadMessage('Uploading image…');
    try {
      const supabase = createClient();
      const { error } = await supabase.storage.from('asam-public-media').upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('asam-public-media').getPublicUrl(path);
      const auditResult = await recordHomepageImageUpload(section.section_key, path);
      update('image_url', data.publicUrl);
      setUploadPreview(URL.createObjectURL(file));
      setUploadMessage(!auditResult.ok ? auditResult.message : auditResult.auditSaved ? 'Uploaded. Save or publish the section to use this image.' : 'Uploaded. Current database policy did not allow an audit record for this admin role. Save or publish to use the image.');
    } catch {
      setUploadMessage('The image upload failed. Check your connection and try another image.');
    } finally { setUploading(false); }
  }

  return (
    <div className="mt-6 border-t border-[#eeeae2] pt-6">
      <div className="flex items-start justify-between gap-4">
        <div><div className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a7437]">Editing {section.title}</div><p className="mt-1 text-xs text-slate-500">Draft preview stays inside the admin panel until published.</p></div>
        <button type="button" onClick={onCancel} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Cancel editing"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.filter((field) => field.name !== 'image_url' || section.section_key === 'hero').map((field) => <label key={field.name} className={field.kind === 'textarea' ? 'sm:col-span-2' : ''}>
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">{field.label}</span>
            {field.kind === 'textarea' ? <textarea rows={4} value={String(value[field.name])} onChange={(event) => update(field.name, event.target.value as never)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a27a36] focus:ring-2 focus:ring-[#c2a66c]/20" /> : <input type={field.kind === 'number' ? 'number' : 'text'} min={field.kind === 'number' ? 1 : undefined} value={String(value[field.name])} onChange={(event) => update(field.name, (field.kind === 'number' ? Number(event.target.value) : event.target.value) as never)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a27a36] focus:ring-2 focus:ring-[#c2a66c]/20" />}
            {field.helper && <span className="mt-1 block text-[9px] leading-5 text-slate-500">{field.helper}</span>}
          </label>)}
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm sm:col-span-2"><input type="checkbox" checked={value.visible} onChange={(event) => update('visible', event.target.checked)} className="h-4 w-4 accent-[#a27a36]" /><span><span className="block font-semibold text-slate-800">Visible</span><span className="text-xs text-slate-500">Hidden sections are not rendered publicly.</span></span></label>
          <div className="sm:col-span-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#d8d2c6] px-3 py-2 text-sm font-semibold text-[#25354a] hover:bg-[#faf9f6]"><ImagePlus className="h-4 w-4" />{uploading ? 'Uploading…' : 'Upload Image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading} onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ''; }} /></label>
            <div aria-live="polite" className="mt-2 text-xs text-slate-600">{uploadMessage}</div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 sm:col-span-2">
            <button type="button" disabled={working || uploading} onClick={() => onSave(section.section_key, value, 'draft')} className="inline-flex items-center gap-2 rounded-lg border border-[#c8c1b4] px-4 py-2.5 text-sm font-semibold text-[#25354a] hover:bg-slate-50 disabled:opacity-50"><Save className="h-4 w-4" />Save Draft</button>
            <button type="button" disabled={working || uploading} onClick={() => onSave(section.section_key, value, 'published')} className="inline-flex items-center gap-2 rounded-lg bg-[#101b2b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a2c43] disabled:opacity-50"><Send className="h-4 w-4" />Publish</button>
            {section.status === 'published' && <button type="button" disabled={working || uploading} onClick={() => { if (window.confirm('Unpublish this section? It will no longer appear on the public homepage.')) onSave(section.section_key, value, 'draft'); }} className="rounded-lg border border-amber-300 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-50">Unpublish</button>}
            {section.status !== 'archived' && <button type="button" disabled={working || uploading} onClick={() => { if (window.confirm('Archive this section? It will be removed from the active homepage.')) onSave(section.section_key, value, 'archived'); }} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Archive</button>}
            {working && <span className="inline-flex items-center gap-2 px-2 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />{ADMIN_FEEDBACK.saving}</span>}
            <button type="button" onClick={onCancel} className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"><RotateCcw className="h-4 w-4" />Cancel</button>
          </div>
        </div>
        <aside className="rounded-xl border border-[#e5e1d7] bg-[#faf9f6] p-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#9a7437]">Private Preview</div>
          {(uploadPreview || value.image_url) && <div className="relative mt-3 h-36 overflow-hidden rounded-lg bg-slate-100">{uploadPreview ? <Image src={uploadPreview} alt="Selected image preview" fill sizes="320px" unoptimized className="object-cover" /> : <Image src={value.image_url} alt="Current section image" fill sizes="320px" unoptimized className="object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}</div>}
          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{value.subtitle || 'ASAM'}</div>
          <div className="mt-2 font-display text-xl font-bold leading-tight text-[#101b2b]">{value.title || 'Untitled section'}</div>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{value.description || 'No description entered.'}</p>
          {value.button_text && value.button_url && <div className="mt-4 inline-flex rounded-lg bg-[#101b2b] px-3 py-2 text-xs font-semibold text-white">{value.button_text}</div>}
          {value.secondary_button_text && value.secondary_button_url && <div className="ml-2 mt-4 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">{value.secondary_button_text}</div>}
        </aside>
      </div>
    </div>
  );
}
