# 🗄️ Étapes de Migration - Drapeaux et Classement

## 📋 Résumé des Modifications

Nous allons ajouter les fonctionnalités suivantes à votre application :

1. **🏳️ Drapeaux des joueurs** - Affichage des nationalités avec emojis
2. **📈 Classement par ordre croissant** - Tri des joueurs par performance
3. **📊 Statistiques détaillées** - Buts, passes, etc. selon le type de thème

## 🚀 Étapes à Suivre

### **Étape 1 : Modifications de la Base de Données**

#### 1.1 Aller sur l'interface Supabase
- Ouvrir https://supabase.com/dashboard
- Sélectionner votre projet
- Aller dans **"SQL Editor"**

#### 1.2 Exécuter les requêtes SQL
Copier-coller et exécuter **une par une** les requêtes suivantes :

```sql
-- 1. Ajouter la colonne nationality à players
ALTER TABLE players ADD COLUMN nationality VARCHAR(3);

-- 2. Ajouter les colonnes à theme_answers
ALTER TABLE theme_answers ADD COLUMN ranking INTEGER;
ALTER TABLE theme_answers ADD COLUMN goals INTEGER;
ALTER TABLE theme_answers ADD COLUMN assists INTEGER;
ALTER TABLE theme_answers ADD COLUMN value DECIMAL(10,2);

-- 3. Créer les index
CREATE INDEX idx_theme_answers_ranking ON theme_answers(theme_id, ranking);
CREATE INDEX idx_players_nationality ON players(nationality);
```

#### 1.3 Mettre à jour les données existantes

```sql
-- Assigner des rankings
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

#### 1.4 Ajouter des nationalités d'exemple

```sql
-- Mettre à jour quelques nationalités
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

#### 1.5 Ajouter des statistiques d'exemple

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
```

### **Étape 2 : Tester les Modifications**

#### 2.1 Ouvrir le fichier de test
- Ouvrir `migration_test.html` dans votre navigateur
- Cliquer sur **"Tester la Structure"**
- Vérifier que toutes les colonnes sont présentes

#### 2.2 Vérifier les données
- Cliquer sur **"Tester les Données"**
- Vérifier que les jointures fonctionnent
- Cliquer sur **"Tester les Drapeaux"**
- Cliquer sur **"Tester le Classement"**

### **Étape 3 : Mettre à Jour l'Application**

#### 3.1 Ajouter les nouveaux fichiers
Les fichiers suivants ont été créés :
- `src/utils/flags.ts` - Gestion des drapeaux
- `src/components/AnswerCard.tsx` - Composant pour afficher les réponses
- `src/types/database.ts` - Types TypeScript mis à jour

#### 3.2 Modifier la page Top10
- Mettre à jour les requêtes pour inclure les nouvelles colonnes
- Utiliser le composant `AnswerCard` pour l'affichage
- Ajouter le tri par `ranking`

### **Étape 4 : Déployer**

#### 4.1 Tester localement
```bash
npm start
```

#### 4.2 Déployer sur Vercel
```bash
vercel --prod
```

## 🔍 Vérifications Finales

### Structure de la Base de Données
- ✅ Table `players` a une colonne `nationality`
- ✅ Table `theme_answers` a les colonnes `ranking`, `goals`, `assists`, `value`
- ✅ Les index sont créés pour les performances

### Données
- ✅ Les rankings sont assignés (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
- ✅ Les nationalités sont ajoutées pour les joueurs principaux
- ✅ Les statistiques sont calculées selon le type de thème

### Interface Utilisateur
- ✅ Les drapeaux s'affichent correctement
- ✅ Le classement est trié par ordre croissant
- ✅ Les statistiques sont visibles (buts, passes, etc.)
- ✅ Le système de flou fonctionne avec les nouvelles données

## 🎯 Résultat Attendu

Après les modifications, votre application affichera :

```
1. 🇫🇷 Kylian Mbappé (25 buts)
2. 🇫🇷 Alexandre Lacazette (22 buts)
3. 🇫🇷 Wissam Ben Yedder (18 buts)
4. 🇧🇷 Neymar (16 buts)
5. 🇦🇷 Lionel Messi (14 buts)
...
```

Avec :
- **Drapeaux** des pays d'origine
- **Classement** par ordre de performance
- **Statistiques** détaillées (buts, passes, etc.)
- **Système de flou** qui fonctionne avec les nouvelles données

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez que toutes les requêtes SQL ont été exécutées
2. Utilisez le fichier `migration_test.html` pour diagnostiquer
3. Vérifiez les logs de la console du navigateur
4. Assurez-vous que les types TypeScript sont corrects
