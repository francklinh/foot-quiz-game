# 🔧 Configuration CORS Supabase

## 🎯 Problème
Erreur "Load failed" lors de l'utilisation du client Supabase, probablement due à une mauvaise configuration CORS.

## 🚀 Solution : Configuration CORS

### 1. Accéder aux paramètres Supabase
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet : `qahbsyolfvujrpblnrvy`
3. Cliquez sur ⚙️ **Settings** (en bas à gauche)
4. Cliquez sur **API** dans le menu

### 2. Configurer les domaines autorisés
Dans la section **"CORS"** ou **"Allowed Origins"**, ajoutez :

**Pour le développement :**
```
http://localhost:3000
http://127.0.0.1:3000
https://localhost:3000
https://127.0.0.1:3000
```

**Pour la production :**
```
https://votre-domaine.com
https://votre-app.vercel.app
```

### 3. Configurer l'authentification
Dans **Settings > Authentication** :

**Site URL :**
```
http://localhost:3000
```

**Redirect URLs :**
```
http://localhost:3000/**
http://localhost:3000/auth/callback
```

### 4. Vérifier la configuration
Utilisez le composant `CorsTest` dans l'interface admin pour tester :
- CORS Simple
- Preflight CORS

## 🔍 Tests disponibles

### Test CORS Simple
- Teste une requête GET vers l'API Supabase
- Vérifie que les headers CORS sont corrects

### Test Preflight CORS
- Teste une requête OPTIONS (preflight)
- Vérifie que les requêtes complexes sont autorisées

## 🚨 Erreurs courantes

### "Load failed"
- **Cause** : CORS mal configuré
- **Solution** : Ajouter `http://localhost:3000` aux domaines autorisés

### "Access to fetch at ... has been blocked by CORS policy"
- **Cause** : Domaine non autorisé
- **Solution** : Vérifier la liste des domaines autorisés

### "Preflight request doesn't pass access control check"
- **Cause** : Headers non autorisés
- **Solution** : Vérifier les headers dans les paramètres CORS

## 📋 Checklist de configuration

- [ ] Domaines autorisés configurés
- [ ] Site URL configuré
- [ ] Redirect URLs configurés
- [ ] Test CORS Simple réussi
- [ ] Test Preflight CORS réussi
- [ ] Client Supabase fonctionne

## 🔧 Alternative : AdminFetchService

Si les problèmes CORS persistent, utilisez `AdminFetchService` qui utilise Fetch API directement et contourne les problèmes du client Supabase.

## 📞 Support

Si les problèmes persistent après configuration :
1. Vérifiez les logs du navigateur (F12 → Console)
2. Testez avec le composant `CorsTest`
3. Contactez le support Supabase si nécessaire
