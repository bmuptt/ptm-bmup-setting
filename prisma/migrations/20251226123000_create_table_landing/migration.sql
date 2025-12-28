-- CreateTable landing_sections
CREATE TABLE "landing_sections" (
    "id" BIGSERIAL NOT NULL,
    "page_key" VARCHAR(50) NOT NULL,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" BIGINT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "landing_sections_pkey" PRIMARY KEY ("id")
);

-- Unique page_key
CREATE UNIQUE INDEX "landing_sections_page_key_key" ON "landing_sections"("page_key");

-- CreateTable landing_items
CREATE TABLE "landing_items" (
    "id" BIGSERIAL NOT NULL,
    "section_id" BIGINT NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "type" VARCHAR(30),
    "title" VARCHAR(255),
    "content" TEXT,
    "image_url" VARCHAR(512),
    "button_label" VARCHAR(100),
    "button_url" VARCHAR(512),
    "published" BOOLEAN NOT NULL,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" BIGINT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "landing_items_pkey" PRIMARY KEY ("id")
);

-- Foreign key constraint for section_id
ALTER TABLE "landing_items" 
ADD CONSTRAINT "landing_items_section_id_fkey" 
FOREIGN KEY ("section_id") 
REFERENCES "landing_sections"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Composite unique index on (section_id, key)
CREATE UNIQUE INDEX "landing_items_section_id_key_key" ON "landing_items"("section_id", "key");

