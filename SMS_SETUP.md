# Configuration SMS avec Africa's Talking

## Pourquoi Africa's Talking ?

- ✅ **Gratuit pour tests** : Sandbox avec SMS gratuits illimités
- ✅ **Spécialisé Afrique** : Support parfait pour le Bénin (+229)
- ✅ **Facile à configurer** : API simple et bien documentée
- ✅ **Pas de carte bancaire** : Pas besoin de CB pour tester

## Étapes de configuration

### 1. Créer un compte gratuit

1. Aller sur [https://account.africastalking.com/auth/register](https://account.africastalking.com/auth/register)
2. S'inscrire avec un email
3. Vérifier l'email et se connecter

### 2. Obtenir les credentials

#### En mode Sandbox (Gratuit - Pour tester)

1. Se connecter au dashboard
2. Aller dans **"Apps" > "Sandbox App"**
3. Noter :
   - **Username** : `sandbox`
   - **API Key** : Cliquer sur "Settings" puis "API Key" (générer si nécessaire)

#### En mode Production (Payant - Pour déploiement)

1. Créer une nouvelle app
2. Ajouter des crédits (à partir de $10)
3. Noter le **Username** et **API Key**

### 3. Configurer les variables d'environnement

Ajouter dans votre fichier `.env` :

```env
# Africa's Talking SMS Configuration
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=votre_api_key_ici
```

### 4. Tester en Sandbox

En mode **sandbox**, les SMS ne sont PAS réellement envoyés mais vous recevez une confirmation de succès.

Pour tester avec de vrais SMS :
- Utiliser les **numéros de test** fournis par Africa's Talking
- Les SMS seront envoyés uniquement vers ces numéros

### 5. Passer en Production

1. Créer une app de production
2. Ajouter des crédits ($10 minimum)
3. Changer `AFRICASTALKING_USERNAME` par le nom de votre app
4. Utiliser la nouvelle API Key de production

## Tarifs

### Sandbox (Test)
- **Gratuit** : SMS illimités vers numéros de test
- Limité à quelques numéros de destination

### Production
- **Bénin** : ~$0.03 par SMS (environ 15 FCFA)
- **Autres pays africains** : $0.02 - $0.05 par SMS
- Pas d'abonnement mensuel
- Paiement à l'usage uniquement

## Documentation officielle

- Site : [https://africastalking.com](https://africastalking.com)
- Docs : [https://developers.africastalking.com](https://developers.africastalking.com)
- Pricing : [https://africastalking.com/pricing](https://africastalking.com/pricing)

## Support

- Email : support@africastalking.com
- Slack Community : [Africa's Talking Slack](https://slack.africastalking.com)

