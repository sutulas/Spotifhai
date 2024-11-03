import React, { useEffect } from 'react';
import axios from 'axios';

const client_id = '683a2dd6216f45c9b5fa196ea7118ece'; // Your client ID
const client_secret = 'ecefeeb0b5d74a63ba41eec1441aab5f'; // Your client secret
const redirect_uri = 'http://localhost:3000/callback'; // Your redirect URI

const App = () => {
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
    const state = new URLSearchParams(window.location.search).get('state');

    if (code) {
      const fetchToken = async () => {
        try {
          const requestData = {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
          };

          // Log the request data
          console.log('Request Data:', requestData);
          console.log('Authorization Header:', 'Basic ' + btoa(`${client_id}:${client_secret}`));

          const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams(requestData), {
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`),
            },
          });

          const { access_token, refresh_token } = tokenResponse.data;

          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          // Redirect to home page after successful login
          // window.location.href = '/';
        } catch (e) { 
          console.error('Error fetching access token:', e);
        }
      };

      fetchToken();
    }
  }, []);

  return (
    <div>
      <h1>Spotify Authentication</h1>
      <button onClick={handleLogin}>Login with Spotify</button>
    </div>
  );
};

export default App;
