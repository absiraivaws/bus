export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import RoutesClient from './routes-client';

export default async function RoutesPage() {
    const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
    const routes = await prisma.route.findMany({
        include: {
            startLocation: true,
            endLocation: true
        }
    });

    return <RoutesClient locations={locations} routes={routes} />;
}
