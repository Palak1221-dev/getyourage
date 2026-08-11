import { calculateOverallScore, detectGhostJob } from '../src/scripts/scoring-engine.ts';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail?: string): void {
  if (cond) {
    passed++;
    console.log(`  \u2713 ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  \u2717 ${name}${detail ? ` -- ${detail}` : ''}`);
  }
}

function makeResume(sections: { role: string; bullets: string[]; skills: string[]; education?: string; summary?: string }): string {
  const lines: string[] = [];
  if (sections.summary) lines.push('Summary', sections.summary);
  lines.push('Experience', sections.role, ...sections.bullets.map(b => `- ${b}`));
  if (sections.education) lines.push('Education', sections.education);
  lines.push('Skills', sections.skills.join(', '));
  return lines.join('\n');
}

function makeJD(section: 'Requirements' | 'Preferred' | 'Nice to have', items: string[]): string {
  return `Software Engineer\n\n${section}:\n${items.map(i => `- ${i}`).join('\n')}`;
}

// ---------------------------------------------------------------------------
// 1. Stability (regression guard) — small edits produce bounded score changes.
// ---------------------------------------------------------------------------
function testStability(): void {
  console.log('--- Stability Tests ---');
  const resume = makeResume({
    role: 'Software Engineer at Tech Corp (2024 - Present)',
    bullets: [
      'Built React applications serving 2M users.',
      'Reduced deployment time by 80% using Docker pipelines.',
      'Implemented CI/CD pipelines with GitHub Actions.',
    ],
    education: 'Bachelor of Science in Computer Science, 2020',
    skills: ['JavaScript', 'React', 'Node.js', 'Docker', 'SQL'],
    summary: 'Software Engineer with 5 years of experience.',
  });
  const jd = makeJD('Requirements', [
    '5+ years of experience with React',
    'Strong proficiency in TypeScript and Node.js',
    'Experience with Docker and CI/CD',
    'Excellent communication and teamwork skills',
  ]);
  const base = calculateOverallScore(resume, jd);

  // Add one keyword (one small edit).
  const kwResume = resume + '\nPostgreSQL';
  const kwScore = calculateOverallScore(kwResume, jd).overall;
  check('Adding one keyword changes score <= 5 pts', Math.abs(kwScore - base.overall) <= 5, `diff=${Math.abs(kwScore - base.overall)}`);

  // Add one skill.
  const skillResume = resume + '\nAWS';
  const skillScore = calculateOverallScore(skillResume, jd).overall;
  check('Adding one skill changes score <= 6 pts', Math.abs(skillScore - base.overall) <= 6, `diff=${Math.abs(skillScore - base.overall)}`);

  // Removing a whole skills section changes score meaningfully.
  const noSkills = resume.replace(/Skills[\s\S]*/i, '');
  const noSkillsScore = calculateOverallScore(noSkills, jd).overall;
  check('Removing Skills section drops score >= 6 pts', base.overall - noSkillsScore >= 6, `diff=${base.overall - noSkillsScore}`);

  // Score is a valid number 0-100.
  check('Baseline overall is 0-100', base.overall >= 0 && base.overall <= 100, `overall=${base.overall}`);
  check('atsScore is 0-100', base.atsScore >= 0 && base.atsScore <= 100, `ats=${base.atsScore}`);
}

// ---------------------------------------------------------------------------
// 2. Generalization — a resume that genuinely matches the JD scores high,
//    and terminology differences are understood semantically.
// ---------------------------------------------------------------------------
function testSemanticGeneralization(): void {
  console.log('--- Semantic Generalization (terminology / phrasing) ---');

  // The resume uses different wording but the same underlying concepts.
  const resume = makeResume({
    role: 'Software Engineer at Tech Corp (2024 - Present)',
    bullets: [
      'Built web applications with React and TypeScript.',
      'Reduced deployment time by 80% using Docker pipelines.',
      'Developed server-side APIs in Node.js.',
      'Wrote automated tests with Jest.',
    ],
    education: 'B.S. in Computer Science, 2020',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Docker', 'Jest'],
    summary: 'Software Engineer with 5 years of experience.',
  });
  // JD uses synonyms / different phrasing: "web apps" vs "React", "unit tests" vs "Jest", "JS" vs "JavaScript".
  const jd = `Frontend Engineer
Requirements:
- 5+ years building web applications with modern JS frameworks
- Unit testing experience
- Backend development in JS
- Containerized deployments
Preferred:
- Bachelors degree in a technical field`;
  const r = calculateOverallScore(resume, jd);
  check('Synonymous resume matches >= 70', r.overall >= 70, `overall=${r.overall}`);

  // A resume for a totally different domain scores low.
  const unrelated = makeResume({
    role: 'Data Analyst at Bank Corp (2023 - Present)',
    bullets: [
      'Built Excel dashboards for quarterly reporting.',
      'Reconciled bank statements and ledgers.',
      'Presented findings to stakeholders.',
    ],
    education: 'B.A. in Economics, 2019',
    skills: ['Excel', 'SQL', 'PowerPoint'],
    summary: 'Data Analyst with 3 years of experience.',
  });
  const ur = calculateOverallScore(unrelated, jd);
  check('Wrong-domain resume scores < 40', ur.overall < 40, `overall=${ur.overall}`);
}

// ---------------------------------------------------------------------------
// 3. Adversarial — keyword stuffing is NOT rewarded, stale skills don't match,
//    and copied JD text gets a modest boost but not a perfect score.
// ---------------------------------------------------------------------------
function testAdversarial(): void {
  console.log('--- Adversarial Cases ---');
  const jd = makeJD('Requirements', [
    '5+ years of experience with React',
    'Strong proficiency in TypeScript and Node.js',
    'Experience with Docker and Kubernetes',
    'Bachelor degree in Computer Science',
  ]);

  // Keyword stuffing: repeated bare keywords with no real experience.
  const stuffed = `React React React Node.js Node.js Docker Docker Kubernetes Kubernetes TypeScript TypeScript\nReact React Node.js Docker Kubernetes TypeScript React Node.js Docker Kubernetes TypeScript`;
  const sr = calculateOverallScore(stuffed, jd);
  check('Pure keyword stuffing scores < 55', sr.overall < 55, `overall=${sr.overall}`);

  // Stale skill: resume lists a skill, but no experience or context.
  const stale = makeResume({
    role: 'Office Assistant at Local Co (2020 - Present)',
    bullets: [
      'Scheduled meetings and managed calendars.',
      'Handled incoming mail and office supplies.',
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'Docker'],
    education: 'High School Diploma, 2018',
    summary: 'Office assistant.',
  });
  const st = calculateOverallScore(stale, jd);
  check('Skills without experience score < 60', st.overall < 60, `overall=${st.overall}`);

  // Copy-pasted JD text into resume — should NOT be a near-perfect match.
  const copycat = makeResume({
    role: 'Software Engineer at Acme (2022 - Present)',
    bullets: [
      '5+ years of experience with React.',
      'Strong proficiency in TypeScript and Node.js.',
      'Experience with Docker and Kubernetes.',
      'Bachelor degree in Computer Science.',
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'Docker', 'Kubernetes'],
    education: 'B.S. Computer Science',
    summary: 'Software Engineer.',
  });
  const cr = calculateOverallScore(copycat, jd);
  check('Copy-pasted JD does not reach 100', cr.overall < 100, `overall=${cr.overall}`);
  check('Copy-pasted JD still matches high', cr.overall >= 75, `overall=${cr.overall}`);
}

// ---------------------------------------------------------------------------
// 4. Ghost-job detection is honest.
// ---------------------------------------------------------------------------
function testGhostJobs(): void {
  console.log('--- Ghost-Job Detection ---');

  const legit = `Senior Frontend Engineer at Acme Corp
About the company: Acme is a Series B SaaS company. We pay 140-180k per year.
About the role: You will report to the VP of Engineering and lead a team of 4 engineers.
Requirements: 5+ years building React apps, TypeScript, Node.js, B.S. in Computer Science.`;
  const l = detectGhostJob(legit);
  check('Legitimate JD is not flagged high', l.risk !== 'high', `risk=${l.risk}`);

  const ghost = `Senior React Developer [Company Name]
We are always looking for talented engineers to join our talent pool on a rolling basis.
This is an evergreen posting. Email resume to email@company.com. No salary range mentioned.
We are urgently hiring rockstar ninja developers for an immediate start.`;
  const g = detectGhostJob(ghost);
  check('Templated/evergreen JD flagged high', g.risk === 'high', `risk=${g.risk}`);

  const tooShort = 'Software Engineer';
  const ts = detectGhostJob(tooShort);
  check('Short JD returns unknown', ts.risk === 'unknown', `risk=${ts.risk}`);
}

// ---------------------------------------------------------------------------
// 5. Backward compatibility — legacy AnalysisResult fields still populated.
// ---------------------------------------------------------------------------
function testBackwardCompatibility(): void {
  console.log('--- Backward Compatibility ---');
  const resume = makeResume({
    role: 'Software Engineer at Tech Corp (2024 - Present)',
    bullets: [
      'Built React applications serving 2M users.',
      'Reduced deployment time by 80% using Docker pipelines.',
    ],
    education: 'Bachelor of Science in Computer Science, 2020',
    skills: ['JavaScript', 'React', 'Node.js', 'Docker'],
    summary: 'Software Engineer with 5 years of experience.',
  });
  const jd = makeJD('Requirements', [
    '5+ years of experience with React',
    'Strong proficiency in TypeScript and Node.js',
    'Experience with Docker and CI/CD',
  ]);
  const r = calculateOverallScore(resume, jd);

  check('matchedWords is a Set', r.matchedWords instanceof Set);
  check('missingWords is a Set', r.missingWords instanceof Set);
  check('keywordDensity is an array', Array.isArray(r.keywordDensity));
  check('sections is an array', Array.isArray(r.sections));
  check('bulletQuality present', !!r.bulletQuality && typeof r.bulletQuality === 'object');
  check('tips is an array', Array.isArray(r.tips));
  check('redFlags is an array', Array.isArray(r.redFlags));
  check('missingSkills is an array', Array.isArray(r.missingSkills));
  check('matchedSkills is an array', Array.isArray(r.matchedSkills));
  check('resumeWords is a number', typeof r.resumeWords === 'number');
  check('jdWords is a number', typeof r.jdWords === 'number');
  check('sectionScores is an object', !!r.sectionScores && typeof r.sectionScores === 'object');
  check('formatFlags is an array', Array.isArray(r.formatFlags));
  check('scoreBullets is a number', typeof r.scoreBullets === 'number');
  check('scoreSections is a number', typeof r.scoreSections === 'number');
  check('scoreFormat is a number', typeof r.scoreFormat === 'number');
  check('scoreExperience is a number', typeof r.scoreExperience === 'number');
  check('matchedPhrases is an array', Array.isArray(r.matchedPhrases));
  check('missingPhrases is an array', Array.isArray(r.missingPhrases));
  check('grade has letter', !!r.grade && typeof r.grade.letter === 'string');
  check('overall === jobMatch', r.overall === (r as any).jobMatch, `overall=${r.overall} jobMatch=${(r as any).jobMatch}`);

  // New fields.
  check('requirementMatches is an array', Array.isArray((r as any).requirementMatches));
  check('criticalGaps is an array', Array.isArray((r as any).criticalGaps));
  check('matchedConcepts is an array', Array.isArray((r as any).matchedConcepts));
  check('missingConcepts is an array', Array.isArray((r as any).missingConcepts));
  check('requirementsByImportance is an object', !!r && typeof (r as any).requirementsByImportance === 'object');
}

testStability();
testSemanticGeneralization();
testAdversarial();
testGhostJobs();
testBackwardCompatibility();

console.log(`\n=== ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  console.log('Failures:');
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
}
console.log('All ATS scoring tests passed.');
