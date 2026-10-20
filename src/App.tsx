import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CaseBrowser } from './components/CaseBrowser';
import { CustomCaseModal } from './components/CustomCaseModal';
import { LobbyView } from './components/LobbyView';
import { Courtroom } from './components/Courtroom';
import { VerdictView } from './components/VerdictView';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { LeaderboardView } from './components/LeaderboardView';

import { CourtCase, UserProfile, Lobby, LobbyPlayer, VerdictData } from './types/court';
import { storageService, AppSettings } from './services/storage';
import { SEED_CASES } from './data/cases';
import { soundService } from './services/sound';

export function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<'landing' | 'cases' | 'lobby' | 'courtroom' | 'verdict' | 'leaderboard'>('landing');

  // User & Data State
  const [profile, setProfile] = useState<UserProfile>(storageService.getProfile());
  const [cases, setCases] = useState<CourtCase[]>(storageService.getAllCases());
  const [activeCase, setActiveCase] = useState<CourtCase>(SEED_CASES[0]);
  const [playerRole, setPlayerRole] = useState<'prosecution' | 'defense'>('prosecution');
  const [opponentPlayer, setOpponentPlayer] = useState<LobbyPlayer>({
    id: 'ai-opponent-default',
    name: 'Counselor Vance (AI)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'defense',
    isHost: false,
    isReady: true,
    isAi: true,
    aiPersonality: 'analyst',
    aiDifficulty: 'Intermediate'
  });
  const [activeLobby, setActiveLobby] = useState<Lobby | null>(null);
  const [currentVerdict, setCurrentVerdict] = useState<VerdictData | null>(null);

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCustomCaseModal, setShowCustomCaseModal] = useState(false);

  // Check for URL ?lobby=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lobbyCode = params.get('lobby');
    if (lobbyCode) {
      setCurrentView('lobby');
    }
  }, []);

  // Quick Start / Start Single-player Trial
  const handleStartTrial = (selectedCase: CourtCase, forcedRole: 'prosecution' | 'defense' = 'prosecution') => {
    soundService.playGavel();
    setActiveCase(selectedCase);
    setPlayerRole(forcedRole);

    const opponentRole = forcedRole === 'prosecution' ? 'defense' : 'prosecution';
    setOpponentPlayer({
      id: 'ai-opponent-' + Math.random().toString(36).substring(2, 6),
      name: opponentRole === 'prosecution' ? 'Prosecutor Thorne (AI)' : 'Counselor Vance (AI)',
      avatar: opponentRole === 'prosecution' 
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' 
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: opponentRole,
      isHost: false,
      isReady: true,
      isAi: true,
      aiPersonality: 'analyst',
      aiDifficulty: selectedCase.difficulty
    });

    setActiveLobby(null);
    setCurrentView('courtroom');
  };

  // Launch trial from multiplayer lobby
  const handleStartTrialFromLobby = (lobby: Lobby) => {
    setActiveLobby(lobby);
    const selectedCase = cases.find(c => c.id === lobby.caseId) || cases[0];
    setActiveCase(selectedCase);

    const meInLobby = lobby.players.find(p => p.id === profile.id);
    const myRole = meInLobby?.role === 'defense' ? 'defense' : 'prosecution';
    setPlayerRole(myRole);

    const otherPlayer = lobby.players.find(p => p.id !== profile.id && (p.role === 'prosecution' || p.role === 'defense')) || {
      id: 'ai-sub',
      name: 'AI Magistrate Proxy',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: myRole === 'prosecution' ? 'defense' : 'prosecution',
      isHost: false,
      isReady: true,
      isAi: true,
      aiPersonality: 'analyst',
      aiDifficulty: 'Intermediate'
    };

    setOpponentPlayer(otherPlayer);
    setCurrentView('courtroom');
  };

  // When trial concludes and verdict is delivered
  const handleVerdictReached = (verdict: VerdictData) => {
    const updated = storageService.recordMatchResult(verdict, playerRole);
    setProfile(updated);
    setCurrentVerdict(verdict);
    setCurrentView('verdict');
  };

  // Rematch with reversed roles
  const handleRematch = () => {
    const nextRole = playerRole === 'prosecution' ? 'defense' : 'prosecution';
    handleStartTrial(activeCase, nextRole);
  };

  // Save custom case
  const handleSaveCustomCase = (newCase: CourtCase) => {
    const updated = storageService.saveCustomCase(newCase);
    setCases(updated);
  };

  // Update profile from auth or modal
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const full = { ...profile, ...updated };
    storageService.saveProfile(full);
    setProfile(full);
  };

  return (
    <div className="min-h-screen bg-court-bg text-slate-100 flex flex-col font-sans selection:bg-court-gold selection:text-black">
      
      {/* Sticky Navigation Bar */}
      <Navbar
        profile={profile}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as typeof currentView)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onQuickStart={() => handleStartTrial(cases[0])}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartTrial={(c) => handleStartTrial(c)}
            onBrowseCases={() => setCurrentView('cases')}
            onCreateLobby={() => setCurrentView('lobby')}
            onChallengeAi={() => handleStartTrial(cases[1], 'defense')}
            onExhibitionMatch={() => handleStartTrial(cases[2], 'prosecution')}
            profile={profile}
          />
        )}

        {currentView === 'cases' && (
          <CaseBrowser
            cases={cases}
            onSelectCase={(c, mode) => {
              if (mode === 'lobby') {
                setActiveCase(c);
                setCurrentView('lobby');
              } else {
                handleStartTrial(c);
              }
            }}
            onOpenCreateCase={() => setShowCustomCaseModal(true)}
          />
        )}

        {currentView === 'lobby' && (
          <LobbyView
            initialLobby={activeLobby}
            currentUser={profile}
            cases={cases}
            onStartTrialFromLobby={handleStartTrialFromLobby}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'courtroom' && (
          <Courtroom
            courtCase={activeCase}
            playerRole={playerRole}
            opponentPlayer={opponentPlayer}
            currentUser={profile}
            lobbyId={activeLobby?.id}
            roundDuration={activeLobby?.roundDuration || 90}
            onVerdictReached={handleVerdictReached}
            onLeaveTrial={() => setCurrentView('cases')}
          />
        )}

        {currentView === 'verdict' && currentVerdict && (
          <VerdictView
            verdict={currentVerdict}
            playerRole={playerRole}
            userProfile={profile}
            onRematch={handleRematch}
            onExit={() => setCurrentView('cases')}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView
            currentUser={profile}
            onBack={() => setCurrentView('landing')}
            onQuickTrial={() => handleStartTrial(cases[0])}
          />
        )}
      </main>

      {/* Global Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleUpdateProfile}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSettingsSaved={(settings) => {
          soundService.setMuted(!settings.soundEnabled);
        }}
      />

      <CustomCaseModal
        isOpen={showCustomCaseModal}
        onClose={() => setShowCustomCaseModal(false)}
        onSaveCase={handleSaveCustomCase}
      />

    </div>
  );
}

export default App;
