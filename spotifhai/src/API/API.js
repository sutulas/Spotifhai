import axios from "axios";
// const url = 'https://spotifhai.onrender.com/';
const url =  process.env.NODE_ENV === 'production' ? 'https://spotifhai.onrender.com/' : 'http://localhost:8000/';
//const url = 'http://localhost:8000/';
 
export async function getRecentlyListened() { 
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");
    console.log("url");
    console.log(url);
    console.log(userId);
    console.log(accessToken);
    try {
        const response = await axios.post(url + 'recentlyListened', {
            userId: userId,
            userPrompt: "prompt",
            accessToken: accessToken
        });
        console.log("Logging");
        console.log(response.data); // Log the response from the API
        return response.data;
    } catch (error) {
        localStorage.clear();
        console.log("Returning recently listened");
        return false;
    }
}


export async function testLogin() { 
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");
    console.log(userId);
    console.log(accessToken);
    try {
        const response = await axios.post(url + 'authCheck', {
            userId: userId,
            userPrompt: "prompt",
            accessToken: accessToken
        });
        console.log("Logging");
        console.log(response.data); // Log the response from the API
        return true;
    } catch (error) {
        localStorage.clear();
        console.log("Returning false");
        return false;
    }
}

export async function sendData(userId, accessToken) {
    console.log("user_id:", userId, "access_token:", accessToken); // Check values before the request
    try {
        const response = await axios.post(
            url + 'credentials',
            {
                user_id: userId,
                token: accessToken
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(userId); // Log the response from the AP
        console.log(response.data); // Log the response from the API
        return response.data.response;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export async function getPlaylistUrl({prompt}) {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");
    console.log({ userId, prompt, accessToken });
    try {
        const response = await axios.post(url + 'generatePlaylists', {
            userId: userId,
            userPrompt: prompt,
            accessToken: accessToken
        });
        
        console.log("RESP");
        console.log(response.data); // Log the response from the API
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function getUserPlaylists() {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");

    // Log the values for debugging
    console.log("Fetching playlists:");
    console.log("User ID:", userId);
    console.log("Access Token:", accessToken);

    // Check if userId or accessToken is missing
    if (!userId || !accessToken) {
        console.error("Error: Missing user ID or access token.");
        return false; // Early exit if critical data is missing
    }

    try {
        // Log the authorization header to verify it
        console.log("Sending Authorization Header:", `Bearer ${accessToken}`);
        
        // Changed POST to GET, assuming your backend uses GET to fetch playlists
        const response = await axios.get(`${url}api/playlists`, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // Sending the token in the header
            }
        });

        console.log("Playlists fetched successfully:", response.data); // Log the playlists response
        console.log("Playlists fetched:", response.data.items); 
        return response.data; // Return the playlists data
    } catch (error) {
        // Log more detailed error information for debugging
        console.error("Error fetching playlists:", error.response ? error.response.data : error.message);
        if (error.response) {
            console.error("HTTP Status:", error.response.status); // Log HTTP status
        }
        localStorage.clear(); // Optionally clear localStorage on error (to force re-login)
        return false;
    }
}
