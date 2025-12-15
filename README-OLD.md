# LinkedIn Contact Sync 🔗

Application moderne pour synchroniser et rechercher vos contacts LinkedIn, inspirée de SnapAddy.

## 🏗️ Architecture

```
LinkedInLS/
├── extension/          # Extension Chrome (scrape LinkedIn)
│   ├── manifest.json   # Configuration extension
│   ├── popup/          # Interface popup
│   ├── content/        # Script injecté sur LinkedIn
│   └── background/     # Service worker
│
└── frontend/           # Application React (Dashboard)
    ├── src/
    │   ├── pages/      # Page Contacts
    │   ├── hooks/      # useContacts
    │   └── services/   # chromeStorage
    └── package.json
```

## 🚀 Comment ça marche

1. **Extension Chrome** → Scrape les contacts depuis LinkedIn
2. **Chrome Storage** → Stocke les contacts localement
3. **App React** → Affiche et permet de rechercher les contacts

## 📦 Installation

### 1. Frontend (App Web)

```bash
cd frontend
npm install
npm run dev
```

L'app sera accessible sur `http://localhost:5173`

### 2. Extension Chrome

1. Ouvrez Chrome et allez sur `chrome://extensions/`
2. Activez le **Mode développeur** (coin supérieur droit)
3. Cliquez sur **"Charger l'extension non empaquetée"**
4. Sélectionnez le dossier `extension/`
5. L'extension est maintenant installée ! 🎉

## 🎯 Utilisation

### Étape 1 : Extraire vos contacts LinkedIn

1. Connectez-vous à LinkedIn
2. Allez sur votre page **[Mes relations](https://www.linkedin.com/mynetwork/invite-connect/connections/)**
3. Faites défiler la page pour charger plus de contacts
4. Cliquez sur l'icône de l'extension dans la barre Chrome
5. Cliquez sur **"📥 Extraire les contacts"**
6. ✅ Vos contacts sont sauvegardés !

### Étape 2 : Consulter et rechercher

1. Ouvrez l'app web : `http://localhost:5173`
2. Vous voyez tous vos contacts synchronisés
3. Utilisez la barre de recherche pour trouver quelqu'un
4. Cliquez sur "Voir le profil" pour ouvrir le profil LinkedIn

## 🎨 Fonctionnalités

### Extension Chrome ✅
- 📥 Extraction automatique des contacts LinkedIn
- 💾 Stockage local dans Chrome Storage
- 🔢 Compteur de contacts synchronisés
- 🗑️ Effacement des données

### Application Web ✅
- 📊 Vue d'ensemble de tous les contacts
- 🔍 Recherche par nom ou titre
- 📱 Design responsive (mobile-first)
- ⚡ Synchronisation en temps réel
- 🎨 Interface moderne avec Tailwind CSS

## 🛠️ Technologies

### Extension
- **Manifest V3** - Dernière version Chrome
- **Chrome Storage API** - Stockage local
- **Content Scripts** - Injection sur LinkedIn
- **Vanilla JavaScript** - Léger et rapide

### Frontend
- **React 18** + TypeScript
- **Vite** - Build ultra-rapide
- **Tailwind CSS** - Design moderne
- **React Router** - Navigation
- **Chrome Extension API** - Communication avec l'extension

## 📝 Notes Importantes

### ⚠️ Limitations LinkedIn

LinkedIn change régulièrement la structure HTML de ses pages. Si l'extraction ne fonctionne plus :

1. Ouvrez la console Chrome (F12)
2. Inspectez les éléments de contact
3. Mettez à jour les sélecteurs dans `extension/content/content.js`

### 🔒 Données et Confidentialité

- **Tout est stocké localement** dans votre navigateur
- **Aucune donnée n'est envoyée** à un serveur externe
- **Vous contrôlez vos données** - effacez-les quand vous voulez

### 🌐 Pages LinkedIn compatibles

- ✅ Mes relations : `/mynetwork/invite-connect/connections/`
- ✅ Recherche de personnes : `/search/results/people/`

## 🔄 Prochaines Étapes (v2)

Pour évoluer vers une solution comme SnapAddy :

- [ ] **Backend Node.js** - Synchronisation cloud
- [ ] **Base de données** - PostgreSQL ou MongoDB
- [ ] **Authentification** - Comptes utilisateurs
- [ ] **Sync multi-appareils** - Accès partout
- [ ] **Export CSV/Excel** - Export des contacts
- [ ] **Tags et notes** - Organiser les contacts
- [ ] **Intégrations** - CRM, Salesforce, etc.

## 🐛 Debug

### L'extension ne détecte pas les contacts

1. Rechargez la page LinkedIn (F5)
2. Faites défiler pour charger les contacts
3. Vérifiez la console : Clic droit → Inspecter → Console
4. Cherchez les erreurs

### L'app web ne montre pas les contacts

1. Vérifiez que l'extension est installée
2. Vérifiez que vous avez extrait des contacts
3. Ouvrez la console de l'app web (F12)
4. Vérifiez Chrome Storage :
   ```javascript
   chrome.storage.local.get(['contacts'], console.log)
   ```

## 📄 License

MIT

---

**⭐ Fait avec passion pour simplifier la gestion des contacts LinkedIn !**
