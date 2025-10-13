# 🗄️ Guide d'Exécution des Migrations

## 🎯 Objectif
Ajouter les colonnes nécessaires pour afficher les drapeaux des joueurs et le classement par ordre croissant.

## 📋 Étapes à Suivre

### **Étape 1 : Accéder à l'Interface Supabase**

1. **Ouvrir votre navigateur** et aller sur : https://supabase.com/dashboard
2. **Se connecter** avec vos identifiants
3. **Sélectionner votre projet** (qahbsyolfvujrpblnrvy)
4. **Cliquer sur "SQL Editor"** dans le menu de gauche

### **Étape 2 : Exécuter les Requêtes SQL**

#### **2.1 Ajouter la colonne nationality à la table players**

```sql
ALTER TABLE players ADD COLUMN IF NOT EXISTS nationality VARCHAR(3);
```

**Action :** Copier-coller cette requête dans l'éditeur SQL et cliquer sur **"Run"**

#### **2.2 Ajouter les colonnes à la table theme_answers**

```sql
ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS ranking INTEGER;
```

**Action :** Exécuter cette requête

```sql
ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS goals INTEGER;
```

**Action :** Exécuter cette requête

```sql
ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS assists INTEGER;
```

**Action :** Exécuter cette requête

```sql
ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS value DECIMAL(10,2);
```

**Action :** Exécuter cette requête

#### **2.3 Créer les index pour les performances**

```sql
CREATE INDEX IF NOT EXISTS idx_theme_answers_ranking ON theme_answers(theme_id, ranking);
```

**Action :** Exécuter cette requête

```sql
CREATE INDEX IF NOT EXISTS idx_players_nationality ON players(nationality);
```

**Action :** Exécuter cette requête

### **Étape 3 : Mettre à Jour les Données Existantes**

#### **3.1 Assigner des rankings basés sur l'ordre actuel**

```sql
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

**Action :** Exécuter cette requête

#### **3.2 Ajouter des nationalités d'exemple**

```sql
UPDATE players SET nationality = 'FRA' WHERE name ILIKE '%mbappé%' OR name ILIKE '%benzema%' OR name ILIKE '%lacazette%';
```

**Action :** Exécuter cette requête

```sql
UPDATE players SET nationality = 'ARG' WHERE name ILIKE '%messi%';
```

**Action :** Exécuter cette requête

```sql
UPDATE players SET nationality = 'BRA' WHERE name ILIKE '%neymar%' OR name ILIKE '%vinicius%';
```

**Action :** Exécuter cette requête

```sql
UPDATE players SET nationality = 'ESP' WHERE name ILIKE '%pedri%' OR name ILIKE '%gavi%';
```

**Action :** Exécuter cette requête

```sql
UPDATE players SET nationality = 'GER' WHERE name ILIKE '%müller%' OR name ILIKE '%kroos%';
```

**Action :** Exécuter cette requête

```sql
UPDATE players SET nationality = 'ENG' WHERE name ILIKE '%kane%' OR name ILIKE '%sterling%';
```

**Action :** Exécuter cette requête

```sql
UPDATE players SET nationality = 'POR' WHERE name ILIKE '%ronaldo%' OR name ILIKE '%bruno%';
```

**Action :** Exécuter cette requête

```sql
UPDATE players SET nationality = 'ITA' WHERE name ILIKE '%chiellini%' OR name ILIKE '%bonucci%';
```

**Action :** Exécuter cette requête

```sql
UPDATE players SET nationality = 'NED' WHERE name ILIKE '%van dijk%' OR name ILIKE '%depay%';
```

**Action :** Exécuter cette requête

```sql
UPDATE players SET nationality = 'BEL' WHERE name ILIKE '%hazard%' OR name ILIKE '%de bruyne%';
```

**Action :** Exécuter cette requête

#### **3.3 Ajouter des statistiques pour les thèmes de buteurs**

```sql
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
```

**Action :** Exécuter cette requête

#### **3.4 Ajouter des statistiques pour les thèmes de passeurs**

```sql
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

**Action :** Exécuter cette requête

### **Étape 4 : Vérifier les Modifications**

#### **4.1 Vérifier la structure des tables**

```sql
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

**Action :** Exécuter cette requête pour vérifier

#### **4.2 Vérifier les données mises à jour**

```sql
SELECT 
  t.slug,
  ta.ranking,
  ta.answer,
  ta.goals,
  ta.assists,
  ta.value,
  p.nationality
FROM theme_answers ta
JOIN themes t ON ta.theme_id = t.id
LEFT JOIN players p ON LOWER(ta.answer) = LOWER(p.name)
WHERE ta.ranking IS NOT NULL
ORDER BY t.slug, ta.ranking
LIMIT 20;
```

**Action :** Exécuter cette requête pour voir les résultats

## ✅ Vérifications Finales

Après avoir exécuté toutes les requêtes, vous devriez voir :

1. **Table `players`** : Colonne `nationality` ajoutée
2. **Table `theme_answers`** : Colonnes `ranking`, `goals`, `assists`, `value` ajoutées
3. **Données** : Rankings assignés (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
4. **Nationalités** : Quelques joueurs ont des codes pays (FRA, ARG, BRA, etc.)
5. **Statistiques** : Valeurs de buts/passes selon le type de thème

## 🚨 En Cas de Problème

Si une requête échoue :
1. **Vérifier la syntaxe** SQL
2. **S'assurer** que les tables existent
3. **Vérifier** les permissions
4. **Relancer** la requête

## 🎯 Prochaines Étapes

Une fois les migrations terminées :
1. **Tester** avec le fichier `migration_test.html`
2. **Mettre à jour** l'application React
3. **Déployer** sur Vercel

---

**💡 Conseil :** Exécutez les requêtes une par une et attendez que chacune se termine avant de passer à la suivante.
