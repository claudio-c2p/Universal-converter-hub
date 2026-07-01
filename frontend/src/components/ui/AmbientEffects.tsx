'use client';
import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface Particle {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

interface Star {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  minOpacity: number;
  maxOpacity: number;
  amber: boolean;
}

function makeParticles(count: number, sizeRange: [number, number]): Particle[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
    duration: 9 + Math.random() * 8,
    delay: -Math.random() * 16,
    drift: (Math.random() - 0.5) * 60,
    opacity: 0.2 + Math.random() * 0.3,
  }));
}

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1.2 + Math.random() * 2.6,
    duration: 1.6 + Math.random() * 2.6,
    delay: -Math.random() * 4,
    minOpacity: 0.08 + Math.random() * 0.12,
    maxOpacity: 0.7 + Math.random() * 0.3,
    amber: Math.random() < 0.15,
  }));
}

function makeComets(count: number) {
  return Array.from({ length: count }, () => ({
    top: Math.random() * 35,
    left: Math.random() * 75,
    x: 180 + Math.random() * 170,
    y: 150 + Math.random() * 140,
    duration: 2.2 + Math.random() * 3,
    delay: -Math.random() * 7,
    tailWidth: 80 + Math.random() * 70,
  }));
}

function makeSparks(count: number) {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    size: 3 + Math.random() * 5,
    duration: 4 + Math.random() * 5,
    delay: -Math.random() * 9,
    drift: (Math.random() - 0.5) * 80,
  }));
}

function makeDrops(count: number) {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    height: 16 + Math.random() * 24,
    duration: 0.6 + Math.random() * 0.6,
    delay: -Math.random() * 1.5,
    drift: (Math.random() - 0.5) * 12,
  }));
}

export default function AmbientEffects() {
  const { theme } = useTheme();
  const [lightParticles] = useState(() => makeParticles(17, [3, 6]));
  const [darkParticles] = useState(() => makeParticles(17, [2, 4]));
  const [stars] = useState(() => makeStars(50));
  const [comets] = useState(() => makeComets(9));
  const [drops] = useState(() => makeDrops(60));
  const [sparks] = useState(() => makeSparks(20));
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (theme === 'rain') {
    return (
      <div className="particle-layer" aria-hidden="true">
        {drops.map((d, i) => (
          <span
            key={i}
            className="raindrop"
            style={{
              left: `${d.left}%`,
              height: `${d.height}px`,
              animationDuration: `${d.duration}s`,
              animationDelay: `${d.delay}s`,
              ['--drift' as any]: `${d.drift}px`,
            }}
          />
        ))}
      </div>
    );
  }

  if (theme === 'dark') {
    return (
      <div className="particle-layer" aria-hidden="true">
        {darkParticles.map((p, i) => (
          <span
            key={`p-${i}`}
            className="particle"
            style={{
              left: `${p.left}%`,
              ['--particle-w' as any]: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              ['--drift' as any]: `${p.drift}px`,
              ['--particle-opacity' as any]: p.opacity,
            }}
          />
        ))}
        {stars.map((s, i) => (
          <span
            key={`s-${i}`}
            className={`star${s.amber ? ' amber' : ''}`}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              ['--star-min' as any]: s.minOpacity,
              ['--star-max' as any]: s.maxOpacity,
            }}
          />
        ))}
        {comets.map((c, i) => (
          <span
            key={`c-${i}`}
            className="comet"
            style={{
              top: `${c.top}%`,
              left: `${c.left}%`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
              ['--comet-x' as any]: `${c.x}px`,
              ['--comet-y' as any]: `${c.y}px`,
            }}
          >
            <span className="comet-tail" style={{ width: `${c.tailWidth}px` }} />
            <span className="comet-head" />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="particle-layer" aria-hidden="true">
      {lightParticles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            ['--particle-w' as any]: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ['--drift' as any]: `${p.drift}px`,
            ['--particle-opacity' as any]: p.opacity,
          }}
        />
      ))}
      {sparks.map((s, i) => (
        <span
          key={`sp-${i}`}
          className="spark"
          style={{
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            ['--drift' as any]: `${s.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

