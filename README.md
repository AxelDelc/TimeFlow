# TimeFlow

Application web de pointage pour PME. Permet aux salariés de pointer leurs entrées et sorties, et à l'administrateur de suivre les présences en temps réel.

---

## Stack technique

| Composant | Technologie |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 5 |
| Vues | EJS |
| Base de données | PostgreSQL |
| ORM | Prisma 7 |
| Authentification | Sessions (express-session) + bcrypt |
| CSS | Vanilla CSS (fichier unique) |
| Conteneurisation | Docker + Docker Compose |

---

## Fonctionnalités

### Espace administrateur (`/admin`)
- **Tableau de bord** — stats en temps réel (total salariés, comptes actifs, pointages du jour, présents maintenant)
- **Gestion des salariés** — créer, désactiver, réactiver un compte
- **Pointages globaux** — historique de tous les pointages (`/admin/sessions`)
- **Pointages par salarié** — historique individuel (`/admin/employees/:id/sessions`)

### Espace salarié (`/employee`)
- Pointer une entrée
- Pointer une sortie
- Consulter son historique de pointages

### Authentification
- Page de connexion commune (`/login`)
- Redirection automatique vers l'espace correspondant au rôle (`admin` ou `employee`)
- Les comptes désactivés ne peuvent pas se connecter

---

## Structure du projet

```
TimeFlow/
├── src/
│   ├── app.js                   # Configuration Express (middlewares, routes)
│   ├── server.js                # Point d'entrée, écoute sur le port
│   ├── db/
│   │   ├── prisma.js            # Instance Prisma Client (PostgreSQL)
│   │   └── seed-admin.js        # Crée le compte admin s'il n'existe pas
│   ├── models/
│   │   └── workSession.model.js # Requêtes BDD pour les sessions
│   ├── routes/
│   │   ├── auth.routes.js       # /login, /logout
│   │   ├── admin.routes.js      # /admin/*
│   │   └── employee.routes.js   # /employee/*
│   ├── middlewares/
│   │   └── auth.middleware.js   # requireAuth, requireAdmin
│   └── views/
│       ├── layout/              # header.ejs, footer.ejs (partagés)
│       ├── auth/                # login.ejs
│       ├── admin/               # dashboard, employees, sessions, ...
│       └── employee/            # dashboard.ejs
├── prisma/
│   ├── schema.prisma            # Schéma de la base de données
│   ├── migrations/              # Historique des migrations
│   └── prisma.config.ts         # Configuration Prisma CLI
├── public/
│   └── css/
│       └── main.css             # Styles globaux
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── package.json
```

---

## Base de données

### Table `users`
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PK | Identifiant auto-incrémenté |
| `name` | TEXT | Nom complet |
| `email` | TEXT UNIQUE | Adresse email (identifiant de connexion) |
| `password_hash` | TEXT | Mot de passe hashé (bcrypt) |
| `role` | ENUM | `admin` ou `employee` |
| `is_active` | BOOLEAN | `true` = actif, `false` = désactivé |
| `created_at` | TIMESTAMP | Date de création |

### Table `work_sessions`
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PK | Identifiant auto-incrémenté |
| `user_id` | INTEGER FK | Référence vers `users.id` |
| `start_time` | TIMESTAMP | Heure d'entrée |
| `end_time` | TIMESTAMP | Heure de sortie (`NULL` si en cours) |
| `duration` | INTEGER | Réservé (non utilisé) |

---

## Installation et lancement

### Sans Docker (développement local)

**Prérequis :** Node.js 20+, PostgreSQL

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la base de données dans .env
# DATABASE_URL="postgresql://user:password@localhost:5432/timeflow"

# 3. Appliquer les migrations et créer le compte admin
npx prisma migrate deploy
node src/db/seed-admin.js

# 4. Lancer en mode développement (rechargement automatique)
npm run dev

# ou en mode production
npm start
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

---

### Avec Docker (recommandé)

**Prérequis :** Docker Desktop

```bash
# Construire et démarrer (inclut PostgreSQL)
docker compose up --build

# En arrière-plan
docker compose up --build -d

# Arrêter (données conservées)
docker compose down

# Arrêter et supprimer les données
docker compose down -v
```

> La base de données PostgreSQL est stockée dans un volume Docker nommé `postgres_data`. Elle persiste entre les redémarrages du conteneur.

---

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3000` | Port d'écoute du serveur |
| `NODE_ENV` | — | Environnement (`production`, `development`) |
| `DATABASE_URL` | — | URL de connexion PostgreSQL |

---

## Routes

### Authentification
| Méthode | Route | Description |
|---|---|---|
| GET | `/login` | Page de connexion |
| POST | `/login` | Traitement de la connexion |
| GET | `/logout` | Déconnexion |

### Admin
| Méthode | Route | Description |
|---|---|---|
| GET | `/admin` | Tableau de bord |
| GET | `/admin/employees` | Liste des salariés |
| GET | `/admin/employees/new` | Formulaire nouveau salarié |
| POST | `/admin/employees/new` | Créer un salarié |
| POST | `/admin/employees/:id/disable` | Désactiver un compte |
| POST | `/admin/employees/:id/enable` | Réactiver un compte |
| GET | `/admin/employees/:id/sessions` | Pointages d'un salarié |
| GET | `/admin/sessions` | Tous les pointages |

### Salarié
| Méthode | Route | Description |
|---|---|---|
| GET | `/employee` | Tableau de bord salarié |
| POST | `/employee/start` | Pointer une entrée |
| POST | `/employee/end` | Pointer une sortie |

---

## Rôles et accès

| Rôle | Accès |
|---|---|
| `admin` | Tout l'espace `/admin` |
| `employee` | Uniquement `/employee` (ses propres données) |

Un compte désactivé est bloqué à la connexion.
