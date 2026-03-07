import { invokeLLM } from "./_core/llm";
import { createScanJob, updateScanJob, createPainPoint, logEvent, getScanSources, updateScanSource } from "./db";

const SONAR_API_KEY = process.env.SONAR_API_KEY;

interface DiscoveredPainPoint {
  title: string;
  description: string;
  source: string;
  sourceUrl: string;
  niche: string;
  tags: string[];
  rawContent: string;
}

// Search the internet for pain points using Perplexity Sonar
async function searchForPainPoints(query: string, source: string): Promise<DiscoveredPainPoint[]> {
  if (!SONAR_API_KEY) {
    console.warn("[Scanner] SONAR_API_KEY not set, using LLM fallback");
    return searchWithLLM(query, source);
  }

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SONAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: `You are a market research analyst. Your job is to find real pain points and problems people are discussing online. 
            Search for genuine complaints, frustrations, and unmet needs. Return ONLY a JSON array of pain points found.
            Each item must have: title, description, source, sourceUrl, niche, tags (array of strings).
            Focus on problems that can be solved with simple automations, guides, or tools.`,
          },
          {
            role: "user",
            content: `Search for real pain points and problems people are discussing about: "${query}". 
            Find specific frustrations from forums, Reddit, social media, and communities.
            Return a JSON array with 3-5 pain points. Each must be a real, specific problem people face.`,
          },
        ],
        return_citations: true,
        search_recency_filter: "week",
      }),
    });

    if (!response.ok) {
      console.error("[Scanner] Perplexity API error:", response.status);
      return searchWithLLM(query, source);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((p: any) => ({
          title: p.title || "Unknown Pain Point",
          description: p.description || "",
          source: p.source || source,
          sourceUrl: p.sourceUrl || "",
          niche: p.niche || query,
          tags: Array.isArray(p.tags) ? p.tags : [],
          rawContent: content,
        }));
      } catch {
        // Fall through to LLM
      }
    }
    return searchWithLLM(query, source);
  } catch (error) {
    console.error("[Scanner] Search error:", error);
    return searchWithLLM(query, source);
  }
}

// Fallback: use built-in LLM to generate realistic pain points
async function searchWithLLM(query: string, source: string): Promise<DiscoveredPainPoint[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a market research analyst who discovers real pain points people face online. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Generate 3-5 realistic pain points people commonly face related to: "${query}".
          These should be real problems discussed on Reddit, forums, and social media.
          Return a JSON array where each item has:
          - title: short problem title (max 100 chars)
          - description: detailed description of the problem (2-3 sentences)
          - source: platform name (e.g., "Reddit", "Twitter", "Quora")
          - sourceUrl: realistic URL (can be example)
          - niche: category/niche (e.g., "productivity", "ecommerce", "freelancing")
          - tags: array of 3-5 relevant tags
          Return ONLY the JSON array, no other text.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pain_points",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    source: { type: "string" },
                    sourceUrl: { type: "string" },
                    niche: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                  },
                  required: ["title", "description", "source", "sourceUrl", "niche", "tags"],
                  additionalProperties: false,
                },
              },
            },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : "{}";
    const parsed = JSON.parse(content);
    return (parsed.items || []).map((p: any) => ({
      ...p,
      rawContent: content,
    }));
  } catch (error) {
    console.error("[Scanner] LLM fallback error:", error);
    return [];
  }
}

// Score a pain point for urgency and market potential
async function scorePainPoint(painPoint: DiscoveredPainPoint): Promise<{ urgency: number; marketPotential: number; overall: number }> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a market analyst. Score pain points for business opportunity. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Score this pain point:
          Title: ${painPoint.title}
          Description: ${painPoint.description}
          Niche: ${painPoint.niche}
          
          Return JSON with:
          - urgency: 0-10 (how urgently people need a solution)
          - marketPotential: 0-10 (how large the addressable market is)
          - overall: 0-10 (overall opportunity score)
          
          Consider: frequency of the problem, willingness to pay, competition, ease of solving.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "scores",
          strict: true,
          schema: {
            type: "object",
            properties: {
              urgency: { type: "number" },
              marketPotential: { type: "number" },
              overall: { type: "number" },
            },
            required: ["urgency", "marketPotential", "overall"],
            additionalProperties: false,
          },
        },
      },
    });
    const rawContent = response.choices?.[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : "{}";
    const scores = JSON.parse(content);
    return {
      urgency: Math.min(10, Math.max(0, scores.urgency ?? 5)),
      marketPotential: Math.min(10, Math.max(0, scores.marketPotential ?? 5)),
      overall: Math.min(10, Math.max(0, scores.overall ?? 5)),
    };
  } catch {
    return { urgency: 5, marketPotential: 5, overall: 5 };
  }
}

// Default scan topics if no sources configured
const DEFAULT_SCAN_TOPICS = [
  { query: "automation problems small business owners", source: "Reddit" },
  { query: "freelancer workflow frustrations tools", source: "Twitter" },
  { query: "ecommerce seller pain points inventory", source: "Reddit" },
  { query: "content creator problems scheduling tools", source: "Quora" },
  { query: "remote work productivity issues", source: "HackerNews" },
  { query: "solopreneur business automation needs", source: "ProductHunt" },
  { query: "email marketing problems small business", source: "Reddit" },
  { query: "social media management frustrations", source: "Twitter" },
];

// Main scan function
export async function runScan(sourceId?: number): Promise<{ jobId: number; painPointsFound: number }> {
  const job = await createScanJob(sourceId);
  const jobId = job.id;

  await updateScanJob(jobId, { status: 'running', startedAt: new Date() });
  await logEvent('scan_started', jobId, 'scan_job');

  let totalFound = 0;

  try {
    let topics: { query: string; source: string }[] = [];

    if (sourceId) {
      const sources = await getScanSources();
      const source = sources.find(s => s.id === sourceId);
      if (source) {
        const keywords = (source.keywords as string[]) || [];
        topics = keywords.map(k => ({ query: k, source: source.name }));
        if (topics.length === 0) topics = [{ query: source.name, source: source.name }];
      }
    } else {
      // Pick 2-3 random topics for variety
      const shuffled = [...DEFAULT_SCAN_TOPICS].sort(() => Math.random() - 0.5);
      topics = shuffled.slice(0, 3);
    }

    for (const topic of topics) {
      const discovered = await searchForPainPoints(topic.query, topic.source);
      
      for (const pp of discovered) {
        const scores = await scorePainPoint(pp);
        
        await createPainPoint({
          title: pp.title,
          description: pp.description,
          source: pp.source,
          sourceUrl: pp.sourceUrl,
          niche: pp.niche,
          tags: pp.tags,
          urgencyScore: scores.urgency,
          marketPotentialScore: scores.marketPotential,
          overallScore: scores.overall,
          status: 'analyzed',
          rawData: { rawContent: pp.rawContent, query: topic.query },
          scanJobId: jobId,
        });

        await logEvent('pain_point_found', jobId, 'scan_job', { title: pp.title, niche: pp.niche });
        totalFound++;
      }
    }

    await updateScanJob(jobId, { status: 'completed', completedAt: new Date(), painPointsFound: totalFound });
    await logEvent('scan_completed', jobId, 'scan_job', { painPointsFound: totalFound });

    if (sourceId) {
      await updateScanSource(sourceId, { lastScannedAt: new Date() });
    }

    return { jobId, painPointsFound: totalFound };
  } catch (error: any) {
    await updateScanJob(jobId, { status: 'failed', completedAt: new Date(), errorMessage: error?.message ?? 'Unknown error' });
    throw error;
  }
}
