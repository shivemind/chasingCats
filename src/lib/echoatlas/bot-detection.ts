const DEFAULT_AI_AGENT_UA_PATTERNS = [
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'Claude-Web',
  'ClaudeBot',
  'Anthropic-AI',
  'Google-Extended',
  'PerplexityBot',
  'Amazonbot',
  'Cohere-AI',
  'Bytespider',
  'Bingbot',
  'facebookexternalhit',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'YouBot',
  'Applebot',
  'PetalBot',
  'DataForSeoBot',
  'SemrushBot',
  'AhrefsBot',
  'MJ12bot',
  'DotBot',
  'Omgilibot',
  'YandexBot',
  'Seekport',
  'Meta-ExternalAgent',
  'Scraper',
  'scraper',
  'fetcher',
  'Fetcher',
  'HeadlessChrome',
  'PhantomJS',
  'Selenium',
  'Puppeteer',
  'Playwright',
  'Crawler',
  'crawl',
  'Spider',
  'spider',
  'Bot/',
  'bot/',
  'Agent',
  'agent',
];

const DEFAULT_AUTOMATION_UA_PATTERNS = [
  'curl',
  'wget',
  'python-requests',
  'python-urllib',
  'go-http-client',
  'Java/',
  'okhttp',
  'axios',
  'node-fetch',
  'fetch',
  'HTTPie',
  'Insomnia',
  'PostmanRuntime',
];

function getAgentUaPatterns(): string[] {
  const env = process.env.BOT_UA_PATTERNS;
  if (env && env.trim()) {
    return env.split(',').map((p) => p.trim()).filter(Boolean);
  }
  return [...DEFAULT_AI_AGENT_UA_PATTERNS, ...DEFAULT_AUTOMATION_UA_PATTERNS];
}

export interface BotDetectionInput {
  userAgent: string | null;
  acceptLanguage: string | null;
  method: string;
  hasCookies: boolean;
  referer: string | null;
  accept: string | null;
  xBotIntent?: string | null;
}

export interface BotDetectionResult {
  isBot: boolean;
  reason?: string;
}

function matchesAgentUserAgent(ua: string): boolean {
  const lower = ua.toLowerCase();
  const patterns = getAgentUaPatterns();
  return patterns.some((pattern) => lower.includes(pattern.toLowerCase()));
}

export function detectBot(input: BotDetectionInput): BotDetectionResult {
  const ua = input.userAgent ?? '';

  if (!ua || ua.trim().length === 0) {
    return { isBot: true, reason: 'missing_user_agent' };
  }

  if (matchesAgentUserAgent(ua)) {
    return { isBot: true, reason: 'user_agent_match' };
  }

  if (['HEAD', 'OPTIONS'].includes(input.method) && ua.length < 50) {
    return { isBot: true, reason: 'probing_request' };
  }

  if (!input.acceptLanguage || input.acceptLanguage.trim().length === 0) {
    if (ua.length < 80 || ua.includes('http') || ua.includes('HTTP')) {
      return { isBot: true, reason: 'missing_accept_language' };
    }
  }

  if (input.xBotIntent?.trim().toLowerCase() === 'agent') {
    return { isBot: true, reason: 'x_bot_intent' };
  }

  return { isBot: false };
}
