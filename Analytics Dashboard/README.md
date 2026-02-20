# Dashboard-Analytics-en-Temps-R-el---React.js-Node.js
Interface de visualisation de données pour le suivi des KPIs business en temps réel avec mise à jour automatique toutes les 30 secondes.  Stack technique : • Frontend : React.js (Hooks), Redux pour state management • Visualisations : Chart.js, Recharts pour graphiques interactifs • Backend : Node.js + Express, API REST • WebSocket : Socket.io 
Un tableau de bord analytique de niveau production avec mises à jour WebSocket en direct, visualisations multi-graphiques, export CSV/Excel/PDF et système d’alertes intelligent.

⚡ Démarrage Rapide (< 5 minutes)
Option 1 : Docker (Recommandé)
# 1. Cloner et configurer
git clone <repo-url> analytics-dashboard
cd analytics-dashboard
cp .env.example .env

# 2. Démarrer l’ensemble des services
docker-compose up -d --build

# 3. Alimenter la base avec 10 000 enregistrements
make seed

# 4. Ouvrir le tableau de bord
open http://localhost:3000

Connexion : demo@analytics.io / demo1234

Option 2 : Développement Local
# Prérequis : Node 20+, PostgreSQL 16, Redis

# Installer les dépendances
make install

# Configurer l’environnement
cp .env.example .env
# Modifier DATABASE_URL, etc.

# Initialiser la base de données
cd backend
npx prisma migrate dev
npm run seed

# Démarrer le backend (terminal 1)
npm run dev

# Démarrer le frontend (terminal 2)
cd ../frontend
npm run dev
🏗️ Architecture
analytics-dashboard/
├── frontend/               # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/     # RevenueChart, RegionChart, TrafficChart, HeatmapChart
│   │   │   ├── widgets/    # KPICard, DataTable, LiveFeed
│   │   │   ├── layout/     # Header, LoginPage
│   │   │   └── ui/         # FilterBar, SkeletonCard
│   │   ├── hooks/          # useWebSocket, useRealTimeData
│   │   ├── store/          # Slices Redux Toolkit
│   │   ├── types/          # Interfaces TypeScript
│   │   └── utils/          # Formateurs, fonctions d’export
│   └── Dockerfile
├── backend/                # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/         # /api/auth, /api/dashboard
│   │   ├── services/       # dataService, cronService
│   │   ├── sockets/        # Gestionnaires d’événements WebSocket
│   │   ├── middleware/     # Authentification JWT
│   │   └── utils/          # Logger, seed
│   ├── prisma/
│   │   └── schema.prisma   # Modèles User, Transaction, KPISnapshot
│   └── Dockerfile
├── docker-compose.yml      # PostgreSQL + Redis + Backend + Frontend
└── Makefile
📊 Fonctionnalités
Tableau de Bord

6 Cartes KPI — Revenu, Utilisateurs, Taux de Conversion, Taux de Rebond, Sessions, Panier Moyen

Couleurs de performance — 🟢 >100%, 🟡 80-100%, 🔴 <80% de l’objectif

Barres de progression avec animation au chargement

Graphiques
Graphique	Bibliothèque	Description
Tendance du Revenu	Recharts	Graphique en aires, 24h/7j/30j
Sources de Trafic	Recharts	Diagramme circulaire détaillé
Revenu par Région	Recharts	Histogramme coloré
Carte de chaleur d’activité	Personnalisé	Grille 7×24, jour/heure
Filtres (persistés dans localStorage)

Période : Aujourd’hui, 7 jours, 30 jours, Intervalle personnalisé

Région : Toutes, Afrique, Europe, Asie, Amérique

Catégorie : Toutes, E-commerce, SaaS, Marketing

Statut : Tous, Actif, Inactif

Tableau de Données

Pagination (10/50/100 lignes par page)

Affichage du nombre total de lignes

Triable et filtrable

Exports
Format	Contenu
CSV	Toutes les lignes filtrées
Excel	Résumé KPI + feuille de détails
PDF	Tableau KPI + tableau de données (formatage automatique)
Temps Réel

WebSocket — mises à jour KPI en direct, nouvelles ventes, pics de trafic

Actualisation automatique toutes les 30s — rafraîchissement complet des données

Cron toutes les 10s — génération de nouvelles transactions + diffusion

Notifications toast — ventes, pics, alertes

Vibration mobile — en cas d’alerte

Alertes

Revenu < 80% objectif → 🔴 danger + notification

Conversion < 2% → 🟡 avertissement + vibration mobile

Rebond > 60% → 🔴 danger + carte clignotante

Badge d’alerte dans l’en-tête avec option de fermeture

Expérience Utilisateur (UX)

Mode sombre — détection automatique du système + bascule manuelle

Chargement Skeleton — placeholders animés

Framer Motion — apparition progressive des cartes, animations graphiques

PWA — manifest + service worker prêts

🔒 Sécurité

Authentification JWT (expiration 7 jours)

Hachage des mots de passe avec bcrypt (12 tours)

Limitation de débit (100 requêtes/minute)

En-têtes de sécurité HTTP via Helmet

CORS configuré

Validation des entrées avec Zod sur tous les endpoints

ORM Prisma (protection contre injections SQL)

Middleware d’authentification WebSocket

🧪 Tests
# Tests unitaires (Vitest)
cd frontend && npm test

# Tests E2E (Cypress)
cd frontend && npm run test:e2e
Les tests unitaires couvrent :

Formatage des devises/nombres

Logique des couleurs de performance

Calculs de pourcentages

Cas limites (valeurs nulles, dépassements)

Les tests E2E couvrent :

Affichage de la page de connexion

Connexion avec identifiants démo

Visibilité des cartes KPI du tableau de bord

🐳 Services Docker
Service	Port	Description
Frontend	3000	Nginx servant l’application React
Backend	4000	API Express + Socket.io
PostgreSQL	5432	Base de données principale
Redis	6379	Couche de cache
📡 Endpoints API
Authentification
Méthode	Route	Description
POST	/api/auth/login	Connexion avec email/mot de passe
POST	/api/auth/register	Création d’un compte
GET	/api/auth/me	Utilisateur courant (JWT requis)
Tableau de Bord
Méthode	Route	Description
GET	/api/dashboard	Données KPI + graphiques (filtrées)
GET	/api/dashboard/rows	Lignes de transactions paginées
Événements WebSocket
Événement	Direction	Description
kpi:update	Serveur → Client	Snapshot KPI toutes les 30s
event:live	Serveur → Client	Nouvelle vente/utilisateur/pic
alert:trigger	Serveur → Client	Alerte dépassement de seuil
⚙️ Variables d’Environnement

Voir .env.example pour la liste complète. Variables requises :

DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=votre_secret_long_aleatoire
PORT=4000
📈 Performance

Découpage du bundle : React, Redux, Chart, UI (chunks séparés)

Tailwind JIT — CSS minimal

Chargement différé (lazy loading) des composants lourds

Recharts ResponsiveContainer (pas de reflow de layout)

Pool de connexions Prisma

Index PostgreSQL sur timestamp, région, catégorie, statut

🗃️ Schéma de Base de Données

Transaction — 10 000+ enregistrements générés avec des données réalistes via faker.js
User — authentification avec mots de passe hachés bcrypt
KPISnapshot — configuration des objectifs

Développé avec ❤️ en utilisant React 18, TypeScript, Redux Toolkit, Recharts, Socket.io, Express, Prisma et PostgreSQL.
