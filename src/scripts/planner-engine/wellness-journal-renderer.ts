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
      ${subtitle ? `<div style="font-size:10px;color:#6B7280;font-weight:500;margin-top:2px;font-style:italic">${subtitle}</div>` : ''}
    </div>
    ${subtitle ? `<div style="font-size:9px;color:#4B5563;background:#f5f0ea;padding:3px 10px;border-radius:20px;font-weight:600;white-space:nowrap;flex-shrink:0;margin-top:2px">${subtitle}</div>` : ''}
  </div>`;
}

function pageBody(content: string): string {
  return `<div style="padding:14px 24px 20px">${content}</div>`;
}

function wb(height: number = 16): string {
  return `<div style="height:${height}px;border-bottom:1.5px solid #e8dfd4;padding:0;line-height:${height}px;font-size:${Math.max(height - 4, 10)}px">___</div>`;
}

function wl(height: number = 16): string {
  return `<span style="display:inline-block;flex:1;height:${height}px;border-bottom:1.5px solid #e8dfd4;padding:0;line-height:${height}px;font-size:${Math.max(height - 4, 10)}px">___</span>`;
}

function card(style: string, content: string): string {
  return `<div style="background:#fff;border-radius:10px;border:1px solid #ede4d8;padding:12px;${style}">${content}</div>`;
}

function sectionDivider(color: string): string {
  return `<div style="display:flex;align-items:center;gap:8px;margin:14px 0 10px"><span style="flex:1;height:1px;background:linear-gradient(to right,transparent,${color}44)"></span><span style="width:4px;height:4px;border-radius:50%;background:${color}55"></span><span style="flex:1;height:1px;background:linear-gradient(to right,${color}44,transparent)"></span></div>`;
}

function progressBar(pct: number, color: string): string {
  return `<div style="height:6px;background:#ede4d8;border-radius:3px;overflow:hidden">
    <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.4s ease"></div>
  </div>`;
}

function checkboxRow(opts: { size?: number; label?: string; labelSize?: number; labelColor?: string } = {}): string {
  const size = opts.size ?? 13;
  const label = opts.label ?? '';
  const labelSize = opts.labelSize ?? 9;
  const labelColor = opts.labelColor ?? '#4B5563';
  return `<div style="display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid #f0ece6">
    <span class="pp-cb" style="width:${size}px;height:${size}px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer"></span>
    ${label ? `<span style="font-size:${labelSize}px;font-weight:600;color:${labelColor};flex-shrink:0">${label}</span>` : ''}
  </div>`;
}

const THEME = THEME_COLORS;

export function getTheme(name: string): typeof THEME[string] {
  return THEME[name] ?? THEME.emerald;
}

// ──────────────────────────────────────────────
// PAGE BUILDERS
// ──────────────────────────────────────────────

function buildCover(t: typeof THEME[string], vals: Record<string, string>): string {
  return pageWrap(`<div style="padding:32px 28px;text-align:center;display:flex;flex-direction:column;align-items:center;min-height:520px;position:relative">
    <div style="position:absolute;top:12px;left:16px;width:18px;height:18px;border-top:1.5px solid #ede4d8;border-left:1.5px solid #ede4d8;opacity:0.6;border-radius:3px 0 0 0"></div>
    <div style="position:absolute;top:12px;right:16px;width:18px;height:18px;border-top:1.5px solid #ede4d8;border-right:1.5px solid #ede4d8;opacity:0.6;border-radius:0 3px 0 0"></div>
    <div style="position:absolute;bottom:12px;left:16px;width:18px;height:18px;border-bottom:1.5px solid #ede4d8;border-left:1.5px solid #ede4d8;opacity:0.6;border-radius:0 0 0 3px"></div>
    <div style="position:absolute;bottom:12px;right:16px;width:18px;height:18px;border-bottom:1.5px solid #ede4d8;border-right:1.5px solid #ede4d8;opacity:0.6;border-radius:0 0 3px 0"></div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;flex-shrink:0">
      <span style="width:20px;height:1px;background:${t.accent}55"></span>
      <span style="width:4px;height:4px;background:${t.accent};border-radius:1px;transform:rotate(45deg)"></span>
      <span style="width:20px;height:1px;background:${t.accent}55"></span>
    </div>
    <div style="width:42px;height:42px;border-radius:12px;background:${t.accent}10;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;margin-bottom:8px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.6)">🌿</div>
    <div style="font-family:'Playfair Display',Outfit,serif;font-size:34px;font-weight:900;color:#1F2937;letter-spacing:-0.03em;line-height:1.08;text-align:center;flex-shrink:0">Wellness<br>Journal</div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:6px;flex-shrink:0">
      <span style="width:20px;height:1px;background:${t.accent}44"></span><span style="font-size:9px;font-weight:600;color:${t.accent};letter-spacing:0.18em;text-transform:uppercase">Your Self-Care Companion</span><span style="width:20px;height:1px;background:${t.accent}44"></span>
    </div>
    <div style="width:72px;height:1.5px;background:linear-gradient(to right,transparent,${t.accent}88,transparent);margin:12px auto;flex-shrink:0"></div>
    <div style="background:#fff;border-radius:14px;padding:18px 22px;width:100%;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,0.04),0 0 0 1px rgba(139,125,107,0.06);flex-shrink:0;border-top:3px solid ${t.accent};text-align:left">
      <div style="margin-bottom:12px">
        <div style="font-size:9px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;display:flex;align-items:center;gap:5px"><span style="width:5px;height:5px;border-radius:50%;background:${t.accent};display:inline-block;flex-shrink:0"></span> Name</div>
        <div style="height:22px;border-bottom:1.5px solid #e8dfd4;line-height:22px;padding:0 2px;font-size:15px;font-weight:600;font-family:'Playfair Display',Outfit,serif;color:#1F2937">${vals['name'] || '___'}</div>
      </div>
      <div style="margin-bottom:12px">
        <div style="font-size:9px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;display:flex;align-items:center;gap:5px"><span style="width:5px;height:5px;border-radius:50%;background:${t.accent};display:inline-block;flex-shrink:0"></span> Start Date</div>
        <div style="height:18px;border-bottom:1.5px solid #e8dfd4;line-height:18px;padding:0 2px;font-size:13px;font-weight:500;color:#374151" data-wj-cover="date">___</div>
      </div>
      <div style="margin-bottom:12px">
        <div style="font-size:9px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;display:flex;align-items:center;gap:5px"><span style="width:5px;height:5px;border-radius:50%;background:${t.accent};display:inline-block;flex-shrink:0"></span> Wellness Goal</div>
        <div style="height:18px;border-bottom:1.5px solid #e8dfd4;line-height:18px;padding:0 2px;font-size:13px;font-weight:500;color:#374151">${vals['wellnessFocus'] || '___'}</div>
      </div>
      <div>
        <div style="font-size:9px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;display:flex;align-items:center;gap:5px"><span style="width:5px;height:5px;border-radius:50%;background:${t.accent};display:inline-block;flex-shrink:0"></span> Personal Mantra</div>
        <div style="height:18px;border-bottom:1.5px solid #e8dfd4;line-height:18px;padding:0 2px;font-size:13px;font-weight:500;color:#374151;font-style:italic">___</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:auto;padding-top:14px;flex-shrink:0">
      <span style="width:12px;height:1px;background:${t.accent}44"></span><span style="font-size:6px;color:${t.accent}66;letter-spacing:0.15em">✦ &nbsp; ✦</span><span style="width:12px;height:1px;background:${t.accent}44"></span>
    </div>
  </div>`);
}

function buildDashboard(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Wellness Journal') + pageBody(`
    <style>
      .wj-intent-write{min-height:20px;border:none;border-bottom:1.5px solid ${t.accent}44;padding:4px 0;line-height:20px;font-size:14px;font-weight:500;color:#374151;outline:none;overflow:hidden;resize:none;width:100%;background:transparent;font-family:'Playfair Display',Outfit,serif;text-align:center}
      .wj-intent-write:focus{border-bottom-color:${t.accent};border-bottom-width:2px}
      .wj-intent-write:empty:before{content:attr(data-placeholder);color:#9CA3AF;font-weight:400;font-style:italic}
    </style>
    <div style="display:flex;flex-direction:column;align-items:center;gap:24px;padding:20px 0 4px;min-height:380px">

      <div style="text-align:center">
        <div style="font-size:22px;font-weight:500;color:#374151;letter-spacing:-0.01em" data-wj-greeting></div>
        <div style="font-size:12px;color:#6B7280;font-weight:500;margin-top:2px" data-wj-date></div>
      </div>

      <div style="width:100%;max-width:400px;background:#fff;border-radius:16px;padding:24px 20px 20px;box-shadow:0 2px 20px rgba(0,0,0,0.04),0 0 0 1px ${t.accent}12;text-align:center">
        <div style="font-size:11px;font-weight:600;color:${t.accent};letter-spacing:0.04em;margin-bottom:10px;text-transform:uppercase" data-wj-prompt-label>Today's Intention</div>
        <div style="font-size:15px;font-weight:500;color:#374151;line-height:1.45;margin-bottom:12px;font-family:'Playfair Display',Outfit,serif" data-wj-prompt-text></div>
        <div class="wj-intent-write" contenteditable="true" data-wj-intent spellcheck="false" data-placeholder="Write your intention here..."></div>
        <div style="margin-top:10px;min-height:20px">
          <span style="font-size:10px;font-weight:600;color:#059669;display:none" data-wj-saved-indicator>\u2713 Saved</span>
        </div>
      </div>

      <div style="text-align:center">
        <div style="font-size:10px;color:#6B7280;font-weight:500;line-height:1.5;max-width:320px" data-wj-status-message>
          Set your intention to begin.
        </div>
        <div style="display:flex;gap:12px;margin-top:8px;justify-content:center;flex-wrap:wrap">
          <span style="font-size:9px;color:${t.accent};font-weight:600;cursor:pointer;display:none" data-wj-go-morning>\u2192 Morning Check-in</span>
          <span style="font-size:9px;color:${t.accent};font-weight:600;cursor:pointer;display:none" data-wj-go-evening>\u2192 Evening Reflection</span>
        </div>
      </div>

    </div>
  `));
}

function buildHabitTracker(t: typeof THEME[string], values?: Record<string, string>): string {
  const rawHabits = values && values['habits'] ? values['habits'] : '';
  const habitNames = rawHabits
    .split(/[,\n;]+/)
    .map((h: string) => h.trim())
    .filter((h: string) => h.length > 0)
    .slice(0, 6);
  const HABIT_NAMES = habitNames.length > 0
    ? habitNames
    : ['Exercise', 'Meditate', 'Read', 'Journal', 'Hydrate', 'Sleep Well'];
  const dayLabels = ['28','','','','','','','','','','','','','','','','','','','','','','','','','','','1'];
  const todayText = HABIT_NAMES.length === 1
    ? 'You\u2019ve done 0 of 1 habit today'
    : 'You\u2019ve done 0 of ' + HABIT_NAMES.length + ' habits today';
  return pageWrap(pageHeader('Habit Tracker', 'Gentle daily awareness, not perfection') + pageBody(`
    <div style="background:linear-gradient(135deg,${t.accent}08,${t.accent}15);border-radius:14px;padding:16px;margin-bottom:14px;border:1px solid ${t.accent}20">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:16px">🌸</span>
        <span style="font-size:11px;font-weight:600;color:#4B5563">Today's Practice</span>
      </div>
      <div style="display:flex;height:6px;border-radius:3px;background:#ede4d8;overflow:hidden;margin-bottom:8px">
        <div style="height:100%;border-radius:3px;background:${t.accent};width:0%;transition:width 0.4s ease" data-wj-today-bar></div>
      </div>
      <div style="font-size:9px;color:#6B7280" data-wj-today-text>${todayText}</div>
      <div style="font-size:8px;color:#9CA3AF;margin-top:2px;font-style:italic">Every moment is a fresh start.</div>
    </div>
    <div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:6px">Monthly Pattern</div>
    <div style="display:flex;gap:3px;margin-bottom:6px;padding-left:76px">
      ${dayLabels.map((l,i) => `<span style="flex:1;text-align:center;font-size:7px;color:#9CA3AF;font-weight:600">${l}</span>`).join('')}
    </div>
    ${HABIT_NAMES.map((name, hi) => `
    <div style="display:flex;align-items:center;gap:3px;padding:2px 0">
      <span style="width:72px;font-size:9px;font-weight:600;color:#374151;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(name)}">${esc(name)}</span>
      ${Array.from({length:28}, (_, di) => `
      <span data-wj-habit="${hi}" data-wj-day="${di}" style="flex:1;aspect-ratio:1;border-radius:3px;background:#f5f0ea;border:1px solid #ede4d8;cursor:pointer;display:inline-block;min-width:14px;transition:all 0.15s"></span>`).join('')}
      <span style="width:24px;text-align:center;flex-shrink:0;font-size:12px;line-height:1" data-wj-habit-indicator="${hi}">○</span>
    </div>`).join('')}
    <div style="display:flex;gap:12px;margin-top:6px;margin-bottom:10px;font-size:9px;color:#6B7280">
      <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:3px;background:${t.accent};display:inline-block"></span> Done</span>
      <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:3px;background:#f5f0ea;border:1px solid #ede4d8;display:inline-block"></span> Missed</span>
      <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:3px;background:#fef9c3;border:1px solid #fde68a;display:inline-block"></span> Today</span>
    </div>
    <div style="margin-top:4px;padding:10px 14px;background:${t.accent}08;border-radius:10px;display:flex;gap:8px;align-items:center">
      <span style="font-size:9px;font-weight:600;color:#4B5563;flex-shrink:0">🎯 Focus Habit:</span><div contenteditable="true" style="flex:1;height:16px;border-bottom:1.5px solid #d4c9bc;line-height:16px;font-size:9px;outline:none;color:#374151">___</div>
    </div>
  `));
}

function buildMorningCheckin(t: typeof THEME[string]): string {
  const moods = ['😊','🙂','😐','😔','😫'];
  return pageWrap(pageHeader('Morning Check-in', 'Start your day with intention') + pageBody(`
    <div style="font-size:9px;color:#6B7280;margin-bottom:10px">How are you feeling this morning?</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      ${card('background:#f0f9ff;padding:10px', `<div style="font-size:9px;color:#6B7280;margin-bottom:4px">☀️ Energy (1-10)</div>
        <div style="display:flex;align-items:center;gap:6px"><input type="range" min="1" max="10" value="6" data-wj-slider="am-energy" style="flex:1;accent-color:${t.accent};height:4px;cursor:pointer"><span data-wj-slider-val="am-energy" style="font-size:13px;font-weight:800;color:${t.accent};min-width:16px;text-align:center">6</span></div>`)}
      ${card('background:#fdf2f8;padding:10px', `<div style="font-size:9px;color:#6B7280;margin-bottom:4px">🎭 Mood</div>
        <div style="display:flex;gap:4px">${moods.map((m,i) => `<span data-wj-mood="am-mood" data-val="${i}" style="font-size:16px;cursor:pointer;opacity:0.35">${m}</span>`).join('')}</div>`)}
    </div>
    ${sectionDivider(t.accent)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${card('border-left:3px solid #0284c7', `<div style="font-size:10px;font-weight:700;color:#0284c7">🌅 Today's Intention</div>
        <div style="font-size:9px;color:#6B7280;margin-top:4px">Today I will...</div>${wb(16)}
        <div style="font-size:9px;color:#6B7280;margin-top:4px">I'll prioritize my wellbeing by...</div>${wb(16)}`)}
      ${card('border-left:3px solid #059669', `<div style="font-size:10px;font-weight:700;color:#059669">🔁 Affirmation</div>
        <div style="font-size:9px;color:#6B7280;margin-top:4px">I am...</div>${wb(16)}
        <div style="font-size:9px;color:#6B7280;margin-top:4px">Today's word / theme:</div>${wb(16)}`)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
      ${card('', `<div style="font-size:9px;color:#6B7280">💧 Hydration goal</div><div style="display:flex;align-items:center;gap:4px;margin-top:2px">${wl(14)}<span style="font-size:9px;color:#9CA3AF">glasses</span></div>`)}
      ${card('', `<div style="font-size:9px;color:#6B7280">🏃 Movement plan</div><div style="display:flex;align-items:center;gap:4px;margin-top:2px">${wl(14)}<span style="font-size:9px;color:#9CA3AF">min</span><span style="font-size:9px;color:#e8dfd4">·</span>${wl(14)}<span style="font-size:9px;color:#9CA3AF">type</span></div>`)}
    </div>
  `));
}

function buildEveningReflection(t: typeof THEME[string]): string {
  const moods = ['😊','🙂','😐','😔','😫'];
  return pageWrap(pageHeader('Evening Reflection', 'Close your day with gratitude') + pageBody(`
    <div style="font-size:9px;color:#6B7280;margin-bottom:10px">A few moments to reflect on today.</div>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      ${card('flex:1;text-align:center;padding:8px', `<div style="font-size:9px;color:#6B7280">Day Rating</div><div style="display:flex;gap:3px;justify-content:center;margin-top:4px">${[1,2,3,4,5].map(i => `<span data-wj-star="${i}" style="font-size:16px;cursor:pointer;opacity:0.3">★</span>`).join('')}</div>`)}
      ${card('flex:1;text-align:center;padding:8px', `<div style="font-size:9px;color:#6B7280">Evening Mood</div><div style="display:flex;gap:4px;justify-content:center;margin-top:4px">${moods.map((m,i) => `<span data-wj-mood="pm-mood" data-val="${i}" style="font-size:16px;cursor:pointer;opacity:0.35">${m}</span>`).join('')}</div>`)}
    </div>
    ${sectionDivider(t.accent)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      ${card('border-left:3px solid #d97706', `<div style="font-size:10px;font-weight:700;color:#d97706">⭐ What Went Well</div>${wb(16)}${wb(16)}`)}
      ${card('border-left:3px solid #dc2626', `<div style="font-size:10px;font-weight:700;color:#dc2626">⚡ What Challenged Me</div>${wb(16)}`)}
    </div>
    <div style="margin-bottom:10px">
      ${card('border-left:3px solid #7c3aed', `<div style="font-size:10px;font-weight:700;color:#7c3aed">💡 One Lesson Learned</div>${wb(16)}`)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${card('border-left:3px solid #059669', `<div style="font-size:10px;font-weight:700;color:#059669">🌱 3 Things I'm Grateful For</div>${wb(16)}${wb(16)}${wb(16)}`)}
      ${card('border-left:3px solid #0284c7', `<div style="font-size:10px;font-weight:700;color:#0284c7">🌙 Wind-Down Plan</div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <span style="font-size:9px;color:#6B7280">Bedtime:</span>${wl(14)}
          <span style="font-size:9px;color:#6B7280">Wake:</span>${wl(14)}
        </div>
        <div style="font-size:9px;color:#6B7280;margin-top:4px">Tonight I'll...</div>${wb(16)}`)}
    </div>
  `));
}

function buildGratitudeJournal(t: typeof THEME[string]): string {
  const prompts = ['A kind gesture I received', 'Something beautiful I saw', 'Someone who made me smile', 'A moment of peace', 'Something I learned', 'My body did for me today', 'A memory I cherish', 'The best part of my day'];
  return pageWrap(pageHeader('Gratitude Journal', 'What are you thankful for?') + pageBody(`
    <div style="font-size:9px;color:#6B7280;margin-bottom:10px">Gratitude shifts your focus from what's missing to what's abundant.</div>
    ${card('border-left:3px solid #059669;margin-bottom:10px', `<div style="font-size:10px;font-weight:700;color:#059669">🙏 Today I'm Grateful For...</div>${wb(16)}${wb(16)}${wb(16)}`)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      ${card('border-left:3px solid #0284c7', `<div style="font-size:10px;font-weight:700;color:#0284c7">👤 Who Made a Difference Today?</div>${wb(16)}`)}
      ${card('border-left:3px solid #7c3aed', `<div style="font-size:10px;font-weight:700;color:#7c3aed">🌸 A Small Moment I Want to Remember</div>${wb(16)}`)}
    </div>
    ${card('margin-bottom:10px', `<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">Gratitude Prompts</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${prompts.map(p => `<span data-wj-prompt="${p}" style="padding:3px 8px;border-radius:20px;font-size:9px;font-weight:600;border:1px solid #d4c9bc;color:#6B7280;cursor:pointer">${p}</span>`).join('')}</div>`)}
    <div style="padding:10px 14px;background:${t.accent}08;border-radius:10px;text-align:center;font-size:9px;color:#6B7280;font-style:italic">"Gratitude turns what we have into enough."</div>
  `));
}

function buildSelfCarePlanner(t: typeof THEME[string]): string {
  const checklist = ['Drink enough water', 'Move my body', 'Eat nourishing meals', 'Take intentional breaks', 'Spend time outside', 'Do something I enjoy'];
  const activities = ['Go for a walk', 'Stretch / Yoga', 'Call a friend', 'Read a book', 'Take a nap', 'Meditate', 'Listen to music', 'Cook something', 'Take a bath', 'Write in journal', 'Watch a sunset', 'Draw / Paint', 'Dance', 'Deep breathing', 'Declutter space', 'Skin care routine'];
  return pageWrap(pageHeader('Self-Care Planner', 'Rest is not optional') + pageBody(`
    <div style="font-size:9px;color:#6B7280;margin-bottom:14px">What does your body and mind need right now?</div>
    <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:14px">
      ${card('border-left:3px solid #059669', `<div style="font-size:10px;font-weight:700;color:#059669">🎯 This Week's Self-Care Focus</div>${wb(16)}`)}
      ${card('', `<div style="font-size:10px;font-weight:700;color:#059669">☐ Self-Care Checklist</div>${checklist.map(c => checkboxRow({label: c})).join('')}`)}
      ${card('', `<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">📝 Self-Care Notes</div>${wb(16)}${wb(16)}`)}
      ${card('', `<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">🔄 Daily Routine</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          <div><span style="font-size:9px;color:#6B7280">Morning</span>${wl(14)}</div>
          <div><span style="font-size:9px;color:#6B7280">Afternoon</span>${wl(14)}</div>
          <div><span style="font-size:9px;color:#6B7280">Evening</span>${wl(14)}</div>
        </div>`)}
      ${card('', `<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:6px">💡 Activity Ideas</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${activities.map(a => `<span data-wj-activity="${a}" style="padding:4px 10px;border-radius:20px;font-size:9px;font-weight:600;border:1px solid #d4c9bc;color:#6B7280;cursor:pointer">${a}</span>`).join('')}</div>`)}
      ${card('border-left:3px solid #7c3aed', `<div style="font-size:10px;font-weight:700;color:#7c3aed">🤝 I Commit To...</div>${wb(16)}`)}
    </div>
    <div style="padding:12px 16px;background:${t.accent}08;border-radius:12px;text-align:center">
      <div style="font-size:9px;color:#6B7280;font-style:italic">Rest is not something you earn. It's something you deserve.</div>
    </div>
  `));
}

function buildSleepWellness(t: typeof THEME[string]): string {
  const hygieneLabels = ['No screens 30 min before bed', 'Room cool & dark', 'Consistent bedtime', 'Relaxing wind-down routine', 'No caffeine after 4 PM'];
  return pageWrap(pageHeader('Sleep Wellness', 'Rest is not a reward, it is a need') + pageBody(`
    <div style="font-size:9px;color:#6B7280;margin-bottom:10px">A gentle check-in with your sleep — no judgment, just awareness.</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      ${card('text-align:center;padding:10px', `<div style="font-size:9px;color:#6B7280">😴 Hours slept</div><div style="display:flex;align-items:center;gap:4px;justify-content:center;margin-top:2px">${wl(14)}<span style="font-size:9px;color:#6B7280">hrs</span></div>`)}
      ${card('text-align:center;padding:10px', `<div style="font-size:9px;color:#6B7280">⭐ Quality</div>
        <div style="display:flex;align-items:center;gap:4px;justify-content:center;margin-top:2px">
          <input type="range" min="1" max="10" value="6" data-wj-slider="sleep-quality" style="width:60px;accent-color:${t.accent};height:3px;cursor:pointer">
          <span data-wj-slider-val="sleep-quality" style="font-size:12px;font-weight:800;color:${t.accent};min-width:14px;text-align:center">6</span>
        </div>`)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><span style="font-size:9px;color:#6B7280">🛌 Bedtime:</span>${wl(14)}</div>
      <div><span style="font-size:9px;color:#6B7280">☀️ Wake:</span>${wl(14)}</div>
    </div>
    ${card('border-left:3px solid #7c3aed;margin-bottom:12px', `<div style="font-size:10px;font-weight:700;color:#7c3aed">📓 Dream Journal</div>${wb(16)}`)}
    ${card('margin-bottom:10px', `<div style="font-size:10px;font-weight:700;color:#059669">☐ Sleep Hygiene Checklist</div>${hygieneLabels.map(l => checkboxRow({label: l})).join('')}`)}
    ${card('margin-bottom:10px', `<div style="font-size:10px;font-weight:600;color:#4B5563">☕ Caffeine / Screens before bed</div>${wb(16)}`)}
    <div style="padding:10px 14px;background:${t.accent}08;border-radius:10px;text-align:center;font-size:9px;color:#6B7280;font-style:italic">"Sleep is the best meditation." — Dalai Lama</div>
  `));
}

function buildStressMood(t: typeof THEME[string]): string {
  const weighing = ['Work','School','Relationships','Health','Finances','Social Media','Noise','Weather','Not Enough Sleep','Overwhelmed','Uncertain','Hard on Myself'];
  const supports = ['Deep Breathing','Walk','Call a Friend','Music','Journaling','Exercise','Meditation','Hot Bath','Read','Clean/Organize','Nap','Cooking'];
  return pageWrap(pageHeader('Stress & Mood', 'Notice without judgment') + pageBody(`
    <div style="font-size:9px;color:#6B7280;margin-bottom:10px">Name what you are feeling. You don't have to fix it.</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      ${card('text-align:center;padding:10px', `<div style="font-size:9px;color:#6B7280">😌 Stress</div>
        <div style="display:flex;align-items:center;gap:6px;justify-content:center;margin-top:4px">
          <input type="range" min="1" max="10" value="4" data-wj-slider="stress-level" style="width:80px;accent-color:${t.accent};height:4px;cursor:pointer">
          <span data-wj-slider-val="stress-level" style="font-size:14px;font-weight:900;color:${t.accent};min-width:16px;text-align:center">4</span>
        </div>`)}
      ${card('text-align:center;padding:10px', `<div style="font-size:9px;color:#6B7280">💭 Mood</div>
        <div style="display:flex;gap:4px;justify-content:center;margin-top:4px">${['😊','🙂','😐','😔','😫'].map((m,i) => `<span data-wj-mood="stress-mood" data-val="${i}" style="font-size:16px;cursor:pointer;opacity:0.35">${m}</span>`).join('')}</div>`)}
    </div>
    ${card('border-left:3px solid #059669;margin-bottom:12px', `<div style="font-size:10px;font-weight:700;color:#059669">🌤️ What Lifted My Spirits Today?</div>${wb(16)}`)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      ${card('', `<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">🌱 What's weighing on me</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${weighing.map(tg => `<span data-wj-trigger="${tg}" style="padding:3px 8px;border-radius:20px;font-size:9px;font-weight:600;border:1px solid #d4c9bc;color:#6B7280;cursor:pointer">${tg}</span>`).join('')}</div>`)}
      ${card('', `<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">🤲 What helps me feel better</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${supports.map(s => `<span data-wj-cope="${s}" style="padding:3px 8px;border-radius:20px;font-size:9px;font-weight:600;border:1px solid #d4c9bc;color:#6B7280;cursor:pointer">${s}</span>`).join('')}</div>`)}
    </div>
    ${card('text-align:center;padding:14px', `<div style="font-size:10px;font-weight:700;color:#0284c7;margin-bottom:8px">🫁 A Moment to Breathe</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px">
        <svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" fill="none" stroke="#0284c7" stroke-width="0.5" opacity="0.2"/><circle cx="28" cy="28" r="16" fill="none" stroke="#0284c7" stroke-width="0.5" opacity="0.3"/><circle cx="28" cy="28" r="8" fill="none" stroke="#0284c7" stroke-width="1" opacity="0.4"/><circle cx="28" cy="28" r="3" fill="#0284c7" opacity="0.12"/></svg>
        <div style="text-align:left;font-size:9px;color:#6B7280;line-height:1.7">
          <span style="color:#0284c7;font-weight:600">Inhale</span> softly (4)<br>
          <span style="color:#6366f1;font-weight:600">Hold</span> gently (4)<br>
          <span style="color:#7c3aed;font-weight:600">Exhale</span> slowly (6)
        </div>
      </div>
      <div style="font-size:9px;color:#6B7280;font-style:italic">Repeat 3 times. You are safe here.</div>`)}
  `));
}

function buildMonthlyReview(t: typeof THEME[string]): string {
  return pageWrap(pageHeader('Monthly Review', 'Close the chapter with intention') + pageBody(`
    <div style="font-size:9px;color:#6B7280;margin-bottom:10px">Before you turn the page, honor what this month held.</div>
    ${card('border-left:3px solid #059669;margin-bottom:12px', `<div style="font-size:10px;font-weight:700;color:#059669">🌟 What I'm Proud of This Month</div>${wb(16)}${wb(16)}`)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      ${card('border-left:3px solid #7c3aed', `<div style="font-size:10px;font-weight:700;color:#7c3aed">📖 What I Learned About Myself</div>${wb(16)}`)}
      ${card('border-left:3px solid #e11d48', `<div style="font-size:10px;font-weight:700;color:#e11d48">🍂 What I'm Ready to Release</div>${wb(16)}`)}
    </div>
    ${card('border-left:3px solid #6366f1;margin-bottom:10px', `<div style="font-size:10px;font-weight:700;color:#6366f1">🌸 Next Month's Intention</div>${wb(16)}`)}
    <div style="padding:12px 14px;background:linear-gradient(135deg,${t.accent}10,${t.accent}20);border-radius:10px;text-align:center">
      <div style="font-size:9px;color:#6B7280;font-style:italic">"And with that, this chapter closes. You did what you could with what you had."</div>
      <div style="font-size:14px;margin-top:4px">📖</div>
    </div>
  `));
}

export interface PageEntry { id: string; title: string; html: string }

export class WellnessJournalPreview {
  private values: Record<string, string>;
  private theme: typeof THEME[string];
  private title: string;
  private icon: string;

  constructor(values: Record<string, string>, theme: typeof THEME[string], title?: string, icon?: string) {
    this.values = values;
    this.theme = theme;
    this.title = title || 'Wellness Journal';
    this.icon = icon || '🌿';
  }

  getPageList(): PageEntry[] {
    const t = this.theme;
    return [
      { id: 'wj-cover', title: 'Cover', html: buildCover(t, this.values) },
      { id: 'wj-dashboard', title: 'Dashboard', html: buildDashboard(t) },
      { id: 'wj-habits', title: 'Habit Tracker', html: buildHabitTracker(t, this.values) },
      { id: 'wj-morning', title: 'Morning Check-in', html: buildMorningCheckin(t) },
      { id: 'wj-evening', title: 'Evening Reflection', html: buildEveningReflection(t) },
      { id: 'wj-gratitude', title: 'Gratitude Journal', html: buildGratitudeJournal(t) },
      { id: 'wj-selfcare', title: 'Self-Care Planner', html: buildSelfCarePlanner(t) },
      { id: 'wj-sleep', title: 'Sleep Wellness', html: buildSleepWellness(t) },
      { id: 'wj-stress', title: 'Stress & Mood', html: buildStressMood(t) },
      { id: 'wj-review', title: 'Monthly Review', html: buildMonthlyReview(t) },
    ];
  }

  getPageCount(): number { return this.getPageList().length; }
}
