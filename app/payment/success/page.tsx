import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ bookingId: string }>;
}) {
    const { bookingId } = await searchParams;
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { trip: { include: { route: { include: { startLocation: true, endLocation: true } } } } }
    });

    return (
        <div className="container" style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '600px' }}>
            <div className="glass card" style={{ borderColor: 'var(--success)' }}>
                <h1 style={{ color: 'var(--success)', marginBottom: '20px' }}>Booking Confirmed!</h1>
                <p style={{ marginBottom: '30px' }}>Your trip has been successfully booked.</p>

                {booking && (
                    <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                        <p><strong>Booking ID:</strong> {booking.id}</p>
                        <p><strong>Route:</strong> {booking.trip.route.startLocation.name} to {booking.trip.route.endLocation.name}</p>
                        <p><strong>Date:</strong> {booking.trip.date.toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {booking.trip.departureTime}</p>
                        <p><strong>Seats:</strong> {booking.seatNumbers}</p>
                        <p><strong>Pickup:</strong> {booking.pickupPoint}</p>
                    </div>
                )}

                <Link href="/" className="btn btn-primary">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
