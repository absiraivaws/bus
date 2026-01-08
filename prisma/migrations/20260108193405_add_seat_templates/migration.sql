-- CreateTable
CREATE TABLE "SeatTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "columns" INTEGER NOT NULL DEFAULT 4,
    "rows" INTEGER NOT NULL DEFAULT 13,
    "seatLayout" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
