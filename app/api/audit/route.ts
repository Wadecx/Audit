import { NextRequest, NextResponse } from "next/server";
import { anthropic, AUDIT_SYSTEM_PROMPT, AuditData } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { StitchToolClient, Stitch, buildFifeSuffix } from "@google/stitch-sdk";

// ─── Erreur métier typée ──────────────────────────────────────────────────────

class AuditError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "AuditError";
  }
}

// ─── Vérification d'accessibilité du site ─────────────────────────────────────

async function checkSiteReachability(url: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
    });
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    const cause = (err as { cause?: { code?: string; message?: string } }).cause;
    const code = cause?.code ?? "";
    const causeMsg = (cause?.message ?? "").toLowerCase();

    if (name === "TimeoutError" || name === "AbortError") {
      throw new AuditError(
        "Site inaccessible — le serveur ne répond pas (délai de connexion dépassé)",
        408,
        "TIMEOUT"
      );
    }
    if (
      code === "ENOTFOUND" ||
      code === "EAI_NONAME" ||
      code === "EAI_AGAIN" ||
      causeMsg.includes("getaddrinfo")
    ) {
      throw new AuditError(
        "Site non trouvé — ce domaine n'existe pas ou est introuvable",
        404,
        "DNS_NOT_FOUND"
      );
    }
    if (code === "ECONNREFUSED") {
      throw new AuditError(
        "Site inaccessible — le serveur refuse la connexion",
        503,
        "CONN_REFUSED"
      );
    }
    if (
      code === "CERT_HAS_EXPIRED" ||
      code === "ERR_TLS_CERT_ALTNAME_INVALID" ||
      code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
      code === "SELF_SIGNED_CERT_IN_CHAIN"
    ) {
      throw new AuditError(
        "Site inaccessible — certificat SSL invalide ou expiré",
        400,
        "SSL_ERROR"
      );
    }
    if (code === "ECONNRESET" || code === "EPIPE") {
      throw new AuditError(
        "Site inaccessible — la connexion a été interrompue",
        503,
        "CONN_RESET"
      );
    }

    throw new AuditError(
      "Site inaccessible — impossible de joindre le serveur",
      503,
      "UNREACHABLE"
    );
  }

  // HEAD bloqué par le serveur → site accessible malgré tout
  if (res.status === 405) return;

  if (res.status === 404) {
    throw new AuditError(
      "Page introuvable — la page d'accueil retourne une erreur 404",
      404,
      "NOT_FOUND"
    );
  }
  if (res.status === 401 || res.status === 403) {
    throw new AuditError(
      `Site protégé — accès refusé (HTTP ${res.status})`,
      403,
      "ACCESS_DENIED"
    );
  }
  if (res.status >= 400 && res.status < 500) {
    throw new AuditError(
      `Site inaccessible — erreur client HTTP ${res.status}`,
      400,
      "CLIENT_ERROR"
    );
  }
  if (res.status >= 500) {
    throw new AuditError(
      `Site temporairement indisponible — erreur serveur HTTP ${res.status}`,
      503,
      "SERVER_ERROR"
    );
  }
}

// ─── Screenshot : Microlink (primaire) → PageSpeed (fallback) ────────────────

async function fetchScreenshot(url: string): Promise<string | null> {
  // Microlink — retourne une URL CDN légère, supporte le rendu JS
  try {
    const microlinkUrl =
      `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&waitFor=1500`;
    const res = await fetch(microlinkUrl, { signal: AbortSignal.timeout(22_000) });
    if (res.ok) {
      const json = await res.json();
      const shot: string | undefined = json?.data?.screenshot?.url;
      if (shot) return shot;
    }
  } catch { /* fall through */ }

  // Fallback : Google PageSpeed Insights (base64)
  try {
    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=desktop`,
      { signal: AbortSignal.timeout(30_000) }
    );
    const json = await res.json();
    return json?.lighthouseResult?.audits?.["final-screenshot"]?.details?.data ?? null;
  } catch {
    return null;
  }
}

// ─── Mockup IA via Google Stitch ──────────────────────────────────────────────

async function generateStitchMockup(
  domain: string,
  auditData: AuditData
): Promise<string | null> {
  const apiKey = process.env.STITCH_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new StitchToolClient({ apiKey });
    const stitch = new Stitch(client);

    const project = await stitch.createProject(`Refonte ${domain}`);

    const features = auditData.vision.fonctionnalites_proposees.slice(0, 3).join(", ");
    const designReco = auditData.design.recommandation;
    const accroche = auditData.vision.accroche;

    const prompt = `You are a world-class UI/UX designer. Redesign the homepage of "${domain}".

BUSINESS CONTEXT: ${accroche}
DESIGN IMPROVEMENT GOAL: ${designReco}

REQUIREMENTS:
- Keep the same industry/sector aesthetic (colors, mood, typography style appropriate for this type of business)
- Modern, clean layout with strong visual hierarchy
- Hero section with headline: "${accroche}"
- Navigation bar with logo placeholder
- 3 feature/service sections: ${features}
- Clear CTA button
- Professional, premium look — no dark tech or generic SaaS style unless the brand calls for it
- Adapt the color palette and imagery style to the actual business sector
- High visual fidelity, not wireframe`;

    const screen = await project.generate(prompt, "DESKTOP", "GEMINI_3_1_PRO");
    const baseImageUrl = await screen.getImage();
    if (!baseImageUrl) return null;

    return baseImageUrl + buildFifeSuffix({ width: 1280 });
  } catch (err) {
    console.error("Stitch mockup error:", err);
    return null;
  }
}

// ─── POST /api/audit ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json(
        { error: "URL manquante ou invalide", code: "MISSING_URL" },
        { status: 400 }
      );
    }

    const rawUrl = body.url.trim();
    const normalizedUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

    // Validation du format d'URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        {
          error: "Format d'URL invalide — vérifiez l'adresse (ex : exemple.com ou https://exemple.com)",
          code: "INVALID_URL_FORMAT",
        },
        { status: 400 }
      );
    }

    // Le domaine doit contenir au moins un point (pas "localhost" ou "test")
    if (!parsedUrl.hostname.includes(".")) {
      return NextResponse.json(
        {
          error: "Domaine invalide — l'URL doit contenir un nom de domaine valide (ex : exemple.com)",
          code: "INVALID_DOMAIN",
        },
        { status: 400 }
      );
    }

    const domain = parsedUrl.hostname.replace(/^www\./, "");

    // Vérification de l'accessibilité avant de lancer l'audit
    await checkSiteReachability(normalizedUrl);

    // Audit Anthropic + screenshot PageSpeed en parallèle
    const [message, screenshotUrl] = await Promise.all([
      anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        system: AUDIT_SYSTEM_PROMPT,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 8 }] as any,
        messages: [
          {
            role: "user",
            content: `Audite ce site web : ${normalizedUrl}\n\nCommence par une recherche web approfondie sur ce site, puis génère le JSON d'audit complet.`,
          },
        ],
      }),
      fetchScreenshot(normalizedUrl),
    ]);

    // Extraction du JSON depuis la réponse Anthropic
    const fullText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const jsonStart = fullText.indexOf("{");
    const jsonEnd = fullText.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new SyntaxError("Aucun JSON trouvé dans la réponse IA");
    }

    const auditData: AuditData = JSON.parse(fullText.slice(jsonStart, jsonEnd + 1));

    // Mockup Stitch (optionnel)
    const mockupUrl = await generateStitchMockup(domain, auditData);

    // Score global
    const scores = [
      auditData.design.score,
      auditData.technique.score,
      auditData.seo.score,
      auditData.marketing.score,
      auditData.innovation.score,
    ];
    const globalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const durationMs = Date.now() - startTime;

    // Sauvegarde normalisée en base de données
    const audit = await prisma.audit.create({
      data: {
        url: normalizedUrl,
        domain,
        globalScore,
        syntheseGlobale: auditData.synthese_globale,
        screenshotUrl: screenshotUrl ?? undefined,
        mockupUrl: mockupUrl ?? undefined,
        status: "COMPLETED",
        durationMs,
        axes: {
          create: [
            {
              axis: "DESIGN",
              score: auditData.design.score,
              pointsForts: auditData.design.points_forts,
              pointsFaibles: auditData.design.points_faibles,
              recommandation: auditData.design.recommandation,
            },
            {
              axis: "TECHNIQUE",
              score: auditData.technique.score,
              pointsForts: auditData.technique.points_forts,
              pointsFaibles: auditData.technique.points_faibles,
              recommandation: auditData.technique.recommandation,
            },
            {
              axis: "SEO",
              score: auditData.seo.score,
              pointsForts: auditData.seo.points_forts,
              pointsFaibles: auditData.seo.points_faibles,
              recommandation: auditData.seo.recommandation,
            },
            {
              axis: "MARKETING",
              score: auditData.marketing.score,
              pointsForts: auditData.marketing.points_forts,
              pointsFaibles: auditData.marketing.points_faibles,
              recommandation: auditData.marketing.recommandation,
            },
            {
              axis: "INNOVATION",
              score: auditData.innovation.score,
              pointsForts: auditData.innovation.points_forts,
              pointsFaibles: auditData.innovation.points_faibles,
              recommandation: auditData.innovation.recommandation,
            },
          ],
        },
        vision: {
          create: {
            accroche: auditData.vision.accroche,
            fonctionnalitesProposees: auditData.vision.fonctionnalites_proposees,
            ideesIa: auditData.vision.idees_ia,
            nextSteps: auditData.vision.next_steps,
          },
        },
      },
    });

    return NextResponse.json({ id: audit.id, globalScore, screenshotUrl, mockupUrl });
  } catch (error) {
    console.error("Erreur audit:", error);

    if (error instanceof AuditError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.httpStatus }
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Erreur lors de la génération du rapport IA — veuillez réessayer", code: "AI_PARSE_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
