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
        'flex flex-col items-center justify-center text-center p-8 lg:p-12 rounded-2xl border border-dashed border-border bg-secondary/30',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 mb-4">
        <Sparkles className="h-7 w-7 text-gold" />
      </div>
      <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{message}</p>
    </div>
  );
}
