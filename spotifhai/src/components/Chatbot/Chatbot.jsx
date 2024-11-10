import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Chatbot = ({ addAIMessage, onUserMessage }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);

  React.useEffect(() => {
    setMessages([{ id: 0, text: "Hi " + localStorage.getItem("name") + "!" + " I can create any Spotify playlist you'd like!", sender: 'ai' }]);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage = {
      id: messages.length,
      text: inputValue,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    onUserMessage(inputValue);
    setInputValue('');
    setLoading(true);

    const aiMessageText = await addAIMessage(inputValue);
    setLoading(false);

    if (aiMessageText) {
      const newAIMessage = {
        id: messages.length + 1,
        text: aiMessageText,
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, newAIMessage]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div
      className="chatbot"
      style={{
        width: '400px',
        border: '1px solid #e5e5ea',
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        ref={chatWindowRef}
        className="chat-window"
        style={{
          height: '400px',
          overflowY: 'auto',
          padding: '10px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender}`}
            style={{
              margin: '5px 0',
              padding: '10px 15px',
              borderRadius: '20px',
              maxWidth: '70%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#007aff' : '#f0f0f0',
              color: msg.sender === 'user' ? '#ffffff' : '#000000',
              boxShadow: msg.sender === 'user' ? '0 2px 4px rgba(0, 122, 255, 0.5)' : 'none',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.sender === 'ai' ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
              </ReactMarkdown>
            ) : (
              msg.text
            )}
          </div>
        ))}
        {loading && (
          <div
            className="loading-message"
            style={{
              margin: '5px 0',
              padding: '10px 15px',
              borderRadius: '20px',
              maxWidth: '70%',
              alignSelf: 'flex-start',
              backgroundColor: '#f0f0f0',
              color: '#000000',
              fontStyle: 'italic',
            }}
          >
            Typing<span className="dot-animation">...</span>
          </div>
        )}
      </div>
      <div className="input-container" style={{ display: 'flex', padding: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #e5e5ea',
            borderRadius: '20px',
            marginRight: '10px',
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: '10px 15px',
            border: 'none',
            borderRadius: '20px',
            backgroundColor: '#007aff',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
