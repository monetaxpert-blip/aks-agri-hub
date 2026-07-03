import { ArrowRight } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  arrow?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

export const PremiumButton = forwardRef<HTMLButtonElement, Props>(
  ({ children, className, arrow = true, loading, fullWidth, size = "md", ...rest }, ref) => {
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };
    return (
      <button
        ref={ref}
        {...rest}
        disabled={loading || rest.disabled}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 rounded-2xl font-semibold text-white",
          "bg-gradient-aks shadow-premium transition-all duration-300",
          "hover:scale-[1.02] hover:shadow-[0_16px_50px_-12px_oklch(0.55_0.14_145/0.5)]",
          "active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none",
          "font-display tracking-wide",
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
      >
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : null}
          {children}
          {arrow && !loading && (
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </span>
      </button>
    );
  },
);
PremiumButton.displayName = "PremiumButton";
