-- CreateTable
CREATE TABLE "HotelVoucher" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "confirmationNo" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "hotelName" TEXT NOT NULL,
    "hotelAddress" TEXT,
    "clientName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "pax" INTEGER NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "plan" TEXT NOT NULL,
    "dateLines" JSONB NOT NULL,
    "hotelId" TEXT,
    "tourId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HotelVoucher_hotelId_idx" ON "HotelVoucher"("hotelId");

-- CreateIndex
CREATE INDEX "HotelVoucher_tourId_idx" ON "HotelVoucher"("tourId");

-- CreateIndex
CREATE INDEX "HotelVoucher_status_idx" ON "HotelVoucher"("status");

-- CreateIndex
CREATE INDEX "HotelVoucher_checkIn_idx" ON "HotelVoucher"("checkIn");

-- CreateIndex
CREATE INDEX "HotelVoucher_checkOut_idx" ON "HotelVoucher"("checkOut");

-- CreateIndex
CREATE INDEX "HotelVoucher_createdAt_idx" ON "HotelVoucher"("createdAt");

-- AddForeignKey
ALTER TABLE "HotelVoucher" ADD CONSTRAINT "HotelVoucher_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelVoucher" ADD CONSTRAINT "HotelVoucher_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE SET NULL ON UPDATE CASCADE;
