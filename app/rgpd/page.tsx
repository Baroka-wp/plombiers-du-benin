'use client';

import React from 'react';
import { Shield, Lock, Eye, FileText, UserCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function RGPDPage() {
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
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Politique de Protection des Données Personnelles (RGPD)
              </h1>
              <p className="text-slate-600 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Introduction */}
          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg text-slate-700 leading-relaxed">
              La présente politique de protection des données personnelles décrit la manière dont nous collectons, 
              utilisons, stockons et protégeons vos données personnelles conformément au Règlement Général sur la 
              Protection des Données (RGPD) et aux lois en vigueur au Bénin.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              1. Responsable du Traitement
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Le responsable du traitement des données personnelles est la plateforme de certification des plombiers 
                du Bénin, qui assure la gestion et la certification des artisans plombiers.
              </p>
              <p className="text-slate-700">
                <strong>Contact :</strong> Pour toute question concernant vos données personnelles, vous pouvez nous 
                contacter via les moyens de communication disponibles sur la plateforme.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-600" />
              2. Données Collectées
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="font-bold text-slate-900 mb-3">Pour les Artisans Plombiers :</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Nom et prénoms</li>
                  <li>Numéro de téléphone (WhatsApp)</li>
                  <li>Adresse complète (département, ville, quartier)</li>
                  <li>Photo de profil</li>
                  <li>Diplôme ou attestation professionnelle</li>
                  <li>Année d'obtention du diplôme</li>
                  <li>Informations de paiement (références de transaction)</li>
                  <li>Données de connexion (adresse IP, logs)</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="font-bold text-slate-900 mb-3">Pour les Utilisateurs/Clients :</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Nom (lors de l'envoi de messages de contact)</li>
                  <li>Numéro de téléphone (lors de l'envoi de messages)</li>
                  <li>Messages et commentaires laissés</li>
                  <li>Notes et avis sur les artisans</li>
                  <li>Données de navigation (cookies, adresse IP)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-emerald-600" />
              3. Finalités du Traitement
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">Vos données personnelles sont collectées et traitées pour :</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>La gestion et la certification des artisans plombiers</li>
                <li>La création et la gestion des comptes utilisateurs</li>
                <li>La vérification de l'authenticité des diplômes et documents</li>
                <li>La mise à disposition de l'annuaire public des artisans certifiés</li>
                <li>La gestion des paiements et transactions</li>
                <li>L'envoi de notifications et communications importantes</li>
                <li>L'amélioration de nos services et de l'expérience utilisateur</li>
                <li>Le respect de nos obligations légales et réglementaires</li>
                <li>La prévention de la fraude et des abus</li>
                <li>La gestion des avis et commentaires clients</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-emerald-600" />
              4. Base Légale du Traitement
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">Le traitement de vos données personnelles repose sur :</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Votre consentement</strong> : Lors de votre inscription et utilisation de la plateforme</li>
                <li><strong>L'exécution d'un contrat</strong> : Pour la fourniture des services de certification</li>
                <li><strong>L'intérêt légitime</strong> : Pour la prévention de la fraude et l'amélioration des services</li>
                <li><strong>L'obligation légale</strong> : Pour le respect des réglementations en vigueur</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-600" />
              5. Conservation des Données
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Vos données personnelles sont conservées pendant les durées suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Données de compte actif</strong> : Pendant toute la durée d'utilisation de la plateforme</li>
                <li><strong>Données de compte inactif</strong> : 3 ans après la dernière connexion</li>
                <li><strong>Données de paiement</strong> : 10 ans conformément aux obligations comptables</li>
                <li><strong>Données de navigation</strong> : 13 mois maximum</li>
                <li><strong>Avis et commentaires</strong> : Conservés tant que le compte est actif</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Au-delà de ces durées, vos données sont supprimées ou anonymisées de manière sécurisée.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-emerald-600" />
              6. Sécurité des Données
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos 
                données personnelles :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Chiffrement des mots de passe (bcrypt)</li>
                <li>Protocole HTTPS pour toutes les communications</li>
                <li>Authentification sécurisée (NextAuth.js)</li>
                <li>Protection contre les injections SQL et XSS</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Sauvegardes régulières et sécurisées</li>
                <li>Hébergement sur des serveurs sécurisés</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              7. Vos Droits
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Conformément au RGPD et aux lois en vigueur, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Droit d'accès</strong> : Vous pouvez demander l'accès à vos données personnelles</li>
                <li><strong>Droit de rectification</strong> : Vous pouvez corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement</strong> : Vous pouvez demander la suppression de vos données</li>
                <li><strong>Droit à la limitation</strong> : Vous pouvez demander la limitation du traitement</li>
                <li><strong>Droit à la portabilité</strong> : Vous pouvez récupérer vos données dans un format structuré</li>
                <li><strong>Droit d'opposition</strong> : Vous pouvez vous opposer au traitement de vos données</li>
                <li><strong>Droit de retrait du consentement</strong> : Vous pouvez retirer votre consentement à tout moment</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Pour exercer ces droits, contactez-nous via les moyens de communication disponibles sur la plateforme.
                Nous répondrons à votre demande dans un délai d'un mois maximum.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-emerald-600" />
              8. Partage des Données
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Vos données personnelles peuvent être partagées avec :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Prestataires de services</strong> : Hébergement (Vercel), base de données (Neon), stockage d'images (Cloudinary), SMS (ClickSend)</li>
                <li><strong>Autorités compétentes</strong> : En cas d'obligation légale ou de demande judiciaire</li>
                <li><strong>Utilisateurs publics</strong> : Nom, prénom, localisation et photo (pour les artisans dans l'annuaire public)</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Nous ne vendons jamais vos données personnelles à des tiers à des fins commerciales.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Cookies et Technologies Similaires</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Nous utilisons des cookies et technologies similaires pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Assurer le fonctionnement de la plateforme</li>
                <li>Mémoriser vos préférences de navigation</li>
                <li>Améliorer l'expérience utilisateur</li>
                <li>Analyser l'utilisation de la plateforme</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Modifications de la Politique</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700">
                Nous nous réservons le droit de modifier la présente politique de protection des données. 
                Toute modification sera communiquée via la plateforme et la date de mise à jour sera indiquée 
                en haut de cette page. Nous vous encourageons à consulter régulièrement cette politique.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Contact</h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Pour toute question concernant cette politique de protection des données ou pour exercer vos droits, 
                vous pouvez nous contacter via les moyens de communication disponibles sur la plateforme.
              </p>
              <p className="text-slate-700">
                <strong>Délai de réponse :</strong> Nous nous engageons à répondre à vos demandes dans un délai 
                maximum d'un mois.
              </p>
            </div>
          </section>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-4 justify-center">
            <Link href="/cgu" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Conditions Générales d'Utilisation
            </Link>
            <span className="text-slate-400">•</span>
            <Link href="/confidentialite" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Politique de Confidentialité
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

