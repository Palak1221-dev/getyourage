// Evidence-backed "Improve My Resume" recommendations built on top of the FROZEN
// requirement-level matching engine and scoring model.
//
// The matching engine (resume-matching-engine.ts) and scoring model
// (scoring-engine.ts) are read-only. This module only READS their outputs
// (analyzeMatch / calculateOverallScore / buildResumeProfile) to produce
// truthful, hallucination-free recommendations and truthful score projections.
//
// Rules that keep every suggestion honest:
//   - Every suggested edit is derived from text that already exists in the
//     resume or the job description (verbatim substrings), never invented.
//   - When a metric is needed but no metric exists anywhere in the resume, the
//     suggestion contains a "[...]" placeholder and produces NO score impact
//     (the user must supply a real number).
//   - Credential/education/experience-year gaps never offer a bare-keyword add;
//     they are advice-only (doNotAdd) because a bare keyword would not earn
//     engine credit and fabricating it would be dishonest.
//   - scoreImpact re-runs the real calculateOverallScore on the edited resume,
//     so the projected delta is exactly what the engine would return.
//
// Pure text logic (no DOM, no network). Internal imports use explicit ".ts"
// extensions so Node's --experimental-strip-types can load it for tests, while
// the browser bundle resolves the same files via Vite.

import {
  analyzeMatch,
  buildResumeProfile,
  conceptCategory,
  conceptFamily,
  findConceptsInText,
  escapeRe,
} from './resume-matching-engine.ts';
import type {
  MatchAnalysis,
  RequirementMatch,
  ResumeProfile,
} from './resume-matching-engine.ts';
import { calculateOverallScore, ACTIVE_VERBS, STOP_WORDS } from './scoring-engine.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecommendationKind =
  | 'missing_required' // REQUIRED gap, keyword-credit type -> append-skills edit
  | 'missing_evidence' // REQUIRED/other gap (credential, education, years...) -> advice only
  | 'skill_not_evidenced' // keyword in resume but no role bullet -> surface-summary edit
  | 'partial_requirement' // PARTIAL/RELATED, concept absent from resume -> replace-bullet
  | 'recency_stale' // recency-flagged, evidence older than 2 years -> advice only
  | 'skill_years_gap' // skill_years / years partial -> advice only
  | 'multi_concept' // PARTIAL/RELATED generic -> advice only
  | 'missing_metrics' // matched bullet has no quantified result
  | 'unclear_strong_evidence' // matched bullet too long to scan -> advice only
  | 'weak_evidence' // matched bullet opens weakly -> rewrite
  | 'buried_older_role'; // evidence exists but only in an old role -> surface-summary

export type EditKind = 'append-skills' | 'surface-summary' | 'replace-bullet';

export interface ResumeEdit {
  kind: EditKind;
  term?: string; // append-skills
  summaryLine?: string; // surface-summary
  original?: string; // replace-bullet (verbatim text to locate)
  replacement?: string; // replace-bullet
}

export interface Recommendation {
  requirementId: number;
  kind: RecommendationKind;
  importance: string;
  requirementText: string;
  term: string;
  title: string;
  why: string;
  action: string;
  suggested: string | null;
  edit: ResumeEdit | null;
  requiresNewInfo: boolean;
  doNotAdd: boolean;
  scoreImpact: { current: number; projected: number; delta: number } | null;
}

// Requirement types where adding a bare keyword to the Skills line actually
// earns engine credit (mirrors the UI's KEYWORD_CREDIT_TYPES whitelist).
const KEYWORD_CREDIT_TYPES = new Set(['skill', 'methodology', 'soft_skill', 'domain_experience', 'leadership']);

const LANGUAGE_CATEGORIES = new Set(['language']);

const RECENCY_FLAG = /\b(recent|current|latest|up\s*to\s*date|202\d)\b/i;

const WEAK_OPENINGS = [
  'responsible for',
  'responsible to',
  'responsibilities included',
  'responsibilities include',
  'duties include',
  'duties included',
  'helped with',
  'helped to',
  'assisted with',
  'assisted in',
  'worked on',
  'worked with',
  'worked in',
  'involved in',
  'tasked with',
  'in charge of',
  'was responsible',
  'did',
  'made',
  'got',
  'took',
  'was',
  'were',
  'currently',
];

const FILLER = [
  'a lot of',
  'lots of',
  'effectively',
  'efficiently',
  'successfully',
  'actively',
  'proactively',
  'consistently',
  'carefully',
  'diligently',
  'strategically',
  'very',
  'really',
  'quite',
  'extremely',
  'various',
  'numerous',
  'significant',
  'strong',
  'great',
  'good',
  'solid',
  'robust',
  'highly',
];

const LEAD_CONNECTORS = /^(?:a|an|the|to|for|with|on|in|at|of|by|and)\s+/i;

const VERB_BY_CATEGORY: Record<string, string> = {
  'programming-language': 'Built',
  framework: 'Built',
  library: 'Built',
  database: 'Managed',
  tool: 'Operated',
  platform: 'Managed',
  cloud: 'Managed',
  devops: 'Automated',
  methodology: 'Implemented',
  data: 'Analyzed',
  'ai-ml': 'Built',
  security: 'Secured',
  business: 'Improved',
  finance: 'Managed',
  marketing: 'Launched',
  sales: 'Grew',
  operations: 'Streamlined',
  hr: 'Managed',
  management: 'Led',
  leadership: 'Led',
  'soft-skill': 'Collaborated',
  design: 'Designed',
  healthcare: 'Delivered',
  legal: 'Drafted',
  compliance: 'Ensured',
  education: 'Taught',
  certification: 'Maintained',
  domain: 'Delivered',
  communication: 'Communicated',
  language: 'Translated',
  other: 'Improved',
};

const IMPACT_PLACEHOLDER = '[quantified result, e.g. 25% faster or 1M+ users]';

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function primaryConcept(m: RequirementMatch): string {
  const list = m.concepts || [];
  return list.find(c => !LANGUAGE_CATEGORIES.has(conceptCategory(c))) || list[0] || '';
}

function bulletStartsStrong(bullet: string): boolean {
  const first = bullet.replace(/^[-•*‣⁃–—>|\d.)\s]+/, '').split(' ')[0]?.toLowerCase() || '';
  return ACTIVE_VERBS.includes(first);
}

function stripWeakOpening(bullet: string): string {
  const lower = bullet.toLowerCase().trim();
  for (const open of [...WEAK_OPENINGS].sort((a, b) => b.length - a.length)) {
    if (lower.startsWith(open)) return bullet.trim().slice(open.length).replace(/^\s+/, '').trim();
  }
  return bullet.trim();
}

function stripFiller(s: string): string {
  let out = s;
  for (const f of FILLER) out = out.replace(new RegExp(`\\b${escapeRe(f)}\\b`, 'gi'), ' ');
  return out.replace(/\s+/g, ' ').trim();
}

function pickVerb(category: string): string {
  return VERB_BY_CATEGORY[category] || 'Improved';
}

function rewriteBullet(bullet: string, category: string, metric: string): string {
  let core = stripFiller(stripWeakOpening(bullet));
  core = core.replace(LEAD_CONNECTORS, '').trim();
  core = core.replace(/\s+/g, ' ').replace(/\.+$/, '').trim();
  // If the bullet already opens with a strong action verb, keep that verb —
  // prepending another one would produce "Built Built React..." The fresh verb
  // is only inserted when the original opening was weak/stripped.
  let result = bulletStartsStrong(core) ? core : `${pickVerb(category)} ${core}`;
  if (metric) result += ` ${metric}`;
  result = result.replace(/\s+/g, ' ');
  if (!/[.!?]$/.test(result)) result += '.';
  return result;
}

// Find a bullet (role line) in the resume that contains the term.
function bulletForTerm(term: string, profile: ResumeProfile): string {
  if (!term) return '';
  const needle = term.toLowerCase();
  for (const role of profile.roles) {
    for (const b of role.bullets) {
      if (b.toLowerCase().includes(needle)) return b;
    }
  }
  return '';
}

// Pull a "number + context" phrase from somewhere else in the resume (not the
// bullet being improved) so a suggested metric is always real resume data.
// Role-header date ranges ("Tech Corp (2024 - Present)") are skipped so a
// calendar year is never mistaken for a metric.
function findMetricPhrase(resumeText: string, skipBullet?: string): string {
  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (skipBullet && line === skipBullet.trim()) continue;
    if (/\(?\b(19|20)\d{2}\s*[-–]\s*(present|to|(?:19|20)\d{2})\b/i.test(line)) continue;
    if (!/\d/.test(line)) continue;
    const m = line.match(/(?:[$€£]\s*)?\d[\d,]*\.?\d*\+?(?:%|x)?/i);
    if (!m || m.index === undefined) continue;
    const after = line.slice(m.index + m[0].length).split(/\s+/).filter(Boolean).filter(t => /[a-z0-9]/.test(t)).slice(0, 3).join(' ');
    const phrase = `${m[0]} ${after}`.trim();
    if (phrase.length > 2) return phrase;
  }
  return '';
}

// Which tokens of a suggestion do NOT come from the resume or the JD verbatim?
// Used by tests + UI to prove we never invent vocabulary.
function unsupportedTokens(suggested: string, resumeText: string, jdText: string): string[] {
  if (!suggested) return [];
  const stripped = suggested.replace(/\[[^\]]*\]/g, ' ');
  const tokens = stripped.toLowerCase().split(/[^a-z0-9+#./-]+/).filter(w => w.length > 2);
  const hay = `${resumeText}\n${jdText}`.toLowerCase();
  const out: string[] = [];
  for (const t of tokens) {
    if (STOP_WORDS.has(t)) continue;
    if (ACTIVE_VERBS.includes(t)) continue;
    if (!hay.includes(t)) out.push(t);
  }
  return [...new Set(out)];
}

// ---------------------------------------------------------------------------
// Edits — pure text transforms applied to the resume before re-scoring.
// ---------------------------------------------------------------------------

export function applyEdit(resumeText: string, edit: ResumeEdit | null): string {
  if (!edit) return resumeText;

  if (edit.kind === 'append-skills') {
    const term = (edit.term || '').trim();
    if (!term) return resumeText;
    const skillsRegex = /(?:skills|technologies|tools|competencies)(?:\s*[:\-\n])+/i;
    const m = resumeText.match(skillsRegex);
    if (m && m.index !== undefined) {
      const insertIdx = m.index + m[0].length;
      // Keep the separator already consumed by the regex (the space/colon/newline),
      // then prepend the term to the skills list with a clean comma split so we
      // never produce "Docker,React".
      const rest = resumeText.slice(insertIdx);
      const wsMatch = rest.match(/^\s*/);
      const ws = wsMatch ? wsMatch[0] : '';
      const content = rest.slice(ws.length);
      return resumeText.slice(0, insertIdx) + ws + `${term}, ${content}`;
    }
    return resumeText.trim() + `\n\nSkills: ${term}`;
  }

  if (edit.kind === 'surface-summary') {
    const line = (edit.summaryLine || '').trim();
    if (!line) return resumeText;
    const head = resumeText.match(/(?:^|\n)\s*(summary|professional summary|objective|profile)\s*:?\s*\n/i);
    if (head && head.index !== undefined) {
      const idx = head.index + head[0].length;
      return resumeText.slice(0, idx) + `\n- ${line}` + resumeText.slice(idx);
    }
    return `Summary:\n- ${line}\n\n${resumeText.trim()}`;
  }

  if (edit.kind === 'replace-bullet') {
    const orig = (edit.original || '').trim();
    const rep = (edit.replacement || '').trim();
    if (!orig || !rep) return resumeText;
    const idx = resumeText.toLowerCase().indexOf(orig.toLowerCase());
    if (idx === -1) return resumeText;
    return resumeText.slice(0, idx) + rep + resumeText.slice(idx + orig.length);
  }

  return resumeText;
}

// Re-run the real engine on the edited resume. Truthful projection: whatever
// the engine computes is what the user will actually see after the edit.
export function computeImpact(
  resumeText: string,
  jdText: string,
  edit: ResumeEdit,
  currentScore: number,
): { current: number; projected: number; delta: number } {
  const applied = applyEdit(resumeText, edit);
  if (applied === resumeText) return { current: currentScore, projected: currentScore, delta: 0 };
  const sim = calculateOverallScore(applied, jdText);
  return { current: currentScore, projected: sim.overall, delta: Math.round(sim.overall - currentScore) };
}

// ---------------------------------------------------------------------------
// Recommendation builders (one classifier per weakness)
// ---------------------------------------------------------------------------

function buildMissingRequired(m: RequirementMatch, term: string, requirementId: number): Recommendation {
  return {
    requirementId,
    kind: 'missing_required',
    importance: m.importance,
    requirementText: m.text,
    term,
    title: `Add missing required: ${term}`,
    why: `${m.text} This is a required requirement with no evidence in your resume.`,
    action: `Add "${term}" to your Skills section and back it with a role bullet showing real usage. Add this only if you genuinely have this experience.`,
    suggested: term,
    edit: { kind: 'append-skills', term },
    requiresNewInfo: false,
    doNotAdd: false,
    scoreImpact: null,
  };
}

function buildMissingEvidence(m: RequirementMatch, requirementId: number): Recommendation {
  let action = 'Add concrete evidence of this requirement to your experience section.';
  if (m.type === 'certification' || m.type === 'license') {
    action = 'If you hold this credential, list it explicitly in a Certifications section — the engine only credits explicit license or certification evidence.';
  } else if (m.type === 'education') {
    action = 'Add the exact degree or credential to your Education section.';
  }
  return {
    requirementId,
    kind: 'missing_evidence',
    importance: m.importance,
    requirementText: m.text,
    term: '',
    title: `Missing requirement: ${m.text}`,
    why: `${m.text} This requirement is not met, and a bare keyword would not earn credit for it.`,
    action,
    suggested: null,
    edit: null,
    requiresNewInfo: true,
    doNotAdd: true,
    scoreImpact: null,
  };
}

function buildSkillNotEvidenced(m: RequirementMatch, term: string, requirementId: number): Recommendation {
  return {
    requirementId,
    kind: 'skill_not_evidenced',
    importance: m.importance,
    requirementText: m.text,
    term,
    title: `${term} is listed but not evidenced`,
    why: `${term} appears in your resume but only as a keyword — no role bullet shows real usage, so the engine treats it as a partial match.`,
    action: `Add a summary line naming ${term} and back it with a role bullet showing real usage.`,
    suggested: m.text,
    edit: { kind: 'surface-summary', summaryLine: m.text },
    requiresNewInfo: false,
    doNotAdd: false,
    scoreImpact: null,
  };
}

function buildPartialRequirement(
  m: RequirementMatch,
  term: string,
  bullet: string,
  requirementId: number,
): Recommendation {
  const replacement = `${bullet} — ${term}`;
  return {
    requirementId,
    kind: 'partial_requirement',
    importance: m.importance,
    requirementText: m.text,
    term,
    title: `Partial match: ${term}`,
    why: `The job asks for ${term}. You show related work, but ${term} itself does not appear in a role bullet.`,
    action: `Add "${term}" to the matching role bullet where truthful: "${replacement}"`,
    suggested: replacement,
    edit: { kind: 'replace-bullet', original: bullet, replacement },
    requiresNewInfo: true,
    doNotAdd: false,
    scoreImpact: null,
  };
}

function buildRecencyStale(m: RequirementMatch, term: string, latest: number, requirementId: number): Recommendation {
  return {
    requirementId,
    kind: 'recency_stale',
    importance: m.importance,
    requirementText: m.text,
    term,
    title: `${term} evidence is dated`,
    why: `The job asks for recent or current ${term}, but your most recent ${term} work is from ${latest}.`,
    action: `Add a bullet from the last two years showing current ${term} usage, or refresh your summary.`,
    suggested: null,
    edit: null,
    requiresNewInfo: true,
    doNotAdd: true,
    scoreImpact: null,
  };
}

function buildSkillYearsGap(m: RequirementMatch, term: string, requirementId: number): Recommendation {
  return {
    requirementId,
    kind: 'skill_years_gap',
    importance: m.importance,
    requirementText: m.text,
    term,
    title: `${term || 'Experience'} years gap`,
    why: `${m.text} Your resume does not show enough ${term || 'relevant'} experience for this requirement.`,
    action: 'Add concrete evidence of this requirement to your experience section.',
    suggested: null,
    edit: null,
    requiresNewInfo: true,
    doNotAdd: true,
    scoreImpact: null,
  };
}

function buildMultiConcept(m: RequirementMatch, term: string, requirementId: number): Recommendation {
  return {
    requirementId,
    kind: 'multi_concept',
    importance: m.importance,
    requirementText: m.text,
    term,
    title: `Related experience only: ${m.text}`,
    why: `You demonstrate related experience, but this requirement is only partially matched.`,
    action: `Mirror the exact phrase "${m.text}" where truthful, backed by a role bullet.`,
    suggested: null,
    edit: null,
    requiresNewInfo: true,
    doNotAdd: false,
    scoreImpact: null,
  };
}

function buildMissingMetrics(
  m: RequirementMatch,
  term: string,
  bullet: string,
  category: string,
  resumeText: string,
  requirementId: number,
): Recommendation {
  const metric = findMetricPhrase(resumeText, bullet);
  const base = {
    requirementId,
    kind: 'missing_metrics' as const,
    importance: m.importance,
    requirementText: m.text,
    term,
    title: `Add a metric to ${term || 'your'} bullet`,
    why: `Your bullet "${bullet}" evidences ${term || 'this requirement'} but has no quantified result.`,
    doNotAdd: false,
  };
  if (metric) {
    const replacement = rewriteBullet(bullet, category, metric);
    return {
      ...base,
      action: `Add a metric. Based on your resume, you can reuse: "${metric}".`,
      suggested: replacement,
      edit: { kind: 'replace-bullet', original: bullet, replacement },
      requiresNewInfo: false,
      scoreImpact: null,
    };
  }
  const replacement = rewriteBullet(bullet, category, IMPACT_PLACEHOLDER);
  return {
    ...base,
    action: `Add a quantified result — e.g. 25% faster, 1M+ users, or $50k saved. We can't invent one for you.`,
    suggested: replacement,
    edit: null,
    requiresNewInfo: true,
    scoreImpact: null,
  };
}

function buildUnclearStrongEvidence(m: RequirementMatch, term: string, bullet: string, requirementId: number): Recommendation {
  return {
    requirementId,
    kind: 'unclear_strong_evidence',
    importance: m.importance,
    requirementText: m.text,
    term,
    title: `Tighten ${term || 'your'} bullet`,
    why: `Your bullet evidencing ${term || 'this requirement'} is ${bullet.length} characters — too long to scan.`,
    action: 'Split it into a focused bullet that leads with the outcome and includes a metric.',
    suggested: null,
    edit: null,
    requiresNewInfo: true,
    doNotAdd: false,
    scoreImpact: null,
  };
}

function buildWeakEvidence(m: RequirementMatch, term: string, bullet: string, category: string, requirementId: number): Recommendation {
  const replacement = rewriteBullet(bullet, category, '');
  return {
    requirementId,
    kind: 'weak_evidence',
    importance: m.importance,
    requirementText: m.text,
    term,
    title: `Open ${term || 'your'} bullet with an action verb`,
    why: `Your bullet "${bullet}" starts with a weak word, which reads as passive.`,
    action: 'Use the suggested rewrite, or open with a strong action verb.',
    suggested: replacement,
    edit: { kind: 'replace-bullet', original: bullet, replacement },
    requiresNewInfo: false,
    doNotAdd: false,
    scoreImpact: null,
  };
}

function buildBuriedOlderRole(m: RequirementMatch, term: string, bullet: string, latest: number, requirementId: number): Recommendation {
  return {
    requirementId,
    kind: 'buried_older_role',
    importance: m.importance,
    requirementText: m.text,
    term,
    title: `${term} evidence is from an older role`,
    why: `Your most recent ${term} work is dated ${latest}, older than two years. Recency affects the match.`,
    action: `Surface ${term} in your summary and add a recent bullet if you still use it.`,
    suggested: bullet,
    edit: { kind: 'surface-summary', summaryLine: bullet },
    requiresNewInfo: false,
    doNotAdd: false,
    scoreImpact: null,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface BuildResult {
  recommendations: Recommendation[];
  currentScore: number;
}

const KIND_RANK: Record<RecommendationKind, number> = {
  missing_required: 0,
  skill_not_evidenced: 1,
  partial_requirement: 2,
  buried_older_role: 3,
  weak_evidence: 4,
  unclear_strong_evidence: 4,
  missing_metrics: 4,
  missing_evidence: 5,
  recency_stale: 5,
  skill_years_gap: 5,
  multi_concept: 5,
};

const IMPORTANCE_RANK: Record<string, number> = {
  REQUIRED: 0,
  PREFERRED: 1,
  NICE_TO_HAVE: 2,
};

export function buildRecommendations(resumeText: string, jdText: string): BuildResult {
  const base = calculateOverallScore(resumeText, jdText);
  const currentScore = base.overall;
  const analysis = analyzeMatch(resumeText, jdText);
  const profile = buildResumeProfile(resumeText);
  const now = new Date().getFullYear();

  const recommendations: Recommendation[] = [];
  const seen = new Set<string>();
  let requirementId = 0;

  for (const m of analysis.requirementMatches) {
    if (m.importance === 'RESPONSIBILITY' || m.importance === 'CONTEXT') continue;
    const key = `${m.importance}::${m.text}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const term = primaryConcept(m);
    const category = term ? conceptCategory(term) : 'other';

    // --- MISSING / CONFLICT: the requirement has no evidence at all. ---
    if (m.level === 'MISSING' || m.level === 'CONFLICT') {
      if (KEYWORD_CREDIT_TYPES.has(m.type) && term) {
        recommendations.push(buildMissingRequired(m, term, requirementId++));
      } else {
        recommendations.push(buildMissingEvidence(m, requirementId++));
      }
      continue;
    }

    // --- PARTIAL / RELATED: some signal, not enough for full credit. ---
    if (m.level === 'PARTIAL' || m.level === 'RELATED') {
      if (m.type === 'skill_years' || m.type === 'years') {
        recommendations.push(buildSkillYearsGap(m, term, requirementId++));
        continue;
      }
      const latest = term ? (profile.conceptLatestYear.get(term) || 0) : 0;
      if (RECENCY_FLAG.test(m.text) && latest > 0 && latest < now - 2) {
        recommendations.push(buildRecencyStale(m, term, latest, requirementId++));
        continue;
      }
      const listedButNotEvidenced =
        term &&
        profile.concepts.has(term) &&
        !profile.evidenceConcepts.has(term);
      if (KEYWORD_CREDIT_TYPES.has(m.type) && listedButNotEvidenced) {
        recommendations.push(buildSkillNotEvidenced(m, term, requirementId++));
        continue;
      }
      if (term && !profile.concepts.has(term)) {
        const bullet = m.evidence || bulletForTerm(term, profile);
        if (bullet) {
          recommendations.push(buildPartialRequirement(m, term, bullet, requirementId++));
        } else {
          recommendations.push(buildMultiConcept(m, term, requirementId++));
        }
      } else {
        recommendations.push(buildMultiConcept(m, term, requirementId++));
      }
      continue;
    }

    // --- EXACT / EQUIVALENT: matched, but the evidencing bullet may be weak. ---
    const bullet = bulletForTerm(term, profile) || m.evidence;
    if (!bullet) continue;
    if (!/\d/.test(bullet)) {
      recommendations.push(buildMissingMetrics(m, term, bullet, category, resumeText, requirementId++));
      continue;
    }
    if (bullet.length > 150) {
      recommendations.push(buildUnclearStrongEvidence(m, term, bullet, requirementId++));
      continue;
    }
    if (!bulletStartsStrong(bullet)) {
      recommendations.push(buildWeakEvidence(m, term, bullet, category, requirementId++));
      continue;
    }
    const latest = term ? (profile.conceptLatestYear.get(term) || 0) : 0;
    if (term && latest > 0 && latest < now - 2) {
      recommendations.push(buildBuriedOlderRole(m, term, bullet, latest, requirementId++));
      continue;
    }
    // Already strong + recent evidence — no recommendation.
  }

  recommendations.sort((a, b) => {
    const imp = (IMPORTANCE_RANK[a.importance] ?? 9) - (IMPORTANCE_RANK[b.importance] ?? 9);
    if (imp !== 0) return imp;
    const kind = KIND_RANK[a.kind] - KIND_RANK[b.kind];
    if (kind !== 0) return kind;
    return a.requirementId - b.requirementId;
  });

  const top = recommendations.slice(0, 8);

  // Lazy score projection — only for edits that can be applied without new
  // information and contain no placeholder that would need a user-supplied number.
  for (const rec of top) {
    if (rec.edit && !rec.doNotAdd && !(rec.suggested || '').includes('[')) {
      rec.scoreImpact = computeImpact(resumeText, jdText, rec.edit, currentScore);
    }
  }

  return { recommendations: top, currentScore };
}

// Re-exported for tests.
export { unsupportedTokens, rewriteBullet, findMetricPhrase, findConceptsInText, conceptFamily };
