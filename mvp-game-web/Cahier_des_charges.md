# 📋 Cahier des Charges - CLAFOOTIX

**Application Mobile de Jeux de Football**

**Version** : 1.0  
**Date** : Octobre 2025  
**Statut** : Spécifications Techniques Complètes

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

CLAFOOTIX est une application mobile de jeux de football permettant aux utilisateurs de tester leurs connaissances footballistiques à travers 3 types de jeux :

- **TOP 10** : Deviner le top 10 d'un classement (ex: meilleurs buteurs)
- **GRILLE 3×3** : Remplir une grille en trouvant des joueurs selon des critères croisés (ligue + pays)
- **CLUB** : Deviner le club actuel d’un joueur présenté (photo/nom/indice), un joueur à la fois

### 1.2 Modes de Jeu

| Mode | Description | Joueurs | Caractéristiques |
|------|-------------|---------|------------------|
| **Solo** | Partie individuelle | 1 | Immédiat, score personnel |
| **Multijoueur** | Partie asynchrone entre amis | 2-15 | Admin crée, deadline configurable |
| **Ligue** | Tournoi permanent avec parties régulières | Illimité | Admin crée, parties générées automatiquement |

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

- iOS (iPhone, iPad)
- Android (smartphones, tablettes)
- Web (navigateurs modernes)

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
│   │   │   ├── GrilleGame.tsx
│   │   │   └── ClubGame.tsx
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

**Total : 16 tables**

### 3.2 Diagramme ERD Simplifié

```
USERS ────┐
          ├──→ MATCH_PARTICIPANTS ──→ MATCHES ──→ GAME_TYPES
          ├──→ LEAGUE_MEMBERS ──→ LEAGUES        ──→ QUESTIONS ──→ PLAYERS
          ├──→ FRIENDSHIPS                        └──→ GRID_ANSWERS
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
- `cerises_balance` : Monnaie virtuelle, jamais négatif
- `global_score` : Somme de tous les scores (tous modes)
- `global_rank` : Position mondiale, calculé via fonction

---

#### 3.3.2 **game_types** (Types de Jeux)

Référentiel des 3 types de jeux disponibles (données fixes).

```sql
CREATE TABLE game_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,      -- 'TOP10', 'GRILLE', 'CLUB'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_seconds INTEGER DEFAULT 60,   -- Durée de jeu
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Données initiales
INSERT INTO game_types (code, name, description, duration_seconds) VALUES
  ('TOP10', 'Top 10', 'Trouve les 10 éléments d''un classement', 60),
  ('GRILLE', 'Grille 3x3', 'Remplis la grille en trouvant un joueur par case', 60),
  ('CLUB', 'Club', 'Devine le club actuel des joueurs', 60);
```

---

#### 3.3.3 **players** (Joueurs de Football)

Base de données des joueurs pour autocomplétion et référence.

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  current_club VARCHAR(200),
  position VARCHAR(50),                  -- Attaquant, Milieu, Défenseur, Gardien
  nationality VARCHAR(100),
  nationality_code VARCHAR(3),           -- FRA, BRA, ARG...
  club_history JSONB,                    -- Historique clubs
  is_active BOOLEAN DEFAULT true,        -- Actif ou retraité
  is_verified BOOLEAN DEFAULT false,     -- Vérifié par admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_active ON players(is_active) WHERE is_active = true;
CREATE INDEX idx_players_nationality ON players(nationality_code);
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
- Autocomplétion simple : recherche sur `name` à partir de 3 lettres
- `club_history` : Historique des clubs en JSONB pour flexibilité
- `is_verified` : Contrôle qualité par les admins

---

#### 3.3.4 **questions** (Banque de Questions)

Stockage des questions pour les 3 types de jeux.

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_type VARCHAR(20) NOT NULL CHECK (game_type IN ('TOP10', 'GRILLE', 'CLUB')),
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

**GRILLE** (game_type = 'GRILLE') :
- "Grille 3x3 : Ligue 1, Premier League, La Liga / France, Brésil, Argentine"
- "Grille 3x3 : Bundesliga, Serie A, Ligue 1 / Allemagne, Italie, France"

**CLUB** (game_type = 'CLUB') :
- "Devine le club actuel des joueurs (photo)"
- "Devine le club actuel des joueurs (nom + nationalité)"

Le champ `player_ids` contient les UUID des joueurs dans l'ordre pour TOP10, ou la liste complète pour GRILLE/CLUB.

---

#### 3.3.5 **grid_answers** (Réponses Valides GRILLE)

Table séparée pour stocker les réponses valides des grilles 3×3.

```sql
CREATE TABLE grid_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id),
  league VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  player_id UUID NOT NULL REFERENCES players(id),
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,     -- Archivé avec la question
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(question_id, league, country, player_id)
);

-- Indexes
CREATE INDEX idx_grid_answers_question ON grid_answers(question_id);
CREATE INDEX idx_grid_answers_lookup ON grid_answers(question_id, league, country) 
  WHERE is_active = true;
CREATE INDEX idx_grid_answers_archived ON grid_answers(is_archived) WHERE is_archived = true;
```

**Exemple de données** :
| question_id | league | country | player_id |
|-------------|--------|---------|-----------|
| uuid-question-1 | Ligue 1 | France | uuid-mbappe |
| uuid-question-1 | Premier League | France | uuid-kante |
| uuid-question-1 | La Liga | Brésil | uuid-vinicius |

**Règles métier** :
- Une combinaison (question_id, league, country, player_id) est unique
- Validation se fait via `player_id` + recherche simple sur `name` du joueur
- Archivage : Quand une question est archivée, ses réponses le sont aussi

---

#### 3.3.6 **matches** (Parties)

Table des parties jouables (solo, multi, ligue).

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_type_id INTEGER NOT NULL REFERENCES game_types(id),
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('solo', 'multiplayer', 'league')),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  match_number INTEGER,                  -- Numéro partie dans ligue
  admin_id UUID REFERENCES users(id),    -- Créateur (multi/ligue)
  max_players INTEGER DEFAULT 1 CHECK (max_players BETWEEN 1 AND 15),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'expired')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,  -- Deadline
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CHECK (
    (mode = 'solo' AND max_players = 1) OR
    (mode = 'multiplayer' AND max_players BETWEEN 2 AND 15) OR
    (mode = 'league' AND league_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_matches_mode ON matches(mode);
CREATE INDEX idx_matches_league ON matches(league_id) WHERE league_id IS NOT NULL;
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_end_date ON matches(end_date) 
  WHERE status IN ('waiting', 'in_progress');
```

**Règles métier** :
- Mode solo : 1 seul joueur, pas d'admin
- Mode multiplayer : 2-15 joueurs, avec admin, deadline configurable
- Mode league : lié à une ligue, deadline configurable, tous les membres participent

---

#### 3.3.7 **match_participants** (Participants aux Parties)

Lien entre joueurs et parties, stockage des scores.

```sql
CREATE TABLE match_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0 CHECK (score >= 0),
  rank INTEGER,                          -- Position finale (1er, 2e...)
  completed_at TIMESTAMP WITH TIME ZONE,
  cerises_earned INTEGER DEFAULT 0 CHECK (cerises_earned >= 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'playing', 'completed', 'expired')),
  user_responses JSONB,                  -- Optionnel (analytics)
  UNIQUE(match_id, user_id)
);

-- Indexes
CREATE INDEX idx_match_participants_user ON match_participants(user_id);
CREATE INDEX idx_match_participants_match ON match_participants(match_id);
CREATE INDEX idx_match_participants_status ON match_participants(status);
```

**Règles métier** :
- Un user ne peut participer qu'une fois par match
- Score calculé côté app via fonctions de validation
- `rank` calculé après que tous ont terminé ou deadline atteinte
- `user_responses` optionnel pour MVP (utile pour analytics phase 2)

---

#### 3.3.8 **match_questions** (Questions des Parties)

Lien entre parties et questions (1 match = 1 question).

```sql
CREATE TABLE match_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, question_id)
);

-- Indexes
CREATE INDEX idx_match_questions_match ON match_questions(match_id);
CREATE INDEX idx_match_questions_question ON match_questions(question_id);
```

**Règles métier** :
- **1 match = 1 question unique**
- Tous les participants d'un match jouent la même question
- En ligue : tous les membres de la ligue ont la même question pour une partie donnée

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
- Type de jeu : aléatoire (TOP10, GRILLE ou CLUB)

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
  p_user_answers TEXT[]
)
RETURNS TABLE(
  correct_count INTEGER,
  correct_answers TEXT[],
  score INTEGER
) AS $
DECLARE
  v_player_ids UUID[];
  v_correct TEXT[];
  v_user_answer TEXT;
  v_normalized TEXT;
  v_player RECORD;
BEGIN
  SELECT player_ids INTO v_player_ids
  FROM questions
  WHERE id = p_question_id;
  
  v_correct := ARRAY[]::TEXT[];
  
  FOREACH v_user_answer IN ARRAY p_user_answers
  LOOP
    v_normalized := LOWER(TRIM(v_user_answer));
    
    FOR v_player IN 
      SELECT p.id, p.name
      FROM players p
      WHERE p.id = ANY(v_player_ids)
        AND (
          LOWER(p.name) = v_normalized
          OR v_normalized = ANY(
            SELECT LOWER(unnest(p.name_variations))
          )
        )
    LOOP
      v_correct := array_append(v_correct, v_player.name);
      EXIT;
    END LOOP;
  END LOOP;
  
  RETURN QUERY SELECT
    array_length(v_correct, 1),
    v_correct,
    array_length(v_correct, 1) * 10;
END;
$ LANGUAGE plpgsql;
```

**Usage** : Appelée côté app pour calculer le score du joueur.

---

#### 3.4.5 Validation Réponse GRILLE

```sql
CREATE OR REPLACE FUNCTION validate_grid_answer(
  p_question_id UUID,
  p_user_grid JSONB
)
RETURNS TABLE(
  correct_count INTEGER,
  correct_answers JSONB,
  incorrect_answers JSONB,
  score INTEGER
) AS $
DECLARE
  v_content JSONB;
  v_grid_id TEXT;
  v_cell_key TEXT;
  v_user_answer TEXT;
  v_league TEXT;
  v_country TEXT;
  v_is_valid BOOLEAN;
  v_correct JSONB := '{}'::JSONB;
  v_incorrect JSONB := '{}'::JSONB;
  v_correct_count INTEGER := 0;
BEGIN
  SELECT content->>'grid_id' INTO v_grid_id
  FROM questions
  WHERE id = p_question_id;
  
  FOR v_cell_key, v_user_answer IN SELECT * FROM jsonb_each_text(p_user_grid)
  LOOP
    v_league := split_part(v_cell_key, '_', 1);
    v_country := split_part(v_cell_key, '_', 2);
    
    SELECT EXISTS(
      SELECT 1 
      FROM grid_answers ga
      JOIN players p ON ga.player_id = p.id
      WHERE ga.grid_id = v_grid_id
        AND ga.league = v_league
        AND ga.country = v_country
        AND (
          LOWER(p.name) = LOWER(TRIM(v_user_answer))
          OR LOWER(TRIM(v_user_answer)) = ANY(
            SELECT LOWER(unnest(p.name_variations))
          )
        )
    ) INTO v_is_valid;
    
    IF v_is_valid THEN
      v_correct := v_correct || jsonb_build_object(v_cell_key, v_user_answer);
      v_correct_count := v_correct_count + 1;
    ELSE
      v_incorrect := v_incorrect || jsonb_build_object(v_cell_key, v_user_answer);
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT
    v_correct_count,
    v_correct,
    v_incorrect,
    v_correct_count * 10;
END;
$ LANGUAGE plpgsql;
```

---

#### 3.4.6 Validation Réponse CLUB

```sql
CREATE OR REPLACE FUNCTION validate_club_answers(
  p_question_id UUID,
  p_user_answers JSONB
)
RETURNS TABLE(
  correct_count INTEGER,
  total_players INTEGER,
  correct_answers JSONB,
  score INTEGER
) AS $
DECLARE
  v_player_ids UUID[];
  v_player RECORD;
  v_user_club TEXT;
  v_is_correct BOOLEAN;
  v_correct JSONB := '{}'::JSONB;
  v_correct_count INTEGER := 0;
  v_total INTEGER;
BEGIN
  SELECT player_ids INTO v_player_ids
  FROM questions
  WHERE id = p_question_id;
  
  v_total := array_length(v_player_ids, 1);
  
  FOR v_player IN 
    SELECT p.id, p.name, p.current_club
    FROM players p
    WHERE p.id = ANY(v_player_ids)
  LOOP
    v_user_club := p_user_answers->>v_player.name;
    
    IF v_user_club IS NOT NULL THEN
      v_is_correct := LOWER(TRIM(v_user_club)) = LOWER(v_player.current_club);
      
      IF v_is_correct THEN
        v_correct := v_correct || jsonb_build_object(
          v_player.name, 
          jsonb_build_object(
            'user_answer', v_user_club,
            'correct_club', v_player.current_club
          )
        );
        v_correct_count := v_correct_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT
    v_correct_count,
    v_total,
    v_correct,
    v_correct_count * 10;
END;
$ LANGUAGE plpgsql;
```

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
- **Liste des questions** par type (TOP10, GRILLE, CLUB)
- **Création de question** : Formulaire adapté selon le type
- **Modification** : Édition des questions existantes
- **Archivage** : Archiver une question (is_archived = true)
- **Sélection des joueurs** : Interface pour choisir les joueurs de la question

**Formulaire Création Question** :
```
Type de jeu *
[TOP10 ▼] (TOP10, GRILLE, CLUB)

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

### 4.3 Interface de Gestion des Réponses GRILLE

**Écran** : `AdminGridAnswersScreen`

**Fonctionnalités** :
- **Sélection de la question GRILLE** : Liste déroulante
- **Grille interactive** : Interface 3x3 pour définir les réponses valides
- **Ajout de réponse** : Par case (ligue + pays + joueur)
- **Modification** : Changer les réponses valides
- **Archivage** : Archiver avec la question

**Interface Grille** :
```
Question: Grille 3x3 : Ligue 1, Premier League, La Liga / France, Brésil, Argentine

          Ligue 1   Premier League   La Liga
France    [Kylian Mbappé] [N'Golo Kanté] [_____]
Brésil    [_____]         [_____]       [Vinícius Júnior]
Argentine [_____]         [_____]       [_____]

[Enregistrer les Réponses]
```

**Flux d'ajout de réponse** :
1. Clic sur une case vide
2. Recherche de joueur (autocomplétion)
3. Sélection du joueur
4. Validation et ajout à la case

### 4.4 Interface de Gestion des Jeux

**Écran** : `AdminGamesScreen`

**Fonctionnalités** :
- **Liste des jeux** : TOP10, GRILLE, CLUB avec statut
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
│  │  GRILLE 3x3                     │ │
│  │  Statut: ❌ Inactif              │ │
│  │  Prix: 75 cerises                │ │
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

### 4.5 Interface de Gestion des Joueurs (Détaillée)

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
│  │  GRILLE • 2024-2025             │ │
│  │  Grille 3x3 : Ligue 1, PL...    │ │
│  │  ❌ Inactif • 5 utilisations     │ │
│  │  [Modifier] [Dupliquer] [Archiver]│ │
│  └─────────────────────────────────┘ │
│                                      │
│  [Créer une question] [Import CSV]   │
└──────────────────────────────────────┘
```

### 4.7 Interface de Gestion des Réponses GRILLE (Détaillée)

**Écran** : `AdminGridAnswersScreen`

**Fonctionnalités avancées** :
- **Sélection question** : Liste déroulante avec filtres
- **Grille interactive** : Interface 3x3 avec drag & drop
- **Réponses multiples** : Plusieurs joueurs par case
- **Validation** : Vérification des réponses valides
- **Export** : Export des réponses en CSV

**Interface Grille Avancée** :
```
┌──────────────────────────────────────┐
│  🎯 Gestion des Réponses GRILLE     │
│                                      │
│  Question: [Grille 3x3 : Ligue 1...]│
│                                      │
│          Ligue 1   Premier League   La Liga
│  France    [Kylian Mbappé] [N'Golo Kanté] [_____]
│           [Wissam Ben Yedder] [_____]    [_____]
│  Brésil    [_____]         [_____]       [Vinícius Júnior]
│  Argentine [_____]         [_____]       [_____]
│                                      │
│  [Ajouter réponse] [Valider] [Export]│
└──────────────────────────────────────┘
```

**Flux d'ajout de réponse avancé** :
1. **Sélection case** : Clic sur case vide ou existante
2. **Recherche joueur** : Autocomplétion avec filtres (club, nationalité)
3. **Sélection** : Choix du joueur
4. **Validation** : Vérification que le joueur correspond aux critères
5. **Ajout** : Ajout à la case avec possibilité de plusieurs joueurs

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
  - Multijoueur : 12
  - Ligues : 23
- Victoires : 15
- Taux de victoire : 34%
- Meilleur score :
  - TOP10 : 90/100
  - GRILLE : 80/90
  - CLUB : 120/150

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
  .from('match_participants')
  .select('score, completed_at, matches(mode, game_type_id)')
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

**B. Grille de Jeux (2×2)**
```
┌──────────────┬──────────────┐
│   TOP 10     │   GRILLE     │
├──────────────┼──────────────┤
│    CLUB      │ COMING SOON  │
└──────────────┴──────────────┘
```

**C. Bouton Flottant (Ballon)**
- Position : Bas centre
- Au clic : Overlay avec 4 options
  - ⚙️ Réglages
  - 📊 Stats
  - 🛒 Shop
  - 🎮 Acheter des jeux

**Navigation** :
- Clic TOP10 → `GameSelectionScreen` (game_type='TOP10')
- Clic GRILLE → `GameSelectionScreen` (game_type='GRILLE')
- Clic CLUB → `GameSelectionScreen` (game_type='CLUB')
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
│   SOLO   │  │MULTIJOUEUR│  │  LIGUE  │
└──────────┘  └──────────┘  └──────────┘
```

**Descriptions** :
- **TOP10** : "Trouve les 10 meilleurs buteurs de Ligue 1"
- **GRILLE** : "Remplis la grille 3×3 en trouvant un joueur par case"
- **CLUB** : "Devine le club actuel des joueurs présentés"

**Flux** :

**Mode SOLO** :
1. Clic "SOLO"
2. Création partie immédiate
3. Navigation vers `GamePlayScreen`

**Mode MULTIJOUEUR** :
1. Clic "MULTIJOUEUR"
2. Navigation vers `CreateMultiplayerScreen`
3. Sélection amis (2-15)
4. Envoi invitations
5. Attente acceptations
6. Partie lancée quand tous ont accepté

**Mode LIGUE** :
1. Clic "LIGUE"
2. Navigation vers `LeagueListScreen`
3. Sélection ligue existante ou création nouvelle
4. Participation aux parties de la ligue

---

### 4.5 Écran de Jeu

**Écran** : `GamePlayScreen`

**Props** : `match_id`

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
- Appel `validate_top10_answer()`
- Calcul score final
- Navigation vers `GameResultsScreen`

---

#### 4.5.3 GRILLE - Interface

**Zone centrale** :
```
Grille 3×3

          Ligue 1   Premier League   La Liga
France    [_____]      [_____]       [_____]
Brésil    [_____]      [_____]       [_____]
Argentine [_____]      [_____]       [_____]

Cases remplies: 3/9
```

**Fonctionnalités** :
- Autocomplétion avec filtres (ligue + pays)
- Validation immédiate par case
- Indication visuelle (vert = correct, rouge = incorrect)

**Fin de partie** :
- Timer à 0 OU 9 cases remplies
- Appel `validate_grid_answer()`
- Navigation vers `GameResultsScreen`

---

#### 4.5.4 CLUB - Interface

**Zone centrale** :
```
[Photo du joueur]

Kylian Mbappé

Quel est son club actuel ?

┌─────────────────────────────────────┐
│  [Real Madrid__________________]    │
└─────────────────────────────────────┘

           [Valider]

Joueurs devinés: 3/15
```

**Fonctionnalités** :
- Saisie libre (pas d'autocomplétion pour augmenter difficulté)
- Clic "Valider" → vérification
- Si correct : joueur suivant automatiquement
- Si incorrect : affichage bonne réponse, puis joueur suivant

**Détails de validation et scoring** :
- Objectif : deviner le club actuel du joueur.
- Source de vérité : `players.current_club` (table `players`).
- Indices possibles (configurables) : photo, silhouette, nationalité, poste. Pas d’autocomplétion pour garder la difficulté.
- Scoring : 1 bonne réponse = 10 points. Série de N joueurs (ex. 15) par partie.
- Variantes (futures) : mode chrono (60s), mode survie (1 erreur = fin), mode parcours (difficulté croissante).

**Fin de partie** :
- Timer à 0 OU tous les joueurs présentés
- Appel `validate_club_answers()`
- Navigation vers `GameResultsScreen`

---

### 4.6 Résultats de Partie

**Écran** : `GameResultsScreen`

**Props** : `match_id`

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

**Multijoueur/Ligue** :
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
- **Liste des jeux disponibles** : TOP10, GRILLE, CLUB
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
- Création `match` avec mode='league'
- Création `match_participants` pour tous les membres actifs
- Envoi notifications à tous

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

Invitations à des parties multijoueurs ou ligues.

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  CHECK (sender_id != receiver_id),
  CHECK ((match_id IS NOT NULL AND league_id IS NULL) OR (match_id IS NULL AND league_id IS NOT NULL))
);

-- Indexes
CREATE INDEX idx_invitations_receiver ON invitations(receiver_id);
CREATE INDEX idx_invitations_sender ON invitations(sender_id);
CREATE INDEX idx_invitations_status ON invitations(status);
```

**Règles métier** :
- Soit `match_id`, soit `league_id` (pas les deux)
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
  "match_id": "uuid-match",
  "game_type": "TOP10",
  "deadline": "2024-10-21T12:00:00Z",
  "action_url": "/matches/uuid-match"
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