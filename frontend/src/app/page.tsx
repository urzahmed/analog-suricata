import { Container, Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Log Analyzer and Anomaly Predictor
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Welcome to your security monitoring dashboard
        </Typography>
      </Box>
    </Container>
  );
} 