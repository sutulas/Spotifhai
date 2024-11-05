import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Box, Container, Grid, Grid2 } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function Login({ setLogin }) {

    const client_id = '683a2dd6216f45c9b5fa196ea7118ece'; // Your client ID
    const client_secret = 'ecefeeb0b5d74a63ba41eec1441aab5f'; // Your client secret
    const redirect_uri = 'http://localhost:3000/callback'; // Your redirect URI

    const [profile, setProfile] = useState(null); // State to store user profile

    const handleLogin = () => {
        const state = generateRandomString(16);
        const scope = 'user-read-private user-read-email';
        const url = `https://accounts.spotify.com/authorize?${new URLSearchParams({
            response_type: 'code',
            client_id: client_id,
            redirect_uri: redirect_uri,
            state: state,
            scope: scope,
        }).toString()}`;
        
        window.location.href = url;
        setLogin();
    };

    const generateRandomString = (length) => {
        return [...Array(length)].map(() => (Math.random().toString(36)[2])).join('');
    };

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code && !sessionStorage.getItem('codeUsed')) {
            sessionStorage.setItem('codeUsed', 'true');

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
            localStorage.setItem("user_id", profileResponse.data.id);
            localStorage.setItem("auth_token", token);
            await axios.post('http://localhost:8000/credentials', {
                user_id: user_id,
                auth_token: token,
            });
            setLogin(true);
        } catch (e) {
            console.error('Error fetching profile:', e.response ? e.response.data : e.message);
        }
    };

    // Custom animation and styling
    const LogoBox = styled(Box)({
        color: '#1DB954',
        fontSize: '5rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    return (
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
                <Typography variant="h5" sx={{ mt: 4, color: '#555' }}>
                    Discover a whole new way to interact with Spotify using AI.
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, color: '#777' }}>
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
                        bgcolor: '#1DB954',
                        color: '#fff',
                        borderRadius: '50px',
                        '&:hover': { bgcolor: '#1aa34a' }
                    }}
                >
                    Connect with Spotify
                </Button>
            </motion.div>

            <Grid2
                container
                spacing={4}
                sx={{ mt: 10 }}
                alignItems="center"
                justifyContent="center"
            >
                <Grid2 item xs={12} md={4}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.4 }}
                    >
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h6" sx={{ color: '#1DB954' }}>
                                Personalized Playlists
                            </Typography>
                            <Typography sx={{ color: '#777' }}>
                                Create playlists curated just for you.
                            </Typography>
                        </Box>
                    </motion.div>
                </Grid2>

                <Grid2 item xs={12} md={4}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.4, delay: 0.3 }}
                    >
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h6" sx={{ color: '#1DB954' }}>
                                Visualize Listening History
                            </Typography>
                            <Typography sx={{ color: '#777' }}>
                                Explore your music habits with interactive charts.
                            </Typography>
                        </Box>
                    </motion.div>
                </Grid2>

                <Grid2 item xs={12} md={4}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.4, delay: 0.6 }}
                    >
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h6" sx={{ color: '#1DB954' }}>
                                Seamless Queue Management
                            </Typography>
                            <Typography sx={{ color: '#777' }}>
                                Queue songs and manage playback easily.
                            </Typography>
                        </Box>
                    </motion.div>
                </Grid2>
            </Grid2>
        </Container>
    );

};
