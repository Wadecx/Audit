📋 Brief projet — Générateur d'audit digital + présentation Reveal.js

Contexte

L'agence réalise des audits complets de sites web pour des dirigeants d'entreprise. L'objectif final est de les convaincre de refondre leur stratégie digitale en leur présentant un diagnostic percutant et une vision inspirante. Le site cible pour la démo : www.la-marniere.com/fr/



Ce que l'outil doit faire





Input : l'utilisateur entre une URL



Audit : Claude analyse le site via l'API Anthropic + web_search sur 5 axes



Output : une présentation Reveal.js animée, générée automatiquement, fullscreen



Les 5 axes d'audit

1. Design & UX — Identité visuelle, cohérence graphique, hiérarchie de l'information, mobile-first, accessibilité, modernité du design

2. Technique — Performance (Core Web Vitals, LCP, CLS, FID), sécurité (HTTPS, headers, vulnérabilités connues), architecture, CMS détecté, temps de chargement

3. SEO & Géo-localisation — Balises meta, structure des URLs, maillage interne, contenu éditorial, SEO local (Google My Business, données structurées), présence sur les requêtes locales

4. Marketing digital — Présence sur les réseaux sociaux (LinkedIn, Instagram, Facebook, TikTok), Google Ads (visibilité sur les requêtes clés), stratégie de contenu, tracking/analytics, CRM/lead generation

5. Innovation & IA — Fonctionnalités différenciantes manquantes, opportunités IA (chatbot, personnalisation, recommandations), tendances web à intégrer, idées de refonte inspirantes



Structure des slides Reveal.js

#SlideContenu1CouvertureLogo agence + nom du site + date2Score globalJauge animée 0–100, synthèse en une phrase3–7Un slide par axeScore axe + 3 points forts + 3 points faibles + recommandation clé8Vision refonteMaquette imaginée, nouvelles fonctionnalités, effet "wow"9IA & Innovation3 idées concrètes d'innovation pour ce site10Next steps & CTAPlan d'action priorisé, invitation à démarrer



Stack technique

Artifact HTML (single file)
├── Reveal.js (cdnjs.cloudflare.com)
├── API Anthropic /v1/messages
│   ├── model: claude-sonnet-4-20250514
│   ├── tools: [web_search_20250305]
│   └── max_tokens: 4000
├── Prompt système : audit structuré → JSON par axe
└── Générateur JS : JSON → slides HTML injectées dans Reveal.js



Prompt système pour l'audit (à passer à Claude API)

Tu es un expert en stratégie digitale pour une agence web premium.
Audite le site [URL] sur 5 axes : design/UX, technique, SEO/géo, 
marketing digital (réseaux sociaux + ads), et innovation/IA.

Pour chaque axe, retourne UN JSON strict :
{
  "design": { "score": 0-100, "points_forts": [], "points_faibles": [], "recommandation": "" },
  "technique": { ... },
  "seo": { ... },
  "marketing": { ... },
  "innovation": { ... },
  "vision": { "accroche": "", "fonctionnalites_proposees": [], "idees_ia": [] }
}

Sois précis, percutant, orienté business. Ton audience = des dirigeants d'entreprise.



UX de l'outil





Étape 1 : champ URL + bouton "Lancer l'audit"



Étape 2 : loader avec étapes visibles ("Analyse du design…", "SEO en cours…")



Étape 3 : présentation Reveal.js s'ouvre en fullscreen dans l'artifact



Navigation : flèches clavier, barre de progression, bouton "plein écran"



Thème : dark, typographie moderne, couleurs agence (à définir : noir/blanc/accent violet ou bleu)



Ce que Claude Code doit produire

Un unique fichier HTML (artifact) contenant :





L'UI d'entrée (input URL)



L'appel à l'API Anthropic avec web_search



Le parseur JSON → structure slides



L'initialisation Reveal.js avec thème custom



Les slides générées dynamiquement via innerHTML



La navigation fullscreen



Stack tech



Front & back : NextJS ( prod - Vercel )

Composant UI : Shadcn/ui & CossUI ( installation de shadcn puis utilisation de cossui pour installeur leur composants UI ).

ORM : Prisma

BDD : PostgresSQL - Neon DB ( prod - NeonDB )







IMPORTANT :

Ne pas créer de connexion utilisateur pour l'instant, car cette dernière est dépendante du portal very berry sur lequel on se connecte en SSO.

