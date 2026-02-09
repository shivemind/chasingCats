import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  getAIProvider, 
  isChatbotAvailable, 
  saveChatMessage, 
  getChatHistory,
  type ChatMessage 
} from '@/lib/chatbot';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isChatbotAvailable()) {
      return NextResponse.json(
        { error: 'Chatbot is not available. Please configure an AI provider.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get conversation history
    const chatSessionId = sessionId || `session-${Date.now()}`;
    const history = await getChatHistory(session.user.id, chatSessionId, 10);

    // Save user message
    await saveChatMessage(session.user.id, 'user', message, chatSessionId);

    // Prepare messages for AI
    const messages: ChatMessage[] = [
      ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message }
    ];

    // Get AI response
    const provider = getAIProvider();
    if (!provider) {
      return NextResponse.json(
        { error: 'AI provider not configured' },
        { status: 503 }
      );
    }

    const response = await provider.generateResponse(messages);

    // Save assistant response
    await saveChatMessage(session.user.id, 'assistant', response, chatSessionId);

    return NextResponse.json({
      response,
      sessionId: chatSessionId
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const history = await getChatHistory(session.user.id, sessionId, 50);

    return NextResponse.json({ messages: history });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to get chat history' },
      { status: 500 }
    );
  }
}
