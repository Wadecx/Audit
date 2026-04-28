-- Normalisation du schéma Audit
-- Les anciennes lignes (format JSON blob) sont supprimées car incompatibles.

-- Enums
CREATE TYPE "AuditStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE "AxisType" AS ENUM ('DESIGN', 'TECHNIQUE', 'SEO', 'MARKETING', 'INNOVATION');

-- Suppression de l'ancienne table (ancien format avec champ data JSONB)
DROP TABLE IF EXISTS "Audit" CASCADE;

-- Table principale Audit
CREATE TABLE "Audit" (
    "id"              TEXT NOT NULL,
    "url"             TEXT NOT NULL,
    "domain"          TEXT NOT NULL,
    "globalScore"     INTEGER NOT NULL,
    "syntheseGlobale" TEXT NOT NULL,
    "screenshotUrl"   TEXT,
    "mockupUrl"       TEXT,
    "status"          "AuditStatus" NOT NULL DEFAULT 'COMPLETED',
    "durationMs"      INTEGER,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- Table des axes d'audit
CREATE TABLE "AuditAxis" (
    "id"             TEXT NOT NULL,
    "auditId"        TEXT NOT NULL,
    "axis"           "AxisType" NOT NULL,
    "score"          INTEGER NOT NULL,
    "pointsForts"    TEXT[] NOT NULL,
    "pointsFaibles"  TEXT[] NOT NULL,
    "recommandation" TEXT NOT NULL,

    CONSTRAINT "AuditAxis_pkey" PRIMARY KEY ("id")
);

-- Table vision de refonte
CREATE TABLE "AuditVision" (
    "id"                       TEXT NOT NULL,
    "auditId"                  TEXT UNIQUE NOT NULL,
    "accroche"                 TEXT NOT NULL,
    "fonctionnalitesProposees" TEXT[] NOT NULL,
    "ideesIa"                  TEXT[] NOT NULL,
    "nextSteps"                TEXT[] NOT NULL,

    CONSTRAINT "AuditVision_pkey" PRIMARY KEY ("id")
);

-- Index
CREATE INDEX "Audit_domain_idx"        ON "Audit"("domain");
CREATE INDEX "Audit_globalScore_idx"   ON "Audit"("globalScore");
CREATE INDEX "Audit_createdAt_idx"     ON "Audit"("createdAt");
CREATE INDEX "AuditAxis_auditId_idx"   ON "AuditAxis"("auditId");
CREATE INDEX "AuditAxis_axis_score_idx" ON "AuditAxis"("axis", "score");
CREATE UNIQUE INDEX "AuditAxis_auditId_axis_key" ON "AuditAxis"("auditId", "axis");

-- Clés étrangères
ALTER TABLE "AuditAxis"   ADD CONSTRAINT "AuditAxis_auditId_fkey"   FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditVision" ADD CONSTRAINT "AuditVision_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
