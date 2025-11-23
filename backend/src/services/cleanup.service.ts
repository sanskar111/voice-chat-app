import prisma from '../config/db';

export const startCleanupJob = () => {
    // Run every 2 minutes
    setInterval(async () => {
        try {
            const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

            // Find rooms that are empty and lastEmptyAt is older than 3 mins
            const roomsToDelete = await prisma.room.findMany({
                where: {
                    participantCount: 0,
                    lastEmptyAt: {
                        lte: threeMinutesAgo
                    }
                }
            });

            if (roomsToDelete.length > 0) {
                console.log(`Found ${roomsToDelete.length} empty rooms to clean up.`);
                for (const room of roomsToDelete) {
                    await prisma.room.delete({ where: { id: room.id } });
                    console.log(`Deleted room ${room.id}`);
                }
            }
        } catch (error) {
            console.error('Error in cleanup job:', error);
        }
    }, 2 * 60 * 1000);
};
