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

/**
 * Cercle SVG animé.
 * La jauge part de vide (dashoffset = circumférence) et se remplit via CSS
 * quand la classe `.gauge-active` est ajoutée par le listener Reveal.js.
 */
function circle(cx: number, cy: number, r: number, score: number, stroke: string, sw: number) {
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return `
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="${sw}"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${sw}"
  stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${c.toFixed(2)}" stroke-linecap="round"
  class="gauge-arc" style="--gauge-circ:${c.toFixed(2)};--gauge-off:${off.toFixed(2)}"/>`;
}

function buildSlides(url: string, data: AuditData & { globalScore: number }, createdAt: string): string {
  const domain = new URL(url).hostname.replace(/^www\./, "");
  const date = new Date(createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const col = scoreColor(data.globalScore);

  /* ── SLIDE 1 — Couverture ── */
  const screenshotHtml = data.screenshotUrl ? `
    <div style="position:relative;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.1);box-shadow:0 24px 60px rgba(0,0,0,.6);max-width:520px;width:100%">
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 60%,rgba(10,10,15,.95));z-index:1;pointer-events:none"></div>
      <img src="${data.screenshotUrl}" alt="Screenshot de ${domain}" style="width:100%;display:block;object-fit:cover;max-height:280px" />
      <div style="position:absolute;bottom:.6rem;left:.8rem;z-index:2;display:flex;align-items:center;gap:.4rem;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);border-radius:6px;padding:.25rem .6rem">
        <span style="width:6px;height:6px;border-radius:50%;background:#34d399;display:inline-block"></span>
        <span style="font-size:.6rem;color:rgba(255,255,255,.7)">${url}</span>
      </div>
    </div>` : "";

  const s1 = `
<section data-transition="zoom" data-background-gradient="radial-gradient(ellipse 90% 70% at 50% 0%, rgba(139,92,246,.25) 0%, rgba(10,10,15,1) 70%)">
  <div style="display:grid;grid-template-columns:${data.screenshotUrl ? "1fr 1fr" : "1fr"};gap:3rem;align-items:center;height:100%;padding:2rem;max-width:1100px;margin:0 auto">

    <div style="display:flex;flex-direction:column;gap:2rem;align-items:flex-start">
      <div class="fragment fade-down" data-fragment-index="0" style="display:flex;align-items:center;gap:.75rem">
        <div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#2563eb);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.1rem;color:#fff;flex-shrink:0">V</div>
        <span style="font-size:1rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.7)">Very Agency</span>
      </div>

      <div class="fragment fade-up" data-fragment-index="1">
        <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(139,92,246,.8);margin:0 0 .6rem">Audit Digital</p>
        <h1 style="font-size:${data.screenshotUrl ? "3rem" : "3.8rem"};font-weight:900;letter-spacing:-.04em;margin:0;line-height:1;color:#fff">${domain}</h1>
      </div>

      <div class="fragment fade-up" data-fragment-index="2" style="display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:.4rem 1.2rem;font-size:.75rem;color:rgba(255,255,255,.4)">
        <span>📅</span>${date}
      </div>

      <div class="fragment fade-up" data-fragment-index="3" style="display:flex;gap:.6rem;flex-wrap:wrap">
        ${AXIS_CONFIG.map(a => `
          <div style="display:flex;align-items:center;gap:.4rem;padding:.3rem .7rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:999px">
            <span style="font-size:.85rem">${a.icon}</span>
            <span style="font-size:.62rem;color:rgba(255,255,255,.5)">${a.label}</span>
          </div>`).join("")}
      </div>
    </div>

    ${screenshotHtml ? `<div class="fragment fade-left" data-fragment-index="1">${screenshotHtml}</div>` : ""}
  </div>
</section>`;

  /* ── SLIDE 2 — Score global ── */
  const s2 = `
<section data-transition="fade" data-background="#0a0a0f">
  <div style="display:flex;flex-direction:column;align-items:center;gap:2.5rem;padding:1rem">
    <p class="fragment fade-down" style="font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(255,255,255,.35);margin:0">Score global</p>

    <div class="fragment zoom-in" style="position:relative;width:200px;height:200px">
      <svg width="200" height="200" viewBox="0 0 200 200" style="transform:rotate(-90deg)">
        ${circle(100,100,80,data.globalScore,col,16)}
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25rem">
        <span data-count-to="${data.globalScore}" style="font-size:3.5rem;font-weight:900;color:${col};line-height:1">0</span>
        <span style="font-size:.75rem;color:rgba(255,255,255,.35)">/100 — ${scoreLabel(data.globalScore)}</span>
      </div>
    </div>

    <div class="fragment fade-up" style="max-width:680px;text-align:center;padding:1.25rem 2rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;border-left:3px solid ${col}">
      <p style="font-size:1.05rem;color:rgba(255,255,255,.85);margin:0;line-height:1.6;font-style:italic">"${data.synthese_globale}"</p>
    </div>

    <div class="fragment fade-up" style="display:grid;grid-template-columns:repeat(5,1fr);gap:1rem;width:100%;max-width:720px">
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
              <span data-count-to="${sc}" style="font-size:1rem;font-weight:800;color:${co}">0</span>
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

    <div class="fragment fade-right" style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;padding-top:.5rem">
      <span style="font-size:3rem">${icon}</span>
      <h2 style="font-size:1.15rem;font-weight:800;color:#fff;text-align:center;margin:0;line-height:1.4">${label}</h2>
      <div style="position:relative;width:120px;height:120px">
        <svg width="120" height="120" viewBox="0 0 120 120" style="transform:rotate(-90deg)">
          ${circle(60,60,48,ax.score,co,10)}
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <span data-count-to="${ax.score}" style="font-size:2.2rem;font-weight:900;color:${co};line-height:1">0</span>
          <span style="font-size:.6rem;color:rgba(255,255,255,.35)">${scoreLabel(ax.score)}</span>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:1.5rem">
      <div>
        <h3 style="font-size:.65rem;text-transform:uppercase;letter-spacing:.14em;color:#34d399;margin:0 0 .75rem;display:flex;align-items:center;gap:.4rem"><span>✓</span> Points forts</h3>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.55rem">
          ${ax.points_forts.map((p, i) => `
          <li class="fragment fade-up" data-fragment-index="${i}" style="display:flex;align-items:flex-start;gap:.7rem;font-size:.88rem;color:rgba(255,255,255,.82);line-height:1.5">
            <span style="color:#34d399;flex-shrink:0;margin-top:.15rem">→</span>${p}
          </li>`).join("")}
        </ul>
      </div>
      <div>
        <h3 style="font-size:.65rem;text-transform:uppercase;letter-spacing:.14em;color:#f87171;margin:0 0 .75rem;display:flex;align-items:center;gap:.4rem"><span>✗</span> Points faibles</h3>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.55rem">
          ${ax.points_faibles.map((p, i) => `
          <li class="fragment fade-up" data-fragment-index="${i + 3}" style="display:flex;align-items:flex-start;gap:.7rem;font-size:.88rem;color:rgba(255,255,255,.82);line-height:1.5">
            <span style="color:#f87171;flex-shrink:0;margin-top:.15rem">→</span>${p}
          </li>`).join("")}
        </ul>
      </div>
      <div class="fragment fade-up" data-fragment-index="6" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-left:3px solid ${color};border-radius:10px;padding:1rem 1.25rem">
        <p style="font-size:.62rem;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);margin:0 0 .4rem">Recommandation clé</p>
        <p style="font-size:.92rem;color:#fff;margin:0;line-height:1.55">${ax.recommandation}</p>
      </div>
    </div>
  </div>
</section>`;
  }).join("\n");

  /* ── SLIDE 8 — Avant / Après ── */
  const beforeBrowser = data.screenshotUrl ? `
    <div style="border-radius:12px;overflow:hidden;border:2px solid rgba(248,113,113,.3);box-shadow:0 0 40px rgba(248,113,113,.12)">
      <div style="background:#1e1e1e;padding:.5rem .75rem;display:flex;align-items:center;gap:.5rem;border-bottom:1px solid rgba(255,255,255,.06)">
        <div style="display:flex;gap:.3rem">
          <span style="width:10px;height:10px;border-radius:50%;background:#f87171;display:inline-block"></span>
          <span style="width:10px;height:10px;border-radius:50%;background:#fbbf24;display:inline-block"></span>
          <span style="width:10px;height:10px;border-radius:50%;background:#4ade80;display:inline-block"></span>
        </div>
        <div style="flex:1;background:#111;border-radius:5px;padding:.25rem .6rem;display:flex;align-items:center;gap:.4rem">
          <span style="font-size:.65rem;color:#f87171;font-weight:700">⚠ Site web non sécurisé</span>
          <span style="font-size:.65rem;color:rgba(255,255,255,.3)">${domain}</span>
        </div>
      </div>
      <div style="position:relative">
        <img src="${data.screenshotUrl}" alt="Ancien site" style="width:100%;display:block;max-height:240px;object-fit:cover;object-position:top;filter:saturate(.6) brightness(.8)" />
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(248,113,113,.08),rgba(10,10,15,.7))"></div>
      </div>
    </div>` : `
    <div style="border-radius:12px;overflow:hidden;border:2px solid rgba(248,113,113,.3);box-shadow:0 0 40px rgba(248,113,113,.08)">
      <div style="background:#1e1e1e;padding:.5rem .75rem;display:flex;align-items:center;gap:.5rem;border-bottom:1px solid rgba(255,255,255,.06)">
        <div style="display:flex;gap:.3rem">
          <span style="width:10px;height:10px;border-radius:50%;background:#f87171;display:inline-block"></span>
          <span style="width:10px;height:10px;border-radius:50%;background:#fbbf24;display:inline-block"></span>
          <span style="width:10px;height:10px;border-radius:50%;background:#4ade80;display:inline-block"></span>
        </div>
        <div style="flex:1;background:#111;border-radius:5px;padding:.25rem .6rem;display:flex;align-items:center;gap:.4rem">
          <span style="font-size:.65rem;color:#f87171;font-weight:700">⚠ Site web non sécurisé</span>
          <span style="font-size:.65rem;color:rgba(255,255,255,.3)">${domain}</span>
        </div>
      </div>
      <div style="background:#f5f5f5;padding:1.5rem;min-height:200px;display:flex;flex-direction:column;gap:.75rem;filter:saturate(.4) brightness(.7)">
        <div style="height:40px;background:#ccc;border-radius:4px;width:100%"></div>
        <div style="display:flex;gap:.75rem">
          <div style="height:120px;background:#ddd;border-radius:4px;width:60%"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:.5rem">
            <div style="height:16px;background:#ccc;border-radius:3px"></div>
            <div style="height:16px;background:#ccc;border-radius:3px;width:80%"></div>
            <div style="height:16px;background:#ccc;border-radius:3px;width:60%"></div>
          </div>
        </div>
        <div style="height:20px;background:#bbb;border-radius:3px;width:40%"></div>
      </div>
    </div>`;

  const s8 = `
<section data-background="#0a0a0f">
  <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;max-width:1050px;margin:0 auto;padding:1rem">

    <div class="fragment fade-down" style="text-align:center">
      <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(167,139,250,.7);margin:0 0 .4rem">Vision Refonte</p>
      <h2 style="font-size:1.9rem;font-weight:900;color:#fff;margin:0;line-height:1.2">${data.vision.accroche}</h2>
    </div>

    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:1.5rem;align-items:center;width:100%">

      <div class="fragment fade-right" style="display:flex;flex-direction:column;gap:.75rem">
        <div style="display:flex;align-items:center;gap:.5rem">
          <span style="background:rgba(248,113,113,.15);border:1px solid rgba(248,113,113,.3);color:#f87171;font-size:.65rem;font-weight:800;padding:.2rem .7rem;border-radius:999px;text-transform:uppercase;letter-spacing:.1em">Avant</span>
          <span style="font-size:.7rem;color:rgba(255,255,255,.3)">Votre site aujourd'hui</span>
        </div>
        ${beforeBrowser}
        <div style="display:flex;flex-wrap:wrap;gap:.4rem">
          ${["❌ Design daté", "❌ Non sécurisé", "❌ Invisible sur Google", "❌ Zéro conversion"].map(t => `
          <span style="font-size:.6rem;color:#f87171;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.15);padding:.2rem .55rem;border-radius:5px">${t}</span>`).join("")}
        </div>
      </div>

      <div class="fragment zoom-in" style="display:flex;flex-direction:column;align-items:center;gap:.5rem">
        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#2563eb);display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 0 24px rgba(124,58,237,.4)">→</div>
      </div>

      <div class="fragment fade-left" style="display:flex;flex-direction:column;gap:.75rem">
        <div style="display:flex;align-items:center;gap:.5rem">
          <span style="background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);color:#34d399;font-size:.65rem;font-weight:800;padding:.2rem .7rem;border-radius:999px;text-transform:uppercase;letter-spacing:.1em">Après</span>
          <span style="font-size:.7rem;color:rgba(255,255,255,.3)">Votre site refait par Very Agency</span>
        </div>
        <div style="border-radius:12px;overflow:hidden;border:2px solid rgba(52,211,153,.25);box-shadow:0 0 40px rgba(52,211,153,.1)">
          <div style="background:#1a1a2e;padding:.5rem .75rem;display:flex;align-items:center;gap:.5rem;border-bottom:1px solid rgba(255,255,255,.06)">
            <div style="display:flex;gap:.3rem">
              <span style="width:10px;height:10px;border-radius:50%;background:#f87171;display:inline-block"></span>
              <span style="width:10px;height:10px;border-radius:50%;background:#fbbf24;display:inline-block"></span>
              <span style="width:10px;height:10px;border-radius:50%;background:#4ade80;display:inline-block"></span>
            </div>
            <div style="flex:1;background:rgba(255,255,255,.06);border-radius:5px;padding:.25rem .6rem;display:flex;align-items:center;gap:.4rem">
              <span style="font-size:.65rem;color:#34d399;font-weight:700">🔒 Sécurisé</span>
              <span style="font-size:.65rem;color:rgba(255,255,255,.4)">${domain}</span>
            </div>
          </div>
          ${data.mockupUrl ? `
          <div style="position:relative">
            <img src="${data.mockupUrl}" alt="Maquette nouveau site" style="width:100%;display:block;max-height:240px;object-fit:cover;object-position:top" />
            <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 60%,rgba(10,10,15,.7))"></div>
            <div style="position:absolute;bottom:.5rem;right:.6rem;background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);border-radius:6px;padding:.2rem .6rem;font-size:.6rem;color:#34d399;font-weight:700">✨ Généré par IA</div>
          </div>` : `
          <div style="background:#fafafa;font-family:sans-serif;overflow:hidden">
            <div style="background:#fff;padding:.5rem 1rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e5e7eb">
              <span style="font-weight:800;font-size:.8rem;color:#111;text-transform:uppercase;letter-spacing:.05em">${domain}</span>
              <div style="display:flex;gap:.8rem">
                ${["Accueil","Services","Contact"].map(t => `<span style="font-size:.6rem;color:#666">${t}</span>`).join("")}
              </div>
              <div style="background:#111;color:#fff;padding:.25rem .65rem;border-radius:5px;font-size:.6rem;font-weight:700">Réserver</div>
            </div>
            <div style="padding:1.25rem 1rem;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)">
              <p style="font-size:.55rem;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.5);margin:0 0 .4rem">Nouveau ${domain}</p>
              <h3 style="font-size:.85rem;font-weight:800;color:#fff;margin:0 0 .6rem;line-height:1.35">${data.vision.accroche.length > 70 ? data.vision.accroche.slice(0, 70) + "…" : data.vision.accroche}</h3>
              <div style="display:inline-flex;align-items:center;gap:.4rem;background:linear-gradient(90deg,#7c3aed,#2563eb);padding:.3rem .8rem;border-radius:6px;font-size:.6rem;font-weight:700;color:#fff">Découvrir →</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem;padding:.75rem .8rem;background:#f3f4f6">
              ${data.vision.fonctionnalites_proposees.slice(0, 3).map((f, i) => `
              <div style="background:#fff;border-radius:7px;padding:.6rem .7rem;border:1px solid #e5e7eb">
                <div style="width:18px;height:18px;border-radius:5px;background:${["#7c3aed","#2563eb","#0ea5e9"][i]};margin-bottom:.4rem"></div>
                <p style="font-size:.58rem;color:#111;margin:0;font-weight:600;line-height:1.4">${f.length > 36 ? f.slice(0, 36) + "…" : f}</p>
              </div>`).join("")}
            </div>
          </div>`}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:.4rem">
          ${["✅ Design moderne", "✅ HTTPS sécurisé", "✅ SEO optimisé", "✅ +X% de conversions"].map(t => `
          <span style="font-size:.6rem;color:#34d399;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.15);padding:.2rem .55rem;border-radius:5px">${t}</span>`).join("")}
        </div>
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
    <div class="fragment fade-down" style="text-align:center">
      <span style="font-size:3.5rem;display:block;margin-bottom:.75rem">🤖</span>
      <h2 style="font-size:2rem;font-weight:900;color:#fff;margin:0">IA & Innovation</h2>
      <p style="color:rgba(255,255,255,.4);font-size:.9rem;margin:.5rem 0 0">3 idées concrètes d'innovation pour ${domain}</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:1.1rem;width:100%">
      ${data.vision.idees_ia.map((idea, i) => `
      <div class="fragment fade-up" data-fragment-index="${i}" style="display:flex;align-items:center;gap:1.5rem;padding:1.3rem 1.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(${iaColors[i].bg},.2);border-radius:14px;border-left:3px solid rgba(${iaColors[i].bg},.7)">
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
<section data-transition="zoom" data-background-gradient="radial-gradient(ellipse 80% 60% at 50% 100%, rgba(37,99,235,.2) 0%, rgba(10,10,15,1) 70%)">
  <div style="display:flex;flex-direction:column;align-items:center;gap:2rem;max-width:860px;margin:0 auto">
    <div class="fragment fade-down" style="text-align:center">
      <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(96,165,250,.8);margin:0 0 .5rem">Plan d'action</p>
      <h2 style="font-size:2.2rem;font-weight:900;color:#fff;margin:0">Next Steps</h2>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;width:100%">
      ${data.vision.next_steps.map((step, i) => `
      <div class="fragment fade-up" data-fragment-index="${i}" style="display:flex;align-items:flex-start;gap:1rem;padding:1.2rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px">
        <div style="width:34px;height:34px;border-radius:9px;background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.25);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:900;color:#60a5fa;flex-shrink:0">${i + 1}</div>
        <p style="font-size:.88rem;color:rgba(255,255,255,.85);margin:0;line-height:1.5;padding-top:.2rem">${step}</p>
      </div>`).join("")}
    </div>

    <div class="fragment fade-up" style="width:100%;text-align:center;padding:1.75rem 2rem;background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(37,99,235,.2));border:1px solid rgba(139,92,246,.3);border-radius:18px">
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

      /** Anime les jauges SVG et les compteurs du slide courant */
      const triggerAnimations = (slide: Element) => {
        // Jauges — restart de l'animation CSS
        slide.querySelectorAll<SVGCircleElement>(".gauge-arc").forEach((el) => {
          el.classList.remove("gauge-active");
          el.getBoundingClientRect(); // force reflow pour relancer l'animation
          el.classList.add("gauge-active");
        });

        // Compteurs — count-up JS
        slide.querySelectorAll<HTMLElement>("[data-count-to]").forEach((el) => {
          const target = parseInt(el.dataset.countTo ?? "0", 10);
          const duration = 1400;
          const startTime = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = Math.round(eased * target).toString();
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      };

      // Slide initial
      deck.on("ready", () => {
        const slide = deck.getCurrentSlide();
        if (slide) triggerAnimations(slide);
      });

      // Changement de slide — deck.on est typé comme HTMLElement.addEventListener
      deck.on("slidechanged", ((e: Event) => {
        const { currentSlide } = e as Event & { currentSlide: Element };
        if (currentSlide) triggerAnimations(currentSlide);
      }) as EventListener);
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
        /* ─ Base ─ */
        .reveal { font-family: var(--font-sans, 'Inter', sans-serif) !important; }
        .reveal .controls { color: rgba(139,92,246,.8) !important; }
        .reveal .progress span { background: rgba(139,92,246,.7) !important; }
        .reveal section { font-size: 16px; }

        /* ─ Jauge SVG animée ─ */
        .gauge-arc {
          stroke-dashoffset: var(--gauge-circ);
        }
        .gauge-arc.gauge-active {
          animation: gaugeIn 1.4s cubic-bezier(0.34, 1.15, 0.64, 1) forwards;
        }
        @keyframes gaugeIn {
          from { stroke-dashoffset: var(--gauge-circ); }
          to   { stroke-dashoffset: var(--gauge-off);  }
        }

        /* ─ Fragment overrides — transitions douces ─ */
        .reveal .slides section .fragment {
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .reveal .slides section .fragment.fade-up {
          transform: translateY(18px);
          opacity: 0;
        }
        .reveal .slides section .fragment.fade-up.visible {
          transform: translateY(0);
          opacity: 1;
        }
        .reveal .slides section .fragment.fade-down {
          transform: translateY(-18px);
          opacity: 0;
        }
        .reveal .slides section .fragment.fade-down.visible {
          transform: translateY(0);
          opacity: 1;
        }
        .reveal .slides section .fragment.fade-right {
          transform: translateX(-24px);
          opacity: 0;
        }
        .reveal .slides section .fragment.fade-right.visible {
          transform: translateX(0);
          opacity: 1;
        }
        .reveal .slides section .fragment.fade-left {
          transform: translateX(24px);
          opacity: 0;
        }
        .reveal .slides section .fragment.fade-left.visible {
          transform: translateX(0);
          opacity: 1;
        }
        .reveal .slides section .fragment.zoom-in {
          transform: scale(0.7);
          opacity: 0;
        }
        .reveal .slides section .fragment.zoom-in.visible {
          transform: scale(1);
          opacity: 1;
        }
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
