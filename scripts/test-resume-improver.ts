// Test suite for src/scripts/resume-improver.ts — the evidence-backed
// "Improve My Resume" recommendations.
//
// These tests assert the module's truthfulness guarantees:
//   1. Every suggested edit / rewrite is built only from verbatim resume or JD
//      text (unsupportedTokens is empty for every recommendation).
//   2. scoreImpact is a real engine recompute — its delta must equal a fresh
//      computeImpact() call.
//   3. Placeholder metrics ([...]) never fake a score projection.
//   4. Credential / education / years gaps never offer a bare-keyword add.
//   5. Rewrites always open with an ACTIVE_VERB (no "Built Built ...").
//
// The matching engine and scoring model are read-only; this only tests the
// UI-independent module logic.

import {
  buildRecommendations,
  computeImpact,
  rewriteBullet,
  applyEdit,
  findMetricPhrase,
  unsupportedTokens,
} from '../src/scripts/resume-improver.ts';
import { ACTIVE_VERBS } from '../src/scripts/scoring-engine.ts';

type Rec = ReturnType<typeof buildRecommendations>['recommendations'][number];

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail?: string): void {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(name);
    console.log(`  \u2717 ${name}${detail ? ` -- ${detail}` : ''}`);
  }
}

function makeResume(role: string, bullets: string[], skills: string[], education?: string): string {
  const lines: string[] = ['Experience', role, ...bullets.map(b => `- ${b}`)];
  if (education) lines.push('Education', education);
  lines.push('Skills', skills.join(', '));
  return lines.join('\n');
}

// All scenarios (resume, jd, result) collected for the global guardrail sweep.
const sweep: { name: string; resume: string; jd: string; result: ReturnType<typeof buildRecommendations> }[] = [];

function buildAndSweep(name: string, resume: string, jd: string) {
  const result = buildRecommendations(resume, jd);
  sweep.push({ name, resume, jd, result });
  return result;
}

function findRec(recs: Rec[], kind: Rec['kind']): Rec | undefined {
  return recs.find(r => r.kind === kind);
}

// ---------------------------------------------------------------------------
// 1. Missing required keyword-credit skill -> append-skills edit.
// ---------------------------------------------------------------------------
function testMissingRequired(): void {
  const resume = makeResume(
    'Software Engineer at Tech Corp (2024 - Present)',
    [
      'Built React applications serving 2M users.',
      'Reduced deployment time by 80% using CI/CD pipelines.',
    ],
    ['React', 'TypeScript', 'Node.js'],
  );
  const jd = `Software Engineer\n\nRequirements:\n- Experience with Docker\n- Experience with Kubernetes`;
  const { recommendations } = buildAndSweep('missing-required', resume, jd);

  const rec = findRec(recommendations, 'missing_required');
  check('missing_required: present', !!rec);
  check('missing_required: edit is append-skills', rec?.edit?.kind === 'append-skills', `kind=${rec?.edit?.kind}`);
  check('missing_required: term is a real gap (docker)', (rec?.term || '').toLowerCase() === 'docker', `term=${rec?.term}`);
  check('missing_required: action carries the honest caveat', (rec?.action || '').includes('only if you genuinely have'), rec?.action);
  check('missing_required: scoreImpact recomputed (non-null)', rec?.scoreImpact !== null);
}

// ---------------------------------------------------------------------------
// 2. Missing certification -> advice only, never a bare-keyword add.
// ---------------------------------------------------------------------------
function testMissingCertification(): void {
  const resume = makeResume(
    'Senior Software Engineer at Corp (2023 - Present)',
    ['Led a team of 8 building React microservices.'],
    ['React', 'TypeScript'],
  );
  const jd = `Software Engineer\n\nRequirements:\n- PMP certification\n- Experience with React`;
  const { recommendations } = buildAndSweep('missing-cert', resume, jd);

  const rec = findRec(recommendations, 'missing_evidence');
  check('missing_cert: missing_evidence present', !!rec);
  check('missing_cert: doNotAdd is true', rec?.doNotAdd === true);
  check('missing_cert: edit is null (no fake add)', rec?.edit === null);
  check('missing_cert: scoreImpact is null', rec?.scoreImpact === null);
  check('missing_cert: action points at explicit credential evidence', (rec?.action || '').includes('Certifications section'), rec?.action);
}

// ---------------------------------------------------------------------------
// 3. Missing education -> advice only.
// ---------------------------------------------------------------------------
function testMissingEducation(): void {
  const resume = makeResume(
    'Software Engineer at Tech Corp (2024 - Present)',
    ['Built React applications serving 2M users.'],
    ['React', 'Node.js'],
  );
  const jd = `Software Engineer\n\nRequirements:\n- Bachelor degree in Computer Science\n- Experience with React`;
  const { recommendations } = buildAndSweep('missing-edu', resume, jd);

  const rec = findRec(recommendations, 'missing_evidence');
  check('missing_edu: missing_evidence present', !!rec);
  check('missing_edu: doNotAdd is true', rec?.doNotAdd === true);
  check('missing_edu: edit is null', rec?.edit === null);
  check('missing_edu: scoreImpact is null', rec?.scoreImpact === null);
  check('missing_edu: action mentions Education section', (rec?.action || '').includes('Education'), rec?.action);
}

// ---------------------------------------------------------------------------
// 4. Keyword listed in Skills only (no role bullet) -> surface-summary edit.
// ---------------------------------------------------------------------------
function testSkillNotEvidenced(): void {
  const resume = makeResume(
    'Software Engineer at Tech Corp (2024 - Present)',
    ['Built Node.js backends for internal tools.'],
    ['React', 'Node.js'],
  );
  const jd = `Software Engineer\n\nRequirements:\n- Experience with React`;
  const { recommendations } = buildAndSweep('skill-not-evidenced', resume, jd);

  const rec = findRec(recommendations, 'skill_not_evidenced');
  check('skill_not_evidenced: present', !!rec);
  check('skill_not_evidenced: edit is surface-summary', rec?.edit?.kind === 'surface-summary', `kind=${rec?.edit?.kind}`);
  check('skill_not_evidenced: summaryLine is the verbatim JD requirement', rec?.edit?.summaryLine === 'Experience with React', `line=${rec?.edit?.summaryLine}`);
  check('skill_not_evidenced: requiresNewInfo is false (JD text is real)', rec?.requiresNewInfo === false);
}

// ---------------------------------------------------------------------------
// 5. Partial match (related term in resume, exact term absent) -> replace-bullet.
// ---------------------------------------------------------------------------
function testPartialRequirement(): void {
  const resume = makeResume(
    'Data Engineer at Insight Ltd (2022 - Present)',
    ['Built SQL reporting dashboards used by 2M users.'],
    ['SQL'],
  );
  const jd = `Requirements:\n- Experience with PostgreSQL`;
  const { recommendations } = buildAndSweep('partial', resume, jd);

  const rec = findRec(recommendations, 'partial_requirement');
  check('partial: partial_requirement present', !!rec, `kinds=${recommendations.map((r) => r.kind).join(',')}`);
  check('partial: term is the unevidenced requirement concept (postgresql)', rec?.term === 'postgresql', `term=${rec?.term}`);
  check('partial: edit is replace-bullet (not a bare-keyword add)', rec?.edit?.kind === 'replace-bullet', `kind=${rec?.edit?.kind}`);
  check('partial: original bullet is the real evidenced bullet', rec?.edit?.original === 'Built SQL reporting dashboards used by 2M users.', `orig=${rec?.edit?.original}`);
  check('partial: suggested keeps the real bullet text verbatim + JD term', rec?.suggested === 'Built SQL reporting dashboards used by 2M users. — postgresql', `suggested=${rec?.suggested}`);
}

// ---------------------------------------------------------------------------
// 6. Recency-flagged requirement with dated evidence -> advice only.
// ---------------------------------------------------------------------------
function testRecencyStale(): void {
  const resume = `Experience\nFrontend Developer at Acme (2018 - 2019)\n- Built React interfaces used by 10k users.\nBackend Developer at Corp (2024 - Present)\n- Built Node.js APIs for internal tools.\nSkills: React, Node.js`;
  const jd = `Software Engineer\n\nRequirements:\n- Recent React experience`;
  const { recommendations } = buildAndSweep('recency-stale', resume, jd);

  const rec = findRec(recommendations, 'recency_stale');
  check('recency_stale: present', !!rec);
  check('recency_stale: edit is null', rec?.edit === null);
  check('recency_stale: scoreImpact is null', rec?.scoreImpact === null);
  check('recency_stale: requiresNewInfo is true', rec?.requiresNewInfo === true);
}

// ---------------------------------------------------------------------------
// 7. skill_years gap -> advice only, no fake "simulate".
// ---------------------------------------------------------------------------
function testSkillYearsGap(): void {
  const resume = makeResume(
    'Software Engineer at Tech Corp (2024 - Present)',
    ['Built React applications serving 2M users.'],
    ['React', 'Node.js'],
  );
  const jd = `Software Engineer\n\nRequirements:\n- 5+ years of experience with React`;
  const { recommendations } = buildAndSweep('skill-years', resume, jd);

  const rec = findRec(recommendations, 'skill_years_gap');
  check('skill_years_gap: present', !!rec);
  check('skill_years_gap: edit is null (no bare-keyword add)', rec?.edit === null);
  check('skill_years_gap: scoreImpact is null', rec?.scoreImpact === null);
}

// ---------------------------------------------------------------------------
// 8. Matched bullet lacks a metric, but a real metric exists elsewhere.
// ---------------------------------------------------------------------------
function testMissingMetricsWithMetric(): void {
  const resume = makeResume(
    'Software Engineer at Tech Corp (2024 - Present)',
    [
      'Built JavaScript dashboard for the team',
      'Reduced load time by 80%',
    ],
    ['JavaScript', 'Node.js'],
  );
  const jd = `Software Engineer\n\nRequirements:\n- Proficiency in JavaScript`;
  const { recommendations } = buildAndSweep('metrics-found', resume, jd);

  const rec = findRec(recommendations, 'missing_metrics');
  check('metrics_found: present', !!rec);
  check('metrics_found: rewrite reuses the real 80% metric', rec?.suggested?.includes('80%') === true, rec?.suggested);
  check('metrics_found: requiresNewInfo is false (real data)', rec?.requiresNewInfo === false);
  check('metrics_found: scoreImpact is non-null', rec?.scoreImpact !== null);
  check('metrics_found: no placeholder brackets', (rec?.suggested || '').includes('[') === false);
}

// ---------------------------------------------------------------------------
// 9. Matched bullet lacks a metric and NO metric exists anywhere.
// ---------------------------------------------------------------------------
function testMissingMetricsNoMetric(): void {
  const resume = makeResume(
    'Data Engineer at Tech Corp (2024 - Present)',
    ['Built Python data pipeline for analytics team'],
    ['Python', 'SQL'],
  );
  const jd = `Data Engineer\n\nRequirements:\n- Proficiency in Python`;
  const { recommendations } = buildAndSweep('metrics-missing', resume, jd);

  const rec = findRec(recommendations, 'missing_metrics');
  check('metrics_missing: present', !!rec);
  check('metrics_missing: suggested contains a [...] placeholder', (rec?.suggested || '').includes('['));
  check('metrics_missing: requiresNewInfo is true', rec?.requiresNewInfo === true);
  check('metrics_missing: edit is null (nothing to apply yet)', rec?.edit === null);
  check('metrics_missing: scoreImpact is null (no invented projection)', rec?.scoreImpact === null);
}

// ---------------------------------------------------------------------------
// 10. Weak bullet opening -> rewrite starts with an ACTIVE_VERB.
// ---------------------------------------------------------------------------
function testWeakEvidence(): void {
  const resume = makeResume(
    'Software Engineer at Tech Corp (2024 - Present)',
    ['Was responsible for React dashboard used by 10k users.'],
    ['React', 'Node.js'],
  );
  const jd = `Software Engineer\n\nRequirements:\n- Experience with React`;
  const { recommendations } = buildAndSweep('weak-evidence', resume, jd);

  const rec = findRec(recommendations, 'weak_evidence');
  check('weak_evidence: present', !!rec);
  const first = (rec?.suggested || '').split(' ')[0]?.toLowerCase() || '';
  check('weak_evidence: rewrite opens with an ACTIVE_VERB', ACTIVE_VERBS.includes(first), `first=${first} -> ${rec?.suggested}`);
  check('weak_evidence: edit is replace-bullet', rec?.edit?.kind === 'replace-bullet');
  check('weak_evidence: no double verb (was/stripped + new)', !(rec?.suggested || '').match(/\bwas\b/i));
}

// ---------------------------------------------------------------------------
// 11. Strong evidence only in an old role -> surface-summary for recency.
// ---------------------------------------------------------------------------
function testBuriedOlderRole(): void {
  const resume = `Experience\nFrontend Developer at Acme (2018 - 2019)\n- Built React interfaces used by 10k users.\nBackend Developer at Corp (2024 - Present)\n- Built Node.js APIs for internal tools.\nSkills: React, Node.js`;
  const jd = `Software Engineer\n\nRequirements:\n- Experience with React`;
  const { recommendations } = buildAndSweep('buried-older', resume, jd);

  const rec = findRec(recommendations, 'buried_older_role');
  check('buried_older_role: present', !!rec);
  check('buried_older_role: edit is surface-summary', rec?.edit?.kind === 'surface-summary', `kind=${rec?.edit?.kind}`);
  check('buried_older_role: summaryLine is the verbatim stale bullet', rec?.edit?.summaryLine === 'Built React interfaces used by 10k users.', `line=${rec?.edit?.summaryLine}`);
}

// ---------------------------------------------------------------------------
// 12. Direct rewriteBullet / findMetricPhrase unit checks (bug fixes).
// ---------------------------------------------------------------------------
function testRewriters(): void {
  // Bug: a bullet that already opens strong must not become "Built Built ...".
  const strong = rewriteBullet('Built React dashboard for the team.', 'framework', '80%');
  check('rewrite: keeps an existing strong verb (no double)', !strong.includes('Built Built'), strong);
  check('rewrite: appends the metric after the verb', strong.endsWith('80%.') || strong.includes('80%'), strong);

  // Bug: cloud/security verbs must exist in ACTIVE_VERBS.
  const cloud = rewriteBullet('Managed AWS infrastructure.', 'cloud', '');
  const sec = rewriteBullet('Secured the payment gateway.', 'security', '');
  const cFirst = cloud.split(' ')[0]?.toLowerCase() || '';
  const sFirst = sec.split(' ')[0]?.toLowerCase() || '';
  check('rewrite: cloud verb is an ACTIVE_VERB', ACTIVE_VERBS.includes(cFirst), `cloud -> ${cloud}`);
  check('rewrite: security verb is an ACTIVE_VERB', ACTIVE_VERBS.includes(sFirst), `security -> ${sec}`);

  // Weak opening is stripped, then a real verb is prepended.
  const weak = rewriteBullet('Responsible for dashboard used by 10k users.', 'framework', '');
  const wFirst = weak.split(' ')[0]?.toLowerCase() || '';
  check('rewrite: weak opening replaced by ACTIVE_VERB', ACTIVE_VERBS.includes(wFirst), weak);

  // findMetricPhrase ignores a role-header year range (2024 - Present).
  const phr = findMetricPhrase('Software Engineer at Tech Corp (2024 - Present)\nBuilt dashboards.\nReduced cost by 25%.');
  check('findMetricPhrase: skips year ranges, finds the real %', phr === '25%', `got=${phr}`);
}

// ---------------------------------------------------------------------------
// 13. Global truthfulness sweep across every recommendation.
// ---------------------------------------------------------------------------
function testSweep(): void {
  for (const s of sweep) {
    const { recommendations } = s.result;

    check(`${s.name}: capped at 8`, recommendations.length <= 8, `len=${recommendations.length}`);

    // Sorted by importance: no PREFERRED before REQUIRED, no NICE before PREFERRED.
    const rank = { REQUIRED: 0, PREFERRED: 1, NICE_TO_HAVE: 2 } as const;
    for (let i = 1; i < recommendations.length; i++) {
      const a = rank[recommendations[i - 1].importance as keyof typeof rank] ?? 9;
      const b = rank[recommendations[i].importance as keyof typeof rank] ?? 9;
      check(`${s.name}: sorted by importance (${i})`, a <= b, `${a} > ${b}`);
    }

    for (const rec of recommendations) {
      // Every piece of text a user could copy must be built from resume/JD tokens.
      if (rec.suggested) {
        const bad = unsupportedTokens(rec.suggested, s.resume, s.jd);
        check(`${s.name} [${rec.kind}] suggested is verbatim-safe`, bad.length === 0, `unsupported=${bad.join(', ')}`);
      }
      if (rec.edit?.summaryLine) {
        const bad = unsupportedTokens(rec.edit.summaryLine, s.resume, s.jd);
        check(`${s.name} [${rec.kind}] summaryLine is verbatim-safe`, bad.length === 0, `unsupported=${bad.join(', ')}`);
      }
      if (rec.edit?.replacement) {
        const bad = unsupportedTokens(rec.edit.replacement, s.resume, s.jd);
        check(`${s.name} [${rec.kind}] replacement is verbatim-safe`, bad.length === 0, `unsupported=${bad.join(', ')}`);
      }

      // Placeholder rule: '[' in suggested must disable score projection.
      if ((rec.suggested || '').includes('[')) {
        check(`${s.name} [${rec.kind}] placeholder -> requiresNewInfo`, rec.requiresNewInfo === true);
        check(`${s.name} [${rec.kind}] placeholder -> null impact`, rec.scoreImpact === null);
      }

      // doNotAdd must never carry an edit or a projection.
      if (rec.doNotAdd) {
        check(`${s.name} [${rec.kind}] doNotAdd -> no edit`, rec.edit === null);
        check(`${s.name} [${rec.kind}] doNotAdd -> null impact`, rec.scoreImpact === null);
      }

      // scoreImpact must equal a fresh real-engine recompute.
      if (rec.scoreImpact && rec.edit) {
        const fresh = computeImpact(s.resume, s.jd, rec.edit, s.result.currentScore);
        check(
          `${s.name} [${rec.kind}] delta equals real recompute`,
          fresh.delta === rec.scoreImpact.delta,
          `fresh=${fresh.delta} rec=${rec.scoreImpact.delta}`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 14. applyEdit round-trips.
// ---------------------------------------------------------------------------
function testApplyEdit(): void {
  const resume = makeResume(
    'Software Engineer at Tech Corp (2024 - Present)',
    ['Built React applications serving 2M users.'],
    ['React', 'Node.js'],
  );
  const appended = applyEdit(resume, { kind: 'append-skills', term: 'Docker' });
  check('applyEdit: adds Docker into the Skills list', /Skills[\s\S]*Docker/.test(appended), appended);
  check('applyEdit: keeps existing skills (React, Node.js)', appended.includes('React') && appended.includes('Node.js'), appended);

  const replaced = applyEdit(resume, {
    kind: 'replace-bullet',
    original: 'Built React applications serving 2M users.',
    replacement: 'Built React applications serving 2M users. 80%',
  });
  check('applyEdit: replaces the bullet verbatim', replaced.includes('serving 2M users. 80%'));

  const surfaced = applyEdit(resume, { kind: 'surface-summary', summaryLine: 'Experience with React' });
  check('applyEdit: surfaces a summary line', /Summary:[\s\S]*- Experience with React/.test(surfaced));
}

console.log('--- resume-improver.ts truthfulness tests ---');
testMissingRequired();
testMissingCertification();
testMissingEducation();
testSkillNotEvidenced();
testPartialRequirement();
testRecencyStale();
testSkillYearsGap();
testMissingMetricsWithMetric();
testMissingMetricsNoMetric();
testWeakEvidence();
testBuriedOlderRole();
testRewriters();
testApplyEdit();
testSweep();

console.log('\n==============================');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('==============================');
if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  - ${f}`));
}
process.exit(failed > 0 ? 1 : 0);
