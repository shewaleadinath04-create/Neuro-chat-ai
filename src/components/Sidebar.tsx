import { motion, AnimatePresence } from 'motion/react';
import { Plus, MessageSquare, Settings as SettingsIcon, LogOut, BrainCircuit, Trash2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { Chat } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onSettings: () => void;
  user: User;
  logout: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  isOpen,
  onSettings,
  user,
  logout
}: SidebarProps) {
  const deleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat?')) return;
    try {
      await deleteDoc(doc(db, 'chats', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'chats');
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
      className="bg-[#0f172a] border-r border-white/5 flex flex-col h-screen overflow-hidden z-20 absolute lg:relative"
    >
      <div className="p-4 flex items-center gap-3 border-b border-white/5">
        <div className="p-2 bg-gradient-to-br from-neon-purple to-neon-blue rounded-lg">
          <BrainCircuit size={24} className="text-white" />
        </div>
        <span className="font-bold text-xl bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
          NeuroChat
        </span>
      </div>

      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl transition-all group"
        >
          <div className="p-1 bg-neon-purple/20 rounded-md group-hover:bg-neon-purple/40">
            <Plus size={18} className="text-neon-purple" />
          </div>
          <span className="font-medium text-slate-300">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">History</p>
        <AnimatePresence initial={false}>
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onClick={() => onChatSelect(chat.id)}
              className={`
                group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border
                ${activeChatId === chat.id 
                  ? 'bg-neon-purple/20 border-neon-purple/30 text-white' 
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={18} className={activeChatId === chat.id ? 'text-neon-purple' : 'text-slate-500'} />
                <span className="truncate text-sm font-medium">{chat.title}</span>
              </div>
              <button
                onClick={(e) => deleteChat(e, chat.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-md transition-all text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-4 px-2">
          <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-lg border border-white/10" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user.displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSettings}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-2 rounded-lg text-slate-400 hover:text-white transition-all text-sm"
          >
            <SettingsIcon size={16} />
            Settings
          </button>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/10 p-2 rounded-lg text-slate-400 hover:text-red-400 transition-all text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
