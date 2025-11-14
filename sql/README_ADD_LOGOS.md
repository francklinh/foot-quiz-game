# 📋 Guide d'ajout des logos des équipes

## 📁 Fichier SQL

Le fichier `sql/add_top_league_logos.sql` contient les requêtes SQL pour ajouter les logos des équipes des 4 grands championnats :

- **Premier League** (Angleterre) - 20 équipes
- **Bundesliga** (Allemagne) - 18 équipes  
- **La Liga** (Espagne) - 20 équipes
- **Serie A** (Italie) - 20 équipes

**Total : 78 équipes**

## 🔧 Instructions d'utilisation

### 1. Préparer les URLs des logos

Avant d'exécuter le script, vous devez remplacer les URLs placeholder :
```
https://example.com/logos/premier-league/arsenal.png
```

Par les vraies URLs des logos, par exemple :
```
https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png
```

### 2. Sources recommandées pour les logos

#### Option A : Logos-World.net
- URL : https://logos-world.net/
- Avantages : Logos haute qualité, format PNG, gratuit
- Recherche : "Arsenal logo", "Bayern Munich logo", etc.

#### Option B : Wikipedia
- URL : https://commons.wikimedia.org/
- Avantages : Logos officiels, licence libre
- Recherche : "Arsenal FC logo", "FC Bayern München logo"

#### Option B : API Football
- URL : https://www.api-football.com/
- Avantages : API avec logos officiels (nécessite clé API)

#### Option C : Téléchargement local
- Télécharger les logos et les héberger sur votre propre serveur
- Utiliser un CDN (Cloudinary, Imgur, etc.)

### 3. Structure des URLs dans le script

Le script utilise une structure organisée par championnat :
```
https://example.com/logos/premier-league/arsenal.png
https://example.com/logos/bundesliga/bayern-munich.png
https://example.com/logos/la-liga/barcelona.png
https://example.com/logos/serie-a/juventus.png
```

Vous pouvez :
- **Garder cette structure** : Organiser vos logos par championnat
- **Utiliser une structure plate** : Tous les logos dans un même dossier
- **Utiliser des URLs externes** : Directement depuis les sources mentionnées

### 4. Exécution du script

#### Dans Supabase SQL Editor :

1. Ouvrir le fichier `sql/add_top_league_logos.sql`
2. Remplacer toutes les URLs `https://example.com/...` par les vraies URLs
3. Copier-coller le script complet dans Supabase SQL Editor
4. Exécuter le script

#### Vérification :

Le script affiche un résumé à la fin :
```
========================================
LOGS DES ÉQUIPES AJOUTÉS
========================================
Premier League (Angleterre): 20 équipes
Bundesliga (Allemagne): 18 équipes
La Liga (Espagne): 20 équipes
Serie A (Italie): 20 équipes
========================================
Total: 78 équipes
========================================
```

### 5. Gestion des conflits

Le script utilise `ON CONFLICT (name) DO UPDATE` pour :
- **Mettre à jour** les clubs existants avec les nouveaux logos
- **Ajouter** les clubs manquants
- **Conserver** les données existantes si le club existe déjà

## 📝 Format des données

Chaque équipe contient :
- **name** : Nom principal de l'équipe (ex: "Arsenal")
- **logo_url** : URL du logo (à remplacer)
- **type** : "CLUB"
- **country** : Pays (England, Germany, Spain, Italy)
- **league** : Championnat (Premier League, Bundesliga, La Liga, Serie A)
- **is_active** : true
- **name_variations** : Tableau des variantes de noms (ex: ["Arsenal FC", "Arsenal Football Club"])

## 🔍 Variantes de noms

Le script inclut des variantes de noms pour chaque équipe pour améliorer :
- **L'autocomplétion** : Recherche plus flexible
- **La validation** : Accepte différentes écritures
- **La recherche** : Trouve l'équipe même avec un nom partiel

Exemples :
- "Arsenal" → ["Arsenal FC", "Arsenal Football Club"]
- "Bayern Munich" → ["Bayern München", "FC Bayern Munich", "FC Bayern"]
- "Real Madrid" → ["Real Madrid CF", "Real", "RMCF"]

## ⚠️ Notes importantes

1. **URLs placeholder** : N'oubliez pas de remplacer toutes les URLs avant d'exécuter
2. **Format des images** : PNG recommandé pour transparence, SVG possible aussi
3. **Taille** : Logos de 200x200px ou plus recommandés
4. **Licence** : Vérifiez les droits d'utilisation des logos
5. **Mise à jour** : Le script peut être ré-exécuté pour mettre à jour les logos

## 🚀 Script rapide pour remplacer les URLs

Si vous avez une liste d'URLs, vous pouvez utiliser un éditeur de texte avec recherche/remplacement :

1. Préparer un fichier CSV avec : `nom_equipe,url_logo`
2. Utiliser un script Python/Node.js pour générer les INSERT
3. Ou remplacer manuellement dans le fichier SQL

## 📊 Statistiques

Après exécution, vérifiez le nombre d'équipes ajoutées :

```sql
SELECT 
  league,
  COUNT(*) as nombre_equipes
FROM clubs
WHERE league IN ('Premier League', 'Bundesliga', 'La Liga', 'Serie A')
  AND is_active = true
GROUP BY league
ORDER BY league;
```

