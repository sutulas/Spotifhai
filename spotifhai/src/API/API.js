import axios from "axios";


export async function testEndpoint() {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");

    try {
        const response = await axios.get('http://localhost:8000/', {
            params: {
                token: accessToken,
                userId: userId,
                message: 'Hello, this is a sample message'
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

    try {
        const response = await axios.get('http://localhost:8000/', {
            params: {
                token: accessToken,
                userId: userId,
                message: prompt
            }
        });
        
        console.log(response.data); // Log the response from the API
        return response.data.response;
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}

