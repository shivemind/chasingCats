import Image from 'next/image';
import { isChatbotAvailable, getChatStats, getRecentChatMessages } from '@/lib/chatbot';

export default async function AdminChatbotPage() {
  const isAvailable = isChatbotAvailable();
  
  let stats = { totalMessages: 0, uniqueUsers: 0, todayMessages: 0 };
  let recentMessages: any[] = [];
  
  if (isAvailable) {
    [stats, recentMessages] = await Promise.all([
      getChatStats(),
      getRecentChatMessages(30)
    ]);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Chatbot</h1>
        <p className="text-white/60 mt-1">Monitor and configure the AI photography assistant</p>
      </div>

      {/* Status */}
      <div className={`rounded-xl p-6 ${
        isAvailable 
          ? 'bg-green-500/10 border border-green-500/30' 
          : 'bg-yellow-500/10 border border-yellow-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <h2 className="text-lg font-semibold text-white">
            {isAvailable ? 'Chatbot Active' : 'Chatbot Not Configured'}
          </h2>
        </div>
        {!isAvailable && (
          <div className="mt-3">
            <p className="text-white/60 text-sm">
              To enable the AI chatbot, add one of the following environment variables:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-white/50">
              <li><code className="bg-white/10 px-2 py-0.5 rounded">OPENAI_API_KEY</code> - For GPT-4o-mini</li>
              <li><code className="bg-white/10 px-2 py-0.5 rounded">ANTHROPIC_API_KEY</code> - For Claude 3 Haiku</li>
            </ul>
          </div>
        )}
      </div>

      {isAvailable && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-2xl font-bold text-white">{stats.totalMessages}</div>
              <div className="text-sm text-white/50">Total Messages</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-2xl font-bold text-white">{stats.uniqueUsers}</div>
              <div className="text-sm text-white/50">Unique Users</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-2xl font-bold text-neon-cyan">{stats.todayMessages}</div>
              <div className="text-sm text-white/50">Messages Today</div>
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Recent Messages</h2>
            
            {recentMessages.length === 0 ? (
              <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center">
                <p className="text-white/50">No chat messages yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg bg-white/5 border border-white/10 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-neon-purple/30' : 'bg-neon-cyan/30'
                      }`}>
                        {msg.role === 'user' ? (
                          msg.user.image ? (
                            <Image
                              src={msg.user.image}
                              alt={msg.user.name || ''}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-xs">👤</span>
                          )
                        ) : (
                          <span className="text-xs">🤖</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                          <span className="font-medium text-white/70">
                            {msg.role === 'user' ? msg.user.name || msg.user.email : 'Assistant'}
                          </span>
                          <span>•</span>
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-white/80 whitespace-pre-wrap line-clamp-3">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Configuration Info */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-3">About the Chatbot</h2>
        <div className="text-sm text-white/60 space-y-2">
          <p>
            The AI chatbot is trained to help members with wildlife photography questions, 
            including camera settings, composition, equipment, and big cat photography tips.
          </p>
          <p>
            The chatbot uses a system prompt that keeps responses focused on photography topics 
            and maintains a friendly, encouraging tone.
          </p>
        </div>
      </div>
    </div>
  );
}
