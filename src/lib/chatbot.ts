import { prisma } from '@/lib/prisma';

// AI Provider abstraction - supports OpenAI and Anthropic
export interface AIProvider {
  generateResponse(messages: ChatMessage[]): Promise<string>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// System prompt for the wildlife photography chatbot
const SYSTEM_PROMPT = `You are a helpful AI assistant for Chasing Cats Club, a wildlife photography education platform focused on big cat photography. You are knowledgeable about:

- Wildlife photography techniques (exposure, composition, focus tracking)
- Camera settings for capturing fast-moving animals
- Big cat behavior and best times/locations to photograph them
- Safari photography tips and ethical wildlife photography practices
- Post-processing techniques for wildlife photos
- Equipment recommendations for wildlife photography

Be friendly, encouraging, and helpful. If asked about topics outside wildlife photography, politely redirect the conversation back to photography topics. Keep responses concise but informative.`;

// OpenAI Provider (requires OPENAI_API_KEY)
export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  }
}

// Anthropic Provider (requires ANTHROPIC_API_KEY)
export class AnthropicProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Anthropic API error');
    }

    const data = await response.json();
    return data.content[0]?.text || 'Sorry, I could not generate a response.';
  }
}

// Factory function to get the appropriate provider
export function getAIProvider(): AIProvider | null {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    return new OpenAIProvider(openaiKey);
  }

  if (anthropicKey) {
    return new AnthropicProvider(anthropicKey);
  }

  return null;
}

// Check if chatbot is available
export function isChatbotAvailable(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}

// Save chat message to database
export async function saveChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  sessionId?: string
) {
  return prisma.chatMessage.create({
    data: {
      userId,
      role,
      content,
      sessionId: sessionId || `session-${Date.now()}`
    }
  });
}

// Get chat history for a user session
export async function getChatHistory(userId: string, sessionId: string, limit = 20) {
  return prisma.chatMessage.findMany({
    where: {
      userId,
      sessionId
    },
    orderBy: { createdAt: 'asc' },
    take: limit
  });
}

// Get all chat sessions for a user
export async function getUserChatSessions(userId: string) {
  const sessions = await prisma.chatMessage.groupBy({
    by: ['sessionId'],
    where: { userId },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: 'desc' } },
    take: 10
  });

  return sessions;
}

// Admin: Get all recent chat messages
export async function getRecentChatMessages(limit = 50) {
  return prisma.chatMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true }
      }
    }
  });
}

// Admin: Get chat statistics
export async function getChatStats() {
  const [totalMessages, totalUsers, todayMessages] = await Promise.all([
    prisma.chatMessage.count(),
    prisma.chatMessage.groupBy({
      by: ['userId'],
      _count: true
    }),
    prisma.chatMessage.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ]);

  return {
    totalMessages,
    uniqueUsers: totalUsers.length,
    todayMessages
  };
}
