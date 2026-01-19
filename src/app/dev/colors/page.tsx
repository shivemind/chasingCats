import { notFound } from 'next/navigation';

export default function DevColorsPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <div className="container-section py-16">
      <h1 className="text-2xl font-semibold text-night">Color Utilities Check</h1>
      <p className="mt-2 text-sm text-night/70">
        Verify that Tailwind generates custom utilities like <span className="font-semibold">bg-brand</span>.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="rounded-2xl bg-brand px-6 py-4 text-white shadow-card">bg-brand</div>
        <div className="rounded-2xl bg-brand-dark px-6 py-4 text-white shadow-card">bg-brand-dark</div>
        <div className="rounded-2xl bg-night px-6 py-4 text-[#F5F1E3] shadow-card">bg-night</div>
      </div>
    </div>
  );
}
