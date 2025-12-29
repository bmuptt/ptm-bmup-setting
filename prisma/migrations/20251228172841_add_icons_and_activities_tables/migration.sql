-- CreateTable
CREATE TABLE "icons" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "label" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "icons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" BIGSERIAL NOT NULL,
    "icon_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(500) NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "icons_name_key" ON "icons"("name");

-- CreateIndex
CREATE INDEX "activities_icon_id_idx" ON "activities"("icon_id");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "icons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
