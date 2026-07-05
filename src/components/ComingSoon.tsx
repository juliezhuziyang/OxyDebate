import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  message?: string;
}

export const ComingSoon = ({ title, message }: ComingSoonProps) => {
  return (
    <section className="max-w-3xl mx-auto text-center py-16 md:py-24 animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
        <Construction className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground text-lg max-w-md mx-auto">{message || 'This section is coming soon.'}</p>
    </section>
  );
};
