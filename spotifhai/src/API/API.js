import axios from "axios";


export async function sendData(userId, accessToken) {
    console.log("user_id:", userId, "access_token:", accessToken); // Check values before the request
    try {
        const response = await axios.post(
            'http://localhost:8000/credentials',
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
        const response = await axios.post('http://localhost:8000/generatePlaylists', {
            userId: userId,
            userPrompt: prompt,
            accessToken: accessToken
        });
        
        console.log(response.data); // Log the response from the API
        return response.data.response;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

