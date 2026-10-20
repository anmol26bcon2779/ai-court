import { UserProfile, CourtCase, VerdictData } from '../types/court';
import { SEED_CASES } from '../data/cases';

const PROFILE_KEY = 'ai_court_user_profile';
const CUSTOM_CASES_KEY = 'ai_court_custom_cases';
const MATCH_HISTORY_KEY = 'ai_court_match_history';
const SETTINGS_KEY = 'ai_court_settings';

export interface AppSettings {
  soundEnabled: boolean;
  llmProvider: 'heuristic' | 'gemini' | 'custom';
  apiKey: string;
  customEndpoint?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest-' + Math.random().toString(36).substring(2, 9),
  displayName: 'Counselor Phoenix',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  xp: 120,
  level: 1,
  rank: 'Rookie',
  eloRating: 1000,
  wins: 0,
  losses: 0,
  draws: 0,
  completedTrials: 0,
  streak: 1,
  badges: ['Rookie Advocate'],
  isGuest: true,
  createdAt: new Date().toISOString(),
};

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  llmProvider: 'heuristic',
  apiKey: '',
};

const memoryStore = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStore.get(key) || null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore.set(key, value);
}

export const storageService = {
  getProfile(): UserProfile {
    try {
      const stored = safeGetItem(PROFILE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    this.saveProfile(DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    try {
      safeSetItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile to localStorage', e);
    }
  },

  getCustomCases(): CourtCase[] {
    try {
      const stored = safeGetItem(CUSTOM_CASES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  },

  saveCustomCase(courtCase: CourtCase): CourtCase[] {
    const existing = this.getCustomCases();
    const updated = [courtCase, ...existing.filter(c => c.id !== courtCase.id)];
    try {
      safeSetItem(CUSTOM_CASES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving custom case', e);
    }
    return updated;
  },

  getAllCases(): CourtCase[] {
    const custom = this.getCustomCases();
    return [...SEED_CASES, ...custom];
  },

  getMatchHistory(): VerdictData[] {
    try {
      const stored = safeGetItem(MATCH_HISTORY_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  },

  recordMatchResult(verdict: VerdictData, playerRole: 'prosecution' | 'defense'): UserProfile {
    const history = this.getMatchHistory();
    history.unshift(verdict);
    try {
      safeSetItem(MATCH_HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.error('Failed to record match history', e);
    }

    const profile = this.getProfile();
    const isWin = verdict.winner === playerRole;
    const isDraw = verdict.winner === 'inconclusive';

    const earnedXp = playerRole === 'prosecution' ? verdict.xpEarned.prosecution : verdict.xpEarned.defense;
    const newXp = profile.xp + earnedXp;
    const newLevel = Math.floor(newXp / 300) + 1;

    // Elo rating update
    const K = 32;
    const expectedScore = 0.5; // against standard AI / opponent
    const actualScore = isWin ? 1.0 : (isDraw ? 0.5 : 0.0);
    const newElo = Math.max(800, Math.round(profile.eloRating + K * (actualScore - expectedScore)));

    // Ranks based on Elo
    let rank = profile.rank;
    if (newElo >= 1500) rank = 'Grandmaster';
    else if (newElo >= 1350) rank = 'Senior Counsel';
    else if (newElo >= 1200) rank = 'Litigator';
    else if (newElo >= 1050) rank = 'Advocate';
    else rank = 'Rookie';

    // Badges check
    const badges = [...profile.badges];
    if (verdict.scores[playerRole].reasoning >= 30 && !badges.includes('Logic Master')) {
      badges.push('Logic Master');
    }
    if (verdict.scores[playerRole].evidenceUsage >= 25 && !badges.includes('Evidence Expert')) {
      badges.push('Evidence Expert');
    }
    if (newElo >= 1300 && !badges.includes('Grandmaster Contender')) {
      badges.push('Grandmaster Contender');
    }
    if (profile.completedTrials + 1 >= 5 && !badges.includes('Trial Veteran')) {
      badges.push('Trial Veteran');
    }
    if (isWin && !badges.includes('First Victory')) {
      badges.push('First Victory');
    }

    const updatedProfile: UserProfile = {
      ...profile,
      xp: newXp,
      level: newLevel,
      rank,
      eloRating: newElo,
      wins: profile.wins + (isWin ? 1 : 0),
      losses: profile.losses + (!isWin && !isDraw ? 1 : 0),
      draws: profile.draws + (isDraw ? 1 : 0),
      completedTrials: profile.completedTrials + 1,
      streak: isWin ? profile.streak + 1 : 0,
      badges,
    };

    this.saveProfile(updatedProfile);
    return updatedProfile;
  },

  getSettings(): AppSettings {
    try {
      const stored = safeGetItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      safeSetItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }
};
