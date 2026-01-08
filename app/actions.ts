'use server'

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createBooking(formData: FormData) {
    const tripId = formData.get('tripId') as string;
    const seatCount = parseInt(formData.get('seatCount') as string);
    const pickupPoint = formData.get('pickupPoint') as string;
    const dropPoint = formData.get('dropPoint') as string;
    const passengerName = formData.get('passengerName') as string;
    const passengerEmail = formData.get('passengerEmail') as string;
    const pricePerSeat = parseFloat(formData.get('pricePerSeat') as string);

    const totalAmount = seatCount * pricePerSeat;

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

    // Generate seat numbers (Mock)
    const seatNumbers = Array.from({ length: seatCount }, (_, i) => `Seat ${i + 1}`).join(',');

    // Check booking time restriction (30 mins before departure)
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new Error("Trip not found");

    const departureDateTime = new Date(`${trip.date.toISOString().split('T')[0]}T${trip.departureTime}`);
    const now = new Date();
    const diffMinutes = (departureDateTime.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes < 30) {
        throw new Error("Cannot book seats less than 30 minutes before departure.");
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
