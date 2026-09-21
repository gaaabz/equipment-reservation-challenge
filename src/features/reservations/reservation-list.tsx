"use client";

import EditNoteIcon from "@mui/icons-material/EditNote";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { ReservationListItem } from "@/types/reservation";
import { ReservationNoteDialog } from "./reservation-note-dialog";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatEquipment(reservation: ReservationListItem) {
  return reservation.equipment.map((item) => `${item.quantity}x ${item.name}`).join(", ");
}

function StatusChip({ status }: { status: ReservationListItem["status"] }) {
  return (
    <Chip
      label={status === "CONFIRMED" ? "Confirmed" : "Draft"}
      color={status === "CONFIRMED" ? "success" : "default"}
      size="small"
      variant={status === "CONFIRMED" ? "filled" : "outlined"}
    />
  );
}

export function ReservationList({ reservations }: { reservations: ReservationListItem[] }) {
  const [editing, setEditing] = useState<ReservationListItem | null>(null);

  return (
    <>
      <TableContainer component={Card} sx={{ display: { xs: "none", md: "block" } }}>
        <Table aria-label="Equipment reservations">
          <TableHead>
            <TableRow>
              <TableCell>Location</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Equipment</TableCell>
              <TableCell>Note</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{reservation.locationName}</TableCell>
                <TableCell>{formatDate(reservation.startAt)}</TableCell>
                <TableCell>{formatDate(reservation.endAt)}</TableCell>
                <TableCell><StatusChip status={reservation.status} /></TableCell>
                <TableCell>{formatEquipment(reservation)}</TableCell>
                <TableCell sx={{ maxWidth: 190 }}>
                  <Typography variant="body2" noWrap title={reservation.note ?? "No note"}>
                    {reservation.note ?? "—"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit internal note">
                    <IconButton
                      aria-label={`Edit note for ${reservation.locationName} reservation starting ${formatDate(reservation.startAt)}`}
                      onClick={() => setEditing(reservation)}
                    >
                      <EditNoteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent>
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
                  <Typography component="h2" variant="h2">{reservation.locationName}</Typography>
                  <StatusChip status={reservation.status} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Period (UTC)</Typography>
                  <Typography>{formatDate(reservation.startAt)}</Typography>
                  <Typography color="text.secondary">to {formatDate(reservation.endAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Equipment</Typography>
                  <Typography>{formatEquipment(reservation)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Internal note</Typography>
                  <Typography>{reservation.note ?? "No note"}</Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditNoteIcon />}
                  onClick={() => setEditing(reservation)}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Edit note
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {editing ? (
        <ReservationNoteDialog reservation={editing} onClose={() => setEditing(null)} />
      ) : null}
    </>
  );
}
