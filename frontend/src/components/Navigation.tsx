'use client';

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

export default function Navigation() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Log Analyzer
        </Typography>
        <Box>
          <Button color="inherit" component={Link} href="/">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} href="/logs">
            Logs
          </Button>
          <Button color="inherit" component={Link} href="/anomalies">
            Anomalies
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 