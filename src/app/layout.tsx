import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import { AppBar, Box, Container, Link as MuiLink, Toolbar, Typography } from "@mui/material";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppThemeProvider } from "./theme-provider";

export const metadata: Metadata = {
  title: "Equipment Reservations",
  description: "Shared equipment reservation planner",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppThemeProvider>
          <AppBar position="static" color="primary" component="header">
            <Container maxWidth="lg">
              <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 72 }, gap: 1.25 }}>
                <BuildCircleOutlinedIcon aria-hidden="true" />
                <MuiLink
                  href="/"
                  color="inherit"
                  underline="none"
                  sx={{ fontWeight: 700, letterSpacing: "0.01em" }}
                >
                  Equipment Reservations
                </MuiLink>
              </Toolbar>
            </Container>
          </AppBar>
          <Box component="main">
            <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
              {children}
            </Container>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Container maxWidth="lg">
              <Typography variant="body2" color="text.secondary">
                Shared Equipment Reservation Planner
              </Typography>
            </Container>
          </Box>
        </AppThemeProvider>
      </body>
    </html>
  );
}
