import { prisma } from "@/lib/prisma";
import type { ReservationLocationOption } from "@/types/reservation";

export async function listReservationOptions(): Promise<ReservationLocationOption[]> {
  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      equipment: {
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      },
    },
  });

  return locations;
}
