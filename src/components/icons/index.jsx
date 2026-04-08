// FitHer SVG Icon System
// Every icon uses currentColor, strokeWidth 1.5, viewBox 0 0 24 24
// Pass className to control size and colour via Tailwind

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// ── Navigation Icons ─────────────────────────────────────────

export function HomeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M3 12L12 3l9 9" />
      <path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      <path d="M9 21v-6h6v6" />
    </svg>
  )
}

export function LogIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

export function HistoryIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M3 12a9 9 0 109-9" />
      <polyline points="3 3 3 9 9 9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

export function ProgressIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <polyline points="4 19 8 13 12 16 20 5" />
      <circle cx="4" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="20" cy="5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function GuideIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" />
    </svg>
  )
}

export function SettingsIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// ── Action Icons ─────────────────────────────────────────────

export function SaveIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export function DeleteIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

export function EditIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

export function AddIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function RemoveIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function BackspaceIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
      <line x1="18" y1="9" x2="12" y2="15" />
      <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
  )
}

export function ChevronDownIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function ChevronRightIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function LockIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

export function LogoutIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

// ── Fitness Icons ────────────────────────────────────────────

export function DumbbellIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M6.5 6.5a2 2 0 013 0L12 9l2.5-2.5a2 2 0 013 0 2 2 0 010 3L15 12l2.5 2.5a2 2 0 010 3 2 2 0 01-3 0L12 15l-2.5 2.5a2 2 0 01-3 0 2 2 0 010-3L9 12 6.5 9.5a2 2 0 010-3z" />
      <line x1="4" y1="20" x2="4.01" y2="20" />
      <line x1="20" y1="4" x2="20.01" y2="4" />
    </svg>
  )
}

export function HeartIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}

export function FireIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 22c4.97 0 8-3.03 8-8 0-2.52-1.02-5.2-2.76-7.38a1 1 0 00-1.62.12L13.5 10 12 7l-1.5-3.5a1 1 0 00-1.76-.12C6.82 5.75 4 9.48 4 14c0 4.97 3.03 8 8 8z" />
      <path d="M12 22c-2 0-3-1.5-3-3.5 0-1.5.5-2.5 1.5-3.5L12 14l1.5 1c1 1 1.5 2 1.5 3.5 0 2-1 3.5-3 3.5z" />
    </svg>
  )
}

export function TreadmillIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="14" cy="4" r="2" />
      <path d="M14 10l-3-3-4 4 2 2" />
      <path d="M11 7l3 3v5" />
      <path d="M3 20h18" />
      <path d="M6 17l1-3h10l1 3" />
    </svg>
  )
}

export function ScaleIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 7v4" />
      <path d="M8 13a4 4 0 008 0" />
      <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CalendarIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export function TrophyIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2" />
      <path d="M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
      <path d="M6 3h12v6a6 6 0 01-12 0V3z" />
      <path d="M12 15v3" />
      <path d="M8 21h8" />
      <path d="M10 18h4" />
    </svg>
  )
}

export function ChartIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  )
}

export function TimerIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M10 2h4" />
      <path d="M12 2v2" />
      <path d="M20 5l-1.5 1.5" />
    </svg>
  )
}

// ── Status Icons ─────────────────────────────────────────────

export function CheckIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <polyline points="4 12 9 17 20 6" />
    </svg>
  )
}

export function AlertIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export function InfoIcon({ className = 'w-6 h-6' }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}
