import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from '@/components/profile/profile-form';

export const metadata = {
  title: 'Edit Profile | Chasing Cats Club'
};

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/profile/edit');
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  });

  return (
    <div className="bg-white">
      <section className="container-section py-24">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-night">Edit your profile</h1>
          <p className="mt-2 text-sm text-night/70">Share your story, favorite cat, and expedition dreams.</p>
          <ProfileForm initialData={profile} />
        </div>
      </section>
    </div>
  );
}
