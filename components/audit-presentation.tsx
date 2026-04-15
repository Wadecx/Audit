"use client";

import { useEffect, useRef } from "react";
import type { AuditData } from "@/lib/anthropic";

interface Props {
  url: string;
  data: AuditData & { globalScore: number };
  createdAt: string;
}

const AXIS_CONFIG = [
  { key: "design",     icon: "🎨", label: "Design & UX",           color: "#a78bfa", rgb: "167,139,250" },
  { key: "technique",  icon: "⚡", label: "Performance Technique",  color: "#60a5fa", rgb: "96,165,250"  },
  { key: "seo",        icon: "🔍", label: "SEO & Géolocalisation",  color: "#34d399", rgb: "52,211,153"  },
  { key: "marketing",  icon: "📣", label: "Marketing Digital",      color: "#f59e0b", rgb: "245,158,11"  },
  { key: "innovation", icon: "🤖", label: "Innovation & IA",        color: "#f472b6", rgb: "244,114,182" },
] as const;

function scoreColor(s: number) {
  if (s >= 70) return "#34d399";
  if (s >= 40) return "#f59e0b";
  return "#f87171";
}
function scoreLabel(s: number) {
  if (s >= 70) return "Bon";
  if (s >= 40) return "Moyen";
  return "Critique";
}
function circle(cx: number, cy: number, r: number, score: number, stroke: string, sw: number) {
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="${sw}"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${sw}"
  stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" stroke-linecap="round"/>`;
}

function buildSlides(url: string, data: AuditData & { globalScore: number }, createdAt: string): string {
  const domain = new URL(url).hostname.replace(/^www\./, "");
  const date = new Date(createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const col = scoreColor(data.globalScore);

  /* ── SLIDE 1 — Couverture ── */
  const s1 = `
<section data-background-gradient="radial-gradient(ellipse 90% 70% at 50% 0%, rgba(139,92,246,.25) 0%, rgba(10,10,15,1) 70%)">
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:2.5rem;padding:2rem">

    <!-- Logo agence -->
    <div style="display:flex;align-items:center;gap:.75rem">
      <div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#2563eb);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.1rem;color:#fff;flex-shrink:0">V</div>
      <span style="font-size:1rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.7)">Very Agency</span>
    </div>

    <!-- Séparateur -->
    <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,rgba(139,92,246,.6),transparent)"></div>

    <!-- Titre -->
    <div style="text-align:center">
      <p style="font-size:.75rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(139,92,246,.8);margin:0 0 .75rem">Audit Digital</p>
      <h1 style="font-size:3.8rem;font-weight:900;letter-spacing:-.04em;margin:0;line-height:1;color:#fff">${domain}</h1>
      <p style="margin:.75rem 0 0;color:rgba(255,255,255,.35);font-size:.95rem">${url}</p>
    </div>

    <!-- Date -->
    <div style="display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:.4rem 1.2rem;font-size:.75rem;color:rgba(255,255,255,.4)">
      <span>📅</span>${date}
    </div>

    <!-- 5 axes -->
    <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center">
      ${AXIS_CONFIG.map(a => `
        <div style="display:flex;align-items:center;gap:.5rem;padding:.4rem .9rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:999px">
          <span>${a.icon}</span>
          <span style="font-size:.7rem;color:rgba(255,255,255,.5)">${a.label}</span>
        </div>`).join("")}
    </div>
  </div>
</section>`;

  /* ── SLIDE 2 — Score global ── */
  const s2 = `
<section data-background="#0a0a0f">
  <div style="display:flex;flex-direction:column;align-items:center;gap:2.5rem;padding:1rem">
    <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(255,255,255,.35);margin:0">Score global</p>

    <!-- Grande jauge animée -->
    <div style="position:relative;width:200px;height:200px">
      <svg width="200" height="200" viewBox="0 0 200 200" style="transform:rotate(-90deg)">
        ${circle(100,100,80,data.globalScore,col,16)}
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25rem">
        <span style="font-size:3.5rem;font-weight:900;color:${col};line-height:1">${data.globalScore}</span>
        <span style="font-size:.75rem;color:rgba(255,255,255,.35)">/100 — ${scoreLabel(data.globalScore)}</span>
      </div>
    </div>

    <!-- Synthèse en une phrase -->
    <div style="max-width:680px;text-align:center;padding:1.25rem 2rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;border-left:3px solid ${col}">
      <p style="font-size:1.05rem;color:rgba(255,255,255,.85);margin:0;line-height:1.6;font-style:italic">"${data.synthese_globale}"</p>
    </div>

    <!-- Mini-jauges par axe -->
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:1rem;width:100%;max-width:720px">
      ${AXIS_CONFIG.map(a => {
        const ax = data[a.key as keyof AuditData] as { score: number };
        const sc = ax.score;
        const co = scoreColor(sc);
        const size = 64;
        const r = 24;
        return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:.6rem;padding:1rem .75rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px">
          <div style="position:relative;width:${size}px;height:${size}px">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
              ${circle(size/2,size/2,r,sc,co,6)}
            </svg>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
              <span style="font-size:1rem;font-weight:800;color:${co}">${sc}</span>
            </div>
          </div>
          <span style="font-size:.6rem;color:rgba(255,255,255,.4);text-align:center;line-height:1.4">${a.label}</span>
        </div>`;
      }).join("")}
    </div>
  </div>
</section>`;

  /* ── SLIDES 3–7 — Un slide par axe ── */
  const axisSlides = AXIS_CONFIG.map(({ key, icon, label, color }) => {
    const ax = data[key as keyof AuditData] as {
      score: number; points_forts: string[]; points_faibles: string[]; recommandation: string;
    };
    const co = scoreColor(ax.score);
    return `
<section data-background="#0a0a0f">
  <div style="display:grid;grid-template-columns:220px 1fr;gap:3rem;align-items:start;max-width:980px;margin:0 auto;width:100%">

    <!-- Colonne gauche : axe + jauge -->
    <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;padding-top:.5rem">
      <span style="font-size:3rem">${icon}</span>
      <h2 style="font-size:1.15rem;font-weight:800;color:#fff;text-align:center;margin:0;line-height:1.4">${label}</h2>
      <div style="position:relative;width:120px;height:120px">
        <svg width="120" height="120" viewBox="0 0 120 120" style="transform:rotate(-90deg)">
          ${circle(60,60,48,ax.score,co,10)}
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <span style="font-size:2.2rem;font-weight:900;color:${co};line-height:1">${ax.score}</span>
          <span style="font-size:.6rem;color:rgba(255,255,255,.35)">${scoreLabel(ax.score)}</span>
        </div>
      </div>
    </div>

    <!-- Colonne droite : points + recommandation -->
    <div style="display:flex;flex-direction:column;gap:1.5rem">
      <div>
        <h3 style="font-size:.65rem;text-transform:uppercase;letter-spacing:.14em;color:#34d399;margin:0 0 .75rem;display:flex;align-items:center;gap:.4rem"><span>✓</span> Points forts</h3>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.55rem">
          ${ax.points_forts.map(p => `
          <li style="display:flex;align-items:flex-start;gap:.7rem;font-size:.88rem;color:rgba(255,255,255,.82);line-height:1.5">
            <span style="color:#34d399;flex-shrink:0;margin-top:.15rem">→</span>${p}
          </li>`).join("")}
        </ul>
      </div>
      <div>
        <h3 style="font-size:.65rem;text-transform:uppercase;letter-spacing:.14em;color:#f87171;margin:0 0 .75rem;display:flex;align-items:center;gap:.4rem"><span>✗</span> Points faibles</h3>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.55rem">
          ${ax.points_faibles.map(p => `
          <li style="display:flex;align-items:flex-start;gap:.7rem;font-size:.88rem;color:rgba(255,255,255,.82);line-height:1.5">
            <span style="color:#f87171;flex-shrink:0;margin-top:.15rem">→</span>${p}
          </li>`).join("")}
        </ul>
      </div>
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-left:3px solid ${color};border-radius:10px;padding:1rem 1.25rem">
        <p style="font-size:.62rem;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);margin:0 0 .4rem">Recommandation clé</p>
        <p style="font-size:.92rem;color:#fff;margin:0;line-height:1.55">${ax.recommandation}</p>
      </div>
    </div>
  </div>
</section>`;
  }).join("\n");

  /* ── SLIDE 8 — Vision refonte — effet "wow" ── */
  const s8 = `
<section data-background-gradient="radial-gradient(ellipse 100% 80% at 50% 100%, rgba(124,58,237,.3) 0%, rgba(37,99,235,.15) 40%, rgba(10,10,15,1) 75%)">
  <div style="display:flex;flex-direction:column;align-items:center;gap:2rem;max-width:1000px;margin:0 auto;padding:1rem">

    <!-- Accroche wow -->
    <div style="text-align:center">
      <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(167,139,250,.8);margin:0 0 .6rem">✦ Vision Refonte</p>
      <h2 style="font-size:2.4rem;font-weight:900;letter-spacing:-.03em;margin:0;line-height:1.15;background:linear-gradient(135deg,#fff 30%,rgba(167,139,250,.9));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${data.vision.accroche}</h2>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;width:100%">

      <!-- Nouvelles fonctionnalités -->
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(167,139,250,.2);border-radius:16px;padding:1.5rem">
        <h3 style="font-size:.65rem;text-transform:uppercase;letter-spacing:.14em;color:#a78bfa;margin:0 0 1.1rem;display:flex;align-items:center;gap:.5rem">
          <span style="width:18px;height:18px;border-radius:4px;background:rgba(167,139,250,.2);display:inline-flex;align-items:center;justify-content:center;font-size:.7rem">✦</span>
          Nouvelles fonctionnalités
        </h3>
        <ol style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.65rem">
          ${data.vision.fonctionnalites_proposees.map((f, i) => `
          <li style="display:flex;align-items:flex-start;gap:.8rem;font-size:.85rem;color:rgba(255,255,255,.8);line-height:1.45">
            <span style="width:22px;height:22px;border-radius:6px;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.25);color:#a78bfa;font-size:.65rem;font-weight:800;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:.05rem">${i + 1}</span>
            ${f}
          </li>`).join("")}
        </ol>
      </div>

      <!-- Idées IA -->
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(244,114,182,.2);border-radius:16px;padding:1.5rem">
        <h3 style="font-size:.65rem;text-transform:uppercase;letter-spacing:.14em;color:#f472b6;margin:0 0 1.1rem;display:flex;align-items:center;gap:.5rem">
          <span style="width:18px;height:18px;border-radius:4px;background:rgba(244,114,182,.2);display:inline-flex;align-items:center;justify-content:center;font-size:.7rem">🤖</span>
          Intelligence Artificielle
        </h3>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.75rem">
          ${data.vision.idees_ia.map(idea => `
          <li style="display:flex;align-items:flex-start;gap:.75rem;font-size:.88rem;color:rgba(255,255,255,.8);line-height:1.5">
            <span style="color:#f472b6;flex-shrink:0;margin-top:.1rem;font-size:1rem">✦</span>${idea}
          </li>`).join("")}
        </ul>
      </div>
    </div>
  </div>
</section>`;

  /* ── SLIDE 9 — IA & Innovation ── */
  const iaColors = [
    { bg: "167,139,250", icon: "💬", label: "Chatbot IA" },
    { bg: "96,165,250",  icon: "✨", label: "Personnalisation" },
    { bg: "244,114,182", icon: "🎯", label: "Recommandations" },
  ];
  const s9 = `
<section data-background="#0a0a0f">
  <div style="display:flex;flex-direction:column;align-items:center;gap:2.5rem;max-width:800px;margin:0 auto">
    <div style="text-align:center">
      <span style="font-size:3.5rem;display:block;margin-bottom:.75rem">🤖</span>
      <h2 style="font-size:2rem;font-weight:900;color:#fff;margin:0">IA & Innovation</h2>
      <p style="color:rgba(255,255,255,.4);font-size:.9rem;margin:.5rem 0 0">3 idées concrètes d'innovation pour ${domain}</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:1.1rem;width:100%">
      ${data.vision.idees_ia.map((idea, i) => `
      <div style="display:flex;align-items:center;gap:1.5rem;padding:1.3rem 1.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(${iaColors[i].bg},.2);border-radius:14px;border-left:3px solid rgba(${iaColors[i].bg},.7)">
        <div style="width:52px;height:52px;border-radius:14px;background:rgba(${iaColors[i].bg},.12);border:1px solid rgba(${iaColors[i].bg},.2);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0">${iaColors[i].icon}</div>
        <div style="flex:1">
          <p style="font-size:.62rem;text-transform:uppercase;letter-spacing:.12em;color:rgba(${iaColors[i].bg},.8);margin:0 0 .3rem">${iaColors[i].label}</p>
          <p style="font-size:.95rem;color:rgba(255,255,255,.9);margin:0;line-height:1.5">${idea}</p>
        </div>
        <span style="font-size:.65rem;font-weight:700;color:rgba(${iaColors[i].bg},.9);background:rgba(${iaColors[i].bg},.1);border:1px solid rgba(${iaColors[i].bg},.2);padding:.25rem .8rem;border-radius:999px;white-space:nowrap;flex-shrink:0">Idée ${i + 1}</span>
      </div>`).join("")}
    </div>
  </div>
</section>`;

  /* ── SLIDE 10 — Next steps & CTA ── */
  const s10 = `
<section data-background-gradient="radial-gradient(ellipse 80% 60% at 50% 100%, rgba(37,99,235,.2) 0%, rgba(10,10,15,1) 70%)">
  <div style="display:flex;flex-direction:column;align-items:center;gap:2rem;max-width:860px;margin:0 auto">
    <div style="text-align:center">
      <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(96,165,250,.8);margin:0 0 .5rem">Plan d'action</p>
      <h2 style="font-size:2.2rem;font-weight:900;color:#fff;margin:0">Next Steps</h2>
    </div>

    <!-- Étapes priorisées -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;width:100%">
      ${data.vision.next_steps.map((step, i) => `
      <div style="display:flex;align-items:flex-start;gap:1rem;padding:1.2rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px">
        <div style="width:34px;height:34px;border-radius:9px;background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.25);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:900;color:#60a5fa;flex-shrink:0">${i + 1}</div>
        <p style="font-size:.88rem;color:rgba(255,255,255,.85);margin:0;line-height:1.5;padding-top:.2rem">${step}</p>
      </div>`).join("")}
    </div>

    <!-- CTA -->
    <div style="width:100%;text-align:center;padding:1.75rem 2rem;background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(37,99,235,.2));border:1px solid rgba(139,92,246,.3);border-radius:18px">
      <p style="font-size:1.25rem;font-weight:800;color:#fff;margin:0 0 .4rem">Prêt à transformer ${domain} ?</p>
      <p style="font-size:.9rem;color:rgba(255,255,255,.45);margin:0 0 1.25rem">Contactez Very Agency pour démarrer votre projet dès aujourd'hui.</p>
      <div style="display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,#7c3aed,#2563eb);padding:.65rem 2rem;border-radius:999px;font-size:.9rem;font-weight:700;color:#fff;letter-spacing:.02em">
        <span>✉</span> Démarrer le projet
      </div>
    </div>
  </div>
</section>`;

  return [s1, s2, axisSlides, s8, s9, s10].join("\n");
}

export function AuditPresentation({ url, data, createdAt }: Props) {
  const deckRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<unknown>(null);

  useEffect(() => {
    const init = async () => {
      const Reveal = (await import("reveal.js")).default;
      if (!deckRef.current || revealRef.current) return;

      const deck = new Reveal(deckRef.current, {
        hash: true,
        controls: true,
        controlsTutorial: true,
        progress: true,
        center: true,
        transition: "slide",
        transitionSpeed: "default",
        backgroundTransition: "fade",
        width: 1200,
        height: 700,
        margin: 0.04,
        minScale: 0.2,
        maxScale: 2.0,
      });

      await deck.initialize();
      revealRef.current = deck;
    };
    init();

    return () => {
      if (revealRef.current) {
        (revealRef.current as { destroy?: () => void }).destroy?.();
        revealRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/reveal.min.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/theme/black.min.css" />

      <style>{`
        .reveal { font-family: var(--font-sans, 'Inter', sans-serif) !important; }
        .reveal .controls { color: rgba(139,92,246,.8) !important; }
        .reveal .progress span { background: rgba(139,92,246,.7) !important; }
        .reveal section { font-size: 16px; }
      `}</style>

      <div ref={deckRef} className="reveal" style={{ width: "100vw", height: "100vh", background: "#0a0a0f" }}>
        <div className="slides" dangerouslySetInnerHTML={{ __html: buildSlides(url, data, createdAt) }} />
      </div>

      {/* Bouton plein écran */}
      <button
        onClick={() => document.documentElement.requestFullscreen?.()}
        style={{
          position: "fixed", bottom: "1.5rem", right: "5rem", zIndex: 9999,
          background: "rgba(139,92,246,.15)", border: "1px solid rgba(139,92,246,.3)",
          color: "rgba(255,255,255,.7)", padding: ".4rem .9rem", borderRadius: "8px",
          fontSize: ".75rem", cursor: "pointer", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", gap: ".4rem",
        }}
        title="Plein écran"
      >
        ⛶ Plein écran
      </button>

      {/* Bouton retour */}
      <a
        href="/"
        style={{
          position: "fixed", top: "1rem", left: "1rem", zIndex: 9999,
          background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
          color: "rgba(255,255,255,.5)", padding: ".4rem 1rem", borderRadius: "999px",
          fontSize: ".75rem", textDecoration: "none", backdropFilter: "blur(8px)",
        }}
      >
        ← Nouvel audit
      </a>
    </>
  );
}
