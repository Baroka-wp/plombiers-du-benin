"use client";

import Link from "next/link";
import { Shield, Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 cursor-pointer">
                    {/* Logo Conceptuel */}
                    <div className="bg-emerald-700 text-white p-2 rounded-lg">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-emerald-900 leading-tight">
                            Répertoire National
                        </h1>
                        <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
                            Des Plombiers du Bénin
                        </p>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/annuaire" className="text-gray-600 hover:text-emerald-700 font-medium transition">
                        Annuaire
                    </Link>
                    <Link href="#" className="text-gray-600 hover:text-emerald-700 font-medium transition">
                        Vérifier un Badge
                    </Link>
                    <Link
                        href="#"
                        className="text-emerald-700 font-bold hover:bg-emerald-50 px-4 py-2 rounded-lg transition"
                    >
                        Connexion Artisan
                    </Link>
                    <Link
                        href="/register"
                        className="bg-yellow-400 hover:bg-yellow-500 text-emerald-900 px-5 py-2.5 rounded-lg font-bold shadow-sm transition flex items-center gap-2"
                    >
                        S'inscrire <ArrowRight size={18} />
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        className="text-gray-600 p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link
                            href="/annuaire"
                            className="block px-3 py-3 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Annuaire
                        </Link>
                        <Link
                            href="#"
                            className="block px-3 py-3 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Vérifier un Badge
                        </Link>
                        <div className="border-t border-gray-100 my-2 pt-2">
                            <Link
                                href="#"
                                className="block px-3 py-3 text-emerald-700 font-bold hover:bg-emerald-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Connexion Artisan
                            </Link>
                            <Link
                                href="/register"
                                className="block px-3 py-3 bg-yellow-400 text-emerald-900 font-bold rounded-lg text-center mt-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                S'inscrire
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
