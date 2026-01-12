'use client';

import { useState, useEffect, useRef } from 'react';

type SeatSlot = {
    id: string;
    row: number;
    col: number;
    type: 'seat' | 'empty' | 'driver';
    label: string;
    isWindow: boolean;
};

export default function SeatTemplateManager({
    templates,
    onSave,
    onDelete
}: {
    templates: any[];
    onSave: (formData: FormData) => void;
    onDelete?: (id: string) => void;
}) {
    const MAX_COLS = 6;
    const MAX_ROWS = 20;
    const MAX_SEATS = 100;

    const [templateName, setTemplateName] = useState('');
    const [columns, setColumns] = useState(4);
    const [rows, setRows] = useState(13);
    const [slots, setSlots] = useState<SeatSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [showWindowSeatModal, setShowWindowSeatModal] = useState(false);
    const [windowSeatInput, setWindowSeatInput] = useState('');
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    // Initialize grid
    useEffect(() => {
        const newSlots: SeatSlot[] = [];

        // Create Driver Seat (Row 0)
        newSlots.push({
            id: 'driver',
            row: 0,
            col: columns - 1,
            type: 'driver',
            label: 'Driver',
            isWindow: false
        });

        // Create seat grid - default to 'seat' type
        let seatCount = 1;
        for (let r = 1; r <= rows; r++) {
            for (let c = 0; c < columns; c++) {
                newSlots.push({
                    id: `${r}-${c}`,
                    row: r,
                    col: c,
                    type: 'seat',
                    label: seatCount.toString().padStart(2, '0'),
                    isWindow: false
                });
                seatCount++;
            }
        }
        setSlots(newSlots);
    }, [rows, columns]);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setSelectedSlot(null);
                setPopupPosition(null);
            }
        };

        if (selectedSlot) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedSlot]);

    const handleSlotClick = (slotId: string, event: React.MouseEvent) => {
        if (slotId === 'driver') return;

        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // Position popup near the clicked seat (to the right if space, otherwise left)
        const viewportWidth = window.innerWidth;
        const popupWidth = 250; // Approximate popup width
        let leftPosition = rect.right + scrollLeft + 10;

        // If popup would go off screen, position it to the left
        if (leftPosition + popupWidth > viewportWidth) {
            leftPosition = rect.left + scrollLeft - popupWidth - 10;
        }

        setSelectedSlot(slotId);
        setPopupPosition({
            top: rect.top + scrollTop,
            left: Math.max(10, leftPosition) // Ensure minimum 10px from left edge
        });
    };

    const updateSlot = (id: string, updates: Partial<SeatSlot>) => {
        setSlots(slots.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const handleWindowSeatSubmit = () => {
        const seatNumbers = windowSeatInput.split(',').map(s => s.trim()).filter(s => s);

        setSlots(slots.map(slot => {
            if (slot.type === 'seat' && seatNumbers.includes(slot.label)) {
                return { ...slot, isWindow: true };
            }
            return slot;
        }));

        setShowWindowSeatModal(false);
        setWindowSeatInput('');
    };

    const clearAllWindowSeats = () => {
        setSlots(slots.map(slot => ({ ...slot, isWindow: false })));
    };

    const loadTemplate = (template: any) => {
        const loadedSlots = JSON.parse(template.seatLayout);
        setSlots(loadedSlots);
        setColumns(template.columns);
        setRows(template.rows);
        setTemplateName(template.name);
        setEditingTemplateId(template.id);
    };

    const resetForm = () => {
        setTemplateName('');
        setEditingTemplateId(null);
        setSlots([]);
    };

    const handleSave = () => {
        const formData = new FormData();
        formData.append('name', templateName);
        formData.append('columns', columns.toString());
        formData.append('rows', rows.toString());
        formData.append('seatLayout', JSON.stringify(slots));
        formData.append('totalSeats', totalSeats.toString());

        if (editingTemplateId) {
            formData.append('id', editingTemplateId);
        }

        onSave(formData);
        resetForm();
    };

    const totalSeats = slots.filter(s => s.type === 'seat').length;
    const windowSeats = slots.filter(s => s.type === 'seat' && s.isWindow);

    const selectedSlotData = slots.find(s => s.id === selectedSlot);

    return (
        <div className="glass card">
            <h2 style={{ marginBottom: '20px' }}>Seat Arrangement Templates</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Template Editor */}
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">Template Name</label>
                        <input
                            className="input"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="e.g. Standard 2+2, Luxury 2+1"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                        <div>
                            <label className="label">Columns (Max {MAX_COLS})</label>
                            <input
                                type="number"
                                className="input"
                                value={columns}
                                onChange={e => setColumns(Math.min(MAX_COLS, Math.max(1, parseInt(e.target.value) || 1)))}
                                min="1" max={MAX_COLS}
                            />
                        </div>
                        <div>
                            <label className="label">Rows (Max {MAX_ROWS})</label>
                            <input
                                type="number"
                                className="input"
                                value={rows}
                                onChange={e => setRows(Math.min(MAX_ROWS, Math.max(1, parseInt(e.target.value) || 1)))}
                                min="1" max={MAX_ROWS}
                            />
                        </div>
                    </div>

                    {/* Window Seats Manager */}
                    <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(46, 169, 209, 0.1)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '1rem' }}>Window Seats ({windowSeats.length})</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowWindowSeatModal(true)}
                                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                >
                                    Add Window Seats
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={clearAllWindowSeats}
                                    style={{ fontSize: '0.85rem', padding: '6px 12px', background: 'var(--error)' }}
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {windowSeats.length > 0 ? (
                                <div>Window Seats: {windowSeats.map(s => s.label).join(', ')}</div>
                            ) : (
                                <div>No window seats marked</div>
                            )}
                        </div>
                    </div>

                    {/* Seat Grid */}
                    <div style={{ marginBottom: '20px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Total Seats: {totalSeats} / {MAX_SEATS}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click seat to edit</p>
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
                                const isSelected = selectedSlot === slot.id;

                                return (
                                    <div
                                        key={slot.id}
                                        onClick={(e) => handleSlotClick(slot.id, e)}
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
                                            cursor: slot.type === 'driver' ? 'default' : 'pointer',
                                            fontSize: '0.8rem',
                                            color: slot.type === 'empty' ? 'transparent' : '#fff',
                                            position: 'relative',
                                            boxShadow: isSelected ? '0 0 0 2px var(--primary)' : 'none'
                                        }}
                                    >
                                        {slot.type === 'driver' ? '☸️' : slot.label}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Inline Edit Popup */}
                        {selectedSlot && selectedSlotData && selectedSlotData.type !== 'driver' && popupPosition && (
                            <div
                                ref={popupRef}
                                style={{
                                    position: 'absolute',
                                    top: `${popupPosition.top}px`,
                                    left: `${popupPosition.left}px`,
                                    zIndex: 1000,
                                    background: 'var(--surface)',
                                    border: '2px solid var(--primary)',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    minWidth: '250px'
                                }}
                            >
                                <h4 style={{ marginBottom: '15px', fontSize: '0.95rem', color: 'var(--primary)' }}>
                                    Edit Slot {selectedSlotData.label}
                                </h4>

                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {/* Type Toggle */}
                                    <div>
                                        <label className="label" style={{ marginBottom: '8px' }}>Type</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="btn"
                                                style={{
                                                    flex: 1,
                                                    background: selectedSlotData.type === 'seat' ? 'var(--primary)' : 'var(--surface-highlight)',
                                                    padding: '8px',
                                                    fontSize: '0.85rem'
                                                }}
                                                onClick={() => updateSlot(selectedSlot, { type: 'seat' })}
                                            >
                                                Seat
                                            </button>
                                            <button
                                                type="button"
                                                className="btn"
                                                style={{
                                                    flex: 1,
                                                    background: selectedSlotData.type === 'empty' ? 'var(--primary)' : 'var(--surface-highlight)',
                                                    padding: '8px',
                                                    fontSize: '0.85rem'
                                                }}
                                                onClick={() => updateSlot(selectedSlot, { type: 'empty' })}
                                            >
                                                Empty
                                            </button>
                                        </div>
                                    </div>

                                    {/* Seat Number (only if type is seat) */}
                                    {selectedSlotData.type === 'seat' && (
                                        <>
                                            <div>
                                                <label className="label" style={{ marginBottom: '8px' }}>Seat Number</label>
                                                <input
                                                    className="input"
                                                    value={selectedSlotData.label}
                                                    onChange={(e) => updateSlot(selectedSlot, { label: e.target.value })}
                                                    style={{ fontSize: '0.9rem', padding: '8px' }}
                                                />
                                            </div>

                                            {/* Window Seat Toggle */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px',
                                                background: 'rgba(46, 169, 209, 0.1)',
                                                borderRadius: '8px'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    id={`window-${selectedSlot}`}
                                                    checked={selectedSlotData.isWindow}
                                                    onChange={(e) => updateSlot(selectedSlot, { isWindow: e.target.checked })}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <label
                                                    htmlFor={`window-${selectedSlot}`}
                                                    style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                                                >
                                                    Window Seat
                                                </label>
                                            </div>
                                        </>
                                    )}

                                    {/* Close Button */}
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setSelectedSlot(null);
                                            setPopupPosition(null);
                                        }}
                                        style={{ marginTop: '5px', fontSize: '0.85rem', padding: '8px' }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            onClick={handleSave}
                            disabled={!templateName || totalSeats > MAX_SEATS || totalSeats === 0}
                        >
                            {totalSeats > MAX_SEATS ? `Too Many Seats (>${MAX_SEATS})` : editingTemplateId ? 'Update Template' : 'Save Template'}
                        </button>
                        {editingTemplateId && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Saved Templates List */}
                <div>
                    <h3 style={{ marginBottom: '15px' }}>Saved Templates</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {templates.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                                No templates yet. Create your first seat arrangement template!
                            </p>
                        )}
                        {templates.map((template: any) => (
                            <div
                                key={template.id}
                                style={{
                                    padding: '15px',
                                    background: editingTemplateId === template.id ? 'rgba(46, 87, 209, 0.2)' : 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    border: editingTemplateId === template.id ? '2px solid var(--primary)' : '1px solid var(--border)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h4 style={{ fontWeight: 'bold' }}>{template.name}</h4>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: 'var(--primary)',
                                        fontSize: '0.8rem'
                                    }}>
                                        {template.totalSeats} seats
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                    Grid: {template.columns} × {template.rows}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ flex: 1, fontSize: '0.85rem', padding: '6px 12px' }}
                                        onClick={() => loadTemplate(template)}
                                    >
                                        Edit
                                    </button>
                                    {onDelete && (
                                        <button
                                            type="button"
                                            className="btn"
                                            style={{ fontSize: '0.85rem', padding: '6px 12px', background: 'var(--error)' }}
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
                                                    onDelete(template.id);
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Window Seat Modal */}
            {showWindowSeatModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass card" style={{ maxWidth: '500px', width: '90%' }}>
                        <h2 style={{ marginBottom: '20px' }}>Add Window Seats</h2>
                        <p style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>
                            Enter seat numbers separated by commas (e.g., 01, 04, 08, 12)
                        </p>
                        <textarea
                            className="input"
                            value={windowSeatInput}
                            onChange={(e) => setWindowSeatInput(e.target.value)}
                            placeholder="01, 04, 08, 12, 16, 20"
                            rows={4}
                            style={{ marginBottom: '20px', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={handleWindowSeatSubmit}
                            >
                                Apply
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowWindowSeatModal(false);
                                    setWindowSeatInput('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
