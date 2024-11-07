import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Slide, CssBaseline, Tooltip, AppBar, Toolbar, Button } from '@mui/material';
import { maxHeight, Stack, styled } from '@mui/system';
import ChatbotWrapper from '../components/ChatbotWrapper';
import { getPlaylistUrl, getRecentlyListened } from '../API/API';
import AlbumIcon from '@mui/icons-material/Album';
import SpotifyEmbed from '../components/SpotifyEmbed/SpotifyEmbed';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import StockTicker from '../components/Ticker';

// iMessage colors
const iMessageColors = {
    background: '#e5e5ea',
    chatBackground: '#ffffff',
    messageGreen: '#34c759',
    messageBlue: '#007aff',
    textColor: '#1c1c1e',
    placeholderText: '#8e8e93',
};

// Container for the entire layout
const StyledContainer = styled(Box)({
    display: 'flex',
    height: '100vh',
    backgroundColor: iMessageColors.background,
    color: iMessageColors.textColor,
    padding: '20px',
    gap: '16px',
    overflow: 'hidden',
});

// Styled chat container
const ChatbotContainer = styled(Paper)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(2),
    backgroundColor: "#FFFFFF",
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: '16px',
    boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)',
    animation: 'slideIn 0.6s ease-out',
    '@keyframes slideIn': {
        from: { opacity: 0, transform: 'translateX(-50px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
    },
}));

// Styled content area
const ContentContainer = styled(Paper)(({ theme }) => ({
    flex: 2,
    padding: theme.spacing(2),
    background: `linear-gradient(135deg, #f9f9f9, #e0e0e0)`,
    color: iMessageColors.textColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    position: 'relative',
    transition: 'background-color 0.3s ease',
    animation: 'fadeIn 0.6s ease-in-out',
    '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
}));

// 3D visual element with AlbumIcon
const AIVisualElement = styled('div')({
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: '50%',
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'float 3s ease-in-out infinite',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    '@keyframes float': {
        '0%': { transform: 'translate(-50%, -50%) translateY(0) rotateY(0deg)' },
        '50%': { transform: 'translate(-50%, -50%) translateY(-20px) rotateY(360deg)' },
        '100%': { transform: 'translate(-50%, -50%) translateY(0) rotateY(720deg)' },
    },
});

// Placeholder for chat instructions
const PlaceholderContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    color: iMessageColors.placeholderText,
});

// Styled button for interactions
const StyledButton = styled('button')({
    backgroundColor: iMessageColors.messageBlue,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px',
    transition: 'background-color 0.3s',
    '&:hover': {
        backgroundColor: '#0051a1',
    },
});

// Styled AppBar for toolbar
const StyledAppBar = styled(AppBar)({
    backgroundColor: '#ffffff',
    color: iMessageColors.textColor,
    boxShadow: 'none',
});

const Logo = styled('img')({
    height: '30px',
    marginRight: '8px',
});

export default function Main() {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [url, setUrl] = useState();
    const [recentlyListened, setRecentlyListened] = React.useState("");

    React.useState(() => {
        const getRecent = async () => {
            const res = await getRecentlyListened();
            console.log(res);
            setRecentlyListened(res.response);
        }
        getRecent();
    });
    const tooltipRef = useRef(null);

    const handleButtonClick = () => {
        setTooltipOpen(true);
    };

    const handleClickOutside = (event) => {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
            setTooltipOpen(false);
        }
    };

    const handleUrl = async (prompt) => {
        console.log(prompt);
        const response = await getPlaylistUrl({ prompt });
        console.log("Response:");
        console.log(response);
        setUrl(response.url);
        localStorage.setItem('playlist_url', response.url);
        return response.response;
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            {/* AppBar (Toolbar) */}
            <StyledAppBar position="sticky">
                <Toolbar>
                    <Stack direction="row" alignItems="center" spacing={2} flexGrow={1}>
                        <AudiotrackIcon />
                        <Typography variant="h6" color="inherit">SpotifHAI</Typography>
                    </Stack>
                    <Button color="inherit" onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}>Log Out</Button>
                </Toolbar>
            </StyledAppBar>

            {/* Main content */}
            <StyledContainer sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <CssBaseline />
                <Slide direction="right" in mountOnEnter unmountOnExit>
                    <Paper sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        padding: '16px',
                        backgroundColor: "#FFFFFF",
                        color: 'white',
                        borderRadius: '16px',
                        height: "90%",
                        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)',
                        animation: 'slideIn 0.6s ease-out',
                        '@keyframes slideIn': {
                            from: { opacity: 0, transform: 'translateX(-50px)' },
                            to: { opacity: 1, transform: 'translateX(0)' },
                        }
                    }}>
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant='h4' sx={{ p: 3 }} color='black'>{ }</Typography>
                            <ChatbotContainer>
                                <ChatbotWrapper chatBotResponseToMessage={handleUrl} />
                            </ChatbotContainer>
                        </Stack>
                    </Paper>
                </Slide>

                <Slide direction="left" in mountOnEnter unmountOnExit>
                    <ContentContainer sx={{ height: '90%', overflow: 'hidden' }}>
                        {!url && (
                            <AIVisualElement>
                                <AlbumIcon style={{ fontSize: '50px', color: iMessageColors.textColor }} />
                            </AIVisualElement>
                        )}
                        {!url ? (
                            <PlaceholderContainer>
                                <Typography variant="h4" gutterBottom>
                                    Ask me anything!
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    I’m here to generate playlists based on your input. Just start typing!
                                </Typography>
                                <Tooltip
                                    ref={tooltipRef}
                                    open={tooltipOpen}
                                    title={
                                        <Box>
                                            <Typography variant="body1" gutterBottom>
                                                Here are some example questions to get started:
                                            </Typography>
                                            <ul>
                                                <li>Generate a playlist based on mood</li>
                                                <li>Give me data visualizations on top artists</li>
                                                <li>Suggest new music based on my preferences</li>
                                            </ul>
                                            <Typography variant="body2">
                                                You can ask anything related to music or playlists. I'm here to help!
                                            </Typography>
                                        </Box>
                                    }
                                    arrow
                                    placement="top"
                                >
                                </Tooltip>
                            </PlaceholderContainer>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box
                                    sx={{
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        maxHeight: '100%',
                                        width: '100%',
                                        width: '900px',
                                        maxWidth: '50vw',
                                        margin: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <iframe
                                        key={url}  // Force reload when `url` changes
                                        src={url}
                                        width="100%"
                                        height="352"
                                        frameBorder="0"
                                        allowFullScreen=""
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                    ></iframe>
                                </Box>
                            </Box>
                        )}
                    </ContentContainer>
                </Slide>


                {/* Position the StockTickerat the bottom */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#f5f5f5', // Optional, adjust the background color as needed
                    padding: '8px',
                    textAlign: 'center'
                }}>
                    <StockTicker text={recentlyListened} />
                </Box>
            </StyledContainer>
        </Box>
    );


}
