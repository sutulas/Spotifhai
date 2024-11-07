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

# Load environment variables from .env file
load_dotenv()


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

    params = completion.choices[0].message

    # If the model refuses to respond, you will get a refusal message
    if (params.refusal):
        print(params.refusal)
        return None
    else:
        return params.parsed
    
def get_user_uri(user_id, token):
    uri_j = requests.get(url = "https://api.spotify.com/v1/me", headers={"Content-Type":"application/json", 
                                    "Authorization":f"Bearer {token}"})
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
            {"role": "user", "content": f"Create a description for my playlist about {query}. These are the songs on the playlist: {song_s}. Keep the playlist title shorter and relevant to the playlist"}
        ]
    )
    print(desc_call.choices[0].message.content)
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
                print(artist_response)
                artist_id = artist_response['artists']['items'][0]['uri']
              
                artist_id = re.match(r'spotify:artist:(\S+)', artist_id).group(1)
                songs_query += f'&seed_artists={artist_id}'

                print("songs_query")
                # songs_query = re.sub(r'%2C', ',', songs_query)
                # songs_query = re.sub(r'singer-songwriter', '', songs_query)
                # songs_query = re.sub(r',,', ',', songs_query)
                #print(songs_query)
                songs_response = requests.get(songs_query, 
                            headers={"Content-Type":"application/json", 
                                        "Authorization":f"Bearer {token}"})
                #print(songs_response.text)
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
                return url
            else:
                print("Error generating parameters")
                i += 1
    except Exception as e:
        print(e)
        return "Errors generating playlist, please try again: " + str(e)
        


class PlaylistRequest(BaseModel):
    userId: str
    userPrompt: str
    accessToken: str

@app.post("/generatePlaylists")
async def generate_playlists(request: PlaylistRequest):
    print(request.userPrompt)
    print(request.accessToken)
    print('id', request.userId)
    res = generate_playlist(request.userPrompt, request.accessToken, request.userId)
    return QueryResponse(response=res)
    
@app.post("/authCheck")
async def checkAuth(request: PlaylistRequest):
    return QueryResponse(response = get_user_uri(request.userId, request.accessToken))
    