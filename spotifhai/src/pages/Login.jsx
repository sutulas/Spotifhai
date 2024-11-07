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
    const redirect_uri = 'http://sutulas.github.io/Spotifhai/#/callback'; // Your redirect URI
    //const redirect_uri = 'http://localhost:3000/#/callback'; // Your redirect URI

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);  // Track the loading state

    const handleLogin = () => {
        const state = generateRandomString(16);
        const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private user-library-modify user-read-recently-played';
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
        </Container>
    );
};
