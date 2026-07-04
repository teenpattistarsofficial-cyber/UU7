CREATE TYPE "public"."seo_entity_type" AS ENUM('post', 'page', 'category');--> statement-breakpoint
CREATE TABLE "seo_meta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "seo_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"seo_title" text,
	"meta_description" text,
	"focus_keyword" text,
	"canonical_url" text,
	"robots_index" boolean DEFAULT true NOT NULL,
	"robots_follow" boolean DEFAULT true NOT NULL,
	"og_title" text,
	"og_description" text,
	"og_image_url" text,
	CONSTRAINT "seo_meta_entity_type_entity_id_unique" UNIQUE("entity_type","entity_id")
);
