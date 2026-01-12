'use client';

import { useState } from 'react';
import { createTrip, deleteTrip } from '../actions';

type Vehicle = {
    id: string;
    plateNumber: string;
    type: string;
};

type Location = {
    id: string;
    name: string;
};

type Route = {
    id: string;
    startLocation: Location;
    endLocation: Location;
};

type Trip = {
    id: string;
    date: Date;
    departureTime: string;
    arrivalTime: string;
    pricePerSeat: number;
    availableSeats: number;
    status: string;
    bookingWindowDays: number;
    vehicle: Vehicle;
    route: Route;
};

export default function TripsClient({
    vehicles,
    routes,
    trips
}: {
    vehicles: Vehicle[];
    routes: Route[];
    trips: Trip[]
}) {
    const [tripSearch, setTripSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
    const [routeFilter, setRouteFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [vehicleNumberFilter, setVehicleNumberFilter] = useState('');

    // Get unique values for filters
    const uniqueStatuses = ['All', ...Array.from(new Set(trips.map(t => t.status)))];
    const uniqueVehicleTypes = ['All', ...Array.from(new Set(trips.map(t => t.vehicle.type)))];
    const uniqueRoutes = ['All', ...Array.from(new Set(trips.map(t =>
        `${t.route.startLocation.name} → ${t.route.endLocation.name}`
    )))];

    const filteredTrips = trips.filter(trip => {
        const matchesSearch =
            trip.route.startLocation.name.toLowerCase().includes(tripSearch.toLowerCase()) ||
            trip.route.endLocation.name.toLowerCase().includes(tripSearch.toLowerCase()) ||
            trip.vehicle.plateNumber.toLowerCase().includes(tripSearch.toLowerCase()) ||
            trip.vehicle.type.toLowerCase().includes(tripSearch.toLowerCase());

        const matchesStatus = statusFilter === 'All' || trip.status === statusFilter;
        const matchesVehicleType = vehicleTypeFilter === 'All' || trip.vehicle.type === vehicleTypeFilter;
        const matchesRoute = routeFilter === 'All' ||
            `${trip.route.startLocation.name} → ${trip.route.endLocation.name}` === routeFilter;

        const matchesDate = !dateFilter ||
            new Date(trip.date).toISOString().split('T')[0] === dateFilter;

        const matchesVehicleNumber = !vehicleNumberFilter ||
            trip.vehicle.plateNumber.toLowerCase().includes(vehicleNumberFilter.toLowerCase());

        return matchesSearch && matchesStatus && matchesVehicleType && matchesRoute && matchesDate && matchesVehicleNumber;
    });

    const handleDelete = async (tripId: string, tripDate: Date, vehicleType: string) => {
        const tripDateObj = new Date(tripDate);
        const now = new Date();
        const diffTime = tripDateObj.getTime() - now.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);

        // Check 1-day cancellation policy
        if (diffDays < 1) {
            alert('Cannot cancel trips less than 1 day (24 hours) before departure.');
            return;
        }

        if (!confirm('Are you sure you want to cancel this trip? Passengers will be notified via email/WhatsApp.')) {
            return;
        }

        try {
            await deleteTrip(tripId);
            console.log(`[NOTIFICATION] Trip ${tripId} cancelled. Notifying passengers...`);
        } catch (error: any) {
            alert(error.message || 'Failed to cancel trip');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Scheduled':
                return { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399' };
            case 'Cancelled by Operator':
                return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171' };
            case 'Completed':
                return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' };
            default:
                return { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' };
        }
    };

    const clearAllFilters = () => {
        setStatusFilter('All');
        setVehicleTypeFilter('All');
        setRouteFilter('All');
        setDateFilter('');
        setVehicleNumberFilter('');
        setTripSearch('');
    };

    const hasActiveFilters = statusFilter !== 'All' || vehicleTypeFilter !== 'All' ||
        routeFilter !== 'All' || dateFilter || vehicleNumberFilter || tripSearch;

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Trip Scheduler</h1>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Schedule Trip Form */}
                <div className="glass card">
                    <h2 style={{ marginBottom: '20px' }}>Schedule New Trip</h2>
                    <form action={createTrip} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label className="label">Vehicle</label>
                            <select name="vehicleId" className="input" required>
                                <option value="">Select Vehicle</option>
                                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber} ({v.type})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="label">Route</label>
                            <select name="routeId" className="input" required>
                                <option value="">Select Route</option>
                                {routes.map((r) => <option key={r.id} value={r.id}>{r.startLocation.name} &rarr; {r.endLocation.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="label">Date</label>
                            <input name="date" type="date" className="input" required />
                        </div>

                        <div>
                            <label className="label">Departure Time</label>
                            <input name="departureTime" type="time" className="input" required />
                        </div>

                        <div>
                            <label className="label">Price Per Seat</label>
                            <input name="pricePerSeat" type="number" step="0.01" className="input" required />
                        </div>

                        <div>
                            <label className="label">Booking Window (Days in Advance)</label>
                            <input
                                name="bookingWindowDays"
                                type="number"
                                min="0"
                                max="90"
                                defaultValue="30"
                                className="input"
                                required
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                How many days before trip passengers can book (0-90 days)
                            </p>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Schedule Trip</button>
                        </div>
                    </form>
                </div>

                {/* Trip List */}
                <div className="glass card">
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h2>Scheduled Trips</h2>
                            <input
                                type="text"
                                placeholder="🔍 Search trips..."
                                value={tripSearch}
                                onChange={(e) => setTripSearch(e.target.value)}
                                className="input"
                                style={{ maxWidth: '250px', padding: '8px 12px' }}
                            />
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '15px' }}>
                            <div>
                                <label className="label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="input"
                                    style={{ padding: '6px 10px', fontSize: '0.9rem' }}
                                >
                                    {uniqueStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>Vehicle Type</label>
                                <select
                                    value={vehicleTypeFilter}
                                    onChange={(e) => setVehicleTypeFilter(e.target.value)}
                                    className="input"
                                    style={{ padding: '6px 10px', fontSize: '0.9rem' }}
                                >
                                    {uniqueVehicleTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>Route</label>
                                <select
                                    value={routeFilter}
                                    onChange={(e) => setRouteFilter(e.target.value)}
                                    className="input"
                                    style={{ padding: '6px 10px', fontSize: '0.9rem' }}
                                >
                                    {uniqueRoutes.map(route => (
                                        <option key={route} value={route}>{route}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>Date</label>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="input"
                                    style={{ padding: '6px 10px', fontSize: '0.9rem' }}
                                />
                            </div>

                            <div>
                                <label className="label" style={{ fontSize: '0.85rem', marginBottom: '5px' }}>Vehicle Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. NP-2354"
                                    value={vehicleNumberFilter}
                                    onChange={(e) => setVehicleNumberFilter(e.target.value)}
                                    className="input"
                                    style={{ padding: '6px 10px', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {hasActiveFilters && (
                            <div style={{
                                padding: '8px 12px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                flexWrap: 'wrap'
                            }}>
                                <span style={{ color: 'var(--text-muted)' }}>Active filters:</span>
                                {statusFilter !== 'All' && (
                                    <span style={{ padding: '2px 8px', background: 'var(--primary)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        Status: {statusFilter}
                                    </span>
                                )}
                                {vehicleTypeFilter !== 'All' && (
                                    <span style={{ padding: '2px 8px', background: 'var(--primary)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        Type: {vehicleTypeFilter}
                                    </span>
                                )}
                                {routeFilter !== 'All' && (
                                    <span style={{ padding: '2px 8px', background: 'var(--primary)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        Route: {routeFilter}
                                    </span>
                                )}
                                {dateFilter && (
                                    <span style={{ padding: '2px 8px', background: 'var(--primary)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        Date: {new Date(dateFilter).toLocaleDateString()}
                                    </span>
                                )}
                                {vehicleNumberFilter && (
                                    <span style={{ padding: '2px 8px', background: 'var(--primary)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        Vehicle: {vehicleNumberFilter}
                                    </span>
                                )}
                                {tripSearch && (
                                    <span style={{ padding: '2px 8px', background: 'var(--primary)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        Search: "{tripSearch}"
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    style={{
                                        marginLeft: 'auto',
                                        padding: '2px 8px',
                                        background: 'var(--error)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Route</th>
                                    <th>Vehicle</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Seats</th>
                                    <th>Booking Window</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTrips.map((trip) => {
                                    const statusColors = getStatusColor(trip.status);
                                    return (
                                        <tr key={trip.id}>
                                            <td>{new Date(trip.date).toLocaleDateString()}</td>
                                            <td>{trip.departureTime} - {trip.arrivalTime}</td>
                                            <td>{trip.route.startLocation.name} &rarr; {trip.route.endLocation.name}</td>
                                            <td>{trip.vehicle.plateNumber}</td>
                                            <td>
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '4px',
                                                    background: 'rgba(59, 130, 246, 0.2)',
                                                    color: '#60a5fa',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {trip.vehicle.type}
                                                </span>
                                            </td>
                                            <td>${trip.pricePerSeat}</td>
                                            <td>{trip.availableSeats}</td>
                                            <td>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {trip.bookingWindowDays || 30} days
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    background: statusColors.bg,
                                                    color: statusColors.color,
                                                    fontSize: '0.8rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {trip.status}
                                                </span>
                                            </td>
                                            <td>
                                                {trip.status === 'Scheduled' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(trip.id, trip.date, trip.vehicle.type)}
                                                        style={{ color: 'var(--error)', background: 'none', cursor: 'pointer' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredTrips.length === 0 && (
                                    <tr>
                                        <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            {hasActiveFilters
                                                ? 'No trips match your filters.'
                                                : 'No trips scheduled.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
