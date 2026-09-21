import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, ReservationStatus } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });

async function main() {
  await prisma.reservationItem.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.location.deleteMany();

  const austin = await prisma.location.create({ data: { id: "loc-austin", name: "Austin Warehouse" } });
  const dallas = await prisma.location.create({ data: { id: "loc-dallas", name: "Dallas Warehouse" } });

  await prisma.equipment.createMany({
    data: [
      { id: "eq-aus-generator", locationId: austin.id, name: "Generator", totalQuantity: 4 },
      { id: "eq-aus-saw", locationId: austin.id, name: "Concrete Saw", totalQuantity: 3 },
      { id: "eq-aus-lift", locationId: austin.id, name: "Scissor Lift", totalQuantity: 2 },
      { id: "eq-aus-compressor", locationId: austin.id, name: "Air Compressor", totalQuantity: 5 },
      { id: "eq-dal-generator", locationId: dallas.id, name: "Generator", totalQuantity: 6 },
      { id: "eq-dal-compactor", locationId: dallas.id, name: "Plate Compactor", totalQuantity: 3 },
      { id: "eq-dal-lift", locationId: dallas.id, name: "Scissor Lift", totalQuantity: 4 }
    ],
  });

  const createdAt = new Date("2027-09-01T14:00:00.000Z");

  await prisma.reservation.create({
    data: {
      id: "res-aus-morning",
      locationId: austin.id,
      startAt: new Date("2027-09-20T09:00:00.000Z"),
      endAt: new Date("2027-09-20T12:00:00.000Z"),
      status: ReservationStatus.CONFIRMED,
      note: "Morning site preparation",
      createdAt,
      items: {
        create: [
          { id: "item-aus-morning-generator", equipmentId: "eq-aus-generator", quantity: 2 },
          { id: "item-aus-morning-saw", equipmentId: "eq-aus-saw", quantity: 1 }
        ],
      },
    },
  });

  await prisma.reservation.create({
    data: {
      id: "res-aus-afternoon",
      locationId: austin.id,
      startAt: new Date("2027-09-20T12:00:00.000Z"),
      endAt: new Date("2027-09-20T15:00:00.000Z"),
      status: ReservationStatus.CONFIRMED,
      note: "Afternoon concrete work",
      createdAt: new Date("2027-09-02T14:00:00.000Z"),
      items: {
        create: [
          { id: "item-aus-afternoon-generator", equipmentId: "eq-aus-generator", quantity: 2 },
          { id: "item-aus-afternoon-compressor", equipmentId: "eq-aus-compressor", quantity: 2 }
        ],
      },
    },
  });

  await prisma.reservation.create({
    data: {
      id: "res-aus-draft",
      locationId: austin.id,
      startAt: new Date("2027-09-20T10:00:00.000Z"),
      endAt: new Date("2027-09-20T11:00:00.000Z"),
      status: ReservationStatus.DRAFT,
      createdAt: new Date("2027-09-03T14:00:00.000Z"),
      items: { create: [{ id: "item-aus-draft-generator", equipmentId: "eq-aus-generator", quantity: 4 }] },
    },
  });

  await prisma.reservation.create({
    data: {
      id: "res-aus-lift",
      locationId: austin.id,
      startAt: new Date("2027-09-21T08:00:00.000Z"),
      endAt: new Date("2027-09-21T11:00:00.000Z"),
      status: ReservationStatus.CONFIRMED,
      createdAt: new Date("2027-09-04T14:00:00.000Z"),
      items: { create: [{ id: "item-aus-lift", equipmentId: "eq-aus-lift", quantity: 1 }] },
    },
  });

  await prisma.reservation.create({
    data: {
      id: "res-dal-confirmed",
      locationId: dallas.id,
      startAt: new Date("2027-09-22T13:00:00.000Z"),
      endAt: new Date("2027-09-22T17:00:00.000Z"),
      status: ReservationStatus.CONFIRMED,
      note: "Dallas road crew",
      createdAt: new Date("2027-09-05T14:00:00.000Z"),
      items: {
        create: [
          { id: "item-dal-generator", equipmentId: "eq-dal-generator", quantity: 3 },
          { id: "item-dal-compactor", equipmentId: "eq-dal-compactor", quantity: 2 }
        ],
      },
    },
  });

  await prisma.reservation.create({
    data: {
      id: "res-dal-draft",
      locationId: dallas.id,
      startAt: new Date("2027-09-23T09:00:00.000Z"),
      endAt: new Date("2027-09-23T12:00:00.000Z"),
      status: ReservationStatus.DRAFT,
      createdAt: new Date("2027-09-06T14:00:00.000Z"),
      items: { create: [{ id: "item-dal-lift", equipmentId: "eq-dal-lift", quantity: 2 }] },
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
