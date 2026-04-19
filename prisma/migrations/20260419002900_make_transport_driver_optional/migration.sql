-- DropForeignKey
ALTER TABLE "Transport" DROP CONSTRAINT "Transport_driverId_fkey";

-- AlterTable
ALTER TABLE "Transport" ALTER COLUMN "driverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
