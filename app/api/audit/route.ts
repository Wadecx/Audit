import { NextRequest, NextResponse } from "next/server";
import { anthropic, AUDIT_SYSTEM_PROMPT, AuditData } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";

async function resolveScreenshotUrl(url: string): Promise<string> {
  // Vérifie si le site répond correctement en HTTPS
  // Si le cert est invalide, fetch lève une erreur → on bascule en HTTP
  try {
    await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    return url; // HTTPS OK
  } catch {
    // Cert invalide ou autre erreur TLS → on essaie HTTP
    return url.replace(/^https:\/\//i, "http://");
  }
}

async function fetchScreenshot(url: string): Promise<string | null> {
  try {
    const targetUrl = await resolveScreenshotUrl(url);

    const params = new URLSearchParams({
      url: targetUrl,
      screenshot: "true",
      meta: "false",
      "screenshot.type": "jpeg",
      "screenshot.quality": "85",
      "screenshot.fullPage": "false",
      // Attend que le JS soit chargé avant de capturer
      "screenshot.delay": "2000",
      waitForSelector: "body",
    });

    const res = await fetch(`https://api.microlink.io?${params}`, {
      signal: AbortSignal.timeout(25000),
    });
    const json = await res.json();
    const screenshotUrl = json?.data?.screenshot?.url ?? null;

    // Si la capture est vide ou échoue, essaie PageSpeed Insights (renvoie une capture base64)
    if (!screenshotUrl) {
      return await fetchPageSpeedScreenshot(url);
    }

    return screenshotUrl;
  } catch {
    return await fetchPageSpeedScreenshot(url).catch(() => null);
  }
}

async function fetchPageSpeedScreenshot(url: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=desktop&key=`,
      { signal: AbortSignal.timeout(20000) }
    );
    const json = await res.json();
    const b64 = json?.lighthouseResult?.audits?.["final-screenshot"]?.details?.data;
    if (!b64) return null;
    // Retourne le data URI directement (compatible avec <img src="">)
    return b64;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

    // Appels en parallèle : audit Anthropic + screenshot Microlink
    const [message, screenshotUrl] = await Promise.all([
      anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        system: AUDIT_SYSTEM_PROMPT,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }] as any,
        messages: [
          {
            role: "user",
            content: `Audite ce site web : ${normalizedUrl}\n\nCommence par une recherche web approfondie sur ce site, puis génère le JSON d'audit complet.`,
          },
        ],
      }),
      fetchScreenshot(normalizedUrl),
    ]);

    // Extrait le JSON de la réponse Anthropic
    const fullText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const jsonStart = fullText.indexOf("{");
    const jsonEnd = fullText.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new SyntaxError("Aucun JSON trouvé dans la réponse");
    }
    const auditData: AuditData = JSON.parse(fullText.slice(jsonStart, jsonEnd + 1));

    // Score global
    const scores = [
      auditData.design.score,
      auditData.technique.score,
      auditData.seo.score,
      auditData.marketing.score,
      auditData.innovation.score,
    ];
    const globalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // Sauvegarde en DB (avec screenshot URL si disponible)
    const audit = await prisma.audit.create({
      data: {
        url: normalizedUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { ...auditData, globalScore, screenshotUrl } as any,
      },
    });

    return NextResponse.json({ id: audit.id, globalScore, screenshotUrl });
  } catch (error) {
    console.error("Erreur audit:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Erreur lors du parsing de la réponse IA" },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
