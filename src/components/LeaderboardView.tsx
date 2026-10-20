import React, { useState } from 'react';
import { Trophy, Award, Flame, ArrowLeft, ShieldCheck, Scale, Star } from 'lucide-react';
import { UserProfile, UserRank } from '../types/court';

interface LeaderboardViewProps {
  currentUser: UserProfile;
  onBack: () => void;
  onQuickTrial: () => void;
}

interface LeaderboardEntry {
  rankPosition: number;
  id: string;
  name: string;
  avatar: string;
  rankTitle: UserRank;
  eloRating: number;
  wins: number;
  losses: number;
  completedTrials: number;
  keyBadge: string;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rankPosition: 1, id: 'u-1', name: 'Aria Sterling', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', rankTitle: 'Grandmaster', eloRating: 1840, wins: 28, losses: 6, completedTrials: 34, keyBadge: 'Logic Master' },
  { rankPosition: 2, id: 'u-2', name: 'David Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', rankTitle: 'Senior Counsel', eloRating: 1715, wins: 21, losses: 7, completedTrials: 28, keyBadge: 'Evidence Expert' },
  { rankPosition: 3, id: 'u-3', name: 'Kavya Zhang', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', rankTitle: 'Senior Counsel', eloRating: 1680, wins: 18, losses: 7, completedTrials: 25, keyBadge: 'Perfect Rebuttal' },
  { rankPosition: 4, id: 'u-4', name: 'Marcus Thorne', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', rankTitle: 'Litigator', eloRating: 1420, wins: 15, losses: 9, completedTrials: 24, keyBadge: 'Grandmaster Contender' },
  { rankPosition: 5, id: 'u-5', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', rankTitle: 'Litigator', eloRating: 1390, wins: 12, losses: 8, completedTrials: 20, keyBadge: 'First Victory' },
  { rankPosition: 6, id: 'u-6', name: 'Julian Cross', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', rankTitle: 'Advocate', eloRating: 1180, wins: 9, losses: 6, completedTrials: 15, keyBadge: 'Trial Veteran' },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  onBack,
  onQuickTrial,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const getRankBadge = (rank: UserRank) => {
    switch (rank) {
      case 'Grandmaster': return 'text-amber-300 bg-amber-500/15 border-amber-500/40';
      case 'Senior Counsel': return 'text-purple-300 bg-purple-500/15 border-purple-500/40';
      case 'Litigator': return 'text-sky-300 bg-sky-500/15 border-sky-500/40';
      case 'Advocate': return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40';
      default: return 'text-slate-300 bg-slate-700/40 border-slate-600';
    }
  };

  const list = [...MOCK_LEADERBOARD];
  // Inject current user into list
  const userRankPosition = list.findIndex(e => e.eloRating <= currentUser.eloRating);
  const userPosition = userRankPosition >= 0 ? userRankPosition + 1 : list.length + 1;

  const filtered = selectedFilter === 'all' 
    ? list 
    : list.filter(e => e.rankTitle.toLowerCase() === selectedFilter.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2 text-court-gold text-xs font-mono uppercase">
            <Trophy className="w-4 h-4" /> Supreme Bar Standings
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-white mt-1">
            Global Advocate Leaderboard
          </h1>
          <p className="text-xs text-slate-400">
            Rankings determined by sound logical reasoning, verified evidence deployment, and match victory ratios.
          </p>
        </div>

        <button
          onClick={onQuickTrial}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-cinzel font-bold text-xs bg-court-gold hover:bg-amber-400 text-black shadow-gold-sm transition-all"
        >
          <Flame className="w-4 h-4" /> Enter Ranked Trial
        </button>
      </div>

      {/* User's Current Standings Pill */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-court-card via-court-surface to-court-card border border-court-gold/40 shadow-gold-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-court-gold/20 border border-court-gold flex items-center justify-center font-cinzel font-bold text-court-gold">
            #{userPosition}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{currentUser.displayName} (You)</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getRankBadge(currentUser.rank)}`}>
                {currentUser.rank}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {currentUser.completedTrials} trials completed • {currentUser.wins} wins • {currentUser.streak} win streak
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center sm:text-right">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Elo</span>
            <span className="font-mono text-xl font-bold text-court-gold">{currentUser.eloRating}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total XP</span>
            <span className="font-mono text-xl font-bold text-slate-200">{currentUser.xp}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto text-xs pb-1">
        {['all', 'Grandmaster', 'Senior Counsel', 'Litigator', 'Advocate'].map(tier => (
          <button
            key={tier}
            onClick={() => setSelectedFilter(tier)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              selectedFilter === tier 
                ? 'bg-court-gold text-black font-semibold' 
                : 'bg-court-surface text-slate-300 hover:text-white border border-court-border'
            }`}
          >
            {tier === 'all' ? 'All Tiers' : tier}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl bg-court-card border border-court-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-court-border bg-court-panel text-slate-400 font-mono">
                <th className="py-3 px-4"># Rank</th>
                <th className="py-3 px-4">Advocate</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Elo Rating</th>
                <th className="py-3 px-4">Record (W-L)</th>
                <th className="py-3 px-4">Win Rate</th>
                <th className="py-3 px-4">Key Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-court-border/50 text-slate-300">
              {filtered.map(entry => {
                const winRate = Math.round((entry.wins / entry.completedTrials) * 100);
                return (
                  <tr key={entry.id} className="hover:bg-court-surface/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-court-gold">
                      #{entry.rankPosition}
                    </td>
                    <td className="py-3.5 px-4 flex items-center gap-2.5 font-semibold text-white">
                      <img src={entry.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-court-border" />
                      <span>{entry.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getRankBadge(entry.rankTitle)}`}>
                        {entry.rankTitle}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-court-gold text-sm">
                      {entry.eloRating}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {entry.wins}W - {entry.losses}L
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {winRate}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-court-gold" />
                      {entry.keyBadge}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
