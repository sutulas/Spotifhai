# SpotifHAI

An intelligent Spotify assistant that leverages OpenAI's GPT models to create personalized playlists and provide music recommendations through natural language conversations.

## Features

- **AI-Powered Playlist Generation**: Create custom playlists using natural language prompts
- **Smart Music Recommendations**: Get personalized song suggestions based on your listening history
- **Conversational Interface**: Chat with an AI assistant about music preferences and requests
- **Spotify Integration**: Seamless connection with your Spotify account
- **User Analytics**: View your top artists, tracks, and recently played music
- **Modern Web Interface**: Beautiful React-based UI with Material-UI components

## Live Demo

Visit the application at: [https://sutulas.github.io/Spotifhai/](https://sutulas.github.io/Spotifhai/)

**Demo Credentials:**
- Username: `sutulas@bc.edu`
- Password: `SpotifHAI1`

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **OpenAI GPT** - AI-powered conversation and playlist generation
- **Spotify Web API** - Music data and playlist management
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - User interface framework
- **Material-UI** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animations

## Prerequisites

- Python 3.8+
- Node.js 16+
- Spotify Premium account
- OpenAI API key

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/sutulas/Spotifhai.git
cd Spotifhai
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### 3. Frontend Setup
```bash
cd spotifhai
npm install
```

### 4. Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

## Running the Application

### Development Mode

1. **Start the Backend Server**
```bash
# From the root directory
python -m uvicorn main:app --reload
```

2. **Start the Frontend Development Server**
```bash
# From the spotifhai directory
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Production Deployment

```bash
# Build the frontend
cd spotifhai
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## API Documentation

### Core Endpoints

#### Generate Playlists
```http
POST /generatePlaylists
Content-Type: application/json

{
  "userId": "string",
  "userPrompt": "string",
  "accessToken": "string"
}
```

#### Authentication Check
```http
POST /authCheck
Content-Type: application/json

{
  "userId": "string",
  "accessToken": "string"
}
```

#### Recently Played Tracks
```http
POST /recentlyListened
Content-Type: application/json

{
  "userId": "string",
  "accessToken": "string"
}
```

#### Top Artists
```http
POST /topArtists
Content-Type: application/json

{
  "userId": "string",
  "accessToken": "string",
  "timeRange": "short_term|medium_term|long_term"
}
```

## Usage Examples

### Creating a Playlist
1. Connect your Spotify account
2. Type a natural language prompt like:
   - "Create a playlist for studying with ambient electronic music"
   - "Make a workout playlist with high-energy rock songs"
   - "Generate a chill playlist for rainy days"

### Getting Recommendations
- Ask about specific genres, moods, or activities
- Request songs similar to your favorite artists
- Get recommendations based on your listening history

## Authentication

The application uses Spotify OAuth 2.0 for authentication. Users need to:
1. Log in with their Spotify account
2. Grant permissions for playlist creation and profile access
3. The app securely stores access tokens for API calls

## AI Features

- **Natural Language Processing**: Understand complex music requests
- **Contextual Recommendations**: Consider user preferences and history
- **Playlist Optimization**: Balance variety and cohesion in generated playlists
- **Conversational Interface**: Maintain context across multiple interactions

## Project Structure

```
Spotifhai/
├── main.py                 # FastAPI backend server
├── playlistgen.py          # Spotify playlist generation logic
├── requirements.txt        # Python dependencies
├── spotifhai/             # React frontend application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
├── auth_stuff/            # Authentication utilities
└── README.md              # This file
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS settings match your frontend URL
2. **Spotify API Limits**: Be aware of Spotify's rate limiting for API calls
3. **OpenAI API Errors**: Check your API key and usage limits
4. **Authentication Issues**: Verify Spotify app credentials and redirect URIs

### Debug Mode
```bash
# Enable debug logging
export DEBUG=1
python -m uvicorn main:app --reload --log-level debug
```


**Note**: This application requires Spotify Premium for full functionality. Some features may be limited with free accounts.
