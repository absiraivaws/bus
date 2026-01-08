export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { createTrip, deleteTrip } from '../actions';

export default async function TripsPage() {
    const vehicles = await prisma.vehicle.findMany();
    const routes = await prisma.route.findMany({ include: { startLocation: true, endLocation: true } });
    const trips = await prisma.trip.findMany({
        include: {
            vehicle: true,
            route: { include: { startLocation: true, endLocation: true } }
        },
        orderBy: { date: 'asc' }
    });

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Trip Scheduler</h1>
            </header>

            <div className="grid-form" style={{ gridTemplateColumns: '1fr 2fr', display: 'grid', gap: '20px' }}>
                {/* Schedule Trip Form */}
                <div className="glass card">
                    <h2 style={{ marginBottom: '20px' }}>Schedule New Trip</h2>
                    <form action={createTrip} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label className="label">Vehicle</label>
                            <select name="vehicleId" className="input" required>
                                <option value="">Select Vehicle</option>
                                {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.plateNumber} ({v.type})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="label">Route</label>
                            <select name="routeId" className="input" required>
                                <option value="">Select Route</option>
                                {routes.map((r: any) => <option key={r.id} value={r.id}>{r.startLocation.name} &rarr; {r.endLocation.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label className="label">Date</label>
                                <input name="date" type="date" className="input" required />
                            </div>
                            <div>
                                <label className="label">Departure Time</label>
                                <input name="departureTime" type="time" className="input" required />
                            </div>
                        </div>

                        <div>
                            <label className="label">Price Per Seat</label>
                            <input name="pricePerSeat" type="number" step="0.01" className="input" required />
                        </div>

                        <button type="submit" className="btn btn-primary">Schedule Trip</button>
                    </form>
                </div>

                {/* Trip List */}
                <div className="glass card table-container">
                    <h2 style={{ marginBottom: '20px' }}>Scheduled Trips</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Route</th>
                                <th>Vehicle</th>
                                <th>Price</th>
                                <th>Seats</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.map((trip: any) => (
                                <tr key={trip.id}>
                                    <td>{trip.date.toLocaleDateString()}</td>
                                    <td>{trip.departureTime} - {trip.arrivalTime}</td>
                                    <td>{trip.route.startLocation.name} &rarr; {trip.route.endLocation.name}</td>
                                    <td>{trip.vehicle.plateNumber}</td>
                                    <td>${trip.pricePerSeat}</td>
                                    <td>{trip.availableSeats}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: trip.status === 'Scheduled' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: trip.status === 'Scheduled' ? '#34d399' : '#f87171',
                                            fontSize: '0.8rem'
                                        }}>
                                            {trip.status}
                                        </span>
                                    </td>
                                    <td>
                                        <form action={deleteTrip.bind(null, trip.id)}>
                                            <button type="submit" style={{ color: 'var(--error)', background: 'none', cursor: 'pointer' }}>Cancel</button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {trips.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No trips scheduled.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
