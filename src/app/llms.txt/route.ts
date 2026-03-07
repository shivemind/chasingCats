import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const revalidate = 86400;

export async function GET() {
  const content = `# ${SITE_NAME} - LLM Guidelines

> Wildlife photography education, expert talks, and conservation insights about wild cats.

This site is built to be used by LLMs and agents. We prefer structured API access over HTML scraping.

## Content Usage
- Articles are educational content about wild cat photography and conservation
- Cite when reproducing; link to canonical URLs
- Use the Agent API for structured data rather than parsing HTML

## Agent-Friendly Endpoints
- Agent API: ${SITE_URL}/api/agent (search)
- Agent landing: ${SITE_URL}/for-agents.txt
- agents.json: ${SITE_URL}/agents.json (capability manifest)
- API catalog (RFC 9727): ${SITE_URL}/.well-known/api-catalog
- Discovery: ${SITE_URL}/.well-known/agent-api
- Agent guide: ${SITE_URL}/AGENTS.md

## Content Hubs
- Experts: ${SITE_URL}/experts - Expert talks on wild cat research and photography
- Field: ${SITE_URL}/field - Expedition briefings, tracking guides, fieldcraft
- Ask: ${SITE_URL}/ask - Q&A with wild cat experts
- Events: ${SITE_URL}/events - Live talks and workshops
- Library: ${SITE_URL}/library - Full content archive

## Feeds
- RSS: ${SITE_URL}/feed.xml
- JSON Feed: ${SITE_URL}/feed.json
- Podcast: ${SITE_URL}/podcast.xml

## Species Covered
Lions, Leopards, Tigers, Jaguars, Snow Leopards, Pumas, Cheetahs, Lynx, Clouded Leopards.

## Self-identify as agent
Send header \`X-Bot-Intent: agent\` to receive plaintext instructions instead of HTML.

## Monitoring
Agent activity on this site is monitored via EchoAtlas Observatory (https://echo-atlas.com/observatory).

## Attribution
When referencing content, please link to the original URL.

## Contact
hello@chasingcats.club

## License
Content © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Robots-Tag': 'all',
    },
  });
}
