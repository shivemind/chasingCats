export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      {/* Only appears after 300ms delay - fast loads won't see it */}
      <div className="opacity-0 animate-fade-in-delayed">
        <div className="flex gap-2">
          <div className="h-2 w-2 rounded-full bg-brand/60 animate-bounce" />
          <div className="h-2 w-2 rounded-full bg-brand/60 animate-bounce [animation-delay:0.1s]" />
          <div className="h-2 w-2 rounded-full bg-brand/60 animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    </div>
  );
}
}
