'use client';

import { useRef } from 'react';

export interface Certificate {
  id: string;
  title: string;
  recipientName: string;
  courseName: string;
  completionDate: string;
  instructorName?: string;
  certificateNumber: string;
  skills?: string[];
}

interface CertificateDisplayProps {
  certificate: Certificate;
  onShare?: () => void;
  onDownload?: () => void;
}

export function CertificateDisplay({ certificate, onShare, onDownload }: CertificateDisplayProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-6">
      {/* Certificate */}
      <div 
        ref={certificateRef}
        className="relative aspect-[1.414/1] w-full max-w-3xl mx-auto rounded-2xl border-4 border-yellow-400/50 bg-gradient-to-br from-deep-space via-midnight to-deep-space p-8 overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-yellow-400" />
          <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-yellow-400" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-yellow-400" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-yellow-400" />
        </div>

        {/* Cat eyes decoration */}
        <div className="absolute top-8 right-8 flex gap-2 opacity-30">
          <div className="h-3 w-6 rounded-full bg-cat-eye shadow-[0_0_10px_#ffd700]" />
          <div className="h-3 w-6 rounded-full bg-cat-eye shadow-[0_0_10px_#ffd700]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1">
              <div className="h-2 w-4 rounded-full bg-cat-eye animate-pulse" />
              <div className="h-2 w-4 rounded-full bg-cat-eye animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Chasing Cats Club
            </span>
          </div>

          {/* Certificate title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Certificate of Completion
          </h1>
          <p className="text-gray-400 mb-8">This certifies that</p>

          {/* Recipient name */}
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent mb-4">
            {certificate.recipientName}
          </h2>

          <p className="text-gray-400 mb-4">has successfully completed</p>

          {/* Course name */}
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">
            {certificate.courseName}
          </h3>

          {/* Skills */}
          {certificate.skills && certificate.skills.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {certificate.skills.map((skill) => (
                <span 
                  key={skill}
                  className="rounded-full bg-neon-cyan/20 px-3 py-1 text-xs text-neon-cyan"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Date and instructor */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div>
              <p className="text-white font-medium">{new Date(certificate.completionDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p>Date of Completion</p>
            </div>
            {certificate.instructorName && (
              <div>
                <p className="text-white font-medium">{certificate.instructorName}</p>
                <p>Instructor</p>
              </div>
            )}
          </div>

          {/* Certificate number */}
          <p className="absolute bottom-6 text-xs text-gray-500">
            Certificate ID: {certificate.certificateNumber}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-3 text-white transition-all hover:bg-white/10"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-3 text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share on LinkedIn
        </button>
      </div>
    </div>
  );
}

// Mini certificate card for profile
export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <div className="group rounded-xl border border-white/10 bg-gradient-to-br from-yellow-400/5 to-amber-400/5 p-4 transition-all hover:border-yellow-400/30">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-xl">
          🏆
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate group-hover:text-yellow-400 transition-colors">
            {certificate.courseName}
          </h4>
          <p className="text-xs text-gray-400">
            Completed {new Date(certificate.completionDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
