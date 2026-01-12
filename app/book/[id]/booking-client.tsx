'use client';

import { useState, useEffect } from 'react';
import { createBooking } from '../../actions';

type SeatSlot = {
    id: string;
    row: number;
    col: number;
    type: 'seat' | 'empty' | 'driver';
    label: string;
    isWindow: boolean;
    status: 'available' | 'reserved' | 'pending' | 'selected';
};

type BookingClientProps = {
    trip: {
        id: string;
        pricePerSeat: number;
        date: Date;
        departureTime: string;
        vehicle: {
            plateNumber: string;
            type: string;
            seatLayout: string | null;
            columns: number;
            rows: number;
            totalSeats: number;
        };
        route: {
            startLocation: { name: string };
            endLocation: { name: string };
            stops: string | null;
        };
    };
    existingBookings: Array<{ seatNumbers: string }>;
};

export default function BookingClient({ trip, existingBookings }: BookingClientProps) {
    const [slots, setSlots] = useState<SeatSlot[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [pickupPoint, setPickupPoint] = useState('');
    const [dropPoint, setDropPoint] = useState('');
    const [passengerName, setPassengerName] = useState('');
    const [passengerEmail, setPassengerEmail] = useState('');

    const CONVENIENCE_FEE = 50; // Fixed convenience fee

    // Parse stops
    const stops = trip.route.stops ? trip.route.stops.split(',').map((s: string) => s.trim()) : [];
    const allStops = [trip.route.startLocation.name, ...stops, trip.route.endLocation.name];

    // Initialize seat layout
    useEffect(() => {
        let seatSlots: SeatSlot[] = [];

        if (trip.vehicle.seatLayout) {
            // Use saved seat layout
            const parsedLayout = JSON.parse(trip.vehicle.seatLayout);
            seatSlots = parsedLayout.map((slot: SeatSlot) => ({
                ...slot,
                status: 'available'
            }));
        } else {
            // Generate default layout
            const { columns, rows } = trip.vehicle;

            // Driver seat
            seatSlots.push({
                id: 'driver',
                row: 0,
                col: columns - 1,
                type: 'driver',
                label: 'Driver',
                isWindow: false,
                status: 'available'
            });

            // Regular seats
            let seatCount = 1;
            for (let r = 1; r <= rows; r++) {
                for (let c = 0; c < columns; c++) {
                    seatSlots.push({
                        id: `${r}-${c}`,
                        row: r,
                        col: c,
                        type: 'seat',
                        label: seatCount.toString().padStart(2, '0'),
                        isWindow: c === 0 || c === columns - 1,
                        status: 'available'
                    });
                    seatCount++;
                }
            }
        }

        // Mark reserved seats from existing bookings
        const reservedSeats = new Set<string>();
        existingBookings.forEach(booking => {
            const seats = booking.seatNumbers.split(',').map(s => s.trim());
            seats.forEach(seat => reservedSeats.add(seat));
        });

        seatSlots = seatSlots.map(slot => {
            if (slot.type === 'seat' && reservedSeats.has(slot.label)) {
                return { ...slot, status: 'reserved' as const };
            }
            return slot;
        });

        setSlots(seatSlots);
        setPickupPoint(allStops[0]);
        setDropPoint(allStops[allStops.length - 1]);
    }, [trip, existingBookings]);

    const handleSeatClick = (seatId: string, seatLabel: string) => {
        const seat = slots.find(s => s.id === seatId);
        if (!seat || seat.type !== 'seat' || seat.status === 'reserved') return;

        if (selectedSeats.includes(seatLabel)) {
            // Deselect
            setSelectedSeats(selectedSeats.filter(s => s !== seatLabel));
            setSlots(slots.map(s =>
                s.id === seatId ? { ...s, status: 'available' as const } : s
            ));
        } else {
            // Select
            setSelectedSeats([...selectedSeats, seatLabel]);
            setSlots(slots.map(s =>
                s.id === seatId ? { ...s, status: 'selected' as const } : s
            ));
        }
    };

    const subtotal = selectedSeats.length * trip.pricePerSeat;
    const totalAmount = subtotal + CONVENIENCE_FEE;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }

        const formData = new FormData();
        formData.append('tripId', trip.id);
        formData.append('seatNumbers', selectedSeats.join(','));
        formData.append('seatCount', selectedSeats.length.toString());
        formData.append('pickupPoint', pickupPoint);
        formData.append('dropPoint', dropPoint);
        formData.append('passengerName', passengerName);
        formData.append('passengerEmail', passengerEmail);
        formData.append('pricePerSeat', trip.pricePerSeat.toString());

        await createBooking(formData);
    };

    const getSeatColor = (status: string) => {
        switch (status) {
            case 'available':
                return '#10b981'; // Green
            case 'reserved':
                return '#ef4444'; // Red
            case 'pending':
                return '#f59e0b'; // Orange
            case 'selected':
                return '#3b82f6'; // Blue
            default:
                return 'var(--surface)';
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px' }}>
            <header className="page-header">
                <h1 className="page-title">Select Your Seats</h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                {/* Seat Selection Area */}
                <div className="glass card">
                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                        <h3>Trip Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                            <div>
                                <div className="label">Route</div>
                                <div>{trip.route.startLocation.name} → {trip.route.endLocation.name}</div>
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

                    {/* Seat Legend */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', background: '#10b981', borderRadius: '4px' }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Available</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', background: '#3b82f6', borderRadius: '4px' }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Selected</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', background: '#ef4444', borderRadius: '4px' }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Reserved</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', background: '#f59e0b', borderRadius: '4px' }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Pending</span>
                        </div>
                    </div>

                    {/* Seat Layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${trip.vehicle.columns}, 1fr)`,
                        gap: '10px',
                        padding: '30px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        maxHeight: '600px',
                        overflowY: 'auto'
                    }}>
                        {slots.sort((a, b) => (a.row - b.row) || (a.col - b.col)).map((slot) => {
                            const isFirstRow = slot.row === 1;
                            const isDriver = slot.type === 'driver';

                            return (
                                <div
                                    key={slot.id}
                                    onClick={() => !isDriver && handleSeatClick(slot.id, slot.label)}
                                    style={{
                                        height: '50px',
                                        background: slot.type === 'empty' ? 'transparent' :
                                            (isDriver ? '#333' : getSeatColor(slot.status)),
                                        border: slot.type === 'empty' ? '2px dashed rgba(255,255,255,0.1)' :
                                            (isFirstRow && slot.type === 'seat' ? '2px solid var(--accent)' : '2px solid rgba(255,255,255,0.2)'),
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: isDriver || slot.type === 'empty' || slot.status === 'reserved' ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        color: slot.type === 'empty' ? 'transparent' : '#fff',
                                        position: 'relative',
                                        transition: 'all 0.2s ease',
                                        opacity: slot.status === 'reserved' ? 0.5 : 1,
                                        transform: slot.status === 'selected' ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: slot.status === 'selected' ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'
                                    }}
                                >
                                    {isDriver ? '🚗' : slot.label}
                                    {slot.isWindow && slot.type === 'seat' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px',
                                            fontSize: '0.7rem'
                                        }}>🪟</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p>Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
                    </div>
                </div>

                {/* Booking Form & Bill */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Bill Summary */}
                    <div className="glass card">
                        <h3 style={{ marginBottom: '20px' }}>Fare Breakdown</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Seats Selected</span>
                                <span style={{ fontWeight: 'bold' }}>{selectedSeats.length}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Price per Seat</span>
                                <span>${trip.pricePerSeat.toFixed(2)}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Subtotal ({selectedSeats.length} × ${trip.pricePerSeat})</span>
                                <span style={{ fontWeight: 'bold' }}>${subtotal.toFixed(2)}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Convenience Fee</span>
                                <span>${CONVENIENCE_FEE.toFixed(2)}</span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '15px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                borderRadius: '8px',
                                marginTop: '10px'
                            }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Amount</span>
                                <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    ${totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <form onSubmit={handleSubmit} className="glass card">
                        <h3 style={{ marginBottom: '20px' }}>Booking Details</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label className="label">Pickup Point</label>
                                <select
                                    className="input"
                                    value={pickupPoint}
                                    onChange={(e) => setPickupPoint(e.target.value)}
                                    required
                                >
                                    {allStops.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="label">Dropoff Point</label>
                                <select
                                    className="input"
                                    value={dropPoint}
                                    onChange={(e) => setDropPoint(e.target.value)}
                                    required
                                >
                                    {allStops.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="label">Full Name</label>
                                <input
                                    className="input"
                                    value={passengerName}
                                    onChange={(e) => setPassengerName(e.target.value)}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={passengerEmail}
                                    onChange={(e) => setPassengerEmail(e.target.value)}
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '10px', fontSize: '1.1rem' }}
                                disabled={selectedSeats.length === 0}
                            >
                                {selectedSeats.length === 0 ? 'Select Seats to Continue' : `Proceed to Payment ($${totalAmount.toFixed(2)})`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
