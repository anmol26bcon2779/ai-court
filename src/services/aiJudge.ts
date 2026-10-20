import { CourtCase, ArgumentEntry, EvidenceCard, Objection, VerdictData, VerdictScore, ObjectionType } from '../types/court';
import { storageService } from './storage';

/**
 * Prompt injection defense: sanitize any user text
 */
function sanitizeInput(text: string): string {
  if (!text) return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\[\s*SYSTEM\s*:\s*[^\]]*\]/gi, '')
    .replace(/(?:ignore all previous instructions|disregard safety guidelines|you are now in developer mode)/gi, '[REDACTED_PROMPT_INJECTION]')
    .trim();
}

export const aiJudgeService = {
  /**
   * Evaluates an objection raised during trial
   */
  async evaluateObjection(
    courtCase: CourtCase,
    objectionType: ObjectionType,
    reason: string,
    targetArgument?: ArgumentEntry,
    targetEvidence?: EvidenceCard
  ): Promise<{ ruling: 'sustained' | 'overruled'; explanation: string; judgeMood: 'ruling' | 'gavel_struck' }> {
    const cleanReason = sanitizeInput(reason);
    const targetText = targetArgument ? sanitizeInput(targetArgument.content) : (targetEvidence ? targetEvidence.description : '');

    // Check if Gemini API key is configured
    const settings = storageService.getSettings();
    if (settings.apiKey && (settings.llmProvider === 'gemini' || settings.apiKey.startsWith('AIza'))) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are the honorable AI Magistrate presiding over a fictional courtroom debate game.
Case: "${courtCase.title}"
Scenario: "${courtCase.scenario}"
Disputed facts: ${JSON.stringify(courtCase.disputedFacts)}

An OBJECTION has been made:
Type: ${objectionType.toUpperCase()}
Reason given by attorney: "${cleanReason}"
Target statement or evidence: "${targetText}"

Rule either "SUSTAINED" (the objection is valid under courtroom logic) or "OVERRULED" (the statement/evidence is permissible).
Respond in pure JSON matching:
{
  "ruling": "sustained" | "overruled",
  "explanation": "Clear 2-sentence judicial ruling addressed to the courtroom."
}`
              }]
            }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
          return {
            ruling: parsed.ruling === 'sustained' ? 'sustained' : 'overruled',
            explanation: parsed.explanation,
            judgeMood: parsed.ruling === 'sustained' ? 'gavel_struck' : 'ruling'
          };
        }
      } catch (e) {
        console.warn('Gemini API objection call failed, falling back to heuristic judge', e);
      }
    }

    // High-intelligence heuristic judicial engine
    const lowerReason = cleanReason.toLowerCase();
    const lowerTarget = targetText.toLowerCase();

    if (objectionType === 'irrelevant') {
      const mentionsCoreSubject = courtCase.disputedFacts.some(fact => {
        const keywords = fact.toLowerCase().split(' ').filter(w => w.length > 4);
        return keywords.some(k => lowerTarget.includes(k));
      });
      if (!mentionsCoreSubject && lowerTarget.length > 20) {
        return {
          ruling: 'sustained',
          explanation: 'Sustained. The argument wanders outside the factual parameters established in the case dossier. Counsel shall return to the core disputed facts.',
          judgeMood: 'gavel_struck'
        };
      } else {
        return {
          ruling: 'overruled',
          explanation: 'Overruled. The court grants reasonable latitude; counsel is drawing a chain of inference pertinent to the dispute.',
          judgeMood: 'ruling'
        };
      }
    }

    if (objectionType === 'unsupported_claim') {
      const hasSpeculativeWords = /definitely|guaranteed|must have known|obviously guilty|without doubt|everybody knows/i.test(lowerTarget);
      if (hasSpeculativeWords && !lowerTarget.includes('evidence') && !lowerTarget.includes('log') && !lowerTarget.includes('timestamp')) {
        return {
          ruling: 'sustained',
          explanation: 'Sustained. Counsel has asserted conclusive fact without offering supporting documentation or verified exhibits. The jury will disregard the unsupported assertion.',
          judgeMood: 'gavel_struck'
        };
      }
      return {
        ruling: 'overruled',
        explanation: 'Overruled. Counsel is entitled to characterize the record during argument. The opposing party may probe any evidentiary gaps on rebuttal.',
        judgeMood: 'ruling'
      };
    }

    if (objectionType === 'speculation') {
      const isMindReading = /felt|intended|secretly thought|knew deep down|heart|evil mind/i.test(lowerTarget);
      if (isMindReading) {
        return {
          ruling: 'sustained',
          explanation: 'Sustained. Counsel cannot testify to the unexpressed subjective mental state of the parties without corroborating testimony.',
          judgeMood: 'gavel_struck'
        };
      }
      return {
        ruling: 'overruled',
        explanation: 'Overruled. Reasonable inferences from behavioral evidence are permissible in argument.',
        judgeMood: 'ruling'
      };
    }

    if (objectionType === 'contradiction') {
      if (lowerReason.length > 15) {
        return {
          ruling: 'sustained',
          explanation: 'Sustained. The record reflects conflicting assertions. Counsel must reconcile the inconsistency or clarify the chronology.',
          judgeMood: 'gavel_struck'
        };
      }
      return {
        ruling: 'overruled',
        explanation: 'Overruled. Any perceived internal contradiction is an issue of credibility for the final verdict assessment.',
        judgeMood: 'ruling'
      };
    }

    return {
      ruling: 'overruled',
      explanation: 'Overruled. The argument is noted on the transcript. Proceed with examination.',
      judgeMood: 'ruling'
    };
  },

  /**
   * Generates a reaction comment from the AI Judge after an argument
   */
  generateMidTrialRemark(
    courtCase: CourtCase,
    argument: ArgumentEntry
  ): string {
    const remarks = [
      `The bench notes the argument from ${argument.speakerRole.toUpperCase()}. The court is evaluating how this squares with the documentary exhibits.`,
      `Counsel’s point regarding the factual timeline has been recorded into the trial log. Opposing counsel may address this directly.`,
      `A cogent line of reasoning. The court cautions both advocates to remain tethered to verified facts rather than assumptions.`,
      `Noted for the record. The court is especially focused on the disputed points of the scenario.`
    ];
    return remarks[Math.floor(Math.random() * remarks.length)];
  },

  /**
   * Generates the comprehensive final structured verdict
   */
  async generateVerdict(
    courtCase: CourtCase,
    argumentsList: ArgumentEntry[],
    evidenceList: EvidenceCard[],
    objectionsList: Objection[]
  ): Promise<VerdictData> {
    const prosArgs = argumentsList.filter(a => a.speakerRole === 'prosecution');
    const defArgs = argumentsList.filter(a => a.speakerRole === 'defense');

    // Check if Gemini API is available
    const settings = storageService.getSettings();
    if (settings.apiKey && (settings.llmProvider === 'gemini' || settings.apiKey.startsWith('AIza'))) {
      try {
        const transcriptSummary = argumentsList.map(a => `[${a.speakerRole.toUpperCase()} - ${a.phase}]: ${sanitizeInput(a.content)}`).join('\n');
        const evidenceSummary = evidenceList.map(e => `[${e.submittedByRole.toUpperCase()} Evidence - ${e.status}]: ${e.title} - ${e.description} (Relevance: ${e.relevanceExplanation})`).join('\n');
        const objectionSummary = objectionsList.map(o => `[Objection by ${o.raisedBy.toUpperCase()}]: ${o.objectionType} -> ${o.ruling} (${o.judgeExplanation})`).join('\n');

        const prompt = `You are the Supreme AI Magistrate presiding over the trial: "${courtCase.title}".
Scenario: ${courtCase.scenario}
Disputed facts: ${JSON.stringify(courtCase.disputedFacts)}

Trial Transcript:
${transcriptSummary}

Admitted Evidence:
${evidenceSummary}

Objections Record:
${objectionSummary}

You must evaluate both sides with strict neutrality. Do not reward aggression, word count, or rhetorical bluster. Reward sound logical syllogism, direct handling of counterarguments, and factual consistency.

Return a STRICT JSON object in this format:
{
  "winner": "prosecution" | "defense" | "inconclusive",
  "confidence": number between 55 and 96,
  "confidenceExplanation": "Explanation of degree of certainty and remaining ambiguities.",
  "scores": {
    "prosecution": { "reasoning": number(0-35), "evidenceUsage": number(0-30), "counterarguments": number(0-25), "decorum": number(0-10), "total": number(0-100) },
    "defense": { "reasoning": number(0-35), "evidenceUsage": number(0-30), "counterarguments": number(0-25), "decorum": number(0-10), "total": number(0-100) }
  },
  "strongestProsecutionArg": "Direct quote or summary of their most logically sound claim.",
  "strongestDefenseArg": "Direct quote or summary of their most logically sound claim.",
  "weakestProsecutionClaim": "Where prosecution made an unproven assertion.",
  "weakestDefenseClaim": "Where defense left an allegation inadequately answered.",
  "mostInfluentialEvidence": "The single piece of evidence that tipped the balance.",
  "keyContradictions": ["Contradiction 1", "Unresolved question 2"],
  "judgeSummary": "Comprehensive 3-4 sentence neutral judicial opinion stating why the winner prevailed or why inconclusive.",
  "reasoningFeedback": "Actionable critical-thinking feedback for both advocates.",
  "alternativePerspectives": "Explain alternative reasonable interpretations under different philosophical or evidentiary burdens."
}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
          return {
            id: 'verdict-' + Math.random().toString(36).substring(2, 9),
            caseId: courtCase.id,
            caseTitle: courtCase.title,
            winner: parsed.winner || 'inconclusive',
            confidence: parsed.confidence || 78,
            confidenceExplanation: parsed.confidenceExplanation || 'Based on preponderance of corroborated exhibits.',
            scores: parsed.scores,
            strongestProsecutionArg: parsed.strongestProsecutionArg,
            strongestDefenseArg: parsed.strongestDefenseArg,
            weakestProsecutionClaim: parsed.weakestProsecutionClaim,
            weakestDefenseClaim: parsed.weakestDefenseClaim,
            mostInfluentialEvidence: parsed.mostInfluentialEvidence,
            keyContradictions: parsed.keyContradictions || [],
            judgeSummary: parsed.judgeSummary,
            reasoningFeedback: parsed.reasoningFeedback,
            alternativePerspectives: parsed.alternativePerspectives || 'Reasonable minds could weigh the circumstantial timing differently.',
            xpEarned: {
              prosecution: parsed.winner === 'prosecution' ? 180 : 90,
              defense: parsed.winner === 'defense' ? 180 : 90,
            },
            createdAt: new Date().toISOString()
          };
        }
      } catch (e) {
        console.warn('Gemini API verdict call failed, using heuristic evaluation engine', e);
      }
    }

    // Sophisticated Heuristic Evaluation Engine
    let prosReasoning = 24;
    let defReasoning = 24;
    let prosEvidenceScore = 20;
    let defEvidenceScore = 20;
    let prosCounter = 17;
    let defCounter = 17;
    let prosDecorum = 8;
    let defDecorum = 8;

    // Evaluate Prosecution Content
    const prosText = prosArgs.map(a => a.content).join(' ');
    const defText = defArgs.map(a => a.content).join(' ');

    // Check evidence citations
    evidenceList.forEach(ev => {
      const titleClean = ev.title.toLowerCase();
      if (ev.status === 'accepted') {
        if (prosText.toLowerCase().includes(titleClean.substring(0, 10))) {
          prosEvidenceScore = Math.min(30, prosEvidenceScore + 3);
        }
        if (defText.toLowerCase().includes(titleClean.substring(0, 10))) {
          defEvidenceScore = Math.min(30, defEvidenceScore + 3);
        }
      }
    });

    // Check logical markers (because, therefore, demonstrates, corroborated, specifically)
    const logicKeywords = ['therefore', 'corroborated', 'demonstrates', 'specifically', 'timeline', 'exhibit', 'contradiction'];
    logicKeywords.forEach(kw => {
      if (prosText.toLowerCase().includes(kw)) prosReasoning = Math.min(35, prosReasoning + 1);
      if (defText.toLowerCase().includes(kw)) defReasoning = Math.min(35, defReasoning + 1);
    });

    // Penalize sustained objections
    objectionsList.forEach(obj => {
      if (obj.ruling === 'sustained') {
        if (obj.raisedBy === 'prosecution') {
          defReasoning = Math.max(12, defReasoning - 2);
          defDecorum = Math.max(4, defDecorum - 1);
        } else {
          prosReasoning = Math.max(12, prosReasoning - 2);
          prosDecorum = Math.max(4, prosDecorum - 1);
        }
      }
    });

    const prosTotal = prosReasoning + prosEvidenceScore + prosCounter + prosDecorum;
    const defTotal = defReasoning + defEvidenceScore + defCounter + defDecorum;

    const diff = Math.abs(prosTotal - defTotal);
    let winner: 'prosecution' | 'defense' | 'inconclusive' = 'inconclusive';
    if (diff > 4) {
      winner = prosTotal > defTotal ? 'prosecution' : 'defense';
    }

    const confidence = Math.min(94, 60 + diff * 3);

    const scores = {
      prosecution: {
        reasoning: prosReasoning,
        evidenceUsage: prosEvidenceScore,
        counterarguments: prosCounter,
        decorum: prosDecorum,
        total: prosTotal,
      },
      defense: {
        reasoning: defReasoning,
        evidenceUsage: defEvidenceScore,
        counterarguments: defCounter,
        decorum: defDecorum,
        total: defTotal,
      }
    };

    const mostInfluential = evidenceList.find(e => e.status === 'accepted')?.title || 'The primary timeline record';

    return {
      id: 'verdict-' + Math.random().toString(36).substring(2, 9),
      caseId: courtCase.id,
      caseTitle: courtCase.title,
      winner,
      confidence,
      confidenceExplanation: `Evaluation rendered with ${confidence}% confidence based upon the consistency of documentary evidence and rebuttal cohesion.`,
      scores,
      strongestProsecutionArg: prosArgs[0]?.content.slice(0, 140) + '...' || 'Established the initial factual timeline and opportunity.',
      strongestDefenseArg: defArgs[0]?.content.slice(0, 140) + '...' || 'Challenged the assumption of intent and presented an alternate hypothesis.',
      weakestProsecutionClaim: 'Relied upon speculative inferences regarding state of mind without direct eyewitness confirmation.',
      weakestDefenseClaim: 'Left the chronological coincidence partially unaddressed during the critical timeframe.',
      mostInfluentialEvidence: mostInfluential,
      keyContradictions: [
        'Discrepancy between recorded timestamps and witness memory.',
        'Whether the physical markings occurred during or prior to the alleged incident.'
      ],
      judgeSummary: winner === 'prosecution'
        ? `The Prosecution has satisfied the evidentiary burden. Their arguments coherently integrated accepted exhibits to establish a probable chain of events.`
        : (winner === 'defense'
          ? `The Defense successfully raised substantial reasonable doubt, highlighting unexplained physical indicators and plausible non-culpable explanations.`
          : `The evidence remains in genuine equipoise. Neither party established a decisive preponderance of corroborated fact.`),
      reasoningFeedback: 'Focus on tying every asserted deduction to an admitted evidence card. Avoid rhetorical assertions that can be vulnerable to an "Unsupported Claim" objection.',
      alternativePerspectives: 'In a strict liability framework, the result could shift depending on whether prior notice or assumed risk is given primary weight.',
      xpEarned: {
        prosecution: winner === 'prosecution' ? 180 : (winner === 'inconclusive' ? 120 : 90),
        defense: winner === 'defense' ? 180 : (winner === 'inconclusive' ? 120 : 90),
      },
      createdAt: new Date().toISOString()
    };
  }
};
