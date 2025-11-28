'use client';

import React from 'react';
import { Lock, Eye, Shield, UserCheck, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2">
            ← Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-12">
          {/* Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-emerald-100 p-3 rounded-full">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Politique de Confidentialité
              </h1>
              <p className="text-slate-600 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Introduction */}
          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg text-slate-700 leading-relaxed">
              La présente politique de confidentialité explique comment nous collectons, utilisons, protégeons et 
              partageons vos informations personnelles lorsque vous utilisez notre plateforme de certification 
              des plombiers du Bénin.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-emerald-600" />
              1. Informations que Nous Collectons
            </h2>
            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Informations que vous nous fournissez :</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Nom et prénoms</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse (département, ville, quartier)</li>
                  <li>Photo de profil</li>
                  <li>Documents professionnels (diplômes, attestations)</li>
                  <li>Messages et commentaires</li>
                  <li>Informations de paiement</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Informations collectées automatiquement :</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Adresse IP</li>
                  <li>Type de navigateur et appareil</li>
                  <li>Pages visitées et temps passé</li>
                  <li>Données de navigation (cookies)</li>
                  <li>Logs d'accès et d'utilisation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              2. Utilisation de Vos Informations
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">Nous utilisons vos informations pour :</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Gérer votre compte et votre certification</li>
                <li>Vérifier l'authenticité de vos documents</li>
                <li>Vous contacter concernant votre compte ou nos services</li>
                <li>Faciliter la mise en relation avec les clients</li>
                <li>Améliorer nos services et votre expérience</li>
                <li>Assurer la sécurité de la plateforme</li>
                <li>Respecter nos obligations légales</li>
                <li>Prévenir la fraude et les abus</li>
                <li>Gérer les paiements et transactions</li>
                <li>Analyser l'utilisation de la plateforme</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-600" />
              3. Partage de Vos Informations
            </h2>
            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Informations publiques (pour les artisans certifiés) :</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Nom et prénom</li>
                  <li>Photo de profil</li>
                  <li>Localisation (département, ville, quartier)</li>
                  <li>Année de diplôme</li>
                  <li>Note moyenne et avis clients</li>
                  <li>Statut de vérification</li>
                </ul>
                <p className="text-slate-700 mt-3">
                  <strong>Note importante :</strong> Votre numéro de téléphone n'est <strong>jamais</strong> affiché publiquement. 
                  Les clients peuvent vous contacter via un formulaire sécurisé qui vous envoie un SMS.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Prestataires de services :</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Hébergement (Vercel) - pour le fonctionnement de la plateforme</li>
                  <li>Base de données (Neon) - pour le stockage sécurisé</li>
                  <li>Stockage d'images (Cloudinary) - pour vos photos et documents</li>
                  <li>Service SMS (Termii) - pour l'envoi de notifications</li>
                </ul>
                <p className="text-slate-700 mt-3">
                  Tous nos prestataires sont soumis à des obligations strictes de confidentialité et de sécurité.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Nous ne partageons jamais :</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Votre numéro de téléphone avec des tiers</li>
                  <li>Vos informations de paiement détaillées</li>
                  <li>Vos données à des fins commerciales non autorisées</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-emerald-600" />
              4. Protection de Vos Informations
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos informations :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Chiffrement</strong> : Toutes les communications sont chiffrées (HTTPS)</li>
                <li><strong>Mots de passe</strong> : Stockés de manière sécurisée avec bcrypt</li>
                <li><strong>Authentification</strong> : Système d'authentification sécurisé (NextAuth.js)</li>
                <li><strong>Accès restreint</strong> : Seuls les administrateurs autorisés ont accès aux données</li>
                <li><strong>Sauvegardes</strong> : Sauvegardes régulières et sécurisées</li>
                <li><strong>Protection contre les attaques</strong> : Mesures contre SQL injection, XSS, etc.</li>
                <li><strong>Hébergement sécurisé</strong> : Serveurs protégés et surveillés</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Conservation de Vos Informations</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Nous conservons vos informations pendant les durées suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Compte actif</strong> : Pendant toute la durée d'utilisation</li>
                <li><strong>Compte inactif</strong> : 3 ans après la dernière connexion</li>
                <li><strong>Données de paiement</strong> : 10 ans (obligations comptables)</li>
                <li><strong>Logs et données techniques</strong> : 13 mois maximum</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Au-delà de ces durées, vos données sont supprimées ou anonymisées de manière sécurisée.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Vos Droits</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Vous disposez des droits suivants concernant vos informations personnelles :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Droit d'accès</strong> : Consulter vos données personnelles</li>
                <li><strong>Droit de rectification</strong> : Corriger vos informations inexactes</li>
                <li><strong>Droit à l'effacement</strong> : Demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité</strong> : Récupérer vos données dans un format structuré</li>
                <li><strong>Droit d'opposition</strong> : Vous opposer au traitement de vos données</li>
                <li><strong>Droit de retrait du consentement</strong> : Retirer votre consentement à tout moment</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Pour exercer ces droits, contactez-nous via les moyens de communication disponibles sur la plateforme. 
                Nous répondrons à votre demande dans un délai d'un mois maximum.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies et Technologies Similaires</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Nous utilisons des cookies et technologies similaires pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Assurer le fonctionnement de la plateforme</li>
                <li>Mémoriser vos préférences</li>
                <li>Améliorer votre expérience utilisateur</li>
                <li>Analyser l'utilisation de la plateforme</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur. 
                Notez que la désactivation de certains cookies peut affecter le fonctionnement de la plateforme.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Protection du Numéro de Téléphone</h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <p className="text-slate-700 mb-4 font-bold">
                Votre numéro de téléphone est particulièrement protégé :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Il n'est <strong>jamais</strong> affiché publiquement sur la plateforme</li>
                <li>Il n'apparaît <strong>pas</strong> dans l'annuaire public</li>
                <li>Il n'est <strong>pas</strong> visible sur votre badge professionnel</li>
                <li>Les clients vous contactent via un formulaire sécurisé</li>
                <li>Vous recevez un SMS avec les coordonnées du client</li>
                <li>Vous décidez ensuite si vous souhaitez répondre</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Cette approche protège votre vie privée tout en permettant aux clients de vous contacter facilement.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Modifications de Cette Politique</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700">
                Nous pouvons modifier cette politique de confidentialité à tout moment. Toute modification sera 
                communiquée via la plateforme et la date de mise à jour sera indiquée en haut de cette page. 
                Nous vous encourageons à consulter régulièrement cette politique pour rester informé de la manière 
                dont nous protégeons vos informations.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-emerald-600" />
              10. Contact
            </h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
                vous pouvez nous contacter via les moyens de communication disponibles sur la plateforme.
              </p>
              <p className="text-slate-700">
                <strong>Délai de réponse :</strong> Nous nous engageons à répondre à vos demandes dans un délai 
                maximum d'un mois.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Liens avec Autres Politiques</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700">
                Cette politique de confidentialité complète notre 
                <Link href="/rgpd" className="text-emerald-600 hover:text-emerald-700 underline mx-1">
                  Politique de Protection des Données (RGPD)
                </Link>
                et nos
                <Link href="/cgu" className="text-emerald-600 hover:text-emerald-700 underline mx-1">
                  Conditions Générales d'Utilisation
                </Link>
                . Nous vous encourageons à les consulter également.
              </p>
            </div>
          </section>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-4 justify-center">
            <Link href="/rgpd" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Politique RGPD
            </Link>
            <span className="text-slate-400">•</span>
            <Link href="/cgu" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Conditions Générales d'Utilisation
            </Link>
            <span className="text-slate-400">•</span>
            <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

