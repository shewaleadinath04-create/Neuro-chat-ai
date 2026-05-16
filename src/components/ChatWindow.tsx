import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Send, Sparkles, Loader2, Bot, Plus, Image as ImageIcon, Wand2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Message as MessageType, MessageRole } from '../types';
import Message from './Message';
import { ai, MODELS } from '../lib/gemini';
import { GenerateContentResponse } from '@google/genai';

interface ChatWindowProps {
  chatId: string;
  user: User;
}

export default function ChatWindow({ chatId, user }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now()
      } as MessageType));
      setMessages(messageList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64);
        setSelectedImage(compressed);
        setShowPlusMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedImage) || isTyping) return;

    const messageContent = inputValue.trim();
    const imageToUpload = selectedImage;
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      // 1. Add user message to Firestore
      const userMessage = {
        chatId,
        role: MessageRole.USER,
        content: messageContent,
        image: imageToUpload,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'chats', chatId, 'messages'), userMessage);
      
      // Update chat's lastMessageAt and initial title if it's the first message
      const chatRef = doc(db, 'chats', chatId);
      const updates: any = { lastMessageAt: serverTimestamp() };
      if (messages.length === 0) {
        updates.title = messageContent ? (messageContent.slice(0, 40) + (messageContent.length > 40 ? '...' : '')) : 'Image Chat';
      }
      await updateDoc(chatRef, updates);

      // 2. Call Gemini API
      let botResponseText = "";
      let botResponseImage = null;

      try {
        const generationMatch = messageContent.match(/^(?:\/generate|generate|create|draw|make) (?:an? )?image of (.+)$/i) || 
                               messageContent.match(/^(?:\/generate|generate|create|draw|make) (.+) image$/i);
        const isExplicitGenerate = messageContent.startsWith('/generate');

        if (isExplicitGenerate || generationMatch) {
          const prompt = generationMatch ? generationMatch[1] : messageContent.replace('/generate', '').trim() || "A creative futuristic image";
          const response = await ai.models.generateContent({
            model: MODELS.IMAGE,
            contents: [{
              role: 'user',
              parts: [{ text: prompt }]
            }],
            config: {
              imageConfig: {
                aspectRatio: "1:1"
              }
            }
          });

          if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                const rawBase64 = `data:image/png;base64,${part.inlineData.data}`;
                botResponseImage = await compressImage(rawBase64);
              } else if (part.text) {
                botResponseText += part.text;
              }
            }
          }
          if (!botResponseText && !botResponseImage) botResponseText = `Generated image for: "${prompt}"`;
          else if (!botResponseText) botResponseText = `Generated image for: "${prompt}"`;
        } else if (imageToUpload) {
          // Multimodal prompt
          const imageData = imageToUpload.split(',')[1];
          const response = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: [{
              role: "user",
              parts: [
                { text: messageContent || "Analyze this image" },
                { inlineData: { data: imageData, mimeType: "image/jpeg" } }
              ]
            }]
          });
          botResponseText = response.text || "I'm sorry, I couldn't generate a response.";
        } else {
          const history = messages.map(msg => ({
            role: msg.role === MessageRole.USER ? 'user' : 'model' as any,
            parts: [{ text: msg.content }]
          }));
          
          const response = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: [
              ...history,
              { role: "user", parts: [{ text: messageContent }] }
            ]
          });
          botResponseText = response.text || "I'm sorry, I couldn't generate a response.";
        }
      } catch (geminiError) {
        console.error("Gemini API Error:", geminiError);
        botResponseText = "I'm sorry, there was an error communicating with the AI service. Please verify your API key.";
      }

      // 3. Add AI message to Firestore
      const aiMessage = {
        chatId,
        role: MessageRole.ASSISTANT,
        content: botResponseText,
        image: botResponseImage,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'chats', chatId, 'messages'), aiMessage);
      
    } catch (error) {
      console.error("Chat error:", error);
      // Fallback message
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        chatId,
        role: MessageRole.ASSISTANT,
        content: "Error: Could not connect to AI service. Please check your config.",
        createdAt: serverTimestamp(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 scroll-smooth z-10">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              key="welcome-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-full text-slate-500"
            >
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <Sparkles size={32} className="text-neon-purple animate-pulse" />
              </div>
              <p className="text-lg font-medium">How can NeuroChat help you today?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 max-w-xl w-full">
                {[
                  "Explain quantum computing",
                  "Write a React component for a card",
                  "Suggest some weekend trips from London",
                  "Help me debug this TypeScript code"
                ].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setInputValue(hint)}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all text-left text-sm"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}

          {isTyping && (
            <motion.div
              key="typing-indicator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot size={18} className="text-white" />
              </div>
              <div className="chat-bubble-agent flex items-center gap-3">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-1.5 h-1.5 bg-neon-blue rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-neon-blue rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-neon-blue rounded-full"
                  />
                </div>
                <span className="text-xs font-medium text-slate-400">Thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-6 border-t border-white/5 bg-[#0f172a]/80 backdrop-blur-xl z-20">
        <div className="max-w-4xl mx-auto">
          {/* Image Preview */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4 relative w-32 h-32 rounded-xl overflow-hidden glass p-1 shadow-2xl"
              >
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex items-end gap-3 glass p-2 rounded-2xl shadow-2xl relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                className="p-3 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
              >
                <Plus size={20} className={showPlusMenu ? 'rotate-45 transition-transform' : 'transition-transform'} />
              </button>

              <AnimatePresence>
                {showPlusMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: -110, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="absolute left-0 bottom-full mb-2 w-48 glass rounded-2xl p-2 shadow-2xl overflow-hidden z-30"
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-colors text-slate-300 text-sm"
                    >
                      <ImageIcon size={18} className="text-neon-blue" />
                      Upload Image
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message or use /generate..."
              className="flex-1 bg-transparent border-none outline-none p-3 resize-none max-h-40 min-h-[50px] text-slate-100 placeholder-slate-500"
              rows={1}
            />
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => {
                  if (!inputValue.includes('/generate')) {
                    setInputValue('/generate ' + inputValue);
                  }
                }}
                className="p-3 hover:bg-white/5 rounded-xl text-neon-purple transition-all hover:scale-110"
                title="Generate Image"
              >
                <Wand2 size={20} />
              </button>
              <button
                type="submit"
                disabled={(!inputValue.trim() && !selectedImage) || isTyping}
                className="p-3 bg-gradient-to-br from-neon-purple to-neon-blue rounded-xl text-white shadow-lg hover:shadow-neon-purple/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              </button>
            </div>
          </form>
        </div>
        <p className="text-[10px] text-center text-slate-600 mt-3 uppercase tracking-widest">
          NeuroChat may produce inaccurate information about people, places, or facts.
        </p>
      </div>
    </div>
  );
}
