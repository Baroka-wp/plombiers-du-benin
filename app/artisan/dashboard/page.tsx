"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  User,
  MapPin,
  Phone,
  LogOut,
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle,
  Download,
  FileText,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Toast from "@/components/Toast";

interface PlumberData {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  phoneVerified: boolean;
  photoUrl: string | null;
  departement: string;
  ville: string;
  quartier: string;
  isVerified: boolean;
  hasPaid: boolean;
  membershipId: string | null;
  diplomeFileUrl: string;
  smsCredits: number;
}

const LOCATIONS: Record<string, string[]> = {
  Alibori: ["Banikoara", "Gogounou", "Kandi", "Karimama", "Malanville", "Ségbana"],
  Atacora: ["Boukoumbé", "Cobly", "Kérou", "Kouandé", "Matéri", "Natitingou", "Péhunco", "Tanguiéta", "Toucountouna"],
  Atlantique: ["Abomey-Calavi", "Allada", "Kpomassè", "Ouidah", "Sô-Ava", "Toffo", "Tori-Bossito", "Zè"],
  Borgou: ["Bembéréké", "Kalalé", "N'Dali", "Nikki", "Parakou", "Pèrèrè", "Sinendé", "Tchaourou"],
  Collines: ["Bantè", "Dassa-Zoumè", "Glazoué", "Ouèssè", "Savalou", "Savè"],
  Couffo: ["Aplahoué", "Djakotomey", "Dogbo", "Klouékanmè", "Lalo", "Toviklin"],
  Donga: ["Bassila", "Copargo", "Djougou", "Ouaké"],
  Littoral: ["Cotonou"],
  Mono: ["Athiémé", "Bopa", "Comè", "Grand-Popo", "Houéyogbé", "Lokossa"],
  Ouémé: ["Adjarra", "Adjohoun", "Aguégués", "Akpro-Missérété", "Avrankou", "Bonou", "Dangbo", "Porto-Novo", "Sèmè-Kpodji"],
  Plateau: ["Adja-Ouèrè", "Ifangni", "Kétou", "Pobè", "Sakété"],
  Zou: ["Abomey", "Agbangnizoun", "Bohicon", "Covè", "Djidja", "Ouinhi", "Za-Kpota", "Zagnanado", "Zogbodomey"],
};

export default function ArtisanDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plumber, setPlumber] = useState<PlumberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<{
    totalContactRequests: number;
    recentContactRequests: any[];
    reviewCount: number;
    averageRating: number;
  } | null>(null);
  const [editForm, setEditForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    departement: "",
    ville: "",
    quartier: "",
  });

  // OTP verification state
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [otpPinId, setOtpPinId] = useState<string | null>(null); // OurVoice OTP ID
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("05:00");
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargingCredits, setRechargingCredits] = useState(false);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<number | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/artisan/login");
    } else if (status === "authenticated" && session?.user?.id) {
      loadPlumberData();
    }
  }, [status, session, router]);

  // Timer pour le décompte OTP
  useEffect(() => {
    if (!otpExpiresAt || !otpSent) {
      setTimeRemaining("05:00");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = otpExpiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("00:00");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt, otpSent]);

  const loadPlumberData = async () => {
    try {
      const response = await fetch(`/api/plumbers/${session?.user?.id}`);
      if (!response.ok) throw new Error("Erreur lors du chargement");

      const data = await response.json();
      setPlumber(data);
      setEditForm({
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        departement: data.departement,
        ville: data.ville,
        quartier: data.quartier,
      });

      // Charger les statistiques
      try {
        const statsResponse = await fetch(`/api/plumbers/${session?.user?.id}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        } else {
          console.error("Failed to load stats:", statsResponse.status);
          // Initialiser avec des valeurs par défaut
          setStats({
            totalContactRequests: 0,
            recentContactRequests: [],
            reviewCount: 0,
            averageRating: 0,
          });
        }
      } catch (error) {
        console.error("Error loading stats:", error);
        // Initialiser avec des valeurs par défaut en cas d'erreur
        setStats({
          totalContactRequests: 0,
          recentContactRequests: [],
          reviewCount: 0,
          averageRating: 0,
        });
      }
    } catch (error) {
      console.error("Error loading plumber:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (plumber) {
      setEditForm({
        nom: plumber.nom,
        prenom: plumber.prenom,
        telephone: plumber.telephone,
        departement: plumber.departement,
        ville: plumber.ville,
        quartier: plumber.quartier,
      });
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    // If phone changed and not verified, show OTP modal
    if (phoneChanged && editForm.telephone !== plumber?.telephone) {
      setShowOTPVerification(true);
      setOtpSent(false);
      setOtpCode("");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/plumbers/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      await loadPlumberData();
      setIsEditing(false);
      setPhoneChanged(false);
      setToast({ message: "Profil mis à jour avec succès", type: "success" });
    } catch (error) {
      console.error("Error updating plumber:", error);
      setToast({ message: "Erreur lors de la mise à jour du profil", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendOTP = async () => {
    setSendingOTP(true);
    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone: editForm.telephone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      // Stocker l'ID OTP de OurVoice pour vérification
      setOtpPinId(data.pinId);
      setOtpSent(true);
      // Définir l'expiration à 5 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);
      setOtpExpiresAt(expiresAt);
      setToast({ message: "Code envoyé par SMS avec succès !", type: "success" });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Erreur lors de l'envoi du code", type: "error" });
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpPinId) {
      setToast({ message: "Erreur: Veuillez renvoyer le code", type: "error" });
      return;
    }

    setVerifyingOTP(true);
    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinId: otpPinId, code: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Code invalide");
      }

      // Update all fields including telephone after OTP verification
      const updateResponse = await fetch(`/api/plumbers/${session?.user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: editForm.nom,
          prenom: editForm.prenom,
          telephone: editForm.telephone, // Include telephone after OTP verification
          phoneVerified: true, // Mark phone as verified after successful OTP verification
          departement: editForm.departement,
          ville: editForm.ville,
          quartier: editForm.quartier,
        }),
      });

      if (!updateResponse.ok) throw new Error("Erreur lors de la mise à jour");

      await loadPlumberData();
      setShowOTPVerification(false);
      setIsEditing(false);
      setPhoneChanged(false);
      setToast({ message: "Téléphone vérifié et profil mis à jour avec succès !", type: "success" });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Erreur lors de la vérification", type: "error" });
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleRechargeCredits = async () => {
    if (!selectedCreditPackage) {
      setToast({ message: "Veuillez sélectionner un package", type: "error" });
      return;
    }

    setRechargingCredits(true);
    try {
      const response = await fetch(`/api/plumbers/${session?.user?.id}/sms-credits/recharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: selectedCreditPackage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du rechargement");
      }

      setToast({ message: `✅ ${selectedCreditPackage} crédits rechargés avec succès !`, type: "success" });
      setShowRechargeModal(false);
      setSelectedCreditPackage(null);
      
      // Recharger les données du plombier
      await loadPlumberData();
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Erreur lors du rechargement", type: "error" });
    } finally {
      setRechargingCredits(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!plumber) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Impossible de charger votre profil</p>
          <button
            onClick={() => router.push("/artisan/login")}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <Shield size={24} />
              <span>Tableau de bord</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition px-4 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {plumber.prenom} {plumber.nom} !
          </h1>
          <p className="text-emerald-100">
            Gérez votre profil professionnel et vos informations
          </p>
        </div>

        {/* KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Prises de contact</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.totalContactRequests ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Avis clients</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.reviewCount ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Note moyenne</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats && stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div className={`bg-white rounded-xl shadow-md border-2 p-6 ${
              plumber.smsCredits === 0 
                ? 'border-red-300 bg-red-50' 
                : plumber.smsCredits < 5 
                ? 'border-yellow-300 bg-yellow-50' 
                : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Crédits SMS</p>
                  <p className={`text-3xl font-bold ${
                    plumber.smsCredits === 0 
                      ? 'text-red-600' 
                      : plumber.smsCredits < 5 
                      ? 'text-yellow-600' 
                      : 'text-slate-900'
                  }`}>
                    {plumber.smsCredits}
                  </p>
                  {plumber.smsCredits === 0 && (
                    <p className="text-xs text-red-600 mt-1 font-medium">Rechargez maintenant</p>
                  )}
                  {plumber.smsCredits > 0 && plumber.smsCredits < 5 && (
                    <p className="text-xs text-yellow-600 mt-1 font-medium">Bientôt épuisé</p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  plumber.smsCredits === 0 
                    ? 'bg-red-100' 
                    : plumber.smsCredits < 5 
                    ? 'bg-yellow-100' 
                    : 'bg-blue-100'
                }`}>
                  <Phone className={`w-6 h-6 ${
                    plumber.smsCredits === 0 
                      ? 'text-red-600' 
                      : plumber.smsCredits < 5 
                      ? 'text-yellow-600' 
                      : 'text-blue-600'
                  }`} />
                </div>
              </div>
              <button
                onClick={() => setShowRechargeModal(true)}
                className={`mt-4 w-full py-2 px-4 rounded-lg font-medium text-sm transition ${
                  plumber.smsCredits === 0
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                Recharger les crédits
              </button>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Mon Profil</h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                  >
                    <Edit size={18} />
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition"
                    >
                      <X size={18} />
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Photo */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border-4 border-emerald-600">
                  {plumber.photoUrl ? (
                    <Image
                      src={plumber.photoUrl}
                      alt={`${plumber.prenom} ${plumber.nom}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">
                      {plumber.prenom[0]}
                      {plumber.nom[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {plumber.prenom} {plumber.nom}
                  </h3>
                  {plumber.membershipId && (
                    <p className="text-emerald-600 font-mono text-sm font-bold">
                      ID: {plumber.membershipId}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {plumber.isVerified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        <CheckCircle size={14} />
                        Vérifié
                      </span>
                    )}
                    {plumber.hasPaid && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        <CheckCircle size={14} />
                        Actif
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={editForm.nom}
                          onChange={(e) =>
                            setEditForm({ ...editForm, nom: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={editForm.prenom}
                          onChange={(e) =>
                            setEditForm({ ...editForm, prenom: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">
                        Téléphone (WhatsApp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500 font-medium border-r pr-2 border-slate-300">
                          +229
                        </span>
                        <input
                          type="tel"
                          value={editForm.telephone}
                          onChange={(e) => {
                            // Only allow numbers and limit to 10 digits
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setEditForm({ ...editForm, telephone: value });
                            if (value !== plumber?.telephone) {
                              setPhoneChanged(true);
                            }
                          }}
                          placeholder="97000000 ou 22997000000"
                          maxLength={10}
                          className="w-full pl-16 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 bg-white"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500">
                          Ce numéro servira à recevoir les demandes clients
                        </p>
                        {plumber?.phoneVerified && !phoneChanged && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle size={14} />
                            Vérifié
                          </span>
                        )}
                      </div>
                      {phoneChanged && (
                        <p className="text-xs text-amber-600 font-medium mt-1">
                          ⚠️ Vous devrez vérifier ce nouveau numéro par SMS
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">
                          Département
                        </label>
                        <select
                          value={editForm.departement}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              departement: e.target.value,
                              ville: "",
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 bg-white"
                        >
                          {Object.keys(LOCATIONS)
                            .sort()
                            .map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">
                          Ville
                        </label>
                        <select
                          value={editForm.ville}
                          onChange={(e) =>
                            setEditForm({ ...editForm, ville: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 bg-white"
                        >
                          {LOCATIONS[editForm.departement]?.sort().map((ville) => (
                            <option key={ville} value={ville}>
                              {ville}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">
                        Quartier
                      </label>
                      <input
                        type="text"
                        value={editForm.quartier}
                        onChange={(e) =>
                          setEditForm({ ...editForm, quartier: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 bg-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Nom complet</p>
                        <p className="text-slate-900 font-medium">
                          {plumber.prenom} {plumber.nom}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Téléphone</p>
                        <p className="text-slate-900 font-medium">{plumber.telephone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Localisation</p>
                        <p className="text-slate-900 font-medium">
                          {plumber.ville}, {plumber.departement}
                        </p>
                        <p className="text-slate-600 text-sm">{plumber.quartier}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badge Link */}
            {plumber.hasPaid && (
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Mon Badge</h3>
                <Link
                  href={`/badge/${plumber.id}`}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition font-medium"
                >
                  <Download size={18} />
                  Télécharger mon badge
                </Link>
              </div>
            )}

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Mes Documents</h3>
              <div className="space-y-3">
                {plumber.diplomeFileUrl && (
                  <>
                    <a
                      href={plumber.diplomeFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                    >
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900 block">
                          Diplôme / Attestation
                        </span>
                        <span className="text-xs text-slate-500">
                          Cliquer pour voir
                        </span>
                      </div>
                    </a>
                    <a
                      href={plumber.diplomeFileUrl}
                      download
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger mon diplôme
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Statut du compte</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Vérification</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${plumber.isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {plumber.isVerified ? "Vérifié" : "En attente"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Paiement</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${plumber.hasPaid
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {plumber.hasPaid ? "Payé" : "En attente"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Crédits SMS</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      plumber.smsCredits === 0
                        ? "bg-red-100 text-red-800"
                        : plumber.smsCredits < 5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {plumber.smsCredits} crédit{plumber.smsCredits > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Requests Statistics */}
            {stats && (
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  Prises de contact ({stats.totalContactRequests})
                </h3>
                {stats.recentContactRequests && stats.recentContactRequests.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentContactRequests.map((contact: any) => (
                      <div
                        key={contact.id}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{contact.clientName}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                              <Phone className="w-4 h-4" />
                              {contact.clientPhone}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(contact.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {contact.message && (
                          <p className="text-sm text-slate-700 mt-2 italic border-t border-slate-200 pt-2">
                            "{contact.message}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Aucune prise de contact pour le moment
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Recharge Credits Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                Recharger vos crédits SMS
              </h3>
              <button
                onClick={() => {
                  setShowRechargeModal(false);
                  setSelectedCreditPackage(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-slate-600 mb-6">
              Sélectionnez un package de crédits SMS pour continuer à recevoir des demandes de clients.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { credits: 10, price: 1000, popular: false },
                { credits: 25, price: 2000, popular: true },
                { credits: 50, price: 3500, popular: false },
                { credits: 100, price: 6000, popular: false },
              ].map((pkg) => (
                <button
                  key={pkg.credits}
                  onClick={() => setSelectedCreditPackage(pkg.credits)}
                  className={`w-full p-4 rounded-lg border-2 transition ${
                    selectedCreditPackage === pkg.credits
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  } ${pkg.popular ? "ring-2 ring-emerald-200" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{pkg.credits} crédits</span>
                        {pkg.popular && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded">
                            Populaire
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {Math.round(pkg.price / pkg.credits)} FCFA / SMS
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{pkg.price.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRechargeModal(false);
                  setSelectedCreditPackage(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRechargeCredits}
                disabled={!selectedCreditPackage || rechargingCredits}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                {rechargingCredits ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Procéder au paiement"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Vérification du téléphone
            </h3>
            <p className="text-slate-600 mb-6">
              Un code de vérification va être envoyé au <strong>{editForm.telephone}</strong>
            </p>

            {!otpSent ? (
              <button
                onClick={handleSendOTP}
                disabled={sendingOTP}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                {sendingOTP ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <MessageSquare size={20} />
                    Envoyer le code par SMS
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Code de vérification (6 chiffres)
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Code valide pendant 5 minutes
                  </p>
                  <div className="text-center mt-2">
                    <span className={`text-sm font-bold ${timeRemaining === "00:00" ? "text-red-600" : "text-emerald-600"}`}>
                      {timeRemaining === "00:00" ? "Code expiré" : `Temps restant: ${timeRemaining}`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSendOTP}
                    disabled={sendingOTP}
                    className="flex-1 border-2 border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Renvoyer
                  </button>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={verifyingOTP || otpCode.length !== 6 || timeRemaining === "00:00"}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    {verifyingOTP ? "Vérification..." : "Vérifier"}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowOTPVerification(false);
                setOtpSent(false);
                setOtpCode("");
                setOtpExpiresAt(null);
                setTimeRemaining("05:00");
              }}
              className="w-full mt-4 text-slate-600 hover:text-slate-800 py-2 text-sm font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

