import React, { useState } from 'react';
import ChatbotWrapper from '../components/ChatbotWrapper';
import { testEndpoint } from '../API/API';


export default function Main() {

    

    return (
        <ChatbotWrapper
            chatBotResponseToMessage={testEndpoint}
        />
    )
}