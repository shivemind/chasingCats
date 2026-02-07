'use client';

import { useState } from 'react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'preset' | 'checklist' | 'template' | 'guide';
  fileUrl: string;
  fileSize: string;
  downloadCount: number;
  isPremium: boolean;
  category: string;
  thumbnailUrl?: string;
}

const RESOURCE_ICONS: Record<Resource['type'], string> = {
  pdf: '📄',
  preset: '🎨',
  checklist: '✅',
  template: '📋',
  guide: '📚',
};

const RESOURCE_COLORS: Record<Resource['type'], string> = {
  pdf: 'from-red-500 to-orange-500',
  preset: 'from-purple-500 to-pink-500',
  checklist: 'from-green-500 to-emerald-500',
  template: 'from-blue-500 to-cyan-500',
  guide: 'from-yellow-500 to-amber-500',
};

interface ResourceHubProps {
  resources: Resource[];
  categories: string[];
}

export function ResourceHub({ resources, categories }: ResourceHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<Resource['type'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  const handleDownload = async (resource: Resource) => {
    // Track download (would call API in production)
    console.log('Downloading:', resource.id);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = resource.fileUrl;
    link.download = resource.title;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-neon-cyan">📦</span> Resource Hub
          </h2>
          <p className="text-gray-400 mt-1">Download presets, guides, and checklists</p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 rounded-full bg-white/5 border border-white/10 px-4 py-2 pl-10 text-white placeholder-gray-400 focus:border-neon-cyan/50 focus:outline-none"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-neon-cyan text-black'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-neon-cyan text-black'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-2">
          {(['all', 'pdf', 'preset', 'checklist', 'template', 'guide'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedType === type
                  ? 'bg-neon-purple/30 text-neon-purple border border-neon-purple/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {type === 'all' ? '🗂️ All' : `${RESOURCE_ICONS[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-deep-space/50 p-6 transition-all hover:border-neon-cyan/30"
          >
            {/* Premium badge */}
            {resource.isPremium && (
              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                <span>⭐</span> Premium
              </div>
            )}

            {/* Icon */}
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${RESOURCE_COLORS[resource.type]} text-2xl`}>
              {RESOURCE_ICONS[resource.type]}
            </div>

            {/* Content */}
            <h3 className="mt-4 font-semibold text-white group-hover:text-neon-cyan transition-colors">
              {resource.title}
            </h3>
            <p className="mt-2 text-sm text-gray-400 line-clamp-2">{resource.description}</p>

            {/* Meta */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span className="uppercase">{resource.type}</span>
              <span>•</span>
              <span>{resource.fileSize}</span>
              <span>•</span>
              <span>{resource.downloadCount.toLocaleString()} downloads</span>
            </div>

            {/* Download button */}
            <button
              onClick={() => handleDownload(resource)}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 py-2.5 text-sm font-medium text-white transition-all hover:bg-neon-cyan/20 hover:border-neon-cyan/30 hover:text-neon-cyan"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-400">No resources found matching your filters</p>
        </div>
      )}
    </div>
  );
}

// Compact resource card for sidebar
export function ResourceCard({ resource, onDownload }: { resource: Resource; onDownload?: () => void }) {
  return (
    <button
      onClick={onDownload}
      className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/10 bg-white/5 text-left transition-all hover:bg-white/10 hover:border-neon-cyan/30"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${RESOURCE_COLORS[resource.type]}`}>
        {RESOURCE_ICONS[resource.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{resource.title}</p>
        <p className="text-xs text-gray-400">{resource.fileSize}</p>
      </div>
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </button>
  );
}
