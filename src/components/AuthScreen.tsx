import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  ChevronLeft,
  Github
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signUpWithEmail, 
  loginWithEmail, 
  resetPassword 
} from '../lib/firebase';

enum AuthView {
  SPLASH = 'splash',
  WELCOME = 'welcome',
  LOGIN = 'login',
  SIGNUP = 'signup',
  FORGOT_PASSWORD = 'forgot-password'
}

export default function AuthScreen() {
  const [view, setView] = useState<AuthView>(AuthView.SPLASH);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');
  
  const fullText = "Hello, how can I help you today?";
  
  // Splash screen fake typing effect
  useEffect(() => {
    if (view === AuthView.SPLASH) {
      let i = 0;
      const interval = setInterval(() => {
        setTypingText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) {
          clearInterval(interval);
          setTimeout(() => setView(AuthView.WELCOME), 2000);
        }
      }, 70);
      return () => clearInterval(interval);
    }
  }, [view]);

  const handleAuthError = (err: any) => {
    console.error(err);
    if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
      setLoading(false);
      return;
    }
    if (err.code === 'auth/user-not-found') setError('User not found.');
    else if (err.code === 'auth/wrong-password') setError('Incorrect password.');
    else if (err.code === 'auth/email-already-in-use') setError('Email already in use.');
    else if (err.code === 'auth/weak-password') setError('Password should be at least 6 characters.');
    else setError(err.message || 'An error occurred. Please try again.');
    setLoading(false);
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password, name);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setError('Password reset email sent!');
      setLoading(false);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const onGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const BackgroundParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-20"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            scale: Math.random() * 2
          }}
          animate={{ 
            y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{ 
            duration: 10 + Math.random() * 20, 
            repeat: Infinity,
            ease: "linear" 
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <BackgroundParticles />
      
      {/* Soft Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7B61FF]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4DA8FF]/10 blur-[120px] rounded-full" />

      <AnimatePresence mode="wait">
        {view === AuthView.SPLASH && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center z-10"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                filter: ["drop-shadow(0 0 0px #7B61FF)", "drop-shadow(0 0 20px #7B61FF)", "drop-shadow(0 0 0px #7B61FF)"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-6 bg-gradient-to-br from-[#7B61FF] to-[#4DA8FF] rounded-[2.5rem] shadow-2xl mb-8"
            >
              <BrainCircuit size={80} className="text-white" />
            </motion.div>
            
            <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
              Neuro Chat AI
            </h1>
            
            <p className="text-[#4DA8FF] font-medium tracking-[0.2em] uppercase text-sm mb-12">
              Your Personal AI Assistant
            </p>

            <div className="flex flex-col items-center gap-6">
              <div className="min-h-[1.5rem] font-mono text-slate-400">
                {typingText}<span className="animate-pulse">|</span>
              </div>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 200 }}
                className="h-[2px] bg-white/10 relative overflow-hidden"
              >
                <motion.div 
                  animate={{ x: [-200, 200] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute h-full w-[100px] bg-gradient-to-r from-transparent via-[#7B61FF] to-transparent"
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {view === AuthView.WELCOME && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-md flex flex-col items-center z-10"
          >
            <div className="relative mb-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] border border-white/5 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-40px] border border-white/5 rounded-full"
              />
              <div className="relative p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl">
                <BrainCircuit size={64} className="text-[#7B61FF]" />
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4 text-center">Welcome to Neuro AI</h2>
            <p className="text-slate-400 text-center mb-12 max-w-[280px]">
              Unlock the power of next-gen artificial intelligence and seamless collaboration.
            </p>

            <div className="w-full space-y-4">
              <button
                onClick={onGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 px-6 rounded-2xl hover:bg-slate-200 transition-all hover:scale-[1.02] shadow-xl group"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
              
              <button
                onClick={() => setView(AuthView.LOGIN)}
                className="w-full flex items-center justify-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-bold py-4 px-6 rounded-2xl hover:bg-white/10 transition-all hover:scale-[1.02]"
              >
                <Mail size={20} className="text-[#4DA8FF]" />
                Continue with Email
              </button>

              <button
                onClick={() => setView(AuthView.SIGNUP)}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#7B61FF] to-[#4DA8FF] text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:opacity-90 transition-all hover:scale-[1.02]"
              >
                Sign Up Now
                <ArrowRight size={20} />
              </button>
            </div>

            <p className="mt-8 text-slate-500 font-medium">
              Already have an account?{" "}
              <button onClick={() => setView(AuthView.LOGIN)} className="text-[#7B61FF] hover:underline">
                Login
              </button>
            </p>
          </motion.div>
        )}

        {(view === AuthView.LOGIN || view === AuthView.SIGNUP || view === AuthView.FORGOT_PASSWORD) && (
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md z-10"
          >
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setView(AuthView.WELCOME)}
                className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex flex-col items-center mb-8">
                <div className="p-3 bg-white/5 rounded-2xl mb-4 border border-white/10">
                  <BrainCircuit size={32} className="text-[#7B61FF]" />
                </div>
                <h3 className="text-2xl font-bold">
                  {view === AuthView.LOGIN ? 'Welcome Back' : 
                   view === AuthView.SIGNUP ? 'Create Account' : 
                   'Reset Password'}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  {view === AuthView.LOGIN ? 'Sign in to continue to Neuro AI' : 
                   view === AuthView.SIGNUP ? 'Join the futuristic AI revolution today' : 
                   'Enter your email to reset password'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={view === AuthView.LOGIN ? onLogin : view === AuthView.SIGNUP ? onSignUp : onResetPassword} className="space-y-4">
                {view === AuthView.SIGNUP && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#7B61FF]/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#7B61FF]/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {view !== AuthView.FORGOT_PASSWORD && (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Password</label>
                        {view === AuthView.LOGIN && (
                          <button 
                            type="button" 
                            onClick={() => setView(AuthView.FORGOT_PASSWORD)}
                            className="text-[10px] text-[#7B61FF] font-bold hover:underline"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-[#7B61FF]/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {view === AuthView.SIGNUP && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#7B61FF]/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#7B61FF] to-[#4DA8FF] text-white font-bold py-4 rounded-2xl shadow-xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      {view === AuthView.LOGIN ? 'Login Account' : 
                       view === AuthView.SIGNUP ? 'Create Free Account' : 
                       'Send Reset Link'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-[1px] bg-white/10 flex-1" />
                  <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Or Continue with</span>
                  <div className="h-[1px] bg-white/10 flex-1" />
                </div>

                <div className="flex gap-4 w-full">
                  <button onClick={onGoogleSignIn} className="flex-1 flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  </button>
                  <button className="flex-1 flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                    <Github size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                  </button>
                </div>

                <p className="text-sm text-slate-400 mt-4">
                  {view === AuthView.LOGIN ? "Don't have an account?" : "Already have an account?"}
                  {" "}
                  <button 
                    onClick={() => setView(view === AuthView.LOGIN ? AuthView.SIGNUP : AuthView.LOGIN)}
                    className="text-[#7B61FF] font-bold hover:underline ml-1"
                  >
                    {view === AuthView.LOGIN ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>

              {view === AuthView.SIGNUP && (
                <p className="mt-8 text-[10px] text-center text-slate-600 uppercase tracking-[0.1em] leading-relaxed">
                  By creating an account, you agree to our<br/>
                  <span className="text-slate-500 font-bold hover:text-slate-400 cursor-pointer">Terms of Service</span> and <span className="text-slate-500 font-bold hover:text-slate-400 cursor-pointer">Privacy Policy</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
