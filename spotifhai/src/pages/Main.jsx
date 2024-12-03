import React, { useState, useEffect } from 'react';
import { Box, Paper, CssBaseline, Tooltip, Accordion, AccordionSummary, AccordionDetails, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
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
import { Spotify } from 'react-spotify-embed';
import SpotifyEmbeded from '../components/SpotifyEmbed/SpotifyEmbeded';
import { px } from 'framer-motion';
import { getUserPlaylists } from '../API/API';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

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
    gap: '20px',
    padding: '30px 15px',
    width: '100%',
    height: 'auto',
    maxHeight: '80vh', // Limit the height of the section
    overflowY: 'auto', // Enable vertical scrolling
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    '&::-webkit-scrollbar': { // Custom scrollbar styling
        width: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#c1c1c1',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#a1a1a1',
    },
});

const RecentlyListenedItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '15px', // Increased gap for better spacing
    padding: '15px 10px',
    width: '100%',
    backgroundColor: '#ffffff', // Card-like style for each item
    borderRadius: '8px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'scale(1.02)', // Slight scaling on hover
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)', // More pronounced shadow
    },
});

const RecentlyListenedText = styled(Box)({
    flex: 1,
    color: '#333',
    fontSize: '16px', // Standardized font size
    fontWeight: 500, // Medium weight for emphasis
    animation: 'fadeIn 0.6s ease-in',
    '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
});

const IconWrapper = styled(Box)({
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    overflow: 'hidden', // Ensures image stays within bounds
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Adds depth to icons
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover', // Keeps images proportional
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
    justifyContent: 'start',
    alignItems: 'start',
});

const FAQ = styled(Box)({
    flex: 1,
    color: '#333', // Dark text color for readability
    fontWeight: 'normal', // Removed bold styling
    animation: 'fadeIn 0.6s ease-in', // Smooth fade-in animation
    '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
    padding: '20px', // Added padding for spacing
    maxWidth: '800px', // Max width for the content
    margin: '0 auto', // Center the content horizontally
});

const StyledAccordion = styled(Accordion)({
    backgroundColor: '#f9f9f9',
    boxShadow: 'none',
    marginBottom: '10px', // Space between each accordion item
    borderRadius: '8px', // Rounded corners for a softer look
    '&:before': {
        display: 'none', // Hide the default divider
    },
});

// Styling for the AccordionSummary
const StyledAccordionSummary = styled(AccordionSummary)({
    backgroundColor: '#e0e0e0', // Light gray background for each question
    borderRadius: '8px',
    '& .MuiAccordionSummary-expandIcon': {
        color: '#333', // Icon color
    },
    '& .MuiTypography-root': {
        fontWeight: 'bold', // Bold styling for questions
        fontSize: '1.1rem',
    },
});

// Styling for the AccordionDetails
const StyledAccordionDetails = styled(AccordionDetails)({
    padding: '16px', // Padding for the details
    backgroundColor: '#fff', // White background for answers
    borderRadius: '0 0 8px 8px', // Rounded bottom corners
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Light shadow for depth
    '& p': {
        margin: '0', // Remove default margin on paragraphs
        fontSize: '1rem',
        color: '#555', // Lighter text color for answers
    },
});

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
    "I’m gonna swing from the chandelier... if the drop hits hard enough. 🎤💥",
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

export default function Main() {
    const [url, setUrl] = useState();
    const [recentlyListened, setRecentlyListened] = useState([]);
    const [value, setValue] = useState(0); // State to track selected tab
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                    setError("Failed to fetch playlists");
                }
            } catch (err) {
                setError("Error fetching playlists");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentlyListened();
        fetchPlaylists();
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

    const playListFilter = () => { 
        return playlists.filter(playlist => playlist.name.endsWith("SpotifHAI"));
    }


   
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
                    {value === 1 && <div>Stats Placeholder</div>}
                    {value === 2 && ( // History Tab
                        <>
                            <RecentlyListenedSection>
                                <Typography variant="h4" gutterBottom>
                                    Your Recent Listening
                                </Typography>
                                {recentlyListened.length > 0 ? (
                                    recentlyListened.map((song, index) => (
                                        <RecentlyListenedItem key={index}>
                                            <MusicNoteIcon />
                                            <RecentlyListenedText>{song}</RecentlyListenedText>
                                        </RecentlyListenedItem>
                                    ))
                                ) : (
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '150px',
                                        }}
                                    >
                                        <CircularProgress />
                                    </div>
                                )}
                            </RecentlyListenedSection>
                        </>)}

                    {value === 3 && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '10px',
                        }}>
                            <Typography variant="h4" gutterBottom>Your AI Playlist Library</Typography>
                            <PlaylistGrid>
                                {playlists.length > 0 ? (
                                    playlists.map((playlist, index) => (
                                        <embed
                                            key={index}
                                            src={`https://open.spotify.com/embed/playlist/${playlist.id}`}
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            loading="lazy"
                                            height="152px"
                                            width="100%"
                                        />
                                    ))
                                ) : (
                                    <p>No playlists added yet. Generate one to see it here!</p>
                                )}
                            </PlaylistGrid>
                        </div>
                    )}
                    {value === 4 &&
                        <FAQ>
                            <Typography variant="h4" gutterBottom>
                                Frequently Asked Questions
                            </Typography>

                            <StyledAccordion>
                                <StyledAccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography>What is SpotifHAI?</Typography>
                                </StyledAccordionSummary>
                                <StyledAccordionDetails>
                                    <Typography>
                                        SpotifHAI is an AI-powered chatbot that helps you discover, create, and share Spotify playlists based on your preferences and music history.
                                    </Typography>
                                </StyledAccordionDetails>
                            </StyledAccordion>

                            <StyledAccordion>
                                <StyledAccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                >
                                    <Typography>What can DJ SpotifHAI do?</Typography>
                                </StyledAccordionSummary>
                                <StyledAccordionDetails>
                                    <Typography>
                                        DJ SpotifHAI can do anything from spin custom playlists to help you discover new tunes, but if you're still curious just ask the chat!
                                    </Typography>
                                </StyledAccordionDetails>
                            </StyledAccordion>

                            <StyledAccordion>
                                <StyledAccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                >
                                    <Typography>How do I create a playlist?</Typography>
                                </StyledAccordionSummary>
                                <StyledAccordionDetails>
                                    <Typography>
                                        You can generate a playlist by interacting with the chatbot. Simply send a prompt or request, and the AI will create a playlist for you based on your request.
                                    </Typography>
                                </StyledAccordionDetails>
                            </StyledAccordion>

                            <StyledAccordion>
                                <StyledAccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel3a-content"
                                    id="panel3a-header"
                                >
                                    <Typography>How can I view my recent listening history?</Typography>
                                </StyledAccordionSummary>
                                <StyledAccordionDetails>
                                    <Typography>
                                        Your recent listening history can be viewed in the "Recent Listening" tab. The history updates in real-time as you listen to more music.
                                    </Typography>
                                </StyledAccordionDetails>
                            </StyledAccordion>

                            <StyledAccordion>
                                <StyledAccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                >
                                    <Typography>What playlists are available in the "Library" tab?</Typography>
                                </StyledAccordionSummary>
                                <StyledAccordionDetails>
                                    <Typography>
                                        Unfortunately, as of now the "Library" tab is only able to show any public playlists you have on your spotify account.
                                    </Typography>
                                </StyledAccordionDetails>
                            </StyledAccordion>
                        </FAQ>
                    }

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
