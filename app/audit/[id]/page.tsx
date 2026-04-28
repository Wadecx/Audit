import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuditPresentation } from "@/components/audit-presentation";
import type { AuditData } from "@/lib/anthropic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AuditPage({ params }: PageProps) {
  const { id } = await params;

  const audit = await prisma.audit.findUnique({
    where: { id },
    include: { axes: true, vision: true },
  });

  if (!audit || !audit.vision) notFound();

  // Reconstruction de l'AuditData depuis les tables normalisées
  const axisMap = Object.fromEntries(
    audit.axes.map((a) => [
      a.axis.toLowerCase(),
      {
        score: a.score,
        points_forts: a.pointsForts,
        points_faibles: a.pointsFaibles,
        recommandation: a.recommandation,
      },
    ])
  );

  const data: AuditData & { globalScore: number } = {
    globalScore: audit.globalScore,
    synthese_globale: audit.syntheseGlobale,
    screenshotUrl: audit.screenshotUrl ?? undefined,
    mockupUrl: audit.mockupUrl ?? undefined,
    design: axisMap["design"],
    technique: axisMap["technique"],
    seo: axisMap["seo"],
    marketing: axisMap["marketing"],
    innovation: axisMap["innovation"],
    vision: {
      accroche: audit.vision.accroche,
      fonctionnalites_proposees: audit.vision.fonctionnalitesProposees,
      idees_ia: audit.vision.ideesIa,
      next_steps: audit.vision.nextSteps,
    },
  };

  return (
    <AuditPresentation
      url={audit.url}
      data={data}
      createdAt={audit.createdAt.toISOString()}
    />
  );
}
