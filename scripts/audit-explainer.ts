// PRODUCT/UX AUDIT of the new explanation layer in resume-checker.ts
//
// Mirrors the exact UI presentation logic (findMissingTerm, levelWhy,
// projectScoreDelta, critical-gap filter, Top-3 builder, "Why this score?"
// summary) and runs it against the REAL scoring engine on the 10 case
// categories from the audit request + a few edge cases.
//
// It does NOT modify the engine or scoring model. It reports observations so
// clear UI/data-presentation bugs can be fixed and questionable behavior can
// be documented.
//
// Run: node --experimental-strip-types scripts/audit-explainer.ts
import { calculateOverallScore } from '../src/scripts/scoring-engine.ts';

// -----------------------------------------------------------------------------
// Case builders (mirror eval-resume.ts so inputs are byte-identical)
// -----------------------------------------------------------------------------
function resume(
  summary: string,
  roles: [title: string, ...bullets: string[]][],
  skills: string,
  education = 'B.S. in Computer Science, 2018',
): string {
  const out = ['Summary', summary, 'Experience'];
  for (const [title, ...bullets] of roles) {
    out.push(title);
    for (const b of bullets) out.push(`- ${b}`);
  }
  out.push('Skills', skills);
  out.push('Education', education);
  return out.join('\n');
}

function jd(title: string, required: string[], preferred: string[] = [], about = ''): string {
  const parts = [title];
  if (about) parts.push(about);
  parts.push('Requirements:');
  required.forEach(r => parts.push(`- ${r}`));
  if (preferred.length) {
    parts.push('Preferred:');
    preferred.forEach(r => parts.push(`- ${r}`));
  }
  return parts.join('\n');
}

const SWE_JD = jd(
  'Senior Backend Engineer',
  [
    '5+ years of professional experience building distributed systems',
    'Strong proficiency in Go or Python',
    'Experience with microservices architecture',
    'Hands-on PostgreSQL and SQL',
    'Production experience with Kubernetes and Docker',
    'B.S. in Computer Science or related field',
  ],
  ['Experience with Apache Kafka', 'AWS certification', 'Observability tooling (Prometheus, Grafana)'],
  'About us: Acme builds infrastructure software for large enterprises.',
);

const FIN_JD = jd(
  'Senior Financial Analyst',
  [
    'CPA required',
    '5+ years of experience in corporate finance',
    'Strong financial modeling and forecasting',
    'Experience with budgeting and FP&A',
    'B.S. in Finance or Accounting',
  ],
  ['Experience with Tableau', 'Knowledge of tax and audit processes'],
);

const kJD = jd('Senior Frontend Engineer', [
  '5+ years with React and TypeScript',
  'Experience with Next.js and modern testing',
  'Deployment experience with Docker and GitHub Actions',
]);

const sJD = jd('Senior React Engineer', [
  '5+ years of recent experience with React',
  'Current React 18 knowledge',
  'TypeScript experience',
]);

const gJD = jd('Staff Engineer', [
  '5+ years building scalable cloud-native services',
  'Experience with event-driven architectures',
  'Deep container orchestration experience',
]);

const cJD = jd('Compliance Officer', [
  'FINRA Series 7 license required',
  'Knowledge of regulatory compliance',
  'Experience with risk management',
  'Strong attention to detail',
]);

const HC_JD = jd(
  'Registered Nurse - ICU',
  [
    'Current RN license required',
    'B.S. in Nursing (BSN) preferred',
    '2+ years of ICU or critical care nursing',
    'Experience with electronic health records (Epic)',
    'Current ACLS and BLS certifications',
  ],
  ['Experience with telemetry', 'Charge nurse experience'],
);

interface AuditCase { id: string; label: string; jd: string; resume: string }

const CASES: AuditCase[] = [
  {
    id: 'C1', label: 'SWE Excellent (should be >=85)',
    jd: SWE_JD,
    resume: resume(
      'Senior Backend Engineer with 7 years building distributed systems at scale.',
      [['Senior Backend Engineer at Acme (2020 - Present)',
        'Designed and shipped a microservices platform in Go processing 5M requests/day.',
        'Operated 40+ Kubernetes clusters across AWS, cutting infra cost by 30%.',
        'Owned PostgreSQL schema and query optimization for core services.',
        'Built CI/CD pipelines with Docker, improving deploy frequency 3x.',
        'Instrumented services with Prometheus and Grafana dashboards.']],
      'Go, Python, PostgreSQL, Kubernetes, Docker, AWS, Kafka, Prometheus, Grafana, CI/CD',
    ),
  },
  {
    id: 'C2', label: 'SWE Strong (70-90)',
    jd: SWE_JD,
    resume: resume(
      'Backend Engineer with 6 years of experience in Python and cloud services.',
      [['Backend Engineer at Beta (2019 - Present)',
        'Built REST APIs in Python used by 1M users.',
        'Migrated services to Kubernetes on AWS.',
        'Managed PostgreSQL databases and wrote complex SQL.',
        'Containerized legacy services with Docker.']],
      'Python, PostgreSQL, Kubernetes, Docker, AWS, REST APIs',
    ),
  },
  {
    id: 'C3', label: 'SWE Moderate (45-70)',
    jd: SWE_JD,
    resume: resume(
      'Full stack developer with 4 years focusing on web applications.',
      [['Full Stack Developer at Gamma (2021 - Present)',
        'Built React and Node.js features for a marketplace.',
        'Used MySQL for simple CRUD operations.',
        'Deployed small apps with Docker on a single server.']],
      'JavaScript, React, Node.js, MySQL, Docker',
    ),
  },
  {
    id: 'C4', label: 'SWE Weak (20-55)',
    jd: SWE_JD,
    resume: resume(
      'Junior developer learning full stack development.',
      [['Junior Developer at Delta (2023 - Present)',
        'Fixed frontend bugs in a React admin panel.',
        'Wrote simple HTML email templates.']],
      'HTML, CSS, React (basics), SQL (basics)',
      'High School Diploma, 2022',
    ),
  },
  {
    id: 'C5', label: 'SWE Unrelated (<=30)',
    jd: SWE_JD,
    resume: resume(
      'Registered nurse specializing in surgical care.',
      [['Staff Nurse at City Hospital (2018 - Present)',
        'Managed patient care for a 20-bed surgical unit.',
        'Administered medications and monitored vitals.']],
      'Patient care, IV therapy, wound care',
      'B.S. in Nursing, 2017',
    ),
  },
  {
    id: 'C6', label: 'FIN Adversarial - no CPA (<=75)',
    jd: FIN_JD,
    resume: resume(
      'Finance professional with broad corporate finance exposure.',
      [['Finance Manager at DiversifiedCo (2018 - Present)',
        'Prepared financial modeling and forecasting for leadership.',
        'Ran budgeting and FP&A processes.',
        'Supported tax and audit workstreams.',
        'Used Tableau for reporting.',
        'Analyzed corporate finance scenarios.']],
      'Financial modeling, forecasting, budgeting, FP&A, Tableau, tax, audit, corporate finance, Excel',
    ),
  },
  {
    id: 'C7', label: 'Adversarial A - keyword-stuffed (<=60)',
    jd: kJD,
    resume: `Summary\nFrontend engineer.\nExperience\nSoftware Engineer at GenericCo (2022 - Present)\n- Wrote documentation and fixed minor CSS bugs.\nSkills\nReact, TypeScript, Next.js, Jest, Docker, GitHub Actions, Kubernetes, AWS, PostgreSQL, Node.js, GraphQL`,
  },
  {
    id: 'C8', label: 'Adversarial B - stale React (<=70)',
    jd: sJD,
    resume: resume(
      'Senior engineer with 12 years total experience.',
      [['Web Developer at OldCo (2010 - 2017)', 'Built React apps in a legacy codebase.'],
       ['Engineering Manager at DeployCo (2018 - Present)', 'Managed teams and review code, no hands-on React.', 'Worked on general JavaScript tooling.']],
      'React, TypeScript, JavaScript, Leadership',
    ),
  },
  {
    id: 'C9', label: 'Adversarial G - semantic cloud-native (>=70)',
    jd: gJD,
    resume: resume(
      'Backend engineer with 6 years in distributed systems.',
      [['Senior Backend Engineer at CloudCo (2019 - Present)',
        'Built large-scale backend services on Kubernetes.',
        'Designed event-driven systems with Kafka.',
        'Scaled microservices to millions of requests.']],
      'Go, Kubernetes, Kafka, microservices, cloud, distributed systems',
    ),
  },
  {
    id: 'C10', label: 'Adversarial H - FINRA Series 7 missing (<=70)',
    jd: cJD,
    resume: resume(
      'Compliance professional with strong regulatory knowledge.',
      [['Compliance Analyst at BrokerCo (2021 - Present)',
        'Reviewed transactions for regulatory compliance.',
        'Helped with risk management reporting.',
        'Documented audit findings, attention to detail.',
        'Coordinated with regulators on filings.']],
      'regulatory compliance, risk management, audit, reporting, attention to detail',
    ),
  },
  {
    id: 'C11', label: 'HC Adversarial - RN listed, license missing (<=65)',
    jd: HC_JD,
    resume: resume(
      'Nursing professional with broad clinical exposure.',
      [['Patient Care Coordinator at Clinic (2018 - Present)',
        'Coordinated patient care schedules.',
        'Documented in Epic EHR.',
        'Worked in ICU environment years ago.',
        'Maintained patient care records.']],
      'RN, ICU, critical care, Epic, patient care, vitals, telemetry',
    ),
  },
  {
    id: 'C12', label: 'SYNTHETIC: all-required-only-PARTIAL (misleading "100% met" probe)',
    jd: SWE_JD,
    resume: resume(
      'Backend engineer with solid overlap on related skills.',
      [['Backend Engineer at MidCo (2020 - Present)',
        'Built services with a microservices-inspired design (module boundaries).',
        'Used SQL and Postgres-adjacent databases.',
        'Containers and Docker-adjacent tooling on internal cloud.',
        'Studied distributed systems concepts in a grad course.',
        'Wrote some Python and Go-adjacent scripting.']],
      'Python (basic), SQL (basic), Docker (basic), distributed systems (coursework)',
      'B.S. in Computer Science, 2019',
    ),
  },
];

// -----------------------------------------------------------------------------
// Mirrored UI presentation helpers (must stay in sync with resume-checker.ts)
// -----------------------------------------------------------------------------
function escStr(s: string): string {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[ch];
  });
}

function findMissingTerm(reqText: string, result: any): string {
  const text = reqText.toLowerCase();
  const candidates: string[] = [
    ...(result.missingSkills || []),
    ...Array.from(result.missingConcepts || []),
  ].filter((c: string) => c && c.length >= 2);
  candidates.sort((a, b) => b.length - a.length);
  return candidates.find((c: string) => text.includes(c.toLowerCase())) || '';
}

function levelWhy(level: string): string {
  switch (level) {
    case 'EXACT': return 'Your resume evidences this requirement directly in your work history.';
    case 'EQUIVALENT': return 'You demonstrate an equivalent capability in place of the exact term.';
    case 'PARTIAL': return 'This requirement is present but only partially matched — not enough for full credit.';
    case 'RELATED': return 'A related concept was found, but not the exact requirement itself.';
    case 'CONFLICT': return 'Your resume appears to conflict with this requirement.';
    default: return 'No evidence of this requirement was found in your resume.';
  }
}

function projectScoreDelta(term: string, resumeText: string, jdText: string, currentResult: any) {
  if (!currentResult) return { current: 0, projected: 0, delta: 0 };
  if (!resumeText.trim() || !jdText.trim()) return { current: currentResult.overall, projected: currentResult.overall, delta: 0 };
  const augmented = `${resumeText.trim()}\n\nOptimized Skills & Keywords: ${term}`;
  const sim = calculateOverallScore(augmented, jdText);
  return { current: currentResult.overall, projected: sim.overall, delta: Math.round(sim.overall - currentResult.overall) };
}

const KEYWORD_CREDIT_TYPES = new Set(['skill', 'methodology', 'soft_skill', 'domain_experience', 'leadership']);

function gapAdvice(m: { type: string; text: string }, result: any): { term: string; action: string } {
  const term = KEYWORD_CREDIT_TYPES.has(m.type) ? findMissingTerm(m.text, result) : '';
  let action: string;
  if (term) {
    action = `Add "${term}" to your Skills section and back it with a role bullet describing real usage.`;
  } else if (m.type === 'certification' || m.type === 'license') {
    action = 'If you hold this credential, list it explicitly in a Certifications section — the engine only credits explicit license or certification evidence.';
  } else if (m.type === 'education') {
    action = 'Add the exact degree or credential to your Education section.';
  } else {
    action = 'Add concrete evidence of this requirement to your experience section.';
  }
  return { term, action };
}

function buildMatchWhy(result: any): string | null {
  const reqs: any[] = result.requirementMatches || [];
  const impOrder: Array<[string, string]> = [
    ['REQUIRED', 'required'],
    ['PREFERRED', 'preferred'],
    ['NICE_TO_HAVE', 'nice-to-have'],
    ['RESPONSIBILITY', 'responsibility'],
  ];
  const byKey: Record<string, { total: number; full: number; partial: number }> = {};
  reqs.forEach((m: any) => {
    const k = byKey[m.importance] || (byKey[m.importance] = { total: 0, full: 0, partial: 0 });
    k.total++;
    if (m.level === 'EXACT' || m.level === 'EQUIVALENT') k.full++;
    else if (m.level === 'PARTIAL' || m.level === 'RELATED') k.partial++;
  });
  const parts: string[] = [];
  for (const [key, label] of impOrder) {
    const b = byKey[key];
    if (!b || b.total === 0) continue;
    if (b.full === b.total) parts.push(`all ${b.total} ${label} requirements met in full`);
    else if (b.full > 0 && b.partial > 0) parts.push(`${b.full} of ${b.total} ${label} met in full and ${b.partial} partially`);
    else if (b.full > 0) parts.push(`${b.full} of ${b.total} ${label} met in full`);
    else if (b.partial > 0) parts.push(`${b.partial} of ${b.total} ${label} met only partially`);
    else parts.push(`none of the ${b.total} ${label} requirements met`);
  }
  if (parts.length === 0) return null;
  return `Job Match is a weighted average across all requirements — required items carry the most weight. ${parts.join('. ')}.`;
}

function buildCriticalGaps(result: any): Array<{ text: string; level: string; type: string; term: string; action: string }> {
  return (result.requirementMatches || [])
    .filter((m: any) => m.importance === 'REQUIRED' && m.gap)
    .map((m: any) => ({ text: m.text, level: m.level, type: m.type, term: gapAdvice(m, result).term, action: gapAdvice(m, result).action }));
}

function buildTop3(result: any): Array<{ title: string; desc: string; action: string; severity: string; simulate: { term: string; label: string } | undefined }> {
  const reasons: any[] = [];
  const reqMatches: any[] = result.requirementMatches || [];
  const criticalReqs = reqMatches.filter((m: any) => m.importance === 'REQUIRED' && m.gap);
  criticalReqs.slice(0, 3).forEach((m: any) => {
    const advice = gapAdvice(m, result);
    reasons.push({
      title: 'Missing required: ' + (advice.term || m.text),
      score: 0,
      desc: `${m.text}. This is a required requirement with no evidence in your resume.`,
      action: advice.action,
      severity: 'critical',
      simulate: advice.term ? { term: advice.term, label: m.text } : undefined,
    });
  });

  const totalKw = result.matchedWords.size + result.missingWords.size;
  if (result.scoreKeyword < 60 && totalKw > 0) reasons.push({
    title: `Low Keyword Match (${result.scoreKeyword}%)`,
    score: result.scoreKeyword,
    desc: `Only ${result.matchedWords.size} of ${totalKw} job-description keywords appear in your resume.`,
    action: 'Mirror the exact phrases the JD uses in your summary and skills sections.',
    severity: 'high',
  });
  if (result.scoreSkills < 60 && result.missingSkills.length > 0) reasons.push({
    title: `Missing Skills (${result.scoreSkills}%)`,
    score: result.scoreSkills,
    desc: `${result.missingSkills.length} skills from the job description are absent: ${result.missingSkills.slice(0, 3).join(', ')}.`,
    action: 'Add the missing skills where truthful, backed by real usage.',
    severity: 'high',
  });
  if (result.scoreBullets < 60) reasons.push({
    title: `Bullet Impact (${result.scoreBullets}%)`,
    score: result.scoreBullets,
    desc: `Only ${result.bulletQuality.quantified} of ${result.bulletQuality.total} bullets are quantified; ${result.bulletQuality.actionVerbs} use action verbs.`,
    action: 'Add metrics (%, $, time) and strong action verbs to weak bullets.',
    severity: 'medium',
  });
  if (result.scoreSections < 60) reasons.push({
    title: `Section Completeness (${result.scoreSections}%)`,
    score: result.scoreSections,
    desc: 'Required sections like Summary or Experience are missing or sparse.',
    action: 'Ensure Summary, Experience, Skills, and Projects sections are complete.',
    severity: 'medium',
  });
  if (result.scoreExperience < 60) reasons.push({
    title: `Experience Alignment (${result.scoreExperience}%)`,
    score: result.scoreExperience,
    desc: 'Your work history doesn\'t closely mirror the responsibilities in the JD.',
    action: 'Reframe experience bullets to highlight responsibilities matching the JD.',
    severity: 'medium',
  });

  const sevRank: Record<string, number> = { critical: 0, high: 1, medium: 2 };
  reasons.sort((a, b) => (sevRank[a.severity] - sevRank[b.severity]) || (a.score - b.score));
  return reasons.slice(0, 3);
}

function groupCoverage(result: any): { strong: number; partial: number; missing: number; total: number } {
  const reqMatches = result.requirementMatches || [];
  return {
    strong: reqMatches.filter((m: any) => ['EXACT', 'EQUIVALENT'].includes(m.level)).length,
    partial: reqMatches.filter((m: any) => ['PARTIAL', 'RELATED'].includes(m.level)).length,
    missing: reqMatches.filter((m: any) => ['MISSING', 'CONFLICT'].includes(m.level)).length,
    total: reqMatches.length,
  };
}

// -----------------------------------------------------------------------------
// Audit runner
// -----------------------------------------------------------------------------
const findings: string[] = [];
function note(c: string): void { findings.push(c); }

console.log('================================================================================');
console.log('EXPLAINER LAYER PRODUCT/UX AUDIT');
console.log('================================================================================');

for (const c of CASES) {
  const r: any = calculateOverallScore(c.resume, c.jd);
  const reqCount = (r.requirementMatches || []).length;
  console.log('\n' + '='.repeat(100));
  console.log(`CASE ${c.id}: ${c.label}`);
  console.log(`  overall(jobMatch)=${r.overall}  ats=${r.atsScore}  requirements=${reqCount}`);

  // A. overall === jobMatch
  console.log(`  [consistency] overall===jobMatch: ${r.overall === r.jobMatch ? 'OK' : 'MISMATCH'}`);

  // B. requirement coverage grouping totals
  const cov = groupCoverage(r);
  console.log(`  [coverage] strong=${cov.strong} partial=${cov.partial} missing=${cov.missing} (sum=${cov.strong + cov.partial + cov.missing}, total=${cov.total})`);
  if (cov.strong + cov.partial + cov.missing !== cov.total) note(`CASE ${c.id}: coverage group counts do not sum to requirementCount`);

  // C. "Why this score?" summary
  const why = buildMatchWhy(r);
  console.log(`  [match-why] ${why ? 'RENDERED: ' + why : 'HIDDEN (no requirements)'}`);

  // D. Critical gaps
  const gaps = buildCriticalGaps(r);
  console.log(`  [critical-gaps] count=${gaps.length}`);
  gaps.forEach((g: any) => {
    console.log(`      gap: [${g.level}] (${g.type}) "${g.text.slice(0, 55)}"  simTerm="${g.term}"`);
  });

  // E. Evidence integrity: non-gap have evidence, gaps have none
  (r.requirementMatches || []).forEach((m: any) => {
    if (m.gap && m.evidence) note(`CASE ${c.id}: GAP requirement has evidence (inconsistent): "${m.text.slice(0, 40)}"`);
    if (!m.gap && !m.evidence && m.level !== 'CONFLICT') {
      // years/degree-type matches legitimately have no text evidence
    }
  });

  // F. Simulate honesty for each gap + top-3 simulate terms
  const sims = new Map<string, { type: string; level: string; text: string; delta: number }>();
  const recordSim = (term: string, type: string, level: string, text: string) => {
    if (!term || sims.has(term)) return;
    const s = projectScoreDelta(term, c.resume, c.jd, r);
    sims.set(term, { type, level, text, delta: s.delta });
  };
  gaps.forEach((g: any) => recordSim(g.term, g.type, g.level, g.text));
  const top3 = buildTop3(r);
  top3.forEach((t: any) => { if (t.simulate) recordSim(t.simulate.term, '?', 'MISSING', t.simulate.label); });
  sims.forEach((s, term) => {
    console.log(`  [simulate] +"${term}" (type=${s.type}, level=${s.level}) -> delta ${s.delta > 0 ? '+' + s.delta : s.delta}${s.delta > 0 ? ' (boost)' : s.delta === 0 ? ' (NO-OP)' : ' (drop)'}`);
    if (s.delta === 0) note(`CASE ${c.id}: simulate button for "${term}" (${s.text.slice(0, 40)}) is a NO-OP — button implies an action the engine cannot reward`);
    if (s.delta < 0) note(`CASE ${c.id}: simulate button for "${term}" would DROP the score`);
  });

  // G. Top-3
  console.log('  [top-3]');
  top3.forEach((t: any) => {
    console.log(`      * [${t.severity}] ${t.title.slice(0, 70)}`);
    console.log(`          desc: ${t.desc.slice(0, 90)}`);
    console.log(`          action: ${t.action.slice(0, 90)}`);
    if (t.simulate) console.log(`          simulate: term="${t.simulate.term}"`);
  });

  // H. Empty-JD edge: critical-gaps positive message when no requirements
  if (reqCount === 0 && gaps.length === 0) {
    console.log(`  [empty-state] NO requirements extracted -> critical-gaps would show "No critical gaps — all required requirements are met."`);
    note(`CASE ${c.id}: empty-requirements state shows misleading positive message`);
  }

  // I. Escaping probe: UI wraps top-3 title/desc/action in escStr before innerHTML
  if (top3.some((t: any) => /[<>]/.test(escStr(t.title + t.desc + t.action)))) {
    note(`CASE ${c.id}: escaped top-3 text still contains raw HTML`);
  }
}
console.log('\n' + '='.repeat(100));
console.log('EDGE PROBES');

// J. All-partial required: does the "met" percentage overstate?
{
  const c = CASES[11];
  const r: any = calculateOverallScore(c.resume, c.jd);
  const byImp = r.requirementsByImportance;
  console.log(`\n[J] All-partial probe: overall=${r.overall}`);
  console.log(`    REQUIRED bucket: matched=${byImp.REQUIRED?.matched} total=${byImp.REQUIRED?.total} score=${byImp.REQUIRED?.score}%`);
  const partialRequired = (r.requirementMatches || []).filter((m: any) => m.importance === 'REQUIRED');
  const lv = partialRequired.map((m: any) => m.level).join(', ');
  console.log(`    REQUIRED levels: ${lv}`);
  if (byImp.REQUIRED && byImp.REQUIRED.score >= 90) {
    note(`[J] By-importance counts PARTIAL/RELATED as "met": REQUIRED bucket claims ${byImp.REQUIRED.matched}/${byImp.REQUIRED.total} (${byImp.REQUIRED.score}%) while every match is ${lv}.`);
  }
}

// K. No-requirements JD (extraction fails) -> critical-gaps message
{
  const r: any = calculateOverallScore('Summary\nCook.\nExperience\nLine Cook at Bistro (2020 - Present)\n- Prepared orders.\nSkills\nKnife skills, plating', 'Job: General Helper\nWe need a friendly generalist to help with tasks.');
  const n = (r.requirementMatches || []).length;
  console.log(`\n[K] Near-empty JD probe: requirements=${n}`);
  const gaps = (r.requirementMatches || []).filter((m: any) => m.importance === 'REQUIRED' && m.gap);
  console.log(`    critical-gaps count=${gaps.length}${n === 0 ? ' -> UI shows "No critical gaps — all required requirements are met." (misleading)' : ''}`);
}

// L. Sandbox "Add to Resume" for a certification gap (FIN no-CPA) — engine truth
{
  const c = CASES[5];
  const r: any = calculateOverallScore(c.resume, c.jd);
  const sim = projectScoreDelta('cpa', c.resume, c.jd, r);
  console.log(`\n[L] FIN no-CPA: appending bare "cpa" -> delta=${sim.delta} (engine gives bare-credential credit = ${sim.delta > 0 ? 'YES' : 'NO'})`);
  if (sim.delta > 0) note('[L] Engine grants Job-Match credit for a bare certification keyword ("cpa") in a Skills line; the simulate button + "Add to Resume" then recommends faking a credential.');
}

console.log('\n' + '='.repeat(100));
console.log(`\nFINDINGS (${findings.length}):`);
const seen = new Set<string>();
findings.forEach((f: string) => {
  const k = f.split(':')[0] + ':' + f.split(':')[1];
  const key = f.replace(/CASE C\d+: /, '').replace(/\[J\]|\[L\]/, '');
  if (!seen.has(key)) { seen.add(key); console.log('  - ' + f); }
});
