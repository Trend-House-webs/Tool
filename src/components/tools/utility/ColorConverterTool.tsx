import React, { useState } from 'react';
import { Copy, Check, Palette, RefreshCw } from 'lucide-react';

export function ColorConverterTool() {
  const [hex, setHex] = useState<string>('#2563EB');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Parse HEX to RGB
  const hexToRgb = (h: string) => {
    let clean = h.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    if (clean.length !== 6) return null;
    const num = parseInt(clean, 16);
    if (isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgb = hexToRgb(hex) || { r: 37, g: 99, b: 235 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const hexFormatted = hex.startsWith('#') ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
  const rgbFormatted = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslFormatted = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const cmykC = (1 - rgb.r / 255 - (1 - Math.max(rgb.r, rgb.g, rgb.b) / 255)) / (Math.max(rgb.r, rgb.g, rgb.b) / 255) || 0;
  const cmykK = 1 - Math.max(rgb.r, rgb.g, rgb.b) / 255;
  const cmykFormatted = `cmyk(${Math.round(Math.max(0, cmykC) * 100)}%, ${Math.round(cmykK * 100)}%)`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Relative luminance for contrast
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const textColor = luminance > 0.5 ? '#0f172a' : '#ffffff';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Color Preview Swatch */}
        <div
          style={{ backgroundColor: hexFormatted, color: textColor }}
          className="h-32 sm:h-40 rounded-2xl border border-slate-300 shadow-inner flex flex-col items-center justify-center p-4 transition-colors"
        >
          <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-wider">{hexFormatted}</span>
          <span className="text-xs opacity-80 mt-1 font-mono">{rgbFormatted}</span>
        </div>

        {/* Color Picker input */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <input
            type="color"
            value={hexFormatted}
            onChange={(e) => setHex(e.target.value.toUpperCase())}
            className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0"
          />
          <div className="flex-1">
            <label htmlFor="hex-code" className="block text-[11px] font-semibold text-slate-500 uppercase">HEX Code</label>
            <input
              id="hex-code"
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              placeholder="#2563EB"
              className="w-full bg-transparent font-mono text-sm font-bold text-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Color Formats Table */}
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="flex items-center justify-between p-3.5 bg-white">
            <div>
              <span className="text-slate-500 block">HEX</span>
              <strong className="font-mono text-sm text-slate-900">{hexFormatted}</strong>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(hexFormatted, 'hex')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
            >
              {copiedKey === 'hex' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50/50">
            <div>
              <span className="text-slate-500 block">RGB</span>
              <strong className="font-mono text-sm text-slate-900">{rgbFormatted}</strong>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(rgbFormatted, 'rgb')}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md font-medium cursor-pointer"
            >
              {copiedKey === 'rgb' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-white">
            <div>
              <span className="text-slate-500 block">HSL</span>
              <strong className="font-mono text-sm text-slate-900">{hslFormatted}</strong>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(hslFormatted, 'hsl')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
            >
              {copiedKey === 'hsl' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50/50">
            <div>
              <span className="text-slate-500 block">CSS Variable Format</span>
              <strong className="font-mono text-xs text-slate-700">--brand-color: {hexFormatted};</strong>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(`--color: ${hexFormatted};`, 'css')}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md font-medium cursor-pointer"
            >
              {copiedKey === 'css' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
