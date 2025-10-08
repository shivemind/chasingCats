import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

    const variants: Record<typeof variant, string> = {
      primary: 'bg-brand text-white shadow-card hover:bg-brand-dark',
      secondary: 'bg-night text-[#F5F1E3] hover:bg-brand-dark',
      ghost: 'bg-transparent text-night hover:bg-night/5'
    } as const;

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], fullWidth && 'w-full', className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
