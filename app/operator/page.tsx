export default function OperatorDashboard() {
    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome back, Operator.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="glass card">
                    <h3 className="label">Total Revenue</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>$12,450</div>
                </div>
                <div className="glass card">
                    <h3 className="label">Active Trips</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>24</div>
                </div>
                <div className="glass card">
                    <h3 className="label">Total Bookings</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>1,205</div>
                </div>
            </div>
        </div>
    );
}
