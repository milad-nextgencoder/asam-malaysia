import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Frequently Asked Questions', description: 'Answers to common questions about ASAM.' };

export default async function FAQPage() {
  const { data, error } = await createClient().from('faqs').select('id,question,answer,category,display_order').eq('status','published').order('display_order').range(0,199);
  return <><PageHero eyebrow="FAQ" title="Frequently asked questions" description="Helpful information about ASAM, its programs, and student community."/><section className="py-10"><div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"><SectionHeader eyebrow="Answers" title="How can we help?" description="Published answers from ASAM."/>{error&&<p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">FAQ content is temporarily unavailable.</p>}{data?.length?<div className="mt-6 space-y-3">{data.map((row)=><details key={row.id} className="group rounded-xl border border-border bg-card p-5"><summary className="cursor-pointer list-none font-semibold text-navy marker:hidden">{row.question}<span className="float-right ml-3 text-gold">+</span></summary><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{row.answer}</p>{row.category&&<span className="mt-4 inline-block rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{row.category}</span>}</details>)}</div>:!error&&<div className="mt-6 rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">No published FAQs yet.</div>}</div></section></>;
}
