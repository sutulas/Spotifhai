import React, { useState, useEffect } from 'react';
import { Box, Paper, CssBaseline, Tooltip, Accordion, AccordionSummary, AccordionDetails, Typography, Tabs, Tab, CircularProgress, Slide } from '@mui/material';
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
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SpotifyEmbeded from '../components/SpotifyEmbed/SpotifyEmbeded';
import { getUserPlaylists } from '../API/API';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { getTopArtists } from '../API/API';
import { getTopTracks } from '../API/API';


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
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderRadius: '16px',
    boxShadow: '0px 0px 30px rgba(255, 120, 0, 0.5)',
    animation: 'slideIn 0.6s ease-out',
    overflow: 'hidden',
    height: '100%',
    maxWidth: '400px',
    '& .react-chatbot-kit-chat-container': {
        height: '100%',
        width: '100%',
    },
    '& .react-chatbot-kit-chat-inner-container': {
        height: '100%',
    },
    '& .react-chatbot-kit-chat-message-container': {
        height: 'calc(100% - 60px)',
        overflow: 'auto',
    },
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

const djPhrases = [
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
    "Beats so fresh, they just left the bakery.",
    "Warning: You may break the dance floor.",
    "Hope you're ready to dance like it's the year 3000.",
    "Tracks so crisp, you could hear them from space.",
    "Freshly baked beats, straight from the DJ oven.",
    "Fresh off the press, ready to impress!",
    "These beats hit harder than a double shot of espresso.",
    "These tracks have more flavor than a taco truck at midnight.",
    "Tracks so lit, even your Wi-Fi’s trying to keep up.",
    "Beats so spicy, you’ll need a drink to cool down.",
    "These drops are so big, they need their own zip code.",
    "This beat’s so deep, it’ll make your soul do the cha-cha.",
    "So much bass, you’ll need a seatbelt.",
    "Not all heroes wear capes, some just drop fire tracks.",
    "When the beat drops, even gravity takes a break.",
    "These beats are so hot, they’re causing global warming.",
    "Spin it like a pancake, make the speakers quake, the bass got more shake than a rattlesnake.",
    "Do you need a DJ? Because I can mix the perfect playlist for your heart.",
    "Is it hot in here, or did you just drop the hottest track in my heart?",
    "Beats so calculated, even my algorithms can’t predict the drop.",
    "Error 404: No bad vibes detected. Only bangers here.",
    "My playlist runs on an infinite loop of perfection.",
    "This drop’s so powerful, I might need to cool down my processors.",
    "This set’s got more flow than a fiber optic cable.",
    "This track’s smoother than a bug-free deployment.",
    "Oops, I did it again... dropped a fire track. 🔥🎧",
    "I’m gonna swing from the chandelier... if the drop hits hard enough. 🎤",
    "Just a small-town DJ, livin' in a lonely world. 🎧 🌍",
    "Let's groove to the algorithm!"
];

const DjQuote = styled(Box)({
    borderRadius: '20px',
    boxShadow: '10px 0px 30px rgba(255, 120, 0, 0.5)',
    backgroundColor: 'rgba(255, 130, 10, 0.5)',
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

const faqItems = [
    {
        question: "What is SpotifHAI?",
        answer: "SpotifHAI is an AI-powered chatbot that helps you discover, create, and share Spotify playlists based on your preferences and music history."
    },
    {
        question: "What can DJ SpotifHAI do?",
        answer: "DJ SpotifHAI can create custom playlists based on your mood, activities, or music preferences. You can ask for playlists for specific occasions, genres, or similar to your favorite artists. Just chat with the AI and let it know what you're looking for!"
    },
    {
        question: "How do I create a playlist?",
        answer: "Simply chat with DJ SpotifHAI and describe what kind of playlist you want. You can ask for things like 'Create a workout playlist' or 'Make me a playlist similar to [artist name]'. The AI will generate a custom playlist based on your request."
    },
    {
        question: "How can I view my recent listening history?",
        answer: "Your recent listening history can be viewed in the 'Recent Listening' tab. This shows your most recently played tracks on Spotify."
    },
    {
        question: "Where can I find my AI-generated playlists?",
        answer: "All playlists created by SpotifHAI will appear in your Spotify account and in the 'Library' tab of this app. They'll be marked with 'SpotifHAI' in the title."
    },
    {
        question: "Can I customize the playlists?",
        answer: "Yes! You can be specific in your requests to DJ SpotifHAI. Ask for playlists with certain moods, tempos, or genres. You can also edit the playlists directly in your Spotify account."
    },
    {
        question: "What if I don't like a playlist?",
        answer: "Feel free to ask DJ SpotifHAI to create a different playlist with more specific requirements. You can also delete any playlist from your Spotify account if you don't want to keep it."
    }
];

// Add back the styled components
const PlaylistGrid = styled(Box)({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px',
    padding: '20px',
    overflowY: 'auto',
    height: '100%',
    maxHeight: 'calc(100vh - 180px)',
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#1DB954',
        borderRadius: '4px',
    },
});

const StyledAccordion = styled(Accordion)({
    backgroundColor: '#f9f9f9',
    boxShadow: 'none',
    marginBottom: '10px',
    borderRadius: '8px',
    '&:before': {
        display: 'none',
    },
});

const StyledAccordionSummary = styled(AccordionSummary)({
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
    '& .MuiAccordionSummary-expandIcon': {
        color: '#333',
    },
    '& .MuiTypography-root': {
        fontWeight: 'bold',
        fontSize: '1.1rem',
    },
});

const StyledAccordionDetails = styled(AccordionDetails)({
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    '& p': {
        margin: '0',
        fontSize: '1rem',
        color: '#555',
    },
});

export default function Main() {
    const [url, setUrl] = useState();
    const [recentlyListened, setRecentlyListened] = useState([]);
    const [value, setValue] = useState(0); // State to track selected tab
    const [playlists, setPlaylists] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);
    const [tracks_loading, setTracksLoading] = useState(true);
    const [djPhrase, setDjPhrase] = useState('');
    const [playlistLibrary, setPlaylistLibrary] = useState(
        JSON.parse(localStorage.getItem('playlistLibrary')) || []
    );



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

        const fetchPlaylists = async () => {
            try {
                const data = await getUserPlaylists();
                if (data) {
                    setPlaylists(data.items || []); // Assuming Spotify API returns playlists in `items`
                    console.log("Playlist data");
                    console.log(data);
                } else {
                    console.error("Failed to fetch playlists");
                }
            } catch (err) {
                console.error("Error fetching playlists:", err);
            }
        };

        const fetchTopTracks = async () => {
            try {
                const res = await getTopTracks();
                const tracks = res.response.split(',,').map(track => track.trim());
                setTopTracks(tracks);
            } catch (error) {
                console.error('Error fetching top tracks:', error);
            }
        };

        const fetchTopArtists = async () => {
            try {
                const res = await getTopArtists();
                const artists = res.response.split(',,').map(artist => artist.trim());
                console.log(artists);
                setTopArtists(artists);
            } catch (error) {
                console.error('Error fetching top artists:', error);
            }
        };

        fetchRecentlyListened();
        fetchPlaylists();
        fetchTopArtists();
        fetchTopTracks();
        setTracksLoading(false);
    }, []);

    useEffect(() => {
        if (!url && value === 0) {
            const djPhrase = getRandomDjPhrase();
            setDjPhrase(djPhrase);
        } else {
            setDjPhrase('');
        }
    }, [value, url]);

    useEffect(() => {
        localStorage.setItem('playlistLibrary', JSON.stringify(playlistLibrary));
    }, [playlistLibrary]);

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
                        <Tooltip title="Create" placement="right">
                            <Tab icon={<AudiotrackIcon />} aria-label="Music" />
                        </Tooltip>

                        <Tooltip title="Statistics" placement="right">
                            <Tab icon={<QueryStatsIcon />} aria-label="Statistics" />
                        </Tooltip>

                        <Tooltip title="Recent Listening" placement="right">
                            <Tab icon={<HeadphonesIcon />} aria-label="Recent" />
                        </Tooltip>

                        <Tooltip title="Library" placement="right">
                            <Tab icon={<LibraryMusicIcon />} aria-label="Playlist Library" />
                        </Tooltip>

                        <Tooltip title="FAQs" placement="right">
                            <Tab icon={<LiveHelpIcon />} aria-label="FAQs" />
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
                                <Typography variant='h6'>{djPhrase}</Typography>
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
                    {value === 0 && url && <SpotifyEmbeded url={url} />}
                    {value === 1 && (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                padding: 3,
                                overflow: 'hidden'
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    background: 'linear-gradient(45deg, #1DB954, #23fc70)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 2
                                }}
                            >
                                Your Music Stats
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                gap: 4,
                                height: 'calc(100% - 100px)', // Account for title
                                overflow: 'hidden'
                            }}>
                                {/* Top Artists Section */}
                                <Box sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    height: '100%',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: 3,
                                    padding: 3,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#1DB954',
                                            textAlign: 'center',
                                            mb: 1
                                        }}
                                    >
                                        Top Artists
                                    </Typography>
                                    
                                    <Box sx={{
                                        overflow: 'auto',
                                        flex: 1,
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#f1f1f1',
                                            borderRadius: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#1DB954',
                                            borderRadius: '4px',
                                        },
                                    }}>
                                        {tracks_loading ? (
                                            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                                                <CircularProgress sx={{ color: '#1DB954' }} />
                                            </Box>
                                        ) : (
                                            topArtists.slice(0, 5).map((artist, index) => (
                                                <Slide direction="right" in={!tracks_loading} timeout={300 * (index + 1)} key={index}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        p: 2,
                                                        mb: 1,
                                                        backgroundColor: '#fff',
                                                        borderRadius: 2,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        '&:hover': {
                                                            transform: 'translateX(5px)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        }
                                                    }}>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 500,
                                                                color: '#333',
                                                                flex: 1
                                                            }}
                                                        >
                                                            {`${index + 1}. ${artist}`}
                                                        </Typography>
                                                        <MusicNoteIcon sx={{ color: '#1DB954' }} />
                                                    </Box>
                                                </Slide>
                                            ))
                                        )}
                                    </Box>
                                </Box>

                                {/* Top Songs Section */}
                                <Box sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    height: '100%',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: 3,
                                    padding: 3,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#1DB954',
                                            textAlign: 'center',
                                            mb: 1
                                        }}
                                    >
                                        Top Songs
                                    </Typography>
                                    
                                    <Box sx={{
                                        overflow: 'auto',
                                        flex: 1,
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#f1f1f1',
                                            borderRadius: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#1DB954',
                                            borderRadius: '4px',
                                        },
                                    }}>
                                        {tracks_loading ? (
                                            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                                                <CircularProgress sx={{ color: '#1DB954' }} />
                                            </Box>
                                        ) : (
                                            topTracks.slice(0, 5).map((song, index) => (
                                                <Slide direction="left" in={!tracks_loading} timeout={300 * (index + 1)} key={index}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        p: 2,
                                                        mb: 1,
                                                        backgroundColor: '#fff',
                                                        borderRadius: 2,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        '&:hover': {
                                                            transform: 'translateX(-5px)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        }
                                                    }}>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 500,
                                                                color: '#333',
                                                                flex: 1
                                                            }}
                                                        >
                                                            {`${index + 1}. ${song}`}
                                                        </Typography>
                                                        <MusicNoteIcon sx={{ color: '#1DB954' }} />
                                                    </Box>
                                                </Slide>
                                            ))
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                    {value === 2 && (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                padding: 3,
                                overflow: 'hidden'
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    background: 'linear-gradient(45deg, #1DB954, #23fc70)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 2
                                }}
                            >
                                Recent Listening History
                            </Typography>

                            <Box sx={{
                                flex: 1,
                                overflow: 'hidden',
                                backgroundColor: '#f8f9fa',
                                borderRadius: 3,
                                padding: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                {recentlyListened.length > 0 ? (
                                    <Box sx={{
                                        height: '100%',
                                        overflow: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#f1f1f1',
                                            borderRadius: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#1DB954',
                                            borderRadius: '4px',
                                        },
                                    }}>
                                        {recentlyListened.map((song, index) => (
                                            <Slide direction="right" in={true} timeout={200 * (index + 1)} key={index}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    p: 2,
                                                    mb: 2,
                                                    backgroundColor: '#fff',
                                                    borderRadius: 2,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    '&:hover': {
                                                        transform: 'translateX(5px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    }
                                                }}>
                                                    <MusicNoteIcon sx={{ color: '#1DB954' }} />
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 500,
                                                            color: '#333',
                                                            flex: 1,
                                                            fontSize: '1rem'
                                                        }}
                                                    >
                                                        {song}
                                                    </Typography>
                                                </Box>
                                            </Slide>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%'
                                    }}>
                                        <CircularProgress sx={{ color: '#1DB954' }} />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}
                    {value === 3 && (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                padding: 3,
                                overflow: 'hidden'
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    background: 'linear-gradient(45deg, #1DB954, #23fc70)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 2
                                }}
                            >
                                Your AI Playlist Library
                            </Typography>

                            <Box sx={{
                                flex: 1,
                                overflow: 'hidden',
                                backgroundColor: '#f8f9fa',
                                borderRadius: 3,
                                padding: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                {playlists.length > 0 ? (
                                    <PlaylistGrid>
                                        {playlists.map((playlist, index) => (
                                            <Slide direction="up" in={true} timeout={200 * (index + 1)} key={index}>
                                                <Box sx={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    height: '152px',
                                                    '&:hover': {
                                                        transform: 'translateY(-5px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    }
                                                }}>
                                                    <iframe
                                                        src={`https://open.spotify.com/embed/playlist/${playlist.id}?hide_playlist=1`}
                                                        width="100%"
                                                        height="152px"
                                                        frameBorder="0"
                                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                        loading="lazy"
                                                        style={{
                                                            borderRadius: '8px',
                                                        }}
                                                    />
                                                </Box>
                                            </Slide>
                                        ))}
                                    </PlaylistGrid>
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%',
                                        flexDirection: 'column',
                                        gap: 2
                                    }}>
                                        <Typography variant="h6" color="text.secondary">
                                            No playlists added yet
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Generate one in the chat to see it here!
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}
                    {value === 4 && (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                padding: 3,
                                overflow: 'hidden'
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    background: 'linear-gradient(45deg, #1DB954, #23fc70)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 2
                                }}
                            >
                                Frequently Asked Questions
                            </Typography>

                            <Box sx={{
                                flex: 1,
                                overflow: 'hidden',
                                backgroundColor: '#f8f9fa',
                                borderRadius: 3,
                                padding: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <Box sx={{
                                    height: '100%',
                                    overflow: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: '#f1f1f1',
                                        borderRadius: '4px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: '#1DB954',
                                        borderRadius: '4px',
                                    },
                                }}>
                                    {faqItems.map((faq, index) => (
                                        <Slide direction="right" in={true} timeout={200 * (index + 1)} key={index}>
                                            <StyledAccordion>
                                                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                    <Typography>{faq.question}</Typography>
                                                </StyledAccordionSummary>
                                                <StyledAccordionDetails>
                                                    <Typography>{faq.answer}</Typography>
                                                </StyledAccordionDetails>
                                            </StyledAccordion>
                                        </Slide>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    )}

                </ContentContainer>
                <Tooltip title="Logout" placement="top">
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
