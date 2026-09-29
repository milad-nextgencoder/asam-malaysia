import { cn } from '@/lib/utils';

interface StatCardProps {
  value: string;
  label: string;
  description?: string;
  className?: string;
}

export function StatCard({ value, label, description, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative p-5 lg:p-6 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-300',
        className
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="font-display text-2xl lg:text-3xl font-bold text-gradient-gold mb-1.5">
        {value}
      </div>
      <div className="text-sm font-semibold text-foreground">{label}</div>
      {description && (
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      )}
    </div>
  );
}
