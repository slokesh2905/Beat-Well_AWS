import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  link?: string;
}

const initialBotResponses = {
  greeting: "Hello! I'm your Beat-Well assistant. How can I help you today?",
  about: {
    text: "Beat-Well is a heart health monitoring platform that uses AI to predict heart disease risk and provide preventive care recommendations.",
    link: "/about"
  },
  features: {
    text: "Our platform offers several features:\n- Heart disease risk prediction\n- Personalized remedies and diet plans\n- Exercise recommendations\n- Doctor consultation services\n- Heart health information",
    link: null
  },
  prediction: {
    text: "The prediction tool analyzes your health parameters to assess your risk of heart disease. You'll need to provide information like age, blood pressure, cholesterol levels, etc.",
    link: "/prediction"
  },
  remedies: {
    text: "Our remedies section provides personalized diet plans, lifestyle changes, and prevention tips based on your health profile.",
    link: "/remedies"
  },
  exercise: {
    text: "The exercise section offers heart-healthy workout routines and physical activity recommendations tailored to your fitness level.",
    link: "/exercise"
  },
  doctors: {
    text: "We help you find qualified cardiologists in your area through our trusted partner network.",
    link: "/consultation"
  },
  default: {
    text: "I'm not sure about that. Could you please rephrase your question? You can ask about:\n- What Beat-Well is\n- Our features\n- How the prediction tool works\n- Remedies and diet plans\n- Exercise recommendations\n- Finding doctors",
    link: null
  }
};

export default function ChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(input.toLowerCase());
      const botMessage: Message = {
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        link: botResponse.link
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (userInput: string): { text: string; link: string | null } => {
    if (userInput.includes('hello') || userInput.includes('hi')) {
      return { text: initialBotResponses.greeting, link: null };
    } else if (userInput.includes('what') && userInput.includes('beat-well')) {
      return initialBotResponses.about;
    } else if (userInput.includes('feature') || userInput.includes('offer')) {
      return initialBotResponses.features;
    } else if (userInput.includes('predict') || userInput.includes('risk')) {
      return initialBotResponses.prediction;
    } else if (userInput.includes('remedy') || userInput.includes('diet')) {
      return initialBotResponses.remedies;
    } else if (userInput.includes('exercise') || userInput.includes('workout')) {
      return initialBotResponses.exercise;
    } else if (userInput.includes('doctor') || userInput.includes('consult')) {
      return initialBotResponses.doctors;
    } else {
      return initialBotResponses.default;
    }
  };

  const handleNavigation = (link: string) => {
    setIsOpen(false);
    navigate(link);
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            <div className="bg-red-500 p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6" />
                <span className="font-semibold">Beat-Well Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>How can I help you today?</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-line">{message.text}</p>
                      {message.link && (
                        <button
                          onClick={() => handleNavigation(message.link!)}
                          className="mt-2 flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <span>Go to page</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 