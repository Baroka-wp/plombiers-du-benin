"use client";

import React, { useState } from 'react';
import { Search, Shield, CheckCircle, MapPin, QrCode, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [departement, setDepartement] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (departement) params.append('departement', departement);
    if (searchTerm) params.append('search', searchTerm);
    
    const queryString = params.toString();
    router.push(`/annuaire${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* --- Hero Section (Drapeau stylisé en fond) --- */}
      <section className="relative bg-emerald-800 text-white overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-700 skew-x-12 transform origin-bottom translate-x-20 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500 rounded-full blur-3xl opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-900/50 px-4 py-2 rounded-full border border-emerald-600 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-emerald-100 text-sm font-medium">Plateforme Officielle de Certification</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Trouvez un plombier <br />
            <span className="text-yellow-400">qualifié et certifié</span> au Bénin
          </h2>

          <p className="text-xl text-emerald-100 max-w-2xl mb-10">
            Sécurisez vos travaux avec des artisans vérifiés par l'institution.
            Consultez leurs badges, vérifiez leurs diplômes et accédez à leurs contacts.
          </p>

          {/* Barre de recherche rapide */}
          <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 text-left">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <select 
                value={departement}
                onChange={(e) => setDepartement(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 text-gray-700 font-medium h-full appearance-none"
              >
                <option value="">Tous les départements</option>
                <option value="Alibori">Alibori</option>
                <option value="Atacora">Atacora</option>
                <option value="Atlantique">Atlantique</option>
                <option value="Borgou">Borgou</option>
                <option value="Collines">Collines</option>
                <option value="Couffo">Couffo</option>
                <option value="Donga">Donga</option>
                <option value="Littoral">Littoral</option>
                <option value="Mono">Mono</option>
                <option value="Ouémé">Ouémé</option>
                <option value="Plateau">Plateau</option>
                <option value="Zou">Zou</option>
              </select>
            </div>
            <div className="flex-[2] relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ville, quartier ou nom..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 h-full"
              />
            </div>
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition shadow-lg w-full md:w-auto"
            >
              Rechercher
            </button>
          </form>

          <div className="mt-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 text-emerald-200 text-sm">
            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-400" /> Identité Vérifiée</span>
            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-400" /> Diplôme Validé</span>
            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-400" /> QR Code Sécurisé</span>
          </div>
        </div>
      </section>

      {/* --- Section Confiance --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Pourquoi faire appel à un artisan du <span className="text-emerald-600">Répertoire National</span> ?
              </h3>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Certification Officielle</h4>
                    <p className="text-gray-600 mt-1">
                      Chaque artisan inscrit passe par un processus de validation strict de ses diplômes et de son identité avant d'apparaître ici.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Badge Numérique Inviolable</h4>
                    <p className="text-gray-600 mt-1">
                      Demandez à voir le badge. Le QR Code fonctionne même sans internet et vous garantit que l'artisan est en règle.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Lutte contre l'arnaque</h4>
                    <p className="text-gray-600 mt-1">
                      En centralisant les professionnels, nous réduisons les risques de faux techniciens et garantissons la traçabilité des interventions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Illustration Badge (Mockup CSS) */}
            <div className="relative mt-8 md:mt-0">
              <div className="absolute -inset-4 bg-emerald-200 rounded-2xl transform rotate-3 opacity-30"></div>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 relative">
                <div className="flex items-center gap-4 mb-6 border-b pb-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1581578731117-1045296611b8?q=80&w=200&auto=format&fit=crop" alt="Artisan" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Badge Certifié</div>
                    <div className="text-2xl font-bold text-gray-900">Jean DOVI</div>
                    <div className="text-gray-500">Plombier - Cotonou</div>
                  </div>
                  <Shield className="ml-auto text-emerald-500 h-12 w-12 opacity-20" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Statut</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-xs flex items-center gap-1">
                      <CheckCircle size={12} /> ACTIF
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ID National</span>
                    <span className="font-mono text-gray-700">BEN-PLOMB-2024-8842</span>
                  </div>
                  <div className="pt-4 flex justify-center">
                    {/* Fake QR */}
                    <div className="bg-white p-2 rounded-lg border-2 border-gray-900">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=PREUVE_CERTIFICATION_BENIN"
                        alt="QR Code"
                        className="h-24 w-24"
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-2">Scannez pour vérifier l'authenticité</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}