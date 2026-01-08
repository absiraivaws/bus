export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import VehicleClient from './vehicle-client';

export default async function VehiclesPage() {
    const vehicles = await prisma.vehicle.findMany({
        orderBy: { plateNumber: 'asc' }
    });

    const templates = await prisma.seatTemplate.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return <VehicleClient vehicles={vehicles} templates={templates} />;
}
