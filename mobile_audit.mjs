import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const viewports = [
  { name: '320-small', width: 320, height: 568 },
  { name: '375-phone', width: 375, height: 812 },
  { name: '390-phone', width: 390, height: 844 },
  { name: '414-phone', width: 414, height: 896 },
  { name: '768-tablet', width: 768, height: 1024 },
  { name: '1024-desktop', width: 1024, height: 768 },
  { name: '1366-desktop', width: 1366, height: 768 },
  { name: '1440-desktop', width: 1440, height: 900 },
];

const BASE = 'file:///C:/wordcounter.com/dist/pomodoro-timer/index.html';
const report = [];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);

  const viewportInfo = { vw: vp.width, vh: vp.height };
  const info = await page.evaluate((viewportInfo) => {
    const { vw, vh } = viewportInfo;
    const d = document.documentElement;
    const body = document.body;
    const scrollW = Math.max(d.scrollWidth, body.scrollWidth, d.offsetWidth);
    const scrollH = Math.max(d.scrollHeight, body.scrollHeight, d.offsetHeight);

    // Timer
    const ring = document.getElementById('timer-ring-container');
    const timerCard = ring?.closest('[class*="rounded-2xl"]');
    const timerRect = timerCard?.getBoundingClientRect();

    // All major section cards
    const sections = [];
    document.querySelectorAll('[class*="rounded-"]').forEach(el => {
      const r = el.getBoundingClientRect();
      const text = (el.textContent || '').trim().slice(0, 60);
      const tag = el.tagName.toLowerCase();
      const cl = Array.from(el.classList).join(' ');
      if (r.width > 40 && r.height > 20 && !el.closest('.hidden') && !el.closest('svg')) {
        sections.push({
          tag, text, w: Math.round(r.width), h: Math.round(r.height),
          top: Math.round(r.top), classes: cl.slice(0, 80),
          below: r.top > vh + 5,
          clipped: r.right > vw + 3,
        });
      }
    });

    // Overflow
    const overflow = [];
    document.querySelectorAll('body *:not(svg):not(path):not(.hidden)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > vw + 5 && r.left >= -2 && r.width < vw * 3) {
        overflow.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || '').trim().slice(0, 40),
          w: Math.round(r.width), vw,
        });
      }
    });

    // Touch targets (< 44px)
    const smallTargets = [];
    document.querySelectorAll('button, a, input, select, label, [role="button"], [role="tab"]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && !el.closest('.hidden') && (r.width < 44 || r.height < 44)) {
        smallTargets.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          text: (el.textContent || '').trim().slice(0, 25),
          w: Math.round(r.width), h: Math.round(r.height),
          type: el.getAttribute('type') || '',
        });
      }
    });

    // Typography: check heading sizes
    const headings = [];
    document.querySelectorAll('h1, h2, h3, h4').forEach(el => {
      const cs = window.getComputedStyle(el);
      headings.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 30),
        fs: cs.fontSize,
        id: el.id,
      });
    });

    return {
      scrollW, scrollH,
      timerCard: timerRect ? {
        h: Math.round(timerRect.height),
        top: Math.round(timerRect.top),
        bottom: Math.round(timerRect.bottom),
        below: timerRect.top > vh + 5,
      } : null,
      ringSize: ring ? Math.round(ring.getBoundingClientRect().width) : null,
      totalCards: sections.length,
      belowFoldCards: sections.filter(s => s.below).length,
      clippedCards: sections.filter(s => s.clipped).length,
      overflowCount: overflow.length,
      overflow,
      smallTargets: smallTargets.slice(0, 20),
      smallTargetCount: smallTargets.length,
      headings,
    };
  }, viewportInfo);

  report.push({ viewport: vp, ...info });

  await page.screenshot({
    path: `C:/Users/rajbh/AppData/Local/Temp/opencode/pomodoro_${vp.name}.png`,
    fullPage: true,
  });
  await page.close();
}

await browser.close();

// Print report
for (const r of report) {
  const vp = r.viewport;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📱 ${vp.name} (${vp.width}x${vp.height})`);
  console.log(`   Scroll: ${r.scrollW}x${r.scrollH}`);
  console.log(`   Timer card: ${r.timerCard?.h}px (top=${r.timerCard?.top}, below=${r.timerCard?.below})`);
  console.log(`   Ring width: ${r.ringSize}px`);
  console.log(`   Sections: ${r.totalCards} total, ${r.belowFoldCards} below fold`);
  console.log(`   Overflow items: ${r.overflowCount}`);
  console.log(`   Small touch targets (<44px): ${r.smallTargetCount}`);
  if (r.overflowCount > 0) {
    console.log(`   ⚠️  OVERFLOW:`);
    r.overflow.slice(0, 8).forEach(o => console.log(`       <${o.tag}> "${o.text}" w=${o.w} > vw=${o.vw}`));
  }
  if (r.smallTargetCount > 0) {
    console.log(`   ⚠️  SMALL TARGETS:`);
    r.smallTargets.slice(0, 8).forEach(s => console.log(`       <${s.tag}#${s.id}> "${s.text}" ${s.w}x${s.h}`));
  }
  if (r.clippedCards > 0) {
    console.log(`   ⚠️  CLIPPED CARDS: ${r.clippedCards}`);
  }

  // Timings
  if (r.timerCard) {
    const timerH = r.timerCard.h;
    const vh = vp.height;
    const pct = Math.round(timerH / vh * 100);
    console.log(`   🕐 Timer takes ${pct}% of viewport height`);
  }
}

// Summary
console.log(`\n${'='.repeat(60)}`);
console.log('📊 SUMMARY');
const critical = [];
const medium = [];
const minor = [];

for (const r of report) {
  if (r.overflowCount > 0) critical.push(`${r.viewport.name}: ${r.overflowCount} overflow items`);
  if (r.clippedCards > 0) critical.push(`${r.viewport.name}: ${r.clippedCards} clipped cards`);
  if (r.smallTargetCount > 5) medium.push(`${r.viewport.name}: ${r.smallTargetCount} small touch targets`);
  if (r.timerCard?.below) medium.push(`${r.viewport.name}: timer card below fold`);
  if (r.belowFoldCards > r.totalCards * 0.6) medium.push(`${r.viewport.name}: ${r.belowFoldCards}/${r.totalCards} cards below fold`);
}

if (critical.length) console.log('\n🔴 CRITICAL ISSUES:\n' + critical.map(c => `  - ${c}`).join('\n'));
if (medium.length) console.log('\n🟡 MEDIUM ISSUES:\n' + medium.map(m => `  - ${m}`).join('\n'));
if (!critical.length && !medium.length) console.log('\n✅ No critical or medium issues found');

console.log(`\nFull page screenshots saved to C:/Users/rajbh/AppData/Local/Temp/opencode/pomodoro_*.png`);
