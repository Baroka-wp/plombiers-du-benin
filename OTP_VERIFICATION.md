# Système de vérification par OTP

## Vue d'ensemble

Le système OTP (One-Time Password) permet de vérifier que le numéro de téléphone appartient bien à l'artisan. Un code à 6 chiffres est envoyé par SMS et doit être saisi pour confirmer le numéro.

## Workflow utilisateur

### 1. Modification du téléphone

L'artisan accède à son dashboard et clique sur "Modifier" :

1. Change son numéro de téléphone
2. Un message d'avertissement apparaît : "⚠️ Vous devrez vérifier ce nouveau numéro par SMS"
3. Clique sur "Enregistrer"

### 2. Modal de vérification

Un modal s'ouvre avec le nouveau numéro :

**Étape 1 : Envoi du code**
- Affiche le numéro à vérifier
- Bouton "Envoyer le code par SMS"
- L'artisan reçoit un SMS avec le code 6 chiffres

**Étape 2 : Vérification**
- Champ de saisie pour le code (6 chiffres)
- Bouton "Vérifier"
- Bouton "Renvoyer" si besoin

### 3. Confirmation

Une fois le code vérifié :
- ✅ Le téléphone est mis à jour
- ✅ Le statut `phoneVerified` passe à `true`
- ✅ Un badge "Vérifié" vert apparaît à côté du numéro
- ✅ Les autres informations du profil sont également mises à jour

## Sécurité

### Expiration
- **Durée de validité** : 5 minutes
- Après expiration, un nouveau code doit être demandé

### Limite de tentatives
- **Maximum** : 3 tentatives par code
- Au-delà, le code est invalidé et un nouveau doit être demandé

### Protection
- ✅ Authentification requise (session NextAuth)
- ✅ Validation du format téléphone (8 chiffres)
- ✅ Logging de toutes les opérations
- ✅ Code stocké temporairement en mémoire (pas en DB)

## Architecture technique

### Backend

**lib/otp-store.ts**
```typescript
- generateOTP() : Génère un code 6 chiffres aléatoire
- storeOTP(phone, code) : Stocke avec expiration 5 min
- verifyOTP(phone, code) : Vérifie avec limite 3 tentatives
```

**API Routes**
```
POST /api/otp/send
- Envoie l'OTP par SMS via Africa's Talking
- Requiert une session authentifiée
- Retourne success: true si envoyé

POST /api/otp/verify
- Vérifie le code OTP
- Met à jour telephone et phoneVerified
- Retourne success: true si valide
```

### Frontend

**État du composant**
```typescript
showOTPVerification: boolean  // Afficher le modal
otpCode: string              // Code saisi
sendingOTP: boolean          // État d'envoi
verifyingOTP: boolean        // État de vérification
otpSent: boolean             // Code déjà envoyé
phoneChanged: boolean        // Téléphone modifié
```

**Flux de données**
```
1. handleSave() détecte le changement de téléphone
2. Ouvre le modal OTP
3. handleSendOTP() envoie le code
4. Utilisateur saisit le code
5. handleVerifyOTP() vérifie et met à jour
```

## Stockage OTP

### En développement (actuel)
- **Stockage** : En mémoire (Map JavaScript)
- **Persistance** : Non (redémarrage serveur = perte)
- **Adapté pour** : Démo, tests

### En production (recommandé)
- **Stockage** : Redis ou Database
- **Persistance** : Oui
- **Adapté pour** : Production avec scaling

### Migration vers Redis (optionnel)

```bash
npm install ioredis
```

```typescript
// lib/otp-store-redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export function storeOTP(phone: string, code: string) {
  redis.setex(`otp:${phone}`, 300, JSON.stringify({
    code,
    attempts: 0
  }));
}
```

## Messages SMS

### Format du SMS
```
Votre code de vérification Plombiers Bénin est: 123456. Valide 5 minutes.
```

### Coût
- **Sandbox** : Gratuit (numéros de test)
- **Production** : ~0.03$ par SMS (~15 FCFA)

## Indicateurs visuels

### Badge "Vérifié"
- ✅ Affiché si `phoneVerified = true`
- 🟢 Couleur verte
- 📍 Position : à côté du champ téléphone

### Avertissement
- ⚠️ Affiché si le numéro a changé
- 🟡 Couleur ambre
- 📝 Message : "Vous devrez vérifier ce nouveau numéro par SMS"

## Cas d'usage

### Premier numéro (inscription)
- `phoneVerified = false` par défaut
- L'artisan peut utiliser le système normalement
- Recommandé de vérifier pour crédibilité

### Changement de numéro
- **Obligatoire** : Vérification OTP
- Le nouveau numéro remplace l'ancien
- `phoneVerified` est remis à `true` après vérification

### Numéro déjà vérifié
- Badge "Vérifié" visible
- Pas de nouvelle vérification nécessaire sauf si changement

## Tests

### En mode Sandbox
1. Configurer Africa's Talking en sandbox
2. Utiliser les numéros de test fournis
3. Les SMS seront simulés (pas réellement envoyés)

### En mode Production
1. Ajouter des crédits Africa's Talking
2. Tester avec de vrais numéros
3. Les SMS seront réellement envoyés

## Améliorations futures

- [ ] Limiter le nombre d'envois par jour (anti-spam)
- [ ] Ajouter un cooldown entre les envois (ex: 1 minute)
- [ ] Migrer vers Redis pour la persistance
- [ ] Ajouter des analytics sur les vérifications
- [ ] Support de la vérification par appel vocal (fallback)

