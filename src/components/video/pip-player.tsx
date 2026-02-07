'use client';

import { useState, useRef, useEffect } from 'react';

interface PipPlayerProps {
  videoUrl: string;
  title: string;
  thumbnailUrl?: string;
  currentTime?: number;
  onClose: () => void;
  onExpand: () => void;
}

export function PipPlayer({ videoUrl, title, thumbnailUrl, currentTime = 0, onClose, onExpand }: PipPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  // Set initial time
  useEffect(() => {
    if (videoRef.current && currentTime > 0) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.pip-controls')) return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 320, dragRef.current.startPosX + deltaX)),
        y: Math.max(0, Math.min(window.innerHeight - 200, dragRef.current.startPosY + deltaY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  return (
    <div
      className="fixed z-50 w-80 rounded-2xl border border-white/10 bg-deep-space shadow-2xl overflow-hidden cursor-move"
      style={{ 
        right: `${position.x}px`, 
        bottom: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Video */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnailUrl}
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-neon-cyan transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="pip-controls flex items-center justify-between p-3 cursor-default">
        <div className="flex items-center gap-2">
          {/* Skip back */}
          <button
            onClick={() => skip(-10)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Skip back 10s"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neon-cyan text-black"
          >
            {isPlaying ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Skip forward */}
          <button
            onClick={() => skip(10)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Skip forward 10s"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>

        {/* Title (truncated) */}
        <p className="flex-1 text-xs text-gray-400 truncate mx-3">{title}</p>

        <div className="flex items-center gap-1">
          {/* Expand */}
          <button
            onClick={onExpand}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Expand"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
            title="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Context provider for PiP state
import { createContext, useContext, ReactNode } from 'react';

interface PipContextType {
  activePip: {
    videoUrl: string;
    title: string;
    thumbnailUrl?: string;
    currentTime?: number;
    contentSlug: string;
  } | null;
  openPip: (video: PipContextType['activePip']) => void;
  closePip: () => void;
}

const PipContext = createContext<PipContextType | null>(null);

export function PipProvider({ children }: { children: ReactNode }) {
  const [activePip, setActivePip] = useState<PipContextType['activePip']>(null);

  return (
    <PipContext.Provider value={{
      activePip,
      openPip: setActivePip,
      closePip: () => setActivePip(null),
    }}>
      {children}
      {activePip && (
        <PipPlayer
          videoUrl={activePip.videoUrl}
          title={activePip.title}
          thumbnailUrl={activePip.thumbnailUrl}
          currentTime={activePip.currentTime}
          onClose={() => setActivePip(null)}
          onExpand={() => {
            window.location.href = `/content/${activePip.contentSlug}`;
          }}
        />
      )}
    </PipContext.Provider>
  );
}

export function usePip() {
  const context = useContext(PipContext);
  if (!context) throw new Error('usePip must be used within PipProvider');
  return context;
}
