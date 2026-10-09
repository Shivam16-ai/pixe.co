import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { VideoScenePlayer } from './VideoScenePlayer';
import { playPaperTapSound } from '../utils/audio';

interface BrandStoryProps {
  onExploreCustom: () => void;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ onExploreCustom }) => {
  return (
    <section id="story-section" className="relative py-28 bg-[#0B0A08] border-t border-[#1C1A15] overflow-hidden">
      {/* Subtle Studio Tungsten Ambient Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#F4B82A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#E8DDC8]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Chapter Kicker */}
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold mb-6">
          <span className="w-8 h-[1px] bg-[#F4B82A]" />
          <span>01. The Studio Philosophy</span>
        </div>

        {/* Large Editorial Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7 space-y-8">
            <h2 className="font-['Syne'] text-3xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-[#E8DDC8] leading-[1.08] text-balance">
              WE DON'T JUST <br />
              <span className="text-[#F4B82A]">PRINT PHOTOS.</span> <br />
              <span className="italic font-['Cormorant_Garamond'] font-normal text-white/90">
                We Turn Them Into Something You Can Hold.
              </span>
            </h2>

            <div className="space-y-4 max-w-xl text-[#E8DDC8]/70 font-light text-base sm:text-lg leading-relaxed">
              <p>
                In a world of infinite cloud storage and disappearing stories, photos have lost their weight. They live trapped behind glowing glass, drowned in algorithmic streams.
              </p>
              <p>
                At <strong className="text-[#E8DDC8] font-semibold">PIXÉ.CO</strong>, we believe every meaningful frame deserves gravity. We use heavy 310gsm micro-porous emulsion paper, true dye-diffusion sublimation, and chemical gloss coatings that resist UV fading for 80+ years.
              </p>
              <p className="font-['Caveat'] text-2xl text-[#F4B82A] pt-2">
                "Place it on your mirror. Tape it to your desk. Keep it in your wallet."
              </p>
            </div>

            {/* Proof Points & Studio Metrics (Zero pills, clean typographic layout) */}
            <div className="pt-6 border-t border-[#27241D] grid grid-cols-3 gap-6 text-left">
              <div>
                <div className="font-['Syne'] text-2xl sm:text-3xl font-bold text-[#E8DDC8] tabular-nums">
                  310<span className="text-[#F4B82A]">gsm</span>
                </div>
                <div className="text-xs text-[#E8DDC8]/50 mt-1 uppercase tracking-wider">
                  Archival Rag Stock
                </div>
              </div>

              <div>
                <div className="font-['Syne'] text-2xl sm:text-3xl font-bold text-[#E8DDC8] tabular-nums">
                  80<span className="text-[#F4B82A]">+</span>
                </div>
                <div className="text-xs text-[#E8DDC8]/50 mt-1 uppercase tracking-wider">
                  Years Fade Resistant
                </div>
              </div>

              <div>
                <div className="font-['Syne'] text-2xl sm:text-3xl font-bold text-[#E8DDC8] tabular-nums">
                  100<span className="text-[#F4B82A]">%</span>
                </div>
                <div className="text-xs text-[#E8DDC8]/50 mt-1 uppercase tracking-wider">
                  Physical Emulsion
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  playPaperTapSound();
                  onExploreCustom();
                }}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4B82A] hover:text-[#E2A618] group cursor-pointer"
              >
                <span>Experience the Custom Printing Studio</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Real-life Commercial Video Footage Component */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative">
              {/* Studio washi tape holding the video frame */}
              <div className="absolute -top-3.5 right-12 w-28 h-6 washi-tape rotate-3 z-20" />
              
              <VideoScenePlayer
                sceneId="COMMERCIAL · SCENE 02"
                title="MACRO EMULSION HANDLING"
                sceneDescription="Slow-motion macro footage of physical Polaroid print being inspected under 3200K tungsten studio rim light. Surface sheen reflects gentle movement."
                posterSrc="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80"
                focalLength="50mm Macro f/1.8"
                cameraModel="Sony FX3 Cinema Rig"
                aspectRatio="4:3"
              />
            </div>

            {/* Video Metadata Caption */}
            <div className="p-4 rounded-lg bg-[#14120E] border border-[#27241D] flex items-center justify-between text-xs text-[#E8DDC8]/60 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F4B82A]" />
                <span>STUDIO B-ROLL FOOTAGE</span>
              </div>
              <span>FILMED AT PIXÉ BANGALORE HQ</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
