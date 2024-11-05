import React from 'react';
import { Box } from '@mui/material';

function SpotifyEmbed({url}) {
    return (
        <Box 
            sx={{
                borderRadius: '12px',
                overflow: 'hidden', // Ensures border radius applies to iframe
                width: '100%',
                maxWidth: '600px', // Adjust to fit your layout
                margin: 'auto'
            }}
        >
            <iframe
                src={url}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{
                    borderRadius: '12px'
                }}
            />
        </Box>
    );
}

export default SpotifyEmbed;
