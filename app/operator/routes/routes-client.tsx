'use client';

import { useState } from 'react';
import { createLocation, createRoute, deleteLocation, deleteRoute, updateLocation, updateRoute } from '../actions';

type Location = {
    id: string;
    name: string;
    district: string;
};

type Route = {
    id: string;
    startLocation: { name: string; id: string };
    endLocation: { name: string; id: string };
    estimatedDuration: number;
    stops: string | null;
};

export default function RoutesClient({ locations: initialLocations, routes: initialRoutes }: { locations: Location[]; routes: Route[] }) {
    const [locationSearch, setLocationSearch] = useState('');
    const [routeSearch, setRouteSearch] = useState('');
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);
    const [selectedStartLocation, setSelectedStartLocation] = useState('');

    const filteredLocations = initialLocations.filter(loc =>
        loc.name.toLowerCase().includes(locationSearch.toLowerCase())
    );

    const filteredRoutes = initialRoutes.filter(route =>
        route.startLocation.name.toLowerCase().includes(routeSearch.toLowerCase()) ||
        route.endLocation.name.toLowerCase().includes(routeSearch.toLowerCase())
    );

    const handleLocationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (editingLocation) {
            formData.append('id', editingLocation.id);
            await updateLocation(formData);
            setEditingLocation(null);
        } else {
            await createLocation(formData);
        }

        e.currentTarget.reset();
    };

    const handleRouteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (editingRoute) {
            formData.append('id', editingRoute.id);
            await updateRoute(formData);
            setEditingRoute(null);
        } else {
            await createRoute(formData);
        }

        e.currentTarget.reset();
    };

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Route Management</h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                {/* Locations Section */}
                <div>
                    <div className="glass card" style={{ marginBottom: '20px' }}>
                        <h2 style={{ marginBottom: '20px' }}>
                            {editingLocation ? 'Edit Location' : 'Add Location'}
                        </h2>

                        {editingLocation && (
                            <div style={{
                                padding: '10px 15px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>Editing: {editingLocation.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setEditingLocation(null)}
                                    style={{ background: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleLocationSubmit} className="grid-form">
                            <div>
                                <label className="label">City Name</label>
                                <input
                                    name="name"
                                    className="input"
                                    required
                                    placeholder="e.g. Colombo"
                                    defaultValue={editingLocation?.name || ''}
                                />
                            </div>
                            <button type="submit" className="btn btn-secondary">
                                {editingLocation ? 'Update Location' : 'Add Location'}
                            </button>
                        </form>
                    </div>

                    <div className="glass card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>Locations</h3>
                            <input
                                type="text"
                                placeholder="🔍 Search locations..."
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                className="input"
                                style={{ maxWidth: '200px', padding: '8px 12px' }}
                            />
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredLocations.map((loc) => (
                                <li key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <span>{loc.name}</span>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setEditingLocation(loc)}
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                        >
                                            Edit
                                        </button>
                                        <form action={deleteLocation.bind(null, loc.id)}>
                                            <button
                                                type="submit"
                                                style={{ color: 'var(--error)', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                                                onClick={(e) => {
                                                    if (!confirm(`Are you sure you want to delete "${loc.name}"?`)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                ×
                                            </button>
                                        </form>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Routes Section */}
                <div>
                    <div className="glass card" style={{ marginBottom: '20px' }}>
                        <h2 style={{ marginBottom: '20px' }}>
                            {editingRoute ? 'Edit Route' : 'Create Route'}
                        </h2>

                        {editingRoute && (
                            <div style={{
                                padding: '10px 15px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>Editing: {editingRoute.startLocation.name} → {editingRoute.endLocation.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setEditingRoute(null)}
                                    style={{ background: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleRouteSubmit} className="grid-form">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label className="label">From</label>
                                    <select
                                        name="startLocationId"
                                        className="input"
                                        required
                                        value={selectedStartLocation || editingRoute?.startLocation.id || ''}
                                        onChange={(e) => setSelectedStartLocation(e.target.value)}
                                    >
                                        <option value="">Select Origin</option>
                                        {initialLocations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">To</label>
                                    <select
                                        name="endLocationId"
                                        className="input"
                                        required
                                        defaultValue={editingRoute?.endLocation.id || ''}
                                    >
                                        <option value="">Select Destination</option>
                                        {initialLocations
                                            .filter(loc => loc.id !== selectedStartLocation)
                                            .map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label">Duration (Minutes)</label>
                                <input
                                    name="estimatedDuration"
                                    type="number"
                                    className="input"
                                    required
                                    defaultValue={editingRoute?.estimatedDuration || ''}
                                />
                            </div>

                            <div>
                                <label className="label">Stops (comma separated)</label>
                                <input
                                    name="stops"
                                    className="input"
                                    placeholder="City A, City B"
                                    defaultValue={editingRoute?.stops || ''}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary">
                                {editingRoute ? 'Update Route' : 'Create Route'}
                            </button>
                        </form>
                    </div>

                    <div className="glass card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>Active Routes</h3>
                            <input
                                type="text"
                                placeholder="🔍 Search routes..."
                                value={routeSearch}
                                onChange={(e) => setRouteSearch(e.target.value)}
                                className="input"
                                style={{ maxWidth: '200px', padding: '8px 12px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {filteredRoutes.map((route) => (
                                <div key={route.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {route.startLocation.name} → {route.endLocation.name}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setEditingRoute(route)}
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                            >
                                                Edit
                                            </button>
                                            <form action={deleteRoute.bind(null, route.id)}>
                                                <button
                                                    type="submit"
                                                    className="btn"
                                                    style={{ fontSize: '0.85rem', padding: '6px 12px', background: 'var(--error)' }}
                                                    onClick={(e) => {
                                                        if (!confirm(`Are you sure you want to delete this route?`)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Duration: {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                                    </div>
                                    {route.stops && (
                                        <div style={{ fontSize: '0.85rem', marginTop: '5px', color: 'var(--text-muted)' }}>
                                            Stops: {route.stops}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
