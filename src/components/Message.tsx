import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User as UserIcon, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Message as MessageType, MessageRole } from '../types';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === MessageRole.USER;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-start gap-4 group ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg
        ${isUser 
          ? 'bg-gradient-to-br from-neon-purple to-neon-blue' 
          : 'bg-white/10 dark:bg-black/40'}
      `}>
        {isUser ? <UserIcon size={18} className="text-white" /> : <Bot size={18} className="text-neon-blue" />}
      </div>

      <div className="relative max-w-[85%] lg:max-w-[75%]">
        <div className={isUser ? 'chat-bubble-user prose prose-invert max-w-none' : 'chat-bubble-agent prose prose-invert overflow-hidden max-w-none'}>
          {message.image && (
            <div className="mb-3 rounded-lg overflow-hidden border border-white/10 shadow-xl max-w-sm">
              <img src={message.image} alt="User uploaded" className="w-full h-auto object-cover" />
            </div>
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const content = String(children).replace(/\n$/, '');
                
                if (!inline && match) {
                  return (
                    <div className="relative group/code my-4">
                      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(content)}
                          className="p-1.5 bg-black/40 hover:bg-black/60 rounded-md text-slate-300 transition-colors"
                          title="Copy code"
                        >
                          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-xl !bg-black/40 !m-0 !p-4 border border-white/5"
                        {...props}
                      >
                        {content}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code className="bg-black/40 px-1.5 py-0.5 rounded text-neon-blue font-mono text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-0 last:mb-0 leading-relaxed text-sm lg:text-base">{children}</p>,
              ul: ({ children }) => <ul className="my-2 list-disc list-inside space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="my-2 list-decimal list-inside space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-sm lg:text-base">{children}</li>,
              h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold mt-4 mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-bold mt-3 mb-1">{children}</h3>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-neon-purple pl-4 italic text-slate-400 my-2">{children}</blockquote>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Global Copy Button */}
        <div className={`absolute top-0 ${isUser ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
          <button
            onClick={() => copyToClipboard(message.content)}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            title="Copy message"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
