import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'block w-full rounded-xl border border-night/10 bg-white px-4 py-3 text-sm text-night placeholder:text-night/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';
