import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { aiAssistant, AIMessage } from '../lib/ai';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    // Validate input message
    if (typeof inputMessage !== 'string' || !inputMessage || !inputMessage.trim() || isLoading) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiAssistant.sendMessage(userMessage);
      setMessages(aiAssistant.getMessages());
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-50 ${isOpen ? 'hidden' : 'flex'} items-center justify-center`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6 text-blue-400" />
              <h3 className="text-white font-semibold">AI Business Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-blue-200 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <p>Hi! I'm your AI business assistant.</p>
                <p className="text-sm mt-2">Ask me about revenue optimization, product ideas, or business strategies!</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-white border border-white/20'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && <Bot className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />}
                    {message.role === 'user' && <User className="w-4 h-4 mt-0.5 text-white flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white border border-white/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/20">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your business..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}