import { Button, Stack, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
      <Typography variant="h1">Page not found</Typography>
      <Typography color="text.secondary">The requested page does not exist.</Typography>
      <Button href="/" variant="contained">
        Back to reservations
      </Button>
    </Stack>
  );
}
