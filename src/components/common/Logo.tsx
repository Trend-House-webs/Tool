import React from 'react';

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'monochrome';
}

export interface IconProps {
  className?: string;
  variant?: 'default' | 'light' | 'dark' | 'monochrome';
  roundedBg?: boolean;
}

/**
 * ToolNest Geometric Modular Emblem
 * A clean, distinctive geometric symbol: an interlocking modular isometric node.
 * Features obsidian slate facets with a luminous emerald green surface and glowing warm gold core node.
 * Symbolizes precision browser utilities nested in one simple place.
 *
 * Strictly geometric with zero letterforms (NO letter T).
 */
export function ToolNestIcon({
  className = 'w-8 h-8',
  variant = 'default',
  roundedBg = false,
}: IconProps) {
  if (roundedBg) {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="14" fill="#090D16" />
        {/* Outer Nest Facets */}
        <path d="M32 10 L50 20.5 L32 31 L14 20.5 Z" fill="#10B981" stroke="#34D399" strokeWidth="1" strokeLinejoin="round" />
        <path d="M14 20.5 L32 31 L32 52 L14 41.5 Z" fill="#090E17" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M32 31 L50 20.5 L50 41.5 L32 52 Z" fill="#1E293B" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Core Warm Gold / Amber Nest */}
        <path d="M32 23 L41 28.2 L32 33.5 L23 28.2 Z" fill="#FBBF24" />
        <path d="M23 28.2 L32 33.5 L32 44 L23 38.7 Z" fill="#D97706" />
        <path d="M32 33.5 L41 28.2 L41 38.7 L32 44 Z" fill="#F59E0B" />
      </svg>
    );
  }

  // Standalone vector symbol
  let topFacet = '#10B981';
  let leftFacet = '#090D16';
  let rightFacet = '#1E293B';
  let coreTop = '#FBBF24';
  let coreLeft = '#D97706';
  let coreRight = '#F59E0B';

  if (variant === 'light') {
    topFacet = '#34D399';
    leftFacet = '#1E293B';
    rightFacet = '#334155';
    coreTop = '#FDE68A';
    coreLeft = '#F59E0B';
    coreRight = '#FBBF24';
  } else if (variant === 'monochrome') {
    topFacet = 'currentColor';
    leftFacet = 'currentColor';
    rightFacet = 'currentColor';
    coreTop = 'currentColor';
    coreLeft = 'currentColor';
    coreRight = 'currentColor';
  }

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Hexagonal Isometric Frame */}
      <path d="M32 8 L52 19.5 L32 31 L12 19.5 Z" fill={topFacet} />
      <path d="M12 19.5 L32 31 L32 54 L12 42.5 Z" fill={leftFacet} />
      <path d="M32 31 L52 19.5 L52 42.5 L32 54 Z" fill={rightFacet} />
      {/* Central Nestled Utility Core */}
      <path d="M32 22 L42 27.8 L32 33.5 L22 27.8 Z" fill={coreTop} />
      <path d="M22 27.8 L32 33.5 L32 45 L22 39.2 Z" fill={coreLeft} />
      <path d="M32 33.5 L42 27.8 L42 39.2 L32 45 Z" fill={coreRight} />
    </svg>
  );
}

/**
 * ToolNest Master Brand Logo
 * Combines the modern isometric geometric symbol, custom two-tone wordmark, and official tagline.
 */
export function ToolNestLogo({
  className = '',
  size = 'md',
  showTagline = false,
  variant = 'dark',
}: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <ToolNestIcon
        className={`${iconSizes[size]} shrink-0`}
        variant={variant === 'light' ? 'light' : 'default'}
      />
      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-[-0.035em] leading-none">
          <span
            className={`font-black ${textSizes[size]} ${
              variant === 'light' ? 'text-white' : 'text-slate-900'
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
          >
            Tool
          </span>
          <span
            className={`font-black ${textSizes[size]} ${
              variant === 'light' ? 'text-emerald-400' : 'text-emerald-600'
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
          >
            Nest
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-semibold tracking-wide uppercase mt-0.5 leading-tight ${taglineSizes[size]} ${
              variant === 'light' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Everyday Tools · One Simple Place
          </span>
        )}
      </div>
    </div>
  );
}
