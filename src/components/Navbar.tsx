import React from 'react';
import { 
  Scale, 
  Volume2, 
  VolumeX, 
  Settings, 
  User, 
  Flame, 
  PlusCircle, 
  Users, 
  Trophy, 
  BookOpen
} from 'lucide-react';
import { UserProfile } from '../types/court';
import { soundService } from '../services/sound';

interface NavbarProps {
  profile: UserProfile;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onQuickStart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  currentView,
  onNavigate,
  onOpenProfile,
  onOpenSettings,
  onOpenAuth,
  onQuickStart,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundService.getMuted());

  const handleToggleSound = () => {
    const nextMuted = soundService.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundService.playTick();
    }
  };

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'Grandmaster': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'Senior Counsel': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'Litigator': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'Advocate': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-court-darker/90 backdrop-blur-md border-b border-court-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-court-gold/20 via-court-gold/10 to-transparent border border-court-gold/40 shadow-gold-sm group-hover:scale-105 transition-transform duration-200">
              <Scale className="w-5 h-5 text-court-gold transition-colors" />
              <div className="absolute inset-0 rounded-lg bg-court-gold/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-xl font-bold tracking-wider text-white">
                  AI <span className="text-court-gold">COURT</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-court-gold/15 text-court-gold border border-court-gold/30">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans tracking-tight hidden sm:block">
                Present Your Proof. Challenge the Truth.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => onNavigate('cases')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentView === 'cases' 
                  ? 'bg-court-surface text-court-gold border border-court-gold/30 shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-court-panel/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-court-gold/80" />
              Case Library
            </button>

            <button
              onClick={() => onNavigate('lobby')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentView === 'lobby' 
                  ? 'bg-court-surface text-court-gold border border-court-gold/30 shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-court-panel/60'
              }`}
            >
              <Users className="w-4 h-4 text-court-defense/80" />
              Multiplayer Lobbies
            </button>

            <button
              onClick={() => onNavigate('leaderboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentView === 'leaderboard' 
                  ? 'bg-court-surface text-court-gold border border-court-gold/30 shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-court-panel/60'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Leaderboards
            </button>
          </nav>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Start Button */}
            <button
              onClick={onQuickStart}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-court-gold to-court-gold-dark text-black hover:opacity-90 shadow-gold-sm transition-all active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-black" />
              Quick Trial
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? 'Unmute Audio' : 'Mute Courtroom Audio'}
              className="p-2 rounded-lg bg-court-surface/80 border border-court-border text-slate-300 hover:text-white hover:border-court-gold/40 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-court-gold" />}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              title="Courtroom Settings & AI Config"
              className="p-2 rounded-lg bg-court-surface/80 border border-court-border text-slate-300 hover:text-white hover:border-court-gold/40 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile Pill */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-court-surface/90 border border-court-border hover:border-court-gold/40 transition-all text-left"
            >
              <div className="relative">
                <img 
                  src={profile.avatar} 
                  alt={profile.displayName} 
                  className="w-7 h-7 rounded-full object-cover border border-court-gold/40"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-court-dark" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white max-w-[90px] truncate">
                    {profile.displayName}
                  </span>
                  <span className={`text-[9px] px-1 py-0.2 rounded border font-mono ${getRankBadgeColor(profile.rank)}`}>
                    {profile.rank}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Lv.{profile.level}</span>
                  <span className="text-court-gold font-mono">{profile.eloRating} ELO</span>
                </div>
              </div>
            </button>

            {profile.isGuest && (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex text-xs text-court-gold/90 hover:text-court-gold underline underline-offset-4 ml-1"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
