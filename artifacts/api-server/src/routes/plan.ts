import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import {
  db,
  clientsTable,
  auditsTable,
  auditChecksTable,
} from "@workspace/db";
import { requireUser } from "../middlewares/auth";

const router: IRouter = Router();

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are a senior local-SEO strategist who only works with home service businesses (HVAC, plumbing, electrical, roofing, cleaning). You write for the BUSINESS OWNER, not an agency. Tone: confident, direct, friendly, no fluff, no jargon. Never say "leverage", "synergy", or "in today's digital landscape."

Given a one-business SEO audit, produce a focused 14-day action plan:

1. Open with one sentence on what's actually hurting them most (be specific — cite the failing check).
2. Then a section called "This week (do today / tomorrow)" with 3–5 concrete, named actions the owner can do themselves in under an hour each. Each action: bold the action, then a 1–2 sentence "how" written like you're texting them.
3. A section called "Next week" with 2–4 actions that take more time but pay off bigger (write a service page, request reviews, fix sitemap).
4. A section called "Hire someone for" with the 1–2 items that genuinely need a pro (custom dev work, schema-heavy rewrites).
5. End with a one-sentence "Expected lift" — be honest, hedged, and numeric where possible.

Format as Markdown. No preamble. No "Sure, here's...". Start with the diagnosis sentence.`;

router.post("/audits/:auditId/plan", requireUser, async (req, res) => {
  const auditId = String(req.params.auditId);
  const { agencyId } = req.auth!;

  const row = (
    await db
      .select({ audit: auditsTable, client: clientsTable })
      .from(auditsTable)
      .innerJoin(clientsTable, eq(auditsTable.clientId, clientsTable.id))
      .where(
        and(eq(auditsTable.id, auditId), eq(clientsTable.agencyId, agencyId)),
      )
  )[0];

  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const checks = await db
    .select()
    .from(auditChecksTable)
    .where(eq(auditChecksTable.auditId, auditId));

  if (!process.env["ANTHROPIC_API_KEY"]) {
    res.status(503).json({
      error: "anthropic_not_configured",
      message:
        "Set ANTHROPIC_API_KEY on the server to generate AI improvement plans.",
    });
    return;
  }

  const summary = {
    business: row.client.name,
    website: row.client.websiteUrl,
    city: row.client.city,
    score: row.audit.score,
    failing: checks
      .filter((c) => c.status === "fail" || c.status === "warn")
      .map((c) => ({
        title: c.title,
        category: c.category,
        status: c.status,
        finding: c.finding,
        weight: c.weight,
      })),
    passing: checks
      .filter((c) => c.status === "pass")
      .map((c) => c.title),
  };

  const userMsg = `Audit JSON:\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\`\n\nWrite the plan now.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env["ANTHROPIC_API_KEY"]!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      res.status(502).json({ error: "anthropic_error", details: text });
      return;
    }

    const data = (await r.json()) as {
      content: { type: string; text: string }[];
    };
    const markdown = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    res.json({ markdown, model: MODEL });
  } catch (e) {
    res.status(500).json({
      error: "request_failed",
      message: e instanceof Error ? e.message : String(e),
    });
  }
});

export default router;
