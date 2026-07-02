'use client';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

function hexToRgb(hex: string) {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r: number, g: number, b: number) {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const k = 1 - Math.max(rf, gf, bf);
  const c = (1 - rf - k) / (1 - k);
  const m = (1 - gf - k) / (1 - k);
  const y = (1 - bf - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}

export default function ColorConverterPage() {
  const [hex, setHex] = useState('#E84E1B');

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const cmyk = rgb ? rgbToCmyk(rgb.r, rgb.g, rgb.b) : null;

  return (
    <ToolLayout title="Conversor de Cor" description="Converta cores entre HEX, RGB, HSL e CMYK com preview ao vivo." category="Texto">
      <div className="flex items-center gap-4">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#000000'} onChange={(e) => setHex(e.target.value)}
          className="h-14 w-14 cursor-pointer rounded-md border border-brand-border dark:border-gray-700 bg-transparent" />
        <input value={hex} onChange={(e) => setHex(e.target.value)}
          className="flex-1 rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-mono" />
      </div>
      {!rgb && <p className="mt-3 text-sm text-red-500">HEX inválido — use o formato #RRGGBB.</p>}
      {rgb && hsl && cmyk && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-md border border-brand-border dark:border-gray-700 p-3">
            <p className="mb-1 text-xs text-brand-muted dark:text-gray-400">RGB</p>
            <p className="font-mono">rgb({rgb.r}, {rgb.g}, {rgb.b})</p>
          </div>
          <div className="rounded-md border border-brand-border dark:border-gray-700 p-3">
            <p className="mb-1 text-xs text-brand-muted dark:text-gray-400">HSL</p>
            <p className="font-mono">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
          </div>
          <div className="rounded-md border border-brand-border dark:border-gray-700 p-3">
            <p className="mb-1 text-xs text-brand-muted dark:text-gray-400">CMYK</p>
            <p className="font-mono">cmyk({cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%)</p>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
