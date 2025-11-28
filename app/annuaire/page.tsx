"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Star, MapPin, Phone, CheckCircle, XCircle, ChevronLeft, ChevronRight, Grid, List, SlidersHorizontal, MessageSquare } from "lucide-react";
import Image from "next/image";
import Toast from "@/components/Toast";

interface Plumber {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    photoUrl: string | null;
    departement: string;
    ville: string;
    quartier: string;
    isVerified: boolean;
    hasPaid: boolean;
    membershipId: string | null;
    averageRating: number;
    reviewCount: number;
}

interface PaginationData {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
}

type ViewMode = 'table' | 'card';
type SortBy = 'createdAt' | 'name' | 'rating';
type SortOrder = 'asc' | 'desc';

// Skeleton pour la vue table
const TableSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Plombier
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Localisation
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Note
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Statut
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="animate-pulse">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                        <div className="h-3 w-24 bg-slate-100 rounded"></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                    <div className="h-3 w-32 bg-slate-100 rounded"></div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-2">
                                    <div className="h-4 w-12 bg-slate-200 rounded"></div>
                                    <div className="h-3 w-16 bg-slate-100 rounded"></div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-4 w-28 bg-slate-200 rounded"></div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                                    <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Skeleton pour la vue card
const CardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 p-6 animate-pulse"
            >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-32 bg-slate-200 rounded"></div>
                        <div className="h-3 w-24 bg-slate-100 rounded"></div>
                        <div className="h-4 w-20 bg-slate-100 rounded"></div>
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2 mb-3">
                    <div className="h-4 w-28 bg-slate-200 rounded"></div>
                    <div className="h-3 w-40 bg-slate-100 rounded"></div>
                </div>

                {/* Contact */}
                <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>

                {/* Status Badges */}
                <div className="flex gap-2">
                    <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                    <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                </div>
            </div>
        ))}
    </div>
);

export default function AnnuairePage() {
    const searchParams = useSearchParams();
    const [plumbers, setPlumbers] = useState<Plumber[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const [departementFilter, setDepartementFilter] = useState(searchParams.get('departement') || "");
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [sortBy, setSortBy] = useState<SortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    
    // Contact modal state
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedPlumber, setSelectedPlumber] = useState<Plumber | null>(null);
    const [contactForm, setContactForm] = useState({ name: "", phone: "", message: "" });
    const [sendingSMS, setSendingSMS] = useState(false);
    const [smsSuccess, setSmsSuccess] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    const fetchPlumbers = async (page: number, abortSignal?: AbortSignal) => {
        setLoading(true);
        setError(null);
        try {
            const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
            const departementParam = departementFilter ? `&departement=${encodeURIComponent(departementFilter)}` : '';
            const response = await fetch(
                `/api/plumbers?page=${page}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}${searchParam}${departementParam}`,
                { signal: abortSignal }
            );
            
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setPlumbers(data.plumbers || []);
            setPagination(data.pagination || {
                page: 1,
                limit: 10,
                totalCount: 0,
                totalPages: 0,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    // Request was aborted, ignore
                    return;
                }
                setError(error.message || "Une erreur est survenue lors du chargement des plombiers.");
            } else {
                setError("Une erreur inattendue est survenue.");
            }
            // Error is already handled and displayed to user, no need to log client-side
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        fetchPlumbers(1, abortController.signal);
        
        return () => {
            abortController.abort();
        };
    }, [sortBy, sortOrder, searchTerm, departementFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            const abortController = new AbortController();
            fetchPlumbers(newPage, abortController.signal);
        }
    };

    const openContactModal = (plumber: Plumber) => {
        setSelectedPlumber(plumber);
        setShowContactModal(true);
        setSmsSuccess(false);
        setContactForm({ name: "", phone: "", message: "" });
    };

    const closeContactModal = () => {
        setShowContactModal(false);
        setSelectedPlumber(null);
        setContactForm({ name: "", phone: "", message: "" });
    };

    const handleSendContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlumber) return;

        setSendingSMS(true);
        try {
            const response = await fetch("/api/sms/contact-plumber", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plumberId: selectedPlumber.id,
                    clientName: contactForm.name,
                    clientPhone: contactForm.phone,
                    message: contactForm.message,
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'envoi");
            }

            setSmsSuccess(true);
            setTimeout(() => {
                closeContactModal();
            }, 2000);
        } catch (error) {
            setToast({ message: "Erreur lors de l'envoi du message. Veuillez réessayer", type: "error" });
        } finally {
            setSendingSMS(false);
        }
    };

    // Search is now handled server-side, so we use plumbers directly
    const filteredPlumbers = plumbers;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Annuaire des Plombiers Certifiés
                    </h1>
                    <p className="text-slate-600">
                        Trouvez un plombier qualifié et certifié près de chez vous
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    {/* Search Bar and Department Filter */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, ville ou quartier..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <select
                                value={departementFilter}
                                onChange={(e) => setDepartementFilter(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all text-slate-900 bg-white appearance-none"
                            >
                                <option value="">Tous les départements</option>
                                <option value="Alibori">Alibori</option>
                                <option value="Atacora">Atacora</option>
                                <option value="Atlantique">Atlantique</option>
                                <option value="Borgou">Borgou</option>
                                <option value="Collines">Collines</option>
                                <option value="Couffo">Couffo</option>
                                <option value="Donga">Donga</option>
                                <option value="Littoral">Littoral</option>
                                <option value="Mono">Mono</option>
                                <option value="Ouémé">Ouémé</option>
                                <option value="Plateau">Plateau</option>
                                <option value="Zou">Zou</option>
                            </select>
                        </div>
                    </div>

                    {/* Filters and View Toggle */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Sort Controls */}
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortBy)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all text-slate-900 bg-white"
                            >
                                <option value="createdAt">Plus récents</option>
                                <option value="name">Nom (A-Z)</option>
                                <option value="rating">Mieux notés</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 font-medium"
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>

                        {/* View Toggle */}
                        <div className="ml-auto flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-2 rounded-md transition-colors ${viewMode === 'table'
                                        ? 'bg-[#008751] text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('card')}
                                className={`px-3 py-2 rounded-md transition-colors ${viewMode === 'card'
                                        ? 'bg-[#008751] text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <p>{error}</p>
                        <button
                            onClick={() => {
                                const abortController = new AbortController();
                                fetchPlumbers(pagination.page, abortController.signal);
                            }}
                            className="ml-auto text-red-700 hover:text-red-900 underline text-sm font-medium"
                        >
                            Réessayer
                        </button>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    viewMode === 'table' ? <TableSkeleton /> : <CardSkeleton />
                ) : error && plumbers.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-600 mb-4">Impossible de charger les plombiers.</p>
                        <button
                            onClick={() => {
                                const abortController = new AbortController();
                                fetchPlumbers(1, abortController.signal);
                            }}
                            className="bg-[#008751] text-white px-6 py-2 rounded-lg hover:bg-[#006b40] transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : viewMode === 'table' ? (
                    /* Table View */
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-100 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Plombier
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Localisation
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Note
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Statut
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredPlumbers.map((plumber) => (
                                        <tr
                                            key={plumber.id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                                                        {plumber.photoUrl ? (
                                                            <Image
                                                                src={plumber.photoUrl}
                                                                alt={`${plumber.prenom} ${plumber.nom}`}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                                                                {plumber.prenom[0]}{plumber.nom[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {plumber.prenom} {plumber.nom}
                                                        </p>
                                                        {plumber.membershipId && (
                                                            <p className="text-xs text-slate-500">
                                                                ID: {plumber.membershipId}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                                    <div className="text-sm">
                                                        <p className="text-slate-900 font-medium">{plumber.ville}</p>
                                                        <p className="text-slate-500">{plumber.quartier}</p>
                                                        <p className="text-slate-400 text-xs">{plumber.departement}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Star className="w-5 h-5 text-[#FCD116] fill-[#FCD116]" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {plumber.averageRating > 0
                                                                ? plumber.averageRating.toFixed(1)
                                                                : "N/A"}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {plumber.reviewCount} avis
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openContactModal(plumber)}
                                                    className="inline-flex items-center gap-2 bg-[#008751] hover:bg-[#006b40] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Contacter
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {plumber.isVerified && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Vérifié
                                                        </span>
                                                    )}
                                                    {plumber.hasPaid ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Actif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                            <XCircle className="w-3 h-3" />
                                                            En attente
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Card View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlumbers.map((plumber) => (
                            <div
                                key={plumber.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                                            {plumber.photoUrl ? (
                                                <Image
                                                    src={plumber.photoUrl}
                                                    alt={`${plumber.prenom} ${plumber.nom}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                                                    {plumber.prenom[0]}{plumber.nom[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-900">
                                                {plumber.prenom} {plumber.nom}
                                            </h3>
                                            {plumber.membershipId && (
                                                <p className="text-xs text-slate-500">
                                                    ID: {plumber.membershipId}
                                                </p>
                                            )}
                                            {/* Rating */}
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-4 h-4 text-[#FCD116] fill-[#FCD116]" />
                                                <span className="font-semibold text-slate-900">
                                                    {plumber.averageRating > 0
                                                        ? plumber.averageRating.toFixed(1)
                                                        : "N/A"}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    ({plumber.reviewCount})
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start gap-2 mb-3">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm">
                                            <p className="text-slate-900 font-medium">{plumber.ville}</p>
                                            <p className="text-slate-500">{plumber.quartier}, {plumber.departement}</p>
                                        </div>
                                    </div>

                                    {/* Contact Button */}
                                    <div className="mb-4">
                                        <button
                                            onClick={() => openContactModal(plumber)}
                                            className="flex items-center justify-center gap-2 bg-[#008751] hover:bg-[#006b40] text-white px-4 py-2.5 rounded-lg font-bold transition-colors w-full"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Contacter par SMS
                                        </button>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        {plumber.isVerified && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3" />
                                                Vérifié
                                            </span>
                                        )}
                                        {plumber.hasPaid ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <CheckCircle className="w-3 h-3" />
                                                Actif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                <XCircle className="w-3 h-3" />
                                                En attente
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && (
                    <div className="mt-6 px-6 py-4 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600">
                                Affichage de{" "}
                                <span className="font-semibold">
                                    {(pagination.page - 1) * pagination.limit + 1}
                                </span>{" "}
                                à{" "}
                                <span className="font-semibold">
                                    {Math.min(
                                        pagination.page * pagination.limit,
                                        pagination.totalCount
                                    )}
                                </span>{" "}
                                sur{" "}
                                <span className="font-semibold">{pagination.totalCount}</span>{" "}
                                plombiers
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter((page) => {
                                            return (
                                                page === 1 ||
                                                page === pagination.totalPages ||
                                                Math.abs(page - pagination.page) <= 1
                                            );
                                        })
                                        .map((page, index, array) => (
                                            <div key={page} className="flex items-center">
                                                {index > 0 && array[index - 1] !== page - 1 && (
                                                    <span className="px-2 text-slate-400">...</span>
                                                )}
                                                <button
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === pagination.page
                                                            ? "bg-[#008751] text-white"
                                                            : "text-slate-700 hover:bg-slate-100"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            </div>
                                        ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Modal */}
                {showContactModal && selectedPlumber && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            {smsSuccess ? (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                        Message envoyé !
                                    </h3>
                                    <p className="text-slate-600">
                                        {selectedPlumber.prenom} {selectedPlumber.nom} a reçu votre message
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">
                                                Contacter {selectedPlumber.prenom}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {selectedPlumber.ville}, {selectedPlumber.departement}
                                            </p>
                                        </div>
                                        <button
                                            onClick={closeContactModal}
                                            className="text-slate-400 hover:text-slate-600"
                                        >
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSendContact} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Votre nom
                                            </label>
                                            <input
                                                type="text"
                                                value={contactForm.name}
                                                onChange={(e) =>
                                                    setContactForm({ ...contactForm, name: e.target.value })
                                                }
                                                required
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none text-slate-900"
                                                placeholder="Ex: Jean Kouassi"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Votre téléphone
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-500 font-medium">
                                                    +229
                                                </span>
                                                <input
                                                    type="tel"
                                                    value={contactForm.phone}
                                                    onChange={(e) =>
                                                        setContactForm({ ...contactForm, phone: e.target.value })
                                                    }
                                                    required
                                                    pattern="[0-9]{10}"
                                                    className="w-full pl-16 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none text-slate-900"
                                                    placeholder="97 00 00 00 00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Message (optionnel)
                                            </label>
                                            <textarea
                                                value={contactForm.message}
                                                onChange={(e) =>
                                                    setContactForm({ ...contactForm, message: e.target.value })
                                                }
                                                rows={3}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none text-slate-900 resize-none"
                                                placeholder="Décrivez brièvement votre besoin..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={sendingSMS}
                                            className="w-full bg-[#008751] hover:bg-[#006b40] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            {sendingSMS ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <MessageSquare className="w-5 h-5" />
                                                    Envoyer le message
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
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
        </div>
    );
}
