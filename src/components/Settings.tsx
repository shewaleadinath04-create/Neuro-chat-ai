import { motion } from 'motion/react';
import { User, Shield, Zap, Globe, Github } from 'lucide-react';

export default function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8"
    >
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <User className="text-neon-purple" />
          Account Preferences
        </h2>
        <div className="grid gap-4">
          <div className="glass p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-medium">Interface Language</p>
              <p className="text-sm text-slate-500">Choose your preferred language</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none">
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <div className="glass p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-medium">Data Privacy</p>
              <p className="text-sm text-slate-500">Manage how your data is used</p>
            </div>
            <button className="bg-neon-purple/20 text-neon-purple px-4 py-2 rounded-lg text-sm font-medium hover:bg-neon-purple/30 transition-colors">
              Manage
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap className="text-neon-blue" />
          AI Configuration
        </h2>
        <div className="glass p-6 rounded-2xl space-y-6">
          <div>
            <p className="font-medium mb-1">Model Selection</p>
            <p className="text-sm text-slate-500 mb-4">Select the brain powering your conversations</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 border border-neon-blue bg-neon-blue/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold">Gemini 3 Flash</p>
                  <span className="text-[10px] bg-neon-blue px-2 py-0.5 rounded-full text-white font-bold">DEFAULT</span>
                </div>
                <p className="text-xs text-slate-400">Fast, efficient, and great for daily tasks.</p>
              </div>
              <div className="p-4 border border-white/10 bg-white/5 rounded-xl opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-slate-400">Gemini 3.1 Pro</p>
                  <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-white font-bold">LOCKED</span>
                </div>
                <p className="text-xs text-slate-500">Advanced reasoning and coding capabilities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-8 border-t border-white/5">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-blue rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <Zap size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold">NeuroChat v1.0.0</h3>
          <p className="text-sm text-slate-500 mt-2">Experimental AI Interface powered by Google Gemini</p>
          <div className="flex gap-4 mt-6">
            <a href="#" className="p-2 glass rounded-full hover:bg-white/10 transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="p-2 glass rounded-full hover:bg-white/10 transition-colors">
              <Globe size={20} />
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
