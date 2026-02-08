'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  name: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
  usedIn?: string[];
}

interface MediaLibraryProps {
  media: MediaItem[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (ids: string[]) => Promise<void>;
  onUpdateTags: (id: string, tags: string[]) => Promise<void>;
  onSelect?: (media: MediaItem) => void;
  selectable?: boolean;
}

export function MediaLibrary({ media, onUpload, onDelete, onUpdateTags, onSelect, selectable }: MediaLibraryProps) {
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Get all unique tags
  const allTags = [...new Set(media.flatMap(m => m.tags))];

  // Filter media
  const filteredMedia = media.filter(m => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (tagFilter && !m.tags.includes(tagFilter)) return false;
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 10, 90));
      }, 200);
      
      await onUpload(files);
      
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setShowUploadModal(false);
      }, 500);
    } catch {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    await onUpload(files);
    setIsUploading(false);
  };

  const toggleSelect = (id: string) => {
    if (selectedMedia.includes(id)) {
      setSelectedMedia(selectedMedia.filter(i => i !== id));
    } else {
      setSelectedMedia([...selectedMedia, id]);
    }
  };

  const handleAddTag = () => {
    if (newTag && !editingTags.includes(newTag)) {
      setEditingTags([...editingTags, newTag]);
      setNewTag('');
    }
  };

  const handleSaveTags = async () => {
    if (showDetailModal) {
      await onUpdateTags(showDetailModal.id, editingTags);
      setShowDetailModal({ ...showDetailModal, tags: editingTags });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Media Library</h2>
          <p className="text-sm text-gray-400">{media.length} files • {formatFileSize(media.reduce((acc, m) => acc + m.size, 0))} total</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 font-medium text-white"
        >
          + Upload Media
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex-1 min-w-48">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded px-3 py-1 ${viewMode === 'grid' ? 'bg-white/10' : ''}`}
          >
            ▦
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded px-3 py-1 ${viewMode === 'list' ? 'bg-white/10' : ''}`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedMedia.length > 0 && (
        <div className="flex items-center gap-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 p-4">
          <span className="text-white">{selectedMedia.length} selected</span>
          <button
            onClick={() => onDelete(selectedMedia).then(() => setSelectedMedia([]))}
            className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400"
          >
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedMedia([])}
            className="text-sm text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredMedia.map(item => (
            <div
              key={item.id}
              className={`group relative rounded-xl border overflow-hidden cursor-pointer ${
                selectedMedia.includes(item.id) ? 'border-neon-cyan ring-2 ring-neon-cyan/30' : 'border-white/10'
              }`}
              onClick={() => selectable && onSelect ? onSelect(item) : setShowDetailModal(item)}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-white/5 relative">
                {item.type === 'image' ? (
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                    {item.duration && (
                      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                        {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                )}

                {/* Select checkbox */}
                <div
                  className={`absolute top-2 left-2 transition-opacity ${
                    selectedMedia.includes(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                >
                  <div className={`h-5 w-5 rounded border flex items-center justify-center ${
                    selectedMedia.includes(item.id) ? 'bg-neon-cyan border-neon-cyan' : 'bg-black/50 border-white/30'
                  }`}>
                    {selectedMedia.includes(item.id) && <span className="text-xs">✓</span>}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-2 bg-white/5">
                <p className="text-xs text-white truncate">{item.name}</p>
                <p className="text-[10px] text-gray-500">{formatFileSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => setSelectedMedia(e.target.checked ? filteredMedia.map(m => m.id) : [])}
                    checked={selectedMedia.length === filteredMedia.length && filteredMedia.length > 0}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Preview</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Size</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tags</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map(item => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                  onClick={() => setShowDetailModal(item)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedMedia.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 rounded overflow-hidden bg-white/10">
                      {item.type === 'image' ? (
                        <Image src={item.thumbnailUrl || item.url} alt="" width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">🎬</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white">{item.name}</td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{item.type}</td>
                  <td className="px-4 py-3 text-gray-400">{formatFileSize(item.size)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-400">{tag}</span>
                      ))}
                      {item.tags.length > 3 && <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {new Date(item.uploadedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-white/10 bg-deep-space p-6">
            <h3 className="text-lg font-bold text-white mb-4">Upload Media</h3>
            
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center cursor-pointer hover:border-neon-cyan/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {isUploading ? (
                <div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                    <div className="h-full bg-neon-cyan transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-gray-400">Uploading... {uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <p className="text-3xl mb-2">📤</p>
                  <p className="text-white font-medium">Drop files here or click to upload</p>
                  <p className="text-sm text-gray-500 mt-1">Images and videos up to 100MB</p>
                </>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-xl border border-white/10 bg-deep-space">
            <div className="flex">
              {/* Preview */}
              <div className="w-1/2 bg-black flex items-center justify-center">
                {showDetailModal.type === 'image' ? (
                  <Image
                    src={showDetailModal.url}
                    alt={showDetailModal.name}
                    width={400}
                    height={400}
                    className="max-h-96 w-auto object-contain"
                  />
                ) : (
                  <video src={showDetailModal.url} controls className="max-h-96" />
                )}
              </div>

              {/* Details */}
              <div className="w-1/2 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white truncate">{showDetailModal.name}</h3>
                  <button onClick={() => setShowDetailModal(null)} className="text-gray-400 hover:text-white">×</button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="text-white capitalize">{showDetailModal.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size</span>
                    <span className="text-white">{formatFileSize(showDetailModal.size)}</span>
                  </div>
                  {showDetailModal.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dimensions</span>
                      <span className="text-white">{showDetailModal.dimensions.width} × {showDetailModal.dimensions.height}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uploaded</span>
                    <span className="text-white">{new Date(showDetailModal.uploadedAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingTags.length === 0 ? showDetailModal.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">{tag}</span>
                    )) : editingTags.map(tag => (
                      <span key={tag} className="rounded-full bg-neon-cyan/20 px-3 py-1 text-xs text-neon-cyan flex items-center gap-1">
                        {tag}
                        <button onClick={() => setEditingTags(editingTags.filter(t => t !== tag))}>×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onFocus={() => setEditingTags(showDetailModal.tags)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add tag..."
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-white"
                    />
                    {editingTags.length > 0 && (
                      <button onClick={handleSaveTags} className="rounded-lg bg-neon-cyan px-3 py-1 text-sm text-black">
                        Save
                      </button>
                    )}
                  </div>
                </div>

                {/* URL */}
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">URL</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={showDetailModal.url}
                      readOnly
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(showDetailModal.url)}
                      className="rounded-lg bg-white/10 px-3 py-2 text-white"
                    >
                      📋
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => { onDelete([showDetailModal.id]); setShowDetailModal(null); }}
                    className="flex-1 rounded-lg bg-red-500/20 py-2 text-red-400"
                  >
                    Delete
                  </button>
                  {selectable && onSelect && (
                    <button
                      onClick={() => { onSelect(showDetailModal); setShowDetailModal(null); }}
                      className="flex-1 rounded-lg bg-neon-cyan py-2 text-black font-medium"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
