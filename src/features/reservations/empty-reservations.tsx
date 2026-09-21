import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import { Card, CardContent, Stack, Typography } from "@mui/material";

export function EmptyReservations() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1} sx={{ py: 5, alignItems: "center", textAlign: "center" }}>
          <EventBusyOutlinedIcon color="disabled" sx={{ fontSize: 44 }} aria-hidden="true" />
          <Typography variant="h2">No reservations yet</Typography>
          <Typography color="text.secondary">Reservations will appear here after they are created.</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
