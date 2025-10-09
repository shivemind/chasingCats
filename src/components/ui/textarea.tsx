import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'block w-full rounded-xl border border-night/10 bg-white px-4 py-3 text-sm text-night placeholder:text-night/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
