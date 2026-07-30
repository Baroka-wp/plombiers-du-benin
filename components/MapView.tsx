"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix pour les icônes Leaflet avec Next.js
if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
}

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

interface MapViewProps {
    plumbers: Plumber[];
}

// Coordonnées approximatives des principales villes du Bénin
const CITY_COORDINATES: Record<string, [number, number]> = {
    "Cotonou": [6.3725, 2.3544],
    "Porto-Novo": [6.4969, 2.6289],
    "Abomey-Calavi": [6.4485, 2.3556],
    "Parakou": [9.3372, 2.6303],
    "Bohicon": [7.1783, 2.0667],
    "Lokossa": [6.6389, 1.7167],
    "Aplahoué": [6.9333, 1.9833],
    "Natitingou": [10.3036, 1.3761],
    "Ouidah": [6.3631, 2.0853],
    "Djougou": [9.7081, 1.6656],
    "Kandi": [11.1342, 2.9361],
    "Savalou": [7.9333, 1.9833],
    "Comé": [6.4000, 1.8833],
    "Sakété": [6.7333, 2.6667],
    "Pobé": [6.9667, 2.6667],
    "Kétou": [7.3667, 2.6000],
    "Dassa-Zoumé": [7.7500, 2.1833],
    "Tchaourou": [8.8833, 2.6000],
    "Nikki": [9.9333, 3.2000],
    "Malanville": [11.8667, 3.3833],
};

// Fonction pour obtenir les coordonnées d'une ville
const getCityCoordinates = (ville: string): [number, number] => {
    // Chercher une correspondance exacte
    if (CITY_COORDINATES[ville]) {
        return CITY_COORDINATES[ville];
    }
    
    // Chercher une correspondance partielle (insensible à la casse)
    const villeLower = ville.toLowerCase();
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
        if (city.toLowerCase().includes(villeLower) || villeLower.includes(city.toLowerCase())) {
            return coords;
        }
    }
    
    // Coordonnées par défaut (centre du Bénin)
    return [8.5, 2.3];
};

export default function MapView({ plumbers }: MapViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Initialiser la carte centrée sur le Bénin
        const map = L.map(mapContainerRef.current).setView([8.5, 2.3], 7);

        // Ajouter la couche de tuiles OpenStreetMap
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        // Nettoyage
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        // Supprimer les anciens marqueurs
        markersRef.current.forEach((marker) => {
            marker.remove();
        });
        markersRef.current = [];

        if (plumbers.length === 0) {
            mapRef.current.setView([8.5, 2.3], 7);
            return;
        }

        // Créer une icône personnalisée
        const createIcon = (isVerified: boolean) => {
            return L.divIcon({
                className: "custom-marker",
                html: `
                    <div class="relative">
                        <div class="w-8 h-8 rounded-full ${
                            isVerified ? "bg-emerald-600" : "bg-slate-400"
                        } border-2 border-white shadow-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        ${isVerified ? `
                            <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        ` : ""}
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        };

        // Ajouter un marqueur pour chaque plombier
        const bounds: L.LatLngBoundsExpression = [];

        plumbers.forEach((plumber) => {
            const coords = getCityCoordinates(plumber.ville);
            bounds.push(coords);

            const marker = L.marker(coords, {
                icon: createIcon(plumber.isVerified),
            }).addTo(mapRef.current!);

            // Créer le contenu du popup
            const popupContent = `
                <div class="p-2 min-w-[200px]">
                    <div class="font-bold text-slate-900 mb-1">
                        ${plumber.prenom} ${plumber.nom}
                    </div>
                    <div class="text-sm text-slate-600 mb-2">
                        <div>📍 ${plumber.ville}, ${plumber.quartier}</div>
                        <div>📞 ${plumber.telephone}</div>
                        ${plumber.averageRating > 0 ? `
                            <div class="flex items-center gap-1 mt-1">
                                <span class="text-yellow-500">★</span>
                                <span class="font-semibold">${plumber.averageRating.toFixed(1)}</span>
                                <span class="text-slate-500 text-xs">(${plumber.reviewCount} avis)</span>
                            </div>
                        ` : ""}
                    </div>
                    <div class="flex gap-2 mt-2">
                        <a href="/plumber/${plumber.id}" 
                           class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1 rounded font-medium transition-colors">
                            Voir profil
                        </a>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            markersRef.current.push(marker);
        });

        // Ajuster la vue pour afficher tous les marqueurs
        if (bounds.length > 0) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [plumbers]);

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainerRef} className="w-full h-full rounded-xl" />
            <style jsx global>{`
                .custom-marker {
                    background: transparent !important;
                    border: none !important;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 8px;
                }
                .leaflet-popup-content {
                    margin: 0;
                }
            `}</style>
        </div>
    );
}
