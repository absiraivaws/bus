'use client';

import { useState, useEffect } from 'react';
import { createVehicle, deleteVehicle } from '../actions';

type SeatSlot = {
    id: string;
    row: number;
    col: number;
    type: 'seat' | 'empty' | 'driver';
    label: string;
    isWindow: boolean;
};

export default function VehiclesPage({ vehicles, templates }: { vehicles: any[]; templates: any[] }) {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [columns, setColumns] = useState(4);
    const [rows, setRows] = useState(10);
    const [slots, setSlots] = useState<SeatSlot[]>([]);
    const [totalSeats, setTotalSeats] = useState(0);

    // Load template when selected
    useEffect(() => {
        if (selectedTemplateId) {
            const template = templates.find(t => t.id === selectedTemplateId);
            if (template) {
                const loadedSlots = JSON.parse(template.seatLayout);
                setSlots(loadedSlots);
                setColumns(template.columns);
                setRows(template.rows);
                setTotalSeats(template.totalSeats);
            }
        } else {
            // Initialize empty grid
            initializeEmptyGrid();
        }
    }, [selectedTemplateId]);

    const initializeEmptyGrid = () => {
        const newSlots: SeatSlot[] = [];

        newSlots.push({
            id: 'driver',
            row: 0,
            col: columns - 1,
            type: 'driver',
            label: 'Driver',
            isWindow: false
        });

        let seatCount = 1;
        for (let r = 1; r <= rows; r++) {
            for (let c = 0; c < columns; c++) {
                newSlots.push({
                    id: `${r}-${c}`,
                    row: r,
                    col: c,
                    type: 'seat',
                    label: seatCount.toString().padStart(2, '0'),
                    isWindow: c === 0 || c === columns - 1
                });
                seatCount++;
            }
        }
        setSlots(newSlots);
        setTotalSeats(newSlots.filter(s => s.type === 'seat').length);
    };

    useEffect(() => {
        if (!selectedTemplateId) {
            initializeEmptyGrid();
        }
    }, [rows, columns]);

    useEffect(() => {
        setTotalSeats(slots.filter(s => s.type === 'seat').length);
    }, [slots]);

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Vehicle Management</h1>
            </header>

            <div className="grid-form" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '20px' }}>
                {/* Add Vehicle Form */}
                <div className="glass card">
                    <h2 style={{ marginBottom: '20px' }}>Add New Vehicle</h2>
                    <form action={createVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input type="hidden" name="seatLayout" value={JSON.stringify(slots)} />
                        <input type="hidden" name="totalSeats" value={totalSeats} />
                        <input type="hidden" name="columns" value={columns} />
                        <input type="hidden" name="rows" value={rows} />

                        <div>
                            <label className="label">Plate Number</label>
                            <input name="plateNumber" className="input" required placeholder="e.g. ABC-1234" />
                        </div>

                        <div>
                            <label className="label">Type</label>
                            <select name="type" className="input" required>
                                <option value="Bus">Bus</option>
                                <option value="Van">Van</option>
                                <option value="Car">Car</option>
                                <option value="Special Van">Special Van</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Seat Arrangement Template</label>
                            <select
                                className="input"
                                value={selectedTemplateId}
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                            >
                                <option value="">-- Select a template --</option>
                                {templates.map((template: any) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name} ({template.totalSeats} seats)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Amenities</label>
                            <input name="amenities" className="input" placeholder="AC, WiFi, USB" />
                        </div>

                        <div>
                            <label className="label">Operator Name</label>
                            <input name="operatorName" className="input" required placeholder="John Doe" />
                        </div>

                        <div>
                            <label className="label">Operator WhatsApp</label>
                            <input name="operatorWhatsapp" className="input" required placeholder="+94 77 123 4567" />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={totalSeats > 70 || totalSeats === 0}>
                            {totalSeats > 70 ? 'Too Many Seats (>70)' : totalSeats === 0 ? 'No Seats Configured' : 'Add Vehicle'}
                        </button>
                    </form>
                </div>

                {/* Seat Layout Preview */}
                <div className="glass card">
                    <h2 style={{ marginBottom: '20px' }}>Seat Arrangement Preview</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Total Seats: {totalSeats} / 70</p>
                        {selectedTemplateId && (
                            <p style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                                Using Template: {templates.find(t => t.id === selectedTemplateId)?.name}
                            </p>
                        )}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gap: '8px',
                        padding: '20px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }}>
                        {slots.sort((a, b) => (a.row - b.row) || (a.col - b.col)).map((slot) => {
                            const isFirstRow = slot.row === 1;

                            return (
                                <div
                                    key={slot.id}
                                    style={{
                                        height: '40px',
                                        background: slot.type === 'empty' ? 'transparent' :
                                            (slot.type === 'driver' ? '#333' :
                                                (slot.isWindow ? 'var(--secondary)' : 'var(--surface)')),
                                        border: slot.type === 'empty' ? '1px dashed var(--border)' :
                                            (isFirstRow && slot.type === 'seat' ? '2px solid var(--accent)' : '1px solid var(--border)'),
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        color: slot.type === 'empty' ? 'transparent' : '#fff'
                                    }}
                                >
                                    {slot.type === 'driver' ? '☸️' : slot.label}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(46, 169, 209, 0.1)', borderRadius: '8px', border: '1px solid var(--secondary)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <div style={{ marginBottom: '5px' }}>
                                <span style={{ display: 'inline-block', width: '20px', height: '20px', background: 'var(--secondary)', borderRadius: '4px', marginRight: '8px', verticalAlign: 'middle' }}></span>
                                Window Seats (First & Last Columns)
                            </div>
                            <div>
                                <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid var(--accent)', borderRadius: '4px', marginRight: '8px', verticalAlign: 'middle' }}></span>
                                First Row (Highlighted)
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle List */}
                <div className="glass card table-container" style={{ gridColumn: '1 / -1' }}>
                    <h2 style={{ marginBottom: '20px' }}>Fleet Inventory</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Plate</th>
                                <th>Type</th>
                                <th>Seats</th>
                                <th>Operator</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle: any) => (
                                <tr key={vehicle.id}>
                                    <td>{vehicle.plateNumber}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: 'rgba(46, 87, 209, 0.2)',
                                            color: '#60a5fa',
                                            fontSize: '0.8rem'
                                        }}>
                                            {vehicle.type}
                                        </span>
                                    </td>
                                    <td>{vehicle.totalSeats}</td>
                                    <td>
                                        <div>{vehicle.operatorName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{vehicle.operatorWhatsapp}</div>
                                    </td>
                                    <td>
                                        <form action={deleteVehicle.bind(null, vehicle.id)}>
                                            <button type="submit" style={{ color: 'var(--error)', background: 'none', cursor: 'pointer' }}>
                                                Delete
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
