"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Phone, Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SetupPasswordPage() {
  const router = useRouter();
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/plumbers/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du mot de passe");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/artisan/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-50 font-sans flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mot de passe créé !
          </h2>
          <p className="text-gray-600">
            Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/artisan/login"
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium text-sm">Retour à la connexion</span>
          </Link>
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <Shield size={20} />
            <span>Espace Artisan</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-16">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer mon mot de passe
          </h1>
          <p className="text-gray-600">
            Configurez votre mot de passe pour accéder à votre espace
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Telephone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Numéro de téléphone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="97 00 00 00"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500">
                Le numéro utilisé lors de votre inscription
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Minimum 6 caractères
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95"
            >
              {isLoading ? "Création..." : "Créer mon mot de passe"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

