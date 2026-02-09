'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export interface ChatMessage {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    isHost?: boolean;
    isModerator?: boolean;
  };
  reactions?: { emoji: string; count: number; hasReacted: boolean }[];
  timestamp: string;
  replyTo?: {
    id: string;
    author: string;
    preview: string;
  };
}

interface LiveChatProps {
  eventId: string;
  messages: ChatMessage[];
  onSendMessage: (text: string, replyTo?: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  isLive?: boolean;
}

const QUICK_REACTIONS = ['👏', '❤️', '🔥', '😮', '🦁', '📸'];

export function LiveChat({ eventId: _eventId, messages, onSendMessage, onReact, isLive = true }: LiveChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim(), replyingTo?.id);
    setNewMessage('');
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Live Chat</h3>
          {isLive && (
            <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              LIVE
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="group">
            {/* Reply indicator */}
            {message.replyTo && (
              <div className="mb-1 ml-10 flex items-center gap-2 text-xs text-gray-500">
                <svg className="h-3 w-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span>Replying to {message.replyTo.author}</span>
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`h-8 w-8 rounded-full overflow-hidden flex-shrink-0 ${
                message.author.isHost 
                  ? 'ring-2 ring-yellow-400' 
                  : message.author.isModerator 
                  ? 'ring-2 ring-neon-purple' 
                  : ''
              }`}>
                {message.author.avatarUrl ? (
                  <Image
                    src={message.author.avatarUrl}
                    alt={message.author.name}
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-white/10 text-sm">
                    {message.author.name[0]}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    message.author.isHost 
                      ? 'text-yellow-400' 
                      : message.author.isModerator 
                      ? 'text-neon-purple' 
                      : 'text-white'
                  }`}>
                    {message.author.name}
                  </span>
                  {message.author.isHost && (
                    <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400">
                      HOST
                    </span>
                  )}
                  {message.author.isModerator && (
                    <span className="rounded bg-neon-purple/20 px-1.5 py-0.5 text-[10px] font-bold text-neon-purple">
                      MOD
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-300 break-words">{message.text}</p>

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        onClick={() => onReact(message.id, reaction.emoji)}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all ${
                          reaction.hasReacted
                            ? 'bg-neon-cyan/20 text-neon-cyan'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  onClick={() => {
                    setReplyingTo(message);
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-gray-400 hover:text-white"
                  title="Reply"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                    className="p-1 text-gray-400 hover:text-white"
                    title="React"
                  >
                    <span>😀</span>
                  </button>
                  {showReactions === message.id && (
                    <div className="absolute bottom-full right-0 mb-1 flex gap-1 rounded-full bg-deep-space border border-white/10 p-1">
                      {QUICK_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onReact(message.id, emoji);
                            setShowReactions(null);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <svg className="h-4 w-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="text-gray-400">Replying to</span>
            <span className="text-white">{replyingTo.author.name}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something..."
            className="flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:border-neon-cyan/50 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-cyan text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-neon-cyan/90"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Quick reaction overlay for video
export function FloatingReactions({ onReact }: { onReact: (emoji: string) => void }) {
  return (
    <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-40">
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xl transition-all hover:scale-110 hover:bg-white/20"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
