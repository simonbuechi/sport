import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const PageLoader: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        width: '100%',
        gap: 2,
      }}
    >
      <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          opacity: 0.8,
        }}
      >
        Loading...
      </Typography>
    </Box>
  );
};

export default PageLoader;
