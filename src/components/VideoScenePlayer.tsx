import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Video } from 'lucide-react';
import { isSoundEnabled, toggleSound } from '../utils/audio';

interface VideoScenePlayerProps {
  sceneId: string;
  title: string;
  sceneDescription: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16' | '21:9';
  videoSrc?: string;
  posterSrc?: string;
  focalLength?: string;
  cameraModel?: string;
  autoPlay?: boolean;
  className?: string;
  showControls?: boolean;
}

export const VideoScenePlayer: React.FC<VideoScenePlayerProps> = ({
  sceneId,
  title,
  sceneDescription,
  aspectRatio = '16:9',
  videoSrc,
  posterSrc = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80',
  focalLength = '35mm Macro f/1.8',
  cameraModel = 'Sony FX3 · Cine EI 800',
  autoPlay = true,
  className = '',
  showControls = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hasSound, setHasSound] = useState(false);
  const [timecode, setTimecode] = useState('00:01:24:08');
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Live timecode counter simulation
  useEffect(() => {
    let frame = 12;
    let sec = 4;
    const interval = setInterval(() => {
      frame += 1;
      if (frame >= 24) {
        frame = 0;
        sec += 1;
      }
      const formatted = `00:00:${sec.toString().padStart(2, '0')}:${frame.toString().padStart(2, '0')}`;
      setTimecode(formatted);
    }, 41.6); // 24fps
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !hasSound;
    setHasSound(nextState);
    toggleSound(nextState);
    if (videoRef.current) {
      videoRef.current.muted = !nextState;
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  const aspectClasses = {
    '16:9': 'aspect-[16/9]',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
    '21:9': 'aspect-[21/9]',
  }[aspectRatio];

  return (
    <div
      className={`relative w-full ${aspectClasses} rounded-xl overflow-hidden bg-[#0A0908] border border-[#27241D] group select-none shadow-2xl ${className}`}
    >
      {/* Real Video Element if src provided, otherwise high-definition cinematography simulation */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay={autoPlay}
          loop
          muted={!hasSound}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="relative w-full h-full overflow-hidden">
          {!imageError ? (
            <img
              src={posterSrc}
              alt={title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover scale-105 transition-transform duration-[12000ms] ease-out group-hover:scale-110 filter brightness-90 contrast-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1A1814] via-[#12110E] to-[#0A0908] flex items-center justify-center">
              <Video className="w-12 h-12 text-[#F4B82A]/30" />
            </div>
          )}

          {/* Film Grain & Studio Ambient Lighting Vignette */}
          <div className="absolute inset-0 film-grain pointer-events-none opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-transparent to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#0B0A08]/20 to-[#0B0A08]/70 pointer-events-none" />
        </div>
      )}

      {/* Camera Viewfinder HUD Overlay */}
      <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between pointer-events-none">
        {/* Top Viewfinder Bar */}
        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[#E8DDC8]/80">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-[#F4B82A]/20">
              <span className={`w-2 h-2 rounded-full bg-red-500 ${isPlaying ? 'animate-pulse' : 'opacity-40'}`} />
              <span className="font-bold text-red-400">REC</span>
              <span className="text-[#E8DDC8]/60 ml-1">4K UHD</span>
            </span>
            <span className="hidden sm:inline-block bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/5 text-[#E8DDC8]/70">
              {sceneId}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 font-bold text-[#F4B82A]">
              {timecode}
            </span>
            <span className="hidden md:inline-block bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/5 text-[#E8DDC8]/60">
              24.00 FPS
            </span>
          </div>
        </div>

        {/* Center Grid Reticle / Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25 group-hover:opacity-40 transition-opacity">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#E8DDC8">
            <line x1="20" y1="5" x2="20" y2="15" strokeWidth="1" />
            <line x1="20" y1="25" x2="20" y2="35" strokeWidth="1" />
            <line x1="5" y1="20" x2="15" y2="20" strokeWidth="1" />
            <line x1="25" y1="20" x2="35" y2="20" strokeWidth="1" />
            <circle cx="20" cy="20" r="4" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Bottom Viewfinder Bar & Shot Specs */}
        <div className="flex items-end justify-between">
          <div className="max-w-[70%] space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#F4B82A] tracking-wide uppercase">
              <span>{title}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#E8DDC8] font-sans font-light leading-snug drop-shadow-md">
              {sceneDescription}
            </p>
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#E8DDC8]/60 pt-0.5">
              <span>{focalLength}</span>
              <span>·</span>
              <span>{cameraModel}</span>
              <span>·</span>
              <span className="text-[#F4B82A]/90">Real Studio Footage Slot</span>
            </div>
          </div>

          {/* Interactive Controls (Clickable) */}
          {showControls && (
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSound}
                aria-label={hasSound ? 'Mute audio' : 'Unmute audio'}
                className="w-9 h-9 rounded-full bg-black/70 hover:bg-[#F4B82A] text-[#E8DDC8] hover:text-[#0B0A08] transition-colors border border-white/10 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {hasSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleTogglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="w-9 h-9 rounded-full bg-black/70 hover:bg-[#F4B82A] text-[#E8DDC8] hover:text-[#0B0A08] transition-colors border border-white/10 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
