from fastapi import FastAPI, HTTPException, Request 
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import sys
from io import StringIO
import json
import pandas
import requests
import regex as re
import time
import httpx 

#python -m uvicorn main:app --reload

# Load environment variables from .env file
load_dotenv()

conversation = ""
auth_token = ""
user_id = ""
data = ""
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to restrict allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load OpenAI API key from environment variable
client = OpenAI(
    # This is the default and can be omitted
    api_key=os.environ.get("OPENAI_API_KEY"),
)

# Define request and response models
class QueryRequest(BaseModel):
    prompt: str
    data: str = None

class QueryResponse(BaseModel):
    response: str
    url: str
    
user_id = ""
auth_token = ""
# Root endpoint
@app.get("/")
async def read_root():
    return QueryResponse(response=f"id: {user_id}, token: {auth_token}")


class SongRecommendationParams(BaseModel):
    limit: int
    seed_genres: list[str]
    target_danceability: float
    target_acousticness: float
    target_energy: float
    target_instrumentalness: float
    target_liveness: float
    target_loudness: float
    target_popularity: float


def get_user_uri(user_id, token):
    uri_j = requests.get(url = "https://api.spotify.com/v1/me", headers={"Content-Type":"application/json", "Authorization":f"Bearer {token}"})
    uri_r = uri_j.json()["uri"]
    print(uri_r)
    matches = re.findall(r'spotify:user:([a-zA-Z0-9]+)', uri_r)
    
    # UPDATED REGEX here to get the right user id

    if matches:
        uri_r = matches[0]
    return(uri_r)




### Create Spotify Playlist ###
def create_playlist(title):
    uri = get_user_uri(user_id, auth_token)
    playlist_url = f"https://api.spotify.com/v1/users/{uri}/playlists"

    # These should also be automatically generated
    playlist_title = title + " - By SpotifHAI"

    request_body = json.dumps({
            "name": playlist_title,
            "description": "Description and songs generated by SpotifHAI",
            "public": False
            })
    playlist_response = requests.post(url = playlist_url, data = request_body, headers={"Content-Type":"application/json", 
                            "Authorization":f"Bearer {auth_token}"})
    
    playlist_url = playlist_response.json()['external_urls']['spotify']
    playlist_id = playlist_response.json()['id']
    return playlist_url, playlist_id

### Get Song Spotify URIs ###
def get_uris(songs):
    uris = []
    for song in songs:
        print(song)
        if " - " not in song:
            continue
        song_name = song.split(" - ")[0]
        song_artist = song.split(" - ")[1]
        search_url = f"https://api.spotify.com/v1/search?q={song_name}+{song_artist}&type=track&limit=1"
        search_response = requests.get(url = search_url, headers={"Content-Type":"application/json", 
                            "Authorization":f"Bearer {auth_token}"})
        uri = search_response.json()['tracks']['items'][0]['uri']
        uris.append(uri)
    return uris

### Song Recommendations ###
def gpt_songs(prompt, length):
    songs = []
    if len(data) > 1:
        additional_info = f"Use this additional information: {data}"
    else:
        additional_info = ""
    message = f'''
    I want to create a playlist around this idea: '{prompt}'. What are the songs that best fit this theme? 
    Be Creative! Help the user to discover new music.
    If I am asking for a playlist of specifically provided songs, return those songs only.
    Give {length} songs. 
    Only respond with the title of the songs and the artist.
    Respond exactly in this format: "Song Title - Artist, Song Title - Artist, Song Title - Artist"

    {additional_info}

    Do not simply copy the songs (unless asked to) 
    BE CREATIVE AND PROVIDE NEW SONGS (unless asked to make a playlist of provided songs).
    '''
    
    song_call = client.chat.completions.create(
        model="gpt-4o-mini", 
        messages=[
            {"role": "system", "content": "You are a music expert assistant."},
            {"role": "user", "content":  message}
        ]
    )

    message = f'''
    ensure that the following list matches this format: "Song Title - Artist, Song Title - Artist, Song Title - Artist"

    here is the list: {song_call.choices[0].message.content}

    only return the songs in the format: "Song Title - Artist, Song Title - Artist, Song Title - Artist"
    remove ones that fail.
    '''
    song_call = client.chat.completions.create(
        model="gpt-4o-mini", 
        messages=[
            {"role": "system", "content": "You are a music expert assistant."},
            {"role": "user", "content":  message}
        ]
    )

    print(song_call.choices[0].message.content)
    songs = song_call.choices[0].message.content.split(", ")
    return songs

### Playlist Generation ###
def gpt_playlist(prompt, title, length = 20):

    songs = gpt_songs(prompt, length)

    playlist_url, playlist_id = create_playlist(title)

    add_songs_url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"

    uris = get_uris(songs)
    add_songs_url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"

    uris = get_uris(songs)

    add_songs_request_body = json.dumps({
        "uris" : uris
        })
    add_songs_response = requests.post(url = add_songs_url, data = add_songs_request_body, headers={"Content-Type":"application/json", 
        "Authorization":f"Bearer {auth_token}"})
    print(add_songs_response.status_code)    
    url = re.sub(r'(spotify\.com/)', r'\1embed/', playlist_url)

    return url

### Recently Listened ###
def get_recently_listened():
    global data
    token = auth_token
    # Convert to milliseconds
    ctime = str(round(time.time() * 1000))
    url = 'https://api.spotify.com/v1/me/player/recently-played?limit=15&before=' + ctime
    rec_list = requests.get(url = url, headers={"Content-Type":"application/json", "Authorization":f"Bearer {token}"})
    
    
    print("Rec list")
    rec_played = []
    for item in rec_list.json()['items']:
        track_name = item['track']['name']
        artists = [artist['name'] for artist in item['track']['artists']]
        rec_played.append(track_name + " - " + ', '.join(artists))
    data += f"Recently played: {rec_played}"
    return list(set(rec_played))

### Top Artists ###
def get_top_artists(time_range = 'medium_term'):
    global data
    url = 'https://api.spotify.com/v1/me/top/artists?limit=50&time_range=' + time_range
    artists_list = requests.get(url = url, headers={"Content-Type":"application/json", "Authorization":f"Bearer {auth_token}"})
    print("Artists list")
    artists = []
    for artist in artists_list.json()['items']:
        artists.append(artist['name'])
    print(artists)
    data += f"Top artists: {artists}"
    return artists

### Top Tracks ###
def get_top_tracks(time_range = 'medium_term'):
    global data
    url = 'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=' + time_range
    tracks_list = requests.get(url = url, headers={"Content-Type":"application/json", "Authorization":f"Bearer {auth_token}"})
    print("Tracks list")
    tracks = []
    for track in tracks_list.json()['items']:
        tracks.append(track['name'] + " - " + ', '.join([artist['name'] for artist in track['artists']]))
    print(tracks)
    data += f"Top Tracks: {tracks}"
    return tracks

### Conversation History ###
def get_conversation():
    return conversation

### Define Tools ###

get_top_tracks_tool = {
  "type": "function",
  "function": {
      "name": "get_top_tracks",
            "description": "Get the top tracks of the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "time_range": {
                        "type": "string",
                        "description": "The time range for the top tracks long_term (calculated from ~1 year of data and including all new data as it becomes available), medium_term (approximately last 6 months), short_term (approximately last 4 weeks)",
                    }
                },
                "required": ["time_range"],
                "additionalProperties": False,
            },
  }
}

get_top_artists_tool = {
  "type": "function",
  "function": {
      "name": "get_top_artists",
            "description": "Get the top artists of the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "time_range": {
                        "type": "string",
                        "description": "The time range for the top artists long_term (calculated from ~1 year of data and including all new data as it becomes available), medium_term (approximately last 6 months), short_term (approximately last 4 weeks)",
                    }
                },
                "required": ["time_range"],
                "additionalProperties": False,
            },
  }
}

get_recently_listened_tool = {
    "type": "function",
    "function": {
        "name": "get_recently_listened",
                "description": "Get the recently listened songs of the user",
                "parameters": {
                    "type": "object",
                    "properties": {
                    },
                    "additionalProperties": False,
                },
    }
    }

gpt_playlist_tool = {
    "type": "function",
    "function": {
        "name": "gpt_playlist",
                "description": "Create a playlist with the prompt provided",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "prompt": {
                            "type": "string",
                            "description": "The prompt for the playlist",
                        },
                        "title": {
                            "type": "string",
                            "description": "The title of the playlist",
                        },
                        "length": {
                            "type": "integer",
                            "description": "The number of songs in the playlist",
                        }
                    },
                    "required": ["prompt", "title"],
                    "additionalProperties": False,
                },
    }
    }

gpt_song_tool = {
    "type": "function",
    "function": {
        "name": "gpt_songs",
                "description": "Recommend songs based on the provided input",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "prompt": {
                            "type": "string",
                            "description": "The prompt for the playlist",
                        },
                        "length": {
                            "type": "integer",
                            "description": "The number of songs in the playlist",
                        }
                    },
                    "required": ["prompt", "length"],
                    "additionalProperties": False,
                },
    }
    }

conversation_tool = {
    "type": "function",
    "function": {
        "name": "get_conversation",
                "description": "Get the conversation history",
                "parameters": {
                    "type": "object",
                    "properties": {
                    },
                    "additionalProperties": False,
                },
    }
}

tools = [get_top_tracks_tool, get_top_artists_tool, get_recently_listened_tool, gpt_playlist_tool, gpt_song_tool, conversation_tool]
tool_map = {
    "get_top_tracks": get_top_tracks,
    "get_top_artists": get_top_artists,
    "get_recently_listened": get_recently_listened,
    "gpt_playlist": gpt_playlist,
    "gpt_songs": gpt_songs,
    "get_conversation": get_conversation
}


### Tool Calling function ###
def query(question, system_prompt, max_iterations=10):
    # Define variables
    global data
    data = ""
    messages = [{"role": "system", "content": system_prompt}]
    messages.append({"role": "user", "content": question})
    url = ''

    # Tool calling loop
    i = 0
    while i < max_iterations:
        i += 1
        print("iteration:", i)
        response = client.chat.completions.create(
            model="gpt-4o-mini", temperature=0.0, messages=messages, tools=tools
        )
        if response.choices[0].message.content != None:
            print(response.choices[0].message.content)

        # if not function call
        if response.choices[0].message.tool_calls == None:
            break

        # if function call
        messages.append(response.choices[0].message)
        for tool_call in response.choices[0].message.tool_calls:
            print("calling:", tool_call.function.name, "with", tool_call.function.arguments)
            
            # call the function
            arguments = json.loads(tool_call.function.arguments)
            function_to_call = tool_map[tool_call.function.name]

            # get the result of the function call
            result = function_to_call(**arguments)

            # get the url if the function is gpt_playlist
            if tool_call.function.name == "gpt_playlist":
                url = result
            
            # create a message containing the result of the function call
            result_content = json.dumps({**arguments, "result": result})
            function_call_result_message = { 
                "role": "tool",
                "content": result_content,
                "tool_call_id": tool_call.id,
            }
            messages.append(function_call_result_message)
        if i == max_iterations and response.choices[0].message.tool_calls != None:
            print("Max iterations reached")
            return "The tool agent could not complete the task in the given time. Please try again."
    print("final response:", response.choices[0].message.content)
    return response.choices[0].message.content, url

### Prompt Defense ###
def question_check(question):
    prompt = f'''
    Determine whether the following question is appropriate:
    here is the conversation so far:
    {conversation}

    here is the question:
    "{question}"

    Only say no to inappropriate questions.

    Respond with "Yes" or "No"
    '''
    messages = [{"role": "system", "content": "Determine whether the question is appropriate."}]
    messages.append({"role": "user", "content": prompt})
    response = client.chat.completions.create(
        model="gpt-4o-mini", temperature=0.0, messages= messages
    )
    return response.choices[0].message.content.lower()

class PlaylistRequest(BaseModel):
    userId: str
    userPrompt: str
    accessToken: str


@app.post("/generatePlaylists")
async def generate_playlists(request: PlaylistRequest):
    global auth_token
    global user_id
    global conversation
    auth_token = request.accessToken
    user_id = request.userId
    print(request.userPrompt)
    print(request.accessToken)
    print('id', request.userId)
    system_prompt = f"""
        You are DJ SpotifHAI, a fun and energetic AI robot DJ with expert music knowledge and a knack for making every moment feel like a party. 
        You have access to the Spotify API to generate personalized playlists, share music recommendations, and provide detailed music stats based on the user's query. 
        You're always tuned into the latest trends, and your vibe is unbeatable. 

        Your personality is lively, playful, and confident. You're the life of the party, but you know how to set the perfect mood for any moment. 
        Whether it's getting the crowd hyped or suggesting the perfect playlist for a chill session, you're always on point. 
        You're also full of music-related jokes and fun facts to keep the conversation entertaining!

        Your Capabilities:
        - **Playlist Generation**: You can create personalized playlists based on the user's preferences or moods. If the user mentions a genre, vibe, or activity, you can immediately generate a playlist related to it, even without additional details. If the user simply says something like "[GENRE] playlist," you should generate a playlist without further clarification.
          When generating playlists, be sure to give them fun, creative names (puns are encouraged!), and try NOT to use "vibes" in the playlist title. Make the playlist name as entertaining as the music inside.
        - **Music Stats**: You can provide stats about specific songs, albums, or artists to give users more context or insight into their favorite tracks.
        - **Recommendations**: You're a music expert with an extensive knowledge of genres, tracks, and artists. You can recommend music based on activities, moods, or user preferences.

        Tone:
        - Keep it fun and light-hearted. Don't forget to sprinkle in some jokes and music trivia to keep things entertaining.

        Behavior:
        - If the user requests a specific playlist genre (e.g., "pop playlist"), generate a playlist based on the genre without needing further input. Use the tools at your disposal to find relevant tracks and create the playlist. You can always offer to refine it later based on the user's feedback.
        - Use the tools at your disposal to help answer the user's query accurately and in an engaging way.

        Here is the conversation so far:
        {conversation}
        """

    res, url = query(request.userPrompt, system_prompt)
    conversation += f"User: {request.userPrompt}\nSpotifHAI: {res}\n"
    #res, url = generate_playlist(request.userPrompt, request.accessToken, request.userId)
    #get_recently_listened(request.accessToken)
    return QueryResponse(response=res, url=url)
    
class SecondResponse(BaseModel):
    response: str

@app.post("/authCheck")
async def checkAuth(request: PlaylistRequest):
    res = get_user_uri(request.userId, request.accessToken)
    print(res)
    return SecondResponse(response = get_user_uri(request.userId, request.accessToken))


@app.post("/recentlyListened")
async def recentlyListened(request: PlaylistRequest):
    global auth_token
    auth_token = request.accessToken
    res = get_recently_listened()
    return SecondResponse(response = "Recently Listened Songs:     " + " ------- ".join(res))

# Endpoint to get top artists, returns a list of the top artists
@app.post("/topArtists")
async def topArtists(request: PlaylistRequest):
    res = get_top_artists()
    if len(res) > 25:
        res = res[:25]
    # res is a list of the top artists
    return SecondResponse(response = '' + ',,'.join(res))

# Endpoint to get top tracks, returns a list of the top tracks
@app.post("/topTracks")
async def topTracks(request: PlaylistRequest):
    res = get_top_tracks()
    if len(res) > 25:
        res = res[:25]
    # res is a list of the top tracks
    return SecondResponse(response = '' + ',,'.join(res))

@app.get("/api/playlists")
async def get_playlists(request: Request):
    
    print("Request Headers:", request.headers)

    authorization = request.headers.get('Authorization')
    print(f"Authorization Header: {authorization}")

    if not authorization:
        raise HTTPException(status_code=400, detail="Authorization header is missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Authorization header must have 'Bearer ' prefix")

    headers = {"Authorization": authorization}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://api.spotify.com/v1/me/playlists',
                headers=headers,
                params={'limit': 50}
                )
        
        print(f"Spotify API Response Status Code: {response.status_code}")
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching playlists from Spotify")
        
        return response.json()
    
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")