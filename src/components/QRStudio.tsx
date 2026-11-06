import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Palette, 
  Sliders, 
  Sparkles, 
  ExternalLink,
  Layers,
  Printer
} from 'lucide-react';
import { ShortLink, QRCodeSettings } from '../types';

interface QRStudioProps {
  links: ShortLink[];
  initialLink?: ShortLink | null;
}

export const QRStudio: React.FC<QRStudioProps> = ({ links, initialLink }) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialLink ? initialLink.slug : links[0]?.slug || 'launch-2026'
  );
  const [customText, setCustomText] = useState<string>('');
  const [useCustomUrl, setUseCustomUrl] = useState<boolean>(false);

  // Settings
  const [fgColor, setFgColor] = useState<string>('#0F172A');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [size, setSize] = useState<number>(320);
  const [margin, setMargin] = useState<number>(2);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [frameStyle, setFrameStyle] = useState<'none' | 'simple' | 'scan_me' | 'card'>('scan_me');
  const [frameText, setFrameText] = useState<string>('SCAN WITH PHONE CAMERA');
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active target URL
  const targetUrl = useCustomUrl
    ? customText || window.location.origin
    : `${window.location.origin}/s/${selectedSlug}`;

  const currentLink = links.find((l) => l.slug === selectedSlug);

  // Generate QR Code onto canvas
  useEffect(() => {
    if (!canvasRef.current || !targetUrl) return;

    QRCode.toCanvas(
      canvasRef.current,
      targetUrl,
      {
        width: size,
        margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      },
      (error) => {
        if (error) console.error('QR code generation error:', error);
      }
    );
  }, [targetUrl, fgColor, bgColor, size, margin, errorLevel]);

  // Download PNG
  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode_${selectedSlug || 'lynx'}_${size}px.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Download SVG
  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        margin,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qrcode_${selectedSlug || 'lynx'}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  // Copy to clipboard
  const handleCopyImage = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        navigator.clipboard.write([
          new (window as any).ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        handleDownloadPNG();
      }
    });
  };

  // Color palette presets
  const COLOR_PRESETS = [
    { name: 'Classic Slate', fg: '#0F172A', bg: '#FFFFFF' },
    { name: 'Electric Blue', fg: '#2563EB', bg: '#FFFFFF' },
    { name: 'Forest Emerald', fg: '#059669', bg: '#FFFFFF' },
    { name: 'Royal Purple', fg: '#7C3AED', bg: '#FFFFFF' },
    { name: 'Crimson Ember', fg: '#DC2626', bg: '#FFFFFF' },
    { name: 'Dark Theme Contrast', fg: '#F8FAFC', bg: '#0F172A' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>High-Resolution QR Code Studio</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generate pixel-perfect QR codes with custom styling, high-error correction, and print packaging.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Link Source Selection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              1. Choose Destination
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="qr_source"
                    checked={!useCustomUrl}
                    onChange={() => setUseCustomUrl(false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Select from My Shortened Links</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="qr_source"
                    checked={useCustomUrl}
                    onChange={() => setUseCustomUrl(true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Custom URL / Text</span>
                </label>
              </div>

              {!useCustomUrl ? (
                <div>
                  <select
                    value={selectedSlug}
                    onChange={(e) => setSelectedSlug(e.target.value)}
                    aria-label="Select link for QR code"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {links.map((link) => (
                      <option key={link.id} value={link.slug}>
                        {link.title || link.slug} &bull; /s/{link.slug}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="https://yourcustomdomain.com/landing"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="text-[11px] font-mono text-slate-400 truncate">
                Target: {targetUrl}
              </div>
            </div>
          </div>

          {/* Color & Aesthetic Styling */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>2. Colors &amp; Presets</span>
            </h3>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {COLOR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFgColor(preset.fg);
                    setBgColor(preset.bg);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-xs transition cursor-pointer text-left"
                >
                  <div className="flex items-center -space-x-1">
                    <span
                      style={{ backgroundColor: preset.fg }}
                      className="w-4 h-4 rounded-full border border-white dark:border-slate-900 z-10"
                    />
                    <span
                      style={{ backgroundColor: preset.bg }}
                      className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <span className="truncate text-slate-700 dark:text-slate-300 text-[11px]">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pattern Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    aria-label="QR pattern color"
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    aria-label="QR pattern color hex code"
                    className="text-xs font-mono px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 w-24"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    aria-label="QR background color"
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    aria-label="QR background color hex code"
                    className="text-xs font-mono px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 w-24"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sizing, Padding & Frame options */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              3. Resolution &amp; Card Presentation
            </h3>

            <div className="space-y-4">
              {/* Frame Style */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Card Frame Template
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'none', label: 'Clean (No Frame)' },
                      { id: 'scan_me', label: 'Scan Me Badge' },
                      { id: 'card', label: 'Branded Card' },
                    ] as const
                  ).map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setFrameStyle(style.id)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition cursor-pointer text-center ${
                        frameStyle === style.id
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {frameStyle !== 'none' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Frame Header Caption
                  </label>
                  <input
                    type="text"
                    value={frameText}
                    onChange={(e) => setFrameText(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              {/* Sliders: Size and Margin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1">
                    <span>Export Resolution</span>
                    <span className="font-mono text-slate-500">{size}px</span>
                  </div>
                  <input
                    type="range"
                    min="180"
                    max="600"
                    step="20"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    aria-label="QR code export resolution"
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1">
                    <span>Quiet Zone Margin</span>
                    <span className="font-mono text-slate-500">{margin} blocks</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    aria-label="QR code quiet zone margin"
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center">
            
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Real-Time Preview
            </div>

            {/* Framed QR Container */}
            <div
              className={`inline-block mx-auto rounded-2xl p-6 transition-all ${
                frameStyle === 'none'
                  ? 'bg-transparent'
                  : frameStyle === 'scan_me'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md'
              }`}
            >
              {frameStyle === 'scan_me' && (
                <div className="mb-3 text-xs font-bold tracking-wider text-blue-400 uppercase">
                  {frameText}
                </div>
              )}

              {frameStyle === 'card' && currentLink && (
                <div className="mb-3">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[240px] mx-auto">
                    {currentLink.title || currentLink.slug}
                  </div>
                  <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 truncate">
                    lynx.link/s/{currentLink.slug}
                  </div>
                </div>
              )}

              {/* The Canvas */}
              <div className="rounded-xl overflow-hidden inline-flex p-2 bg-white shadow-xs">
                <canvas ref={canvasRef} className="max-w-full h-auto block" />
              </div>

              {frameStyle === 'scan_me' && currentLink && (
                <div className="mt-3 text-[11px] font-mono text-slate-400 truncate max-w-[240px] mx-auto">
                  lynx.link/s/{currentLink.slug}
                </div>
              )}
            </div>

            {/* Download & Copy Buttons */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadPNG}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={handleDownloadSVG}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>
              </div>

              <button
                onClick={handleCopyImage}
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              High-error correction enabled: can be scanned even if printed on textured paper or scaled down.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
};
