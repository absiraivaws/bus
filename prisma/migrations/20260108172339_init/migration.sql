-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER'
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "seatLayout" TEXT,
    "amenities" TEXT,
    CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startLocationId" TEXT NOT NULL,
    "endLocationId" TEXT NOT NULL,
    "stops" TEXT,
    "estimatedDuration" INTEGER NOT NULL,
    CONSTRAINT "Route_startLocationId_fkey" FOREIGN KEY ("startLocationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Route_endLocationId_fkey" FOREIGN KEY ("endLocationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "departureTime" TEXT NOT NULL,
    "arrivalTime" TEXT NOT NULL,
    "pricePerSeat" REAL NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seatNumbers" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "pickupPoint" TEXT NOT NULL,
    "dropPoint" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "paymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
