import { prisma } from '@/lib/prisma';
import { createLocation, createRoute, deleteLocation, deleteRoute } from '../actions';

export default async function RoutesPage() {
    const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
    const routes = await prisma.route.findMany({
        include: {
            startLocation: true,
            endLocation: true
        }
    });

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Route Management</h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                {/* Locations Section */}
                <div>
                    <div className="glass card" style={{ marginBottom: '20px' }}>
                        <h2 style={{ marginBottom: '20px' }}>Add Location</h2>
                        <form action={createLocation} className="grid-form">
                            <div>
                                <label className="label">City Name</label>
                                <input name="name" className="input" required placeholder="e.g. Colombo" />
                            </div>
                            <div>
                                <label className="label">District</label>
                                <input name="district" className="input" required placeholder="e.g. Western" />
                            </div>
                            <button type="submit" className="btn btn-secondary">Add Location</button>
                        </form>
                    </div>

                    <div className="glass card">
                        <h3 style={{ marginBottom: '15px' }}>Locations</h3>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {locations.map((loc: any) => (
                                <li key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <span>{loc.name} <small style={{ color: 'var(--text-muted)' }}>({loc.district})</small></span>
                                    <form action={deleteLocation.bind(null, loc.id)}>
                                        <button type="submit" style={{ color: 'var(--error)', background: 'none' }}>&times;</button>
                                    </form>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Routes Section */}
                <div>
                    <div className="glass card" style={{ marginBottom: '20px' }}>
                        <h2 style={{ marginBottom: '20px' }}>Create Route</h2>
                        <form action={createRoute} className="grid-form">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label className="label">From</label>
                                    <select name="startLocationId" className="input" required>
                                        <option value="">Select Origin</option>
                                        {locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">To</label>
                                    <select name="endLocationId" className="input" required>
                                        <option value="">Select Destination</option>
                                        {locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label">Duration (Minutes)</label>
                                <input name="estimatedDuration" type="number" className="input" required />
                            </div>

                            <div>
                                <label className="label">Stops (comma separated)</label>
                                <input name="stops" className="input" placeholder="City A, City B" />
                            </div>

                            <button type="submit" className="btn btn-primary">Create Route</button>
                        </form>
                    </div>

                    <div className="glass card">
                        <h3 style={{ marginBottom: '15px' }}>Active Routes</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {routes.map((route: any) => (
                                <div key={route.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {route.startLocation.name} &rarr; {route.endLocation.name}
                                        </div>
                                        <form action={deleteRoute.bind(null, route.id)}>
                                            <button type="submit" style={{ color: 'var(--error)', background: 'none' }}>Delete</button>
                                        </form>
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
