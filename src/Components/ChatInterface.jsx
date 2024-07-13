import React, { useState, useRef, useEffect } from 'react';
import { FaPlane, FaPaperPlane, FaVolumeUp, FaWifi, FaSpinner } from 'react-icons/fa';
import { initializeChat, sendMessage } from './GeminiService';

const formatResponse = (text) => {
  const sections = text.split('**').filter(s => s.trim());
  let formattedText = '';
  
  sections.forEach((section, index) => {
    if (index === 0) {
      formattedText += `<h3 class="text-xl font-semibold mb-2">${section.trim()}</h3>`;
    } else if (section.includes(':')) {
      const [header, content] = section.split(':');
      formattedText += `<h3 class="text-lg font-semibold mt-3 mb-1">${header.trim()}:</h3>`;
      formattedText += `<p class="mb-2">${content.trim().replace(/\*/g, '')}</p>`;
    } else {
      formattedText += `<p class="mb-2">${section.trim().replace(/\*/g, '')}</p>`;
    }
  });

  return formattedText;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChat();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() && !isLoading && isOnline) {
      const userMessage = { 
        text: input, 
        user: true, 
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        status: 'sent'
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsLoading(true);
      
      try {
        const aiResponse = await sendMessage(input);
        const formattedResponse = formatResponse(aiResponse);
        const botMessage = {
          text: formattedResponse,
          user: false,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isFormatted: true
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        console.error("Error getting AI response:", error);
        const errorMessage = {
          text: "Sorry, I encountered an error. Please try again.",
          user: false,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isError: true
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="flex flex-col h-screen w-full md:h-[600px] md:w-[768px] lg:w-[1024px] bg-white shadow-xl rounded-lg overflow-hidden">
        {!isOnline && (
          <div className="bg-red-500 text-white p-2 text-center">
            <FaWifi className="inline mr-2" />
            You are offline
          </div>
        )}
        <div className="bg-blue-600 p-4 flex items-center">
          <FaPlane className="text-white mr-2" />
          <h1 className="text-xl font-semibold text-white">Travel and Tourism Guide</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <MessageItem key={index} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start items-center">
              <FaSpinner className="animate-spin  text-blue-500 text-2xl" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="bg-gray-50 border-t p-4">
          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent outline-none"
              placeholder="Type a message..."
              disabled={isLoading || !isOnline}
            />
            <button 
              onClick={handleSend} 
              className={`ml-2 text-blue-600 ${(isLoading || !isOnline) ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-800'}`}
              disabled={isLoading || !isOnline}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageItem = ({ message }) => (
  <div className={`flex ${message.user ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[70%] px-4 py-2 rounded-lg ${
      message.user ? 'bg-blue-100' : message.isError ? 'bg-red-100' : 'bg-gray-100'
    } relative`}>
      {message.isFormatted ? (
        <div dangerouslySetInnerHTML={{ __html: message.text }} />
      ) : (
        <p className="text-sm">{message.text}</p>
      )}
      <div className="text-xs text-gray-500 mt-1 flex justify-between">
        <span>{message.timestamp}</span>
        {message.user && <span>{message.status}</span>}
      </div>
      {!message.user && !message.isError && (
        <button className="absolute bottom-2 right-2 text-gray-500 hover:text-blue-600">
          <FaVolumeUp />
        </button>
      )}
    </div>
  </div>
);

export default ChatInterface;