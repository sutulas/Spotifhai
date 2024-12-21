import React from 'react';
import { Box, Card, CardMedia } from '@mui/material';

function SpotifyEmbeded({ url, playlist = false }) {
    console.log("Spotify with url");
    console.log(url);
    
    return (
        <Box
            sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                height: '80vh',
                width: '900px',
                maxWidth: '50vw',
                margin: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <iframe
                src={url}
                width="100%"
                height="100%"
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

export default SpotifyEmbeded;

// "https://open.spotify.com/embed/4duA7Ne7VlqYFHlNCxK9uF"
