"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, X, FileText } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  currentPreview?: string;
  label?: string;
  accept?: string;
  name: string;
}

export default function FileUpload({
  onFileSelect,
  currentPreview,
  label = "Télécharger un fichier",
  accept = "image/jpeg,image/jpg,image/png,image/webp,application/pdf",
  name,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPreview || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`Le fichier est trop volumineux (${sizeMB} MB). Taille maximale : 10 MB`);
      // Reset l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Vérifier le type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("Type de fichier non supporté. Utilisez JPG, PNG, WEBP ou PDF");
      // Reset l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setError(null);
    setFileName(file.name);
    setFileType(file.type);
    setFileSize(formatFileSize(file.size));

    // Créer une prévisualisation pour les images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    // Notifier le parent du fichier sélectionné
    onFileSelect(file);
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    setFileType(null);
    setFileSize(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        onClick={(e) => {
          // Reset l'input pour permettre de sélectionner le même fichier à nouveau
          (e.target as HTMLInputElement).value = "";
        }}
      />

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Prévisualisation */}
      {(preview || fileName) && (
        <div className="relative border-2 border-green-300 rounded-lg p-4 bg-green-50">
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>

          {preview ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Prévisualisation"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-green-700 font-medium">{fileName}</p>
                <p className="text-xs text-slate-500">{fileSize}</p>
              </div>
            </div>
          ) : fileType === "application/pdf" ? (
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{fileName}</p>
                <p className="text-xs text-slate-500">Document PDF • {fileSize}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          ) : null}
        </div>
      )}

      {/* Bouton de sélection */}
      {!fileName && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#008751] hover:bg-green-50 transition-all text-slate-600"
        >
          <Upload className="w-5 h-5" />
          <span>{label}</span>
        </button>
      )}
    </div>
  );
}

