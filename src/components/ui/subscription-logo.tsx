import { useEffect, useState } from 'react';
import { getLogoDataUrl } from '@/lib/logo-storage';
import { cn } from '@/lib/utils';

interface SubscriptionLogoProps {
  logoUrl: string | null | undefined;
  name: string;
  color?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-5 w-5 text-[10px]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function SubscriptionLogo({
  logoUrl,
  name,
  color,
  size = 'md',
  className,
}: SubscriptionLogoProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (logoUrl) {
      setIsLoading(true);
      getLogoDataUrl(logoUrl)
        .then((url) => setDataUrl(url))
        .finally(() => setIsLoading(false));
    } else {
      setDataUrl(null);
    }
  }, [logoUrl]);

  const sizeClass = sizeClasses[size];

  if (isLoading) {
    return (
      <div
        className={cn(
          sizeClass,
          'rounded-full bg-white/10 animate-pulse',
          className
        )}
      />
    );
  }

  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={name}
        className={cn(
          sizeClass,
          'rounded-full object-cover border border-white/20',
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'rounded-full flex items-center justify-center font-bold text-white',
        className
      )}
      style={{ backgroundColor: color || '#8b5cf6' }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
