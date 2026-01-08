export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function Home() {
  const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="glass" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', width: '100%', zIndex: 100, borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Antigravity
        </div>
        <div>
          <Link href="/operator" className="btn btn-secondary">Operator Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '100px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.1 }}>
          Travel with <span style={{ color: 'var(--primary)' }}>Style</span>.
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '50px', maxWidth: '600px' }}>
          Book bus, van, and car trips across the country with the most premium booking platform.
        </p>

        {/* Search Bar */}
        <div className="glass" style={{ padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '900px' }}>
          <form action="/search" method="GET" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
            <div style={{ textAlign: 'left' }}>
              <label className="label">From</label>
              <select name="from" className="input" required>
                <option value="">Select Origin</option>
                {locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </div>
            <div style={{ textAlign: 'left' }}>
              <label className="label">To</label>
              <select name="to" className="input" required>
                <option value="">Select Destination</option>
                {locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </div>
            <div style={{ textAlign: 'left' }}>
              <label className="label">Date</label>
              <input name="date" type="date" className="input" required min={new Date().toISOString().split('T')[0]} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '46px', fontSize: '1.1rem' }}>
              Search Trips
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
