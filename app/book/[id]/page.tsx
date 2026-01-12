import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import BookingClient from './booking-client';

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
            vehicle: true,
            route: { include: { startLocation: true, endLocation: true } },
            bookings: {
                where: {
                    paymentStatus: { in: ['Paid', 'Pending'] }
                },
                select: {
                    seatNumbers: true
                }
            }
        }
    });

    if (!trip) notFound();

    return <BookingClient trip={trip} existingBookings={trip.bookings} />;
}
