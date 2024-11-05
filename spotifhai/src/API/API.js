import axios from "axios";


export async function sendData() {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");

    try {
        const response = await axios.post('http://localhost:8000/', {
            params: {
                token: accessToken,
                userId: userId
            }
        });

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

