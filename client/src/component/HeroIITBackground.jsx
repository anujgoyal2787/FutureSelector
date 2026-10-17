export default function HeroIITBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* 1. SOFT AMBIENT GLOW AURA (Subtle Luxury Depth) */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-brand-600/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-gold-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-gradient-to-t from-brand-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 2. SUBTLE MILLIMETER DRAFTING BLUEPRINT GRID (Ultra-faint watermark) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.04]" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="iit-small-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#0D3A2C" strokeWidth="0.75" />
          </pattern>
          <pattern id="iit-large-grid" width="140" height="140" patternUnits="userSpaceOnUse">
            <rect width="140" height="140" fill="url(#iit-small-grid)" />
            <path d="M 140 0 L 0 0 0 140" fill="none" stroke="#0D3A2C" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#iit-large-grid)" />
      </svg>

      {/* 3. ELEGANT SCIENTIFIC WATERMARK: BOHR ORBITS & COORDINATE VECTORS (Faint background art) */}
      <svg 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] sm:w-[1350px] h-[850px] sm:h-[1000px] pointer-events-none opacity-[0.07]"
        viewBox="0 0 1000 800" 
        fill="none" 
        stroke="currentColor"
      >
        <defs>
          <linearGradient id="orbit-grad-clean" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#124B38" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#C5A059" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#124B38" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Central Bohr Nucleus Rings */}
        <circle cx="500" cy="400" r="16" stroke="url(#orbit-grad-clean)" strokeWidth="1.5" />
        <circle cx="500" cy="400" r="4" fill="#C5A059" />

        {/* 3 Elliptical Bohr Quantum Orbits */}
        <ellipse cx="500" cy="400" rx="380" ry="130" stroke="url(#orbit-grad-clean)" strokeWidth="1.2" strokeDasharray="6 6" transform="rotate(-30 500 400)" />
        <ellipse cx="500" cy="400" rx="380" ry="130" stroke="url(#orbit-grad-clean)" strokeWidth="1.2" strokeDasharray="6 6" transform="rotate(30 500 400)" />
        <ellipse cx="500" cy="400" rx="380" ry="130" stroke="url(#orbit-grad-clean)" strokeWidth="1.2" strokeDasharray="6 6" transform="rotate(90 500 400)" />

        {/* Outer Coordinate Circles */}
        <circle cx="500" cy="400" r="320" stroke="url(#orbit-grad-clean)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="500" cy="400" r="220" stroke="url(#orbit-grad-clean)" strokeWidth="0.8" />
        
        {/* Coordinate Center Crosshairs */}
        <line x1="120" y1="400" x2="880" y2="400" stroke="#124B38" strokeWidth="1" strokeDasharray="6 6" />
        <line x1="500" y1="80" x2="500" y2="720" stroke="#124B38" strokeWidth="1" strokeDasharray="6 6" />

        {/* Harmonic Sine Wave */}
        <path 
          d="M 50 360 Q 175 280 300 360 T 550 360 T 800 360 T 950 360" 
          stroke="url(#orbit-grad-clean)" 
          strokeWidth="1.5" 
          strokeDasharray="4 4"
        />

        {/* Subtle Benzene Ring (Top Right margin) */}
        <g transform="translate(820, 100) scale(0.7)" stroke="#124B38" strokeWidth="1.5">
          <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" fill="none" />
          <circle cx="50" cy="50" r="28" fill="none" strokeDasharray="4 3" />
        </g>
      </svg>

      {/* 4. RADIAL CENTER CLEAR VIGNETTE - Ensures text & cards have 100% crisp contrast */}
      <div className="absolute inset-0 bg-radial from-transparent via-background/40 to-background/80 pointer-events-none" />

    </div>
  );
}
