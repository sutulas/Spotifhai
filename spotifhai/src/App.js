import React, { useState } from 'react';
import axios from 'axios'; // Only if you are using axios
import Chatbot from './components/Chatbot/Chatbot';
import Main from './pages/Main';
import ChatbotWrapper from './components/ChatbotWrapper';
import { testEndpoint } from './API/API';

const App = () => {

  return (
    <div>
      <h1>FastAPI Endpoint Test</h1>
      <button onClick={testEndpoint}>Test Endpoint</button>
      <p>Response: {}</p>
      <Main/>
    </div>
  );
};

export default App;
