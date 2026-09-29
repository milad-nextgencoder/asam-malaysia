import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  className?: string;
}

export function EmptyState({ title, message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-7 lg:p-10 rounded-xl border border-dashed border-border bg-secondary/30',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 mb-3.5">
        <Sparkles className="h-6 w-6 text-gold" />
      </div>
      <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{message}</p>
    </div>
  );
}
