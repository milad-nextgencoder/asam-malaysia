import { PageHero } from '@/components/site/page-hero';
import { CTASection } from '@/components/site/cta-section';
import { NewsBrowser } from '@/components/site/news-browser';
import { createPublicClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'News & Stories',
  description:
    'Latest updates, announcements, stories, and opportunities from the Afghan student community in Malaysia.',
};

// News list is cached with 60s ISR; admin content actions also call
// revalidatePath('/news') on every publish/edit, so updates appear promptly.
export const revalidate = 60;

async function getPublishedNews() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('news')
    .select('id,title,slug,excerpt,content,featured_image_url,author,category,publication_date')
    .eq('status', 'published')
    .order('publication_date', { ascending: false, nullsFirst: false });
  return { articles: data ?? [], loadFailed: Boolean(error) };
}

export default async function NewsPage() {
  const { articles, loadFailed } = await getPublishedNews();

  return (
    <>
      <PageHero
        eyebrow="News & Stories"
        title="The ASAM editorial platform"
        description="Latest updates, announcements, stories, and opportunities from the Afghan student community in Malaysia."
      />

      {loadFailed && (
        <div className="container mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            The latest stories could not be loaded. Please refresh in a moment.
          </p>
        </div>
      )}
      <NewsBrowser articles={articles} />

      <CTASection
        title="Have a story to share?"
        description="If you have a story, announcement, or update that would benefit the ASAM community, we'd love to feature it."
        primaryLabel="Submit a Story"
        primaryHref="/contact"
        secondaryLabel="Join ASAM"
        secondaryHref="/membership"
      />
    </>
  );
}
