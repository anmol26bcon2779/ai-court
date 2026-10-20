export type UserRank = 'Rookie' | 'Advocate' | 'Litigator' | 'Senior Counsel' | 'Grandmaster';

export type RoleType = 'prosecution' | 'defense' | 'judge' | 'jury' | 'witness' | 'spectator';

export type GameMode = 
  | '1v1_ai' 
  | '1v1_friend' 
  | 'jury_trial' 
  | 'mystery' 
  | 'speed' 
  | 'blind' 
  | 'ai_vs_ai'
  | 'team_trial';

export type CaseCategory = 
  | 'everyday' 
  | 'school' 
  | 'mystery' 
  | 'ethics' 
  | 'tech' 
  | 'business' 
  | 'history' 
  | 'humor' 
  | 'custom';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

export type EvidenceCategory = 
  | 'chat_screenshot' 
  | 'receipt' 
  | 'witness_statement' 
  | 'timeline' 
  | 'photograph' 
  | 'forensic_report' 
  | 'audio_recording';

export type EvidenceStatus = 'proposed' | 'accepted' | 'challenged' | 'excluded';

export type ObjectionType = 
  | 'irrelevant' 
  | 'unsupported_claim' 
  | 'contradiction' 
  | 'speculation';

export type TrialPhase = 
  | 'opening' 
  | 'evidence_submission' 
  | 'evidence_examination' 
  | 'cross_examination' 
  | 'rebuttal' 
  | 'closing' 
  | 'verdict';

export interface UserProfile {
  id: string;
  email?: string;
  displayName: string;
  avatar: string;
  xp: number;
  level: number;
  rank: UserRank;
  eloRating: number;
  wins: number;
  losses: number;
  draws: number;
  completedTrials: number;
  streak: number;
  badges: string[];
  isGuest: boolean;
  createdAt: string;
}

export interface EvidenceCard {
  id: string;
  title: string;
  description: string;
  category: EvidenceCategory;
  source: string;
  timestamp: string;
  relevanceExplanation: string;
  status: EvidenceStatus;
  submittedByRole: 'prosecution' | 'defense';
  challengedReason?: string;
  judgeRulingNotes?: string;
  imageUrl?: string;
  isFictionalDisclaimer: boolean;
}

export interface CourtCase {
  id: string;
  title: string;
  tagline: string;
  category: CaseCategory;
  difficulty: Difficulty;
  estimatedDuration: string;
  scenario: string;
  disputedFacts: string[];
  prosecutionTheory: string;
  defenseTheory: string;
  startingEvidence: EvidenceCard[];
  tags: string[];
  isFeatured?: boolean;
  isDaily?: boolean;
  supportsAi: boolean;
  supportsMultiplayer: boolean;
  createdBy?: string;
  isCustom?: boolean;
}

export interface Objection {
  id: string;
  phase: TrialPhase;
  raisedBy: 'prosecution' | 'defense';
  speakerName: string;
  targetArgumentId?: string;
  targetEvidenceId?: string;
  objectionType: ObjectionType;
  reason: string;
  ruling: 'sustained' | 'overruled';
  judgeExplanation: string;
  timestamp: number;
}

export interface ArgumentEntry {
  id: string;
  phase: TrialPhase;
  speakerRole: RoleType;
  speakerName: string;
  avatar: string;
  content: string;
  citations?: string[];
  timestamp: number;
  objections?: Objection[];
}

export interface VerdictScore {
  reasoning: number;        // out of 35
  evidenceUsage: number;    // out of 30
  counterarguments: number; // out of 25
  decorum: number;          // out of 10
  total: number;            // out of 100
}

export interface VerdictData {
  id: string;
  caseId: string;
  caseTitle: string;
  winner: 'prosecution' | 'defense' | 'inconclusive';
  confidence: number; // 0 - 100
  confidenceExplanation: string;
  scores: {
    prosecution: VerdictScore;
    defense: VerdictScore;
  };
  strongestProsecutionArg: string;
  strongestDefenseArg: string;
  weakestProsecutionClaim: string;
  weakestDefenseClaim: string;
  mostInfluentialEvidence: string;
  keyContradictions: string[];
  judgeSummary: string;
  reasoningFeedback: string;
  alternativePerspectives: string;
  juryVote?: {
    guilty: number;
    notGuilty: number;
    undecided: number;
  };
  xpEarned: {
    prosecution: number;
    defense: number;
  };
  createdAt: string;
}

export interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string;
  role: RoleType;
  isHost: boolean;
  isReady: boolean;
  isAi: boolean;
  aiPersonality?: 'analyst' | 'debater' | 'witty' | 'strategist';
  aiDifficulty?: Difficulty;
}

export interface Lobby {
  id: string;
  code: string;
  hostId: string;
  caseId: string;
  mode: GameMode;
  status: 'waiting' | 'in_progress' | 'completed';
  players: LobbyPlayer[];
  roundDuration: number; // in seconds, e.g. 90
  createdAt: string;
  customRules?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  role: RoleType;
  message: string;
  timestamp: number;
}

export interface TrialState {
  trialId: string;
  lobbyId?: string;
  caseData: CourtCase;
  mode: GameMode;
  phase: TrialPhase;
  roundNumber: number;
  currentTurnRole: 'prosecution' | 'defense';
  timeRemaining: number;
  isPaused: boolean;
  arguments: ArgumentEntry[];
  evidenceList: EvidenceCard[];
  objections: Objection[];
  verdict: VerdictData | null;
  players: {
    prosecution: LobbyPlayer;
    defense: LobbyPlayer;
    judge?: LobbyPlayer;
    jury?: LobbyPlayer[];
  };
  judgeMood: 'neutral' | 'thinking' | 'speaking' | 'ruling' | 'gavel_struck';
  judgeReactionQuote: string;
}
