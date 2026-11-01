import { AiAuditInterpretation, AiAuditInterpretationSchema } from './schemas';
import { AuditFinding } from '../types';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && !key.includes('your-gemini-api-key'));
}

export async function interpretAuditWithAi(
  websiteName: string,
  domain: string,
  findings: AuditFinding[],
  seoScore: number,
  geoScore: number,
  aeoScore: number
): Promise<AiAuditInterpretation> {
  if (!isGeminiConfigured()) {
    // Return deterministic offline analytical interpretation
    return generateDeterministicInterpretation(websiteName, domain, findings, seoScore, geoScore, aeoScore);
  }

  const apiKey = process.env.GEMINI_API_KEY!;
  const prompt = `
Generate an evidence-backed SEO, GEO, and AEO intelligence synthesis for the website "${websiteName}" (${domain}).
Scores: SEO Health = ${seoScore}/100, GEO Visibility = ${geoScore}/100, AEO Answer Readiness = ${aeoScore}/100.

Verified Findings (${findings.length} total):
${JSON.stringify(findings.slice(0, 10).map(f => ({
  id: f.id,
  category: f.category,
  title: f.title,
  severity: f.severity,
  url: f.url,
  evidence: f.evidence,
})), null, 2)}

Provide output strictly as JSON matching this structure:
{
  "executiveSummary": "...",
  "strategicPriorities": ["...", "..."],
  "recommendations": [
    {
      "findingId": "...",
      "findingCategory": "technical",
      "affectedUrl": "https://...",
      "evidenceReference": "...",
      "explanation": "...",
      "recommendedAction": "...",
      "reasonForRecommendation": "...",
      "prioritySuggestion": "high",
      "confidenceBasis": "...",
      "limitations": "...",
      "suggestedVerificationMethod": "..."
    }
  ],
  "methodologyDisclaimer": "..."
}
`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Gemini API error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(rawText);

    // Validate with Zod
    const validated = AiAuditInterpretationSchema.parse(parsed);
    return validated;
  } catch (err: any) {
    console.warn(`[Gemini Fallback] Live AI query failed (${err.message}). Using deterministic analysis engine.`);
    return generateDeterministicInterpretation(websiteName, domain, findings, seoScore, geoScore, aeoScore);
  }
}

function generateDeterministicInterpretation(
  websiteName: string,
  domain: string,
  findings: AuditFinding[],
  seoScore: number,
  geoScore: number,
  aeoScore: number
): AiAuditInterpretation {
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;

  const topRecommendations = findings.slice(0, 5).map(f => ({
    findingId: f.id,
    findingCategory: f.category,
    affectedUrl: f.url.startsWith('http') ? f.url : `https://${domain}${f.url}`,
    evidenceReference: f.detectionMethod,
    explanation: f.description,
    recommendedAction: f.recommendation,
    reasonForRecommendation: `Resolving this ${f.severity} issue directly improves ${f.category.toUpperCase()} compliance and snippet readability.`,
    prioritySuggestion: f.severity === 'critical' ? ('critical' as const) : f.severity === 'high' ? ('high' as const) : ('medium' as const),
    confidenceBasis: `Verified by direct DOM/HTTP evidence inspection (${f.confidenceLevel} confidence).`,
    limitations: 'Evaluated against crawled page sample; does not predict search engine algorithm shifts.',
    suggestedVerificationMethod: 'Automated re-crawl of affected URL upon task completion.',
  }));

  return {
    executiveSummary: `Audit analysis for ${websiteName} (${domain}) reveals an overall SEO Health score of ${seoScore}/100, GEO score of ${geoScore}/100, and AEO score of ${aeoScore}/100. Discovered ${findings.length} findings (${criticalCount} critical, ${highCount} high). Immediate resolution of top-level heading and snippet metadata issues is recommended to stabilize organic search capture.`,
    strategicPriorities: [
      `Resolve ${criticalCount} critical technical issues directly impacting document hierarchy and crawlability.`,
      `Implement structured author (Person) and organization entities to strengthen GEO citation authority.`,
      `Incorporate question-based subheadings and concise direct answers for AEO featured snippet eligibility.`,
    ],
    recommendations: topRecommendations,
    methodologyDisclaimer: 'Recommendations generated by RankPilot AI based strictly on verified crawl evidence. GEO and AEO scores represent proprietary diagnostic health evaluations, not search engine ranking promises.',
  };
}
