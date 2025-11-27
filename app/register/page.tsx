
"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { registerPlumber, RegisterState } from "@/app/actions/register";
import { Wrench, Upload, MapPin, User, GraduationCap, CheckCircle2, Loader2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { BENIN_LOCATIONS } from "@/constants/locations";

const initialState: RegisterState = {
    message: "",
    errors: {},
    payload: {},
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#008751] hover:bg-[#006b40] disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement en cours...
                </>
            ) : (
                "Soumettre ma candidature"
            )}
        </button>
    );
}

export default function RegisterPage() {
    const [state, formAction] = useActionState(registerPlumber, initialState);
    const [diplomaUrl, setDiplomaUrl] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [cities, setCities] = useState<string[]>([]);

    // Initialize state from payload if available (on error)
    useEffect(() => {
        if (state.payload?.diplomeFileUrl) {
            setDiplomaUrl(state.payload.diplomeFileUrl);
        }
        if (state.payload?.departement) {
            setSelectedDept(state.payload.departement);
        }
    }, [state.payload]);

    // Update cities when department changes
    useEffect(() => {
        if (selectedDept && BENIN_LOCATIONS[selectedDept]) {
            setCities(BENIN_LOCATIONS[selectedDept]);
        } else {
            setCities([]);
        }
    }, [selectedDept]);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-[#008751] rounded-xl shadow-lg mb-4">
                        <Wrench className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Rejoignez le réseau</h1>
                    <p className="text-slate-600">
                        Inscrivez-vous pour devenir membre certifié et développer votre clientèle.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="h-2 bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#E8112D]"></div>

                    <form action={formAction} className="p-8 space-y-8">
                        {state.success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {state.message}
                            </div>
                        )}

                        {state.message && !state.success && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                {state.message}
                            </div>
                        )}

                        {/* Informations Personnelles */}
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#008751]" />
                                Informations Personnelles
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="nom" className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        name="nom"
                                        id="nom"
                                        required
                                        defaultValue={state.payload?.nom}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="Votre nom"
                                    />
                                    {state.errors?.nom && <p className="mt-1 text-sm text-red-600">{state.errors.nom}</p>}
                                </div>
                                <div>
                                    <label htmlFor="prenom" className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                                    <input
                                        type="text"
                                        name="prenom"
                                        id="prenom"
                                        required
                                        defaultValue={state.payload?.prenom}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="Votre prénom"
                                    />
                                    {state.errors?.prenom && <p className="mt-1 text-sm text-red-600">{state.errors.prenom}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="telephone" className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        id="telephone"
                                        required
                                        defaultValue={state.payload?.telephone}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="Ex: 97000000"
                                    />
                                    {state.errors?.telephone && <p className="mt-1 text-sm text-red-600">{state.errors.telephone}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100"></div>

                        {/* Localisation */}
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#FCD116]" />
                                Localisation
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="departement" className="block text-sm font-medium text-slate-700 mb-1">Département</label>
                                    <select
                                        name="departement"
                                        id="departement"
                                        required
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {Object.keys(BENIN_LOCATIONS).map((dept) => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    {state.errors?.departement && <p className="mt-1 text-sm text-red-600">{state.errors.departement}</p>}
                                </div>
                                <div>
                                    <label htmlFor="ville" className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                                    <select
                                        name="ville"
                                        id="ville"
                                        required
                                        defaultValue={state.payload?.ville}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {cities.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    {state.errors?.ville && <p className="mt-1 text-sm text-red-600">{state.errors.ville}</p>}
                                </div>
                                <div>
                                    <label htmlFor="quartier" className="block text-sm font-medium text-slate-700 mb-1">Quartier</label>
                                    <input
                                        type="text"
                                        name="quartier"
                                        id="quartier"
                                        required
                                        defaultValue={state.payload?.quartier}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="Ex: Fidjrossè"
                                    />
                                    {state.errors?.quartier && <p className="mt-1 text-sm text-red-600">{state.errors.quartier}</p>}
                                </div>
                                <div>
                                    <label htmlFor="adresse" className="block text-sm font-medium text-slate-700 mb-1">Adresse (Optionnel)</label>
                                    <input
                                        type="text"
                                        name="adresse"
                                        id="adresse"
                                        defaultValue={state.payload?.adresse}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="Ex: Rue 123, Carré 456"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100"></div>

                        {/* Professionnel */}
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-[#E8112D]" />
                                Informations Professionnelles
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="diplomeAnnee" className="block text-sm font-medium text-slate-700 mb-1">Année d'obtention du diplôme</label>
                                    <input
                                        type="number"
                                        name="diplomeAnnee"
                                        id="diplomeAnnee"
                                        required
                                        min="1950"
                                        max={new Date().getFullYear()}
                                        defaultValue={state.payload?.diplomeAnnee}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="Ex: 2015"
                                    />
                                    {state.errors?.diplomeAnnee && <p className="mt-1 text-sm text-red-600">{state.errors.diplomeAnnee}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Diplôme / Attestation (Image ou PDF)</label>

                                    <CldUploadWidget
                                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                        onSuccess={(result: any) => {
                                            setDiplomaUrl(result.info.secure_url);
                                        }}
                                    >
                                        {({ open }) => {
                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => open()}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#008751] hover:bg-green-50 transition-all text-slate-600"
                                                >
                                                    {diplomaUrl ? (
                                                        <>
                                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                            <span className="text-green-700 font-medium">Fichier téléchargé avec succès</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-5 h-5" />
                                                            <span>Cliquez pour télécharger votre diplôme</span>
                                                        </>
                                                    )}
                                                </button>
                                            );
                                        }}
                                    </CldUploadWidget>

                                    <input type="hidden" name="diplomeFileUrl" value={diplomaUrl} />

                                    {state.errors?.diplomeFileUrl && <p className="mt-1 text-sm text-red-600">{state.errors.diplomeFileUrl}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <SubmitButton />
                            <p className="mt-4 text-center text-sm text-slate-500">
                                En soumettant ce formulaire, vous acceptez que vos informations soient vérifiées par l'association.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

