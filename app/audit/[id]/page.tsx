import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuditPresentation } from "@/components/audit-presentation";
import type { AuditData } from "@/lib/anthropic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AuditPage({ params }: PageProps) {
  const { id } = await params;

  const audit = await prisma.audit.findUnique({ where: { id } });
  if (!audit) notFound();

  const data = audit.data as unknown as AuditData & { globalScore: number };

  return <AuditPresentation url={audit.url} data={data} createdAt={audit.createdAt.toISOString()} />;
}
