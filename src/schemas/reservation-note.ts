import { z } from "zod";

export const reservationNoteSchema = z.object({
  note: z
    .string()
    .trim()
    .min(1, "Enter a note before saving.")
    .max(240, "Note must be 240 characters or fewer."),
});

export type ReservationNoteInput = z.infer<typeof reservationNoteSchema>;
