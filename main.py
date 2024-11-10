from fastapi import FastAPI, HTTPException
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

# Load environment variables from .env file
load_dotenv()

auth_token = ""
user_id = ""

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

def get_uris(songs):
    uris = []
    print(songs)
    for song in songs:
        song_name = song.split(" - ")[0]
        song_artist = song.split(" - ")[1]
        search_url = f"https://api.spotify.com/v1/search?q={song_name}+{song_artist}&type=track&limit=1"
        search_response = requests.get(url = search_url, headers={"Content-Type":"application/json", 
                            "Authorization":f"Bearer {auth_token}"})
        uri = search_response.json()['tracks']['items'][0]['uri']
        uris.append(uri)
    return uris

def gpt_songs(prompt, length, data):
    songs = []
    if len(data) > 1:
        additional_info = f"Use this additional information: {data}"
    else:
        additional_info = ""
    message = f'''
    I want to create a playlist around this idea: '{prompt}'.  What are the songs that best fit this theme? Give {length} songs. Only respond with the title of the songs and the artist.
    Respond exactly in this format: "Song Title - Artist, Song Title - Artist, Song Title - Artist"

    {additional_info}

    '''

    print(message)
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

def gpt_playlist(prompt, title, length = 20, data = None):
    additional_info = ""
    if "get_top_tracks" in data:
        additional_info += f"Top tracks: {get_top_tracks()}"
        
    if "get_top_artists" in data:
        additional_info += f"Top artists: {get_top_artists()}"
        
    if "get_recently_listened":
        additional_info += f"Recently listened: {get_recently_listened()}"


    songs = gpt_songs(prompt, length, additional_info)
    # get data here?

    playlist_url, playlist_id = create_playlist(title)

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

def get_recently_listened():
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
    print(list(set(rec_played)))
    return list(set(rec_played))

def get_top_artists(time_range = 'medium_term'):
    url = 'https://api.spotify.com/v1/me/top/artists?limit=50&time_range=' + time_range
    artists_list = requests.get(url = url, headers={"Content-Type":"application/json", "Authorization":f"Bearer {auth_token}"})
    print("Artists list")
    artists = []
    print(artists_list.json())
    for artist in artists_list.json()['items']:
        artists.append(artist['name'])
    print(artists)
    return artists

def get_top_tracks(time_range = 'medium_term'):
    url = 'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=' + time_range
    tracks_list = requests.get(url = url, headers={"Content-Type":"application/json", "Authorization":f"Bearer {auth_token}"})
    print("Tracks list")
    tracks = []
    for track in tracks_list.json()['items']:
        tracks.append(track['name'] + " - " + ', '.join([artist['name'] for artist in track['artists']]))
    print(tracks)
    return tracks

class PlaylistRequest(BaseModel):
    userId: str
    userPrompt: str
    accessToken: str

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
                "description": "Create a playlist with the songs provided, only call if gp_songs is called",
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
                        },
                        "data": {
                            "type": "string",
                            "description": "Supplemental Data to get (get_top_tracks, get_top_artists, and/or get_recently_listened)",
                        }
                    },
                    "required": ["prompt", "title"],
                    "additionalProperties": False,
                },
    }
    }


### Define Tools ###
tools = [get_top_tracks_tool, get_top_artists_tool, get_recently_listened_tool, gpt_playlist_tool]
tool_map = {
    "get_top_tracks": get_top_tracks,
    "get_top_artists": get_top_artists,
    "get_recently_listened": get_recently_listened,
    "gpt_playlist": gpt_playlist
}


### Query Function ###
def query(question, system_prompt, max_iterations=10):
    messages = [{"role": "system", "content": system_prompt}]
    messages.append({"role": "user", "content": question})
    url = ''
    i = 0
    data = ""
    while i < max_iterations:
        i += 1
        print("iteration:", i)
        response = client.chat.completions.create(
            model="gpt-4o-mini", temperature=0.0, messages=messages, tools=tools
        )
        # print(response.choices[0].message)
        if response.choices[0].message.content != None:
            print(response.choices[0].message.content)
        # print(response.choices[0].message)

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
            result = function_to_call(**arguments)
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


@app.post("/generatePlaylists")
async def generate_playlists(request: PlaylistRequest):
    global auth_token
    global user_id
    auth_token = request.accessToken
    user_id = request.userId
    print(request.userPrompt)
    print(request.accessToken)
    print('id', request.userId)
    system_prompt = "You are a music AI bot helping the user anser their query. You have access to the Spotify API to generate playlists based on the user's query. Use the tools to help you answer the user's query."
    res, url = query(request.userPrompt, system_prompt)
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
    