import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12 border-t-4 border-yellow-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="text-yellow-400" />
                        <span className="font-bold text-lg">Répertoire National</span>
                    </div>
                    <p className="text-gray-400 max-w-sm">
                        Une initiative pour moderniser et sécuriser le secteur de la plomberie au Bénin.
                        Plateforme développée sous la supervision des autorités compétentes.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold mb-4 text-emerald-400">Liens Rapides</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link href="/annuaire" className="hover:text-white">Trouver un artisan</Link></li>
                        <li><Link href="/register" className="hover:text-white">Inscription Professionnelle</Link></li>
                        <li><Link href="#" className="hover:text-white">Vérification de Badge</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4 text-emerald-400">Contact Institution</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li>Cotonou, Bénin</li>
                        <li>support@plombiers.bj</li>
                        <li>+229 21 00 00 00</li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Répertoire National des Plombiers du Bénin. Tous droits réservés.
            </div>
        </footer>
    );
}
