import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#39ff88] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-[#39ff88] text-[#041006] hover:bg-[#24d96f]",
        variant === "secondary" && "border border-[#2a4a36] bg-[#102016] text-white hover:bg-[#173320]",
        variant === "ghost" && "text-[#ccebd5] hover:bg-[#102016]",
        variant === "danger" && "bg-red-500 text-white hover:bg-red-600",
        className,
      )}
      {...props}
    />
  );
}
