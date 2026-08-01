import type { PlannerConfig } from './types';

type PageType = 'cover' | 'weekly' | 'checklist' | 'calendar';

export const THEME_COLORS: Record<string, { bg: string; text: string; accent: string; light: string; border: string; from: string; to: string; gold: string; ribbon: string }> = {
  violet:   { bg: '#6d28d9', text: '#ede9fe', accent: '#a78bfa', light: '#ddd6fe', border: '#c4b5fd', from: '#7c3aed', to: '#5b21b6', gold: '#c084fc', ribbon: '#8b5cf6' },
  emerald:  { bg: '#059669', text: '#ecfdf5', accent: '#34d399', light: '#a7f3d0', border: '#6ee7b7', from: '#10b981', to: '#047857', gold: '#6ee7b7', ribbon: '#059669' },
  sky:      { bg: '#0284c7', text: '#f0f9ff', accent: '#38bdf8', light: '#bae6fd', border: '#7dd3fc', from: '#0ea5e9', to: '#0369a1', gold: '#7dd3fc', ribbon: '#0284c7' },
  rose:     { bg: '#e11d48', text: '#ffe4e6', accent: '#fb7185', light: '#fecdd3', border: '#fda4af', from: '#f43f5e', to: '#be123c', gold: '#fda4af', ribbon: '#e11d48' },
  amber:    { bg: '#d97706', text: '#fffbeb', accent: '#fbbf24', light: '#fde68a', border: '#fcd34d', from: '#f59e0b', to: '#b45309', gold: '#fcd34d', ribbon: '#d97706' },
  blue:     { bg: '#2563eb', text: '#eff6ff', accent: '#60a5fa', light: '#bfdbfe', border: '#93c5fd', from: '#3b82f6', to: '#1d4ed8', gold: '#93c5fd', ribbon: '#2563eb' },
  teal:     { bg: '#0d9488', text: '#f0fdfa', accent: '#2dd4bf', light: '#99f6e4', border: '#5eead4', from: '#14b8a6', to: '#0f766e', gold: '#5eead4', ribbon: '#0d9488' },
  orange:   { bg: '#ea580c', text: '#fff7ed', accent: '#fb923c', light: '#fed7aa', border: '#fdba74', from: '#f97316', to: '#c2410c', gold: '#fdba74', ribbon: '#ea580c' },
  stone:    { bg: '#57534e', text: '#f5f5f4', accent: '#a8a29e', light: '#e7e5e4', border: '#d6d3d1', from: '#78716c', to: '#44403c', gold: '#d6d3d1', ribbon: '#57534e' },
};

export function getTheme(value: string) {
  return THEME_COLORS[value] ?? THEME_COLORS.violet;
}

function esc(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

function buildCoverInnerHTML(data: {
  name: string; title: string; term: string; goal: string;
  subjects: string[]; examDisplay: string; countdownText: string;
  foil: string; accent: string; ivory: string; navy: string;
  compact: boolean;
}): string {
  const ink = '#1B2A41';
  const gold = data.foil || '#C4954A';
  const muted = '#6B7280';
  const s = data.compact;

  const titleWords = data.title.split(' ');
  const mainTitle = titleWords.slice(0, Math.min(2, titleWords.length)).join(' ');
  const subtitle = titleWords.length > 2 ? titleWords.slice(2).join(' ') : '';
  const titleParts = mainTitle.split(' ');
  const titleLine1 = titleParts[0] || '';
  const titleLine2 = titleParts.length > 1 ? titleParts.slice(1).join(' ') : '';

  function nf(full: string, comp: string): string { return s ? comp : full; }

  const nameHtml =
    '<div contenteditable="true" style="font-size:16px;font-weight:400;font-family:\'Playfair Display\',Outfit,serif;color:' + ink + ';letter-spacing:0.02em;height:22px;border-bottom:0.5px solid ' + gold + '40;line-height:22px;padding:0 4px;display:inline-block;min-width:180px;outline:none;transition:border-color 0.15s ease" data-pp-cover="name">' + data.name + '</div>';

  const yearHtml =
    '<div contenteditable="true" style="display:inline-block;outline:none;border-bottom:0.5px solid transparent;padding:0 2px;min-width:50px;transition:border-color 0.15s ease;text-align:center" data-pp-cover="year">' + (data.term || '\u2014') + '</div>';

  const focusHtml =
    '<div contenteditable="true" style="display:inline-block;outline:none;border-bottom:0.5px solid transparent;padding:0 2px;min-width:80px;transition:border-color 0.15s ease;text-align:center" data-pp-cover="preparingFor">' + (data.goal || '\u2014') + '</div>';

  return nf(
    // ── Full-size: luxury hardcover book cover ──
    '<div style="position:relative;min-height:540px;padding:48px;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
    // Publisher imprint — top-left, establishes authority
    '<div style="position:absolute;top:48px;left:48px;font-size:7px;font-weight:500;color:' + muted + ';letter-spacing:0.12em;text-transform:uppercase;font-family:Outfit,sans-serif;opacity:0.55">tooltails \u00b7 academic series</div>' +
    // Gold foil band — short thick top rule, like a book cloth spine band
    '<div style="position:absolute;top:80px;left:48px;width:90px;height:2px;background:' + gold + '"></div>' +
    // Hero title — commanding, centered, like a foil-stamped hardcover
    '<div style="text-align:center;margin-top:-10px">' +
      '<div style="font-size:34px;font-weight:900;letter-spacing:0.12em;line-height:1.05;font-family:\'Playfair Display\',Outfit,serif;text-transform:uppercase;color:' + ink + '">' + titleLine1 + '</div>' +
      (titleLine2 ? '<div style="font-size:34px;font-weight:900;letter-spacing:0.12em;line-height:1.05;font-family:\'Playfair Display\',Outfit,serif;text-transform:uppercase;color:' + ink + ';margin-top:2px">' + titleLine2 + '</div>' : '') +
      (subtitle ? '<div style="margin-top:8px;font-size:8px;font-weight:600;color:' + muted + ';letter-spacing:0.25em;text-transform:uppercase;font-family:Outfit,sans-serif">' + subtitle + '</div>' : '') +
    '</div>' +
    // Inspiring academic quote — like a front-flap endorsement
    '<div style="margin-top:28px;text-align:center;max-width:360px;margin-left:auto;margin-right:auto">' +
      '<div style="font-size:11px;font-weight:400;font-style:italic;color:' + muted + ';line-height:1.55;font-family:\'Playfair Display\',Outfit,serif">\u201CThe expert in anything was once a beginner.\u201D</div>' +
      '<div style="margin-top:5px;font-size:9px;font-weight:400;color:' + ink + ';font-style:italic;font-family:\'Playfair Display\',Outfit,serif;opacity:0.75">\u2014 Helen Hayes</div>' +
    '</div>' +
    // Gold ornament divider — centered, like a decorative chapter break
    '<div style="margin-top:28px;font-size:10px;color:' + gold + ';letter-spacing:0.3em">\u2726</div>' +
    // Subtitle — clarifies purpose
    '<div style="margin-top:22px;text-align:center">' +
      '<div style="font-size:10px;font-weight:500;color:' + muted + ';letter-spacing:0.08em;font-family:Outfit,sans-serif">A GUIDE TO ACADEMIC EXCELLENCE</div>' +
      '<div style="font-size:9px;font-weight:400;color:' + muted + ';letter-spacing:0.04em;font-family:Outfit,sans-serif;margin-top:2px;opacity:0.8">&amp; PURPOSEFUL STUDY</div>' +
    '</div>' +
    // Bookplate — ownership area, like an ex-libris plate
    '<div style="margin-top:38px;text-align:center">' +
      '<div style="font-size:7px;font-weight:400;font-style:italic;color:' + gold + ';letter-spacing:0.15em;font-family:Outfit,sans-serif;opacity:0.6">ex libris</div>' +
      '<div style="margin-top:8px">' + nameHtml + '</div>' +
      '<div style="margin-top:16px;display:flex;align-items:center;gap:12px;justify-content:center">' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          '<span style="font-size:7px;font-weight:500;color:' + gold + ';letter-spacing:0.08em;text-transform:uppercase;font-family:Outfit,sans-serif;opacity:0.7">Year</span>' +
          yearHtml +
        '</div>' +
        '<span style="color:' + gold + ';opacity:0.3;font-size:8px">\u25C9</span>' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          '<span style="font-size:7px;font-weight:500;color:' + gold + ';letter-spacing:0.08em;text-transform:uppercase;font-family:Outfit,sans-serif;opacity:0.7">Focus</span>' +
          focusHtml +
        '</div>' +
      '</div>' +
    '</div>' +
    // Bottom gold rule — closes the composition
    '<div style="position:absolute;bottom:48px;left:48px;right:48px;height:1px;background:' + gold + '25"></div>' +
    // Colophon — publication details, like a title page verso
    '<div style="position:absolute;bottom:54px;left:0;right:0;text-align:center;font-size:6px;font-weight:400;color:' + muted + ';letter-spacing:0.12em;text-transform:uppercase;opacity:0.4;font-family:Outfit,sans-serif">tooltails \u00b7 New York \u00b7 2026</div>' +
    '</div>',

    // ── Compact: stripped-down book cover for PDF thumbnails ──
    '<div style="position:relative;width:100%;min-height:360px;padding:24px;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
    '<div style="text-align:center">' +
      '<div style="font-size:20px;font-weight:900;letter-spacing:0.12em;line-height:1.1;font-family:\'Playfair Display\',Outfit,serif;text-transform:uppercase;color:' + ink + '">' + titleLine1 + (titleLine2 ? ' ' + titleLine2 : '') + '</div>' +
      (subtitle ? '<div style="margin-top:4px;font-size:7px;font-weight:600;color:' + muted + ';letter-spacing:0.22em;text-transform:uppercase">' + subtitle + '</div>' : '') +
    '</div>' +
    '<div style="margin-top:18px;text-align:center;max-width:200px">' +
      '<div style="font-size:9px;font-weight:400;font-style:italic;color:' + muted + ';line-height:1.4;font-family:\'Playfair Display\',Outfit,serif">\u201CThe expert in anything was once a beginner.\u201D</div>' +
    '</div>' +
    '<div style="margin-top:16px;text-align:center">' +
      '<div style="font-size:7px;font-weight:400;font-style:italic;color:' + gold + ';letter-spacing:0.12em;font-family:Outfit,sans-serif;opacity:0.5">ex libris</div>' +
      '<div style="margin-top:6px;font-size:13px;font-weight:400;font-family:\'Playfair Display\',Outfit,serif;color:' + ink + ';letter-spacing:0.02em">' + data.name + '</div>' +
      '<div style="margin-top:10px;font-size:8px;color:' + muted + '">' + (data.term || '\u2014') + (data.goal && data.term ? ' \u00b7 ' : '') + (data.goal || '') + '</div>' +
    '</div>' +
    '<div style="position:absolute;bottom:14px;left:0;right:0;text-align:center;font-size:4px;color:' + muted + ';letter-spacing:0.12em;opacity:0.3">tooltails \u00b7 New York \u00b7 2026</div>' +
    '</div>'
  );
}

export class PlannerPreviewRenderer {
  private container: HTMLElement;
  private config: PlannerConfig;
  private currentPage: PageType = 'cover';
  private navEl: HTMLElement | null = null;
  private pageEl: HTMLElement | null = null;
  private unsub: (() => void) | null = null;

  constructor(container: HTMLElement, config: PlannerConfig) {
    this.container = container;
    this.config = config;
  }

  mount(values: Record<string, string>, onStateChange: (fn: (latestValues: Record<string, string>) => void) => void): void {
    this.container.innerHTML = '';
    this.container.className = 'planner-preview-root';

    // Inject styles
    if (!document.getElementById('planner-preview-styles')) {
      const style = document.createElement('style');
      style.id = 'planner-preview-styles';
      style.textContent = this.getStyles();
      document.head.appendChild(style);
    }

    // Page navigation
    this.navEl = document.createElement('div');
    this.navEl.className = 'planner-preview-nav';
    this.navEl.innerHTML = this.renderNav();
    this.container.appendChild(this.navEl);

    // Page container
    this.pageEl = document.createElement('div');
    this.pageEl.className = 'planner-preview-page';
    this.container.appendChild(this.pageEl);

    // Render initial page
    this.renderPage(values);

    // Subscribe to state changes
    if (onStateChange) {
      onStateChange((latestValues) => {
        Object.assign(values, latestValues);
        this.renderPage(values);
      });
    }

    // Nav click handlers
    this.navEl.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-page]') as HTMLElement | null;
      if (btn) {
        this.currentPage = btn.dataset.page as PageType;
        this.renderPage(values);
        // Update nav active state
        this.navEl!.querySelectorAll('[data-page]').forEach(b => {
          b.classList.toggle('active', b.dataset.page === this.currentPage);
        });
      }
    });
  }

  private renderNav(): string {
    const pages: { id: PageType; label: string; icon: string }[] = [
      { id: 'cover', label: 'Cover', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
      { id: 'weekly', label: 'Weekly', icon: 'M8 2v4M16 2v4M3 10h18M3 14h18M3 18h18M3 6h18v14H3V6z' },
      { id: 'checklist', label: 'Checklist', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
      { id: 'calendar', label: 'Calendar', icon: 'M8 2v4M16 2v4M3 10h18M21 14V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h6' },
    ];
    return pages.map(p => `
      <button data-page="${p.id}" class="${p.id === this.currentPage ? 'active' : ''}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${p.icon}"/></svg>
        ${p.label}
      </button>
    `).join('');
  }

  private renderPage(values: Record<string, string>): void {
    if (!this.pageEl) return;
    const theme = getTheme(values['theme'] || values['color'] || '');
    switch (this.currentPage) {
      case 'cover':    this.pageEl.innerHTML = this.renderCover(values, theme); break;
      case 'weekly':   this.pageEl.innerHTML = this.renderWeekly(values, theme); break;
      case 'checklist': this.pageEl.innerHTML = this.renderChecklist(values, theme); break;
      case 'calendar': this.pageEl.innerHTML = this.renderCalendar(values, theme); break;
    }
  }

  public renderCover(values: Record<string, string>, theme: typeof THEME_COLORS[string]): string {
    const name = esc(values['name'] || 'Your Name');
    const title = esc(this.config.productTitle);
    const goal = esc(values['goal'] || values['vision'] || values['targetRole'] || values['currentRole'] || '');
    const term = esc(values['term'] || values['semester'] || '');

    const subjectsRaw = values['subjects'] || values['courses'] || '';
    const subjects = subjectsRaw.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);

    const examDateStr = values['examDate'] || '';
    let examDisplay = '';
    let countdownText = '';
    if (examDateStr) {
      try {
        const examDate = new Date(examDateStr + 'T00:00:00');
        if (!isNaN(examDate.getTime())) {
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          examDisplay = `${examDate.getDate()} ${months[examDate.getMonth()]} ${examDate.getFullYear()}`;
          const today = new Date();
          today.setHours(0,0,0,0);
          const diffTime = examDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) countdownText = `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
          else if (diffDays === 0) countdownText = 'Today';
          else countdownText = 'Passed';
        }
      } catch (e) {}
    }

    const inner = buildCoverInnerHTML({
      name, title, term, goal, subjects, examDisplay, countdownText,
      foil: theme.gold, accent: theme.accent, ivory: '#f5f0e8', navy: '#1a2035', compact: false,
    });

    return `<div class="pp-cover">${inner}</div>`;
  }

  public renderWeekly(values: Record<string, string>, theme: typeof THEME_COLORS[string]): string {
    const subjects = (values['subjects'] || values['courses'] || values['habits'] || 'Subject 1, Subject 2, Subject 3')
      .split('\n').filter(s => s.trim()).slice(0, 4);
    while (subjects.length < 3) subjects.push('Subject ' + (subjects.length + 1));

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const taskData = [
      { name: subjects[0], tasks: [true, true, false, false, false] },
      { name: subjects[1], tasks: [true, false, false, true, false] },
      { name: subjects[2], tasks: [false, true, true, false, true] },
    ];

    const studyHoursRaw = values['dailyTarget'] || values['sessionDuration'] || values['hours'] || '3';
    const studyHours = parseFloat(studyHoursRaw);
    const targetHoursNum = isNaN(studyHours) ? 3 : studyHours;
    const progress = Math.min(100, Math.round(Math.max(15, targetHoursNum * 12)));

    const bars = Array.from({ length: 7 }, (_, i) => {
      const factor = [0.85, 1.15, 0.55, 1.25, 0.95, 0.35, 0.15][i];
      return Math.min(100, Math.round(targetHoursNum * 15 * factor));
    });

    return `
      <div class="pp-weekly" style="--pp-accent:${theme.accent};--pp-from:${theme.from};--pp-gold:${theme.gold}">
        <div class="pp-weekly-header">
          <span class="pp-weekly-title">Weekly Overview</span>
          <span class="pp-weekly-date">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div class="pp-weekly-grid">
          ${weekDays.map((d, i) => {
            const barH = bars[i];
            return `<div class="pp-weekly-day-col">
              <span class="pp-weekly-day-label">${d}</span>
              <div class="pp-weekly-bar-wrap">
                <div class="pp-weekly-bar" style="height:${barH.toFixed(0)}%">
                  <div class="pp-weekly-bar-fill" style="height:${Math.max(8, (barH * 0.7)).toFixed(0)}%"></div>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="pp-weekly-subjects">
          ${taskData.map(subj => `
            <div class="pp-weekly-subject-row">
              <span class="pp-weekly-subject-name">${esc(subj.name)}</span>
              <div class="pp-weekly-check-group">
                ${subj.tasks.map(done => `
                  <span class="pp-weekly-check ${done ? 'done' : ''}" style="${done ? `background:${theme.from};border-color:${theme.from}` : ''}">
                    ${done ? '<svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="5"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                  </span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="pp-weekly-footer">
          <span class="pp-weekly-footer-label">Weekly Progress</span>
          <span class="pp-weekly-pct" style="color:${theme.from}">${progress}%</span>
        </div>
        <div class="pp-weekly-track">
          <div class="pp-weekly-track-fill" style="width:${progress}%"></div>
        </div>
      </div>
    `;
  }

  public renderChecklist(values: Record<string, string>, theme: typeof THEME_COLORS[string]): string {
    const source = values['subjects'] || values['courses'] || values['habits'] || values['focusAreas'] || '';
    const entries = source
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 4);
    while (entries.length < 4) entries.push(['Plan weekly focus', 'Review notes', 'Update calendar', 'Prepare next session'][entries.length]);

    const duration = values['sessionDuration'] || values['dailyTarget'] || values['hours'] || '45';
    const durationLabel = isNaN(Number(duration)) ? duration : `${duration} mins`;

    const checklist = entries.map((entry, i) => ({
      text: entry,
      meta: i === 1 ? durationLabel : ['Today', 'Focus Session', 'Priority', 'Review'][i],
      done: i < 2,
      color: i === 0 ? theme.from : i === 1 ? '#f59e0b' : i === 2 ? '#0ea5e9' : '#10b981',
    }));

    return `
      <div class="pp-checklist">
        <div class="pp-checklist-header">
          <div>
            <span class="pp-checklist-title">Daily Tasks</span>
            <p class="pp-checklist-sub">Today's priority list</p>
          </div>
          <span class="pp-checklist-badge" style="color:${theme.from};background:${theme.light}33">2/4</span>
        </div>
        <div class="pp-checklist-items">
          ${checklist.map(item => `
            <div class="pp-checklist-row ${item.done ? 'done' : ''}">
              <span class="pp-checklist-box" style="${item.done ? `background:${theme.from};border-color:${theme.from}` : `border-color:${item.color}55`}">
                ${item.done ? '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="5"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
              </span>
              <div class="pp-checklist-info">
                <span class="pp-checklist-text">${esc(item.text)}</span>
                <span class="pp-checklist-meta">${item.meta}</span>
              </div>
              <span class="pp-checklist-tag" style="background:${item.color}18;color:${item.color}">${item.done ? 'Done' : 'Open'}</span>
            </div>
          `).join('')}
        </div>
        <div class="pp-checklist-note">
          <span>Notes</span>
          <div></div>
        </div>
      </div>
    `;
  }

  public renderCalendar(values: Record<string, string>, theme: typeof THEME_COLORS[string]): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const studyHoursRaw = values['dailyTarget'] || values['sessionDuration'] || values['hours'] || '3';
    const studyHours = parseFloat(studyHoursRaw);
    const factor = isNaN(studyHours) ? 3 : Math.max(1, Math.min(6, Math.round(studyHours)));
    const streakDays = new Set<number>();
    for (let i = 1; i <= today; i++) {
      if ((i + Math.round(factor)) % 3 !== 0) {
        streakDays.add(i);
      }
    }

    const examDateStr = values['examDate'] || '';
    let examDayNumber = -1;
    if (examDateStr) {
      try {
        const ed = new Date(examDateStr + 'T00:00:00');
        if (ed.getFullYear() === year && ed.getMonth() === month) {
          examDayNumber = ed.getDate();
        }
      } catch (e) {}
    }

    let cells = '';
    for (let i = 0; i < firstDay; i++) cells += '<div class="pp-cal-void"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today;
      const isExam = d === examDayNumber;
      const hasStreak = streakDays.has(d);
      const filled = hasStreak || d === today || d === examDayNumber;

      cells += `
        <div class="pp-cal-cell ${isToday ? 'pp-cell-today' : ''} ${isExam ? 'pp-cell-exam' : ''}" style="${isToday ? `background:${theme.from};color:white;border-color:${theme.from};box-shadow:0 2px 8px ${theme.from}44` : isExam ? `background:#fef2f2;color:#991b1b;border:1.5px dashed #ef4444` : filled ? `border-color:${theme.from}30` : ''}">
          <span class="pp-cal-num">${d}</span>
          ${isExam ? '<span class="pp-cal-marker">TARGET</span>' : hasStreak && !isToday ? `<span class="pp-cal-pip" style="background:${theme.from}"></span>` : ''}
        </div>`;
    }

    return `
      <div class="pp-calendar" style="--pp-accent:${theme.from};--pp-gold:${theme.gold}">
        <div class="pp-cal-head">
          <span class="pp-cal-month">${monthName}</span>
          <span class="pp-cal-fire" style="color:${theme.from}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="${theme.from}"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            ${streakDays.size}-day streak
          </span>
        </div>
        <div class="pp-cal-grid">
          ${dayLabels.map(d => `<div class="pp-cal-label">${d}</div>`).join('')}
          ${cells}
        </div>
        <div class="pp-cal-ref">
          <span class="pp-cal-pip pp-cal-pip-sm" style="background:${theme.from}"></span>
          <span>Completed</span>
          <span class="pp-cal-pip pp-cal-pip-sm" style="background:#fef2f2;border:1px dashed #ef4444"></span>
          <span>Target date</span>
        </div>
      </div>
    `;
  }

  // PDF-optimized renderers (no CSS background patterns that break html2canvas)
  // ---------- Premium page helper ----------
  private pH(content: string): string {
    return `<div style="background:#faf7f2;min-height:100%">${content}</div>`;
  }
  private pw(content: string): string {
    return `<div style="width:100%;max-width:660px;margin:0 auto 24px;background:#fffcf5;border-radius:20px;box-shadow:0 2px 24px rgba(0,0,0,0.04),0 0 0 1px rgba(139,125,107,0.08);overflow:visible;font-family:Outfit,Inter,'Playfair Display',sans-serif;position:relative">
      ${content}
    </div>`;
  }
  private phd(title: string, ornament?: string): string {
    const orn = ornament || '✦';
    return `<div style="padding:28px 30px 14px;border-bottom:1px solid #ede4d8;display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:17px;font-weight:700;color:#2d2a27;letter-spacing:-0.01em;font-family:'Playfair Display',Outfit,serif">${title}</div>
      <span style="font-size:10px;color:#d4a85a;opacity:0.6;letter-spacing:0.15em;font-weight:400">${orn}</span>
    </div>`;
  }
  private pb(content: string): string {
    return `<div style="padding:20px 30px 30px">${content}</div>`;
  }
  private gbar(accent: string): string {
return `<div style="display:flex;align-items:center;gap:10px;margin:14px 0">
      <span style="flex:1;height:1px;background:linear-gradient(to right,transparent,${accent}44)"></span>
      <span style="width:5px;height:5px;border-radius:50%;background:${accent}66"></span>
      <span style="flex:1;height:1px;background:linear-gradient(to right,${accent}44,transparent)"></span>
    </div>`;
  }
  private ring(pct: number, size: number, color: string, label: string): string {
    const s = size; const r = (s - 8) / 2; const circ = 2 * Math.PI * r; const offset = circ * (1 - pct / 100);
    return `<div style="width:${s}px;height:${s}px;position:relative;flex-shrink:0">
      <svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" style="transform:rotate(-90deg)">
        <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="#ede4d8" stroke-width="3"/>
        <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <span style="font-size:${size < 60 ? '11' : '16'}px;font-weight:800;color:#1F2937">${pct}%</span>
        ${label ? `<span style="font-size:6px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-top:-1px">${label}</span>` : ''}
      </div>
    </div>`;
  }
  private tag(text: string, bg: string, fg: string): string {
    return `<span style="display:inline-block;padding:2px 10px;border-radius:6px;font-size:9px;font-weight:700;background:${bg};color:${fg}">${text}</span>`;
  }
  private dot(color: string): string {
    return `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0"></span>`;
  }

  public renderPDFCover(values: Record<string, string>, theme: typeof THEME_COLORS[string]): string {
    const name = esc(values['name'] || 'Your Name');
    const title = esc(this.config.productTitle);
    const goal = esc(values['goal'] || values['vision'] || values['targetRole'] || values['currentRole'] || '');
    const term = esc(values['term'] || values['semester'] || '');

    const subjectsRaw = values['subjects'] || values['courses'] || '';
    const subjects = subjectsRaw.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);

    const examDateStr = values['examDate'] || '';
    let examDisplay = '';
    let countdownText = '';
    if (examDateStr) {
      try {
        const examDate = new Date(examDateStr + 'T00:00:00');
        if (!isNaN(examDate.getTime())) {
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          examDisplay = `${examDate.getDate()} ${months[examDate.getMonth()]} ${examDate.getFullYear()}`;
          const today = new Date();
          today.setHours(0,0,0,0);
          const diffTime = examDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) countdownText = `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
          else if (diffDays === 0) countdownText = 'Today';
          else countdownText = 'Passed';
        }
      } catch (e) {}
    }

    const inner = buildCoverInnerHTML({
      name, title, term, goal, subjects, examDisplay, countdownText,
      foil: theme.gold, accent: theme.accent, ivory: '#f5f0e8', navy: '#1a2035', compact: true,
    });

    return `
      <div class="pdf-page" style="width:350px;min-height:400px;padding:20px;box-sizing:border-box;font-family:Outfit,Inter,sans-serif;background:#fcf9f2;border-radius:8px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
        ${inner}
      </div>
    `;
  }

  public renderPDFWeekly(values: Record<string, string>, theme: typeof THEME_COLORS[string]): string {
    const subjects = (values['subjects'] || values['courses'] || values['habits'] || 'Subject 1, Subject 2, Subject 3')
      .split('\n').filter(s => s.trim()).slice(0, 4);
    while (subjects.length < 3) subjects.push('Subject ' + (subjects.length + 1));

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const taskData = [
      { name: subjects[0], tasks: [true, true, false, false, false] },
      { name: subjects[1], tasks: [true, false, false, true, false] },
      { name: subjects[2], tasks: [false, true, true, false, true] },
    ];

    const studyHoursRaw = values['dailyTarget'] || values['sessionDuration'] || values['hours'] || '3';
    const studyHours = parseFloat(studyHoursRaw);
    const targetHoursNum = isNaN(studyHours) ? 3 : studyHours;
    const progress = Math.min(100, Math.round(Math.max(15, targetHoursNum * 12)));

    const bars = Array.from({ length: 7 }, (_, i) => {
      const factor = [0.85, 1.15, 0.55, 1.25, 0.95, 0.35, 0.15][i];
      return Math.min(100, Math.round(targetHoursNum * 15 * factor));
    });

    return `
      <div class="pdf-page" style="width:350px;min-height:400px;padding:24px 20px;box-sizing:border-box;font-family:Outfit,Inter,sans-serif;background:white;border-radius:12px;border:1px solid #ede4d8;box-shadow:0 2px 8px rgba(0,0,0,0.02)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e8e0d4">
          <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#1c1917">Weekly Overview</span>
          <span style="font-size:8px;font-weight:600;color:#4B5563;background:#f5f0ea;padding:3px 10px;border-radius:6px">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:16px;height:60px">
          ${weekDays.map((d, i) => {
            const barH = bars[i];
            return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
              <span style="font-size:6.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.03em">${d}</span>
              <div style="flex:1;width:100%;display:flex;align-items:flex-end">
                <div style="width:100%;border-radius:4px 4px 0 0;background:#f0eeeb;position:relative;min-height:4px;height:${barH.toFixed(0)}%">
                  <div style="position:absolute;bottom:0;left:0;right:0;border-radius:4px 4px 0 0;background:linear-gradient(to top,${theme.from},${theme.accent});height:${Math.max(8, (barH * 0.7)).toFixed(0)}%;min-height:1px"></div>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
          ${taskData.map(subj => `
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:9px;font-weight:600;color:#44403c;min-width:50px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(subj.name)}</span>
              <div style="display:flex;gap:5px">
${subj.tasks.map(done => `
                ${this.checkboxRow({ size: 13, themeColor: done ? theme.from : '#d6d3d1', checked: done, writingLine: false, label: '', padding: '0', gap: 0 })}
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.08em">Weekly Progress</span>
          <span style="font-size:9px;font-weight:800;color:${theme.from}">${progress}%</span>
        </div>
        <div style="height:4px;background:#f0eeeb;border-radius:4px;overflow:hidden">
          <div style="height:100%;border-radius:4px;background:linear-gradient(to right,${theme.from},${theme.accent});width:${progress}%"></div>
        </div>
      </div>
    `;
  }

  public renderPDFCalendar(values: Record<string, string>, theme: typeof THEME_COLORS[string]): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const studyHoursRaw = values['dailyTarget'] || values['sessionDuration'] || values['hours'] || '3';
    const studyHours = parseFloat(studyHoursRaw);
    const factor = isNaN(studyHours) ? 3 : Math.max(1, Math.min(6, Math.round(studyHours)));
    const streakDays = new Set<number>();
    for (let i = 1; i <= today; i++) {
      if ((i + Math.round(factor)) % 3 !== 0) streakDays.add(i);
    }

    const examDateStr = values['examDate'] || '';
    let examDayNumber = -1;
    if (examDateStr) {
      try {
        const ed = new Date(examDateStr + 'T00:00:00');
        if (ed.getFullYear() === year && ed.getMonth() === month) examDayNumber = ed.getDate();
      } catch (e) {}
    }

    let cells = '';
    for (let i = 0; i < firstDay; i++) cells += '<div style="aspect-ratio:1"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today;
      const isExam = d === examDayNumber;
      const hasStreak = streakDays.has(d);
      const filled = hasStreak || d === today || d === examDayNumber;

      cells += `
        <div style="aspect-ratio:1;border-radius:6px;border:1px solid ${isExam ? '#ef4444' : filled ? theme.from + '30' : '#ede4d8'};background:${isToday ? theme.from : isExam ? '#fef2f2' : filled ? 'transparent' : '#faf7f2'};color:${isToday ? 'white' : isExam ? '#991b1b' : '#44403c'};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;font-size:9px;font-weight:${isToday ? '800' : '600'};position:relative;${isToday ? `box-shadow:0 2px 8px ${theme.from}44` : ''}">
          <span>${d}</span>
          ${isExam ? '<span style="font-size:6px;font-weight:800;color:#991b1b;line-height:1;margin-top:1px">TARGET</span>' : hasStreak && !isToday ? `<span style="width:4px;height:4px;border-radius:50%;background:${theme.from};display:inline-block"></span>` : ''}
        </div>`;
    }

    return `
      <div class="pdf-page" style="width:350px;min-height:400px;padding:24px 20px;box-sizing:border-box;font-family:Outfit,Inter,sans-serif;background:white;border-radius:12px;border:1px solid #ede4d8;box-shadow:0 2px 8px rgba(0,0,0,0.02)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e8e0d4">
          <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#1c1917">${monthName}</span>
          <span style="font-size:9px;font-weight:700;display:flex;align-items:center;gap:3px;color:${theme.from}"><svg width="11" height="11" viewBox="0 0 24 24" fill="${theme.from}"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> ${streakDays.size}-day streak</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
          ${dayLabels.map(d => `<div style="font-size:7px;font-weight:700;color:#6B7280;text-align:center;padding:2px 0;text-transform:uppercase">${d}</div>`).join('')}
          ${cells}
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:10px;padding-top:8px;border-top:1px solid #e8e0d4;font-size:8px;font-weight:600;color:#6B7280">
          <span style="width:4px;height:4px;border-radius:50%;background:${theme.from};display:inline-block"></span>
          <span>Completed</span>
          <span style="width:4px;height:4px;border-radius:50%;background:#fef2f2;border:1px dashed #ef4444;display:inline-block"></span>
          <span>Target date</span>
        </div>
      </div>
    `;
  }

  public getStyles(): string {
    return `
      .planner-preview-root { display:flex;flex-direction:column;gap:12px; }
      .planner-preview-nav { display:flex;gap:4px;padding:4px;background:#ede4d8;border-radius:14px; }
      .planner-preview-nav button {
        flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
        padding:8px 10px;border-radius:10px;border:none;background:transparent;
        font-size:10px;font-weight:700;color:#4B5563;cursor:pointer;
        transition:all 0.15s;text-transform:uppercase;letter-spacing:0.05em;
      }
      .planner-preview-nav button:hover { background:#e7e5e4;color:#57534e; }
      .planner-preview-nav button.active { background:white;color:#2b2a28;box-shadow:0 2px 8px rgba(0,0,0,0.08); }
      .planner-preview-page {
        background:#f5f0ea;border-radius:16px;padding:14px;min-height:340px;
        border:1px solid #dcc7b7;box-shadow:inset 0 1px 6px rgba(0,0,0,0.05);
      }
      /* === COVER — Premium Classic === */
      .pp-cover {
        position:relative;border-radius:8px;overflow:hidden;min-height:310px;
        background:#fcf9f2;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 20px rgba(0,0,0,0.06);
      }
      /* === WEEKLY OVERVIEW === */
      .pp-weekly { background:white;border-radius:12px;padding:18px;min-height:310px;box-shadow:0 2px 8px rgba(0,0,0,0.02);border:1px solid #ede4d8; }
      .pp-weekly-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e8e0d4; }
      .pp-weekly-title { font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#1c1917; }
      .pp-weekly-date { font-size:8px;font-weight:600;color:#4B5563;background:#f5f0ea;padding:3px 10px;border-radius:6px; }
      .pp-weekly-grid { display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:16px;height:60px; }
      .pp-weekly-day-col { display:flex;flex-direction:column;align-items:center;gap:2px; }
      .pp-weekly-day-label { font-size:6.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.03em; }
      .pp-weekly-bar-wrap { flex:1;width:100%;display:flex;align-items:flex-end; }
      .pp-weekly-bar { width:100%;border-radius:4px 4px 0 0;background:#f0eeeb;position:relative;min-height:4px; }
      .pp-weekly-bar-fill { position:absolute;bottom:0;left:0;right:0;border-radius:4px 4px 0 0;transition:height 0.3s;background:linear-gradient(to top,var(--pp-from),var(--pp-accent)); }
      .pp-weekly-subjects { display:flex;flex-direction:column;gap:8px;margin-bottom:12px; }
      .pp-weekly-subject-row { display:flex;align-items:center;gap:10px; }
      .pp-weekly-subject-name { font-size:9px;font-weight:600;color:#44403c;min-width:50px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
      .pp-weekly-check-group { display:flex;gap:5px; }
      .pp-weekly-check {
        width:13px;height:13px;border-radius:3px;border:1.5px solid #d6d3d1;
        display:flex;align-items:center;justify-content:center;flex-shrink:0;
      }
      .pp-weekly-check.done { border-color:var(--pp-accent);background:var(--pp-accent); }
      .pp-weekly-footer { display:flex;justify-content:space-between;align-items:center;margin-bottom:6px; }
.pp-weekly-footer-label { font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.08em; }
      .pp-weekly-pct { font-size:9px;font-weight:800; }
      .pp-weekly-track { height:4px;background:#f0eeeb;border-radius:4px;overflow:hidden; }
      .pp-weekly-track-fill { height:100%;border-radius:4px;transition:width 0.4s;background:linear-gradient(to right,var(--pp-from),var(--pp-accent)); }
      /* === WEEKLY GRID CELL (Assignment Planning) === */
      .wg-cell { cursor:pointer;user-select:none;transition:background 0.2s,border-color 0.2s,transform 0.15s; }
      .wg-cell:hover { background:#f0edf9 !important;border-color:#c4b5fd !important;transform:scale(1.08); }
      .wg-cell:focus-visible { outline:2px solid #2563eb;outline-offset:1px;border-color:#2563eb; }
      .wg-cell.wg-checked { background:#2563eb !important;border-color:#2563eb !important; }
      .wg-cell.wg-toggle { animation:wg-pop 0.25s ease; }
      @keyframes wg-pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
      /* === CHECKLIST (Daily Tasks) === */
      .pp-checklist { background:white;border-radius:12px;padding:18px;min-height:310px;box-shadow:0 2px 8px rgba(0,0,0,0.02);border:1px solid #ede4d8; }
      .pp-checklist-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e8e0d4; }
      .pp-checklist-title { font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#1c1917; }
      .pp-checklist-sub { margin:2px 0 0;font-size:9px;font-weight:500;color:#4B5563; }
      .pp-checklist-badge { font-size:8px;font-weight:800;border-radius:999px;padding:4px 8px; }
      .pp-checklist-items { display:flex;flex-direction:column;gap:8px; }
      .pp-checklist-row { display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #ede4d8;border-radius:8px;background:#faf7f2; }
      .pp-checklist-row.done { background:white; }
      .pp-checklist-box { width:16px;height:16px;border:1.5px solid #d6d3d1;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
      .pp-checklist-info { min-width:0;flex:1;display:flex;flex-direction:column;gap:1px; }
      .pp-checklist-text { font-size:9px;font-weight:700;color:#1c1917;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
      .pp-checklist-row.done .pp-checklist-text { color:#78716c;text-decoration:line-through; }
      .pp-checklist-meta { font-size:8px;color:#6B7280;font-weight:500; }
      .pp-checklist-tag { font-size:7px;font-weight:800;border-radius:999px;padding:2px 6px;text-transform:uppercase; }
      .pp-checklist-note { margin-top:12px;padding:8px 10px;border:1px dashed #ddd6d0;border-radius:8px;background:#fffaf3; }
      .pp-checklist-note span { display:block;margin-bottom:4px;font-size:8px;font-weight:800;color:#4B5563;text-transform:uppercase;letter-spacing:0.08em; }
      .pp-checklist-note div { height:1px;background:#eadfd3;margin-top:6px; }
      /* === CALENDAR === */
      .pp-calendar { background:white;border-radius:12px;padding:18px;min-height:310px;box-shadow:0 2px 8px rgba(0,0,0,0.02);border:1px solid #ede4d8; }
      .pp-cal-head { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e8e0d4; }
      .pp-cal-month { font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#1c1917; }
      .pp-cal-fire { font-size:9px;font-weight:700;display:flex;align-items:center;gap:3px; }
      .pp-cal-grid { display:grid;grid-template-columns:repeat(7,1fr);gap:4px; }
      .pp-cal-label { font-size:7px;font-weight:700;color:#6B7280;text-align:center;padding:2px 0;text-transform:uppercase; }
      .pp-cal-cell {
        aspect-ratio:1;border-radius:6px;border:1px solid #ede4d8;background:#faf7f2;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
        font-size:9px;font-weight:600;color:#44403c;position:relative;transition:all 0.12s;
      }
      .pp-cell-today { font-weight:800; }
      .pp-cal-num { line-height:1; }
      .pp-cal-marker { font-size:6px;font-weight:800;color:#991b1b;line-height:1;margin-top:1px; }
      .pp-cal-pip { width:4px;height:4px;border-radius:50%;display:inline-block; }
      .pp-cal-pip-sm { width:3px;height:3px; }
      .pp-cal-void { aspect-ratio:1; }
      .pp-cal-ref { display:flex;align-items:center;gap:6px;margin-top:10px;padding-top:8px;border-top:1px solid #e8e0d4;font-size:7px;font-weight:600;color:#4B5563; }
    `;
  }

  destroy(): void {
    const style = document.getElementById('planner-preview-styles');
    if (style) style.remove();
    this.container.innerHTML = '';
  }
}

export class FullPlannerPreview {
  private values: Record<string, string>;
  private theme: typeof THEME_COLORS[string];
  private title: string;
  private icon: string;

  constructor(values: Record<string, string>, theme: typeof THEME_COLORS[string], title?: string, icon?: string) {
    this.values = values;
    this.theme = theme;
    this.title = title || 'Study Planner';
    this.icon = icon || '📚';
  }

  getPageList(): Array<{ id: string; title: string; html: string }> {
    const subjects = this.subjectList();
    const subjectPages = subjects.map((s, i) => ({
      id: `subject-planner-${i}`,
      title: `${esc(s)} Planner`,
      html: this.renderSubjectPlanner(i),
    }));
    return [
      { id: 'cover', title: 'Cover Page', html: this.renderCover() },
      { id: 'goal-setting', title: 'Goal Roadmap', html: this.renderGoalSetting() },
      { id: 'semester-overview', title: 'Semester Timeline', html: this.renderSemesterOverview() },
      { id: 'assignment-tracker', title: 'Assignment Board', html: this.renderAssignmentTracker() },
      { id: 'assignment-dashboard', title: 'Assignment Dashboard', html: this.renderAssignmentDashboard() },
      { id: 'assignment-log', title: 'Assignment Log', html: this.renderAssignmentLog() },
      { id: 'assignment-planning', title: 'Assignment Planning', html: this.renderAssignmentPlanning() },
      { id: 'exam-countdown', title: 'Exam Readiness', html: this.renderExamCountdown() },
      ...subjectPages,
      { id: 'revision-tracker', title: 'Revision Matrix', html: this.renderRevisionTracker() },
      { id: 'study-log', title: 'Study Timeline', html: this.renderStudyLog() },
      { id: 'attendance', title: 'Attendance Heatmap', html: this.renderAttendance() },
      { id: 'study-heatmap', title: 'Study Heatmap', html: this.renderStudyHeatmap() },
      { id: 'weekly-focus', title: 'Weekly Focus Board', html: this.renderWeeklyFocusBoard() },
      { id: 'weekly-planner-1', title: 'Weekly Spread', html: this.renderWeeklyPlanner(0) },
      { id: 'weekly-planner-2', title: 'Weekly Spread II', html: this.renderWeeklyPlanner(1) },
      { id: 'daily-planner', title: 'Daily Layout', html: this.renderDailyPlanner() },
      { id: 'habit-tracker', title: 'Habit Grid', html: this.renderHabitTracker() },
      { id: 'exam-strategy', title: 'Exam Strategy', html: this.renderExamStrategy() },
      { id: 'monthly-review', title: 'Monthly Review', html: this.renderMonthlyReview() },
      { id: 'reflection', title: 'Reflection Journal', html: this.renderReflection() },
      { id: 'achievements', title: 'Achievement Dashboard', html: this.renderAchievementDashboard() },
    ];
  }

  getPageCount(): number { return this.getPageList().length; }

  private p(style: string, content: string): string {
    return `<div style="${style}">${content}</div>`;
  }

  private accentH(color: string): string {
    return `<span style="display:block;height:3px;border-radius:2px;background:${color};margin:0 0 10px"></span>`;
  }

  private pageWrap(content: string): string {
    return `<div style="width:100%;max-width:800px;margin:0 auto;background:#fffcf5;border-radius:20px;box-shadow:0 2px 24px rgba(0,0,0,0.04),0 0 0 1px rgba(139,125,107,0.08);overflow:visible;font-family:Outfit,Inter,sans-serif;position:relative;color:#374151">
      ${content}
    </div>`;
  }

  private pageHeader(title: string, subtitle?: string): string {
    return `<div style="padding:20px 24px 10px;border-bottom:1px solid #ede4d8;display:flex;align-items:flex-start;justify-content:space-between">
      <div>
        <div style="font-size:16px;font-weight:700;color:#1F2937;letter-spacing:-0.01em;font-family:'Playfair Display',Outfit,serif">${title}</div>
        ${subtitle ? `<div style="font-size:9px;color:#4B5563;font-weight:500;margin-top:2px;font-style:italic">${subtitle}</div>` : ''}
      </div>
      ${subtitle ? `<div style="font-size:8px;color:#4B5563;background:#f5f0ea;padding:3px 10px;border-radius:20px;font-weight:600;white-space:nowrap;flex-shrink:0;margin-top:2px">${subtitle}</div>` : ''}
    </div>`;
  }

private pageBody(content: string): string {
    return `<div style="padding:14px 24px 20px">${content}</div>`;
  }

  private ring(pct: number, size: number, color: string, label: string): string {
    const s = size; const r = (s - 8) / 2; const circ = 2 * Math.PI * r; const offset = circ * (1 - pct / 100);
    return `<div style="width:${s}px;height:${s}px;position:relative;flex-shrink:0">
      <svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" style="transform:rotate(-90deg)">
        <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="#ede4d8" stroke-width="3"/>
        <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <span style="font-size:${size < 60 ? '11' : '16'}px;font-weight:800;color:#1F2937">${pct}%</span>
        ${label ? `<span style="font-size:6px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-top:-1px">${label}</span>` : ''}
      </div>
    </div>`;
  }
  private tag(text: string, bg: string, fg: string): string {
    return `<span style="display:inline-block;padding:2px 10px;border-radius:6px;font-size:9px;font-weight:700;background:${bg};color:${fg}">${text}</span>`;
  }
  private dot(color: string): string {
    return `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0"></span>`;
  }
  private sectionDivider(color: string): string {
    return `<div style="display:flex;align-items:center;gap:8px;margin:16px 0 10px"><span style="flex:1;height:1px;background:linear-gradient(to right,transparent,${color}44)"></span><span style="width:4px;height:4px;border-radius:50%;background:${color}55"></span><span style="flex:1;height:1px;background:linear-gradient(to right,${color}44,transparent)"></span></div>`;
  }

  private circleGroup(opts: {
    groupKey: string;
    count: number;
    size?: number;
    colors: string[];
    selected?: number;
    gap?: number;
    labels?: string[];
  }): string {
    const size = opts.size ?? 10;
    const gap = opts.gap ?? 4;
    const selected = opts.selected ?? -1;
    const labelsJson = opts.labels ? JSON.stringify(opts.labels) : '';
    const labelsAttr = labelsJson ? ' data-circle-labels=\'' + labelsJson + '\'' : '';
    const currentLabel = selected >= 0 && opts.labels ? esc(opts.labels[selected] || '') : '';
    const labelHtml = opts.labels ? '<span class="circle-group-label" style="font-size:8px;font-weight:500;color:#6B7280;margin-left:2px">' + currentLabel + '</span>' : '';
    let html = '<span style="display:inline-flex;gap:' + gap + 'px;align-items:center" data-circle-group="' + opts.groupKey + '"' + labelsAttr + '>';
    for (let i = 0; i < opts.count; i++) {
      const color = opts.colors[i] || '#e0d8cc';
      const isFilled = i <= selected;
      html += '<span class="pp-circle" data-circle-val="' + i + '" data-circle-color="' + color + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;border:1.5px solid ' + color + ';background:' + (isFilled ? color : 'transparent') + ';cursor:pointer;display:inline-block;flex-shrink:0;transition:background 0.15s"></span>';
    }
    html += '</span>' + labelHtml;
    return html;
  }

  private progressTrack(opts: {
    groupKey: string;
    height?: number;
    trackColor?: string;
    fixedColor?: string;
    rounded?: number;
    width?: string;
  }): string {
    const h = opts.height ?? 4;
    const tc = opts.trackColor ?? '#ede4d8';
    const fc = opts.fixedColor || '';
    const r = opts.rounded ?? 2;
    const w = opts.width || 'flex:1';
    return '<div style="' + w + ';height:' + h + 'px;background:' + tc + ';border-radius:' + r + 'px;position:relative;overflow:hidden" data-progress-track="' + opts.groupKey + '">' +
      '<div data-progress-fill="' + opts.groupKey + '" style="position:absolute;top:0;left:0;height:100%;width:0%;' +
      (fc ? 'background:' + fc : 'background:#ef4444') + ';border-radius:' + r + 'px;transition:width 0.35s ease,background 0.35s ease"' +
      (fc ? ' data-progress-fixedcolor="' + fc + '"' : '') + '></div>' +
    '</div>';
  }

  private checkboxRow(opts: {
    size?: number;
    borderColor?: string;
    checked?: boolean;
    checkColor?: string;
    gap?: number;
    padding?: string;
    label?: string;
    labelSize?: number;
    labelColor?: string;
    writingLine?: boolean;
    borderBottom?: boolean;
  } = {}): string {
    const size = opts.size ?? 16;
    const borderColor = opts.borderColor ?? '#d4c9bc';
    const checked = opts.checked ?? false;
    const checkColor = opts.checkColor ?? '#10b981';
    const gap = opts.gap ?? 10;
    const padding = opts.padding ?? '8px 0';
    const label = opts.label ?? '';
    const labelSize = opts.labelSize ?? 9;
    const labelColor = opts.labelColor ?? '#6B7280';
    const writingLine = opts.writingLine ?? true;
    const borderBottom = opts.borderBottom ?? true;

    const radius = size <= 10 ? 2 : size <= 14 ? 3 : 4;
    const innerSize = Math.max(size - 6, 4);

    const checkSvg = checked ? `<svg width="${innerSize}" height="${innerSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : '';
    const bg = checked ? checkColor : 'transparent';
    const bColor = checked ? checkColor : borderColor;

    const wlStyle = writingLine
      ? `flex:1;height:${size}px;border-bottom:${borderBottom ? '1.5px' : '0'} solid #d4c9bc`
      : '';

    const labelStyle = label
      ? `height:${size}px;border-bottom:${borderBottom ? '1.5px' : '0'} solid #d4c9bc;font-size:${labelSize}px;font-weight:600;color:${labelColor};padding:0 2px;line-height:${size}px;display:inline-flex;align-items:center;flex-shrink:0`
      : '';

    const rowBorder = borderBottom ? 'border-bottom:1.5px solid #d4c9bc' : '';

    return `<div style="display:flex;align-items:center;gap:${gap}px;padding:${padding};${rowBorder}">
      <span class="pp-cb" style="width:${size}px;height:${size}px;border-radius:${radius}px;border:1.5px solid ${bColor};background:${bg};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${checkSvg}</span>
      ${writingLine ? `<span style="${wlStyle}"></span>` : ''}
      ${label ? `<span style="${labelStyle}">${label}</span>` : ''}
    </div>`;
  }

private subjectList(): string[] {
    const raw = this.values['subjects'] || this.values['courses'] || this.values['habits'] || '';
    const items = raw.split('\n').map(s => s.trim()).filter(Boolean);
    if (items.length === 0) return ['My Subject 1', 'My Subject 2', 'My Subject 3', 'My Subject 4'];
    return items;
  }

  private renderCover(): string {
    const t = this.theme;
    const name = esc(this.values['name'] || 'Your Name');
    const title = esc(this.title);
    const goal = esc(this.values['goal'] || this.values['vision'] || this.values['targetRole'] || this.values['currentRole'] || '');
    const term = esc(this.values['term'] || this.values['semester'] || '');

    const subjectsRaw = this.values['subjects'] || this.values['courses'] || '';
    const subjects = subjectsRaw.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);

    const examDateStr = this.values['examDate'] || '';
    let examDisplay = '';
    let countdownText = '';
    if (examDateStr) {
      try {
        const examDate = new Date(examDateStr + 'T00:00:00');
        if (!isNaN(examDate.getTime())) {
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          examDisplay = `${examDate.getDate()} ${months[examDate.getMonth()]} ${examDate.getFullYear()}`;
          const today = new Date();
          today.setHours(0,0,0,0);
          const diffTime = examDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) countdownText = `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
          else if (diffDays === 0) countdownText = 'Today';
          else countdownText = 'Passed';
        }
      } catch (e) {}
    }

    const inner = buildCoverInnerHTML({
      name, title, term, goal, subjects, examDisplay, countdownText,
      foil: t.gold, accent: t.accent, ivory: '#f5f0e8', navy: '#1a2035', compact: false,
    });

    return this.pageWrap(
      `<div style="padding:0;min-height:540px;position:relative;overflow:hidden;border-radius:0">${inner}</div>`
    );
  }

  private renderGoalSetting(): string {
    const t = this.theme;
    const goal = this.values['goal'] || this.values['vision'] || this.values['targetRole'] || '';
    return this.pageWrap(
      this.pageHeader('Goal Roadmap', '') +
      this.pageBody(
        `<div style="display:flex;gap:16px;margin:0 0 14px;align-items:center">
          <div style="flex:1">
            <div style="font-size:9px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">My Primary Goal</div>
            <div style="font-size:14px;font-weight:500;color:#2d2a27;line-height:1.5;font-family:'Playfair Display',Outfit,serif;background:#faf7f2;padding:10px 14px;border-radius:6px;border:1px solid #ede4d8;min-height:40px">
              <span style="height:18px;border-bottom:1.5px solid #d4c9bc;font-weight:500;padding:0;line-height:18px;display:inline-block;min-width:200px">___</span>
            </div>
          </div>
        </div>
        <div style="font-size:12px;font-weight:700;color:#1F2937;margin-bottom:8px;font-family:'Playfair Display',Outfit,serif">Why This Goal Matters</div>
        <div style="background:#faf7f2;border-radius:6px;padding:0 0 0 12px;border:1px solid #ede4d8">
          <div style="height:22px;border-bottom:1.5px solid #d4c9bc;margin:0 0 0 0"></div>
          <div style="height:22px;border-bottom:1.5px solid #d4c9bc"></div>
          <div style="height:22px"></div>
        </div>
        <div style="margin-top:14px;font-size:12px;font-weight:700;color:#1F2937;margin-bottom:8px;font-family:'Playfair Display',Outfit,serif">My Milestones</div>
        <div style="background:#faf7f2;border-radius:8px;padding:2px 12px;border:1px solid #ede4d8">
          ${this.checkboxRow({ size: 16, borderColor: '#d4c9bc', themeColor: t.from, label: 'Week', writingLine: true })}
          ${this.checkboxRow({ size: 16, borderColor: '#d4c9bc', label: 'Week', writingLine: true })}
          ${this.checkboxRow({ size: 16, borderColor: '#d4c9bc', label: 'Week', writingLine: true })}
          ${this.checkboxRow({ size: 16, borderColor: '#d4c9bc', label: 'Week', writingLine: true })}
          ${this.checkboxRow({ size: 16, borderColor: '#d4c9bc', label: 'Week', writingLine: true, borderBottom: 'none', padding: '8px 0 0' })}
        </div>
        <div style="margin-top:8px;font-size:12px;font-weight:700;color:#1F2937;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">Weekly Action Plan</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">This Week's Focus</div>
            <div style="height:22px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
            <div style="height:22px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Biggest Challenge</div>
            <div style="height:22px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
            <div style="height:22px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
        </div>
         <div style="margin-top:10px">
           <div style="background:#faf7f2;border-radius:10px;padding:20px 22px;border:1px solid #e0d6c8;box-shadow:0 2px 6px rgba(0,0,0,0.03)">
             <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
               <div style="width:22px;height:22px;border-radius:5px;background:${t.from};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
               </div>
               <div style="font-size:11px;font-weight:800;color:#1F2937;text-transform:uppercase;letter-spacing:0.08em">Exam Status</div>
               <div style="flex:1;height:1px;background:linear-gradient(to right,#e0d6c8,transparent)"></div>
             </div>
               <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 24px">
                <div>
                  <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Days Until Exam</div>
                  <div style="display:flex;align-items:center;gap:4px">
                    <span style="height:18px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;padding:0 3px;line-height:18px;display:inline-block;min-width:28px;text-align:center" data-er="days-until">___</span>
                    <span style="font-size:8px;color:#6B7280;font-weight:500">days</span>
                  </div>
                </div>
                <div>
                  <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Confidence</div>
                  <div style="display:flex;align-items:center;gap:6px">
                    <span style="font-size:7px;color:#9CA3AF;font-weight:500;min-width:7px;text-align:center;flex-shrink:0">1</span>
                    <input type="range" min="1" max="10" value="5" step="1" data-er-range="confidence" aria-label="Confidence level (1-10)" style="flex:1;height:5px;-webkit-appearance:none;appearance:none;background:#ede4d8;border-radius:3px;outline:none;cursor:pointer;margin:0;padding:0;accent-color:#93c5fd">
                    <span style="font-size:7px;color:#9CA3AF;font-weight:500;min-width:7px;text-align:center;flex-shrink:0">10</span>
                    <span style="height:18px;font-size:9px;font-weight:700;padding:0 3px;line-height:18px;display:inline-block;min-width:18px;text-align:center;color:${t.from}" data-er="confidence" data-er-max="10">5</span>
                  </div>
                </div>
                <div>
                  <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Revision Progress</div>
                  <div style="display:flex;align-items:center;gap:4px">
                    <span style="height:18px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;padding:0 3px;line-height:18px;display:inline-block;min-width:24px;text-align:center" data-er="revision-done">___</span>
                    <span style="font-size:8px;color:#6B7280;font-weight:500">/</span>
                    <span style="height:18px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;padding:0 3px;line-height:18px;display:inline-block;min-width:24px;text-align:center" data-er="revision-total">___</span>
                    <span style="font-size:8px;color:#6B7280;font-weight:500">topics</span>
                  </div>
                </div>
                <div>
                  <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Weak Topics</div>
                  <div style="display:flex;align-items:center;gap:4px">
                    <span style="height:18px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;padding:0 3px;line-height:18px;display:inline-block;min-width:28px;text-align:center" data-er="weak-topics">___</span>
                    <span style="font-size:8px;color:#6B7280;font-weight:500">remaining</span>
                  </div>
                </div>
               </div>
              <div style="margin-top:14px;padding-top:12px;border-top:1px solid #e0d6c8">
                <div style="text-align:center;margin-bottom:12px">
                  <div style="font-size:32px;line-height:1;margin-bottom:4px" data-exam-status-emoji>🔴</div>
                  <div style="font-size:13px;font-weight:800;color:#1F2937;letter-spacing:0.02em" data-exam-status>Just Started</div>
                </div>
                <div style="background:#faf7f2;border-radius:8px;padding:10px 14px;border:1px solid #ede4d8">
                  <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">What to do next</div>
                  <div data-exam-recs style="font-size:9px;color:#4B5563;line-height:1.7;min-height:27px"></div>
                </div>
              </div>
           </div>
         </div>
           <div style="background:#faf7f2;border-radius:6px;padding:8px 12px;border:1px solid #ede4d8;margin-top:8px">
             <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
               <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap">Brain Dump</div>
               <div style="flex:1;height:1px;background:#ede4d8"></div>
             </div>
             <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
             <div style="height:18px"></div>
           </div>
        </div>
        <div style="margin-top:8px;padding:8px 10px;background:${t.light}10;border-radius:6px;border-left:3px solid ${t.from}">
          <div style="font-size:9px;color:#57534e;font-style:italic;line-height:1.5">Write your goal every morning. Review milestones every Sunday.</div>
        </div>`
      )
    );
  }

  private renderSemesterOverview(): string {
    const t = this.theme;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const semStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 6) * 6, 1);
    const semEnd = new Date(semStart.getFullYear(), semStart.getMonth() + 6, 0);
    const totalDays = Math.round((semEnd.getTime() - semStart.getTime()) / 86400000);
    const elapsedDays = Math.max(0, Math.round((now.getTime() - semStart.getTime()) / 86400000));
    const semPct = Math.min(100, Math.round(elapsedDays / totalDays * 100));
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const semStartStr = `${monthNames[semStart.getMonth()]} ${semStart.getDate()}`;
    const semEndStr = `${monthNames[semEnd.getMonth()]} ${semEnd.getDate()}`;
    const weekNum = Math.min(Math.floor(elapsedDays / 7) + 1, 26);
    const semMonths = [];
    for (let m = semStart.getMonth(); m <= semEnd.getMonth(); m++) {
      semMonths.push(months[m]);
    }
    return this.pageWrap(
      this.pageHeader('Semester Timeline', `Week ${weekNum} of 26`) +
      this.pageBody(
        `<div style="margin:0 0 16px">
          <div style="display:flex;justify-content:space-between;font-size:8px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">
            <span>${semStartStr}</span>
            <span>${semPct}% complete</span>
            <span>${semEndStr}</span>
          </div>
          <div style="height:4px;background:#ede4d8;border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${semPct}%;background:linear-gradient(to right,${t.from},${t.accent});border-radius:2px"></div>
          </div>
        </div>
        <div style="margin:0 0 14px">
          <div style="font-size:12px;font-weight:700;color:#2d2a27;margin-bottom:8px;font-family:'Playfair Display',Outfit,serif">Important Dates</div>
          <div style="position:relative;padding:0 0 0 20px">
            <div style="position:absolute;left:6px;top:4px;bottom:4px;width:1.5px;background:#ede4d8"></div>
            <div style="display:flex;align-items:center;gap:10px;padding:5px 0 5px 6px;margin-bottom:1px">
              <div style="position:absolute;left:-1px;width:7px;height:7px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 0 0 2px #f59e0b33"></div>
              <span style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.04em;min-width:58px">Exam Period</span>
              <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc">___</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;padding:5px 0 5px 6px;margin-bottom:1px">
              <div style="position:absolute;left:-1px;width:7px;height:7px;border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 0 0 2px #ef444433"></div>
              <span style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.04em;min-width:58px">Assignment Due</span>
              <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc">___</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;padding:5px 0 5px 6px;margin-bottom:1px">
              <div style="position:absolute;left:-1px;width:7px;height:7px;border-radius:50%;background:#10b981;border:2px solid #fff;box-shadow:0 0 0 2px #10b98133"></div>
              <span style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.04em;min-width:58px">Mid-Term</span>
              <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc">___</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;padding:5px 0 5px 6px;margin-bottom:1px">
              <div style="position:absolute;left:-1px;width:7px;height:7px;border-radius:50%;background:#8b5cf6;border:2px solid #fff;box-shadow:0 0 0 2px #8b5cf633"></div>
              <span style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.04em;min-width:58px">Final Exams</span>
              <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc">___</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;padding:5px 0 5px 6px">
              <div style="position:absolute;left:-1px;width:7px;height:7px;border-radius:50%;background:${t.light}88;border:2px solid #fff"></div>
              <span style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.04em;min-width:58px">Other</span>
              <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc">___</span>
            </div>
          </div>
        </div>
        <div style="margin:0 0 14px">
          <div style="font-size:12px;font-weight:700;color:#2d2a27;margin-bottom:8px;font-family:'Playfair Display',Outfit,serif">Monthly Milestones</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
            ${semMonths.map((m) => `
              <div style="background:#faf7f2;border-radius:6px;padding:6px 8px;border:1px solid #ede4d8">
                <div style="font-size:8px;font-weight:800;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">${m}</div>
                <div style="height:16px;border-bottom:1px dashed #e7e5e4;margin-bottom:2px"></div>
                <div style="height:16px;border-bottom:1px dashed #e7e5e4;margin-bottom:2px"></div>
                <div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:9px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px">My Semester Goals</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc">___</div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:9px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px">Semester Notes</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc">___</div>
          </div>
        </div>`
      )
    );
  }

  private renderAssignmentTracker(): string {
    const t = this.theme;
    const cols = [
      { name: 'To Do', color: '#d4c9bc', key: 'todo' },
      { name: 'In Progress', color: t.from, key: 'prog' },
      { name: 'Done', color: '#10b981', key: 'done' },
    ];
    return this.pageWrap(
      this.pageHeader('Assignment Board', '') +
      this.pageBody(
        `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 14px">
          ${[
            { label: 'Planned', value: '___', color: '#2d2a27', bg: '#f5f0ea' },
            { label: 'Working On', value: '___', color: t.from, bg: t.light + '30' },
            { label: 'Completed', value: '___', color: '#065f46', bg: '#ecfdf5' },
          ].map(s => `
            <div style="background:${s.bg};border-radius:6px;padding:6px 4px;text-align:center;border:1px solid ${s.color}15">
              <div style="font-size:14px;font-weight:900;color:${s.color}"><span style="height:18px;border-bottom:1.5px solid ${s.color}33;font-weight:500;font-size:14px;padding:0;line-height:18px;display:inline-block;min-width:24px">${s.value}</span></div>
              <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em">${s.label}</div>
            </div>
          `).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${cols.map(col => `
            <div style="background:${col.color}08;border-radius:8px;border:1px solid ${col.color}25;padding:8px">
              <div style="font-size:8px;font-weight:700;color:${col.color};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;text-align:center;padding:2px 8px;background:${col.color}12;border-radius:4px">${col.name}</div>
              <div style="display:flex;flex-direction:column;gap:4px">
                <div style="background:#fffcf5;border-radius:4px;padding:5px 6px;border:1px solid #ede4d8;border-left:2px solid ${col.color}">
                  <div style="height:16px;border-bottom:1px dashed #e7e5e4"></div>
                </div>
                <div style="background:#fffcf5;border-radius:4px;padding:5px 6px;border:1px solid #ede4d8;border-left:2px solid ${col.color}">
                  <div style="height:16px;border-bottom:1px dashed #e7e5e4"></div>
                </div>
                <div style="background:#fffcf5;border-radius:4px;padding:5px 6px;border:1px solid #ede4d8;border-left:2px solid ${col.color}">
                  <div style="height:16px"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:10px;display:grid;grid-template-columns:2fr 1fr;gap:6px">
          <div>
            <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:4px;font-family:'Playfair Display',Outfit,serif">My Biggest Priority This Week</div>
            <div style="background:#faf7f2;border-radius:6px;padding:0 8px;border:1px solid #ede4d8">
              <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
              <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
              <div style="height:16px"></div>
            </div>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:4px;font-family:'Playfair Display',Outfit,serif">Am I On Track?</div>
            <div style="background:#faf7f2;border-radius:6px;padding:6px 8px;border:1px solid #ede4d8">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                ${this.checkboxRow({ size: 10, borderColor: '#d4c9bc', writingLine: false, label: '', padding: '0', gap: 0 })}
                <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc"></span>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                ${this.checkboxRow({ size: 10, borderColor: '#d4c9bc', writingLine: false, label: '', padding: '0', gap: 0 })}
                <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc"></span>
              </div>
            </div>
          </div>
        </div>`
      )
    );
  }

  private renderExamCountdown(): string {
    const t = this.theme;
    const examDateStr = this.values['examDate'] || '';
    let diffDays = 0;
    let targetLabel = '';
    if (examDateStr) {
      try {
        const now = new Date();
        const target = new Date(examDateStr + 'T00:00:00');
        diffDays = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        targetLabel = formatDate(examDateStr);
      } catch(e) {}
    }
    const subjects = this.subjectList();
    const weeksLeft = Math.max(1, Math.ceil(diffDays / 7));
    
    // Use user-entered readiness % or placeholder
    const readinessPct = this.values['exam-readiness'] || '___';
    const readinessNum = parseInt(readinessPct, 10) || 0;
    
    // Dynamic ring color based on percentage
    const ringColor = readinessNum <= 25 ? '#ef4444' : readinessNum <= 50 ? '#f59e0b' : readinessNum <= 75 ? '#3b82f6' : '#10b981';
    const ringSz = 72;
    const ringR2 = (ringSz - 8) / 2;
    const ringCirc2 = 2 * Math.PI * ringR2;
    const clampedPct = Math.min(Math.max(readinessNum, 0), 100);
    const ringOff = ringCirc2 * (1 - clampedPct / 100);
    const ringHtml = '<div data-readiness-ring style="width:' + ringSz + 'px;height:' + ringSz + 'px;position:relative;flex-shrink:0">' +
      '<svg width="' + ringSz + '" height="' + ringSz + '" viewBox="0 0 ' + ringSz + ' ' + ringSz + '" style="transform:rotate(-90deg)">' +
        '<circle cx="' + (ringSz/2) + '" cy="' + (ringSz/2) + '" r="' + ringR2 + '" fill="none" stroke="#ede4d8" stroke-width="3"/>' +
        '<circle data-readiness-circle cx="' + (ringSz/2) + '" cy="' + (ringSz/2) + '" r="' + ringR2 + '" fill="none" stroke="' + ringColor + '" stroke-width="3" stroke-dasharray="' + ringCirc2 + '" stroke-dashoffset="' + ringOff + '" stroke-linecap="round"/>' +
      '</svg>' +
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
        '<span data-readiness-pct style="font-size:16px;font-weight:800;color:#2d2a27">' + (readinessPct === '___' ? 0 : readinessPct) + '%</span>' +
        '<span style="font-size:7px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-top:-1px">ready</span>' +
      '</div>' +
    '</div>';

    // Confidence level (1-5)
    const confidenceLevel = parseInt(this.values['confidence-level'] || '3', 10);
    
    // Syllabus progress per subject - use placeholders if no value entered
    const syllabusRows = subjects.slice(0, 4).map(function(s, i) {
      const key = 'syllabus-progress-' + s.replace(/[^a-z0-9]/gi, '').toLowerCase();
      const pct = this.values[key] || '___%';
      return { subject: s, pct };
    }.bind(this));
    while (syllabusRows.length < 4) {
      syllabusRows.push({ subject: 'Subject ' + (syllabusRows.length + 1), pct: this.values['syllabus-progress-' + (syllabusRows.length + 1)] || '___%' });
    }
    return this.pageWrap(
      this.pageHeader('Exam Readiness', diffDays > 0 ? diffDays + ' days to go' : 'Set your exam date') +
      this.pageBody(
        '<div style="display:flex;gap:14px;margin:0 0 14px;align-items:center">' +
          ringHtml +
          '<div style="flex:1">' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
              '<span style="font-size:13px;font-weight:800;color:#2d2a27;font-family:\'Playfair Display\',Outfit,serif">' + (targetLabel || 'Target Exam Date') + '</span>' +
              '<span style="font-size:9px;font-weight:600;color:#6B7280">' + subjects.length + ' subjects</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">' +
              '<span style="font-size:8px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em">Confidence</span>' +
              this.circleGroup({ groupKey: 'confidence-exam', count: 5, size: 10, colors: ['#10b981','#10b981','#10b981','#10b981','#10b981'], selected: confidenceLevel - 1, labels: ['Very Low','Low','Moderate','High','Very High'] }) +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
              '<span style="font-size:8px;font-weight:600;color:#6B7280">Your Readiness</span>' +
              '<span data-readiness-input style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc">___</span>' +
              '<span style="font-size:7px;font-weight:600;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block">%</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="margin:0 0 12px">' +
          '<div style="font-size:12px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:\'Playfair Display\',Outfit,serif">Syllabus Progress</div>' +
          '<div style="background:#faf7f2;border-radius:6px;padding:2px 10px;border:1px solid #ede4d8">' +
            syllabusRows.map((row, i) => {
              var sep = i < syllabusRows.length - 1 ? '1.5px solid #d4c9bc' : 'transparent';
              var key = 'progress-syllabus-' + i;
              return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:' + sep + '">' +
                '<div style="flex:1">' +
                  '<div style="display:flex;justify-content:space-between;font-size:8px;font-weight:600;color:#6B7280;margin-bottom:2px">' +
                    '<span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;color:#2d2a27;padding:0 2px;line-height:16px;display:inline-block;min-width:60px" data-er-subject="' + i + '">' + esc(row.subject) + '</span>' +
                    '<span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;color:#2d2a27;padding:0 2px;line-height:16px;display:inline-block;min-width:36px;text-align:center" data-progress-input="' + key + '" data-progress-max="100">' + row.pct + '</span>' +
                    '<span style="font-size:8px;color:#6B7280;font-weight:500">%</span>' +
                  '</div>' +
                  this.progressTrack({ groupKey: key, height: 3 }) +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div style="margin:0 0 12px">' +
          '<div style="font-size:12px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:\'Playfair Display\',Outfit,serif">Mock Test Results</div>' +
          '<div style="background:#faf7f2;border-radius:6px;padding:0 10px;border:1px solid #ede4d8">' +
            '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">' +
              '<span style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;min-width:40px">Test 1</span>' +
              '<span style="flex:1;display:flex;align-items:center;gap:4px">' +
                '<span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;color:#2d2a27;padding:0 2px;line-height:16px;display:inline-block;min-width:24px;text-align:center">___</span>' +
                '<span style="font-size:8px;color:#6B7280;font-weight:500">/100</span>' +
              '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">' +
              '<span style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;min-width:40px">Test 2</span>' +
              '<span style="flex:1;display:flex;align-items:center;gap:4px">' +
                '<span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;color:#2d2a27;padding:0 2px;line-height:16px;display:inline-block;min-width:24px;text-align:center">___</span>' +
                '<span style="font-size:8px;color:#6B7280;font-weight:500">/100</span>' +
              '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;padding:6px 0">' +
              '<span style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;min-width:40px">Test 3</span>' +
              '<span style="flex:1;display:flex;align-items:center;gap:4px">' +
                '<span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;color:#2d2a27;padding:0 2px;line-height:16px;display:inline-block;min-width:24px;text-align:center">___</span>' +
                '<span style="font-size:8px;color:#6B7280;font-weight:500">/100</span>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 12px">' +
          '<div style="background:#f0faf0;border-radius:6px;padding:8px 10px;border:1px solid #d4edda">' +
            '<div style="font-size:8px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">My Strengths</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #c3e6cb;margin-bottom:3px">___</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #c3e6cb;margin-bottom:3px">___</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>' +
          '</div>' +
          '<div style="background:#fef2f2;border-radius:6px;padding:6px 10px;border:1px solid #fecaca">' +
            '<div style="font-size:8px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">My Weakest Topics</div>' +
            '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1.5px solid #d4c9bc"><span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span><span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span></div>' +
            '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1.5px solid #d4c9bc"><span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span><span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span></div>' +
            '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1.5px solid #d4c9bc"><span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span><span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span></div>' +
            '<div style="display:flex;align-items:center;gap:8px;padding:5px 0"><span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span><span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span></div>' +
          '</div>' +
        '</div>' +
        '<div style="margin:0 0 12px">' +
          '<div style="font-size:12px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:\'Playfair Display\',Outfit,serif">Final Revision Checklist</div>' +
          '<div style="background:#faf7f2;border-radius:6px;padding:2px 10px;border:1px solid #ede4d8">' +
            '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1.5px solid #d4c9bc"><span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span><span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span></div>' +
            '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1.5px solid #d4c9bc"><span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span><span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span></div>' +
            '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1.5px solid #d4c9bc"><span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span><span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span></div>' +
            '<div style="display:flex;align-items:center;gap:8px;padding:5px 0"><span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span><span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span></div>' +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
          '<div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">' +
            '<div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Last-Week Action Plan</div>' +
            '<div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px">___</div>' +
            '<div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px">___</div>' +
            '<div style="height:18px;border-bottom:1.5px solid #d4c9bc">___</div>' +
          '</div>' +
          '<div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">' +
            '<div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Notes</div>' +
            '<div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px">___</div>' +
            '<div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px">___</div>' +
            '<div style="height:18px;border-bottom:1.5px solid #d4c9bc">___</div>' +
          '</div>' +
        '</div>'
      )
    );
  }

  private renderSubjectPlanner(index: number): string {
    const t = this.theme;
    const subjects = this.subjectList();
    const subject = subjects[index] || `Subject ${index + 1}`;
    const priorityDots = ['#f59e0b', '#10b981', '#f59e0b', '#e0d8cc'];
    const roadmapRows = [0,1,2,3].map((i) => {
      const key = 'progress-unit-' + i;
      return '<div style="display:flex;align-items:center;gap:6px;padding:5px 0;' + (i < 3 ? 'border-bottom:1.5px solid #d4c9bc' : '') + '">' +
        '<span style="width:14px;height:14px;border-radius:3px;border:1.5px solid #d4c9bc;flex-shrink:0;display:flex;align-items:center;justify-content:center"><span style="font-size:7px;font-weight:700;color:#b8a99a">' + (i + 1) + '</span></span>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="display:flex;justify-content:space-between;font-size:8px;font-weight:600;color:#6B7280;margin-bottom:1px">' +
            '<span style="font-weight:700;color:#2d2a27">Unit ' + (i + 1) + '</span>' +
            '<span style="height:14px;border-bottom:1.5px solid #d4c9bc;font-size:7px;font-weight:500;color:#2d2a27;padding:0 2px;line-height:14px;display:inline-block;min-width:24px" data-progress-input="' + key + '" data-progress-max="100">___%</span>' +
          '</div>' +
          this.progressTrack({ groupKey: key, height: 3 }) +
        '</div>' +
        '<span style="width:7px;height:7px;border-radius:50%;background:' + priorityDots[i] + ';flex-shrink:0"></span>' +
        '<span style="flex-shrink:0;width:1px;height:18px;background:#ede4d8"></span>' +
        '<span style="width:48px;height:16px;border-bottom:1.5px solid #d4c9bc;font-size:7px;color:#6B7280;text-align:right;flex-shrink:0">___</span>' +
      '</div>';
    }).join('');
    return this.pageWrap(
      // Custom header matching pageHeader style but with editable subject name
      '<div style="padding:20px 24px 10px;border-bottom:1px solid #ede4d8;display:flex;align-items:flex-start;justify-content:space-between">' +
        '<div>' +
          '<div style="font-size:16px;font-weight:700;color:#2d2a27;letter-spacing:-0.01em;font-family:\'Playfair Display\',Outfit,serif">' +
            '<span data-subject-name="' + index + '" style="border-bottom:1.5px solid ' + t.from + '66;height:18px;display:inline-block;min-width:80px;font-weight:500;color:' + t.from + ';font-size:14px;padding:0;line-height:18px">' + esc(subject) + '</span>' +
          '</div>' +
          '<div style="font-size:8px;color:#6B7280;font-weight:500;margin-top:2px;font-style:italic">Subject ' + (index + 1) + ' of ' + subjects.length + '</div>' +
        '</div>' +
        '<div style="font-size:8px;color:#6B7280;background:#f5f0ea;padding:3px 10px;border-radius:20px;font-weight:600;white-space:nowrap;flex-shrink:0;margin-top:2px">Subject ' + (index + 1) + ' of ' + subjects.length + '</div>' +
      '</div>' +
      this.pageBody(
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 12px">' +
          '<div style="background:#faf7f2;border-radius:6px;padding:6px 8px;border:1px solid #ede4d8">' +
            '<div style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Teacher / Professor</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>' +
          '</div>' +
          '<div style="background:#faf7f2;border-radius:6px;padding:6px 8px;border:1px solid #ede4d8">' +
            '<div style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Credits</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>' +
          '</div>' +
          '<div style="background:#faf7f2;border-radius:6px;padding:6px 8px;border:1px solid #ede4d8">' +
            '<div style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Semester</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>' +
          '</div>' +
          '<div style="background:#faf7f2;border-radius:6px;padding:6px 8px;border:1px solid #ede4d8">' +
            '<div style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Exam Date</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>' +
          '</div>' +
        '</div>' +
        '<div style="margin:0 0 12px">' +
          '<div style="font-size:12px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:\'Playfair Display\',Outfit,serif">Progress Dashboard</div>' +
          '<div style="display:flex;border:1px solid #ede4d8;border-radius:6px;overflow:hidden">' +
            '<div style="flex:1;padding:6px 4px;text-align:center;background:#faf7f2">' +
              '<div style="font-size:14px;font-weight:900;color:#2d2a27;height:18px"><span style="height:18px;border-bottom:1.5px solid #2d2a2733;font-weight:500;font-size:14px;padding:0;line-height:18px;display:inline-block;min-width:24px">___%</span></div>' +
              '<div style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em">Syllabus Done</div>' +
            '</div>' +
            '<div style="width:1px;background:#ede4d8"></div>' +
            '<div style="flex:1;padding:6px 4px;text-align:center;background:#faf7f2">' +
              '<div style="font-size:14px;font-weight:900;color:#2d2a27;height:18px;display:flex;align-items:center;justify-content:center">' +
                this.circleGroup({ groupKey: 'confidence-' + index, count: 5, size: 7, colors: ['#10b981','#10b981','#10b981','#10b981','#10b981'] }) +
              '</div>' +
              '<div style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em">Confidence</div>' +
            '</div>' +
            '<div style="width:1px;background:#ede4d8"></div>' +
            '<div style="flex:1;padding:6px 4px;text-align:center;background:#faf7f2">' +
              '<div style="font-size:14px;font-weight:900;color:#2d2a27;height:18px;border-bottom:1px dashed #e7e5e4"><span style="height:18px;border-bottom:1.5px solid #2d2a2733;font-weight:500;font-size:14px;padding:0;line-height:18px;display:inline-block;min-width:24px">___h</span></div>' +
              '<div style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em">Hours Done</div>' +
            '</div>' +
            '<div style="width:1px;background:#ede4d8"></div>' +
            '<div style="flex:1;padding:6px 4px;text-align:center;background:#faf7f2">' +
              '<div style="font-size:14px;font-weight:900;color:#2d2a27;height:18px"><span style="height:18px;border-bottom:1.5px solid #2d2a2733;font-weight:500;font-size:14px;padding:0;line-height:18px;display:inline-block;min-width:24px">___h</span></div>' +
              '<div style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em">Target Hours</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="margin:0 0 12px">' +
          '<div style="font-size:12px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:\'Playfair Display\',Outfit,serif">Learning Roadmap</div>' +
          '<div style="background:#faf7f2;border-radius:6px;padding:0 10px;border:1px solid #ede4d8">' +
            roadmapRows +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 12px">' +
          '<div style="background:#faf7f2;border-radius:6px;padding:6px 8px;border:1px solid #ede4d8">' +
            '<div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Topic Tracker</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:2px">___</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:2px">___</div>' +
            '<div style="height:16px;margin-bottom:2px;border-bottom:1.5px solid #d4c9bc">___</div>' +
            '<div style="display:flex;align-items:center;gap:3px;margin-top:2px">' +
              '<span style="font-size:8px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em">Difficulty</span>' +
              this.circleGroup({ groupKey: 'difficulty-' + index, count: 5, size: 7, colors: ['#f59e0b','#f59e0b','#f59e0b','#f59e0b','#f59e0b'] }) +
            '</div>' +
          '</div>' +
          '<div style="background:#faf7f2;border-radius:6px;padding:6px 8px;border:1px solid #ede4d8">' +
            '<div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Formulas & Concepts</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:2px">___</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:2px">___</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 12px">' +
          '<div style="background:#fef2f2;border-radius:6px;padding:6px 8px;border:1px solid #fecaca">' +
            '<div style="font-size:7px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Common Mistakes</div>' +
            '<div style="height:16px;border-bottom:1.5px solid #fecaca;margin-bottom:2px"></div>' +
            '<div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>' +
          '</div>' +
          '<div style="background:#faf7f2;border-radius:6px;padding:6px 8px;border:1px solid #ede4d8">' +
            '<div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Resources</div>' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">' +
              '<span style="font-size:8px;font-weight:600;color:#6B7280;min-width:34px;text-transform:uppercase;letter-spacing:0.05em">Books</span>' +
              '<span style="flex:1;height:14px;border-bottom:1.5px solid #d4c9bc">___</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">' +
              '<span style="font-size:8px;font-weight:600;color:#6B7280;min-width:34px;text-transform:uppercase;letter-spacing:0.05em">Online</span>' +
              '<span style="flex:1;height:14px;border-bottom:1.5px solid #d4c9bc">___</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<span style="font-size:7px;font-weight:600;color:#6B7280;min-width:34px;text-transform:uppercase;letter-spacing:0.05em">Practice</span>' +
              '<span style="flex:1;height:14px;border-bottom:1.5px solid #d4c9bc">___</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="margin:0 0 12px">' +
          '<div style="font-size:12px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:\'Playfair Display\',Outfit,serif">Revision Planner</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
            '<div style="display:flex;align-items:center;gap:6px;background:#faf7f2;padding:5px 8px;border-radius:6px;border:1px solid #ede4d8">' +
              this.checkboxRow({ size: 12, borderColor: '#d4c9bc', label: '1st', labelSize: 8, labelColor: '#6B7280', writingLine: false }) +
              '<span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc">___</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;background:#faf7f2;padding:5px 8px;border-radius:6px;border:1px solid #ede4d8">' +
              this.checkboxRow({ size: 12, borderColor: '#d4c9bc', label: '2nd', labelSize: 8, labelColor: '#6B7280', writingLine: false }) +
              '<span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc">___</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;background:#faf7f2;padding:5px 8px;border-radius:6px;border:1px solid #ede4d8">' +
              this.checkboxRow({ size: 12, borderColor: '#d4c9bc', label: 'Final', labelSize: 8, labelColor: '#6B7280', writingLine: false }) +
              '<span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc">___</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;background:#faf7f2;padding:5px 8px;border-radius:6px;border:1px solid #ede4d8">' +
              this.checkboxRow({ size: 12, borderColor: '#d4c9bc', label: 'Mock', labelSize: 8, labelColor: '#6B7280', writingLine: false }) +
              '<span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc">___</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="background:#faf7f2;border-radius:6px;padding:6px 10px;border:1px solid #ede4d8">' +
          '<div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Personal Notes</div>' +
          '<div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>' +
          '<div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>' +
          '<div style="height:18px;border-bottom:1.5px solid #d4c9bc">___</div>' +
        '</div>'
      )
    );
  }

  private renderRevisionTracker(): string {
    const t = this.theme;
    const subjects = this.subjectList();
    return this.pageWrap(
      this.pageHeader('Revision Matrix', '') +
      this.pageBody(
        `<div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">My Revision Rounds</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 14px">
          <div style="background:#faf7f2;border-radius:6px;padding:8px 4px;text-align:center;border:1px solid #ede4d8">
            <div style="display:flex;justify-content:center;gap:3px;margin-bottom:3px">
              <span style="width:8px;height:8px;border-radius:50%;background:${t.from}"></span>
              <span style="width:8px;height:8px;border-radius:50%;background:#e0d8cc"></span>
              <span style="width:8px;height:8px;border-radius:50%;background:#e0d8cc"></span>
            </div>
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em">Round 1</div>
            <div style="font-size:8px;font-weight:400;color:#6B7280"></div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px 4px;text-align:center;border:1px solid #ede4d8">
            <div style="display:flex;justify-content:center;gap:3px;margin-bottom:3px">
              <span style="width:8px;height:8px;border-radius:50%;background:${t.light}88"></span>
              <span style="width:8px;height:8px;border-radius:50%;background:${t.light}88"></span>
              <span style="width:8px;height:8px;border-radius:50%;background:#e0d8cc"></span>
            </div>
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em">Round 2</div>
            <div style="font-size:8px;font-weight:400;color:#6B7280"></div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px 4px;text-align:center;border:1px solid #ede4d8">
            <div style="display:flex;justify-content:center;gap:3px;margin-bottom:3px">
              <span style="width:8px;height:8px;border-radius:50%;background:#e0d8cc"></span>
              <span style="width:8px;height:8px;border-radius:50%;background:#e0d8cc"></span>
              <span style="width:8px;height:8px;border-radius:50%;background:#e0d8cc"></span>
            </div>
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em">Round 3</div>
            <div style="font-size:8px;font-weight:400;color:#6B7280"></div>
          </div>
        </div>
        <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">Topics to Revise</div>
        <div style="background:#faf7f2;border-radius:6px;padding:2px 10px;border:1px solid #ede4d8">
          ${['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5'].map((round, i) => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;${i < 4 ? 'border-bottom:1.5px solid #d4c9bc' : ''}">
              ${this.checkboxRow({ size: 12, borderColor: '#d4c9bc', themeColor: i === 0 ? t.from : undefined, writingLine: true, borderBottom: i < 4 ? '1px dashed #e7e5e4' : '1.5px solid #d4c9bc' })}
              <span style="flex:1;height:16px;border-bottom:${i < 4 ? '1px dashed #e7e5e4' : '1.5px solid #d4c9bc'}"></span>
              ${i < 3 ? `<span style="font-size:8px;color:#6B7280">${round}</span>` : ''}
              ${i < 3 ? this.checkboxRow({ size: 8, borderColor: i === 0 ? '#4B5563' : '#d4c9bc', writingLine: false, label: '', gap: 2, padding: '0' }).repeat(3) : ''}
            </div>
          `).join('')}
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;font-size:8px;color:#6B7280">
          ${['Round 1', 'Round 2', 'Round 3'].map(r => this.checkboxRow({ size: 12, borderColor: '#d4c9bc', writingLine: false, label: r, labelSize: 8, labelColor: '#6B7280', padding: '0', gap: 6 })).join('')}
        </div>
        <div style="margin-top:10px;padding:8px 10px;background:#faf7f2;border-radius:6px;border:1px solid #ede4d8">
          <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">What am I struggling with?</div>
          <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
          <div style="height:18px;border-bottom:1.5px solid #d4c9bc"></div>
          <div style="height:18px"></div>
        </div>
        <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:#fef2f2;border-radius:6px;padding:8px 10px;border:1px solid #fecaca">
            <div style="font-size:8px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Topics I Keep Avoiding</div>
            <div style="height:18px;border-bottom:1.5px solid #fca5a5;margin-bottom:3px"></div>
            <div style="height:18px"></div>
          </div>
          <div style="background:#ecfdf5;border-radius:6px;padding:8px 10px;border:1px solid #bbf7d0">
            <div style="font-size:8px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">My next step</div>
            <div style="height:18px;border-bottom:1.5px solid #a7f3d0;margin-bottom:3px"></div>
            <div style="height:18px"></div>
          </div>
        </div>
        ${this.sectionDivider(t.from)}
        <div style="padding:8px 10px;background:${t.light}10;border-radius:6px;border-left:3px solid ${t.from}">
          <div style="font-size:8px;color:#57534e;font-style:italic;line-height:1.5">One topic at a time. Start with the one that feels heaviest — finishing it will lift everything else.</div>
        </div>`
      )
    );
  }

  private renderStudyLog(): string {
    const t = this.theme;
    return this.pageWrap(
      this.pageHeader('Study Log', '') +
      this.pageBody(
        `<div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">Log Your Sessions</div>
        <div style="background:#faf7f2;border-radius:6px;padding:0 10px;border:1px solid #ede4d8;margin:0 0 10px">
          ${['Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">
            <span style="width:28px;font-size:8px;font-weight:700;color:#6B7280">${d}</span>
            <span style="flex:1;height:18px;border-bottom:1.5px solid #d4c9bc"></span>
            <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:7px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block">___h</span>
          </div>`).join('')}
        </div>
        ${this.sectionDivider(t.from)}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 12px">
          <div style="background:#faf7f2;border-radius:6px;padding:8px;text-align:center;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px">Total This Week</div>
            <div style="font-size:16px;font-weight:900;color:${t.from}"><span style="height:20px;border-bottom:1.5px solid ${t.from}33;font-weight:500;font-size:16px;padding:0;line-height:20px;display:inline-block;min-width:24px">___h</span></div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px;text-align:center;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px">Sessions</div>
            <div style="font-size:16px;font-weight:900;color:#2d2a27"><span style="height:20px;border-bottom:1.5px solid #2d2a2733;font-weight:500;font-size:16px;padding:0;line-height:20px;display:inline-block;min-width:24px">___</span></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">What held me back?</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">What did I learn today?</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
        </div>
        <div style="margin-top:8px;padding:8px 10px;background:${t.light}10;border-radius:6px;border-left:3px solid ${t.from}">
          <div style="font-size:8px;color:#57534e;font-style:italic;line-height:1.5">Small progress every day adds up. What will I do better tomorrow?</div>
        </div>`
      )
    );
  }

  private renderAttendance(): string {
    const t = this.theme;
    const ac = '#2563eb';
    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth();
    const daysInMonth = new Date(cy, cm + 1, 0).getDate();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekDayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const firstDay = new Date(cy, cm, 1).getDay();
    const calDays = (firstDay === 0 ? 6 : firstDay - 1);
    const totalCells = daysInMonth + calDays;
    const todayNum = now.getDate();

    function pad(n: number): string { return n < 10 ? '0' + n : '' + n; }
    const dateStr = cy + '-' + pad(cm + 1);

    var cells = '';
    for (var ci = 0; ci < totalCells; ci++) {
      var dayNum = ci - calDays + 1;
      if (dayNum < 1 || dayNum > daysInMonth) { cells += '<div></div>'; continue; }
      var fullDate = dateStr + '-' + pad(dayNum);
      var isToday = dayNum === todayNum;
      var isFuture = dayNum > todayNum;
      var cls = 'att-cell';
      if (isToday) cls += ' att-today';
      if (isFuture) cls += ' att-future';
      cells += '<div tabindex="0" role="button" aria-label="' + fullDate + ' ' + dayNum + ' ' + monthName + '" data-att-date="' + fullDate + '" class="' + cls + '">' +
        '<span class="att-day-num">' + dayNum + '</span>' +
        '<svg class="att-check" width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 3.5L2.5 5L6 1.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>';
    }

    return this.pageWrap(
      this.pageHeader('Attendance Heatmap', monthName) +
      this.pageBody(
        '<style>' +
        '.att-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin:0 0 12px}' +
        '.att-cell{aspect-ratio:1;border-radius:6px;border:1.5px solid #e5e0d8;background:#ffffff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#2d2a27;cursor:pointer;transition:all 200ms ease;user-select:none;-webkit-user-select:none;position:relative;outline:none}' +
        '.att-cell:hover{background:#eff6ff;border-color:' + ac + '44;transform:scale(1.04);z-index:1}' +
        '.att-cell:focus-visible{box-shadow:0 0 0 2px ' + ac + ',0 0 0 4px #ffffff}' +
        '.att-cell.att-present{background:' + ac + ';border-color:' + ac + ';color:#ffffff}' +
        '.att-cell.att-present:hover{background:#1d4ed8;border-color:#1d4ed8}' +
        '.att-cell .att-check{position:absolute;top:2px;right:2px;opacity:0;transition:opacity 200ms ease}' +
        '.att-cell.att-present .att-check{opacity:1}' +
        '.att-cell.att-today::after{content:"";position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:' + ac + ';transition:background 200ms ease}' +
        '.att-cell.att-present.att-today::after{background:#ffffff}' +
        '.att-cell.att-future{opacity:0.5}' +
        '.att-cell.att-future:hover{opacity:0.8}' +
        '@keyframes att-pop{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}' +
        '.att-cell.att-toggle{animation:att-pop 300ms ease}' +
        '</style>' +
        // Stat cards
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0 0 10px">' +
          '<div style="background:#faf7f2;border-radius:10px;padding:8px 6px;text-align:center;border:1px solid #ede4d8;box-shadow:0 1px 3px rgba(0,0,0,0.02)">' +
            '<div style="font-size:20px;font-weight:800;color:' + ac + ';line-height:1.1" data-att-stat="pct">0%</div>' +
            '<div style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;margin-top:3px">Attendance</div>' +
          '</div>' +
          '<div style="background:#faf7f2;border-radius:10px;padding:8px 6px;text-align:center;border:1px solid #ede4d8;box-shadow:0 1px 3px rgba(0,0,0,0.02)">' +
            '<div style="font-size:20px;font-weight:800;color:#2d2a27;line-height:1.1" data-att-stat="present">0</div>' +
            '<div style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;margin-top:3px">Present</div>' +
          '</div>' +
          '<div style="background:#faf7f2;border-radius:10px;padding:8px 6px;text-align:center;border:1px solid #ede4d8;box-shadow:0 1px 3px rgba(0,0,0,0.02)">' +
            '<div style="font-size:20px;font-weight:800;color:#6B7280;line-height:1.1" data-att-stat="absent">0</div>' +
            '<div style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;margin-top:3px">Absent</div>' +
          '</div>' +
          '<div style="background:#faf7f2;border-radius:10px;padding:8px 6px;text-align:center;border:1px solid #ede4d8;box-shadow:0 1px 3px rgba(0,0,0,0.02)">' +
            '<div style="font-size:20px;font-weight:800;color:#6B7280;line-height:1.1" data-att-stat="days-left">' + daysInMonth + '</div>' +
            '<div style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;margin-top:3px">Days Left</div>' +
          '</div>' +
        '</div>' +
        // Streak cards
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 10px">' +
          '<div style="background:linear-gradient(135deg,' + ac + '0a,' + ac + '03);border-radius:10px;padding:8px 12px;border:1px solid ' + ac + '22">' +
            '<div style="font-size:7px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:0.08em">Current Streak</div>' +
            '<div style="display:flex;align-items:baseline;gap:4px;margin-top:3px"><span data-att-stat="streak-current" style="font-size:22px;font-weight:800;color:#2d2a27;line-height:1">0</span><span style="font-size:8px;color:#6B7280;font-weight:500;margin-left:2px">days</span></div>' +
          '</div>' +
          '<div style="background:linear-gradient(135deg,#f59e0b0a,#f59e0b04);border-radius:10px;padding:8px 12px;border:1px solid #f59e0b22">' +
            '<div style="font-size:7px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:0.08em">Best Streak</div>' +
            '<div style="display:flex;align-items:baseline;gap:4px;margin-top:3px"><span data-att-stat="streak-best" style="font-size:22px;font-weight:800;color:#2d2a27;line-height:1">0</span><span style="font-size:8px;color:#6B7280;font-weight:500;margin-left:2px">days</span></div>' +
          '</div>' +
        '</div>' +
        // Progress bar
        '<div style="margin:0 0 8px">' +
          '<div style="display:flex;justify-content:space-between;font-size:8px;font-weight:600;color:#6B7280;margin-bottom:4px"><span data-att-stat="progress-label">Monthly Progress</span><span data-att-stat="progress-frac">0/' + daysInMonth + '</span></div>' +
          '<div style="height:6px;background:#ede4d8;border-radius:5px;overflow:hidden;position:relative">' +
            '<div data-att-stat="progress-bar" style="position:absolute;top:0;left:0;height:100%;width:0%;background:linear-gradient(90deg,' + ac + ',' + ac + 'cc);border-radius:5px;transition:width 400ms ease"></div>' +
          '</div>' +
        '</div>' +
        // Legend + grid header
        '<div style="display:flex;align-items:center;gap:10px;margin:0 0 6px">' +
          '<div style="display:flex;align-items:center;gap:4px;font-size:7px;font-weight:600;color:#6B7280"><span style="width:8px;height:8px;border-radius:2px;background:' + ac + ';border:1px solid ' + ac + '"></span>Present</div>' +
          '<div style="display:flex;align-items:center;gap:4px;font-size:7px;font-weight:600;color:#6B7280"><span style="width:8px;height:8px;border-radius:2px;background:#ffffff;border:1.5px solid #e5e0d8"></span>Absent</div>' +
          '<div style="flex:1"></div>' +
          '<div style="font-size:7px;color:#4B5563;font-weight:500">Click to toggle</div>' +
        '</div>' +
        // Weekday headers
        '<div style="display:flex;gap:2px;margin:0 0 2px">' +
          weekDayLabels.map(function(d) { return '<div style="flex:1;text-align:center;font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;padding:1px 0">' + d + '</div>'; }).join('') +
        '</div>' +
        // Calendar grid
        '<div class="att-grid" data-att-grid="' + dateStr + '">' +
          cells +
        '</div>' +
        // Writing section
        '<div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:5px;font-family:\'Playfair Display\',Outfit,serif">My Attendance Goal</div>' +
        '<div style="background:#faf7f2;border-radius:8px;padding:8px 12px;border:1px solid #ede4d8;margin:0 0 10px">' +
          '<div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">I want to attend ___ days this month</div>' +
          '<div style="height:15px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>' +
          '<div style="height:15px;border-bottom:1.5px solid #d4c9bc"></div>' +
        '</div>' +
        '<div style="background:#faf7f2;border-radius:8px;padding:8px 12px;border:1px solid #ede4d8">' +
          '<div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">If I miss a class, the reason was…</div>' +
          '<div style="height:15px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>' +
          '<div style="height:15px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>' +
          '<div style="height:15px;border-bottom:1.5px solid #d4c9bc"></div>' +
        '</div>'
      )
    );
  }

  private renderWeeklyPlanner(index: number): string {
    const t = this.theme;
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1 + index * 7);
    const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' – ' + new Date(weekStart.getTime() + 6 * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return this.pageWrap(
      this.pageHeader(`My Week ${weekLabel}`, '') +
      this.pageBody(
        `<div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:8px;font-family:'Playfair Display',Outfit,serif">Each Day's Focus</div>
        ${weekDays.map((d, di) => {
          const wd = new Date(weekStart.getTime() + di * 864e5);
          const isToday = di === ((now.getDay() + 6) % 7);
          return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;margin-bottom:3px;background:${isToday ? t.light + '12' : '#faf7f2'};border-radius:5px;border:1px solid ${isToday ? t.from + '25' : '#ede4d8'}">
            <div style="min-width:24px;text-align:center">
              <div style="font-size:9px;font-weight:800;color:${isToday ? t.from : '#2d2a27'}">${wd.getDate()}</div>
              <div style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase">${d}</div>
            </div>
            <div style="flex:1">
              <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:2px"></div>
              <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
            </div>
            ${this.checkboxRow({ size: 10, borderColor: '#d4c9bc', writingLine: false, label: '', padding: '0', gap: 0 })}
          </div>`;
        }).join('')}
        <div style="font-size:11px;font-weight:700;color:#2d2a27;margin:12px 0 6px;font-family:'Playfair Display',Outfit,serif">This Week's Most Important Task</div>
        <div style="background:#faf7f2;border-radius:6px;padding:0 10px;border:1px solid #ede4d8">
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">
            <span style="font-size:8px;font-weight:700;color:${t.from}">1.</span>
            <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc"></span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">
            <span style="font-size:8px;font-weight:600;color:#4B5563">2.</span>
            <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc"></span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0">
            <span style="font-size:8px;font-weight:600;color:#4B5563">3.</span>
            <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc"></span>
          </div>
        </div>
        <div style="margin-top:10px;padding:8px 10px;background:#faf7f2;border-radius:6px;border:1px solid #ede4d8">
          <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">Notes & Reminders</div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
        </div>
        <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Each Day Ask: What's the ONE Thing?</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8" data-energy-week="w${index}">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">My Energy Levels This Week</div>
            ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(function(d, i) {
              var ek = 'w' + index + '-d' + i;
              return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">' +
                '<span style="font-size:8px;font-weight:600;color:#6B7280;min-width:24px">' + d + '</span>' +
                '<div data-energy-track="' + ek + '" style="flex:1;height:16px;background:#f0eeeb;border-radius:8px;position:relative;cursor:pointer;overflow:hidden" tabindex="0" role="slider" aria-label="Energy level for ' + d + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
                  '<div data-energy-fill="' + ek + '" style="position:absolute;top:0;left:0;height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#3b82f6);border-radius:8px;transition:width 200ms ease"></div>' +
                '</div>' +
                '<span data-energy-pct="' + ek + '" style="font-size:8px;font-weight:700;color:#2d2a27;min-width:30px;text-align:right">--%</span>' +
                '<span data-energy-level="' + ek + '" style="font-size:7px;font-weight:600;color:#6B7280;min-width:40px;text-align:left">--</span>' +
              '</div>';
            }).join('')}
            <div style="margin-top:6px;padding:6px 8px;background:#ffffff;border-radius:5px;border:1px solid #ede4d8;display:flex;gap:8px;align-items:center">
              <span style="font-size:8px;font-weight:600;color:#4B5563">Avg: <span data-energy-avg="w${index}" style="color:#2563eb;font-weight:700">--</span></span>
              <span style="font-size:8px;font-weight:600;color:#4B5563">High: <span data-energy-high="w${index}" style="color:#10b981;font-weight:700">--</span></span>
              <span style="font-size:8px;font-weight:600;color:#4B5563">Low: <span data-energy-low="w${index}" style="color:#ef4444;font-weight:700">--</span></span>
              <span style="flex:1"></span>
              <span style="font-size:7px;color:#4B5563">Click · drag · ← →</span>
            </div>
          </div>
        </div>
        <div style="margin-top:8px;padding:8px 10px;background:#fffbeb;border-radius:6px;border:1px solid #fde68a">
          <div style="font-size:8px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">End-of-Week Reflection</div>
          <div style="font-size:9px;color:#92400e;font-style:italic;margin-bottom:4px">What worked well this week?</div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>
        </div>`
      )
    );
  }

  private renderDailyPlanner(): string {
    const t = this.theme;
    const name = esc(this.values['name'] || 'Student');
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return this.pageWrap(
      this.pageHeader('Daily Layout', dateStr) +
      this.pageBody(
        `<div style="display:flex;align-items:center;gap:12px;margin:0 0 14px;padding:0 0 10px;border-bottom:1px solid #ede4d8">
          <div style="width:30px;height:30px;border-radius:8px;background:${t.light}20;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:${t.from}">${name.charAt(0)}</div>
          <div style="flex:1">
            <div style="font-size:11px;font-weight:700;color:#2d2a27;font-family:'Playfair Display',Outfit,serif">Today's Intention</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
        </div>
        <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">My Schedule</div>
        <div style="display:flex;flex-direction:column;gap:3px;margin:0 0 14px">
          ${[0,1,2,3,4,5,6,7].map(i => `
            <div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:#faf7f2;border-radius:5px;border:1px solid #ede4d8">
              <span style="width:28px;font-size:8px;font-weight:600;color:#4B5563;font-variant-numeric:tabular-nums">${['6:00','8:00','10:00','12:00','14:00','16:00','18:00','20:00'][i]}</span>
              <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc"></span>
              ${this.checkboxRow({ size: 10, borderColor: '#d4c9bc', writingLine: false, label: '', padding: '0', gap: 0 })}
            </div>
          `).join('')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">What MUST get done</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Evening Reflection</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
        </div>`
      )
    );
  }

  private renderHabitTracker(): string {
    const t = this.theme;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayLabels = ['M','T','W','T','F','S','S'];
    const HABIT_COUNT = 5;

    function dayLabelEl(d: number): string {
      const day = d + 1;
      const dow = new Date(year, month, day).getDay();
      return '<div style="width:22px;flex-shrink:0;text-align:center">' +
        '<div style="font-size:8px;font-weight:600;color:#6B7280;line-height:1;margin-bottom:1px">' + dayLabels[dow] + '</div>' +
        '<div style="font-size:10px;font-weight:700;color:#374151;line-height:1.2">' + day + '</div></div>';
    }

    function dayCellEl(i: number, d: number): string {
      const day = d + 1;
      return '<span data-habit-cell="' + i + '-' + day + '"' +
        ' style="width:22px;height:22px;flex-shrink:0;border:1.5px solid #e5e7eb;border-radius:4px;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 200ms ease;font-size:8px;color:#6B7280;box-sizing:border-box"' +
        ' title="' + day + '"></span>';
    }

    const gridMinWidth = 140 + daysInMonth * 22 + 64;

    // Stat cards
    var statCardsHtml = '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:0 0 16px">';
    var stats = [
      { key: 'completion', label: 'Completion', value: '0%' },
      { key: 'current-streak', label: 'Current Streak', value: '0d' },
      { key: 'best-streak', label: 'Best Streak', value: '0d' },
      { key: 'total', label: 'Total Completed', value: '0' },
      { key: 'remaining', label: 'Remaining', value: '0' },
    ];
    for (var si = 0; si < stats.length; si++) {
      var s = stats[si];
      statCardsHtml += '<div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:10px 4px;box-shadow:0 1px 2px rgba(0,0,0,0.03);text-align:center;min-width:0">' +
        '<div style="font-size:18px;font-weight:800;color:#2563eb" data-habit-stat="' + s.key + '">' + s.value + '</div>' +
        '<div style="font-size:8px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;white-space:nowrap">' + s.label + '</div></div>';
    }
    statCardsHtml += '</div>';

    // Grid header
    var headerCellsHtml = '';
    for (var d = 0; d < daysInMonth; d++) {
      headerCellsHtml += dayLabelEl(d);
    }

    var gridHeaderHtml = '<div style="display:flex;align-items:center;gap:2px;padding:8px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;min-width:' + gridMinWidth + 'px">' +
      '<div style="width:120px;flex-shrink:0;font-size:9px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em">Habit</div>' +
      headerCellsHtml +
      '<div style="width:64px;flex-shrink:0;text-align:center;font-size:9px;font-weight:600;color:#6B7280">Done</div></div>';

    // Habit rows
    var rowsHtml = '';
    for (var i = 0; i < HABIT_COUNT; i++) {
      var cellsHtml = '';
      for (var d = 0; d < daysInMonth; d++) {
        cellsHtml += dayCellEl(i, d);
      }
      rowsHtml += '<div style="display:flex;align-items:center;gap:2px;padding:5px 12px;border-bottom:1px solid #f3f4f6;min-width:' + gridMinWidth + 'px">' +
        '<span style="width:120px;height:18px;flex-shrink:0;border-bottom:1.5px solid #d4c9bc;padding:0 4px;font-size:11px;font-weight:500;color:#374151;line-height:18px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">___</span>' +
        cellsHtml +
        '<div style="width:64px;flex-shrink:0;display:flex;align-items:center;gap:4px;padding-right:2px">' +
        '<div style="flex:1;height:4px;background:#f3f4f6;border-radius:2px;position:relative;overflow:hidden">' +
        '<div style="position:absolute;top:0;left:0;height:100%;width:0%;background:#2563eb;border-radius:2px;transition:width 200ms ease" data-habit-progress="' + i + '"></div></div>' +
        '<span style="font-size:8px;font-weight:600;color:#6B7280;width:20px;text-align:right" data-habit-count="' + i + '">0</span></div></div>';
    }

    return this.pageWrap(
      this.pageHeader('Habit Grid', monthName) +
      this.pageBody(
        statCardsHtml +
        '<div style="background:white;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin:0 0 14px">' +
        '<div style="overflow-x:auto">' +
        '<div style="min-width:' + gridMinWidth + 'px">' +
        gridHeaderHtml +
        rowsHtml +
        '</div></div></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
        '<div style="font-size:8px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Why These Habits Matter</div>' +
        '<div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>' +
        '<div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div></div>' +
        '<div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
        '<div style="font-size:8px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Toughest Habit To Keep</div>' +
        '<div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>' +
        '<div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div></div></div>' +
        '<div style="display:flex;align-items:center;gap:10px;margin-top:10px;font-size:8px;font-weight:600;color:#6B7280">' +
        '<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:3px;background:#2563eb;border:1.5px solid #2563eb"></span> Completed</span>' +
        '<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:3px;background:white;border:1.5px solid #e5e7eb"></span> Missed</span></div>'
      )
    );
  }

  private renderMonthlyReview(): string {
    const t = this.theme;
    const now = new Date();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return this.pageWrap(
      this.pageHeader('Monthly Reflection', monthName) +
      this.pageBody(
        `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 18px">
          ${[
            { label: 'Hours Studied', value: '___h', color: t.from, bg: t.light + '20' },
            { label: 'Sessions', value: '___', color: '#065f46', bg: '#ecfdf5' },
            { label: 'Avg Score', value: '___%', color: '#92400e', bg: '#fffbeb' },
          ].map(s => `
            <div style="background:${s.bg};border-radius:8px;padding:8px 4px;text-align:center;border:1px solid ${s.color}15">
              <div style="font-size:16px;font-weight:900;color:${s.color}"><span style="height:20px;border-bottom:1.5px solid ${s.color}33;font-weight:500;font-size:16px;padding:0;line-height:20px;display:inline-block;min-width:24px">${s.value}</span></div>
              <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em">${s.label}</div>
            </div>
          `).join('')}
        </div>
        <div style="background:#ecfdf5;border-radius:8px;padding:10px 12px;border:1px solid #bbf7d0;margin:0 0 10px">
          <div style="font-size:7px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">My Proudest Moment This Month</div>
          <div style="height:16px;border-bottom:1.5px solid #a7f3d0;margin-bottom:3px"></div>
          <div style="height:16px;border-bottom:1.5px solid #a7f3d0"></div>
        </div>
        <div style="background:#fef2f2;border-radius:8px;padding:10px 12px;border:1px solid #fecaca;margin:0 0 12px">
          <div style="font-size:7px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">What I'd Do Differently</div>
          <div style="height:16px;border-bottom:1.5px solid #fca5a5;margin-bottom:3px"></div>
          <div style="height:16px;border-bottom:1.5px solid #fca5a5"></div>
        </div>
        <div style="background:#faf7f2;border-radius:8px;padding:10px 12px;border:1px solid #ede4d8;margin:0 0 12px">
          <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Next Month I Commit To</div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1.5px solid #d4c9bc">
              <span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid ${t.from + '66'};background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span>
              <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1.5px solid #d4c9bc">
              <span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span>
              <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:4px 0">
              <span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span>
              <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span>
            </div>
          </div>
        </div>
        <div style="background:#faf7f2;border-radius:8px;padding:8px 10px;border:1px solid #ede4d8">
          <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Brain Dump — Anything On My Mind</div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
        </div>`
      )
    );
  }

  private renderReflection(): string {
    const t = this.theme;
    const now = new Date();
    const weekLabel = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + ' – ' + new Date(now.getTime() + 6 * 864e5).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return this.pageWrap(
      this.pageHeader('Reflection Journal', weekLabel) +
      this.pageBody(
        `<div style="margin:0 0 12px;padding:8px 12px;background:${t.light}12;border-radius:6px;border-left:3px solid ${t.from}">
          <div style="font-size:9px;color:#2d2a27;line-height:1.5;font-style:italic;font-family:'Playfair Display',Outfit,serif">"What did I learn about myself this week?"</div>
        </div>
        <div style="background:#ecfdf5;border-radius:6px;padding:8px 10px;border:1px solid #bbf7d0;margin:0 0 10px">
          <div style="font-size:8px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">My Wins This Week</div>
          <div style="height:16px;border-bottom:1.5px solid #a7f3d0;margin-bottom:3px"></div>
          <div style="height:16px;border-bottom:1.5px solid #a7f3d0;margin-bottom:3px"></div>
          <div style="height:16px"></div>
        </div>
        <div style="background:#fef2f2;border-radius:6px;padding:8px 10px;border:1px solid #fecaca;margin:0 0 10px">
          <div style="font-size:8px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Challenges I Faced</div>
          <div style="height:16px;border-bottom:1.5px solid #fca5a5;margin-bottom:3px"></div>
          <div style="height:16px;border-bottom:1.5px solid #fca5a5;margin-bottom:3px"></div>
          <div style="height:16px"></div>
        </div>
        <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8;margin:0 0 10px">
          <div style="font-size:9px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">What Worked Well</div>
          <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1.5px solid #d4c9bc">
            <span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span>
            <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1.5px solid #d4c9bc">
            <span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span>
            <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:5px 0">
            <span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span>
            <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span>
          </div>
        </div>
        <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8;margin:0 0 10px">
          <div style="font-size:9px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Next Week I Want To…</div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px">___</div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px">___</div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#fffbeb;border-radius:5px;border:1px solid #fde68a">
          <span style="font-size:7px;font-weight:700;color:#92400e">✦</span>
          <span style="font-size:8px;color:#92400e;font-style:italic;flex-shrink:0">Something I'm grateful for:</span>
          <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block">___</span>
        </div>
        <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Self-Assessment</div>
            <div style="display:flex;gap:6px;margin-bottom:3px;align-items:center">
              <span style="font-size:8px;color:#6B7280">Energy</span>
              ${this.progressTrack({ groupKey: 'progress-energy', height: 3 })}
              <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block" data-progress-input="progress-energy" data-progress-max="10">___/10</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              <span style="font-size:8px;color:#6B7280">Focus</span>
              ${this.progressTrack({ groupKey: 'progress-focus', height: 3 })}
              <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block" data-progress-input="progress-focus" data-progress-max="10">___/10</span>
            </div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">What Surprised Me This Week?</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px">___</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>
          </div>
        </div>
        <div style="margin-top:8px;padding:8px 10px;background:${t.light}10;border-radius:6px;border-left:3px solid ${t.from}">
          <div style="font-size:8px;color:#57534e;font-style:italic;margin-bottom:4px">My intention for next week:</div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc">___</div>
        </div>`
      )
    );
  }

  private renderAchievementDashboard(): string {
    const t = this.theme;
    return this.pageWrap(
      this.pageHeader('My Achievements', '') +
      this.pageBody(
        `<div data-study-streak style="margin:0 0 14px;padding:14px 16px;background:linear-gradient(135deg,${t.from}08,${t.light}15);border-radius:12px;border:1px solid ${t.from}25;text-align:center;-webkit-user-select:none;user-select:none">
          <div style="font-size:10px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Current Study Streak</div>
          <div style="display:flex;align-items:baseline;justify-content:center;gap:6px;margin-bottom:8px">
            <span data-streak-value style="font-size:34px;font-weight:900;color:${t.from};line-height:1">0</span>
            <span style="font-size:12px;font-weight:600;color:#6B7280">days</span>
          </div>
          <div data-streak-grid style="display:flex;gap:5px;justify-content:center">
            ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, i) =>
              `<span data-streak-day="${i}" tabindex="0" role="checkbox" aria-checked="false" aria-label="${label}: Not studied" style="width:28px;height:28px;border-radius:6px;background:#ede4d8;border:1.5px solid #d4c9bc;cursor:pointer;transition:all 200ms cubic-bezier(0.4,0,0.2,1);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#6B7280;outline:none" data-day-label="${label}">${label.substring(0,1)}</span>`
            ).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;padding:0 2px">
            <span style="font-size:7px;font-weight:600;color:#6B7280">Last 7 days</span>
            <span style="font-size:7px;font-weight:700;color:${t.from}"><span data-streak-pct>0</span>% complete</span>
          </div>
          <div style="margin-top:2px;font-size:7px;color:#6B7280;font-weight:500"><span data-streak-total>0</span> study days this week</div>
        </div>
        <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">My Semester Accomplishments</div>
        <div style="background:#faf7f2;border-radius:6px;padding:0 10px;border:1px solid #ede4d8;margin:0 0 12px">
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">
            ${this.checkboxRow({ size: 14, themeColor: t.from + '66', writingLine: true, borderBottom: '1px dashed #e7e5e4' })}
            <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:7px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block">Date ___</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">
            ${this.checkboxRow({ size: 14, borderColor: '#d4c9bc', writingLine: true, borderBottom: '1px dashed #e7e5e4' })}
            <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:7px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block">Date ___</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">
            ${this.checkboxRow({ size: 14, borderColor: '#d4c9bc', writingLine: true, borderBottom: '1px dashed #e7e5e4' })}
            <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:7px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block">Date ___</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0">
            ${this.checkboxRow({ size: 14, borderColor: '#d4c9bc', writingLine: true, borderBottom: '1px dashed #e7e5e4' })}
            <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:7px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block">Date ___</span>
          </div>
        </div>
        <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">Milestone Progress</div>
        <div style="background:#faf7f2;border-radius:6px;padding:10px 12px;border:1px solid #ede4d8;margin:0 0 12px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em">Next Target</span>
            ${this.progressTrack({ groupKey: 'progress-milestone', height: 5 })}
            <span style="font-size:8px;font-weight:700;color:${t.from}"><span style="height:14px;border-bottom:1.5px solid ${t.from}33;font-weight:500;font-size:8px;padding:0;line-height:14px;display:inline-block;min-width:20px" data-progress-input="progress-milestone" data-progress-max="100">___%</span></span>
          </div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 12px">
          <div style="background:#ecfdf5;border-radius:6px;padding:8px 10px;border:1px solid #bbf7d0">
            <div style="font-size:7px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Personal Reward</div>
            <div style="height:16px;border-bottom:1.5px solid #a7f3d0;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #a7f3d0"></div>
          </div>
          <div style="background:#fffbeb;border-radius:6px;padding:8px 10px;border:1px solid #fde68a">
            <div style="font-size:7px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">End-of-Semester Goal</div>
            <div style="height:16px;border-bottom:1.5px solid #fde68a;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #fde68a"></div>
          </div>
        </div>
        <div style="padding:8px 12px;background:${t.light}10;border-radius:6px;border-left:3px solid ${t.from}">
          <div style="font-size:8px;color:#57534e;font-style:italic;line-height:1.4">Every streak starts with one day. Keep going.</div>
        </div>`
      )
    );
  }

  private renderStudyHeatmap(): string {
    const t = this.theme;
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return this.pageWrap(
      this.pageHeader('Study Heatmap', '') +
      this.pageBody(
        `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 14px">
          ${[
            { label: 'Total Hours', value: '___h', color: t.from, bg: t.light + '20' },
            { label: 'Daily Avg', value: '___h', color: '#065f46', bg: '#ecfdf5' },
            { label: 'Best Day', value: '___', color: '#92400e', bg: '#fffbeb' },
          ].map(s => `
            <div style="background:${s.bg};border-radius:8px;padding:8px 4px;text-align:center;border:1px solid ${s.color}15">
              <div style="font-size:14px;font-weight:900;color:${s.color}"><span style="height:18px;border-bottom:1.5px solid ${s.color}33;font-weight:500;font-size:14px;padding:0;line-height:18px;display:inline-block;min-width:24px">${s.value}</span></div>
              <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em">${s.label}</div>
            </div>
          `).join('')}
        </div>
        <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">Log My Hours</div>
        <div style="display:flex;flex-direction:column;gap:4px;margin:0 0 14px">
          ${weekDays.map((day, i) => {
            const key = 'progress-hours-day-' + i;
            return '<div style="display:flex;align-items:center;gap:8px">' +
              '<span style="min-width:28px;font-size:8px;font-weight:700;color:#4B5563">' + day + '</span>' +
              this.progressTrack({ groupKey: key, height: 18, trackColor: '#f0eeeb', rounded: 4 }) +
              '<span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;color:#2d2a27;padding:0 2px;line-height:16px;display:inline-block;min-width:24px;text-align:right" data-progress-input="' + key + '" data-progress-max="24">___h</span>' +
            '</div>';
          }).join('')}
        </div>
        <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">My Study Goal for Next Week</div>
        <div style="background:#faf7f2;border-radius:6px;padding:0 10px;border:1px solid #ede4d8;margin:0 0 12px">
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">
            <span style="font-size:8px;font-weight:700;color:#4B5563">I want to study</span>
            <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc"></span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0">
            <span style="font-size:8px;font-weight:700;color:#4B5563">My focus subject</span>
            <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc"></span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">What Distracted Me This Week?</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Most Productive Time</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
        </div>`
      )
    );
  }

  private renderWeeklyFocusBoard(): string {
    const t = this.theme;
    return this.pageWrap(
      this.pageHeader('Weekly Focus Board', '') +
      this.pageBody(
        `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 14px">
          ${[
            { label: 'Total Tasks', value: '___', color: t.from, bg: t.light + '20' },
            { label: 'Must Do', value: '___', color: '#991b1b', bg: '#fef2f2' },
            { label: 'Nice To Do', value: '___', color: '#065f46', bg: '#ecfdf5' },
          ].map(s => `
            <div style="background:${s.bg};border-radius:8px;padding:8px 4px;text-align:center;border:1px solid ${s.color}15">
              <div style="font-size:14px;font-weight:900;color:${s.color}"><span style="height:18px;border-bottom:1.5px solid ${s.color}33;font-weight:500;font-size:14px;padding:0;line-height:18px;display:inline-block;min-width:24px">${s.value}</span></div>
              <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em">${s.label}</div>
            </div>
          `).join('')}
        </div>
        <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">What MUST Get Done This Week</div>
        <div style="background:#faf7f2;border-radius:6px;padding:2px 10px;border:1px solid #ede4d8;margin:0 0 12px">
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">
            ${this.checkboxRow({ size: 14, borderColor: '#ef4444', writingLine: true, borderBottom: '1px dashed #e7e5e4' })}
            <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:7px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block">___h</span>
          </div>
<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">
            ${this.checkboxRow({ size: 14, borderColor: '#ef4444', writingLine: true, borderBottom: '1px dashed #e7e5e4' })}
            <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block">___h</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">
            ${this.checkboxRow({ size: 14, borderColor: '#ef4444', writingLine: true, borderBottom: '1px dashed #e7e5e4' })}
            <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block">___h</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0">
            ${this.checkboxRow({ size: 14, borderColor: '#d4c9bc', writingLine: true, borderBottom: '1px dashed #e7e5e4' })}
            <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;color:#6B7280;padding:0 2px;line-height:16px;display:inline-block">___h</span>
          </div>
        </div>
        <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:6px;font-family:'Playfair Display',Outfit,serif">My Weekly Commitment</div>
        <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8;margin:0 0 10px">
          <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">What Can Wait?</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div style="background:#faf7f2;border-radius:6px;padding:8px 10px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Reward When Done</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
        </div>`
      )
    );
  }

  private renderExamStrategy(): string {
    const NB = '#2563eb';
    const NG = '#10b981';
    const NR = '#ef4444';
    const NA = '#f59e0b';
    const NC = '#6b7280';
    const cardBg = 'white';
    const cardBorder = '#e5e7eb';

    const _self = this;
    function renderSectionCard(i: number): string {
      const key = 'exam-strategy-conf-' + i;
      return '<div style="background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:10px;padding:8px 12px;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">' +
          '<div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0">' +
            '<span style="width:6px;height:6px;border-radius:50%;background:' + NB + ';flex-shrink:0"></span>' +
            '<span style="height:16px;border-bottom:1.5px solid ' + cardBorder + ';font-size:11px;font-weight:500;color:#2d2a27;padding:0 4px;line-height:16px;display:inline-block;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" data-er="exam-strategy-section-name-' + i + '">Section ' + (i + 1) + '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">' +
            '<span style="font-size:8px;font-weight:600;color:' + NC + ';white-space:nowrap">Conf:</span>' +
            '<span style="height:14px;border-bottom:1.5px solid ' + cardBorder + ';font-size:9px;font-weight:700;color:' + NB + ';padding:0 2px;line-height:14px;display:inline-block;min-width:16px;text-align:center" data-progress-input="' + key + '" data-progress-max="10">5</span>' +
            '<input type="range" min="1" max="10" value="5" step="1" data-er-range="exam-strategy-conf-' + i + '" style="width:60px;accent-color:' + NB + ';">' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">' +
          '<span style="font-size:8px;font-weight:600;color:' + NC + ';white-space:nowrap">Est:</span>' +
          '<span style="height:14px;border-bottom:1.5px solid ' + cardBorder + ';font-size:8px;font-weight:500;color:#374151;padding:0 2px;line-height:14px;display:inline-block;min-width:20px">___</span>' +
          '<span style="font-size:8px;color:' + NC + '">min</span>' +
          '<div style="flex:1"></div>' +
          '<span style="font-size:8px;font-weight:600;color:' + NC + '">Diff:</span>' +
          _self.circleGroup({ groupKey: 'exam-strategy-diff-' + i, count: 3, size: 8, colors: [NA + '99', NA, NR], gap: 3 }) +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          '<span style="font-size:8px;font-weight:600;color:' + NC + ';white-space:nowrap">Priority:</span>' +
          '<span style="font-size:8px;font-weight:700;color:' + NR + ';background:' + NR + '08;padding:1px 8px;border-radius:4px" data-exam-priority="' + i + '">—</span>' +
          '<div style="flex:1"></div>' +
          _self.progressTrack({ groupKey: key, height: 3 }) +
        '</div>' +
      '</div>';
    }

    function timelineRow(i: number, plannedReview: boolean): string {
      const isToday = i === 2;
      const colors = [NG, NR, NB, NC, NC];
      const labels = ['Completed', 'Missed', 'Today', 'Upcoming', 'Upcoming'];
      const color = colors[i];
      const label = labels[i];
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;background:${isToday ? '#eff6ff' : 'white'};border:1px solid ${isToday ? '#bfdbfe' : cardBorder}">
        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;width:50px">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></span>
          <span style="font-size:8px;font-weight:600;color:${color}">Day ${i + 1}</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;flex:1;min-width:0">
          ${isToday ? `<span style="font-size:8px;font-weight:700;color:${NB};background:${NB}10;padding:1px 6px;border-radius:3px">✦ Today</span>` : ''}
          <span style="height:14px;border-bottom:1.5px solid ${cardBorder};font-size:8px;font-weight:500;color:#374151;padding:0 4px;line-height:14px;display:inline-block;flex:1;min-width:0" data-er="exam-strategy-timeline-${i}">${isToday ? 'Studying' : (i < 2 ? 'Reviewed ' : '')}${plannedReview ? ' ● Plan' : ''}</span>
        </div>
        <span style="font-size:8px;font-weight:600;color:${color};background:${color}10;padding:2px 8px;border-radius:4px;flex-shrink:0">${label}</span>
      </div>`;
    }

    const sectionsHtml = (function(n: number): string {
      var r = '';
      for (var i = 0; i < n; i++) { r += renderSectionCard(i); }
      return r;
    })(3);

    const timelineHtml = (function(n: number): string {
      var r = '';
      for (var i = 0; i < n; i++) { r += timelineRow(i, true); }
      return r;
    })(5);

    return this.pageWrap(
      this.pageHeader('Exam Strategy', '') +
      this.pageBody(
        // Stats row
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0 0 10px">' +
          '<div style="background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:10px;padding:8px 8px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
            '<div style="font-size:20px;font-weight:800;color:' + NB + '" data-exam-stat="readiness">0%</div>' +
            '<div style="font-size:8px;font-weight:600;color:' + NC + ';text-transform:uppercase;letter-spacing:0.05em;margin-top:2px">Readiness</div></div>' +
          '<div style="background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:10px;padding:8px 8px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
            '<div style="font-size:20px;font-weight:800;color:' + NA + '"><span style="height:22px;border-bottom:1.5px solid ' + NA + '33;font-weight:500;font-size:20px;padding:0;line-height:22px;display:inline-block;min-width:24px">___</span></div>' +
            '<div style="font-size:8px;font-weight:600;color:' + NC + ';text-transform:uppercase;letter-spacing:0.05em;margin-top:2px">Days Left</div></div>' +
          '<div style="background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:10px;padding:8px 8px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
            '<div style="font-size:20px;font-weight:800;color:' + NG + '"><span style="height:22px;border-bottom:1.5px solid ' + NG + '33;font-weight:500;font-size:20px;padding:0;line-height:22px;display:inline-block;min-width:24px">___/3</span></div>' +
            '<div style="font-size:8px;font-weight:600;color:' + NC + ';text-transform:uppercase;letter-spacing:0.05em;margin-top:2px">Sections</div></div>' +
          '<div style="background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:10px;padding:8px 8px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
            '<div style="font-size:20px;font-weight:800;color:#374151"><span style="height:22px;border-bottom:1.5px solid #37415133;font-weight:500;font-size:20px;padding:0;line-height:22px;display:inline-block;min-width:24px">___h</span></div>' +
            '<div style="font-size:8px;font-weight:600;color:' + NC + ';text-transform:uppercase;letter-spacing:0.05em;margin-top:2px">Time Total</div></div>' +
        '</div>' +
        // Readiness card with ring
        '<div style="display:flex;align-items:center;gap:16px;background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:12px;padding:10px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin:0 0 10px">' +
          '<div data-exam-ring style="position:relative;display:inline-block">' +
            '<svg width="72" height="72" viewBox="0 0 72 72" style="transform:rotate(-90deg);display:block">' +
              '<circle cx="36" cy="36" r="32" fill="none" stroke="#e5e7eb" stroke-width="3"/>' +
              '<circle data-exam-ring-fill="" cx="36" cy="36" r="32" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="201.06" stroke-dashoffset="201.06" stroke-linecap="round" style="transition:stroke-dashoffset 300ms ease"/>' +
            '</svg>' +
            '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
              '<span data-exam-ring-pct="" style="font-size:16px;font-weight:800;color:#2d2a27">0%</span>' +
            '</div>' +
          '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:12px;font-weight:700;color:#2d2a27;margin-bottom:2px">Exam Readiness</div>' +
            '<div style="font-size:8px;color:' + NC + ';margin-bottom:6px" data-exam-stat="readiness-label">Enter section confidences to see your readiness score</div>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
              '<div style="display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:' + NG + '"></span><span style="font-size:7px;color:' + NC + '" data-exam-stat="strong-count">0 strong</span></div>' +
              '<div style="display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:' + NA + '"></span><span style="font-size:7px;color:' + NC + '" data-exam-stat="medium-count">0 medium</span></div>' +
              '<div style="display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:' + NR + '"></span><span style="font-size:7px;color:' + NC + '" data-exam-stat="weak-count">0 weak</span></div>' +
            '</div>' +
          '</div>' +
          '<div style="flex-shrink:0;text-align:right">' +
            '<div style="font-size:7px;font-weight:600;color:' + NC + ';margin-bottom:2px">Action</div>' +
            '<div style="font-size:9px;font-weight:600;color:' + NB + '" data-exam-stat="action-badge">Set confidences</div>' +
          '</div>' +
        '</div>' +
        // Section Planner cards
        '<div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:6px;display:flex;align-items:center;gap:6px">' +
          '<span style="width:4px;height:4px;border-radius:50%;background:' + NB + '"></span>Plan Each Section' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:5px;margin:0 0 10px">' +
          sectionsHtml +
        '</div>' +
        // Priority Matrix
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 10px">' +
          '<div style="background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:10px;padding:8px 12px;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">' +
              '<span style="font-size:12px">⚡</span>' +
              '<span style="font-size:9px;font-weight:700;color:#374151">Strong Areas</span>' +
            '</div>' +
            '<div style="font-size:8px;color:' + NC + ';margin-bottom:5px" data-exam-stat="strong-areas">Enter section confidences above</div>' +
            '<div style="height:14px;border-bottom:1.5px solid ' + cardBorder + ';margin-bottom:3px"></div>' +
            '<div style="height:14px;border-bottom:1.5px solid ' + cardBorder + '"></div>' +
          '</div>' +
          '<div style="background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:10px;padding:8px 12px;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">' +
              '<span style="font-size:12px">⚠️</span>' +
              '<span style="font-size:9px;font-weight:700;color:#374151">Areas to Improve</span>' +
            '</div>' +
            '<div style="font-size:8px;color:' + NC + ';margin-bottom:5px" data-exam-stat="weak-areas">Enter section confidences above</div>' +
            '<div style="height:14px;border-bottom:1.5px solid ' + cardBorder + ';margin-bottom:3px"></div>' +
            '<div style="height:14px;border-bottom:1.5px solid ' + cardBorder + '"></div>' +
          '</div>' +
        '</div>' +
        // Revision Timeline
        '<div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:6px;display:flex;align-items:center;gap:6px">' +
          '<span style="width:4px;height:4px;border-radius:50%;background:' + NB + '"></span>Revision Timeline' +
          '<span style="font-size:7px;font-weight:500;color:' + NC + ';margin-left:auto">Next 5 days</span>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:4px;margin:0 0 10px">' +
          timelineHtml +
        '</div>' +
        // Smart Recommendations
        '<div style="background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:10px;padding:10px 14px;box-shadow:0 1px 2px rgba(0,0,0,0.03);margin:0 0 10px;border-left:3px solid ' + NB + '">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">' +
            '<span style="font-size:12px">🧠</span>' +
            '<span style="font-size:9px;font-weight:700;color:#374151">Smart Recommendations</span>' +
          '</div>' +
          '<div style="font-size:8px;color:' + NC + ';line-height:1.5" data-exam-strategy-recommendation="main">Enter section confidences and difficulty to get personalized study recommendations.</div>' +
        '</div>' +
        // Bottom row: Checklist + Notes
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<div style="background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:10px;padding:8px 12px;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">' +
              '<span style="font-size:11px">📋</span>' +
              '<span style="font-size:9px;font-weight:700;color:#374151">Exam Day Checklist</span>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:3px">' +
              (function(n: number): string {
                var r = '';
                for (var i = 0; i < n; i++) {
                  r += '<div style="display:flex;align-items:center;gap:6px;padding:2px 0;border-bottom:1px dashed #f3f4f6">' +
                    '<span class="pp-cb" style="width:12px;height:12px;border:1.5px solid #d4c9bc;border-radius:3px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:transparent;transition:all 150ms ease"></span>' +
                    '<span style="height:14px;border-bottom:1.5px solid ' + cardBorder + ';font-size:8px;font-weight:500;color:#374151;padding:0 4px;line-height:14px;display:inline-block;flex:1;min-width:0">___</span></div>';
                }
                return r;
              })(5) +
            '</div>' +
          '</div>' +
          '<div style="background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:10px;padding:8px 12px;box-shadow:0 1px 2px rgba(0,0,0,0.03)">' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">' +
              '<span style="font-size:11px">💭</span>' +
              '<span style="font-size:9px;font-weight:700;color:#374151">My Biggest Worry</span>' +
            '</div>' +
            '<div style="height:14px;border-bottom:1.5px solid ' + cardBorder + ';margin-bottom:3px"></div>' +
            '<div style="height:14px;border-bottom:1.5px solid ' + cardBorder + ';margin-bottom:3px"></div>' +
            '<div style="height:14px;border-bottom:1.5px solid ' + cardBorder + '"></div>' +
          '</div>' +
        '</div>'
      )
    );
  }

  private renderAssignmentDashboard(): string {
    const t = this.theme;
    const statCard = (value: string, label: string, color: string, bg: string, border: string) => `
      <div style="background:${bg};border-radius:12px;padding:14px 16px;border:1px solid ${border};display:flex;flex-direction:column;gap:3px">
        <div style="font-size:22px;font-weight:900;color:${color};letter-spacing:-0.02em"><span style="height:24px;border-bottom:1.5px solid ${color}33;font-weight:500;font-size:22px;padding:0;line-height:24px;display:inline-block;min-width:28px">${value}</span></div>
        <div style="font-size:8px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em">${label}</div>
      </div>
    `;
    const timelineEvents = Array.from({length: 4}, (_, i) => `
      <div style="display:flex;align-items:center;gap:14px;padding:8px 0;${i < 3 ? 'border-bottom:1px solid #f0ebe3' : ''}">
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0;width:32px">
          <span style="width:10px;height:10px;border-radius:50%;border:2px solid ${i === 0 ? t.from : '#d4c9bc'};${i === 0 ? 'background:' + t.from : ''}"></span>
          ${i < 3 ? '<span style="width:1px;height:20px;background:#ede4d8"></span>' : ''}
        </div>
        <div style="flex:2;height:16px;border-bottom:1.5px solid #d4c9bc"></div>
        <div style="flex:3;height:16px;border-bottom:1.5px solid #d4c9bc"></div>
        <div style="width:40px;height:16px;border-bottom:1.5px solid #d4c9bc"></div>
      </div>
    `).join('');
    return this.pageWrap(
      this.pageHeader('Assignment Dashboard', 'Semester Overview') +
      this.pageBody(
        `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:18px">
          ${statCard('___', 'Total Assignments', '#2d2a27', '#faf7f2', '#ede4d8')}
          ${statCard('___', 'Completed', '#065f46', '#ecfdf5', '#bbf7d0')}
          ${statCard('___', 'High Priority', '#991b1b', '#fef2f2', '#fecaca')}
          ${statCard('___', 'Avg Grade', t.from, t.light + '18', t.light + '40')}
        </div>
        <div style="margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:9px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em">Semester Progress</span>
            <span style="font-size:8px;font-weight:700;color:#2d2a27"><span style="height:14px;border-bottom:1.5px solid #2d2a2733;font-weight:500;font-size:8px;padding:0;line-height:14px;display:inline-block;min-width:20px" data-progress-input="progress-semester" data-progress-max="100">___%</span></span>
          </div>
          ${this.progressTrack({ groupKey: 'progress-semester', height: 4 })}
        </div>
        <div style="display:flex;gap:14px;margin-bottom:18px">
          <div style="flex:1;background:#faf7f2;border-radius:10px;padding:12px 14px;border:1px solid #ede4d8">
            <div style="font-size:10px;font-weight:700;color:#2d2a27;font-family:'Playfair Display',Outfit,serif;margin-bottom:8px">Upcoming This Week</div>
            ${Array.from({length: 4}, (_, i) => `
              <div style="display:flex;align-items:center;gap:8px;padding:5px 0;${i < 3 ? 'border-bottom:1px solid #f0ebe3' : ''}">
                <span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid ${i === 0 ? t.from + '66' : '#d4c9bc'};background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span>
                <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0 2px;line-height:16px;display:inline-block">___</span>
                <span style="height:16px;border-bottom:1.5px solid #d4c9bc;font-size:8px;font-weight:500;color:#4B5563;padding:0 2px;line-height:16px;display:inline-block;min-width:40px;text-align:center">___/___</span>
              </div>
            `).join('')}
          </div>
          <div style="flex:1;background:#faf7f2;border-radius:10px;padding:12px 14px;border:1px solid #ede4d8">
            <div style="font-size:10px;font-weight:700;color:#065f46;font-family:'Playfair Display',Outfit,serif;margin-bottom:8px">Recently Completed</div>
            ${Array.from({length: 3}, (_, i) => `
              <div style="display:flex;align-items:center;gap:8px;padding:5px 0;${i < 2 ? 'border-bottom:1px solid #f0ebe3' : ''}">
                <span class="pp-cb" style="width:12px;height:12px;border-radius:3px;border:1.5px solid #10b981;background:#10b981;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">
                  <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;padding:0 2px;line-height:16px;display:inline-block">___</span>
                <span style="font-size:8px;font-weight:600;color:#4B5563;flex-shrink:0">${['Today', 'Yesterday', '2 days ago'][i]}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="background:#faf7f2;border-radius:10px;padding:12px 14px;border:1px solid #ede4d8;margin-bottom:14px">
          <div style="font-size:10px;font-weight:700;color:#2d2a27;font-family:'Playfair Display',Outfit,serif;margin-bottom:8px">Deadline Timeline</div>
          <div style="padding:0 4px">${timelineEvents}</div>
        </div>
        <div style="background:#faf7f2;border-radius:10px;padding:12px 14px;border:1px solid #ede4d8">
          <div style="font-size:10px;font-weight:700;color:#2d2a27;font-family:'Playfair Display',Outfit,serif;margin-bottom:6px">Semester Notes</div>
          <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
          <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
          <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
          <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
          <div style="height:18px"></div>
        </div>`
      )
    );
  }

  private renderAssignmentLog(): string {
    const t = this.theme;
    const row = (index: number, isLast: boolean) => `
      <div style="display:flex;align-items:center;gap:8px;padding:7px 0 ${isLast ? '7' : '6'}px 0;${!isLast ? 'border-bottom:1px solid #f0ebe3' : ''}">
        ${this.checkboxRow({ size: 14, borderColor: '#d4c9bc', writingLine: false })}<div style="width:90px;flex-shrink:0"><div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div></div>
        <div style="flex:2;min-width:80px"><div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div></div>
        <div style="width:60px;flex-shrink:0"><div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div></div>
        ${this.circleGroup({ groupKey: 'priority-log-' + index, count: 3, size: 8, colors: ['#10b981','#f59e0b','#ef4444'], labels: ['Low','Med','High'] })}
        <div style="display:flex;align-items:center;gap:2px;flex-shrink:0">
          ${this.checkboxRow({ size: 8, borderColor: '#d4c9bc', writingLine: false, gap: 2, padding: '0' })}
          ${this.checkboxRow({ size: 8, borderColor: '#d4c9bc', writingLine: false, gap: 2, padding: '0' })}
          ${this.checkboxRow({ size: 8, borderColor: '#d4c9bc', writingLine: false, gap: 2, padding: '0' })}
        </div>
        <div style="width:40px;flex-shrink:0"><div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div></div>
        <div style="width:35px;flex-shrink:0"><div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div></div>
        <div style="flex:1;min-width:60px"><div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div></div>
      </div>`;
    return this.pageWrap(
      this.pageHeader('Assignment Log', '') +
      this.pageBody(
        `<div style="margin-bottom:4px;display:flex;align-items:center;gap:8px;padding:0 0 6px 0;border-bottom:1.5px solid #d4c9bc">
          <span style="width:14px;flex-shrink:0"></span>
          <span style="width:90px;font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;flex-shrink:0">Subject</span>
          <span style="flex:2;font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;min-width:80px">Assignment</span>
          <span style="width:60px;font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;flex-shrink:0">Due</span>
          <span style="width:50px;font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;flex-shrink:0;text-align:center">Priority</span>
          <span style="width:50px;font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;flex-shrink:0;text-align:center">Status</span>
          <span style="width:40px;font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;flex-shrink:0">Hours</span>
          <span style="width:35px;font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;flex-shrink:0">Grade</span>
          <span style="flex:1;font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;min-width:60px">Notes</span>
        </div>
        ${Array.from({length: 12}, (_, i) => row(i, i === 11)).join('')}`
      )
    );
  }

  private renderAssignmentPlanning(): string {
    const t = this.theme;
    return this.pageWrap(
      this.pageHeader('Assignment Planning', 'Plan & Execute') +
      this.pageBody(
        `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px">
          <div style="background:#faf7f2;border-radius:8px;padding:10px 12px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Assignment</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div style="background:#faf7f2;border-radius:8px;padding:10px 12px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Subject</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div style="background:#faf7f2;border-radius:8px;padding:10px 12px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Due Date</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div style="background:#faf7f2;border-radius:8px;padding:10px 12px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Priority</div>
            <div style="display:flex;align-items:center;gap:10px;padding:2px 0">
              ${this.circleGroup({ groupKey: 'priority-planning', count: 3, size: 10, colors: ['#10b981','#f59e0b','#ef4444'] })}
            </div>
          </div>
          <div style="background:#faf7f2;border-radius:8px;padding:10px 12px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Est. Time</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div style="background:#faf7f2;border-radius:8px;padding:10px 12px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Weight %</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
        </div>
        <div style="font-size:11px;font-weight:700;color:#2d2a27;margin-bottom:8px;font-family:'Playfair Display',Outfit,serif">Checklist</div>
        <div style="background:#faf7f2;border-radius:8px;padding:0 12px;border:1px solid #ede4d8;margin-bottom:18px">
          ${['Research', 'Outline', 'First Draft', 'Review', 'Final Edits', 'Submit'].map((item, i) => `
            <div style="display:flex;align-items:center;gap:8px;padding:7px 0;${i < 5 ? 'border-bottom:1px solid #ede4d8' : ''}">
              ${this.checkboxRow({ size: 14, borderColor: '#d4c9bc', writingLine: false, label: item, labelSize: 8, labelColor: '#6B7280' })}
              <span style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc"></span>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:14px;margin-bottom:18px">
          <div style="flex:1;background:#faf7f2;border-radius:8px;padding:10px 12px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Notes</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
            <div style="height:18px"></div>
          </div>
          <div style="flex:1;background:#faf7f2;border-radius:8px;padding:10px 12px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Resources</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc;margin-bottom:4px"></div>
            <div style="height:18px"></div>
          </div>
          <div style="flex:0 0 104px;background:#faf7f2;border-radius:8px;padding:10px 10px;border:1px solid #ede4d8" data-wg-grid="planning">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;text-align:center">Week</div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;font-size:7px;color:#6B7280;margin-bottom:3px">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            ${Array.from({length: 4}, (_, r) => `
              <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;margin-bottom:1px">
                ${Array.from({length: 7}, (_, d) => `
                  <span class="wg-cell" data-wg-r="${r}" data-wg-c="${d}"
                    role="button" tabindex="0"
                    aria-label="Week ${r + 1}, day ${d + 1}${[' Mon',' Tue',' Wed',' Thu',' Fri',' Sat',' Sun'][d]}"
                    style="width:10px;height:10px;border-radius:2px;border:1px solid #ede4d8;display:inline-block;cursor:pointer;user-select:none;transition:background 0.2s,border-color 0.2s"></span>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px">
          <div style="background:#faf7f2;border-radius:8px;padding:10px 12px;border:1px solid #ede4d8">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Next Action</div>
            <div style="height:18px;border-bottom:1.5px solid #d4c9bc">___</div>
          </div>
          <div style="background:#fef2f2;border-radius:8px;padding:10px 12px;border:1px solid #fecaca">
            <div style="font-size:8px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Potential Blockers</div>
            <div style="height:18px;border-bottom:1.5px solid #fca5a5">___</div>
          </div>
          <div style="background:#fffbeb;border-radius:8px;padding:10px 12px;border:1px solid #fde68a">
            <div style="font-size:8px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Reward After Completion</div>
            <div style="height:18px;border-bottom:1.5px solid #fde68a">___</div>
          </div>
        </div>
        <div style="background:#faf7f2;border-radius:8px;padding:12px 14px;border:1px solid #ede4d8">
          <div style="font-size:10px;font-weight:700;color:#2d2a27;font-family:'Playfair Display',Outfit,serif;margin-bottom:8px">Reflection</div>
          <div style="margin-bottom:6px">
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">What went well?</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
          <div>
            <div style="font-size:8px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">What will I improve next time?</div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc;margin-bottom:3px"></div>
            <div style="height:16px;border-bottom:1.5px solid #d4c9bc"></div>
          </div>
        </div>`
      )
    );
  }
}
