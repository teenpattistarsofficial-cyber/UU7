ALTER TABLE "site_settings" ADD COLUMN "cache_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "cache_cleared_at" timestamp;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "maintenance_mode" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "maintenance_message" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "ai_widget_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "ai_widget_welcome_message" text;