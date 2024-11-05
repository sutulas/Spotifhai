import React from 'react';
import { Box, Paper, Typography, Slide, CssBaseline } from '@mui/material';
import { styled } from '@mui/system';
import ChatbotWrapper from '../components/ChatbotWrapper';
import { testEndpoint } from '../API/API';
import SpotifyEmbed from '../components/SpotifyEmbed/SpotifyEmbed';

// iMessage theme colors
const iMessageColors = {
    background: '#e5e5ea',
    chatBackground: '#ffffff',
    messageGreen: '#34c759',
    messageBlue: '#007aff',
    textColor: '#1c1c1e',
};

const StyledContainer = styled(Box)({
    display: 'flex',
    height: '100vh',
    backgroundColor: iMessageColors.background,
    color: iMessageColors.textColor,
});

const ChatbotContainer = styled(Paper)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(2),
    backgroundColor: iMessageColors.messageGreen,
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: '8px',
    margin: theme.spacing(2),
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
    animation: 'slideIn 0.8s ease-out',
    '@keyframes slideIn': {
        from: { opacity: 0, transform: 'translateX(-50px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
    },
}));

const ContentContainer = styled(Paper)(({ theme }) => ({
    flex: 2,
    padding: theme.spacing(2),
    backgroundColor: iMessageColors.chatBackground,
    color: iMessageColors.textColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    margin: theme.spacing(2),
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
}));

export default function Main() {
    return (
        <StyledContainer>
            <CssBaseline />
            <Slide direction="right" in mountOnEnter unmountOnExit>
                <ChatbotContainer>
                    <ChatbotWrapper chatBotResponseToMessage={testEndpoint} />
                </ChatbotContainer>
            </Slide>
            <Slide direction="left" in mountOnEnter unmountOnExit>
                <ContentContainer>
                    <Typography variant="h5" gutterBottom>
                        Curated Playlists
                    </Typography>
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#f2f2f7',
                            borderRadius: '8px',
                            marginTop: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="h6" color={iMessageColors.textColor} align="center" gutterBottom>
                            Check out this track!
                        </Typography>
                        <SpotifyEmbed url={"https://open.spotify.com/embed/track/5ruzrDWcT0vuJIOMW7gMnW?utm_source=generator"}/>
                    </Box>
                </ContentContainer>
            </Slide>
        </StyledContainer>
    );
}
