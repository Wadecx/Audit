# PRD — Very Audit : Générateur d'Audit Digital IA

> **Document de référence produit — Version 1.0**
> Rédigé par : Mary (Business Analyst) — Very Agency
> Langue : Français
> Statut : **MVP livré — en production**

---

## Table des matières

1. [Vue d'ensemble du produit](#1-vue-densemble-du-produit)
2. [Contexte et opportunité business](#2-contexte-et-opportunité-business)
3. [Objectifs produit & métriques de succès](#3-objectifs-produit--métriques-de-succès)
4. [Personas et parties prenantes](#4-personas-et-parties-prenantes)
5. [Périmètre MVP](#5-périmètre-mvp)
6. [Exigences fonctionnelles détaillées](#6-exigences-fonctionnelles-détaillées)
7. [Exigences non fonctionnelles](#7-exigences-non-fonctionnelles)
8. [Architecture & décisions techniques](#8-architecture--décisions-techniques)
9. [Modèle de données](#9-modèle-de-données)
10. [Expérience utilisateur & flux](#10-expérience-utilisateur--flux)
11. [Intégrations tierces](#11-intégrations-tierces)
12. [Contraintes & hypothèses](#12-contraintes--hypothèses)
13. [Hors périmètre MVP](#13-hors-périmètre-mvp)
14. [Épics & User Stories](#14-épics--user-stories)
15. [Risques & mitigations](#15-risques--mitigations)
16. [Plan de mise en marché](#16-plan-de-mise-en-marché)
17. [Backlog post-MVP](#17-backlog-post-mvp)

---

## 1. Vue d'ensemble du produit

**Very Audit** est un générateur d'audit digital automatisé conçu pour les consultants de Very Berry. Il transforme n'importe quelle URL en une présentation commerciale percutante en 60 secondes — sans effort manuel.

### Proposition de valeur essentielle

> "Entrez une URL. Obtenez une présentation de diagnostic digital prête à partager avec un dirigeant."

L'outil utilise l'IA (Claude via l'API Anthropic) et la recherche web pour analyser un site sur **5 axes stratégiques**, puis génère automatiquement une présentation **Reveal.js** de 10 slides avec jauges animées, captures d'écran réelles et maquette IA de refonte — le tout stocké en base de données pour une réutilisation ultérieure.

### Résumé du produit livré (MVP)

| Composant | Statut |
|-----------|--------|
| Page d'accueil avec formulaire URL | ✅ Livré |
| API d'audit IA (Claude Haiku 4.5 + web_search) | ✅ Livré |
| Vérification d'accessibilité du site cible | ✅ Livré |
| Capture d'écran via Google PageSpeed | ✅ Livré |
| Génération de maquette via Google Stitch IA | ✅ Livré |
| Présentation Reveal.js 10 slides animée | ✅ Livré |
| Persistance en base PostgreSQL (schéma normalisé) | ✅ Livré |
| Gestion d'erreurs typées (DNS, SSL, timeout…) | ✅ Livré |
| Bouton plein écran & navigation clavier | ✅ Livré |
| Authentification SSO (Very Berry) | ⏳ Post-MVP |

---

## 2. Contexte et opportunité business

### 2.1 Problème identifié

Very Agency réalise des audits digitaux pour convaincre des dirigeants d'entreprise de refondre leur stratégie digitale. Ces audits sont aujourd'hui produits **manuellement** : plusieurs heures d'analyse, de mise en forme, de création de slides PowerPoint. Ce processus crée trois frictions majeures :

1. **Temps** : 4 à 8 heures par audit, limitant le volume de prospects qualifiables
2. **Cohérence** : Qualité variable selon le consultant, sans standard visuel
3. **Impact** : Slides statiques peu mémorables face à un dirigeant non-technique

### 2.2 Opportunité

Avec l'IA générative, il est possible d'automatiser 90 % du travail d'audit et de production visuelle tout en livrant un rendu **supérieur** au manuel (animations, données temps réel, mockup IA). L'outil devient un **avantage concurrentiel commercial** pour l'agence : plus de prospects audités, meilleur taux de conversion en réunion.

### 2.3 Marché cible initial

- **Agence** : Very Agency (usage interne, outil propriétaire)
- **Prospect type** : PME / ETI françaises avec site web existant, dirigeant entre 40-60 ans, non-technique
- **Site de démo** : www.la-marniere.com/fr/ (domaine hôtellerie/restauration)

### 2.4 Positionnement

Very Audit n'est pas un outil SaaS grand public (type Semrush, Screaming Frog) — c'est un **outil de closing commercial** interne à l'agence. Son design premium et sa présentation impactante sont le produit, pas les données brutes.

---

## 3. Objectifs produit & métriques de succès

### Objectifs stratégiques

| # | Objectif | Horizon |
|---|----------|---------|
| O1 | Réduire le temps de production d'un audit de 6h à < 2 min | MVP |
| O2 | Standardiser la qualité visuelle de tous les audits | MVP |
| O3 | Augmenter le taux de conversion prospect → client de 15 % | 6 mois |
| O4 | Permettre à un consultant junior de produire un audit de niveau senior | MVP |

### KPIs de succès MVP

| KPI | Cible | Mesure |
|-----|-------|--------|
| Durée de génération d'audit | < 90 secondes | `durationMs` en base |
| Score de satisfaction visuelle consultant | ≥ 4/5 | Feedback interne |
| Taux de succès de génération (non-erreur) | ≥ 85 % | `status = COMPLETED` / total |
| Présentation utilisée en RDV client | ≥ 3 RDV/mois | Reporting manuel |

---

## 4. Personas et parties prenantes

### Persona 1 — Le Consultant Very Agency (utilisateur principal)

| Attribut | Détail |
|----------|--------|
| **Rôle** | Consultant digital / Business Developer |
| **Profil** | 25-35 ans, à l'aise avec les outils numériques |
| **Objectif** | Préparer un audit percutant avant un RDV prospect en quelques minutes |
| **Frustration** | Passer des heures sur PowerPoint pour un prospect qui ne signera peut-être pas |
| **Usage clé** | Lance un audit la veille du RDV, partage le lien ou projette en réunion |

### Persona 2 — Le Dirigeant Prospect (spectateur de la présentation)

| Attribut | Détail |
|----------|--------|
| **Rôle** | PDG / DG de PME/ETI |
| **Profil** | 45-60 ans, non-technique, orienté résultats |
| **Objectif** | Comprendre pourquoi son site est sous-performant et quoi faire |
| **Attente** | Être impressionné, comprendre rapidement, sentir qu'on le connaît |
| **Point de contact** | Voit la présentation en RDV ou reçoit un lien par email |

### Parties prenantes

| Partie prenante | Intérêt | Niveau d'implication |
|-----------------|---------|---------------------|
| Direction Very Agency | ROI, différenciation commerciale | Sponsor |
| Consultants (utilisateurs) | Efficacité, qualité | Utilisateurs finaux |
| Équipe technique | Maintenabilité, scalabilité | Contributeurs |
| Prospects clients | Aucun (pas d'accès direct au MVP) | Bénéficiaires indirects |

---

## 5. Périmètre MVP

### Ce que le MVP fait

1. **Saisie d'URL** — Interface minimaliste, saisie d'une URL quelconque
2. **Validation & vérification** — Contrôle format URL + ping HEAD du serveur cible avec gestion d'erreurs explicites (DNS, SSL, timeout, 4xx/5xx)
3. **Audit IA en parallèle** — Appel Claude Haiku 4.5 avec `web_search` + capture PageSpeed simultanés
4. **Génération de données structurées** — Claude retourne un JSON strict à 5 axes + vision
5. **Maquette IA (optionnel)** — Génération d'un mockup desktop via Google Stitch si clé API disponible
6. **Calcul du score global** — Moyenne des 5 scores axes
7. **Persistance** — Sauvegarde normalisée en PostgreSQL (Audit + AuditAxis × 5 + AuditVision)
8. **Présentation Reveal.js** — 10 slides navigables avec animations, jauges SVG, compteurs, plein écran

### Ce que le MVP ne fait pas (décision explicite)

- Authentification utilisateur (dépend du SSO Very Berry, hors contrôle)
- Historique / liste des audits
- Export PDF/PPT
- Comparaison multi-sites
- Fonctionnalités collaboratives

---

## 6. Exigences fonctionnelles détaillées

### EF-01 — Saisie et validation d'URL

**En tant que** consultant, **je veux** entrer une URL dans un champ texte et lancer l'audit en un clic, **afin de** démarrer l'analyse sans configuration.

**Critères d'acceptation :**
- [ ] Le champ accepte les URLs avec ou sans `https://` (normalisation automatique)
- [ ] Les domaines sans point (localhost, test) sont rejetés avec un message clair
- [ ] Le format d'URL invalide retourne une erreur descriptive
- [ ] Le bouton de soumission est désactivé pendant l'audit en cours

---

### EF-02 — Vérification d'accessibilité du site cible

**En tant que** système, **je veux** vérifier que le site cible est accessible avant de lancer l'audit IA, **afin de** ne pas consommer des tokens Anthropic sur un site inexistant.

**Critères d'acceptation :**
- [ ] Requête HEAD avec timeout de 12 secondes
- [ ] Erreurs distinguées : TIMEOUT, DNS_NOT_FOUND, CONN_REFUSED, SSL_ERROR, CONN_RESET, NOT_FOUND, ACCESS_DENIED, SERVER_ERROR
- [ ] HTTP 405 (HEAD bloqué) = site accessible → continuer
- [ ] HTTP 4xx/5xx = erreur métier avec message utilisateur explicite en français

---

### EF-03 — Audit IA sur 5 axes

**En tant que** système, **je veux** appeler l'API Anthropic avec `web_search` pour analyser le site, **afin de** produire un diagnostic structuré et factuel.

**Critères d'acceptation :**
- [ ] Modèle utilisé : `claude-haiku-4-5-20251001`
- [ ] Outil `web_search_20250305` activé avec max 5 usages
- [ ] Prompt système conforme au template défini (retour JSON strict uniquement)
- [ ] 5 axes couverts : design, technique, seo, marketing, innovation
- [ ] Chaque axe : score 0-100, exactement 3 points_forts, 3 points_faibles, 1 recommandation
- [ ] Section `vision` : accroche, 5 fonctionnalités_proposees, 3 idees_ia, 4 next_steps
- [ ] Section `synthese_globale` : une phrase percutante orientée business
- [ ] Extraction JSON robuste (cherche `{` … `}` dans le texte complet)
- [ ] Erreur si aucun JSON trouvé → retour `AI_PARSE_ERROR` au client

---

### EF-04 — Capture d'écran PageSpeed

**En tant que** système, **je veux** récupérer une capture d'écran desktop du site audité via l'API Google PageSpeed, **afin d'** illustrer visuellement l'état actuel du site dans la présentation.

**Critères d'acceptation :**
- [ ] Appel en parallèle de l'audit IA (non bloquant)
- [ ] Timeout de 30 secondes
- [ ] Retour de la donnée base64 depuis `lighthouseResult.audits.final-screenshot.details.data`
- [ ] En cas d'échec : `screenshotUrl = null`, pas d'erreur propagée
- [ ] La présentation s'adapte si pas de screenshot (layout 1 colonne vs 2 colonnes)

---

### EF-05 — Génération de maquette IA (Google Stitch)

**En tant que** système, **je veux** générer un mockup desktop de la refonte proposée via Google Stitch, **afin d'** illustrer visuellement la vision dans la slide Avant/Après.

**Critères d'acceptation :**
- [ ] Activé seulement si `STITCH_API_KEY` est présente en environnement
- [ ] Prompt de génération intègre : accroche, recommandation design, 3 premières fonctionnalités
- [ ] Modèle utilisé : `GEMINI_3_1_PRO`, format `DESKTOP`
- [ ] Image retournée avec suffixe Fife pour width 1280px
- [ ] En cas d'échec : `mockupUrl = null`, fallback wireframe HTML inclus dans la présentation

---

### EF-06 — Calcul du score global et persistance

**En tant que** système, **je veux** calculer le score global et sauvegarder l'audit en base, **afin de** pouvoir récupérer la présentation par ID à tout moment.

**Critères d'acceptation :**
- [ ] Score global = moyenne arrondie des 5 scores axes
- [ ] Sauvegarde atomique : Audit + 5 AuditAxis + 1 AuditVision en une transaction Prisma
- [ ] Durée totale de l'audit (`durationMs`) enregistrée
- [ ] ID retourné au client dans la réponse POST pour redirection

---

### EF-07 — Présentation Reveal.js (10 slides)

**En tant que** consultant, **je veux** voir la présentation s'ouvrir automatiquement après l'audit, **afin de** pouvoir la projeter immédiatement sans manipulation supplémentaire.

**Structure des slides :**

| # | Slide | Contenu |
|---|-------|---------|
| 1 | **Couverture** | Logo Very Agency, domaine audité, date, badges des 5 axes, screenshot du site |
| 2 | **Score global** | Jauge SVG animée, synthèse en italique, 5 mini-jauges par axe |
| 3 | **Design & UX** | Score axe + 3 points forts + 3 points faibles + recommandation |
| 4 | **Performance Technique** | Idem |
| 5 | **SEO & Géolocalisation** | Idem |
| 6 | **Marketing Digital** | Idem |
| 7 | **Innovation & IA** | Idem |
| 8 | **Avant / Après** | Comparaison browser chrome "non sécurisé" vs refonte avec mockup IA |
| 9 | **IA & Innovation** | 3 idées IA concrètes avec icônes et couleurs |
| 10 | **Next Steps & CTA** | Plan d'action 4 étapes, bloc CTA "Démarrer le projet" |

**Critères d'acceptation :**
- [ ] Navigation clavier (flèches) fonctionnelle
- [ ] Barre de progression visible
- [ ] Bouton plein écran (bas droite)
- [ ] Bouton retour "← Nouvel audit" (haut gauche)
- [ ] Jauges SVG animées au chargement de chaque slide (`gauge-active` class)
- [ ] Compteurs count-up (0 → score) avec easing cubic, durée 1.4s
- [ ] Thème dark `#0a0a0f`, accent violet `#7c3aed` / bleu `#2563eb`
- [ ] Couleurs de score : vert ≥ 70, orange 40-69, rouge < 40
- [ ] Fragments animés (fade-up, fade-down, fade-left, fade-right, zoom-in)
- [ ] Slide 8 : fallback wireframe HTML si pas de mockupUrl
- [ ] Slide 1 : layout 1 colonne si pas de screenshotUrl

---

### EF-08 — Récupération d'un audit par ID

**En tant que** consultant, **je veux** pouvoir accéder à un audit précédent via son URL `/audit/[id]`, **afin de** partager la présentation ou la retrouver après coup.

**Critères d'acceptation :**
- [ ] GET `/api/audit/[id]` retourne l'audit complet avec axes et vision
- [ ] Page `/audit/[id]` reconstruit `AuditData` depuis les tables normalisées
- [ ] Erreur 404 si ID inconnu → `notFound()` Next.js
- [ ] Les URLs sont des CUID stables et non-prévisibles

---

## 7. Exigences non fonctionnelles

### Performance

| Exigence | Cible |
|----------|-------|
| Durée totale de génération | < 90 secondes (P90) |
| TTFB page de présentation | < 500 ms (données en base) |
| Timeout vérification site | 12 secondes |
| Timeout PageSpeed | 30 secondes |

### Fiabilité

- Audit IA et capture PageSpeed exécutés en parallèle (`Promise.all`) pour réduire la latence
- Maquette Stitch non bloquante (optionnelle, échec silencieux)
- Vérification d'accessibilité avant tout appel IA (évite les tokens gaspillés)

### Sécurité

- Validation stricte des URLs entrées (format + domaine avec point obligatoire)
- Pas d'exécution de code depuis l'URL utilisateur
- Variables d'environnement pour toutes les clés API (jamais exposées au client)
- `dangerouslySetInnerHTML` utilisé uniquement pour le HTML des slides (contenu généré server-side, non utilisateur)

### Scalabilité

- Architecture Next.js serverless (Vercel) — scaling horizontal automatique
- Base de données Neon (PostgreSQL serverless) — scaling automatique
- Index BDD sur `domain`, `globalScore`, `createdAt` pour futures requêtes analytiques

### Accessibilité

- Bouton plein écran avec `title` descriptif
- Alt text sur toutes les images (screenshot, mockup)
- Couleurs de score conformes aux seuils WCAG (vert/orange/rouge différenciés)

---

## 8. Architecture & décisions techniques

### Stack technique

```
┌─────────────────────────────────────────────────────┐
│                   VERY AUDIT                         │
├─────────────────────────────────────────────────────┤
│  Frontend (Next.js 16 App Router + React 19)        │
│  ├── app/page.tsx          → Landing page           │
│  ├── app/audit/[id]/       → Présentation Reveal.js │
│  └── components/           → audit-form, audit-pres │
├─────────────────────────────────────────────────────┤
│  API Routes (Next.js serverless)                    │
│  ├── POST /api/audit       → Génération audit       │
│  └── GET  /api/audit/[id]  → Récupération audit     │
├─────────────────────────────────────────────────────┤
│  Services externes                                   │
│  ├── Anthropic API  → Claude Haiku 4.5 + web_search │
│  ├── Google PageSpeed API  → Screenshot desktop     │
│  └── Google Stitch SDK     → Mockup IA (optionnel)  │
├─────────────────────────────────────────────────────┤
│  Persistance                                         │
│  ├── Prisma ORM (PostgreSQL)                        │
│  └── Neon DB (serverless PostgreSQL)                │
├─────────────────────────────────────────────────────┤
│  Infrastructure                                      │
│  └── Vercel (Edge/Serverless Functions)             │
└─────────────────────────────────────────────────────┘
```

### Décisions architecturales clés

#### DA-01 : Server-side rendering de la présentation

La page `/audit/[id]` est un **Server Component** qui interroge Prisma directement. Le composant `AuditPresentation` est un **Client Component** car Reveal.js nécessite le DOM. Cette séparation garantit :
- Zéro latence réseau pour la récupération des données (BDD → server → HTML)
- Reveal.js initialisé côté client uniquement (pas de SSR de bibliothèques DOM)

#### DA-02 : Schéma BDD normalisé (vs JSON blob)

Choix délibéré de ne **pas** stocker le JSON brut de Claude en un seul champ JSONB, mais de normaliser en 3 tables (`Audit`, `AuditAxis`, `AuditVision`). Avantages :
- Requêtes analytiques futures (ex : "tous les sites avec SEO < 50")
- Index ciblés par axe et score
- Évolution du schéma sans migration de données JSONB

#### DA-03 : Modèle Claude Haiku (vs Sonnet)

Le choix de `claude-haiku-4-5-20251001` (vs Sonnet mentionné dans le brief initial) est justifié par :
- Vitesse : Haiku est significativement plus rapide pour des tâches structurées
- Coût : 10x moins cher que Sonnet pour un volume d'usage agence
- Qualité suffisante : le prompt système strict + `web_search` compense les différences de raisonnement

#### DA-04 : Reveal.js intégré (vs iframe/artifact)

Reveal.js est importé dynamiquement via npm dans Next.js plutôt que chargé depuis un CDN dans une iframe. Avantages :
- Pas de problèmes CORS
- Typages TypeScript disponibles
- Bundle sous contrôle de version

#### DA-05 : Erreurs métier typées (AuditError)

Une classe `AuditError` dédiée avec `httpStatus` et `code` permet de distinguer les erreurs réseau (4xx/5xx) des erreurs applicatives (IA, parsing). Le frontend peut ainsi afficher des messages d'erreur contextuels sans interpréter des codes HTTP génériques.

---

## 9. Modèle de données

### Schéma Prisma

```prisma
enum AuditStatus { PENDING | COMPLETED | FAILED }
enum AxisType    { DESIGN | TECHNIQUE | SEO | MARKETING | INNOVATION }

model Audit {
  id              String      @id @default(cuid())
  url             String                          // URL complète normalisée
  domain          String                          // ex: la-marniere.com
  globalScore     Int                             // Moyenne des 5 axes (0-100)
  syntheseGlobale String                          // Phrase percutante IA
  screenshotUrl   String?                         // Base64 ou URL PageSpeed
  mockupUrl       String?                         // URL Google Stitch + suffixe Fife
  status          AuditStatus @default(COMPLETED)
  durationMs      Int?                            // Durée de génération en ms
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  axes   AuditAxis[]
  vision AuditVision?

  @@index([domain])        // Recherche par domaine
  @@index([globalScore])   // Tri/filtre par score
  @@index([createdAt])     // Chronologie
}

model AuditAxis {
  id             String   @id @default(cuid())
  auditId        String
  axis           AxisType                        // DESIGN, TECHNIQUE, etc.
  score          Int                             // 0-100
  pointsForts    String[]                        // Exactement 3 items
  pointsFaibles  String[]                        // Exactement 3 items
  recommandation String

  audit Audit @relation(fields: [auditId], references: [id], onDelete: Cascade)

  @@unique([auditId, axis])    // Un axe par audit
  @@index([auditId])
  @@index([axis, score])       // Requêtes analytiques cross-audits
}

model AuditVision {
  id                       String   @id @default(cuid())
  auditId                  String   @unique
  accroche                 String                          // Phrase d'accroche "wow"
  fonctionnalitesProposees String[]                        // 5 fonctionnalités
  ideesIa                  String[]                        // 3 idées IA
  nextSteps                String[]                        // 4 étapes prioritaires

  audit Audit @relation(fields: [auditId], references: [id], onDelete: Cascade)
}
```

### Relations

```
Audit (1) ──── (5) AuditAxis   [Cascade delete]
Audit (1) ──── (1) AuditVision [Cascade delete]
```

---

## 10. Expérience utilisateur & flux

### Flux principal

```
Utilisateur         Système                      IA / APIs externes
────────────────────────────────────────────────────────────────────
[Saisit URL]
     │
     ▼
[Valide URL]──→ Format invalide? ──→ [Erreur inline]
     │
     ▼
[POST /api/audit]
     │
     ├──→ checkSiteReachability() ──→ Site HS? ──→ [Erreur typée]
     │              │ OK
     │
     ├──→ Promise.all([
     │      anthropic.messages.create() ──→ [Claude Haiku + web_search]
     │      fetchScreenshot()            ──→ [Google PageSpeed API]
     │    ])
     │
     ├──→ Parse JSON depuis réponse Claude
     │
     ├──→ generateStitchMockup() ──→ [Google Stitch SDK]
     │
     ├──→ prisma.audit.create() ──→ [PostgreSQL Neon]
     │
     └──→ { id, globalScore, screenshotUrl, mockupUrl }
                    │
     ┌──────────────┘
     │
[Redirect /audit/[id]]
     │
     ▼
[Présentation Reveal.js — 10 slides]
```

### États de l'interface

1. **État initial** : Formulaire URL centré, fond dark avec grille et gradient violet
2. **État chargement** : Loader avec étapes visibles (future amélioration — barre de progression contextuelle)
3. **État erreur** : Message d'erreur inline en français avec code d'erreur pour debug
4. **État succès** : Redirection automatique vers la présentation plein écran

### Couleurs & Thème

| Axe | Couleur | Hex | RGB |
|-----|---------|-----|-----|
| Design & UX | Violet | `#a78bfa` | 167,139,250 |
| Technique | Bleu | `#60a5fa` | 96,165,250 |
| SEO | Vert | `#34d399` | 52,211,153 |
| Marketing | Ambre | `#f59e0b` | 245,158,11 |
| Innovation | Rose | `#f472b6` | 244,114,182 |

| Score | Couleur | Label |
|-------|---------|-------|
| ≥ 70 | Vert `#34d399` | Bon |
| 40-69 | Orange `#f59e0b` | Moyen |
| < 40 | Rouge `#f87171` | Critique |

---

## 11. Intégrations tierces

### Anthropic API

| Paramètre | Valeur |
|-----------|--------|
| Modèle | `claude-haiku-4-5-20251001` |
| max_tokens | 4000 |
| Outil | `web_search_20250305` (max 5 usages) |
| Variable d'env | `ANTHROPIC_API_KEY` |
| Latence typique | 30-60 secondes (avec web_search) |

**Prompt système** : Template strict forçant un retour JSON uniquement, avec règles de qualité (3 points par axe, scores réalistes, français impeccable, ton dirigeant).

### Google PageSpeed Insights API

| Paramètre | Valeur |
|-----------|--------|
| Endpoint | `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` |
| Stratégie | `desktop` |
| Donnée extraite | `lighthouseResult.audits.final-screenshot.details.data` |
| Authentification | Aucune (quota gratuit) |
| Timeout | 30 secondes |

### Google Stitch SDK

| Paramètre | Valeur |
|-----------|--------|
| Package | `@google/stitch-sdk` |
| Modèle | `GEMINI_3_1_PRO` |
| Format | `DESKTOP` |
| Variable d'env | `STITCH_API_KEY` |
| Comportement si absent | Fonctionnalité désactivée silencieusement |

### Neon DB (PostgreSQL serverless)

| Paramètre | Valeur |
|-----------|--------|
| Adapter | `@prisma/adapter-neon` |
| Variable d'env | `DATABASE_URL` |
| Hosting | Neon serverless (prod) |

---

## 12. Contraintes & hypothèses

### Contraintes

| # | Contrainte | Source |
|---|------------|--------|
| C1 | Pas d'authentification utilisateur dans le MVP | Dépendance SSO Very Berry non disponible |
| C2 | Outil usage interne uniquement | Pas de SaaS public prévu à ce stade |
| C3 | `STITCH_API_KEY` optionnelle | Google Stitch en accès limité |
| C4 | L'API Anthropic peut varier en latence | Dépendance externe |
| C5 | PageSpeed ne retourne pas toujours un screenshot | Sites avec anti-scraping |

### Hypothèses

| # | Hypothèse | Impact si fausse |
|---|-----------|-----------------|
| H1 | Claude Haiku produit un JSON valide dans > 90 % des cas | Taux d'erreur `AI_PARSE_ERROR` élevé |
| H2 | Les consultants ont un accès stable à Internet lors des RDV | Présentation inutilisable offline |
| H3 | Le modèle `claude-haiku-4-5-20251001` reste disponible | Mise à jour du nom de modèle nécessaire |
| H4 | L'API PageSpeed retourne un screenshot dans < 30s | Présentation sans screenshot (dégradé gracieux) |

---

## 13. Hors périmètre MVP

Les éléments suivants sont explicitement **hors périmètre du MVP** et documentés pour le backlog :

| # | Fonctionnalité | Raison d'exclusion |
|---|----------------|-------------------|
| OOS-01 | Authentification SSO (Very Berry) | Infrastructure non prête |
| OOS-02 | Liste / historique des audits | Pas prioritaire pour le closing |
| OOS-03 | Export PDF / PowerPoint | Complexité technique, Reveal.js print possible |
| OOS-04 | Audit en temps réel (streaming) | Complexité SSE, UX à concevoir |
| OOS-05 | Comparaison multi-sites | Hors usage cible du MVP |
| OOS-06 | Partage public avec lien (sans auth) | Risque de fuite de données client |
| OOS-07 | Notifications (email, Slack) | Pas de besoin identifié |
| OOS-08 | Mode hors ligne | Architecture serverless incompatible |
| OOS-09 | White-labeling | Hors scope interne |
| OOS-10 | API publique | Hors roadmap |

---

## 14. Épics & User Stories

### Épic 1 — Saisie et déclenchement de l'audit

| Story | Description | Priorité | Statut |
|-------|-------------|----------|--------|
| US-1.1 | En tant que consultant, je veux entrer une URL et lancer l'audit d'un clic | Critique | ✅ Livré |
| US-1.2 | En tant que système, je veux valider le format d'URL avant tout appel | Critique | ✅ Livré |
| US-1.3 | En tant que consultant, je veux voir un message d'erreur clair si le site est inaccessible | Haute | ✅ Livré |
| US-1.4 | En tant que consultant, je veux voir l'état de chargement pendant l'analyse | Moyenne | ⚠ Partiel (loader basique) |

### Épic 2 — Analyse IA du site

| Story | Description | Priorité | Statut |
|-------|-------------|----------|--------|
| US-2.1 | En tant que système, je veux appeler Claude avec web_search pour analyser le site | Critique | ✅ Livré |
| US-2.2 | En tant que système, je veux extraire un JSON structuré des 5 axes depuis la réponse | Critique | ✅ Livré |
| US-2.3 | En tant que système, je veux capturer un screenshot desktop du site | Haute | ✅ Livré |
| US-2.4 | En tant que système, je veux générer un mockup de refonte via IA | Moyenne | ✅ Livré (optionnel) |

### Épic 3 — Persistance et récupération

| Story | Description | Priorité | Statut |
|-------|-------------|----------|--------|
| US-3.1 | En tant que système, je veux sauvegarder l'audit complet en base de données | Critique | ✅ Livré |
| US-3.2 | En tant que consultant, je veux accéder à un audit via son URL unique | Haute | ✅ Livré |
| US-3.3 | En tant que système, je veux que la suppression d'un audit supprime ses axes et vision | Haute | ✅ Livré (Cascade) |

### Épic 4 — Présentation Reveal.js

| Story | Description | Priorité | Statut |
|-------|-------------|----------|--------|
| US-4.1 | En tant que consultant, je veux voir une présentation de 10 slides générée automatiquement | Critique | ✅ Livré |
| US-4.2 | En tant que consultant, je veux naviguer au clavier entre les slides | Haute | ✅ Livré |
| US-4.3 | En tant que consultant, je veux passer en plein écran en un clic | Haute | ✅ Livré |
| US-4.4 | En tant que consultant, je veux voir des jauges animées pour les scores | Haute | ✅ Livré |
| US-4.5 | En tant que consultant, je veux voir le screenshot réel du site en slide 1 | Haute | ✅ Livré |
| US-4.6 | En tant que consultant, je veux voir une comparaison Avant/Après en slide 8 | Haute | ✅ Livré |
| US-4.7 | En tant que consultant, je veux revenir au formulaire depuis la présentation | Moyenne | ✅ Livré |

---

## 15. Risques & mitigations

| # | Risque | Probabilité | Impact | Mitigation |
|---|--------|-------------|--------|------------|
| R1 | Claude ne retourne pas un JSON valide | Moyenne | Élevé | Extraction par `indexOf("{")` + `lastIndexOf("}")`, erreur `AI_PARSE_ERROR` gracieuse |
| R2 | PageSpeed API indisponible ou lente | Faible | Moyen | Timeout 30s, `screenshotUrl = null`, présentation adaptée |
| R3 | Stitch API indisponible | Faible | Faible | Désactivé si pas de clé, fallback wireframe HTML |
| R4 | Site cible bloque les requêtes HEAD | Moyenne | Faible | HTTP 405 interprété comme "site accessible" |
| R5 | Coûts API Anthropic dépassent le budget | Faible | Moyen | Haiku (moins cher), max_uses=5 sur web_search, monitoring usage |
| R6 | Latence > 90s (timeout Vercel) | Faible | Élevé | Vercel max function duration configurée, monitoring à prévoir |
| R7 | Modèle Claude deprecié | Faible | Élevé | Centralisation du nom de modèle dans `lib/anthropic.ts` |
| R8 | Fuite de données client (audit visible sans auth) | Faible | Élevé | IDs CUID non-prédictibles, authentification SSO prévue post-MVP |

---

## 16. Plan de mise en marché

### Phase 1 — Usage interne (MVP, maintenant)

- Déploiement Vercel (production)
- Utilisation par les consultants Very Agency lors des prospections
- Site de démo : www.la-marniere.com/fr/
- Feedback terrain collecté informellement

### Phase 2 — Stabilisation (1-2 mois)

- Monitoring des erreurs (Sentry ou équivalent)
- Loader multi-étapes avec messages contextuels
- Première itération sur la qualité des prompts si besoin
- Historique des audits (liste simple)

### Phase 3 — Authentification SSO (selon disponibilité Very Berry)

- Intégration SSO portail Very Berry
- Association des audits à un utilisateur
- Partage sécurisé par lien (avec expiration)

### Phase 4 — Enrichissement (6+ mois)

- Export PDF de la présentation
- Comparaison avec un audit précédent du même domaine
- Dashboard analytique (scores moyens par secteur)

---

## 17. Backlog post-MVP

Classé par valeur business estimée :

| Priorité | Fonctionnalité | Effort estimé | Valeur |
|----------|----------------|---------------|--------|
| 1 | Loader multi-étapes ("Analyse du design…", "SEO en cours…") | S | Haute |
| 2 | Historique des audits avec liste et recherche | M | Haute |
| 3 | Authentification SSO Very Berry | L | Critique (sécurité) |
| 4 | Export PDF (Reveal.js print CSS) | S | Haute |
| 5 | Streaming de la génération (UX temps réel) | M | Haute |
| 6 | Comparaison multi-versions du même domaine | M | Moyenne |
| 7 | Personnalisation du thème (couleurs agence cliente) | M | Moyenne |
| 8 | Dashboard analytique (scores par secteur) | L | Moyenne |
| 9 | Envoi par email de la présentation | S | Moyenne |
| 10 | Mode présentation offline (cache local) | XL | Faible |

---

## Annexe A — Prompt système Claude (version MVP)

```
Tu es un expert en stratégie digitale pour une agence web premium.
Audite le site fourni sur 5 axes : design/UX, technique, SEO/géo,
marketing digital (réseaux sociaux + ads), et innovation/IA.

Utilise web_search pour analyser le site en profondeur avant de répondre.

Retourne UNIQUEMENT ce JSON strict, sans aucun texte avant ou après, sans markdown :
{
  "synthese_globale": "<une seule phrase percutante qui résume le diagnostic global>",
  "design":     { "score": 0-100, "points_forts": [...3], "points_faibles": [...3], "recommandation": "" },
  "technique":  { ... },
  "seo":        { ... },
  "marketing":  { ... },
  "innovation": { ... },
  "vision": {
    "accroche": "<phrase d'accroche courte et percutante>",
    "fonctionnalites_proposees": [...5],
    "idees_ia": [...3],
    "next_steps": [...4]
  }
}

RÈGLES STRICTES :
- Exactement 3 points_forts et 3 points_faibles par axe
- Scores réalistes et différenciés entre les axes
- Sois précis, percutant, orienté business — audience = dirigeants d'entreprise
- Qualité de français impeccable
- Réponds UNIQUEMENT avec le JSON brut
```

---

## Annexe B — Codes d'erreur API

| Code | HTTP | Message type |
|------|------|-------------|
| `MISSING_URL` | 400 | URL manquante ou invalide |
| `INVALID_URL_FORMAT` | 400 | Format d'URL invalide |
| `INVALID_DOMAIN` | 400 | Domaine invalide (pas de point) |
| `TIMEOUT` | 408 | Site ne répond pas |
| `DNS_NOT_FOUND` | 404 | Domaine inexistant |
| `CONN_REFUSED` | 503 | Serveur refuse la connexion |
| `SSL_ERROR` | 400 | Certificat SSL invalide |
| `CONN_RESET` | 503 | Connexion interrompue |
| `NOT_FOUND` | 404 | Page d'accueil retourne 404 |
| `ACCESS_DENIED` | 403 | Site protégé (401/403) |
| `CLIENT_ERROR` | 400 | Erreur HTTP 4xx |
| `SERVER_ERROR` | 503 | Erreur HTTP 5xx |
| `UNREACHABLE` | 503 | Serveur injoignable |
| `AI_PARSE_ERROR` | 500 | Aucun JSON dans la réponse IA |
| `INTERNAL_ERROR` | 500 | Erreur serveur interne |

---

*Document généré par Mary (Business Analyst) — BMAD Method — Very Agency — 28 avril 2026*
