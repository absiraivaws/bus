import Link from 'next/link';

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="glass" style={{ width: '250px', margin: '20px', padding: '20px', height: 'calc(100vh - 40px)', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px', fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Antigravity
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/operator" className="nav-link">Dashboard</Link>
          <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }}></div>
          <Link href="/operator/seat-templates" className="nav-link">Seat Templates</Link>
          <Link href="/operator/vehicles" className="nav-link">Vehicles</Link>
          <Link href="/operator/routes" className="nav-link">Routes</Link>
          <Link href="/operator/trips" className="nav-link">Trips</Link>
          <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }}></div>
          <Link href="/operator/bookings" className="nav-link">Bookings</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}
