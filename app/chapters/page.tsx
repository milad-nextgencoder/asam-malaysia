import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { EmptyState } from '@/components/site/empty-state';
import { ChaptersBrowser } from '@/components/site/chapters-browser';
import { createPublicClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Chapters',
  description:
    'Browse chapter locations published by ASAM, including locations that are active or planned.',
};

// Chapter list is cached with 60s ISR; admin content actions also call
// revalidatePath('/chapters') on every change, so updates appear promptly.
export const revalidate = 60;

async function getChapters() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('chapters')
    .select('id,name,state,city,description,university,representative,image_url,display_order,status')
    .in('status', ['active','coming_soon'])
    .order('display_order', { ascending: true });
  return data ?? [];
}

export default async function ChaptersPage() {
  const chapters = await getChapters();

  return (
    <>
      <PageHero
        eyebrow="Chapters"
        title="ASAM chapters"
        description="Browse chapter locations published by ASAM. Locations marked as planned are not yet active."
      />

      <ChaptersBrowser chapters={chapters} />

      {/* City & University Chapters */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="City & University Chapters"
            title="City and university locations"
            description="This directory separates published chapter locations from locations still being planned."
          />
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <EmptyState
                title={chapters.some((chapter) => chapter.city) ? 'City Chapters' : 'No City Chapters Yet'}
                message={chapters.filter((chapter) => chapter.city).map((chapter) => `${chapter.name} · ${chapter.city}`).join(' | ') || 'ASAM is expanding its national network. City chapter information will appear here as new chapters are established.'}
              />
            </div>
            <div>
              <EmptyState
                title={chapters.some((chapter) => chapter.university) ? 'University Chapters' : 'No University Chapters Yet'}
                message={chapters.filter((chapter) => chapter.university).map((chapter) => `${chapter.name} · ${chapter.university}`).join(' | ') || 'University chapters are being established. Visit the University Network page to see the status of your university.'}
              />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Start a chapter at your university"
        description="Interested in an ASAM chapter at your university? Contact ASAM to ask about current plans and how to express your interest."
        primaryLabel="Join ASAM"
        primaryHref="/contact"
        secondaryLabel="View Universities"
        secondaryHref="/universities"
      />
    </>
  );
}
