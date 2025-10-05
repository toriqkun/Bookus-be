-- CreateEnum
CREATE TYPE "slotify"."Role" AS ENUM ('USER', 'PROVIDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "slotify"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'RESCHEDULED', 'COMPLETED');

-- CreateTable
CREATE TABLE "slotify"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "avatarImage" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "slotify"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slotify"."Service" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "isbn" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "durationDays" INTEGER,
    "price" DOUBLE PRECISION,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slotify"."Slot" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slotify"."Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "status" "slotify"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slotify"."VerificationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "slotify"."User"("email");

-- CreateIndex
CREATE INDEX "Service_providerId_idx" ON "slotify"."Service"("providerId");

-- CreateIndex
CREATE INDEX "Service_title_idx" ON "slotify"."Service"("title");

-- CreateIndex
CREATE INDEX "Slot_serviceId_startTime_endTime_idx" ON "slotify"."Slot"("serviceId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "Slot_startTime_idx" ON "slotify"."Slot"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_slotId_key" ON "slotify"."Booking"("slotId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "slotify"."Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_serviceId_idx" ON "slotify"."Booking"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "slotify"."VerificationToken"("token");

-- AddForeignKey
ALTER TABLE "slotify"."Service" ADD CONSTRAINT "Service_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "slotify"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slotify"."Slot" ADD CONSTRAINT "Slot_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "slotify"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slotify"."Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "slotify"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slotify"."Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "slotify"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slotify"."Booking" ADD CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slotify"."Slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slotify"."VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "slotify"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
