# 🗄️ Instructions de Migration de la Base de Données

## 📋 Objectif
Ajouter les colonnes nécessaires pour afficher les drapeaux des joueurs et le classement par ordre croissant.

## 🔧 Modifications à effectuer

### 1. Table `players` - Ajouter la nationalité

```sql
ALTER TABLE players ADD COLUMN nationality VARCHAR(3);
```

### 2. Table `theme_answers` - Ajouter le classement et les statistiques

```sql
-- Ajouter les colonnes de classement et statistiques
ALTER TABLE theme_answers ADD COLUMN ranking INTEGER;
ALTER TABLE theme_answers ADD COLUMN goals INTEGER;
ALTER TABLE theme_answers ADD COLUMN assists INTEGER;
ALTER TABLE theme_answers ADD COLUMN value DECIMAL(10,2);

-- Créer des index pour de meilleures performances
CREATE INDEX idx_theme_answers_ranking ON theme_answers(theme_id, ranking);
CREATE INDEX idx_players_nationality ON players(nationality);
```

### 3. Mise à jour des données existantes

```sql
-- Assigner des rankings basés sur l'ordre actuel
WITH ranked_answers AS (
  SELECT 
    id,
    theme_id,
    ROW_NUMBER() OVER (PARTITION BY theme_id ORDER BY created_at) as new_ranking
  FROM theme_answers
  WHERE ranking IS NULL
)
UPDATE theme_answers 
SET ranking = ranked_answers.new_ranking
FROM ranked_answers
WHERE theme_answers.id = ranked_answers.id;
```

### 4. Ajouter des nationalités d'exemple

```sql
-- Mettre à jour quelques nationalités d'exemple
UPDATE players SET nationality = 'FRA' WHERE name ILIKE '%mbappé%' OR name ILIKE '%benzema%' OR name ILIKE '%lacazette%';
UPDATE players SET nationality = 'ARG' WHERE name ILIKE '%messi%';
UPDATE players SET nationality = 'BRA' WHERE name ILIKE '%neymar%' OR name ILIKE '%vinicius%';
UPDATE players SET nationality = 'ESP' WHERE name ILIKE '%pedri%' OR name ILIKE '%gavi%';
UPDATE players SET nationality = 'GER' WHERE name ILIKE '%müller%' OR name ILIKE '%kroos%';
UPDATE players SET nationality = 'ENG' WHERE name ILIKE '%kane%' OR name ILIKE '%sterling%';
UPDATE players SET nationality = 'POR' WHERE name ILIKE '%ronaldo%' OR name ILIKE '%bruno%';
UPDATE players SET nationality = 'ITA' WHERE name ILIKE '%chiellini%' OR name ILIKE '%bonucci%';
UPDATE players SET nationality = 'NED' WHERE name ILIKE '%van dijk%' OR name ILIKE '%depay%';
UPDATE players SET nationality = 'BEL' WHERE name ILIKE '%hazard%' OR name ILIKE '%de bruyne%';
```

### 5. Ajouter des statistiques d'exemple

```sql
-- Pour les thèmes de buteurs
UPDATE theme_answers 
SET goals = CASE 
  WHEN ranking = 1 THEN 25
  WHEN ranking = 2 THEN 22
  WHEN ranking = 3 THEN 18
  WHEN ranking = 4 THEN 16
  WHEN ranking = 5 THEN 14
  WHEN ranking = 6 THEN 12
  WHEN ranking = 7 THEN 10
  WHEN ranking = 8 THEN 9
  WHEN ranking = 9 THEN 8
  WHEN ranking = 10 THEN 7
  ELSE NULL
END,
value = CASE 
  WHEN ranking = 1 THEN 25.0
  WHEN ranking = 2 THEN 22.0
  WHEN ranking = 3 THEN 18.0
  WHEN ranking = 4 THEN 16.0
  WHEN ranking = 5 THEN 14.0
  WHEN ranking = 6 THEN 12.0
  WHEN ranking = 7 THEN 10.0
  WHEN ranking = 8 THEN 9.0
  WHEN ranking = 9 THEN 8.0
  WHEN ranking = 10 THEN 7.0
  ELSE NULL
END
WHERE theme_id IN (
  SELECT id FROM themes WHERE slug ILIKE '%buteurs%'
);

-- Pour les thèmes de passeurs
UPDATE theme_answers 
SET assists = CASE 
  WHEN ranking = 1 THEN 12
  WHEN ranking = 2 THEN 10
  WHEN ranking = 3 THEN 9
  WHEN ranking = 4 THEN 8
  WHEN ranking = 5 THEN 7
  WHEN ranking = 6 THEN 6
  WHEN ranking = 7 THEN 5
  WHEN ranking = 8 THEN 4
  WHEN ranking = 9 THEN 3
  WHEN ranking = 10 THEN 2
  ELSE NULL
END,
value = CASE 
  WHEN ranking = 1 THEN 12.0
  WHEN ranking = 2 THEN 10.0
  WHEN ranking = 3 THEN 9.0
  WHEN ranking = 4 THEN 8.0
  WHEN ranking = 5 THEN 7.0
  WHEN ranking = 6 THEN 6.0
  WHEN ranking = 7 THEN 5.0
  WHEN ranking = 8 THEN 4.0
  WHEN ranking = 9 THEN 3.0
  WHEN ranking = 10 THEN 2.0
  ELSE NULL
END
WHERE theme_id IN (
  SELECT id FROM themes WHERE slug ILIKE '%passeurs%'
);
```

## 🎯 Comment exécuter

### Option 1: Interface Supabase (Recommandée)
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans "SQL Editor"
4. Copier-coller chaque requête une par une
5. Exécuter chaque requête

### Option 2: Via l'API (Avancée)
```bash
python run_migrations.py
```

## 🔍 Vérifications

Après les migrations, vérifiez que :

1. **Table `players`** a une colonne `nationality`
2. **Table `theme_answers`** a les colonnes `ranking`, `goals`, `assists`, `value`
3. **Les données** sont correctement mises à jour

```sql
-- Vérification
SELECT 
  'players' as table_name,
  COUNT(*) as total_rows,
  COUNT(nationality) as with_nationality
FROM players
UNION ALL
SELECT 
  'theme_answers' as table_name,
  COUNT(*) as total_rows,
  COUNT(ranking) as with_ranking
FROM theme_answers;
```

## 🏳️ Mapping des drapeaux

```javascript
const countryFlags = {
  'FRA': '🇫🇷',
  'ESP': '🇪🇸', 
  'BRA': '🇧🇷',
  'ARG': '🇦🇷',
  'GER': '🇩🇪',
  'ENG': '🇬🇧',
  'POR': '🇵🇹',
  'ITA': '🇮🇹',
  'NED': '🇳🇱',
  'BEL': '🇧🇪'
};
```

## 📊 Structure finale

### Table `players`
- `id` (UUID)
- `name` (VARCHAR)
- `nationality` (VARCHAR(3)) ← **NOUVEAU**
- `created_at` (TIMESTAMP)

### Table `theme_answers`
- `id` (UUID)
- `theme_id` (UUID)
- `answer` (VARCHAR)
- `answer_norm` (VARCHAR)
- `ranking` (INTEGER) ← **NOUVEAU**
- `goals` (INTEGER) ← **NOUVEAU**
- `assists` (INTEGER) ← **NOUVEAU**
- `value` (DECIMAL) ← **NOUVEAU**
- `created_at` (TIMESTAMP)
