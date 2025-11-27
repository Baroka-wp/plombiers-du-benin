import Link from "next/link";
import { MapPin, ShieldCheck, Search, Star, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-[#FCD116] selection:text-[#008751]">

      {/* Hero Section - Benin Colors */}
      <section className="bg-[#008751] pt-24 pb-32 lg:pt-36 lg:pb-48 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCD116] opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E8112D] opacity-10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">

            {/* Badge Pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCD116] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FCD116]"></span>
              </span>
              Répertoire officiel des artisans du Bénin 🇧🇯
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
              Trouvez un plombier <br className="hidden md:block" />
              <span className="text-[#FCD116]">
                certifié et compétent
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
              Fini les mauvaises surprises. Accédez à l'élite des artisans béninois,
              vérifiés par l'association et recommandés par vos voisins.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/annuaire"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#FCD116] hover:bg-[#e5be14] text-[#008751] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                Trouver un artisan
              </Link>
              <Link
                href="/register"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-transparent hover:bg-white/10 text-white border border-white/40 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
              >
                Je suis plombier
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Stats Section */}
      <section className="relative -mt-24 z-20 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border-t-4 border-[#E8112D] p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-slate-100">
            {[
              { label: "Plombiers Inscrits", value: "500+", color: "text-[#008751]" },
              { label: "Villes Couvertes", value: "12", color: "text-slate-800" },
              { label: "Interventions", value: "2.5k+", color: "text-slate-800" },
              { label: "Note Moyenne", value: "4.8/5", color: "text-[#E8112D]" },
            ].map((stat, i) => (
              <div key={i} className="text-center group hover:bg-slate-50 rounded-xl transition-colors py-2">
                <div className={`text-4xl md:text-5xl font-extrabold ${stat.color} mb-2 tracking-tight`}>{stat.value}</div>
                <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Pourquoi choisir notre répertoire ?
            </h2>
            <p className="text-slate-600 text-lg">
              Nous garantissons la fiabilité des artisans inscrits sur notre plateforme grâce à un processus de vérification strict et transparent.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-white" />,
                bg: "bg-[#008751]",
                title: "Identité Vérifiée",
                desc: "Chaque plombier passe un entretien et fournit ses diplômes avant d'apparaître sur le site."
              },
              {
                icon: <MapPin className="w-8 h-8 text-[#008751]" />,
                bg: "bg-[#FCD116]",
                title: "Proximité Immédiate",
                desc: "Trouvez un artisan dans votre quartier (Cotonou, Calavi, Porto-Novo...) en moins de 2 minutes."
              },
              {
                icon: <Star className="w-8 h-8 text-white" />,
                bg: "bg-[#E8112D]",
                title: "Avis Certifiés",
                desc: "Consultez les notes réelles laissés par les clients précédents. Pas de faux avis ici."
              }
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-[#008751] transition-all duration-300">
                <div className={`${feature.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Flat */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#008751] rounded-[2rem] p-8 md:p-20 overflow-hidden shadow-xl relative">

            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block bg-white/20 text-white font-semibold px-4 py-2 rounded-lg text-sm mb-6">
                  Espace Professionnel
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Boostez votre activité avec le <span className="text-[#FCD116]">Badge Pro</span>
                </h2>
                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  Rejoignez +500 collègues. Obtenez votre carte professionnelle numérique avec QR Code et gagnez instantanément la confiance de nouveaux clients.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-[#008751] bg-white hover:bg-slate-50 transition-colors"
                  >
                    Créer mon compte
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full text-white border border-white/30 hover:bg-white/10 transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>
              </div>

              {/* Illustration Carte - Flat */}
              <div className="hidden lg:flex justify-center">
                <div className="relative group cursor-pointer">
                  {/* Card Container */}
                  <div className="w-[320px] h-[500px] bg-white rounded-3xl shadow-2xl p-6 relative overflow-hidden border-4 border-slate-100">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-[#008751] rounded-xl flex items-center justify-center text-white">
                        <ShieldCheck size={24} />
                      </div>
                      <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        Vérifié
                      </div>
                    </div>

                    {/* Photo & Info */}
                    <div className="text-center mb-8">
                      <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 border-4 border-[#FCD116] overflow-hidden">
                        <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500">Photo</div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Jean D.</h3>
                      <p className="text-slate-500 text-sm">Plombier Certifié • Cotonou</p>
                    </div>

                    {/* QR Code Area */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-center text-white relative overflow-hidden">
                      <div className="w-24 h-24 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center text-slate-900 text-xs font-bold">
                        QR CODE
                      </div>
                      <p className="text-xs text-slate-400">Scanner pour vérifier</p>
                    </div>

                    {/* Decorative bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-[#E8112D]"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer Text */}
      <div className="text-center py-8 text-slate-400 text-sm bg-white">
        <p>Fait avec ❤️ pour les artisans du Bénin</p>
      </div>

    </div>
  );
}