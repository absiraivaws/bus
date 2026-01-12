-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "departureTime" TEXT NOT NULL,
    "arrivalTime" TEXT NOT NULL,
    "pricePerSeat" REAL NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "bookingWindowDays" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL,
    "blockedSeats" TEXT,
    CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("arrivalTime", "availableSeats", "blockedSeats", "date", "departureTime", "id", "pricePerSeat", "routeId", "status", "vehicleId") SELECT "arrivalTime", "availableSeats", "blockedSeats", "date", "departureTime", "id", "pricePerSeat", "routeId", "status", "vehicleId" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
