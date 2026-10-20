import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Gavel, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Share2, 
  ArrowLeft, 
  Sparkles,
  HelpCircle,
  FileText,
  Quote,
  ShieldAlert
} from 'lucide-react';
import { VerdictData, UserProfile } from '../types/court';
import { soundService } from '../services/sound';

interface VerdictViewProps {
  verdict: VerdictData;
  playerRole: 'prosecution' | 'defense';
  userProfile: UserProfile;
  onRematch: () => void;
  onExit: () => void;
}

export const VerdictView: React.FC<VerdictViewProps> = ({
  verdict,
  playerRole,
  userProfile,
  onRematch,
  onExit,
}) => {
  const isWinner = verdict.winner === playerRole;
  const isDraw = verdict.winner === 'inconclusive';

  useEffect(() => {
    soundService.playVerdictFanfare();
    if (isWinner) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isWinner]);

  const handleShareVerdict = () => {
    soundService.playTick();
    const shareText = `⚖️ AI COURT VERDICT for "${verdict.caseTitle}": ${verdict.winner.toUpperCase()} WINS (${verdict.confidence}% confidence)! Read the full magistrate ruling at AI Court.`;
    navigator.clipboard.writeText(shareText);
    alert('Verdict summary copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      
      {/* Top Banner Announcement */}
      <div className={`p-8 rounded-3xl border text-center relative overflow-hidden mb-8 shadow-gold-lg ${
        verdict.winner === 'prosecution' 
          ? 'bg-gradient-to-b from-rose-950/60 via-court-card to-court-card border-rose-500/50' 
          : verdict.winner === 'defense'
          ? 'bg-gradient-to-b from-blue-950/60 via-court-card to-court-card border-blue-500/50'
          : 'bg-gradient-to-b from-amber-950/50 via-court-card to-court-card border-court-gold/40'
      }`}>
        
        <div className="flex justify-center mb-3">
          <div className="p-4 rounded-2xl bg-court-surface border border-court-gold/40 shadow-gold-sm">
            <Gavel className="w-10 h-10 text-court-gold animate-gavel" />
          </div>
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-court-gold block mb-1">
          Final Judgment Rendered
        </span>

        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-white mb-2">
          {verdict.winner === 'prosecution' && 'PROSECUTION PREVAILS'}
          {verdict.winner === 'defense' && 'DEFENSE PREVAILS'}
          {verdict.winner === 'inconclusive' && 'VERDICT OF EQUIPOISE (DRAW)'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 font-mono mb-4">
          Confidence Rating: <strong className="text-court-gold">{verdict.confidence}%</strong> ({verdict.confidenceExplanation})
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-court-surface border border-court-border text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-court-gold" />
          <span>
            {isWinner ? `Victory! You gained +${verdict.xpEarned[playerRole]} XP and improved your Elo rating.` :
             isDraw ? `Equipoise. You earned +${verdict.xpEarned[playerRole]} XP.` :
             `Trial Concluded. You earned +${verdict.xpEarned[playerRole]} XP.`}
          </span>
        </div>
      </div>

      {/* Score Comparison Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Prosecution Scores */}
        <div className="p-6 rounded-2xl bg-court-card border border-rose-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel font-bold text-rose-400 text-lg">Prosecution Metrics</h3>
            <span className="font-mono text-2xl font-bold text-white">
              {verdict.scores.prosecution.total}<span className="text-xs text-slate-400 font-normal">/100</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Logical Reasoning</span>
                <span className="font-mono">{verdict.scores.prosecution.reasoning}/35</span>
              </div>
              <div className="w-full h-2 rounded-full bg-court-surface overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(verdict.scores.prosecution.reasoning / 35) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Evidence Integration</span>
                <span className="font-mono">{verdict.scores.prosecution.evidenceUsage}/30</span>
              </div>
              <div className="w-full h-2 rounded-full bg-court-surface overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(verdict.scores.prosecution.evidenceUsage / 30) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Counterargument Handling</span>
                <span className="font-mono">{verdict.scores.prosecution.counterarguments}/25</span>
              </div>
              <div className="w-full h-2 rounded-full bg-court-surface overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(verdict.scores.prosecution.counterarguments / 25) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Defense Scores */}
        <div className="p-6 rounded-2xl bg-court-card border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel font-bold text-sky-400 text-lg">Defense Metrics</h3>
            <span className="font-mono text-2xl font-bold text-white">
              {verdict.scores.defense.total}<span className="text-xs text-slate-400 font-normal">/100</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Logical Reasoning</span>
                <span className="font-mono">{verdict.scores.defense.reasoning}/35</span>
              </div>
              <div className="w-full h-2 rounded-full bg-court-surface overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(verdict.scores.defense.reasoning / 35) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Evidence Integration</span>
                <span className="font-mono">{verdict.scores.defense.evidenceUsage}/30</span>
              </div>
              <div className="w-full h-2 rounded-full bg-court-surface overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(verdict.scores.defense.evidenceUsage / 30) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Counterargument Handling</span>
                <span className="font-mono">{verdict.scores.defense.counterarguments}/25</span>
              </div>
              <div className="w-full h-2 rounded-full bg-court-surface overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(verdict.scores.defense.counterarguments / 25) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Magistrate's Written Opinion & Analysis */}
      <div className="p-8 rounded-2xl bg-court-card border border-court-border space-y-6 mb-8">
        <div>
          <span className="text-xs font-mono uppercase text-court-gold tracking-widest block mb-1">
            Official Magistrate Opinion
          </span>
          <h2 className="font-cinzel text-xl font-bold text-white mb-3">
            Summary of the Ruling
          </h2>
          <p className="text-sm text-slate-200 font-serif leading-relaxed italic border-l-2 border-court-gold pl-4">
            "{verdict.judgeSummary}"
          </p>
        </div>

        {/* Strongest Arguments & Weakest Claims */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-court-border">
          <div className="p-4 rounded-xl bg-court-surface border border-court-border">
            <span className="font-semibold text-rose-400 block mb-1">★ Strongest Prosecution Argument:</span>
            <p className="text-slate-300 italic">"{verdict.strongestProsecutionArg}"</p>
          </div>

          <div className="p-4 rounded-xl bg-court-surface border border-court-border">
            <span className="font-semibold text-sky-400 block mb-1">★ Strongest Defense Argument:</span>
            <p className="text-slate-300 italic">"{verdict.strongestDefenseArg}"</p>
          </div>

          <div className="p-4 rounded-xl bg-court-surface border border-court-border">
            <span className="font-semibold text-amber-400 block mb-1">⚠ Weakest Prosecution Assertion:</span>
            <p className="text-slate-300">{verdict.weakestProsecutionClaim}</p>
          </div>

          <div className="p-4 rounded-xl bg-court-surface border border-court-border">
            <span className="font-semibold text-amber-400 block mb-1">⚠ Weakest Defense Assertion:</span>
            <p className="text-slate-300">{verdict.weakestDefenseClaim}</p>
          </div>
        </div>

        {/* Most Influential Evidence & Contradictions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-court-border">
          <div>
            <span className="font-mono text-slate-400 uppercase text-[10px] block mb-1">Most Influential Exhibit</span>
            <div className="p-3 rounded-lg bg-court-surface text-court-gold font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-court-gold" />
              {verdict.mostInfluentialEvidence}
            </div>
          </div>

          <div>
            <span className="font-mono text-slate-400 uppercase text-[10px] block mb-1">Alternative Reasonable Interpretations</span>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              {verdict.alternativePerspectives}
            </p>
          </div>
        </div>

        {/* Critical Thinking Feedback */}
        <div className="p-4 rounded-xl bg-court-surface/80 border border-court-gold/20 text-xs">
          <span className="font-cinzel font-bold text-court-gold block mb-1">Advocate Skill Feedback:</span>
          <p className="text-slate-300 leading-relaxed font-light">
            {verdict.reasoningFeedback}
          </p>
        </div>
      </div>

      {/* Post-Trial Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-court-card border border-court-border">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Case Library
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShareVerdict}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-court-surface hover:bg-court-panel border border-court-border text-slate-200"
          >
            <Share2 className="w-4 h-4 text-court-gold" /> Share Verdict Card
          </button>

          <button
            onClick={onRematch}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-cinzel font-bold text-xs tracking-wider bg-gradient-to-r from-court-gold to-court-gold-dark text-black hover:opacity-90 shadow-gold-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" /> REMATCH (REVERSE ROLES)
          </button>
        </div>
      </div>

    </div>
  );
};
