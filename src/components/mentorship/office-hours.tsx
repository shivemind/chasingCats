'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Mentor {
  id: string;
  name: string;
  title: string;
  specialty: string[];
  avatarUrl?: string;
  bio: string;
  rating: number;
  totalSessions: number;
  nextAvailable?: string;
  hourlyRate: number;
  isPro: boolean;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked?: boolean;
}

interface Booking {
  id: string;
  mentorId: string;
  mentorName: string;
  date: string;
  startTime: string;
  duration: number;
  topic: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  meetingUrl?: string;
}

// Mentor card
export function MentorCard({ mentor, onBook }: { mentor: Mentor; onBook: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
            {mentor.avatarUrl ? (
              <Image src={mentor.avatarUrl} alt={mentor.name} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-2xl">
                {mentor.name[0]}
              </div>
            )}
            {mentor.isPro && (
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-cat-eye text-xs">
                ⭐
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{mentor.name}</h3>
            <p className="text-sm text-gray-400">{mentor.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-cat-eye">★ {mentor.rating.toFixed(1)}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 text-sm">{mentor.totalSessions} sessions</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-4 line-clamp-2">{mentor.bio}</p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mt-4">
          {mentor.specialty.map((spec) => (
            <span key={spec} className="rounded-full bg-white/5 px-2 py-1 text-xs text-gray-400">
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">${mentor.hourlyRate}</p>
            <p className="text-xs text-gray-500">per hour</p>
          </div>
          <div className="text-right">
            {mentor.nextAvailable && (
              <p className="text-xs text-gray-400">Next available</p>
            )}
            {mentor.nextAvailable && (
              <p className="text-sm text-neon-cyan">{new Date(mentor.nextAvailable).toLocaleDateString()}</p>
            )}
          </div>
        </div>
        <button
          onClick={onBook}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-semibold text-white"
        >
          Book Session
        </button>
      </div>
    </div>
  );
}

// Booking modal
export function BookingModal({ 
  mentor, 
  isOpen, 
  onClose,
  onBook 
}: { 
  mentor: Mentor; 
  isOpen: boolean; 
  onClose: () => void;
  onBook: (data: { date: string; slotId: string; topic: string; duration: number }) => void;
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);

  // Mock time slots
  const timeSlots: TimeSlot[] = [
    { id: '1', startTime: '09:00', endTime: '10:00', isAvailable: true },
    { id: '2', startTime: '10:00', endTime: '11:00', isAvailable: false },
    { id: '3', startTime: '11:00', endTime: '12:00', isAvailable: true },
    { id: '4', startTime: '14:00', endTime: '15:00', isAvailable: true },
    { id: '5', startTime: '15:00', endTime: '16:00', isAvailable: true },
    { id: '6', startTime: '16:00', endTime: '17:00', isAvailable: false },
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook({ date: selectedDate, slotId: selectedSlot, topic, duration });
    onClose();
  };

  const totalCost = (mentor.hourlyRate * duration) / 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto py-8">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-deep-space p-6 animate-scale-in mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Book Office Hours</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Mentor preview */}
        <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4 mb-6">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-white/10">
            {mentor.avatarUrl ? (
              <Image src={mentor.avatarUrl} alt={mentor.name} width={48} height={48} />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                {mentor.name[0]}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-white">{mentor.name}</p>
            <p className="text-sm text-gray-400">{mentor.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date picker */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-neon-cyan/50 focus:outline-none"
              required
            />
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Time</label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => slot.isAvailable && setSelectedSlot(slot.id)}
                    disabled={!slot.isAvailable}
                    className={`rounded-lg py-2 text-sm transition-colors ${
                      selectedSlot === slot.id
                        ? 'bg-neon-cyan text-black font-semibold'
                        : slot.isAvailable
                        ? 'bg-white/5 text-white hover:bg-white/10'
                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Duration</label>
            <div className="flex gap-2">
              {[30, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`flex-1 rounded-lg py-2 text-sm transition-colors ${
                    duration === mins
                      ? 'bg-neon-cyan text-black font-semibold'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">What would you like to discuss?</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., I need help with my wildlife portfolio..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none resize-none"
              required
            />
          </div>

          {/* Cost summary */}
          <div className="rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Session Cost</span>
              <span className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!selectedDate || !selectedSlot}
            className="w-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}

// Upcoming bookings
export function UpcomingBookings({ bookings }: { bookings: Booking[] }) {
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');

  if (upcomingBookings.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Upcoming Sessions</h3>
      <div className="space-y-3">
        {upcomingBookings.map((booking) => (
          <div 
            key={booking.id}
            className="flex items-center justify-between rounded-xl bg-white/5 p-4"
          >
            <div>
              <p className="font-medium text-white">{booking.mentorName}</p>
              <p className="text-sm text-gray-400">
                {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
              </p>
              <p className="text-xs text-gray-500 mt-1">{booking.topic}</p>
            </div>
            {booking.meetingUrl && (
              <a
                href={booking.meetingUrl}
                className="rounded-full bg-neon-cyan px-4 py-2 text-sm font-semibold text-black"
              >
                Join
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Office hours page
export function OfficeHoursPage({ mentors }: { mentors: Mentor[] }) {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const allSpecialties = [...new Set(mentors.flatMap(m => m.specialty))];
  const filteredMentors = filter === 'all' 
    ? mentors 
    : mentors.filter(m => m.specialty.includes(filter));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple">
            <span className="text-3xl">🎓</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Mentor Office Hours</h2>
            <p className="text-gray-400">Book 1-on-1 video calls with photography pros</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          All Mentors
        </button>
        {allSpecialties.map((spec) => (
          <button
            key={spec}
            onClick={() => setFilter(spec)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === spec ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Mentors grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors.map((mentor) => (
          <MentorCard 
            key={mentor.id} 
            mentor={mentor} 
            onBook={() => setSelectedMentor(mentor)}
          />
        ))}
      </div>

      {/* Booking modal */}
      {selectedMentor && (
        <BookingModal
          mentor={selectedMentor}
          isOpen={!!selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onBook={(data) => console.log('Booking:', data)}
        />
      )}
    </div>
  );
}
