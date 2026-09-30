import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TimelineProps {
  items: { phase: string; description: string }[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-gold/40 to-transparent lg:-translate-x-px" />

      <div className="space-y-8 lg:space-y-0">
        {items.map((item, i) => (
          <div
            key={item.phase}
            className={cn(
              'relative flex items-start gap-5',
              'lg:grid lg:grid-cols-2 lg:gap-12',
              i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
            )}
          >
            {/* Dot */}
            <div className="absolute left-4 lg:left-1/2 top-0 -translate-x-1/2 z-10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-navy shadow-premium ring-4 ring-background">
                <Check className="h-4 w-4 text-gold" />
              </div>
            </div>

            {/* Content */}
            <div
              className={cn(
                'pl-14 lg:pl-0',
                i % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:col-start-2 lg:pl-12'
              )}
            >
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                  Phase {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="font-display text-lg lg:text-xl font-bold mb-2">{item.phase}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>

            {/* Spacer for even items */}
            {i % 2 === 0 && <div className="hidden lg:block" />}
          </div>
        ))}
      </div>
    </div>
  );
}
