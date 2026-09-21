export type ReservationStatusValue = "DRAFT" | "CONFIRMED";

export interface ReservationLocationOption {
  id: string;
  name: string;
  equipment: Array<{
    id: string;
    name: string;
  }>;
}

export interface ReservationListItem {
  id: string;
  locationName: string;
  startAt: string;
  endAt: string;
  status: ReservationStatusValue;
  note: string | null;
  equipment: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}
