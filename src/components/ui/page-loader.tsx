import { cn } from "@/lib/utils";

type PageLoaderProps = {
  label?: string;
  className?: string;
};

export function PageLoader({ label = "Loading...", className }: PageLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 min-h-[40vh]", className)}>
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-muted" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse-soft">{label}</p>
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted animate-pulse",
        className
      )}
    />
  );
}
