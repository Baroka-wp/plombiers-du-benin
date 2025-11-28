"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Shield,
  DollarSign,
  Star,
  TrendingUp,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  BarChart3,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  overview: {
    totalPlumbers: number;
    verifiedPlumbers: number;
    paidPlumbers: number;
    phoneVerifiedPlumbers: number;
    totalPayments: number;
    successfulPayments: number;
    totalReviews: number;
    averageRating: number;
    totalRevenue: number;
  };
  recentPlumbers: any[];
  recentPayments: any[];
  byDepartment: { departement: string; _count: { id: number } }[];
  byCity: { ville: string; _count: { id: number } }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Vérifier la session admin
    if (typeof window !== "undefined") {
      const adminData = sessionStorage.getItem("admin");
      if (!adminData) {
        router.push("/admin/login");
      } else {
        setAdmin(JSON.parse(adminData));
      }
    }
  }, [router]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchStats();
    }
  }, [admin]);

  if (!admin || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { overview } = stats;

  const statCards = [
    {
      title: "Total Plombiers",
      value: overview.totalPlumbers,
      icon: Users,
      color: "bg-blue-500",
      link: "/admin/plumbers",
    },
    {
      title: "Vérifiés",
      value: overview.verifiedPlumbers,
      icon: Shield,
      color: "bg-emerald-500",
      subtitle: `${Math.round((overview.verifiedPlumbers / overview.totalPlumbers) * 100) || 0}%`,
    },
    {
      title: "Ayant payé",
      value: overview.paidPlumbers,
      icon: DollarSign,
      color: "bg-yellow-500",
      subtitle: `${Math.round((overview.paidPlumbers / overview.totalPlumbers) * 100) || 0}%`,
    },
    {
      title: "Téléphone vérifié",
      value: overview.phoneVerifiedPlumbers,
      icon: Phone,
      color: "bg-purple-500",
      subtitle: `${Math.round((overview.phoneVerifiedPlumbers / overview.totalPlumbers) * 100) || 0}%`,
    },
    {
      title: "Paiements réussis",
      value: overview.successfulPayments,
      icon: CheckCircle,
      color: "bg-green-500",
      subtitle: `sur ${overview.totalPayments}`,
    },
    {
      title: "Note moyenne",
      value: overview.averageRating.toFixed(1),
      icon: Star,
      color: "bg-orange-500",
      subtitle: `${overview.totalReviews} avis`,
    },
    {
      title: "Revenus totaux",
      value: `${(overview.totalRevenue / 100).toLocaleString()} FCFA`,
      icon: TrendingUp,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-slate-700" />
            <h1 className="text-xl font-bold text-slate-900">Dashboard Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchStats}
              disabled={refreshing}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <span className="text-sm text-slate-600">{admin?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition ${stat.link ? "cursor-pointer" : ""}`}
                onClick={() => stat.link && router.push(stat.link)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.link && (
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-600">{stat.title}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Plumbers */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Plombiers récents</h2>
              <Link
                href="/admin/plumbers"
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentPlumbers.map((plumber) => (
                <div
                  key={plumber.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {plumber.prenom} {plumber.nom}
                    </p>
                    <p className="text-sm text-slate-600">{plumber.telephone}</p>
                    <p className="text-xs text-slate-500">
                      {plumber.departement}, {plumber.ville}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {plumber.isVerified ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-300" />
                    )}
                    {plumber.hasPaid ? (
                      <DollarSign className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Paiements récents</h2>
              <Link
                href="/admin/payments"
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {payment.plumber.prenom} {payment.plumber.nom}
                    </p>
                    <p className="text-sm text-slate-600">
                      {(payment.amount / 100).toLocaleString()} FCFA
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(payment.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    {payment.status === "success" ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                        Réussi
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        {payment.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Department & City */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">Par département</h2>
            </div>
            <div className="space-y-2">
              {stats.byDepartment.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{dept.departement}</span>
                  <span className="text-sm font-medium text-slate-900">
                    {dept._count.id}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">Top villes</h2>
            </div>
            <div className="space-y-2">
              {stats.byCity.map((city, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{city.ville}</span>
                  <span className="text-sm font-medium text-slate-900">
                    {city._count.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

