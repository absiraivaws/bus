import { prisma } from '@/lib/prisma';
import { processPayment } from '../../actions';

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { trip: true }
    });

    if (!booking) return <div>Booking not found</div>;

    return (
        <div className="container" style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '600px' }}>
            <div className="glass card">
                <h1 style={{ marginBottom: '20px' }}>Payment Gateway</h1>
                <p style={{ marginBottom: '30px' }}>Total Amount: <strong style={{ fontSize: '1.5rem' }}>${booking.totalAmount}</strong></p>

                <div style={{ padding: '20px', background: '#fff', color: '#000', borderRadius: '8px', marginBottom: '30px', textAlign: 'left' }}>
                    <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Credit Card</div>
                    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }}>
                        **** **** **** 4242
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>12/25</div>
                        <div style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>123</div>
                    </div>
                </div>

                <form action={processPayment}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Pay Now
                    </button>
                </form>
            </div>
        </div>
    );
}
