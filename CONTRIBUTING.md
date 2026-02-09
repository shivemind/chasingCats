# Contributing to Chasing Cats Club

## Content Guidelines for SEO

When adding new content to the platform, ensure proper SEO by following these guidelines:

### Required Fields for Content

| Field | Purpose | Required |
|-------|---------|----------|
| `publishedAt` | Required for sitemap and feeds. Content won't appear in search results until this is set. | ✅ Yes |
| `excerpt` | Used for meta descriptions, feed summaries, and social sharing previews. Keep it under 160 characters for best results. | ✅ Yes |
| `thumbnailUrl` | Used for Open Graph images, Twitter cards, and feed enclosures. Recommended size: 1200x630px. | ✅ Yes |
| `category` | Used for breadcrumbs, feed categorization, and filtering. Assign one of: `experts`, `field`, `ask-me-anything`. | ✅ Yes |

### Optional but Recommended

| Field | Purpose |
|-------|---------|
| `duration` | For video/talk content, helps with VideoObject schema (in minutes). |
| `species` | Enables species filtering on `/experts` and `/library`. |
| `topic` | Enables topic filtering on `/experts` and `/library`. |
| `videoUrl` | YouTube embed URL for video content. Enables VideoObject schema. |

### Content Types

- `ARTICLE` — Written guides, news, and long-form posts
- `VIDEO` — Recorded video content (tutorials, walkthroughs)
- `TALK` — Live talk recordings from expert sessions
- `COURSE` — Multi-part educational courses
- `NEWS` — Conservation and photography news updates

### Events

For events, ensure:
- `startTime` is set (required for event schema)
- `endTime` is set if known
- `host` is filled in for performer attribution in schema
- `description` is compelling (used in feeds and social sharing)

## Automatic SEO Features

Once content is properly configured:

1. **Sitemap** — Hourly revalidation picks up new Content/Event records
2. **RSS/JSON feeds** — Hourly revalidation includes latest 50 items
3. **JSON-LD** — Content pages auto-generate Article/VideoObject based on `type`
4. **Breadcrumbs** — Auto-generated from category assignment

## Development

### Running Locally

```bash
npm install
npm run dev
```

### Validating SEO Changes

```bash
# Build and check for errors
npm run build

# Check sitemap, robots, feeds locally
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt
curl http://localhost:3000/feed.xml
curl http://localhost:3000/feed.json
```

### Testing Structured Data

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [W3C Feed Validator](https://validator.w3.org/feed/) (for RSS)
