import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import {
  getPainPointById, updatePainPoint, createSolution, updateSolution,
  createProduct, logEvent, getSolutionTemplates,
} from "./db";
import { nanoid } from "nanoid";

type SolutionType = "automation_script" | "pdf_guide" | "mini_tool" | "checklist" | "template" | "video_script";

interface GeneratedSolution {
  title: string;
  description: string;
  type: SolutionType;
  content: string;
  suggestedPrice: number;
  category: string;
  tags: string[];
}

// Generate a solution for a pain point
export async function generateSolution(
  painPointId: number,
  preferredType?: SolutionType
): Promise<{ solutionId: number; productId?: number }> {
  const painPoint = await getPainPointById(painPointId);
  if (!painPoint) throw new Error(`Pain point ${painPointId} not found`);

  // Determine solution type
  const solutionType = preferredType || determineBestSolutionType(painPoint);

  // Generate the solution content
  const generated = await generateSolutionContent(painPoint, solutionType);

  // Save solution to DB
  const solution = await createSolution({
    painPointId,
    title: generated.title,
    description: generated.description,
    type: solutionType,
    content: generated.content,
    status: 'pending_review',
    generatedBy: 'ai',
  });

  await logEvent('solution_generated', solution.id, 'solution', {
    type: solutionType,
    painPointTitle: painPoint.title,
  });

  // Update pain point status
  await updatePainPoint(painPointId, { status: 'solution_ready' });

  return { solutionId: solution.id };
}

function determineBestSolutionType(painPoint: { niche?: string | null; tags?: string[] | null; description: string }): SolutionType {
  const desc = (painPoint.description + ' ' + (painPoint.niche ?? '')).toLowerCase();
  const tags = (painPoint.tags as string[] || []).join(' ').toLowerCase();
  const combined = desc + ' ' + tags;

  if (combined.includes('automat') || combined.includes('script') || combined.includes('workflow') || combined.includes('zapier')) {
    return 'automation_script';
  }
  if (combined.includes('checklist') || combined.includes('step') || combined.includes('process')) {
    return 'checklist';
  }
  if (combined.includes('template') || combined.includes('email') || combined.includes('contract')) {
    return 'template';
  }
  if (combined.includes('video') || combined.includes('tutorial') || combined.includes('course')) {
    return 'video_script';
  }
  if (combined.includes('tool') || combined.includes('calculator') || combined.includes('generator')) {
    return 'mini_tool';
  }
  return 'pdf_guide';
}

async function generateSolutionContent(
  painPoint: { title: string; description: string; niche?: string | null; tags?: string[] | null },
  type: SolutionType
): Promise<GeneratedSolution> {
  const typeInstructions: Record<SolutionType, string> = {
    automation_script: `Create a detailed automation script/workflow guide. Include:
      - Step-by-step automation setup instructions
      - Tool recommendations (Zapier, Make, n8n, or Python)
      - Actual code snippets or workflow steps
      - Expected time savings
      - Troubleshooting tips`,
    pdf_guide: `Create a comprehensive PDF guide. Include:
      - Executive summary
      - Problem analysis
      - Step-by-step solution
      - Best practices
      - Common mistakes to avoid
      - Resources and tools
      - Action checklist`,
    mini_tool: `Create a mini-tool specification and implementation guide. Include:
      - Tool description and use case
      - Features list
      - How-to-use instructions
      - Example inputs/outputs
      - Integration possibilities`,
    checklist: `Create a detailed actionable checklist. Include:
      - Pre-requisites
      - Step-by-step checklist items (20-30 items)
      - Verification steps
      - Common pitfalls
      - Success metrics`,
    template: `Create a ready-to-use template. Include:
      - Template purpose and use case
      - Complete template content (fill-in-the-blank format)
      - Instructions for customization
      - Examples of completed template
      - Tips for best results`,
    video_script: `Create a complete video script/tutorial outline. Include:
      - Hook and intro (30 seconds)
      - Problem statement
      - Solution walkthrough (step by step)
      - Demonstration notes
      - Call to action
      - Full script with timestamps`,
  };

  const typeLabels: Record<SolutionType, string> = {
    automation_script: "Automation Script & Workflow Guide",
    pdf_guide: "Complete PDF Guide",
    mini_tool: "Mini Tool & Implementation Guide",
    checklist: "Action Checklist",
    template: "Ready-to-Use Template",
    video_script: "Video Script & Tutorial",
  };

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert product creator who builds digital solutions for common problems. 
        Create high-quality, immediately actionable digital products that people would pay for.
        Return ONLY valid JSON.`,
      },
      {
        role: "user",
        content: `Create a "${typeLabels[type]}" solution for this pain point:
        
        Problem: ${painPoint.title}
        Description: ${painPoint.description}
        Niche: ${painPoint.niche ?? 'General'}
        Tags: ${(painPoint.tags as string[] || []).join(', ')}
        
        ${typeInstructions[type]}
        
        Return JSON with:
        - title: compelling product title (max 80 chars)
        - description: detailed product description (3-4 sentences, highlight value)
        - content: the full solution content (detailed, actionable, 500-1500 words)
        - suggestedPrice: recommended price in USD (5-97 based on value)
        - category: product category
        - tags: array of 5 relevant tags`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "solution",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            content: { type: "string" },
            suggestedPrice: { type: "number" },
            category: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
          },
          required: ["title", "description", "content", "suggestedPrice", "category", "tags"],
          additionalProperties: false,
        },
      },
    },
  });

  const rawContent = response.choices?.[0]?.message?.content;
  const content = typeof rawContent === 'string' ? rawContent : '{}';
  const parsed = JSON.parse(content);

  return {
    title: parsed.title || `Solution for: ${painPoint.title}`,
    description: parsed.description || painPoint.description,
    type,
    content: parsed.content || "",
    suggestedPrice: Math.max(4.99, Math.min(97, parsed.suggestedPrice || 9.99)),
    category: parsed.category || painPoint.niche || "General",
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
  };
}

// Publish an approved solution as a marketplace product
export async function publishSolutionAsProduct(solutionId: number): Promise<number> {
  const { getSolutionById } = await import("./db");
  const solution = await getSolutionById(solutionId);
  if (!solution) throw new Error(`Solution ${solutionId} not found`);
  if (solution.status !== 'approved') throw new Error(`Solution ${solutionId} is not approved`);

  // Generate a cover image prompt description (stored as text)
  const coverDescription = `Digital product: ${solution.title}`;

  // Create the product listing
  const product = await createProduct({
    solutionId,
    title: solution.title,
    description: solution.description,
    shortDescription: solution.description.substring(0, 200),
    price: 9.99, // Default price, admin can update
    category: "Digital Solutions",
    tags: [],
    isPublished: true,
    isFeatured: false,
    salesCount: 0,
    viewCount: 0,
    rating: 0,
  });

  // Update solution status
  await updateSolution(solutionId, { status: 'published' });

  await logEvent('product_published', product.id, 'product', { solutionId, title: solution.title });

  return product.id;
}

// Generate a download token for an order
export async function generateDownloadToken(): Promise<string> {
  return nanoid(32);
}

// Prepare solution file for delivery (upload to S3)
export async function prepareSolutionFile(solutionId: number): Promise<string> {
  const { getSolutionById } = await import("./db");
  const solution = await getSolutionById(solutionId);
  if (!solution) throw new Error(`Solution ${solutionId} not found`);

  if (solution.fileUrl) return solution.fileUrl;

  // Generate a text file with the solution content
  const content = solution.content || solution.description;
  const fileName = `${solution.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${nanoid(8)}.txt`;
  const fileKey = `solutions/${solutionId}/${fileName}`;

  const { url } = await storagePut(fileKey, Buffer.from(content, 'utf-8'), 'text/plain');

  await updateSolution(solutionId, { fileUrl: url, fileKey });

  return url;
}
