import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, MessageSquare, Plus, Settings as SettingsIcon, LogOut, Moon, Sun, Menu, X, BrainCircuit } from 'lucide-react';
import { auth, db, signInWithGoogle, handleFirestoreError, OperationType } from './lib/firebase';
import { Chat, Message as MessageType, MessageRole, Theme } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Settings from './components/Settings';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // Sync user profile
        const userDoc = doc(db, 'users', user.uid);
        await setDoc(userDoc, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }

    const chatsQuery = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(chatList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
    });

    return () => unsubscribe();
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const createNewChat = async () => {
    if (!user) return;
    try {
      const newChat = {
        title: 'New Conversation',
        userId: user.uid,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'chats'), newChat);
      setActiveChatId(docRef.id);
      setShowSettings(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'chats');
    }
  };

  const logout = () => {
    auth.signOut();
    setActiveChatId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-neon-purple"
        >
          <BrainCircuit size={48} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/20 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-3xl max-w-md w-full text-center z-10"
        >
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-gradient-to-br from-neon-purple to-neon-blue rounded-2xl shadow-xl">
              <BrainCircuit size={48} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            NeuroChat
          </h1>
          <p className="text-slate-400 mb-8">
            Experience the next generation of artificial intelligence with a sleek, futuristic interface.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex text-slate-100 font-sans", theme === Theme.DARK ? "bg-[#0f172a] dark" : "bg-slate-50 text-slate-900")}>
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-lg"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onChatSelect={(id) => {
          setActiveChatId(id);
          setShowSettings(false);
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }}
        onNewChat={createNewChat}
        isOpen={isSidebarOpen}
        onSettings={() => setShowSettings(true)}
        user={user}
        logout={logout}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 glass border-b border-white/5 z-10">
          <div className="flex items-center gap-2">
            <span className="lg:hidden font-bold text-xl ml-8">NeuroChat</span>
            <span className="hidden lg:block font-medium text-slate-400">
              {showSettings ? 'Settings' : (activeChatId ? chats.find(c => c.id === activeChatId)?.title : 'Select a chat')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              {theme === Theme.DARK ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {showSettings ? (
              <Settings key="settings" />
            ) : activeChatId ? (
              <ChatWindow key={activeChatId} chatId={activeChatId} user={user} />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-8 text-center"
              >
                <BrainCircuit size={64} className="text-neon-purple/20 mb-6" />
                <h2 className="text-2xl font-bold mb-2">Welcome to NeuroChat</h2>
                <p className="text-slate-400 max-w-sm">
                  Start a new conversation or select an existing one from the sidebar.
                </p>
                <button
                  onClick={createNewChat}
                  className="mt-8 flex items-center gap-2 bg-gradient-to-r from-neon-purple to-neon-blue px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                >
                  <Plus size={20} />
                  New Chat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
