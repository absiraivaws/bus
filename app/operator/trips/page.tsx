export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import TripsClient from './trips-client';

export default async function TripsPage() {
    const vehicles = await prisma.vehicle.findMany();
    const routes = await prisma.route.findMany({ include: { startLocation: true, endLocation: true } });

    // Get all trips and filter out those older than 1 day after their scheduled date
    const now = new Date();
    const allTrips = await prisma.trip.findMany({
        include: {
            vehicle: true,
            route: { include: { startLocation: true, endLocation: true } }
        },
        orderBy: { date: 'asc' }
    });

    // Filter trips: keep only if trip date + 1 day is >= today
    const trips = allTrips.filter(trip => {
        const tripDate = new Date(trip.date);
        const nextDay = new Date(tripDate);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay >= now;
    });

    return <TripsClient vehicles={vehicles} routes={routes} trips={trips} />;
}
