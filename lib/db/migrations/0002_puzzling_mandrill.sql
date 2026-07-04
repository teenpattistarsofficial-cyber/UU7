CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"size" integer NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"caption" text,
	"title" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
