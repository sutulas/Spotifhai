# Steps for AI playlist Generation
# FROM: https://medium.com/analytics-vidhya/build-your-own-playlist-generator-with-spotifys-api-in-python-ceb883938ce4
# 1. an HTTP GET request to the /recommendations endpoint, to get the tracks;

# 2. an HTTP POST request to the /playlists endpoint to create a new playlist;

# 3. an HTTP POST request to the /playlist endpoint to add the songs.

import requests
import json

# SETTINGS 
rec_url = "https://api.spotify.com/v1/recommendations?"
token = "FILL_IN_YOUR_TOKEN"
user_id = "FILL_IN_YOUR_USER_ID"

# OUR FILTERS -- WE CAN GENERATE THESE WITH OPEN AI
limit=10
market="US"
seed_genres="indie"
target_danceability=0.9
uris = [] 
seed_artists = '0XNa1vTidXlvJ2gHSsRi4A'
seed_tracks='55SfSsxneljXOk5S3NVZIW'

# PERFORM THE QUERY
songs_query = f'{rec_url}limit={limit}&market={market}&seed_genres={seed_genres}&target_danceability={target_danceability}'
songs_query += f'&seed_artists={seed_artists}'
songs_query += f'&seed_tracks={seed_tracks}'

songs_response = requests.get(songs_query, 
               headers={"Content-Type":"application/json", 
                        "Authorization":f"Bearer {token}"})
songs_json = songs_response.json()

print('Recommended Songs:')
for i,j in enumerate(songs_json['tracks']):
            uris.append(j['uri'])
            print(f"{i+1}) \"{j['name']}\" by {j['artists'][0]['name']}")

### CREATE A PLAYLIST

playlist_url = f"https://api.spotify.com/v1/users/{user_id}/playlists"

# These should also be automatically generated
request_body = json.dumps({
          "name": "Indie bands like Franz Ferdinand and Foals but using Python",
          "description": "My first programmatic playlist, yooo!",
          "public": False
        })
playlist_response = requests.post(url = playlist_url, data = request_body, headers={"Content-Type":"application/json", 
                        "Authorization":f"Bearer {token}"})

create_playlist_url = playlist_response.json()['external_urls']['spotify']
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