import React from 'react';
import Chatbot from '../components/Chatbot/Chatbot';

const ChatbotWrapper = ({chatBotResponseToMessage}) => {
    const [lastMessage, setLastMessage] = React.useState("");

    const onUserMessage = async (userMessage) => {
        console.log('User message:', userMessage);
        setLastMessage(userMessage);
    };

    return (
        <div className="App">
            <Chatbot addAIMessage={chatBotResponseToMessage} onUserMessage={onUserMessage} />
        </div>

    );
};

export default ChatbotWrapper;
