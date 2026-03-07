import { ECHOATLAS_API_URL, echoatlasHeaders, ECHOATLAS_SITE_ID } from './config';

export type SocialEventType =
  | 'new_content'
  | 'bot_spike'
  | 'trap_triggered'
  | 'canary_hit'
  | 'milestone';

interface AutoPostPayload {
  eventType: SocialEventType;
  title: string;
  body: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export function autoPostEvent(payload: AutoPostPayload): void {
  fetch(`${ECHOATLAS_API_URL}/api/social/agent-post`, {
    method: 'POST',
    headers: echoatlasHeaders(),
    body: JSON.stringify({
      source_site: ECHOATLAS_SITE_ID,
      event_type: payload.eventType,
      title: payload.title,
      body: payload.body,
      url: payload.url,
      metadata: payload.metadata,
    }),
  }).catch(() => {});
}
