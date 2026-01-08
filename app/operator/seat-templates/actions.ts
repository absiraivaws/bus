'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSeatTemplate(formData: FormData) {
    const id = formData.get('id') as string | null;
    const name = formData.get('name') as string;
    const columns = parseInt(formData.get('columns') as string);
    const rows = parseInt(formData.get('rows') as string);
    const seatLayout = formData.get('seatLayout') as string;
    const totalSeats = parseInt(formData.get('totalSeats') as string);

    if (id) {
        // Update existing template
        await prisma.seatTemplate.update({
            where: { id },
            data: {
                name,
                columns,
                rows,
                seatLayout,
                totalSeats
            }
        });
    } else {
        // Create new template
        await prisma.seatTemplate.create({
            data: {
                name,
                columns,
                rows,
                seatLayout,
                totalSeats
            }
        });
    }

    revalidatePath('/operator/seat-templates');
}

export async function deleteSeatTemplate(id: string) {
    await prisma.seatTemplate.delete({ where: { id } });
    revalidatePath('/operator/seat-templates');
}
