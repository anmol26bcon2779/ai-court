import React, { useState } from 'react';
import { X, Scale, Mail, Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService, isSupabaseConfigured } from '../services/supabase';
import { soundService } from '../services/sound';
import { UserProfile } from '../types/court';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: Partial<UserProfile>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const hasSupabase = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!hasSupabase) {
      // Local fallback account
      soundService.playTick();
      onAuthSuccess({
        displayName: displayName || (email.split('@')[0] || 'Counselor Phoenix'),
        email,
        isGuest: false,
      });
      onClose();
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await authService.signUp(email, password, displayName);
        if (error) throw error;
        soundService.playTick();
        onAuthSuccess({
          id: data.user?.id,
          displayName: displayName || email.split('@')[0],
          email,
          isGuest: false,
        });
        onClose();
      } else {
        const { data, error } = await authService.signIn(email, password);
        if (error) throw error;
        soundService.playTick();
        onAuthSuccess({
          id: data.user?.id,
          displayName: data.user?.user_metadata?.display_name || email.split('@')[0],
          email,
          isGuest: false,
        });
        onClose();
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    soundService.playTick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded-2xl bg-court-card border border-court-gold/30 shadow-gold-lg">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-court-gold" />
            <h3 className="font-cinzel text-lg font-bold text-white">
              {isSignUp ? 'Register Bar Account' : 'Advocate Sign In'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase backend status */}
        <div className={`p-2.5 rounded-lg mb-4 text-[11px] flex items-center gap-2 ${
          hasSupabase 
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
        }`}>
          {hasSupabase ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Connected to live Supabase Auth & PostgreSQL database.</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Local Demo Mode active. Accounts and trials persist in your browser localStorage.</span>
            </>
          )}
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs mb-3">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Advocate Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Counselor Wright"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="advocate@court.law"
                className="w-full pl-9 pr-3 py-2 text-xs bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-cinzel font-bold text-xs tracking-wider bg-court-gold hover:bg-amber-400 text-black shadow-gold-sm transition-all"
          >
            {loading ? 'AUTHENTICATING...' : (isSignUp ? 'REGISTER ACCOUNT' : 'ENTER COURTROOM')}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-court-border flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-court-gold hover:underline"
          >
            {isSignUp ? 'Already registered? Sign In' : "Don't have an account? Sign Up"}
          </button>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="text-slate-400 hover:text-white"
          >
            Continue as Guest →
          </button>
        </div>

      </div>
    </div>
  );
};
