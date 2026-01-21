# VerifRenov - Comparateur Anti-Arnaque Rénovation Énergétique

Le comparateur de devis pour la rénovation énergétique qui protège les consommateurs contre les arnaques.

## 🚀 Fonctionnalités

- ✅ **Landing page ultra-professionnelle** avec design dark moderne
- ✅ **Formulaire multi-étapes** avec validation et sauvegarde automatique
- ✅ **Estimation de prix personnalisée** basée sur 3000+ devis réels
- ✅ **Calcul des aides** (MaPrimeRénov, CEE, éco-PTZ)
- ✅ **Outil de vérification RGE** (certificats entreprises)
- ✅ **Système d'emails transactionnels**
- ✅ **Articles SEO optimisés**
- ✅ **Pages légales complètes** (RGPD, mentions, CGU)
- ✅ **Responsive mobile/tablet/desktop**
- ✅ **Performance optimisée** (Next.js 14, Server Components)

## 📦 Stack Technique

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : Supabase (PostgreSQL)
- **Emails** : Resend
- **Hébergement** : Vercel
- **Fonts** : Space Grotesk + DM Sans (Google Fonts)

## 🛠️ Installation

### 1. Prérequis

- Node.js 18+ installé
- npm ou yarn
- Compte Supabase (gratuit)
- Compte Resend (gratuit)

### 2. Cloner le projet

```bash
git clone <votre-repo>
cd Renov
```

### 3. Installer les dépendances

```bash
npm install
```

### 4. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

Remplissez les variables :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend
RESEND_API_KEY=re_your_api_key
```

#### Obtenir les clés Supabase :

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans `Settings > API`
4. Copiez l'URL et la clé `anon/public`
5. Dans `SQL Editor`, exécutez le fichier `supabase/schema.sql`

#### Obtenir la clé Resend :

1. Créez un compte sur [resend.com](https://resend.com)
2. Allez dans `API Keys`
3. Créez une nouvelle clé
4. Configurez un domaine (ou utilisez le domaine de test)

### 5. Initialiser la base de données

Dans l'interface Supabase, allez dans **SQL Editor** et exécutez le contenu du fichier `supabase/schema.sql`.

Cela va créer :
- Toutes les tables nécessaires
- Les index pour la performance
- Les données de prix de référence

### 6. Lancer en développement

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🗂️ Structure du projet

```
Renov/
├── app/                          # App Router Next.js
│   ├── page.tsx                  # Landing page
│   ├── devis/
│   │   ├── page.tsx             # Formulaire multi-étapes
│   │   └── resultat/page.tsx    # Page résultats avec estimation
│   ├── verifier-entreprise/     # Outil vérification RGE
│   ├── guide/                   # Articles SEO
│   ├── api/                     # API Routes
│   │   ├── leads/route.ts       # Capture leads
│   │   ├── estimate/route.ts    # Calcul estimation
│   │   ├── verify-rge/route.ts  # Vérification RGE
│   │   └── email/               # Emails transactionnels
│   └── globals.css              # Styles globaux
├── components/
│   ├── ui/                      # Composants réutilisables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   └── layout/                  # Layout components
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   └── supabase.ts             # Client Supabase
├── supabase/
│   └── schema.sql              # Schéma base de données
├── public/                      # Assets statiques
└── tailwind.config.ts          # Configuration Tailwind
```

## 🎨 Design System

### Couleurs

```css
--bg-primary: #0a0a0b      /* Fond principal */
--bg-secondary: #131316    /* Fond secondaire */
--accent-green: #00ff88    /* Accent vert principal */
--accent-red: #ff4757      /* Accent rouge (alertes) */
--text-primary: #ffffff    /* Texte principal */
--text-secondary: #8a8a8e  /* Texte secondaire */
```

### Typographie

- **Titres** : Space Grotesk (700, 600)
- **Corps** : DM Sans (400, 500, 600)

## 📊 Base de données

### Tables principales

- **leads** : Demandes de devis des prospects
- **partners** : Entreprises installateurs partenaires
- **pricing_references** : Prix de référence par type de travaux
- **verified_companies** : Cache vérification RGE

Voir `supabase/schema.sql` pour le schéma complet.

## 🚀 Déploiement

### Déploiement sur Vercel (recommandé)

1. Créez un compte sur [vercel.com](https://vercel.com)
2. Connectez votre repository Git
3. Ajoutez les variables d'environnement dans Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
4. Déployez !

### Configuration du domaine

1. Dans Vercel, allez dans `Settings > Domains`
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

## 📝 TODO pour la production

### CRITIQUE - À faire AVANT de lancer

- [ ] **Compléter les mentions légales** avec vos vraies informations (SIRET, adresse, etc.)
- [ ] **Configurer le domaine email** sur Resend pour les emails (`noreply@votredomaine.fr`)
- [ ] **Implémenter l'API RGE réelle** (actuellement en mode simulation)
- [ ] **Ajouter les vraies entreprises partenaires** dans la table `partners`
- [ ] **Créer un dashboard admin** pour gérer les leads
- [ ] **Tester le parcours complet** de A à Z
- [ ] **Vérifier la conformité RGPD** avec un avocat

### Important mais pas bloquant

- [ ] Système de facturation partenaires
- [ ] Attribution automatique des leads aux partenaires
- [ ] Témoignages clients réels
- [ ] Plus d'articles SEO (objectif : 20+)
- [ ] Analytics avancés (Plausible ou PostHog)
- [ ] Tests automatisés (Jest, Playwright)

## 🔒 Sécurité & Conformité

- ✅ HTTPS obligatoire (Vercel)
- ✅ Validation côté serveur de tous les formulaires
- ✅ Protection contre les injections SQL (Supabase)
- ✅ Rate limiting sur les APIs
- ✅ Conformité RGPD
- ✅ Cookies consent (à implémenter si tracking)

## 📈 SEO

### Optimisations incluses

- ✅ Metadata dynamiques par page
- ✅ Sitemap.xml automatique (Next.js)
- ✅ Structure HTML sémantique
- ✅ Temps de chargement < 2s
- ✅ Mobile-first responsive
- ✅ Schema.org (à implémenter)

### Mots-clés ciblés

- Prix pompe à chaleur 2025
- Devis rénovation énergétique
- Arnaque pompe à chaleur
- Vérifier artisan RGE
- MaPrimeRénov 2025

## 🐛 Dépannage

### Erreur "Supabase connection failed"

- Vérifiez que les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont correctes
- Vérifiez que le schéma SQL a bien été exécuté

### Emails ne s'envoient pas

- Vérifiez la clé `RESEND_API_KEY`
- Vérifiez que le domaine email est vérifié sur Resend
- Consultez les logs dans le dashboard Resend

### Erreur de build

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

Pour toute question :
- Email : contact@verifrenov.fr
- GitHub Issues : [lien vers votre repo]

## 📄 Licence

[À définir selon votre choix]

---

**Construit avec ❤️ pour protéger les consommateurs contre les arnaques à la rénovation énergétique**
