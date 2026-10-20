import React, { useState } from 'react';
import { X, Trophy, Award, Flame, CheckCircle, ShieldCheck, Clock, User, Edit3 } from 'lucide-react';
import { UserProfile, VerdictData } from '../types/court';
import { storageService } from '../services/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [isEditing, setIsEditing] = useState(false);
  const matchHistory = storageService.getMatchHistory();

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (!displayName.trim()) return;
    const updated = { ...profile, displayName: displayName.trim() };
    storageService.saveProfile(updated);
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const winRate = profile.completedTrials > 0
    ? Math.round((profile.wins / profile.completedTrials) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-court-card border border-court-gold/30 rounded-2xl shadow-gold-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-court-border bg-court-panel">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-court-gold" />
            <h3 className="font-cinzel text-lg font-bold text-white">Advocate Profile & Record</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* User Bio Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-court-surface border border-court-border">
            <img 
              src={profile.avatar} 
              alt={profile.displayName} 
              className="w-16 h-16 rounded-full object-cover border-2 border-court-gold"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="px-2 py-1 text-sm bg-court-dark border border-court-gold rounded text-white"
                    />
                    <button onClick={handleSaveName} className="text-xs text-court-gold font-bold">Save</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-white">{profile.displayName}</h2>
                    <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-white">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-court-gold/20 text-court-gold border border-court-gold/40">
                  {profile.rank}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Level {profile.level} • {profile.isGuest ? 'Guest Practice Account' : 'Verified Bar Advocate'}
              </p>

              {/* XP Progress Bar */}
              <div className="w-full">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                  <span>XP: {profile.xp % 300} / 300</span>
                  <span>Next Level: {300 - (profile.xp % 300)} XP</span>
                </div>
                <div className="w-full h-2 rounded-full bg-court-darker overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-court-gold to-amber-300 rounded-full" 
                    style={{ width: `${((profile.xp % 300) / 300) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-court-surface border border-court-border text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Elo Rating</span>
              <span className="font-mono text-xl font-bold text-court-gold">{profile.eloRating}</span>
            </div>
            <div className="p-3 rounded-xl bg-court-surface border border-court-border text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Trials Won</span>
              <span className="font-mono text-xl font-bold text-emerald-400">{profile.wins}</span>
            </div>
            <div className="p-3 rounded-xl bg-court-surface border border-court-border text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Win Rate</span>
              <span className="font-mono text-xl font-bold text-sky-400">{winRate}%</span>
            </div>
            <div className="p-3 rounded-xl bg-court-surface border border-court-border text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Total Trials</span>
              <span className="font-mono text-xl font-bold text-slate-200">{profile.completedTrials}</span>
            </div>
          </div>

          {/* Earned Badges Shelf */}
          <div>
            <h4 className="font-cinzel text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-court-gold" /> Earned Badges ({profile.badges.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-court-surface border border-court-gold/30 text-xs text-court-gold font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Match History */}
          <div>
            <h4 className="font-cinzel text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-court-gold" /> Recent Trial History
            </h4>
            {matchHistory.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 rounded-xl bg-court-surface text-center">
                No completed trials recorded yet. Enter a case to start your official court record!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {matchHistory.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-court-surface border border-court-border text-xs">
                    <div>
                      <span className="font-semibold text-white block">{m.caseTitle}</span>
                      <span className="text-[10px] text-slate-400">
                        Confidence: {m.confidence}% • Winner: {m.winner.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-court-gold font-bold">
                      {m.scores.prosecution.total} - {m.scores.defense.total}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
