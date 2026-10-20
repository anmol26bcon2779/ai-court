import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, ShieldAlert, Check } from 'lucide-react';
import { CourtCase, CaseCategory, Difficulty } from '../types/court';
import { soundService } from '../services/sound';

interface CustomCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCase: (newCase: CourtCase) => void;
}

export const CustomCaseModal: React.FC<CustomCaseModalProps> = ({
  isOpen,
  onClose,
  onSaveCase,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<CaseCategory>('everyday');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [estimatedDuration, setEstimatedDuration] = useState('12 mins');
  const [scenario, setScenario] = useState('');
  const [disputedFacts, setDisputedFacts] = useState<string[]>([
    'Timeline of the primary event',
    'Origin of physical or digital trace'
  ]);
  const [newFact, setNewFact] = useState('');
  const [prosecutionTheory, setProsecutionTheory] = useState('');
  const [defenseTheory, setDefenseTheory] = useState('');
  const [tagsInput, setTagsInput] = useState('Custom Case, Community Drama');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleAddFact = () => {
    if (newFact.trim()) {
      setDisputedFacts([...disputedFacts, newFact.trim()]);
      setNewFact('');
    }
  };

  const handleRemoveFact = (index: number) => {
    setDisputedFacts(disputedFacts.filter((_, i) => i !== index));
  };

  const handleGenerateAiPrompt = () => {
    setIsGenerating(true);
    soundService.playTick();

    const presets = [
      {
        title: 'The Borrowed DSLR & The Monsoon Flood',
        tagline: 'Did Liam ruin a \$2,400 Sony camera, or was it a pre-existing lens fungus defect?',
        category: 'everyday' as CaseCategory,
        difficulty: 'Beginner' as Difficulty,
        scenario: 'Priya lent her vintage Sony A7III to roommate Liam for a weekend music festival. The camera returned with fogged optics and a cracked battery latch. Liam claims the torrential festival rain seeped into an already degraded weather seal.',
        prosecution: 'Liam failed to exercise ordinary care, took the non-waterproof body into a rainstorm without housing, and is obligated to cover replacement.',
        defense: 'Priya failed to disclose that the weather seals had perished two years ago; the failure was inevitable wear-and-tear under typical atmospheric humidity.',
        facts: ['Whether Liam exposed the gear to direct rain without cover', 'Prior service history of the rubber housing seals']
      },
      {
        title: 'The AI Code Copilot License Infringement',
        tagline: 'Did a rogue developer leak GPL-licensed code into an enterprise SaaS binary?',
        category: 'tech' as CaseCategory,
        difficulty: 'Expert' as Difficulty,
        scenario: 'FinTech unicorn LedgerFlow released their v3 engine, only for open-source audits to reveal an exact 80-line mathematical hashing algorithm copied from an AGPLv3 repository. Former senior dev Chloe claims the AI autocomplete inserted the code automatically without license attribution.',
        prosecution: 'Chloe disabled the internal IP scanner and willfully included copyleft code to hit an executive deadline.',
        defense: 'The enterprise IDE copilot tool hallucinated the snippet as public domain; strict liability should not fall on the individual engineer.',
        facts: ['Audit logs of Chloe’s IDE license filter toggles', 'Whether the hashing algorithm exists in public academic papers']
      }
    ];

    const pick = presets[Math.floor(Math.random() * presets.length)];
    setTimeout(() => {
      setTitle(pick.title);
      setTagline(pick.tagline);
      setCategory(pick.category);
      setDifficulty(pick.difficulty);
      setScenario(pick.scenario);
      setProsecutionTheory(pick.prosecution);
      setDefenseTheory(pick.defense);
      setDisputedFacts(pick.facts);
      setIsGenerating(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scenario.trim() || !prosecutionTheory.trim() || !defenseTheory.trim()) {
      alert('Please fill in the required case fields.');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const newCase: CourtCase = {
      id: 'custom-' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      tagline: tagline.trim() || title.trim(),
      category,
      difficulty,
      estimatedDuration,
      scenario: scenario.trim(),
      disputedFacts: disputedFacts.length > 0 ? disputedFacts : ['Timeline and primary responsibility'],
      prosecutionTheory: prosecutionTheory.trim(),
      defenseTheory: defenseTheory.trim(),
      tags: tags.length > 0 ? tags : ['User Case'],
      supportsAi: true,
      supportsMultiplayer: true,
      isCustom: true,
      startingEvidence: [
        {
          id: 'ev-cust-1',
          title: 'Primary Incident Log / Exhibit A',
          description: `Initial evidence record submitted regarding: ${title}`,
          category: 'witness_statement',
          source: 'Prosecution submission file',
          timestamp: 'Initial Case Filing',
          relevanceExplanation: 'Establishes factual baseline for the disputed claims.',
          status: 'accepted',
          submittedByRole: 'prosecution',
          isFictionalDisclaimer: true,
        }
      ]
    };

    soundService.playGavel();
    onSaveCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-court-card border border-court-gold/30 rounded-2xl shadow-gold-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-court-border bg-court-panel">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-court-gold/15 text-court-gold">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-white">Create Custom Court Case</h3>
              <p className="text-xs text-slate-400">Design an original debate docket for friends or AI opponents</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-court-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* AI Idea Generator Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateAiPrompt}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-court-gold/15 hover:bg-court-gold/25 text-court-gold border border-court-gold/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? 'Generating Scenario...' : 'AI Auto-Draft Idea'}
            </button>
          </div>

          {/* Title & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Case Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. The Ruined Borrowed DSLR"
                className="w-full px-3 py-2 text-sm bg-court-surface border border-court-border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-court-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tagline / Dramatic Hook
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Was it negligence or old equipment?"
                className="w-full px-3 py-2 text-sm bg-court-surface border border-court-border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-court-gold"
              />
            </div>
          </div>

          {/* Category, Difficulty & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CaseCategory)}
                className="w-full px-3 py-2 text-sm bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
              >
                <option value="everyday">Everyday Dispute</option>
                <option value="school">School / College</option>
                <option value="mystery">Mystery / Detective</option>
                <option value="ethics">Ethics / Philosophy</option>
                <option value="tech">Tech / AI</option>
                <option value="business">Business / Startup</option>
                <option value="history">Historical What-If</option>
                <option value="humor">Funny & Absurd</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 text-sm bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
              >
                <option value="Beginner">Beginner (10m)</option>
                <option value="Intermediate">Intermediate (15m)</option>
                <option value="Expert">Expert (20m)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
              <input
                type="text"
                value={estimatedDuration}
                onChange={e => setEstimatedDuration(e.target.value)}
                placeholder="10-15 mins"
                className="w-full px-3 py-2 text-sm bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
              />
            </div>
          </div>

          {/* Scenario Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Scenario & Background Lore *
            </label>
            <textarea
              required
              rows={3}
              value={scenario}
              onChange={e => setScenario(e.target.value)}
              placeholder="Describe what occurred, who is involved, and what the central controversy is..."
              className="w-full px-3 py-2 text-sm bg-court-surface border border-court-border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-court-gold"
            />
          </div>

          {/* Disputed Facts List */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Disputed Facts in Question
            </label>
            <div className="space-y-2 mb-2">
              {disputedFacts.map((fact, index) => (
                <div key={index} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-court-surface text-xs text-slate-200 border border-court-border">
                  <span>• {fact}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveFact(index)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFact}
                onChange={e => setNewFact(e.target.value)}
                placeholder="Add a disputed fact (e.g. Location of the key at 3 AM)"
                className="flex-1 px-3 py-1.5 text-xs bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
              />
              <button
                type="button"
                onClick={handleAddFact}
                className="px-3 py-1.5 rounded-lg bg-court-panel border border-court-border text-xs text-court-gold hover:bg-court-surface"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Prosecution & Defense Theories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-court-prosecution-light mb-1">
                Prosecution Core Theory *
              </label>
              <textarea
                required
                rows={2}
                value={prosecutionTheory}
                onChange={e => setProsecutionTheory(e.target.value)}
                placeholder="What must prosecution argue happened?"
                className="w-full px-3 py-2 text-xs bg-court-surface border border-court-prosecution/40 rounded-lg text-white focus:outline-none focus:border-court-prosecution"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sky-400 mb-1">
                Defense Core Theory *
              </label>
              <textarea
                required
                rows={2}
                value={defenseTheory}
                onChange={e => setDefenseTheory(e.target.value)}
                placeholder="What is the non-culpable explanation?"
                className="w-full px-3 py-2 text-xs bg-court-surface border border-court-defense/40 rounded-lg text-white focus:outline-none focus:border-court-defense"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Comma-Separated Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
            />
          </div>

          {/* Fictional Entertainment Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/80 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Fictional Content Safeguard:</strong> All cases must be original entertainment or educational scenarios. Real-world defamation or personal harassment allegations are strictly prohibited and will be rejected.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-court-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg font-cinzel font-bold text-xs bg-gradient-to-r from-court-gold to-court-gold-dark text-black hover:opacity-90 shadow-gold-sm transition-all"
            >
              <Check className="w-4 h-4" />
              Save & Register Case
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
