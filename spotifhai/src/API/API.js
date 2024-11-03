import axios from "axios";

export const testEndpoint = async (str) => {
    try {
        const res = await axios.post('http://localhost:8000/getAiResponse', {
            query: str // Send the user query as part of the request body
        });
        const data = res.data;
        return data.response;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
