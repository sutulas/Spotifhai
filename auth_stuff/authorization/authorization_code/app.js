var express = require('express');
var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var path = require('path');

var client_id = '683a2dd6216f45c9b5fa196ea7118ece'; // your clientId
var client_secret = 'ecefeeb0b5d74a63ba41eec1441aab5f'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

const generateRandomString = (length) => {
  return crypto.randomBytes(60).toString('hex').slice(0, length);
}

var stateKey = 'spotify_auth_state';
var app = express();

app.use(express.static(path.join(__dirname, 'public')))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var accessToken = body.access_token;
        var refreshToken = body.refresh_token;

        // Send tokens to the client for local storage
        res.send(`
          <html>
            <body>
              <script>
                localStorage.setItem('access_token', '${accessToken}');
                localStorage.setItem('refresh_token', '${refreshToken}');
                window.close(); // Close the window after storing
              </script>
              <p>Authentication successful. You can close this window.</p>
            </body>
          </html>
        `);
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) 
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var accessToken = body.access_token;
      res.send({ 'access_token': accessToken });
    } else {
      res.send({ error: 'Failed to refresh token' });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);
