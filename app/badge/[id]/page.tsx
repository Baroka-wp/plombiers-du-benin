"use client";

import { useEffect, useState, use, useRef } from "react";
import { getPlumber, updatePlumberPhoto } from "@/app/actions/plumber";
import { Camera, Loader2, Download, Upload, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { Plumber, PlumberQRData } from "@/types/plumber";
import { logger } from "@/lib/logger";
import html2canvas from "html2canvas";
import Toast from "@/components/Toast";

// Composant drapeau du Bénin
const BeninFlag = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 60 40" className={className}>
    {/* Bande verte à gauche */}
    <rect x="0" y="0" width="24" height="40" fill="#008751" />
    {/* Bande jaune en haut à droite */}
    <rect x="24" y="0" width="36" height="20" fill="#FCD116" />
    {/* Bande rouge en bas à droite */}
    <rect x="24" y="20" width="36" height="20" fill="#E8112D" />
  </svg>
);

export default function BadgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plumber, setPlumber] = useState<Plumber | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const badgeRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    async function loadPlumber() {
      const data = await getPlumber(id);
      if (data) {
        setPlumber(data);
        if (data.photoUrl) {
          setPhotoUrl(data.photoUrl);
        }
      }
      setLoading(false);
    }
    loadPlumber();
  }, [id]);

  useEffect(() => {
    if (plumber && photoUrl) {
      generateQRCode();
    }
  }, [plumber, photoUrl]);

  const generateQRCode = async () => {
    if (!plumber) return;

    const plumberData: PlumberQRData = {
      id: plumber.id,
      nom: plumber.nom,
      prenom: plumber.prenom,
      telephone: plumber.telephone,
      ville: plumber.ville,
      quartier: plumber.quartier,
      departement: plumber.departement,
      isVerified: plumber.isVerified,
      hasPaid: plumber.hasPaid,
      membershipId: plumber.membershipId,
      profileUrl: `${window.location.origin}/plumber/${plumber.id}`,
    };

    try {
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(plumberData), {
        width: 200,
        margin: 1,
        color: {
          dark: "#008751",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      logger.error("Error generating QR code", error instanceof Error ? error : new Error(String(error)), {
        plumberId: plumber.id,
      });
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setLoading(true);
    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const { url } = await uploadResponse.json();
      setPhotoUrl(url);

      // Update plumber photo in database
      const result = await updatePlumberPhoto(id, url);
      if (!result.success) {
        logger.error("Failed to update plumber photo", new Error(result.error || "Unknown error"), { plumberId: id });
      }
    } catch (error) {
      logger.error("Photo upload error", error instanceof Error ? error : new Error(String(error)), { plumberId: id });
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadBadge = async () => {
    if (!badgeRef.current) return;
    
    try {
      setLoading(true);
      
      // Capture le badge en canvas
      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: '#F5F1E8',
        scale: 3, // Haute qualité
        logging: false,
        useCORS: true, // Pour les images externes
        allowTaint: true,
        imageTimeout: 0,
        removeContainer: true,
      });

      // Convertir en blob avec haute qualité
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        // Créer un lien de téléchargement
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `badge-${plumber?.membershipId || plumber?.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0); // Qualité maximale
    } catch (error) {
      logger.error("Badge download error", error instanceof Error ? error : new Error(String(error)), {
        plumberId: id,
      });
      setToast({ message: "Erreur lors du téléchargement du badge", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#008751]" />
      </div>
    );
  }

  if (!plumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Plombier non trouvé</h1>
          <p className="text-slate-600">L'identifiant fourni ne correspond à aucun plombier.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Génération du Badge Professionnel
          </h1>
          <p className="text-slate-600">
            {plumber.prenom} {plumber.nom}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Photo Upload Section */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Camera className="w-6 h-6 text-[#008751]" />
              Photo de Profil
            </h2>

            <div className="space-y-4">
              {photoUrl ? (
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-[#008751]">
                  <Image
                    src={photoUrl}
                    alt={`${plumber.prenom} ${plumber.nom}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto rounded-full bg-slate-200 flex items-center justify-center border-4 border-dashed border-slate-300">
                  <Camera className="w-16 h-16 text-slate-400" />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                }}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full bg-[#008751] hover:bg-[#006b40] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    {photoUrl ? "Changer la photo" : "Ajouter une photo"}
                  </>
                )}
              </button>

              {photoUrl && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Photo ajoutée avec succès</span>
                </div>
              )}
            </div>
          </div>

          {/* Badge Preview */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Aperçu du Badge
            </h2>

            {photoUrl && qrCodeUrl ? (
              <div className="space-y-4">
                {/* Bordure extérieure verte */}
                <div 
                  ref={badgeRef}
                  className="p-1 bg-gradient-to-br from-[#008751] to-[#006b40] rounded-2xl shadow-2xl"
                >
                  <div
                    className="bg-[#F5F1E8] p-6 rounded-xl relative"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
                    }}
                  >
                    {/* Drapeaux dans les coins */}
                    <div className="absolute top-4 left-4">
                      <BeninFlag className="w-10 h-10 drop-shadow-md" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <BeninFlag className="w-10 h-10 drop-shadow-md" />
                    </div>
                    
                    {/* Badge Header */}
                    <div className="text-center mb-4 mt-6">
                      <h3 className="text-[#008751] font-bold text-xl tracking-wide">PLOMBIER CERTIFIÉ</h3>
                      <p className="text-[#E8112D] text-sm font-semibold">République du Bénin</p>
                    </div>

                    {/* Photo */}
                    <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-[#008751] mb-4 shadow-lg">
                      <Image
                        src={photoUrl}
                        alt={`${plumber.prenom} ${plumber.nom}`}
                        fill
                        className="object-cover object-center"
                        style={{ objectPosition: 'center' }}
                      />
                    </div>

                    {/* Info */}
                    <div className="text-center mb-4">
                      <h4 className="text-slate-900 font-bold text-xl">
                        {plumber.prenom} {plumber.nom}
                      </h4>
                      {plumber.membershipId && (
                        <p className="text-[#008751] text-sm font-mono font-bold mt-1">ID: {plumber.membershipId}</p>
                      )}
                      <p className="text-slate-700 text-sm mt-2">
                        {plumber.ville}, {plumber.departement}
                      </p>
                    </div>

                    {/* Status - Simplifié et visible */}
                    {plumber.isVerified && (
                      <div className="flex justify-center mb-4">
                        <div className="bg-[#008751] text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          VÉRIFIÉ
                        </div>
                      </div>
                    )}

                    {/* QR Code */}
                    <div className="bg-white p-3 rounded-lg mx-auto w-fit shadow-md border-2 border-[#008751]">
                      <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                      <p className="text-center text-xs text-slate-600 mt-2 font-medium">
                        Scannez pour voir le profil
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={downloadBadge}
                  disabled={loading}
                  className="w-full bg-[#FCD116] hover:bg-[#E5BC00] disabled:opacity-50 text-slate-900 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Télécharger le Badge
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>Ajoutez une photo pour générer le badge</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
