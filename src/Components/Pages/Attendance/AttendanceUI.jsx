import React from "react";

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

export const IconButton = ({
  children,
  className = "",
  disabled = false,
  ...props
}) => (
  <button
    type="button"
    disabled={disabled}
    className={cn(
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition duration-200",
      "bg-white/10 text-white hover:bg-white/20",
      "disabled:pointer-events-none disabled:opacity-30",
      focusRing,
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export const StatusBanner = ({ type = "info", children }) => {
  const styles = {
    info: "border-blue-100 bg-blue-50 text-blue-700",
    error: "border-rose-100 bg-rose-50 text-rose-700",
    warning: "border-amber-100 bg-amber-50 text-amber-700",
  };

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-xs font-medium",
        styles[type],
      )}
    >
      {children}
    </div>
  );
};

export const AttendanceSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-28 rounded-2xl bg-slate-200/70" />

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-24 rounded-2xl bg-slate-200/70" />
      ))}
    </div>

    <div className="h-[500px] rounded-[22px] bg-slate-200/70" />
  </div>
);
