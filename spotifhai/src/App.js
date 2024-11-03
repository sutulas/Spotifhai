import React, { useState } from 'react';
import axios from 'axios'; // Only if you are using axios

const App = () => {
  const [response, setResponse] = useState('');

  const testEndpoint = async () => {
    try {
      const res = await axios.get('http://localhost:8000/'); 
      const data = res.data;
      setResponse(data.response);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResponse('Error fetching data');
    }
  };

  return (
    <div>
      <h1>FastAPI Endpoint Test</h1>
      <button onClick={testEndpoint}>Test Endpoint</button>
      <p>Response: {response}</p>
    </div>
  );
};

export default App;
