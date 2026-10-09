import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { VideoScenePlayer } from '../VideoScenePlayer';
import { playPaperTapSound, playShutterSound } from '../../utils/audio';

interface LandingPageProps {
  onEnterPixe: () => void;
  onLoginClick: () => void;
}

const HERO_STAGES = [
  {
    percent: 0,
    label: 'Dark Studio',
    timecode: '00:00:00:00',
    sceneNote: 'Matte black photography desk in soft ambient tungsten light. Heavy paper stock aligned.',
    cameraExif: '35mm Macro · f/2.0 · ISO 400',
    polaroidOffset: -100,
    polaroidTilt: 0,
    polaroidOpac: 0.2,
    handVisible: false,
  },
  {
    percent: 25,
    label: 'Printer Mechanism Warms',
    timecode: '00:00:01:14',
    sceneNote: 'Thermal motor engages with low hum. Dye-diffusion head sweeps across emulsion.',
    cameraExif: '35mm Macro · f/2.0 · ISO 400',
    polaroidOffset: -60,
    polaroidTilt: 0.5,
    polaroidOpac: 0.7,
    handVisible: false,
  },
  {
    percent: 50,
    label: 'Photograph Emerging',
    timecode: '00:00:03:08',
    sceneNote: 'Archival gloss white border glides out. Silver-halide chemical layer begins self-curing.',
    cameraExif: '50mm Prime · f/1.8 · ISO 800',
    polaroidOffset: -15,
    polaroidTilt: -1.2,
    polaroidOpac: 1,
    handVisible: false,
  },
  {
    percent: 75,
    label: 'Hand Takes Photograph',
    timecode: '00:00:04:19',
    sceneNote: 'A real hand carefully grips the bottom border. Tactile paper flexes under gentle lift.',
    cameraExif: '50mm Prime · f/1.8 · ISO 800',
    polaroidOffset: 25,
    polaroidTilt: 3.2,
    polaroidOpac: 1,
    handVisible: true,
  },
  {
    percent: 100,
    label: 'Placed on Dark Table',
    timecode: '00:00:06:02',
    sceneNote: 'Photograph laid on dark oak table alongside vintage 35mm rangefinder and tape strip.',
    cameraExif: '85mm Portrait · f/2.4 · ISO 640',
    polaroidOffset: 0,
    polaroidTilt: -2.0,
    polaroidOpac: 1,
    handVisible: false,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPixe, onLoginClick }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlayingHero, setIsPlayingHero] = useState(false);
  const [manualScrub, setManualScrub] = useState<number | null>(null);

  // Scroll tracker for hero
  useEffect(() => {
    const handleScroll = () => {
      if (manualScrub !== null) return;
      const heroEl = document.getElementById('landing-hero');
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      const totalDist = window.innerHeight * 0.8;
      const scrolled = -rect.top;
      const prog = Math.min(100, Math.max(0, (scrolled / totalDist) * 100));
      setScrollProgress(Math.round(prog));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [manualScrub]);

  // Autoplay hero simulation
  useEffect(() => {
    if (!isPlayingHero) return;
    const interval = setInterval(() => {
      setScrollProgress((prev) => {
        if (prev >= 100) {
          setIsPlayingHero(false);
          playShutterSound();
          return 100;
        }
        return prev + 2;
      });
    }, 70);
    return () => clearInterval(interval);
  }, [isPlayingHero]);

  const activePercent = manualScrub !== null ? manualScrub : scrollProgress;
  const currentStage = HERO_STAGES.reduce((prev, curr) => {
    return Math.abs(curr.percent - activePercent) < Math.abs(prev.percent - activePercent) ? curr : prev;
  });

  const handlePlayHero = () => {
    playShutterSound();
    setManualScrub(null);
    setScrollProgress(0);
    setIsPlayingHero(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0B0A08] text-[#E8DDC8] overflow-x-hidden selection:bg-[#F4B82A] selection:text-[#0B0A08]">
      
      {/* ============================================================ */}
      {/* 01 — HERO SECTION */}
      {/* ============================================================ */}
      <section
        id="landing-hero"
        className="relative min-h-[95vh] lg:min-h-screen pt-28 pb-16 flex flex-col justify-between overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#0B0A08] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(244,184,42,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Brand Hero Typography */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold">
                <span className="w-6 h-[1.5px] bg-[#F4B82A]" />
                <span>ARCHIVAL INSTANT FILM STUDIO</span>
                <span className="text-[#E8DDC8]/40">·</span>
                <span className="text-[#E8DDC8]/60">PHYSICAL PRINTS</span>
              </div>

              <div className="space-y-3">
                <span className="font-['Syne'] text-2xl sm:text-3xl font-bold tracking-tight text-[#E8DDC8]/80 block">
                  PIXÉ<span className="text-[#F4B82A]">.</span>CO
                </span>
                <h1 className="font-['Syne'] text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#E8DDC8] leading-[1.05] text-balance">
                  POLAROIDS. <br />
                  <span className="text-white/95">MEMORIES.</span> <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4B82A] via-[#FCE39E] to-[#F4B82A] italic font-['Cormorant_Garamond'] font-normal">
                    Moments.
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-[#E8DDC8]/80 font-light max-w-xl leading-relaxed">
                Turn your favorite moments into something you can actually hold.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    playShutterSound();
                    onEnterPixe();
                  }}
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs tracking-wider uppercase rounded-lg shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(244,184,42,0.4)] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <span>ENTER PIXÉ.CO</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPaperTapSound();
                    const el = document.getElementById('about-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-[#14120E] hover:bg-[#1E1B15] text-[#E8DDC8] hover:text-[#F4B82A] font-semibold text-xs tracking-wider uppercase rounded-lg border border-[#27241D] hover:border-[#F4B82A]/40 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-[#F4B82A]" />
                  <span>DISCOVER OUR STORY</span>
                </button>
              </div>

              {/* Quiet Brand Markers */}
              <div className="pt-4 flex items-center gap-6 text-xs text-[#E8DDC8]/60 font-mono">
                <div>
                  <span className="text-[#F4B82A] font-bold text-sm tabular-nums">310 GSM</span> Paper
                </div>
                <span className="text-[#27241D]">/</span>
                <div>
                  <span className="text-[#F4B82A] font-bold text-sm tabular-nums">100%</span> Physical
                </div>
                <span className="text-[#27241D]">/</span>
                <div>
                  <span className="text-[#F4B82A] font-bold text-sm tabular-nums">80+</span> Years Archival
                </div>
              </div>
            </div>

            {/* Right Column: Physical Polaroid Commercial Emergence Footage */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
              <div className="relative w-full max-w-lg aspect-[4/5] sm:aspect-square rounded-2xl bg-gradient-to-b from-[#14120E] via-[#0E0D0B] to-[#080706] p-6 sm:p-8 border border-[#27241D] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between select-none">
                
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#F4B82A]/10 rounded-full blur-3xl pointer-events-none" />

                {/* Printer Top Slot */}
                <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="w-full flex items-center justify-between text-[10px] font-mono tracking-widest text-[#E8DDC8]/50 uppercase mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>PIXÉ THERMAL EJECTOR 01</span>
                    </span>
                    <span className="text-[#F4B82A]">{currentStage.timecode}</span>
                  </div>
                  <div className="w-full h-4 bg-gradient-to-b from-[#0A0908] to-[#1C1A16] rounded-t-lg border-t border-x border-[#27241D] shadow-inner relative flex items-center justify-center">
                    <div className="w-3/4 h-1 bg-[#050505] rounded-full border border-black/80" />
                  </div>
                </div>

                {/* Physical Polaroid Object Emerging */}
                <div className="relative z-20 flex-1 flex items-center justify-center py-4">
                  <div
                    style={{
                      transform: `translateY(${currentStage.polaroidOffset}px) rotate(${currentStage.polaroidTilt}deg)`,
                      opacity: currentStage.polaroidOpac,
                      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
                    }}
                    className="relative w-64 sm:w-72 bg-[#F6F3EB] rounded-[3px] p-3 pb-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9),0_4px_10px_rgba(0,0,0,0.3)] transition-all cursor-pointer group"
                    onClick={() => playPaperTapSound()}
                  >
                    <div className="absolute inset-0 polaroid-sheen pointer-events-none rounded-[3px]" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape -rotate-2 z-30" />

                    <div className="relative aspect-square w-full bg-[#12110E] overflow-hidden rounded-[1px] shadow-inner">
                      <img
                        src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80"
                        alt="Polaroid emergence frame"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    <div className="pt-3 px-1 flex items-baseline justify-between">
                      <span className="font-['Caveat'] text-lg sm:text-xl text-[#1E1B15] tracking-tight font-medium">
                        tokyo rain · midnight drift
                      </span>
                      <span className="font-mono text-[10px] text-[#6B6559] tabular-nums">
                        10.04.26
                      </span>
                    </div>

                    {currentStage.handVisible && (
                      <div className="absolute -bottom-4 right-6 bg-black/80 backdrop-blur-md border border-[#F4B82A]/40 text-[#F4B82A] text-[10px] font-mono px-2 py-1 rounded shadow-lg animate-bounce">
                        ✋ Hand Lifted From Desk
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Scrubber */}
                <div className="relative z-10 pt-3 border-t border-[#27241D]/70 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#E8DDC8]/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#F4B82A]" />
                      <span className="font-semibold text-[#F4B82A] uppercase tracking-wide text-[11px]">
                        {currentStage.label}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#E8DDC8]/50">
                      {currentStage.cameraExif}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#E8DDC8]/70 leading-relaxed font-light line-clamp-1">
                    {currentStage.sceneNote}
                  </p>

                  <div className="pt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePlayHero}
                      aria-label="Play print commercial reel"
                      className="p-1.5 rounded bg-[#1C1A15] hover:bg-[#F4B82A] text-[#E8DDC8] hover:text-[#0B0A08] transition-colors cursor-pointer border border-[#27241D]"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPlayingHero ? 'animate-spin' : ''}`} />
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activePercent}
                      onChange={(e) => {
                        setIsPlayingHero(false);
                        setManualScrub(Number(e.target.value));
                      }}
                      className="w-full h-1.5 bg-[#27241D] rounded-lg appearance-none cursor-pointer accent-[#F4B82A]"
                    />
                    <span className="text-[10px] font-mono text-[#F4B82A] w-9 text-right tabular-nums">
                      {activePercent}%
                    </span>
                  </div>
                </div>

              </div>

              <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-[#E8DDC8]/40">
                <Layers className="w-3 h-3 text-[#F4B82A]" />
                <span>Scroll or scrub slider to observe physical print emergence</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 02 — ABOUT PIXÉ.CO */}
      {/* ============================================================ */}
      <section id="about-section" className="relative py-28 bg-[#0E0D0B] border-t border-[#1C1A15]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold">
            <span className="w-6 h-[1px] bg-[#F4B82A]" />
            <span>01. The Studio Purpose</span>
            <span className="w-6 h-[1px] bg-[#F4B82A]" />
          </div>

          <h2 className="font-['Syne'] text-3xl sm:text-5xl font-bold tracking-tight text-[#E8DDC8] text-balance">
            "Some memories deserve more than a screen."
          </h2>

          <p className="text-base sm:text-lg text-[#E8DDC8]/70 font-light max-w-2xl mx-auto leading-relaxed">
            PIXÉ.CO transforms your favorite moments, iconic characters, cinema stills, and artwork into physical, heavyweight Polaroid-style prints. We bring tangible permanence back to photography.
          </p>

          <p className="font-['Caveat'] text-2xl text-[#F4B82A] pt-2">
            Archival 310gsm paper stock · Chemical gloss coating · Made to be held.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 03 — REAL WORLD VISUAL STORY */}
      {/* ============================================================ */}
      <section id="story-visuals-section" className="relative py-28 bg-[#0B0A08] border-t border-[#1C1A15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold">
              <span className="w-6 h-[1px] bg-[#F4B82A]" />
              <span>02. Real Videography & Darkroom Craft</span>
              <span className="w-6 h-[1px] bg-[#F4B82A]" />
            </div>
            <h2 className="font-['Syne'] text-3xl sm:text-4xl font-bold text-[#E8DDC8]">
              REAL WORLD VISUAL STORY
            </h2>
            <p className="font-['Cormorant_Garamond'] italic text-xl text-[#E8DDC8]/70">
              Not digital abstractions. Physical artifacts made with precision.
            </p>
          </div>

          {/* Documentary Photo & Video Grid (6 Real Story Beats) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Visual 1: Polaroid on desk */}
            <div className="bg-[#12100E] border border-[#27241D] rounded-xl p-4 space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black">
                <img
                  src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80"
                  alt="Polaroid on dark desk"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute -top-2 left-8 w-20 h-5 washi-tape rotate-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#F4B82A]">
                  <span>SHOT 01</span>
                  <span>35MM MACRO</span>
                </div>
                <h3 className="font-['Syne'] text-base font-bold text-[#E8DDC8]">Polaroid on Dark Desk</h3>
                <p className="text-xs text-[#E8DDC8]/60 font-light leading-relaxed">
                  Physical Polaroid resting beside vintage 35mm rangefinder lens under warm 3200K tungsten studio lighting.
                </p>
              </div>
            </div>

            {/* Visual 2: Professional Camera Gear */}
            <div className="bg-[#12100E] border border-[#27241D] rounded-xl p-4 space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black">
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
                  alt="Camera equipment"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute -top-2 right-8 w-20 h-5 washi-tape -rotate-1" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#F4B82A]">
                  <span>SHOT 02</span>
                  <span>OPTICS & FOCUS</span>
                </div>
                <h3 className="font-['Syne'] text-base font-bold text-[#E8DDC8]">Camera Equipment</h3>
                <p className="text-xs text-[#E8DDC8]/60 font-light leading-relaxed">
                  High-precision manual cinema lenses used to capture optical texture and natural depth of field.
                </p>
              </div>
            </div>

            {/* Visual 3: Real Instant Printer */}
            <div className="bg-[#12100E] border border-[#27241D] rounded-xl p-4 space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black">
                <img
                  src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80"
                  alt="Printer Mechanism"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute -top-2 left-12 w-20 h-5 washi-tape rotate-1" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#F4B82A]">
                  <span>SHOT 03</span>
                  <span>THERMAL EJECTOR</span>
                </div>
                <h3 className="font-['Syne'] text-base font-bold text-[#E8DDC8]">Printer Mechanism</h3>
                <p className="text-xs text-[#E8DDC8]/60 font-light leading-relaxed">
                  Precision dye-diffusion thermal heads applying micro-layers of pigment directly into emulsion.
                </p>
              </div>
            </div>

            {/* Visual 4: Finished Photographs */}
            <div className="bg-[#12100E] border border-[#27241D] rounded-xl p-4 space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
                  alt="Finished photographs"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute -top-2 right-6 w-20 h-5 washi-tape -rotate-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#F4B82A]">
                  <span>SHOT 04</span>
                  <span>ARCHIVAL FINISH</span>
                </div>
                <h3 className="font-['Syne'] text-base font-bold text-[#E8DDC8]">Finished Photographs</h3>
                <p className="text-xs text-[#E8DDC8]/60 font-light leading-relaxed">
                  Emulsion cured with UV barrier, producing rich analog tonal contrast and true deep blacks.
                </p>
              </div>
            </div>

            {/* Visual 5: Kraft Packaging */}
            <div className="bg-[#12100E] border border-[#27241D] rounded-xl p-4 space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black">
                <img
                  src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80"
                  alt="Packaging"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute -top-2 left-6 w-20 h-5 washi-tape rotate-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#F4B82A]">
                  <span>SHOT 05</span>
                  <span>STAY-FLAT ENVELOPE</span>
                </div>
                <h3 className="font-['Syne'] text-base font-bold text-[#E8DDC8]">Archival Packaging</h3>
                <p className="text-xs text-[#E8DDC8]/60 font-light leading-relaxed">
                  Packed between rigid board in hand-stamped kraft envelopes with washi tape and wax seal.
                </p>
              </div>
            </div>

            {/* Visual 6: Someone Holding a Photograph */}
            <div className="bg-[#12100E] border border-[#27241D] rounded-xl p-4 space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black">
                <img
                  src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80"
                  alt="Holding photograph"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute -top-2 right-10 w-20 h-5 washi-tape -rotate-1" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#F4B82A]">
                  <span>SHOT 06</span>
                  <span>IN HAND</span>
                </div>
                <h3 className="font-['Syne'] text-base font-bold text-[#E8DDC8]">Tangible in Hand</h3>
                <p className="text-xs text-[#E8DDC8]/60 font-light leading-relaxed">
                  Real human hands holding physical memories. Tactile, authentic, and permanent.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 04 — WHY PIXÉ.CO */}
      {/* ============================================================ */}
      <section id="why-section" className="relative py-28 bg-[#0E0D0B] border-t border-[#1C1A15]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold">
              <span className="w-6 h-[1px] bg-[#F4B82A]" />
              <span>03. The Values</span>
              <span className="w-6 h-[1px] bg-[#F4B82A]" />
            </div>
            <h2 className="font-['Syne'] text-3xl sm:text-4xl font-bold text-[#E8DDC8]">
              WHY PIXÉ.CO
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-xl bg-[#14120E] border border-[#27241D] space-y-3">
              <div className="text-xs font-mono text-[#F4B82A] font-bold">01</div>
              <h3 className="font-['Syne'] text-xl font-bold text-[#E8DDC8]">PHYSICAL MEMORIES</h3>
              <p className="text-sm text-[#E8DDC8]/70 font-light leading-relaxed">
                Turn digital moments into something tangible. Give your favorite photos weight and lasting presence.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#14120E] border border-[#27241D] space-y-3">
              <div className="text-xs font-mono text-[#F4B82A] font-bold">02</div>
              <h3 className="font-['Syne'] text-xl font-bold text-[#E8DDC8]">PERSONAL</h3>
              <p className="text-sm text-[#E8DDC8]/70 font-light leading-relaxed">
                Choose something that feels like you. Add custom handwritten inscriptions and analog color toning.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#14120E] border border-[#27241D] space-y-3">
              <div className="text-xs font-mono text-[#F4B82A] font-bold">03</div>
              <h3 className="font-['Syne'] text-xl font-bold text-[#E8DDC8]">CREATIVE</h3>
              <p className="text-sm text-[#E8DDC8]/70 font-light leading-relaxed">
                Make your memories part of your space. Pin them, frame them, or gift them in archival sleeves.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 05 — FINAL CTA */}
      {/* ============================================================ */}
      <section className="relative py-32 bg-[#080706] border-t border-[#1C1A15] overflow-hidden select-none text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(244,184,42,0.1),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 film-grain opacity-30 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 z-10">
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold">
            <span className="w-8 h-[1px] bg-[#F4B82A]" />
            <span>Enter the Darkroom Studio</span>
            <span className="w-8 h-[1px] bg-[#F4B82A]" />
          </div>

          <h2 className="font-['Syne'] text-4xl sm:text-6xl font-extrabold tracking-tight text-[#E8DDC8]">
            READY TO MAKE IT YOURS?
          </h2>

          <p className="font-['Caveat'] text-2xl sm:text-3xl text-[#F4B82A]">
            "Step inside to discover collections, customize prints, and order."
          </p>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                playShutterSound();
                onEnterPixe();
              }}
              className="inline-flex items-center justify-center gap-3 px-9 py-4 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs tracking-wider uppercase rounded-xl shadow-lg hover:shadow-[0_15px_30px_-5px_rgba(244,184,42,0.4)] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <span>ENTER PIXÉ.CO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-8">
            <span className="font-['Syne'] text-2xl font-bold tracking-tight text-[#E8DDC8]/30">
              PIXÉ<span className="text-[#F4B82A]">.</span>CO
            </span>
          </div>
        </div>
      </section>

      {/* Public Landing Footer */}
      <footer className="py-8 bg-[#060504] border-t border-[#1C1A15] text-xs text-[#E8DDC8]/40 font-mono text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} PIXÉ.CO Photographic Studio. Archival instant prints.</div>
          <div className="flex items-center gap-4">
            <button onClick={onLoginClick} className="text-[#E8DDC8]/60 hover:text-[#F4B82A] transition-colors cursor-pointer">
              LOGIN
            </button>
            <span>·</span>
            <span>DOMESTIC & GLOBAL DISPATCH</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
