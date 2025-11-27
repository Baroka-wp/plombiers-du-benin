"use client";

import { useEffect, useState, use, useRef } from "react";
import { getPlumber, updatePlumberPhoto } from "@/app/actions/plumber";
import { CldUploadWidget } from "next-cloudinary";
import { Camera, CheckCircle2, Loader2, Download } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { Plumber, PlumberQRData } from "@/types/plumber";

export default function BadgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plumber, setPlumber] = useState<Plumber | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const badgeRef = useRef<HTMLDivElement>(null);

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
      profileUrl: `${window.location.origin}/annuaire?id=${plumber.id}`,
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
      console.error("Error generating QR code:", error);
    }
  };

  const handlePhotoUpload = async (result: { info: { secure_url: string } }) => {
    const url = result.info.secure_url;
    setPhotoUrl(url);
    await updatePlumberPhoto(id, url);
  };

  const downloadBadge = () => {
    if (!badgeRef.current) return;
    alert("Fonctionnalité de téléchargement à venir");
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

              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={handlePhotoUpload}
              >
                {({ open }) => (
                  <button
                    onClick={() => open()}
                    className="w-full bg-[#008751] hover:bg-[#006b40] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    {photoUrl ? "Changer la photo" : "Ajouter une photo"}
                  </button>
                )}
              </CldUploadWidget>

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
                <div
                  ref={badgeRef}
                  className="bg-gradient-to-br from-[#008751] to-[#006b40] p-6 rounded-2xl shadow-xl"
                >
                  {/* Badge Header */}
                  <div className="text-center mb-4">
                    <h3 className="text-white font-bold text-lg">PLOMBIER CERTIFIÉ</h3>
                    <p className="text-[#FCD116] text-sm">République du Bénin</p>
                  </div>

                  {/* Photo */}
                  <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white mb-4">
                    <Image
                      src={photoUrl}
                      alt={`${plumber.prenom} ${plumber.nom}`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="text-center mb-4">
                    <h4 className="text-white font-bold text-xl">
                      {plumber.prenom} {plumber.nom}
                    </h4>
                    {plumber.membershipId && (
                      <p className="text-[#FCD116] text-sm">ID: {plumber.membershipId}</p>
                    )}
                    <p className="text-white text-sm mt-2">
                      {plumber.ville}, {plumber.departement}
                    </p>
                    <p className="text-white text-sm">{plumber.telephone}</p>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white p-3 rounded-lg mx-auto w-fit">
                    <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                    <p className="text-center text-xs text-slate-600 mt-2">
                      Scannez pour voir le profil
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex justify-center gap-2 mt-4">
                    {plumber.isVerified && (
                      <span className="bg-white text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        ✓ Vérifié
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={downloadBadge}
                  className="w-full bg-[#FCD116] hover:bg-[#E5BC00] text-slate-900 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le Badge
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
    </div>
  );
}
