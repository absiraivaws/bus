import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create Locations
    const locations = await Promise.all([
        prisma.location.create({
            data: { name: 'Colombo', district: 'Colombo' }
        }),
        prisma.location.create({
            data: { name: 'Kandy', district: 'Kandy' }
        }),
        prisma.location.create({
            data: { name: 'Galle', district: 'Galle' }
        }),
        prisma.location.create({
            data: { name: 'Jaffna', district: 'Jaffna' }
        }),
        prisma.location.create({
            data: { name: 'Matara', district: 'Matara' }
        }),
        prisma.location.create({
            data: { name: 'Negombo', district: 'Gampaha' }
        }),
        prisma.location.create({
            data: { name: 'Anuradhapura', district: 'Anuradhapura' }
        }),
        prisma.location.create({
            data: { name: 'Trincomalee', district: 'Trincomalee' }
        })
    ]);

    console.log(`✅ Created ${locations.length} locations`);

    // Create a test user (operator)
    const operator = await prisma.user.create({
        data: {
            email: 'operator@antigravity.com',
            name: 'Test Operator',
            role: 'OPERATOR'
        }
    });

    console.log('✅ Created test operator');

    // Create Seat Templates
    await prisma.seatTemplate.create({
        data: {
            name: 'Standard 2+2',
            columns: 4,
            rows: 13,
            totalSeats: 52,
            seatLayout: JSON.stringify([
                { id: 'driver', row: 0, col: 3, type: 'driver', label: 'Driver', isWindow: false },
                ...Array.from({ length: 52 }, (_, i) => ({
                    id: `${Math.floor(i / 4) + 1}-${i % 4}`,
                    row: Math.floor(i / 4) + 1,
                    col: i % 4,
                    type: 'seat',
                    label: String(i + 1).padStart(2, '0'),
                    isWindow: i % 4 === 0 || i % 4 === 3
                }))
            ])
        }
    });

    await prisma.seatTemplate.create({
        data: {
            name: 'Luxury 2+1',
            columns: 3,
            rows: 10,
            totalSeats: 30,
            seatLayout: JSON.stringify([
                { id: 'driver', row: 0, col: 2, type: 'driver', label: 'Driver', isWindow: false },
                ...Array.from({ length: 30 }, (_, i) => ({
                    id: `${Math.floor(i / 3) + 1}-${i % 3}`,
                    row: Math.floor(i / 3) + 1,
                    col: i % 3,
                    type: 'seat',
                    label: String(i + 1).padStart(2, '0'),
                    isWindow: i % 3 === 0 || i % 3 === 2
                }))
            ])
        }
    });

    console.log('✅ Created seat templates');

    // Create Vehicles
    const vehicle1 = await prisma.vehicle.create({
        data: {
            ownerId: operator.id,
            type: 'Bus',
            plateNumber: 'ABC-1234',
            totalSeats: 52,
            columns: 4,
            rows: 13,
            lastRowSeats: 5,
            amenities: 'AC,WiFi,USB Charging,Reclining Seats',
            operatorName: 'Antigravity Express',
            operatorWhatsapp: '+94771234567'
        }
    });

    const vehicle2 = await prisma.vehicle.create({
        data: {
            ownerId: operator.id,
            type: 'Van',
            plateNumber: 'XYZ-5678',
            totalSeats: 15,
            columns: 3,
            rows: 5,
            lastRowSeats: 3,
            amenities: 'AC,WiFi',
            operatorName: 'Comfort Travels',
            operatorWhatsapp: '+94779876543'
        }
    });

    const vehicle3 = await prisma.vehicle.create({
        data: {
            ownerId: operator.id,
            type: 'Bus',
            plateNumber: 'LMN-9012',
            totalSeats: 30,
            columns: 3,
            rows: 10,
            lastRowSeats: 3,
            amenities: 'AC,WiFi,USB Charging,Reclining Seats,Entertainment System',
            operatorName: 'Luxury Lines',
            operatorWhatsapp: '+94775551234'
        }
    });

    console.log('✅ Created 3 vehicles');

    // Create Routes
    const route1 = await prisma.route.create({
        data: {
            startLocationId: locations[0].id, // Colombo
            endLocationId: locations[1].id,   // Kandy
            stops: 'Kaduwela,Kadugannawa',
            estimatedDuration: 180 // 3 hours
        }
    });

    const route2 = await prisma.route.create({
        data: {
            startLocationId: locations[0].id, // Colombo
            endLocationId: locations[2].id,   // Galle
            stops: 'Panadura,Kalutara,Aluthgama,Hikkaduwa',
            estimatedDuration: 150 // 2.5 hours
        }
    });

    const route3 = await prisma.route.create({
        data: {
            startLocationId: locations[1].id, // Kandy
            endLocationId: locations[3].id,   // Jaffna
            stops: 'Dambulla,Anuradhapura,Vavuniya',
            estimatedDuration: 360 // 6 hours
        }
    });

    const route4 = await prisma.route.create({
        data: {
            startLocationId: locations[0].id, // Colombo
            endLocationId: locations[4].id,   // Matara
            stops: 'Panadura,Kalutara,Galle,Weligama',
            estimatedDuration: 210 // 3.5 hours
        }
    });

    console.log('✅ Created 4 routes');

    // Create Trips for the next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trips = [];

    for (let day = 0; day < 7; day++) {
        const tripDate = new Date(today);
        tripDate.setDate(today.getDate() + day);

        // Colombo to Kandy - Morning
        trips.push(
            prisma.trip.create({
                data: {
                    vehicleId: vehicle1.id,
                    routeId: route1.id,
                    date: tripDate,
                    departureTime: '06:00',
                    arrivalTime: '09:00',
                    pricePerSeat: 500,
                    availableSeats: 52,
                    status: 'Scheduled'
                }
            })
        );

        // Colombo to Kandy - Evening
        trips.push(
            prisma.trip.create({
                data: {
                    vehicleId: vehicle3.id,
                    routeId: route1.id,
                    date: tripDate,
                    departureTime: '16:00',
                    arrivalTime: '19:00',
                    pricePerSeat: 650,
                    availableSeats: 30,
                    status: 'Scheduled'
                }
            })
        );

        // Colombo to Galle - Morning
        trips.push(
            prisma.trip.create({
                data: {
                    vehicleId: vehicle2.id,
                    routeId: route2.id,
                    date: tripDate,
                    departureTime: '07:00',
                    arrivalTime: '09:30',
                    pricePerSeat: 450,
                    availableSeats: 15,
                    status: 'Scheduled'
                }
            })
        );

        // Colombo to Galle - Afternoon
        trips.push(
            prisma.trip.create({
                data: {
                    vehicleId: vehicle1.id,
                    routeId: route2.id,
                    date: tripDate,
                    departureTime: '14:00',
                    arrivalTime: '16:30',
                    pricePerSeat: 500,
                    availableSeats: 52,
                    status: 'Scheduled'
                }
            })
        );

        // Kandy to Jaffna - Morning
        trips.push(
            prisma.trip.create({
                data: {
                    vehicleId: vehicle1.id,
                    routeId: route3.id,
                    date: tripDate,
                    departureTime: '05:00',
                    arrivalTime: '11:00',
                    pricePerSeat: 1200,
                    availableSeats: 52,
                    status: 'Scheduled'
                }
            })
        );

        // Colombo to Matara - Morning
        trips.push(
            prisma.trip.create({
                data: {
                    vehicleId: vehicle3.id,
                    routeId: route4.id,
                    date: tripDate,
                    departureTime: '08:00',
                    arrivalTime: '11:30',
                    pricePerSeat: 600,
                    availableSeats: 30,
                    status: 'Scheduled'
                }
            })
        );
    }

    await Promise.all(trips);
    console.log(`✅ Created ${trips.length} trips for the next 7 days`);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
