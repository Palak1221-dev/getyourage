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
  return `<div style="padding:22px 24px 12px;border-bottom:1px solid #ede4d8;display:flex;align-items:flex-start;justify-content:space-between">
    <div>
      <div style="font-size:18px;font-weight:700;color:#1F2937;letter-spacing:-0.01em;font-family:'Playfair Display',Outfit,serif">${title}</div>
      ${subtitle ? `<div style="font-size:10px;color:#4B5563;font-weight:500;margin-top:2px;font-style:italic">${subtitle}</div>` : ''}
    </div>
    ${subtitle ? `<div style="font-size:9px;color:#4B5563;background:#f5f0ea;padding:4px 12px;border-radius:20px;font-weight:600;white-space:nowrap;flex-shrink:0;margin-top:2px">${subtitle}</div>` : ''}
  </div>`;
}

function pageBody(content: string): string {
  return `<div style="padding:16px 24px 24px">${content}</div>`;
}

function p(style: string, content: string): string {
  return `<div style="${style}">${content}</div>`;
}

function ring(pct: number, size: number, color: string, label: string): string {
  const s = size; const r = (s - 8) / 2; const circ = 2 * Math.PI * r; const offset = circ * (1 - pct / 100);
  return `<div style="width:${s}px;height:${s}px;position:relative;flex-shrink:0">
    <svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" style="transform:rotate(-90deg)">
      <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="#ede4d8" stroke-width="3"/>
      <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
    </svg>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <span style="font-size:${size < 60 ? '11' : '16'}px;font-weight:800;color:#1F2937">${pct}%</span>
      ${label ? `<span style="font-size:7px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-top:-1px">${label}</span>` : ''}
    </div>
  </div>`;
}

function tag(text: string, bg: string, fg: string): string {
  return `<span style="display:inline-block;padding:3px 12px;border-radius:6px;font-size:10px;font-weight:700;background:${bg};color:${fg}">${text}</span>`;
}

function dot(color: string): string {
  return `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0"></span>`;
}

function sectionDivider(color: string): string {
  return `<div style="display:flex;align-items:center;gap:10px;margin:20px 0 12px"><span style="flex:1;height:1px;background:linear-gradient(to right,transparent,${color}44)"></span><span style="width:5px;height:5px;border-radius:50%;background:${color}55"></span><span style="flex:1;height:1px;background:linear-gradient(to right,${color}44,transparent)"></span></div>`;
}

function wl(height: number = 18): string {
  return `<span style="display:inline-block;flex:1;height:${height}px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:${height}px;font-size:${height - 4}px">___</span>`;
}

function wb(height: number = 18): string {
  return `<div style="height:${height}px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:${height}px;font-size:${height - 4}px">___</div>`;
}

const wlSm = (): string => wl(18);
const wbSm = (): string => wb(18);

function checkboxRow(opts: {
  size?: number; checked?: boolean; checkColor?: string; writingLine?: boolean;
  label?: string; labelSize?: number; labelColor?: string; borderBottom?: boolean;
} = {}): string {
  const size = opts.size ?? 14;
  const checked = opts.checked ?? false;
  const checkColor = opts.checkColor ?? '#10b981';
  const label = opts.label ?? '';
  const labelSize = opts.labelSize ?? 10;
  const labelColor = opts.labelColor ?? '#6B7280';
  const borderBottom = opts.borderBottom ?? true;
  const radius = size <= 10 ? 2 : 3;
  const innerSize = Math.max(size - 6, 4);
  const checkSvg = checked ? `<svg width="${innerSize}" height="${innerSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : '';
  const bg = checked ? checkColor : 'transparent';
  const bColor = checked ? checkColor : '#d4c9bc';
  const wlStyle = `flex:1;height:${size}px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:${size}px;display:inline-block;font-size:${Math.max(size - 4, 10)}px`;
  const rowBorder = borderBottom ? 'border-bottom:1.5px solid #d4c9bc' : '';
  return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;${rowBorder}">
    <span class="pp-cb" style="width:${size}px;height:${size}px;border-radius:${radius}px;border:1.5px solid ${bColor};background:${bg};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${checkSvg}</span>
    ${label ? `<span style="font-size:${labelSize}px;font-weight:600;color:${labelColor};white-space:nowrap;flex-shrink:0">${label}</span>` : ''}
    ${wlStyle ? `<span style="${wlStyle}">___</span>` : ''}
  </div>`;
}

function card(style: string, content: string): string {
  return `<div style="background:#faf7f2;border-radius:10px;border:1px solid #ede4d8;padding:14px;${style}">${content}</div>`;
}

function gridCols2(content: string): string {
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${content}</div>`;
}

function progressBar(pct: number, color: string): string {
  return `<div style="height:7px;background:#ede4d8;border-radius:4px;overflow:hidden">
    <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width 0.4s ease"></div>
  </div>`;
}

const THEME = THEME_COLORS;

export function getTheme(name: string): typeof THEME[string] {
  return THEME[name] ?? THEME.violet;
}

// ──────────────────────────────────────────────
// PAGE BUILDERS
// ──────────────────────────────────────────────

function buildWeeklyReset(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Weekly Reset', 'Set up for a strong week') + pageBody(
    `<div style="display:flex;gap:6px;margin-bottom:12px;font-size:10px;color:#6B7280;align-items:center">
      <span style="font-weight:600;color:#4B5563">Rate last week:</span>
      <input type="range" min="1" max="10" value="6" data-myd-slider="week-rating" style="flex:1;max-width:120px;accent-color:${t.accent};height:3px">
      <span data-myd-slider-val="week-rating" style="font-weight:700;color:${t.accent}">6/10</span>
    </div>
    <div style="margin-bottom:10px">
      ${card('background:#f0fdf4;border-left:3px solid #059669',
        `<div style="font-size:10px;font-weight:700;color:#059669">What carried over from last week?</div>${wbSm()}`
      )}
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${card('border-left:3px solid #059669', `<div style="font-size:10px;font-weight:700;color:#059669">3 wins I'm proud of</div>${wbSm()}${wbSm()}${wbSm()}`)}
      ${card('border-left:3px solid #d97706', `<div style="font-size:10px;font-weight:700;color:#d97706">1 tough moment + what it taught me</div>${wbSm()}`)}
      ${card('border-left:3px solid #6366f1', `<div style="font-size:10px;font-weight:700;color:#6366f1">What's still lingering?</div>${wbSm()}${wbSm()}`)}
      ${card('border-left:3px solid #7c3aed',
        `<div style="font-size:10px;font-weight:700;color:#7c3aed">This week's 3 Big Priorities</div>
        ${checkboxRow({ label: 'Non-negotiable', size: 12, labelSize: 8, labelColor: '#9CA3AF' })}
        ${checkboxRow({ label: '', size: 12 })}
        ${checkboxRow({ label: '', size: 12 })}`
      )}
      ${card('border-left:3px solid #0284c7', `<div style="font-size:10px;font-weight:700;color:#0284c7">When will I work on each?</div>${wbSm()}${wbSm()}`)}
      ${card('border-left:3px solid #ea580c', `<div style="font-size:10px;font-weight:700;color:#ea580c">My peak energy windows this week</div>${wbSm()}`)}
    </div>
    <div style="margin-top:12px;display:flex;align-items:center;gap:8px;background:#ede9fe;border-radius:8px;padding:10px">
      <span style="font-size:10px;font-weight:600;color:#4B5563;flex-shrink:0">One sentence intention:</span>
      <span style="flex:1;height:16px;border-bottom:1.5px solid #7c3aed;line-height:16px;font-size:10px">___</span>
    </div>
    <div style="margin-top:8px;text-align:center;font-size:9px;color:#7c3aed;font-style:italic">You've done the work. Now go execute.</div>`
  ));
}

function buildDailyCommand(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Daily Command Center', 'Your day, controlled') + pageBody(
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px">
      ${card('text-align:center', `<div style="font-size:8px;color:#6B7280;font-weight:600">Energy</div><div style="display:flex;align-items:center;gap:4px;justify-content:center"><input type="range" min="1" max="5" value="3" data-myd-slider="day-energy" style="flex:1;max-width:80px;accent-color:${t.accent};height:3px"><span data-myd-slider-val="day-energy" style="font-size:11px;font-weight:800;color:${t.accent}">3/5</span></div><div style="font-size:8px;color:#6B7280">Match tasks to energy</div>`)}
      ${card('text-align:center', `<div style="font-size:8px;color:#6B7280;font-weight:600">Mood</div><div style="display:flex;gap:4px;justify-content:center;margin-top:2px">${['😊','🙂','😐','😔','😫'].map((m,i) => `<span data-myd-mood="day-mood" data-val="${i}" style="font-size:15px;cursor:pointer;opacity:${i === 0 ? 1 : 0.4}">${m}</span>`).join('')}</div>`)}
    </div>
    <div style="margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:11px;font-weight:700;color:#1F2937">Today's Big 3</span>
        <span style="font-size:8px;color:#6B7280">Non-negotiable</span>
      </div>
      ${checkboxRow({ label: '1', size: 12, labelSize: 9, labelColor: '#9CA3AF' })}
      ${checkboxRow({ label: '2', size: 12, labelSize: 9, labelColor: '#9CA3AF' })}
      ${checkboxRow({ label: '3', size: 12, labelSize: 9, labelColor: '#9CA3AF' })}
    </div>
    <div style="margin-bottom:8px">
      <div style="font-size:11px;font-weight:700;color:#1F2937;margin-bottom:4px">Focus Blocks</div>
      <span style="font-size:8px;color:#6B7280;display:block;margin-bottom:6px">High energy = deep work. Low energy = admin, review.</span>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        ${[8,10,13,15].map((h, i) => {
          const period = h < 12 ? 'AM' : 'PM';
          const display = h <= 12 ? h : h - 12;
          const label = ['Morning Deep Block', 'Mid-Morning', 'Afternoon Block', 'Late Wrap'][i];
          const icon = ['🌅', '☀️', '⛅', '🌙'][i];
          const color = ['#059669', '#d97706', '#0284c7', '#6366f1'][i];
          return card(`border-left:2px solid ${color};padding:8px`,
            `<div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:8px;font-weight:700;color:${color}">${icon} ${label}</span>
              <span style="font-size:8px;color:#6B7280">${display}${period}</span>
            </div>
            <div style="height:16px;border-bottom:1px solid #ede4d8;line-height:16px;font-size:9px;margin-top:2px">___</div>`
          );
        }).join('')}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      ${card('',
        `<div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">If I feel distracted, I will</div>
        <div style="height:16px;border-bottom:1px solid #ede4d8;line-height:16px;font-size:9px">___</div>`
      )}
      ${card('',
        `<div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">One thing I can skip today</div>
        <div style="height:16px;border-bottom:1px solid #ede4d8;line-height:16px;font-size:9px">___</div>`
      )}
    </div>
    <div style="margin-bottom:8px">
      <div style="font-size:11px;font-weight:700;color:#1F2937;margin-bottom:4px">Time Blocked Schedule</div>
      <span style="font-size:8px;color:#6B7280;display:block;margin-bottom:6px">Drag-free zone — just write what you'll do each hour.</span>
      ${[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(h => {
        const period = h < 12 ? 'AM' : 'PM';
        const display = h <= 12 ? h : h - 12;
        const isPeak = h >= 9 && h <= 11;
        const isLow = h >= 14 && h <= 16;
        return `<div style="display:flex;align-items:center;gap:4px;border-bottom:1px solid #f0ece6;padding:2px 0">
          <span style="font-size:8px;font-weight:600;color:${isPeak ? '#059669' : isLow ? '#dc2626' : '#9CA3AF'};width:24px;flex-shrink:0">${display}${period}</span>
          <span style="font-size:7px;color:${isPeak ? '#059669' : isLow ? '#dc2626' : 'transparent'};width:8px">●</span>
          <span style="flex:1;height:14px;border-bottom:1px solid #ede4d8;padding:0;line-height:14px;font-size:9px">___</span>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:8px;font-size:9px;padding:8px 0;border-top:1px solid #ede4d8">
      <span style="flex:1"><span style="font-weight:600;color:#4B5563">Tonight:</span> ${wb(14)}</span>
    </div>`
  ));
}

function buildEveningReflection(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Evening Reflection', 'Win today, set up tomorrow') + pageBody(
    `<div style="font-size:9px;color:#4B5563;margin-bottom:8px">A few minutes to close the day with intention.</div>
    <div style="margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:8px;color:#6B7280">Big 3: <span style="font-weight:600;color:#4B5563">0 of 3 done</span></span>
        <span style="font-size:8px;color:#6B7280">Productive hours: <span style="display:inline-block;min-width:24px;height:14px;border-bottom:1.5px solid #d4c9bc;line-height:14px;padding:0 2px;font-size:8px">___</span></span>
        <span style="font-size:8px;color:#6B7280">Distractions: <span style="display:inline-block;min-width:24px;height:14px;border-bottom:1.5px solid #d4c9bc;line-height:14px;padding:0 2px;font-size:8px">___</span></span>
      </div>
      ${progressBar(0, '#059669')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      ${card('border-left:3px solid #059669',
        `<div style="font-size:10px;font-weight:700;color:#059669">Accomplished Today</div>
        ${checkboxRow({ label: '', size: 12 })}${checkboxRow({ label: '', size: 12 })}${checkboxRow({ label: '', size: 12 })}`
      )}
      ${card('border-left:3px solid #d97706',
        `<div style="font-size:10px;font-weight:700;color:#d97706">One thing that went well</div><div style="height:16px;border-bottom:1px solid #ede4d8;line-height:16px;font-size:9px;margin-top:2px">___</div>
        <div style="font-size:9px;font-weight:600;color:#4B5563;margin-top:8px">One thing I could have done better</div>
        <div style="height:16px;border-bottom:1px solid #ede4d8;line-height:16px;font-size:9px;margin-top:2px">___</div>`
      )}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      ${card('border-left:3px solid #6366f1',
        `<div style="font-size:10px;font-weight:700;color:#6366f1">Grateful for</div>
        <div style="margin-top:4px">${wb(14)}</div><div style="margin-top:4px">${wb(14)}</div>`
      )}
      ${card('border-left:3px solid #dc2626',
        `<div style="font-size:10px;font-weight:700;color:#dc2626">If I could redo one moment</div><div style="height:16px;border-bottom:1px solid #ede4d8;line-height:16px;font-size:9px;margin-top:2px">___</div>
        <div style="font-size:9px;font-weight:600;color:#4B5563;margin-top:8px">What distracted me today?</div>
        <div style="height:16px;border-bottom:1px solid #ede4d8;line-height:16px;font-size:9px;margin-top:2px">___</div>`
      )}
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">
      ${card('text-align:center;padding:6px',
        `<div style="font-size:7px;font-weight:600;color:#4B5563">Energy</div>
        <div style="display:flex;align-items:center;gap:2px;justify-content:center;margin-top:1px">
          <input type="range" min="1" max="10" value="6" data-myd-slider="evening-energy" style="width:32px;accent-color:${t.accent};height:2px">
          <span data-myd-slider-val="evening-energy" style="font-size:9px;font-weight:800;color:${t.accent}">6</span>
        </div>
        <div style="font-size:7px;color:#6B7280">vs AM: -2</div>`
      )}
      ${card('text-align:center;padding:6px',
        `<div style="font-size:7px;font-weight:600;color:#4B5563">Day Rating</div>
        <div style="display:flex;gap:1px;justify-content:center;margin-top:1px;font-size:13px">
          ${[1,2,3,4,5].map(i => `<span data-myd-star="day-rating" data-val="${i}" style="cursor:pointer;opacity:${i <= 3 ? 1 : 0.3}">★</span>`).join('')}
        </div>
        <div style="font-size:7px;color:#6B7280">out of 5</div>`
      )}
      ${card('text-align:center;padding:6px', `<div style="font-size:7px;font-weight:600;color:#4B5563">Mood</div><div style="display:flex;gap:2px;justify-content:center;margin-top:1px;font-size:13px">${['😊','🙂','😐','😔','😫'].map((m,i) => `<span data-myd-mood="pm-mood" data-val="${i}" style="cursor:pointer;opacity:${i === 0 ? 1 : 0.35}">${m}</span>`).join('')}</div><div style="font-size:7px;color:#6B7280">vs AM: same</div>`)}
      ${card('text-align:center;padding:6px',
        `<div style="font-size:7px;font-weight:600;color:#4B5563">Focus Score</div>
        <div style="display:flex;gap:1px;justify-content:center;margin-top:1px;font-size:13px">
          ${[1,2,3,4,5].map(i => `<span data-myd-star="focus-score" data-val="${i}" style="cursor:pointer;opacity:${i <= 2 ? 1 : 0.3}">★</span>`).join('')}
        </div>`
      )}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      ${card('background:#f0fdf4;padding:8px',
        `<div style="font-size:9px;font-weight:700;color:#059669">Today's biggest lesson</div>
        <div style="height:16px;border-bottom:1px solid #bbf7d0;line-height:16px;font-size:9px;margin-top:2px">___</div>`
      )}
      ${card('background:#ede9fe;padding:8px',
        `<div style="font-size:9px;font-weight:700;color:#7c3aed">Tomorrow's #1 priority</div>
        <div style="height:16px;border-bottom:1px solid #ddd6fe;line-height:16px;font-size:9px;margin-top:2px">___</div>`
      )}
    </div>
    <div style="background:#fefce8;border-radius:8px;padding:8px 10px;display:flex;align-items:center;gap:6px;border:1px solid #fde68a">
      <span style="font-size:11px">💤</span>
      <span style="font-size:8px;color:#4B5563">Tonight I'll</span>
      <span style="flex:1;height:14px;border-bottom:1px solid #fde68a;line-height:14px;font-size:9px">___</span>
      <span style="font-size:8px;color:#4B5563">sleep by</span>
      <span style="width:28px;height:14px;border-bottom:1px solid #fde68a;line-height:14px;font-size:9px">___</span>
    </div>
    <div style="margin-top:4px;display:flex;justify-content:center;gap:12px;font-size:8px;color:#6B7280">
      <span>📱 Screen-off: <span style="display:inline-block;min-width:16px;height:12px;border-bottom:1.5px solid #d4c9bc;line-height:12px;padding:0 1px;font-size:7px">___</span>:<span style="display:inline-block;min-width:16px;height:12px;border-bottom:1.5px solid #d4c9bc;line-height:12px;padding:0 1px;font-size:7px">___</span></span>
      <span>🌙 Lights-out: <span style="display:inline-block;min-width:16px;height:12px;border-bottom:1.5px solid #d4c9bc;line-height:12px;padding:0 1px;font-size:7px">___</span>:<span style="display:inline-block;min-width:16px;height:12px;border-bottom:1.5px solid #d4c9bc;line-height:12px;padding:0 1px;font-size:7px">___</span></span>
    </div>`
  ));
}

function buildPriorityEngine(t: typeof THEME[string]): string {
  const quadrants = [
    { label: 'Do Now', color: '#dc2626', desc: 'Urgent & Important', icon: '🔥' },
    { label: 'Schedule', color: '#d97706', desc: 'Important, Not Urgent', icon: '📅' },
    { label: 'Delegate', color: '#0284c7', desc: 'Urgent, Not Important', icon: '🤝' },
    { label: 'Delete', color: '#6B7280', desc: 'Neither', icon: '🗑️' },
  ];
  return pageWrap(pageHeader('Priority Engine', 'What deserves your attention?') + pageBody(
    `<div style="font-size:9px;color:#4B5563;margin-bottom:8px">Score = Impact (1-5) × Urgency (1-5). High score = do it now.</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">
      ${quadrants.map(q => card(`text-align:center;border-top:2px solid ${q.color};padding:6px`,
        `<div style="font-size:13px">${q.icon}</div>
        <div style="font-size:8px;font-weight:700;color:${q.color}">${q.label}</div>
        <div style="font-size:7px;color:#6B7280">${q.desc}</div>`
      )).join('')}
    </div>
    <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:6px">Priority Queue</div>
    <div data-myd-priority-queue style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px"></div>
    <div style="margin-bottom:8px">
      <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">Add New Task</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span data-myd-priority-input style="flex:2;min-width:140px;height:16px;border-bottom:1px solid #ede4d8;line-height:16px;font-size:9px;padding:0">___</span>
        <span style="display:flex;align-items:center;gap:3px;flex-shrink:0">
          <span style="font-size:8px;color:#6B7280">Impact</span>
          <input type="range" min="1" max="5" value="3" data-myd-slider="priority-impact" style="width:44px;accent-color:${t.accent};height:3px;cursor:pointer">
          <span data-myd-slider-val="priority-impact" style="font-size:9px;font-weight:700;color:${t.accent};min-width:10px;text-align:center">3</span>
        </span>
        <span style="display:flex;align-items:center;gap:3px;flex-shrink:0">
          <span style="font-size:8px;color:#6B7280">Urgency</span>
          <input type="range" min="1" max="5" value="3" data-myd-slider="priority-urgency" style="width:44px;accent-color:${t.accent};height:3px;cursor:pointer">
          <span data-myd-slider-val="priority-urgency" style="font-size:9px;font-weight:700;color:${t.accent};min-width:10px;text-align:center">3</span>
        </span>
        <span data-myd-priority-add style="font-size:8px;padding:3px 10px;background:${t.accent};color:#fff;border-radius:4px;font-weight:600;cursor:pointer">Add</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      ${card('background:#f5f0ea;padding:8px',
        `<div style="font-size:9px;font-weight:600;color:#4B5563">Scoring Guide</div>
        <div style="font-size:7px;color:#6B7280;margin-top:4px">Impact: How much does this move the needle? 1=low, 5=life-changing</div>
        <div style="font-size:7px;color:#6B7280">Urgency: What happens if I don't do it today? 1=nothing, 5=disaster</div>`
      )}
      ${card('background:#ede9fe;padding:8px',
        `<div style="font-size:9px;font-weight:600;color:#7c3aed">Deferred Tasks</div>
        ${wb(14)}<div style="margin-top:4px">${wb(14)}</div>`
      )}
    </div>
    <div style="display:flex;gap:8px;justify-content:center;font-size:9px">
      <span data-myd-priority-optimize style="padding:4px 12px;border-radius:4px;background:#05966915;color:#059669;font-weight:600;cursor:pointer">↻ Optimize Queue</span>
      <span data-myd-priority-import style="padding:4px 12px;border-radius:4px;background:#6366f115;color:#6366f1;font-weight:600;cursor:pointer">📥 Import from Brain Dump</span>
    </div>`
  ));
}

function buildAntiProcrastination(t: typeof THEME[string]): string {
  const reasons = [
    { label: 'Too Hard', counter: 'Start with just 1 step', icon: '🧗' },
    { label: 'Too Boring', counter: 'Pair with a podcast or timer', icon: '😴' },
    { label: 'Too Vague', counter: 'Define the very first action', icon: '🌫️' },
    { label: 'Anxious', counter: 'What\'s the worst that could happen?', icon: '😰' },
    { label: 'Perfectionism', counter: 'Done > Perfect. Ship it.', icon: '✨' },
    { label: 'Not My Job', counter: 'Can you delete it? If not, forward.', icon: '🙅' },
  ];
  const stakes = [
    { label: 'Missed Deadline', icon: '⏰' },
    { label: 'Let Someone Down', icon: '🤝' },
    { label: 'Extra Stress', icon: '😰' },
    { label: 'Lost Opportunity', icon: '🚪' },
    { label: 'Feel Behind', icon: '🐢' },
    { label: 'Self-Criticism', icon: '💭' },
  ];
  return pageWrap(pageHeader('Anti-Procrastination Dashboard', 'Name it. Face it. Finish it.') + pageBody(
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
      <div>
        <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">I'm avoiding this task</div>
        ${wb(18)}
        <div style="margin-top:6px;font-size:8px;font-weight:600;color:#4B5563">What's the first tiny step?</div>
        ${wb(18)}
      </div>
      <div>
        <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">Why I'm avoiding it</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
          ${reasons.map(r =>
            `<span data-myd-reason="${r.label.toLowerCase().replace(/\s+/g,'-')}" style="padding:4px 10px;border-radius:20px;font-size:8px;font-weight:600;border:1px solid #d4c9bc;color:#4B5563;cursor:pointer">${r.icon} ${r.label}</span>`
          ).join('')}
        </div>
        <div style="font-size:8px;font-weight:600;color:#4B5563">How long will it really take?</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
          ${wb(16)}
          <span style="font-size:8px;color:#6B7280">min</span>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      ${card('background:#f0fdf4;border-left:3px solid #059669;padding:10px',
        `<div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:14px">💡</span>
          <div>
            <div style="font-size:9px;color:#059669;font-weight:700">Micro-Action Plan</div>
            <div style="font-size:7px;color:#4B5563">5-min timer. Just the first step.</div>
          </div>
        </div>
        ${p('margin-top:6px', wb(16))}
        <div style="margin-top:6px;font-size:7px;color:#059669;font-weight:600;background:#d1fae5;padding:4px 8px;border-radius:4px">If-Then Plan: If I feel stuck, I will <span style="border-bottom:1.5px solid #059669;min-width:60px;display:inline-block;height:14px;line-height:14px;font-size:8px">___</span></div>`
      )}
      ${card('background:#fef2f2;border-left:3px solid #dc2626;padding:10px',
        `<div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:14px">😰</span>
          <div>
            <div style="font-size:9px;color:#dc2626;font-weight:700">Worst that could happen?</div>
            <div style="font-size:7px;color:#4B5563">Spoiler: it's probably fine.</div>
          </div>
        </div>
        <div style="height:16px;border-bottom:1px solid #fee2e2;line-height:16px;font-size:9px;margin-top:4px">___</div>
        <div style="margin-top:6px;font-size:9px;color:#dc2626;text-align:center;font-style:italic;background:#fee2e280;padding:3px 6px;border-radius:4px">And what if it goes well?</div>
        <div style="height:16px;border-bottom:1px solid #fee2e2;line-height:16px;font-size:9px;margin-top:4px">___</div>`
      )}
    </div>
    <div style="margin-bottom:8px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
        <span data-myd-commit style="padding:6px 18px;background:${t.accent};color:#fff;border-radius:8px;font-size:9px;font-weight:700;cursor:pointer">✅ I Commit to This</span>
        <span style="font-size:8px;color:#6B7280">⏱ Finish by <span style="border-bottom:1.5px solid #d4c9bc;min-width:20px;display:inline-block;height:14px;line-height:14px;font-size:8px">___</span>:<span style="border-bottom:1.5px solid #d4c9bc;min-width:20px;display:inline-block;height:14px;line-height:14px;font-size:8px">___</span></span>
      </div>
    </div>
    <div style="margin-bottom:8px">
      <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:6px">⚡ My energy right now</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <input type="range" min="1" max="10" value="6" data-myd-slider="procrastination-energy" style="flex:1;max-width:120px;accent-color:${t.accent};height:3px">
        <span data-myd-slider-val="procrastination-energy" style="font-size:14px;font-weight:900;color:${t.accent};min-width:20px">6</span>
        <span style="font-size:7px;color:#6B7280">Low energy makes everything feel harder. If under 5, start with just 2 minutes.</span>
      </div>
    </div>
    <div style="margin-bottom:6px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div style="font-size:9px;font-weight:600;color:#4B5563">What's at stake if I don't do this?</div>
        <span style="font-size:7px;color:#6B7280;font-style:italic">Be honest with yourself</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
        ${stakes.map(s =>
          `<span data-myd-stake="${s.label.toLowerCase().replace(/\s+/g,'-')}" style="padding:3px 10px;border-radius:20px;font-size:8px;font-weight:600;border:1px solid #d4c9bc;color:#4B5563;cursor:pointer;transition:all 0.15s">${s.icon} ${s.label}</span>`
        ).join('')}
        <span style="flex:1;min-width:80px;height:14px;border-bottom:1px solid #d4c9bc;line-height:14px;font-size:9px;padding:0 2px">___</span>
      </div>
      <div style="font-size:8px;font-weight:600;color:#4B5563;margin-bottom:2px">What will I gain by doing it?</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="flex:1;height:14px;border-bottom:1px solid #d4c9bc;line-height:14px;font-size:9px">___</span>
      </div>
    </div>
    <div style="margin-bottom:8px">
      <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">How will I feel after it's done?</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span style="padding:3px 10px;border-radius:8px;background:#d1fae5;font-size:8px;color:#059669;font-weight:600">Relieved</span>
        <span style="padding:3px 10px;border-radius:8px;background:#fef3c7;font-size:8px;color:#d97706;font-weight:600">Proud</span>
        <span style="padding:3px 10px;border-radius:8px;background:#dbeafe;font-size:8px;color:#2563eb;font-weight:600">Free</span>
        <span style="padding:3px 10px;border-radius:8px;background:#fee2e2;font-size:8px;color:#dc2626;font-weight:600">Meh</span>
        <span style="flex:1;height:14px;border-bottom:1px solid #ede4d8;line-height:14px;font-size:9px">___</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      ${card('background:#f5f0ea;padding:8px',
        `<div style="font-size:8px;font-weight:600;color:#4B5563">What I've been avoiding (history)</div>
        <div style="font-size:7px;color:#6B7280">Be honest. No judgment.</div>
        ${p('margin-top:6px', `${wb(14)}${wb(14)}`)}
        <div style="margin-top:4px;font-size:7px;color:#6B7280;text-align:center">Wins this week: <span style="font-weight:700;color:#059669;display:inline-block;min-width:20px;height:12px;border-bottom:1.5px solid #059669;line-height:12px;padding:0 2px;font-size:7px">___</span> · Still avoiding: <span style="font-weight:700;color:#dc2626;display:inline-block;min-width:20px;height:12px;border-bottom:1.5px solid #dc2626;line-height:12px;padding:0 2px;font-size:7px">___</span></div>`
      )}
      ${card('padding:8px',
        `<div style="font-size:8px;font-weight:600;color:#4B5563">⚡ Done is better than perfect</div>
        <div style="font-size:7px;color:#6B7280;margin-top:4px">The difference between done and perfect is the difference between something and nothing.</div>
        <div style="margin-top:6px;display:flex;align-items:center;gap:6px;background:#ede9fe;border-radius:6px;padding:6px;font-size:8px;color:#7c3aed;font-weight:600">
          <span>👤 I'll tell</span>
          <span style="flex:1;border-bottom:1.5px solid #7c3aed;height:14px;line-height:14px;font-size:9px">___</span>
          <span>when it's done</span>
        </div>`
      )}
    </div>
    <div style="margin-top:6px;text-align:center;font-size:9px;color:#6B7280;font-weight:500">The best time to start was yesterday. The next best time is <span style="font-weight:700;color:${t.accent}">right now</span>.</div>`
  ));
}

function buildEnergyMood(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Energy & Mood Tracker', 'Your fuel gauge') + pageBody(
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      ${card('text-align:center;padding:10px', `<div style="font-size:9px;font-weight:700;color:#4B5563;margin-bottom:4px">Energy (1-10)</div>
        <div style="display:flex;align-items:center;gap:6px;justify-content:center">
          <input type="range" min="1" max="10" value="6" data-myd-slider="mood-energy" style="flex:1;max-width:80px;accent-color:${t.accent};height:4px">
          <span data-myd-slider-val="mood-energy" style="font-size:15px;font-weight:900;color:${t.accent};min-width:24px;text-align:center">6</span>
        </div>
        <div style="font-size:8px;color:#4B5563;margin-top:4px">⚡ <span data-myd-peak-time style="font-weight:700;color:#374151">—</span> · 🌀 <span data-myd-low-time style="font-weight:700;color:#374151">—</span></div>`)}
      ${card('text-align:center;padding:10px',
        `<div style="display:flex;justify-content:center;gap:12px;align-items:flex-start">
          <div><div style="font-size:9px;font-weight:700;color:#4B5563;margin-bottom:3px;letter-spacing:0.05em">AM</div><div style="display:flex;gap:3px;justify-content:center">${['😊','🙂','😐','😔','😫'].map((m,i) => `<span data-myd-mood="am-mood" data-val="${i}" style="font-size:16px;cursor:pointer;opacity:${i === 0 ? 1 : 0.3}">${m}</span>`).join('')}</div></div>
          <div><div style="font-size:9px;font-weight:700;color:#4B5563;margin-bottom:3px;letter-spacing:0.05em">PM</div><div style="display:flex;gap:3px;justify-content:center">${['😊','🙂','😐','😔','😫'].map((m,i) => `<span data-myd-mood="pm-emo-mood" data-val="${i}" style="font-size:16px;cursor:pointer;opacity:${i === 0 ? 1 : 0.3}">${m}</span>`).join('')}</div></div>
        </div>
        <div style="font-size:8px;color:#4B5563;margin-top:4px" data-myd-mood-shift-container>Mood shift <span data-myd-mood-shift style="font-weight:700;color:#374151">—</span></div>`
      )}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      ${card('padding:14px',
        `<div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:8px">😴 Sleep & Recovery</div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:8px;font-weight:600;color:#4B5563;width:44px">Bed time:</span>
          <span data-myd-field="sleep-bed" style="flex:1;height:20px;border-bottom:1.5px solid #ede4d8;line-height:20px;font-size:10px">___</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:8px;font-weight:600;color:#4B5563;width:44px">Wake time:</span>
          <span data-myd-field="sleep-wake" style="flex:1;height:20px;border-bottom:1.5px solid #ede4d8;line-height:20px;font-size:10px">___</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:8px;font-weight:600;color:#4B5563;width:44px">Sleep hrs:</span>
          <span data-myd-field="sleep-hrs" style="flex:1;height:20px;border-bottom:1.5px solid #ede4d8;line-height:20px;font-size:10px">___</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:8px;font-weight:600;color:#4B5563;width:44px">Quality:</span>
          <span style="display:flex;gap:3px">${[1,2,3,4,5].map(i => `<span data-myd-star="sleep-quality" data-val="${i}" style="font-size:18px;cursor:pointer;opacity:${i <= 3 ? 1 : 0.3}">★</span>`).join('')}</span>
        </div>
        <div data-myd-sleep-note style="margin-top:8px;font-size:8px;color:#6B7280;border-top:1px solid #f0ece6;padding-top:6px"></div>`
      )}
      ${card('padding:14px',
        `<div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:8px">⚡ What impacted my energy?</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
          ${['😴 Poor Sleep', '🍔 Bad Food', '💻 Too Much Screen', '☕ Too Much Caffeine', '😰 Stress', '🏋️ Exercise', '💊 Supplements', '🌞 Sunlight'].map(d =>
            `<span data-myd-drainer="${d.split(' ')[1].toLowerCase()}" style="font-size:8px;padding:4px 10px;border-radius:16px;border:1.5px solid #d4c9bc;color:#4B5563;cursor:pointer;font-weight:600;transition:all 0.15s">${d}</span>`
          ).join('')}
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:8px;color:#4B5563;margin-bottom:4px">
          <span style="font-weight:600">Exercise:</span>
          <span data-myd-field="exercise" style="flex:1;height:20px;border-bottom:1.5px solid #ede4d8;line-height:20px;font-size:10px">___</span>
          <span style="font-weight:500">min</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:8px;color:#4B5563">
          <span style="font-weight:600">Recovery:</span>
          <span data-myd-field="recovery" style="flex:1;height:20px;border-bottom:1.5px solid #ede4d8;line-height:20px;font-size:10px">___</span>
        </div>`
      )}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      ${card('padding:14px',
        `<div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:8px">📝 Today's Note</div>
        <div data-myd-field="energy-note" style="height:20px;border-bottom:1.5px solid #ede4d8;line-height:20px;font-size:10px">___</div>
        <div style="height:20px;border-bottom:1.5px solid #ede4d8;line-height:20px;font-size:10px;margin-top:6px">___</div>
        <div style="height:20px;border-bottom:1.5px solid #ede4d8;line-height:20px;font-size:10px;margin-top:6px">___</div>`
      )}
      ${card('padding:14px',
        `<div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:8px">🎯 Tomorrow's Energy Plan</div>
        <div style="font-size:8px;color:#4B5563;margin-bottom:4px;font-weight:500">One thing I'll do differently:</div>
        <div data-myd-field="energy-plan" style="height:20px;border-bottom:1.5px solid #ede4d8;line-height:20px;font-size:10px">___</div>
        <div style="font-size:9px;font-weight:700;color:#374151;margin-top:12px;margin-bottom:6px">Tomorrow's peak time:</div>
        <div style="display:flex;gap:6px">
          <span data-myd-peak-select="morning" style="flex:1;padding:6px 4px;text-align:center;border-radius:10px;background:#d1fae5;font-size:9px;color:#059669;font-weight:800;cursor:pointer;opacity:1;transition:all 0.15s">🌅 Morning</span>
          <span data-myd-peak-select="afternoon" style="flex:1;padding:6px 4px;text-align:center;border-radius:10px;background:#fef3c7;font-size:9px;color:#d97706;font-weight:800;cursor:pointer;opacity:0.5;transition:all 0.15s">☀️ Afternoon</span>
          <span data-myd-peak-select="evening" style="flex:1;padding:6px 4px;text-align:center;border-radius:10px;background:#ede9fe;font-size:9px;color:#7c3aed;font-weight:800;cursor:pointer;opacity:0.5;transition:all 0.15s">🌙 Evening</span>
        </div>`
      )}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${card('background:#f5f0ea;padding:14px',
        `<div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:10px;font-weight:700;color:#374151">Your Energy Rhythm</span>
          <span style="font-size:8px;color:#4B5563;font-weight:600">This week</span>
        </div>
        <div data-myd-trend-bars style="display:flex;gap:4px;height:48px;align-items:flex-end;margin-top:10px"></div>
        <div style="display:flex;justify-content:space-between;font-size:9px;font-weight:700;color:#6B7280;margin-top:4px"><span data-myd-trend-label="0">M</span><span data-myd-trend-label="1">T</span><span data-myd-trend-label="2">W</span><span data-myd-trend-label="3">T</span><span data-myd-trend-label="4">F</span><span data-myd-trend-label="5">S</span><span data-myd-trend-label="6">S</span></div>
        <div data-myd-trend-insight style="font-size:9px;color:#4B5563;margin-top:10px;border-top:1.5px solid #ede4d8;padding-top:8px;line-height:1.6"></div>`
      )}
      ${card('background:#eef2ff;padding:14px',
        `<div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:8px">What Your Data Says</div>
        <div data-myd-energy-insight style="font-size:9px;color:#4B5563;line-height:1.6"></div>
        <div data-myd-insight-action style="margin-top:8px;font-size:9px;color:#4B5563;border-top:1.5px solid #d4c9bc;padding-top:8px;font-weight:500"></div>
        <div style="margin-top:10px;display:flex;gap:8px;align-items:baseline;font-size:9px;color:#4B5563">
          <span style="font-weight:500">Avg energy this week:</span>
          <span data-myd-avg-energy style="font-size:16px;font-weight:900;color:#1F2937">—</span>
          <span style="font-size:8px;color:#6B7280;font-weight:600">/10</span>
        </div>`
      )}
    </div>`
  ));
}

function buildTimeAudit(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Time Audit', 'Where did it go?') + pageBody(
    `<div style="margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:9px;font-weight:600;color:#4B5563">Today's Time Investment</span>
        <span style="font-size:8px;color:#6B7280">Total logged: <span style="display:inline-block;min-width:16px;height:12px;border-bottom:1.5px solid #d4c9bc;line-height:12px;padding:0 2px;font-size:7px;text-align:center">___</span>h <span style="display:inline-block;min-width:16px;height:12px;border-bottom:1.5px solid #d4c9bc;line-height:12px;padding:0 2px;font-size:7px;text-align:center">___</span>m</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
        ${['Deep Work', 'Meetings', 'Shallow', 'Distraction'].map((c, i) =>
          card(`text-align:center;padding:8px;border-top:2px solid ${i === 0 ? '#059669' : i === 3 ? '#dc2626' : '#d4c9bc'}`,
            `<div style="font-size:8px;font-weight:700;color:${i === 0 ? '#059669' : i === 3 ? '#dc2626' : '#4B5563'}">${c}</div>
            <div style="display:flex;align-items:center;gap:2px;justify-content:center;margin-top:4px">
              <span style="flex:1;max-width:44px;height:14px;border-bottom:1px solid #ede4d8;line-height:14px;font-size:8px">___</span>
              <span style="font-size:8px;color:#6B7280">min</span>
            </div>
            <div style="font-size:7px;color:#6B7280;margin-top:4px">${['🎯 Focused effort', '📋 Scheduled calls', '📧 Email, Slack, busywork', '📱 Social, browsing, other'][i]}</div>`
          )
        ).join('')}
      </div>
    </div>
    <div style="margin-bottom:8px">
      <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:6px">Hour-by-Hour Time Log</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map(h => {
          const period = h < 12 ? 'AM' : 'PM';
          const display = h <= 12 ? h : h - 12;
          return `<div style="display:flex;align-items:center;gap:3px;border-bottom:1px solid #f5f0ea;padding:2px 0">
            <span style="font-size:7px;font-weight:600;color:#6B7280;width:22px;flex-shrink:0">${display}${period}</span>
            <span style="flex:1;height:12px;border-bottom:1px solid #ede4d8;line-height:12px;font-size:8px">___</span>
            <span style="font-size:7px;color:#d4c9bc;cursor:pointer">${['D','M','S','X'][Math.floor(Math.random()*4)]}</span>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      <div>
        <div style="font-size:8px;font-weight:600;color:#4B5563;margin-bottom:4px">🎯 Ideal Split</div>
        ${card('padding:8px',
          `<div style="font-size:7px">Deep: ${progressBar(50, '#059669')} <span style="font-size:7px;color:#6B7280">50%</span></div>
          <div style="font-size:7px;margin-top:4px">Shallow: ${progressBar(20, '#d97706')} <span style="font-size:7px;color:#6B7280">20%</span></div>
          <div style="font-size:7px;margin-top:4px">Distraction: ${progressBar(5, '#dc2626')} <span style="font-size:7px;color:#6B7280">5%</span></div>`
        )}
      </div>
      <div>
        <div style="font-size:8px;font-weight:600;color:#4B5563;margin-bottom:4px">📊 Actual Split</div>
        ${card('padding:8px',
          `<div style="font-size:7px">Deep: ${progressBar(35, '#059669')} <span style="font-size:7px;color:#6B7280">35%</span></div>
          <div style="font-size:7px;margin-top:4px">Meetings: ${progressBar(25, '#0284c7')} <span style="font-size:7px;color:#6B7280">25%</span></div>
          <div style="font-size:7px;margin-top:4px">Distraction: ${progressBar(20, '#dc2626')} <span style="font-size:7px;color:#6B7280">20%</span></div>`
        )}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      ${card('background:#f0fdf4;padding:8px',
        `<div style="font-size:9px;font-weight:700;color:#059669">One thing to invest MORE time in</div>
        <div style="height:16px;border-bottom:1px solid #bbf7d0;line-height:16px;font-size:9px;margin-top:2px">___</div>
        <div style="font-size:7px;color:#6B7280;margin-top:4px">How to make time for it:</div>
        <div style="height:16px;border-bottom:1px solid #bbf7d0;line-height:16px;font-size:9px;margin-top:2px">___</div>`
      )}
      ${card('background:#fef2f2;padding:8px',
        `<div style="font-size:9px;font-weight:700;color:#dc2626">One time thief to eliminate</div>
        <div style="height:16px;border-bottom:1px solid #fee2e2;line-height:16px;font-size:9px;margin-top:2px">___</div>
        <div style="font-size:7px;color:#6B7280;margin-top:4px">What I'll do instead:</div>
        <div style="height:16px;border-bottom:1px solid #fee2e2;line-height:16px;font-size:9px;margin-top:2px">___</div>`
      )}
    </div>
    <div>
      ${card('background:#f5f0ea;padding:8px',
        `<div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:8px;font-weight:600;color:#4B5563">Deep Work Trend</span>
          <span style="font-size:7px;color:#6B7280">This week</span>
        </div>
        <div style="display:flex;gap:4px;height:28px;align-items:flex-end;margin-top:6px">
          ${[40,55,30,60,45,50,35].map((h,i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px">
            <span style="font-size:7px;color:#6B7280">${h}%</span>
            <div style="width:100%;height:${h/3}px;background:${t.accent};border-radius:2px"></div>
          </div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:7px;color:#6B7280;margin-top:2px"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
        <div style="font-size:7px;color:#6B7280;margin-top:6px;border-top:1px solid #ede4d8;padding-top:4px">
          🎯 Target: <span style="font-weight:600;color:#4B5563">50% deep work</span> — Gap: <span style="font-weight:600;color:#dc2626">15%</span>
        </div>`
      )}
    </div>`
  ));
}

function buildBrainDump(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Brain Dump Processor', 'Clear your mind. Find clarity.') + pageBody(
    `<div style="font-size:9px;color:#4B5563;margin-bottom:8px">Write freely. No filter. Everything on your mind — tasks, worries, ideas, reminders, random thoughts.</div>
    <div style="margin-bottom:8px">
      <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">Free write zone</div>
      ${wb(18)}${wb(18)}${wb(18)}${wb(18)}${wb(18)}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <span data-myd-process style="flex:1;padding:8px;text-align:center;background:${t.accent};color:#fff;border-radius:6px;font-size:9px;font-weight:700;cursor:pointer">⚡ Process & Categorize</span>
      <span style="flex:1;padding:8px;text-align:center;border:1px solid #d4c9bc;border-radius:6px;font-size:9px;font-weight:600;color:#6B7280;cursor:pointer">🗑️ Clear All</span>
    </div>
    <div style="margin-bottom:8px">
      <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">Categorized Items</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px">
        ${card('background:#d1fae5;padding:8px', `<div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:7px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.03em">Tasks</span><span style="font-size:7px;color:#059669;font-weight:700">0</span></div><div style="font-size:8px;margin-top:4px">${wb(14)}</div><div style="font-size:8px;margin-top:2px">${wb(14)}</div><div style="font-size:8px;margin-top:2px">${wb(14)}</div>`)}
        ${card('background:#fef3c7;padding:8px', `<div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:7px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:0.03em">Ideas</span><span style="font-size:7px;color:#d97706;font-weight:700">0</span></div><div style="font-size:8px;margin-top:4px">${wb(14)}</div><div style="font-size:8px;margin-top:2px">${wb(14)}</div>`)}
        ${card('background:#fee2e2;padding:8px', `<div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:7px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.03em">Worries</span><span style="font-size:7px;color:#dc2626;font-weight:700">0</span></div><div style="font-size:8px;margin-top:4px">${wb(14)}</div><div style="font-size:8px;margin-top:2px">${wb(14)}</div>`)}
        ${card('background:#e0e7ff;padding:8px', `<div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:7px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.03em">Later</span><span style="font-size:7px;color:#6366f1;font-weight:700">0</span></div><div style="font-size:8px;margin-top:4px">${wb(14)}</div><div style="font-size:8px;margin-top:2px">${wb(14)}</div>`)}
      </div>
    </div>
    <div style="margin-bottom:8px">
      <div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:4px">Priority Sort</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:8px">
        <span style="padding:4px;text-align:center;border-radius:4px;background:#05966915;color:#059669;font-weight:600;cursor:pointer">🔴 Urgent</span>
        <span style="padding:4px;text-align:center;border-radius:4px;background:#d9770615;color:#d97706;font-weight:600;cursor:pointer">🟡 This Week</span>
        <span style="padding:4px;text-align:center;border-radius:4px;background:#6366f115;color:#6366f1;font-weight:600;cursor:pointer">🔵 Someday</span>
        <span style="padding:4px;text-align:center;border-radius:4px;background:#dc262615;color:#dc2626;font-weight:600;cursor:pointer">⚪ Ignore</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${card('background:#f5f0ea;padding:8px',
        `<div style="font-size:8px;font-weight:600;color:#4B5563">Unprocessed thoughts</div>
        <div style="height:14px;border-bottom:1px solid #ede4d8;line-height:14px;font-size:8px;margin-top:4px">___</div>
        <div style="height:14px;border-bottom:1px solid #ede4d8;line-height:14px;font-size:8px;margin-top:2px">___</div>
        <div style="height:14px;border-bottom:1px solid #ede4d8;line-height:14px;font-size:8px;margin-top:2px">___</div>`
      )}
      ${card('padding:8px',
        `<div style="font-size:8px;font-weight:600;color:#4B5563">One thing I can act on right now</div>
        <div style="height:16px;border-bottom:1px solid #ede4d8;line-height:16px;font-size:9px;margin-top:2px">___</div>
        <div style="font-size:8px;font-weight:600;color:#4B5563;margin-top:8px">One thing I can let go of</div>
        <div style="height:16px;border-bottom:1px solid #ede4d8;line-height:16px;font-size:9px;margin-top:2px">___</div>`
      )}
    </div>
    <div style="margin-top:6px;text-align:center;font-size:8px;color:#6B7280">A clear desk starts with a clear mind. 🧠</div>`
  ));
}

function buildHabitTracker(t: typeof THEME[string]): string {
  const habitIcons = ['🏋️', '📖', '🧘', '✍️', '💧', '😴', '📵', '🚶'];
  const weekLabels = ['W1', 'W2', 'W3', 'W4'];

  function habitRow(idx: number, icon: string, isLast: boolean): string {
    const border = isLast ? '' : 'border-bottom:1px solid #ede4d8;';
    return `<div data-myd-row="${idx}" style="display:flex;align-items:center;gap:6px;padding:5px 0;${border}transition:opacity 0.25s">
      <span data-myd-habit-check="${idx}" style="width:14px;height:14px;border-radius:3px;border:1.5px solid #d4c9bc;background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s"></span>
      <span style="font-size:12px;flex-shrink:0;width:18px;text-align:center">${icon}</span>
      <span data-myd-habit-name="${idx}" contenteditable="true" style="flex:1;height:16px;border-bottom:1.5px solid #ede4d8;line-height:16px;font-size:9px;font-weight:500;color:#374151;padding:0 2px;outline:none;transition:border-color 0.15s">___</span>
      <span data-myd-habit-streak="${idx}" style="font-size:9px;font-weight:700;color:#6B7280;white-space:nowrap;letter-spacing:0.02em;transition:all 0.2s">—</span>
    </div>`;
  }

  const col1 = habitIcons.slice(0, 4).map((icon, i) => habitRow(i, icon, i === 3)).join('');
  const col2 = habitIcons.slice(4, 8).map((icon, i) => habitRow(i + 4, icon, i === 3)).join('');

  let gridRows = '';
  for (let row = 0; row < 8; row++) {
    gridRows += `<div style="display:flex;gap:5px;margin-bottom:4px">`;
    for (let col = 0; col < 28; col++) {
      gridRows += `<span data-myd-cell="${row}-${col}" style="flex:1;aspect-ratio:1;border-radius:2px;background:#f5f0ea;border:1px solid #ede4d8;cursor:pointer;transition:all 0.2s"></span>`;
    }
    gridRows += `</div>`;
  }

  return pageWrap(pageHeader('Habit Tracker', 'Small wins, big results') + pageBody(
    `<style>[data-myd-habit-name]:hover{border-color:#a78bfa!important}</style>
    <div data-myd-greeting style="font-size:9px;color:#4B5563;font-weight:500;margin-bottom:12px;line-height:1.5;min-height:14px"></div>

    <div style="background:#fcf9f4;border-radius:8px;border:1px solid #ede4d8;padding:10px 12px;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">
        <span data-myd-heading-dot style="width:5px;height:5px;border-radius:50%;background:#059669;flex-shrink:0;transition:all 0.3s"></span>
        <span style="font-size:9px;font-weight:700;color:#374151;letter-spacing:0.04em">Today</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap-x:10px;margin-top:4px">
        <div>${col1}</div>
        <div>${col2}</div>
      </div>
      <div style="margin-top:6px;padding-top:6px;border-top:1px solid #ede4d8">
        <div style="font-size:7px;color:#4B5563;margin-bottom:2px">What I resisted today:</div>
        <div style="height:14px;border-bottom:1px solid #ede4d8;line-height:14px;font-size:8px">___</div>
        <div style="font-size:7px;color:#4B5563;margin-top:5px;margin-bottom:2px">What helped me show up:</div>
        <div style="height:14px;border-bottom:1px solid #ede4d8;line-height:14px;font-size:8px;margin-bottom:2px">___</div>
        <div style="font-size:7px;color:#4B5563;margin-bottom:2px">One thing I'd do differently:</div>
        <div style="height:14px;border-bottom:1px solid #ede4d8;line-height:14px;font-size:8px">___</div>
      </div>
    </div>

    <div data-myd-insight style="font-size:8px;color:#4B5563;text-align:center;font-style:italic;margin-bottom:10px;line-height:1.5;min-height:12px"></div>

    <div style="background:#faf7f2;border-radius:8px;border:1px solid #ede4d8;padding:12px;margin-bottom:14px">
      <div style="display:flex;gap:3px;margin-bottom:8px">
        ${weekLabels.map(w => `<span style="flex:1;font-size:7px;color:#6B7280;font-weight:600;text-align:center;letter-spacing:0.04em">${w}</span>`).join('')}
      </div>
      ${gridRows}
      <div style="margin-top:8px;font-size:7px;color:#6B7280;text-align:right;letter-spacing:0.02em">
        <span style="color:#2563eb">● done</span> <span style="margin-left:8px">○ missed</span>
      </div>
    </div>

    <div data-myd-milestones style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:14px;min-height:0"></div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="background:#f0fdf4;border-radius:8px;padding:10px;border:1px solid #bbf7d0">
        <div style="font-size:8px;font-weight:700;color:#059669;letter-spacing:0.04em;margin-bottom:4px">Weekly Check-in</div>
        <div style="font-size:7px;color:#4B5563">Most proud of:</div>
        <div style="height:14px;border-bottom:1px solid #bbf7d0;line-height:14px;font-size:8px;margin-top:1px;margin-bottom:4px">___</div>
        <div style="font-size:7px;color:#4B5563">Improve next week:</div>
        <div style="height:14px;border-bottom:1px solid #bbf7d0;line-height:14px;font-size:8px;margin-top:1px;margin-bottom:4px">___</div>
        <div style="font-size:7px;color:#4B5563">Small change:</div>
        <div style="height:14px;border-bottom:1px solid #bbf7d0;line-height:14px;font-size:8px;margin-top:1px">___</div>
      </div>
      <div style="background:#ede9fe;border-radius:8px;padding:10px;border:1px solid #ddd6fe">
        <div style="font-size:8px;font-weight:700;color:#7c3aed;letter-spacing:0.04em;margin-bottom:4px">Habit Stacking</div>
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
          <span style="font-size:7px;color:#4B5563;width:34px;flex-shrink:0">Existing</span>
          <span style="flex:1;height:14px;border-bottom:1px solid #ddd6fe;line-height:14px;font-size:8px">___</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
          <span style="font-size:7px;color:#4B5563;width:34px;flex-shrink:0">New</span>
          <span style="flex:1;height:14px;border-bottom:1px solid #ddd6fe;line-height:14px;font-size:8px">___</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
          <span style="font-size:7px;color:#4B5563;width:34px;flex-shrink:0">Trigger</span>
          <span style="flex:1;height:14px;border-bottom:1px solid #ddd6fe;line-height:14px;font-size:8px">___</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px">
          <span style="font-size:7px;color:#4B5563;width:34px;flex-shrink:0">Reward</span>
          <span style="flex:1;height:14px;border-bottom:1px solid #ddd6fe;line-height:14px;font-size:8px">___</span>
        </div>
      </div>
    </div>`
  ));
}

function buildCover(t: typeof THEME[string], vals: Record<string, string>): string {
  return pageWrap(`
    <div style="padding:28px 28px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;min-height:540px;position:relative">
      <!-- corner ornaments -->
      <div style="position:absolute;top:12px;left:16px;width:18px;height:18px;border-top:1.5px solid #ede4d8;border-left:1.5px solid #ede4d8;opacity:0.6;border-radius:3px 0 0 0"></div>
      <div style="position:absolute;top:12px;right:16px;width:18px;height:18px;border-top:1.5px solid #ede4d8;border-right:1.5px solid #ede4d8;opacity:0.6;border-radius:0 3px 0 0"></div>
      <div style="position:absolute;bottom:12px;left:16px;width:18px;height:18px;border-bottom:1.5px solid #ede4d8;border-left:1.5px solid #ede4d8;opacity:0.6;border-radius:0 0 0 3px"></div>
      <div style="position:absolute;bottom:12px;right:16px;width:18px;height:18px;border-bottom:1.5px solid #ede4d8;border-right:1.5px solid #ede4d8;opacity:0.6;border-radius:0 0 3px 0"></div>

      <!-- top accent bar with diamond -->
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;flex-shrink:0">
        <span style="width:20px;height:1px;background:${t.accent}55"></span>
        <span style="width:4px;height:4px;background:${t.accent};border-radius:1px;transform:rotate(45deg)"></span>
        <span style="width:20px;height:1px;background:${t.accent}55"></span>
      </div>

      <!-- icon badge -->
      <div style="width:42px;height:42px;border-radius:12px;background:${t.accent}10;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;margin-bottom:8px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.6)">⚡</div>

      <!-- title -->
      <div style="font-family:'Playfair Display',Outfit,serif;font-size:38px;font-weight:900;color:#1F2937;letter-spacing:-0.03em;line-height:1.08;text-align:center;flex-shrink:0">
        Master<br>Your Day
      </div>

      <!-- subtitle with flanking lines -->
      <div style="display:flex;align-items:center;gap:10px;margin-top:6px;flex-shrink:0">
        <span style="width:20px;height:1px;background:${t.accent}44"></span>
        <span style="font-size:9px;font-weight:600;color:${t.accent};letter-spacing:0.18em;text-transform:uppercase">Daily Execution System</span>
        <span style="width:20px;height:1px;background:${t.accent}44"></span>
      </div>

      <!-- main divider -->
      <div style="width:72px;height:1.5px;background:linear-gradient(to right,transparent,${t.accent}88,transparent);margin:12px auto;flex-shrink:0"></div>

      <!-- info card with accent top border -->
      <div style="background:#fff;border-radius:14px;padding:18px 22px;width:100%;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,0.04),0 0 0 1px rgba(139,125,107,0.06);flex-shrink:0;border-top:3px solid ${t.accent};text-align:left">

        <div style="margin-bottom:12px">
          <div style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;display:flex;align-items:center;gap:5px">
            <span style="width:5px;height:5px;border-radius:50%;background:${t.accent};display:inline-block;flex-shrink:0"></span> Name
          </div>
          <div style="height:22px;border-bottom:1.5px solid #e8dfd4;line-height:22px;padding:0 2px;font-size:15px;font-weight:600;font-family:'Playfair Display',Outfit,serif;color:#1F2937">${vals['name'] || '___'}</div>
        </div>

        <div style="margin-bottom:12px">
          <div style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;display:flex;align-items:center;gap:5px">
            <span style="width:5px;height:5px;border-radius:50%;background:${t.accent};display:inline-block;flex-shrink:0"></span> Start Date
          </div>
          <div style="height:18px;border-bottom:1.5px solid #e8dfd4;line-height:18px;padding:0 2px;font-size:13px;font-weight:500;color:#374151" data-myd-cover="date">___</div>
        </div>

        <div style="margin-bottom:12px">
          <div style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;display:flex;align-items:center;gap:5px">
            <span style="width:5px;height:5px;border-radius:50%;background:${t.accent};display:inline-block;flex-shrink:0"></span> #1 Goal This Season
          </div>
          <div style="height:18px;border-bottom:1.5px solid #e8dfd4;line-height:18px;padding:0 2px;font-size:13px;font-weight:500;color:#374151">${vals['goal'] || '___'}</div>
        </div>

        <div style="margin-bottom:12px">
          <div style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;display:flex;align-items:center;gap:5px">
            <span style="width:5px;height:5px;border-radius:50%;background:${t.accent};display:inline-block;flex-shrink:0"></span> Personal Mantra
          </div>
          <div style="height:18px;border-bottom:1.5px solid #e8dfd4;line-height:18px;padding:0 2px;font-size:13px;font-weight:500;color:#374151;font-style:italic">___</div>
        </div>

        <!-- focus areas divider -->
        <div style="display:flex;align-items:center;gap:8px;margin:14px 0 12px">
          <span style="height:1px;background:linear-gradient(to right,${t.accent}44,transparent);flex:1"></span>
          <span style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.12em;flex-shrink:0">Focus Areas</span>
          <span style="height:1px;background:linear-gradient(to left,${t.accent}44,transparent);flex:1"></span>
        </div>

        ${[1,2,3].map(i => `
        <div style="margin-bottom:${i<3?'9':'0'}px;display:flex;align-items:center;gap:6px">
          <span style="width:4px;height:4px;border-radius:50%;background:${t.accent}55;flex-shrink:0"></span>
          <div style="height:16px;border-bottom:1px solid #e8dfd4;line-height:16px;padding:0 2px;font-size:12px;font-weight:500;color:#374151;flex:1">___</div>
        </div>`).join('')}
      </div>

      <!-- quote callout -->
      <div style="margin-top:14px;padding:10px 16px;border-radius:10px;background:${t.accent}06;border-left:2.5px solid ${t.accent}44;max-width:400px;width:100%;flex-shrink:0">
        <div style="font-size:9px;color:#6B7280;font-style:italic;line-height:1.6;text-align:center">
          "The only person you are destined to become<br>is the person you decide to be."
        </div>
      </div>

      <!-- bottom flourish -->
      <div style="display:flex;align-items:center;gap:10px;margin-top:auto;padding-top:12px;flex-shrink:0">
        <span style="width:12px;height:1px;background:${t.accent}44"></span>
        <span style="font-size:6px;color:${t.accent}66;letter-spacing:0.15em">✦ &nbsp; ✦</span>
        <span style="width:12px;height:1px;background:${t.accent}44"></span>
      </div>
    </div>
  `);
}

function buildDashboard(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Dashboard', 'Your week at a glance') + pageBody(`
    <style>
      .dash-score-ring{width:100px;height:100px;flex-shrink:0;position:relative}
      .dash-score-ring svg{width:100px;height:100px}
      .dash-stat{font-size:20px;font-weight:900}
      .dash-stat-label{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em}
      .dash-bar{transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1)}
      .dash-habit-cell{flex:1;height:24px;border-radius:3px;transition:all 0.3s ease}
      .dash-write{min-height:20px;border-bottom:1.5px solid ${t.accent}44;padding:0;line-height:20px;font-size:13px;font-weight:500;color:#374151;transition:border-color 0.2s ease,min-height 0.15s ease;outline:none;overflow:hidden;resize:none}
      .dash-write:focus{border-bottom-color:${t.accent};border-bottom-width:2px}
      .dash-insight{font-size:9px;color:#374151;font-weight:500;line-height:1.5;min-height:24px}
    </style>

    <div style="display:flex;gap:12px;margin-bottom:14px">
      <div class="dash-score-ring" data-dash-score>
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#ede4d8" stroke-width="6"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke="${t.accent}" stroke-width="6" stroke-linecap="round" stroke-dasharray="263.89" stroke-dashoffset="263.89" transform="rotate(-90,50,50)" style="transition:stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1)" data-dash-score-arc/>
          <text x="50" y="46" text-anchor="middle" fill="#1F2937" font-size="24" font-weight="900" dominant-baseline="central" data-dash-score-text>--</text>
          <text x="50" y="66" text-anchor="middle" fill="#6B7280" font-size="7" font-weight="700" dominant-baseline="central">SCORE</text>
        </svg>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:1">
        ${card('padding:10px 8px;text-align:center', `<div class="dash-stat" style="color:#1F2937" data-dash-stat="mood-avg">--</div><div class="dash-stat-label" style="color:#4B5563">Mood</div>`)}
        ${card('padding:10px 8px;text-align:center', `<div class="dash-stat" style="color:${t.accent}" data-dash-stat="energy-avg">--</div><div class="dash-stat-label" style="color:#4B5563">Energy</div>`)}
        ${card('padding:10px 8px;text-align:center', `<div class="dash-stat" style="color:#059669" data-dash-stat="habit-pct">--</div><div class="dash-stat-label" style="color:#4B5563">Habits</div>`)}
        ${card('padding:10px 8px;text-align:center', `<div class="dash-stat" style="color:#0284c7" data-dash-stat="sleep-avg">--</div><div class="dash-stat-label" style="color:#4B5563">Sleep</div>`)}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      ${card('padding:10px;border-left:3px solid #059669', `<div style="font-size:9px;font-weight:700;color:#059669;margin-bottom:4px">Grateful for</div><div class="dash-write" contenteditable="true" data-dash-auto>___</div>`)}
      ${card('padding:10px;border-left:3px solid ' + t.accent, `<div style="font-size:9px;font-weight:700;color:${t.accent};margin-bottom:4px">Make today great</div><div class="dash-write" contenteditable="true" data-dash-auto>___</div>`)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      ${card('padding:10px;border-left:3px solid #d97706', `<div style="font-size:9px;font-weight:700;color:#d97706;margin-bottom:4px">Small win</div><div class="dash-write" contenteditable="true" data-dash-auto>___</div>`)}
      ${card('padding:10px;border-left:3px solid #7c3aed', `<div style="font-size:9px;font-weight:700;color:#7c3aed;margin-bottom:4px">Be kind to myself</div><div class="dash-write" contenteditable="true" data-dash-auto>___</div>`)}
    </div>

    <div style="background:${t.accent}08;border-radius:14px;padding:14px;margin-bottom:12px;border:1px solid ${t.accent}22">
      <div style="font-size:11px;font-weight:800;color:#1F2937;margin-bottom:8px">Today I want to feel...</div>
      <div class="dash-write" contenteditable="true" data-dash-auto style="background:transparent">___</div>
    </div>

    ${sectionDivider(t.accent)}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">
      <div>
        <div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:6px">7-day distribution</div>
        <div data-dash-mood-dist style="display:flex;flex-direction:column;gap:3px">
          ${['😊','🙂','😐','😔','😫'].map((m,i) => `
          <div style="display:flex;align-items:center;gap:4px;font-size:8px;color:#374151">
            <span style="width:14px;text-align:center;font-size:10px">${m}</span>
            <div style="flex:1;height:6px;background:#ede4d8;border-radius:3px;overflow:hidden">
              <div style="height:100%;width:0%;border-radius:3px;background:${i <= 1 ? '#059669' : i === 2 ? '#d97706' : '#dc2626'};transition:width 0.5s ease" data-dash-mood-bar="${i}"></div>
            </div>
            <span style="width:18px;text-align:right;font-weight:800;font-size:9px;color:#1F2937" data-dash-mood-count="${i}">0</span>
          </div>`).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:6px">7-day trends</div>
        <div style="font-size:8px;font-weight:600;color:#374151;display:flex;align-items:center;gap:4px;margin-bottom:3px">
          <span style="width:8px;height:8px;border-radius:2px;background:${t.accent};display:inline-block"></span> Energy
        </div>
        <div style="display:flex;gap:3px;height:32px;align-items:flex-end;margin-bottom:2px" data-dash-trend-energy>
          ${[0,0,0,0,0,0,0].map(() => `<div class="dash-bar" style="flex:1;border-radius:3px;background:#ede4d8;height:4px"></div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:7px;color:#6B7280;font-weight:600;margin-bottom:5px">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
        <div style="font-size:8px;font-weight:600;color:#374151;display:flex;align-items:center;gap:4px;margin-top:5px;margin-bottom:3px">
          <span style="width:8px;height:8px;border-radius:2px;background:#d97706;display:inline-block"></span> Mood
        </div>
        <div style="display:flex;gap:3px;height:24px;align-items:flex-end" data-dash-trend-mood>
          ${[0,0,0,0,0,0,0].map(() => `<div class="dash-bar" style="flex:1;border-radius:3px;background:#ede4d8;height:4px"></div>`).join('')}
        </div>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:10px">
      <div style="flex:1;display:flex;align-items:center;gap:8px;background:#f5f2ed;border-radius:10px;padding:8px 12px">
        <span style="font-size:9px;font-weight:700;color:#374151">Streak</span>
        <span style="font-size:13px;font-weight:900;color:#059669" data-dash-stat="current-streak">0d</span>
        <span style="font-size:8px;color:#6B7280;font-weight:600">best</span>
        <span style="font-size:13px;font-weight:900;color:#d97706" data-dash-stat="streak">--</span>
      </div>
      <div style="flex:2">
        <div style="font-size:8px;font-weight:600;color:#374151;margin-bottom:3px">Last 7 days</div>
        <div style="display:flex;gap:3px" data-dash-habit-mini>
          ${[0,0,0,0,0,0,0].map(() => `<div class="dash-habit-cell" style="background:#ede4d8;border:1px solid #d4c9bc"></div>`).join('')}
        </div>
      </div>
    </div>

    <div style="padding:10px 14px;background:${t.accent}08;border-radius:10px;border-left:3px solid ${t.accent}44">
      <div style="font-size:8px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Insight</div>
      <div class="dash-insight" data-dash-insight>Log some data to see personalized insights.</div>
    </div>
    <div style="display:flex;justify-content:center;gap:8px;font-size:8px;color:#6B7280;font-weight:600;margin-top:8px">
      <span data-dash-day-count>--</span><span>days tracked</span><span>·</span><span data-dash-data-status>no data yet</span>
    </div>
  `));
}

export interface PageEntry { id: string; title: string; html: string }

export class MasterYourDayPreview {
  private values: Record<string, string>;
  private theme: typeof THEME[string];
  private title: string;
  private icon: string;

  constructor(values: Record<string, string>, theme: typeof THEME[string], title?: string, icon?: string) {
    this.values = values;
    this.theme = theme;
    this.title = title || 'Master Your Day';
    this.icon = icon || '⚡';
  }

  getPageList(): PageEntry[] {
    const t = this.theme;
    return [
      { id: 'cover', title: 'Cover', html: buildCover(t, this.values) },
      { id: 'dashboard', title: 'Dashboard', html: buildDashboard(t) },
      { id: 'weekly-reset', title: 'Weekly Reset', html: buildWeeklyReset(t) },
      { id: 'daily-command', title: 'Daily Command', html: buildDailyCommand(t) },
      { id: 'evening-reflection', title: 'Evening Reflection', html: buildEveningReflection(t) },
      { id: 'priority-engine', title: 'Priority Engine', html: buildPriorityEngine(t) },
      { id: 'anti-procrastination', title: 'Procrastination', html: buildAntiProcrastination(t) },
      { id: 'energy-mood', title: 'Energy & Mood', html: buildEnergyMood(t) },
      { id: 'time-audit', title: 'Time Audit', html: buildTimeAudit(t) },
      { id: 'brain-dump', title: 'Brain Dump', html: buildBrainDump(t) },
      { id: 'habit-tracker', title: 'Habit Tracker', html: buildHabitTracker(t) },
    ];
  }

  getPageCount(): number { return this.getPageList().length; }
}
