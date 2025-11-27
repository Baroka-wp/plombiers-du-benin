"use client";

import Link from "next/link";
import { Wrench, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-[#008751] p-2 rounded-lg group-hover:bg-[#006b40] transition-colors">
                            <Wrench className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-800">
                            Les Plombiers <span className="text-[#E8112D]">du Bénin</span>
                        </span>
                    </Link>

                    {/* Menu Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/annuaire" className="text-slate-600 hover:text-[#008751] font-medium transition-colors">
                            Trouver un plombier
                        </Link>
                        <Link href="/verifier" className="text-slate-600 hover:text-[#008751] font-medium transition-colors">
                            Vérifier un badge
                        </Link>
                        <div className="flex items-center gap-4 ml-4">
                            <Link
                                href="/login"
                                className="text-slate-600 hover:text-slate-900 font-medium px-3 py-2"
                            >
                                Connexion
                            </Link>
                            <Link
                                href="/register"
                                className="bg-[#008751] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#006b40] transition-all shadow-md hover:shadow-lg"
                            >
                                S'inscrire
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-600 hover:text-slate-900 p-2"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link
                            href="/annuaire"
                            className="block px-3 py-3 text-slate-600 hover:bg-slate-50 hover:text-[#008751] rounded-lg font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Trouver un plombier
                        </Link>
                        <Link
                            href="/verifier"
                            className="block px-3 py-3 text-slate-600 hover:bg-slate-50 hover:text-[#008751] rounded-lg font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Vérifier un badge
                        </Link>
                        <div className="border-t border-slate-100 my-2 pt-2">
                            <Link
                                href="/login"
                                className="block px-3 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Connexion
                            </Link>
                            <Link
                                href="/register"
                                className="block px-3 py-3 text-[#008751] font-bold hover:bg-green-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                S'inscrire maintenant
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

