import React, { useEffect, useState } from 'react';
import axios from 'axios';

const client_id = '683a2dd6216f45c9b5fa196ea7118ece'; // Your client ID
const client_secret = 'ecefeeb0b5d74a63ba41eec1441aab5f'; // Your client secret
const redirect_uri = 'http://localhost:3000/callback'; // Your redirect URI

const App = () => {
  const [profile, setProfile] = useState(null); // State to store user profile

  const handleLogin = () => {
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email';
    const url = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: client_id,
      redirect_uri: redirect_uri,
      state: state,
      scope: scope,
    }).toString()}`;

    window.location.href = url;
  };

  const generateRandomString = (length) => {
    return [...Array(length)].map(() => (Math.random().toString(36)[2])).join('');
  };

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
  
    // Check if the code has been used to prevent double-fetching
    if (code && !sessionStorage.getItem('codeUsed')) {
      sessionStorage.setItem('codeUsed', 'true'); // Mark code as used

      const fetchToken = async () => {
        try {
          const requestData = {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
          };
  
          const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams(requestData), {
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`),
            },
          });
  
          const { access_token } = tokenResponse.data;
          localStorage.setItem('access_token', access_token);

          // Fetch and display user profile
          fetchUserProfile(access_token);
        } catch (e) { 
          console.error('Error fetching access token:', e.response ? e.response.data : e.message);
        }
      };
  
      fetchToken();
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setProfile(profileResponse.data); // Store profile data in state
    } catch (e) {
      console.error('Error fetching profile:', e.response ? e.response.data : e.message);
    }
  };

  return (
    <div>
      <h1>Spotify Authentication</h1>
      {!profile ? (
        <button onClick={handleLogin}>Login with Spotify</button>
      ) : (
        <div>
          <h2>Welcome, {profile.display_name}</h2>
          <p>Email: {profile.email}</p>
          <img src={profile.images[0]?.url} alt="Profile" style={{ width: '100px', borderRadius: '50%' }} />
        </div>
      )}
    </div>
  );
};

export default App;



// Potenial issue: Only one user at a time??? If i login on one browser, it auto logs-in on another browser
