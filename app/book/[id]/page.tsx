import { prisma } from '@/lib/prisma';
import { createBooking } from '../../actions';
import { notFound } from 'next/navigation';

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
            vehicle: true,
            route: { include: { startLocation: true, endLocation: true } }
        }
    });

    if (!trip) notFound();

    // Parse stops
    const stops = trip.route.stops ? trip.route.stops.split(',').map((s: string) => s.trim()) : [];
    const allStops = [trip.route.startLocation.name, ...stops, trip.route.endLocation.name];

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <header className="page-header">
                <h1 className="page-title">Complete your Booking</h1>
            </header>

            <div className="glass card">
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                    <h3>Trip Summary</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                        <div>
                            <div className="label">Route</div>
                            <div>{trip.route.startLocation.name} &rarr; {trip.route.endLocation.name}</div>
                        </div>
                        <div>
                            <div className="label">Date & Time</div>
                            <div>{trip.date.toLocaleDateString()} at {trip.departureTime}</div>
                        </div>
                        <div>
                            <div className="label">Vehicle</div>
                            <div>{trip.vehicle.plateNumber} ({trip.vehicle.type})</div>
                        </div>
                        <div>
                            <div className="label">Price per Seat</div>
                            <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${trip.pricePerSeat}</div>
                        </div>
                    </div>
                </div>

                <form action={createBooking} className="grid-form">
                    <input type="hidden" name="tripId" value={trip.id} />
                    <input type="hidden" name="pricePerSeat" value={trip.pricePerSeat} />

                    <div>
                        <label className="label">Number of Seats</label>
                        <select name="seatCount" className="input" required>
                            {[1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>{n} Seat{n > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label className="label">Pickup Point</label>
                            <select name="pickupPoint" className="input" required>
                                {allStops.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Dropoff Point</label>
                            <select name="dropPoint" className="input" required>
                                {allStops.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Passenger Details</h3>
                        <div className="grid-form">
                            <div>
                                <label className="label">Full Name</label>
                                <input name="passengerName" className="input" required placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input name="passengerEmail" type="email" className="input" required placeholder="john@example.com" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', fontSize: '1.1rem' }}>
                        Proceed to Payment
                    </button>
                </form>
            </div>
        </div>
    );
}
