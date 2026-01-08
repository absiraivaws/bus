-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "blockedSeats" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "columns" INTEGER NOT NULL DEFAULT 4,
    "rows" INTEGER NOT NULL DEFAULT 10,
    "lastRowSeats" INTEGER NOT NULL DEFAULT 5,
    "seatLayout" TEXT,
    "windowSeats" TEXT,
    "amenities" TEXT,
    "operatorName" TEXT,
    "operatorWhatsapp" TEXT,
    CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("amenities", "id", "ownerId", "plateNumber", "seatLayout", "totalSeats", "type") SELECT "amenities", "id", "ownerId", "plateNumber", "seatLayout", "totalSeats", "type" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
