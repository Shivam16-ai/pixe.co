import React, { useEffect } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

export interface ArchiveImageFallbackProps {
  title: string;
  status?: string;
  imageSrc?: string;
  className?: string;
}

const FALLBACK_IMAGE = '/images/cricket/ms-dhoni.svg';

export const ArchiveImageFallback: React.FC<ArchiveImageFallbackProps> = ({
  title,
  status = 'IMAGE PENDING',
  imageSrc,
  className = '',
}) => {
  useEffect(() => {
    // Development warning log as required by PIXÉ.CO specifications
    if (process.env.NODE_ENV !== 'production' || import.meta.env?.DEV) {
      console.warn(`[MISSING ARCHIVE IMAGE]\n${title}\n${imageSrc || 'No image source defined'}`);
    }
  }, [title, imageSrc]);

  return (
    <div
      role="img"
      aria-label={`${title} — ${status}`}
      className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#181510] to-[#0E0D0A] text-center border border-[#27241D] select-none ${className}`}
    >
      <img
        src={FALLBACK_IMAGE}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover opacity-85"
        onError={(event) => {
          event.currentTarget.src = '/images/football/lionel-messi.svg';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0A08]/30 via-transparent to-[#0B0A08]/80" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
        <div className="w-10 h-10 rounded-full bg-[#1F1C16] border border-[#F4B82A]/40 flex items-center justify-center mb-2 shadow-inner">
          <Camera className="w-5 h-5 text-[#F4B82A]" />
        </div>
        <span className="font-mono text-[9px] font-bold text-[#F4B82A] uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#F4B82A]/10 border border-[#F4B82A]/30 mb-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-[#F4B82A]" />
          {status}
        </span>
        <span className="font-['Syne'] text-[11px] font-bold text-[#E8DDC8] line-clamp-2 uppercase tracking-wide max-w-[90%]">
          {title}
        </span>
        <span className="font-mono text-[8px] text-[#E8DDC8]/40 uppercase tracking-widest mt-1">
          Exact Canon Match Required
        </span>
      </div>
    </div>
  );
};
