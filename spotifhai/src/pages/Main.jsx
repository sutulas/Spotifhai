import React, { useState, useEffect } from 'react';
import { Box, Paper, CssBaseline, Tooltip, Card, CardContent, CardMedia, Tabs, Tab, AppBar, Toolbar, Button, CircularProgress } from '@mui/material';
import Fab from '@mui/material/Fab';
import { styled } from '@mui/system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ChatbotWrapper from '../components/ChatbotWrapper';
import { getPlaylistUrl, getRecentlyListened } from '../API/API';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import LogoutIcon from '@mui/icons-material/Logout';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import { Spotify } from 'react-spotify-embed';
import SpotifyEmbeded from '../components/SpotifyEmbed/SpotifyEmbeded';
import { px } from 'framer-motion';

// iMessage colors
const iMessageColors = {
    background: '#e5e5ea',
    chatBackground: '#ffffff',
    messageGreen: '#34c759',
    messageBlue: '#ff6529',
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
    '&:hover': {
        boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.2)',
    },
});

const VerticalNav = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
    animation: 'slideInNav 0.6s ease-out',
    '@keyframes slideInNav': {
        from: { opacity: 0, transform: 'translateX(-100px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
    },
});

// Styled chat container
const ChatbotContainer = styled(Paper)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(1.5),
    backgroundColor: "#FFFFFF",
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '16px',
    boxShadow: '0px 0px 30px rgba(255, 120, 0, 0.5)',
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
    backgroundColor: "#FFFFFF",
    color: iMessageColors.textColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    boxShadow: '10px 0px 30px rgba(255, 120, 0, 0.5)',
    overflow: 'hidden',
    position: 'relative',
    transition: 'background-color 0.3s ease',
    animation: 'slideInRight 0.6s ease-out',
    '@keyframes slideInRight': {
        from: { opacity: 0, transform: 'translateX(50px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
    },
}));

const RecentlyListenedSection = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '15px',
    padding: '15px',
    width: '100%',
    height: 'auto',
    
    
});

const RecentlyListenedItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
});

const RecentlyListenedText = styled(Box)({
    flex: 1,
    color: '#333', // Changed to a neutral dark color for text
    fontWeight: 'normal', // Removed bold styling for a cleaner look
    animation: 'fadeIn 0.6s ease-in',
    '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
});

// Playlist Library grid styles
const PlaylistGrid = styled(Box)({
    display: 'flex',
    flexWrap: 'wrap',          // Allow items to wrap to the next row
    gap: '15px',
    padding: '10px',
    marginBottom: '10px',
    overflowY: 'auto',
    height: '100%',
    borderRadius: '16px',
    maxHeight: 'calc(100vh - 120px)',
    justifyContent: 'flex-start', 
    alignItems: 'flex-start',
});

const djPhrases = [
    "Let's get the party started!", 
    "Time for some hot tracks!", 
    "Turn it up, baby!", 
    "Get ready for the beats!", 
    "DJ bot in the house! 🎧", 
    "Prepare your ears for greatness.", 
    "Bangers incoming!", 
    "Don't blame me if you dance too hard. 💃", 
    "Cue the awkward dance moves!", 
    "Warning: fire tracks ahead. 🔥", 
    "Time to vibe, no skipping allowed!", 
    "Careful, this playlist slaps. 🙌", 
    "Is it hot in here, or is it just these beats?", 
    "No requests. DJ bot knows best.", 
    "Feel the rhythm, embrace the chaos!", 
    "Your neighbors might call... they'll want the link.", 
    "Dance like no one's watching, except me. 😎", 
    "Tracks so good, they'll make your playlist jealous.", 
    "Step aside, humans. AI runs the decks now.", 
    "Let's groove to the algorithm!"
];

const DjQuote = styled(Box)({
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 101, 41, 0.8)', 
    padding: '16px',
    textAlign: 'center',
    fontSize: '1.5rem',
    marginBottom: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
});

const theme = createTheme({
    components: {
        MuiTouchRipple: {
            styleOverrides: {
                rippleVisible: {
                    backgroundColor: '#ff6529', // Ensure the ripple color is orange
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    "&.MuiTouchRipple-root": {
                        color: "#ff6529", // Ripple color for Tabs
                    },
                    // Customize text color for selected tab
                    "&.Mui-selected": {
                        color: "#1DB954", // Green text when selected
                    },
                },
            },
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    "& .MuiTouchRipple-root": {
                        color: "#ff6529", // Ripple color for other buttons
                    },
                },
            },
        },
    },
});

export default function Main() {
    const [url, setUrl] = useState();
    const [recentlyListened, setRecentlyListened] = useState([]);
    const [value, setValue] = useState(0); // State to track selected tab
    const [playlistLibrary, setPlaylistLibrary] = useState([]);
    const [djPhrase, setDjPhrase] = useState('');

    useEffect(() => {
        const fetchRecentlyListened = async () => {
            try {
                const res = await getRecentlyListened();
                const songsString = res.response.replace('Recently Listened Songs: ', '');
                const songs = songsString.split(' ------- ').map(song => song.trim());
                setRecentlyListened(songs);
            } catch (error) {
                console.error("Error fetching recently listened songs:", error);
            }
        };
    
        const loadPlaylistLibrary = () => {
            try {
                const storedPlaylists = JSON.parse(localStorage.getItem('playlistLibrary')) || [];
                setPlaylistLibrary(storedPlaylists);
            } catch (error) {
                console.error("Error loading playlist library from localStorage:", error);
            }
        };
    
        if (!url && value === 0) {
            const djPhrase = getRandomDjPhrase();
            setDjPhrase(djPhrase); // Show DJ phrase
        } else {
            setDjPhrase(''); // Clear DJ phrase
        }

        // Fetch recently listened songs and load playlist library on component mount
        fetchRecentlyListened();
        loadPlaylistLibrary();
    }, []);
    

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleUrl = async (prompt) => {
        console.log(prompt);
        const response = await getPlaylistUrl({ prompt });
        console.log("Response:");
        console.log(response.url);
    
        setTimeout(() => {
            setUrl(response.url); // Set for "Music" tab
        }, 3000);
    
        // Store the playlist in localStorage for the "Playlist Library" tab
        const updatedPlaylistLibrary = [...playlistLibrary, response.url];
        setPlaylistLibrary(updatedPlaylistLibrary); // Update state
        localStorage.setItem('playlistLibrary', JSON.stringify(updatedPlaylistLibrary));
    
        // Show a random DJ phrase
        const djPhrase = getRandomDjPhrase();
        setDjPhrase(djPhrase); // Update state with DJ phrase
    
        return response.response;
    };

    const getRandomDjPhrase = () => {
        const randomIndex = Math.floor(Math.random() * djPhrases.length);
        return djPhrases[randomIndex];
    };      
    
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <StyledContainer>
                {/* Vertical navbar with icon-only tabs */}
                <VerticalNav>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        orientation="vertical"
                        TabIndicatorProps={{
                            style: { display: 'none' },
                        }}
                    >
                        <Tooltip title="Create"  placement="right">
                            <Tab icon={<AudiotrackIcon />} aria-label="Music" />
                        </Tooltip>

                        <Tooltip title="Statistics"  placement="right">
                            <Tab icon={<QueryStatsIcon />} aria-label="Statistics" />
                        </Tooltip>

                        <Tooltip title="Recent Listening"  placement="right">
                            <Tab icon={<HeadphonesIcon />} aria-label="Recent" />
                        </Tooltip>

                        <Tooltip title="Library"  placement="right">
                            <Tab icon={<LibraryMusicIcon />} aria-label="Playlist Library" />
                        </Tooltip>
                    </Tabs>
                </VerticalNav>

                {/* Main Chatbot and Spotify content area */}
                <ChatbotContainer>
                    <ChatbotWrapper chatBotResponseToMessage={handleUrl} />
                </ChatbotContainer>

                {/* Content that switches based on the selected tab */}
                <ContentContainer>
                    {value === 0 && !url && (
                        <>
                        <DjQuote>
                            {djPhrase}
                        </DjQuote>
                        <iframe
                            src="https://lottie.host/embed/4505bc97-2bbe-40e1-bb3d-0d4d1ed3f453/gdQzVP9tLK.json"
                            title="Loading animation"
                            width="100%"
                            height="400"
                            style={{ border: "none", background: "transparent" }}
                        />
                        </>
                    )}
                    {value === 0 && url && <SpotifyEmbeded url={url}/>}
                    {value === 1 && <div>Stats Placeholder</div>}
                    {value === 2 && ( // History Tab
                        <>
                            <RecentlyListenedSection>
                                <h2>Your Recent Listening</h2>
                                {recentlyListened.length > 0 ? (
                                    recentlyListened.map((song, index) => (
                                        <RecentlyListenedItem key={index}>
                                            <RecentlyListenedText>{song}</RecentlyListenedText>
                                        </RecentlyListenedItem>
                                    ))
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </RecentlyListenedSection>
                        </>)}
                        {value === 3 && (
                            <div style={{
                                textAlign: 'center',
                                marginTop: '10px',
                            }}>
                                <h2>Your AI Playlist Library</h2>
                            <PlaylistGrid>
                                {playlistLibrary.length > 0 ? (
                                    playlistLibrary.map((playlistUrl, index) => (
                                        <embed 
                                            key={index} 
                                            src={playlistUrl} 
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            loading="lazy"
                                            height="152px"
                                            width="100%"
                                        >
                                        </embed>
                                    ))
                                ) : (
                                    <p>No playlists added yet. Generate one to see it here!</p>
                                )}
                            </PlaylistGrid>
                            </div>
                        )}

                </ContentContainer>
                <Tooltip title="Logout"  placement="top">
                    <Fab
                        color="#1DB954"
                        aria-label="logout"
                        style={{
                            position: 'absolute',
                            bottom: 50,
                            left: 38,
                        }}
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                    >
                        <LogoutIcon />
                    </Fab>
                </Tooltip>
            </StyledContainer>
        </ThemeProvider>
    );
}
