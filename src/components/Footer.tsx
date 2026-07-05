import { ThemeToggle } from "./ThemeToggle";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/38ceb41b-5f98-475f-8a33-19dc45ce9689.png"
              alt="Oxymorona Debate logo"
              className="h-8 w-8 object-contain"
              loading="lazy"
            />
            <span className="font-display text-lg font-semibold">Oxymorona Debate</span>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Footer">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <a href="/auth" className="hover:text-primary transition-colors">Log in</a>
            <a href="/announcements" className="hover:text-primary transition-colors">Announcements</a>
            <a href="/tournament" className="hover:text-primary transition-colors">Tournament</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Oxymorona Debate
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
