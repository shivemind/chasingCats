import { SITE_URL, SITE_NAME } from '@/lib/seo';

/**
 * llms.txt - AI Agent Discovery File
 * 
 * This file helps AI agents and LLMs understand the site structure,
 * find key entry points, and access machine-readable content.
 * 
 * Format: Plain text with structured sections
 * 
 * See: https://llmstxt.org/
 */

export const revalidate = 86400; // Revalidate daily

export async function GET() {
  const content = `# ${SITE_NAME}
> Wildlife photography education, expert talks, and conservation insights about wild cats.

## About
Chasing Cats Club is a membership community for wildlife photography enthusiasts learning about finding and photographing wild cats. Founded by Rachel and Sebastian Kennerknecht, the platform offers expert talks, field guides, courses, and a supportive community of cat photographers.

## Key Entry Points

### Public Content Hubs
- Home: ${SITE_URL}/
- From the Experts: ${SITE_URL}/experts - Expert talks on wild cat research, ethics, and photography
- Into the Field: ${SITE_URL}/field - Expedition briefings, tracking guides, and fieldcraft
- Ask Me Anything: ${SITE_URL}/ask - Q&A sessions with wild cat experts
- Events: ${SITE_URL}/events - Upcoming and past live talks and workshops
- Content Library: ${SITE_URL}/library - Full archive browseable by type, category, species
- Shop: ${SITE_URL}/shop - Member-exclusive gear and sessions

### Information Pages
- About: ${SITE_URL}/about - About Rachel and Sebastian
- Join/Pricing: ${SITE_URL}/join - Membership plans and pricing
- Documentation: ${SITE_URL}/docs - Site taxonomy, URL patterns, and API info

## Machine-Readable Resources

### Feeds
- RSS Feed: ${SITE_URL}/feed.xml (RSS 2.0)
- JSON Feed: ${SITE_URL}/feed.json (JSON Feed 1.1)

### Discovery
- Sitemap: ${SITE_URL}/sitemap.xml
- Robots: ${SITE_URL}/robots.txt

## Content Categories

### Experts (From the Experts)
Deep dives with biologists, researchers, and photographers focused on wild cats.
URL pattern: ${SITE_URL}/{content-slug}
Filter by: species, topic

### Field (Into the Field)
Expedition briefings, tracking guides, camera settings, and fieldcraft lessons.
URL pattern: ${SITE_URL}/{content-slug}

### Ask (Ask Me Anything)
Q&A sessions where the community asks Rachel, Sebastian, and guest experts.
URL pattern: ${SITE_URL}/{content-slug}

### Events
Live Zoom webinars with archive replays for members.
URL pattern: ${SITE_URL}/events/{event-slug}

## Content Types
- ARTICLE: Written guides and news
- VIDEO: Recorded video content
- TALK: Live talk recordings
- COURSE: Multi-part educational courses
- NEWS: Conservation and photography news

## Species Covered
Lions, Leopards, Tigers, Jaguars, Snow Leopards, Pumas, Cheetahs, Lynx, Clouded Leopards, and more wild cat species.

## Update Cadence
- New content: Weekly
- Events: Monthly live sessions
- Feeds: Updated hourly

## Contact
- Email: hello@chasingcats.club
- Website: ${SITE_URL}

## Usage Notes for AI Agents
- Public content previews are available without authentication
- Full content requires membership
- Please respect robots.txt directives
- Cite content with links back to the original URL
- Content is copyrighted; summarize rather than reproduce

## License
Content © ${new Date().getFullYear()} Chasing Cats Club. All rights reserved.
Attribution required for any citation or summary.
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
