import { THEME_COLORS } from './preview-renderer';

function esc(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function pageWrap(content: string): string {
  return `<div style="width:100%;max-width:800px;margin:0 auto;background:#fffcf5;border-radius:20px;box-shadow:0 2px 24px rgba(0,0,0,0.04),0 0 0 1px rgba(139,125,107,0.08);overflow:visible;font-family:Outfit,Inter,sans-serif;position:relative;color:#374151">${content}</div>`;
}

function pageHeader(title: string, subtitle?: string): string {
  return `<div style="padding:20px 24px 10px;border-bottom:1px solid #ede4d8;display:flex;align-items:flex-start;justify-content:space-between">
    <div>
      <div style="font-size:16px;font-weight:700;color:#1F2937;letter-spacing:-0.01em;font-family:'Playfair Display',Outfit,serif">${title}</div>
      ${subtitle ? `<div style="font-size:9px;color:#6B7280;font-weight:500;margin-top:2px;font-style:italic">${subtitle}</div>` : ''}
    </div>
    ${subtitle ? `<div style="font-size:8px;color:#4B5563;background:#f5f0ea;padding:3px 10px;border-radius:20px;font-weight:600;white-space:nowrap;flex-shrink:0;margin-top:2px">${subtitle}</div>` : ''}
  </div>`;
}

function pageBody(content: string): string {
  return `<div style="padding:14px 24px 20px">${content}</div>`;
}

function p(style: string, content: string): string {
  return `<div style="${style}">${content}</div>`;
}

function wl(height: number = 16): string {
  return `<span style="display:inline-block;flex:1;height:${height}px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:${height}px;font-size:${height - 4}px">___</span>`;
}

function wb(height: number = 16): string {
  return `<div style="height:${height}px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:${height}px;font-size:${height - 4}px">___</div>`;
}

function card(style: string, content: string): string {
  return `<div style="background:#faf7f2;border-radius:10px;border:1px solid #ede4d8;padding:12px;${style}">${content}</div>`;
}

function progressBar(pct: number, color: string): string {
  return `<div style="height:6px;background:#ede4d8;border-radius:3px;overflow:hidden">
    <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.4s ease"></div>
  </div>`;
}

function sectionDivider(color: string): string {
  return `<div style="display:flex;align-items:center;gap:8px;margin:16px 0 10px"><span style="flex:1;height:1px;background:linear-gradient(to right,transparent,${color}44)"></span><span style="width:4px;height:4px;border-radius:50%;background:${color}55"></span><span style="flex:1;height:1px;background:linear-gradient(to right,${color}44,transparent)"></span></div>`;
}

function tag(text: string, bg: string, fg: string): string {
  return `<span style="display:inline-block;padding:2px 10px;border-radius:6px;font-size:9px;font-weight:700;background:${bg};color:${fg}">${text}</span>`;
}

function checkboxRow(opts: { size?: number; checked?: boolean; checkColor?: string; label?: string; labelSize?: number; labelColor?: string; borderBottom?: boolean } = {}): string {
  const size = opts.size ?? 14;
  const checked = opts.checked ?? false;
  const checkColor = opts.checkColor ?? '#10b981';
  const label = opts.label ?? '';
  const labelSize = opts.labelSize ?? 9;
  const labelColor = opts.labelColor ?? '#6B7280';
  const borderBottom = opts.borderBottom ?? true;
  const radius = size <= 10 ? 2 : 3;
  const innerSize = Math.max(size - 6, 4);
  const checkSvg = checked ? `<svg width="${innerSize}" height="${innerSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : '';
  const bg = checked ? checkColor : 'transparent';
  const bColor = checked ? checkColor : '#d4c9bc';
  const rowBorder = borderBottom ? 'border-bottom:1.5px solid #d4c9bc' : '';
  return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;${rowBorder}">
    <span class="pp-cb" style="width:${size}px;height:${size}px;border-radius:${radius}px;border:1.5px solid ${bColor};background:${bg};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${checkSvg}</span>
    ${label ? `<span style="font-size:${labelSize}px;font-weight:600;color:${labelColor};white-space:nowrap;flex-shrink:0">${label}</span>` : ''}
  </div>`;
}

const THEME = THEME_COLORS;

export function getTheme(name: string): typeof THEME[string] {
  return THEME[name] ?? THEME.violet;
}

// ──────────────────────────────────────────────
// PAGE BUILDERS
// ──────────────────────────────────────────────

function buildCoverPage(t: typeof THEME[string], title: string, icon: string, values: Record<string, string>): string {
  const name = esc(values['name'] || 'Your Name');
  const goal = esc(values['primaryGoal'] || '');
  const career = esc(values['careerTarget'] || '');
  const accent = '#d97706';
  return pageWrap(`<div style="padding:40px 32px;min-height:520px;background:linear-gradient(160deg,#fffbeb,#fffcf5);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden">
    <div style="position:absolute;top:20px;right:24px;font-size:9px;font-weight:600;color:${accent};letter-spacing:0.15em;background:${accent}15;padding:3px 10px;border-radius:20px">${icon} ${title}</div>
    <div style="font-size:28px;font-weight:900;color:#1F2937;letter-spacing:-0.02em;font-family:'Playfair Display',Outfit,serif;line-height:1.15">Goal Roadmap</div>
    <div style="margin:6px 0 4px;font-size:11px;font-weight:500;color:#6B7280;letter-spacing:0.12em;text-transform:uppercase">Your Life Planning System</div>
    <div style="margin:20px 0 16px;width:40px;height:2px;background:linear-gradient(to right,transparent,${accent},transparent)"></div>
    <div style="font-size:18px;font-weight:400;color:#4B5563;font-family:'Playfair Display',Outfit,serif">${name}</div>
    ${goal ? `<div style="margin-top:4px;font-size:10px;color:#6B7280;font-style:italic">🎯 ${goal}</div>` : ''}
    ${career ? `<div style="margin-top:2px;font-size:10px;color:#6B7280;font-style:italic">💼 ${career}</div>` : ''}
    <div style="margin-top:24px;font-size:8px;color:#9CA3AF;letter-spacing:0.1em">tooltails · 2026</div>
  </div>`);
}

function buildVisionBoard(t: typeof THEME[string]): string {
  const domains = [
    { label: 'Health & Wellness', color: '#059669' },
    { label: 'Wealth & Finance', color: '#d97706' },
    { label: 'Career & Purpose', color: '#7c3aed' },
    { label: 'Relationships', color: '#e11d48' },
    { label: 'Personal Growth', color: '#0284c7' },
    { label: 'Joy & Creativity', color: '#ea580c' },
  ];
  const cards = domains.map(d => card(`border-left:3px solid ${d.color}`,
    `<div style="font-size:10px;font-weight:700;color:${d.color};margin-bottom:4px">${d.label}</div>
    ${wb(16)}`
  )).join('');
  return pageWrap(pageHeader('Life Vision Board', 'Design your ideal future') + pageBody(
    `<div style="font-size:9px;color:#6B7280;margin-bottom:12px">Describe your ideal life 1-3 years from now in each area.</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${cards}</div>
    ${sectionDivider('#d97706')}
    <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:6px">Priority Ranking</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
      ${domains.map((d,i) =>
        `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:9px;font-weight:600;background:${d.color}15;color:${d.color};border:1px solid ${d.color}30">${i+1}. ${d.label}</span>`
      ).join('')}
    </div>
    <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">Vision Notes</div>
    ${wb(16)}${wb(16)}`
  ));
}

function buildSmartGoalSprint(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('SMART Goals & 90-Day Sprint', 'Break down your big goals') + pageBody(
    `<div style="margin-bottom:12px">
      <div style="font-size:9px;color:#6B7280;margin-bottom:6px">My #1 Goal</div>
      ${wb(16)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      ${card('', `<div style="font-size:8px;font-weight:700;color:#059669">S — Specific</div>${wb(14)}`)}
      ${card('', `<div style="font-size:8px;font-weight:700;color:#0284c7">M — Measurable</div>${wb(14)}`)}
      ${card('', `<div style="font-size:8px;font-weight:700;color:#7c3aed">A — Achievable</div>${wb(14)}`)}
      ${card('', `<div style="font-size:8px;font-weight:700;color:#d97706">R — Relevant</div>${wb(14)}`)}
    </div>
    <div style="margin-bottom:12px">
      ${card('', `<div style="font-size:8px;font-weight:700;color:#dc2626">T — Time-bound</div><div style="display:flex;align-items:center;gap:6px;margin-top:2px"><span style="flex:1">${wl(14)}</span><span style="font-size:8px;color:#6B7280">deadline</span></div>`)}
    </div>
    ${sectionDivider('#d97706')}
    <div style="font-size:10px;font-weight:700;color:#1F2937;margin-bottom:6px">90-Day Execution Sprint</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      ${card('border-left:3px solid #059669', `<div style="font-size:8px;font-weight:700;color:#059669">Sprint 1 (Days 1-30)</div>${wb(14)}${wb(14)}${progressBar(0, '#059669')}`)}
      ${card('border-left:3px solid #d97706', `<div style="font-size:8px;font-weight:700;color:#d97706">Sprint 2 (Days 31-60)</div>${wb(14)}${wb(14)}${progressBar(0, '#d97706')}`)}
    </div>
    <div>
      ${card('border-left:3px solid #7c3aed', `<div style="font-size:8px;font-weight:700;color:#7c3aed">Sprint 3 (Days 61-90)</div>${wb(14)}${wb(14)}${progressBar(0, '#7c3aed')}`)}
    </div>
    <div style="margin-top:10px">
      <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">Weekly Action Steps</div>
      ${checkboxRow({ label: 'Week 1-2', labelSize: 9, labelColor: '#4B5563' })}
      ${checkboxRow({ label: 'Week 3-4', labelSize: 9, labelColor: '#4B5563' })}
      ${checkboxRow({ label: 'Week 5-6', labelSize: 9, labelColor: '#4B5563' })}
    </div>`
  ));
}

function buildCareerRoadmap(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Career Roadmap', 'Your professional trajectory') + pageBody(
    `<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <span style="font-size:9px;font-weight:600;color:#4B5563">Target Role:</span>
      <span style="flex:1;min-width:100px">${wb(14)}</span>
      <span style="font-size:9px;font-weight:600;color:#4B5563">Timeline:</span>
      <span style="flex:1;min-width:80px">${wb(14)}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
      <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:2px">Skill Acquisition Roadmap</div>
      ${card('border-left:3px solid #7c3aed', `<div style="font-size:8px;font-weight:700;color:#7c3aed">Skill 1:</div><div style="display:flex;align-items:center;gap:6px"><span style="flex:1">${wl(14)}</span><span style="font-size:8px;color:#9CA3AF">${tag('Learning','#ede9fe','#7c3aed')}</span></div>${progressBar(0, '#7c3aed')}`)}
      ${card('border-left:3px solid #0284c7', `<div style="font-size:8px;font-weight:700;color:#0284c7">Skill 2:</div><div style="display:flex;align-items:center;gap:6px"><span style="flex:1">${wl(14)}</span>${progressBar(0, '#0284c7')}</div>`)}
      ${card('border-left:3px solid #059669', `<div style="font-size:8px;font-weight:700;color:#059669">Skill 3:</div><div style="display:flex;align-items:center;gap:6px"><span style="flex:1">${wl(14)}</span>${progressBar(0, '#059669')}</div>`)}
    </div>
    <div>
      ${card('background:#f5f0ea', `<div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">Career Milestones</div>
        ${checkboxRow({ label: 'Milestone 1', labelSize: 9, labelColor: '#4B5563' })}
        ${checkboxRow({ label: 'Milestone 2', labelSize: 9, labelColor: '#4B5563' })}
        ${checkboxRow({ label: 'Milestone 3', labelSize: 9, labelColor: '#4B5563' })}
        <div style="margin-top:4px;font-size:8px;color:#6B7280">Target date: ${wl(14)}</div>`)}
    </div>`
  ));
}

function buildBudgetPlanner(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('50/30/20 Budget Planner', 'Financial clarity') + pageBody(
    `<div style="display:flex;gap:10px;margin-bottom:14px">
      ${card('flex:1;text-align:center', `<div style="font-size:7px;color:#6B7280">Monthly Income</div><div style="font-size:14px;font-weight:800;color:#059669">${wl(14)}</div>`)}
      ${card('flex:1;text-align:center', `<div style="font-size:7px;color:#6B7280">Monthly Expenses</div><div style="font-size:14px;font-weight:800;color:#dc2626">${wl(14)}</div>`)}
      ${card('flex:1;text-align:center', `<div style="font-size:7px;color:#6B7280">Monthly Savings</div><div style="font-size:14px;font-weight:800;color:#0284c7">${wl(14)}</div>`)}
    </div>
    <div style="margin-bottom:14px">
      <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:6px">50/30/20 Allocation</div>
      <div style="display:flex;gap:4px;height:24px;margin-bottom:8px">
        <div style="flex:5;border-radius:4px;background:#059669;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff">50% Needs</div>
        <div style="flex:3;border-radius:4px;background:#d97706;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff">30% Wants</div>
        <div style="flex:2;border-radius:4px;background:#0284c7;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff">20% Savings</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      ${card('border-left:3px solid #059669', `<div style="font-size:9px;font-weight:700;color:#059669">Needs (50%)</div>
        ${['Rent/Mortgage','Groceries','Utilities','Transport'].map(c => `<div style="display:flex;align-items:center;gap:4px;padding:2px 0"><span style="font-size:8px;color:#4B5563;width:60px">${c}</span><span style="flex:1;height:12px;border-bottom:1px solid #ede4d8">___</span></div>`).join('')}`)}
      ${card('border-left:3px solid #d97706', `<div style="font-size:9px;font-weight:700;color:#d97706">Wants (30%)</div>
        ${['Dining Out','Shopping','Entertainment','Travel'].map(c => `<div style="display:flex;align-items:center;gap:4px;padding:2px 0"><span style="font-size:8px;color:#4B5563;width:60px">${c}</span><span style="flex:1;height:12px;border-bottom:1px solid #ede4d8">___</span></div>`).join('')}`)}
    </div>
    <div>
      ${card('', `<div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">🎯 Savings Goals</div>
        <div style="display:flex;align-items:center;gap:6px"><span style="font-size:8px;color:#6B7280;width:80px">Emergency Fund:</span><span style="flex:1">${wl(14)}</span></div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span style="font-size:8px;color:#6B7280;width:80px">Investment:</span><span style="flex:1">${wl(14)}</span></div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span style="font-size:8px;color:#6B7280;width:80px">Big Purchase:</span><span style="flex:1">${wl(14)}</span></div>`
      )}
    </div>`
  ));
}

function buildQuarterlyReview(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Quarterly Review', 'Audit, adjust, advance') + pageBody(
    `<div style="display:flex;gap:10px;margin-bottom:14px">
      ${card('flex:1;text-align:center', `<div style="font-size:7px;color:#6B7280">Quarter</div><div style="font-size:14px;font-weight:900;color:#1F2937">Q${Math.ceil((new Date().getMonth()+1)/3)}</div>`)}
      ${card('flex:1;text-align:center', `<div style="font-size:7px;color:#6B7280">Goals Completed</div><div style="font-size:14px;font-weight:900;color:#059669">${wl(14)}</div>`)}
      ${card('flex:1;text-align:center', `<div style="font-size:7px;color:#6B7280">Sprints Done</div><div style="font-size:14px;font-weight:900;color:#7c3aed">${wl(14)}</div>`)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      ${card('background:#f0fdf4', `<div style="font-size:9px;font-weight:700;color:#059669">✅ What went well</div>${wb(16)}${wb(16)}${wb(16)}`)}
      ${card('background:#fef2f2', `<div style="font-size:9px;font-weight:700;color:#dc2626">❌ What didn't work</div>${wb(16)}${wb(16)}${wb(16)}`)}
    </div>
    <div style="margin-bottom:14px">
      ${card('border-left:3px solid #0284c7', `<div style="font-size:9px;font-weight:700;color:#0284c7">💡 Lessons Learned</div>${wb(16)}${wb(16)}`)}
    </div>
    <div>
      ${card('border-left:3px solid #d97706', `<div style="font-size:9px;font-weight:700;color:#d97706">🎯 Strategy for Next Quarter</div>
        <div style="font-size:8px;color:#6B7280;margin-bottom:4px">What I'll do differently:</div>${wb(16)}
        <div style="font-size:8px;color:#6B7280;margin-bottom:4px;margin-top:4px">My #1 focus:</div>${wb(16)}`)}
    </div>
    <div style="margin-top:14px;text-align:center;padding:10px;background:linear-gradient(135deg,#d9770615,#d9770625);border-radius:10px">
      <div style="font-size:9px;font-weight:700;color:#d97706">🚀 Every quarter is a new opportunity to level up.</div>
    </div>`
  ));
}

// ──────────────────────────────────────────────
// EXPORTED CLASS
// ──────────────────────────────────────────────

export interface PageEntry { id: string; title: string; html: string }

export class GoalRoadmapPreview {
  private values: Record<string, string>;
  private theme: typeof THEME[string];
  private title: string;
  private icon: string;

  constructor(values: Record<string, string>, theme: typeof THEME[string], title?: string, icon?: string) {
    this.values = values;
    this.theme = theme;
    this.title = title || 'Goal Roadmap';
    this.icon = icon || '🎯';
  }

  getPageList(): PageEntry[] {
    const t = this.theme;
    return [
      { id: 'cover', title: 'Cover Page', html: buildCoverPage(t, this.title, this.icon, this.values) },
      { id: 'vision-board', title: 'Life Vision Board', html: buildVisionBoard(t) },
      { id: 'smart-goals', title: 'SMART Goals & Sprint', html: buildSmartGoalSprint(t) },
      { id: 'career', title: 'Career Roadmap', html: buildCareerRoadmap(t) },
      { id: 'budget', title: 'Budget Planner', html: buildBudgetPlanner(t) },
      { id: 'quarterly-review', title: 'Quarterly Review', html: buildQuarterlyReview(t) },
    ];
  }

  getPageCount(): number { return this.getPageList().length; }
}
