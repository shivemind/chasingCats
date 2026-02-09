export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated cat eyes */}
        <div className="flex gap-4">
          <div className="h-6 w-3 rounded-full bg-cat-eye shadow-[0_0_20px_#facc15] animate-pulse" />
          <div className="h-6 w-3 rounded-full bg-cat-eye shadow-[0_0_20px_#facc15] animate-pulse animation-delay-200" />
        </div>
        <p className="text-sm text-night/50 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
