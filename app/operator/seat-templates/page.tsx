export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import SeatTemplateManager from './template-manager';
import { createSeatTemplate, deleteSeatTemplate } from './actions';

export default async function SeatTemplatesPage() {
    const templates = await prisma.seatTemplate.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Seat Arrangement Templates</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Create and manage reusable seat layouts for your vehicles. Max 20 rows, 6 columns, 100 seats.
                </p>
            </header>

            <SeatTemplateManager
                templates={templates}
                onSave={createSeatTemplate}
                onDelete={deleteSeatTemplate}
            />
        </div>
    );
}
