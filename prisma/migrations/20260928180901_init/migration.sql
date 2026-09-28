-- CreateEnum
CREATE TYPE "City" AS ENUM ('MAKKAH', 'MADINAH');

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "pricePerNight" DECIMAL(12,2) NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 4.5,
    "distance" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "amenities" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "checkIn" DATE NOT NULL,
    "checkOut" DATE NOT NULL,
    "guests" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL,
    "roomCount" INTEGER NOT NULL,
    "exchangeRate" DECIMAL(14,2) NOT NULL,
    "visaPerPersonSar" DECIMAL(12,2) NOT NULL,
    "transportTotalSar" DECIMAL(12,2) NOT NULL,
    "flightPerPersonIdr" DECIMAL(14,2) NOT NULL,
    "marginPerPersonIdr" DECIMAL(14,2) NOT NULL,
    "hotelTotalSar" DECIMAL(14,2) NOT NULL,
    "totalCostIdr" DECIMAL(16,2) NOT NULL,
    "costPerPersonIdr" DECIMAL(14,2) NOT NULL,
    "sellingPriceIdr" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Hotel_city_idx" ON "Hotel"("city");

-- CreateIndex
CREATE INDEX "Quotation_createdAt_idx" ON "Quotation"("createdAt");

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
