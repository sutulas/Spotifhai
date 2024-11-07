import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

// iMessage colors
const iMessageColors = {
    background: '#e5e5ea',
    chatBackground: '#ffffff',
    messageGreen: '#34c759',
    messageBlue: '#007aff',
    textColor: '#1c1c1e',
    placeholderText: '#8e8e93',
};

const StockTicker = ({ text }) => {
  // Adjust duration based on the length of the text (longer text will scroll slower)
  console.log("Text");
  console.log(text);
  const scrollDuration = Math.max(30, 0.1 * text.length); // Minimum duration of 10 seconds

  return (
    <Box
      sx={{
        overflow: 'hidden',
        width: '100%',
        backgroundColor: iMessageColors.chatBackground, // Match background to the theme
        padding: 2,
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
      }}
    >
      <motion.div
        initial={{ x: '100%' }}  // Ensure it starts off-screen to the right
        animate={{ x: ['40%', '-100%'] }} // Move from right to left
        transition={{
          x: { repeat: Infinity, duration: scrollDuration, ease: 'linear' }, // Adjusted speed based on text length
        }}
        style={{
          display: 'inline-block',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            display: 'inline-block',
            color: iMessageColors.textColor, // Dark text for contrast
            fontWeight: '600', // Slightly bolder font weight
            fontFamily: 'Roboto, sans-serif', // Modern font family
            whiteSpace: 'nowrap',
            fontSize: '1.2rem', // Adjusted font size for better readability
            letterSpacing: '1px', // Slight letter spacing for clarity
            lineHeight: '1.5', // Improve text readability
          }}
        >
          {text}
        </Typography>
      </motion.div>
    </Box>
  );
};

export default StockTicker;
