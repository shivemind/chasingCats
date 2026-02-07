'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  location?: string;
  species?: string;
  camera?: string;
  votes: number;
  hasVoted: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  onVote: (photoId: string) => void;
  onUpload?: () => void;
}

export function PhotoGallery({ photos, onVote, onUpload }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [filter, setFilter] = useState<'all' | 'featured' | 'recent'>('all');

  const filteredPhotos = photos.filter((photo) => {
    if (filter === 'featured') return photo.isFeatured;
    if (filter === 'recent') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(photo.createdAt) > oneWeekAgo;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📸</span> Member Gallery
          </h2>
          <p className="text-gray-400 mt-1">Wildlife photos from our community</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Filters */}
          <div className="flex gap-1 rounded-full bg-white/5 p-1">
            {(['all', 'featured', 'recent'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-neon-cyan text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'featured' ? '⭐ Featured' : '🆕 Recent'}
              </button>
            ))}
          </div>

          {/* Upload button */}
          {onUpload && (
            <button
              onClick={onUpload}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 text-sm font-medium text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload
            </button>
          )}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid group relative overflow-hidden rounded-2xl border border-white/10 bg-deep-space/50 cursor-pointer transition-all hover:border-neon-cyan/30"
            onClick={() => setSelectedPhoto(photo)}
          >
            {/* Image */}
            <div className="relative">
              <Image
                src={photo.imageUrl}
                alt={photo.title || 'Wildlife photo'}
                width={400}
                height={300}
                className="w-full h-auto object-cover"
              />

              {/* Featured badge */}
              {photo.isFeatured && (
                <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
                  ⭐ Featured
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Info on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                {photo.title && (
                  <p className="font-semibold text-white">{photo.title}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-6 w-6 rounded-full bg-white/20 overflow-hidden">
                    {photo.author.avatarUrl ? (
                      <Image
                        src={photo.author.avatarUrl}
                        alt={photo.author.name}
                        width={24}
                        height={24}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs">
                        {photo.author.name[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-white/80">{photo.author.name}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {photo.species && (
                  <span className="flex items-center gap-1">
                    🐆 {photo.species}
                  </span>
                )}
                {photo.location && (
                  <span className="flex items-center gap-1">
                    📍 {photo.location}
                  </span>
                )}
              </div>

              {/* Vote button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(photo.id);
                }}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-all ${
                  photo.hasVoted
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                }`}
              >
                <span>{photo.hasVoted ? '❤️' : '🤍'}</span>
                <span>{photo.votes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onVote={() => onVote(selectedPhoto.id)}
        />
      )}
    </div>
  );
}

function PhotoLightbox({ 
  photo, 
  onClose, 
  onVote 
}: { 
  photo: GalleryPhoto; 
  onClose: () => void;
  onVote: () => void;
}) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl max-h-[90vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/60 hover:text-white"
        >
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image */}
          <div className="flex-1">
            <Image
              src={photo.imageUrl}
              alt={photo.title || 'Wildlife photo'}
              width={1200}
              height={800}
              className="rounded-2xl object-contain max-h-[70vh]"
            />
          </div>

          {/* Info panel */}
          <div className="lg:w-80 rounded-2xl border border-white/10 bg-deep-space/80 p-6 backdrop-blur-sm">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/10 overflow-hidden">
                {photo.author.avatarUrl ? (
                  <Image
                    src={photo.author.avatarUrl}
                    alt={photo.author.name}
                    width={48}
                    height={48}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-lg">
                    {photo.author.name[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-white">{photo.author.name}</p>
                <p className="text-sm text-gray-400">
                  {new Date(photo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Title & description */}
            {photo.title && (
              <h3 className="mt-4 text-xl font-bold text-white">{photo.title}</h3>
            )}
            {photo.description && (
              <p className="mt-2 text-gray-400">{photo.description}</p>
            )}

            {/* Meta */}
            <div className="mt-6 space-y-2">
              {photo.species && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Species:</span>
                  <span className="text-white">{photo.species}</span>
                </div>
              )}
              {photo.location && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-white">{photo.location}</span>
                </div>
              )}
              {photo.camera && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Camera:</span>
                  <span className="text-white">{photo.camera}</span>
                </div>
              )}
            </div>

            {/* Vote button */}
            <button
              onClick={onVote}
              className={`mt-6 w-full flex items-center justify-center gap-2 rounded-full py-3 font-semibold transition-all ${
                photo.hasVoted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-white border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
              }`}
            >
              <span className="text-xl">{photo.hasVoted ? '❤️' : '🤍'}</span>
              <span>{photo.votes} {photo.votes === 1 ? 'vote' : 'votes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
