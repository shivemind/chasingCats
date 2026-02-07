'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface GearItem {
  category: string;
  name: string;
  notes?: string;
}

interface MemberProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  isFollowing?: boolean;
  
  // Stats
  stats: {
    followers: number;
    following: number;
    photos: number;
    coursesCompleted: number;
    hoursWatched: number;
    streak: number;
  };
  
  // Gear
  gear: GearItem[];
  
  // Favorite locations
  favoriteLocations?: string[];
  
  // Specialties
  specialties?: string[];
  
  // Achievements
  badges?: { id: string; name: string; icon: string; earnedAt: string }[];
  
  // Social links
  social?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
}

interface MemberProfileProps {
  profile: MemberProfile;
  isOwnProfile?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onMessage?: () => void;
}

export function MemberProfileHeader({ profile, isOwnProfile, onFollow, onUnfollow, onMessage }: MemberProfileProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'gear' | 'achievements'>('photos');
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);

  const handleFollowClick = () => {
    if (isFollowing) {
      onUnfollow?.();
    } else {
      onFollow?.();
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden">
      {/* Cover image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20">
        {profile.coverUrl && (
          <Image src={profile.coverUrl} alt="Cover" fill className="object-cover" />
        )}
        
        {/* Cat eyes decoration */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-30">
          <div className="h-3 w-6 rounded-full bg-cat-eye shadow-[0_0_10px_#ffd700]" />
          <div className="h-3 w-6 rounded-full bg-cat-eye shadow-[0_0_10px_#ffd700]" />
        </div>
      </div>

      {/* Profile info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-16 left-6 h-32 w-32 rounded-full border-4 border-deep-space overflow-hidden bg-white/10">
          {profile.avatarUrl ? (
            <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl text-white">
              {profile.name[0]}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 gap-3">
          {isOwnProfile ? (
            <Link
              href="/account/settings"
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
          ) : (
            <>
              <button
                onClick={onMessage}
                className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>
              <button
                onClick={handleFollowClick}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  isFollowing
                    ? 'border border-white/10 text-white hover:bg-white/10'
                    : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </>
          )}
        </div>

        {/* Name and username */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
          <p className="text-gray-400">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-gray-300">{profile.bio}</p>
        )}

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
          {profile.location && (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </span>
          )}
          {profile.website && (
            <a 
              href={profile.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-neon-cyan hover:underline"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Website
            </a>
          )}
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Specialties */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.specialties.map((specialty) => (
              <span 
                key={specialty}
                className="rounded-full bg-neon-cyan/10 px-3 py-1 text-xs text-neon-cyan"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-6">
          <button className="group">
            <span className="block text-xl font-bold text-white group-hover:text-neon-cyan transition-colors">
              {profile.stats.followers.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400">Followers</span>
          </button>
          <button className="group">
            <span className="block text-xl font-bold text-white group-hover:text-neon-cyan transition-colors">
              {profile.stats.following.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400">Following</span>
          </button>
          <div>
            <span className="block text-xl font-bold text-white">{profile.stats.photos}</span>
            <span className="text-sm text-gray-400">Photos</span>
          </div>
          <div>
            <span className="block text-xl font-bold text-white">{profile.stats.coursesCompleted}</span>
            <span className="text-sm text-gray-400">Courses</span>
          </div>
          {profile.stats.streak > 0 && (
            <div>
              <span className="block text-xl font-bold text-orange-400">🔥 {profile.stats.streak}</span>
              <span className="text-sm text-gray-400">Day Streak</span>
            </div>
          )}
        </div>

        {/* Social links */}
        {profile.social && (
          <div className="mt-6 flex gap-3">
            {profile.social.instagram && (
              <a
                href={`https://instagram.com/${profile.social.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}
            {profile.social.youtube && (
              <a
                href={`https://youtube.com/@${profile.social.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            )}
            {profile.social.twitter && (
              <a
                href={`https://twitter.com/${profile.social.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Gear section
export function GearSection({ gear }: { gear: GearItem[] }) {
  const categories = [...new Set(gear.map(g => g.category))];

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        📷 My Gear
      </h3>
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-400 mb-2">{category}</h4>
            <div className="space-y-2">
              {gear
                .filter(g => g.category === category)
                .map((item, index) => (
                  <div 
                    key={index}
                    className="rounded-xl bg-white/5 px-4 py-3"
                  >
                    <p className="text-white">{item.name}</p>
                    {item.notes && (
                      <p className="text-xs text-gray-400 mt-1">{item.notes}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
