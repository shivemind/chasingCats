import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { DeleteEventButton } from '@/components/admin/delete-event-button';

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startTime: 'desc' }
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Events</h1>
        <Link
          href="/admin/events/new"
          className="rounded-xl bg-gradient-to-r from-neon-cyan to-brand px-6 py-3 text-sm font-semibold text-night transition hover:shadow-glow"
        >
          + Add Event
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-sm text-white/50">
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Host</th>
              <th className="px-6 py-4 font-medium">Meeting Link</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isPast = new Date(event.startTime) < new Date();
              return (
                <tr key={event.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <span className="font-medium text-white">{event.title}</span>
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {new Date(event.startTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {event.host ?? 'No host'}
                  </td>
                  <td className="px-6 py-4">
                    {event.zoomLink ? (
                      <span className="text-xs text-neon-cyan">Link set</span>
                    ) : (
                      <span className="text-xs text-white/30">No link</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        isPast
                          ? 'bg-white/10 text-white/50'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {isPast ? 'Past' : 'Upcoming'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-neon-cyan transition hover:text-white"
                      >
                        Edit
                      </Link>
                      <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                  No events found. Create your first event!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
