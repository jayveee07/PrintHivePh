import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { getGenAIClient } from '../lib/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `You are the AI Assistant for Print Hive PH, a professional printing service.
Your goal is to help users with their printing needs.

Print Hive PH Services include:
- T-Shirt Printing (DTF, Vinyl)
- Tarpaulin (Large format, banners)
- Stickers & Labels (Waterproof, vibrant)
- Flyers & Brochures
- Business Cards
- Acrylic Signage (Laser-cut)
- Invitations (Weddings, Birthdays)
- Custom Merchandise (Mugs, Tote bags, Pillows)

Workflow:
1. Vision Capture: Design submission or artist collaboration.
2. Precision Printing: High-end equipment usage.
3. Ready for Flight: Quality check and packing.

Tone: Professional, helpful, creative, and slightly tech-forward.
Style: Use markdown for formatting. Be concise but informative.

If a user asks for a price, tell them they can request a quote via the Contact page or visit the supplies page for specific product prices.`;

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to the Hive! I am your AI Assistant. How can I help you with your printing projects today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = getGenAIClient();
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      // Format history for the API
      // Note: gemini-3 series model sendMessage expects a slightly different format if using history,
      // but for simple chat we can just send the current message or reconstruct history if needed.
      // Here we just send the new message as a string.
      
      const response = await chat.sendMessage({
        message: userMessage
      });

      const assistantContent = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error communicating with the Hive mind. Please check your connection or try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-[#0B0F19] border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#12A8FF]/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#12A8FF]/20 flex items-center justify-center text-[#12A8FF]">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Hive AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Node</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500"
                >
                  <Minimize2 size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-[#12A8FF]/10 text-[#12A8FF]' : 'bg-white/5 text-white'
                    }`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#12A8FF] text-white shadow-[0_4px_15px_rgba(18,168,255,0.3)]' 
                        : 'bg-white/5 text-gray-300'
                    }`}>
                      <div className="markdown-body">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 text-white flex items-center justify-center">
                      <Bot size={14} />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 text-gray-500 italic text-xs flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Hive mind thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the Hive mind..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#12A8FF]/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#12A8FF] text-white flex items-center justify-center hover:shadow-[0_0_15px_rgba(18,168,255,0.4)] transition-all disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-end gap-4">
        {isOpen && isMinimized && (
           <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setIsMinimized(false)}
            className="px-6 py-3 rounded-full bg-[#0B0F19] border border-[#12A8FF]/30 text-white shadow-2xl flex items-center gap-3 hover:border-[#12A8FF] transition-all group"
           >
             <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Hive AI Active</span>
             </div>
             <Maximize2 size={14} className="text-[#12A8FF]" />
           </motion.button>
        )}
        
        <button
          onClick={() => {
            if (!isOpen) setIsOpen(true);
            setIsMinimized(false);
          }}
          className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 ${
            isOpen && !isMinimized 
              ? 'bg-white text-black rotate-90 scale-0 opacity-0 pointer-events-none' 
              : 'bg-[#12A8FF] text-white'
          }`}
        >
          <MessageSquare size={28} />
          {/* Badge */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF1493] rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black">
              1
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
