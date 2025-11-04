# Migrations pour le jeu "Club Actuel"

Ce dossier contient les scripts SQL nécessaires pour implémenter le jeu "Club Actuel" selon le cahier des charges.

## 📋 Fichiers

- **`check_prerequisites_club_actuel.sql`** : **⚠️ À EXÉCUTER EN PREMIER** - Vérifie que tout est prêt
- **`club_actuel_setup.sql`** : Script de migration principal
- **`../test_club_actuel_functions.sql`** : Script de tests (optionnel, pour vérifier que tout fonctionne)

## 🚀 Installation

### Prérequis

- PostgreSQL 12+ avec l'extension `uuid-ossp` activée
- (Optionnel) Extension `pg_trgm` pour améliorer les performances de recherche (index trigram)
- Tables requises : `players`, `clubs`, `question_answers`

Pour activer les extensions :
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- Optionnel mais recommandé
```

### Étape 0 : Vérifier les prérequis (RECOMMANDÉ)

**⚠️ IMPORTANT** : Exécutez d'abord le script de vérification pour éviter les erreurs :

```bash
# Via psql
psql -U votre_utilisateur -d votre_database -f sql/migrations/check_prerequisites_club_actuel.sql

# Ou depuis psql
\i sql/migrations/check_prerequisites_club_actuel.sql
```

Ce script vérifie :
- ✅ Que les tables nécessaires existent
- ✅ Que les colonnes requises sont présentes
- ✅ Que les extensions sont installées
- ✅ Qu'il y a des données à migrer

### Étape 1 : Exécuter la migration

```bash
# Via psql
psql -U votre_utilisateur -d votre_database -f sql/migrations/club_actuel_setup.sql

# Ou depuis psql
\i sql/migrations/club_actuel_setup.sql
```

**Note sur Supabase** : 
- Sur Supabase, vous pouvez exécuter les scripts via l'interface SQL Editor
- Copiez-collez le contenu du fichier dans l'éditeur SQL
- Cliquez sur "Run" pour exécuter

### Étape 2 : Vérifier les fonctions (optionnel)

```bash
psql -U votre_utilisateur -d votre_database -f sql/test_club_actuel_functions.sql
```

## 📦 Contenu de la migration

### 1. Fonctions créées

#### `normalize_club_name(p_name TEXT)`
Normalise un nom de club (supprime accents, lowercase, trim).
- **Usage** : Utilisée en interne pour la validation des réponses
- **Exemple** : `normalize_club_name('Paris Saint-Germain')` → `'paris saint-germain'`

#### `search_clubs(p_search_term TEXT, p_limit INTEGER DEFAULT 20)`
Recherche et autocomplétion des clubs pour l'interface utilisateur.
- **Usage** : Appelée lors de la saisie dans le champ de recherche
- **Retour** : Liste de clubs triés par pertinence (relevance)
- **Exemple** :
```sql
SELECT * FROM search_clubs('Real', 10);
```

#### `validate_club_actuel_answers(...)`
Valide les réponses du jeu Club Actuel avec calcul des cerises, bonus streaks et temps.
- **Paramètres** :
  - `p_question_id` : ID de la question
  - `p_user_answers` : JSONB avec les réponses utilisateur
  - `p_time_remaining` : Secondes restantes (pour bonus temps)
  - `p_streak_count` : Nombre de bonnes réponses consécutives
- **Retour** : correct_count, total_players, correct_answers, score, cerises_earned, streak_bonus, time_bonus
- **Exemple** :
```sql
SELECT * FROM validate_club_actuel_answers(
  'uuid-question',
  '{"player-uuid": "Real Madrid"}'::jsonb,
  30,  -- 30 secondes restantes
  3    -- 3 bonnes réponses consécutives
);
```

#### `get_clubs_from_players()`
Liste les clubs référencés dans `players.current_club` avec leur nombre de joueurs.
- **Usage** : Utile pour l'administration pour voir quels clubs sont référencés
- **Retour** : club_name, player_count, exists_in_clubs

### 2. Index créés

- **`idx_players_current_club`** : Index sur `players.current_club` pour recherche rapide
- **`idx_clubs_name_trgm`** : Index trigram sur `clubs.name` (si pg_trgm disponible)
- **`idx_clubs_name_search`** : Index simple sur `clubs.name` (si pg_trgm non disponible)
- **`idx_clubs_name_variations`** : Index GIN sur `clubs.name_variations` pour recherche dans les variantes

### 3. Migrations de données

- Insertion automatique des clubs depuis `players.current_club` vers `clubs` (si non existants)
- Les clubs sont créés avec `type = 'CLUB'` et `is_active = true`

## ✅ Vérification

Après l'exécution, vous devriez voir :
```
========================================
MIGRATION CLUB ACTUEL TERMINÉE
========================================
Clubs actifs dans la base: X
Joueurs avec club actuel: Y
========================================
```

## 🔍 Tests

Pour tester les fonctions individuellement :

```sql
-- Test de normalisation
SELECT normalize_club_name('Paris Saint-Germain');
-- Doit retourner: 'paris saint-germain'

-- Test de recherche
SELECT * FROM search_clubs('Real', 5);
-- Doit retourner les clubs contenant "Real"

-- Test de validation (nécessite des données de test)
SELECT * FROM validate_club_actuel_answers(
  'votre-question-id',
  '{"player-id": "Real Madrid"}'::jsonb,
  30,
  3
);
```

## 🔄 Idempotence

Le script est **idempotent** : il peut être exécuté plusieurs fois sans erreur grâce à :
- `CREATE OR REPLACE FUNCTION` : Remplace les fonctions existantes
- `CREATE INDEX IF NOT EXISTS` : Crée les index seulement s'ils n'existent pas
- `ON CONFLICT DO NOTHING` : Ignore les conflits lors de l'insertion

## 📝 Notes importantes

1. **Normalisation** : La fonction `normalize_club_name()` utilise `translate()` pour supprimer les accents. Cette approche est plus simple que `unaccent` mais peut nécessiter des ajustements selon les langues.

2. **Variantes de noms** : Pour que les variantes fonctionnent correctement, assurez-vous que la table `clubs` contient les variantes dans le champ `name_variations`. Exemple :
   ```sql
   UPDATE clubs 
   SET name_variations = ARRAY['PSG', 'Paris Saint-Germain', 'Paris SG']
   WHERE name = 'Paris Saint-Germain';
   ```

3. **Performance** : L'index trigram (`pg_trgm`) améliore significativement les performances de recherche partielle. Si vous ne pouvez pas l'installer, l'index simple sera utilisé.

## 🐛 Dépannage

### Erreur : "null value in column logo_url violates not-null constraint"
- ✅ **Corrigé** : Le script utilise maintenant un placeholder URL pour les clubs créés automatiquement
- Les clubs créés depuis `players.current_club` ont une URL placeholder que vous pouvez remplacer plus tard via l'admin

### Erreur : "duplicate key value violates unique constraint users_pseudo_key"
- Cette erreur ne vient **PAS** du script `club_actuel_setup.sql`
- Elle vient probablement d'un trigger ou d'un autre script qui s'exécute en parallèle
- Solution : Vérifiez les triggers sur `auth.users` et `public.users`
- Le script `club_actuel_setup.sql` ne modifie **jamais** la table `users`

### Erreur : "function normalize_club_name does not exist"
- Vérifiez que le script de migration a été exécuté complètement
- Ré-exécutez le script (il est idempotent)

### Erreur : "extension pg_trgm does not exist"
- C'est normal, l'index simple sera utilisé à la place
- Pour améliorer les performances, installez l'extension :
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  ```

### Recherche trop lente
- Vérifiez que les index ont été créés : `\d+ clubs`
- Installez l'extension `pg_trgm` pour améliorer les performances

## 🧪 Données de Test

Pour créer une question de test avec 15 joueurs, exécutez :

```bash
psql -U votre_utilisateur -d votre_database -f sql/test_data_club_actuel.sql
```

Ce script :
- ✅ Crée ou met à jour 15 joueurs célèbres avec leur club actuel
- ✅ Crée une question "Top joueurs des 5 grands championnats - Test"
- ✅ Associe les 15 joueurs à la question avec un ordre d'affichage
- ✅ Affiche un résumé des données créées

**Note** : Le script utilise `ON CONFLICT` pour éviter les doublons si les joueurs existent déjà.

## 📚 Documentation

Pour plus de détails, consultez :
- **Cahier des charges** : Section 3.4.7 "Évolutions Base de Données pour CLUB ACTUEL"
- **Fonction de validation** : Section 3.4.6 "Validation Réponse CLUB ACTUEL"

