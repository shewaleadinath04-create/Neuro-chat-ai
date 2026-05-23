import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  ChevronLeft
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signUpWithEmail, 
  loginWithEmail, 
  resetPassword 
} from '../lib/firebase';

enum AuthView {
  WELCOME = 'welcome',
  LOGIN = 'login',
  SIGNUP = 'signup',
  FORGOT_PASSWORD = 'forgot-password'
}

export default function AuthScreen() {
  const [view, setView] = useState<AuthView>(AuthView.WELCOME);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-[100dvh] bg-[#F4F4EC] flex flex-col items-center relative overflow-hidden font-sans selection:bg-[#0047FF]/20 selection:text-[#0047FF]">
      
      {/* Top half with floating logo */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-0">
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Subtle glow behind logo */}
          <div className="absolute inset-0 bg-[#0047FF]/20 blur-[40px] rounded-full scale-150" />
          
          <div className="w-20 h-20 bg-[#0A0A0A] rounded-[1.5rem] flex items-center justify-center shadow-2xl relative z-10 border border-white/10 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0047FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <BrainCircuit size={36} className="text-white/90" strokeWidth={1.5} />
          </div>
        </motion.div>
      </div>

      {/* Bottom Sheet Container */}
      <div className="w-full sm:max-w-md flex flex-col justify-end z-10">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 200 }}
          className="w-full bg-[#0A0A0A] rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] relative"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-0 left-8 right-8 -mt-6 p-3 bg-red-500/90 text-white rounded-xl shadow-lg text-sm text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {view === AuthView.WELCOME ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col w-full"
              >
                <div className="mb-8 mt-2">
                  <h2 className="text-[26px] font-bold text-white tracking-tight mb-2">Welcome</h2>
                  <p className="text-white/50 text-[15px]">Experience the future of personal assistance.</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={onGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white text-black rounded-full py-2.5 px-3 flex items-center justify-between hover:bg-gray-100 transition-transform active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                        {loading ? <Loader2 className="animate-spin text-gray-400" size={18} /> : <img src="https://www.google.com/favicon.ico" alt="Google" className="w-[18px] h-[18px]" />}
                      </div>
                      <span className="font-semibold text-[15px] tracking-tight">Continue with Google</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-gray-100 transition-colors">
                      <UserIcon size={16} className="text-gray-400" />
                    </div>
                  </button>

                  <div className="flex items-center gap-4 my-6">
                    <div className="h-[1px] flex-1 bg-white/10" />
                    <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-semibold">Or</span>
                    <div className="h-[1px] flex-1 bg-white/10" />
                  </div>

                  <button
                    onClick={() => setView(AuthView.LOGIN)}
                    className="w-full bg-[#1A1A1A] border border-white/5 text-white/90 rounded-full py-4 text-[15px] font-semibold hover:bg-white/5 transition-transform active:scale-[0.98]"
                  >
                    Log in or sign up
                  </button>
                </div>

                <p className="mt-8 text-[11px] text-center text-white/40 leading-relaxed font-medium">
                  By continuing, you agree to our<br />
                  <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col w-full"
              >
                <div className="flex items-center mb-8 mt-2">
                  <button 
                    onClick={() => setView(AuthView.WELCOME)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors mr-4"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {view === AuthView.LOGIN ? 'Log in' : 
                       view === AuthView.SIGNUP ? 'Create account' : 
                       'Reset password'}
                    </h2>
                  </div>
                </div>

                <form onSubmit={view === AuthView.LOGIN ? onLogin : view === AuthView.SIGNUP ? onSignUp : onResetPassword} className="space-y-3">
                  {view === AuthView.SIGNUP && (
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 pl-11 pr-4 outline-none border border-transparent focus:border-[#0047FF]/50 focus:bg-[#222] transition-colors placeholder:text-white/30 text-[15px]"
                      />
                    </div>
                  )}
                  
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 pl-11 pr-4 outline-none border border-transparent focus:border-[#0047FF]/50 focus:bg-[#222] transition-colors placeholder:text-white/30 text-[15px]"
                    />
                  </div>

                  {view !== AuthView.FORGOT_PASSWORD && (
                    <>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 pl-11 pr-11 outline-none border border-transparent focus:border-[#0047FF]/50 focus:bg-[#222] transition-colors placeholder:text-white/30 text-[15px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {view === AuthView.SIGNUP && (
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 pl-11 pr-11 outline-none border border-transparent focus:border-[#0047FF]/50 focus:bg-[#222] transition-colors placeholder:text-white/30 text-[15px]"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {view === AuthView.LOGIN && (
                    <div className="flex justify-end pt-1">
                      <button 
                        type="button" 
                        onClick={() => setView(AuthView.FORGOT_PASSWORD)}
                        className="text-[12px] text-white/50 hover:text-white transition-colors font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-semibold py-4 rounded-2xl shadow-lg hover:bg-gray-100 disabled:opacity-50 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2 text-[15px]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        {view === AuthView.LOGIN ? 'Log in' : 
                         view === AuthView.SIGNUP ? 'Create account' : 
                         'Send reset link'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-[13px] text-white/40">
                    {view === AuthView.LOGIN ? "Don't have an account?" : "Already have an account?"}
                    {" "}
                    <button 
                      onClick={() => setView(view === AuthView.LOGIN ? AuthView.SIGNUP : AuthView.LOGIN)}
                      className="text-white font-semibold hover:underline"
                    >
                      {view === AuthView.LOGIN ? 'Sign up' : 'Log in'}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

