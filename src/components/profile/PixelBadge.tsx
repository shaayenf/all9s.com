import React from 'react';
import { PixelBadgeDefinition } from '../../data/badgesData';
import { Sparkles, Check, Lock } from 'lucide-react';

interface PixelBadgeProps {
  badge: PixelBadgeDefinition;
  isUnlocked: boolean;
  currentValue: number;
  onClaim?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({
  badge,
  isUnlocked,
  currentValue,
  size = 'md',
}) => {
  const progressPercent = Math.min(100, Math.round((currentValue / badge.targetValue) * 100));

  // Pixel SVG renderer based on iconType
  const renderPixelIcon = () => {
    switch (badge.iconType) {
      case 'flame':
        // 16x16 Pixel Flame
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="7" y="1" width="2" height="2" fill={badge.secondaryColor} />
            <rect x="6" y="3" width="4" height="2" fill={badge.secondaryColor} />
            <rect x="5" y="5" width="6" height="3" fill={badge.themeColor} />
            <rect x="7" y="5" width="2" height="3" fill="#ffffff" />
            <rect x="4" y="8" width="8" height="4" fill={badge.themeColor} />
            <rect x="6" y="8" width="4" height="3" fill={badge.secondaryColor} />
            <rect x="3" y="10" width="10" height="4" fill={badge.themeColor} />
            <rect x="5" y="11" width="6" height="2" fill="#ffffff" />
            <rect x="4" y="14" width="8" height="2" fill={badge.themeColor} />
          </svg>
        );
      case 'crown':
        // 16x16 Pixel Crown
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="2" y="3" width="2" height="2" fill={badge.secondaryColor} />
            <rect x="7" y="2" width="2" height="2" fill={badge.secondaryColor} />
            <rect x="12" y="3" width="2" height="2" fill={badge.secondaryColor} />
            <rect x="2" y="5" width="2" height="6" fill={badge.themeColor} />
            <rect x="4" y="7" width="2" height="4" fill={badge.themeColor} />
            <rect x="6" y="4" width="4" height="7" fill={badge.themeColor} />
            <rect x="7" y="5" width="2" height="2" fill="#ffffff" />
            <rect x="10" y="7" width="2" height="4" fill={badge.themeColor} />
            <rect x="12" y="5" width="2" height="6" fill={badge.themeColor} />
            <rect x="2" y="11" width="12" height="3" fill={badge.themeColor} />
            <rect x="4" y="12" width="2" height="1" fill="#ffffff" />
            <rect x="7" y="12" width="2" height="1" fill="#ffffff" />
            <rect x="10" y="12" width="2" height="1" fill="#ffffff" />
          </svg>
        );
      case 'tome':
        // 16x16 Pixel Magic Tome
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="3" y="2" width="10" height="2" fill={badge.secondaryColor} />
            <rect x="2" y="4" width="12" height="9" fill={badge.themeColor} />
            <rect x="4" y="5" width="8" height="7" fill="#ffffff" opacity="0.9" />
            <rect x="7" y="5" width="2" height="7" fill={badge.themeColor} />
            <rect x="5" y="7" width="2" height="1" fill={badge.themeColor} />
            <rect x="9" y="7" width="2" height="1" fill={badge.themeColor} />
            <rect x="5" y="9" width="2" height="1" fill={badge.themeColor} />
            <rect x="9" y="9" width="2" height="1" fill={badge.themeColor} />
            <rect x="2" y="13" width="12" height="2" fill={badge.secondaryColor} />
          </svg>
        );
      case 'hourglass':
        // 16x16 Pixel Hourglass
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="3" y="1" width="10" height="2" fill={badge.themeColor} />
            <rect x="4" y="3" width="8" height="2" fill={badge.secondaryColor} />
            <rect x="5" y="5" width="6" height="2" fill={badge.themeColor} />
            <rect x="6" y="6" width="4" height="1" fill="#ffffff" />
            <rect x="7" y="7" width="2" height="2" fill="#ffffff" />
            <rect x="5" y="9" width="6" height="2" fill={badge.themeColor} />
            <rect x="6" y="10" width="4" height="2" fill={badge.secondaryColor} />
            <rect x="4" y="11" width="8" height="2" fill={badge.secondaryColor} />
            <rect x="3" y="13" width="10" height="2" fill={badge.themeColor} />
          </svg>
        );
      case 'bolt':
        // 16x16 Pixel Lightning
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="9" y="1" width="3" height="3" fill={badge.secondaryColor} />
            <rect x="7" y="4" width="4" height="3" fill={badge.themeColor} />
            <rect x="5" y="7" width="7" height="2" fill="#ffffff" />
            <rect x="4" y="9" width="5" height="2" fill={badge.themeColor} />
            <rect x="6" y="11" width="3" height="2" fill={badge.themeColor} />
            <rect x="7" y="13" width="2" height="2" fill={badge.secondaryColor} />
          </svg>
        );
      case 'key':
        // 16x16 Pixel Key
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="3" y="2" width="6" height="6" fill={badge.themeColor} />
            <rect x="5" y="4" width="2" height="2" fill="#09090b" />
            <rect x="8" y="5" width="6" height="2" fill={badge.secondaryColor} />
            <rect x="11" y="7" width="2" height="2" fill={badge.secondaryColor} />
            <rect x="13" y="7" width="2" height="3" fill={badge.themeColor} />
          </svg>
        );
      case 'beacon':
        // 16x16 Pixel Signal Beacon
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="7" y="1" width="2" height="2" fill="#ffffff" />
            <rect x="6" y="3" width="4" height="3" fill={badge.secondaryColor} />
            <rect x="5" y="6" width="6" height="3" fill={badge.themeColor} />
            <rect x="7" y="6" width="2" height="2" fill="#ffffff" />
            <rect x="6" y="9" width="4" height="5" fill={badge.themeColor} />
            <rect x="4" y="14" width="8" height="2" fill={badge.secondaryColor} />
          </svg>
        );
      case 'diamond':
        // 16x16 Pixel Diamond
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="5" y="2" width="6" height="2" fill={badge.secondaryColor} />
            <rect x="3" y="4" width="10" height="3" fill={badge.themeColor} />
            <rect x="5" y="4" width="2" height="2" fill="#ffffff" />
            <rect x="4" y="7" width="8" height="3" fill={badge.themeColor} />
            <rect x="6" y="10" width="4" height="2" fill={badge.themeColor} />
            <rect x="7" y="12" width="2" height="2" fill={badge.secondaryColor} />
          </svg>
        );
      default:
        // Pixel Scroll
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="2" y="2" width="12" height="2" fill={badge.secondaryColor} />
            <rect x="3" y="4" width="10" height="8" fill="#ffffff" />
            <rect x="5" y="6" width="6" height="1" fill={badge.themeColor} />
            <rect x="5" y="8" width="6" height="1" fill={badge.themeColor} />
            <rect x="2" y="12" width="12" height="2" fill={badge.secondaryColor} />
          </svg>
        );
    }
  };

  const boxSize = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

  return (
    <div
      className={`group relative rounded-lg border transition-all p-3.5 flex flex-col justify-between font-mono ${
        isUnlocked
          ? 'theme-card border-zinc-700/80 hover:border-zinc-500 shadow-xs'
          : 'bg-zinc-950/40 border-zinc-800/60 opacity-75'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Pixel Icon Box with authentic 8-bit stepped border */}
        <div
          className={`${boxSize} rounded shrink-0 flex items-center justify-center relative p-1.5 transition-transform group-hover:scale-105`}
          style={{
            backgroundColor: isUnlocked ? '#18181b' : '#09090b',
            border: `2px solid ${isUnlocked ? badge.themeColor : '#27272a'}`,
            boxShadow: isUnlocked ? `0 0 12px ${badge.themeColor}33` : 'none',
          }}
        >
          <div className={`${iconSize} ${isUnlocked ? 'filter-none' : 'grayscale opacity-40'}`}>
            {renderPixelIcon()}
          </div>

          {isUnlocked ? (
            <span
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
              style={{ backgroundColor: badge.themeColor }}
              title="Unlocked"
            >
              ✓
            </span>
          ) : (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] text-zinc-400">
              <Lock className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold truncate theme-text-primary">
              {badge.title}
            </h4>
            <span
              className="text-[10px] px-1.5 py-0.2 rounded font-semibold shrink-0"
              style={{
                color: isUnlocked ? badge.themeColor : '#71717a',
                backgroundColor: isUnlocked ? `${badge.themeColor}18` : '#27272a33',
              }}
            >
              +{badge.xpReward} XP
            </span>
          </div>

          <div className="text-[10px] theme-text-muted mt-0.5 font-semibold">
            Pixel: <span className="theme-text-primary">{badge.pixelName}</span>
          </div>

          <p className="text-[11px] theme-text-secondary mt-1 leading-snug line-clamp-2 font-sans">
            {badge.description}
          </p>
        </div>
      </div>

      {/* Progress meter */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/80">
        <div className="flex items-center justify-between text-[10px] theme-text-muted mb-1 font-mono">
          <span>{isUnlocked ? 'Milestone Completed' : 'Progress'}</span>
          <span className="font-semibold tabular-nums">
            {isUnlocked ? `${badge.targetValue}/${badge.targetValue}` : `${Math.min(currentValue, badge.targetValue)}/${badge.targetValue}`}
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: isUnlocked ? badge.themeColor : '#52525b',
            }}
          />
        </div>

        <div className="text-[9px] theme-text-muted italic mt-1.5 truncate font-sans">
          &quot;{badge.flavor}&quot;
        </div>
      </div>
    </div>
  );
};
