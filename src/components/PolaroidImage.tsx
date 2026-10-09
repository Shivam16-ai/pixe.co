import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { ArchiveImageFallback } from './ArchiveImageFallback';

interface PolaroidImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectSquare?: boolean;
}

export const PolaroidImage: React.FC<PolaroidImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectSquare = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isPending = !src || src.toUpperCase().includes('PENDING');

  return (
    <div className={`relative w-full ${aspectSquare ? 'aspect-square' : 'h-full'} bg-[#14120F] overflow-hidden`}>
      {/* Subtle loader shimmer before image renders */}
      {!isLoaded && !hasError && !isPending && (
        <div className="absolute inset-0 bg-[#1A1813] animate-pulse flex items-center justify-center">
          <Camera className="w-6 h-6 text-[#E8DDC8]/20" />
        </div>
      )}

      {!hasError && !isPending ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <ArchiveImageFallback title={alt} imageSrc={src} status="IMAGE PENDING" />
      )}
    </div>
  );
};

