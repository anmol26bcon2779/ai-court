import { Lobby, LobbyPlayer, ChatMessage, TrialState, CourtCase } from '../types/court';
import { getSupabase } from './supabase';

type LobbyListener = (lobby: Lobby) => void;
type ChatListener = (message: ChatMessage) => void;
type TrialStateListener = (state: TrialState) => void;

class MultiplayerService {
  private broadcastChannel: BroadcastChannel | null = null;
  private currentLobbyId: string | null = null;
  private lobbyListeners: Set<LobbyListener> = new Set();
  private chatListeners: Set<ChatListener> = new Set();
  private trialListeners: Set<TrialStateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('ai_court_realtime_bus');
      this.broadcastChannel.onmessage = (event) => {
        this.handleInboundMessage(event.data);
      };
    }
  }

  private handleInboundMessage(data: { type: string; payload: unknown; lobbyId: string }) {
    if (!data || data.lobbyId !== this.currentLobbyId) return;

    if (data.type === 'LOBBY_UPDATE') {
      const lobby = data.payload as Lobby;
      this.lobbyListeners.forEach(cb => cb(lobby));
    } else if (data.type === 'CHAT_MESSAGE') {
      const msg = data.payload as ChatMessage;
      this.chatListeners.forEach(cb => cb(msg));
    } else if (data.type === 'TRIAL_STATE_UPDATE') {
      const state = data.payload as TrialState;
      this.trialListeners.forEach(cb => cb(state));
    }
  }

  private broadcast(type: string, payload: unknown, lobbyId: string) {
    // Broadcast locally across tabs/windows
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type, payload, lobbyId });
    }

    // If Supabase Realtime is connected, broadcast to channel
    const supabase = getSupabase();
    if (supabase) {
      const channel = supabase.channel(`lobby_${lobbyId}`);
      channel.send({
        type: 'broadcast',
        event: type,
        payload
      }).catch(err => console.warn('Supabase broadcast error', err));
    }
  }

  public generateLobbyCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public createLobby(hostPlayer: LobbyPlayer, selectedCase: CourtCase): Lobby {
    const code = this.generateLobbyCode();
    const lobby: Lobby = {
      id: 'lobby-' + Math.random().toString(36).substring(2, 9),
      code,
      hostId: hostPlayer.id,
      caseId: selectedCase.id,
      mode: '1v1_friend',
      status: 'waiting',
      players: [hostPlayer],
      roundDuration: 90,
      createdAt: new Date().toISOString(),
      customRules: 'Standard Court Rules: Evidence must be cited; Objections require cause.'
    };

    this.currentLobbyId = lobby.id;
    this.saveLobbyToStorage(lobby);
    return lobby;
  }

  public joinLobby(code: string, player: LobbyPlayer): Lobby | null {
    const allLobbies = this.getAllLobbiesFromStorage();
    const lobby = allLobbies.find(l => l.code.toUpperCase() === code.trim().toUpperCase());
    if (!lobby) return null;

    // Remove existing entry for same player id if rejoining
    const existingIndex = lobby.players.findIndex(p => p.id === player.id);
    if (existingIndex >= 0) {
      lobby.players[existingIndex] = player;
    } else {
      // Auto-assign available role
      const hasProsecution = lobby.players.some(p => p.role === 'prosecution');
      const hasDefense = lobby.players.some(p => p.role === 'defense');
      if (!hasProsecution && player.role !== 'prosecution') player.role = 'prosecution';
      else if (!hasDefense && player.role !== 'defense') player.role = 'defense';
      else if (player.role === 'prosecution' && hasProsecution) player.role = 'defense';
      
      lobby.players.push(player);
    }

    this.currentLobbyId = lobby.id;
    this.saveLobbyToStorage(lobby);
    this.broadcast('LOBBY_UPDATE', lobby, lobby.id);
    return lobby;
  }

  public updateLobby(lobby: Lobby) {
    this.currentLobbyId = lobby.id;
    this.saveLobbyToStorage(lobby);
    this.broadcast('LOBBY_UPDATE', lobby, lobby.id);
  }

  public sendChatMessage(lobbyId: string, message: ChatMessage) {
    this.broadcast('CHAT_MESSAGE', message, lobbyId);
  }

  public syncTrialState(state: TrialState) {
    if (!state.lobbyId) return;
    this.broadcast('TRIAL_STATE_UPDATE', state, state.lobbyId);
  }

  public subscribeToLobby(lobbyId: string, onUpdate: LobbyListener, onChat: ChatListener, onTrial?: TrialStateListener): () => void {
    this.currentLobbyId = lobbyId;
    this.lobbyListeners.add(onUpdate);
    this.chatListeners.add(onChat);
    if (onTrial) this.trialListeners.add(onTrial);

    // Supabase subscription if available
    const supabase = getSupabase();
    let supabaseChannel: any = null;
    if (supabase) {
      supabaseChannel = supabase.channel(`lobby_${lobbyId}`)
        .on('broadcast', { event: 'LOBBY_UPDATE' }, (payload: any) => onUpdate(payload.payload))
        .on('broadcast', { event: 'CHAT_MESSAGE' }, (payload: any) => onChat(payload.payload))
        .on('broadcast', { event: 'TRIAL_STATE_UPDATE' }, (payload: any) => onTrial && onTrial(payload.payload))
        .subscribe();
    }

    return () => {
      this.lobbyListeners.delete(onUpdate);
      this.chatListeners.delete(onChat);
      if (onTrial) this.trialListeners.delete(onTrial);
      if (supabase && supabaseChannel) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }

  // Storage helpers for cross-tab sharing
  private memoryLobbies: Lobby[] = [];

  private saveLobbyToStorage(lobby: Lobby) {
    try {
      if (typeof localStorage !== 'undefined') {
        const list = this.getAllLobbiesFromStorage().filter(l => l.id !== lobby.id);
        list.push(lobby);
        localStorage.setItem('ai_court_active_lobbies', JSON.stringify(list));
        return;
      }
    } catch {}
    this.memoryLobbies = [...this.memoryLobbies.filter(l => l.id !== lobby.id), lobby];
  }

  public getAllLobbiesFromStorage(): Lobby[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('ai_court_active_lobbies');
        return data ? JSON.parse(data) : [];
      }
    } catch {}
    return this.memoryLobbies;
  }
}

export const multiplayerService = new MultiplayerService();
