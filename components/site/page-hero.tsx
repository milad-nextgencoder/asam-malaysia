import { cn } from '@/lib/utils';

export interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeroProps) {
  return (
    <section className={cn('relative pt-32 lg:pt-40 pb-16 lg:pb-20 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-navy/5 blur-3xl" />
      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-px w-8 bg-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
            {title}
          </h1>
          {description && (
            <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
