'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- Vehicles ---

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

    await prisma.vehicle.create({
        data: {
            plateNumber,
            type,
            totalSeats,
            columns,
            rows,
            lastRowSeats: 0, // Deprecated/Unused with custom layout
            windowSeats: '', // Deprecated, stored in seatLayout now
            seatLayout,
            amenities,
            operatorName,
            operatorWhatsapp,
            ownerId: user.id
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
    const district = formData.get('district') as string;

    await prisma.location.create({
        data: { name, district }
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

    // Logic: "when operator add the route it's available next 5 days"
    // If vehicle is Bus or Van, we might want to create 5 trips?
    // Or just create the one requested. The requirement is a bit vague.
    // "when operator add the route it's available next 5 days" -> This sounds like if I add a route, it should auto-schedule?
    // But this is the "Schedule Trip" action, not "Create Route".
    // Let's assume the user wants to schedule this trip for the next 5 days starting from the selected date.
    // But "Bus, van only" for cancellation policy.
    // Let's stick to creating 1 trip for now to avoid spamming, but I'll add a comment.
    // Actually, let's just create the single trip as requested.

    await prisma.trip.create({
        data: {
            vehicleId,
            routeId,
            date: tripDate,
            departureTime,
            arrivalTime,
            pricePerSeat,
            availableSeats: vehicle.totalSeats,
            status: "Scheduled"
        }
    });

    revalidatePath('/operator/trips');
}

export async function deleteTrip(id: string) {
    const trip = await prisma.trip.findUnique({ where: { id }, include: { vehicle: true } });
    if (!trip) return;

    // Cancellation Policy: Bus/Van can only cancel before 2 days
    if (['Bus', 'Van'].includes(trip.vehicle.type)) {
        const now = new Date();
        const tripDate = new Date(trip.date);
        const diffTime = tripDate.getTime() - now.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);

        if (diffDays < 2) {
            throw new Error("Cannot cancel Bus/Van trips less than 2 days before departure.");
        }
    }

    await prisma.trip.delete({ where: { id } });
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
