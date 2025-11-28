"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Phone,
  Shield,
  DollarSign,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Plumber {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  departement: string;
  ville: string;
  isVerified: boolean;
  hasPaid: boolean;
  phoneVerified: boolean;
  membershipId: string | null;
  createdAt: string;
  _count: {
    reviews: number;
    payments: number;
  };
}

function AdminPlumbersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [admin, setAdmin] = useState<any>(null);
  const [plumbers, setPlumbers] = useState<Plumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    departement: searchParams.get("departement") || "",
    isVerified: searchParams.get("isVerified") || "",
    hasPaid: searchParams.get("hasPaid") || "",
    phoneVerified: searchParams.get("phoneVerified") || "",
  });

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

  const fetchPlumbers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      });

      const response = await fetch(`/api/admin/plumbers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPlumbers(data.plumbers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching plumbers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchPlumbers();
    }
  }, [admin, pagination.page, filters]);

  const handleUpdateStatus = async (
    id: string,
    field: "isVerified" | "hasPaid" | "phoneVerified",
    value: boolean
  ) => {
    try {
      const response = await fetch("/api/admin/plumbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });

      if (response.ok) {
        fetchPlumbers();
      }
    } catch (error) {
      console.error("Error updating plumber:", error);
    }
  };

  if (!admin || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Gestion des Plombiers</h1>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Retour au dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <select
              value={filters.departement}
              onChange={(e) =>
                setFilters({ ...filters, departement: e.target.value })
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 bg-white"
            >
              <option value="">Tous les départements</option>
              <option value="Littoral">Littoral</option>
              <option value="Atlantique">Atlantique</option>
              <option value="Ouémé">Ouémé</option>
            </select>
            <select
              value={filters.isVerified}
              onChange={(e) =>
                setFilters({ ...filters, isVerified: e.target.value })
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Vérifiés</option>
              <option value="false">Non vérifiés</option>
            </select>
            <select
              value={filters.hasPaid}
              onChange={(e) =>
                setFilters({ ...filters, hasPaid: e.target.value })
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 bg-white"
            >
              <option value="">Tous les paiements</option>
              <option value="true">Ayant payé</option>
              <option value="false">N'ayant pas payé</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Plombier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {plumbers.map((plumber) => (
                  <tr key={plumber.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {plumber.prenom} {plumber.nom}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {plumber.telephone}
                        </div>
                        {plumber.membershipId && (
                          <div className="text-xs text-slate-400">
                            ID: {plumber.membershipId}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {plumber.departement}
                      </div>
                      <div className="text-sm text-slate-500">{plumber.ville}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {plumber.isVerified ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-300" />
                          )}
                          <span className="text-sm text-slate-700">Vérifié</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {plumber.hasPaid ? (
                            <DollarSign className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-300" />
                          )}
                          <span className="text-sm text-slate-700">Payé</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {plumber.phoneVerified ? (
                            <Phone className="w-5 h-5 text-purple-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-300" />
                          )}
                          <span className="text-sm text-slate-700">Tél. vérifié</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              plumber.id,
                              "isVerified",
                              !plumber.isVerified
                            )
                          }
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            plumber.isVerified
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          }`}
                        >
                          {plumber.isVerified ? "Désactiver" : "Vérifier"}
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(plumber.id, "hasPaid", !plumber.hasPaid)
                          }
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            plumber.hasPaid
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          }`}
                        >
                          {plumber.hasPaid ? "Annuler paiement" : "Marquer payé"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
              <div className="text-sm text-slate-700">
                Page {pagination.page} sur {pagination.totalPages} ({pagination.total}{" "}
                résultats)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="p-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminPlumbersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    }>
      <AdminPlumbersPageContent />
    </Suspense>
  );
}

