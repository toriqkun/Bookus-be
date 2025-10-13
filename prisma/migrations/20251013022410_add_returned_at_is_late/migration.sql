-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "isLate" BOOLEAN DEFAULT false,
ADD COLUMN     "returnedAt" TIMESTAMP(3);
