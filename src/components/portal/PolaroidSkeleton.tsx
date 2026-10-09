import React from 'react';

interface PolaroidSkeletonProps {
  count?: number;
}

export const PolaroidSkeleton: React.FC<PolaroidSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 w-full select-none">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="relative bg-[#171511] border border-[#27241D] rounded-[3px] p-3 pb-6 flex flex-col justify-between shadow-[0_10px_25px_-5px_rgba(0,0,0,0.7)] animate-pulse"
        >
          {/* Faux Tape */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#232018] rounded-[1px] rotate-1" />

          {/* Photo Window */}
          <div className="relative aspect-square w-full bg-[#0E0D0A] rounded-[1px] overflow-hidden border border-[#221F18] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#1C1A14]/60 border border-[#2B2720]" />
          </div>

          {/* Bottom Caption Area */}
          <div className="pt-3 px-1 space-y-2">
            <div className="h-3 bg-[#24211A] rounded-[2px] w-3/4" />
            <div className="h-2.5 bg-[#1C1A14] rounded-[2px] w-1/2" />
            <div className="pt-2 flex items-center justify-between border-t border-[#221F18] mt-2">
              <div className="h-3 bg-[#24211A] rounded-[2px] w-12" />
              <div className="h-5 bg-[#2B2720] rounded w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
