import { AuditForm } from "@/components/audit-form";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-[#0a0a0f] via-[#0d0b1a] to-[#0a0a0f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.15),transparent)]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-2xl text-center">
        {/* Titre */}
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-none">
            <span className="text-white">Audit digital</span>
            <br />
            <span className="bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              en 60 secondes
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Entrez l&apos;URL de votre site et obtenez une analyse complète sur
            5 axes — présentée en slides prêtes à partager.
          </p>
        </div>
        <AuditForm />
        <div className="grid grid-cols-5 gap-3 w-full pt-4 border-t border-white/5">
          {[
            { icon: "🎨", label: "Design & UX" },
            { icon: "⚡", label: "Technique" },
            { icon: "🔍", label: "SEO & Géo" },
            { icon: "📣", label: "Marketing" },
            { icon: "🤖", label: "IA & Innovation" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex justify-center items-center gap-1.5 text-center bg-black/30 border-1 rounded-xl"
            >
              <span className="text-white/30 text-sm font-medium leading-tight mx-4">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
