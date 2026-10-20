import React, { useState, useEffect, useRef } from 'react';
import { 
  Gavel, 
  Clock, 
  ShieldAlert, 
  FileText, 
  PlusCircle, 
  Pause, 
  Play, 
  RotateCcw, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles,
  Bot,
  User,
  Quote,
  Eye,
  CornerDownRight
} from 'lucide-react';
import { 
  CourtCase, 
  TrialPhase, 
  TrialState, 
  ArgumentEntry, 
  EvidenceCard, 
  Objection, 
  ObjectionType, 
  LobbyPlayer, 
  VerdictData,
  EvidenceCategory,
  UserProfile
} from '../types/court';
import { aiJudgeService } from '../services/aiJudge';
import { aiOpponentService, AiPersonality } from '../services/aiOpponent';
import { soundService } from '../services/sound';
import { multiplayerService } from '../services/multiplayer';

interface CourtroomProps {
  courtCase: CourtCase;
  playerRole: 'prosecution' | 'defense';
  opponentPlayer: LobbyPlayer;
  currentUser: UserProfile;
  lobbyId?: string;
  roundDuration?: number;
  onVerdictReached: (verdict: VerdictData) => void;
  onLeaveTrial: () => void;
}

const PHASES_ORDER: TrialPhase[] = [
  'opening',
  'evidence_submission',
  'evidence_examination',
  'cross_examination',
  'rebuttal',
  'closing',
  'verdict',
];

const PHASE_LABELS: Record<TrialPhase, string> = {
  opening: 'Opening Statements',
  evidence_submission: 'Evidence Submission',
  evidence_examination: 'Evidence Examination',
  cross_examination: 'Cross-Examination',
  rebuttal: 'Direct Rebuttal',
  closing: 'Closing Arguments',
  verdict: 'AI Magistrate Verdict',
};

export const Courtroom: React.FC<CourtroomProps> = ({
  courtCase,
  playerRole,
  opponentPlayer,
  currentUser,
  lobbyId,
  roundDuration = 90,
  onVerdictReached,
  onLeaveTrial,
}) => {
  // Trial State Machine
  const [phaseIndex, setPhaseIndex] = useState(0);
  const currentPhase = PHASES_ORDER[phaseIndex];
  const [roundNumber, setRoundNumber] = useState(1);
  const [currentTurnRole, setCurrentTurnRole] = useState<'prosecution' | 'defense'>('prosecution');
  const [timeRemaining, setTimeRemaining] = useState(roundDuration);
  const [isPaused, setIsPaused] = useState(false);
  
  // Game Content
  const [argumentsList, setArgumentsList] = useState<ArgumentEntry[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceCard[]>(courtCase.startingEvidence || []);
  const [objectionsList, setObjectionsList] = useState<Objection[]>([]);
  
  // User input & UI states
  const [argumentDraft, setArgumentDraft] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [judgeMood, setJudgeMood] = useState<'neutral' | 'thinking' | 'speaking' | 'ruling' | 'gavel_struck'>('speaking');
  const [judgeReactionQuote, setJudgeReactionQuote] = useState(
    `Welcome to the virtual bench. The court will hear opening theories on "${courtCase.title}". Prosecution has the floor.`
  );
  
  // Modals
  const [showObjectionModal, setShowObjectionModal] = useState(false);
  const [selectedObjectionType, setSelectedObjectionType] = useState<ObjectionType>('unsupported_claim');
  const [objectionReasonInput, setObjectionReasonInput] = useState('');
  const [showNewEvidenceModal, setShowNewEvidenceModal] = useState(false);
  const [newEvTitle, setNewEvTitle] = useState('');
  const [newEvDesc, setNewEvDesc] = useState('');
  const [newEvCategory, setNewEvCategory] = useState<EvidenceCategory>('chat_screenshot');
  const [newEvRelevance, setNewEvRelevance] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const isMyTurn = currentTurnRole === playerRole && !isPaused && currentPhase !== 'verdict';

  // Scroll transcript down on new argument
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [argumentsList, objectionsList]);

  // Turn Countdown Timer
  useEffect(() => {
    if (isPaused || currentPhase === 'verdict') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time expired: auto switch turn or advance phase
          handleTurnTimeout();
          return roundDuration;
        }
        if (prev === 10) {
          soundService.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, currentPhase, currentTurnRole, phaseIndex]);

  // Trigger AI Turn when it is AI opponent's turn
  useEffect(() => {
    if (opponentPlayer.isAi && currentTurnRole !== playerRole && currentPhase !== 'verdict' && !isAiThinking) {
      handleTriggerAiTurn();
    }
  }, [currentTurnRole, currentPhase, opponentPlayer.isAi]);

  // Auto trigger AI turn
  const handleTriggerAiTurn = async () => {
    setIsAiThinking(true);
    setJudgeMood('thinking');

    // Simulate realistic advocate thinking delay (2-3.5 seconds)
    const thinkingDelay = 2200;
    setTimeout(async () => {
      try {
        const speech = await aiOpponentService.generateArgument(
          courtCase,
          currentPhase,
          currentTurnRole,
          (opponentPlayer.aiPersonality as AiPersonality) || 'analyst',
          opponentPlayer.aiDifficulty || 'Intermediate',
          argumentsList,
          evidenceList
        );

        const aiEntry: ArgumentEntry = {
          id: 'arg-' + Math.random().toString(36).substring(2, 9),
          phase: currentPhase,
          speakerRole: currentTurnRole,
          speakerName: opponentPlayer.name,
          avatar: opponentPlayer.avatar,
          content: speech,
          timestamp: Date.now()
        };

        setArgumentsList(prev => [...prev, aiEntry]);
        soundService.playTick();

        // Judge reaction remark
        const remark = aiJudgeService.generateMidTrialRemark(courtCase, aiEntry);
        setJudgeReactionQuote(remark);
        setJudgeMood('speaking');

        // Advance turn
        advanceTurnOrPhase();
      } catch (err) {
        console.error('Error during AI turn', err);
      } finally {
        setIsAiThinking(false);
      }
    }, thinkingDelay);
  };

  const handleTurnTimeout = () => {
    soundService.playGavel();
    setJudgeReactionQuote(`Time has expired for ${currentTurnRole.toUpperCase()}. The court transfers the floor.`);
    advanceTurnOrPhase();
  };

  // Submit User Argument
  const handleSubmitArgument = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!argumentDraft.trim() || !isMyTurn) return;

    soundService.playTick();

    const userEntry: ArgumentEntry = {
      id: 'arg-' + Math.random().toString(36).substring(2, 9),
      phase: currentPhase,
      speakerRole: playerRole,
      speakerName: currentUser.displayName,
      avatar: currentUser.avatar,
      content: argumentDraft.trim(),
      timestamp: Date.now()
    };

    setArgumentsList(prev => [...prev, userEntry]);
    setArgumentDraft('');

    // Judge reaction
    const remark = aiJudgeService.generateMidTrialRemark(courtCase, userEntry);
    setJudgeReactionQuote(remark);
    setJudgeMood('speaking');

    advanceTurnOrPhase();
  };

  // State Machine: Toggle turn between Prosecution and Defense, or transition to next phase
  const advanceTurnOrPhase = () => {
    setTimeRemaining(roundDuration);

    if (currentTurnRole === 'prosecution') {
      setCurrentTurnRole('defense');
    } else {
      // Both sides spoke for this phase! Advance phase!
      if (phaseIndex < PHASES_ORDER.length - 2) {
        const nextIdx = phaseIndex + 1;
        setPhaseIndex(nextIdx);
        setCurrentTurnRole('prosecution');
        setRoundNumber(r => r + 1);
        soundService.playGavel();
        setJudgeMood('gavel_struck');
        setJudgeReactionQuote(`We now commence Phase ${nextIdx + 1}: ${PHASE_LABELS[PHASES_ORDER[nextIdx]]}.`);
      } else {
        // Reached Verdict Phase!
        triggerVerdictPhase();
      }
    }
  };

  // Final Verdict Generation
  const triggerVerdictPhase = async () => {
    setPhaseIndex(PHASES_ORDER.length - 1);
    setIsPaused(true);
    setJudgeMood('thinking');
    setJudgeReactionQuote('The evidentiary record is closed. The AI Magistrate is deliberating the arguments and exhibits...');
    soundService.playGavel();

    try {
      const verdict = await aiJudgeService.generateVerdict(
        courtCase,
        argumentsList,
        evidenceList,
        objectionsList
      );

      soundService.playVerdictFanfare();
      setJudgeMood('ruling');
      setJudgeReactionQuote(verdict.judgeSummary);

      setTimeout(() => {
        onVerdictReached(verdict);
      }, 2500);
    } catch (err) {
      console.error('Failed to generate verdict', err);
    }
  };

  // Raise Procedural Objection
  const handleRaiseObjection = async () => {
    if (!objectionReasonInput.trim()) return;

    soundService.playObjection();
    setShowObjectionModal(false);

    setJudgeMood('gavel_struck');
    setJudgeReactionQuote(`"OBJECTION!" raised by ${playerRole.toUpperCase()} on grounds of ${selectedObjectionType.toUpperCase()}. The bench is reviewing the transcript...`);

    const lastArg = argumentsList.slice(-1)[0];
    const rulingData = await aiJudgeService.evaluateObjection(
      courtCase,
      selectedObjectionType,
      objectionReasonInput,
      lastArg
    );

    const objectionObj: Objection = {
      id: 'obj-' + Math.random().toString(36).substring(2, 9),
      phase: currentPhase,
      raisedBy: playerRole,
      speakerName: currentUser.displayName,
      objectionType: selectedObjectionType,
      reason: objectionReasonInput.trim(),
      ruling: rulingData.ruling,
      judgeExplanation: rulingData.explanation,
      timestamp: Date.now()
    };

    setObjectionsList(prev => [...prev, objectionObj]);
    setJudgeReactionQuote(`RULING: ${rulingData.ruling.toUpperCase()}. ${rulingData.explanation}`);
    setJudgeMood(rulingData.judgeMood);
    setObjectionReasonInput('');
  };

  // Submit New Evidence Card
  const handleAddNewEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvTitle.trim() || !newEvDesc.trim()) return;

    soundService.playEvidenceReveal();
    const newCard: EvidenceCard = {
      id: 'ev-user-' + Math.random().toString(36).substring(2, 9),
      title: newEvTitle.trim(),
      description: newEvDesc.trim(),
      category: newEvCategory,
      source: `${currentUser.displayName}'s Submission Dossier`,
      timestamp: 'Admitted in Phase 2',
      relevanceExplanation: newEvRelevance.trim() || 'Demonstrates essential chronological connection.',
      status: 'accepted',
      submittedByRole: playerRole,
      isFictionalDisclaimer: true
    };

    setEvidenceList(prev => [newCard, ...prev]);
    setShowNewEvidenceModal(false);
    setNewEvTitle('');
    setNewEvDesc('');
    setNewEvRelevance('');

    setJudgeReactionQuote(`Exhibit "${newCard.title}" has been introduced into evidence by ${playerRole.toUpperCase()}.`);
  };

  return (
    <div className="min-h-screen bg-court-bg text-slate-100 flex flex-col justify-between">
      
      {/* Top Courtroom Navigation Bar */}
      <div className="bg-court-card border-b border-court-border/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Case Info & Phase Progress */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-court-surface text-court-gold border border-court-gold/30">
                Phase {phaseIndex + 1}/7: {PHASE_LABELS[currentPhase]}
              </span>
              <span className="text-xs text-slate-400 font-mono">Round {roundNumber}</span>
            </div>
            <h2 className="font-cinzel text-lg font-bold text-white mt-0.5 truncate max-w-md">
              {courtCase.title}
            </h2>
          </div>

          {/* Phase Breadcrumbs */}
          <div className="hidden xl:flex items-center gap-1 text-[11px] font-mono">
            {PHASES_ORDER.slice(0, 6).map((p, idx) => (
              <div 
                key={p} 
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  idx === phaseIndex ? 'bg-court-gold text-black font-bold' :
                  idx < phaseIndex ? 'text-court-gold bg-court-gold/10' : 'text-slate-400 bg-court-surface/40'
                }`}
              >
                <span>{idx + 1}. {PHASE_LABELS[p].split(' ')[0]}</span>
              </div>
            ))}
          </div>

          {/* Turn Clock & Controls */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono ${
              timeRemaining <= 10 ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse' :
              'bg-court-surface text-slate-200 border-court-border'
            }`}>
              <Clock className="w-4 h-4 text-court-gold" />
              <span className="text-base font-bold">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </span>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Resume Trial' : 'Pause Trial'}
              className="p-2 rounded-lg bg-court-surface hover:bg-court-panel border border-court-border text-slate-300"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setTimeRemaining(t => t + 30)}
              title="Request +30s Time Extension"
              className="text-xs font-mono px-2 py-1.5 rounded-lg bg-court-surface hover:bg-court-panel border border-court-border text-court-gold"
            >
              +30s
            </button>

            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="text-xs text-rose-400 hover:text-rose-300 underline ml-2"
            >
              Leave
            </button>
          </div>

        </div>
      </div>

      {/* Main Courtroom Chamber */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column: Evidence Locker (3 cols) */}
        <div className="lg:col-span-3 flex flex-col h-[76vh] rounded-2xl bg-court-card border border-court-border/80 overflow-hidden">
          <div className="p-3.5 border-b border-court-border bg-court-panel flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-court-gold" />
              <h3 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider">
                Admitted Evidence ({evidenceList.length})
              </h3>
            </div>
            <button
              onClick={() => setShowNewEvidenceModal(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-court-gold hover:text-white px-2 py-1 rounded bg-court-gold/10 hover:bg-court-gold/20 border border-court-gold/30"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {evidenceList.map(ev => (
              <div 
                key={ev.id}
                className="p-3 rounded-xl bg-court-surface border border-court-border/60 hover:border-court-gold/40 transition-colors text-xs"
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                    ev.submittedByRole === 'prosecution' ? 'text-rose-400 bg-rose-500/10' : 'text-sky-400 bg-sky-500/10'
                  }`}>
                    {ev.submittedByRole} • {ev.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ✓ Accepted
                  </span>
                </div>
                <h4 className="font-semibold text-white mb-1">{ev.title}</h4>
                <p className="text-[11px] text-slate-300/80 mb-2 font-light leading-relaxed">
                  {ev.description}
                </p>
                <div className="text-[10px] text-slate-400 pt-1.5 border-t border-court-border/40">
                  <span className="text-court-gold font-medium">Relevance:</span> {ev.relevanceExplanation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: AI Judge Bench & Courtroom Transcript (6 cols) */}
        <div className="lg:col-span-6 flex flex-col h-[76vh] space-y-3 overflow-hidden">
          
          {/* AI Magistrate Bench */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-court-card via-court-surface to-court-card border border-court-gold/30 shadow-gold-sm relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl bg-court-dark border border-court-gold/60 flex items-center justify-center ${
                  judgeMood === 'gavel_struck' ? 'animate-gavel' : ''
                }`}>
                  <Gavel className="w-6 h-6 text-court-gold" />
                </div>
                <span className="absolute -bottom-1 -right-1 text-[9px] font-mono px-1 rounded bg-court-gold text-black font-bold">
                  AI JUDGE
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-cinzel text-xs font-bold text-court-gold tracking-wider">
                    Honorable AI Magistrate
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Status: {judgeMood}
                  </span>
                </div>
                <p className="text-xs text-slate-200 italic font-serif leading-relaxed">
                  "{judgeReactionQuote}"
                </p>
              </div>
            </div>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 p-4 rounded-2xl bg-court-card/90 border border-court-border overflow-y-auto space-y-4">
            
            {argumentsList.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                <Gavel className="w-8 h-8 text-court-gold mx-auto mb-2 opacity-50" />
                <p>The trial transcript is empty. {currentTurnRole.toUpperCase()} must deliver opening statement.</p>
              </div>
            )}

            {argumentsList.map((arg) => (
              <div 
                key={arg.id} 
                className={`flex gap-3 text-xs ${arg.speakerRole === 'prosecution' ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <img 
                  src={arg.avatar} 
                  alt="" 
                  className="w-8 h-8 rounded-full object-cover border border-court-border flex-shrink-0 mt-1" 
                />
                <div className={`max-w-[80%] p-3.5 rounded-2xl border ${
                  arg.speakerRole === 'prosecution' 
                    ? 'bg-court-prosecution/10 border-court-prosecution/30 rounded-tl-none' 
                    : 'bg-court-defense/10 border-court-defense/30 rounded-tr-none'
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-white">
                      {arg.speakerName}
                    </span>
                    <span className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded ${
                      arg.speakerRole === 'prosecution' ? 'text-rose-400 bg-rose-500/20' : 'text-sky-400 bg-sky-500/20'
                    }`}>
                      {arg.speakerRole} • {arg.phase}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-light whitespace-pre-wrap">
                    {arg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Render In-Trial Objections */}
            {objectionsList.map(obj => (
              <div key={obj.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-cinzel font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    OBJECTION: {obj.objectionType.toUpperCase()} ({obj.ruling.toUpperCase()})
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">By {obj.speakerName}</span>
                </div>
                <p className="text-slate-300 text-[11px] mb-1">"{obj.reason}"</p>
                <p className="text-[11px] font-mono text-court-gold">Magistrate: {obj.judgeExplanation}</p>
              </div>
            ))}

            {/* AI Opponent typing indicator */}
            {isAiThinking && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-court-surface/80 border border-court-border text-xs text-slate-400">
                <Bot className="w-4 h-4 text-court-cyan animate-pulse" />
                <span>{opponentPlayer.name} is examining the exhibits and formulating counter-argument...</span>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

        </div>

        {/* Right Column: Advocate Console (Player's turn dock) (3 cols) */}
        <div className="lg:col-span-3 flex flex-col h-[76vh] justify-between p-4 rounded-2xl bg-court-card border border-court-border">
          
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-court-border">
              <span className="text-xs font-cinzel font-bold text-white uppercase tracking-wider">
                Advocate Console
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isMyTurn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {isMyTurn ? '● YOUR TURN' : 'OPPONENT TURN'}
              </span>
            </div>

            {/* Role & Objective Reminder */}
            <div className="p-3 rounded-xl bg-court-surface border border-court-border mb-4 text-xs">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Your Core Theory</span>
              <p className="text-slate-200 text-[11px] leading-relaxed italic">
                "{playerRole === 'prosecution' ? courtCase.prosecutionTheory : courtCase.defenseTheory}"
              </p>
            </div>

            {/* OBJECTION Trigger Button */}
            <button
              onClick={() => setShowObjectionModal(true)}
              className="w-full py-2.5 mb-4 rounded-xl font-cinzel font-extrabold text-xs tracking-wider bg-gradient-to-r from-court-prosecution via-rose-600 to-court-prosecution-dark text-white shadow-glow-red hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              RAISE OBJECTION!
            </button>

            {/* Quick Strategy Helpers */}
            <div className="space-y-1.5 mb-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Suggested Strategies</span>
              <button
                type="button"
                onClick={() => setArgumentDraft(prev => prev + ' We cite the documentary evidence showing: ')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-court-surface hover:bg-court-panel text-[11px] text-slate-300 border border-court-border transition-colors flex items-center gap-1.5"
              >
                <CornerDownRight className="w-3 h-3 text-court-gold" /> Cite Admitted Exhibit
              </button>
              <button
                type="button"
                onClick={() => setArgumentDraft(prev => prev + ' This directly contradicts opposing counsel’s timeline because: ')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-court-surface hover:bg-court-panel text-[11px] text-slate-300 border border-court-border transition-colors flex items-center gap-1.5"
              >
                <CornerDownRight className="w-3 h-3 text-court-cyan" /> Challenge Contradiction
              </button>
            </div>
          </div>

          {/* Argument Text Area and Submit */}
          <form onSubmit={handleSubmitArgument} className="space-y-2">
            <textarea
              rows={4}
              disabled={!isMyTurn}
              value={argumentDraft}
              onChange={e => setArgumentDraft(e.target.value)}
              placeholder={isMyTurn ? `Deliver your ${PHASE_LABELS[currentPhase]}...` : "Waiting for opponent's turn..."}
              className="w-full p-3 text-xs bg-court-surface border border-court-border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-court-gold disabled:opacity-40"
            />

            <button
              type="submit"
              disabled={!isMyTurn || !argumentDraft.trim()}
              className="w-full py-3 rounded-xl font-cinzel font-bold text-xs tracking-wider bg-gradient-to-r from-court-gold via-amber-400 to-court-gold-dark text-black hover:opacity-90 shadow-gold-sm disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              DELIVER ARGUMENT
            </button>
          </form>

        </div>

      </div>

      {/* OBJECTION MODAL */}
      {showObjectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-court-card border border-rose-500/50 shadow-glow-red animate-objection">
            <h3 className="font-cinzel text-lg font-bold text-rose-400 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              FORMAL OBJECTION
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Select standard procedural grounds and articulate your legal rationale.
            </p>

            <div className="space-y-2 mb-4">
              {[
                { type: 'unsupported_claim' as ObjectionType, label: 'Unsupported Claim', desc: 'Asserts unevidenced facts as settled truth' },
                { type: 'irrelevant' as ObjectionType, label: 'Irrelevant', desc: 'Has no logical bearing on the disputed facts' },
                { type: 'contradiction' as ObjectionType, label: 'Contradiction', desc: 'Directly clashes with admitted timeline exhibits' },
                { type: 'speculation' as ObjectionType, label: 'Speculation', desc: 'Guesses internal motive or feelings without proof' },
              ].map(opt => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setSelectedObjectionType(opt.type)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedObjectionType === opt.type 
                      ? 'bg-rose-500/20 text-rose-200 border-rose-500' 
                      : 'bg-court-surface text-slate-300 border-court-border'
                  }`}
                >
                  <div className="font-semibold text-white">{opt.label}</div>
                  <div className="text-[11px] text-slate-400">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specific Grounds / Cause *
              </label>
              <input
                type="text"
                value={objectionReasonInput}
                onChange={e => setObjectionReasonInput(e.target.value)}
                placeholder="e.g. Opposing counsel claimed Marcus had intent without proof."
                className="w-full px-3 py-2 text-xs bg-court-surface border border-court-border rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowObjectionModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Withdraw
              </button>
              <button
                type="button"
                onClick={handleRaiseObjection}
                disabled={!objectionReasonInput.trim()}
                className="px-5 py-2 rounded-xl font-cinzel font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-glow-red disabled:opacity-40"
              >
                SUBMIT OBJECTION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT EVIDENCE MODAL */}
      {showNewEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-court-card border border-court-gold/40 shadow-gold-sm">
            <h3 className="font-cinzel text-lg font-bold text-white mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-court-gold" />
              Introduce New Exhibit
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Submit digital exhibits to corroborate your theory of the case.
            </p>

            <form onSubmit={handleAddNewEvidence} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Exhibit Title *</label>
                <input
                  type="text"
                  required
                  value={newEvTitle}
                  onChange={e => setNewEvTitle(e.target.value)}
                  placeholder="e.g. Wi-Fi Router DHCP Connection Log"
                  className="w-full px-3 py-2 text-xs bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={newEvCategory}
                  onChange={e => setNewEvCategory(e.target.value as EvidenceCategory)}
                  className="w-full px-3 py-2 text-xs bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
                >
                  <option value="chat_screenshot">Chat Screenshot</option>
                  <option value="receipt">Financial Receipt</option>
                  <option value="witness_statement">Witness Statement</option>
                  <option value="timeline">Chronological Timeline</option>
                  <option value="photograph">Photograph / Image</option>
                  <option value="forensic_report">Forensic / IT Report</option>
                  <option value="audio_recording">Audio Recording Transcript</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Exhibit Description *</label>
                <textarea
                  required
                  rows={2}
                  value={newEvDesc}
                  onChange={e => setNewEvDesc(e.target.value)}
                  placeholder="Describe what this exhibit reveals..."
                  className="w-full px-3 py-2 text-xs bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Relevance Explanation</label>
                <input
                  type="text"
                  value={newEvRelevance}
                  onChange={e => setNewEvRelevance(e.target.value)}
                  placeholder="How does this support your case?"
                  className="w-full px-3 py-2 text-xs bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-court-border">
                <button
                  type="button"
                  onClick={() => setShowNewEvidenceModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-cinzel font-bold text-xs bg-court-gold hover:bg-amber-400 text-black shadow-gold-sm"
                >
                  Admit Exhibit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAVE CONFIRMATION MODAL */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-court-card border border-court-border text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="font-cinzel text-base font-bold text-white mb-2">Leave Active Trial?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Leaving early will forfeit the trial and record an incomplete match on your profile.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 rounded-lg bg-court-surface text-xs font-semibold text-slate-300 hover:text-white"
              >
                Stay in Trial
              </button>
              <button
                onClick={onLeaveTrial}
                className="px-4 py-2 rounded-lg bg-rose-600 text-xs font-semibold text-white hover:bg-rose-500"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
