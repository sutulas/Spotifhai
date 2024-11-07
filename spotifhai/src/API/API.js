import axios from "axios";
const url = 'https://spotifhai.onrender.com/';
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

