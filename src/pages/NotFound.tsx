import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="page-shell min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="text-center animate-fade-in-up max-w-md surface-panel">
        <p className="editorial-eyebrow mb-4">Error 404</p>
        <p className="text-6xl font-display font-semibold text-primary/25 mb-3">404</p>
        <p className="text-lg text-muted-foreground mb-8">This page could not be found.</p>
        <Button asChild>
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
