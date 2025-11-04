# 📋 Cahier des Charges - CLAFOOTIX

**Application Mobile de Jeux de Football**

**Version** : 1.1  
**Date** : Janvier 2025  
**Statut** : Spécifications Techniques Mises à Jour (post-développement MVP)

---

## 📑 Table des Matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Architecture Technique](#2-architecture-technique)
3. [Base de Données](#3-base-de-données)
4. [Fonctionnalités Utilisateur](#4-fonctionnalités-utilisateur)
5. [Fonctionnalités Admin](#5-fonctionnalités-admin)
6. [Système de Jeu](#6-système-de-jeu)
7. [Système de Ligues](#7-système-de-ligues)
8. [Système Social](#8-système-social)
9. [Système de Notifications](#9-système-de-notifications)
10. [Économie - Clafoutis](#10-économie---clafoutis)
11. [Sécurité et Permissions](#11-sécurité-et-permissions)
12. [Performance et Optimisation](#12-performance-et-optimisation)
13. [Roadmap de Développement](#13-roadmap-de-développement)

---

## 1. Vue d'Ensemble

### 1.1 Concept

CLAFOOTIX est une application de jeux de football permettant aux utilisateurs de tester leurs connaissances footballistiques.

**Jeux actuellement disponibles** :
- **TOP 10** ✅ : Deviner le top 10 d'un classement (ex: meilleurs buteurs)
  - Jeu pleinement implémenté et fonctionnel
  - Mode Solo et Mode Défi disponibles
  - Système de scoring et classement opérationnel

**Jeux en développement** :
- **LOGO SNIPER** 🔜 : Jeu de rapidité et de réflexe visuel où le joueur doit identifier des logos de clubs ou de sélections apparaissant successivement
- **CLUB ACTUEL** 🔜 : Jeu d'actualité et de culture foot où l'utilisateur voit l'identité d'un joueur (photo + nom OU photo seule selon le mode) et doit indiquer le club dans lequel il évolue actuellement. Combine réflexe, mémoire et veille football (transferts, mercato, actualité des championnats).
- **CARRIÈRE INFERNALE** 🔜 : [Description à venir]

### 1.2 Modes de Jeu

| Mode | Description | Joueurs | Caractéristiques |
|------|-------------|---------|------------------|
| **Solo** | Partie individuelle | 1 | Immédiat, score personnel, question aléatoire |
| **Défi** | Partie asynchrone entre amis | **2 à N** | Créateur choisit la question, invite plusieurs joueurs simultanément, deadline 48h par défaut, classement automatique |
| **Ligue** | Tournoi permanent avec parties régulières | Illimité | Admin crée, parties générées automatiquement |

**Note importante sur le Mode Défi** :
- Le terme "Défi" est utilisé dans l'interface utilisateur (remplace "Multijoueur")
- Architecture multi-joueurs : support de 2 à N participants (pas de limite fixe de 15)
- Le créateur du défi choisit la question, qui est ensuite imposée à tous les participants
- Chaque participant joue indépendamment dans les 48 heures
- Classement automatique basé sur le score, puis le temps en cas d'égalité
- Statuts : `pending` (en attente), `active` (en cours), `completed` (terminé), `declined` (refusé)

### 1.3 Objectifs

- Créer une expérience ludique autour du football
- Favoriser la compétition amicale entre utilisateurs
- Récompenser la connaissance footballistique via des cerises (monnaie virtuelle)
- Construire une communauté de passionnés de football

### 1.4 Public Cible

- Fans de football de tous âges
- Utilisateurs cherchant des jeux de culture football
- Communautés d'amis souhaitant se challenger

### 1.5 Plateformes

**Phase MVP (actuelle - Janvier 2025)** :
- ✅ **Web** (navigateurs modernes) - **DÉPLOYÉ EN PRODUCTION**
  - URL de production : https://mvp-game-web.vercel.app
  - Infrastructure : Vercel
  - Framework : React + TypeScript + Tailwind CSS
  - Responsive design pour mobile et desktop

**Phase 2 (à venir)** :
- ❌ iOS (iPhone, iPad) - **EN PLANIFICATION**
- ❌ Android (smartphones, tablettes) - **EN PLANIFICATION**
  - Utilisation prévue de React Native pour développement multiplateforme

---

## 2. Architecture Technique

### 2.1 Stack Technologique

#### Frontend
```yaml
Framework: React (web) + React Native (mobile)
Langage: TypeScript
State Management: React Context API (choix par défaut)
Navigation: 
  - Web: React Router DOM
  - Mobile: React Navigation v6
Styling: 
  - Web: Tailwind CSS
  - Mobile: NativeWind (Tailwind CSS pour React Native)
Formulaires: React Hook Form
Validation: Zod
```

#### Backend
```yaml
BaaS: Supabase
Database: PostgreSQL (via Supabase)
Authentication: Supabase Auth
Storage: Supabase Storage (avatars, photos joueurs)
Realtime: Supabase Realtime (notifications, updates)
Functions: Supabase Edge Functions (logique métier complexe)
```

#### Edge Functions (Supabase – recommandé)
```yaml
Objectif: Déporter la logique sensible/complexe côté serveur, proche de la base
Avantages: Déploiement simple, coûts faibles, sécurité et scalabilité natives

Fonctions à implémenter:
  - calculate-league-ranks: recalcul des rangs après chaque partie de ligue
  - generate-league-matches: création automatique des parties selon la fréquence
  - send-notifications: envoi des notifications (in-app / push trigger)
  - validate-game-answers: point d’entrée unique pour valider une partie (orchestration des fonctions SQL validate_* et écriture des scores)

Bonnes pratiques:
  - Auth: vérifier le rôle/uid Supabase JWT en entrée
  - RLS: utiliser service key uniquement côté Edge Function si besoin
  - Observabilité: logs structurés + idempotence sur opérations sensibles
```

#### Notifications
```yaml
Push Notifications: 
  - iOS: Apple Push Notification Service (APNs)
  - Android: Firebase Cloud Messaging (FCM)
In-App Notifications: Supabase Realtime
```

#### Gestion des Données
```yaml
Données Football: Gestion manuelle via interface admin
Usage: Création et mise à jour des joueurs, clubs, statistiques via l'application
Interface Admin: Gestion complète des données footballistiques
```

### 2.2 Structure des Dossiers

```
clafootix/
├── src/
│   ├── components/
│   │   ├── common/              # Boutons, inputs, cards...
│   │   ├── game/                # Composants spécifiques jeux
│   │   │   ├── Top10Game.tsx
│   │   │   ├── LogoSniperGame.tsx
│   │   │   ├── ClubActuelGame.tsx
│   │   │   └── CarriereInfernaleGame.tsx
│   │   ├── league/              # Gestion ligues
│   │   ├── social/              # Amis, invitations
│   │   └── layout/              # Header, Footer, Navigation
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── game/
│   │   │   ├── GameSelectionScreen.tsx
│   │   │   ├── GamePlayScreen.tsx
│   │   │   └── GameResultsScreen.tsx
│   │   ├── league/
│   │   │   ├── LeagueListScreen.tsx
│   │   │   ├── LeagueDetailScreen.tsx
│   │   │   ├── CreateLeagueScreen.tsx
│   │   │   └── LeagueStandingsScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── EditProfileScreen.tsx
│   │   ├── leaderboard/
│   │   │   ├── GlobalLeaderboardScreen.tsx
│   │   │   └── FriendsLeaderboardScreen.tsx
│   │   ├── social/
│   │   │   ├── FriendsScreen.tsx
│   │   │   └── InvitationsScreen.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── ManageQuestionsScreen.tsx
│   │       ├── ManagePlayersScreen.tsx
│   │       └── AdminStatsScreen.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useGame.ts
│   │   ├── useLeague.ts
│   │   └── useNotifications.ts
│   ├── services/
│   │   ├── supabase.ts          # Client Supabase
│   │   ├── auth.service.ts      # Authentification
│   │   ├── game.service.ts      # Logique jeu
│   │   ├── league.service.ts    # Gestion ligues
│   │   ├── social.service.ts    # Amis, invitations
│   │   ├── notification.service.ts
│   │   └── player.service.ts    # Autocomplétion
│   ├── utils/
│   │   ├── validation.ts        # Fonctions validation
│   │   ├── scoring.ts           # Calcul scores
│   │   └── date.ts              # Manipulation dates
│   ├── types/
│   │   ├── database.types.ts    # Types Supabase générés
│   │   ├── game.types.ts
│   │   └── user.types.ts
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── game.constants.ts
│   │   └── routes.ts
│   └── store/
│       ├── authStore.ts
│       ├── gameStore.ts
│       └── notificationStore.ts
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_create_functions.sql
│   │   └── 003_seed_data.sql
│   ├── functions/
│   │   ├── create-league-match/
│   │   └── send-notifications/
│   └── seed.sql
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

**Note :** Structure partagée entre web et mobile. Les composants utilisent des props conditionnelles pour s'adapter aux plateformes.

---

## 3. Base de Données

### 3.1 Schéma Global

La base de données PostgreSQL est organisée en **6 zones fonctionnelles** :

1. **🟦 Utilisateurs** : Gestion des comptes et profils
2. **🟩 Jeux & Parties** : Matchs et participations
3. **🟨 Ligues** : Tournois et classements
4. **🟥 Contenu** : Joueurs et questions
5. **🟪 Social** : Amitiés et notifications
6. **🟧 Admin** : Administration et audit

**Total : 16 tables principales** (users, game_types, players, clubs, questions, question_answers, challenges, challenge_participants, leagues, league_members, friendships, invitations, notifications, admins, admin_audit_log, cerises_transactions)

### 3.2 Diagramme ERD Simplifié

```
USERS ────┐
          ├──→ CHALLENGE_PARTICIPANTS ──→ CHALLENGES ──→ QUESTIONS ──→ QUESTION_ANSWERS ──→ PLAYERS
          │                                                              └──→ CLUBS
          ├──→ LEAGUE_MEMBERS ──→ LEAGUES
          ├──→ FRIENDSHIPS
          ├──→ INVITATIONS
          ├──→ NOTIFICATIONS
          └──→ ADMINS ──→ ADMIN_AUDIT_LOG
```

### 3.3 Tables Détaillées

#### 3.3.1 **users** (Utilisateurs)

Table centrale des joueurs de l'application.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pseudo VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  country VARCHAR(3),                    -- Code ISO (FRA, ESP, BRA...)
  avatar_url TEXT,
  cerises_balance INTEGER DEFAULT 0 CHECK (cerises_balance >= 0),
  global_score INTEGER DEFAULT 0 CHECK (global_score >= 0),
  global_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_global_rank ON users(global_rank) WHERE global_rank IS NOT NULL;
CREATE INDEX idx_users_pseudo ON users(pseudo);
```

**Règles métier** :
- Pseudo unique, 3-50 caractères
- Email validé lors inscription
- `cerises_balance` : Monnaie virtuelle, valeur par défaut **0** pour les nouveaux utilisateurs, jamais négatif (contrainte CHECK)
- `global_score` : Somme de tous les scores (tous modes)
- `global_rank` : Position mondiale, calculé via fonction

---

#### 3.3.2 **game_types** (Types de Jeux)

Référentiel des types de jeux disponibles (données fixes).

```sql
CREATE TABLE game_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,      -- 'TOP10', 'LOGO_SNIPER', 'CLUB_ACTUEL', 'CARRIERE_INFERNALE'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_seconds INTEGER DEFAULT 60,   -- Durée de jeu
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Données initiales
INSERT INTO game_types (code, name, description, duration_seconds) VALUES
  ('TOP10', 'Top 10', 'Trouve les 10 éléments d''un classement', 60),
  ('LOGO_SNIPER', 'Logo Sniper', 'Identifie rapidement les logos de clubs et sélections apparaissant successivement', 60),
  ('CLUB_ACTUEL', 'Club Actuel', 'Devine le club actuel des joueurs présentés', 60),
  ('CARRIERE_INFERNALE', 'Carrière Infernale', '[Description à venir]', 60);
```

---

#### 3.3.3 **players** (Joueurs de Football)

Base de données des joueurs pour autocomplétion et référence.

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL UNIQUE,    -- Nom unique pour éviter les doublons
  current_club VARCHAR(200),
  position VARCHAR(50),                  -- Attaquant, Milieu, Défenseur, Gardien
  nationality VARCHAR(100),
  nationality_code VARCHAR(3),           -- FRA, BRA, ARG...
  club_history JSONB,                    -- Historique clubs
  name_variations TEXT[],                -- Variantes de noms pour recherche flexible
  slug VARCHAR(255),                     -- Slug généré automatiquement pour URL
  search_vector tsvector,                -- Vecteur de recherche full-text (auto-généré)
  is_active BOOLEAN DEFAULT true,        -- Actif ou retraité
  is_verified BOOLEAN DEFAULT false,     -- Vérifié par admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_active ON players(is_active) WHERE is_active = true;
CREATE INDEX idx_players_nationality ON players(nationality_code);
CREATE INDEX idx_players_slug ON players(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_players_search_vector ON players USING gin(search_vector);
```

**Exemple de `club_history` (JSONB)** :
```json
[
  {
    "club": "AS Monaco",
    "league": "Ligue 1",
    "country": "France",
    "start_year": 2015,
    "end_year": 2017
  },
  {
    "club": "PSG",
    "league": "Ligue 1",
    "country": "France",
    "start_year": 2017,
    "end_year": 2024
  },
  {
    "club": "Real Madrid",
    "league": "La Liga",
    "country": "Espagne",
    "start_year": 2024,
    "end_year": null
  }
]
```

**Règles métier** :
- **Nom unique** : `name` doit être unique (contrainte `UNIQUE`) pour éviter les doublons
- **Autocomplétion** : Recherche full-text via `search_vector` et recherche sur `name_variations`
- `club_history` : Historique des clubs en JSONB pour flexibilité
- `name_variations` : Tableau de variantes de noms pour améliorer la recherche (ex: ["Mbappé", "Mbappe", "K. Mbappé"])
- `slug` : Généré automatiquement à partir du nom (minuscules, sans accents, avec tirets) pour URLs
- `search_vector` : Vecteur de recherche full-text auto-généré pour recherche avancée
- `is_verified` : Contrôle qualité par les admins

---

#### 3.3.4 **clubs** (Clubs et Sélections - Base de Référence pour Logo Sniper)

Table centralisée des clubs et sélections nationales, utilisée comme base de données pour l'autocomplétion et les questions Logo Sniper.

```sql
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL UNIQUE,       -- Nom du club (ex: "Real Madrid")
  name_variations TEXT[],                  -- Variantes acceptées (ex: ["Real Madrid CF", "Real", "Real Madrid Club de Fútbol"])
  logo_url TEXT NOT NULL,                  -- URL de l'image du logo (Supabase Storage)
  type VARCHAR(20) NOT NULL CHECK (type IN ('CLUB', 'NATIONAL_TEAM')), -- Type : club ou sélection
  country VARCHAR(3),                      -- Code pays (FRA, ESP, BRA...) pour clubs
  league VARCHAR(100),                     -- Ligue (ex: "La Liga", "Premier League")
  is_active BOOLEAN DEFAULT true,           -- Actif dans la base
  is_verified BOOLEAN DEFAULT false,       -- Vérifié par admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clubs_name ON clubs(name);
CREATE INDEX idx_clubs_type ON clubs(type);
CREATE INDEX idx_clubs_country ON clubs(country) WHERE country IS NOT NULL;
CREATE INDEX idx_clubs_active ON clubs(is_active) WHERE is_active = true;
```

**Exemples de données** :
```sql
-- Club
INSERT INTO clubs (name, name_variations, logo_url, type, country, league) VALUES
('Real Madrid', ARRAY['Real Madrid CF', 'Real', 'Real Madrid Club de Fútbol'], 
 'https://storage.supabase.co/bucket/logos/real-madrid.png', 'CLUB', 'ESP', 'La Liga');

-- Sélection nationale
INSERT INTO clubs (name, name_variations, logo_url, type, country) VALUES
('France', ARRAY['Équipe de France', 'France', 'FRA'], 
 'https://storage.supabase.co/bucket/logos/france.png', 'NATIONAL_TEAM', 'FRA');
```

**Règles métier** :
- **Nom unique** : `name` doit être unique pour éviter les doublons
- **Autocomplétion** : La recherche se fait sur `name` et `name_variations`
- **Logo obligatoire** : `logo_url` ne peut pas être NULL
- **Type** : Distinction entre clubs (`CLUB`) et sélections nationales (`NATIONAL_TEAM`)
- **Réutilisable** : Un même club peut apparaître dans plusieurs questions Logo Sniper

---

#### 3.3.5 **questions** (Banque de Questions)

Stockage des questions pour tous les types de jeux (TOP10, LOGO SNIPER, CLUB ACTUEL, CARRIÈRE INFERNALE).

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_type VARCHAR(20) NOT NULL CHECK (game_type IN ('TOP10', 'LOGO_SNIPER', 'CLUB_ACTUEL', 'CARRIERE_INFERNALE')),
  title VARCHAR(255) NOT NULL,           -- Titre simple de la question
  player_ids UUID[],                     -- Références vers players
  season VARCHAR(20),                    -- '2024-2025'
  is_active BOOLEAN DEFAULT true,        -- Visible aux joueurs
  is_archived BOOLEAN DEFAULT false,     -- Archivé (plus utilisé)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_questions_game_type ON questions(game_type);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = true;
CREATE INDEX idx_questions_season ON questions(season);
CREATE INDEX idx_questions_archived ON questions(is_archived) WHERE is_archived = true;
```

**Exemples de `title` selon `game_type`** :

**TOP10** (game_type = 'TOP10') :
- "Top 10 des meilleurs buteurs de Ligue 1 2024-2025"
- "Top 10 des meilleurs passeurs de Premier League 2023-2024"

**LOGO_SNIPER** (game_type = 'LOGO_SNIPER') :
- "Clubs européens mythiques"
- "Coupes du monde et sélections nationales"
- "Logos rétro 80s–2000s"

**CLUB_ACTUEL** (game_type = 'CLUB_ACTUEL') :
- "Top joueurs des 5 grands championnats"
- "Transferts récents"
- "Jeunes pépites en pleine ascension"
- "Retour de légendes dans leurs clubs formateurs"
- "Devine le club actuel des joueurs (photo)"
- "Devine le club actuel des joueurs (nom + nationalité)"

**CARRIERE_INFERNALE** (game_type = 'CARRIERE_INFERNALE') :
- [Description à venir]

**Note importante** : 
- Le champ `player_ids` dans `questions` est optionnel et peut être utilisé pour référence rapide
- **Les réponses détaillées sont stockées dans `question_answers`** pour tous les types de jeux
- Pour TOP10 : `question_answers` contient les joueurs avec `ranking` et `points`
- Pour LOGO SNIPER : `question_answers` référence les clubs via `club_id` (les logos et noms sont dans la table `clubs`)
- Pour CLUB ACTUEL : `question_answers` contient les joueurs avec `player_id` et `display_order`

---

#### 3.3.6 **question_answers** (Réponses aux Questions - Table Unique pour Tous les Jeux)

Table unique pour stocker toutes les réponses valides aux questions, pour tous les types de jeux (TOP10, LOGO SNIPER, CLUB ACTUEL, CARRIÈRE INFERNALE).

```sql
CREATE TABLE question_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Référence vers un joueur (pour TOP10, CLUB ACTUEL, CARRIÈRE INFERNALE)
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  
  -- Référence vers un club (pour LOGO SNIPER)
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  
  -- Réponse texte alternative (pour compatibilité ou questions texte uniquement)
  answer_text VARCHAR(200),                -- Texte de réponse alternative (si pas de club_id/player_id)
  answer_norm VARCHAR(200),                -- Version normalisée (sans accents, lowercase)
  valid_names TEXT[],                      -- Noms alternatifs acceptés (deprecated si club_id utilisé)
  
  -- Données de classement (pour TOP10)
  ranking INTEGER,                         -- Position dans le classement (1-10 pour TOP10)
  points INTEGER,                          -- Points attribués selon le rang
  
  -- Données de validation (pour CLUB ACTUEL)
  is_correct BOOLEAN,                      -- Réponse correcte ou non (pour CLUB ACTUEL)
  
  -- Ordre d'affichage (pour LOGO SNIPER, CLUB ACTUEL)
  display_order INTEGER DEFAULT 0,         -- Ordre d'affichage dans la question
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  
  -- Dates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Contraintes
  CONSTRAINT has_player_club_or_answer_text CHECK (
    (player_id IS NOT NULL) OR (club_id IS NOT NULL) OR (answer_text IS NOT NULL)
  ),
  CONSTRAINT valid_ranking CHECK (ranking IS NULL OR (ranking >= 1 AND ranking <= 20)),
  CONSTRAINT valid_points CHECK (points IS NULL OR points >= 0)
);

-- Indexes
CREATE INDEX idx_question_answers_question ON question_answers(question_id);
CREATE INDEX idx_question_answers_player ON question_answers(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX idx_question_answers_club ON question_answers(club_id) WHERE club_id IS NOT NULL;
CREATE INDEX idx_question_answers_ranking ON question_answers(question_id, ranking) WHERE ranking IS NOT NULL;
CREATE INDEX idx_question_answers_active ON question_answers(is_active) WHERE is_active = true;
CREATE INDEX idx_question_answers_display_order ON question_answers(question_id, display_order);
CREATE INDEX idx_question_answers_answer_norm ON question_answers(answer_norm) WHERE answer_norm IS NOT NULL;
```

**Exemples de données selon le type de jeu** :

**TOP10** (game_type = 'TOP10') :
| question_id | player_id | ranking | points | answer_text | logo_url |
|-------------|-----------|---------|--------|-------------|----------|
| uuid-q1 | uuid-mbappe | 1 | 100 | NULL | NULL |
| uuid-q1 | uuid-ben-yedder | 2 | 90 | NULL | NULL |

**LOGO SNIPER** (game_type = 'LOGO_SNIPER') :
| question_id | club_id | display_order | player_id | answer_text |
|-------------|---------|---------------|-----------|-------------|
| uuid-q2 | uuid-real-madrid | 1 | NULL | NULL |
| uuid-q2 | uuid-barcelona | 2 | NULL | NULL |

**Note** : Pour Logo Sniper, on référence directement `clubs.id`. Le logo et les noms valides sont dans la table `clubs`.

**CLUB ACTUEL** (game_type = 'CLUB_ACTUEL') :
| question_id | player_id | is_correct | answer_text | display_order |
|-------------|-----------|------------|-------------|---------------|
| uuid-q3 | uuid-mbappe | true | Real Madrid | 1 |
| uuid-q3 | uuid-vinicius | true | Real Madrid | 2 |

**Règles métier** :
- **Table unique** pour tous les types de jeux
- Pour **TOP10** : utilise `player_id`, `ranking`, `points`
- Pour **LOGO SNIPER** : utilise `club_id`, `display_order` (référence vers la table `clubs` qui contient logo_url, name, name_variations)
- Pour **CLUB ACTUEL** : utilise `player_id`, `is_correct`, `display_order`
- Pour **CARRIÈRE INFERNALE** : [À définir selon les spécifications]
- Contrainte : Au moins un de `player_id`, `club_id` ou `answer_text` doit être rempli
- Pour Logo Sniper : Les données (logo, noms) sont dans `clubs`, évitant la duplication
- Le champ `answer_norm` est utilisé pour la normalisation lors de la validation (sans accents, lowercase) si `answer_text` est utilisé
- Archivage : Quand une question est archivée, ses réponses le sont aussi (via trigger ou application)

---

#### 3.3.7 **challenges** (Défis Multi-Joueurs)

Table des défis créés par les utilisateurs (pour le mode Défi multi-joueurs).

```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('TOP10', 'LOGO_SNIPER', 'CLUB_ACTUEL', 'CARRIERE_INFERNALE')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired', 'cancelled')),
  winner_ids TEXT DEFAULT NULL,                    -- IDs des gagnants (peut être plusieurs en cas d'égalité)
  question_id UUID DEFAULT NULL,                   -- Question imposée par le créateur
  max_participants INTEGER DEFAULT NULL,           -- NULL = illimité
  min_participants INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,                 -- Deadline (48h par défaut)
  completed_at TIMESTAMPTZ DEFAULT NULL,
  
  CONSTRAINT valid_expires_at CHECK (expires_at > created_at),
  CONSTRAINT valid_participants CHECK (min_participants >= 2 AND (max_participants IS NULL OR max_participants >= min_participants))
);

-- Indexes
CREATE INDEX idx_challenges_creator ON challenges(creator_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_expires_at ON challenges(expires_at);
CREATE INDEX idx_challenges_game_type ON challenges(game_type);
CREATE INDEX idx_challenges_created_at ON challenges(created_at DESC);
```

**Règles métier** :
- Un défi est créé par un `creator_id` (utilisateur)
- Le créateur choisit la question (`question_id`) qui sera imposée à tous les participants
- Support de 2 à N participants (pas de limite maximale fixe si `max_participants` est NULL)
- Le statut évolue automatiquement : `pending` → `in_progress` → `completed` (via trigger PostgreSQL)
- Les gagnants sont déterminés automatiquement selon le score et le temps
- `winner_ids` peut contenir plusieurs IDs séparés par des virgules en cas d'égalité au 1er rang

---

#### 3.3.7 **challenge_participants** (Participants aux Défis)

Table de liaison entre les défis et les utilisateurs participants, avec stockage des scores et classements.

```sql
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'declined')),
  score INTEGER DEFAULT NULL,
  time_taken INTEGER DEFAULT NULL,                 -- Temps de jeu en secondes
  rank INTEGER DEFAULT NULL,                       -- Classement (1 = gagnant, NULL si non calculé)
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ DEFAULT NULL,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  
  CONSTRAINT unique_challenge_user UNIQUE (challenge_id, user_id),
  CONSTRAINT valid_score CHECK (score IS NULL OR score >= 0),
  CONSTRAINT valid_time CHECK (time_taken IS NULL OR time_taken > 0),
  CONSTRAINT valid_rank CHECK (rank IS NULL OR rank > 0)
);

-- Indexes
CREATE INDEX idx_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_participants_status ON challenge_participants(status);
CREATE INDEX idx_participants_challenge_status ON challenge_participants(challenge_id, status);
```

**Règles métier** :
- Un utilisateur ne peut participer qu'une fois par défi (contrainte unique)
- Le `status` évolue : `pending` (invité) → `active` (en train de jouer) → `completed` (terminé)
- Le `rank` est calculé automatiquement après que tous les participants ont terminé (via trigger PostgreSQL)
- Calcul du classement : `score DESC`, puis `time_taken ASC` en cas d'égalité
- Plusieurs participants peuvent avoir le même rang en cas d'égalité parfaite

---

#### 3.3.9 **leagues** (Ligues/Tournois)

Tournois permanents avec parties régulières.

```sql
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_matches INTEGER NOT NULL CHECK (total_matches > 0),
  match_frequency VARCHAR(20) NOT NULL CHECK (match_frequency IN ('daily', 'weekly', 'monthly')),
  current_match_number INTEGER DEFAULT 0 CHECK (current_match_number >= 0),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  next_match_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leagues_admin ON leagues(admin_id);
CREATE INDEX idx_leagues_status ON leagues(status);
CREATE INDEX idx_leagues_next_match ON leagues(next_match_date) 
  WHERE status = 'active';
```

**Règles métier** :
- Admin crée la ligue avec :
  - Nombre total de parties (ex: 10)
  - Fréquence (daily/weekly/monthly)
  - Participants (via invitations)
- Parties générées automatiquement selon `match_frequency`
- Type de jeu aléatoire pour chaque partie
- Tous les membres jouent la même question

**Exemple** :
- Ligue "Entre Amis" : 8 parties, 1 par semaine, 6 participants
- Chaque lundi à 12h00 : nouvelle partie créée automatiquement
- Deadline : mardi 12h00 (24h)
- Type de jeu : aléatoire (TOP10, LOGO_SNIPER, CLUB_ACTUEL, CARRIERE_INFERNALE)

---

#### 3.3.10 **league_members** (Membres des Ligues)

Participants aux ligues et leurs scores cumulés.

```sql
CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0),
  rank INTEGER,                          -- Position dans la ligue
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'left', 'kicked')),
  UNIQUE(league_id, user_id)
);

-- Indexes
CREATE INDEX idx_league_members_user ON league_members(user_id);
CREATE INDEX idx_league_members_league ON league_members(league_id);
CREATE INDEX idx_league_members_rank ON league_members(league_id, rank) 
  WHERE rank IS NOT NULL;
```

**Règles métier** :
- `total_score` = somme des scores de toutes les parties de la ligue
- `rank` recalculé après chaque partie via fonction `calculate_league_ranks()`
- Un user peut être membre de plusieurs ligues simultanément

---

#### 3.3.11 **friendships** (Amitiés)

Relations d'amitié entre utilisateurs.

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  CHECK (user_id != friend_id),
  UNIQUE(user_id, token)
);

-- Indexes
CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = true;
```

**Règles métier** :
- Un user peut avoir plusieurs tokens (plusieurs appareils)
- Token désactivé lors déconnexion ou désinstallation app

---

#### 3.3.15 **admins** (Administrateurs)

Utilisateurs avec privilèges administrateur.

```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions JSONB DEFAULT '{"can_create": true, "can_edit": true, "can_delete": true, "can_publish": true}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES admins(id),
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_admins_user ON admins(user_id) WHERE is_active = true;
CREATE INDEX idx_admins_role ON admins(role);
```

**Structure `permissions` (JSONB)** :
```json
{
  "can_create": true,
  "can_edit": true,
  "can_delete": false,
  "can_publish": true,
  "can_manage_users": false,
  "can_manage_admins": false,
  "can_view_analytics": true
}
```

---

#### 3.3.16 **admin_audit_log** (Journal d'Audit)

Historique de toutes les actions administrateur.

```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  action VARCHAR(50) NOT NULL,           -- 'create', 'update', 'delete', 'publish'
  entity_type VARCHAR(50) NOT NULL,      -- 'question', 'player', 'grid_answer'
  entity_id UUID NOT NULL,
  old_data JSONB,                        -- État avant
  new_data JSONB,                        -- État après
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON admin_audit_log(created_at DESC);
CREATE INDEX idx_audit_action ON admin_audit_log(action);
```

**Règles métier** :
- Chaque action admin est tracée
- Impossible de supprimer les logs (intégrité)
- Utilisé pour debug et sécurité

---

### 3.4 Fonctions PostgreSQL

#### 3.4.1 Calcul Classement Ligue

```sql
CREATE OR REPLACE FUNCTION calculate_league_ranks(p_league_id UUID)
RETURNS void AS $
BEGIN
  WITH ranked_members AS (
    SELECT 
      id,
      RANK() OVER (ORDER BY total_score DESC) as new_rank
    FROM league_members
    WHERE league_id = p_league_id AND status = 'active'
  )
  UPDATE league_members lm
  SET rank = rm.new_rank
  FROM ranked_members rm
  WHERE lm.id = rm.id;
END;
$ LANGUAGE plpgsql;
```

**Usage** : Appelée après chaque partie de ligue terminée.

---

#### 3.4.2 Calcul Classement Global

```sql
CREATE OR REPLACE FUNCTION calculate_global_ranks()
RETURNS void AS $
BEGIN
  WITH ranked_users AS (
    SELECT 
      id,
      RANK() OVER (ORDER BY global_score DESC) as new_rank
    FROM users
    WHERE global_score > 0
  )
  UPDATE users u
  SET global_rank = ru.new_rank
  FROM ranked_users ru
  WHERE u.id = ru.id;
  
  UPDATE users SET global_rank = NULL WHERE global_score = 0;
END;
$ LANGUAGE plpgsql;
```

**Usage** : Appelée périodiquement (cron) ou après chaque partie.

---

#### 3.4.3 Recherche Joueurs (Autocomplétion)

```sql
CREATE OR REPLACE FUNCTION search_players(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 10,
  p_filters JSONB DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name VARCHAR,
  current_club VARCHAR,
  nationality VARCHAR,
  photo_url TEXT,
  position VARCHAR,
  relevance REAL
) AS $
DECLARE
  v_nationality TEXT;
  v_position TEXT;
BEGIN
  v_nationality := p_filters->>'nationality';
  v_position := p_filters->>'position';
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.current_club,
    p.nationality,
    p.photo_url,
    p.position,
    ts_rank(p.search_vector, plainto_tsquery('french', p_search_term)) +
    (p.popularity_score::REAL / 1000) as relevance
  FROM players p
  WHERE 
    p.is_active = true
    AND (
      p.search_vector @@ plainto_tsquery('french', p_search_term)
      OR p.name ILIKE '%' || p_search_term || '%'
      OR EXISTS(
        SELECT 1 FROM unnest(p.name_variations) as v
        WHERE v ILIKE '%' || p_search_term || '%'
      )
    )
    AND (v_nationality IS NULL OR p.nationality_code = v_nationality)
    AND (v_position IS NULL OR p.position = v_position)
  ORDER BY relevance DESC, p.popularity_score DESC
  LIMIT p_limit;
END;
$ LANGUAGE plpgsql;
```

**Usage** : Appelée lors de la saisie utilisateur pour autocomplétion.

---

#### 3.4.4 Validation Réponse TOP10

```sql
CREATE OR REPLACE FUNCTION validate_top10_answer(
  p_question_id UUID,
  p_user_answers TEXT[] -- Tableau des réponses dans l'ordre (position 1-10)
)
RETURNS TABLE(
  correct_count INTEGER,
  correct_answers TEXT[],
  score INTEGER
) AS $
DECLARE
  v_answer RECORD;
  v_user_answer TEXT;
  v_normalized TEXT;
  v_correct TEXT[] := ARRAY[]::TEXT[];
  v_answer_index INTEGER := 1;
  v_points_earned INTEGER := 0;
BEGIN
  -- Parcourir les réponses dans l'ordre du classement (ranking)
  FOR v_answer IN 
    SELECT qa.*, p.name as player_name
    FROM question_answers qa
    INNER JOIN players p ON qa.player_id = p.id
    WHERE qa.question_id = p_question_id 
    AND qa.is_active = true 
    AND qa.player_id IS NOT NULL
    AND qa.ranking IS NOT NULL
    ORDER BY qa.ranking ASC
  LOOP
    -- Récupérer la réponse utilisateur correspondante à ce rang
    IF v_answer_index <= array_length(p_user_answers, 1) THEN
      v_user_answer := p_user_answers[v_answer_index];
      v_normalized := LOWER(TRIM(v_user_answer));
      
      -- Vérifier si la réponse correspond au nom du joueur (normalisé)
      -- La normalisation doit être cohérente avec celle utilisée côté application
      IF LOWER(TRIM(v_answer.player_name)) = v_normalized OR
         EXISTS (
           SELECT 1 FROM unnest(ARRAY[v_answer.player_name]) as name_var
           WHERE LOWER(TRIM(name_var)) = v_normalized
         ) THEN
        v_correct := array_append(v_correct, v_answer.player_name);
        -- Les points sont attribués selon le rang (ex: rang 1 = 100, rang 2 = 90, etc.)
        v_points_earned := v_points_earned + COALESCE(v_answer.points, 0);
      END IF;
      
      v_answer_index := v_answer_index + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT
    array_length(v_correct, 1),
    v_correct,
    v_points_earned; -- Score total basé sur les points des réponses correctes
END;
$ LANGUAGE plpgsql;
```

**Usage** : Appelée côté app pour calculer le score du joueur. Utilise la table `question_answers` avec les champs `player_id`, `ranking`, et `points`.

---

#### 3.4.5 Validation Réponse LOGO SNIPER

```sql
CREATE OR REPLACE FUNCTION validate_logo_sniper_answer(
  p_question_id UUID,
  p_user_answers TEXT[], -- Tableau des réponses dans l'ordre des logos
  p_time_remaining INTEGER DEFAULT 0 -- Secondes restantes pour bonus temps
)
RETURNS TABLE(
  correct_count INTEGER,
  total_logos INTEGER,
  correct_answers TEXT[],
  score INTEGER,
  cerises_earned INTEGER,
  streak_bonus INTEGER,
  time_bonus INTEGER
) AS $
DECLARE
  v_answer RECORD;
  v_user_answer TEXT;
  v_user_answer_normalized TEXT;
  v_is_correct BOOLEAN;
  v_correct_answers TEXT[] := ARRAY[]::TEXT[];
  v_correct_count INTEGER := 0;
  v_total_logos INTEGER;
  v_cerises_base INTEGER := 150;
  v_cerises_penalty INTEGER := 0;
  v_streak_count INTEGER := 0;
  v_streak_bonus INTEGER := 0;
  v_time_bonus INTEGER := 0;
  v_answer_index INTEGER := 1;
BEGIN
  -- Compter le nombre total de logos pour cette question
  SELECT COUNT(*) INTO v_total_logos
  FROM question_answers qa
  WHERE qa.question_id = p_question_id
  AND qa.is_active = true
  AND qa.club_id IS NOT NULL; -- Les logos Logo Sniper ont un club_id

  -- Parcourir les réponses dans l'ordre d'affichage (avec jointure vers clubs)
  FOR v_answer IN
    SELECT qa.*, c.name as club_name, c.name_variations as club_variations
    FROM question_answers qa
    INNER JOIN clubs c ON qa.club_id = c.id
    WHERE qa.question_id = p_question_id
    AND qa.is_active = true
    AND qa.club_id IS NOT NULL
    ORDER BY qa.display_order, qa.id -- Ordre d'affichage
  LOOP
    -- Récupérer la réponse utilisateur correspondante
    IF v_answer_index <= array_length(p_user_answers, 1) THEN
      v_user_answer := p_user_answers[v_answer_index];
      v_user_answer_normalized := LOWER(TRIM(v_user_answer));

      -- Vérifier si la réponse correspond au nom du club ou à ses variantes
      v_is_correct := (
        LOWER(TRIM(v_answer.club_name)) = v_user_answer_normalized
        OR (v_answer.club_variations IS NOT NULL AND v_user_answer_normalized = ANY(
          SELECT LOWER(TRIM(unnest(v_answer.club_variations)))
        ))
      );

      IF v_is_correct THEN
        v_correct_count := v_correct_count + 1;
        v_correct_answers := array_append(v_correct_answers, v_answer.club_name);
        v_streak_count := v_streak_count + 1;
      ELSE
        v_cerises_penalty := v_cerises_penalty + 10;
        v_streak_count := 0;
      END IF;

      v_answer_index := v_answer_index + 1;
    END IF;
  END LOOP;
  
  -- Calculer les bonus de streak
  IF v_streak_count >= 20 THEN
    v_streak_bonus := 15;
  ELSIF v_streak_count >= 15 THEN
    v_streak_bonus := 15;
  ELSIF v_streak_count >= 10 THEN
    v_streak_bonus := 10;
  ELSIF v_streak_count >= 5 THEN
    v_streak_bonus := 10;
  END IF;
  
  -- Bonus temps (1 cerise par seconde restante)
  v_time_bonus := GREATEST(0, p_time_remaining);
  
  RETURN QUERY SELECT
    v_correct_count,
    v_total_logos,
    v_correct_answers,
    v_correct_count * 10, -- Score (10 points par logo correct)
    GREATEST(0, LEAST(200, v_cerises_base - v_cerises_penalty + v_streak_bonus + v_time_bonus)), -- Cerises (max 200)
    v_streak_bonus,
    v_time_bonus;
END;
$ LANGUAGE plpgsql;
```

**Usage** : Appelée côté app pour calculer le score et les cerises gagnées du joueur dans Logo Sniper. Utilise la table `question_answers` avec jointure vers `clubs` pour récupérer `name`, `name_variations`, et `logo_url`.

---

#### 3.4.6 Validation Réponse CLUB ACTUEL

```sql
CREATE OR REPLACE FUNCTION validate_club_actuel_answers(
  p_question_id UUID,
  p_user_answers JSONB, -- Format: {"player_id": "club_name", ...} ou {"player_name": "club_name", ...}
  p_time_remaining INTEGER DEFAULT 0, -- Secondes restantes pour bonus temps
  p_streak_count INTEGER DEFAULT 0 -- Nombre de bonnes réponses consécutives (calculé côté app)
)
RETURNS TABLE(
  correct_count INTEGER,
  total_players INTEGER,
  correct_answers JSONB,
  score INTEGER,
  cerises_earned INTEGER,
  streak_bonus INTEGER,
  time_bonus INTEGER
) AS $
DECLARE
  v_answer RECORD;
  v_user_club TEXT;
  v_user_club_normalized TEXT;
  v_correct_club_normalized TEXT;
  v_is_correct BOOLEAN;
  v_correct JSONB := '{}'::JSONB;
  v_correct_count INTEGER := 0;
  v_total INTEGER;
  v_cerises_base INTEGER := 0;
  v_streak_bonus INTEGER := 0;
  v_time_bonus INTEGER := 0;
  v_cerises_total INTEGER := 0;
BEGIN
  -- Compter le nombre total de joueurs pour cette question (15 par défaut)
  SELECT COUNT(*) INTO v_total
  FROM question_answers qa
  WHERE qa.question_id = p_question_id 
  AND qa.is_active = true 
  AND qa.player_id IS NOT NULL; -- Les réponses CLUB ACTUEL ont un player_id
  
  -- Parcourir les réponses dans l'ordre d'affichage
  FOR v_answer IN 
    SELECT qa.*, p.name as player_name, p.current_club, p.id as player_id_uuid
    FROM question_answers qa
    INNER JOIN players p ON qa.player_id = p.id
    WHERE qa.question_id = p_question_id 
    AND qa.is_active = true 
    AND qa.player_id IS NOT NULL
    ORDER BY qa.display_order, qa.id
  LOOP
    -- Récupérer la réponse utilisateur pour ce joueur (par player_id ou player_name)
    v_user_club := COALESCE(
      p_user_answers->>v_answer.player_id_uuid::text,
      p_user_answers->>v_answer.player_name
    );
    
    IF v_user_club IS NOT NULL THEN
      -- Normaliser les deux chaînes pour comparaison (sans accents, lowercase)
      v_user_club_normalized := LOWER(TRIM(translate(v_user_club, 'àáâãäåèéêëìíîïòóôõöùúûüýÿ', 'aaaaaaeeeeiiiioooouuuuyy')));
      v_correct_club_normalized := LOWER(TRIM(translate(v_answer.current_club, 'àáâãäåèéêëìíîïòóôõöùúûüýÿ', 'aaaaaaeeeeiiiioooouuuuyy')));
      
      -- Vérifier si la réponse correspond au club actuel du joueur
      v_is_correct := v_user_club_normalized = v_correct_club_normalized;
      
      IF v_is_correct THEN
        v_correct := v_correct || jsonb_build_object(
          v_answer.player_name, 
          jsonb_build_object(
            'user_answer', v_user_club,
            'correct_club', v_answer.current_club,
            'player_id', v_answer.player_id_uuid
          )
        );
        v_correct_count := v_correct_count + 1;
        v_cerises_base := v_cerises_base + 10; -- 10 cerises par bonne réponse
      END IF;
    END IF;
  END LOOP;
  
  -- Calculer les bonus de streak (selon p_streak_count)
  -- Les streaks sont calculés côté application en temps réel
  IF p_streak_count >= 12 THEN
    v_streak_bonus := 15;
  ELSIF p_streak_count >= 9 THEN
    v_streak_bonus := 15;
  ELSIF p_streak_count >= 6 THEN
    v_streak_bonus := 10;
  ELSIF p_streak_count >= 3 THEN
    v_streak_bonus := 10;
  END IF;
  
  -- Bonus temps (1 cerise par seconde restante, hors 200-point cap)
  v_time_bonus := GREATEST(0, p_time_remaining);
  
  -- Calculer le total de cerises (max 200 pour base + streaks, bonus temps en plus)
  v_cerises_total := GREATEST(0, LEAST(200, v_cerises_base + v_streak_bonus)) + v_time_bonus;
  
  RETURN QUERY SELECT
    v_correct_count,
    v_total,
    v_correct,
    v_correct_count * 10, -- Score : 10 points par bonne réponse
    v_cerises_total, -- Cerises totales (base + streaks + temps)
    v_streak_bonus, -- Bonus streaks
    v_time_bonus; -- Bonus temps
END;
$ LANGUAGE plpgsql;
```

**Usage** : Appelée côté app pour calculer le score et les cerises gagnées du joueur dans Club Actuel. Utilise la table `question_answers` avec les champs `player_id`, `display_order`, et la jointure avec `players.current_club`.

**Paramètres** :
- `p_user_answers` : JSONB avec les réponses de l'utilisateur (format: `{"player_id": "club_name"}` ou `{"player_name": "club_name"}`)
- `p_time_remaining` : Secondes restantes (pour bonus temps)
- `p_streak_count` : Nombre de bonnes réponses consécutives (calculé côté application en temps réel)

**Retour** :
- `correct_count` : Nombre de bonnes réponses
- `total_players` : Nombre total de joueurs (15)
- `correct_answers` : JSONB avec les détails des bonnes réponses
- `score` : Score (10 points par bonne réponse)
- `cerises_earned` : Cerises totales gagnées (base + streaks + temps)
- `streak_bonus` : Bonus streaks appliqué
- `time_bonus` : Bonus temps appliqué

---

### 3.4.7 Évolutions Base de Données pour CLUB ACTUEL

**Évolutions nécessaires pour le jeu Club Actuel** :

#### 3.4.7.1 Autocomplétion des Clubs

**Problématique** : L'autocomplétion intelligente des clubs nécessite une liste normalisée et dédupliquée des noms de clubs.

**Solutions possibles** :

**Option A : Utiliser la table `clubs` existante** (Recommandé)
- Avantage : Déjà normalisée, contient `name_variations` pour les variantes acceptées
- Inconvénient : La table `clubs` est principalement dédiée à Logo Sniper (logos)
- Solution : Étendre l'utilisation de `clubs` pour inclure tous les clubs référencés dans `players.current_club`
- Migration nécessaire :
  ```sql
  -- S'assurer que tous les clubs de players.current_club existent dans clubs
  INSERT INTO clubs (name, type, country, league)
  SELECT DISTINCT current_club, 'CLUB', NULL, NULL
  FROM players
  WHERE current_club IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM clubs WHERE clubs.name = players.current_club
  );
  
  -- Créer une fonction d'autocomplétion pour les clubs
  CREATE OR REPLACE FUNCTION search_clubs(
    p_search_term TEXT,
    p_limit INTEGER DEFAULT 20
  )
  RETURNS TABLE(
    id UUID,
    name VARCHAR,
    name_variations TEXT[],
    type VARCHAR,
    country VARCHAR,
    league VARCHAR,
    relevance REAL
  ) AS $
  BEGIN
    RETURN QUERY
    SELECT 
      c.id,
      c.name,
      c.name_variations,
      c.type,
      c.country,
      c.league,
      CASE 
        WHEN LOWER(c.name) = LOWER(p_search_term) THEN 1.0
        WHEN LOWER(c.name) LIKE LOWER(p_search_term) || '%' THEN 0.8
        WHEN LOWER(c.name) LIKE '%' || LOWER(p_search_term) || '%' THEN 0.6
        ELSE 0.4
      END as relevance
    FROM clubs c
    WHERE c.is_active = true
    AND (
      LOWER(c.name) LIKE '%' || LOWER(p_search_term) || '%'
      OR EXISTS(
        SELECT 1 FROM unnest(c.name_variations) as v
        WHERE LOWER(v) LIKE '%' || LOWER(p_search_term) || '%'
      )
    )
    ORDER BY relevance DESC, c.name
    LIMIT p_limit;
  END;
  $ LANGUAGE plpgsql;
  ```

**Option B : Créer une vue matérialisée des clubs uniques**
- Créer une vue qui agrège les clubs depuis `players.current_club`
- Avantage : Pas de duplication, toujours à jour
- Inconvénient : Nécessite un refresh périodique, pas de normalisation des variantes
- Solution :
  ```sql
  CREATE MATERIALIZED VIEW clubs_from_players AS
  SELECT DISTINCT
    current_club as name,
    COUNT(*) as player_count
  FROM players
  WHERE current_club IS NOT NULL
  AND is_active = true
  GROUP BY current_club;
  
  CREATE INDEX idx_clubs_from_players_name ON clubs_from_players(name);
  
  -- Refresh périodique (via cron ou trigger)
  REFRESH MATERIALIZED VIEW clubs_from_players;
  ```

**Recommandation** : **Option A** - Utiliser la table `clubs` existante et créer une fonction d'autocomplétion dédiée.

#### 3.4.7.2 Normalisation des Noms de Clubs

**Problématique** : Les noms de clubs peuvent varier dans `players.current_club` (ex: "Real Madrid", "Real Madrid CF", "Real").

**Solution** :
- Utiliser la normalisation côté PostgreSQL dans la fonction de validation (déjà implémentée)
- Créer une fonction utilitaire de normalisation réutilisable :
  ```sql
  CREATE OR REPLACE FUNCTION normalize_club_name(p_name TEXT)
  RETURNS TEXT AS $
  BEGIN
    RETURN LOWER(TRIM(translate(
      p_name,
      'àáâãäåèéêëìíîïòóôõöùúûüýÿ',
      'aaaaaaeeeeiiiioooouuuuyy'
    )));
  END;
  $ LANGUAGE plpgsql IMMUTABLE;
  ```
- Utiliser cette fonction dans `validate_club_actuel_answers()` pour comparer les noms

#### 3.4.7.3 Gestion des Variantes de Noms de Clubs

**Problématique** : Un même club peut être écrit de différentes façons (ex: "PSG", "Paris Saint-Germain", "PSG FC").

**Solution** :
- Utiliser le champ `name_variations` de la table `clubs`
- Lors de la création/mise à jour d'un joueur, vérifier si le club existe dans `clubs` avec ses variantes
- Si le club n'existe pas, créer une entrée dans `clubs` avec les variantes communes
- Dans la fonction de validation, vérifier aussi les variantes :
  ```sql
  -- Dans validate_club_actuel_answers()
  -- Vérifier si le club du joueur correspond à un club dans la table clubs
  -- et utiliser les variantes pour la validation
  SELECT c.name, c.name_variations
  FROM clubs c
  WHERE c.name = v_answer.current_club
  OR v_answer.current_club = ANY(c.name_variations);
  ```

#### 3.4.7.4 Index pour Performance

**Index à créer** pour optimiser les requêtes :
```sql
-- Index sur players.current_club pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_players_current_club 
ON players(current_club) 
WHERE current_club IS NOT NULL AND is_active = true;

-- Index sur clubs.name pour autocomplétion
CREATE INDEX IF NOT EXISTS idx_clubs_name_search 
ON clubs USING gin(to_tsvector('french', name || ' ' || array_to_string(name_variations, ' ')))
WHERE is_active = true;
```

#### 3.4.7.5 Traçabilité des Transferts (Optionnel - Future)

**Idée** : Pour suivre l'actualité des transferts, on pourrait ajouter une table `player_transfers` :
```sql
CREATE TABLE player_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  from_club VARCHAR(200),
  to_club VARCHAR(200) NOT NULL,
  transfer_date DATE NOT NULL,
  transfer_type VARCHAR(20) CHECK (transfer_type IN ('LOAN', 'PERMANENT', 'FREE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_player_transfers_player ON player_transfers(player_id);
CREATE INDEX idx_player_transfers_date ON player_transfers(transfer_date DESC);
```

Cette table permettrait de :
- Filtrer les questions "Transferts récents" (derniers 6 mois)
- Afficher l'historique des transferts d'un joueur
- Créer des questions thématiques basées sur les transferts récents

**Note** : Cette évolution est optionnelle et peut être ajoutée dans une version future.

#### 3.4.7.6 Scripts SQL de Migration

**Fichiers SQL créés** :
- `sql/migrations/club_actuel_setup.sql` : Script de migration complet avec toutes les fonctions et index
- `sql/test_club_actuel_functions.sql` : Script de tests pour vérifier les fonctions

**Contenu du script de migration** :
1. Fonction `normalize_club_name()` : Normalisation des noms de clubs
2. Fonction `search_clubs()` : Autocomplétion intelligente des clubs
3. Fonction `validate_club_actuel_answers()` : Validation mise à jour avec streaks et bonus temps
4. Index de performance : `idx_players_current_club`, `idx_clubs_name_trgm`, `idx_clubs_name_variations`
5. Migration des clubs : Insertion automatique des clubs depuis `players.current_club` vers `clubs`
6. Fonction helper : `get_clubs_from_players()` pour l'administration

**Instructions d'utilisation** :
```sql
-- 1. Exécuter le script de migration
\i sql/migrations/club_actuel_setup.sql

-- 2. (Optionnel) Exécuter les tests
\i sql/test_club_actuel_functions.sql
```

**Note importante** : Le script de migration est idempotent (peut être exécuté plusieurs fois sans erreur grâce à `CREATE OR REPLACE` et `IF NOT EXISTS`).

---

### 3.5 Triggers

#### 3.5.1 Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at 
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leagues_updated_at 
  BEFORE UPDATE ON leagues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

#### 3.5.2 Auto-generate Player Slug

```sql
CREATE OR REPLACE FUNCTION generate_player_slug()
RETURNS TRIGGER AS $
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(
      unaccent(NEW.name), 
      '[^a-z0-9]+', 
      '-', 
      'gi'
    ));
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_player_slug
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION generate_player_slug();
```

---

#### 3.5.3 Auto-update Search Vector

```sql
CREATE OR REPLACE FUNCTION players_search_vector_update()
RETURNS TRIGGER AS $
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('french', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.current_club, '')), 'B') ||
    setweight(to_tsvector('french', array_to_string(NEW.name_variations, ' ')), 'C');
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_players_search_vector
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION players_search_vector_update();
```

---

#### 3.5.4 Mise à Jour Automatique des Statuts et Classements des Défis

```sql
CREATE OR REPLACE FUNCTION update_challenge_status_and_rank()
RETURNS TRIGGER AS $$
DECLARE
  v_challenge_id UUID;
  v_total_participants INTEGER;
  v_completed_participants INTEGER;
  v_min_participants INTEGER;
  v_challenge_status VARCHAR(20);
  v_winner_ids TEXT;
BEGIN
  -- Récupérer l'ID du défi
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    v_challenge_id := NEW.challenge_id;
  ELSE
    v_challenge_id := OLD.challenge_id;
  END IF;

  -- Récupérer le nombre minimum de participants requis
  SELECT min_participants INTO v_min_participants
  FROM challenges
  WHERE id = v_challenge_id;

  -- Compter les participants actifs et terminés
  SELECT
    COUNT(cp.id),
    COUNT(CASE WHEN cp.status = 'completed' THEN 1 END)
  INTO
    v_total_participants,
    v_completed_participants
  FROM challenge_participants cp
  WHERE cp.challenge_id = v_challenge_id
  AND cp.status IN ('pending', 'active', 'completed');

  -- Mettre à jour le statut du défi
  IF v_completed_participants >= v_total_participants AND v_total_participants >= v_min_participants THEN
    v_challenge_status := 'completed';
  ELSIF v_completed_participants > 0 THEN
    v_challenge_status := 'in_progress';
  ELSE
    v_challenge_status := 'pending';
  END IF;

  -- Calculer les classements
  WITH ranked_participants AS (
    SELECT
      cp.user_id,
      cp.score,
      RANK() OVER (ORDER BY cp.score DESC, cp.time_taken ASC) as calculated_rank
    FROM challenge_participants cp
    WHERE cp.challenge_id = v_challenge_id
    AND cp.status = 'completed'
  )
  UPDATE challenge_participants cp_update
  SET rank = rp.calculated_rank
  FROM ranked_participants rp
  WHERE cp_update.challenge_id = v_challenge_id 
  AND cp_update.user_id = rp.user_id;

  -- Déterminer les gagnants (peut être plusieurs en cas d'égalité)
  SELECT string_agg(user_id::text, ',')
  INTO v_winner_ids
  FROM challenge_participants
  WHERE challenge_id = v_challenge_id AND rank = 1;

  -- Mettre à jour la table challenges
  UPDATE challenges
  SET
    status = v_challenge_status,
    completed_at = CASE WHEN v_challenge_status = 'completed' AND completed_at IS NULL THEN NOW() ELSE completed_at END,
    winner_ids = v_winner_ids
  WHERE id = v_challenge_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_challenge_status_and_rank
AFTER INSERT OR UPDATE ON challenge_participants
FOR EACH ROW EXECUTE FUNCTION update_challenge_status_and_rank();
```

**Fonctionnalités** :
- Déclenchement automatique à chaque insertion/mise à jour dans `challenge_participants`
- Calcul du statut du défi selon le nombre de participants ayant terminé (`pending` → `in_progress` → `completed`)
- Calcul automatique du classement basé sur le score (DESC) puis le temps (ASC) en cas d'égalité
- Identification des gagnants (peut être plusieurs en cas d'égalité au 1er rang)
- Mise à jour automatique de `completed_at` et `winner_ids` dans la table `challenges`

---

## 4. Fonctionnalités Admin

### 4.1 Interface de Gestion des Joueurs

**Écran** : `AdminPlayersScreen`

**Fonctionnalités** :
- **Liste des joueurs** avec filtres (nom, club, nationalité, statut)
- **Ajout de joueur** : Formulaire simple (nom, club, position, nationalité)
- **Modification** : Édition des informations joueur
- **Archivage** : Désactiver un joueur (is_active = false)
- **Vérification** : Marquer un joueur comme vérifié (is_verified = true)

**Formulaire Ajout/Modification** :
```
Nom du joueur *
[Kylian Mbappé________________]

Club actuel
[Real Madrid_________________]

Position
[Attaquant ▼] (Attaquant, Milieu, Défenseur, Gardien)

Nationalité
[France ▼] (Liste déroulante pays)

Historique des clubs (JSONB)
[{"club": "PSG", "start_year": 2017, "end_year": 2024}]

[Enregistrer] [Annuler]
```

### 4.2 Interface de Gestion des Questions

**Écran** : `AdminQuestionsScreen`

**Fonctionnalités** :
- **Liste des questions** par type (TOP10, LOGO_SNIPER, CLUB_ACTUEL, CARRIERE_INFERNALE)
- **Création de question** : Formulaire adapté selon le type
- **Modification** : Édition des questions existantes
- **Archivage** : Archiver une question (is_archived = true)
- **Sélection des joueurs** : Interface pour choisir les joueurs de la question

**Formulaire Création Question** :
```
Type de jeu *
[TOP10 ▼] (TOP10, LOGO_SNIPER, CLUB_ACTUEL, CARRIERE_INFERNALE)

Titre de la question *
[Top 10 des meilleurs buteurs de Ligue 1 2024-2025]

Saison
[2024-2025]

Sélection des joueurs
[Rechercher joueur...]
👤 Kylian Mbappé (Real Madrid) [×]
👤 Wissam Ben Yedder (AS Monaco) [×]
...

[Créer la Question]
```

### 4.3 Interface de Gestion des Réponses aux Questions

**Écran** : `AdminQuestionAnswersScreen`

**Fonctionnalités** :
- **Gestion unifiée** : Interface unique pour gérer les réponses de tous les types de jeux via la table `question_answers`
- **Adaptation selon le type** : L'interface s'adapte selon le `game_type` de la question sélectionnée

**Pour LOGO SNIPER** :
- **Sélection de la question** : Liste déroulante des questions de type LOGO_SNIPER
- **Sélection des clubs** : Interface pour choisir 20 clubs parmi la base `clubs`
- **Ordre d'affichage** : Définir l'ordre de présentation des logos (display_order 1-20)
- **Note** : Les clubs sont gérés séparément dans la section "Gestion des Clubs" (voir ci-dessous)

**Pour TOP10** :
- **Sélection des joueurs** : Interface pour choisir les 10 joueurs dans l'ordre
- **Attribution des rangs** : Position et points automatiques selon le classement

**Pour CLUB ACTUEL** :
- **Sélection des joueurs** : Interface pour choisir les joueurs à deviner
- **Ordre d'affichage** : Définir l'ordre de présentation des joueurs

**Interface unifiée** :
```
Question: [Clubs européens mythiques ▼] (LOGO_SNIPER)

Type: LOGO SNIPER

┌─────────────────────────────────────────────┐
│  Logo: [IMAGE] Real Madrid                  │
│  Réponse: [Real Madrid________]             │
│  Noms alternatifs: [Real Madrid CF, Real]   │
│  Ordre: [1]                                  │
│  [Modifier] [Supprimer]                     │
└─────────────────────────────────────────────┘

[Ajouter une réponse] [Enregistrer]
```

**Flux d'ajout de réponse (LOGO SNIPER)** :
1. Clic sur "Ajouter un club"
2. Recherche/autocomplétion parmi les clubs de la base `clubs`
3. Sélection du club (qui contient déjà logo_url, name, name_variations)
4. Définition de l'ordre d'affichage (display_order)
5. Validation et ajout dans `question_answers` avec `club_id` et `display_order`
6. Répéter jusqu'à atteindre 20 clubs

### 4.4 Interface de Gestion des Clubs (Base de Référence Logo Sniper)

**Écran** : `AdminClubsScreen`

**Fonctionnalités** :
- **Gestion centralisée** : Interface pour gérer tous les clubs et sélections nationales
- **Création/Modification** : Ajouter, modifier, archiver des clubs
- **Upload de logos** : Téléchargement des images de logos vers Supabase Storage
- **Noms alternatifs** : Gestion des variantes acceptées pour chaque club
- **Filtres** : Par type (CLUB / NATIONAL_TEAM), pays, ligue
- **Recherche** : Recherche rapide par nom

**Interface** :
```
┌──────────────────────────────────────┐
│  🏆 Gestion des Clubs                │
│                                      │
│  Type: [Tous ▼] | Pays: [Tous ▼]    │
│  Recherche: [________________]      │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  [LOGO] Real Madrid              │ │
│  │  Type: CLUB | Pays: ESP          │ │
│  │  Ligue: La Liga                  │ │
│  │  Variantes: Real Madrid CF, Real │ │
│  │  [Modifier] [Archiver]          │ │
│  └─────────────────────────────────┘ │
│                                      │
│  [Créer un club] [Import CSV]        │
└──────────────────────────────────────┘
```

**Flux de création d'un club** :
1. Clic sur "Créer un club"
2. Upload de l'image du logo (obligatoire)
3. Saisie du nom principal (obligatoire, unique)
4. Sélection du type (CLUB ou NATIONAL_TEAM)
5. Ajout du pays et de la ligue (si club)
6. Ajout des noms alternatifs (optionnel)
7. Validation et insertion dans `clubs`

**Flux de modification** :
1. Clic sur "Modifier" d'un club
2. Modification possible : nom, logo, variantes, pays, ligue
3. Sauvegarde des changements

---

### 4.5 Interface de Gestion des Jeux

**Écran** : `AdminGamesScreen`

**Fonctionnalités** :
- **Liste des jeux** : TOP10, LOGO_SNIPER, CLUB_ACTUEL, CARRIERE_INFERNALE avec statut
- **Création de jeu** : Formulaire pour nouveau jeu
- **Modification** : Édition des jeux existants
- **Suppression** : Suppression avec confirmation
- **Activation/Désactivation** : Basculement statut actif

**Interface Liste** :
```
┌──────────────────────────────────────┐
│  🎮 Gestion des Jeux                 │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  TOP 10                         │ │
│  │  Statut: ✅ Actif               │ │
│  │  Prix: 50 cerises               │ │
│  │  [Modifier] [Supprimer]         │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  LOGO SNIPER                    │ │
│  │  Statut: 🔜 En développement     │ │
│  │  Prix: [À définir] cerises       │ │
│  │  [Modifier] [Supprimer]         │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  CLUB ACTUEL                    │ │
│  │  Statut: 🔜 En développement     │ │
│  │  Prix: [À définir] cerises       │ │
│  │  [Modifier] [Supprimer]         │ │
│  └─────────────────────────────────┘ │
│                                      │
│  [Créer un nouveau jeu]             │
└──────────────────────────────────────┘
```

**Formulaire Création/Modification** :
```
Nom du jeu *
[TOP 10________________]

Description
[Trouve les 10 meilleurs buteurs de Ligue 1]

Prix en cerises *
[50]

Statut
[✅ Actif] [❌ Inactif]

[Enregistrer] [Annuler]
```

### 4.6 Interface de Gestion des Joueurs (Détaillée)

**Écran** : `AdminPlayersScreen`

**Fonctionnalités avancées** :
- **Recherche avancée** : Filtres multiples (nom, club, nationalité, position)
- **Tri** : Par nom, club, nationalité, date de création
- **Pagination** : Gestion des grandes listes
- **Import/Export** : CSV pour import en masse
- **Statistiques** : Nombre de joueurs par club/nationalité

**Interface Liste Avancée** :
```
┌──────────────────────────────────────┐
│  👥 Gestion des Joueurs (247)       │
│                                      │
│  [Rechercher...] [Filtrer] [Importer]│
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Kylian Mbappé                  │ │
│  │  Real Madrid • Attaquant • 🇫🇷   │ │
│  │  ✅ Vérifié • [Modifier] [Suppr]│ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Wissam Ben Yedder               │ │
│  │  AS Monaco • Attaquant • 🇫🇷     │ │
│  │  ❌ Non vérifié • [Modifier] [Suppr]│ │
│  └─────────────────────────────────┘ │
│                                      │
│  [Ajouter un joueur] [Export CSV]    │
└──────────────────────────────────────┘
```

**Filtres disponibles** :
- **Club** : Liste déroulante avec tous les clubs
- **Nationalité** : Liste déroulante avec tous les pays
- **Position** : Attaquant, Milieu, Défenseur, Gardien
- **Statut** : Vérifié, Non vérifié, Actif, Inactif
- **Date** : Créés récemment, Anciens

### 4.6 Interface de Gestion des Questions (Détaillée)

**Écran** : `AdminQuestionsScreen`

**Fonctionnalités avancées** :
- **Recherche** : Par titre, type, saison
- **Filtres** : Type de jeu, saison, statut
- **Statistiques** : Nombre d'utilisations, popularité
- **Duplication** : Créer une question similaire
- **Archivage en masse** : Sélection multiple

**Interface Liste Avancée** :
```
┌──────────────────────────────────────┐
│  ❓ Gestion des Questions (156)      │
│                                      │
│  [Rechercher...] [Filtrer] [Archiver]│
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  TOP 10 • 2024-2025              │ │
│  │  Top 10 des meilleurs buteurs... │ │
│  │  ✅ Actif • 23 utilisations      │ │
│  │  [Modifier] [Dupliquer] [Archiver]│ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  LOGO_SNIPER • 2024-2025        │ │
│  │  Clubs européens mythiques      │ │
│  │  🔜 En développement            │ │
│  │  [Modifier] [Dupliquer] [Archiver]│ │
│  └─────────────────────────────────┘ │
│                                      │
│  [Créer une question] [Import CSV]   │
└──────────────────────────────────────┘
```

### 4.7 Interface de Gestion des Réponses aux Questions (Détaillée)

**Écran** : `AdminQuestionAnswersScreen`

**Fonctionnalités avancées** :
- **Gestion unifiée** : Interface unique pour tous les types de jeux via `question_answers`
- **Adaptation contextuelle** : L'interface change selon le type de question sélectionné
- **Bibliothèque de réponses** : Base de données centralisée avec recherche et organisation
- **Validation** : Vérification de la cohérence des réponses selon le type de jeu
- **Export** : Export des réponses en format structuré (CSV, JSON)
- **Statistiques** : Taux de réussite par réponse, difficulté perçue

**Interface Avancée pour LOGO SNIPER** :
```
┌──────────────────────────────────────┐
│  🎯 Gestion des Réponses              │
│                                      │
│  Question: [Clubs européens mythiques ▼]│
│  Type: LOGO_SNIPER                   │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  [LOGO] Real Madrid              │ │
│  │  Réponse principale: Real Madrid  │ │
│  │  Réponses valides:               │ │
│  │  - Real Madrid                   │ │
│  │  - Real Madrid CF                │ │
│  │  - Real                           │ │
│  │  Ordre: 1                         │ │
│  │  [Modifier] [Supprimer]         │ │
│  └─────────────────────────────────┘ │
│                                      │
│  [Ajouter réponse] [Valider] [Export]│
└──────────────────────────────────────┘
```

**Interface Avancée pour TOP10** :
```
┌──────────────────────────────────────┐
│  🎯 Gestion des Réponses              │
│                                      │
│  Question: [Top 10 buteurs L1 24-25 ▼]│
│  Type: TOP10                        │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  Rang 1: Kylian Mbappé          │ │
│  │  Points: 100                     │ │
│  │  [Modifier] [Supprimer]         │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  Rang 2: Wissam Ben Yedder      │ │
│  │  Points: 90                      │ │
│  │  [Modifier] [Supprimer]         │ │
│  └─────────────────────────────────┘ │
│                                      │
│  [Ajouter joueur] [Valider] [Export] │
└──────────────────────────────────────┘
```

**Flux d'ajout de réponse (selon type)** :

**LOGO SNIPER** :
1. **Sélection question** : Choisir une question de type LOGO_SNIPER (ou créer une nouvelle question)
2. **Recherche club** : Autocomplétion pour trouver un club dans la base `clubs`
3. **Sélection club** : Choisir parmi les clubs existants (logo, nom, variantes déjà définis)
4. **Ordre d'affichage** : Définir `display_order` (1-20)
5. **Ajout** : Insertion dans `question_answers` avec `club_id` et `display_order`
6. **Répéter** : Jusqu'à 20 clubs sélectionnés

**TOP10** :
1. **Sélection question** : Choisir une question de type TOP10
2. **Recherche joueur** : Autocomplétion pour trouver le joueur
3. **Attribution rang** : Définir `ranking` (1-10)
4. **Calcul points** : Points automatiques selon le rang dans `points`
5. **Ajout** : Insertion dans `question_answers` avec `player_id`, `ranking`, `points`

**CLUB ACTUEL** :
1. **Sélection question** : Choisir une question de type CLUB_ACTUEL
2. **Recherche joueur** : Autocomplétion pour trouver le joueur
3. **Ordre d'affichage** : Définir `display_order`
4. **Ajout** : Insertion dans `question_answers` avec `player_id`, `display_order`

---

## 5. Fonctionnalités Utilisateur

### 4.1 Authentification

#### 4.1.1 Inscription

**Écran** : `RegisterScreen`

**Champs** :
- Email (requis, unique, validation format)
- Pseudo (requis, unique, 3-50 caractères)
- Mot de passe (requis, min 8 caractères)
- Pays (optionnel, liste déroulante)

**Flux** :
1. Utilisateur remplit formulaire
2. Validation côté client (React Hook Form + Zod)
3. Appel `supabase.auth.signUp()`
4. Envoi email de confirmation
5. Création automatique entrée dans `users` table
6. Redirection vers écran de confirmation

**Validation Zod** :
```typescript
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  pseudo: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8, 'Minimum 8 caractères'),
  country: z.string().length(3).optional()
});
```

---

#### 4.1.2 Connexion

**Écran** : `LoginScreen`

**Champs** :
- Email
- Mot de passe

**Flux** :
1. Saisie email/mot de passe
2. Appel `supabase.auth.signInWithPassword()`
3. Récupération session
4. Chargement données user depuis `users` table
5. Stockage session dans state global (Zustand)
6. Redirection vers `HomeScreen`

**Sécurité** :
- Maximum 5 tentatives ratées → blocage temporaire 15 min
- Session valide 7 jours (refresh token)

---

#### 4.1.3 Réinitialisation Mot de Passe

**Écran** : `ForgotPasswordScreen`

**Flux** :
1. Utilisateur saisit email
2. Appel `supabase.auth.resetPasswordForEmail()`
3. Email envoyé avec lien de reset
4. Clic sur lien → redirection vers app
5. Formulaire nouveau mot de passe
6. Mise à jour via `supabase.auth.updateUser()`

---

### 4.2 Profil Utilisateur

#### 4.2.1 Affichage Profil

**Écran** : `ProfileScreen`

**Sections** :

**A. En-tête**
- Photo de profil (avatar)
- Pseudo
- Pays (drapeau)
- Bouton éditer (icône crayon)

**B. Statistiques**
```
🍒 Cerises : 237
🏆 Score Global : 8,450
📊 Rang Mondial : #187
```

**C. Statistiques Détaillées**
- Parties jouées (total)
  - Solo : 45
  - Défi : 12
  - Ligues : 23
- Victoires : 15
- Taux de victoire : 34%
- Meilleur score :
  - TOP10 : 90/100
  - LOGO SNIPER : [À venir]
  - CLUB ACTUEL : [À venir]
  - CARRIÈRE INFERNALE : [À venir]

**API Call** :
```typescript
// Récupérer user
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

// Récupérer stats
const { data: stats } = await supabase
  .from('challenge_participants')
  .select('score, completed_at, time_taken, rank, challenges(game_type, status)')
  .eq('user_id', userId)
  .eq('status', 'completed');
```

---

#### 4.2.2 Édition Profil

**Écran** : `EditProfileScreen`

**Champs éditables** :
- Photo de profil (upload ou sélection avatars prédéfinis)
- Pseudo
- Pays

**Flux** :
1. Clic bouton éditer sur `ProfileScreen`
2. Navigation vers `EditProfileScreen`
3. Modification des champs
4. Validation :
   - Pseudo unique (vérification en temps réel)
   - Image max 2MB
5. Clic "Enregistrer"
6. Upload image vers Supabase Storage (si changée)
7. Mise à jour `users` table
8. Retour vers `ProfileScreen`

**Upload Avatar** :
```typescript
const uploadAvatar = async (file: File) => {
  const fileName = `${userId}_${Date.now()}.jpg`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  await supabase
    .from('users')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', userId);
};
```

---

### 4.3 Menu Principal (Home)

**Écran** : `HomeScreen`

**Layout** :

**A. Header (Ruban supérieur)**
- Compteur cerises (gauche)
- Logo CLAFOOTIX (centre)
- Icône profil (droite)

**B. Grille de Jeux**
```
┌──────────────┬──────────────┐
│   TOP 10     │ LOGO SNIPER  │
├──────────────┼──────────────┤
│ CLUB ACTUEL  │ CARRIÈRE     │
│              │ INFERNALE    │
└──────────────┴──────────────┘
```

*Note : Seul TOP 10 est actif actuellement. Les autres jeux sont en développement.*

**C. Bouton Flottant (Ballon)**
- Position : Bas centre
- Au clic : Overlay avec 4 options
  - ⚙️ Réglages
  - 📊 Stats
  - 🛒 Shop
  - 🎮 Acheter des jeux

**Navigation** :
- Clic TOP10 → `GameSelectionScreen` (game_type='TOP10')
- Clic LOGO SNIPER → `GameSelectionScreen` (game_type='LOGO_SNIPER') *[En développement]*
- Clic CLUB ACTUEL → `GameSelectionScreen` (game_type='CLUB_ACTUEL') *[En développement]*
- Clic CARRIÈRE INFERNALE → `GameSelectionScreen` (game_type='CARRIERE_INFERNALE') *[En développement]*
- Clic Profil → `ProfileScreen`
- Clic "Acheter des jeux" → `BuyGamesScreen`

---

### 4.4 Sélection Mode de Jeu

**Écran** : `GameSelectionScreen`

**Props** : `game_type` ('TOP10', 'GRILLE', 'CLUB')

**Layout** :

**A. Règles du Jeu** (encadré rouge)
```
REGLES DU JEU

[Description selon game_type]

⏱️ 60 secondes
```

**B. Sélection Mode**
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   👤     │  │  👥👥   │  │  🏆     │
│   SOLO   │  │   DÉFI   │  │  LIGUE  │
└──────────┘  └──────────┘  └──────────┘
```

**Descriptions** :
- **TOP10** : "Trouve les 10 meilleurs buteurs de Ligue 1"
- **LOGO SNIPER** : "Identifie rapidement les logos de clubs et sélections apparaissant successivement"
- **CLUB ACTUEL** : "Devine le club actuel des joueurs présentés"
- **CARRIÈRE INFERNALE** : [Description à venir]

**Flux** :

**Mode SOLO** :
1. Clic "SOLO"
2. Création partie immédiate
3. Navigation vers `GamePlayScreen`

**Mode DÉFI** :
1. Clic "DÉFI"
2. Navigation vers l'écran de sélection des amis
3. Sélection amis (2 à N)
4. Sélection de la question
5. Création du défi et envoi invitations
6. Les participants jouent la question imposée par le créateur
7. Classement automatique à la fin

**Mode LIGUE** :
1. Clic "LIGUE"
2. Navigation vers `LeagueListScreen`
3. Sélection ligue existante ou création nouvelle
4. Participation aux parties de la ligue

---

### 4.5 Écran de Jeu

**Écran** : `GamePlayScreen`

**Props** : 
- Mode Solo : `question_id` (optionnel, question aléatoire si non fourni)
- Mode Défi : `challenge_id` (requis, la question est imposée par le créateur)

#### 4.5.1 Layout Commun (tous jeux)

**Header** :
- Timer (compte à rebours 60s)
- Score actuel

**Footer** :
- Bouton "Abandonner" (confirmation requise)

---

#### 4.5.2 TOP10 - Interface

**Zone centrale** :
```
Question: Top 10 des meilleurs buteurs de Ligue 1 2024-2025

┌─────────────────────────────────────┐
│  1. [Kylian Mbappé_____________] ✓  │
│  2. [______________________]        │
│  3. [______________________]        │
│  4. [______________________]        │
│  5. [______________________]        │
│  6. [______________________]        │
│  7. [______________________]        │
│  8. [______________________]        │
│  9. [______________________]        │
│ 10. [______________________]        │
└─────────────────────────────────────┘

Score: 1/10
```

**Fonctionnalités** :
- Autocomplétion sur chaque champ (appel `search_players()`)
- Validation immédiate (icône ✓ ou ✗)
- Pas de ré-saisie même joueur (disabled après validation)

**Fin de partie** :
- Timer à 0 OU 10 joueurs trouvés
- Appel `validate_top10_answer()` avec la question_id
- La fonction utilise `question_answers` pour récupérer les joueurs avec leur `ranking` et `points`
- Calcul score final basé sur les points des réponses correctes
- Navigation vers `GameResultsScreen`

**Stockage des données** :
- Les 10 joueurs et leur classement sont stockés dans la table `question_answers`
- Chaque joueur = 1 enregistrement avec `player_id`, `ranking` (1-10), `points` (100, 90, 80...)

**Fonctionnalités spécifiques au Mode Défi** :
- La question est **imposée** par le créateur du défi
- Le sélecteur de question est **désactivé** pour les participants invités
- Affichage d'un message "Défi imposé" pour indiquer que la question ne peut pas être changée
- Tous les participants jouent la même question choisie par le créateur
- Le score et le temps sont enregistrés automatiquement à la fin
- Le classement est mis à jour automatiquement (via trigger PostgreSQL)

---

#### 4.5.3 LOGO SNIPER - Interface

**Zone centrale** :
```
┌─────────────────────────────────────┐
│                                     │
│         [LOGO DU CLUB]              │
│         (effet zoom + flash)         │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [Nom du club/sélection________]    │
│  (autocomplétion active)            │
└─────────────────────────────────────┘

Barre de progression: [████████░░] 15/20
Chronomètre: ⏱️ 45s restantes
```

**Fonctionnalités** :
- Logo apparaît successivement au centre de l'écran
- Effet "sniper" : zoom rapide sur le logo, curseur rouge pulsant
- Champ de saisie avec autocomplétion pour nom du club/sélection
- Validation instantanée à chaque réponse
- **Bonne réponse** : halo doré → passage automatique au logo suivant après 500ms
- **Mauvaise réponse** : flash rouge + écran tremble → passage automatique au logo suivant après 1000ms (pas de possibilité de réessayer)
- Effet de flash entre chaque logo

**Ambiance visuelle** :
- Fond bleu électrique
- Flash lumineux à chaque logo
- Effet "sniper" : zoom rapide, curseur rouge pulsant
- Chrono visible façon viseur digital

**Système de points & Feedback** :
- **Barème des cerises** :
  - 20 logos = 150 cerises de base
  - Mauvaise réponse = -10 cerises
  
- **Bonus streaks** :
  - 5 logos consécutifs → +10 cerises
  - 10 logos consécutifs → +10 cerises
  - 15 logos consécutifs → +15 cerises
  - 20 logos consécutifs → +15 cerises
  - **Maximum : 200 cerises** (150 base + 50 bonus)
  
- **Bonus temps** :
  - +1 cerise par seconde restante

**Feedback visuel** :
- **Bonne réponse** : halo doré autour du logo
- **Mauvaise réponse** : flash rouge + écran qui tremble
- **Série parfaite** : effet "slow motion" + explosion de cerises

**Feedback sonore** :
- **Bonne réponse** : clic sec + "pling" métallique
- **Mauvaise réponse** : son d'erreur digital
- **Série parfaite** : jingle Clafootix + applaudissements massifs

**Messages finaux** :
- **20/20** : "Sniper d'élite ! T'as visé juste à chaque tir ! 🎯🍒"
- **15-19** : "Belle précision, encore un tir et c'était parfait !"
- **10-14** : "Bon tir, mais t'as touché les montants plus que les filets."
- **0-9** : "T'as tiré dans les tribunes tout le match…"

**Effets finaux** :
- **Score parfait (20/20)** : explosion dorée + ralenti du dernier logo + fanfare Clafootix + cri du speaker "Bingo parfait !"
- **Score intermédiaire (10-19)** : effets lumineux rapides + applaudissements rythmés
- **Faible score (0-9)** : fond sombre, flashs désynchronisés + sifflets et rires du public

**Thématiques disponibles** :
- "Clubs européens mythiques"
- "Coupes du monde et sélections nationales"
- "Logos rétro 80s–2000s"

**Stockage des données** :
- Les clubs (logos et noms) sont stockés dans la table `clubs` (base de référence)
- Les questions Logo Sniper référencent 20 clubs via `question_answers.club_id`
- Chaque réponse Logo Sniper = 1 enregistrement dans `question_answers` avec `club_id` et `display_order`
- L'ordre d'affichage est géré par `display_order`
- Avantage : Un même club peut être réutilisé dans plusieurs questions, pas de duplication

**Fin de partie** :
- Timer à 0 OU 20 logos identifiés
- Appel `validate_logo_sniper_answer()` avec la question_id
- La fonction utilise `question_answers` pour récupérer les logos et valider les réponses
- Calcul score final avec bonus (streaks, temps)
- Navigation vers `GameResultsScreen`

---

#### 4.5.4 CLUB ACTUEL - Interface

**Thématique** :

**Concept** :
- Jeu d'actualité et de culture foot.
- L'utilisateur voit l'identité d'un joueur (photo + nom OU photo seule selon le mode) et doit indiquer le club dans lequel il évolue actuellement.
- Le jeu combine réflexe, mémoire et veille football (transferts, mercato, actualité des championnats).

**Exemples de thèmes** :
- "Top joueurs des 5 grands championnats"
- "Transferts récents"
- "Jeunes pépites en pleine ascension"
- "Retour de légendes dans leurs clubs formateurs"

**Ambiance visuelle** :
- Fond épuré gris-bleu style "journal de transfert".
- Encadré photo type "fiche de joueur FIFA".
- Effets lumineux bleus et dorés sur validation.
- Interface moderne, typographie dynamique, ambiance mercato / newsroom sportive.

**Objectif** :
- **Court terme** : Deviner le club actuel du joueur affiché le plus vite possible.
- **Moyen terme** : Enchaîner les bonnes réponses sans se tromper pour maximiser les streaks.
- **Long terme** : Maintenir une connaissance actualisée du football mondial et devenir "Expert mercato Clafootix".

**Zone centrale** :
```
┌─────────────────────────────────────┐
│                                     │
│    [Photo du joueur]                │
│    (option mode silhouette          │
│     capillaire + visage flouté)     │
│                                     │
└─────────────────────────────────────┘

Kylian Mbappé
(ou photo seule selon mode)

Quel est son club actuel ?

┌─────────────────────────────────────┐
│  [Real Madrid__________________]    │
│  (autocomplétion intelligente)       │
└─────────────────────────────────────┘

           [Valider]

⏱️ 45s restantes
Joueurs devinés: 3/15
[Badge Championnat - optionnel]
```

**Fonctionnalités** :
- **Interface visuelle** :
  - Photo du joueur au centre (avec option mode silhouette capillaire + visage flouté pour difficulté bonus).
  - Barre de saisie avec autocomplétion en bas de l'écran.
  - Chronomètre en haut à droite.
  - Badge "Championnat" facultatif (mode facile) — ex: Premier League logo.
  - Effets type "ticker mercato" qui défilent en fond très léger.

- **Interaction** :
  - L'utilisateur écrit le club → autocomplétion intelligente (clubs par ordre de probabilité).
  - Valide lorsqu'il soumet une réponse correcte.
  - **Bonne réponse** → carte joueur animée, maillot du club apparaît, écusson s'affiche en animation pop.
  - **Mauvaise réponse** → tremblement + bruit court + bannière rouge "Move raté !".

**Système de points & Feedback** :

**Barème des cerises** :
- 15 joueurs à identifier = 150 cerises (10 cerises par bonne réponse).
- **Bonus streaks** (inclus dans les 200 max) :
  - 3 bonnes réponses consécutives → +10 cerises
  - 6 → +10 cerises
  - 9 → +15 cerises
  - 12 → +15 cerises
  - **Total streak possible = +50 cerises**
- **Bonus temps** :
  - +1 cerise par seconde restante sur 60 (en plus, hors 200-point cap).

**Feedback visuel** :
- **Bonne réponse** → carte joueur dorée, écusson du club pop 3D, maillot visible.
- **Mauvaise** → halo rouge, écran shake, petit carton jaune animé au coin.
- **Série parfaite** → pluie de confettis dorés + fond "deadline mercato" qui scintille.

**Feedback sonore** :
- **Bonne réponse** → ding clair + chant court des supporters du club (type générique).
- **Mauvaise** → bip grave + bruit de carton jaune.
- **Série streak** → crescendo de tambours + notes cuivrées.
- **Série parfaite** → hymne Clafootix remix mercato + bruit de flash journaliste.

**Messages finaux** :

**Texte** :
- **Parfait (200+bonus)** : "Directeur sportif en chef ! Tu signes les stars avant tout le monde 🍒💼⚽"
- **Très bon (100–199)** : "Solide ! Tu surveilles bien le mercato, mais t'as laissé filer 2–3 transferts."
- **Moyen (50–99)** : "Tu lis les infos transfert… mais en retard d'une journée."
- **Échec (0–49)** : "T'es perdu au mercato. T'as encore pensé que Ronaldo jouait au Real ? 😭🍒"

**Effet visuel** :
- **Parfait** → animation "tableau des transferts" doré, flash caméras, pluie de confettis.
- **Moyen** → fond vert stable façon feuille match.
- **Échec** → fax qui se bloque, écran grisé façon transfert avorté deadline-day.

**Effet sonore** :
- **Parfait** → public qui chante ton nom + flash caméras + trompettes mercato.
- **Moyen** → applaudissement modéré.
- **Échec** → sifflets, bruit de fax qui se déchire + speaker "Transfert refusé !"

**Détails de validation et scoring** :
- Objectif : deviner le club actuel du joueur.
- Source de vérité : `players.current_club` (table `players`).
- Indices possibles (configurables) : photo, silhouette, nationalité, poste.
- Autocomplétion intelligente : clubs par ordre de probabilité depuis la base de données.
- Scoring : 1 bonne réponse = 10 cerises. Série de 15 joueurs par partie.
- Validation : comparaison normalisée (sans accents, lowercase) entre la réponse utilisateur et `players.current_club`.

**Fin de partie** :
- Timer à 0 OU tous les joueurs présentés (15 joueurs).
- Appel `validate_club_actuel_answers()` avec la question_id, les réponses utilisateur, le temps restant, et le nombre de streaks.
- La fonction utilise `question_answers` pour récupérer les joueurs et valider les réponses.
- Calcul score final avec bonus (streaks, temps) : 10 cerises par bonne réponse + bonus streaks + bonus temps.
- Maximum 200 cerises (hors bonus temps).
- Navigation vers `GameResultsScreen`.

**Stockage des données** :
- Les joueurs à deviner sont stockés dans la table `question_answers`.
- Chaque joueur = 1 enregistrement avec `player_id`, `display_order`.
- La réponse correcte (club actuel) est récupérée depuis `players.current_club`.
- L'autocomplétion des clubs utilise une liste unique de clubs depuis `players.current_club` ou une référence vers la table `clubs`.

---

#### 4.5.5 CARRIÈRE INFERNALE - Interface

*[Description à venir - En attente de spécifications]*

**Zone centrale** :
```
[Interface à définir]
```

**Fonctionnalités** :
- [À compléter]

**Fin de partie** :
- [À compléter]

---

### 4.6 Résultats de Partie

**Écran** : `GameResultsScreen`

**Props** : 
- Mode Solo : `question_id` et score
- Mode Défi : `challenge_id` (affiche le classement complet du défi)

**Layout** :

**A. Score Principal**
```
┌────────────────────────────────┐
│                                │
│       🏆                        │
│                                │
│      SCORE FINAL               │
│        70/100                  │
│                                │
│    🍒 +70 Cerises               │
│                                │
└────────────────────────────────┘
```

**B. Détails (selon mode)**

**Solo** :
- Score obtenu
- Réponses correctes/incorrectes
- Temps écoulé
- Clafoutis gagnés

**Défi/Ligue** :
- Classement de la partie
  1. Marie - 90 pts 🥇
  2. **Toi - 70 pts** 🥈
  3. Paul - 60 pts 🥉
  4. Julie - 50 pts
- Cerises gagnées (selon rang)

**C. Boutons**
- "Rejouer" (nouvelle partie solo immédiate)
- "Acheter des jeux" (redirection vers shop)
- "Retour" (page précédente)
- "Partager" (screenshot + share)

---

### 4.7 Achat de Jeux

#### 4.7.1 Écran d'Achat de Jeux

**Écran** : `BuyGamesScreen`

**Fonctionnalités** :
- **Liste des jeux disponibles** : TOP10, LOGO SNIPER, CLUB ACTUEL, CARRIÈRE INFERNALE
- **Prix en cerises** : Chaque jeu a un coût en cerises
- **Achat immédiat** : Déduction des cerises, déblocage du jeu
- **Confirmation** : Modal de confirmation avant achat
- **Solde** : Affichage du solde de cerises disponible

**Interface** :
```
┌──────────────────────────────────────┐
│  🍒 Mes Cerises : 150                │
│                                      │
│  🎮 Jeux Disponibles                 │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  TOP 10                         │ │
│  │  🍒 50 cerises                  │ │
│  │  [Acheter] [Déjà acheté ✓]      │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  GRILLE 3x3                     │ │
│  │  🍒 75 cerises                  │ │
│  │  [Acheter] [Déjà acheté ✓]      │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  CLUB                           │ │
│  │  🍒 100 cerises                 │ │
│  │  [Acheter] [Déjà acheté ✓]      │ │
│  └─────────────────────────────────┘ │
│                                      │
│  [Retour]                           │
└──────────────────────────────────────┘
```

**Flux d'achat** :
1. Clic "Acheter" sur un jeu
2. Modal de confirmation : "Dépenser X cerises pour débloquer ce jeu ?"
3. Confirmation → Déduction des cerises, déblocage du jeu
4. Retour à la liste avec statut "Déjà acheté ✓"

#### 4.7.2 Système de Navigation

**Fonctionnalités** :
- **Bouton Retour** : Présent sur tous les écrans (sauf Home)
- **Historique** : Navigation vers la page précédente
- **Breadcrumbs** : Indication du chemin (optionnel)
- **Menu contextuel** : Accès rapide aux fonctions principales

**Implémentation** :
- **React Router** : `useNavigate()` avec `navigate(-1)`
- **État global** : Historique des pages visitées
- **Fallback** : Retour vers Home si pas d'historique

---

### 4.8 Ligues

#### 4.8.1 Liste des Ligues

**Écran** : `LeagueListScreen`

**Tabs** :
- Mes Ligues (ligues où je suis membre)
- Invitations (invitations en attente)

**Card Ligue** :
```
┌──────────────────────────────────────┐
│  🏆 Ligue des Champions              │
│  👤 Admin: Paul                      │
│  👥 6 membres                         │
│                                      │
│  📊 Match 3/10                        │
│  ⏰ Prochaine partie: Dans 2 jours   │
│                                      │
│  📈 Ta position: 2ème (650 pts)      │
│                                      │
│  [Voir Détails]                      │
└──────────────────────────────────────┘
```

**Bouton** : "+ Créer une Ligue"

---

#### 4.8.2 Détails d'une Ligue

**Écran** : `LeagueDetailScreen`

**Props** : `league_id`

**Tabs** :
1. Parties
2. Classement
3. Membres

**Tab 1: Parties**
```
Partie 3/10 - TOP10
⏰ Disponible maintenant
Deadline: 23h45 restantes
[Jouer Maintenant]

Partie 2/10 - GRILLE ✓
Terminée il y a 2 jours
Ton score: 70/90
[Voir Résultats]

Partie 1/10 - CLUB ✓
Terminée il y a 9 jours
Ton score: 80/150
[Voir Résultats]
```

**Tab 2: Classement**
```
🥇 1. Marie      890 pts
🥈 2. Toi        650 pts
🥉 3. Paul       620 pts
   4. Julie      580 pts
   5. Marc       540 pts
   6. Sophie     490 pts
```

**Tab 3: Membres**
- Liste des membres
- Statut (actif/inactif)
- Si admin : bouton "Inviter"

---

#### 4.8.3 Création d'une Ligue

**Écran** : `CreateLeagueScreen`

**Formulaire** :
```
Nom de la ligue *
[______________________________]

Nombre de parties *
[10 ▼] (5, 10, 15, 20)

Fréquence des parties *
○ Quotidien (1 partie/jour)
● Hebdomadaire (1 partie/semaine)
○ Mensuel (1 partie/mois)

Inviter des amis
[Rechercher amis...]

👤 Paul        [×]
👤 Marie       [×]
👤 Julie       [×]

         [Créer la Ligue]
```

**Flux** :
1. Remplissage formulaire
2. Sélection amis à inviter
3. Clic "Créer"
4. Création entrée `leagues`
5. Ajout admin dans `league_members`
6. Envoi invitations aux amis sélectionnés
7. Redirection vers `LeagueDetailScreen`

**Génération Automatique des Parties** :
- Supabase Edge Function ou Cron
- Déclenchée selon `match_frequency`
- Création automatique des parties de ligue selon la fréquence configurée
- Ajout de tous les membres actifs comme participants
- Envoi notifications à tous les membres

---

### 4.9 Social

#### 4.9.1 Liste d'Amis

**Écran** : `FriendsScreen`

**Tabs** :
- Amis (friendships.status = 'accepted')
- Demandes reçues (friendships.status = 'pending', friend_id = moi)
- Demandes envoyées (friendships.status = 'pending', user_id = moi)

**Card Ami** :
```
┌──────────────────────────────────┐
│  👤 Paul                         │
│  🏆 Rang: #234                   │
│  📊 Score: 5,420                 │
│                                  │
│  [Inviter à Jouer]d, friend_id)
);

-- Indexes
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);
```

**Règles métier** :
- User A envoie demande à User B → status 'pending'
- User B accepte → status 'accepted'
- Amitié unidirectionnelle en BDD, bidirectionnelle en logique app

---

#### 3.3.12 **invitations** (Invitations)

Invitations à des défis ou ligues.

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  CHECK (sender_id != receiver_id),
  CHECK ((challenge_id IS NOT NULL AND league_id IS NULL) OR (challenge_id IS NULL AND league_id IS NOT NULL))
);

-- Indexes
CREATE INDEX idx_invitations_receiver ON invitations(receiver_id);
CREATE INDEX idx_invitations_sender ON invitations(sender_id);
CREATE INDEX idx_invitations_status ON invitations(status);
```

**Règles métier** :
- Soit `challenge_id`, soit `league_id` (pas les deux)
- Expiration automatique après 7 jours si non répondue

---

#### 3.3.13 **notifications** (Notifications In-App)

Notifications affichées dans l'application.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB,                            -- Données contextuelles
  is_read BOOLEAN DEFAULT false,
  is_push_sent BOOLEAN DEFAULT false,    -- Tracking push mobile
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at);
CREATE INDEX idx_notifications_type ON notifications(type);
```

**Types de notifications** :
- `league_match_start` : Nouvelle partie de ligue disponible
- `league_match_ending` : Partie expire dans 1h
- `match_completed` : Résultats d'une partie
- `invitation_received` : Invitation à partie/ligue
- `invitation_accepted` : Invitation acceptée
- `friendship_request` : Demande d'ami
- `friendship_accepted` : Ami accepté
- `league_completed` : Ligue terminée
- `new_rank` : Nouveau classement atteint

**Exemple de `data` (JSONB)** :
```json
{
  "type": "league_match_start",
  "league_id": "uuid-league",
  "league_name": "Ligue des Champions",
  "challenge_id": "uuid-challenge",
  "game_type": "TOP10",
  "deadline": "2024-10-21T12:00:00Z",
  "action_url": "/challenge/uuid-challenge"
}
```

---

#### 3.3.14 **push_tokens** (Tokens Push Notifications)

Tokens FCM/APNs pour notifications push mobiles.

```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_i