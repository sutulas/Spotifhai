import React, { useState, useRef, useEffect } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

const Chatbot = ({ addAIMessage, onUserMessage }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Initial message from AI on component mount
  React.useEffect(() => {
    setMessages([{ id: 0, text: "Hey there! 🎉 I'm DJ SpotifHAI, your fun AI robot DJ! How can I help you groove today? 🎶", sender: 'ai' }]);
  }, []);

  // Handle input change for the message field
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle message sending
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    // Add user message to chat
    const userMessage = {
      id: messages.length,
      text: inputValue,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    onUserMessage(inputValue);
    setInputValue('');
    setLoading(true);

    // Add AI response message after processing
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

  // Handle enter key press to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
      e.preventDefault();
    }
  };

  // Scroll to the bottom of chat window when a new message is added
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, loading]);

   // Toggle menu visibility
   const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (text) => {
    setInputValue(text); // Set the input box value to the clicked menu item text
    setAnchorEl(null); // Close the menu after selecting an option
  };

  return (
    <div
      className="chatbot"
      style={{
        width: '400px',
        height: '100%',
        border: 'none',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
      }}
    >
      <div
        ref={chatWindowRef}
        className="chat-window"
        style={{
          height: '550px',
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
              backgroundImage: msg.sender === 'user' 
                ? 'linear-gradient(135deg, #1DB954, #23fc70)'
                : '#f0f0f0',
              color: msg.sender === 'user' ? '#ffffff' : '#000000',
              boxShadow: msg.sender === 'user' ? '0 2px 4px #1AA34A' : 'none',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              backgroundColor: msg.sender === 'user' ? undefined : '#f0f0f0',
            }}
          >
            {msg.text}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <iframe 
                src="https://lottie.host/embed/ff1497bc-e648-4673-b0e5-39f68a537cdc/7MDkW6W8Fa.json" 
                title="Loading animation"
                width="30" // Adjust size to fit inline nicely
                height="30"
                style={{ border: "none", background: "transparent" }}
              ></iframe>
              <span>
                Jamming<span className="dot-animation">...</span>
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="input-container" style={{ display: 'flex', padding: '10px' }}>
        {/* Question Mark Button */}
        <IconButton
          onClick={handleClick}
          style={{
            backgroundColor: '#1DB954',
            borderRadius: '50%',
            color: 'white',
            marginRight: '10px',
            padding: '12px',
            height: '35px',
            width: '35px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          <QuestionMarkIcon />
        </IconButton>

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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            padding: '10px 15px',
            border: 'none',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #1DB954, #23fc70)',
            color: '#ffffff',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background-color 0.3s',
          }}
        >
          Send
          <div
            style={{
              content: "''",
              position: 'absolute',
              width: '100px',
              height: '100%',
              backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0) 70%)',
              top: 0,
              left: '-100px',
              animation: isHovered ? 'shine 3s infinite linear' : 'none',
            }}
          ></div>
        </button>
      </div>

      {/* Floating Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick('What can you do?')}>What can you do?</MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Create a playlist for me based on my recent listening.')}>Create a playlist for me based on my recent listening.</MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Create a playlist for getting work done.')}>Create a playlist for getting work done.</MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Tell me a joke.')}>Tell me a joke.</MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Give me a fun fact.')}>Give me a fun fact.</MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Make a playlist for sleeping.')}>Make a playlist for sleeping.</MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Create a playlist of underrated songs.')}>Create a playlist of underrated songs.</MenuItem>
      </Menu>

      <style>
        {`
          @keyframes shine {
            0% { left: -100px; }
            20% { left: 100%; }
            100% { left: 100%; }
          }
        `}
      </style>
    </div>
  );
};


export default Chatbot;
