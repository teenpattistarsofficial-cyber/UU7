import { Layers, CheckCircle2, FileEdit, Clock, Archive, Trash2 } from "lucide-react";

// Shared between Posts and Pages lists — both content types use the same
// status enum (draft/published/scheduled/archived) plus the same Trash
// concept (a `deletedAt` timestamp, not part of the status enum — see the
// comment on that column in lib/db/schema/content.ts).
export const STATUS_ICONS = {
  all: Layers,
  published: CheckCircle2,
  draft: FileEdit,
  scheduled: Clock,
  archived: Archive,
  trash: Trash2,
} as const;
