'use client';

import Link from 'next/link';
import Image from 'next/image';

const featuredTours = [
  {
    name: 'Pumas of Patagonia',
    location: 'Chile',
    duration: '7 days',
    image: '/tours/puma.jpg',
    highlight: 'Come face-to-face with wild pumas',
  },
  {
    name: 'Jaguars of the Pantanal',
    location: 'Brazil',
    duration: '10 days',
    image: '/tours/jaguar.jpg',
    highlight: 'Watch jaguars hunt caiman',
  },
  {
    name: 'Tigers of India',
    location: 'India',
    duration: '12 days',
    image: '/tours/tiger.jpg',
    highlight: 'Photograph tigers in central India',
  },
];

export function ExpeditionPromo() {
  return (
    <section className="rounded-2xl border border-neon-purple/30 bg-gradient-to-br from-neon-purple/10 to-transparent p-4 sm:p-6 backdrop-blur-sm overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-neon-purple/20 blur-3xl" />
      
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦁</span>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">Wild Cat Photo Expeditions</h3>
              <p className="text-xs sm:text-sm text-gray-400">Luxury photo safaris with direct conservation impact</p>
            </div>
          </div>
          <a 
            href="https://catexpeditions.com/all-cat-photography-tours/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-neon-purple hover:underline self-start sm:self-auto"
          >
            View All Tours →
          </a>
        </div>

        {/* Featured Tours */}
        <div className="grid gap-4 sm:grid-cols-3">
          {featuredTours.map((tour) => (
            <a
              key={tour.name}
              href="https://catexpeditions.com/all-cat-photography-tours/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-neon-purple/50 transition-all hover:bg-white/10"
            >
              {/* Image placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-neon-purple/20 to-neon-cyan/10 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">🐆</span>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-deep-space to-transparent" />
                {/* Location badge */}
                <span className="absolute bottom-2 left-2 rounded bg-white/20 backdrop-blur-sm px-2 py-0.5 text-xs text-white">
                  {tour.location} • {tour.duration}
                </span>
              </div>
              
              <div className="p-3">
                <p className="font-medium text-white group-hover:text-neon-purple transition-colors">
                  {tour.name}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{tour.highlight}</p>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-4 rounded-xl bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 p-4 border border-white/10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <p className="font-semibold text-white">Ready for the adventure of a lifetime?</p>
              <p className="text-sm text-gray-400">Join Sebastian on an ethical wild cat photo expedition</p>
            </div>
            <a
              href="https://catexpeditions.com/all-cat-photography-tours/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan px-6 py-3 font-semibold text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
            >
              Explore Cat Expeditions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
