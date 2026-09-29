import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CTASectionProps {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
  style?: CSSProperties;
}

export function CTASection({
  title,
  description,
  primaryLabel = 'Become a Member',
  primaryHref = '/membership',
  secondaryLabel = 'Explore ASAM',
  secondaryHref = '/about',
  className,
  style,
}: CTASectionProps) {
  return (
    <section className={cn('py-14 lg:py-20', className)} style={style}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl gradient-navy p-8 lg:p-12 text-center">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-balance">
              {title}
            </h2>
            <p className="mt-3.5 text-sm lg:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
              {description}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-navy font-semibold shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300"
              >
                {secondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
