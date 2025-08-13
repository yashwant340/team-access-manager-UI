import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingSpinner;
