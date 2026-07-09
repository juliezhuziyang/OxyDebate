import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  className,
  compact = false,
}: PageHeroProps) {
  return (
    <header className={cn('page-hero', compact && 'page-hero-compact', className)}>
      {eyebrow && <p className="editorial-eyebrow">{eyebrow}</p>}
      <h1 className="page-hero-title">{title}</h1>
      {description && <p className="page-hero-description">{description}</p>}
      {actions && <div className="page-hero-actions">{actions}</div>}
    </header>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="editorial-eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-2 leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
