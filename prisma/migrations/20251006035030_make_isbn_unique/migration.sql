/*
  Warnings:

  - A unique constraint covering the columns `[isbn]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Service_title_author_key";

-- CreateIndex
CREATE UNIQUE INDEX "Service_isbn_key" ON "public"."Service"("isbn");
