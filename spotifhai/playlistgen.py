# # Steps for AI playlist Generation
# # FROM: https://medium.com/analytics-vidhya/build-your-own-playlist-generator-with-spotifys-api-in-python-ceb883938ce4
# # 1. an HTTP GET request to the /recommendations endpoint, to get the tracks;

# # 2. an HTTP POST request to the /playlists endpoint to create a new playlist;

# # 3. an HTTP POST request to the /playlist endpoint to add the songs.

# import requests
# import json

# all_genres = [
#   "acoustic","afrobeat","alt-rock","alternative","ambient","anime","black-metal","bluegrass","blues",
#   "bossanova","brazil","breakbeat","british","cantopop","chicago-house","children","chill","classical","club","comedy","country","dance","dancehall","death-metal","deep-house","detroit-techno",
#   "disco","disney","drum-and-bass","dub","dubstep","edm","electro","electronic","emo","folk","forro","french","funk","garage","german","gospel","goth","grindcore","groove","grunge",
#   "guitar","happy","hard-rock","hardcore","hardstyle","heavy-metal","hip-hop","holidays","honky-tonk","house","idm","indian","indie","indie-pop","industrial","iranian",
#   "j-dance","j-idol","j-pop","j-rock","jazz","k-pop","kids","latin","latino","malay","mandopop","metal","metal-misc","metalcore","minimal-techno","movies",
#   "mpb","new-age","new-release","opera","pagode","party","philippines-opm","piano","pop","pop-film","post-dubstep","power-pop","progressive-house","psych-rock","punk",
#   "punk-rock","r-n-b","rainy-day","reggae","reggaeton","road-trip","rock","rock-n-roll","rockabilly","romance","sad","salsa","samba","sertanejo","show-tunes","singer-songwriter",
#   "ska","sleep","songwriter","soundtracks","spanish","study","summer","swedish","synth-pop","tango","techno","trance", "trip-hop","turkish","work-out", "world-music"]

# # SETTINGS 
# rec_url = "https://api.spotify.com/v1/recommendations?"

# # We need these two things along with the user query to make the call
# token = "FILL_IN_YOUR_TOKEN"
# user_id = "FILL_IN_YOUR_USER_ID"




# market="US"
# # OUR FILTERS -- WE CAN GENERATE THESE WITH OPEN AI
# limit=10
# seed_genres="indie"
# target_danceability=0.9
# target_acousticness=0.5
# target_energy=0.5
# target_instrumentalness=0.5
# target_liveness=0.5
# target_loudness=0.2
# target_popularity=0.5
# target_tempo=100
# uris = [] 
# # This may be slightly more complicated because we have to get them from spotify
# # seed_artists = '0XNa1vTidXlvJ2gHSsRi4A'
# # seed_tracks='55SfSsxneljXOk5S3NVZIW'

# # PERFORM THE QUERY
# songs_query = f'{rec_url}limit={limit}&market={market}&seed_genres={seed_genres}&target_danceability={target_danceability}'
# # songs_query += f'&seed_artists={seed_artists}'
# # songs_query += f'&seed_tracks={seed_tracks}'

# songs_response = requests.get(songs_query, 
#                headers={"Content-Type":"application/json", 
#                         "Authorization":f"Bearer {token}"})
# songs_json = songs_response.json()

# print('Recommended Songs:')
# for i,j in enumerate(songs_json['tracks']):
#             uris.append(j['uri'])
#             print(f"{i+1}) \"{j['name']}\" by {j['artists'][0]['name']}")

# ### CREATE A PLAYLIST

# playlist_url = f"https://api.spotify.com/v1/users/{user_id}/playlists"

# # These should also be automatically generated
# request_body = json.dumps({
#           "name": "Indie bands like Franz Ferdinand and Foals but using Python",
#           "description": "My first programmatic playlist, yooo!",
#           "public": False
#         })
# playlist_response = requests.post(url = playlist_url, data = request_body, headers={"Content-Type":"application/json", 
#                         "Authorization":f"Bearer {token}"})

# create_playlist_url = playlist_response.json()['external_urls']['spotify']
# print(playlist_response.status_code)


# ### FILL THE NEW PLAYLIST WITH THE RECOMMENDATIONS

# playlist_id = playlist_response.json()['id']

# add_songs_url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"

# add_songs_request_body = json.dumps({
#           "uris" : uris
#         })
# add_songs_response = requests.post(url = add_songs_url, data = add_songs_request_body, headers={"Content-Type":"application/json", 
#                         "Authorization":f"Bearer {token}"})

# print(add_songs_response.status_code)
from pydantic import BaseModel
from openai import OpenAI
import os

# Load OpenAI API key from environment variable
client = OpenAI(
    # This is the default and can be omitted
    api_key=os.environ.get("OPENAI_API_KEY"),
)

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

class SeedArtists(BaseModel):
    artists: str


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
    - seed_genres: A comma-separated list (1-3) of genres relevant to the theme from the following list: {all_genres}.
    - target_danceability: Float (0-1) for how suitable the songs should be for dancing.
    - target_acousticness: Float (0-1) indicating how acoustic the songs should sound.
    - target_energy: Float (0-1) for the songs' energy level.
    - target_instrumentalness: Float (0-1) for how instrumental (non-vocal) the songs should be.
    - target_liveness: Float (0-1) for how much the songs sound like a live performance.
    - target_loudness: Float (0-1) for the loudness level of the songs.
    - target_popularity: Float (0-1) for the songs' popularity.
    
    Always return a list of generes and limit.
    If any of the target parameters seems irrelevant to the theme, return 3 for that parameter. Otherwise all the floats should be from 0-1

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

    params = completion.choices[0].message.parsed
    print("Test")
    print(params)



generate_playlist_params("A walk in the park with underground music")
