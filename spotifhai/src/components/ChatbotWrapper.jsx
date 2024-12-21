import React from 'react';
import Chatbot from '../components/Chatbot/Chatbot';

const ChatbotWrapper = ({chatBotResponseToMessage}) => {
    const [lastMessage, setLastMessage] = React.useState("");

    const onUserMessage = async (userMessage) => {
        console.log('User message:', userMessage);
        setLastMessage(userMessage);
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex'
        }}>
            <Chatbot 
                addAIMessage={chatBotResponseToMessage} 
                onUserMessage={onUserMessage}
            />
        </div>
    );
};

export default ChatbotWrapper;
