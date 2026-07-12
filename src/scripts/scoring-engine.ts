export const ACTIVE_VERBS = [
  'accelerated', 'achieved', 'acquired', 'adapted', 'addressed', 'administered', 'advised',
  'advocated', 'aligned', 'allocated', 'analyzed', 'answered', 'anticipated', 'applied',
  'appointed', 'appraised', 'approved', 'arbitrated', 'architected', 'arranged', 'ascertained',
  'assembled', 'assessed', 'assigned', 'assisted', 'attained', 'audited', 'authored',
  'authorized', 'automated', 'awarded', 'balanced', 'budgeted', 'built', 'calculated',
  'captured', 'cataloged', 'categorized', 'centralized', 'chaired', 'championed', 'charted',
  'clarified', 'classified', 'coached', 'collaborated', 'collected', 'commissioned',
  'committed', 'communicated', 'compared', 'compiled', 'completed', 'composed', 'computed',
  'conceived', 'conceptualized', 'conducted', 'configured', 'conserved', 'consolidated',
  'constructed', 'consulted', 'contracted', 'contributed', 'controlled', 'converted',
  'convinced', 'coordinated', 'corrected', 'counseled', 'crafted', 'created', 'critiqued',
  'cultivated', 'customized', 'decentralized', 'decided', 'defined', 'delegated', 'delivered',
  'demonstrated', 'designed', 'detected', 'determined', 'developed', 'devised', 'diagnosed',
  'directed', 'discerned', 'discovered', 'dispatched', 'displayed', 'distributed',
  'documented', 'drafted', 'earned', 'edited', 'educated', 'effected', 'elected',
  'eliminated', 'emphasized', 'enabled', 'enacted', 'encouraged', 'engineered', 'enhanced',
  'enlisted', 'ensured', 'established', 'estimated', 'evaluated', 'examined', 'executed',
  'expanded', 'expedited', 'experimented', 'explained', 'explored', 'expressed', 'extended',
  'fabricated', 'facilitated', 'familiarized', 'fashioned', 'forecasted', 'formulated',
  'fostered', 'found', 'founded', 'framed', 'fulfilled', 'funded', 'gathered', 'generated',
  'governed', 'graduated', 'guided', 'handled', 'headed', 'helped', 'identified', 'illustrated',
  'implemented', 'improved', 'improvised', 'incorporated', 'increased', 'indexed', 'induced',
  'influenced', 'informed', 'initiated', 'innovated', 'inspected', 'inspired', 'installed',
  'instructed', 'insured', 'integrated', 'intensified', 'interpreted', 'intervened',
  'introduced', 'invented', 'inventoried', 'investigated', 'invested', 'involved', 'issued',
  'joined', 'judged', 'justified', 'kept', 'launched', 'lectured', 'led', 'licensed',
  'located', 'loged', 'maintained', 'managed', 'mapped', 'marketed', 'mastered', 'maximized',
  'measured', 'mediated', 'mentored', 'merged', 'met', 'minimized', 'modeled', 'moderated',
  'modernized', 'monitored', 'motivated', 'navigated', 'negotiated', 'nominated', 'normalized',
  'observed', 'obtained', 'opened', 'operated', 'optimized', 'orchestrated', 'ordered',
  'organized', 'originated', 'outlined', 'overcame', 'overhauled', 'oversaw', 'participated',
  'partnered', 'performed', 'persuaded', 'phased', 'piloted', 'pinpointed', 'pioneered',
  'placed', 'planned', 'polished', 'positioned', 'predicted', 'prepared', 'prescribed',
  'presented', 'presided', 'prevented', 'priced', 'printed', 'prioritized', 'produced',
  'programmed', 'projected', 'promoted', 'proofread', 'proposed', 'protected', 'proved',
  'provided', 'published', 'purchased', 'qualified', 'quantified', 'questioned', 'raised',
  'ran', 'rated', 'reached', 'reclaimed', 'recommend', 'reconciled', 'recorded', 'recovered',
  'recruited', 'redesigned', 'reduced', 'referred', 'refinanced', 'refocused', 'regulated',
  'rehabilitated', 'reinforced', 'reinvested', 'rejected', 'related', 'remanufactured',
  'remedied', 'remodeled', 'renegotiated', 'renovated', 'reorganized', 'repaired', 'replaced',
  'reported', 'represented', 'researched', 'resolved', 'responded', 'restored', 'restructured',
  'resulted', 'retained', 'retrieved', 'revamped', 'revealed', 'reviewed', 'revised',
  'revitalized', 'rewarded', 'routed', 'safeguarded', 'saved', 'scaled', 'scheduled',
  'screened', 'secured', 'selected', 'served', 'serviced', 'setup', 'settled', 'shaped',
  'shared', 'showed', 'simplified', 'simulated', 'sketched', 'sold', 'solved', 'sourced',
  'sparked', 'spearheaded', 'specified', 'spoke', 'sponsored', 'staffed', 'standardized',
  'started', 'stimulated', 'streamlined', 'strengthened', 'structured', 'studied', 'submitted',
  'substituted', 'succeeded', 'suggested', 'summarized', 'supervised', 'supplied',
  'supported', 'surpassed', 'surveyed', 'sustained', 'synthesized', 'systematized', 'tabulated',
  'tackled', 'targeted', 'taught', 'teamed', 'tested', 'thrived', 'tightened', 'tolerated',
  'totaled', 'traced', 'tracked', 'traded', 'trained', 'transacted', 'transferred',
  'transformed', 'translated', 'transmitted', 'transported', 'traveled', 'treated', 'tripled',
  'tutored', 'uncovered', 'undertook', 'unified', 'united', 'unveiled', 'updated', 'upgraded',
  'urged', 'used', 'utilized', 'validated', 'valued', 'verified', 'visited', 'vitalized',
  'volunteered', 'weighted', 'won', 'worked', 'wrote', 'yielded'
];

export const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'through',
  'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
  'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
]);

export const GENERIC_HIRING_TERMS = new Set([
  'full', 'stack', 'role', 'roles', 'position', 'positions', 'job', 'jobs', 'title', 'titles',
  'looking', 'join', 'seeking', 'search', 'searching', 'find', 'wanted', 'hiring',
  'experienced', 'experience', 'required', 'preferred', 'qualification', 'qualifications',
  'requirement', 'requirements', 'responsibility', 'responsibilities', 'team', 'teams',
  'company', 'companies', 'organization', 'firm', 'agency', 'department', 'strong',
  'excellent', 'good', 'great', 'best', 'proven', 'track', 'record', 'ability', 'able',
  'demonstrated', 'skill', 'skills', 'knowledge', 'understanding', 'proficiency', 'proficient',
  'expertise', 'expert', 'experts', 'familiar', 'familiarity', 'senior', 'junior', 'mid',
  'level', 'levels', 'staff', 'principal', 'remote', 'hybrid', 'onsite', 'office', 'based',
  'location', 'headquartered', 'year', 'years', 'month', 'months', 'weekly', 'quarterly',
  'annual', 'minimum', 'maximum', 'least', 'plus', 'bonus', 'nice', 'candidate',
  'candidates', 'ideal', 'including', 'include', 'includes', 'multiple', 'various',
  'related', 'etc', 'well', 'back', 'end', 'cross', 'functional', 'about', 'what',
  'you', 'will', 'start', 'date', 'dates', 'now', 'urgent', 'need', 'needs', 'needed',
  'responsible', 'oversee', 'summary', 'apply', 'applicant', 'application', 'submit',
  'process', 'interview', 'offer', 'day', 'days', 'daily', 'week', 'weeks', 'help',
  'helps', 'helping', 'support', 'supports', 'supporting', 'new', 'existing', 'per',
  'within', 'across', 'must', 'should', 'collaborate', 'collaborates', 'collaborating',
  'collaboration', 'communicate', 'communicates', 'communicating', 'communication',
  'manage', 'manages', 'managing', 'management', 'lead', 'leads', 'leading', 'leader', 'leadership'
]);

export const REQUIRED_SECTIONS = ['Contact', 'Experience', 'Education', 'Skills'];

export const SECTION_PATTERNS: [string, RegExp][] = [
  ['Contact', /contact|personal info|about me|phone|email|linkedin/i],
  ['Experience', /experience|employment|work history|work experience|professional background/i],
  ['Education', /education|academic|credentials|degrees|university|college/i],
  ['Skills', /skills|core competencies|technologies|technical skills|expertise/i],
  ['Summary', /summary|profile|professional summary|objective|career objective/i],
  ['Certifications', /certifications|certificates|licenses|accreditations/i],
  ['Projects', /projects|personal projects|key projects|project experience/i],
  ['Publications', /publications|papers|research|thesis/i],
  ['Languages', /languages|language proficiency/i],
  ['Volunteering', /volunteer|volunteering|community service/i],
];

export const COMMON_SKILLS = [
  'javascript', 'python', 'java', 'react', 'node.js', 'typescript', 'sql', 'aws', 'docker',
  'git', 'agile', 'scrum', 'project management', 'leadership', 'communication', 'teamwork',
  'problem solving', 'data analysis', 'machine learning', 'api', 'rest', 'graphql', 'css',
  'html', 'mongodb', 'postgresql', 'redis', 'kubernetes', 'ci/cd', 'testing', 'debugging',
  'excel', 'powerpoint', 'word', 'photoshop', 'figma', 'seo', 'marketing', 'sales',
  'customer service', 'negotiation', 'public speaking', 'writing', 'editing', 'research',
  'strategy', 'analytics', 'reporting', 'budgeting', 'scheduling', 'product management',
  'ui/ux', 'design', 'architecture', 'devops', 'linux', 'bash', 'tensorflow', 'pytorch',
  'django', 'flask', 'express', 'next.js', 'vue', 'angular', 'sass', 'less', 'webpack',
  'babel', 'jest', 'cypress', 'selenium', 'jira', 'confluence', 'slack', 'tableau',
  'power bi', 'looker', 'airflow', 'kafka', 'rabbitmq', 'nginx', 'terraform', 'ansible',
  'prometheus', 'grafana', 'elasticsearch', 'logstash', 'c++', 'c#', 'go', 'rust', 'swift',
  'kotlin', 'ruby', 'php', 'scala', 'r', 'matlab', 'blockchain', 'solidity', 'web3',
  'ai', 'nlp', 'computer vision', 'deep learning', 'statistics', 'probability',
  'feature engineering', 'data pipeline', 'etl', 'data warehouse', 'spark', 'hadoop',
  'snowflake', 'bigquery', 'redshift', 'databricks', 'notion', 'asana', 'trello',
  'sharepoint', 'content creation', 'copywriting', 'proofreading', 'translation',
  'accessibility', 'responsive design', 'cross-functional', 'stakeholder management',
  'vendor management', 'operations', 'quality assurance', 'continuous improvement',
  'financial analysis', 'financial modeling', 'accounting', 'compliance', 'risk management',
  'gdpr', 'hipaa', 'pci', 'soc 2', 'iso 27001', 'recruiting', 'hiring', 'onboarding',
  'performance management', 'employee engagement', 'diversity', 'inclusion',
  'compensation', 'benefits', 'payroll', 'hr', 'human resources', 'employment law',
  'remote work', 'hybrid', 'b2b', 'b2c', 'saas', 'paas', 'iaas', 'serverless',
  'microservices', 'event-driven', 'domain driven design', 'tdd', 'bdd',
  'code review', 'refactoring', 'technical debt', 'data governance', 'data quality',
  'data modeling', 'data architecture', 'data engineering', 'data science',
  'business intelligence', 'dashboard', 'visualization', 'reporting', 'kpis',
  'okrs', 'strategic planning', 'business development', 'partnerships', 'client relations',
  'account management', 'salesforce', 'hubspot', 'zendesk', 'intercom', 'stripe',
  'paypal', 'shopify', 'woocommerce', 'wordpress', 'square space', 'wix',
  'google analytics', 'google ads', 'facebook ads', 'linkedin ads', 'email marketing',
  'mailchimp', 'constant contact', 'active campaign', 'hubspot marketing', 'marketo',
  'lead generation', 'conversion optimization', 'crm', 'erp', 'scm', 'hris', 'lms',
  'api integration', 'rest api', 'graphql api', 'webhook', 'oauth', 'jwt', 'saml',
  'sso', 'ldap', 'active directory', 'firewall', 'vpn', 'vpc', 'cdn', 'dns', 'ssl',
  'tls', 'ssh', 'ftp', 'http', 'https', 'tcp/ip', 'udp', 'websocket', 'webrtc',
  'oauth2', 'openid', 'saml2', 'activemq', 'sqs', 'sns', 'eventbridge', 'kinesis',
  'dynamodb', 'cassandra', 'neo4j', 'mariadb', 'oracle', 'mssql', 'sqlite', 's3',
  'gcs', 'blob storage', 'ec2', 'ecs', 'eks', 'fargate', 'lambda', 'cloudformation',
  'cloudwatch', 'iam', 'route 53', 'cloudfront', 'apigateway', 'sqs', 'sns',
  'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean', 'firebase', 'netlify',
  'vercel', 'docker compose', 'helm', 'jenkins', 'github actions', 'gitlab ci',
  'bitbucket pipelines', 'circleci', 'travis ci', 'sonararqube', 'sentry', 'datadog',
  'new relic', 'splunk', 'elk stack', 'loggly', 'graylog', 'owasp', 'penetration testing',
  'vulnerability scanning', 'encryption', 'cryptography', 'network security',
  'identity access management', 'security auditing', 'disaster recovery',
  'business continuity', 'incident response', 'forensics', 'malware analysis',
  'threat modeling', 'penetration testing', 'ethical hacking', 'bug bounty',
  'devsecops', 'cloud security', 'application security', 'information security',
  'cybersecurity', 'governance risk compliance', 'grc', 'audit', 'auditing'
];

export function extractWords(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s+#./-]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

export function extractKeywords(text: string): Set<string> {
  return new Set(extractWords(text).filter(w => !GENERIC_HIRING_TERMS.has(w)));
}

export function extractPhrases(text: string, maxLen = 3): string[] {
  const words = extractWords(text).filter(w => !GENERIC_HIRING_TERMS.has(w));
  const phrases: string[] = [];
  for (let i = 0; i < words.length; i++) {
    for (let len = 2; len <= maxLen; len++) {
      if (i + len <= words.length) phrases.push(words.slice(i, i + len).join(' '));
    }
  }
  return [...new Set(phrases)];
}

export function findSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return COMMON_SKILLS.filter(s => new RegExp('\\b' + s.replace(/[.+/-]/g, '\\$&') + '\\b', 'i').test(lower));
}

export function detectSections(text: string): { name: string; found: boolean; required: boolean }[] {
  const lower = text.toLowerCase();
  return SECTION_PATTERNS.map(([name, pattern]) => ({
    name,
    found: pattern.test(lower),
    required: REQUIRED_SECTIONS.includes(name),
  }));
}

export function extractBullets(text: string): string[] {
  return text.split('\n')
    .map(l => l.trim())
    .filter(l => (l.length > 10 && /^[-•*‣⁃–—>]\s/.test(l)) || (l.length > 10 && /^\d+[.)]\s/.test(l)));
}

export function analyzeBulletQuality(bullets: string[]): {
  total: number;
  actionVerbs: number;
  quantified: number;
  details: { text: string; hasAction: boolean; hasQuantified: boolean; suggestedVerb?: string }[];
} {
  const details = bullets.map(b => {
    const firstWord = b.replace(/^[-•*‣⁃–—>\d.)\s]+/, '').split(' ')[0]?.toLowerCase() || '';
    const hasAction = ACTIVE_VERBS.includes(firstWord);
    const hasQuantified = /\d+/.test(b);
    let suggestedVerb: string | undefined;
    if (!hasAction && firstWord.length > 0) {
      const firstLetter = firstWord[0];
      const candidates = ACTIVE_VERBS.filter(v => v.startsWith(firstLetter));
      if (candidates.length > 0) suggestedVerb = candidates[Math.floor(Math.random() * candidates.length)];
    }
    return { text: b, hasAction, hasQuantified, suggestedVerb };
  });

  return {
    total: bullets.length,
    actionVerbs: details.filter(d => d.hasAction).length,
    quantified: details.filter(d => d.hasQuantified).length,
    details
  };
}

export function extractYearsOfExperience(text: string): number {
  const regexes = [
    /(\d+)\s*\+?\s*years?\b/i,
    /(\d+)\s*\+?\s*yrs?\b/i,
    /(\d+)\s*\+?\s*year\s+of\s+experience/i
  ];
  for (const reg of regexes) {
    const m = text.match(reg);
    if (m) {
      const val = parseInt(m[1], 10);
      if (val > 0 && val < 30) return val;
    }
  }
  return 0;
}

export function estimateResumeYears(text: string): number {
  const yearRangeRegex = /\b(19\d\d|20\d\d)\s*[-–—]\s*(19\d\d|20\d\d|present|current|now)\b/ig;
  let totalMonths = 0;
  const matches = [...text.matchAll(yearRangeRegex)];
  
  if (matches.length > 0) {
    matches.forEach(m => {
      const start = parseInt(m[1], 10);
      let end = new Date().getFullYear();
      const secondPart = m[2].toLowerCase();
      if (secondPart === 'present' || secondPart === 'current' || secondPart === 'now') {
        end = new Date().getFullYear();
      } else {
        end = parseInt(m[2], 10);
      }
      const diff = Math.max(0, end - start);
      totalMonths += diff * 12;
    });
    return Math.round(totalMonths / 12);
  }
  
  const yearsRegex = /(\d+)\s*\+?\s*years?\s+experience/i;
  const match = text.match(yearsRegex);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

export function calculateConfidence(resumeWords: number, matchedSignals: number): { level: string; color: string; reason: string } {
  if (resumeWords < 150 || matchedSignals < 8) {
    return {
      level: 'Low',
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-800/40',
      reason: `Short resume (${resumeWords} words) and minimal matches (${matchedSignals} signals) limit score reliability.`
    };
  }
  if (resumeWords >= 300 && resumeWords <= 1000 && matchedSignals >= 25) {
    return {
      level: 'High',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800/40',
      reason: `Detailed resume content (${resumeWords} words) and strong signal match (${matchedSignals} terms) ensure high accuracy.`
    };
  }
  return {
    level: 'Medium',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800/40',
    reason: `Moderate content length (${resumeWords} words) and keyword presence (${matchedSignals} signals).`
  };
}

export function gradeScore(score: number): { letter: string; label: string; color: string } {
  if (score >= 90) return { letter: 'A+', label: 'Excellent', color: 'var(--rc-primary)' };
  if (score >= 80) return { letter: 'A', label: 'Strong', color: 'var(--rc-primary)' };
  if (score >= 70) return { letter: 'B+', label: 'Good', color: 'var(--rc-primary)' };
  if (score >= 60) return { letter: 'B', label: 'Decent', color: 'var(--rc-primary)' };
  if (score >= 50) return { letter: 'C+', label: 'Fair', color: 'var(--rc-warning)' };
  if (score >= 40) return { letter: 'C', label: 'Below Avg', color: 'var(--rc-warning)' };
  if (score >= 30) return { letter: 'D', label: 'Needs Work', color: 'var(--rc-error)' };
  return { letter: 'F', label: 'Major Gaps', color: 'var(--rc-error)' };
}

export interface AnalysisResult {
  overall: number;
  grade: { letter: string; label: string; color: string };
  scoreKeyword: number;
  scoreSkills: number;
  scoreContent: number;
  scoreSections: number;
  scoreBullets: number;
  scoreFormat: number;
  scoreExperience: number;
  matchedWords: Set<string>;
  missingWords: Set<string>;
  matchedPhrases: string[];
  missingPhrases: string[];
  matchedSkills: string[];
  missingSkills: string[];
  keywordDensity: { keyword: string; count: number; present: boolean }[];
  sections: { name: string; found: boolean; required: boolean }[];
  bulletQuality: any;
  tips: any[];
  resumeWords: number;
  jdWords: number;
  sectionScores: any;
  redFlags: any[];
  formatFlags: string[];
}

export function calculateOverallScore(resumeText: string, jdText: string): AnalysisResult {
  const resume = resumeText.trim();
  const jd = jdText.trim();

  const resumeWords = extractWords(resume);
  const jdWords = extractWords(jd);
  const resumeKeywords = extractKeywords(resume);
  const jdKeywords = extractKeywords(jd);
  const resumePhrases = extractPhrases(resume);
  const jdPhrases = extractPhrases(jd);
  
  // Required vs Preferred skills parsing
  const jdLines = jdText.split('\n');
  let currentZone: 'required' | 'preferred' = 'required';
  const requiredJdSkills: string[] = [];
  const preferredJdSkills: string[] = [];
  
  // Treat skills under: Preferred, Nice to Have, Bonus, Good to Have as preferred.
  // Treat skills under: Requirements, Must Have, Qualifications, Required Skills as required.
  // If the JD does not explicitly separate them, default is required.
  const hasPreferredKeywords = /\b(preferred|nice to have|bonus|good to have)\b/i.test(jdText);

  jdLines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    if (hasPreferredKeywords) {
      if (/\b(preferred|nice to have|bonus|good to have)\b/i.test(lowerLine)) {
        currentZone = 'preferred';
      } else if (/\b(requirements|must have|qualifications|required skills|essential)\b/i.test(lowerLine)) {
        currentZone = 'required';
      }
    } else {
      currentZone = 'required';
    }
    
    const skillsInLine = COMMON_SKILLS.filter(s => new RegExp('\\b' + s.replace(/[.+/-]/g, '\\$&') + '\\b', 'i').test(lowerLine));
    skillsInLine.forEach(skill => {
      if (currentZone === 'preferred') {
        if (!preferredJdSkills.includes(skill)) preferredJdSkills.push(skill);
      } else {
        if (!requiredJdSkills.includes(skill)) {
          requiredJdSkills.push(skill);
          const idx = preferredJdSkills.indexOf(skill);
          if (idx !== -1) preferredJdSkills.splice(idx, 1);
        }
      }
    });
  });

  const jdSkills = [...new Set([...requiredJdSkills, ...preferredJdSkills])];
  const resumeSkills = findSkills(resume);
  const matchedSkills = jdSkills.filter(s => resumeSkills.includes(s));
  const missingSkills = jdSkills.filter(s => !resumeSkills.includes(s));
  
  const sections = detectSections(resume);
  const sectionsMap = new Map(sections.map(s => [s.name, s.found]));
  const bullets = extractBullets(resume);
  const bulletQuality = analyzeBulletQuality(bullets);

  const matchedWords = new Set<string>();
  const missingWords = new Set<string>();
  for (const kw of jdKeywords) {
    if (resumeKeywords.has(kw)) matchedWords.add(kw);
    else missingWords.add(kw);
  }

  // Experience recency bonus mapping
  const resumeLines = resumeText.split('\n');
  const skillRecencyMap = new Map<string, number>();
  let currentLineYear = 2023; // default baseline
  resumeLines.forEach(line => {
    const yearMatch = line.match(/\b(20\d\d)\b/);
    if (yearMatch) {
      currentLineYear = parseInt(yearMatch[1], 10);
    } else if (/\b(present|current|now)\b/i.test(line)) {
      currentLineYear = new Date().getFullYear();
    }
    
    const skillsInLine = COMMON_SKILLS.filter(s => new RegExp('\\b' + s.replace(/[.+/-]/g, '\\$&') + '\\b', 'i').test(line.toLowerCase()));
    skillsInLine.forEach(skill => {
      const isRecent = currentLineYear >= 2024;
      const multiplier = isRecent ? 1.3 : 1.0;
      const existing = skillRecencyMap.get(skill) || 1.1;
      skillRecencyMap.set(skill, Math.max(existing, multiplier));
    });
  });

  // 1. Required vs Preferred skills weighted rate + Recency bonus
  let matchedSkillsWeight = 0;
  let totalSkillsWeight = 0;
  
  requiredJdSkills.forEach(s => {
    const recencyBonus = skillRecencyMap.get(s) || 1.1;
    totalSkillsWeight += 2 * 1.3;
    if (resumeSkills.includes(s)) {
      matchedSkillsWeight += 2 * recencyBonus;
    }
  });
  
  preferredJdSkills.forEach(s => {
    const recencyBonus = skillRecencyMap.get(s) || 1.1;
    totalSkillsWeight += 1 * 1.3;
    if (resumeSkills.includes(s)) {
      matchedSkillsWeight += 1 * recencyBonus;
    }
  });

  const baseJdSkillsCount = Math.max(jdSkills.length, 8);
  const skillsRate = baseJdSkillsCount > 0 
    ? (totalSkillsWeight > 0 ? (matchedSkillsWeight / totalSkillsWeight) * (jdSkills.length / baseJdSkillsCount) : 0.5)
    : 0.5;

  // 2. Phrase matching over single words (weighted match rate)
  let matchedPhrasesWeight = 0;
  let totalPhrasesWeight = 0;
  const matchedPhrases: string[] = [];
  const missingPhrases: string[] = [];
  
  jdPhrases.forEach(phrase => {
    const wordsCount = phrase.split(' ').length;
    const weight = wordsCount === 3 ? 3.0 : wordsCount === 2 ? 2.0 : 1.0;
    totalPhrasesWeight += weight;
    
    const isMatched = resumePhrases.some(rp => rp === phrase || rp.includes(phrase));
    if (isMatched) {
      matchedPhrasesWeight += weight;
      matchedPhrases.push(phrase);
    } else {
      missingPhrases.push(phrase);
    }
  });

  const baseJdPhrasesCount = Math.max(jdPhrases.length, 6);
  const phraseMatchRate = baseJdPhrasesCount > 0 
    ? (totalPhrasesWeight > 0 ? (matchedPhrasesWeight / totalPhrasesWeight) * (jdPhrases.length / baseJdPhrasesCount) : 0)
    : 0;

  const baseJdKeywordsCount = Math.max(jdKeywords.size, 10);
  const keywordMatchRate = baseJdKeywordsCount > 0 ? matchedWords.size / baseJdKeywordsCount : 0;

  const resumeFreq = getKeywordFrequency(resumeWords);
  const keywordDensity = jdKeywords.size > 0
    ? [...jdKeywords].map(kw => ({
      keyword: kw,
      count: resumeFreq.get(kw) || 0,
      present: matchedWords.has(kw),
    })).sort((a, b) => b.count - a.count)
    : [];

  const scoreKeyword = Math.round(keywordMatchRate * 100);
  
  // Calculate skills score, penalize missing required skills extra to have a much larger impact
  let scoreSkills = Math.round(skillsRate * 100);
  let missingRequiredCount = 0;
  requiredJdSkills.forEach(s => {
    if (!resumeSkills.includes(s)) missingRequiredCount++;
  });
  const requiredPenalty = Math.min(missingRequiredCount * 5, 25);
  scoreSkills = Math.max(0, scoreSkills - requiredPenalty);

  const scorePhrases = Math.round(phraseMatchRate * 100);

  const resumeLen = resumeWords.length;
  const idealLen = Math.min(Math.max(jdWords.length * 0.5, 150), 600);
  const lenRatio = resumeLen / idealLen;
  const scoreContent = Math.round(Math.max(0, Math.min(100,
    lenRatio >= 0.7 && lenRatio <= 1.5 ? 100 :
    lenRatio < 0.7 ? (lenRatio / 0.7) * 100 :
    100 - Math.min(40, (lenRatio - 1.5) * 40)
  )));

  const requiredFound = sections.filter(s => s.required && s.found).length;
  const scoreSections = Math.round((requiredFound / REQUIRED_SECTIONS.length) * 100);

  const bulletRate = bullets.length > 0 ? bulletQuality.actionVerbs / bullets.length : 0;
  const quantifiedRate = bullets.length > 0 ? bulletQuality.quantified / bullets.length : 0;
  const scoreBullets = bullets.length > 0
    ? Math.round((bulletRate * 0.6 + quantifiedRate * 0.4) * 100)
    : 50;

  const formatFlags: string[] = [];
  if (resume.includes('\t')) formatFlags.push('Uses tabs (convert to spaces)');
  if ((resume.match(/\|/g) || []).length > 3) formatFlags.push('Contains table characters (|) — avoid for ATS');
  if ((resume.match(/\u0000/g) || []).length > 0) formatFlags.push('Contains null characters');
  const scoreFormat = Math.round(Math.max(0, 100 - formatFlags.length * 25));

  // 4. Experience quality scoring (quantified, revenue, scale, leadership)
  let totalQualityPoints = 0;
  bullets.forEach(b => {
    const lower = b.toLowerCase();
    let pts = 0;
    if (/\d+/.test(b)) pts += 1.0;
    if (/\b(revenue|sales|profit|growth|margin|\$|income|earnings|revenue-impact)\b/i.test(lower)) pts += 1.0;
    if (/\b(scale|users|million|transactions|traffic|latency|concurrent|databases|gb|tb|scale-up|millions)\b/i.test(lower)) pts += 1.0;
    if (/\b(led|managed|directed|mentored|coordinated|guided|facilitated|squad|team|leadership|supervised|headed)\b/i.test(lower)) pts += 1.0;
    totalQualityPoints += pts;
  });
  
  const experienceQualityScore = bullets.length > 0 
    ? Math.min(totalQualityPoints / (bullets.length * 1.5), 1.0)
    : 0.5;

  // Direct skills match ratio (no more 40% perfect score threshold)
  const skillsRatio = jdSkills.length > 0 ? matchedSkills.length / jdSkills.length : 0.5;
  
  // Experience years comparison
  const requiredYears = extractYearsOfExperience(jdText);
  const candidateYears = estimateResumeYears(resumeText);
  let experienceRatio = 1.0;
  if (requiredYears > 0) {
    experienceRatio = candidateYears >= requiredYears ? 1.0 : Math.max(0.2, candidateYears / requiredYears);
  } else {
    experienceRatio = Math.min(bullets.length / 10, 1);
  }
  
  // Seniority keyword match check
  const isSeniorJD = /\b(senior|lead|principal|staff|manager|director|architect|head|vp)\b/i.test(jdText);
  const isSeniorResume = /\b(senior|lead|principal|staff|manager|director|architect|head|vp)\b/i.test(resumeText);
  let seniorityPenalty = 0;
  if (isSeniorJD && !isSeniorResume) {
    seniorityPenalty = 25;
  }

  const scoreExperience = Math.round(Math.max(0, (skillsRatio * 0.4 + experienceRatio * 0.3 + experienceQualityScore * 0.3) * 100 - seniorityPenalty));

  // 5. Capped Category Influence
  const overall = Math.round(
    scoreKeyword * 0.25 +    // Keywords cap = 40% (25% keywords + 15% phrases)
    scorePhrases * 0.15 +
    scoreSkills * 0.30 +     // Skills cap = 30%
    scoreExperience * 0.20 + // Experience cap = 20%
    (scoreSections * 0.04 + scoreFormat * 0.02 + scoreContent * 0.04) // Structure cap = 10%
  );

  const grade = gradeScore(overall);

  const tips: { priority: string; category: string; title: string; action: string; detail: string }[] = [];
  const topMissing = [...missingWords].slice(0, 5);
  const topMissingSkills = missingSkills.slice(0, 6);

  if (keywordMatchRate < 0.4) tips.push({
    priority: 'high', category: 'keywords',
    title: 'Add missing keywords to your resume',
    action: `Insert ${topMissing.length > 0 ? topMissing.join(', ') : 'relevant terms from the job description'} into your summary and experience sections.`,
    detail: `Only ${matchedWords.size} of ${jdKeywords.size} job keywords found. ATS systems rank resumes higher when they contain exact keyword matches from the description.`
  });
  if (phraseMatchRate < 0.3) tips.push({
    priority: 'high', category: 'keywords',
    title: 'Mirror job description phrases',
    action: 'Find 3-5 exact phrases from the job description and work them naturally into your experience bullets.',
    detail: 'Some ATS engines use phrase-level matching — identical phrases (not just words) score higher than synonyms.'
  });
  const missingReq = sections.filter(s => s.required && !s.found);
  if (missingReq.length > 0) tips.push({
    priority: 'high', category: 'sections',
    title: `Add ${missingReq.length === 1 ? 'a' : ''} missing ${missingReq.map(s => s.name).join(', ')} section${missingReq.length > 1 ? 's' : ''}`,
    action: `Create a "${missingReq[0].name}" section${missingReq.length > 1 ? ` and a "${missingReq[1].name}" section` : ''} with your ${missingReq.map(s => s.name.toLowerCase() === 'contact' ? 'phone, email, and LinkedIn' : s.name.toLowerCase() === 'experience' ? 'work history and achievements' : s.name.toLowerCase() === 'education' ? 'degrees, schools, and dates' : 'technical and soft skills').join(' and ')}.`,
    detail: `ATS parsers expect these standard sections. Without ${missingReq.length === 1 ? 'it' : 'them'}, your resume may not be properly indexed or categorized.`
  });
  if (bulletQuality.actionVerbs < Math.max(bullets.length * 0.5, 1)) tips.push({
    priority: 'high', category: 'content',
    title: 'Strengthen bullet point openings',
    action: `Replace weak openings like "Was responsible for" or "Helped with" with strong action verbs: Achieved, Developed, Implemented, Led, Optimized.`,
    detail: `Only ${bulletQuality.actionVerbs} of ${bullets.length} bullets start with a strong action verb. Both ATS ranking and recruiter scanning reward this pattern.`
  });
  if (bulletQuality.quantified < Math.max(bullets.length * 0.3, 1)) tips.push({
    priority: 'medium', category: 'content',
    title: 'Add metrics to your bullet points',
    action: 'Include specific numbers — percentages improved, dollar amounts saved, time reduced, team size led, or revenue generated.',
    detail: `Only ${bulletQuality.quantified} of ${bullets.length} bullets have quantified results. Metrics are one of the strongest signals for both ATS ranking and recruiter attention.`
  });
  if (missingSkills.length > 0) tips.push({
    priority: 'medium', category: 'skills',
    title: `Incorporate ${topMissingSkills.length} missing skills`,
    action: `Add ${topMissingSkills.join(', ')}${missingSkills.length > 6 ? ` and ${missingSkills.length - 6} more` : ''} to your skills section or weave them into relevant experience bullets.`,
    detail: `Employers filter candidates by required skills. ${missingSkills.length} skills from the job description are missing from your resume.`
  });
  if (resumeLen < 150) tips.push({
    priority: 'high', category: 'content',
    title: 'Expand your resume content',
    action: 'Add 2-3 more bullet points per role, include a professional summary with target keywords, and describe specific project outcomes.',
    detail: `${resumeLen} words is well below the 300-600 word sweet spot. Short resumes are often flagged as lacking sufficient experience detail.`
  });
  if (resumeLen > 800) tips.push({
    priority: 'low', category: 'content',
    title: 'Trim redundant content',
    action: 'Cut older roles (>10 years), merge short bullet points, remove outdated skills, and tighten wordy descriptions.',
    detail: `${resumeLen} words is on the longer side. Resumes over 800 words may be truncated by ATS or skimmed by busy recruiters.`
  });

  const sectionScores = {
    summary: sectionsMap.get('Summary') ? Math.round(40 + 30 * keywordMatchRate + 30 * Math.min(resumeWords.length / 600, 1)) : 0,
    experience: sectionsMap.get('Experience') ? scoreBullets : Math.round(scoreBullets * 0.5),
    skills: sectionsMap.get('Skills') ? scoreSkills : Math.round(scoreSkills * 0.5),
    projects: sectionsMap.get('Projects') ? Math.round(50 + 25 * keywordMatchRate + 25 * Math.min(bulletQuality.quantified / 5, 1)) : 0,
    education: sectionsMap.get('Education') ? Math.round(70 + 30 * keywordMatchRate) : 0,
  };

  const redFlags: { severity: string; title: string; desc: string }[] = [];
  const missingReqSections = sections.filter(s => s.required && !s.found);
  if (missingReqSections.length > 0) redFlags.push({ severity: 'critical', title: `Missing ${missingReqSections.map(s => s.name).join(', ')} section${missingReqSections.length > 1 ? 's' : ''}`, desc: 'Required sections not detected. Most ATS systems expect Contact, Experience, Education, and Skills sections.' });
  if (resumeLen < 150) redFlags.push({ severity: 'critical', title: 'Resume too short', desc: `${resumeLen} words — too little content for ATS to evaluate. Target 300–600 words.` });
  if (keywordMatchRate < 0.3) redFlags.push({ severity: 'critical', title: 'Low keyword match', desc: `Only ${matchedWords.size} of ${jdKeywords.size} job keywords found. Add relevant keywords from the job description.` });
  if (bulletQuality.actionVerbs < Math.max(bullets.length * 0.4, 1) && bullets.length > 0) redFlags.push({ severity: 'warning', title: 'Weak action verbs', desc: `Only ${bulletQuality.actionVerbs} of ${bullets.length} bullet points start with strong action verbs like "Achieved", "Developed", "Led".` });
  if (bulletQuality.quantified < Math.max(bullets.length * 0.2, 1) && bullets.length > 0) redFlags.push({ severity: 'warning', title: 'Few quantified results', desc: `${bulletQuality.quantified} of ${bullets.length} bullets include numbers. Add metrics for impact.` });
  if (resume.includes('\t')) redFlags.push({ severity: 'warning', title: 'Uses tab characters', desc: 'Tabs can cause misalignment in ATS parsers. Replace with spaces.' });
  if ((resume.match(/\|/g) || []).length > 3) redFlags.push({ severity: 'warning', title: 'Table formatting detected', desc: `${(resume.match(/\|/g) || []).length} pipe characters found. Tables may confuse ATS parsers.` });
  if (resumeLen > 800) redFlags.push({ severity: 'info', title: 'Resume on the longer side', desc: `${resumeLen} words — consider trimming to 500–600 words focused on this role.` });
  if (scoreSkills < 40) redFlags.push({ severity: 'warning', title: 'Low skill alignment', desc: 'Few of the skills in the job description appear in your resume. Tailor your skills section.' });
  if (phraseMatchRate < 0.2) redFlags.push({ severity: 'warning', title: 'No phrase-level matching', desc: 'Your resume does not mirror any exact phrases from the job description. ATS systems reward direct phrase matches.' });
  if (!sectionsMap.get('Summary')) redFlags.push({ severity: 'info', title: 'No summary section', desc: 'A professional summary helps ATS and recruiters quickly understand your profile.' });

  return {
    overall, grade, scoreKeyword, scoreSkills, scoreContent, scoreSections, scoreBullets, scoreFormat, scoreExperience,
    matchedWords, missingWords, matchedPhrases, missingPhrases, matchedSkills, missingSkills,
    keywordDensity, sections, bulletQuality, tips, resumeWords: resumeWords.length, jdWords: jdWords.length,
    sectionScores, redFlags, formatFlags
  };
}

function getKeywordFrequency(words: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return freq;
}
