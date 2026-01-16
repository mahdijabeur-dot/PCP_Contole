# Formulaire IRO – Branchements SQL Server

Ce package connecte le formulaire IRO à **SQL Server** via le pilote Node.js `mssql` et stocke les données dans des tables `incidents` et `files`.

## 1) Pré-requis
- SQL Server (on-premise ou Docker) accessible depuis le serveur applicatif.
- Un utilisateur ayant droits `CREATE TABLE`, `INSERT`, `SELECT` sur la base.
- Node.js >= 18.

## 2) Installation
```bash
npm install
npm start
```
> Configurez vos variables dans `server/.env` (copiez `server/.env.example`).

## 3) Configuration
`server/.env` :
```
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_DB=riskops
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=Your_password123
SQLSERVER_ENCRYPT=false
SQLSERVER_TRUST_CERT=true
PORT=3000
```
- **encrypt**: `true` en production (TLS) ; `trustServerCertificate` à `false` si vous avez un certificat valide.
- Pour Docker : exposez le port `1433`.

## 4) Schéma
Le démarrage exécute un **bootstrap** qui crée les tables si elles n’existent pas. Vous pouvez aussi exécuter manuellement `server/sql/schema.sql` sur votre base.

## 5) API
- `POST /api/incidents` (**multipart/form-data**) : insert + métadonnées des pièces.
- `GET /api/incidents` : liste synthétique.
- `GET /api/incidents/:id` : détail + pièces.

## 6) Sécurité & conformité
- Placez l’API derrière **HTTPS** et **SSO** / Token.
- Limitez les types et tailles de fichiers (défaut 10 Mo).
- Journalisez les ID de corrélation et surveillez les **SLA**.

## 7) Dépannage
- Vérifiez la connectivité (`telnet <host> 1433`).
- `SQLSERVER_ENCRYPT=true` + `SQLSERVER_TRUST_CERT=false` si vous avez un certificat signé.
- Logs applicatifs : console du serveur.
