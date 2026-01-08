import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ from: string; to: string; date: string }>;
}) {
    const { from, to, date } = await searchParams;

    // Find trips
    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);

    const trips = await prisma.trip.findMany({
        where: {
            route: {
                startLocationId: from,
                endLocationId: to,
            },
            date: {
                gte: targetDate,
                lt: nextDate
            },
            status: 'Scheduled',
            availableSeats: { gt: 0 }
        },
        include: {
            vehicle: true,
            route: { include: { startLocation: true, endLocation: true } }
        },
        orderBy: { departureTime: 'asc' }
    });

    const fromLocation = await prisma.location.findUnique({ where: { id: from } });
    const toLocation = await prisma.location.findUnique({ where: { id: to } });

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header style={{ marginBottom: '40px' }}>
                <Link href="/" style={{ color: 'var(--primary)', marginBottom: '10px', display: 'inline-block' }}>&larr; Back to Search</Link>
                <h1 className="page-title">
                    {fromLocation?.name} to {toLocation?.name}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {trips.map((trip: any) => (
                    <div key={trip.id} className="glass card" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', alignItems: 'center', gap: '20px' }}>
                        {/* Time */}
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{trip.departureTime}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{trip.arrivalTime}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '5px' }}>
                                {Math.floor(trip.route.estimatedDuration / 60)}h {trip.route.estimatedDuration % 60}m
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px' }}>{trip.vehicle.type}</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {trip.vehicle.amenities?.split(',').map((amenity: string, i: number) => (
                                    <span key={i} style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)' }}>
                                        {amenity.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>${trip.pricePerSeat}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>per seat</div>
                            <div style={{ color: trip.availableSeats < 5 ? 'var(--error)' : 'var(--success)', fontSize: '0.8rem', marginTop: '5px' }}>
                                {trip.availableSeats} seats left
                            </div>
                        </div>

                        {/* Action */}
                        <div style={{ textAlign: 'right' }}>
                            <Link href={`/book/${trip.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                                Select
                            </Link>
                        </div>
                    </div>
                ))}

                {trips.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                        <h2>No trips found for this date.</h2>
                        <p>Try searching for a different date or route.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
