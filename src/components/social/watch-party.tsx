'use client';

import { useState } from 'react';
import Image from 'next/image';

interface WatchPartyParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
}

interface WatchPartyMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  reaction?: string;
}

interface WatchParty {
  id: string;
  hostId: string;
  hostName: string;
  contentId: string;
  contentTitle: string;
  contentThumbnail?: string;
  participants: WatchPartyParticipant[];
  messages: WatchPartyMessage[];
  currentTime: number;
  isPlaying: boolean;
  inviteCode: string;
}

// Create/Join watch party modal
export function CreateWatchPartyModal({ 
  isOpen, 
  onClose, 
  onCreateParty,
  contentTitle 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onCreateParty: () => void;
  contentTitle: string;
}) {
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-deep-space p-6 animate-scale-in">
        <h2 className="text-xl font-bold text-white mb-2">Watch Party</h2>
        <p className="text-sm text-gray-400 mb-6">Watch together with friends in sync</p>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'create' ? 'bg-neon-cyan text-black' : 'bg-white/5 text-gray-400'
            }`}
          >
            Start a Party
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'join' ? 'bg-neon-cyan text-black' : 'bg-white/5 text-gray-400'
            }`}
          >
            Join with Code
          </button>
        </div>

        {mode === 'create' ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs text-gray-500 mb-1">Now watching</p>
              <p className="font-medium text-white">{contentTitle}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Party features:</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-neon-cyan">✓</span> Synced playback
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neon-cyan">✓</span> Voice chat
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neon-cyan">✓</span> Live reactions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neon-cyan">✓</span> Text chat
                </li>
              </ul>
            </div>

            <button
              onClick={onCreateParty}
              className="w-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-semibold text-white"
            >
              🎉 Create Watch Party
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Enter party code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-widest text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none"
                maxLength={6}
              />
            </div>

            <button
              disabled={joinCode.length < 6}
              className="w-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
            >
              Join Party
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Watch party overlay/sidebar
export function WatchPartySidebar({ party, onLeave }: { party: WatchParty; onLeave: () => void }) {
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const sendMessage = () => {
    if (!message.trim()) return;
    // Send message logic
    setMessage('');
  };

  const sendReaction = (emoji: string) => {
    // Send reaction logic - to be implemented
    console.log('Reaction:', emoji);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 border-l border-white/10 bg-deep-space/95 backdrop-blur-md flex flex-col z-40">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="font-semibold text-white">Watch Party</span>
          </div>
          <button
            onClick={onLeave}
            className="text-sm text-gray-400 hover:text-red-400"
          >
            Leave
          </button>
        </div>
        
        {/* Invite code */}
        <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <span className="text-xs text-gray-400">Invite code:</span>
          <span className="font-mono font-bold text-neon-cyan">{party.inviteCode}</span>
          <button className="text-gray-400 hover:text-white">📋</button>
        </div>
      </div>

      {/* Participants */}
      <div className="border-b border-white/10 p-4">
        <p className="text-xs text-gray-500 mb-3">{party.participants.length} watching</p>
        <div className="flex flex-wrap gap-2">
          {party.participants.map((participant) => (
            <div 
              key={participant.id}
              className={`relative ${participant.isSpeaking ? 'ring-2 ring-neon-cyan' : ''}`}
            >
              <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10">
                {participant.avatarUrl ? (
                  <Image src={participant.avatarUrl} alt={participant.name} width={40} height={40} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm">
                    {participant.name[0]}
                  </div>
                )}
              </div>
              {participant.isHost && (
                <span className="absolute -top-1 -right-1 text-xs">👑</span>
              )}
              {participant.isMuted && (
                <span className="absolute -bottom-1 -right-1 text-xs bg-red-500 rounded-full p-0.5">🔇</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {party.messages.map((msg) => (
          <div key={msg.id}>
            {msg.reaction ? (
              <div className="text-center">
                <span className="text-3xl animate-bounce">{msg.reaction}</span>
                <p className="text-xs text-gray-500">{msg.userName}</p>
              </div>
            ) : (
              <div className="rounded-lg bg-white/5 px-3 py-2">
                <p className="text-xs text-neon-cyan font-medium">{msg.userName}</p>
                <p className="text-sm text-white">{msg.message}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reactions */}
      <div className="border-t border-white/10 p-4">
        <div className="flex justify-center gap-2 mb-3">
          {['🔥', '😂', '😮', '👏', '❤️', '🐱'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="h-10 w-10 rounded-full bg-white/5 text-xl hover:bg-white/10 hover:scale-110 transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Message input */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
            }`}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Send a message..."
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-cyan text-black"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

// Watch party button
export function WatchPartyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-purple/20 to-pink-500/20 border border-neon-purple/30 px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/30 transition-colors"
    >
      <span>👥</span>
      <span>Watch Party</span>
    </button>
  );
}

// Floating reactions during watch party
export function WatchPartyReactions({ reactions }: { reactions: { id: string; emoji: string; x: number }[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {reactions.map((reaction) => (
        <span
          key={reaction.id}
          className="absolute bottom-20 text-4xl animate-float-up"
          style={{ left: `${reaction.x}%` }}
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
}
