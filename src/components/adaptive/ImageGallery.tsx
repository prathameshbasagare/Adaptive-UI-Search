// File: ./src/components/adaptive/ImageGallery.tsx

"use client";

import { useEffect, useState } from "react";
import { Camera, ExternalLink } from "lucide-react";

interface PexelsPhoto {
  url: string;
  thumb: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

interface ImageGalleryProps {
  query: string;
  count?: number;
  caption?: string;
}

export default function ImageGallery({ query, count = 6, caption }: ImageGalleryProps) {
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);
    fetch(`/api/images?query=${encodeURIComponent(query)}&count=${count}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPhotos(data.photos ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query, count]);

  if (loading) {
    return (
      <div className="space-y-2">
        {caption && <p className="text-sm text-slate-400 mb-3">{caption}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="aspect-video bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-10 rounded-xl border border-dashed border-slate-700 text-center"
      >
        <Camera size={32} className="text-slate-600" />
        <p className="text-sm text-slate-500">{error}</p>
        <p className="text-xs text-slate-600">Add your PEXELS_API_KEY to enable image search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {caption && <p className="text-sm text-slate-400">{caption}</p>}
      <div className="columns-2 sm:columns-3 gap-3 space-y-3">
        {photos.map((photo, i) => (
          <div key={i} className="group relative overflow-hidden rounded-xl break-inside-avoid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumb}
              alt={photo.alt}
              className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
              <a
                href={photo.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-white text-xs font-medium hover:underline"
              >
                <Camera size={11} />
                {photo.photographer}
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-600 text-right">
        Photos by{" "}
        <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500">
          Pexels
        </a>
      </p>
    </div>
  );
}
