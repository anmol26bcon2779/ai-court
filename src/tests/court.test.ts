import { aiJudgeService } from '../services/aiJudge';
import { aiOpponentService } from '../services/aiOpponent';
import { multiplayerService } from '../services/multiplayer';
import { storageService } from '../services/storage';
import { SEED_CASES } from '../data/cases';
import { LobbyPlayer, ObjectionType, TrialPhase } from '../types/court';

export async function runSelfDiagnosticTests(): Promise<{ passed: number; failed: number; results: { name: string; success: boolean; details?: string }[] }> {
  const results: { name: string; success: boolean; details?: string }[] = [];

  // Test 1: Seed Cases Integrity
  try {
    const hasEnoughCases = SEED_CASES.length >= 8;
    const allHaveEvidence = SEED_CASES.every(c => c.startingEvidence && c.startingEvidence.length > 0);
    const allHaveDisputedFacts = SEED_CASES.every(c => c.disputedFacts && c.disputedFacts.length > 0);

    if (hasEnoughCases && allHaveEvidence && allHaveDisputedFacts) {
      results.push({ name: 'Seed Cases & Categories Test', success: true });
    } else {
      results.push({ name: 'Seed Cases & Categories Test', success: false, details: 'Incomplete seed case attributes' });
    }
  } catch (e: any) {
    results.push({ name: 'Seed Cases & Categories Test', success: false, details: e.message });
  }

  // Test 2: Lobby Generation & Join Logic
  try {
    const testHost: LobbyPlayer = {
      id: 'test-host-1',
      name: 'Host Advocate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'prosecution',
      isHost: true,
      isReady: true,
      isAi: false
    };

    const lobby = multiplayerService.createLobby(testHost, SEED_CASES[0]);
    const validCode = lobby.code && lobby.code.length === 6;

    const testJoiner: LobbyPlayer = {
      id: 'test-joiner-2',
      name: 'Guest Colleague',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'defense',
      isHost: false,
      isReady: false,
      isAi: false
    };

    const joinedLobby = multiplayerService.joinLobby(lobby.code, testJoiner);
    const hasBothPlayers = joinedLobby && joinedLobby.players.length === 2;

    if (validCode && hasBothPlayers) {
      results.push({ name: 'Lobby Creation & Cross-Player Join Test', success: true });
    } else {
      results.push({ name: 'Lobby Creation & Cross-Player Join Test', success: false, details: 'Join code or player roster failed' });
    }
  } catch (e: any) {
    results.push({ name: 'Lobby Creation & Cross-Player Join Test', success: false, details: e.message });
  }

  // Test 3: AI Opponent Procedural Argument Generation
  try {
    const speech = aiOpponentService.generateProceduralArgument(
      SEED_CASES[0],
      'opening',
      'prosecution',
      'analyst',
      'Intermediate',
      [],
      SEED_CASES[0].startingEvidence
    );
    const hasScenarioContext = speech.length > 50 && speech.includes('Honor');
    if (hasScenarioContext) {
      results.push({ name: 'AI Opponent Procedural Argument Test', success: true });
    } else {
      results.push({ name: 'AI Opponent Procedural Argument Test', success: false, details: 'Argument generation failed' });
    }
  } catch (e: any) {
    results.push({ name: 'AI Opponent Procedural Argument Test', success: false, details: e.message });
  }

  // Test 4: Objection Evaluation Logic
  try {
    const ruling = await aiJudgeService.evaluateObjection(
      SEED_CASES[0],
      'unsupported_claim' as ObjectionType,
      'Counsel asserts my client is obviously guilty without proof',
      {
        id: 'arg-test',
        phase: 'opening' as TrialPhase,
        speakerRole: 'prosecution',
        speakerName: 'Prosecutor',
        avatar: '',
        content: 'The defendant is obviously guilty and definitely knew what they did.',
        timestamp: Date.now()
      }
    );

    if (ruling.ruling === 'sustained' && ruling.explanation.length > 10) {
      results.push({ name: 'AI Magistrate Objection Evaluation Test', success: true });
    } else {
      results.push({ name: 'AI Magistrate Objection Evaluation Test', success: false, details: 'Objection was not ruled correctly' });
    }
  } catch (e: any) {
    results.push({ name: 'AI Magistrate Objection Evaluation Test', success: false, details: e.message });
  }

  // Test 5: Final Verdict Generation & Scoring Integrity
  try {
    const verdict = await aiJudgeService.generateVerdict(
      SEED_CASES[0],
      [
        {
          id: 'a1',
          phase: 'opening',
          speakerRole: 'prosecution',
          speakerName: 'Priya',
          avatar: '',
          content: 'The refrigerator note clearly gave notice. Exhibit A proves Marcus was in the flat.',
          timestamp: Date.now()
        },
        {
          id: 'a2',
          phase: 'opening',
          speakerRole: 'defense',
          speakerName: 'Marcus',
          avatar: '',
          content: 'The smartwatch telemetry proves I was asleep at 52 bpm deep sleep.',
          timestamp: Date.now()
        }
      ],
      SEED_CASES[0].startingEvidence,
      []
    );

    const hasScores = verdict.scores.prosecution.total > 0 && verdict.scores.defense.total > 0;
    const hasConfidence = verdict.confidence >= 50 && verdict.confidence <= 100;
    const hasFeedback = verdict.reasoningFeedback && verdict.reasoningFeedback.length > 10;

    if (hasScores && hasConfidence && hasFeedback) {
      results.push({ name: 'Final Verdict & Scoring Breakdown Test', success: true });
    } else {
      results.push({ name: 'Final Verdict & Scoring Breakdown Test', success: false, details: 'Verdict metrics missing' });
    }
  } catch (e: any) {
    results.push({ name: 'Final Verdict & Scoring Breakdown Test', success: false, details: e.message });
  }

  // Test 6: Gamification Elo Calculation
  try {
    const profile = storageService.getProfile();
    const initialElo = profile.eloRating;
    const mockVerdict = await aiJudgeService.generateVerdict(SEED_CASES[0], [], SEED_CASES[0].startingEvidence, []);
    mockVerdict.winner = 'prosecution';

    const updatedProfile = storageService.recordMatchResult(mockVerdict, 'prosecution');
    const eloChanged = updatedProfile.eloRating !== initialElo;
    const xpIncreased = updatedProfile.xp > profile.xp;

    if (eloChanged && xpIncreased) {
      results.push({ name: 'Elo Rating & XP Gamification Test', success: true });
    } else {
      results.push({ name: 'Elo Rating & XP Gamification Test', success: false, details: 'Elo or XP did not update correctly' });
    }
  } catch (e: any) {
    results.push({ name: 'Elo Rating & XP Gamification Test', success: false, details: e.message });
  }

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  return { passed, failed, results };
}
