import { CourtCase, TrialPhase, ArgumentEntry, EvidenceCard, Difficulty } from '../types/court';
import { storageService } from './storage';

export type AiPersonality = 'analyst' | 'debater' | 'witty' | 'strategist';

export const aiOpponentService = {
  /**
   * Generates a courtroom argument for the AI opponent
   */
  async generateArgument(
    courtCase: CourtCase,
    phase: TrialPhase,
    role: 'prosecution' | 'defense',
    personality: AiPersonality = 'analyst',
    difficulty: Difficulty = 'Intermediate',
    previousArguments: ArgumentEntry[],
    evidenceList: EvidenceCard[]
  ): Promise<string> {
    const settings = storageService.getSettings();

    // Check if Gemini API is available
    if (settings.apiKey && (settings.llmProvider === 'gemini' || settings.apiKey.startsWith('AIza'))) {
      try {
        const lastOpponentArg = previousArguments
          .filter(a => a.speakerRole !== role)
          .slice(-1)[0]?.content || 'None yet';

        const personalityPrompt = {
          analyst: 'You are a calm, highly analytical advocate. You quote exact timestamps, probabilities, and logical premises without emotional hyperbole.',
          debater: 'You are a passionate, assertive trial attorney. You use sharp rhetoric, address the judge with conviction, and challenge opposing premises directly.',
          witty: 'You are a witty, charismatic litigator. You use sharp analogies, irony, and memorable metaphors while keeping the argument legally grounded.',
          strategist: 'You are a grandmaster courtroom strategist. You lay logical traps, expose hidden assumptions, and turn the opponent’s evidence against them.'
        }[personality];

        const difficultyPrompt = {
          Beginner: 'Keep the argument simple, straightforward, and 2-3 sentences.',
          Intermediate: 'Make a well-structured argument with 1 citation and a counter-punch, 3-4 sentences.',
          Expert: 'Deliver a formidable, airtight legal argument referencing evidence, attacking weak assumptions, 4-5 sentences.'
        }[difficulty];

        const prompt = `You are playing as ${role.toUpperCase()} in the fictional courtroom debate game "AI Court".
Case: "${courtCase.title}"
Scenario: "${courtCase.scenario}"
Disputed facts: ${JSON.stringify(courtCase.disputedFacts)}
Your Theory of the Case: "${role === 'prosecution' ? courtCase.prosecutionTheory : courtCase.defenseTheory}"
Current Trial Phase: "${phase}"

Opponent's last argument: "${lastOpponentArg}"

Style & Personality: ${personalityPrompt}
Difficulty level: ${difficultyPrompt}

Important Rules:
1. Stay strictly in character as ${role.toUpperCase()}.
2. Do not hallucinate external non-existent facts; stick to scenario facts and evidence.
3. Acknowledge uncertainty where appropriate.
4. Output ONLY your speech to the courtroom. Do not prefix with your role or stage directions.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const speech = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (speech) return speech;
        }
      } catch (e) {
        console.warn('Gemini API call failed for AI Opponent, using dynamic generator', e);
      }
    }

    // Dynamic, context-aware legal argument generator
    return this.generateProceduralArgument(courtCase, phase, role, personality, difficulty, previousArguments, evidenceList);
  },

  /**
   * Procedural argument generator matching role, case context, and personality
   */
  generateProceduralArgument(
    courtCase: CourtCase,
    phase: TrialPhase,
    role: 'prosecution' | 'defense',
    personality: AiPersonality,
    _difficulty: Difficulty,
    previousArguments: ArgumentEntry[],
    evidenceList: EvidenceCard[]
  ): string {
    const oppArg = previousArguments.filter(a => a.speakerRole !== role).slice(-1)[0]?.content || '';
    const relevantEvidence = evidenceList.filter(e => e.submittedByRole === role || e.status === 'accepted')[0];
    const evidenceTitle = relevantEvidence ? `Exhibit "${relevantEvidence.title}"` : 'the established timeline';

    if (phase === 'opening') {
      if (role === 'prosecution') {
        if (personality === 'analyst') {
          return `Your Honor, members of the court. The empirical record in "${courtCase.title}" reveals an unbroken sequence of cause and effect. As stated in the indictment, ${courtCase.prosecutionTheory}. The probability of coincidence is mathematically negligible. We intend to prove each element by concrete documentation.`;
        } else if (personality === 'debater') {
          return `Your Honor, justice cannot be obscured by technical excuses! The facts before this bench are unmistakable: ${courtCase.prosecutionTheory}. When you examine the timeline, you will see not an innocent misunderstanding, but deliberate action that demands accountability!`;
        } else if (personality === 'witty') {
          return `May it please the court! The defense would have you believe in statistical miracles, phantom culprits, and midnight coincidences. But in reality, ${courtCase.prosecutionTheory}. As the old saying goes: if it walks like a duck and smells of garlic butter, it isn't an optical illusion.`;
        } else {
          return `Your Honor, this case turns on three decisive facts: access, motive, and opportunity. Our theory is precise: ${courtCase.prosecutionTheory}. We ask the court to follow the evidentiary breadcrumbs rather than rhetorical smoke.`;
        }
      } else {
        // Defense opening
        if (personality === 'analyst') {
          return `Your Honor, the prosecution's case is built entirely upon speculative circumstantial correlation. As the defense will demonstrate, ${courtCase.defenseTheory}. The evidentiary threshold requires substantiation, not suspicion. We request a dispassionate review of the telemetry and physical exhibits.`;
        } else if (personality === 'debater') {
          return `Your Honor, an accusation without corroboration is nothing more than slander! My client stands blameless: ${courtCase.defenseTheory}. The prosecution has rushed to judgment while ignoring every piece of exculpatory evidence. We will not allow assumptions to substitute for truth!`;
        } else if (personality === 'witty') {
          return `Your Honor, my esteemed colleague has painted a dramatic Hollywood thriller, but unfortunately forgot the script and the facts. In truth: ${courtCase.defenseTheory}. Being in the vicinity of an incident is not a crime, or else half the city would be on trial today.`;
        } else {
          return `Your Honor, we invite the court to inspect the foundation of the prosecution’s theory. It collapses under the slightest scrutiny. We maintain that ${courtCase.defenseTheory}, and the physical indicators will affirm our position beyond question.`;
        }
      }
    }

    if (phase === 'evidence_submission' || phase === 'evidence_examination') {
      if (role === 'prosecution') {
        return `We draw the court's immediate attention to ${evidenceTitle}. Notice the timestamp and origin: this directly confirms ${courtCase.disputedFacts[0] || 'the timeline of events'}. It leaves no room for the alternate narrative advanced by opposing counsel.`;
      } else {
        return `The defense requests strict examination of ${evidenceTitle}. When properly contextualized alongside our client's verified statements, this exhibit actually refutes the claim of culpability and supports ${courtCase.defenseTheory}.`;
      }
    }

    if (phase === 'cross_examination') {
      if (role === 'prosecution') {
        return `Opposing counsel claims innocent coincidence, yet how do they explain the physical record? If there was no involvement, why does the forensic audit align precisely with the moment of the occurrence? We challenge the defense to provide one verifiable document to substantiate their alternate theory!`;
      } else {
        return `The prosecution asks this court to convict on guesswork. Can they produce a single eyewitness or direct log proving intentional malice? They cannot. Every piece of their purported proof is equally consistent with innocent third-party activity.`;
      }
    }

    if (phase === 'rebuttal') {
      const rebutTarget = oppArg.length > 10 ? `opposing counsel's claim that "${oppArg.slice(0, 40)}..."` : 'the opposing party’s assertions';
      if (role === 'prosecution') {
        return `In direct rebuttal to ${rebutTarget}: their hypothesis collapses because it fails to account for ${courtCase.disputedFacts[1] || 'the core disputed timeline'}. One cannot simply wave away concrete exhibits by postulating hypothetical intruders.`;
      } else {
        return `Addressing ${rebutTarget}: the prosecution is shifting the goalposts. The burden of proof rests entirely on them to establish culpability, and circumstantial proximity does not equate to verified fact under our standard of justice.`;
      }
    }

    // Closing phase
    if (role === 'prosecution') {
      return `Your Honor, the full evidentiary record is before you. We have shown motive, means, and documented opportunity. The defense has offered conjecture; we have offered verified exhibits and logical deduction. We respectfully submit that justice requires a verdict in favor of the Prosecution.`;
    } else {
      return `Your Honor, justice is served not by finding someone to blame, but by honoring the truth. The prosecution’s case is riddled with reasonable doubt and unanswered contradictions. On the evidence presented, my client is entitled to complete exoneration. We ask for a verdict for the Defense.`;
    }
  }
};
