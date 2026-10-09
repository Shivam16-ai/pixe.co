import React, { useState } from 'react';
import { VideoScenePlayer } from './VideoScenePlayer';
import { playPaperTapSound, playShutterSound } from '../utils/audio';
import { Film, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

interface ProcessStep {
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  sceneId: string;
  focalLength: string;
  cameraRig: string;
  posterUrl: string;
  sceneAction: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Photo Curated & Cropped',
    shortDesc: 'Digital frame selected and aligned to 1:1 square ratio.',
    fullDesc: 'We ingest your uncompressed image file, verifying high dynamic range, shadow tones, and proper square crop margins for the classic 3.5×4.2 inch Polaroid border.',
    sceneId: 'STEP 01 · INGEST',
    focalLength: '35mm Cine Prime f/2.0',
    cameraRig: 'ARRI Alexa Mini LF · Monitor View',
    posterUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
    sceneAction: 'Photographer sitting at dark calibration workstation selecting and adjusting tonal contrast curve on 4K reference monitor.',
  },
  {
    number: '02',
    title: 'Color & Emulsion Calibration',
    shortDesc: 'RGB gamut mapped to analog dye chemistry.',
    fullDesc: 'Digital pixels are calibrated using proprietary look-up tables (LUTs) to simulate vintage silver halide film response, avoiding harsh digital clumping.',
    sceneId: 'STEP 02 · GRADE',
    focalLength: '50mm Macro f/2.8',
    cameraRig: 'Sony FX3 · 3200K Tungsten Studio Light',
    posterUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80',
    sceneAction: 'Colorist adjusting density slider. Studio reference swatch sheet resting on matte dark wood surface.',
  },
  {
    number: '03',
    title: 'Thermal Dye Sublimation',
    shortDesc: 'Heat-activated dyes infused directly into 310gsm paper.',
    fullDesc: 'Our studio printers don’t spray ink drops. Instead, precision thermal heads sublimate yellow, magenta, cyan, and protective clear coats directly into the polyester emulsion layer.',
    sceneId: 'STEP 03 · THERMAL MOTOR',
    focalLength: '85mm Macro f/1.8',
    cameraRig: 'RED V-Raptor · 120fps Slow Motion',
    posterUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80',
    sceneAction: 'Extreme macro shot of mechanical drive gears silently turning inside matte black instant thermal housing.',
  },
  {
    number: '04',
    title: 'Photograph Slowly Comes Out',
    shortDesc: 'Physical print glides smoothly into the studio tray.',
    fullDesc: 'The fresh Polaroid emerges with its signature white bottom border. The chemical layer self-levels under studio humidity, locking in permanent deep blacks.',
    sceneId: 'STEP 04 · EJECTION',
    focalLength: '35mm Macro f/1.4',
    cameraRig: 'Sony FX6 · Steadicam Close-up',
    posterUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    sceneAction: 'A physical Polaroid emerging from the printer slot. A real hand enters frame and takes the print gently by its white edges.',
  },
  {
    number: '05',
    title: 'Quality Check & Glassine Sleeve',
    shortDesc: 'Inspected under high-CRI 98+ studio lighting.',
    fullDesc: 'Every print is personally inspected under 5600K balanced daylight lamps for dust, scratches, and color uniformity before being slipped into an acid-free glassine envelope.',
    sceneId: 'STEP 05 · QC INSPECTION',
    focalLength: '50mm Prime f/1.8',
    cameraRig: 'Blackmagic Pocket 6K · Handheld',
    posterUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80',
    sceneAction: 'Studio printer wearing cotton inspection gloves holding the print to the light, then placing it inside a translucent glassine sleeve.',
  },
  {
    number: '06',
    title: 'Wax-Sealed Kraft Packaging',
    shortDesc: 'Rigid stay-flat mailer with real washi tape.',
    fullDesc: 'Your Polaroids are packed between rigid cardboard boards, sealed in recycled heavy brown kraft envelopes with custom PIXÉ wax stamp and washi tape strips.',
    sceneId: 'STEP 06 · ARCHIVAL PACK',
    focalLength: '35mm f/2.0',
    cameraRig: 'Sony A7S III · Top-Down Overhead',
    posterUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1000&q=80',
    sceneAction: 'Overhead flatlay shot of hands sealing kraft paper envelope with wax stamp and placing custom handwritten thank you card.',
  },
];

export const ProcessSection: React.FC = () => {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const activeStep = PROCESS_STEPS[activeStepIdx];

  const handleSelectStep = (idx: number) => {
    playPaperTapSound();
    setActiveStepIdx(idx);
  };

  return (
    <section id="process-section" className="relative py-28 bg-[#0B0A08] border-t border-[#1C1A15]">
      {/* Studio Atmosphere Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(244,184,42,0.04),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold">
            <span className="w-6 h-[1px] bg-[#F4B82A]" />
            <span>05. Real Life Videography Story</span>
            <span className="w-6 h-[1px] bg-[#F4B82A]" />
          </div>
          <h2 className="font-['Syne'] text-3xl sm:text-5xl font-bold tracking-tight text-[#E8DDC8] leading-tight">
            FROM SCREEN TO SOMETHING <br />
            <span className="text-[#F4B82A] italic font-['Cormorant_Garamond'] font-normal">
              You Can Hold.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#E8DDC8]/70 font-light max-w-xl mx-auto">
            Documented through authentic documentary videography. Observe how digital light becomes a physical, chemical Polaroid artifact.
          </p>
        </div>

        {/* Step Navigation Bar (Horizontal on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-10">
          {PROCESS_STEPS.map((step, idx) => {
            const isActive = idx === activeStepIdx;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#1C1914] border-[#F4B82A] shadow-md'
                    : 'bg-[#12100E] border-[#27241D] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className={isActive ? 'text-[#F4B82A] font-bold' : 'text-[#E8DDC8]/50'}>
                    STEP {step.number}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#F4B82A] animate-pulse" />}
                </div>
                <div
                  className={`text-xs font-semibold tracking-tight line-clamp-1 ${
                    isActive ? 'text-[#E8DDC8]' : 'text-[#E8DDC8]/70'
                  }`}
                >
                  {step.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Stage: Left Large Video Scene, Right Editorial Craft Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#12100E] border border-[#27241D] rounded-2xl p-6 sm:p-10 shadow-2xl">
          
          {/* Left Column: Real-life Video Scene Component */}
          <div className="lg:col-span-7 relative">
            {/* Top Washi Tape pinned to video player */}
            <div className="absolute -top-3.5 left-10 w-28 h-6 washi-tape -rotate-2 z-20" />
            
            <VideoScenePlayer
              key={activeStep.sceneId}
              sceneId={activeStep.sceneId}
              title={activeStep.title}
              sceneDescription={activeStep.sceneAction}
              posterSrc={activeStep.posterUrl}
              focalLength={activeStep.focalLength}
              cameraModel={activeStep.cameraRig}
              aspectRatio="16:9"
            />
          </div>

          {/* Right Column: Step Breakdown & Studio Craft Details */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#F4B82A] uppercase tracking-wider mb-1">
                <span>STAGE {activeStep.number} OF 06</span>
                <span>·</span>
                <span>PHYSICAL WORKFLOW</span>
              </div>
              <h3 className="font-['Syne'] text-2xl sm:text-3xl font-bold text-[#E8DDC8]">
                {activeStep.title}
              </h3>
              <p className="font-['Caveat'] text-2xl text-[#F4B82A] mt-1">
                "{activeStep.shortDesc}"
              </p>
            </div>

            <p className="text-sm text-[#E8DDC8]/80 leading-relaxed font-light">
              {activeStep.fullDesc}
            </p>

            {/* Studio Technical Specifications */}
            <div className="p-4 rounded-xl bg-[#0E0D0B] border border-[#27241D] space-y-2.5 text-xs text-[#E8DDC8]/70 font-mono">
              <div className="flex justify-between">
                <span className="text-[#E8DDC8]/40">FOOTAGE RATIO:</span>
                <span className="text-[#E8DDC8]">16:9 Native UHD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E8DDC8]/40">CRAFT MATERIAL:</span>
                <span className="text-[#E8DDC8]">310gsm Archival Rag</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E8DDC8]/40">COLOR STABILITY:</span>
                <span className="text-[#F4B82A]">80+ Years Fade Proof</span>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={activeStepIdx === 0}
                onClick={() => handleSelectStep(Math.max(0, activeStepIdx - 1))}
                className="px-4 py-2 rounded-lg bg-[#1A1813] hover:bg-[#25221B] text-[#E8DDC8] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-wider border border-[#27241D] transition-colors cursor-pointer"
              >
                ← Previous Step
              </button>

              <button
                type="button"
                disabled={activeStepIdx === PROCESS_STEPS.length - 1}
                onClick={() => handleSelectStep(Math.min(PROCESS_STEPS.length - 1, activeStepIdx + 1))}
                className="px-4 py-2 rounded-lg bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
