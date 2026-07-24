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
    id: 'p1', slug: 'study-planner-pro', category: 'academic', price: 19.99, previewType: 'planner', icon: '📅',
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
      'Printable PDF (A4 + US Letter) and editable DOCX',
      '30 days of free regenerations'
    ],
    formats: [{ type: 'pdf', label: 'PDF (A4 + US Letter)' }, { type: 'printable', label: 'Printable' }, { type: 'docx', label: 'DOCX (Editable)' }],
    personalization: [
      { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Alex Johnson', required: true, section: 'Personal Info' },
      { id: 'term', label: 'Semester / Term', type: 'text', placeholder: 'Fall 2026', defaultValue: 'Fall 2026', required: true, section: 'Personal Info' },
      { id: 'subjects', label: 'Your Subjects', type: 'textarea', placeholder: 'Biology, Chemistry, Physics, Calculus', required: true, section: 'Course Setup' },
      { id: 'examDate', label: 'First Exam Date', type: 'date', required: true, section: 'Course Setup' },
      { id: 'goal', label: 'This Term Goal', type: 'text', placeholder: 'Achieve a 3.8 GPA', section: 'Personal Info' },
      { id: 'color', label: 'Accent Color', type: 'select', options: [{ label: 'Violet', value: 'violet' }, { label: 'Emerald', value: 'emerald' }, { label: 'Sky', value: 'sky' }], defaultValue: 'violet', section: 'Personal Info' }
    ],
    reviews: [
      { id: 'r1', name: 'Sarah M.', initials: 'SM', rating: 5, date: 'Jun 2026', text: 'This replaced 3 separate planners I was using. The revision tracker alone is worth the price.' },
      { id: 'r2', name: 'James K.', initials: 'JK', rating: 5, date: 'May 2026', text: 'Feels like a custom academic operating system. Every module connects to the next.' },
      { id: 'r3', name: 'David L.', initials: 'DL', rating: 5, date: 'Jun 2026', text: 'The exam countdown and weak-topic matrix helped me focus my final month.' }
    ]
  },

  // ── MASTER YOUR DAY ──
  {
    id: 'p7', slug: 'master-your-day', category: 'productivity', price: 0.01, previewType: 'planner', icon: '⚡',
    title: 'Master Your Day', subtitle: 'Daily planning, time blocking, and deep work system', tagline: 'A complete productivity system with daily and weekly planning, time blocking, deep work sessions, brain dump, and execution tracking.',
    description: 'Master Your Day combines daily planning, weekly planning, time blocking, deep work focus sessions, brain dump clearing, and productivity analytics into one seamless system.',
    longDescription: 'Master Your Day is your complete daily execution system. Plan your week with intentional priority-setting, block deep work sessions aligned to your energy peaks, clear mental clutter with structured brain dump pages, track daily output velocity, and review weekly wins. Every module is designed to eliminate context switching and build momentum.',
    tags: ['productivity', 'planning', 'time-blocking', 'deep-work', 'focus'], rating: 4.8, reviewCount: 256, sales: 4120, originalPrice: 14.99, featured: true, badge: 'Flagship System',
    whatIncluded: [
      'Weekly planning spread with priority matrix and goal setting',
      'Daily planner with hourly time-blocking grid (6 AM — 11 PM)',
      'Deep work session tracker with flow state logging',
      'Brain dump clearing pages for mental clutter',
      'Eisenhower priority matrix for task triage',
      'Time audit worksheet to find wasted hours',
      'Daily output velocity scorecard',
      'Weekly reflection and win review',
      'Printable PDF (A4 + US Letter) and editable DOCX',
      '30 days of free regenerations'
    ],
    formats: [{ type: 'pdf', label: 'PDF (A4 + US Letter)' }, { type: 'printable', label: 'Printable' }, { type: 'docx', label: 'DOCX (Editable)' }],
    personalization: [
      { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Jamie Chen', required: true, section: 'Personal Info' },
      { id: 'focusHours', label: 'Peak Focus Hours', type: 'text', placeholder: '8:00 AM — 12:00 PM', defaultValue: '8:00 AM — 12:00 PM', section: 'Preferences' },
      { id: 'topPriorities', label: 'Top 3 Weekly Priorities', type: 'text', placeholder: 'Finish project, Exercise 4x, Read 1 book', section: 'Goal Setup' },
      { id: 'color', label: 'Accent Color', type: 'select', options: [{ label: 'Amber', value: 'amber' }, { label: 'Indigo', value: 'indigo' }, { label: 'Emerald', value: 'emerald' }], defaultValue: 'amber', section: 'Preferences' }
    ],
    reviews: [
      { id: 'r4', name: 'Marcus B.', initials: 'MB', rating: 5, date: 'Jul 2026', text: 'The time-blocking grid transformed my chaotic weeks into structured execution.' },
      { id: 'r5', name: 'Emma T.', initials: 'ET', rating: 5, date: 'Jun 2026', text: 'Having deep work sessions and brain dump in one system eliminates all friction.' },
      { id: 'r6', name: 'Leo N.', initials: 'LN', rating: 4, date: 'May 2026', text: 'Clean, intentional design. The weekly reflection is my favorite part.' }
    ]
  },

  // ── WELLNESS JOURNAL ──
  {
    id: 'p12', slug: 'wellness-journal', category: 'wellness', price: 8.00, previewType: 'journal', icon: '🌿',
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
      'Printable PDF (A4 + US Letter) and editable DOCX',
      '30 days of free regenerations'
    ],
    formats: [{ type: 'pdf', label: 'PDF (A4 + US Letter)' }, { type: 'printable', label: 'Printable' }, { type: 'docx', label: 'DOCX (Editable)' }],
    personalization: [
      { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Maya Rivera', required: true, section: 'Personal Info' },
      { id: 'habits', label: 'Habits You Want to Track', type: 'textarea', placeholder: 'Meditate, Exercise, Read, Journal, No sugar, Sleep by 11pm', required: true, section: 'Habit Setup' },
      { id: 'morningRoutine', label: 'Morning Routine Goal', type: 'text', placeholder: 'Wake at 6:30, meditate 10 min, stretch', section: 'Routine Setup' }
    ],
    reviews: [
      { id: 'r7', name: 'Hannah P.', initials: 'HP', rating: 5, date: 'Jul 2026', text: 'The mood tracking revealed patterns I never noticed. My habits are finally sticking.' },
      { id: 'r8', name: 'Emma T.', initials: 'ET', rating: 5, date: 'Jun 2026', text: 'Morning intentions and evening gratitude in one journal — exactly what I needed.' },
      { id: 'r9', name: 'Chloe K.', initials: 'CK', rating: 4, date: 'May 2026', text: 'Beautiful design. The monthly wellness review is eye-opening.' }
    ]
  },

  // ── GOAL ROADMAP ──
  {
    id: 'p10', slug: 'goal-roadmap', category: 'goals', price: 12.00, previewType: 'workbook', icon: '🎯',
    title: 'Goal Roadmap', subtitle: 'Life goals, career planning, finance, and vision system', tagline: 'A complete life planning system combining goal setting, career roadmapping, finance planning, vision boarding, and long-term strategy.',
    description: 'Goal Roadmap is your complete life planning system. Set SMART goals, plan your career trajectory, manage your finances, create vision boards, and track long-term progress across every area of life.',
    longDescription: 'Goal Roadmap helps you design and execute the life you want. Start with a life vision board that captures your ideal future across health, wealth, career, relationships, and growth. Break down 1-year goals into 90-day execution sprints with weekly action steps. Map your career trajectory with skill acquisition roadmaps. Manage your finances with 50/30/20 budget allocation and savings trackers. Review quarterly progress and adjust your strategy.',
    tags: ['goals', 'career', 'finance', 'vision', 'planning', 'life'], rating: 4.8, reviewCount: 215, sales: 3890, originalPrice: 19.99, featured: true, badge: 'Flagship System',
    whatIncluded: [
      'Life vision board with 6-category framework',
      'SMART goal setting worksheet with milestone tracking',
      '90-day execution sprint planner (13-week breakdown)',
      'Career roadmap with skill acquisition tracker',
      '50/30/20 budget allocation worksheet',
      'Savings goal tracker and expense log',
      'Vision board collage pages',
      'Quarterly review and strategy adjustment',
      'Printable PDF (A4 + US Letter) and editable DOCX',
      '30 days of free regenerations'
    ],
    formats: [{ type: 'pdf', label: 'PDF (A4 + US Letter)' }, { type: 'printable', label: 'Printable' }, { type: 'docx', label: 'DOCX (Editable)' }],
    personalization: [
      { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Alex Johnson', required: true, section: 'Personal Info' },
      { id: 'primaryGoal', label: 'Your #1 Goal This Year', type: 'text', placeholder: 'Start my own business', required: true, section: 'Goal Setup' },
      { id: 'careerTarget', label: 'Target Career / Role', type: 'text', placeholder: 'Senior Product Manager', section: 'Career' },
      { id: 'monthlyIncome', label: 'Monthly Income (for budget)', type: 'number', placeholder: '5000', section: 'Finance' }
    ],
    reviews: [
      { id: 'r10', name: 'Alex M.', initials: 'AM', rating: 5, date: 'Jul 2026', text: 'The 90-day sprint framework is a game changer. I have accomplished more in 3 months than all last year.' },
      { id: 'r11', name: 'Sarah M.', initials: 'SM', rating: 5, date: 'Jun 2026', text: 'Having career goals and finance planning in one roadmap makes everything feel connected.' },
      { id: 'r12', name: 'Marcus B.', initials: 'MB', rating: 4, date: 'May 2026', text: 'The vision board pages are stunning. This replaced my separate career and budget planners.' }
    ]
  }
];

export const categoryMeta: Record<string, { label: string; icon: string; description: string }> = {
  'academic': { label: 'Academic', icon: '📖', description: 'Complete semester and exam success system.' },
  'productivity': { label: 'Productivity', icon: '⚡', description: 'Daily planning and deep work execution system.' },
  'wellness': { label: 'Wellness', icon: '🌿', description: 'Habit tracking and self-care journal system.' },
  'goals': { label: 'Goals', icon: '🎯', description: 'Life, career, and finance planning system.' },
};
