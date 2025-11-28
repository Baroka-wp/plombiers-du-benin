'use client';

import React from 'react';
import { FileText, Scale, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import Link from 'next/link';

export default function CGUPage() {
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
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Conditions Générales d'Utilisation (CGU)
              </h1>
              <p className="text-slate-600 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Introduction */}
          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg text-slate-700 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'utilisation de la plateforme 
              de certification des plombiers du Bénin. En accédant et en utilisant cette plateforme, vous acceptez 
              sans réserve les présentes CGU.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-600" />
              1. Objet et Champ d'Application
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                La plateforme a pour objet de :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Certifier et gérer les artisans plombiers qualifiés</li>
                <li>Mettre à disposition un annuaire public des artisans certifiés</li>
                <li>Faciliter la mise en relation entre clients et artisans</li>
                <li>Assurer la traçabilité et la vérification des certifications</li>
                <li>Lutter contre les arnaques et les faux techniciens</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              2. Acceptation des Conditions
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU. 
                Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.
              </p>
              <p className="text-slate-700">
                Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications 
                seront communiquées via la plateforme et prendront effet immédiatement.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-600" />
              3. Inscription et Compte Utilisateur
            </h2>
            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">3.1 Pour les Artisans Plombiers :</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>L'inscription est obligatoire pour obtenir une certification</li>
                  <li>Vous devez fournir des informations exactes et complètes</li>
                  <li>Vous devez être titulaire d'un diplôme ou d'une attestation professionnelle valide</li>
                  <li>Vous vous engagez à ne pas utiliser de faux documents</li>
                  <li>Le paiement des frais de certification est requis</li>
                  <li>La vérification de votre dossier est effectuée par l'administration</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">3.2 Pour les Utilisateurs/Clients :</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>L'inscription n'est pas obligatoire pour consulter l'annuaire</li>
                  <li>Vous pouvez laisser des avis et contacter les artisans</li>
                  <li>Vous vous engagez à fournir des informations exactes lors de l'envoi de messages</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-emerald-600" />
              4. Obligations des Utilisateurs
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">Vous vous engagez à :</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Utiliser la plateforme conformément à sa destination</li>
                <li>Ne pas utiliser la plateforme à des fins illégales ou frauduleuses</li>
                <li>Ne pas tenter de contourner les mesures de sécurité</li>
                <li>Ne pas diffuser de contenus illicites, diffamatoires ou offensants</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Ne pas perturber le fonctionnement de la plateforme</li>
                <li>Ne pas créer de faux comptes ou usurper l'identité d'autrui</li>
                <li>Pour les artisans : maintenir vos informations à jour</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-emerald-600" />
              5. Interdictions et Sanctions
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-slate-700 mb-4 font-bold">
                Les actions suivantes sont strictement interdites et peuvent entraîner des sanctions :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Utilisation de faux documents ou diplômes</li>
                <li>Fausses déclarations ou informations trompeuses</li>
                <li>Usurpation d'identité</li>
                <li>Harcèlement ou comportement abusif</li>
                <li>Spam ou envoi de messages non sollicités</li>
                <li>Tentative de piratage ou d'accès non autorisé</li>
                <li>Utilisation de robots ou scripts automatisés</li>
              </ul>
              <p className="text-slate-700 mt-4 font-bold">
                En cas de violation, nous nous réservons le droit de :
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Suspendre ou supprimer votre compte</li>
                <li>Refuser ou annuler votre certification</li>
                <li>Poursuivre en justice conformément aux lois béninoises</li>
                <li>Signaler les infractions aux autorités compétentes</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Certification et Badge</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>La certification est délivrée après vérification de votre dossier par l'administration</li>
                <li>Le badge numérique est personnel et non transférable</li>
                <li>Le QR Code permet de vérifier l'authenticité de votre certification</li>
                <li>Vous devez présenter votre badge lors de vos interventions</li>
                <li>La certification peut être révoquée en cas de manquement aux obligations</li>
                <li>Le renouvellement peut être requis selon les conditions établies</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Paiements et Frais</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Les frais de certification sont indiqués lors de l'inscription</li>
                <li>Le paiement est requis pour finaliser la certification</li>
                <li>Les paiements sont traités de manière sécurisée</li>
                <li>Les références de transaction sont conservées pour traçabilité</li>
                <li>En cas de refus de certification, les frais peuvent être remboursés selon les conditions établies</li>
                <li>Les frais de renouvellement peuvent s'appliquer</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Avis et Commentaires</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Les utilisateurs peuvent laisser des avis et notes sur les artisans</li>
                <li>Les avis doivent être objectifs et respectueux</li>
                <li>Les avis diffamatoires ou offensants peuvent être modérés</li>
                <li>Les artisans peuvent consulter leurs avis mais ne peuvent pas les supprimer</li>
                <li>La note moyenne est calculée automatiquement</li>
                <li>Nous nous réservons le droit de modérer les contenus inappropriés</li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Propriété Intellectuelle</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Tous les éléments de la plateforme (design, logo, code, contenu) sont protégés par les droits de 
                propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation préalable.
              </p>
              <p className="text-slate-700">
                Les contenus que vous publiez (photos, textes) restent votre propriété, mais vous nous accordez 
                une licence d'utilisation pour les besoins de la plateforme.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Disponibilité et Responsabilité</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Nous nous efforçons d'assurer une disponibilité continue de la plateforme</li>
                <li>Des interruptions peuvent survenir pour maintenance ou mise à jour</li>
                <li>Nous ne garantissons pas l'absence d'erreurs ou de bugs</li>
                <li>Nous ne sommes pas responsables des dommages indirects</li>
                <li>La plateforme est fournie "en l'état" sans garantie expresse</li>
                <li>Nous ne sommes pas responsables des relations entre clients et artisans</li>
                <li>Nous ne garantissons pas les résultats des interventions des artisans</li>
              </ul>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Protection des Données</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Le traitement de vos données personnelles est régi par notre 
                <Link href="/rgpd" className="text-emerald-600 hover:text-emerald-700 underline mx-1">
                  Politique de Protection des Données (RGPD)
                </Link>
                et notre
                <Link href="/confidentialite" className="text-emerald-600 hover:text-emerald-700 underline mx-1">
                  Politique de Confidentialité
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Droit Applicable et Juridiction</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                Les présentes CGU sont régies par le droit béninois. En cas de litige, les parties s'engagent 
                à rechercher une solution amiable. À défaut, les tribunaux compétents du Bénin seront seuls compétents.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Contact</h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <p className="text-slate-700">
                Pour toute question concernant les présentes CGU, vous pouvez nous contacter via les moyens 
                de communication disponibles sur la plateforme.
              </p>
            </div>
          </section>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-4 justify-center">
            <Link href="/rgpd" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Politique RGPD
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

