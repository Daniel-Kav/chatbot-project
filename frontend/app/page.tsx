"use client";

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format chat history for the API
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send request to backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        message: input,
        chat_history: chatHistory
      });

      // Add assistant response to chat
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.response }
      ]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Next.js + FastAPI + Gemini Chatbot
        </h1>
        
        {/* Chat messages */}
        <div className="bg-white/10 p-4 rounded-lg mb-4 h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              Send a message to start the conversation
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 p-3 rounded-lg ${
                  msg.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-gray-700'
                } max-w-[80%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                <div className="text-sm font-semibold mb-1">
                  {msg.role === 'user' ? 'You' : 'Chatbot'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="bg-gray-700 p-3 rounded-lg max-w-[80%] mr-auto mb-4">
              <div className="text-sm font-semibold mb-1">Chatbot</div>
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}