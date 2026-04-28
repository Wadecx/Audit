import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const audit = await prisma.audit.findUnique({
      where: { id },
      include: { axes: true, vision: true },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit non trouvé", code: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json(audit);
  } catch (error) {
    console.error("Erreur récupération audit:", error);
    return NextResponse.json({ error: "Erreur interne du serveur", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
