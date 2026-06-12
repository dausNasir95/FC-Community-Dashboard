import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#2b5139] bg-[#102016] px-2.5 py-1 text-xs font-semibold text-[#b9f7ca]",
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const hot = ["Live", "Ongoing", "Active"].includes(status);
  const calm = ["Completed", "Archived"].includes(status);
  const danger = ["Cancelled", "Suspended", "Inactive"].includes(status);
  return (
    <Badge
      className={cn(
        hot && "border-[#39ff88]/60 bg-[#12381f] text-[#39ff88]",
        calm && "border-sky-400/40 bg-sky-950/40 text-sky-200",
        danger && "border-red-400/40 bg-red-950/30 text-red-200",
      )}
    >
      {status}
    </Badge>
  );
}
