import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Slide, CssBaseline, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import ChatbotWrapper from '../components/ChatbotWrapper';
import { getPlaylistUrl, sendData } from '../API/API';
import AlbumIcon from '@mui/icons-material/Album';
import SpotifyEmbed from '../components/SpotifyEmbed/SpotifyEmbed';

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

export default function Main() {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [url, setUrl] = useState();
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
        const response = await getPlaylistUrl({prompt});
        setUrl(response);
        return response
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <StyledContainer>
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
                    boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)',
                    animation: 'slideIn 0.6s ease-out',
                    '@keyframes slideIn': {
                        from: { opacity: 0, transform: 'translateX(-50px)' },
                        to: { opacity: 1, transform: 'translateX(0)' },
                    }
                }}>
                    <ChatbotContainer>
                        <ChatbotWrapper chatBotResponseToMessage={handleUrl} />
                    </ChatbotContainer>
                </Paper>
            </Slide>
            <Slide direction="left" in mountOnEnter unmountOnExit>
                <ContentContainer>
                    <AIVisualElement>
                        <AlbumIcon style={{ fontSize: '50px', color: iMessageColors.textColor }} />
                    </AIVisualElement>
                    {!url ? (<PlaceholderContainer>
                        <Typography variant="h4" gutterBottom>
                            Ask me anything!
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            I’m here to generate playlists, visualize data, and answer your questions. Just start typing!
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
                    </PlaceholderContainer>) :
                        (<Box>
                            <h1>{url}</h1>
                            <SpotifyEmbed url={"https://open.spotify.com/embed/playlist/3gp01lyf3rjjgNicy220cf?utm_source=generator"}
                            />
                        </Box>)
                    }
                </ContentContainer>
            </Slide>
        </StyledContainer>
    );
}
