'use server'

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createBooking(formData: FormData) {
    const tripId = formData.get('tripId') as string;
    const seatNumbers = formData.get('seatNumbers') as string; // Comma-separated seat labels
    const seatCount = parseInt(formData.get('seatCount') as string);
    const pickupPoint = formData.get('pickupPoint') as string;
    const dropPoint = formData.get('dropPoint') as string;
    const passengerName = formData.get('passengerName') as string;
    const passengerEmail = formData.get('passengerEmail') as string;
    const pricePerSeat = parseFloat(formData.get('pricePerSeat') as string);

    const CONVENIENCE_FEE = 50;
    const subtotal = seatCount * pricePerSeat;
    const totalAmount = subtotal + CONVENIENCE_FEE;

    // Create User if not exists (Passenger)
    let user = await prisma.user.findUnique({ where: { email: passengerEmail } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: passengerEmail,
                name: passengerName,
                role: 'USER'
            }
        });
    }

    // Check booking time restriction (30 mins before departure)
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new Error("Trip not found");

    const departureDateTime = new Date(`${trip.date.toISOString().split('T')[0]}T${trip.departureTime}`);
    const now = new Date();
    const diffMinutes = (departureDateTime.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes < 30) {
        throw new Error("Cannot book seats less than 30 minutes before departure.");
    }

    // Check if seats are already booked
    const existingBookings = await prisma.booking.findMany({
        where: {
            tripId,
            paymentStatus: { in: ['Paid', 'Pending'] }
        }
    });

    const bookedSeats = new Set<string>();
    existingBookings.forEach(booking => {
        booking.seatNumbers.split(',').forEach(seat => bookedSeats.add(seat.trim()));
    });

    const requestedSeats = seatNumbers.split(',').map(s => s.trim());
    const conflictingSeats = requestedSeats.filter(seat => bookedSeats.has(seat));

    if (conflictingSeats.length > 0) {
        throw new Error(`Seats ${conflictingSeats.join(', ')} are already booked. Please select different seats.`);
    }

    const booking = await prisma.booking.create({
        data: {
            tripId,
            userId: user.id,
            seatNumbers,
            totalAmount,
            pickupPoint,
            dropPoint,
            paymentStatus: 'Pending'
        }
    });

    redirect(`/payment/${booking.id}`);
}

export async function processPayment(formData: FormData) {
    const bookingId = formData.get('bookingId') as string;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { trip: true } });
    if (!booking) throw new Error("Booking not found");

    // Mock Payment Success
    await prisma.$transaction(async (tx) => {
        const trip = await tx.trip.findUnique({ where: { id: booking.tripId } });
        if (!trip) throw new Error("Trip not found");

        // Check if enough seats are actually available
        const seatCount = booking.seatNumbers.split(',').length;
        if (trip.availableSeats < seatCount) {
            throw new Error("Booking failed: Not enough seats available. Your payment will be refunded.");
        }

        await tx.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: 'Paid',
                paymentId: 'mock_payment_' + Date.now()
            }
        });

        // Update Trip Seats
        await tx.trip.update({
            where: { id: booking.tripId },
            data: {
                availableSeats: { decrement: seatCount }
            }
        });
    });

    // Trigger Email (Mock)
    console.log(`[EMAIL] Sending confirmation to user ${booking.userId} for booking ${booking.id}`);

    redirect(`/payment/success?bookingId=${bookingId}`);
}
