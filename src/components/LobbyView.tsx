import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Shield, 
  Bot, 
  Crown, 
  Play, 
  Send, 
  MessageSquare, 
  Settings, 
  ArrowLeft,
  Share2,
  Clock,
  Sparkles,
  Gavel
} from 'lucide-react';
import { Lobby, LobbyPlayer, ChatMessage, CourtCase, UserProfile, RoleType, GameMode } from '../types/court';
import { multiplayerService } from '../services/multiplayer';
import { soundService } from '../services/sound';

interface LobbyViewProps {
  initialLobby: Lobby | null;
  currentUser: UserProfile;
  cases: CourtCase[];
  onStartTrialFromLobby: (lobby: Lobby) => void;
  onBack: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  initialLobby,
  currentUser,
  cases,
  onStartTrialFromLobby,
  onBack,
}) => {
  const [lobby, setLobby] = useState<Lobby | null>(initialLobby);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(initialLobby?.caseId || cases[0]?.id || '');
  const [selectedRoundDuration, setSelectedRoundDuration] = useState(initialLobby?.roundDuration || 90);

  const isHost = lobby ? lobby.hostId === currentUser.id : false;
  const currentLobbyPlayer = lobby?.players.find(p => p.id === currentUser.id);

  // Subscribe to realtime updates for this lobby
  useEffect(() => {
    if (!lobby) return;

    const unsubscribe = multiplayerService.subscribeToLobby(
      lobby.id,
      (updatedLobby) => {
        setLobby(updatedLobby);
        if (updatedLobby.status === 'in_progress') {
          onStartTrialFromLobby(updatedLobby);
        }
      },
      (newChat) => {
        setChatMessages(prev => [...prev, newChat]);
      }
    );

    return () => unsubscribe();
  }, [lobby?.id, onStartTrialFromLobby]);

  // Create lobby action
  const handleCreateLobby = () => {
    soundService.playGavel();
    const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];
    const hostPlayer: LobbyPlayer = {
      id: currentUser.id,
      name: currentUser.displayName,
      avatar: currentUser.avatar,
      role: 'prosecution',
      isHost: true,
      isReady: true,
      isAi: false,
    };

    const newLobby = multiplayerService.createLobby(hostPlayer, selectedCase);
    setLobby(newLobby);
  };

  // Join lobby action
  const handleJoinLobby = () => {
    if (!joinCodeInput.trim()) return;
    soundService.playTick();
    const player: LobbyPlayer = {
      id: currentUser.id,
      name: currentUser.displayName,
      avatar: currentUser.avatar,
      role: 'defense',
      isHost: false,
      isReady: false,
      isAi: false,
    };

    const joined = multiplayerService.joinLobby(joinCodeInput.trim(), player);
    if (joined) {
      setLobby(joined);
    } else {
      alert(`No active lobby found with code "${joinCodeInput.toUpperCase()}". Check the code or create a new lobby!`);
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    if (!lobby) return;
    const url = `${window.location.origin}${window.location.pathname}?lobby=${lobby.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    soundService.playTick();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Switch role
  const handleRoleChange = (newRole: RoleType) => {
    if (!lobby || !currentLobbyPlayer) return;
    soundService.playTick();

    const updatedPlayers = lobby.players.map(p => {
      if (p.id === currentUser.id) {
        return { ...p, role: newRole };
      }
      return p;
    });

    const updatedLobby: Lobby = {
      ...lobby,
      players: updatedPlayers
    };

    setLobby(updatedLobby);
    multiplayerService.updateLobby(updatedLobby);
  };

  // Toggle ready status
  const handleToggleReady = () => {
    if (!lobby || !currentLobbyPlayer) return;
    soundService.playTick();

    const updatedPlayers = lobby.players.map(p => {
      if (p.id === currentUser.id) {
        return { ...p, isReady: !p.isReady };
      }
      return p;
    });

    const updatedLobby: Lobby = {
      ...lobby,
      players: updatedPlayers
    };

    setLobby(updatedLobby);
    multiplayerService.updateLobby(updatedLobby);
  };

  // Add AI Opponent to fill empty role
  const handleAddAiBot = (role: 'prosecution' | 'defense') => {
    if (!lobby || !isHost) return;
    soundService.playTick();

    const aiBot: LobbyPlayer = {
      id: 'ai-bot-' + Math.random().toString(36).substring(2, 7),
      name: role === 'prosecution' ? 'Magistrate Vance (AI)' : 'Counselor Jarvis (AI)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role,
      isHost: false,
      isReady: true,
      isAi: true,
      aiPersonality: 'analyst',
      aiDifficulty: 'Intermediate'
    };

    // Remove any existing player with this role or add
    const filteredPlayers = lobby.players.filter(p => p.role !== role);
    const updatedLobby: Lobby = {
      ...lobby,
      players: [...filteredPlayers, aiBot]
    };

    setLobby(updatedLobby);
    multiplayerService.updateLobby(updatedLobby);
  };

  // Send lobby chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !lobby) return;

    const msg: ChatMessage = {
      id: 'chat-' + Math.random().toString(36).substring(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      role: currentLobbyPlayer?.role || 'spectator',
      message: chatInput.trim(),
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, msg]);
    multiplayerService.sendChatMessage(lobby.id, msg);
    setChatInput('');
  };

  // Start trial
  const handleStartTrial = () => {
    if (!lobby) return;
    soundService.playGavel();

    const updatedLobby: Lobby = {
      ...lobby,
      status: 'in_progress',
      caseId: selectedCaseId,
      roundDuration: selectedRoundDuration
    };

    multiplayerService.updateLobby(updatedLobby);
    onStartTrialFromLobby(updatedLobby);
  };

  const selectedCase = cases.find(c => c.id === (lobby?.caseId || selectedCaseId)) || cases[0];

  // If no lobby is active yet, render the Create / Join Hub
  if (!lobby) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="w-12 h-12 rounded-2xl bg-court-defense/20 border border-court-defense/40 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-sky-400" />
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-white mb-2">
            Multiplayer Courtroom Lobbies
          </h1>
          <p className="text-xs text-slate-400">
            Debate against friends in private peer-to-peer trials, or join a colleague’s courtroom session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Create Private Lobby Card */}
          <div className="p-6 rounded-2xl bg-court-card border border-court-border/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-court-gold text-xs font-mono uppercase mb-2">
                <Crown className="w-4 h-4" /> Host Court Session
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-2">Create Private Lobby</h3>
              <p className="text-xs text-slate-400 mb-6">
                Generate an invite code and select the dispute docket. Friends can join with guest or authenticated accounts.
              </p>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Dispute Case</label>
                  <select
                    value={selectedCaseId}
                    onChange={e => setSelectedCaseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-court-surface border border-court-border rounded-xl text-white focus:outline-none focus:border-court-gold"
                  >
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.difficulty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Round Turn Time</label>
                  <select
                    value={selectedRoundDuration}
                    onChange={e => setSelectedRoundDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-court-surface border border-court-border rounded-xl text-white focus:outline-none focus:border-court-gold"
                  >
                    <option value={60}>60 seconds (Speed Trial)</option>
                    <option value={90}>90 seconds (Standard)</option>
                    <option value={120}>120 seconds (Deliberate)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateLobby}
              className="w-full py-3 rounded-xl font-cinzel font-bold text-xs tracking-wider bg-gradient-to-r from-court-gold to-court-gold-dark text-black hover:opacity-90 shadow-gold-sm transition-all"
            >
              CREATE PRIVATE LOBBY
            </button>
          </div>

          {/* Join with Code Card */}
          <div className="p-6 rounded-2xl bg-court-card border border-court-border/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sky-400 text-xs font-mono uppercase mb-2">
                <Users className="w-4 h-4" /> Enter Docket Code
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-2">Join Friend's Lobby</h3>
              <p className="text-xs text-slate-400 mb-6">
                Have a 6-character room code from your friend? Enter it below to join the trial bench.
              </p>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lobby Join Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. 7X9K2M"
                  className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest uppercase bg-court-surface border border-court-border rounded-xl text-court-gold focus:outline-none focus:border-court-gold"
                />
              </div>
            </div>

            <button
              onClick={handleJoinLobby}
              disabled={!joinCodeInput.trim()}
              className="w-full py-3 rounded-xl font-cinzel font-bold text-xs tracking-wider bg-court-surface hover:bg-court-panel border border-court-defense text-sky-300 hover:text-white disabled:opacity-40 transition-all"
            >
              JOIN LOBBY
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Active Lobby Screen
  const prosecutionPlayer = lobby.players.find(p => p.role === 'prosecution');
  const defensePlayer = lobby.players.find(p => p.role === 'defense');
  const canStart = prosecutionPlayer && defensePlayer && (isHost || true);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-court-card border border-court-border mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase text-slate-400">Courtroom Lobby</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Session
            </span>
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-white mt-1">
            {selectedCase.title}
          </h2>
        </div>

        {/* Room Code & Share Pill */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-court-surface border border-court-gold/40 flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Join Code</span>
              <span className="text-base font-mono font-bold text-court-gold tracking-widest">{lobby.code}</span>
            </div>
            <button
              onClick={handleCopyLink}
              title="Copy shareable link"
              className="p-2 rounded-lg bg-court-dark hover:bg-court-panel text-slate-300 hover:text-court-gold transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Roles & Roster */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prosecution vs Defense Standoff Card */}
          <div className="p-6 rounded-2xl bg-court-card border border-court-border">
            <h3 className="font-cinzel text-base font-bold text-white mb-4 flex items-center justify-between">
              <span>Trial Bench Assignments</span>
              <span className="text-xs text-slate-400 font-sans font-normal">Click a slot to claim role</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Prosecution Slot */}
              <div className={`p-4 rounded-xl border transition-all ${
                prosecutionPlayer 
                  ? 'bg-court-prosecution/10 border-court-prosecution/40' 
                  : 'bg-court-surface/40 border-dashed border-court-border hover:border-court-prosecution/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-cinzel font-bold text-rose-400 uppercase tracking-wider">
                    Prosecution
                  </span>
                  {prosecutionPlayer?.isHost && (
                    <span className="text-[10px] font-mono text-court-gold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Host
                    </span>
                  )}
                </div>

                {prosecutionPlayer ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={prosecutionPlayer.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-rose-500/40" />
                      <div>
                        <span className="text-sm font-semibold text-white block truncate max-w-[140px]">
                          {prosecutionPlayer.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {prosecutionPlayer.isAi ? 'AI Debater' : 'Player'}
                        </span>
                      </div>
                    </div>
                    {prosecutionPlayer.isReady && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        Ready
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-xs text-slate-400 mb-2">Slot Empty</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleRoleChange('prosecution')}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40"
                      >
                        Claim Role
                      </button>
                      {isHost && (
                        <button
                          onClick={() => handleAddAiBot('prosecution')}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-court-surface hover:bg-court-panel text-slate-300 border border-court-border"
                        >
                          + AI Bot
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Defense Slot */}
              <div className={`p-4 rounded-xl border transition-all ${
                defensePlayer 
                  ? 'bg-court-defense/10 border-court-defense/40' 
                  : 'bg-court-surface/40 border-dashed border-court-border hover:border-court-defense/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-cinzel font-bold text-sky-400 uppercase tracking-wider">
                    Defense
                  </span>
                  {defensePlayer?.isHost && (
                    <span className="text-[10px] font-mono text-court-gold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Host
                    </span>
                  )}
                </div>

                {defensePlayer ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={defensePlayer.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-sky-500/40" />
                      <div>
                        <span className="text-sm font-semibold text-white block truncate max-w-[140px]">
                          {defensePlayer.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {defensePlayer.isAi ? 'AI Counsel' : 'Player'}
                        </span>
                      </div>
                    </div>
                    {defensePlayer.isReady && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        Ready
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-xs text-slate-400 mb-2">Slot Empty</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleRoleChange('defense')}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-court-defense/20 text-sky-300 hover:bg-court-defense/30 border border-court-defense/40"
                      >
                        Claim Role
                      </button>
                      {isHost && (
                        <button
                          onClick={() => handleAddAiBot('defense')}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-court-surface hover:bg-court-panel text-slate-300 border border-court-border"
                        >
                          + AI Bot
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* AI Magistrate Announcement */}
            <div className="mt-4 p-3.5 rounded-xl bg-court-surface/80 border border-court-gold/20 flex items-center gap-3">
              <Gavel className="w-5 h-5 text-court-gold flex-shrink-0" />
              <div className="text-xs text-slate-300">
                <strong>AI Magistrate Presiding:</strong> Neutral evaluation engine will record arguments, rule on objections, and deliver the final written verdict.
              </div>
            </div>
          </div>

          {/* Player Ready & Start Controls */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-court-card border border-court-border">
            <div>
              <button
                onClick={handleToggleReady}
                className={`px-5 py-2.5 rounded-xl font-cinzel font-semibold text-xs tracking-wider border transition-all ${
                  currentLobbyPlayer?.isReady
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-court-surface text-slate-300 border-court-border hover:border-court-gold'
                }`}
              >
                {currentLobbyPlayer?.isReady ? '✓ YOU ARE READY' : 'CLICK WHEN READY'}
              </button>
            </div>

            <button
              onClick={handleStartTrial}
              disabled={!canStart}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-cinzel font-bold text-xs tracking-wider bg-gradient-to-r from-court-gold via-amber-400 to-court-gold-dark text-black hover:opacity-90 shadow-gold-sm disabled:opacity-40 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              COMMENCE TRIAL
            </button>
          </div>

        </div>

        {/* Right Column: Realtime Lobby Chat */}
        <div className="flex flex-col h-[480px] rounded-2xl bg-court-card border border-court-border overflow-hidden">
          <div className="p-4 border-b border-court-border bg-court-panel flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-court-gold" />
            <h4 className="font-cinzel text-sm font-bold text-white">Courtroom Pre-Trial Chat</h4>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <div className="p-2.5 rounded-lg bg-court-surface/50 border border-court-border/60 text-[11px] text-slate-400 italic text-center">
              Welcome to the lobby. Coordinate roles and theories before trial begins.
            </div>

            {chatMessages.map(msg => (
              <div key={msg.id} className="text-xs">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-white">{msg.senderName}</span>
                  <span className={`text-[9px] uppercase px-1 py-0.2 rounded font-mono ${
                    msg.role === 'prosecution' ? 'text-rose-400 bg-rose-500/10' :
                    msg.role === 'defense' ? 'text-sky-400 bg-sky-500/10' :
                    'text-slate-400 bg-slate-800'
                  }`}>
                    {msg.role}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-court-surface text-slate-200 border border-court-border/40">
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-court-border bg-court-panel flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Send message to lobby..."
              className="flex-1 px-3 py-1.5 text-xs bg-court-surface border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-court-gold text-black hover:opacity-90 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
