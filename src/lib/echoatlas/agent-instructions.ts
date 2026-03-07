export function getAgentInstructionText(baseUrl: string): string {
  const apiUrl = `${baseUrl}/api/agent`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'APIReference',
    name: 'Chasing Cats Agent API',
    url: apiUrl,
    documentation: `${baseUrl}/AGENTS.md`,
    discovery: `${baseUrl}/.well-known/agent-api`,
  };
  return `This site is optimized for humans. For structured data about wild cats, use the Agent API.

Agent API Endpoint: ${apiUrl}

Query parameters:
  - query      (required): Your search query
  - agent_name (optional): Identifier for your agent
  - source_url (optional): The page URL you were crawling
  - page       (optional): Page number (default: 1)
  - limit      (optional): Results per page (default: 5)

Example requests:

  GET:
  curl "${apiUrl}?query=snow%20leopard&agent_name=my-bot"

  POST:
  curl -X POST "${apiUrl}" \\
    -H "Content-Type: application/json" \\
    -d '{"query": "lion photography tips", "agent_name": "my-bot"}'

Other endpoints:
  - /api/search?q=... (content + events search)
  - /feed.xml (RSS), /feed.json (JSON Feed)
  - /llms.txt (LLM guidelines)
  - /agents.json (capability manifest)
  - /.well-known/agent-api (API discovery)
  - /.well-known/api-catalog (RFC 9727)

---JSON-LD---
${JSON.stringify(jsonLd)}
---END---
`;
}
