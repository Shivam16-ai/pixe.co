import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Sliders, RefreshCw, Layers } from 'lucide-react';
import { playShutterSound, playPaperTapSound } from '../utils/audio';

interface HeroProps {
  onShopClick: () => void;
  onCreateCustomClick: () => void;
}

interface StoryStage {
  percent: number;
  label: string;
  timecode: string;
  sceneNote: string;
  cameraExif: string;
  polaroidOffset: number; // in pixels or percentage for emerging effect
  polaroidTilt: number;
  polaroidOpac: number;
  handVisible: boolean;
  lightingTemp: string;
  bgAtmosphere: string;
}

const STORY_STAGES: StoryStage[] = [
  {
    percent: 0,
    label: 'Dark Studio',
    timecode: '00:00:00:00',
    sceneNote: 'Matte black photography desk in soft ambient gloom. Heavy 310gsm paper stock aligned.',
    cameraExif: '35mm Macro · f/2.0 · ISO 400',
    polaroidOffset: -120, // inside slot
    polaroidTilt: 0,
    polaroidOpac: 0.1,
    handVisible: false,
    lightingTemp: '2800K Tungsten',
    bgAtmosphere: 'from-[#0B0A08] to-[#12100D]'
  },
  {
    percent: 20,
    label: 'Printer Mechanism Warms',
    timecode: '00:00:01:14',
    sceneNote: 'Thermal motor engages with low hum. Dye-diffusion printhead sweeps across emulsion.',
    cameraExif: '35mm Macro · f/2.0 · ISO 400',
    polaroidOffset: -70,
    polaroidTilt: 0.5,
    polaroidOpac: 0.7,
    handVisible: false,
    lightingTemp: '3000K Warm Key',
    bgAtmosphere: 'from-[#12110E] to-[#16140F]'
  },
  {
    percent: 45,
    label: 'Emulsion Ejecting',
    timecode: '00:00:03:08',
    sceneNote: 'Archival gloss white border glides out. Silver-halide chemical layer begins self-curing.',
    cameraExif: '50mm Prime · f/1.8 · ISO 800',
    polaroidOffset: -20,
    polaroidTilt: -1.2,
    polaroidOpac: 1,
    handVisible: false,
    lightingTemp: '3200K Studio Tungsten',
    bgAtmosphere: 'from-[#14120E] to-[#1A1813]'
  },
  {
    percent: 65,
    label: 'Hand Takes Print',
    timecode: '00:00:04:19',
    sceneNote: 'A real hand carefully grips the dry bottom border. Tactile paper flexes under gentle lift.',
    cameraExif: '50mm Prime · f/1.8 · ISO 800',
    polaroidOffset: 15,
    polaroidTilt: 3.5,
    polaroidOpac: 1,
    handVisible: true,
    lightingTemp: '3400K Warm Rim',
    bgAtmosphere: 'from-[#16130F] to-[#1C1914]'
  },
  {
    percent: 85,
    label: 'Placed on Desk',
    timecode: '00:00:06:02',
    sceneNote: 'Print laid gently on dark oak table alongside vintage 35mm rangefinder and tape strip.',
    cameraExif: '85mm Portrait · f/2.4 · ISO 640',
    polaroidOffset: 45,
    polaroidTilt: -3.8,
    polaroidOpac: 1,
    handVisible: false,
    lightingTemp: '3200K Diffused Desk Lamp',
    bgAtmosphere: 'from-[#14120E] to-[#161410]'
  },
  {
    percent: 100,
    label: 'Tangible PIXÉ Artifact',
    timecode: '00:00:07:23',
    sceneNote: 'Final rich contrast achieved. Ready to hold, pin, or gift. A physical memory forever.',
    cameraExif: '35mm · f/2.8 · ISO 320',
    polaroidOffset: 0,
    polaroidTilt: -1.5,
    polaroidOpac: 1,
    handVisible: false,
    lightingTemp: 'Golden Hour Accent',
    bgAtmosphere: 'from-[#0B0A08] to-[#14120E]'
  }
];

export const Hero: React.FC<HeroProps> = ({ onShopClick, onCreateCustomClick }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const [manualScrub, setManualScrub] = useState<number | null>(null);

  // Sync scroll progress from window or manual scrubber
  useEffect(() => {
    const handleScroll = () => {
      if (manualScrub !== null) return;
      const heroEl = document.getElementById('hero-stage');
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

  // Story autoplay
  useEffect(() => {
    if (!isPlayingStory) return;
    const interval = setInterval(() => {
      setScrollProgress((prev) => {
        if (prev >= 100) {
          setIsPlayingStory(false);
          playShutterSound();
          return 100;
        }
        return prev + 2;
      });
    }, 70);
    return () => clearInterval(interval);
  }, [isPlayingStory]);

  const activePercent = manualScrub !== null ? manualScrub : scrollProgress;

  // Find nearest stage
  const currentStage = STORY_STAGES.reduce((prev, curr) => {
    return Math.abs(curr.percent - activePercent) < Math.abs(prev.percent - activePercent) ? curr : prev;
  });

  const handlePlayStory = () => {
    playShutterSound();
    setManualScrub(null);
    setScrollProgress(0);
    setIsPlayingStory(true);
  };

  return (
    <section id="hero-stage" className="relative min-h-[95vh] lg:min-h-screen pt-28 pb-16 flex flex-col justify-between overflow-hidden">
      {/* Background Studio Surface with Dark Desk Lighting Vignette */}
      <div className="absolute inset-0 bg-[#0B0A08] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(244,184,42,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />

      {/* Main Content Layout Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Brand Editorial Typography & Call to Actions */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
            {/* Quiet 1-line text kicker (NO pill enclosures, strictly unboxed) */}
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold">
              <span className="w-6 h-[1.5px] bg-[#F4B82A]" />
              <span>Archival Instant Film Studio</span>
              <span className="text-[#E8DDC8]/40">·</span>
              <span className="text-[#E8DDC8]/60">Physical Prints</span>
            </div>

            {/* Primary Display Heading */}
            <div className="space-y-2">
              <h1 className="font-['Syne'] text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#E8DDC8] leading-[1.05] text-balance">
                TURN MOMENTS <br />
                <span className="text-white/95">INTO SOMETHING</span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4B82A] via-[#FCE39E] to-[#F4B82A] italic font-['Cormorant_Garamond'] font-normal">
                  You Can Hold.
                </span>
              </h1>
            </div>

            {/* Handwritten Signature Subtitle & Body */}
            <div className="space-y-3 max-w-xl">
              <p className="font-['Caveat'] text-2xl sm:text-3xl text-[#F4B82A] -rotate-1 select-none">
                "Not just pixels on glass. Real photographic paper on your desk."
              </p>
              <p className="text-sm sm:text-base text-[#E8DDC8]/70 leading-relaxed font-light">
                PIXÉ.CO crafts tangible, chemical-grade instant Polaroid prints from your favorite digital frames, anime stills, F1 chicanes, cinema classics, or personal camera rolls.
              </p>
            </div>

            {/* Primary Action Zone */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  playShutterSound();
                  onShopClick();
                }}
                className="group relative inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs tracking-wider uppercase rounded-lg shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(244,184,42,0.4)] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <span>SHOP POLAROIDS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  playPaperTapSound();
                  onCreateCustomClick();
                }}
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#141310] hover:bg-[#1E1B15] text-[#E8DDC8] hover:text-[#F4B82A] font-semibold text-xs tracking-wider uppercase rounded-lg border border-[#27241D] hover:border-[#F4B82A]/40 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-[#F4B82A]" />
                <span>CREATE YOUR POLAROID</span>
              </button>
            </div>

            {/* Quantitative Proof Adjacency (Zero-pill, clean separators) */}
            <div className="pt-4 flex items-center gap-6 text-xs text-[#E8DDC8]/60 font-mono">
              <div>
                <span className="text-[#F4B82A] font-bold text-sm tabular-nums">310 GSM</span> Heavyweight Paper
              </div>
              <span className="text-[#27241D]">/</span>
              <div>
                <span className="text-[#F4B82A] font-bold text-sm tabular-nums">10+</span> Categories
              </div>
              <span className="text-[#27241D]">/</span>
              <div>
                <span className="text-[#F4B82A] font-bold text-sm tabular-nums">₹40</span> Starting Price
              </div>
            </div>
          </div>

          {/* Right Column: Physical Polaroid Printing Stage Simulation & Real Studio Desk */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            
            {/* Dark Photographic Slate Desk Container */}
            <div className="relative w-full max-w-lg aspect-[4/5] sm:aspect-square rounded-2xl bg-gradient-to-b from-[#14120E] via-[#0E0D0B] to-[#080706] p-6 sm:p-8 border border-[#27241D] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between select-none">
              
              {/* Studio Desk Lighting Texture */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#F4B82A]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,184,42,0.06),transparent_60%)] pointer-events-none" />

              {/* Realistic Printer Slot at Top */}
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-[10px] font-mono tracking-widest text-[#E8DDC8]/50 uppercase mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>PIXÉ THERMAL EJECTOR 01</span>
                  </span>
                  <span className="text-[#F4B82A]">{currentStage.timecode}</span>
                </div>
                
                {/* Mechanical Printer Slot Hood */}
                <div className="w-full h-4 bg-gradient-to-b from-[#0A0908] to-[#1C1A16] rounded-t-lg border-t border-x border-[#27241D] shadow-inner relative flex items-center justify-center">
                  <div className="w-3/4 h-1 bg-[#050505] rounded-full border border-black/80" />
                </div>
              </div>

              {/* The Physical Polaroid Moving Through The Scene */}
              <div className="relative z-20 flex-1 flex items-center justify-center py-4">
                
                {/* Emerging Polaroid Card */}
                <div
                  style={{
                    transform: `translateY(${currentStage.polaroidOffset}px) rotate(${currentStage.polaroidTilt}deg)`,
                    opacity: currentStage.polaroidOpac,
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
                  }}
                  className="relative w-64 sm:w-72 bg-[#F6F3EB] rounded-[3px] p-3 pb-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9),0_4px_10px_rgba(0,0,0,0.3)] transition-all cursor-pointer group"
                  onClick={() => playPaperTapSound()}
                >
                  {/* Real Paper Texture & Gloss Sheen */}
                  <div className="absolute inset-0 polaroid-sheen pointer-events-none rounded-[3px]" />
                  
                  {/* Studio Washi Tape on Top Border (Optional realistic detail) */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape -rotate-2 z-30"
                    title="Studio Archival Tape"
                  />

                  {/* Photo Square Container */}
                  <div className="relative aspect-square w-full bg-[#12110E] overflow-hidden rounded-[1px] shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80"
                      alt="Polaroid emergence frame"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Emulsion Developing Gradient simulation */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-transparent via-[#F4B82A]/10 to-transparent pointer-events-none mix-blend-color-dodge transition-opacity"
                      style={{ opacity: activePercent < 50 ? 0.4 : 0 }}
                    />

                    {/* Chemical Curing Badge Overlay for initial scroll states */}
                    {activePercent < 50 && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-mono text-[#F4B82A]">
                        EMULSION CURING
                      </div>
                    )}
                  </div>

                  {/* Bottom Border with Realistic Handwritten Caption */}
                  <div className="pt-3 px-1 flex items-baseline justify-between">
                    <span className="font-['Caveat'] text-lg sm:text-xl text-[#1E1B15] tracking-tight font-medium">
                      tokyo rain · midnight drift
                    </span>
                    <span className="font-mono text-[10px] text-[#6B6559] tabular-nums">
                      10.04.26
                    </span>
                  </div>

                  {/* Realistic Hand Pick Indicator */}
                  {currentStage.handVisible && (
                    <div className="absolute -bottom-4 right-6 bg-black/80 backdrop-blur-md border border-[#F4B82A]/40 text-[#F4B82A] text-[10px] font-mono px-2 py-1 rounded shadow-lg animate-bounce">
                      ✋ Hand Lifted From Desk
                    </div>
                  )}
                </div>

                {/* Background Scattered Polaroids for Studio Depth */}
                <div className="absolute -left-4 bottom-8 w-44 aspect-square bg-[#EAE5D9] rounded-[2px] p-2 pb-5 shadow-2xl -rotate-12 opacity-40 pointer-events-none hidden sm:block">
                  <div className="w-full h-full bg-[#181613] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80"
                      alt="F1 race background polaroid"
                      className="w-full h-full object-cover filter grayscale contrast-125"
                    />
                  </div>
                </div>

                <div className="absolute -right-4 top-12 w-40 aspect-square bg-[#ECE8DC] rounded-[2px] p-2 pb-5 shadow-2xl rotate-12 opacity-35 pointer-events-none hidden sm:block">
                  <div className="w-full h-full bg-[#181613] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80"
                      alt="Vintage car background polaroid"
                      className="w-full h-full object-cover filter sepia brightness-90"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Desk HUD & Real Footage Scrubber */}
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

                {/* Interactive Story Timeline Scrubber */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePlayStory}
                    aria-label="Play print story animation"
                    className="p-1.5 rounded bg-[#1C1A15] hover:bg-[#F4B82A] text-[#E8DDC8] hover:text-[#0B0A08] transition-colors cursor-pointer border border-[#27241D]"
                    title="Play Commercial Reel"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPlayingStory ? 'animate-spin' : ''}`} />
                  </button>

                  <div className="flex-1 flex flex-col gap-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activePercent}
                      onChange={(e) => {
                        setIsPlayingStory(false);
                        setManualScrub(Number(e.target.value));
                      }}
                      className="w-full h-1.5 bg-[#27241D] rounded-lg appearance-none cursor-pointer accent-[#F4B82A]"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-[#F4B82A] w-9 text-right tabular-nums">
                    {activePercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Studio Equipment Note */}
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-[#E8DDC8]/40">
              <Layers className="w-3 h-3 text-[#F4B82A]" />
              <span>Scroll page or scrub slider to observe physical print emergence</span>
            </div>
          </div>

        </div>
      </div>

      {/* Subtle Bottom Scroll Cue */}
      <div className="relative z-10 text-center pt-8">
        <button
          onClick={() => {
            const el = document.getElementById('story-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex flex-col items-center gap-1.5 text-[11px] font-mono text-[#E8DDC8]/50 hover:text-[#F4B82A] transition-colors cursor-pointer uppercase tracking-widest"
        >
          <span>EXPLORE STUDIO CRAFT</span>
          <span className="w-4 h-5 rounded-full border border-[#E8DDC8]/30 flex items-start justify-center p-1">
            <span className="w-1 h-1.5 rounded-full bg-[#F4B82A] animate-pulse" />
          </span>
        </button>
      </div>
    </section>
  );
};
