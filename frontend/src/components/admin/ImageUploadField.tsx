"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Link as LinkIcon, Loader2, Trash2, UploadCloud } from "lucide-react";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  helperText?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  folder = "cms",
  label,
  helperText,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isManualUrlMode, setIsManualUrlMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengunggah gambar");
      }

      onChange(json.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal mengunggah file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    setUploadError(null);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">{label}</label>
          <button
            type="button"
            onClick={() => setIsManualUrlMode(!isManualUrlMode)}
            className="text-[10px] text-[#F97316] hover:underline flex items-center gap-1 font-medium"
          >
            <LinkIcon className="w-2.5 h-2.5" />
            <span>{isManualUrlMode ? "Mode Unggah File" : "Input URL Gambar"}</span>
          </button>
        </div>
      )}

      {isManualUrlMode ? (
        <div className="space-y-1.5">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... atau /uploads/..."
            className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-slate-900 font-mono focus:outline-none focus:border-[#F97316]"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />

          {value ? (
            /* Preview Box */
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                <Image
                  src={value}
                  alt="Preview"
                  fill
                  sizes="64px"
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1 text-xs">
                <p className="font-mono text-[11px] text-slate-700 truncate" title={value}>
                  {value}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-[#F97316] hover:underline disabled:opacity-50"
                  >
                    Ganti Gambar
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Drop Area */
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed border-[#E2E8F0] hover:border-[#F97316] bg-slate-50/50 hover:bg-orange-50/20 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isUploading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-1.5 py-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
                  <span className="text-xs font-semibold text-slate-700">Mengunggah file...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <div className="w-8 h-8 rounded-full bg-orange-100/70 text-[#F97316] flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-[#F97316]">Pilih file gambar</span>
                    <span className="text-slate-500"> atau klik di sini</span>
                  </div>
                  <p className="text-[10px] text-slate-400">JPG, PNG, WebP hingga 5MB</p>
                </div>
              )}
            </div>
          )}

          {uploadError && (
            <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
          )}
        </div>
      )}

      {helperText && <p className="text-[10px] text-slate-400">{helperText}</p>}
    </div>
  );
};

export default ImageUploadField;
