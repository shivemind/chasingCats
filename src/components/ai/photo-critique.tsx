'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CritiqueCategory {
  name: string;
  icon: string;
  score: number;
  feedback: string;
  tips: string[];
}

interface PhotoCritique {
  overallScore: number;
  summary: string;
  categories: CritiqueCategory[];
  strengths: string[];
  improvements: string[];
  suggestedContent: { title: string; slug: string }[];
}

// Photo upload and critique component
export function PhotoCritiqueUpload({ onSubmit }: { onSubmit: (file: File) => Promise<PhotoCritique> }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [critique, setCritique] = useState<PhotoCritique | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setCritique(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    
    try {
      const result = await onSubmit(file);
      setCritique(result);
    } catch (error) {
      console.error('Failed to analyze photo:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setCritique(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {!preview ? (
        <label className="flex flex-col items-center justify-center h-80 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 cursor-pointer hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all">
          <div className="text-center">
            <span className="text-6xl">📸</span>
            <h3 className="mt-4 text-lg font-semibold text-white">Upload Your Photo</h3>
            <p className="mt-2 text-sm text-gray-400">Get instant AI feedback on composition, lighting, and more</p>
            <p className="mt-4 text-xs text-gray-500">JPG, PNG up to 10MB</p>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image preview */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <div className="relative aspect-[4/3]">
              <Image src={preview} alt="Your photo" fill className="object-contain bg-black" />
            </div>
            
            {/* Analyzing overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="text-center">
                  <div className="relative mx-auto h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-4 border-neon-cyan/30 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-4 border-t-neon-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl">🐱</span>
                    </div>
                  </div>
                  <p className="mt-4 text-white font-medium">Analyzing your photo...</p>
                  <p className="text-sm text-gray-400">Our AI is reviewing composition, lighting, and technique</p>
                </div>
              </div>
            )}

            {/* Controls */}
            {!isAnalyzing && !critique && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-full border border-white/20 bg-black/50 backdrop-blur-md py-2 text-white hover:bg-white/10 transition-colors"
                >
                  Change Photo
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-2 font-semibold text-white"
                >
                  ✨ Get Critique
                </button>
              </div>
            )}
          </div>

          {/* Critique results */}
          {critique && (
            <div className="space-y-4">
              <PhotoCritiqueResults critique={critique} />
              <button
                onClick={handleReset}
                className="w-full rounded-full border border-white/10 py-3 text-white hover:bg-white/10 transition-colors"
              >
                Analyze Another Photo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Placeholder critique while no photo */}
      {!preview && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h4 className="font-semibold text-white mb-4">What our AI analyzes:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🎯', name: 'Composition' },
              { icon: '💡', name: 'Lighting' },
              { icon: '🔍', name: 'Focus & Sharpness' },
              { icon: '🎨', name: 'Color & Exposure' },
              { icon: '🐱', name: 'Subject Framing' },
              { icon: '📐', name: 'Rule of Thirds' },
              { icon: '✨', name: 'Visual Impact' },
              { icon: '📸', name: 'Technical Quality' },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-gray-400">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Critique results display
function PhotoCritiqueResults({ critique }: { critique: PhotoCritique }) {
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {/* Overall score */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${critique.overallScore * 2.26} 226`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00F5D4" />
                  <stop offset="100%" stopColor="#B794F6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{critique.overallScore}</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Overall Score</h3>
            <p className="text-sm text-gray-400 mt-1">{critique.summary}</p>
          </div>
        </div>
      </div>

      {/* Category scores */}
      <div className="grid gap-3">
        {critique.categories.map((category) => (
          <div key={category.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium text-white">{category.name}</span>
              </div>
              <span className={`text-lg font-bold ${
                category.score >= 80 ? 'text-green-400' :
                category.score >= 60 ? 'text-yellow-400' :
                'text-orange-400'
              }`}>
                {category.score}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-3">
              <div 
                className={`h-full ${
                  category.score >= 80 ? 'bg-green-400' :
                  category.score >= 60 ? 'bg-yellow-400' :
                  'bg-orange-400'
                }`}
                style={{ width: `${category.score}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">{category.feedback}</p>
            {category.tips.length > 0 && (
              <div className="mt-2 space-y-1">
                {category.tips.map((tip, i) => (
                  <p key={i} className="text-xs text-neon-cyan flex items-start gap-1">
                    <span>💡</span>
                    <span>{tip}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
          <h4 className="flex items-center gap-2 font-medium text-green-400 mb-3">
            <span>✅</span> Strengths
          </h4>
          <ul className="space-y-2">
            {critique.strengths.map((item, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-green-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
          <h4 className="flex items-center gap-2 font-medium text-orange-400 mb-3">
            <span>🎯</span> Areas to Improve
          </h4>
          <ul className="space-y-2">
            {critique.improvements.map((item, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-orange-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested content */}
      {critique.suggestedContent.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="font-medium text-white mb-3">📚 Recommended Learning</h4>
          <div className="space-y-2">
            {critique.suggestedContent.map((content) => (
              <a
                key={content.slug}
                href={`/content/${content.slug}`}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span>{content.title}</span>
                <span>→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Quick critique button for gallery
export function QuickCritiqueButton({ photoUrl: _photoUrl, onClick }: { photoUrl: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-full bg-neon-purple/20 px-3 py-1 text-xs font-medium text-neon-purple hover:bg-neon-purple/30 transition-colors"
    >
      <span>🤖</span>
      <span>AI Critique</span>
    </button>
  );
}
