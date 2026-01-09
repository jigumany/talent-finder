import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 font-bold text-primary", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
      >
        <rect width="28" height="28" rx="8" fill="currentColor" />
        <path
          d="M19.5 14C19.5 17.0376 17.0376 19.5 14 19.5C10.9624 19.5 8.5 17.0376 8.5 14C8.5 10.9624 10.9624 8.5 14 8.5C15.932 8.5 17.625 9.49962 18.625 10.9375"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M16 14H14V8.5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xl tracking-tight">GSL Talent Finder</span>
    </div>
  );
}
