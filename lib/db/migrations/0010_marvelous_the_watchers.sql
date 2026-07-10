CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"logo_url" text,
	"favicon_url" text,
	"og_image_url" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
