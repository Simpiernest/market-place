import * as React from "react";
import { cn } from "@/lib/utils";

export type SpinningBorderButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
  };

export const SpinningBorderButton = React.forwardRef<
  HTMLButtonElement,
  SpinningBorderButtonProps
>(function SpinningBorderButton(
  { children = "Request Demo", className, loading = false, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "group inline-flex overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] rounded-full pt-[1px] pr-[1px] pb-[1px] pl-[1px] relative items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Spinning Border Beam (Visible on Hover or Loading) */}
      <span className={cn(
        "absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#3b82f6_100%)] transition-opacity duration-300",
        loading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )} />

      {/* Default Static Border */}
      <span className="absolute inset-0 rounded-full bg-slate-800 transition-opacity duration-300 group-hover:opacity-0" />

      {/* 3D Button Surface & Content */}
      <span className="flex items-center justify-center gap-2 uppercase transition-colors duration-300 group-hover:text-white text-xs font-black text-slate-300 tracking-widest bg-gradient-to-b from-slate-800 to-slate-950 w-full h-full rounded-full pt-3 pr-8 pb-3 pl-8 relative shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
        {loading ? (
            <span className="relative z-10 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </span>
        ) : (
            <>
                <span className="relative z-10">{children}</span>
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
                </svg>
            </>
        )}
      </span>
    </button>
  );
});

export default SpinningBorderButton;
