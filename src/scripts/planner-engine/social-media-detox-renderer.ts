import { THEME_COLORS } from './preview-renderer';

function esc(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function pageWrap(content: string): string {
  return '<div style="width:100%;max-width:800px;margin:0 auto;background:#fffcf5;border-radius:20px;box-shadow:0 2px 24px rgba(0,0,0,0.04),0 0 0 1px rgba(139,125,107,0.08);overflow:visible;font-family:Outfit,Inter,sans-serif;position:relative;color:#374151">' + content + '</div>' +
    '<style>.smd-chip{cursor:pointer;padding:3px 10px;border-radius:20px;font-size:9px;font-weight:600;border:1.5px solid #d4c9bc;color:#6B7280;background:transparent;transition:all 0.15s ease;user-select:none}.smd-chip:hover{border-color:#0284c7;color:#0284c7;background:#f0f9ff}.smd-chip.smd-active{background:#0284c7;border-color:#0284c7;color:white}' +
    '.smd-ri{background:transparent;border-color:transparent}.smd-ri:hover{transform:translateY(-1px);box-shadow:0 2px 10px rgba(0,0,0,0.06);background:#faf7f2}.smd-ri:focus-visible{outline:2px solid var(--cat-color,#0284c7);outline-offset:1px;border-radius:6px}.smd-ri.smd-ri-sel{background:var(--ri-bg,#f0fdf4);border-color:var(--cat-color,#10b981)}.smd-ri.smd-ri-sel .smd-ri-label{color:var(--cat-color,#065f46);font-weight:700}.smd-ri.smd-ri-sel:hover{box-shadow:0 3px 12px rgba(0,0,0,0.08)}.smd-ri.smd-ri-fav .smd-ri-star{color:#f59e0b;text-shadow:0 0 4px rgba(245,158,11,0.3)}.smd-ri .smd-ri-star:hover{transform:scale(1.3)}.smd-ri:active{transform:translateY(0);box-shadow:0 1px 4px rgba(0,0,0,0.04)}.smd-choice-display{min-height:14px;display:inline-block}.smd-top3-slot{transition:border-color 0.2s ease,color 0.2s ease}.smd-top3-slot:focus{border-bottom-color:#059669;color:#065f46;outline:none}' +
    '.smd-mr-field{border-bottom-color:#d4c9bc}.smd-mr-field:focus{border-bottom-color:#0284c7}.smd-mr-field:focus,.smd-mr-field:hover{background:#faf7f2}.smd-mr-label{border-bottom-color:transparent}.smd-mr-label:focus,.smd-mr-label:hover{border-bottom-color:#d4c9bc}' +
    '.smd-br-field{border-bottom-color:#d4c9bc}.smd-br-field:focus{border-bottom-color:#7c3aed}.smd-br-field:focus,.smd-br-field:hover{background:#faf7f2}.smd-br-label{border-bottom-color:transparent}.smd-br-label:focus,.smd-br-label:hover{border-bottom-color:#d4c9bc}' +
    '.smd-bc-field{border-bottom-color:transparent}.smd-bc-field:focus,.smd-bc-field:hover{border-bottom-color:#d4c9bc}.smd-bc-dur:hover{box-shadow:0 2px 8px rgba(0,0,0,0.06)}.smd-bc-dur:focus-visible{outline:2px solid #0284c7;outline-offset:2px;border-radius:12px}' +
    '.smd-fz-field{border-bottom-color:#d4c9bc}.smd-fz-field:focus{border-bottom-color:#0284c7}.smd-fz-sched{border-bottom-color:transparent}.smd-fz-sched:focus,.smd-fz-sched:hover{border-bottom-color:#d4c9bc}.smd-fz-schedtime{border-bottom-color:transparent}.smd-fz-schedtime:focus,.smd-fz-schedtime:hover{border-bottom-color:#d4c9bc}.smd-fz-ritual{border-bottom-color:transparent}.smd-fz-ritual:focus,.smd-fz-ritual:hover{border-bottom-color:#d4c9bc}' +
    '.smd-wr-field{border-bottom-color:transparent;transition:border-color 0.2s ease,background 0.15s ease;caret-color:#0284c7}.smd-wr-field:focus{border-bottom-color:#0284c7;background:#faf7f2;outline:none}.smd-wr-field:hover{border-bottom-color:#d4c9bc}.smd-wr-field:focus:hover{border-bottom-color:#0284c7}.smd-wr-stat{transition:all 0.3s ease}' +
    '.smd-wr-trend-bar{height:100%;border-radius:2px;transition:width 0.4s cubic-bezier(0.34,1.56,0.64,1),background 0.3s ease;min-width:2px}.smd-wr-trend-bar:hover{opacity:0.8;transform:scaleY(1.15);transform-origin:bottom}' +
    '.smd-rm-field{border-bottom-color:transparent;transition:border-color 0.15s ease}.smd-rm-field:focus,.smd-rm-field:hover{border-bottom-color:#d4c9bc;outline:none}.smd-rm-label{border-bottom-color:transparent;transition:border-color 0.15s ease}.smd-rm-label:focus,.smd-rm-label:hover{border-bottom-color:#d4c9bc;outline:none}' +
    '.smd-mr2-field{border-bottom-color:transparent;transition:border-color 0.15s ease,background 0.15s ease}.smd-mr2-field:focus{border-bottom-color:#0284c7;background:#faf7f2;outline:none}.smd-mr2-field:hover{border-bottom-color:#d4c9bc}.smd-mr2-block{border-bottom-color:transparent;transition:border-color 0.15s ease,background 0.15s ease}.smd-mr2-block:focus{border-bottom-color:#0284c7;background:#faf7f2;outline:none}.smd-mr2-block:hover{border-bottom-color:#d4c9bc}.smd-mr2-stat{transition:all 0.3s ease}' +
    '.smd-deep-field{border-bottom-color:#d4c9bc}.smd-deep-field:focus{border-bottom-color:#0284c7}.smd-deep-num{font-variant-numeric:tabular-nums}.smd-deep-status:hover{color:#4B5563;background:#f5f0ea}.smd-deep-status:focus-visible{outline:2px solid #0284c7;outline-offset:1px;border-radius:4px}.smd-deep-status.smd-deep-active{background:#f0fdf5;border-color:#86efac;color:#059669}.smd-deep-status[data-smd-deep-status="limit"].smd-deep-active{background:#fffbeb;border-color:#fde68a;color:#d97706}.smd-deep-status[data-smd-deep-status="delete"].smd-deep-active{background:#fef2f2;border-color:#fecaca;color:#dc2626}.smd-deep-copy:hover{color:#4B5563!important}.smd-deep-copy:focus-visible{outline:2px solid #0284c7;outline-offset:1px;border-radius:3px}.smd-deep-row.smd-deep-row-keep{border-left:3px solid #86efac}.smd-deep-row.smd-deep-row-limit{border-left:3px solid #fde68a}.smd-deep-row.smd-deep-row-delete{border-left:3px solid #fecaca}' +
    '@media print{.smd-mr-field{border-bottom-color:#d4c9bc!important}.smd-mr-field:focus{border-bottom-color:#d4c9bc!important;outline:none!important}.smd-mr-label{border-bottom-color:transparent!important}.smd-mr-label:focus,.smd-mr-label:hover{border-bottom-color:#d4c9bc!important;outline:none!important}.smd-br-field{border-bottom-color:#d4c9bc!important}.smd-br-field:focus{border-bottom-color:#d4c9bc!important;outline:none!important}.smd-br-label{border-bottom-color:transparent!important}.smd-br-label:focus,.smd-br-label:hover{border-bottom-color:#d4c9bc!important;outline:none!important}.smd-bc-field{border-bottom-color:transparent!important}.smd-bc-field:focus,.smd-bc-field:hover{border-bottom-color:#d4c9bc!important;outline:none!important}.smd-bc-dur{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-shadow:none!important}.smd-bc-dur:focus-visible{outline:none!important}.smd-fz-field{border-bottom-color:#d4c9bc!important}.smd-fz-field:focus{border-bottom-color:#d4c9bc!important;outline:none!important}.smd-fz-sched,.smd-fz-schedtime,.smd-fz-ritual{border-bottom-color:transparent!important}.smd-fz-sched:focus,.smd-fz-sched:hover,.smd-fz-schedtime:focus,.smd-fz-schedtime:hover,.smd-fz-ritual:focus,.smd-fz-ritual:hover{border-bottom-color:#d4c9bc!important;outline:none!important}.smd-wr-field{border-bottom-color:transparent!important}.smd-wr-field:focus{border-bottom-color:#0284c7!important;outline:none!important;background:transparent!important}.smd-wr-field:hover{border-bottom-color:#d4c9bc!important}.smd-wr-trend-bar{-webkit-print-color-adjust:exact;print-color-adjust:exact}.smd-wr-trend-bar:hover{opacity:1!important;transform:none!important}.smd-rm-field{border-bottom-color:transparent!important}.smd-rm-field:focus,.smd-rm-field:hover{border-bottom-color:#d4c9bc!important;outline:none!important}.smd-rm-label{border-bottom-color:transparent!important}.smd-rm-label:focus,.smd-rm-label:hover{border-bottom-color:#d4c9bc!important;outline:none!important}.smd-mr2-field{border-bottom-color:transparent!important}.smd-mr2-field:focus{border-bottom-color:#0284c7!important;outline:none!important;background:transparent!important}.smd-mr2-field:hover{border-bottom-color:#d4c9bc!important}.smd-mr2-block{border-bottom-color:transparent!important}.smd-mr2-block:focus{border-bottom-color:#0284c7!important;outline:none!important;background:transparent!important}.smd-mr2-block:hover{border-bottom-color:#d4c9bc!important}[data-smd-cover]{border-bottom-color:transparent!important;outline:none!important}.smd-ri{break-inside:avoid;border-color:transparent!important;box-shadow:none!important}.smd-ri:hover{transform:none;box-shadow:none}.smd-ri.smd-ri-sel{-webkit-print-color-adjust:exact;print-color-adjust:exact;border:1.5px solid var(--cat-color,#10b981)!important;background:transparent!important}.smd-ri.smd-ri-sel .smd-ri-box{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:var(--cat-color,#10b981)!important;border-color:var(--cat-color,#10b981)!important;color:white!important}.smd-ri.smd-ri-fav .smd-ri-star{color:#f59e0b!important;text-shadow:none!important}.smd-ri:focus-visible{outline:none!important}.smd-smart-suggest{-webkit-print-color-adjust:exact;print-color-adjust:exact}#smd-replace-celebrate{-webkit-print-color-adjust:exact;print-color-adjust:exact}.smd-deep-field{border-bottom-color:#d4c9bc!important}.smd-deep-field:focus{border-bottom-color:#0284c7!important;outline:none!important}.smd-deep-status{border-color:transparent!important;color:#9CA3AF!important;background:transparent!important}.smd-deep-status.smd-deep-active{-webkit-print-color-adjust:exact;print-color-adjust:exact}.smd-deep-status[data-smd-deep-status="keep"].smd-deep-active{background:#f0fdf5!important;border-color:#86efac!important;color:#059669!important}.smd-deep-status[data-smd-deep-status="limit"].smd-deep-active{background:#fffbeb!important;border-color:#fde68a!important;color:#d97706!important}.smd-deep-status[data-smd-deep-status="delete"].smd-deep-active{background:#fef2f2!important;border-color:#fecaca!important;color:#dc2626!important}.smd-deep-row.smd-deep-row-keep{border-left:3px solid #86efac!important}.smd-deep-row.smd-deep-row-limit{border-left:3px solid #fde68a!important}.smd-deep-row.smd-deep-row-delete{border-left:3px solid #fecaca!important}.smd-deep-copy{display:none!important}}</style>';
}

function pageHeader(title: string, subtitle?: string): string {
  return '<div style="padding:20px 24px 10px;border-bottom:1px solid #ede4d8;display:flex;align-items:flex-start;justify-content:space-between">' +
    '<div><div style="font-size:16px;font-weight:700;color:#1F2937;letter-spacing:-0.01em;font-family:\'Playfair Display\',Outfit,serif">' + title + '</div>' +
    (subtitle ? '<div style="font-size:9px;color:#6B7280;font-weight:500;margin-top:2px;font-style:italic">' + subtitle + '</div>' : '') + '</div>' +
    (subtitle ? '<div style="font-size:8px;color:#4B5563;background:#f5f0ea;padding:3px 10px;border-radius:20px;font-weight:600;white-space:nowrap;flex-shrink:0;margin-top:2px">' + subtitle + '</div>' : '') +
  '</div>';
}

function pageBody(content: string): string {
  return '<div style="padding:14px 24px 20px">' + content + '</div>';
}

function wl(height: number = 16): string {
  return '<span style="display:inline-block;flex:1;height:' + height + 'px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:' + height + 'px;font-size:' + (height - 4) + 'px"></span>';
}

function wb(height: number = 16): string {
  return '<div style="height:' + height + 'px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:' + height + 'px;font-size:' + (height - 4) + 'px"></div>';
}

function card(style: string, content: string): string {
  return '<div style="background:#faf7f2;border-radius:10px;border:1px solid #ede4d8;padding:12px;' + style + '">' + content + '</div>';
}

function progressBar(pct: number, color: string): string {
  return '<div style="height:6px;background:#ede4d8;border-radius:3px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px;transition:width 0.4s ease"></div></div>';
}

function sectionDivider(color: string): string {
  return '<div style="display:flex;align-items:center;gap:8px;margin:16px 0 10px"><span style="flex:1;height:1px;background:linear-gradient(to right,transparent,' + color + '44)"></span><span style="width:4px;height:4px;border-radius:50%;background:' + color + '55"></span><span style="flex:1;height:1px;background:linear-gradient(to right,' + color + '44,transparent)"></span></div>';
}

function checkboxRow(opts: any = {}): string {
  const size = opts.size ?? 14;
  const checked = opts.checked ?? false;
  const checkColor = opts.checkColor ?? '#10b981';
  const label = opts.label ?? '';
  const labelSize = opts.labelSize ?? 9;
  const labelColor = opts.labelColor ?? '#6B7280';
  const borderBottom = opts.borderBottom ?? true;
  const radius = size <= 10 ? 2 : 3;
  const innerSize = Math.max(size - 6, 4);
  const checkSvg = checked ? '<svg width="' + innerSize + '" height="' + innerSize + '" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
  const bg = checked ? checkColor : 'transparent';
  const bColor = checked ? checkColor : '#d4c9bc';
  const rowBorder = borderBottom ? 'border-bottom:1.5px solid #d4c9bc' : '';
  return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;' + rowBorder + '">' +
    '<span class="pp-cb" style="width:' + size + 'px;height:' + size + 'px;border-radius:' + radius + 'px;border:1.5px solid ' + bColor + ';background:' + bg + ';display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">' + checkSvg + '</span>' +
    (label ? '<span style="font-size:' + labelSize + 'px;font-weight:600;color:' + labelColor + ';white-space:nowrap;flex-shrink:0">' + label + '</span>' : '') +
  '</div>';
}

const THEME = THEME_COLORS;

export function getTheme(name: string): typeof THEME[string] {
  return THEME[name] ?? THEME.violet;
}

const A = '#0284c7';

function buildCoverPage(t: typeof THEME[string], title: string, icon: string, values: Record<string, string>): string {
  const name = esc(values['name'] || 'Your Name');
  const goal = esc(values['detoxGoal'] || '');
  const topApp = esc(values['topApp'] || '');
  const defaultCommitment = 'I commit to reducing mindless scrolling and creating healthier digital habits.';
  const dotsBg = 'radial-gradient(circle,' + A + '12 1px,transparent 1px)';
  return pageWrap('<div style="padding:0;min-height:540px;background:#fffcf5;display:flex;flex-direction:column;position:relative;overflow:hidden">' +
    /* top decorative band */
    '<div style="height:6px;background:linear-gradient(to right,' + A + ',' + A + '88,#7c3aed,#059669,' + A + ');flex-shrink:0"></div>' +
    /* subtle dot pattern overlay */
    '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:' + dotsBg + ';background-size:20px 20px;opacity:0.35;pointer-events:none"></div>' +
    /* large decorative circle top-right */
    '<div style="position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,' + A + '15,transparent 70%);pointer-events:none"></div>' +
    /* large decorative circle bottom-left */
    '<div style="position:absolute;bottom:-40px;left:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,#7c3aed12,transparent 70%);pointer-events:none"></div>' +
    /* corner squiggle decorations */
    '<div style="position:absolute;top:16px;left:16px;font-size:10px;color:' + A + '30;letter-spacing:4px;pointer-events:none">✦ ✦ ✦</div>' +
    '<div style="position:absolute;bottom:16px;right:16px;font-size:10px;color:#7c3aed30;letter-spacing:4px;pointer-events:none">✦ ✦ ✦</div>' +
    /* content area */
    '<div style="padding:32px 28px 24px;flex:1;display:flex;flex-direction:column;position:relative;z-index:1">' +
      /* icon badge */
      '<div style="display:inline-flex;align-items:center;gap:6px;background:' + A + '12;padding:4px 12px 4px 8px;border-radius:20px;align-self:flex-start;border:1px solid ' + A + '25;margin-bottom:20px">' +
        '<span style="font-size:14px">' + icon + '</span>' +
        '<span style="font-size:8px;font-weight:700;color:' + A + ';letter-spacing:0.12em;text-transform:uppercase">Digital Wellness Workbook</span>' +
      '</div>' +
      /* hero title area */
      '<div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:6px">' +
        '<div>' +
          '<div style="font-size:30px;font-weight:900;color:#1F2937;letter-spacing:-0.03em;font-family:\'Playfair Display\',Outfit,serif;line-height:1.05">Social Media</div>' +
          '<div style="font-size:30px;font-weight:900;color:' + A + ';letter-spacing:-0.03em;font-family:\'Playfair Display\',Outfit,serif;line-height:1.05">Detox</div>' +
        '</div>' +
        '<div style="flex:1;height:2px;background:linear-gradient(to right,' + A + '44,transparent);margin-bottom:8px"></div>' +
      '</div>' +
      '<div style="font-size:10px;font-weight:500;color:#6B7280;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:22px">Reclaim Your Time · Reclaim Your Mind</div>' +
      /* premium stat badges row */
      '<div style="display:flex;gap:8px;margin-bottom:20px">' +
        '<div style="flex:1;background:white;border-radius:10px;padding:10px;text-align:center;border:1px solid #ede4d8;box-shadow:0 2px 8px rgba(0,0,0,0.03)">' +
          '<div style="font-size:7px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em">Goal</div>' +
          '<span data-smd-cover="goal" contenteditable="true" style="font-size:9px;font-weight:700;color:#1F2937;margin-top:2px;display:inline-block;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:14px;padding:0 1px;transition:border-color 0.15s ease">' + (goal || 'Digital detox') + '</span>' +
        '</div>' +
        '<div style="flex:1;background:white;border-radius:10px;padding:10px;text-align:center;border:1px solid #ede4d8;box-shadow:0 2px 8px rgba(0,0,0,0.03)">' +
          '<div style="font-size:7px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em">Top App</div>' +
          '<span data-smd-cover="topapp" contenteditable="true" style="font-size:9px;font-weight:700;color:#d97706;margin-top:2px;display:inline-block;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:14px;padding:0 1px;transition:border-color 0.15s ease">' + (topApp || '—') + '</span>' +
        '</div>' +
        '<div style="flex:1;background:white;border-radius:10px;padding:10px;text-align:center;border:1px solid #ede4d8;box-shadow:0 2px 8px rgba(0,0,0,0.03)">' +
          '<div style="font-size:7px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em">Target</div>' +
          '<div><span data-smd-cover="target" contenteditable="true" style="font-size:9px;font-weight:700;color:#059669;display:inline-block;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:14px;padding:0 1px;transition:border-color 0.15s ease">—</span><span style="font-size:7px;font-weight:500;color:#9CA3AF"> hrs/wk</span></div>' +
        '</div>' +
      '</div>' +
      /* commitment card */
      '<div style="background:linear-gradient(135deg,' + A + '08,#7c3aed08);border-radius:12px;border:1px solid ' + A + '18;padding:14px 16px;margin-bottom:16px">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<div style="width:32px;height:32px;border-radius:50%;background:' + A + '15;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:14px">✍️</span></div>' +
          '<div style="flex:1">' +
            '<div style="font-size:9px;font-weight:700;color:#1F2937">My Commitment</div>' +
            '<div data-smd-cover="commitment" contenteditable="true" style="font-size:8px;color:#6B7280;margin-top:1px;font-style:italic;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:1.6;padding:0;transition:border-color 0.15s ease">' + defaultCommitment + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      /* signature area */
      '<div style="display:flex;gap:16px;margin-top:auto;padding-top:8px">' +
        '<div style="flex:1">' +
          '<div style="font-size:7px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">Signed</div>' +
          '<div style="border-bottom:1.5px solid #d4c9bc;height:20px;display:flex;align-items:flex-end;padding-bottom:2px"><span data-smd-cover="name" contenteditable="true" style="font-size:9px;color:#4B5563;font-family:\'Caveat\',cursive;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:14px;padding:0;display:inline-block;transition:border-color 0.15s ease">' + name + '</span></div>' +
        '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:7px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">Date</div>' +
          '<span data-smd-cover="date" contenteditable="true" style="display:inline-block;width:100%;height:20px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:20px;font-size:14px;outline:none;transition:border-color 0.15s ease"></span>' +
        '</div>' +
        '<div style="flex:1;text-align:right">' +
          '<div style="font-size:7px;color:#9CA3AF;letter-spacing:0.08em">tooltails</div>' +
          '<div style="font-size:7px;color:#d4c9bc">✦ 2026 ✦</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>');
}

function buildDigitalAudit(): string {
  const apps = ['Instagram', 'TikTok', 'YouTube', 'Twitter / X', 'Facebook', 'Snapchat', 'Reddit', 'LinkedIn', 'WhatsApp', 'Other'];
  const triggers = ['Boredom', 'Procrastination', 'Loneliness', 'FOMO', 'Habit / Muscle memory', 'Notifications', 'Stress / Anxiety', 'Rest / Break'];
  return pageWrap(pageHeader('Digital Audit', 'Know your baseline') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">Be honest with yourself — this is your starting point, not a judgment.</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('text-align:center;padding:10px', '<div style="font-size:9px;color:#6B7280">📱 Daily screen time</div><div style="display:flex;align-items:center;gap:4px;justify-content:center;margin-top:2px">' + wl(14) + '<span style="font-size:9px;color:#6B7280">hrs</span></div>') +
      card('text-align:center;padding:10px', '<div style="font-size:9px;color:#6B7280">🔓 Phone unlocks / day</div><div style="display:flex;align-items:center;gap:4px;justify-content:center;margin-top:2px">' + wl(14) + '<span style="font-size:9px;color:#6B7280">times</span></div>') +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">Apps I Use Most</div><div style="display:flex;flex-wrap:wrap;gap:4px">' + apps.map(function(a) { return '<span class="smd-chip" data-smd-chip="' + a + '">' + a + '</span>'; }).join('') + '</div>') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('border-left:3px solid #d97706', '<div style="font-size:10px;font-weight:700;color:#d97706">⏰ Peak usage times</div>' + wb(16)) +
      card('border-left:3px solid #7c3aed', '<div style="font-size:10px;font-weight:700;color:#7c3aed">📊 Weekly total (est.)</div><div style="display:flex;align-items:center;gap:4px">' + wl(14) + '<span style="font-size:9px;color:#6B7280">hrs</span></div>') +
    '</div>' +
    '<div>' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">What triggers my scrolling?</div><div style="display:flex;flex-wrap:wrap;gap:4px">' + triggers.map(function(tg) { return '<span class="smd-chip" data-smd-chip="' + tg + '">' + tg + '</span>'; }).join('') + '</div>') +
    '</div>'
  ));
}

function buildAppDeepDive(): string {
  var rows = '';
  for (var ri = 0; ri < 6; ri++) {
    rows += '<div class="smd-deep-row" data-smd-deep-row="' + ri + '" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:4px;padding:6px 8px;border-bottom:1px solid #ede4d8;align-items:center;transition:all 0.18s ease">' +
      '<span class="smd-deep-field" data-smd-deep="name" data-smd-idx="' + ri + '" contenteditable="true" style="font-size:9px;font-weight:600;color:#4B5563;min-height:14px;padding:0;line-height:14px;display:inline-block;outline:none;border-bottom:1.5px solid transparent;transition:border-color 0.15s ease"></span>' +
      '<span class="smd-deep-field smd-deep-num" data-smd-deep="hrs" data-smd-idx="' + ri + '" contenteditable="true" inputmode="numeric" style="font-size:9px;color:#4B5563;text-align:center;min-height:14px;padding:0 2px;line-height:14px;display:block;outline:none;border-bottom:1.5px solid transparent;transition:border-color 0.15s ease"></span>' +
      '<span class="smd-deep-field" data-smd-deep="purpose" data-smd-idx="' + ri + '" contenteditable="true" style="font-size:9px;color:#4B5563;text-align:center;min-height:14px;padding:0;line-height:14px;display:block;outline:none;border-bottom:1.5px solid transparent;transition:border-color 0.15s ease"></span>' +
      '<div style="display:flex;gap:3px;justify-content:center;align-items:center">' +
        '<span class="smd-deep-status" data-smd-deep-status="keep" data-smd-row="' + ri + '" tabindex="0" role="button" aria-pressed="false" style="padding:2px 5px;font-size:8px;font-weight:600;border-radius:4px;cursor:pointer;user-select:none;transition:all 0.18s ease;border:1.5px solid transparent;color:#9CA3AF;background:transparent">Keep</span>' +
        '<span class="smd-deep-status" data-smd-deep-status="limit" data-smd-row="' + ri + '" tabindex="0" role="button" aria-pressed="false" style="padding:2px 5px;font-size:8px;font-weight:600;border-radius:4px;cursor:pointer;user-select:none;transition:all 0.18s ease;border:1.5px solid transparent;color:#9CA3AF;background:transparent">Limit</span>' +
        '<span class="smd-deep-status" data-smd-deep-status="delete" data-smd-row="' + ri + '" tabindex="0" role="button" aria-pressed="false" style="padding:2px 5px;font-size:8px;font-weight:600;border-radius:4px;cursor:pointer;user-select:none;transition:all 0.18s ease;border:1.5px solid transparent;color:#9CA3AF;background:transparent">Delete</span>' +
        '<span class="smd-deep-copy" data-smd-deep-copy="' + ri + '" role="button" tabindex="0" aria-label="Copy to bottom section" style="font-size:7px;color:#d4c9bc;cursor:pointer;display:none;transition:color 0.15s ease;padding:2px;line-height:1">\u2192</span>' +
      '</div></div>';
  }
  return pageWrap(pageHeader('App Usage Deep Dive', 'Where does your time really go?') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">Not all screen time is equal. Dig into each app role in your life.</div>' +
    '<div style="margin-bottom:12px">' +
      '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:4px;margin-bottom:4px;padding:4px 8px;font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;background:#f5f0ea;border-radius:6px">' +
        '<span>App</span><span style="text-align:center">Hrs/Wk</span><span style="text-align:center">Purpose</span><span style="text-align:center">Keep?</span>' +
      '</div>' +
      rows +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('border-left:3px solid #059669', '<div style="font-size:10px;font-weight:700;color:#059669">\u2705 Apps that add value</div><div class="smd-deep-field" data-smd-deep="value" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;font-size:12px;outline:none;margin-top:4px"></div>') +
      card('border-left:3px solid #dc2626', '<div style="font-size:10px;font-weight:700;color:#dc2626">\uD83D\uDDD1\uFE0F Apps I can delete</div><div class="smd-deep-field" data-smd-deep="delete" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;font-size:12px;outline:none;margin-top:4px"></div>') +
    '</div>' +
    '<div>' +
      card('border-left:3px solid #d97706', '<div style="font-size:10px;font-weight:700;color:#d97706">\uD83D\uDCF1 Apps to keep but limit</div><div class="smd-deep-field" data-smd-deep="limit" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;font-size:12px;outline:none;margin-top:4px"></div><div style="display:flex;align-items:center;gap:6px;margin-top:6px"><span style="font-size:9px;color:#6B7280">New daily limit:</span><span class="smd-deep-field smd-deep-num" data-smd-deep="dailylimit" contenteditable="true" inputmode="numeric" style="font-size:9px;color:#4B5563;min-height:14px;padding:0 2px;line-height:14px;display:inline-block;outline:none;border-bottom:1.5px solid #d4c9bc;width:40px;text-align:center"></span><span style="font-size:9px;color:#6B7280">min / day</span></div>') +
    '</div>'
  ));
}

function buildNotificationAudit(): string {
  const sources = ['Instagram likes', 'TikTok suggestions', 'YouTube comments', 'Twitter mentions', 'Facebook updates', 'Snapchat streaks', 'Reddit replies', 'WhatsApp groups', 'Email newsletters', 'News alerts'];
  return pageWrap(pageHeader('Notification Audit', 'Regain control of your attention') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">Every notification is a tug on your attention. Decide which ones deserve it.</div>' +
    '<div style="margin-bottom:12px">' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:6px">🔔 Notifications I Currently Get</div><div style="display:flex;flex-wrap:wrap;gap:4px">' + sources.map(function(s) { return '<span class="smd-chip" data-smd-chip="' + s + '">' + s + '</span>'; }).join('') + '</div>') +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:6px">My Notification Rules</div>' +
      checkboxRow({ label: 'Turn off all non-essential notifications', labelSize: 9, labelColor: '#4B5563' }) +
      checkboxRow({ label: 'Disable notification badges on home screen', labelSize: 9, labelColor: '#4B5563' }) +
      checkboxRow({ label: 'Set Do Not Disturb schedule (e.g. 10PM - 8AM)', labelSize: 9, labelColor: '#4B5563' }) +
      checkboxRow({ label: 'Unfollow / mute distracting accounts', labelSize: 9, labelColor: '#4B5563' }) +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      card('border-left:3px solid #059669', '<div style="font-size:10px;font-weight:700;color:#059669">🔕 Notifications to turn OFF</div>' + wb(16)) +
      card('border-left:3px solid ' + A, '<div style="font-size:10px;font-weight:700;color:' + A + '">✅ Notifications to keep</div>' + wb(16)) +
    '</div>'
  ));
}

function buildDetoxGoals(): string {
  const boundaries = ['No phone at meals', 'No phone in bedroom', 'No scrolling before bed', 'App limits (30 min/day per app)', 'No phone first hour of day', 'Scheduled check-in times only', 'Gray mode / no color', 'Delete most-used app'];
  return pageWrap(pageHeader('Detox Goals & Boundaries', 'Design your new relationship with tech') + pageBody(
    '<div style="margin-bottom:12px">' +
      card('border-left:3px solid ' + A, '<div style="font-size:10px;font-weight:700;color:' + A + '">🎯 My Detox Goal</div>' + wb(16)) +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('border-left:3px solid #059669', '<div style="font-size:10px;font-weight:700;color:#059669">⬇️ Target daily screen time</div><div style="display:flex;align-items:center;gap:4px;margin-top:2px">' + wl(14) + '<span style="font-size:9px;color:#6B7280">hrs</span></div>') +
      card('border-left:3px solid #d97706', '<div style="font-size:10px;font-weight:700;color:#d97706">📵 Phone-free zones</div>' + wb(14)) +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:6px">📏 Boundaries I will Set</div><div style="display:flex;flex-wrap:wrap;gap:4px">' + boundaries.map(function(b) { return '<span class="smd-chip" data-smd-chip="' + b + '">' + b + '</span>'; }).join('') + '</div>') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('border-left:3px solid #7c3aed', '<div style="font-size:10px;font-weight:700;color:#7c3aed">📅 Phone-free hours each day</div>' + wb(14)) +
      card('border-left:3px solid ' + A, '<div style="font-size:10px;font-weight:700;color:' + A + '">⏱️ Check-in schedule</div><div style="font-size:9px;color:#6B7280;margin-top:2px">Times I allow myself to check:</div>' + wb(14)) +
    '</div>' +
    '<div style="text-align:center;padding:10px;background:#f0f9ff;border-radius:10px;border:1px solid #bae6fd">' +
      '<div style="font-size:9px;font-weight:600;color:' + A + '">Start small. One boundary at a time. Consistency beats intensity.</div>' +
    '</div>'
  ));
}

function buildMorningRitual(): string {
  var defaultRituals = ['Wake up & stretch', 'Drink a glass of water', 'Step outside for fresh air', 'Journal / meditate', 'Move my body', 'Eat breakfast mindfully', 'Read / learn something', 'Plan my day offline'];
  function ritualRow(label: string, idx: number): string {
    var labelText = label || '';
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">' +
      '<span class="pp-cb" style="width:14px;height:14px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:all 0.15s ease"></span>' +
      '<span class="smd-mr-label" data-smd-mr-label="' + idx + '" contenteditable="true" style="font-size:9px;font-weight:600;color:#4B5563;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:14px;padding:0;flex:1;display:inline-block;transition:border-color 0.15s ease">' + labelText + '</span>' +
    '</div>';
  }
  return pageWrap(pageHeader('Phone-Free Morning Ritual', 'Own the first hour') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">How you start your morning sets the tone for the entire day. Do not let an algorithm decide it.</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('text-align:center;padding:10px', '<div style="font-size:9px;color:#6B7280">⏰ Wake-up time</div><div class="smd-mr-field" data-smd-mr="wakeup" contenteditable="true" style="font-size:11px;font-weight:700;color:#4B5563;min-height:14px;padding:0;line-height:14px;outline:none;border-bottom:1.5px solid #d4c9bc;transition:border-color 0.15s ease;margin-top:4px">--:--</div>') +
      card('text-align:center;padding:10px', '<div style="font-size:9px;color:#6B7280">📵 Phone-off until</div><div class="smd-mr-field" data-smd-mr="phoneoff" contenteditable="true" style="font-size:11px;font-weight:700;color:#4B5563;min-height:14px;padding:0;line-height:14px;outline:none;border-bottom:1.5px solid #d4c9bc;transition:border-color 0.15s ease;margin-top:4px">--:--</div>') +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('border-left:3px solid #d97706', '<div style="font-size:10px;font-weight:700;color:#d97706">\uD83C\uDF05 My Ideal Morning (Step by Step)</div>' +
        defaultRituals.map(function(s, i) { return ritualRow(s, i); }).join('') +
        '<div style="margin-top:6px"><span style="font-size:9px;color:#6B7280">My personal addition:</span></div>' + ritualRow('', defaultRituals.length)) +
    '</div>' +
    '<div>' +
      card('border-left:3px solid #059669', '<div style="font-size:10px;font-weight:700;color:#059669">\uD83D\uDCAA What I will gain by not reaching for my phone</div><div class="smd-mr-field" data-smd-mr="gain" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;font-size:12px;outline:none;margin-top:4px"></div>') +
    '</div>'
  ));
}

function buildBedtimeRoutine(): string {
  var defaultWindDown = ['Put phone in another room', 'Dim the lights', 'Tidy up my space', 'Skincare / hygiene routine', 'Read a physical book', 'Stretch / gentle yoga', 'Write in journal', 'Listen to calm music / podcast', 'Drink herbal tea', 'Practice gratitude'];
  function windRow(label: string, idx: number): string {
    var labelText = label || '';
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">' +
      '<span class="pp-cb" style="width:14px;height:14px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:all 0.15s ease"></span>' +
      '<span class="smd-br-label" data-smd-br-label="' + idx + '" contenteditable="true" style="font-size:9px;font-weight:600;color:#4B5563;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:14px;padding:0;flex:1;display:inline-block;transition:border-color 0.15s ease">' + labelText + '</span>' +
    '</div>';
  }
  return pageWrap(pageHeader('Bedtime Wind-Down Routine', 'Screen-free evenings, deeper sleep') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">Blue light before bed disrupts melatonin. Replace scrolling with rituals that signal rest.</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('text-align:center;padding:10px', '<div style="font-size:9px;color:#6B7280">\uD83D\uDECC Target bedtime</div><div class="smd-br-field" data-smd-br="bedtime" contenteditable="true" style="font-size:11px;font-weight:700;color:#4B5563;min-height:14px;padding:0;line-height:14px;outline:none;border-bottom:1.5px solid #d4c9bc;transition:border-color 0.15s ease;margin-top:4px">--:--</div>') +
      card('text-align:center;padding:10px', '<div style="font-size:9px;color:#6B7280">\uD83D\uDCF5 Last screen time</div><div class="smd-br-field" data-smd-br="screentime" contenteditable="true" style="font-size:11px;font-weight:700;color:#4B5563;min-height:14px;padding:0;line-height:14px;outline:none;border-bottom:1.5px solid #d4c9bc;transition:border-color 0.15s ease;margin-top:4px">--:--</div>') +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('border-left:3px solid #7c3aed', '<div style="font-size:10px;font-weight:700;color:#7c3aed">\uD83C\uDF19 My Wind-Down Routine (30-60 min before bed)</div>' +
        defaultWindDown.map(function(s, i) { return windRow(s, i); }).join('') +
        '<div style="margin-top:6px"><span style="font-size:9px;color:#6B7280">My wind-down addition:</span></div>' + windRow('', defaultWindDown.length)) +
    '</div>' +
    '<div>' +
      card('border-left:3px solid ' + A, '<div style="font-size:10px;font-weight:700;color:' + A + '">\uD83D\uDE34 How I expect my sleep to improve</div><div class="smd-br-field" data-smd-br="sleep" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;font-size:12px;outline:none;margin-top:4px"></div>') +
    '</div>'
  ));
}

function buildReplacementActivities(): string {
  var activeItems = ['Go for a walk', 'Run / jog', 'Hike nature trail', 'Bike ride', 'Yoga / stretch', 'Garden', 'Play a sport'];
  var creativeItems = ['Draw / paint', 'Write in journal', 'Play an instrument', 'Cook a new recipe', 'Photography', 'DIY project', 'Learn a new skill'];
  var socialItems = ['Call a friend', 'Write a letter', 'Coffee with someone', 'Volunteer', 'Board games', 'Join a club / class'];
  var quietItems = ['Read a book', 'Meditate', 'Take a bath', 'Listen to podcast', 'Solve puzzles', 'Organize / declutter', 'Nap'];
  function actRow(name: string, cat: string, catColor: string): string {
    return '<div class="smd-ri" data-smd-ri="' + name + '" data-smd-rc="' + cat + '" data-smd-rc-color="' + catColor + '" tabindex="0" role="button" aria-label="' + name + '" style="display:flex;align-items:center;gap:5px;padding:4px 6px;border-radius:6px;cursor:pointer;user-select:none;border:1px solid transparent;transition:transform 0.18s ease,box-shadow 0.18s ease,background 0.15s ease,border-color 0.15s ease">' +
      '<span class="smd-ri-box" style="width:13px;height:13px;border-radius:3px;border:1.5px solid #d4c9bc;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;font-weight:700;line-height:1;transition:all 0.18s ease"></span>' +
      '<span class="smd-ri-label" style="font-size:9px;color:#4B5563;flex:1;transition:color 0.15s ease">' + name + '</span>' +
      '<span class="smd-ri-star" style="font-size:10px;color:#d4c9bc;flex-shrink:0;cursor:pointer;transition:all 0.18s ease;line-height:1">\u2606</span>' +
    '</div>';
  }
  function catCard(borderColor: string, title: string, catKey: string, items: string[]): string {
    return card('border-left:3px solid ' + borderColor, '<div style="font-size:9px;font-weight:700;color:' + borderColor + '">' + title + '</div>' +
      items.map(function(s) { return actRow(s, catKey, borderColor); }).join('') +
      '<div style="margin-top:6px;padding-top:4px;border-top:1px dashed #ede4d8"><span style="font-size:8px;color:#6B7280">My choice:</span> <span class="smd-choice-display" data-smd-choice="' + catKey + '" style="font-size:9px;color:#4B5563;font-weight:600;min-height:14px;display:inline-block"></span></div>' +
      '<div class="smd-smart-suggest" data-smd-suggest="' + catKey + '" style="font-size:8px;color:' + borderColor + ';margin-top:4px;min-height:14px;font-style:italic;display:none"></div>');
  }
  var suggestions: Record<string, string[]> = {
    active: ['\uD83C\uDF33 Outdoor activities seem to recharge you.', '\uD83C\uDF3E Getting outside appears to be your reset.', '\uD83C\uDFC3 Moving your body might be your best replacement.'],
    creative: ['\uD83C\uDFA8 You seem to enjoy creative moments.', '\uD83C\uDFAC Creative activities may be your flow state.', '\uD83D\uDD8C\uFE0F Making things could be your best escape.'],
    social: ['\uD83D\uDC65 Connecting with others seems to energize you.', '\uD83D\uDE4B Social time may lift your spirits.', '\uD83D\uDC6B You appear to thrive on connection.'],
    quiet: ['\uD83D\uDCD6 Quiet moments might be your ideal replacement.', '\uD83E\uDDD8 Solitary time seems to ground you.', '\uD83C\uDF35 Stillness could be your superpower.']
  };
  function suggestHTML(catKey: string): string {
    var msgs = suggestions[catKey] || [];
    return msgs.map(function(m, i) { return '<span class="smd-suggest-msg" data-suggest-idx="' + i + '" style="display:none">' + m + '</span>'; }).join('');
  }
  return pageWrap(pageHeader('Replacement Activities Catalog', 'What to do instead of scrolling') + pageBody(
    '<div id="smd-replace-empty" style="font-size:9px;color:#9CA3AF;margin-bottom:12px;font-style:italic">Choose activities you\u2019d enjoy instead of reaching for your phone.</div>' +
    '<div id="smd-replace-full" style="font-size:9px;color:#059669;margin-bottom:12px;font-weight:600;display:none"><span id="smd-replace-count">0</span> activities selected \u2014 building your replacement menu.</div>' +
    '<div id="smd-replace-celebrate" style="font-size:9px;color:#059669;margin-bottom:12px;font-weight:600;display:none;padding:6px 10px;background:#f0fdf4;border-radius:8px;border:1px solid #a7f3d0">\u2728 Your Offline Toolkit is ready. Every category has a replacement.</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      catCard('#059669', '\uD83C\uDF33 Active / Outside', 'active', activeItems) +
      catCard('#d97706', '\uD83C\uDFA8 Creative / Mindful', 'creative', creativeItems) +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      catCard('#7c3aed', '\uD83D\uDC65 Social / Connection', 'social', socialItems) +
      catCard('#0284c7', '\uD83D\uDCD6 Quiet / Solitary', 'quiet', quietItems) +
    '</div>' +
    '<div>' +
      card('border-left:3px solid #059669', '<div style="font-size:10px;font-weight:700;color:#059669">\uD83C\uDFAF My Top 3 Go-To Replacements' +
        ' <span style="font-size:8px;font-weight:400;color:#9CA3AF">(\u2605 favorites auto-fill here)</span></div>' +
        '<div style="display:flex;gap:6px;margin-top:4px"><span class="smd-top3-slot" data-smd-top3="0" style="flex:1;font-size:9px;color:#9CA3AF;min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block"></span></div>' +
        '<div style="display:flex;gap:6px;margin-top:2px"><span class="smd-top3-slot" data-smd-top3="1" style="flex:1;font-size:9px;color:#9CA3AF;min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block"></span></div>' +
        '<div style="display:flex;gap:6px;margin-top:2px"><span class="smd-top3-slot" data-smd-top3="2" style="flex:1;font-size:9px;color:#9CA3AF;min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;display:inline-block"></span></div>') +
    '</div>'
  ));
}

function buildDailyTracker(): string {
  return pageWrap(pageHeader('Daily Tracker', 'One day at a time') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">Track each day to see patterns and build momentum.</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('text-align:center;padding:10px', '<div style="font-size:9px;color:#6B7280">📱 Screen time today</div><div style="display:flex;align-items:center;gap:4px;justify-content:center;margin-top:2px">' + wl(14) + '<span style="font-size:9px;color:#6B7280">hrs</span></div>') +
      card('text-align:center;padding:10px', '<div style="font-size:9px;color:#6B7280">🔓 Phone unlocks</div><div style="display:flex;align-items:center;gap:4px;justify-content:center;margin-top:2px">' + wl(14) + '<span style="font-size:9px;color:#6B7280">times</span></div>') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('border-left:3px solid #059669', '<div style="font-size:10px;font-weight:700;color:#059669">🧘 Phone-free hours</div><div style="display:flex;align-items:center;gap:4px;margin-top:2px">' + wl(14) + '<span style="font-size:9px;color:#6B7280">hrs</span></div>') +
      card('border-left:3px solid #7c3aed', '<div style="font-size:10px;font-weight:700;color:#7c3aed">😊 Mood today</div>' + wb(14)) +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('border-left:3px solid #d97706', '<div style="font-size:10px;font-weight:700;color:#d97706">📝 What I did with my reclaimed time</div>' + wb(16)) +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('border-left:3px solid #dc2626', '<div style="font-size:10px;font-weight:700;color:#dc2626">⚡ Moments I almost relapsed</div>' + wb(16)) +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">⭐ Best moment offline today</div>' + wb(16)) +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">🎯 Tomorrow goal</div><div style="display:flex;align-items:center;gap:4px">' + wl(14) + '<span style="font-size:9px;color:#6B7280">hrs max</span></div>') +
    '</div>'
  ));
}

function buildCravingsLog(): string {
  const situations = ['Waking up', 'During meals', 'Waiting in line', 'On the toilet', 'Bored at work', 'Before sleep', 'During commute', 'Feeling anxious', 'Eating alone', 'Watching TV'];
  const alternatives = ['Take 5 deep breaths', 'Look around the room', 'Stretch for 30s', 'Write down the urge', 'Drink water', 'Stand up and walk', 'Text a friend', 'Do 10 pushups'];
  return pageWrap(pageHeader('Cravings & Triggers Log', 'Understand your urges') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">Every urge is a signal. Learn what drives it and how to ride it out.</div>' +
    '<div style="margin-bottom:12px">' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">Common triggering situations</div><div style="display:flex;flex-wrap:wrap;gap:4px">' + situations.map(function(s) { return '<span class="smd-chip" data-smd-chip="' + s + '">' + s + '</span>'; }).join('') + '</div>') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('border-left:3px solid #7c3aed', '<div style="font-size:10px;font-weight:700;color:#7c3aed">📍 My biggest trigger today</div>' + wb(16)) +
      card('border-left:3px solid #059669', '<div style="font-size:10px;font-weight:700;color:#059669">✅ What I did instead</div>' + wb(16)) +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:6px">💪 Urge-surfing alternatives</div><div style="display:flex;flex-wrap:wrap;gap:4px">' + alternatives.map(function(a) { return '<span class="smd-chip" data-smd-chip="' + a + '">' + a + '</span>'; }).join('') + '</div>') +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('border-left:3px solid ' + A, '<div style="font-size:10px;font-weight:700;color:' + A + '">📓 Reflections on today cravings</div>' + wb(16)) +
    '</div>' +
    '<div>' +
      card('border-left:3px solid #d97706', '<div style="font-size:10px;font-weight:700;color:#d97706">🔄 Pattern I am noticing</div>' + wb(16)) +
    '</div>'
  ));
}

function buildBlackoutChallenge(): string {
  var prompts = [
    'How do I feel?', 'Any urges today?', 'First small win', 'Energy check',
    'Pattern emerging?', 'Almost there', 'End of week 1 \u2014 reflection', 'Automatic reach?',
    'Unexpected joy', 'Strongest trigger', 'Midweek check', 'Present moment',
    'Something I noticed', 'End of week 2 \u2014 what shifted?', 'Sleep quality',
    'Real conversation', 'Self-discovery', 'Proudest moment', 'Habit I am replacing',
    'Mind feels quieter or louder?', 'End of week 3 \u2014 what changed?',
    'Almost broke but didn\u2019t', 'What to keep forever?', 'Would have missed this',
    'Anxiety check', 'Relationship improved?', 'Rediscovered skill',
    'End of week 4 \u2014 final stretch', 'One day left \u2014 memory', 'Final reflection'
  ];
  var dayRows = '';
  for (var d = 0; d < 30; d++) {
    var dayNum = d + 1;
    var prompt = prompts[d];
    dayRows += '<div class="smd-bc-day" data-smd-bc-day="' + dayNum + '" style="display:' + (dayNum <= 7 ? 'flex' : 'none') + ';align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid #f0ece6">' +
      '<span style="font-size:9px;color:#4B5563;width:80px;flex-shrink:0">Day ' + dayNum + ': ' + prompt + '</span>' +
      '<span class="smd-bc-field" data-smd-bc-field="day-' + dayNum + '" contenteditable="true" style="flex:1;font-size:9px;color:#4B5563;min-height:14px;padding:0;line-height:14px;outline:none;border-bottom:1.5px solid transparent;display:inline-block;transition:border-color 0.15s ease"></span>' +
    '</div>';
  }
  return pageWrap(pageHeader('Social Media Blackout Challenge', 'Go all in') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">A focused period of zero social media. Pick your duration and commit.</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px">' +
      '<span class="smd-bc-dur" data-smd-bc-dur="7" data-smd-bc-active="true" tabindex="0" role="radio" aria-checked="true" style="flex:1;display:flex;flex-direction:column;align-items:center;padding:8px;border-radius:10px;cursor:pointer;user-select:none;background:#0284c7;border:1.5px solid #0284c7;transition:all 0.2s ease"><span style="font-size:14px;font-weight:800;color:white">7</span><span style="font-size:8px;color:rgba(255,255,255,0.85)">Days</span></span>' +
      '<span class="smd-bc-dur" data-smd-bc-dur="14" data-smd-bc-active="false" tabindex="0" role="radio" aria-checked="false" style="flex:1;display:flex;flex-direction:column;align-items:center;padding:8px;border-radius:10px;cursor:pointer;user-select:none;background:white;border:1.5px solid #ede4d8;transition:all 0.2s ease"><span style="font-size:14px;font-weight:800;color:#4B5563">14</span><span style="font-size:8px;color:#6B7280">Days</span></span>' +
      '<span class="smd-bc-dur" data-smd-bc-dur="30" data-smd-bc-active="false" tabindex="0" role="radio" aria-checked="false" style="flex:1;display:flex;flex-direction:column;align-items:center;padding:8px;border-radius:10px;cursor:pointer;user-select:none;background:white;border:1.5px solid #ede4d8;transition:all 0.2s ease"><span style="font-size:14px;font-weight:800;color:#4B5563">30</span><span style="font-size:8px;color:#6B7280">Days</span></span>' +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('border-left:3px solid #dc2626', '<div style="font-size:10px;font-weight:700;color:#dc2626">\uD83D\uDEAB Apps I will completely avoid</div><div class="smd-bc-field" data-smd-bc-field="avoid" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;font-size:12px;outline:none;margin-top:4px"></div>') +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('border-left:3px solid #059669', '<div style="font-size:10px;font-weight:700;color:#059669">\u2705 Apps I allow (with limits)</div><div class="smd-bc-field" data-smd-bc-field="allow" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;font-size:12px;outline:none;margin-top:4px"></div>') +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:6px">\uD83D\uDCC5 Daily Check-in (during challenge)</div>' +
        dayRows) +
    '</div>' +
    '<div style="text-align:center;padding:10px;background:linear-gradient(135deg,#dc262615,#dc262625);border-radius:10px">' +
      '<div style="font-size:9px;font-weight:700;color:#dc2626">\uD83D\uDD25 The first 3 days are the hardest. After that, it gets easier.</div>' +
    '</div>'
  ));
}

function buildFocusZonePlanner(): string {
  var scheduleDefaults = ['Morning block', 'Afternoon block', 'Evening block'];
  var ritualDefaults = ['Put phone in another room', 'Close all browser tabs', 'Set a timer', 'Take 3 deep breaths', 'Clarify one goal for this block'];
  function schedRow(label: string, idx: number): string {
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">' +
      '<span class="pp-cb" style="width:14px;height:14px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:all 0.15s ease"></span>' +
      '<span class="smd-fz-sched" data-smd-fz-sched="' + idx + '" contenteditable="true" style="font-size:9px;font-weight:600;color:#4B5563;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:14px;padding:0;flex:1;display:inline-block;transition:border-color 0.15s ease">' + label + '</span>' +
      '<span class="smd-fz-schedtime" data-smd-fz-schedtime="' + idx + '" contenteditable="true" style="font-size:8px;color:#9CA3AF;min-height:14px;padding:0 2px;line-height:14px;outline:none;border-bottom:1.5px solid transparent;width:40px;text-align:center;display:inline-block;transition:border-color 0.15s ease">--:--</span>' +
    '</div>';
  }
  function ritualRow(label: string, idx: number): string {
    return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid #f0ece6">' +
      '<span class="pp-cb" style="width:12px;height:12px;border-radius:2px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:all 0.15s ease"></span>' +
      '<span class="smd-fz-ritual" data-smd-fz-ritual="' + idx + '" contenteditable="true" style="font-size:9px;color:#4B5563;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:14px;padding:0;flex:1;display:inline-block;transition:border-color 0.15s ease">' + label + '</span>' +
    '</div>';
  }
  return pageWrap(pageHeader('Focus Zone Planner', 'Deep work without distraction') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">Schedule blocks of distraction-free time. Your most important work happens here.</div>' +
    '<div style="margin-bottom:12px">' +
      card('border-left:3px solid ' + A, '<div style="font-size:10px;font-weight:700;color:' + A + '">\uD83C\uDFAF My Deep Work Focus Areas</div><div class="smd-fz-field" data-smd-fz="areas" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;font-size:12px;outline:none;margin-top:4px"></div>') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      card('text-align:center;padding:10px', '<div style="font-size:9px;color:#6B7280">\u23F1\uFE0F Ideal focus block length</div><div style="display:flex;align-items:center;gap:4px;justify-content:center;margin-top:2px"><span class="smd-fz-field" data-smd-fz="blocklen" contenteditable="true" style="font-size:9px;color:#4B5563;min-height:14px;padding:0 2px;line-height:14px;outline:none;border-bottom:1.5px solid #d4c9bc;width:36px;text-align:center;display:inline-block"></span><span style="font-size:9px;color:#6B7280">min</span></div>') +
      card('text-align:center;padding:10px', '<div style="font-size:9px;color:#6B7280">\uD83D\uDD22 Focus blocks per day</div><span class="smd-fz-field" data-smd-fz="blocks" contenteditable="true" style="font-size:9px;color:#4B5563;min-height:14px;padding:0 2px;line-height:14px;outline:none;border-bottom:1.5px solid #d4c9bc;width:30px;text-align:center;display:inline-block;margin-top:2px"></span>') +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('border-left:3px solid #d97706', '<div style="font-size:10px;font-weight:700;color:#d97706">\uD83D\uDD50 My Focus Schedule</div>' +
        scheduleDefaults.map(function(s, i) { return schedRow(s, i); }).join('') +
        '<div style="margin-top:4px;padding-top:4px;border-top:1px solid #f0ece6"><span style="font-size:9px;color:#6B7280">My best focus time:</span> <span class="smd-fz-field" data-smd-fz="besttime" contenteditable="true" style="font-size:9px;color:#4B5563;min-height:14px;padding:0 2px;line-height:14px;outline:none;border-bottom:1.5px solid #d4c9bc;display:inline-block;width:60px;text-align:center"></span></div>') +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:6px">\uD83D\uDCF5 Pre-focus ritual (5 min before each block)</div>' +
        ritualDefaults.map(function(s, i) { return ritualRow(s, i); }).join('')) +
    '</div>' +
    '<div>' +
      card('border-left:3px solid #059669', '<div style="font-size:10px;font-weight:700;color:#059669">\uD83D\uDCCA After-block review: How focused was I?</div><div class="smd-fz-field" data-smd-fz="review" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid #d4c9bc;padding:0;line-height:16px;font-size:12px;outline:none;margin-top:4px"></div>') +
    '</div>'
  ));
}

function wrField(key: string): string {
  return '<div class="smd-wr-field" data-smd-wr="' + key + '" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid transparent;padding:0;line-height:16px;font-size:12px;outline:none"></div>';
}

function buildWeeklyReview(): string {
  return pageWrap(pageHeader('Weekly Review', 'Celebrate every win') + pageBody(
    '<div style="display:flex;gap:10px;margin-bottom:14px">' +
      card('flex:1;text-align:center', '<div style="font-size:7px;color:#6B7280">Days Completed</div>' +
        '<div class="smd-wr-stat" data-smd-wr-stat="days" style="font-size:14px;font-weight:800;color:#059669;min-height:20px;line-height:20px">—</div>') +
      card('flex:1;text-align:center', '<div style="font-size:7px;color:#6B7280">Avg Screen Time</div>' +
        '<div class="smd-wr-stat" data-smd-wr-stat="screentime" style="font-size:14px;font-weight:800;color:' + A + ';min-height:20px;line-height:20px">—</div>') +
      card('flex:1;text-align:center', '<div style="font-size:7px;color:#6B7280">Phone-Free Hrs/Day</div>' +
        '<div class="smd-wr-stat" data-smd-wr-stat="phonefree" style="font-size:14px;font-weight:800;color:#7c3aed;min-height:20px;line-height:20px">—</div>') +
    '</div>' +
    '<div style="margin-bottom:14px">' +
      '<div style="font-size:9px;font-weight:600;color:#4B5563;margin-bottom:6px">📉 Screen Time Trend</div>' +
      '<div class="smd-wr-trend" data-smd-wr-trend>' +
        '<div class="smd-wr-trend-empty" data-smd-wr-trend-empty style="text-align:center;padding:10px;background:#faf7f2;border-radius:8px;font-size:9px;color:#9CA3AF;font-style:italic">Complete your daily entries to see your weekly trend.</div>' +
        '<div class="smd-wr-trend-bars" data-smd-wr-trend-bars style="display:none;margin-top:4px">' +
          '<div style="display:flex;align-items:flex-end;gap:3px;height:40px;padding:4px 4px 0;background:#faf7f2;border-radius:6px;">' +
            '<div class="smd-wr-trend-bar" data-smd-wr-bar="0" style="flex:1;height:0;background:' + A + '80;cursor:pointer" title="Mon"></div>' +
            '<div class="smd-wr-trend-bar" data-smd-wr-bar="1" style="flex:1;height:0;background:' + A + '80;cursor:pointer" title="Tue"></div>' +
            '<div class="smd-wr-trend-bar" data-smd-wr-bar="2" style="flex:1;height:0;background:' + A + '80;cursor:pointer" title="Wed"></div>' +
            '<div class="smd-wr-trend-bar" data-smd-wr-bar="3" style="flex:1;height:0;background:' + A + '80;cursor:pointer" title="Thu"></div>' +
            '<div class="smd-wr-trend-bar" data-smd-wr-bar="4" style="flex:1;height:0;background:' + A + '80;cursor:pointer" title="Fri"></div>' +
            '<div class="smd-wr-trend-bar" data-smd-wr-bar="5" style="flex:1;height:0;background:' + A + '80;cursor:pointer" title="Sat"></div>' +
            '<div class="smd-wr-trend-bar" data-smd-wr-bar="6" style="flex:1;height:0;background:' + A + '80;cursor:pointer" title="Sun"></div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;font-size:7px;color:#9CA3AF;margin-top:2px;padding:0 4px">' +
            '<span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' +
      card('background:#f0fdf4', '<div style="font-size:9px;font-weight:700;color:#059669">✅ Benefits I Noticed</div>' + wrField('benefits-0') + wrField('benefits-1') + wrField('benefits-2')) +
      card('background:#fef2f2', '<div style="font-size:9px;font-weight:700;color:#dc2626">❌ Challenges I Faced</div>' + wrField('challenges-0') + wrField('challenges-1') + wrField('challenges-2')) +
    '</div>' +
    '<div style="margin-bottom:14px">' +
      card('border-left:3px solid ' + A, '<div style="font-size:9px;font-weight:700;color:' + A + '">💡 What I Learned About Myself</div>' + wrField('learned-0') + wrField('learned-1')) +
    '</div>' +
    '<div>' +
      card('border-left:3px solid #d97706', '<div style="font-size:9px;font-weight:700;color:#d97706">🎯 Next Week Focus</div>' +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px">What I will keep doing:</div>' + wrField('keepdoing-0') +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px;margin-top:4px">What I will improve:</div>' + wrField('improve-0')) +
    '</div>' +
    '<div style="margin-top:14px;text-align:center;padding:10px;background:linear-gradient(135deg,' + A + '15,' + A + '25);border-radius:10px">' +
      '<div style="font-size:9px;font-weight:700;color:' + A + '">🌱 Every minute offline is a minute reclaimed for your real life.</div>' +
      '<div class="smd-wr-celebrate" data-smd-wr-celebrate style="display:none;font-size:9px;font-weight:600;color:#059669;margin-top:6px;transition:opacity 0.4s ease"></div>' +
    '</div>'
  ));
}

function rewardField(day: string): string {
  return '<span class="smd-rm-field" data-smd-rm-milestone="' + day + '" contenteditable="true" style="font-size:9px;color:#4B5563;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:14px;padding:0 2px;flex:1;display:inline-block;transition:border-color 0.15s ease"></span>';
}

function buildRewardsMilestones(): string {
  var challengeLabels = ['Completed 7-day blackout', 'Reduced screen time by 50%', 'Read a book instead of scrolling', 'Went 24 hours without phone', 'Developed a morning routine without phone'];
  var challengeRows = challengeLabels.map(function(label, i) {
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #d4c9bc">' +
      '<span class="pp-cb" style="width:14px;height:14px;border-radius:3px;border:1.5px solid #d4c9bc;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"></span>' +
      '<span class="smd-rm-label" data-smd-rm-challenge="' + i + '" contenteditable="true" style="font-size:9px;font-weight:600;color:#4B5563;outline:none;border-bottom:1.5px solid transparent;min-height:14px;line-height:14px;padding:0;flex:1;display:inline-block;transition:border-color 0.15s ease">' + label + '</span>' +
    '</div>';
  }).join('');
  return pageWrap(pageHeader('Rewards & Milestones', 'Celebrate your progress') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">Every step forward deserves recognition. Plan how you will reward yourself.</div>' +
    '<div style="display:flex;gap:10px;margin-bottom:14px">' +
      card('flex:1;text-align:center;background:#f0fdf4', '<div style="font-size:9px;color:#059669">📅 Days Phone-Free</div>' +
        '<div class="smd-rm-stat" data-smd-rm-stat="days" style="font-size:20px;font-weight:900;color:#059669;min-height:24px;line-height:24px">—</div>') +
      card('flex:1;text-align:center;background:#f0f9ff', '<div style="font-size:9px;color:' + A + '">⭐ Current Streak</div>' +
        '<div class="smd-rm-stat" data-smd-rm-stat="streak" style="font-size:20px;font-weight:900;color:' + A + ';min-height:24px;line-height:24px">—</div>') +
    '</div>' +
    '<div style="margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:6px">🏆 Milestone Rewards</div>' +
      card('border-left:3px solid #d97706', '<div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span style="font-size:9px;font-weight:700;color:#d97706;width:80px;flex-shrink:0">Day 7:</span>' + rewardField('7') + '</div><div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span style="font-size:9px;font-weight:700;color:#d97706;width:80px;flex-shrink:0">Day 14:</span>' + rewardField('14') + '</div><div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span style="font-size:9px;font-weight:700;color:#d97706;width:80px;flex-shrink:0">Day 21:</span>' + rewardField('21') + '</div><div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span style="font-size:9px;font-weight:700;color:#d97706;width:80px;flex-shrink:0">Day 30:</span>' + rewardField('30') + '</div>') +
    '</div>' +
    '<div style="margin-bottom:14px">' +
      card('border-left:3px solid #059669', '<div style="font-size:10px;font-weight:700;color:#059669">✅ Completed Challenges</div>' + challengeRows) +
    '</div>' +
    '<div style="text-align:center;padding:10px;background:linear-gradient(135deg,#05966915,#05966925);border-radius:10px">' +
      '<div style="font-size:9px;font-weight:700;color:#059669">🎉 You deserve to celebrate. Progress not perfection.</div>' +
      '<div class="smd-rm-celebrate" data-smd-rm-celebrate style="display:none;font-size:9px;font-weight:600;color:#059669;margin-top:6px;transition:opacity 0.4s ease"></div>' +
    '</div>'
  ));
}

function mr2Field(key: string): string {
  return '<span class="smd-mr2-field" data-smd-mr2="' + key + '" contenteditable="true" style="font-size:10px;color:#4B5563;min-height:14px;padding:0;line-height:14px;outline:none;border-bottom:1.5px solid transparent;display:inline-block;width:100%;transition:border-color 0.15s ease"></span>';
}

function mr2Block(keyPrefix: string, idx: number): string {
  return '<div class="smd-mr2-block" data-smd-mr2="' + keyPrefix + '-' + idx + '" contenteditable="true" style="min-height:16px;border-bottom:1.5px solid transparent;padding:0;line-height:16px;font-size:12px;outline:none;transition:border-color 0.15s ease"></div>';
}

function buildMonthlyReview(): string {
  return pageWrap(pageHeader('Monthly Digital Wellness Review', 'Look back, leap forward') + pageBody(
    '<div style="font-size:9px;color:#6B7280;margin-bottom:12px">A deeper reflection on how your relationship with technology has changed.</div>' +
    '<div class="smd-mr2-insight" data-smd-mr2-insight style="display:none;padding:10px 12px;background:linear-gradient(135deg,#05966910,#0284c710);border-radius:10px;border:1px solid #05966925;margin-bottom:14px;font-size:10px;font-weight:600;color:#4B5563;line-height:1.5"></div>' +
    '<div style="display:flex;gap:10px;margin-bottom:14px">' +
      card('flex:1;text-align:center', '<div style="font-size:7px;color:#6B7280">🏅 Days Detoxed</div>' +
        '<div class="smd-mr2-stat" data-smd-mr2-stat="days" style="font-size:14px;font-weight:800;color:#059669;min-height:18px;line-height:18px">—</div>') +
      card('flex:1;text-align:center', '<div style="font-size:7px;color:#6B7280">📉 Start vs End Screen Time</div><div style="font-size:14px;font-weight:800;color:' + A + '">' +
        '<span class="smd-mr2-stat" data-smd-mr2-stat="start" style="min-height:18px;line-height:18px">—</span>→<span class="smd-mr2-stat" data-smd-mr2-stat="end" style="min-height:18px;line-height:18px">—</span></div>') +
      card('flex:1;text-align:center', '<div style="font-size:7px;color:#6B7280">💰 Hours Reclaimed</div>' +
        '<div class="smd-mr2-stat" data-smd-mr2-stat="reclaimed" style="font-size:14px;font-weight:800;color:#7c3aed;min-height:18px;line-height:18px">—</div>') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' +
      card('border-left:3px solid #059669', '<div style="font-size:9px;font-weight:700;color:#059669">🌅 What Got Better</div>' +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px">Sleep quality:</div>' + mr2Field('sleep') +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px;margin-top:4px">Productivity:</div>' + mr2Field('productivity') +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px;margin-top:4px">Mood / anxiety:</div>' + mr2Field('mood') +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px;margin-top:4px">Relationships:</div>' + mr2Field('relationships')) +
      card('border-left:3px solid #d97706', '<div style="font-size:9px;font-weight:700;color:#d97706">📊 Month-over-Month Change</div>' +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px">Screen time change:</div>' + mr2Field('screenchange') +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px;margin-top:4px">Apps deleted / kept:</div>' + mr2Field('apps') +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px;margin-top:4px">Money saved (less impulse buys):</div>' + mr2Field('money')) +
    '</div>' +
    '<div style="margin-bottom:14px">' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">📝 Biggest Surprise This Month</div>' + mr2Block('surprise', 0) + mr2Block('surprise', 1)) +
    '</div>' +
    '<div style="margin-bottom:14px">' +
      card('', '<div style="font-size:10px;font-weight:600;color:#4B5563;margin-bottom:4px">🔮 My Relationship with Technology Now</div>' + mr2Block('tech', 0) + mr2Block('tech', 1)) +
    '</div>' +
    '<div>' +
      card('border-left:3px solid #7c3aed', '<div style="font-size:9px;font-weight:700;color:#7c3aed">🎯 Next Month Intention</div>' +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px">What I want to carry forward:</div>' + mr2Block('intent', 0) +
        '<div style="font-size:8px;color:#6B7280;margin-bottom:2px;margin-top:4px">What I want to try next:</div>' + mr2Block('intent', 1)) +
    '</div>' +
    '<div style="margin-top:14px;text-align:center;padding:14px;background:linear-gradient(135deg,' + A + '15,#7c3aed25);border-radius:12px">' +
      '<div style="font-size:10px;font-weight:800;color:#1F2937;font-family:\'Playfair Display\',Outfit,serif">"The first step is awareness. The second is intention. The rest is freedom."</div>' +
      '<div class="smd-mr2-celebrate" data-smd-mr2-celebrate style="display:none;font-size:9px;font-weight:600;color:#059669;margin-top:8px;transition:opacity 0.4s ease"></div>' +
    '</div>'
  ));
}

// ──────────────────────────────────────────────
// EXPORTED CLASS
// ──────────────────────────────────────────────

export interface PageEntry { id: string; title: string; html: string }

export class SocialMediaDetoxPreview {
  private values: Record<string, string>;
  private theme: typeof THEME[string];
  private title: string;
  private icon: string;

  constructor(values: Record<string, string>, theme: typeof THEME[string], title?: string, icon?: string) {
    this.values = values;
    this.theme = theme;
    this.title = title || 'Social Media Detox';
    this.icon = icon || '📵';
  }

  getPageList(): PageEntry[] {
    const t = this.theme;
    return [
      { id: 'cover', title: 'Cover Page', html: buildCoverPage(t, this.title, this.icon, this.values) },
      { id: 'digital-audit', title: 'Digital Audit', html: buildDigitalAudit() },
      { id: 'app-deep-dive', title: 'App Usage Deep Dive', html: buildAppDeepDive() },
      { id: 'notification-audit', title: 'Notification Audit', html: buildNotificationAudit() },
      { id: 'detox-goals', title: 'Detox Goals & Boundaries', html: buildDetoxGoals() },
      { id: 'morning-ritual', title: 'Phone-Free Morning Ritual', html: buildMorningRitual() },
      { id: 'bedtime-routine', title: 'Bedtime Wind-Down Routine', html: buildBedtimeRoutine() },
      { id: 'replacement-activities', title: 'Replacement Activities', html: buildReplacementActivities() },
      { id: 'daily-tracker', title: 'Daily Tracker', html: buildDailyTracker() },
      { id: 'cravings-log', title: 'Cravings & Triggers', html: buildCravingsLog() },
      { id: 'blackout-challenge', title: 'Blackout Challenge', html: buildBlackoutChallenge() },
      { id: 'focus-zone-planner', title: 'Focus Zone Planner', html: buildFocusZonePlanner() },
      { id: 'weekly-review', title: 'Weekly Review', html: buildWeeklyReview() },
      { id: 'rewards-milestones', title: 'Rewards & Milestones', html: buildRewardsMilestones() },
      { id: 'monthly-review', title: 'Monthly Wellness Review', html: buildMonthlyReview() },
    ];
  }

  getPageCount(): number { return this.getPageList().length; }
}
