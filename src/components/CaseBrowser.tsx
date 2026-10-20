import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Dices, 
  Sparkles, 
  Plus, 
  Clock, 
  Scale, 
  ShieldAlert, 
  Users, 
  Bot, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { CourtCase, CaseCategory, Difficulty } from '../types/court';
import { soundService } from '../services/sound';

interface CaseBrowserProps {
  cases: CourtCase[];
  onSelectCase: (courtCase: CourtCase, mode?: 'ai' | 'lobby') => void;
  onOpenCreateCase: () => void;
}

export const CaseBrowser: React.FC<CaseBrowserProps> = ({
  cases,
  onSelectCase,
  onOpenCreateCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Cases' },
    { id: 'everyday', label: 'Everyday & Dorm' },
    { id: 'school', label: 'School & College' },
    { id: 'mystery', label: 'Mystery & Detective' },
    { id: 'ethics', label: 'Ethics & Dilemmas' },
    { id: 'tech', label: 'Tech, AI & Media' },
    { id: 'business', label: 'Business & Startups' },
    { id: 'history', label: 'Historical What-If' },
    { id: 'humor', label: 'Absurd & Funny' },
    { id: 'custom', label: 'User Created' },
  ];

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = 
        selectedCategory === 'all' || 
        (selectedCategory === 'custom' ? c.isCustom : c.category === selectedCategory);

      const matchesDifficulty = 
        selectedDifficulty === 'all' || 
        c.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [cases, searchQuery, selectedCategory, selectedDifficulty]);

  const handleRandomCase = () => {
    soundService.playGavel();
    const pick = cases[Math.floor(Math.random() * cases.length)];
    if (pick) {
      onSelectCase(pick, 'ai');
    }
  };

  const handleDailyChallenge = () => {
    const daily = cases.find(c => c.isDaily) || cases[0];
    soundService.playTick();
    onSelectCase(daily, 'ai');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-court-gold text-xs font-mono uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            Interactive Case Registry
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-white">
            Courtroom Case Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Select a verified scenario to launch a trial, or craft your own fictional dispute.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleDailyChallenge}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-court-gold/15 text-court-gold border border-court-gold/40 hover:bg-court-gold/25 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Daily Challenge
          </button>

          <button
            onClick={handleRandomCase}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-court-surface hover:bg-court-panel border border-court-border text-slate-200 transition-all"
          >
            <Dices className="w-3.5 h-3.5 text-court-cyan" />
            Surprise Me (Random)
          </button>

          <button
            onClick={onOpenCreateCase}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-cinzel tracking-wide bg-gradient-to-r from-court-gold to-court-gold-dark text-black hover:opacity-90 shadow-gold-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Custom Case
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-court-panel/60 border border-court-border/80 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search scenarios, keywords, legal tags..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-court-surface border border-court-border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-court-gold/60"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 text-xs bg-court-surface border border-court-border rounded-xl text-slate-200 focus:outline-none focus:border-court-gold"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner (10 min)</option>
              <option value="Intermediate">Intermediate (15 min)</option>
              <option value="Expert">Expert (20 min)</option>
            </select>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-court-gold text-black font-semibold shadow-gold-sm'
                  : 'bg-court-surface/80 text-slate-300 hover:text-white hover:bg-court-card border border-court-border/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Case Grid */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-court-card border border-court-border">
          <Scale className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="font-cinzel text-lg font-bold text-white mb-1">No Matching Cases Found</h3>
          <p className="text-xs text-slate-400 mb-4">Try clearing filters or search terms, or create a brand new custom case.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedDifficulty('all'); }}
            className="text-xs text-court-gold underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-court-card/90 border border-court-border/80 hover:border-court-gold/40 shadow-court-card hover:shadow-gold-sm transition-all duration-300 group"
            >
              <div>
                {/* Meta Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-court-surface text-slate-300 border border-court-border">
                    {c.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {c.isDaily && (
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-court-gold/20 text-court-gold border border-court-gold/30">
                        Daily
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      {c.estimatedDuration}
                    </span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <h3 className="font-cinzel text-lg font-bold text-white group-hover:text-court-gold transition-colors mb-2">
                  {c.title}
                </h3>
                <p className="text-xs text-court-gold/90 italic mb-3">
                  "{c.tagline}"
                </p>

                {/* Scenario Synopsis */}
                <p className="text-xs text-slate-300/80 line-clamp-3 mb-4 leading-relaxed font-light">
                  {c.scenario}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] text-slate-400 bg-court-darker px-2 py-0.5 rounded border border-court-border/50">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-court-border/60 flex items-center justify-between gap-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  c.difficulty === 'Beginner' ? 'text-emerald-400 bg-emerald-500/10' :
                  c.difficulty === 'Intermediate' ? 'text-amber-400 bg-amber-500/10' :
                  'text-rose-400 bg-rose-500/10'
                }`}>
                  {c.difficulty}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectCase(c, 'lobby')}
                    title="Play with a friend in private lobby"
                    className="p-2 rounded-lg bg-court-surface hover:bg-court-defense/20 border border-court-defense/30 text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectCase(c, 'ai')}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-court-gold/15 hover:bg-court-gold text-court-gold hover:text-black border border-court-gold/40 transition-all font-cinzel"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Trial
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
