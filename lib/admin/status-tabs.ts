import { Layers, CheckCircle2, FileEdit, Clock, Archive } from "lucide-react";

// Shared between Posts and Pages lists — both content types use the same
// status enum (draft/published/scheduled/archived).
export const STATUS_ICONS = {
  all: Layers,
  published: CheckCircle2,
  draft: FileEdit,
  scheduled: Clock,
  archived: Archive,
} as const;
