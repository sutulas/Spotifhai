import React from 'react';
import { Box, Card, CardMedia } from '@mui/material';

function SpotifyEmbed({ url, playlist = false }) {
    if (playlist) {
        return (
            <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardMedia
                    component="iframe"
                    src={url}
                    title="Spotify Playlist"
                    width="100%"
                    height="352"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                />
            </Card>
        )
    }
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
