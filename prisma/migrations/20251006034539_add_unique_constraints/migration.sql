/*
  Warnings:

  - A unique constraint covering the columns `[title,author]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Service_title_author_key" ON "public"."Service"("title", "author");
