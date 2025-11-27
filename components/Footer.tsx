import Link from "next/link";
import { Wrench } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t-4 border-[#FCD116]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4 text-white">
                        <Wrench className="h-5 w-5 text-[#008751]" />
                        <span className="font-bold text-lg">Les Plombiers du Bénin</span>
                    </div>
                    <p className="max-w-xs">
                        La première plateforme numérique regroupant les artisans plombiers certifiés du Bénin. Qualité, confiance et proximité.
                    </p>
                </div>
                <div>
                    <h3 className="text-white font-semibold mb-4">Liens Rapides</h3>
                    <ul className="space-y-2">
                        <li><Link href="/annuaire" className="hover:text-[#FCD116]">Annuaire</Link></li>
                        <li><Link href="/register" className="hover:text-[#FCD116]">Devenir Membre</Link></li>
                        <li><Link href="/about" className="hover:text-[#FCD116]">À propos</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-semibold mb-4">Contact</h3>
                    <ul className="space-y-2">
                        <li>Cotonou, Bénin</li>
                        <li>contact@plombiersbenin.bj</li>
                        <li>+229 01 00 00 00</li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
                &copy; {new Date().getFullYear()} Association des Plombiers du Bénin. Tous droits réservés.
            </div>
        </footer>
    );
}
