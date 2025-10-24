# 🎯 GUIDE DE TEST - INTERFACE ADMIN CLAFOOTIX

## 📋 **PRÉREQUIS**
- Application démarrée sur `http://localhost:3000`
- Accès à l'interface admin sur `http://localhost:3000/admin`

## 🎮 **TESTS À EFFECTUER**

### **1. 📊 DASHBOARD PRINCIPAL**

#### **Test de Connexion Supabase**
- [ ] Vérifier que le composant "Test de Connexion Supabase" s'affiche
- [ ] Vérifier que toutes les tables sont marquées comme "Accessible" ✅
- [ ] Vérifier les informations de connexion (URL, status, nombre de tables)

#### **Statistiques en Temps Réel**
- [ ] **Total Jeux** : Doit afficher **3** (TOP10, GRILLE, CLUB)
- [ ] **Total Joueurs** : Doit afficher **5** (Kylian Mbappé + 4 autres)
- [ ] **Total Questions** : Doit afficher **3** (une par type de jeu)
- [ ] **Questions Actives** : Doit afficher **3** (toutes sont actives)

#### **Actions Rapides**
- [ ] Cliquer sur "Créer un Jeu" → Doit rediriger vers l'onglet Questions
- [ ] Cliquer sur "Ajouter un Joueur" → Doit rediriger vers l'onglet Joueurs
- [ ] Cliquer sur "Créer une Question" → Doit rediriger vers l'onglet Questions

### **2. 🎮 ONGLET JEUX**

#### **Liste des Types de Jeux**
- [ ] Vérifier l'affichage des 3 types de jeux :
  - **TOP10** - "Top 10" - Trouve les 10 éléments d'un classement
  - **GRILLE** - "Grille 3x3" - Remplis la grille en trouvant un joueur par case
  - **CLUB** - "Club" - Devine le club actuel des joueurs

#### **Filtrage**
- [ ] Tester le filtre par type de jeu
- [ ] Vérifier que chaque filtre affiche les bons résultats

#### **Actions sur les Jeux**
- [ ] Cliquer sur l'icône ✏️ d'un jeu → Modal de modification doit s'ouvrir
- [ ] Cliquer sur l'icône 🗑️ d'un jeu → Modal de suppression doit s'ouvrir

### **3. 👥 ONGLET JOUEURS**

#### **Liste des Joueurs**
- [ ] Vérifier l'affichage des 5 joueurs avec :
  - **Nom** (ex: Kylian Mbappé)
  - **Position** (ex: Attaquant)
  - **Nationalité** avec drapeau (ex: 🇫🇷 France)
  - **Club actuel** (ex: Real Madrid)
  - **Statut** (Actif/Inactif, Vérifié/Non vérifié)

#### **Recherche et Filtrage**
- [ ] Tester la recherche par nom (ex: "mbappe")
- [ ] Tester le filtre par nationalité
- [ ] Tester le filtre par position
- [ ] Vérifier que les résultats se mettent à jour correctement

#### **Actions sur les Joueurs**
- [ ] Cliquer sur "Ajouter un Joueur" → Modal de création doit s'ouvrir
- [ ] Remplir le formulaire avec :
  - Nom : "Test Player"
  - Position : "Milieu"
  - Nationalité : "Brazil"
  - Club actuel : "Test Club"
- [ ] Valider → Le joueur doit être ajouté à la liste
- [ ] Cliquer sur ✏️ d'un joueur existant → Modal de modification
- [ ] Modifier les informations et valider
- [ ] Cliquer sur 🗑️ d'un joueur → Modal de suppression

### **4. ❓ ONGLET QUESTIONS**

#### **Liste des Questions**
- [ ] Vérifier l'affichage des 3 questions :
  - **Top 10 buteurs Ligue 1 2024-2025** (TOP10, medium)
  - **Grille Ligue 1/Premier League/La Liga** (GRILLE, easy)
  - **Club - Devine le club** (CLUB, hard)

#### **Détails des Questions**
- [ ] Vérifier l'affichage des informations :
  - **Titre** de la question
  - **Type de jeu** avec icône
  - **Difficulté** (easy/medium/hard)
  - **Saison** (2024-2025)
  - **Tags** (ligue1, buteurs, etc.)
  - **Statut** (Active/Inactive)

#### **Actions sur les Questions**
- [ ] Cliquer sur "Créer une Question" → Modal de création
- [ ] Remplir le formulaire avec :
  - Titre : "Test Question"
  - Description : "Question de test"
  - Type de jeu : "TOP10"
  - Difficulté : "easy"
  - Limite de temps : 300
  - Max tentatives : 3
- [ ] Valider → La question doit être ajoutée
- [ ] Cliquer sur ✏️ d'une question → Modal de modification
- [ ] Cliquer sur 🗑️ d'une question → Modal de suppression

#### **Onglet Réponses Grille**
- [ ] Cliquer sur l'onglet "Réponses Grille"
- [ ] Vérifier l'affichage des réponses pour les grilles 3x3
- [ ] Tester les actions de modification/suppression

### **5. 🔄 TESTS DE NAVIGATION**

#### **Navigation entre Onglets**
- [ ] Cliquer sur "Jeux" → Vérifier l'onglet actif
- [ ] Cliquer sur "Joueurs" → Vérifier l'onglet actif
- [ ] Cliquer sur "Questions" → Vérifier l'onglet actif
- [ ] Vérifier que l'onglet actif est mis en surbrillance

#### **Actions Rapides**
- [ ] Depuis le dashboard, cliquer sur une action rapide
- [ ] Vérifier que l'onglet correspondant s'active
- [ ] Vérifier que le bon contenu s'affiche

### **6. 📱 TESTS RESPONSIVE**

#### **Desktop (1920x1080)**
- [ ] Vérifier l'affichage complet avec toutes les colonnes
- [ ] Vérifier que les grilles s'affichent correctement

#### **Tablet (768x1024)**
- [ ] Vérifier l'adaptation des grilles
- [ ] Vérifier que les modals s'affichent correctement

#### **Mobile (375x667)**
- [ ] Vérifier l'interface optimisée mobile
- [ ] Vérifier la navigation tactile

### **7. ⚡ TESTS DE PERFORMANCE**

#### **Chargement des Données**
- [ ] Vérifier que les statistiques se chargent rapidement
- [ ] Vérifier que les listes se chargent sans délai
- [ ] Vérifier qu'il n'y a pas d'erreurs dans la console

#### **Gestion d'Erreurs**
- [ ] Tester avec une connexion internet lente
- [ ] Vérifier les messages d'erreur appropriés
- [ ] Vérifier la récupération après erreur

## 🎯 **RÉSULTATS ATTENDUS**

### **✅ SUCCÈS**
- Toutes les données de la base s'affichent correctement
- Les statistiques correspondent aux vraies données
- Les actions CRUD fonctionnent
- L'interface est responsive
- Aucune erreur dans la console

### **❌ PROBLÈMES À SIGNALER**
- Données manquantes ou incorrectes
- Erreurs lors des actions CRUD
- Problèmes d'affichage responsive
- Erreurs JavaScript dans la console
- Lenteur de chargement

## 📝 **NOTES DE TEST**

**Date du test :** _______________
**Testeur :** _______________
**Version :** _______________

**Commentaires :**
- [ ] Test réussi
- [ ] Problèmes mineurs
- [ ] Problèmes majeurs
- [ ] Bloquant

**Actions à effectuer après le test :**
- [ ] Signaler les bugs
- [ ] Proposer des améliorations
- [ ] Valider la fonctionnalité
