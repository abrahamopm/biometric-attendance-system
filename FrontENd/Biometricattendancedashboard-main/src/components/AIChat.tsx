import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const suggestedQuestions = [
  "How do I enroll my face?",
  "What is the attendance threshold?",
  "How to export reports?",
  "Privacy policy information"
];

const aiResponses: { [key: string]: string } = {
  "face": "To enroll your face, navigate to the Face Enrollment section in your dashboard. Click 'Start Enrollment' and follow the 3-step process. Ensure good lighting and look directly at the camera for best results.",
  "threshold": "The attendance system uses a 15-minute late threshold. Students who check in within 15 minutes of the session start time are marked as 'On Time', while those checking in after 15 minutes are marked as 'Late'.",
  "report": "To export attendance reports, go to the Reports section and click the 'Download CSV' or 'Download PDF' button. You can filter reports by date range and subject.",
  "privacy": "Your biometric data is encrypted using AES-256 encryption and stored securely. We comply with GDPR and you can request data deletion at any time from your Privacy Settings.",
  "default": "I'm here to help! You can ask me about face enrollment, attendance tracking, reports, privacy settings, or any other feature of the system."
};

export function AIChat() {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(aiResponses)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return aiResponses.default;
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(text),
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80' : 'w-96'
    }`}>
      <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">AI Assistant</h3>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-white" />}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-[420px] overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'ai'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-800'
                      : 'bg-gradient-to-br from-emerald-600 to-teal-700'
                  }`}>
                    {message.sender === 'ai' ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className={`flex-1 max-w-[75%] ${message.sender === 'user' ? 'items-end' : ''}`}>
                    <div className={`rounded-2xl p-3 ${
                      message.sender === 'ai'
                        ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                    }`}>
                      <p className={`text-sm leading-relaxed ${
                        message.sender === 'ai' ? 'text-slate-900 dark:text-white' : 'text-white'
                      }`}>
                        {message.text}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-3">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.slice(0, 2).map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(question)}
                      className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}