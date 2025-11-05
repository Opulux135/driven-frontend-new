import React, { useState, useRef, useEffect } from 'react';

const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi! I'm your DRIVEN assistant. I can help you with parking, fuel prices, EV charging, and navigation. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/suggestions`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions.slice(0, 6)); // Show first 6 suggestions
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const sendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        user: msg.type === 'user' ? msg.content : null,
        bot: msg.type === 'bot' ? msg.content : null
      })).filter(turn => turn.user || turn.bot);

      // Get user context (you can enhance this with real user data)
      const userContext = {
        location: 'Current Location', // Could be from geolocation
        last_search: 'parking', // Could be from app state
        preferences: {}
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversation_history: conversationHistory,
          user_context: userContext
        })
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          type: 'bot',
          content: data.response,
          timestamp: new Date(),
          model: data.model,
          responseType: data.type
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'bot',
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay">
      <div className="chatbot-container">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-title">
            <div className="chatbot-avatar">🤖</div>
            <div>
              <h3>DRIVEN Assistant</h3>
              <span className="chatbot-status">Online</span>
            </div>
          </div>
          <button className="chatbot-close" onClick={onClose}>×</button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-content">
                {message.content}
                {message.model && (
                  <div className="message-meta">
                    <small>
                      {message.responseType === 'app_specific' ? 'DRIVEN Assistant' : message.model} • 
                      {formatTime(message.timestamp)}
                    </small>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message bot">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && messages.length <= 1 && (
          <div className="chatbot-suggestions">
            <p>Try asking:</p>
            <div className="suggestion-buttons">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-button"
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about parking, fuel prices, EV charging..."
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .chatbot-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .chatbot-container {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          height: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .chatbot-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .chatbot-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chatbot-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .chatbot-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .chatbot-status {
          font-size: 12px;
          opacity: 0.8;
        }

        .chatbot-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatbot-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .message {
          display: flex;
          max-width: 80%;
        }

        .message.user {
          align-self: flex-end;
        }

        .message.bot {
          align-self: flex-start;
        }

        .message-content {
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          line-height: 1.4;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .message.bot .message-content {
          background: #f1f3f4;
          color: #333;
        }

        .message-meta {
          margin-top: 5px;
          opacity: 0.7;
          font-size: 11px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .chatbot-suggestions {
          padding: 15px 20px;
          border-top: 1px solid #eee;
          background: #f9f9f9;
        }

        .chatbot-suggestions p {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .suggestion-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .suggestion-button {
          background: white;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 8px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-button:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .chatbot-input {
          padding: 20px;
          border-top: 1px solid #eee;
        }

        .input-container {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .input-container textarea {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 12px 16px;
          resize: none;
          font-family: inherit;
          font-size: 14px;
          max-height: 100px;
          min-height: 44px;
        }

        .input-container textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .send-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .chatbot-overlay {
            padding: 0;
          }
          
          .chatbot-container {
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
          
          .chatbot-header {
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;

