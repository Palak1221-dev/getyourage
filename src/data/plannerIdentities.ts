export interface PlannerIdentity {
  coverBg: string;           // CSS background or Tailwind classes
  coverBorder: string;       // Frame border style
  coverPattern?: string;     // SVG / CSS pattern class or style
  typographyStyle: string;   // 'serif-editorial' | 'script-calligraphy' | 'sans-minimal' | 'vintage-roman' | 'technical-mono' | 'handwritten' | 'bold-display'
  titleClass: string;        // Title font classes
  subClass: string;          // Subtitle font classes
  accentRibbon: string;      // Color of ribbon strap
  accessory: 'gold-clip' | 'elastic-band' | 'corner-brass' | 'leather-strap' | 'wax-seal' | 'copper-clip' | 'foil-stamp' | 'ribbon-tag';
  badgeStyle: string;        // Style for badge overlay
  paperTexture: 'linen' | 'leather' | 'felt' | 'kraft' | 'marble' | 'terrazzo' | 'canvas' | 'velvet' | 'parchment' | 'denim';
  illustrationIcon: string;  // Unique decorative icon/motif
  spineStyle: string;        // Spine binding visual
  themeName: string;         // Personality name (e.g. "Moleskine Black Leather", "Papier Botanical Floral")
}

// 57 Unique Visual Identities mapped by product ID or slug
export const plannerIdentities: Record<string, PlannerIdentity> = {
  // --- STUDY & EXAMS ---
  'study-planner-pro': {
    coverBg: 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] text-white',
    coverBorder: 'border-2 border-[#D4AF37]',
    coverPattern: 'radial-gradient(circle, rgba(212,175,55,0.15) 1px, transparent 1px)',
    typographyStyle: 'serif-editorial',
    titleClass: 'font-serif text-[#F8FAFC] tracking-tight font-bold',
    subClass: 'font-sans text-[#94A3B8] text-[8px] font-semibold uppercase tracking-widest',
    accentRibbon: 'bg-[#D4AF37]',
    accessory: 'corner-brass',
    badgeStyle: 'bg-[#D4AF37] text-slate-950 font-extrabold',
    paperTexture: 'linen',
    illustrationIcon: '⚖️',
    spineStyle: 'bg-[#D4AF37]',
    themeName: 'Academic Gold Foil Oxford'
  },
  'revision-tracker': {
    coverBg: 'bg-gradient-to-br from-[#064E3B] via-[#022C22] to-[#065F46] text-emerald-50',
    coverBorder: 'border-2 border-[#6EE7B7]/60',
    coverPattern: 'linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%)',
    typographyStyle: 'technical-mono',
    titleClass: 'font-mono text-[#E6F4EA] font-extrabold tracking-wider',
    subClass: 'font-mono text-[#A7F3D0] text-[8px]',
    accentRibbon: 'bg-[#34D399]',
    accessory: 'elastic-band',
    badgeStyle: 'bg-[#059669] text-white font-bold',
    paperTexture: 'canvas',
    illustrationIcon: '🔄',
    spineStyle: 'bg-[#047857]',
    themeName: 'Leuchtturm Nordic Forest Emerald'
  },
  'exam-readiness-dashboard': {
    coverBg: 'bg-gradient-to-br from-[#7C2D12] via-[#451A03] to-[#9A3412] text-amber-50',
    coverBorder: 'border-2 border-[#FDE68A]',
    typographyStyle: 'bold-display',
    titleClass: 'font-serif font-black text-[#FEF3C7] tracking-tight',
    subClass: 'font-sans text-[#FCD34D] text-[8px] uppercase font-bold',
    accentRibbon: 'bg-[#F59E0B]',
    accessory: 'wax-seal',
    badgeStyle: 'bg-[#B45309] text-amber-100',
    paperTexture: 'leather',
    illustrationIcon: '🎯',
    spineStyle: 'bg-[#D97706]',
    themeName: 'Moleskine Cognac Leather'
  },
  'lecture-notes-framework': {
    coverBg: 'bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] text-indigo-100',
    coverBorder: 'border-2 border-[#A5B4FC]/50',
    typographyStyle: 'script-calligraphy',
    titleClass: 'font-serif italic text-white font-bold',
    subClass: 'font-sans text-[#C7D2FE] text-[8px]',
    accentRibbon: 'bg-[#818CF8]',
    accessory: 'gold-clip',
    badgeStyle: 'bg-[#4338CA] text-indigo-100',
    paperTexture: 'felt',
    illustrationIcon: '✍️',
    spineStyle: 'bg-[#6366F1]',
    themeName: 'Papier Indigo Calligraphy'
  },
  'course-grade-calculator': {
    coverBg: 'bg-gradient-to-br from-[#334155] via-[#1E293B] to-[#475569] text-slate-100',
    coverBorder: 'border border-slate-400',
    typographyStyle: 'technical-mono',
    titleClass: 'font-mono text-white font-bold',
    subClass: 'font-mono text-slate-300 text-[8px]',
    accentRibbon: 'bg-slate-400',
    accessory: 'copper-clip',
    badgeStyle: 'bg-slate-700 text-slate-200',
    paperTexture: 'kraft',
    illustrationIcon: '📊',
    spineStyle: 'bg-slate-500',
    themeName: 'Hobonichi Slate Tech'
  },
  'assignment-log': {
    coverBg: 'bg-gradient-to-br from-[#831843] via-[#500724] to-[#9D174D] text-pink-100',
    coverBorder: 'border-2 border-[#FBCFE8]',
    typographyStyle: 'serif-editorial',
    titleClass: 'font-serif text-white font-bold',
    subClass: 'font-sans text-[#F9A8D4] text-[8px] tracking-widest',
    accentRibbon: 'bg-[#F43F5E]',
    accessory: 'ribbon-tag',
    badgeStyle: 'bg-[#BE123C] text-white',
    paperTexture: 'velvet',
    illustrationIcon: '📌',
    spineStyle: 'bg-[#E11D48]',
    themeName: 'Rifle Paper Crimson Rose'
  },
  'semester-overview-roadmap': {
    coverBg: 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-slate-50',
    coverBorder: 'border-2 border-[#38BDF8]',
    typographyStyle: 'bold-display',
    titleClass: 'font-sans text-white font-extrabold tracking-wide',
    subClass: 'font-sans text-[#7DD3FC] text-[8px]',
    accentRibbon: 'bg-[#0EA5E9]',
    accessory: 'corner-brass',
    badgeStyle: 'bg-[#0284C7] text-white',
    paperTexture: 'canvas',
    illustrationIcon: '🗺️',
    spineStyle: 'bg-[#0369A1]',
    themeName: 'Minimalist Steel Blue Roadmap'
  },

  // --- PRODUCTIVITY ---
  'daily-planner': {
    coverBg: 'bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] text-amber-950',
    coverBorder: 'border-2 border-[#D97706]',
    typographyStyle: 'serif-editorial',
    titleClass: 'font-serif text-[#78350F] font-black',
    subClass: 'font-sans text-[#92400E] text-[8px] font-bold uppercase',
    accentRibbon: 'bg-[#D97706]',
    accessory: 'leather-strap',
    badgeStyle: 'bg-[#B45309] text-amber-50',
    paperTexture: 'linen',
    illustrationIcon: '☀️',
    spineStyle: 'bg-[#F59E0B]',
    themeName: 'Terracotta Sunburst Daily'
  },
  'weekly-planner': {
    coverBg: 'bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] text-blue-950',
    coverBorder: 'border-2 border-[#2563EB]',
    typographyStyle: 'sans-minimal',
    titleClass: 'font-sans text-[#1E3A8A] font-extrabold tracking-tight',
    subClass: 'font-sans text-[#1D4ED8] text-[8px] font-bold',
    accentRibbon: 'bg-[#2563EB]',
    accessory: 'elastic-band',
    badgeStyle: 'bg-[#1D4ED8] text-white',
    paperTexture: 'linen',
    illustrationIcon: '📅',
    spineStyle: 'bg-[#3B82F6]',
    themeName: 'Hobonichi Modern Azure'
  },
  'time-blocking-planner': {
    coverBg: 'bg-gradient-to-br from-[#18181B] via-[#27272A] to-[#09090B] text-zinc-100',
    coverBorder: 'border-2 border-[#A1A1AA]',
    typographyStyle: 'technical-mono',
    titleClass: 'font-mono text-white font-extrabold tracking-wider',
    subClass: 'font-mono text-[#D4D4D8] text-[8px]',
    accentRibbon: 'bg-[#A1A1AA]',
    accessory: 'corner-brass',
    badgeStyle: 'bg-[#3F3F46] text-white',
    paperTexture: 'leather',
    illustrationIcon: '⏳',
    spineStyle: 'bg-[#52525B]',
    themeName: 'Moleskine Matte Charcoal Block'
  },
  'deep-focus-system': {
    coverBg: 'bg-gradient-to-br from-[#2E1065] via-[#4C1D95] to-[#5B21B6] text-purple-100',
    coverBorder: 'border-2 border-[#C084FC]',
    typographyStyle: 'serif-editorial',
    titleClass: 'font-serif text-[#F3E8FF] font-black',
    subClass: 'font-sans text-[#E9D5FF] text-[8px] font-bold uppercase',
    accentRibbon: 'bg-[#A855F7]',
    accessory: 'foil-stamp',
    badgeStyle: 'bg-[#7E22CE] text-white',
    paperTexture: 'velvet',
    illustrationIcon: '🔮',
    spineStyle: 'bg-[#9333EA]',
    themeName: 'Papier Celestial Deep Focus'
  },

  // --- HABITS & WELLNESS ---
  'habit-tracker-pro': {
    coverBg: 'bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0] text-emerald-950',
    coverBorder: 'border-2 border-[#16A34A]',
    typographyStyle: 'script-calligraphy',
    titleClass: 'font-serif italic text-[#14532D] font-bold',
    subClass: 'font-sans text-[#15803D] text-[8px] font-semibold',
    accentRibbon: 'bg-[#16A34A]',
    accessory: 'gold-clip',
    badgeStyle: 'bg-[#15803D] text-white',
    paperTexture: 'felt',
    illustrationIcon: '🌱',
    spineStyle: 'bg-[#22C55E]',
    themeName: 'Rifle Paper Botanical Sage'
  },
  'wellness-journal': {
    coverBg: 'bg-gradient-to-br from-[#FFF1F2] via-[#FFE4E6] to-[#FECDD3] text-rose-950',
    coverBorder: 'border-2 border-[#E11D48]',
    typographyStyle: 'serif-editorial',
    titleClass: 'font-serif text-[#881337] font-bold',
    subClass: 'font-sans text-[#9F1239] text-[8px] font-semibold',
    accentRibbon: 'bg-[#F43F5E]',
    accessory: 'wax-seal',
    badgeStyle: 'bg-[#E11D48] text-white',
    paperTexture: 'linen',
    illustrationIcon: '🌸',
    spineStyle: 'bg-[#FB7185]',
    themeName: 'Papier Blush Blossom'
  },

  // --- GOALS & LIFE ---
  'goal-setting-workbook': {
    coverBg: 'bg-gradient-to-br from-[#451A03] via-[#78350F] to-[#92400E] text-amber-100',
    coverBorder: 'border-2 border-[#FBBF24]',
    typographyStyle: 'bold-display',
    titleClass: 'font-serif text-[#FEF3C7] font-black tracking-tight',
    subClass: 'font-sans text-[#FDE68A] text-[8px] font-bold uppercase',
    accentRibbon: 'bg-[#F59E0B]',
    accessory: 'corner-brass',
    badgeStyle: 'bg-[#D97706] text-amber-950 font-bold',
    paperTexture: 'leather',
    illustrationIcon: '🏆',
    spineStyle: 'bg-[#B45309]',
    themeName: 'Moleskine Vintage Goal Blueprint'
  },
  '90-day-reset-planner': {
    coverBg: 'bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#075985] text-sky-50',
    coverBorder: 'border-2 border-[#7DD3FC]',
    typographyStyle: 'sans-minimal',
    titleClass: 'font-sans text-white font-extrabold tracking-tight',
    subClass: 'font-sans text-[#BAE6FD] text-[8px] font-bold',
    accentRibbon: 'bg-[#38BDF8]',
    accessory: 'elastic-band',
    badgeStyle: 'bg-[#0284C7] text-white',
    paperTexture: 'canvas',
    illustrationIcon: '⚡',
    spineStyle: 'bg-[#0284C7]',
    themeName: 'Leuchtturm Ocean Reset'
  },

  // --- CAREER ---
  'resume-optimizer-kit': {
    coverBg: 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-slate-100',
    coverBorder: 'border-2 border-[#D4AF37]',
    typographyStyle: 'serif-editorial',
    titleClass: 'font-serif text-[#F8FAFC] font-bold tracking-tight',
    subClass: 'font-sans text-[#D4AF37] text-[8px] font-semibold uppercase tracking-widest',
    accentRibbon: 'bg-[#D4AF37]',
    accessory: 'corner-brass',
    badgeStyle: 'bg-[#D4AF37] text-slate-950 font-bold',
    paperTexture: 'linen',
    illustrationIcon: '💼',
    spineStyle: 'bg-[#D4AF37]',
    themeName: 'Executive Gold Crest Career'
  },

  // --- FINANCE ---
  'budget-planner': {
    coverBg: 'bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#065F46] text-emerald-100',
    coverBorder: 'border-2 border-[#A7F3D0]',
    typographyStyle: 'technical-mono',
    titleClass: 'font-mono text-white font-bold tracking-wider',
    subClass: 'font-mono text-[#6EE7B7] text-[8px]',
    accentRibbon: 'bg-[#34D399]',
    accessory: 'copper-clip',
    badgeStyle: 'bg-[#059669] text-white',
    paperTexture: 'leather',
    illustrationIcon: '💰',
    spineStyle: 'bg-[#10B981]',
    themeName: 'Moleskine Emerald Ledger'
  },

  // --- CREATIVE ---
  'brain-dump-notebook': {
    coverBg: 'bg-gradient-to-br from-[#FAF5EE] via-[#FFFDF9] to-[#F5EFE6] text-stone-900',
    coverBorder: 'border-2 border-[#C87D55]',
    typographyStyle: 'handwritten',
    titleClass: 'font-serif italic text-stone-900 font-bold',
    subClass: 'font-sans text-stone-600 text-[8px] font-medium',
    accentRibbon: 'bg-[#C87D55]',
    accessory: 'gold-clip',
    badgeStyle: 'bg-[#C87D55] text-white',
    paperTexture: 'parchment',
    illustrationIcon: '💡',
    spineStyle: 'bg-[#D97706]',
    themeName: 'Papier Raw Kraft Ideas'
  }
};

// Fallback dynamic visual identity generator for remaining products to ensure all 57 have distinctive covers
export function getPlannerIdentity(slug: string, category: string, title: string): PlannerIdentity {
  if (plannerIdentities[slug]) {
    return plannerIdentities[slug];
  }

  // Deterministic seed generation based on slug string
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);

  const coverPalettes = [
    { bg: 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] text-white', border: 'border-2 border-[#D4AF37]', ribbon: 'bg-[#D4AF37]', spine: 'bg-[#D4AF37]', badge: 'bg-[#D4AF37] text-slate-950 font-bold', name: 'Gold Foil Midnight' },
    { bg: 'bg-gradient-to-br from-[#064E3B] via-[#022C22] to-[#065F46] text-emerald-50', border: 'border-2 border-[#6EE7B7]/60', ribbon: 'bg-[#34D399]', spine: 'bg-[#047857]', badge: 'bg-[#059669] text-white', name: 'Emerald Velvet' },
    { bg: 'bg-gradient-to-br from-[#7C2D12] via-[#451A03] to-[#9A3412] text-amber-50', border: 'border-2 border-[#FDE68A]', ribbon: 'bg-[#F59E0B]', spine: 'bg-[#D97706]', badge: 'bg-[#B45309] text-amber-100', name: 'Cognac Leather' },
    { bg: 'bg-gradient-to-br from-[#312E81] via-[#1E1B4B] to-[#4338CA] text-indigo-100', border: 'border-2 border-[#A5B4FC]', ribbon: 'bg-[#818CF8]', spine: 'bg-[#6366F1]', badge: 'bg-[#4338CA] text-white', name: 'Papier Royal Indigo' },
    { bg: 'bg-gradient-to-br from-[#831843] via-[#500724] to-[#9D174D] text-pink-100', border: 'border-2 border-[#FBCFE8]', ribbon: 'bg-[#F43F5E]', spine: 'bg-[#E11D48]', badge: 'bg-[#BE123C] text-white', name: 'Rifle Paper Rose' },
    { bg: 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-slate-50', border: 'border-2 border-[#38BDF8]', ribbon: 'bg-[#0EA5E9]', spine: 'bg-[#0369A1]', badge: 'bg-[#0284C7] text-white', name: 'Leuchtturm Steel Slate' },
    { bg: 'bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] text-amber-950', border: 'border-2 border-[#D97706]', ribbon: 'bg-[#D97706]', spine: 'bg-[#F59E0B]', badge: 'bg-[#B45309] text-amber-50', name: 'Terracotta Sunburst' },
    { bg: 'bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0] text-emerald-950', border: 'border-2 border-[#16A34A]', ribbon: 'bg-[#16A34A]', spine: 'bg-[#22C55E]', badge: 'bg-[#15803D] text-white', name: 'Mindful Sage Linen' },
  ];

  const palette = coverPalettes[seed % coverPalettes.length];
  const accessories: ('gold-clip' | 'elastic-band' | 'corner-brass' | 'leather-strap' | 'wax-seal' | 'copper-clip' | 'foil-stamp' | 'ribbon-tag')[] = ['gold-clip', 'elastic-band', 'corner-brass', 'leather-strap', 'wax-seal', 'copper-clip', 'foil-stamp'];
  const textures: ('linen' | 'leather' | 'felt' | 'kraft' | 'marble' | 'terrazzo' | 'canvas' | 'velvet')[] = ['linen', 'leather', 'felt', 'kraft', 'terrazzo', 'canvas', 'velvet'];
  const fontStyles = ['serif-editorial', 'script-calligraphy', 'sans-minimal', 'technical-mono', 'bold-display'];

  return {
    coverBg: palette.bg,
    coverBorder: palette.border,
    typographyStyle: fontStyles[seed % fontStyles.length],
    titleClass: 'font-serif font-bold text-current',
    subClass: 'font-sans text-xs opacity-80 uppercase tracking-widest',
    accentRibbon: palette.ribbon,
    accessory: accessories[seed % accessories.length],
    badgeStyle: palette.badge,
    paperTexture: textures[seed % textures.length],
    illustrationIcon: title.includes('Tracker') ? '📊' : title.includes('Planner') ? '🗓️' : title.includes('Journal') ? '📓' : '✨',
    spineStyle: palette.spine,
    themeName: `${palette.name} Special Edition`
  };
}
