export interface PersonalizationField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date';
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string;
  required?: boolean;
  section: string;
}

export interface ProductFormat {
  type: 'pdf' | 'docx' | 'csv' | 'printable';
  label: string;
}

export interface ProductReview {
  id: string;
  name: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  price: number;
  prices: Record<string, number>;
  dodoProductIds: Record<string, string>;
  originalPrice?: number;
  tagline: string;
  description: string;
  longDescription: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  sales: number;
  whatIncluded: string[];
  formats: ProductFormat[];
  personalization: PersonalizationField[];
  reviews: ProductReview[];
  featured?: boolean;
  badge?: string;
  previewType: 'planner' | 'workbook' | 'tracker' | 'journal' | 'guide';
  icon: string;
}

export const products: Product[] = [
  // ── STUDY PLANNER PRO ──
  {
    id: 'p1', slug: 'study-planner-pro', category: 'academic', price: 19.99, prices: { USD: 19.99, INR: 799 }, dodoProductIds: { USD: 'pdt_0NjnftTMCarA0cgDoHKjw', INR: 'pdt_0NkQ9JH6AU2Ui056Faj6j' }, previewType: 'planner', icon: '📅',
    title: 'Study Planner Pro', subtitle: 'Your complete academic command center', tagline: 'A personalized semester system with revision tracking, assignment planning, lecture notes, exam countdowns, study schedules, and analytics — all in one.',
    description: 'An all-in-one academic system that replaces 6 separate products. Study Planner Pro includes a semester overview, revision tracker, assignment planner, lecture note templates, exam countdown dashboard, study session log, and academic analytics.',
    longDescription: 'Study Planner Pro is a complete academic operating system. Enter your name, subjects, and exam dates once, and get a fully compiled planner with personalized weekly spreads, a revision tracker that monitors 3-pass topic coverage, an assignment breakdown engine, Cornell-style lecture note templates, a 30-day exam countdown, and an analytics dashboard that tracks your study velocity and readiness score.',
    tags: ['study', 'planner', 'semester', 'exam', 'revision', 'assignment', 'notes', 'analytics'], rating: 4.9, reviewCount: 342, sales: 5280, originalPrice: 29.99, featured: true, badge: 'Flagship System',
    whatIncluded: [
      'Personalized semester overview with your name, term, and subjects',
      '12-week weekly planner spreads with priority zones',
      '3-Pass revision tracker covering up to 8 subjects',
      'Assignment breakdown engine with milestone checklists',
      'Cornell-method lecture note templates with active recall cues',
      '30-day exam countdown dashboard with weak-topic matrix',
      'Daily study session log with time and subject tracking',
      'Study analytics dashboard with hours logged and readiness score',
      'Printable PDF (A4 + US Letter)',
      '30 days of free regenerations'
    ],
    formats: [{ type: 'pdf', label: 'PDF (A4 + US Letter)' }, { type: 'printable', label: 'Printable' }],
    personalization: [
      { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Alex Johnson', required: true, section: 'Personal Info' },
      { id: 'term', label: 'Semester / Term', type: 'text', placeholder: 'Fall 2026', defaultValue: 'Fall 2026', required: true, section: 'Personal Info' },
      { id: 'goal', label: 'This Term Goal', type: 'text', placeholder: 'Achieve a 3.8 GPA', section: 'Personal Info' }
    ],
    reviews: [
      { id: 'r1', name: 'Sarah M.', initials: 'SM', rating: 5, date: 'Jun 2026', text: 'This replaced 3 separate planners I was using. The revision tracker alone is worth the price.' },
      { id: 'r2', name: 'James K.', initials: 'JK', rating: 5, date: 'May 2026', text: 'Feels like a custom academic operating system. Every module connects to the next.' },
      { id: 'r3', name: 'David L.', initials: 'DL', rating: 5, date: 'Jun 2026', text: 'The exam countdown and weak-topic matrix helped me focus my final month.' }
    ]
  },

  // ── MASTER YOUR DAY ──
  {
    id: 'p7', slug: 'master-your-day', category: 'productivity', price: 14.99, prices: { USD: 14.99, INR: 599 }, dodoProductIds: { USD: 'pdt_0Njng9pf8kj31sXC9u20c', INR: 'pdt_0NkQ9VnrwhFK2Wnt9K114' }, previewType: 'planner', icon: '⚡',
    title: 'Master Your Day', subtitle: 'Your complete daily execution system with energy-aware planning',     tagline: 'A connected productivity system with weekly reset, energy-aware daily planning, priority engine, time audit, habit streaks, and anti-procrastination tools.',
    description: 'Master Your Day is a complete productivity system that connects your weekly reset to your daily command center to your evening reflection. With 11 connected pages including weekly reset, energy tracking, priority engine, time audit, habit streaks, and anti-procrastination tools — designed to be sustainable, not overwhelming.',
    longDescription: 'Master Your Day is not a collection of pages. It is a system. A daily ritual that takes less than 10 minutes, connects everything (weekly reset to daily command to evening reflection), adapts to your energy, never punishes you for missing days, and actually helps you DO the work. Features 11 connected tools: Weekly Reset, Daily Command Center, Evening Reflection, Priority Engine, Anti-Procrastination Dashboard, Energy & Mood Tracker, Time Audit, Brain Dump Processor, and Habit Streak Analytics.',
    tags: ['productivity', 'planning', 'time-blocking', 'deep-work', 'focus', 'habits', 'energy', 'goals'], rating: 4.9, reviewCount: 312, sales: 5680, originalPrice: 24.99, featured: true, badge: 'Flagship System',
    whatIncluded: [
      'Weekly Reset (7-step Sunday ritual with week rating, wins, challenges, priorities, and intentions)',
      'Daily Command Center (energy slider + mood selector + Big 3 prioritization + hourly schedule + notes)',
      'Evening Reflection (accomplished entries + distractions + focus score + mood comparison + sleep plan)',
      'Priority Engine (task scoring by impact, urgency, and energy fit with scoring guide and deferred tasks)',
      'Anti-Procrastination Dashboard (task breakdown + time estimates + reason tags + micro-action planning + commitment button)',
      'Energy & Mood Tracker (AM/PM mood comparison + energy slider + sleep quality + weekly trend + insight card)',
      'Time Audit (hour-by-hour log + category breakdown + ideal vs actual comparison + deep work trend)',
      'Brain Dump Processor (free-write zone + categorize into Tasks/Ideas/Worries/Later with action prompts)',
      'Habit Tracker & Streak Analytics (8 habits with 28-day chain grid + best/current streak + completion %)',
      'Interactive digital preview with auto-saving sliders, mood selectors, and checkboxes'
    ],
    formats: [{ type: 'pdf', label: 'PDF (A4 + US Letter)' }, { type: 'printable', label: 'Interactive Digital Planner' }],
    personalization: [
      { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Jamie Chen', required: true, section: 'Personal Info' },
      { id: 'goal', label: 'Your #1 Goal This Season', type: 'text', placeholder: 'Build a successful freelance business', section: 'Goal Setup' }
    ],
    reviews: [
      { id: 'r4', name: 'Marcus B.', initials: 'MB', rating: 5, date: 'Jul 2026', text: 'The Weekly Reset ritual changed my Sundays from anxiety to clarity. This system is incredible.' },
      { id: 'r5', name: 'Emma T.', initials: 'ET', rating: 5, date: 'Jun 2026', text: 'Having goal breakdown, energy tracking, and anti-procrastination in one system — I\'ve never been this consistent.' },
      { id: 'r6', name: 'Leo N.', initials: 'LN', rating: 5, date: 'May 2026', text: 'The Smart Goal Breakdown finally connects my big dreams to what I do today. This is what every planner should be.' }
    ]
  },

  // ── WELLNESS JOURNAL ──
  {
    id: 'p12', slug: 'wellness-journal', category: 'wellness', price: 9.99, prices: { USD: 9.99, INR: 399 }, dodoProductIds: { USD: 'pdt_0Njng19ufRxOW0jigjgl2', INR: 'pdt_0NkQ9ezkXY7TeAPXrJ2Dv' }, previewType: 'journal', icon: '🌿',
    title: 'Wellness Journal', subtitle: 'Habits, mood, gratitude, and self-care system', tagline: 'A daily wellness system combining habit tracking, mood logging, gratitude journaling, self-care routines, and monthly wellness planning.',
    description: 'Wellness Journal is your complete self-care system. Track daily habits, log mood patterns, practice gratitude, plan self-care routines, and review monthly wellness trends.',
    longDescription: 'Wellness Journal helps you build lasting wellness habits through structured daily and weekly practices. Track up to 6 daily habits with visual streak grids, log your mood and energy levels to identify patterns, write morning intentions and evening gratitudes, plan self-care routines, and review monthly wellness reports. All in one beautifully designed journal.',
    tags: ['wellness', 'habits', 'mood', 'gratitude', 'self-care', 'journal'], rating: 4.9, reviewCount: 198, sales: 3560, originalPrice: 14.99, featured: true, badge: 'Flagship System',
    whatIncluded: [
      'Habit tracker with monthly streak grid (up to 6 habits)',
      'Daily mood and energy level logger',
      'Morning intention setting pages',
      'Evening gratitude and reflection prompts',
      'Self-care routine planner and checklist',
      'Sleep quality and unwind log',
      'Weekly wellness check-in',
      'Monthly wellness review and trend analysis',
      'Printable PDF (A4 + US Letter)',
      '30 days of free regenerations'
    ],
    formats: [{ type: 'pdf', label: 'PDF (A4 + US Letter)' }, { type: 'printable', label: 'Printable' }],
    personalization: [
      { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Maya Rivera', required: true, section: 'Personal Info' },
      { id: 'wellnessFocus', label: 'Your Wellness Focus', type: 'text', placeholder: 'Build a consistent morning routine and stress habits', required: true, section: 'Wellness Setup' },
      { id: 'habits', label: 'Habits You Want to Track', type: 'textarea', placeholder: 'Meditate, Exercise, Read, Journal, No sugar, Sleep by 11pm', required: true, section: 'Habit Setup' }
    ],
    reviews: [
      { id: 'r7', name: 'Hannah P.', initials: 'HP', rating: 5, date: 'Jul 2026', text: 'The mood tracking revealed patterns I never noticed. My habits are finally sticking.' },
      { id: 'r8', name: 'Emma T.', initials: 'ET', rating: 5, date: 'Jun 2026', text: 'Morning intentions and evening gratitude in one journal — exactly what I needed.' },
      { id: 'r9', name: 'Chloe K.', initials: 'CK', rating: 4, date: 'May 2026', text: 'Beautiful design. The monthly wellness review is eye-opening.' }
    ]
  },

  // ── SOCIAL MEDIA DETOX ──
  {
    id: 'p10', slug: 'social-media-detox', category: 'goals', price: 0.5, prices: { USD: 0.5, INR: 15 }, dodoProductIds: { USD: 'pdt_0NjngaC7iuVS9esTr9tGY', INR: 'pdt_0NkQ9uAZEo8fkWfP1TdxI' }, previewType: 'workbook', icon: '📵',
    title: 'Social Media Detox', subtitle: 'Digital wellbeing, screen time tracking, and mindful tech use', tagline: 'Reclaim your time and attention with a structured digital detox system.',
    description: 'Social Media Detox is your complete digital wellbeing system. Audit your current usage, set meaningful boundaries, track daily screen time, log cravings, and reflect on the benefits of a healthier relationship with technology.',
    longDescription: 'Social Media Detox helps you break free from compulsive scrolling and rebuild your relationship with technology. Start with a digital audit to understand your baseline — screen time, unlocks, peak usage, and triggers. Design a personalized detox plan with boundaries, replacement activities, and daily screen time targets. Track each day with screen time logs, phone-free hours, and mood checks. Log cravings and triggering situations to understand your patterns. Review weekly progress, celebrate wins, and adjust your approach.',
    tags: ['digital wellbeing', 'screen time', 'detox', 'habits', 'mindfulness', 'focus'], rating: 4.7, reviewCount: 142, sales: 2100, originalPrice: 14.99, featured: true, badge: 'Trending',
    whatIncluded: [
      'Cover page with your detox commitment',
      'Digital audit — assess your baseline usage',
      'App usage deep dive — understand your patterns',
      'Notification audit — control the pings',
      'Detox goals & boundaries planner',
      'Phone-free morning ritual builder',
      'Bedtime wind-down routine',
      'Replacement activities catalog',
      'Daily screen time and phone-unlock tracker',
      'Cravings & triggers identification log',
      'Social Media Blackout Challenge',
      'Focus Zone Planner for deep work',
      'Weekly progress review with trend tracking',
      'Rewards & milestones celebration tracker',
      'Monthly digital wellness review',
      'Printable PDF (A4 + US Letter)',
      '30 days of free regenerations'
    ],
    formats: [{ type: 'pdf', label: 'PDF (A4 + US Letter)' }, { type: 'printable', label: 'Printable' }],
    personalization: [
      { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Alex Johnson', required: true, section: 'Personal Info' },
      { id: 'detoxGoal', label: 'Your Detox Goal', type: 'text', placeholder: 'Reduce screen time to 2 hrs/day', required: true, section: 'Detox Setup' },
      { id: 'topApp', label: 'App You Use Most', type: 'text', placeholder: 'Instagram', section: 'Usage' }
    ],
    reviews: [
      { id: 'r10', name: 'Jenna K.', initials: 'JK', rating: 5, date: 'Jul 2026', text: 'I had no idea I was spending 6 hours a day on social media. This planner helped me cut it to under an hour.' },
      { id: 'r11', name: 'David R.', initials: 'DR', rating: 5, date: 'Jun 2026', text: 'The cravings log is eye-opening. I finally understand why I reach for my phone.' },
      { id: 'r12', name: 'Maya L.', initials: 'ML', rating: 4, date: 'May 2026', text: 'I have read 4 books this month instead of scrolling. The replacement activity ideas are genius.' }
    ]
  }
];

export const categoryMeta: Record<string, { label: string; icon: string; description: string }> = {
  'academic': { label: 'Academic', icon: '📖', description: 'Complete semester and exam success system.' },
  'productivity': { label: 'Productivity', icon: '⚡', description: 'Daily planning and deep work execution system.' },
  'wellness': { label: 'Wellness', icon: '🌿', description: 'Habit tracking and self-care journal system.' },
  'goals': { label: 'Goals', icon: '🎯', description: 'Life, career, and finance planning system.' },
};
