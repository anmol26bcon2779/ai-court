import React from 'react';
import { 
  Scale, 
  Gavel, 
  Users, 
  Bot, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Trophy, 
  FileText, 
  Compass, 
  HelpCircle,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CourtCase, UserProfile } from '../types/court';
import { SEED_CASES } from '../data/cases';
import { soundService } from '../services/sound';

interface LandingPageProps {
  onStartTrial: (courtCase: CourtCase) => void;
  onBrowseCases: () => void;
  onCreateLobby: () => void;
  onChallengeAi: () => void;
  onExhibitionMatch: () => void;
  profile: UserProfile;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrial,
  onBrowseCases,
  onCreateLobby,
  onChallengeAi,
  onExhibitionMatch,
  profile,
}) => {
  const featuredCases = SEED_CASES.filter(c => c.isFeatured || c.isDaily).slice(0, 3);

  const handleHeroGavelClick = () => {
    soundService.playGavel();
  };

  return (
    <div className="relative min-h-screen bg-court-bg text-slate-100 overflow-hidden">
      
      {/* Ambient Lighting & Courtroom Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-court-gold/15 via-court-cyan/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-court-prosecution/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-court-defense/10 blur-[130px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Daily Ticker Banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-court-panel/80 border border-court-gold/30 shadow-gold-sm mb-8 animate-pulse-slow">
          <Sparkles className="w-4 h-4 text-court-gold" />
          <span className="text-xs font-medium text-slate-200">
            Daily Court Challenge: <strong className="text-court-gold">The Leaked Algorithms Midterm</strong>
          </span>
          <span className="text-[10px] font-mono bg-court-gold/20 text-court-gold px-2 py-0.5 rounded-full">
            +200 XP
          </span>
        </div>

        {/* Cinematic Title & Tagline */}
        <div className="relative max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <button 
              onClick={handleHeroGavelClick}
              title="Click to strike the gavel"
              className="p-4 rounded-2xl bg-gradient-to-br from-court-panel via-court-surface to-court-card border border-court-gold/40 shadow-gold-lg hover:scale-110 active:rotate-12 transition-all duration-300 group"
            >
              <Gavel className="w-12 h-12 text-court-gold group-hover:text-amber-300 transition-colors" />
            </button>
          </div>

          <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            PRESENT YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-court-gold via-amber-200 to-court-gold-light">PROOF.</span>
            <br />
            CHALLENGE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-court-cyan to-indigo-400">TRUTH.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Step into the virtual arena where evidence reigns supreme. Engage in intense legal debates against 
            sharp AI minds or real friends, adjudicated in real time by an impartial AI Magistrate.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => onStartTrial(SEED_CASES[0])}
              className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-cinzel font-bold text-sm tracking-wide bg-gradient-to-r from-court-gold via-amber-400 to-court-gold-dark text-black shadow-gold-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <Gavel className="w-4 h-4" />
              START A TRIAL
            </button>

            <button
              onClick={onCreateLobby}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-cinzel font-semibold text-sm tracking-wide bg-court-surface/80 hover:bg-court-panel border border-court-defense/50 text-sky-200 hover:text-white shadow-glow-blue hover:border-court-defense transition-all active:scale-95"
            >
              <Users className="w-4 h-4 text-sky-400" />
              PLAY WITH FRIENDS
            </button>

            <button
              onClick={onChallengeAi}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-cinzel font-semibold text-sm tracking-wide bg-court-surface/80 hover:bg-court-panel border border-court-gold/30 text-amber-200 hover:text-white hover:border-court-gold transition-all active:scale-95"
            >
              <Bot className="w-4 h-4 text-court-gold" />
              CHALLENGE AI
            </button>
          </div>

          {/* Quick Match Mode Switcher */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
            <button 
              onClick={onExhibitionMatch} 
              className="hover:text-court-gold underline underline-offset-4 flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Spectate AI vs AI Exhibition Match
            </button>
            <span>•</span>
            <button 
              onClick={onBrowseCases}
              className="hover:text-court-gold underline underline-offset-4 flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" /> Explore All {SEED_CASES.length} Cases
            </button>
          </div>
        </div>

      </section>

      {/* Fictional Disclaimer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-court-panel/60 border border-court-border/80 text-xs text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong className="text-slate-300">Courtroom Simulation Notice:</strong> AI Court is an entertainment and critical-thinking debate game. 
            All scenarios, evidence exhibits, and AI Magistrate rulings are strictly fictional simulations and do not constitute actual legal advice or judicial proceedings.
          </span>
        </div>
      </div>

      {/* Featured Cases Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-court-gold text-xs font-mono uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              Court Docket
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
              Featured Case Scenarios
            </h2>
          </div>
          <button
            onClick={onBrowseCases}
            className="mt-3 sm:mt-0 flex items-center gap-1.5 text-sm text-court-gold hover:text-amber-300 font-semibold transition-colors"
          >
            View Full Library <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCases.map((c) => (
            <div
              key={c.id}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-court-card/90 border border-court-border/80 hover:border-court-gold/40 shadow-court-card hover:shadow-gold-sm transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-court-surface text-slate-300 border border-court-border">
                    {c.category.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {c.estimatedDuration}
                  </div>
                </div>

                <h3 className="font-cinzel text-lg font-bold text-white group-hover:text-court-gold transition-colors mb-2">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4 font-light leading-relaxed">
                  {c.scenario}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.tags.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="text-[10px] text-slate-400 bg-court-darker px-2 py-0.5 rounded border border-court-border/40">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-court-border/60 flex items-center justify-between">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  c.difficulty === 'Beginner' ? 'text-emerald-400 bg-emerald-500/10' :
                  c.difficulty === 'Intermediate' ? 'text-amber-400 bg-amber-500/10' :
                  'text-rose-400 bg-rose-500/10'
                }`}>
                  {c.difficulty}
                </span>

                <button
                  onClick={() => onStartTrial(c)}
                  className="flex items-center gap-1 text-xs font-semibold text-court-gold hover:text-white px-3 py-1.5 rounded-lg bg-court-surface hover:bg-court-gold/20 border border-court-gold/30 transition-all"
                >
                  Enter Trial <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-court-panel/30 rounded-3xl border border-court-border/50 my-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-court-gold">Trial Procedure</span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mt-1">
            How The AI Court Operates
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Structured 7-phase gameplay ensuring rigorous critical thinking, evidentiary validation, and objective verdicts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-court-surface/70 border border-court-border relative">
            <div className="w-8 h-8 rounded-lg bg-court-gold/20 text-court-gold font-mono font-bold flex items-center justify-center mb-3">
              01
            </div>
            <h4 className="font-cinzel font-bold text-white text-base mb-1">Pick Your Case & Role</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose from classic whodunits, college dramas, tech rivalries, or create your own custom case. Suit up as Prosecution or Defense.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-court-surface/70 border border-court-border relative">
            <div className="w-8 h-8 rounded-lg bg-court-defense/20 text-sky-400 font-mono font-bold flex items-center justify-center mb-3">
              02
            </div>
            <h4 className="font-cinzel font-bold text-white text-base mb-1">Deploy Evidence</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit digital exhibits—telemetry, chat screenshots, receipts, forensic logs, and timestamps. Cite evidence to ground every argument.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-court-surface/70 border border-court-border relative">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 font-mono font-bold flex items-center justify-center mb-3">
              03
            </div>
            <h4 className="font-cinzel font-bold text-white text-base mb-1">Object & Cross-Examine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Call out fallacies in real-time with procedural objections: Irrelevant, Unsupported Claim, Contradiction, or Speculation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-court-surface/70 border border-court-border relative">
            <div className="w-8 h-8 rounded-lg bg-court-gold/20 text-amber-300 font-mono font-bold flex items-center justify-center mb-3">
              04
            </div>
            <h4 className="font-cinzel font-bold text-white text-base mb-1">AI Magistrate Verdict</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The AI judge weighs argument quality, counterarguments, and evidence, delivering a comprehensive written judgment and Elo score.
            </p>
          </div>
        </div>
      </section>

      {/* Global Leaderboard Preview */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-court-card via-court-surface to-court-panel border border-court-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <Trophy className="w-6 h-6 text-court-gold" />
              </div>
              <div>
                <h3 className="font-cinzel text-xl font-bold text-white">Supreme Bar Leaderboard</h3>
                <p className="text-xs text-slate-400">Top ranked advocates across all simulated jurisdictions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Your Current Rank:</span>
              <span className="text-xs font-bold text-court-gold px-2.5 py-1 rounded-md bg-court-gold/10 border border-court-gold/30">
                {profile.rank} ({profile.eloRating} ELO)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-court-border text-slate-400 font-mono">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Advocate</th>
                  <th className="py-2.5 px-3">Rank Title</th>
                  <th className="py-2.5 px-3">Elo Rating</th>
                  <th className="py-2.5 px-3">Win Rate</th>
                  <th className="py-2.5 px-3">Key Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-court-border/40 text-slate-300">
                <tr className="hover:bg-court-surface/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-court-gold">1</td>
                  <td className="py-3 px-3 flex items-center gap-2 font-semibold text-white">
                    <span className="w-6 h-6 rounded-full bg-court-gold/20 flex items-center justify-center text-[10px] text-court-gold">AL</span>
                    Aria Sterling
                  </td>
                  <td className="py-3 px-3"><span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">Grandmaster</span></td>
                  <td className="py-3 px-3 font-mono text-court-gold font-bold">1840</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">82.4% (28-6)</td>
                  <td className="py-3 px-3 text-slate-400">Logic Master</td>
                </tr>
                <tr className="hover:bg-court-surface/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">2</td>
                  <td className="py-3 px-3 flex items-center gap-2 font-semibold text-white">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px] text-sky-400">DV</span>
                    David Vance
                  </td>
                  <td className="py-3 px-3"><span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">Senior Counsel</span></td>
                  <td className="py-3 px-3 font-mono text-court-gold font-bold">1715</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">75.0% (21-7)</td>
                  <td className="py-3 px-3 text-slate-400">Evidence Expert</td>
                </tr>
                <tr className="hover:bg-court-surface/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">3</td>
                  <td className="py-3 px-3 flex items-center gap-2 font-semibold text-white">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400">KZ</span>
                    Kavya Zhang
                  </td>
                  <td className="py-3 px-3"><span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">Senior Counsel</span></td>
                  <td className="py-3 px-3 font-mono text-court-gold font-bold">1680</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">72.0% (18-7)</td>
                  <td className="py-3 px-3 text-slate-400">Perfect Rebuttal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-court-border/60 py-8 px-4 text-center text-xs text-slate-400 font-light">
        <div className="flex items-center justify-center gap-2 font-cinzel font-bold text-slate-300 text-sm mb-2">
          <Scale className="w-4 h-4 text-court-gold" />
          AI COURT
        </div>
        <p className="max-w-md mx-auto mb-3">
          "Present Your Proof. Challenge the Truth." A social debate simulation engineered for critical reasoning.
        </p>
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} AI Court Simulation. Built for fictional debate & entertainment. Not legal advice.
        </p>
      </footer>

    </div>
  );
};
