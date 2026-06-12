import { z } from "zod";
import { slugify } from "@/lib/utils";

const slug = z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a URL-safe slug.");

export const posterSchema = z.object({
  title: z.string().min(2),
  slug: slug.optional(),
  description: z.string().min(10),
  image_url: z.url(),
  event_date: z.string().min(1),
  category: z.string().min(2),
  status: z.enum(["Upcoming", "Ongoing", "Completed", "Cancelled"]),
  is_featured: z.coerce.boolean().default(false),
  is_published: z.coerce.boolean().default(false),
}).transform((value) => ({ ...value, slug: value.slug || slugify(value.title) }));

export const participantSchema = z.object({
  display_name: z.string().min(2),
  ea_id: z.string().optional().nullable(),
  psn_id: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  team_name: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  social_username: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["Active", "Inactive", "Suspended", "Archived"]),
});

export const tournamentSchema = z.object({
  name: z.string().min(2),
  slug: slug.optional(),
  description: z.string().min(10),
  cover_image_url: z.url().nullable().optional(),
  format: z.string().min(2),
  rules: z.string().min(5),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  registration_url: z.url().nullable().optional(),
  maximum_participants: z.coerce.number().int().positive().nullable().optional(),
  status: z.enum(["Draft", "Upcoming", "Ongoing", "Completed", "Cancelled", "Archived"]),
  is_published: z.coerce.boolean().default(false),
}).transform((value) => ({ ...value, slug: value.slug || slugify(value.name) }));

export const collectionSchema = z.object({
  title: z.string().min(2),
  slug: slug.optional(),
  description: z.string().min(10),
  category: z.enum(["Tournament fee", "Registration fee", "Venue fee", "Jersey payment", "Event contribution", "Prize pool", "Other"]),
  currency: z.literal("MYR").default("MYR"),
  target_amount: z.coerce.number().min(0),
  start_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  tournament_id: z.string().optional().nullable(),
  status: z.enum(["Draft", "Open", "Partially Collected", "Fully Collected", "Overdue", "Closed", "Cancelled", "Archived"]),
  is_published: z.coerce.boolean().default(false),
}).refine((value) => !value.start_date || !value.due_date || new Date(value.due_date) >= new Date(value.start_date), {
  path: ["due_date"],
  message: "Due date cannot be earlier than start date.",
}).transform((value) => ({ ...value, slug: value.slug || slugify(value.title) }));

export { fixtureInputSchema } from "@/lib/services/fixtures";
