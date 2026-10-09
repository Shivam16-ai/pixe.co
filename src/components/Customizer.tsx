import React, { useState, useRef } from 'react';
import { Upload, Sliders, Type, Palette, RotateCw, ZoomIn, Download, ShoppingBag, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { SAMPLE_CUSTOM_PHOTOS } from '../data/categories';
import { CartItem } from '../types';
import { playPaperTapSound, playShutterSound } from '../utils/audio';

interface CustomizerProps {
  onAddToCart: (item: CartItem) => void;
  onOpenCart: () => void;
}

const FILTERS = [
  { id: 'classic', name: 'Classic Film', css: 'contrast(105%) brightness(98%)' },
  { id: 'noir', name: 'Noir 35mm', css: 'grayscale(100%) contrast(125%) brightness(95%)' },
  { id: 'amber', name: 'Warm Amber', css: 'sepia(35%) contrast(108%) brightness(102%) saturate(115%)' },
  { id: 'grain90s', name: '90s Grain', css: 'contrast(115%) saturate(130%) hue-rotate(-5deg)' },
  { id: 'chrome', name: 'Vivid Chrome', css: 'saturate(145%) contrast(110%) brightness(95%)' },
  { id: 'faded', name: 'Faded Matte', css: 'contrast(90%) brightness(105%) saturate(85%)' },
];

const FRAME_STYLES = [
  { id: 'cream', name: 'Archival Cream', bg: '#F6F3EB', textDefault: '#1F1C16' },
  { id: 'noir', name: 'Noir Matte Black', bg: '#181714', textDefault: '#E8DDC8' },
  { id: 'parchment', name: 'Vintage Parchment', bg: '#EFE5D3', textDefault: '#322B20' },
];

const TAPE_OPTIONS = [
  { id: 'washi', name: 'Clear Washi', class: 'bg-[#E8DDC8]/60 border-x-2 border-dashed border-[#D2C5AD]' },
  { id: 'yellow', name: 'Studio Yellow', class: 'bg-[#F4B82A]/80 border-x-2 border-dashed border-[#F4B82A]' },
  { id: 'kraft', name: 'Japanese Kraft', class: 'bg-[#C2A379]/80 border-x-2 border-dashed border-[#9E7D52]' },
  { id: 'none', name: 'No Tape', class: 'hidden' },
];

export const Customizer: React.FC<CustomizerProps> = ({ onAddToCart, onOpenCart }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'text' | 'filter' | 'adjust'>('image');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(SAMPLE_CUSTOM_PHOTOS[0].url);
  const [caption, setCaption] = useState<string>('moments in the light · 2026');
  const [textColor, setTextColor] = useState<string>('#1F1C16');
  const [fontSize, setFontSize] = useState<number>(20);
  const [includeDate, setIncludeDate] = useState<boolean>(true);
  const [dateText, setDateText] = useState<string>('10.04.26');
  const [activeFilter, setActiveFilter] = useState<string>('classic');
  const [frameStyle, setFrameStyle] = useState<string>('cream');
  const [tapeStyle, setTapeStyle] = useState<string>('washi');
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const polaroidCardRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playPaperTapSound();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    playShutterSound();
    const currentFilterObj = FILTERS.find((f) => f.id === activeFilter);
    const item: CartItem = {
      id: `custom-${Date.now()}`,
      title: 'Custom Archival Polaroid',
      type: 'custom',
      price: 50,
      quantity: 1,
      caption: caption || 'Untitled Frame',
      imageUrl: selectedPhoto,
      filter: currentFilterObj?.name,
      customDetails: {
        filterName: currentFilterObj?.name || 'Classic Film',
        caption: caption,
        textColor: textColor,
        dateStamp: includeDate,
        frameStyle: frameStyle,
      },
    };
    onAddToCart(item);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onOpenCart();
    }, 800);
  };

  const handleDownloadSnapshot = () => {
    playShutterSound();
    // Create an offscreen canvas to render the physical polaroid
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 840;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame background
    const currentFrame = FRAME_STYLES.find((f) => f.id === frameStyle);
    ctx.fillStyle = currentFrame?.bg || '#F6F3EB';
    ctx.fillRect(0, 0, 700, 840);

    // Draw inner photo
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.save();
      // 50px padding left, right, top. Photo size: 600 x 600
      ctx.beginPath();
      ctx.rect(50, 50, 600, 600);
      ctx.clip();
      ctx.drawImage(img, 50, 50, 600, 600);
      ctx.restore();

      // Draw bottom caption
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize * 1.6}px Caveat, cursive`;
      ctx.fillText(caption, 60, 720);

      // Draw date if enabled
      if (includeDate) {
        ctx.font = '16px monospace';
        ctx.fillStyle = '#E27D26'; // instant camera orange stamp
        ctx.fillText(dateText, 540, 720);
      }

      // Trigger download
      const link = document.createElement('a');
      link.download = `PIXE_POLAROID_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = selectedPhoto;
  };

  const currentFrameObj = FRAME_STYLES.find((f) => f.id === frameStyle) || FRAME_STYLES[0];
  const currentFilterObj = FILTERS.find((f) => f.id === activeFilter) || FILTERS[0];
  const currentTapeObj = TAPE_OPTIONS.find((t) => t.id === tapeStyle) || TAPE_OPTIONS[0];

  return (
    <section id="custom-studio-section" className="relative py-28 bg-[#0E0D0B] border-t border-[#1C1A15]">
      {/* Studio Lighting Radial Vignette */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#F4B82A]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold">
            <span className="w-6 h-[1px] bg-[#F4B82A]" />
            <span>04. Studio Customizer</span>
            <span className="w-6 h-[1px] bg-[#F4B82A]" />
          </div>
          <h2 className="font-['Syne'] text-3xl sm:text-5xl font-bold tracking-tight text-[#E8DDC8]">
            CREATE SOMETHING THAT'S YOURS.
          </h2>
          <p className="font-['Cormorant_Garamond'] italic text-xl text-[#E8DDC8]/70">
            Craft your custom Polaroid frame in real-time. We print and ship the physical artifact.
          </p>
        </div>

        {/* Studio Workspace Layout: Left Preview, Right Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: The Interactive Physical Polaroid Preview & Desk Studio */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Photographic Desk Mat Surface */}
            <div className="relative w-full max-w-lg aspect-[4/5] bg-gradient-to-b from-[#14120E] via-[#0E0D0B] to-[#0A0908] rounded-2xl p-8 border border-[#27241D] shadow-[0_30px_90px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center overflow-hidden select-none">
              
              {/* Studio Desk Light */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B82A]/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Physical Polaroid Card */}
              <div
                ref={polaroidCardRef}
                style={{
                  backgroundColor: currentFrameObj.bg,
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out, background-color 0.3s ease',
                }}
                className="relative w-72 sm:w-80 rounded-[3px] p-4 pb-9 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.95)] group"
              >
                {/* Washi Tape Strip */}
                {tapeStyle !== 'none' && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 ${currentTapeObj.class} -rotate-1 z-30 shadow-xs flex items-center justify-center text-[9px] font-mono tracking-widest uppercase text-black/60`}
                  >
                    PIXÉ CUSTOM
                  </div>
                )}

                {/* Gloss Sheen */}
                <div className="absolute inset-0 polaroid-sheen pointer-events-none rounded-[3px]" />

                {/* Inner Image Container */}
                <div className="relative aspect-square w-full bg-[#11100D] overflow-hidden rounded-[1px] shadow-inner">
                  <img
                    src={selectedPhoto}
                    alt="Custom preview"
                    referrerPolicy="no-referrer"
                    style={{
                      filter: currentFilterObj.css,
                      transform: `scale(${zoom / 100})`,
                    }}
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {/* Film Grain Texture over image */}
                  <div className="absolute inset-0 film-grain pointer-events-none opacity-40 mix-blend-overlay" />

                  {/* Analog Orange Date Stamp (Classic 90s instant camera style) */}
                  {includeDate && (
                    <div className="absolute bottom-2 right-2.5 font-mono text-[10px] tracking-wider text-[#FF7A00] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] opacity-90">
                      '{dateText}
                    </div>
                  )}
                </div>

                {/* Bottom Border: Handwritten Caption */}
                <div className="pt-3.5 px-1 min-h-[38px] flex items-center">
                  <p
                    style={{
                      color: textColor,
                      fontSize: `${fontSize}px`,
                    }}
                    className="font-['Caveat'] leading-tight font-medium tracking-tight truncate w-full"
                  >
                    {caption || 'Add your caption here...'}
                  </p>
                </div>
              </div>

              {/* Status Note under desk */}
              <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-[#E8DDC8]/40">
                <span>FORMAT: 3.5 × 4.2 INCH ARCHIVAL POLAROID</span>
                <span className="text-[#F4B82A]">₹50 PER PRINT</span>
              </div>
            </div>

            {/* Quick Preview Action Bar */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadSnapshot}
                className="flex items-center gap-2 px-4 py-2 bg-[#14120E] hover:bg-[#1E1B15] text-[#E8DDC8] hover:text-[#F4B82A] text-xs font-semibold rounded-lg border border-[#27241D] transition-colors cursor-pointer"
                title="Download high-resolution image file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SAVE PREVIEW PNG</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRotation(0);
                  setZoom(100);
                  setActiveFilter('classic');
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#14120E] hover:bg-[#1E1B15] text-[#E8DDC8]/60 hover:text-[#E8DDC8] text-xs font-mono rounded-lg border border-[#27241D] transition-colors cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>RESET</span>
              </button>
            </div>
          </div>

          {/* Right Column: Studio Control Console */}
          <div className="lg:col-span-5 bg-[#14120E] border border-[#27241D] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
            
            {/* Control Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#0E0D0B] rounded-lg border border-[#27241D]">
              <button
                type="button"
                onClick={() => {
                  playPaperTapSound();
                  setActiveTab('image');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'image' ? 'bg-[#F4B82A] text-[#0B0A08]' : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>IMAGE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPaperTapSound();
                  setActiveTab('text');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'text' ? 'bg-[#F4B82A] text-[#0B0A08]' : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>TEXT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPaperTapSound();
                  setActiveTab('filter');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'filter' ? 'bg-[#F4B82A] text-[#0B0A08]' : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>FILTER</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPaperTapSound();
                  setActiveTab('adjust');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'adjust' ? 'bg-[#F4B82A] text-[#0B0A08]' : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>FRAME</span>
              </button>
            </div>

            {/* TAB 1: IMAGE SELECTION & UPLOAD */}
            {activeTab === 'image' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#F4B82A] tracking-wider mb-2">
                    Upload from Device
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-[#27241D] hover:border-[#F4B82A]/60 rounded-xl bg-[#0E0D0B] hover:bg-[#161410] transition-colors cursor-pointer group"
                  >
                    <Upload className="w-6 h-6 text-[#F4B82A] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-[#E8DDC8] uppercase tracking-wide">
                      Select High-Res Photo
                    </span>
                    <span className="text-[10px] text-[#E8DDC8]/50">
                      JPG, PNG, HEIC up to 25MB · Client-Side Local Processing
                    </span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#E8DDC8]/60 tracking-wider mb-2">
                    Or Choose from Studio Sample Photos
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {SAMPLE_CUSTOM_PHOTOS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          playPaperTapSound();
                          setSelectedPhoto(sample.url);
                          setCaption(sample.caption);
                        }}
                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedPhoto === sample.url
                            ? 'border-[#F4B82A] scale-105 shadow-md'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TEXT & CAPTION CONTROLS */}
            {activeTab === 'text' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#F4B82A] tracking-wider mb-1.5">
                    Handwritten Caption
                  </label>
                  <input
                    type="text"
                    maxLength={48}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Kyoto dawn · 2026"
                    className="w-full px-3.5 py-2.5 bg-[#0E0D0B] border border-[#27241D] focus:border-[#F4B82A] rounded-lg text-sm text-[#E8DDC8] outline-none font-['Caveat'] text-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#E8DDC8]/40 mt-1">
                    <span>Authentic ballpoint & marker simulation</span>
                    <span>{caption.length}/48</span>
                  </div>
                </div>

                {/* Font Size Slider */}
                <div>
                  <div className="flex justify-between text-xs text-[#E8DDC8]/70 mb-1">
                    <span>Text Size</span>
                    <span className="font-mono">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="28"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-[#F4B82A] cursor-pointer"
                  />
                </div>

                {/* Ink Color Selector */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#E8DDC8]/60 tracking-wider mb-2">
                    Ink Tone
                  </label>
                  <div className="flex items-center gap-3">
                    {[
                      { name: 'Charcoal Black', color: '#1F1C16' },
                      { name: 'Warm Cream', color: '#E8DDC8' },
                      { name: 'Studio Gold', color: '#F4B82A' },
                      { name: 'Analog Orange', color: '#FF7A00' },
                    ].map((ink) => (
                      <button
                        key={ink.color}
                        type="button"
                        onClick={() => {
                          playPaperTapSound();
                          setTextColor(ink.color);
                        }}
                        style={{ backgroundColor: ink.color }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                          textColor === ink.color ? 'border-white scale-110 shadow-lg' : 'border-black/50'
                        }`}
                        title={ink.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Date Stamp Toggle */}
                <div className="pt-2 border-t border-[#27241D] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#E8DDC8]">Analog Date Stamp</div>
                    <div className="text-[10px] text-[#E8DDC8]/50">Classic 90s instant camera orange clock</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeDate}
                    onChange={(e) => setIncludeDate(e.target.checked)}
                    className="w-4 h-4 accent-[#F4B82A] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: FILM TONE CURVES / FILTERS */}
            {activeTab === 'filter' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <label className="block text-xs font-mono uppercase text-[#F4B82A] tracking-wider mb-2">
                  Select Analog Film Emulsion Profile
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        playPaperTapSound();
                        setActiveFilter(f.id);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        activeFilter === f.id
                          ? 'bg-[#1E1B15] border-[#F4B82A] text-[#F4B82A]'
                          : 'bg-[#0E0D0B] border-[#27241D] text-[#E8DDC8]/70 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold uppercase">{f.name}</div>
                      <div className="text-[10px] text-[#E8DDC8]/50 font-mono mt-0.5">Archival Grade</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: FRAME & ADJUSTMENTS */}
            {activeTab === 'adjust' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Frame Style */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#F4B82A] tracking-wider mb-2">
                    Paper Frame Stock
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {FRAME_STYLES.map((fr) => (
                      <button
                        key={fr.id}
                        type="button"
                        onClick={() => {
                          playPaperTapSound();
                          setFrameStyle(fr.id);
                          setTextColor(fr.textDefault);
                        }}
                        className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                          frameStyle === fr.id
                            ? 'border-[#F4B82A] bg-[#1E1B15] text-[#F4B82A]'
                            : 'border-[#27241D] bg-[#0E0D0B] text-[#E8DDC8]/70'
                        }`}
                      >
                        {fr.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tape Strip Option */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#E8DDC8]/60 tracking-wider mb-2">
                    Desk Washi Tape Detail
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TAPE_OPTIONS.map((tp) => (
                      <button
                        key={tp.id}
                        type="button"
                        onClick={() => {
                          playPaperTapSound();
                          setTapeStyle(tp.id);
                        }}
                        className={`p-2 rounded-lg border text-[11px] font-semibold text-center transition-all cursor-pointer ${
                          tapeStyle === tp.id
                            ? 'border-[#F4B82A] bg-[#1E1B15] text-[#F4B82A]'
                            : 'border-[#27241D] bg-[#0E0D0B] text-[#E8DDC8]/70'
                        }`}
                      >
                        {tp.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zoom & Tilt Controls */}
                <div className="space-y-3 pt-2 border-t border-[#27241D]">
                  <div>
                    <div className="flex justify-between text-xs text-[#E8DDC8]/70 mb-1">
                      <span>Image Zoom</span>
                      <span className="font-mono">{zoom}%</span>
                    </div>
                    <input
                      type="range"
                      min="90"
                      max="140"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full accent-[#F4B82A] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[#E8DDC8]/70 mb-1">
                      <span>Card Tilt</span>
                      <span className="font-mono">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full accent-[#F4B82A] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Print Price & Add to Cart Action */}
            <div className="pt-4 border-t border-[#27241D] space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-[#E8DDC8]/50 uppercase tracking-wider">Custom Print Price</div>
                  <div className="text-[10px] text-[#F4B82A] font-mono">Dye-Sublimation Archival Grade</div>
                </div>
                <div className="text-3xl font-['Syne'] font-bold text-[#E8DDC8] tabular-nums">
                  ₹50
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedToast}
                className="w-full py-4 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs tracking-wider uppercase rounded-xl shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(244,184,42,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>PRINT ADDED TO CART!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD CUSTOM POLAROID TO CART — ₹50</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
