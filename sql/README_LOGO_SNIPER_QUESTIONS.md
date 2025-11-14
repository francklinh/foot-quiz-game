# 📝 Instructions pour ajouter des questions Logo Sniper

Ce document explique comment utiliser le script `add_logo_sniper_questions.sql` pour créer des questions Logo Sniper pour les nouvelles ligues (Premier League, Bundesliga, La Liga, Serie A).

## 🚀 Objectif du script

Le script `add_logo_sniper_questions.sql` permet de :
- Créer 4 questions Logo Sniper (une pour chaque ligue)
- Associer tous les clubs de chaque ligue à leur question respective
- Garantir que les questions sont créées de manière idempotente (pas de doublons)

## 🛠️ Prérequis

1. **Clubs ajoutés** : Les clubs doivent être présents dans la table `clubs` avec leurs logos. Si ce n'est pas fait, exécutez d'abord `sql/add_top_league_logos.sql`.

2. **Type de jeu LOGO_SNIPER** : Le type de jeu `LOGO_SNIPER` doit exister dans la table `game_types`. Le script le créera automatiquement s'il n'existe pas.

3. **Structure de la base de données** :
   - Table `questions` avec les colonnes `game_type_id`, `content` (JSONB), `season`, `is_active`
   - Table `question_answers` avec les colonnes `question_id`, `club_id`, `display_order`, `is_active`
   - Table `clubs` avec les colonnes `id`, `name`, `league`, `is_active`, `type`

## 📋 Étapes d'utilisation

### 1. Vérifier que les clubs sont présents

Avant d'exécuter le script, vérifiez que les clubs des nouvelles ligues sont bien présents dans la table `clubs` :

```sql
-- Vérifier les clubs par ligue
SELECT league, COUNT(*) as nombre_clubs
FROM clubs
WHERE league IN ('Premier League', 'Bundesliga', 'La Liga', 'Serie A')
  AND is_active = true
  AND type = 'CLUB'
GROUP BY league;
```

Vous devriez voir :
- **Premier League** : ~20 clubs
- **Bundesliga** : ~18 clubs
- **La Liga** : ~20 clubs
- **Serie A** : ~20 clubs

### 2. Exécuter le script

#### Via l'éditeur SQL de Supabase :

1. Ouvrez votre projet Supabase
2. Allez dans "SQL Editor"
3. Ouvrez le fichier `sql/add_logo_sniper_questions.sql`
4. Copiez-collez le contenu dans l'éditeur
5. Cliquez sur "RUN"

#### Via `psql` (ligne de commande) :

```bash
psql -h <host> -U <user> -d <database> -f sql/add_logo_sniper_questions.sql
```

### 3. Vérifier les résultats

Après l'exécution, le script affichera un résumé dans les messages :

```
✅ Questions créées:
  Premier League: <UUID>
  Bundesliga: <UUID>
  La Liga: <UUID>
  Serie A: <UUID>
```

Vous pouvez aussi vérifier manuellement :

```sql
-- Vérifier les questions créées
SELECT 
  q.id,
  q.content->>'question' as question,
  q.content->>'league' as league,
  COUNT(qa.id) as nombre_clubs
FROM questions q
LEFT JOIN question_answers qa ON qa.question_id = q.id AND qa.is_active = true
WHERE q.game_type_id = (
  SELECT id FROM game_types WHERE code = 'LOGO_SNIPER'
)
AND q.is_active = true
GROUP BY q.id, q.content
ORDER BY q.content->>'league';
```

### 4. Tester dans l'application

1. Ouvrez l'application dans votre navigateur
2. Allez sur la page "Logo Sniper"
3. Vous devriez voir les 4 nouvelles questions :
   - "Premier League - Logos des clubs anglais"
   - "Bundesliga - Logos des clubs allemands"
   - "La Liga - Logos des clubs espagnols"
   - "Serie A - Logos des clubs italiens"

## 🔄 Réexécution du script

Le script est **idempotent**, ce qui signifie qu'il peut être exécuté plusieurs fois sans créer de doublons :

- Si une question existe déjà, elle sera réutilisée
- Les associations de clubs seront mises à jour (anciennes associations supprimées, nouvelles créées)
- Aucune erreur ne sera générée si les données existent déjà

## 📊 Structure des questions

Chaque question Logo Sniper est créée avec la structure suivante :

```json
{
  "question": "Premier League - Logos des clubs anglais",
  "description": "Devine les clubs de Premier League à partir de leurs logos",
  "league": "Premier League",
  "country": "England"
}
```

## 🔗 Associations clubs-questions

Les clubs sont associés aux questions via la table `question_answers` :

- `question_id` : ID de la question Logo Sniper
- `club_id` : ID du club dans la table `clubs`
- `display_order` : Ordre d'affichage (trié par nom de club)
- `is_active` : `true` pour les associations actives

## ⚠️ Dépannage

### Erreur : "Le type de jeu LOGO_SNIPER n'existe pas"

Le script devrait créer automatiquement le type de jeu. Si l'erreur persiste, vérifiez que la table `game_types` existe :

```sql
SELECT * FROM game_types WHERE code = 'LOGO_SNIPER';
```

### Erreur : "Question X non trouvée"

Vérifiez que la question a bien été créée :

```sql
SELECT id, content->>'league' as league
FROM questions
WHERE game_type_id = (
  SELECT id FROM game_types WHERE code = 'LOGO_SNIPER'
)
AND is_active = true;
```

### Aucun club associé à une question

Vérifiez que les clubs existent bien dans la table `clubs` :

```sql
SELECT league, COUNT(*) as nombre_clubs
FROM clubs
WHERE league = 'Premier League'  -- Remplacer par la ligue concernée
  AND is_active = true
  AND type = 'CLUB'
GROUP BY league;
```

Si aucun club n'est trouvé, exécutez d'abord `sql/add_top_league_logos.sql`.

## 📝 Notes

- Les clubs sont triés par nom (`ORDER BY name`) lors de l'insertion
- Le script supprime les anciennes associations avant d'en créer de nouvelles
- Seuls les clubs actifs (`is_active = true`) et de type `CLUB` sont associés aux questions
- La saison est définie à `2024-2025` par défaut

## ✅ Résultat attendu

Après l'exécution réussie du script, vous devriez avoir :

- **4 questions Logo Sniper** (une par ligue)
- **~78 clubs associés** (20 Premier League + 18 Bundesliga + 20 La Liga + 20 Serie A)
- **Questions visibles** dans l'application Logo Sniper

---

**Besoin d'aide ?** Vérifiez les logs dans Supabase SQL Editor pour voir les messages de notification du script.

