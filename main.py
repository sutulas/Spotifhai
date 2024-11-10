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


def generate_playlist_params(user_query):
    all_genres = ["acoustic","afrobeat","alt-rock","alternative","ambient","anime","black-metal","bluegrass","blues",
        "bossanova","brazil","breakbeat","british","cantopop","chicago-house","children","chill","classical","club","comedy","country","dance","dancehall","death-metal","deep-house","detroit-techno",
        "disco","disney","drum-and-bass","dub","dubstep","edm","electro","electronic","emo","folk","forro","french","funk","garage","german","gospel","goth","grindcore","groove","grunge",
        "guitar","happy","hard-rock","hardcore","hardstyle","heavy-metal","hip-hop","holidays","honky-tonk","house","idm","indian","indie","indie-pop","industrial","iranian",
        "j-dance","j-idol","j-pop","j-rock","jazz","k-pop","kids","latin","latino","malay","mandopop","metal","metal-misc","metalcore","minimal-techno","movies",
        "mpb","new-age","new-release","opera","pagode","party","philippines-opm","piano","pop","pop-film","post-dubstep","power-pop","progressive-house","psych-rock","punk",
        "punk-rock","r-n-b","rainy-day","reggae","reggaeton","road-trip","rock","rock-n-roll","rockabilly","romance","sad","salsa","samba","sertanejo","show-tunes","singer-songwriter",
        "ska","sleep","songwriter","soundtracks","spanish","study","summer","swedish","synth-pop","tango","techno","trance", "trip-hop","turkish","work-out", "world-music"]

    # Construct the prompt
    prompt = f"""
    The user wants to create a playlist based on the theme or inspiration: "{user_query}". 
    Generate values for the following parameters to help them find songs that fit this theme.
    
    Parameters to return:
    - limit: Integer (1-50) representing the number of songs to include in the playlist.
    - seed_genres: A comma-separated list of genres relevant to the theme from the following list: {all_genres}.
    - target_danceability: Float (0-1) for how suitable the songs should be for dancing.
    - target_acousticness: Float (0-1) indicating how acoustic the songs should sound.
    - target_energy: Float (0-1) for the songs' energy level.
    - target_instrumentalness: Float (0-1) for how instrumental (non-vocal) the songs should be.
    - target_liveness: Float (0-1) for how much the songs sound like a live performance.
    - target_loudness: Float (0-1) for the loudness level of the songs.
    - target_popularity: Float (0-1) for the songs' popularity.
    """

    # Make the API call
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a music AI bot helping define parameters based on the users query. Define the parameters so the user can get the best recommendations possible"},
            {"role": "user", "content": prompt}
        ],
        response_format=SongRecommendationParams,
    )
    print(completion.choices[0].message)
    params = completion.choices[0].message

    # If the model refuses to respond, you will get a refusal message
    if (params.refusal):
        print(params.refusal)
        return None
    else:
        return params.parsed
    
def get_user_uri(user_id, token):
    uri_j = requests.get(url = "https://api.spotify.com/v1/me", headers={"Content-Type":"application/json", "Authorization":f"Bearer {token}"})
    uri_r = uri_j.json()["uri"]
    print(uri_r)
    matches = re.findall(r'spotify:user:([a-zA-Z0-9]+)', uri_r)
    
    # UPDATED REGEX here to get the right user id

    if matches:
        uri_r = matches[0]
    return(uri_r)

def generate_playlist_desc(songs_json, query):
    songs = []
    for i,j in enumerate(songs_json['tracks']):
        songs.append(j['name'] + 'by ' +  j['artists'][0]['name'])
    print(songs[0])
    song_s = ", ".join(songs)
    desc_call = client.chat.completions.create(
        model="gpt-4o-mini", 
        messages=[
            {"role": "system", "content": "You are a music expert assistant with a specialty in describing playlists."},
            {"role": "user", "content": f"Create a description for my playlist about {query}. These are the songs on the playlist: {song_s}. Keep the playlist under two sentences and relevant to the playlist"}
        ]
    )
    return desc_call.choices[0].message.content

def generate_playlist(user_query, token, user_id):
    rec_url = "https://api.spotify.com/v1/recommendations?"

    # We need these two things along with the user query to make the call
    #token = "FILL_IN_YOUR_TOKEN"
    #user_id = "FILL_IN_YOUR_USER_ID"

    market="US"

    # Generate Parameters with a loop for success 
    i = 0
    try:
        while i < 3:
            p = generate_playlist_params(user_query)
            if p != None:
                uris = [] 
                # This may be slightly more complicated because we have to get them from spotify
                # seed_artists = '0XNa1vTidXlvJ2gHSsRi4A'
                # seed_tracks='55SfSsxneljXOk5S3NVZIW'

                p.seed_genres = p.seed_genres[:3]
                # Restricted to 3 genres for now, seems like more than 3 or 4 causes and error

                # PERFORM THE QUERY -
                songs_query = f'{rec_url}limit={p.limit}&market={market}&seed_genres={",".join(p.seed_genres)}'
                songs_query += f'&target_danceability={p.target_danceability}'
                songs_query += f'&target_acousticness={p.target_acousticness}'
                songs_query += f'&target_energy={p.target_energy}'
                songs_query += f'&target_instrumentalness={p.target_instrumentalness}'
                songs_query += f'&target_liveness={p.target_liveness}'
                songs_query += f'&target_loudness={p.target_loudness}'
                # songs_query += f'&target_popularity={p.target_popularity}'
                #songs_query += f'&seed_artists={seed_artists}'
                # songs_query += f'&seed_tracks={seed_tracks}'
                
                artist_llm = client.chat.completions.create(
                    model="gpt-4o-mini", 
                    messages=[
                        {"role": "system", "content": "You are a music expert assistant."},
                        {"role": "user", "content": f"I want to create a playlist around this idea: '{user_query}'. What is the one artist that best fits this theme? Only respond with the title of the artist"}
                    ],
                    max_tokens=50  # Limit tokens since only one artist is needed
                )

                # Extract and return the artist's name from the response
                artist = artist_llm.choices[0].message.content
                print(artist)

                # Get artist id for seeding
                artist_url = f'https://api.spotify.com/v1/search?q={artist}&type=artist&limit=1'
                artist_response = requests.get(url = artist_url, headers={"Content-Type":"application/json", 
                                        "Authorization":f"Bearer {token}"})
                artist_response = json.loads(artist_response.text)
            #   print(artist_response)
                artist_id = artist_response['artists']['items'][0]['uri']
              
                artist_id = re.match(r'spotify:artist:(\S+)', artist_id).group(1)
                songs_query += f'&seed_artists={artist_id}'

                print("songs_query")
                # songs_query = re.sub(r'%2C', ',', songs_query)
                # songs_query = re.sub(r'singer-songwriter', '', songs_query)
                # songs_query = re.sub(r',,', ',', songs_query)
                print(songs_query)
                songs_response = requests.get(songs_query, 
                            headers={"Content-Type":"application/json", 
                                        "Authorization":f"Bearer {token}"})
                print(songs_response.text)
                songs_json = songs_response.json()

                print('Recommended Songs:')
                for i,j in enumerate(songs_json['tracks']):
                    uris.append(j['uri'])
                    print(f"{i+1}) \"{j['name']}\" by {j['artists'][0]['name']}")
                ### CREATE A PLAYLIST
                uri = get_user_uri(user_id, token)
                playlist_url = f"https://api.spotify.com/v1/users/{uri}/playlists"
                
                # These should also be automatically generated
                playlist_title = user_query + " - By SpotifHAI"

                # Generate playlist desc
                playlist_desc = generate_playlist_desc(songs_json, user_query)
                print(playlist_desc)
                request_body = json.dumps({
                        "name": playlist_title,
                        "description": "Description and songs generated by SpotifHAI",
                        "public": False
                        })
                playlist_response = requests.post(url = playlist_url, data = request_body, headers={"Content-Type":"application/json", 
                                        "Authorization":f"Bearer {token}"})
                print('url: ',playlist_url)
                print(request_body)

                print(playlist_response.json())

                print("playlist_response")
                print(playlist_response)
                url = playlist_response.json()['external_urls']['spotify']
                
                print(playlist_response.status_code)


                ### FILL THE NEW PLAYLIST WITH THE RECOMMENDATIONS

                playlist_id = playlist_response.json()['id']

                add_songs_url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"

                add_songs_request_body = json.dumps({
                        "uris" : uris
                        })
                add_songs_response = requests.post(url = add_songs_url, data = add_songs_request_body, headers={"Content-Type":"application/json", 
                                        "Authorization":f"Bearer {token}"})

                print(add_songs_response.status_code)    
                url = re.sub(r'(spotify\.com/)', r'\1embed/', url) 
                # Adding \embed to the url to make it an embed link
                return playlist_desc, url
            else:
                print("Error generating parameters")
                i += 1
    except Exception as e:
        print(e)
        return "Errors generating playlist, please try again: " + str(e), "error"
        
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
    for song in songs:
        song_name = song.split(" by ")[0]
        song_artist = song.split(" by ")[1]
        search_url = f"https://api.spotify.com/v1/search?q={song_name}+{song_artist}&type=track&limit=1"
        search_response = requests.get(url = search_url, headers={"Content-Type":"application/json", 
                            "Authorization":f"Bearer {auth_token}"})
        uri = search_response.json()['tracks']['items'][0]['uri']
        uris.append(uri)
    return uris


def gpt_playlist(title, songs):
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


    




def get_recently_listened(token):
    # Convert to milliseconds
    ctime = str(round(time.time() * 1000))
    url = 'https://api.spotify.com/v1/me/player/recently-played?limit=15&before=' + ctime
    rec_list = requests.get(url = url, headers={"Content-Type":"application/json", "Authorization":f"Bearer {token}"})
    print("Rec list")
    rec_played = []
    for item in rec_list.json()['items']:
        track_name = item['track']['name']
        artists = [artist['name'] for artist in item['track']['artists']]
        rec_played.append(track_name + " by " + ', '.join(artists))
    print(list(set(rec_played)))
    return list(set(rec_played))

def get_top_artists(token, time_range = 'medium_term'):
    url = 'https://api.spotify.com/v1/me/top/artists?time_range=' + time_range
    artists_list = requests.get(url = url, headers={"Content-Type":"application/json", "Authorization":f"Bearer {token}"})
    print("Artists list")
    artists = []
    for artist in artists_list.json()['items']:
        artists.append(artist['name'])
    print(artists)
    return artists

def get_top_tracks(token, time_range = 'medium_term'):
    url = 'https://api.spotify.com/v1/me/top/tracks?time_range=' + time_range
    tracks_list = requests.get(url = url, headers={"Content-Type":"application/json", "Authorization":f"Bearer {token}"})
    print("Tracks list")
    tracks = []
    for track in tracks_list.json()['items']:
        tracks.append(track['name'] + " by " + ', '.join([artist['name'] for artist in track['artists']]))
    print(tracks)
    return tracks


class PlaylistRequest(BaseModel):
    userId: str
    userPrompt: str
    accessToken: str

def playlist_generation_tool(prompt):
    res, url = generate_playlist(prompt, auth_token, user_id)
    return res, url

playlist_generation = {
  "type": "function",
  "function": {
      "name": "playlist_generation_tool",
            "description": "Creates a playlist based on the user's query. Call this whenever you want to generate a playlist, for example: 'create a playlist for a party'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "The prompt for the playlist",
                    }
                },
                "required": ["prompt"],
                "additionalProperties": False,
            },
  }
}

data_response = {
  "type": "function",
  "function": {
      "name": "data_response",
            "description": "Responds with the data requested by the user. Call this whenever you want to get a response to a data query.",
            "parameters": {
                "type": "object",
                "properties": {
                    "data": {
                        "type": "string",
                        "description": "The exact data requested by the user",
                    }
                },
                "required": ["prompt"],
                "additionalProperties": False,
            },
  }
}


### Define Tools ###
tools = [playlist_generation, data_response]
tool_map = {
    "playlist_generation_tool": playlist_generation_tool,
    "data_response": data_response_tool
}


### Query Function ###
def query(question, system_prompt, max_iterations=10):
    messages = [{"role": "system", "content": system_prompt}]
    messages.append({"role": "user", "content": question})
    i = 0
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
    return response.choices[0].message.content


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
    res = get_recently_listened(request.accessToken)
    return SecondResponse(response = "Recently Listened Songs:     " + " ------- ".join(res))
    