import { NextRequest, NextResponse } from "next/server";
import { anthropic, AUDIT_SYSTEM_PROMPT, AuditData } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    // Normalise l'URL
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: AUDIT_SYSTEM_PROMPT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }] as any,
      messages: [
        {
          role: "user",
          content: `Audite ce site web : ${normalizedUrl}

Commence par une recherche web approfondie sur ce site, puis génère le JSON d'audit complet.`,
        },
      ],
    });

    // Extrait tous les blocs texte et les concatène
    const fullText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    // Trouve le premier { et le dernier } pour extraire le JSON brut
    const jsonStart = fullText.indexOf("{");
    const jsonEnd = fullText.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new SyntaxError("Aucun JSON trouvé dans la réponse");
    }
    const auditData: AuditData = JSON.parse(fullText.slice(jsonStart, jsonEnd + 1));

    // Calcule le score global
    const scores = [
      auditData.design.score,
      auditData.technique.score,
      auditData.seo.score,
      auditData.marketing.score,
      auditData.innovation.score,
    ];
    const globalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // Sauvegarde en DB
    const audit = await prisma.audit.create({
      data: {
        url: normalizedUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { ...auditData, globalScore } as any,
      },
    });

    return NextResponse.json({ id: audit.id, globalScore });
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
