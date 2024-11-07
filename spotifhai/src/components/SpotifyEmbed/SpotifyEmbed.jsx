import React from 'react';
import { Box, Card, CardMedia } from '@mui/material';

function SpotifyEmbed({ url, playlist = false }) {
    console.log("Spotify with url");
    console.log(url);
    
    return (
        <iframe src={url} width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    );
}

export default SpotifyEmbed;
