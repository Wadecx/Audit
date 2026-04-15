"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AUDIT_STEPS = [
  "Analyse du design & UX…",
  "Audit technique en cours…",
  "SEO & géolocalisation…",
  "Marketing digital & réseaux…",
  "Innovation & IA…",
  "Génération de la présentation…",
];

export function AuditForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setCurrentStep(0);

    // Simule la progression des étapes pendant l'appel API
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < AUDIT_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 6000);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'audit");
      }

      const { id } = await res.json();
      router.push(`/audit/${id}`);
    } catch (err) {
      clearInterval(stepInterval);
      setLoading(false);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-8 w-full max-w-lg">
        {/* Spinner */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
        </div>

        {/* Étapes */}
        <div className="w-full space-y-3">
          {AUDIT_STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-3 transition-all duration-500 ${
                i < currentStep
                  ? "opacity-40"
                  : i === currentStep
                  ? "opacity-100 scale-[1.02]"
                  : "opacity-20"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  i < currentStep
                    ? "bg-violet-400"
                    : i === currentStep
                    ? "bg-violet-500 animate-pulse"
                    : "bg-white/20"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  i === currentStep ? "text-white" : "text-white/50"
                }`}
              >
                {step}
              </span>
              {i < currentStep && (
                <span className="ml-auto text-violet-400 text-xs">✓</span>
              )}
            </div>
          ))}
        </div>

        <p className="text-white/40 text-xs text-center">
          L&apos;audit peut prendre 30 à 60 secondes
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
