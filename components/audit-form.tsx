"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AUDIT_STEPS = [
  { label: "Vérification du site…",         icon: "🌐", duration: 2500  },
  { label: "Analyse du design & UX…",       icon: "🎨", duration: 10000 },
  { label: "Audit technique en cours…",     icon: "⚡", duration: 10000 },
  { label: "SEO & géolocalisation…",        icon: "🔍", duration: 10000 },
  { label: "Marketing digital & réseaux…",  icon: "📣", duration: 10000 },
  { label: "Innovation & IA…",             icon: "🤖", duration: 10000 },
  { label: "Génération de la présentation…",icon: "✨", duration: 99999 },
];

export function AuditForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function scheduleSteps() {
    let elapsed = 0;
    AUDIT_STEPS.forEach((step, i) => {
      if (i === 0) return;
      elapsed += AUDIT_STEPS[i - 1].duration;
      const t = setTimeout(() => setCurrentStep(i), elapsed);
      timeoutsRef.current.push(t);
    });
  }

  function clearSteps() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setCurrentStep(0);
    scheduleSteps();

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      clearSteps();

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'audit");
      }

      const { id } = await res.json();
      setCurrentStep(AUDIT_STEPS.length - 1);
      router.push(`/audit/${id}`);
    } catch (err) {
      clearSteps();
      setLoading(false);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  }

  if (loading) {
    const progress = Math.round((currentStep / (AUDIT_STEPS.length - 1)) * 100);

    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg">
        {/* Spinner + icône active */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            {AUDIT_STEPS[currentStep].icon}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/40">Analyse en cours</span>
            <span className="text-xs font-semibold text-violet-400">{progress}%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Étapes */}
        <div className="w-full space-y-2.5">
          {AUDIT_STEPS.map((step, i) => {
            const done    = i < currentStep;
            const active  = i === currentStep;
            const pending = i > currentStep;
            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  done ? "opacity-35" : active ? "opacity-100" : "opacity-20"
                }`}
              >
                {/* Indicateur */}
                <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] border transition-all duration-300 ${
                  done    ? "border-violet-500/50 bg-violet-500/20 text-violet-400"
                  : active  ? "border-violet-500 bg-violet-500/15 animate-pulse"
                  : "border-white/15 bg-transparent"
                }`}>
                  {done ? "✓" : active ? <span className="w-1.5 h-1.5 rounded-full bg-violet-400 block" /> : null}
                  {pending && <span className="w-1 h-1 rounded-full bg-white/20 block" />}
                </div>

                {/* Label */}
                <span className={`text-sm font-medium flex-1 ${active ? "text-white" : "text-white/50"}`}>
                  {step.label}
                </span>

                {/* Badge axe (pour les 5 axes IA uniquement) */}
                {active && i >= 1 && i <= 5 && (
                  <span className="text-[10px] text-violet-400/80 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5 animate-in fade-in">
                    IA + web
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-white/25 text-xs text-center">
          L&apos;audit peut prendre 30 à 60 secondes selon le site
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-4">
      <div className="flex gap-3 items-center">
        <Input
          type="text"
          size="lg"
          placeholder="https://votre-site.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border-white/10 text-white dark:bg-white/5 placeholder:text-white/30"
          disabled={loading}
        />
        <Button
          type="submit"
          size="xl"
          disabled={loading || !url.trim()}
          className="bg-violet-600 hover:bg-violet-500 border-violet-600 text-white font-semibold shrink-0"
        >
          Lancer l&apos;audit
        </Button>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center animate-in fade-in">{error}</p>
      )}

      <p className="text-white/30 text-xs text-center">
        Analyse complète sur 5 axes — Design, Technique, SEO, Marketing & IA
      </p>
    </form>
  );
}
