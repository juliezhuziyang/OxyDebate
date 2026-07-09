import { ThemeToggle } from "./ThemeToggle";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="container mx-auto px-4 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/lovable-uploads/38ceb41b-5f98-475f-8a33-19dc45ce9689.png"
                alt="Oxymorona Debate logo"
                className="h-9 w-9 object-contain"
                loading="lazy"
              />
              <div>
                <p className="font-display text-lg font-semibold leading-tight">Oxymorona Debate</p>
                <p className="text-xs text-muted-foreground mt-0.5">Global debate community</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Train with AI, debate with peers worldwide, and grow through tournaments, guides, and community resources.
            </p>
          </div>

          <nav className="space-y-3" aria-label="Explore">
            <p className="editorial-eyebrow">Explore</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors w-fit">Home</Link>
              <Link to="/announcements" className="hover:text-primary transition-colors w-fit">Announcements</Link>
              <Link to="/tournament" className="hover:text-primary transition-colors w-fit">Tournament</Link>
              <Link to="/auth" className="hover:text-primary transition-colors w-fit">Log in</Link>
            </div>
          </nav>

          <div className="space-y-3">
            <p className="editorial-eyebrow">Community</p>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <span className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Oxymorona Debate
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
