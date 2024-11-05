// FloatingMusicIcon.js
import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote'; // You can use any MUI icon

const FloatingMusicIcon = () => {
  // Define animation properties
  const animationVariants = {
    float: {
      y: [0, -5, 0], // Float up and down slightly
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
    flip: {
      rotateX: [0, 180, 0], // Flip over on the X-axis
      transition: {
        duration: 4, // Slower flip duration
        ease: "easeInOut",
        repeat: Infinity, // Repeat indefinitely
        repeatType: "reverse",
        // The delay is removed to have continuous flipping
        // To control the timing, you can add a stagger delay here if needed
      },
    },
  };

  return (
    <motion.div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
      }}
    >
      <motion.div
        variants={animationVariants}
        animate={{ ...animationVariants.float, ...animationVariants.flip }}
        initial="float" // Start with the float animation
      >
        <Icon
          component={MusicNoteIcon}
          sx={{
            fontSize: 60,
            color: 'primary.main',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)', // Scale on hover
            },
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default FloatingMusicIcon;
