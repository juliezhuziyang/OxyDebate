import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  message?: string;
}

export const ComingSoon = ({ title, message }: ComingSoonProps) => {
  return (
    <section className="max-w-2xl mx-auto text-center py-20 md:py-28 animate-fade-in">
      <div className="inline-flex items-center justify-center w-14 h-14 border border-border bg-muted/40 mb-6">
        <Construction className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="editorial-eyebrow mb-3">Coming soon</p>
      <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mb-4">{title}</h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
        {message || 'This section is in development.'}
      </p>
    </section>
  );
};
