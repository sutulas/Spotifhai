import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { styled } from '@mui/system';

// Updated Login component so that refresh works
// Added create playlist authority to scope

export default function Login() {
    const client_id = 'b5762987908e419296e653bb96ad9f45'; // Your client ID
    const client_secret = 'fd6489e6fcec424bb7e0845cace3d8b8'; // Your client secret
    // const redirect_uri = 'http://sutulas.github.io/Spotifhai/#/callback'; // Your redirect URI
    const redirect_uri = process.env.NODE_ENV === 'production' ? 'http://sutulas.github.io/Spotifhai/#/callback' : 'http://localhost:3000/#/callback';

    //const redirect_uri = 'http://localhost:3000/#/callback'; // Your redirect URI

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);  // Track the loading state

    const handleLogin = () => {
        const state = generateRandomString(16);
        const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private user-library-modify user-read-recently-played user-top-read';
        // Added playlist-modify-public, playlist-modify-private, and user-library-modify to scope
        const url = `https://accounts.spotify.com/authorize?${new URLSearchParams({
            response_type: 'code',
            client_id: client_id,
            redirect_uri: redirect_uri,
            state: state,
            scope: scope,
        }).toString()}`;

        window.location.href = url;
    };

    const generateRandomString = (length) => {
        return [...Array(length)].map(() => (Math.random().toString(36)[2])).join('');
    };

    useEffect(() => {
        // Check if access token is stored
        const code = new URLSearchParams(window.location.search).get('code');
        if (code && !sessionStorage.getItem('codeUsed')) {

            const fetchToken = async () => {
                try {
                    const requestData = {
                        code: code,
                        redirect_uri: redirect_uri,
                        grant_type: 'authorization_code',
                    };

                    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams(requestData), {
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`),
                        },
                    });

                    const { access_token } = tokenResponse.data;
                    localStorage.setItem('access_token', access_token);
                    fetchUserProfile(access_token);
                    console.log("Setting access token to:", tokenResponse.data);
                } catch (e) {
                    console.error('Error fetching access token:', e.response ? e.response.data : e.message);
                }
            };

            fetchToken();
        }
    }, []);

    const fetchUserProfile = async (token) => {
        try {
            const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setProfile(profileResponse.data);
            console.log(profileResponse.data);
            // Set the user info and token in localStorage
            localStorage.setItem("user_id", profileResponse.data.id);
            localStorage.setItem("auth_token", token);
            localStorage.setItem("name", profileResponse.data.display_name);
            localStorage.setItem("profResponse", JSON.stringify(profileResponse.data));

            // Ensure data is set before reloading the page
            setLoading(false);
            window.location.reload();
        } catch (e) {
            console.error('Error fetching profile:', e.response ? e.response.data : e.message);
        }
    };

    // Styled components for dynamic background and logo
    const BackgroundBox = styled(Box)({
        minHeight: '100vh',
        position: 'relative',  // To ensure the background is properly layered
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    const LogoBox = styled(Box)({
        color: '#1DB954',  // Keep the color as green for consistency
        fontSize: '5rem',
        fontWeight: 'bold',
        display: 'flex',
        gap: '50px',
        flexDirection: 'column', // Stack the icon above the text
        alignItems: 'center', // Center horizontally
        justifyContent: 'center', // Center vertically if needed
        textShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)',
    });

    const SvgBackground = styled('div')({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,  // Ensure the SVG is in the background
        overflow: 'hidden',
    });
    
    return (
        <BackgroundBox>
            {/* SVG Background */}
            <SvgBackground id="bg-wrap">
            <svg height="200%" width="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="Gradient1" cx="50%" cy="50%" fx="0.441602%" fy="50%" r=".5">
                    <animate attributeName="fx" dur="34s" values="0%;1%;0%" repeatCount="indefinite"></animate>
                    <stop offset="0%" stopColor="rgba(255, 0, 0, 1)"></stop>  
                    <stop offset="100%" stopColor="rgba(255, 255, 0, 0)"></stop> 
                </radialGradient>
                <radialGradient id="Gradient2" cx="50%" cy="50%" fx="2.68147%" fy="50%" r=".5">
                    <animate attributeName="fx" dur="23.5s" values="0%;1%;0%" repeatCount="indefinite"></animate>
                    <stop offset="0%" stopColor="rgba(255, 0, 0, 1)"></stop>  
                    <stop offset="100%" stopColor="rgba(255, 255, 0, 0)"></stop>  
                </radialGradient>
            </defs>
            <rect x="13.744%" y="1.18473%" width="100%" height="100%" fill="url(#Gradient1)" transform="rotate(334.41 50 50)">
                        <animate attributeName="x" dur="20s" values="25%;0%;25%" repeatCount="indefinite"></animate>
                        <animate attributeName="y" dur="21s" values="0%;25%;0%" repeatCount="indefinite"></animate>
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="7s" repeatCount="indefinite"></animateTransform>
                    </rect>
                    <rect x="-2.17916%" y="35.4267%" width="100%" height="100%" fill="url(#Gradient2)" transform="rotate(255.072 50 50)">
                        <animate attributeName="x" dur="23s" values="-25%;0%;-25%" repeatCount="indefinite"></animate>
                        <animate attributeName="y" dur="24s" values="0%;50%;0%" repeatCount="indefinite"></animate>
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="12s" repeatCount="indefinite"></animateTransform>
                    </rect>
            </svg>

            </SvgBackground>
    
            <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    <LogoBox>
                        <MusicNoteIcon fontSize="inherit" />
                        <Typography variant="h1" sx={{ color: '#1DB954', fontWeight: 800 }}>
                            SpotifHAI
                        </Typography>
                    </LogoBox>
                </motion.div>
    
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2 }}
                >
                    <Typography variant="h5" sx={{ mt: 4, color: '#333' }}>
                        Discover a whole new way to interact with Spotify using AI.
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1, color: '#555' }}>
                        Chart your listening history, create playlists, queue songs, and more – powered by advanced AI.
                    </Typography>
                </motion.div>
    
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                >
                    <Button
                        onClick={handleLogin}
                        variant="contained"
                        size="large"
                        sx={{
                            mt: 5,
                            px: 5,
                            py: 1.5,
                            bgcolor: '#ff6529',
                            color: '#fff',
                            borderRadius: '50px',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
                            '&:hover': { bgcolor: '#e55420' },
                        }}
                    >
                        Login with Spotify
                    </Button>
                </motion.div>
            </Container>
        </BackgroundBox>
    );
}    