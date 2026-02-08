'use client';

import { useState } from 'react';

interface Message {
  id: string;
  type: 'direct' | 'broadcast';
  subject: string;
  content: string;
  sender: string;
  recipients: string[] | { segment: string; count: number };
  sentAt: string;
  readCount: number;
  status: 'draft' | 'sent' | 'scheduled';
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: { id: string; content: string; sender: 'admin' | 'user'; timestamp: string }[];
}

interface InAppMessagingProps {
  conversations: Conversation[];
  broadcasts: Message[];
  segments: { id: string; name: string; count: number }[];
  onSendMessage: (conversationId: string, content: string) => Promise<void>;
  onSendBroadcast: (segmentId: string, subject: string, content: string) => Promise<void>;
}

export function InAppMessaging({ conversations, broadcasts, segments, onSendMessage, onSendBroadcast }: InAppMessagingProps) {
  const [activeTab, setActiveTab] = useState<'conversations' | 'broadcast' | 'history'>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    setIsSending(true);
    await onSendMessage(selectedConversation.id, newMessage);
    setNewMessage('');
    setIsSending(false);
  };

  const handleSendBroadcast = async () => {
    if (!selectedSegment || !broadcastSubject || !broadcastContent) return;
    setIsSending(true);
    await onSendBroadcast(selectedSegment, broadcastSubject, broadcastContent);
    setBroadcastSubject('');
    setBroadcastContent('');
    setSelectedSegment('');
    setIsSending(false);
    setActiveTab('history');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">In-App Messaging</h2>
          <p className="text-sm text-gray-400">Message users directly or broadcast to segments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['conversations', 'broadcast', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${
              activeTab === tab ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
          {/* Conversation List */}
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm"
              />
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 text-left border-b border-white/5 hover:bg-white/5 ${
                    selectedConversation?.id === conv.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold">
                      {conv.userName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white truncate">{conv.userName}</p>
                        <span className="text-xs text-gray-500">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="h-5 w-5 rounded-full bg-neon-cyan flex items-center justify-center text-xs text-black font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message View */}
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold">
                    {selectedConversation.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedConversation.userName}</p>
                    <p className="text-xs text-gray-500">User ID: {selectedConversation.userId}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.sender === 'admin'
                            ? 'bg-neon-cyan text-black'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-black/60' : 'text-gray-500'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="rounded-lg bg-neon-cyan px-6 py-2 font-medium text-black disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      )}

      {/* Broadcast Tab */}
      {activeTab === 'broadcast' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Target Segment</label>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              >
                <option value="">Select a segment...</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name} ({segment.count.toLocaleString()} users)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Subject</label>
              <input
                type="text"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                placeholder="Important announcement"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Message</label>
              <textarea
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
                rows={6}
                placeholder="Write your broadcast message..."
              />
            </div>
            <button
              onClick={handleSendBroadcast}
              disabled={!selectedSegment || !broadcastSubject || !broadcastContent || isSending}
              className="w-full rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-medium text-white disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-bold text-white mb-4">Message Preview</h3>
            <div className="rounded-lg bg-white/5 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white">
                  🐱
                </div>
                <div>
                  <p className="font-medium text-white">ChasingCats Team</p>
                  <p className="text-xs text-gray-500">System Message</p>
                </div>
              </div>
              <p className="font-medium text-white mb-2">{broadcastSubject || 'Subject line...'}</p>
              <p className="text-gray-400 text-sm">{broadcastContent || 'Your message content will appear here...'}</p>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Message</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Recipients</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Read Rate</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Sent</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.map((msg) => {
                const recipientCount = typeof msg.recipients === 'object' && 'count' in msg.recipients
                  ? msg.recipients.count
                  : msg.recipients.length;
                const readRate = recipientCount > 0 ? ((msg.readCount / recipientCount) * 100).toFixed(1) : 0;
                return (
                  <tr key={msg.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{msg.subject}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{msg.content}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        msg.type === 'broadcast' ? 'bg-neon-purple/20 text-neon-purple' : 'bg-neon-cyan/20 text-neon-cyan'
                      }`}>
                        {msg.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {typeof msg.recipients === 'object' && 'segment' in msg.recipients
                        ? `${msg.recipients.segment} (${msg.recipients.count})`
                        : `${msg.recipients.length} users`}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white">{msg.readCount}</span>
                      <span className="text-gray-500 text-xs ml-1">({readRate}%)</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(msg.sentAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
