import { EventForm } from '@/components/admin/event-form';

export default async function NewEventPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Create New Event</h1>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <EventForm />
      </div>
    </div>
  );
}
