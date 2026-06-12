import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en", options ?? { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

export function formatDateTime(value: string | null | undefined) {
  return formatDate(value, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toInt(value: string | string[] | undefined, fallback = 1) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
