"use client";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Alert severity="error" icon={<ErrorOutlineIcon />}>
      <AlertTitle>Reservations could not be loaded</AlertTitle>
      <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
        The reservation data is temporarily unavailable. Check that the database setup completed, then try again.
        <Button variant="outlined" color="error" onClick={reset}>
          Try again
        </Button>
      </Stack>
    </Alert>
  );
}
