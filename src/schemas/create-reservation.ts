import { z } from "zod";

const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

export function parseUtcDateTime(value: string): Date {
  return new Date(`${value}Z`);
}

const itemSchema = z.object({
  equipmentId: z.string().min(1, "Select equipment."),
  quantity: z
    .number({ error: "Enter a quantity." })
    .int("Quantity must be a whole number.")
    .positive("Quantity must be greater than zero."),
});

export const createReservationSchema = z
  .object({
    locationId: z.string().min(1, "Select a location."),
    startAt: z
      .string()
      .min(1, "Select a start date and time.")
      .regex(DATE_TIME_PATTERN, "Enter a valid start date and time."),
    endAt: z
      .string()
      .min(1, "Select an end date and time.")
      .regex(DATE_TIME_PATTERN, "Enter a valid end date and time."),
    status: z.enum(["DRAFT", "CONFIRMED"]),
    items: z.array(itemSchema).min(1, "Add at least one equipment item."),
  })
  .superRefine((value, ctx) => {
    const startAt = parseUtcDateTime(value.startAt);
    const endAt = parseUtcDateTime(value.endAt);

    if (Number.isNaN(startAt.getTime())) {
      ctx.addIssue({ code: "custom", message: "Enter a valid start date and time.", path: ["startAt"] });
    }

    if (Number.isNaN(endAt.getTime())) {
      ctx.addIssue({ code: "custom", message: "Enter a valid end date and time.", path: ["endAt"] });
    }

    if (!Number.isNaN(startAt.getTime()) && !Number.isNaN(endAt.getTime()) && endAt <= startAt) {
      ctx.addIssue({ code: "custom", message: "End must be after start.", path: ["endAt"] });
    }

    const seen = new Set<string>();
    value.items.forEach((item, index) => {
      if (item.equipmentId && seen.has(item.equipmentId)) {
        ctx.addIssue({
          code: "custom",
          message: "This equipment is already in the reservation.",
          path: ["items", index, "equipmentId"],
        });
      }
      seen.add(item.equipmentId);
    });
  });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
