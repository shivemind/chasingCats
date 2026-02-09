'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  cursor?: { x: number; y: number };
}

interface CollaborationRoom {
  id: string;
  name: string;
  description: string;
  topic: string;
  hostId: string;
  participants: Participant[];
  maxParticipants: number;
  isLive: boolean;
  startedAt?: string;
  scheduledFor?: string;
  inviteCode: string;
}

// Room card for listing
export function CollaborationRoomCard({ room, onJoin }: { room: CollaborationRoom; onJoin: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            room.isLive ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {room.isLive ? '🔴 LIVE' : '📅 Scheduled'}
          </span>
          <span className="text-xs text-gray-500">
            {room.participants.length}/{room.maxParticipants}
          </span>
        </div>
        <h3 className="font-semibold text-white">{room.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{room.description}</p>
      </div>

      {/* Participants preview */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {room.participants.slice(0, 5).map((participant) => (
              <div 
                key={participant.id}
                className={`relative h-8 w-8 rounded-full border-2 border-deep-space overflow-hidden ${
                  participant.isSpeaking ? 'ring-2 ring-neon-cyan' : ''
                }`}
              >
                {participant.avatarUrl ? (
                  <Image src={participant.avatarUrl} alt={participant.name} fill />
                ) : (
                  <div className="h-full w-full bg-white/10 flex items-center justify-center text-xs">
                    {participant.name[0]}
                  </div>
                )}
                {participant.isHost && (
                  <span className="absolute -top-1 -right-1 text-[10px]">👑</span>
                )}
              </div>
            ))}
            {room.participants.length > 5 && (
              <div className="h-8 w-8 rounded-full border-2 border-deep-space bg-white/10 flex items-center justify-center text-xs text-gray-400">
                +{room.participants.length - 5}
              </div>
            )}
          </div>
          
          <button
            onClick={onJoin}
            disabled={room.participants.length >= room.maxParticipants}
            className="rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {room.isLive ? 'Join Now' : 'RSVP'}
          </button>
        </div>
      </div>

      {/* Topic tag */}
      <div className="px-4 pb-4">
        <span className="inline-block rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
          #{room.topic}
        </span>
      </div>
    </div>
  );
}

// Create room modal
export function CreateRoomModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onCreate: (data: { name: string; description: string; topic: string }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ name, description, topic });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-deep-space p-6 animate-scale-in">
        <h2 className="text-xl font-bold text-white mb-2">Create Collaboration Room</h2>
        <p className="text-sm text-gray-400 mb-6">Start a shared workspace with other members</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Room Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Lightroom Editing Session"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you be working on?"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-neon-cyan/50 focus:outline-none"
              required
            >
              <option value="">Select a topic</option>
              <option value="editing">Photo Editing</option>
              <option value="composition">Composition Review</option>
              <option value="gear">Gear Discussion</option>
              <option value="fieldcraft">Field Craft</option>
              <option value="critique">Photo Critique</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-white/10 py-3 text-gray-400 hover:text-white hover:border-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-semibold text-white"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Active room interface
export function ActiveRoom({ room, onLeave }: { room: CollaborationRoom; onLeave: () => void }) {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-deep-space flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="font-semibold text-white">{room.name}</h2>
          <p className="text-xs text-gray-400">
            {room.participants.length} participants • #{room.topic}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
          <button
            onClick={onLeave}
            className="rounded-full bg-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/30"
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex">
        {/* Shared workspace */}
        <div className="flex-1 relative bg-black">
          {/* Screen share or placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl">🖥️</span>
              <p className="mt-4 text-gray-400">No one is sharing their screen</p>
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className="mt-4 rounded-full bg-neon-cyan px-6 py-2 text-sm font-semibold text-black"
              >
                {isScreenSharing ? 'Stop Sharing' : 'Share Your Screen'}
              </button>
            </div>
          </div>

          {/* Participant cursors would be rendered here */}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-white/10 flex flex-col">
          {/* Participants */}
          <div className="border-b border-white/10 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Participants ({room.participants.length})
            </h3>
            <div className="space-y-2">
              {room.participants.map((participant) => (
                <div 
                  key={participant.id}
                  className={`flex items-center gap-3 rounded-xl p-2 ${
                    participant.isSpeaking ? 'bg-neon-cyan/10 border border-neon-cyan/30' : ''
                  }`}
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-white/10">
                    {participant.avatarUrl ? (
                      <Image src={participant.avatarUrl} alt={participant.name} width={32} height={32} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs">
                        {participant.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      {participant.name}
                      {participant.isHost && ' 👑'}
                    </p>
                    {participant.isScreenSharing && (
                      <p className="text-xs text-neon-cyan">Sharing screen</p>
                    )}
                  </div>
                  {participant.isSpeaking && (
                    <span className="text-neon-cyan">🔊</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-center text-sm text-gray-500">
              Chat messages will appear here
            </p>
          </div>

          {/* Chat input */}
          <div className="border-t border-white/10 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none"
              />
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-cyan text-black">
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="border-t border-white/10 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            🎤
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            📹
          </button>
          <button 
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isScreenSharing ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🖥️
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            ✋
          </button>
        </div>
      </div>
    </div>
  );
}

// Room list page
export function CollaborationRoomList({ rooms }: { rooms: CollaborationRoom[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const liveRooms = rooms.filter(r => r.isLive);
  const scheduledRooms = rooms.filter(r => !r.isLive);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Collaboration Rooms</h2>
          <p className="text-gray-400">Work together in real-time with other members</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-3 font-semibold text-white"
        >
          + Create Room
        </button>
      </div>

      {/* Live rooms */}
      {liveRooms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Live Now
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveRooms.map((room) => (
              <CollaborationRoomCard 
                key={room.id} 
                room={room} 
                onJoin={() => console.log('Join room:', room.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled rooms */}
      {scheduledRooms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">📅 Scheduled</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scheduledRooms.map((room) => (
              <CollaborationRoomCard 
                key={room.id} 
                room={room} 
                onJoin={() => console.log('RSVP:', room.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {rooms.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <span className="text-6xl">🤝</span>
          <h3 className="mt-4 text-lg font-semibold text-white">No active rooms</h3>
          <p className="text-gray-400 mt-2">Be the first to create a collaboration room!</p>
        </div>
      )}

      {/* Create modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(data) => console.log('Create room:', data)}
      />
    </div>
  );
}
