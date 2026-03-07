import { ECHOATLAS_API_URL, echoatlasHeaders, ECHOATLAS_SITE_ID } from './config';

interface AgentVisitPayload {
  path: string;
  userAgent?: string;
  referer?: string;
  ip?: string;
  botReason?: string;
  agentName?: string;
}

interface TrapHitPayload {
  trapPhrase: string;
  query: string;
  agentName?: string;
  ip?: string;
  path?: string;
}

interface CanaryHitPayload {
  token: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
}

interface HumanLandingPayload {
  path: string;
  referer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function fireAndForget(endpoint: string, body: Record<string, unknown>): void {
  fetch(`${ECHOATLAS_API_URL}${endpoint}`, {
    method: 'POST',
    headers: echoatlasHeaders(),
    body: JSON.stringify({ ...body, source_site: ECHOATLAS_SITE_ID }),
  }).catch(() => {});
}

export function reportAgentVisit(payload: AgentVisitPayload): void {
  fireAndForget('/api/agent', {
    query: `[telemetry] agent visit on ${payload.path}`,
    agent_name: payload.agentName || payload.userAgent || 'unknown',
    source_url: payload.path,
    metadata: {
      type: 'agent_visit',
      bot_reason: payload.botReason,
      referer: payload.referer,
      ip_hash: payload.ip,
    },
  });
}

export function reportTrapHit(payload: TrapHitPayload): void {
  fireAndForget('/api/agent', {
    query: `[trap] ${payload.trapPhrase}`,
    agent_name: payload.agentName || 'unknown',
    source_url: payload.path,
    metadata: {
      type: 'trap_hit',
      trap_phrase: payload.trapPhrase,
      original_query: payload.query,
      ip_hash: payload.ip,
    },
  });
}

export function reportCanaryHit(payload: CanaryHitPayload): void {
  fireAndForget('/api/agent', {
    query: `[canary] token=${payload.token}`,
    agent_name: payload.userAgent || 'unknown',
    source_url: `/c/${payload.token}`,
    metadata: {
      type: 'canary_hit',
      token: payload.token,
      referer: payload.referer,
      ip_hash: payload.ip,
    },
  });
}

export function reportHumanLanding(payload: HumanLandingPayload): void {
  fireAndForget('/api/agent', {
    query: `[landing] ${payload.path}`,
    agent_name: 'human',
    source_url: payload.path,
    metadata: {
      type: 'human_landing',
      referer: payload.referer,
      utm_source: payload.utmSource,
      utm_medium: payload.utmMedium,
      utm_campaign: payload.utmCampaign,
    },
  });
}
