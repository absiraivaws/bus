'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';

// --- Vehicles ---

async function saveImage(image: File | null, index: number, vehicleId: string): Promise<string | null> {
    if (!image || image.size === 0) return null;

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = image.name.split('.').pop() || 'jpg';
    const filename = `${vehicleId}_${index}_${Date.now()}.${ext}`;
    const filepath = path.join(process.cwd(), 'public', 'vehicles', filename);

    await writeFile(filepath, buffer);
    return `/vehicles/${filename}`;
}

export async function createVehicle(formData: FormData) {
    const plateNumber = formData.get('plateNumber') as string;
    const type = formData.get('type') as string;
    const columns = parseInt(formData.get('columns') as string);
    const rows = parseInt(formData.get('rows') as string);
    const lastRowSeats = parseInt(formData.get('lastRowSeats') as string);
    const amenities = formData.get('amenities') as string;
    const operatorName = formData.get('operatorName') as string;
    const operatorWhatsapp = formData.get('operatorWhatsapp') as string;
    const seatLayout = formData.get('seatLayout') as string; // JSON string
    const totalSeats = parseInt(formData.get('totalSeats') as string);
    const scheduleType = formData.get('scheduleType') as string || 'Random';

    let user = await prisma.user.findFirst({ where: { role: 'OPERATOR' } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'operator@example.com',
                name: 'Demo Operator',
                role: 'OPERATOR'
            }
        });
    }

    // Create vehicle first to get ID
    const vehicle = await prisma.vehicle.create({
        data: {
            plateNumber,
            type,
            totalSeats,
            columns,
            rows,
            lastRowSeats: 0,
            windowSeats: '',
            seatLayout,
            amenities,
            operatorName,
            operatorWhatsapp,
            scheduleType,
            ownerId: user.id
        }
    });

    // Handle image uploads
    const image1 = formData.get('image1') as File | null;
    const image2 = formData.get('image2') as File | null;
    const image3 = formData.get('image3') as File | null;

    const image1Path = await saveImage(image1, 1, vehicle.id);
    const image2Path = await saveImage(image2, 2, vehicle.id);
    const image3Path = await saveImage(image3, 3, vehicle.id);

    // Update vehicle with image paths
    if (image1Path || image2Path || image3Path) {
        await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: {
                image1: image1Path,
                image2: image2Path,
                image3: image3Path
            }
        });
    }

    revalidatePath('/operator/vehicles');
}

export async function updateVehicle(formData: FormData) {
    const id = formData.get('id') as string;
    const plateNumber = formData.get('plateNumber') as string;
    const type = formData.get('type') as string;
    const columns = parseInt(formData.get('columns') as string);
    const rows = parseInt(formData.get('rows') as string);
    const amenities = formData.get('amenities') as string;
    const operatorName = formData.get('operatorName') as string;
    const operatorWhatsapp = formData.get('operatorWhatsapp') as string;
    const seatLayout = formData.get('seatLayout') as string;
    const totalSeats = parseInt(formData.get('totalSeats') as string);
    const scheduleType = formData.get('scheduleType') as string || 'Random';

    // Get existing vehicle to preserve images if not updated
    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!existingVehicle) throw new Error('Vehicle not found');

    // Handle image uploads
    const image1 = formData.get('image1') as File | null;
    const image2 = formData.get('image2') as File | null;
    const image3 = formData.get('image3') as File | null;

    const image1Path = await saveImage(image1, 1, id) || existingVehicle.image1;
    const image2Path = await saveImage(image2, 2, id) || existingVehicle.image2;
    const image3Path = await saveImage(image3, 3, id) || existingVehicle.image3;

    await prisma.vehicle.update({
        where: { id },
        data: {
            plateNumber,
            type,
            totalSeats,
            columns,
            rows,
            seatLayout,
            amenities,
            operatorName,
            operatorWhatsapp,
            scheduleType,
            image1: image1Path,
            image2: image2Path,
            image3: image3Path
        }
    });

    revalidatePath('/operator/vehicles');
}

export async function deleteVehicle(id: string) {
    await prisma.vehicle.delete({ where: { id } });
    revalidatePath('/operator/vehicles');
}

// --- Locations ---

export async function createLocation(formData: FormData) {
    const name = formData.get('name') as string;

    await prisma.location.create({
        data: { name }
    });
    revalidatePath('/operator/routes');
}

export async function updateLocation(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;

    await prisma.location.update({
        where: { id },
        data: { name }
    });
    revalidatePath('/operator/routes');
}

export async function deleteLocation(id: string) {
    try {
        await prisma.location.delete({ where: { id } });
        revalidatePath('/operator/routes');
    } catch (e) {
        console.error("Failed to delete location", e);
    }
}

// --- Routes ---

export async function createRoute(formData: FormData) {
    const startLocationId = formData.get('startLocationId') as string;
    const endLocationId = formData.get('endLocationId') as string;
    const estimatedDuration = parseInt(formData.get('estimatedDuration') as string);
    const stops = formData.get('stops') as string;

    await prisma.route.create({
        data: {
            startLocationId,
            endLocationId,
            estimatedDuration,
            stops
        }
    });
    revalidatePath('/operator/routes');
}

export async function updateRoute(formData: FormData) {
    const id = formData.get('id') as string;
    const startLocationId = formData.get('startLocationId') as string;
    const endLocationId = formData.get('endLocationId') as string;
    const estimatedDuration = parseInt(formData.get('estimatedDuration') as string);
    const stops = formData.get('stops') as string;

    await prisma.route.update({
        where: { id },
        data: {
            startLocationId,
            endLocationId,
            estimatedDuration,
            stops
        }
    });
    revalidatePath('/operator/routes');
}

export async function deleteRoute(id: string) {
    await prisma.route.delete({ where: { id } });
    revalidatePath('/operator/routes');
}

// --- Trips ---

export async function createTrip(formData: FormData) {
    const vehicleId = formData.get('vehicleId') as string;
    const routeId = formData.get('routeId') as string;
    const dateStr = formData.get('date') as string;
    const departureTime = formData.get('departureTime') as string;
    const pricePerSeat = parseFloat(formData.get('pricePerSeat') as string);
    const bookingWindowDays = parseInt(formData.get('bookingWindowDays') as string) || 30;

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new Error("Vehicle not found");

    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new Error("Route not found");

    // Calculate Arrival Time
    const [hours, minutes] = departureTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + route.estimatedDuration;
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinutes = totalMinutes % 60;
    const arrivalTime = `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`;

    const tripDate = new Date(dateStr);

    await prisma.trip.create({
        data: {
            vehicleId,
            routeId,
            date: tripDate,
            departureTime,
            arrivalTime,
            pricePerSeat,
            availableSeats: vehicle.totalSeats,
            bookingWindowDays: Math.min(Math.max(bookingWindowDays, 0), 90), // Clamp between 0-90
            status: "Scheduled"
        }
    });

    revalidatePath('/operator/trips');
}

export async function deleteTrip(id: string) {
    const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
            vehicle: true,
            bookings: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!trip) return;

    // Cancellation Policy: Must cancel at least 1 day (24 hours) before departure
    const now = new Date();
    const tripDateTime = new Date(`${trip.date.toISOString().split('T')[0]}T${trip.departureTime}`);
    const diffTime = tripDateTime.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 3600);

    if (diffHours < 24) {
        throw new Error("Cannot cancel trips less than 24 hours before departure.");
    }

    // Get all booked passengers for notification
    const passengers = trip.bookings.map(booking => ({
        email: booking.user.email,
        name: booking.user.name,
        seatNumbers: booking.seatNumbers
    }));

    // Update status to "Cancelled by Operator" instead of deleting
    await prisma.trip.update({
        where: { id },
        data: { status: "Cancelled by Operator" }
    });

    // Send notifications (placeholder - in production, integrate with email/WhatsApp API)
    if (passengers.length > 0) {
        console.log(`[NOTIFICATION] Trip cancelled. Notifying ${passengers.length} passenger(s):`);
        passengers.forEach(passenger => {
            console.log(`  - Email to ${passenger.email}: Trip on ${trip.date.toLocaleDateString()} at ${trip.departureTime} has been cancelled.`);
            // TODO: Integrate with email service (e.g., SendGrid, AWS SES)
            // TODO: Integrate with WhatsApp Business API
        });
    }

    revalidatePath('/operator/trips');
}

export async function blockSeats(formData: FormData) {
    const tripId = formData.get('tripId') as string;
    const seatsToBlock = formData.get('seats') as string; // JSON array

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new Error("Trip not found");

    // Merge with existing blocked seats
    const currentBlocked = trip.blockedSeats ? JSON.parse(trip.blockedSeats) : [];
    const newBlocked = JSON.parse(seatsToBlock);
    const updatedBlocked = Array.from(new Set([...currentBlocked, ...newBlocked]));

    // Update available seats count? 
    // If we block seats, we should probably decrease availableSeats, OR just filter them out during booking.
    // Let's decrease availableSeats to keep it simple for the search UI.
    // Wait, if we unblock? This gets complex.
    // Better: availableSeats = totalSeats - (booked + blocked).
    // But availableSeats is a field.
    // Let's just update the blockedSeats field and let the UI handle the "available" count display if needed,
    // OR update availableSeats.
    // Let's update availableSeats by subtracting the count of *newly* blocked seats.

    const newlyBlockedCount = updatedBlocked.length - currentBlocked.length;

    await prisma.trip.update({
        where: { id: tripId },
        data: {
            blockedSeats: JSON.stringify(updatedBlocked),
            availableSeats: { decrement: newlyBlockedCount }
        }
    });

    revalidatePath('/operator/trips');
}
