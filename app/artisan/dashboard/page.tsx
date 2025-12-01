"use client";

import { useEffect, useState, useCallback } from "react";
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
  Wallet,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Toast from "@/components/Toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

// --- Types & Constants ---

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

interface StatsData {
  totalContactRequests: number;
  recentContactRequests: any[];
  reviewCount: number;
  averageRating: number;
}

interface ContactRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  message: string | null;
  createdAt: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
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

// --- Components ---

const StatCard = ({ title, value, icon: Icon, colorClass, subText }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between transition hover:shadow-md">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subText && <p className="text-xs mt-1">{subText}</p>}
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default function ArtisanDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State
  const [plumber, setPlumber] = useState<PlumberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    totalContactRequests: 0,
    recentContactRequests: [],
    reviewCount: 0,
    averageRating: 0,
  });
  
  const [editForm, setEditForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    departement: "",
    ville: "",
    quartier: "",
  });

  // Contact Requests & Chart State
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [filter, setFilter] = useState("week"); // today, week, month, year
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  // OTP State
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [otpPinId, setOtpPinId] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("05:00");
  
  // Recharge State
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargingCredits, setRechargingCredits] = useState(false);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<number | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // --- Effects ---

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/artisan/login");
    } else if (status === "authenticated" && session?.user?.id) {
      loadPlumberData();
    }
  }, [status, session, router]);

  const fetchContactRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    setRequestsLoading(true);
    try {
      const res = await fetch(
        `/api/plumbers/${session.user.id}/contact-requests?page=${page}&limit=5&filter=${filter}`
      );
      const data = await res.json();
      if (res.ok) {
        setContactRequests(data.requests);
        setTotalPages(data.totalPages);
        setTotalRequests(data.total);
        setChartData(data.chartData);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  }, [session?.user?.id, page, filter]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchContactRequests();
    }
  }, [fetchContactRequests]);

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

  // --- Data Loading ---

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

      // Load General Stats (Cards)
      try {
        const statsResponse = await fetch(`/api/plumbers/${session?.user?.id}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    } catch (error) {
      console.error("Error loading plumber:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleSave = async () => {
    if (!session?.user?.id) return;

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
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'envoi");

      setOtpPinId(data.pinId);
      setOtpSent(true);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);
      setOtpExpiresAt(expiresAt);
      setToast({ message: "Code envoyé par SMS avec succès !", type: "success" });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Erreur", type: "error" });
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpPinId) return;
    setVerifyingOTP(true);
    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinId: otpPinId, code: otpCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Code invalide");

      const updateResponse = await fetch(`/api/plumbers/${session?.user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          phoneVerified: true,
        }),
      });

      if (!updateResponse.ok) throw new Error("Erreur lors de la mise à jour");

      await loadPlumberData();
      setShowOTPVerification(false);
      setIsEditing(false);
      setPhoneChanged(false);
      setToast({ message: "Téléphone vérifié et profil mis à jour !", type: "success" });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Erreur", type: "error" });
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleRechargeCredits = async () => {
    if (!selectedCreditPackage) return;
    setRechargingCredits(true);
    try {
      const response = await fetch(`/api/plumbers/${session?.user?.id}/sms-credits/recharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: selectedCreditPackage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur");

      setToast({ message: `✅ ${selectedCreditPackage} crédits rechargés !`, type: "success" });
      setShowRechargeModal(false);
      setSelectedCreditPackage(null);
      await loadPlumberData();
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "Erreur", type: "error" });
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

  if (!plumber) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- Header --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xl">
            <Shield className="w-8 h-8" />
            <span>Espace Artisan</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm font-medium text-slate-600">
              {plumber.prenom} {plumber.nom}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50"
              title="Déconnexion"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* --- Top Stats Row --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Demandes" 
            value={stats.totalContactRequests} 
            icon={MessageSquare} 
            colorClass="bg-blue-100 text-blue-600" 
          />
          <StatCard 
            title="Avis" 
            value={stats.reviewCount} 
            icon={CheckCircle} 
            colorClass="bg-purple-100 text-purple-600" 
          />
          <StatCard 
            title="Note" 
            value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"} 
            icon={Shield} 
            colorClass="bg-yellow-100 text-yellow-600" 
          />
          <div className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between transition ${
            plumber.smsCredits < 5 ? 'border-red-200 bg-red-50' : 'border-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">Crédits SMS</p>
              <Wallet className={`w-5 h-5 ${plumber.smsCredits < 5 ? 'text-red-500' : 'text-emerald-500'}`} />
            </div>
            <div className="flex items-end justify-between">
              <p className={`text-2xl font-bold ${plumber.smsCredits < 5 ? 'text-red-600' : 'text-emerald-600'}`}>
                {plumber.smsCredits}
              </p>
              <button 
                onClick={() => setShowRechargeModal(true)}
                className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50"
              >
                Recharger
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Main Content (Left) --- */}
          <div className="lg:col-span-2 space-y-8">
            
             {/* Profile Section (Moved UP) */}
             <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Mon Profil
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition"
                  >
                    <Edit size={16} />
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form to current plumber data
                        setEditForm({
                          nom: plumber.nom,
                          prenom: plumber.prenom,
                          telephone: plumber.telephone,
                          departement: plumber.departement,
                          ville: plumber.ville,
                          quartier: plumber.quartier,
                        });
                      }}
                      className="text-sm font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="text-sm font-medium bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                    >
                      {isSaving && <Loader2 size={14} className="animate-spin" />}
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Photo Column */}
                <div className="flex flex-col items-center text-center md:border-r border-slate-100 pr-0 md:pr-8">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 mb-4 border-4 border-white shadow-md">
                    {plumber.photoUrl ? (
                      <Image src={plumber.photoUrl} alt="Profil" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl font-bold">
                        {plumber.prenom[0]}{plumber.nom[0]}
                      </div>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <>
                      <h3 className="text-xl font-bold text-slate-900">{plumber.prenom} {plumber.nom}</h3>
                      <p className="text-sm text-slate-500 mb-3">{plumber.ville}, {plumber.departement}</p>
                      <div className="flex gap-2 justify-center mb-4">
                        {plumber.isVerified && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={12} /> Vérifié
                          </span>
                        )}
                        {plumber.hasPaid && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            Membre
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Info Column (Form) */}
                <div className="md:col-span-2">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nom</label>
                          <input 
                            type="text" 
                            value={editForm.nom} 
                            onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Prénom</label>
                          <input 
                            type="text" 
                            value={editForm.prenom} 
                            onChange={(e) => setEditForm({...editForm, prenom: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Téléphone (WhatsApp)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-400 text-sm">+229</span>
                          <input 
                            type="tel"
                            maxLength={10}
                            value={editForm.telephone} 
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setEditForm({...editForm, telephone: val});
                              if(val !== plumber.telephone) setPhoneChanged(true);
                            }}
                            className="w-full pl-12 p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          />
                        </div>
                        {phoneChanged && <p className="text-xs text-amber-600 mt-1">Nécessite une vérification SMS</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Département</label>
                          <select 
                            value={editForm.departement} 
                            onChange={(e) => setEditForm({...editForm, departement: e.target.value, ville: ''})}
                            className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            {Object.keys(LOCATIONS).sort().map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ville</label>
                          <select 
                            value={editForm.ville} 
                            onChange={(e) => setEditForm({...editForm, ville: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="">Choisir...</option>
                            {LOCATIONS[editForm.departement]?.sort().map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Quartier</label>
                        <input 
                          type="text" 
                          value={editForm.quartier} 
                          onChange={(e) => setEditForm({...editForm, quartier: e.target.value})}
                          className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Contact</p>
                          <p className="text-slate-900 font-medium tracking-wide">{plumber.telephone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Localisation</p>
                          <p className="text-slate-900 font-medium">{plumber.ville}, {plumber.departement}</p>
                          <p className="text-slate-600 text-sm">{plumber.quartier}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
            
            {/* Activity Section (With Chart & Table) */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  Activité des demandes
                </h2>
                
                <div className="flex bg-slate-100 rounded-lg p-1">
                  {[
                    { id: "today", label: "Aujourd'hui" },
                    { id: "week", label: "Semaine" },
                    { id: "month", label: "Mois" },
                    { id: "year", label: "Année" }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { setFilter(f.id); setPage(1); }}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                        filter === f.id 
                          ? "bg-white text-emerald-600 shadow-sm" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chart Area */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="h-[250px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      Aucune donnée disponible pour cette période
                    </div>
                  )}
                </div>
              </div>

              {/* Table Area */}
              <div className="p-0">
                {requestsLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                  </div>
                ) : contactRequests.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                          <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Téléphone</th>
                            <th className="px-6 py-4">Message</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {contactRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50 transition">
                              <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-900">
                                {req.clientName}
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-600">
                                {req.clientPhone}
                              </td>
                              <td className="px-6 py-4 text-slate-600 italic max-w-[200px] truncate">
                                {req.message || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                      <span className="text-xs text-slate-500">
                        Total: {totalRequests} demandes
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition"
                        >
                          <ChevronLeft size={20} className="text-slate-600" />
                        </button>
                        <span className="text-sm font-medium text-slate-700 px-2 py-0.5">
                          Page {page} / {totalPages}
                        </span>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition"
                        >
                          <ChevronRight size={20} className="text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <MessageSquare className="w-12 h-12 text-slate-200 mb-3" />
                    <p>Aucune demande de contact sur cette période.</p>
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* --- Sidebar (Right) --- */}
          <div className="space-y-6">
            
            {/* Wallet Card */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
              
              <h3 className="text-emerald-100 font-medium text-sm mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Mon Portefeuille
              </h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold block">{plumber.smsCredits}</span>
                <span className="text-emerald-100 text-sm">Crédits SMS disponibles</span>
              </div>

              <button 
                onClick={() => setShowRechargeModal(true)}
                className="w-full bg-white text-emerald-800 font-bold py-3 px-4 rounded-xl hover:bg-emerald-50 transition flex items-center justify-center gap-2"
              >
                Recharger maintenant
              </button>
              
              {plumber.smsCredits < 5 && (
                <div className="mt-4 flex items-center gap-2 text-red-200 bg-red-900/30 p-2 rounded-lg text-xs">
                  <AlertTriangle size={14} />
                  <span>Vos crédits sont faibles !</span>
                </div>
              )}
            </div>

            {/* Documents Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Espace Professionnel
              </h3>
              
              <div className="space-y-3">
                {plumber.hasPaid && (
                  <Link
                    href={`/badge/${plumber.id}`}
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-900 group-hover:text-emerald-700">Badge Pro</span>
                      <span className="text-xs text-slate-500">Télécharger</span>
                    </div>
                  </Link>
                )}
                
                {plumber.diplomeFileUrl && (
                  <a
                    href={plumber.diplomeFileUrl}
                    download
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-100 hover:border-blue-200 transition group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-900 group-hover:text-blue-700">Diplôme</span>
                      <span className="text-xs text-slate-500">Consulter / Télécharger</span>
                    </div>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- Modals --- */}
      
      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Recharger</h3>
              <button onClick={() => { setShowRechargeModal(false); setSelectedCreditPackage(null); }} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-3 mb-8">
              {[
                { credits: 10, price: 1000, popular: false },
                { credits: 25, price: 2000, popular: true },
                { credits: 50, price: 3500, popular: false },
                { credits: 100, price: 6000, popular: false },
              ].map((pkg) => (
                <button
                  key={pkg.credits}
                  onClick={() => setSelectedCreditPackage(pkg.credits)}
                  className={`w-full p-4 rounded-xl border-2 transition relative text-left flex justify-between items-center ${
                    selectedCreditPackage === pkg.credits
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-100 hover:border-emerald-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{pkg.credits} Crédits</span>
                    <span className="text-xs text-slate-500">{Math.round(pkg.price / pkg.credits)} FCFA / SMS</span>
                  </div>
                  <span className="font-bold text-emerald-700">{pkg.price.toLocaleString()} FCFA</span>
                  {pkg.popular && (
                    <span className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Populaire</span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleRechargeCredits}
              disabled={!selectedCreditPackage || rechargingCredits}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              {rechargingCredits ? <Loader2 className="animate-spin" /> : "Payer maintenant"}
            </button>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOTPVerification && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Vérification requise</h3>
            <p className="text-slate-500 text-sm mb-6">
              Pour sécuriser votre compte, nous devons vérifier votre numéro <strong>{editForm.telephone}</strong>
            </p>

            {!otpSent ? (
              <button
                onClick={handleSendOTP}
                disabled={sendingOTP}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex justify-center items-center gap-2"
              >
                {sendingOTP ? <Loader2 className="animate-spin" /> : "Envoyer le code"}
              </button>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center text-3xl font-mono tracking-widest py-3 border-b-2 border-emerald-200 focus:border-emerald-600 outline-none bg-transparent"
                  autoFocus
                />
                <div className="flex justify-between text-xs">
                  <span className={timeRemaining === "00:00" ? "text-red-500" : "text-emerald-600"}>
                    {timeRemaining}
                  </span>
                  <button onClick={handleSendOTP} className="text-slate-400 hover:text-slate-600 underline">
                    Renvoyer
                  </button>
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={verifyingOTP || otpCode.length !== 6}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {verifyingOTP ? "Vérification..." : "Confirmer"}
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setShowOTPVerification(false)}
              className="mt-6 text-slate-400 hover:text-slate-600 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
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
