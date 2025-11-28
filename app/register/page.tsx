'use client';

import React, { useState } from 'react';
import { Shield, ArrowLeft, UploadCloud, MapPin, User, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import Toast from '@/components/Toast';

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

// Données de référence COMPLÈTES pour les 12 départements du Bénin
const LOCATIONS: Record<string, string[]> = {
    "Alibori": ["Banikoara", "Gogounou", "Kandi", "Karimama", "Malanville", "Ségbana"],
    "Atacora": ["Boukoumbé", "Cobly", "Kérou", "Kouandé", "Matéri", "Natitingou", "Péhunco", "Tanguiéta", "Toucountouna"],
    "Atlantique": ["Abomey-Calavi", "Allada", "Kpomassè", "Ouidah", "Sô-Ava", "Toffo", "Tori-Bossito", "Zè"],
    "Borgou": ["Bembéréké", "Kalalé", "N'Dali", "Nikki", "Parakou", "Pèrèrè", "Sinendé", "Tchaourou"],
    "Collines": ["Bantè", "Dassa-Zoumè", "Glazoué", "Ouèssè", "Savalou", "Savè"],
    "Couffo": ["Aplahoué", "Djakotomey", "Dogbo", "Klouékanmè", "Lalo", "Toviklin"],
    "Donga": ["Bassila", "Copargo", "Djougou", "Ouaké"],
    "Littoral": ["Cotonou"],
    "Mono": ["Athiémé", "Bopa", "Comè", "Grand-Popo", "Houéyogbé", "Lokossa"],
    "Ouémé": ["Adjarra", "Adjohoun", "Aguégués", "Akpro-Missérété", "Avrankou", "Bonou", "Dangbo", "Porto-Novo", "Sèmè-Kpodji"],
    "Plateau": ["Adja-Ouèrè", "Ifangni", "Kétou", "Pobè", "Sakété"],
    "Zou": ["Abomey", "Agbangnizoun", "Bohicon", "Covè", "Djidja", "Ouinhi", "Za-Kpota", "Zagnanado", "Zogbodomey"]
};

export default function InscriptionPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [plumberId, setPlumberId] = useState<string>('');
    const [membershipId, setMembershipId] = useState<string>('');
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        departement: '',
        ville: '',
        quartier: '',
        diplomeUrl: '',
        profilePhotoUrl: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'diplomeUrl' | 'profilePhotoUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError('');
        setIsUploading(true);

        try {
            const data = new FormData();
            data.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de l'upload");
            }

            const result = await response.json();
            setFormData(prev => ({ ...prev, [fieldName]: result.url }));
        } catch (error) {
            console.error("Upload error:", error);
            setUploadError(error instanceof Error ? error.message : "Erreur lors du chargement du fichier");
        } finally {
            setIsUploading(false);
        }
    };

    const validateStep = () => {
        if (currentStep === 1) {
            return formData.nom && formData.prenom && formData.telephone && formData.departement && formData.ville;
        }
        if (currentStep === 2) {
            return formData.diplomeUrl;
        }
        return true;
    };

    const handleNext = async () => {
        if (!validateStep()) {
            setToast({ message: "Veuillez remplir tous les champs obligatoires", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            if (currentStep === 1) {
                // Step 1: Save personal info to DB
                if (plumberId) {
                    // Update existing record
                    const response = await fetch(`/api/plumbers/${plumberId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nom: formData.nom,
                            prenom: formData.prenom,
                            departement: formData.departement,
                            ville: formData.ville,
                            quartier: formData.quartier,
                        }),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Erreur lors de la mise à jour du dossier');
                    }
                } else {
                    // Create new record
                    const response = await fetch('/api/plumbers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nom: formData.nom,
                            prenom: formData.prenom,
                            telephone: formData.telephone,
                            departement: formData.departement,
                            ville: formData.ville,
                            quartier: formData.quartier,
                        }),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Erreur lors de la création du dossier');
                    }

                    const { id } = await response.json();
                    setPlumberId(id);
                }
            } else if (currentStep === 2) {
                // Step 2: Update with diploma URL
                const response = await fetch(`/api/plumbers/${plumberId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ diplomeFileUrl: formData.diplomeUrl }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Erreur lors de la mise à jour');
                }
            }

            setCurrentStep(prev => prev + 1);
        } catch (error) {
            console.error('Error:', error);
            setToast({ message: error instanceof Error ? error.message : 'Une erreur est survenue', type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handlePayment = async () => {
        if (!formData.profilePhotoUrl) {
            setToast({ message: "Veuillez charger votre photo de profil", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            // Update with profile photo
            const updateResponse = await fetch(`/api/plumbers/${plumberId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photoUrl: formData.profilePhotoUrl }),
            });

            if (!updateResponse.ok) {
                const error = await updateResponse.json();
                throw new Error(error.error || 'Erreur lors de la mise à jour de la photo');
            }

            // Process payment
            const paymentResponse = await fetch(`/api/plumbers/${plumberId}/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!paymentResponse.ok) {
                const error = await paymentResponse.json();
                throw new Error(error.error || 'Erreur lors du paiement');
            }

            const paymentData = await paymentResponse.json();
            // Store the membershipId that was generated after payment
            setMembershipId(paymentData.plumber.membershipId);

            setPaymentSuccess(true);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Payment error:', error);
            setToast({ message: error instanceof Error ? error.message : 'Une erreur est survenue lors du paiement', type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadBadge = async () => {
        // TODO: Implement badge download functionality
        // This could generate a PDF or redirect to a badge page
        window.location.href = `/badge/${plumberId}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 transition">
                        <ArrowLeft size={20} />
                        <span className="font-medium text-sm">Retour à l'accueil</span>
                    </a>
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <Shield size={20} />
                        <span>Espace Artisan</span>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-10">
                {/* Title */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Demande de Certification</h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Rejoignez le répertoire national. Remplissez ce formulaire pour soumettre votre dossier à validation par l'institution.
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-10 space-x-4">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'} flex items-center justify-center font-bold text-sm mb-1`}>1</div>
                        <span className={`text-xs ${currentStep >= 1 ? 'font-bold text-emerald-700' : 'text-gray-500'}`}>Identité</span>
                    </div>
                    <div className={`w-16 h-1 rounded ${currentStep >= 2 ? 'bg-emerald-200' : 'bg-gray-200'}`}></div>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'} flex items-center justify-center font-bold text-sm mb-1`}>2</div>
                        <span className={`text-xs ${currentStep >= 2 ? 'font-bold text-emerald-700' : 'text-gray-500'}`}>Justificatifs</span>
                    </div>
                    <div className={`w-16 h-1 rounded ${currentStep >= 3 ? 'bg-emerald-200' : 'bg-gray-200'}`}></div>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'} flex items-center justify-center font-bold text-sm mb-1`}>3</div>
                        <span className={`text-xs ${currentStep >= 3 ? 'font-bold text-emerald-700' : 'text-gray-500'}`}>Paiement</span>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="p-8">
                            <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-6">
                                <User size={20} /> Informations Personnelles
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nom de famille <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        required
                                        placeholder="ex: DOSSOU"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Prénoms <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="prenom"
                                        value={formData.prenom}
                                        required
                                        placeholder="ex: Jean Kodjo"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Numéro de téléphone (WhatsApp) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3.5 text-gray-500 font-medium border-r pr-2 border-gray-300">+229</span>
                                        <input
                                            type="tel"
                                            name="telephone"
                                            value={formData.telephone}
                                            required
                                            placeholder="97 00 00 00 00"
                                            pattern="[0-9]{10}"
                                            className="w-full pl-16 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Ce numéro servira à recevoir les demandes clients et les notifications.</p>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-6">
                                    <MapPin size={20} /> Zone d'intervention
                                </h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Département <span className="text-red-500">*</span></label>
                                        <select
                                            name="departement"
                                            value={formData.departement}
                                            required
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                            onChange={(e) => {
                                                setFormData({ ...formData, departement: e.target.value, ville: '' });
                                            }}
                                        >
                                            <option value="">Sélectionner...</option>
                                            {Object.keys(LOCATIONS).sort().map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Ville / Commune <span className="text-red-500">*</span></label>
                                        <select
                                            name="ville"
                                            value={formData.ville}
                                            required
                                            disabled={!formData.departement}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                            onChange={handleChange}
                                        >
                                            <option value="">Sélectionner...</option>
                                            {formData.departement && LOCATIONS[formData.departement].sort().map(ville => (
                                                <option key={ville} value={ville}>{ville}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Quartier ou précision adresse</label>
                                        <input
                                            type="text"
                                            name="quartier"
                                            value={formData.quartier}
                                            placeholder="ex: Derrière la pharmacie de l'Espoir"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Document Upload */}
                    {currentStep === 2 && (
                        <div className="p-8">
                            <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-6">
                                <FileText size={20} /> Justificatifs Professionnels
                            </h2>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3 items-start">
                                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                                <div className="text-sm text-blue-800">
                                    <p className="font-bold mb-1">Attention aux faux documents</p>
                                    <p>Toute fausse déclaration ou usage de faux diplôme entraînera un bannissement définitif et des poursuites judiciaires conformément aux lois en vigueur au Bénin.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-medium text-gray-700 block">Charger votre Diplôme ou Attestation (CQP, CAP, etc.) <span className="text-red-500">*</span></label>

                                <div className={`border-2 border-dashed rounded-xl p-8 transition text-center group ${formData.diplomeUrl ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="diplome-upload"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileUpload(e, 'diplomeUrl')}
                                        disabled={isUploading}
                                    />
                                    <label htmlFor="diplome-upload" className={`cursor-pointer flex flex-col items-center ${isUploading ? 'cursor-wait' : ''}`}>
                                        {isUploading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3"></div>
                                                <span className="text-emerald-700 font-medium">Chargement en cours...</span>
                                            </div>
                                        ) : formData.diplomeUrl ? (
                                            <div className="flex flex-col items-center">
                                                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 mb-3">
                                                    <CheckCircle size={24} />
                                                </div>
                                                <span className="text-emerald-800 font-bold">Fichier chargé avec succès !</span>
                                                <span className="text-emerald-600 text-xs mt-1">Cliquez pour remplacer</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 mb-3 group-hover:scale-110 transition">
                                                    <UploadCloud size={24} />
                                                </div>
                                                <span className="text-gray-900 font-medium">Cliquez pour ajouter un fichier</span>
                                                <span className="text-gray-500 text-xs mt-1">PDF, JPG ou PNG (Max 10 Mo)</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                                {uploadError && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
                                        <AlertCircle size={16} /> {uploadError}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment & Badge Preview */}
                    {currentStep === 3 && (
                        <div className="p-8">
                            <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-6">
                                <Shield size={20} /> Finalisation et Paiement
                            </h2>

                            {/* Profile Photo Upload */}
                            <div className="mb-8">
                                <label className="text-sm font-medium text-gray-700 block mb-4">Photo de profil <span className="text-red-500">*</span></label>

                                <div className={`border-2 border-dashed rounded-xl p-6 transition text-center group ${formData.profilePhotoUrl ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="photo-upload"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={(e) => handleFileUpload(e, 'profilePhotoUrl')}
                                        disabled={isUploading}
                                    />
                                    <label htmlFor="photo-upload" className={`cursor-pointer flex flex-col items-center ${isUploading ? 'cursor-wait' : ''}`}>
                                        {isUploading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3"></div>
                                                <span className="text-emerald-700 font-medium">Chargement en cours...</span>
                                            </div>
                                        ) : formData.profilePhotoUrl ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-emerald-600">
                                                    <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-emerald-800 font-bold">Photo chargée !</span>
                                                <span className="text-emerald-600 text-xs mt-1">Cliquez pour remplacer</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 mb-3 group-hover:scale-110 transition">
                                                    <UploadCloud size={24} />
                                                </div>
                                                <span className="text-gray-900 font-medium">Cliquez pour ajouter votre photo</span>
                                                <span className="text-gray-500 text-xs mt-1">JPG ou PNG (Max 10 Mo)</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Badge Preview */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <h3 className="text-sm font-bold text-gray-700 mb-4">Prévisualisation de votre badge</h3>
                                {/* Bordure extérieure verte */}
                                <div className="p-1 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-xl">
                                    <div 
                                        className="bg-[#F5F1E8] rounded-lg shadow-lg p-6 relative"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
                                        }}
                                    >
                                        {/* Drapeaux dans les coins */}
                                        <div className="absolute top-3 left-3">
                                            <BeninFlag className="w-8 h-8 drop-shadow-md" />
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <BeninFlag className="w-8 h-8 drop-shadow-md" />
                                        </div>
                                        
                                        <div className="text-center mb-4 mt-8">
                                            <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-emerald-600 shadow-lg mb-3">
                                                {formData.profilePhotoUrl ? (
                                                    <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover object-center" />
                                                ) : (
                                                    <User size={32} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">{formData.nom || "NOM"} {formData.prenom || "Prénom"}</div>
                                            <div className="text-gray-600 text-sm">Plombier - {formData.ville || "Ville"}</div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-medium">Statut</span>
                                                <span className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm ${paymentSuccess ? 'bg-emerald-600 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {paymentSuccess ? (
                                                        <>
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            VÉRIFIÉ
                                                        </>
                                                    ) : (
                                                        <>EN ATTENTE</>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-medium">ID National</span>
                                                <span className="font-mono text-emerald-700 font-bold text-xs">{membershipId || 'BEN-PLOMB-2024-XXXX'}</span>
                                            </div>
                                            {paymentSuccess && (
                                                <div className="pt-4 flex justify-center border-t-2 border-emerald-600">
                                                    <div className="bg-white p-2 rounded-lg border-2 border-emerald-600 shadow-md">
                                                        <img
                                                            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=PREUVE_CERTIFICATION_BENIN"
                                                            alt="QR Code"
                                                            className="h-24 w-24"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {!paymentSuccess && (
                                                <div className="pt-4 flex flex-col items-center border-t-2 border-emerald-600">
                                                    <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
                                                        <p className="text-gray-500 text-xs text-center font-medium">QR Code disponible après paiement</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Footer */}
                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        {currentStep > 1 && (
                            <button
                                onClick={handlePrevious}
                                className="text-gray-600 hover:text-gray-900 font-medium px-6 py-3 flex items-center gap-2 transition"
                            >
                                <ArrowLeft size={18} /> Précédent
                            </button>
                        )}
                        <div className="flex-1"></div>
                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={isUploading || isLoading}
                                className={`bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition transform active:scale-95 ${isUploading || isLoading ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Chargement...
                                    </>
                                ) : (
                                    <>
                                        Suivant <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={paymentSuccess ? handleDownloadBadge : handlePayment}
                                disabled={isLoading || isUploading}
                                className={`bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition transform active:scale-95 ${isLoading || isUploading ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isLoading ? 'Traitement...' : paymentSuccess ? 'Télécharger' : 'Procéder au paiement'}
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-emerald-100 p-4 rounded-full mb-4">
                                <CheckCircle size={48} className="text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Paiement effectué avec succès !
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Votre certification est maintenant active. Vous pouvez télécharger votre badge numérique et commencer à recevoir des demandes.
                            </p>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    // TODO: Redirect to dashboard or badge download page
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition w-full"
                            >
                                Télécharger mon badge
                            </button>
                        </div>
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
