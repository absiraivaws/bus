'use client';

import { useState, useEffect } from 'react';
import { createVehicle, updateVehicle, deleteVehicle } from '../actions';
import Image from 'next/image';

type SeatSlot = {
    id: string;
    row: number;
    col: number;
    type: 'seat' | 'empty' | 'driver';
    label: string;
    isWindow: boolean;
};

type Vehicle = {
    id: string;
    plateNumber: string;
    type: string;
    totalSeats: number;
    operatorName: string | null;
    operatorWhatsapp: string | null;
    image1: string | null;
    image2: string | null;
    image3: string | null;
    seatLayout: string | null;
    columns: number;
    rows: number;
    amenities: string | null;
    scheduleType: string;
};

type Template = {
    id: string;
    name: string;
    columns: number;
    rows: number;
    totalSeats: number;
    seatLayout: string;
};

export default function VehiclesPage({ vehicles, templates }: { vehicles: Vehicle[]; templates: Template[] }) {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [columns, setColumns] = useState(4);
    const [rows, setRows] = useState(10);
    const [slots, setSlots] = useState<SeatSlot[]>([]);
    const [totalSeats, setTotalSeats] = useState(0);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [fleetSearch, setFleetSearch] = useState('');

    // Image previews
    const [image1Preview, setImage1Preview] = useState<string | null>(null);
    const [image2Preview, setImage2Preview] = useState<string | null>(null);
    const [image3Preview, setImage3Preview] = useState<string | null>(null);

    // Initialize empty grid function
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
            initializeEmptyGrid();
        }
    }, [selectedTemplateId, templates]);

    useEffect(() => {
        if (!selectedTemplateId) {
            initializeEmptyGrid();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, columns, selectedTemplateId]);

    useEffect(() => {
        setTotalSeats(slots.filter(s => s.type === 'seat').length);
    }, [slots]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageNumber: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (imageNumber === 1) setImage1Preview(result);
                else if (imageNumber === 2) setImage2Preview(result);
                else if (imageNumber === 3) setImage3Preview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setImage1Preview(vehicle.image1);
        setImage2Preview(vehicle.image2);
        setImage3Preview(vehicle.image3);

        if (vehicle.seatLayout) {
            const loadedSlots = JSON.parse(vehicle.seatLayout);
            setSlots(loadedSlots);
            setColumns(vehicle.columns);
            setRows(vehicle.rows);
            setTotalSeats(vehicle.totalSeats);
        }

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingVehicle(null);
        setImage1Preview(null);
        setImage2Preview(null);
        setImage3Preview(null);
        setSelectedTemplateId('');
        initializeEmptyGrid();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (editingVehicle) {
            formData.append('id', editingVehicle.id);
            await updateVehicle(formData);
            handleCancelEdit();
        } else {
            await createVehicle(formData);
        }

        e.currentTarget.reset();
        setImage1Preview(null);
        setImage2Preview(null);
        setImage3Preview(null);
    };

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Vehicle Management</h1>
            </header>

            <div className="grid-form" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '20px' }}>
                {/* Add/Edit Vehicle Form */}
                <div className="glass card">
                    <h2 style={{ marginBottom: '20px' }}>
                        {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                    </h2>

                    {editingVehicle && (
                        <div style={{
                            padding: '10px 15px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>Editing: {editingVehicle.plateNumber}</span>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                            >
                                Cancel Edit
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input type="hidden" name="seatLayout" value={JSON.stringify(slots)} />
                        <input type="hidden" name="totalSeats" value={totalSeats} />
                        <input type="hidden" name="columns" value={columns} />
                        <input type="hidden" name="rows" value={rows} />

                        <div>
                            <label className="label">Plate Number</label>
                            <input
                                name="plateNumber"
                                className="input"
                                required
                                placeholder="e.g. ABC-1234"
                                defaultValue={editingVehicle?.plateNumber || ''}
                            />
                        </div>

                        <div>
                            <label className="label">Type</label>
                            <select
                                name="type"
                                className="input"
                                required
                                defaultValue={editingVehicle?.type || 'Bus'}
                            >
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
                                {templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name} ({template.totalSeats} seats)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Schedule Type</label>
                            <select
                                name="scheduleType"
                                className="input"
                                defaultValue={editingVehicle?.scheduleType || 'Random'}
                            >
                                <option value="Daily">Daily (Available every day)</option>
                                <option value="Random">Random (Specific dates only)</option>
                            </select>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                                Daily: Trips auto-show for all days. Random: Only manually scheduled trips appear.
                            </p>
                        </div>

                        <div>
                            <label className="label">Amenities</label>
                            <input
                                name="amenities"
                                className="input"
                                placeholder="AC, WiFi, USB"
                                defaultValue={editingVehicle?.amenities || ''}
                            />
                        </div>

                        <div>
                            <label className="label">Operator Name</label>
                            <input
                                name="operatorName"
                                className="input"
                                required
                                placeholder="John Doe"
                                defaultValue={editingVehicle?.operatorName || ''}
                            />
                        </div>

                        <div>
                            <label className="label">Operator WhatsApp</label>
                            <input
                                name="operatorWhatsapp"
                                className="input"
                                required
                                placeholder="+94 77 123 4567"
                                defaultValue={editingVehicle?.operatorWhatsapp || ''}
                            />
                        </div>

                        {/* Vehicle Images */}
                        <div style={{
                            padding: '20px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: '2px dashed var(--border)'
                        }}>
                            <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>Vehicle Images (Up to 3)</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                {/* Image 1 */}
                                <div>
                                    <label className="label">Image 1</label>
                                    <input
                                        type="file"
                                        name="image1"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 1)}
                                        className="input"
                                        style={{ padding: '8px' }}
                                    />
                                    {image1Preview && (
                                        <div style={{ marginTop: '10px', position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                                            <Image
                                                src={image1Preview}
                                                alt="Preview 1"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Image 2 */}
                                <div>
                                    <label className="label">Image 2</label>
                                    <input
                                        type="file"
                                        name="image2"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 2)}
                                        className="input"
                                        style={{ padding: '8px' }}
                                    />
                                    {image2Preview && (
                                        <div style={{ marginTop: '10px', position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                                            <Image
                                                src={image2Preview}
                                                alt="Preview 2"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Image 3 */}
                                <div>
                                    <label className="label">Image 3</label>
                                    <input
                                        type="file"
                                        name="image3"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 3)}
                                        className="input"
                                        style={{ padding: '8px' }}
                                    />
                                    {image3Preview && (
                                        <div style={{ marginTop: '10px', position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                                            <Image
                                                src={image3Preview}
                                                alt="Preview 3"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={totalSeats > 70 || totalSeats === 0}
                        >
                            {totalSeats > 70 ? 'Too Many Seats (>70)' : totalSeats === 0 ? 'No Seats Configured' : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
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
                                        border: slot.type === 'empty' ? '1px dashed var(--border)' : '1px solid var(--border)',
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
                            <div>
                                <span style={{ display: 'inline-block', width: '20px', height: '20px', background: 'var(--secondary)', borderRadius: '4px', marginRight: '8px', verticalAlign: 'middle' }}></span>
                                Window Seats
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle List */}
                <div className="glass card table-container" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>Fleet Inventory</h2>
                        <input
                            type="text"
                            placeholder="🔍 Search vehicles..."
                            value={fleetSearch}
                            onChange={(e) => setFleetSearch(e.target.value)}
                            className="input"
                            style={{ maxWidth: '250px', padding: '8px 12px' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {vehicles
                            .filter(vehicle =>
                                vehicle.plateNumber.toLowerCase().includes(fleetSearch.toLowerCase()) ||
                                vehicle.type.toLowerCase().includes(fleetSearch.toLowerCase()) ||
                                (vehicle.operatorName?.toLowerCase() || '').includes(fleetSearch.toLowerCase())
                            )
                            .map((vehicle) => (
                                <div key={vehicle.id} className="glass" style={{ padding: '20px', borderRadius: '12px' }}>
                                    {/* Vehicle Images */}
                                    {(vehicle.image1 || vehicle.image2 || vehicle.image3) && (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: vehicle.image2 || vehicle.image3 ? '2fr 1fr' : '1fr',
                                            gap: '8px',
                                            marginBottom: '15px',
                                            height: '150px'
                                        }}>
                                            {vehicle.image1 && (
                                                <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                                                    <Image
                                                        src={vehicle.image1}
                                                        alt={vehicle.plateNumber}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                            {(vehicle.image2 || vehicle.image3) && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {vehicle.image2 && (
                                                        <div style={{ position: 'relative', flex: 1, borderRadius: '8px', overflow: 'hidden' }}>
                                                            <Image
                                                                src={vehicle.image2}
                                                                alt={vehicle.plateNumber}
                                                                fill
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                    )}
                                                    {vehicle.image3 && (
                                                        <div style={{ position: 'relative', flex: 1, borderRadius: '8px', overflow: 'hidden' }}>
                                                            <Image
                                                                src={vehicle.image3}
                                                                alt={vehicle.plateNumber}
                                                                fill
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                            {vehicle.plateNumber}
                                        </h3>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: 'rgba(46, 87, 209, 0.2)',
                                            color: '#60a5fa',
                                            fontSize: '0.8rem'
                                        }}>
                                            {vehicle.type}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                        <div>Seats: {vehicle.totalSeats}</div>
                                        <div>Operator: {vehicle.operatorName}</div>
                                        <div>Contact: {vehicle.operatorWhatsapp}</div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(vehicle)}
                                            className="btn btn-secondary"
                                            style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }}
                                        >
                                            Edit
                                        </button>
                                        <form action={deleteVehicle.bind(null, vehicle.id)} style={{ flex: 1 }}>
                                            <button
                                                type="submit"
                                                className="btn"
                                                style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px', background: 'var(--error)' }}
                                                onClick={(e) => {
                                                    if (!confirm('Are you sure you want to delete this vehicle?')) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
