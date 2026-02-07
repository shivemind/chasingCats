import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EventForm } from '@/components/admin/event-form';

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Edit Event</h1>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <EventForm event={event} />
      </div>
    </div>
  );
}
