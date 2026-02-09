'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import { ImagePlus, X, Lock, Upload, Link as LinkIcon, Video, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { FeedPost } from '@/types/feed';

type CreatePostFormProps = {
  onPostCreated: (post: FeedPost) => void;
  hasPaidAccess?: boolean;
};

type MediaPreview = {
  url: string;
  type: 'image' | 'video';
  isUploading?: boolean;
  file?: File;
};

export function CreatePostForm({ onPostCreated, hasPaidAccess = false }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      setError('Please select an image or video file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setMedia({
      url: previewUrl,
      type: isVideo ? 'video' : 'image',
      isUploading: true,
      file
    });
    setShowMediaOptions(false);
    setShowUrlInput(false);
    setError('');

    // Upload file
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 10, 90));
      }, 200);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (res.ok) {
        const data = await res.json();
        setUploadProgress(100);
        // Update media with uploaded URL
        setMedia({
          url: data.url,
          type: data.type,
          isUploading: false
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to upload file');
        setMedia(null);
      }
    } catch {
      setError('Failed to upload file. Please try again.');
      setMedia(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    
    // Simple URL validation
    try {
      new URL(urlInput);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    // Detect if video URL
    const isVideo = /\.(mp4|webm|mov)$/i.test(urlInput);
    
    setMedia({
      url: urlInput.trim(),
      type: isVideo ? 'video' : 'image',
      isUploading: false
    });
    setShowUrlInput(false);
    setUrlInput('');
    setShowMediaOptions(false);
    setError('');
  };

  const removeMedia = () => {
    if (media?.file) {
      URL.revokeObjectURL(media.url);
    }
    setMedia(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (media?.isUploading) return; // Don't submit while uploading

    setError('');
    startTransition(async () => {
      try {
        const res = await fetch('/api/feed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: content.trim(),
            imageUrl: media?.url || undefined
          })
        });

        if (res.ok) {
          const post = await res.json();
          onPostCreated(post);
          setContent('');
          removeMedia();
          setShowMediaOptions(false);
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to create post');
        }
      } catch {
        setError('Failed to create post. Please try again.');
      }
    });
  };

  // Non-paid users see upgrade prompt
  if (!hasPaidAccess) {
    return (
      <div className="rounded-2xl border border-night/10 bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
            <Lock className="h-5 w-5 text-brand" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-night text-sm sm:text-base">Join the Pride!</p>
            <p className="text-xs sm:text-sm text-night/60">
              Upgrade to post, comment, purr & roar with the community.
            </p>
          </div>
          <Link
            href="/pricing"
            className="rounded-full bg-brand px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-brand/90 transition-colors active:scale-95"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "rounded-2xl border bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow-sm transition-all",
        isDragging 
          ? "border-brand border-dashed border-2 bg-brand/5" 
          : "border-night/10"
      )}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = ''; // Reset input
        }}
        className="hidden"
      />

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-brand/10 backdrop-blur-sm">
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto text-brand mb-2" />
            <p className="font-semibold text-brand">Drop to upload</p>
          </div>
        </div>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something with the pride... 🐾"
        rows={3}
        maxLength={2000}
        className="resize-none border-0 bg-transparent p-0 text-base placeholder:text-night/40 focus:ring-0"
        disabled={isPending || isUploading}
      />

      {/* Media Options Panel */}
      {showMediaOptions && !media && (
        <div className="mt-3 rounded-xl border border-night/10 bg-night/5 p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Upload File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-night/20 p-4 text-night/60 hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span className="text-sm font-medium">Upload File</span>
            </button>
            
            {/* URL Input Toggle */}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-night/20 p-4 text-night/60 hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors"
            >
              <LinkIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Paste URL</span>
            </button>
          </div>
          
          {/* URL Input */}
          {showUrlInput && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
                placeholder="https://example.com/image.jpg"
                className="flex-1 rounded-lg border border-night/10 bg-white px-3 py-2 text-sm placeholder:text-night/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
                className="px-4 text-xs"
              >
                Add
              </Button>
            </div>
          )}
          
          <p className="mt-3 text-[10px] sm:text-xs text-night/40 text-center">
            Supports: JPG, PNG, GIF, WebP, MP4, WebM (max 10MB) • Or drag & drop anywhere
          </p>
        </div>
      )}

      {/* Media Preview */}
      {media && (
        <div className="mt-3 relative rounded-xl overflow-hidden bg-night/5">
          {/* Upload Progress Overlay */}
          {media.isUploading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-night/50 backdrop-blur-sm">
              <div className="text-center">
                <Loader2 className="h-8 w-8 mx-auto text-white animate-spin mb-2" />
                <p className="text-sm font-medium text-white">Uploading... {uploadProgress}%</p>
                <div className="mt-2 w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Remove Button */}
          <button
            type="button"
            onClick={removeMedia}
            disabled={media.isUploading}
            className="absolute top-2 right-2 z-20 rounded-full bg-night/80 p-1.5 text-white hover:bg-night transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Media Display */}
          {media.type === 'video' ? (
            <video
              src={media.url}
              controls
              className="w-full max-h-64 object-contain"
            />
          ) : (
            <img
              src={media.url}
              alt="Preview"
              className="w-full max-h-64 object-contain"
              onError={() => {
                setError('Failed to load image');
                removeMedia();
              }}
            />
          )}
          
          {/* Video indicator */}
          {media.type === 'video' && !media.isUploading && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-night/80 px-2 py-1 text-xs text-white">
              <Video className="h-3 w-3" />
              Video
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-night/5 pt-3 sm:pt-4">
        <button
          type="button"
          onClick={() => {
            setShowMediaOptions(!showMediaOptions);
            if (!showMediaOptions) setShowUrlInput(false);
          }}
          disabled={isPending || isUploading || !!media}
          className={cn(
            "flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors active:scale-95",
            showMediaOptions || media
              ? "bg-brand/10 text-brand"
              : "text-night/60 hover:bg-night/5 hover:text-night",
            (isPending || isUploading || !!media) && "opacity-50 cursor-not-allowed"
          )}
        >
          <ImagePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Media</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-xs text-night/40">
            {content.length}/2000
          </span>
          <Button
            type="submit"
            disabled={isPending || isUploading || !content.trim() || media?.isUploading}
            className="px-4 sm:px-6 text-xs sm:text-sm"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Post'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
