import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'inline-flex items-center gap-2 mb-3',
            align === 'center' && 'justify-center'
          )}
        >
          <span className="h-px w-8 bg-gold" />
          <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-gold" />
        </div>
      )}
      <h2 className="font-display text-xl sm:text-2xl lg:text-[1.75rem] font-bold tracking-tight text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm lg:text-[0.9375rem] text-muted-foreground leading-relaxed text-pretty">
          {description}
        </p>
      )}
    </div>
  );
}
