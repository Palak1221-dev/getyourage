// Deterministic, profession-agnostic resume↔job-description matching engine.
//
// Design goals:
//  - Generalize across ANY job description (tech, business, healthcare, legal, education, ...).
//  - Extract the job's actual requirements (not a fixed software skill list) and classify each
//    by type + importance (REQUIRED / PREFERRED / NICE_TO_HAVE / RESPONSIBILITY / CONTEXT).
//  - Match each requirement against resume EVIDENCE (roles, bullets, certifications, dates)
//    using explicit match levels, then derive ONE deterministic Job Match score.
//  - Keep ATS parseability (structure, format, bullets) as a SEPARATE score so the two metrics
//    are never conflated.
//  - Be honest about ghost-job risk: only strong signals raise risk; otherwise say
//    "insufficient evidence".
//
// Everything is pure text logic (no DOM, no network). Safe to run under Node's
// --experimental-strip-types for unit testing, and in the browser for the client.

export type ConceptCategory =
  | 'programming-language' | 'framework' | 'library' | 'database' | 'tool'
  | 'platform' | 'cloud' | 'devops' | 'methodology' | 'data' | 'ai-ml'
  | 'security' | 'business' | 'finance' | 'marketing' | 'sales' | 'operations'
  | 'hr' | 'management' | 'leadership' | 'soft-skill' | 'design' | 'healthcare'
  | 'legal' | 'compliance' | 'education' | 'certification' | 'domain'
  | 'communication' | 'language' | 'other';

export type Importance = 'REQUIRED' | 'PREFERRED' | 'NICE_TO_HAVE' | 'RESPONSIBILITY' | 'CONTEXT';
export type MatchLevel = 'EXACT' | 'EQUIVALENT' | 'PARTIAL' | 'RELATED' | 'MISSING' | 'CONFLICT';

export interface Concept {
  term: string;
  category: ConceptCategory;
  family?: string;
  aliases: string[];
}

export interface Requirement {
  id: number;
  text: string;
  type: string;
  importance: Importance;
  concepts: string[];
  yearsRequired?: number;
  seniority?: string;
  educationLevel?: string;
  educationField?: string;
  certification?: string;
  license?: string;
  location?: string;
  workAuthorization?: string;
  // For a generic years requirement ("N+ years of experience"), the domain
  // qualifier ("in corporate finance", "product design experience"). EXACT still
  // requires the resume to actually be in that domain, not just have N years
  // of unrelated work.
  yearsDomain?: string;
  // Extraction audit trail — why this requirement is the type it is.
  parsedNote?: string;
}

export interface RequirementMatch extends Requirement {
  level: MatchLevel;
  matchStrength: number;
  evidence: string;
  gap: boolean;
}

export interface RoleEvidence {
  title: string;
  concepts: string[];
  bullets: string[];
  startYear?: number;
  endYear?: number;
}

export interface ResumeProfile {
  concepts: Set<string>;
  conceptCategory: Map<string, ConceptCategory>;
  roles: RoleEvidence[];
  years: number;
  // Per-concept career years + most-recent evidence year, derived from each role's
  // date range. "5+ years of experience with React" must be judged on React years,
  // not total career length, and "recent React" on when that React work happened.
  conceptYears: Map<string, number>;
  conceptLatestYear: Map<string, number>;
  certifications: Set<string>;
  // Credentials stated in an explicit license/credential context (e.g. a
  // "RN license", "CPA", "Series 7" line in Education or Certifications).
  // Distinct from bare `certifications` so an unrelated skill can never
  // satisfy a license-gated requirement.
  licenses: Set<string>;
  seniority: Set<string>;
  educationLevel?: string;
  educationField?: string;
  allText: string;
  evidenceConcepts: Set<string>;
}

// ---------------------------------------------------------------------------
// Importance weighting model
// ---------------------------------------------------------------------------

export const IMPORTANCE_WEIGHTS: Record<Importance, number> = {
  REQUIRED: 1.0,
  PREFERRED: 0.6,
  NICE_TO_HAVE: 0.35,
  RESPONSIBILITY: 0.5,
  CONTEXT: 0,
};

// When a requirement is missing, it still contributes this floor so that
// REQUIRED gaps hurt, PREFERRED gaps hurt less, and RESPONSIBILITY gaps are neutral.
export const MISSING_FLOORS: Record<Importance, number> = {
  REQUIRED: 0,
  PREFERRED: 0.25,
  NICE_TO_HAVE: 0.5,
  RESPONSIBILITY: 0.5,
  CONTEXT: 0,
};

// Hard ceiling on Job Match when a REQUIRED license or certification is missing.
// Even a resume matching every other keyword of a "CPA required" posting is never
// an Excellent candidate without the credential.
export const LICENSE_GAP_CAP = 70;

export const MATCH_STRENGTH: Record<MatchLevel, number> = {
  EXACT: 1,
  EQUIVALENT: 1,
  PARTIAL: 0.6,
  RELATED: 0.35,
  MISSING: 0,
  CONFLICT: 0,
};

// Broad capability terms and the concrete technologies that demonstrate them.
// A resume rarely writes "cloud-native" or "container orchestration" verbatim,
// but building services on Kubernetes IS cloud-native work and IS container
// orchestration. When an exemplar is evidenced, the capability earns full
// EQUIVALENT credit — first-class semantic matching, not a fuzzy family match.
const CAPABILITY_EXEMPLARS: Record<string, string[]> = {
  'cloud native': ['kubernetes', 'docker', 'aws', 'azure', 'gcp', 'terraform', 'openshift', 'serverless', 'cloud functions'],
  'orchestration': ['kubernetes', 'kubernetes clusters', 'docker swarm', 'openshift', 'nomad'],
  containerization: ['docker', 'kubernetes'],
  'event-driven architecture': ['kafka', 'rabbitmq', 'amazon sqs', 'google pub/sub', 'aws sns', 'eventbridge', 'apache pulsar', 'nats'],
  iac: ['terraform', 'ansible', 'cloudformation', 'pulumi'],
  devsecops: ['snyk', 'github advanced security', 'aqua security'],
};

// Profession-anchored years credit. "5+ years of product management experience"
// is anchored on a PROFESSION NOUN — the candidate is a product manager — not on
// a taxonomy concept the resume must write literally. The word "management" will
// rarely appear on a PM's page; the role title "Senior Product Manager at X
// (2019 - Present)" IS the evidence, and its date span IS the profession years.
// Keyed by the requirement's first concept; each entry lists the role head nouns
// that genuinely ARE that profession (so a "Software Engineer" doing IT helpdesk
// work, or a "Marketing Manager", never steals credit for the wrong profession).
// Deliberately excludes tech-stack categories (programming-language, framework,
// tool, ai-ml, cloud, domain) where title wordplay is the adversarial attack
// vector.
const PROFESSION_NOUNS: Record<string, string[]> = {
  management: ['manager'],
  marketing: ['manager', 'marketer', 'specialist'],
  'digital marketing': ['marketer', 'specialist'],
  finance: ['analyst', 'finance', 'controller', 'accountant'],
  'financial analysis': ['analyst', 'finance', 'controller'],
  'enterprise sales': ['executive'],
  sales: ['executive'],
  'account management': ['executive', 'account'],
  operations: ['supervisor', 'coordinator', 'director'],
  'operations management': ['supervisor', 'coordinator', 'director'],
  'human resources': ['partner', 'generalist', 'coordinator', 'specialist'],
};

export const IMPORTANCE_LABEL: Record<Importance, string> = {
  REQUIRED: 'Required',
  PREFERRED: 'Preferred',
  NICE_TO_HAVE: 'Nice to have',
  RESPONSIBILITY: 'Responsibility',
  CONTEXT: 'Context',
};

// ---------------------------------------------------------------------------
// Profession-agnostic concept taxonomy
//   [canonical term, category, family?, aliases...]
// ---------------------------------------------------------------------------

type Spec = (string | undefined)[];

const SPECS: Spec[] = [
  // --- Programming languages ---
  ['javascript', 'programming-language', 'js-framework', 'js', 'ecmascript'],
  ['typescript', 'programming-language', 'js-framework', 'ts'],
  ['python', 'programming-language'],
  ['java', 'programming-language'],
  ['c++', 'programming-language'],
  ['c#', 'programming-language', undefined, 'c sharp', 'csharp'],
  ['c', 'programming-language'],
  ['go', 'programming-language', undefined, 'golang'],
  ['rust', 'programming-language'],
  ['swift', 'programming-language'],
  ['kotlin', 'programming-language'],
  ['ruby', 'programming-language'],
  ['php', 'programming-language'],
  ['scala', 'programming-language'],
  ['r', 'programming-language'],
  ['matlab', 'programming-language'],
  ['perl', 'programming-language'],
  ['objective-c', 'programming-language', undefined, 'objc'],
  ['dart', 'programming-language'],
  ['lua', 'programming-language'],
  ['groovy', 'programming-language'],
  ['haskell', 'programming-language'],
  ['elixir', 'programming-language'],
  ['clojure', 'programming-language'],
  ['erlang', 'programming-language'],
  ['cobol', 'programming-language'],
  ['fortran', 'programming-language'],
  ['abap', 'programming-language'],
  ['bash', 'programming-language', undefined, 'shell scripting'],
  ['powershell', 'programming-language', undefined, 'ps1'],
  ['sql', 'programming-language'],
  ['pl/sql', 'programming-language'],
  ['visual basic', 'programming-language', undefined, 'vb.net', 'vbnet'],

  // --- Frontend frameworks / libraries ---
  ['react', 'framework', 'js-framework', 'react.js', 'reactjs'],
  ['next.js', 'framework', 'js-framework', 'nextjs'],
  ['nuxt', 'framework', 'js-framework', 'nuxt.js'],
  ['angular', 'framework', 'js-framework', 'angular.js', 'angularjs'],
  ['vue.js', 'framework', 'js-framework', 'vue', 'vuejs'],
  ['svelte', 'framework', 'js-framework'],
  ['solidjs', 'framework', 'js-framework', 'solid js'],
  ['remix', 'framework', 'js-framework'],
  ['gatsby', 'framework', 'js-framework'],
  ['jquery', 'library', 'js-framework'],
  ['redux', 'library', 'js-framework'],
  ['zustand', 'library', 'js-framework'],
  ['html', 'programming-language', 'frontend', 'html5'],
  ['css', 'programming-language', 'frontend', 'css3'],
  ['sass', 'programming-language', 'frontend', 'scss'],
  ['less', 'programming-language', 'frontend'],
  ['tailwind css', 'tool', 'frontend', 'tailwind'],
  ['bootstrap', 'tool', 'frontend'],
  ['styled-components', 'library', 'frontend'],
  ['webpack', 'tool', 'frontend-build'],
  ['vite', 'tool', 'frontend-build'],
  ['babel', 'tool', 'frontend-build'],
  ['eslint', 'tool', 'frontend-build'],
  ['responsive design', 'design', 'frontend'],
  ['accessibility', 'design', 'frontend', 'wcag', 'a11y'],
  ['web components', 'methodology', 'frontend'],

  // --- Backend frameworks ---
  ['node.js', 'framework', 'backend', 'node', 'nodejs'],
  ['express', 'framework', 'backend', 'express.js'],
  ['nestjs', 'framework', 'backend', 'nest.js'],
  ['django', 'framework', 'backend'],
  ['flask', 'framework', 'backend'],
  ['fastapi', 'framework', 'backend'],
  ['spring', 'framework', 'backend', 'spring boot', 'springboot'],
  ['rails', 'framework', 'backend', 'ruby on rails'],
  ['laravel', 'framework', 'backend'],
  ['asp.net', 'framework', 'backend', 'aspnet', '.net core', '.net'],
  ['graphql', 'methodology', 'api', 'graph ql'],
  ['rest api', 'methodology', 'api', 'restful api', 'rest', 'restful'],
  ['soap', 'methodology', 'api'],
  ['grpc', 'methodology', 'api'],
  ['microservices', 'methodology', 'architecture', 'microservices architecture'],
  ['event-driven architecture', 'methodology', 'architecture', 'event driven', 'event-driven'],
  ['serverless', 'platform', 'cloud', 'serverless architecture'],
  ['microfrontend', 'methodology', 'architecture'],

  // --- Databases ---
  ['postgresql', 'database', 'relational-db', 'postgres'],
  ['mysql', 'database', 'relational-db'],
  ['mariadb', 'database', 'relational-db'],
  ['sql server', 'database', 'relational-db', 'mssql'],
  ['oracle', 'database', 'relational-db', 'oracle db'],
  ['sqlite', 'database', 'relational-db'],
  ['mongodb', 'database', 'nosql', 'mongo'],
  ['redis', 'database', 'nosql'],
  ['cassandra', 'database', 'nosql'],
  ['dynamodb', 'database', 'nosql'],
  ['elasticsearch', 'database', 'search', 'elastic'],
  ['neo4j', 'database', 'graph-db'],
  ['couchbase', 'database', 'nosql'],
  ['firebase', 'platform', 'baas', 'firestore'],
  ['supabase', 'platform', 'baas'],
  ['snowflake', 'database', 'data-warehouse'],
  ['bigquery', 'database', 'data-warehouse'],
  ['redshift', 'database', 'data-warehouse'],
  ['databricks', 'platform', 'data-platform'],
  ['clickhouse', 'database', 'data-warehouse'],
  ['etl', 'methodology', 'data-engineering'],
  ['data warehouse', 'methodology', 'data-engineering', 'data warehousing'],
  ['data pipeline', 'methodology', 'data-engineering', 'pipelines'],
  ['data modeling', 'methodology', 'data-engineering', 'data modelling'],
  ['data governance', 'methodology', 'data-engineering'],
  ['data engineering', 'domain', 'data-engineering'],

  // --- Software / engineering domains (education + work context) ---
  ['computer science', 'domain', 'software', 'cs'],
  ['software engineering', 'domain', 'software', 'software development'],
  ['computer engineering', 'domain', 'software', 'computer systems engineering'],
  ['information technology', 'domain', 'software', 'it'],
  ['information systems', 'domain', 'software', 'mis'],

  // --- Cloud platforms ---
  ['cloud native', 'cloud', 'cloud', 'cloud-native', 'cloudnative'],
  ['aws', 'cloud', 'cloud', 'amazon web services'],
  ['azure', 'cloud', 'cloud', 'microsoft azure'],
  ['gcp', 'cloud', 'cloud', 'google cloud platform', 'google cloud'],
  ['heroku', 'platform', 'cloud'],
  ['digitalocean', 'platform', 'cloud'],
  ['netlify', 'platform', 'cloud'],
  ['vercel', 'platform', 'cloud'],
  ['cloudflare', 'platform', 'cloud'],
  ['openshift', 'platform', 'cloud'],
  ['alibaba cloud', 'cloud', 'cloud'],
  ['ibm cloud', 'cloud', 'cloud'],
  ['oracle cloud', 'cloud', 'cloud'],
  ['salesforce', 'platform', 'crm'],
  ['sap', 'platform', 'erp'],
  ['dynamics 365', 'platform', 'erp'],

  // --- DevOps / infra ---
  ['docker', 'tool', 'container'],
  ['kubernetes', 'tool', 'container', 'k8s'],
  ['helm', 'tool', 'container'],
  ['terraform', 'tool', 'iac', 'terraform modules'],
  ['ansible', 'tool', 'iac'],
  ['puppet', 'tool', 'iac'],
  ['chef', 'tool', 'iac'],
  ['jenkins', 'tool', 'ci-cd'],
  ['github actions', 'tool', 'ci-cd'],
  ['gitlab ci', 'tool', 'ci-cd', 'gitlab'],
  ['circleci', 'tool', 'ci-cd'],
  ['travis ci', 'tool', 'ci-cd'],
  ['bitbucket pipelines', 'tool', 'ci-cd'],
  ['argo cd', 'tool', 'ci-cd'],
  ['prometheus', 'tool', 'monitoring'],
  ['grafana', 'tool', 'monitoring'],
  ['datadog', 'tool', 'monitoring'],
  ['sentry', 'tool', 'monitoring'],
  ['new relic', 'tool', 'monitoring'],
  ['splunk', 'tool', 'monitoring'],
  ['kibana', 'tool', 'monitoring'],
  ['nagios', 'tool', 'monitoring'],
  ['linux', 'tool', 'os'],
  ['unix', 'tool', 'os'],
  ['windows server', 'tool', 'os'],
  ['nginx', 'tool', 'web-server'],
  ['apache', 'tool', 'web-server'],
  ['ci/cd', 'methodology', 'ci-cd', 'continuous integration', 'continuous delivery', 'continuous deployment'],
  ['infrastructure as code', 'methodology', 'iac', 'iac'],
  ['containerization', 'methodology', 'container', 'containers', 'containerized', 'docker', 'kubernetes', 'k8s'],
  ['testing', 'methodology', 'testing', 'test', 'tests', 'testing', 'test-driven development', 'tdd', 'unit testing', 'unit tests', 'unit test', 'integration testing', 'integration tests', 'e2e testing', 'end-to-end testing', 'automated testing', 'test automation', 'qa testing'],
  ['orchestration', 'methodology', 'container', 'container orchestration'],
  ['observability', 'methodology', 'monitoring'],
  ['monitoring', 'methodology', 'monitoring'],
  ['load balancing', 'methodology', 'infra'],
  ['devops', 'methodology', 'devops-culture'],
  ['site reliability', 'methodology', 'devops-culture', 'sre'],

  // --- Data / AI / ML ---
  ['data analysis', 'domain', 'data'],
  ['data science', 'domain', 'data'],
  ['machine learning', 'ai-ml', 'ml', 'ml'],
  ['deep learning', 'ai-ml', 'ml'],
  ['natural language processing', 'ai-ml', 'nlp', 'nlp'],
  ['computer vision', 'ai-ml', 'cv'],
  ['large language models', 'ai-ml', 'llm', 'llm', 'llms'],
  ['generative ai', 'ai-ml', 'genai', 'gen ai'],
  ['prompt engineering', 'ai-ml', 'genai'],
  ['fine-tuning', 'ai-ml', 'ml', 'fine tuning'],
  ['retrieval augmented generation', 'ai-ml', 'genai', 'rag'],
  ['embeddings', 'ai-ml', 'ml'],
  ['statistics', 'data', 'data'],
  ['pandas', 'library', 'python-data', 'python pandas'],
  ['numpy', 'library', 'python-data'],
  ['scikit-learn', 'library', 'ml', 'sklearn'],
  ['tensorflow', 'library', 'ml'],
  ['pytorch', 'library', 'ml'],
  ['keras', 'library', 'ml'],
  ['jupyter', 'tool', 'python-data', 'jupyter notebook'],
  ['spark', 'platform', 'big-data', 'apache spark'],
  ['hadoop', 'platform', 'big-data'],
  ['apache airflow', 'tool', 'data-engineering', 'airflow'],
  ['kafka', 'tool', 'messaging', 'apache kafka'],
  ['dbt', 'tool', 'data-engineering'],
  ['tableau', 'tool', 'data-viz'],
  ['power bi', 'tool', 'data-viz'],
  ['looker', 'tool', 'data-viz'],
  ['a/b testing', 'methodology', 'experimentation', 'ab testing'],
  ['experimentation', 'methodology', 'experimentation'],
  ['regression', 'ai-ml', 'ml'],
  ['classification', 'ai-ml', 'ml'],
  ['feature engineering', 'ai-ml', 'ml'],
  ['predictive modeling', 'ai-ml', 'ml', 'predictive analytics'],

  // --- Security ---
  ['cybersecurity', 'security', 'security', 'cyber security'],
  ['information security', 'security', 'security', 'infosec'],
  ['network security', 'security', 'security'],
  ['application security', 'security', 'appsec', 'app sec'],
  ['cloud security', 'security', 'security'],
  ['penetration testing', 'security', 'pentest', 'pen testing'],
  ['ethical hacking', 'security', 'pentest'],
  ['owasp', 'security', 'appsec'],
  ['encryption', 'security', 'crypto'],
  ['cryptography', 'security', 'crypto'],
  ['identity and access management', 'security', 'iam', 'iam'],
  ['zero trust', 'security', 'security'],
  ['vulnerability assessment', 'security', 'appsec'],
  ['threat modeling', 'security', 'appsec'],
  ['incident response', 'security', 'secops'],
  ['security information and event management', 'security', 'siem', 'siem'],
  ['firewall', 'security', 'network'],
  ['devsecops', 'methodology', 'devops-culture'],
  ['security auditing', 'security', 'audit'],

  // --- Business / strategy / finance ---
  ['business analysis', 'business', 'business'],
  ['business intelligence', 'business', 'data-viz', 'bi'],
  ['strategy', 'business', 'strategy'],
  ['strategic planning', 'business', 'strategy'],
  ['go-to-market', 'business', 'gtm', 'gtm'],
  ['market research', 'business', 'strategy'],
  ['competitive analysis', 'business', 'strategy'],
  ['growth strategy', 'business', 'strategy'],
  ['financial analysis', 'finance', 'finance'],
  ['financial modeling', 'finance', 'finance'],
  ['forecasting', 'finance', 'finance', 'demand forecasting'],
  ['budgeting', 'finance', 'finance'],
  ['accounting', 'finance', 'finance'],
  ['bookkeeping', 'finance', 'finance'],
  ['billing', 'finance', 'finance'],
  ['audit', 'finance', 'audit'],
  ['tax', 'finance', 'finance'],
  ['risk management', 'finance', 'risk'],
  ['treasury', 'finance', 'finance'],
  ['fp&a', 'finance', 'finance', 'financial planning'],
  ['p&l management', 'finance', 'finance', 'profit and loss'],
  ['pricing', 'business', 'strategy'],
  ['revenue', 'business', 'revenue'],
  ['revenue operations', 'business', 'revenue', 'revops'],
  ['kpis', 'business', 'metrics', 'key performance indicators'],
  ['okrs', 'business', 'metrics', 'objectives and key results'],
  ['saas', 'business', 'saas', 'software as a service'],
  ['b2b', 'business', 'b2b'],
  ['b2c', 'business', 'b2c'],
  ['partnerships', 'business', 'bd'],
  ['business development', 'business', 'bd'],
  ['vendor management', 'operations', 'procurement'],
  ['due diligence', 'finance', 'm&a'],
  ['m&a', 'finance', 'm&a', 'mergers and acquisitions'],

  // --- Marketing ---
  ['marketing', 'marketing', 'marketing'],
  ['digital marketing', 'marketing', 'marketing'],
  ['seo', 'marketing', 'seo', 'search engine optimization'],
  ['sem', 'marketing', 'sem', 'search engine marketing'],
  ['ppc', 'marketing', 'paid-media', 'pay per click'],
  ['google ads', 'marketing', 'paid-media', 'google adwords'],
  ['meta ads', 'marketing', 'paid-media', 'facebook ads'],
  ['email marketing', 'marketing', 'email'],
  ['content marketing', 'marketing', 'content'],
  ['content strategy', 'marketing', 'content'],
  ['copywriting', 'marketing', 'content'],
  ['social media', 'marketing', 'social'],
  ['social media management', 'marketing', 'social'],
  ['brand management', 'marketing', 'brand'],
  ['public relations', 'marketing', 'pr', 'pr'],
  ['influencer marketing', 'marketing', 'social'],
  ['marketing automation', 'marketing', 'automation'],
  ['marketing operations', 'marketing', 'automation', 'markops'],
  ['lead generation', 'marketing', 'lead-gen'],
  ['conversion rate optimization', 'marketing', 'cro', 'cro'],
  ['google analytics', 'tool', 'analytics', 'ga4'],
  ['tag manager', 'tool', 'analytics'],
  ['marketo', 'tool', 'marketing-automation'],
  ['hubspot', 'tool', 'crm'],
  ['salesforce marketing cloud', 'tool', 'marketing-automation'],
  ['customer lifecycle', 'marketing', 'lifecycle'],
  ['retention', 'marketing', 'lifecycle'],
  ['customer acquisition', 'marketing', 'lifecycle', 'cac'],
  ['brand identity', 'design', 'brand'],

  // --- Sales / customer success ---
  ['sales', 'sales', 'sales'],
  ['business development', 'sales', 'bd'],
  ['account management', 'sales', 'sales'],
  ['enterprise sales', 'sales', 'sales'],
  ['inside sales', 'sales', 'sales'],
  ['field sales', 'sales', 'sales'],
  ['customer success', 'sales', 'customer-success'],
  ['account executive', 'sales', 'sales'],
  ['sales development', 'sales', 'sales', 'sdr'],
  ['pipeline management', 'sales', 'sales'],
  ['sales forecasting', 'sales', 'sales'],
  ['closing', 'sales', 'sales'],
  ['upselling', 'sales', 'sales'],
  ['cross-selling', 'sales', 'sales'],
  ['negotiation', 'sales', 'soft'],
  ['proposal writing', 'sales', 'sales'],
  ['territory management', 'sales', 'sales'],
  ['cold outreach', 'sales', 'sales', 'cold emailing'],
  ['client relations', 'sales', 'client'],

  // --- Operations / supply chain / project management ---
  ['operations', 'operations', 'ops'],
  ['operations management', 'operations', 'ops'],
  ['supply chain', 'operations', 'supply-chain'],
  ['logistics', 'operations', 'supply-chain'],
  ['procurement', 'operations', 'procurement'],
  ['inventory management', 'operations', 'supply-chain'],
  ['demand planning', 'operations', 'supply-chain'],
  ['warehouse management', 'operations', 'supply-chain'],
  ['fulfillment', 'operations', 'supply-chain'],
  ['quality control', 'operations', 'quality'],
  ['quality assurance', 'operations', 'quality', 'qa'],
  ['process improvement', 'operations', 'quality'],
  ['continuous improvement', 'operations', 'quality', 'kaizen'],
  ['lean', 'methodology', 'six-sigma', 'lean methodology'],
  ['six sigma', 'methodology', 'six-sigma'],
  ['project management', 'management', 'pm'],
  ['program management', 'management', 'pm'],
  ['portfolio management', 'management', 'pm'],
  ['agile', 'methodology', 'agile'],
  ['scrum', 'methodology', 'agile'],
  ['kanban', 'methodology', 'agile'],
  ['waterfall', 'methodology', 'agile'],
  ['jira', 'tool', 'pm-tools'],
  ['confluence', 'tool', 'pm-tools'],
  ['asana', 'tool', 'pm-tools'],
  ['trello', 'tool', 'pm-tools'],
  ['monday.com', 'tool', 'pm-tools'],
  ['notion', 'tool', 'pm-tools'],
  ['stakeholder management', 'management', 'stakeholder'],
  ['resource planning', 'management', 'pm'],
  ['capacity planning', 'operations', 'ops'],
  ['sla management', 'operations', 'ops', 'service level'],
  ['kpi tracking', 'operations', 'metrics'],

  // --- HR / people ---
  ['human resources', 'hr', 'hr', 'hr'],
  ['recruiting', 'hr', 'talent'],
  ['talent acquisition', 'hr', 'talent'],
  ['onboarding', 'hr', 'talent'],
  ['employee relations', 'hr', 'hr'],
  ['performance management', 'hr', 'hr'],
  ['compensation', 'hr', 'hr'],
  ['benefits administration', 'hr', 'hr'],
  ['payroll', 'hr', 'hr'],
  ['compliance', 'hr', 'compliance'],
  ['workday', 'tool', 'hr-is'],
  ['bamboohr', 'tool', 'hr-is'],
  ['employee engagement', 'hr', 'hr'],
  ['diversity equity and inclusion', 'hr', 'dei', 'dei'],
  ['learning and development', 'hr', 'l&d', 'l&d', 'ld'],
  ['talent management', 'hr', 'talent'],
  ['succession planning', 'hr', 'talent'],
  ['people operations', 'hr', 'hr', 'people ops'],
  ['headcount planning', 'hr', 'hr'],
  ['training', 'education', 'l&d'],
  ['coaching', 'leadership', 'leadership'],

  // --- Leadership / management ---
  ['leadership', 'leadership', 'leadership'],
  ['management', 'management', 'leadership'],
  ['team leadership', 'leadership', 'leadership'],
  ['people management', 'management', 'leadership'],
  ['mentoring', 'leadership', 'leadership'],
  ['mentorship', 'leadership', 'leadership'],
  ['delegation', 'management', 'leadership'],
  ['strategic leadership', 'leadership', 'leadership'],
  ['executive leadership', 'leadership', 'leadership'],
  ['cross-functional collaboration', 'leadership', 'collaboration'],
  ['cross-functional leadership', 'leadership', 'leadership'],
  ['decision making', 'management', 'leadership'],
  ['influence', 'leadership', 'leadership'],
  ['accountability', 'management', 'leadership'],
  ['goal setting', 'management', 'leadership'],
  ['vision', 'leadership', 'leadership'],
  ['conflict resolution', 'soft-skill', 'soft'],
  ['change management', 'management', 'change'],
  ['organizational development', 'management', 'change', 'org design'],

  // --- Soft skills ---
  ['communication', 'communication', 'soft'],
  ['written communication', 'communication', 'soft'],
  ['verbal communication', 'communication', 'soft'],
  ['presentation skills', 'communication', 'soft', 'presenting'],
  ['public speaking', 'communication', 'soft'],
  ['storytelling', 'communication', 'soft'],
  ['teamwork', 'soft-skill', 'soft', 'team player'],
  ['collaboration', 'soft-skill', 'soft', 'collaborative'],
  ['problem solving', 'soft-skill', 'soft', 'problem-solving'],
  ['critical thinking', 'soft-skill', 'soft'],
  ['analytical skills', 'soft-skill', 'soft', 'analytical'],
  ['attention to detail', 'soft-skill', 'soft', 'detail-oriented'],
  ['time management', 'soft-skill', 'soft'],
  ['organization', 'soft-skill', 'soft', 'organizational skills'],
  ['adaptability', 'soft-skill', 'soft'],
  ['flexibility', 'soft-skill', 'soft'],
  ['creativity', 'soft-skill', 'soft'],
  ['innovation', 'soft-skill', 'soft'],
  ['emotional intelligence', 'soft-skill', 'soft', 'eq'],
  ['interpersonal skills', 'soft-skill', 'soft'],
  ['customer service', 'soft-skill', 'soft', 'client service'],
  ['reliability', 'soft-skill', 'soft'],
  ['initiative', 'soft-skill', 'soft', 'self-starter'],
  ['self-motivation', 'soft-skill', 'soft', 'motivated'],
  ['work ethic', 'soft-skill', 'soft'],
  ['resilience', 'soft-skill', 'soft'],
  ['multitasking', 'soft-skill', 'soft'],
  ['prioritization', 'soft-skill', 'soft'],
  ['ownership', 'soft-skill', 'soft'],
  ['curiosity', 'soft-skill', 'soft'],
  ['open-mindedness', 'soft-skill', 'soft'],

  // --- Design / UX ---
  ['ui design', 'design', 'design', 'user interface design'],
  ['ux design', 'design', 'design', 'user experience design'],
  ['user research', 'design', 'design'],
  ['usability testing', 'design', 'design'],
  ['prototyping', 'design', 'design'],
  ['wireframing', 'design', 'design'],
  ['design systems', 'design', 'design'],
  ['interaction design', 'design', 'design'],
  ['visual design', 'design', 'design'],
  ['motion design', 'design', 'design'],
  ['figma', 'tool', 'design-tools'],
  ['sketch', 'tool', 'design-tools'],
  ['adobe xd', 'tool', 'design-tools'],
  ['photoshop', 'tool', 'design-tools', 'adobe photoshop'],
  ['illustrator', 'tool', 'design-tools', 'adobe illustrator'],
  ['after effects', 'tool', 'design-tools'],
  ['webflow', 'tool', 'design-tools'],

  // --- Healthcare ---
  ['healthcare', 'healthcare', 'healthcare'],
  ['patient care', 'healthcare', 'clinical'],
  ['critical care', 'healthcare', 'clinical'],
  ['nursing', 'healthcare', 'clinical'],
  ['registered nurse', 'healthcare', 'clinical', 'rn'],
  ['bsn', 'healthcare', 'clinical', 'bachelor of science in nursing'],
  ['lpn', 'healthcare', 'clinical', 'licensed practical nurse'],
  ['physician', 'healthcare', 'clinical'],
  ['physician assistant', 'healthcare', 'clinical', 'pa'],
  ['physical therapy', 'healthcare', 'rehab'],
  ['occupational therapy', 'healthcare', 'rehab'],
  ['speech therapy', 'healthcare', 'rehab'],
  ['pharmacy', 'healthcare', 'pharma'],
  ['pharmacist', 'healthcare', 'pharma'],
  ['clinical trials', 'healthcare', 'clinical'],
  ['medical coding', 'healthcare', 'healthcare-admin'],
  ['medical billing', 'healthcare', 'healthcare-admin'],
  ['electronic health records', 'healthcare', 'healthcare-admin', 'ehr', 'emr'],
  ['epic systems', 'healthcare', 'healthcare-admin', 'epic'],
  ['cerner', 'healthcare', 'healthcare-admin'],
  ['hl7', 'healthcare', 'healthcare-admin'],
  ['fhir', 'healthcare', 'healthcare-admin'],
  ['phlebotomy', 'healthcare', 'clinical'],
  ['radiology', 'healthcare', 'clinical'],
  ['mri', 'healthcare', 'clinical'],
  ['ct scan', 'healthcare', 'clinical'],
  ['anesthesia', 'healthcare', 'clinical'],
  ['emergency medicine', 'healthcare', 'clinical'],
  ['icu', 'healthcare', 'clinical'],
  ['telemedicine', 'healthcare', 'clinical', 'telehealth'],
  ['public health', 'healthcare', 'clinical'],
  ['epidemiology', 'healthcare', 'clinical'],
  ['healthcare administration', 'healthcare', 'healthcare-admin'],
  ['hipaa', 'compliance', 'healthcare-compliance'],
  ['hospice', 'healthcare', 'clinical'],
  ['pediatrics', 'healthcare', 'clinical'],
  ['geriatrics', 'healthcare', 'clinical'],
  ['surgical', 'healthcare', 'clinical'],

  // --- Legal / compliance ---
  ['legal', 'legal', 'legal'],
  ['law', 'legal', 'legal'],
  ['contracts', 'legal', 'legal'],
  ['contract review', 'legal', 'legal'],
  ['litigation', 'legal', 'legal'],
  ['regulatory affairs', 'compliance', 'regulatory'],
  ['regulatory compliance', 'compliance', 'regulatory'],
  ['data protection', 'legal', 'privacy', 'data privacy'],
  ['privacy', 'legal', 'privacy'],
  ['gdpr', 'compliance', 'privacy', 'general data protection regulation'],
  ['ccpa', 'compliance', 'privacy', 'california consumer privacy act'],
  ['intellectual property', 'legal', 'ip', 'ip'],
  ['trademarks', 'legal', 'ip'],
  ['patents', 'legal', 'ip'],
  ['corporate law', 'legal', 'legal'],
  ['employment law', 'legal', 'legal'],
  ['labor law', 'legal', 'legal'],
  ['risk compliance', 'compliance', 'compliance'],
  ['ethics', 'compliance', 'compliance'],
  ['sanctions', 'compliance', 'compliance'],
  ['legal research', 'legal', 'legal'],
  ['drafting', 'legal', 'legal'],
  ['negotiation of contracts', 'legal', 'legal'],

  // --- Education ---
  ['education', 'education', 'education'],
  ['teaching', 'education', 'education'],
  ['curriculum', 'education', 'curriculum'],
  ['curriculum development', 'education', 'curriculum'],
  ['classroom management', 'education', 'education'],
  ['lesson planning', 'education', 'education'],
  ['student assessment', 'education', 'education'],
  ['tutoring', 'education', 'education'],
  ['e-learning', 'education', 'elearning', 'elearning'],
  ['instructional design', 'education', 'elearning'],
  ['learning management system', 'education', 'elearning', 'lms'],
  ['faculty', 'education', 'education'],
  ['k-12', 'education', 'education'],
  ['higher education', 'education', 'education'],
  ['special education', 'education', 'education'],
  ['esl', 'education', 'education', 'english as a second language'],
  ['tefl', 'education', 'education'],
  ['pedagogy', 'education', 'education'],

  // --- Certifications ---
  ['pmp', 'certification', 'pm-cert', 'project management professional'],
  ['csm', 'certification', 'agile-cert', 'certified scrum master'],
  ['psm', 'certification', 'agile-cert'],
  ['safe', 'certification', 'agile-cert', 'scaled agile'],
  ['cpa', 'certification', 'finance-cert', 'certified public accountant'],
  ['cfa', 'certification', 'finance-cert', 'chartered financial analyst'],
  ['series 7', 'certification', 'finance-cert', 'series7', 'finra series 7'],
  ['series 63', 'certification', 'finance-cert'],
  ['series 65', 'certification', 'finance-cert'],
  ['cissp', 'certification', 'security-cert'],
  ['ceh', 'certification', 'security-cert', 'certified ethical hacker'],
  ['cism', 'certification', 'security-cert'],
  ['cisa', 'certification', 'security-cert'],
  ['oscp', 'certification', 'security-cert'],
  ['ccna', 'certification', 'network-cert'],
  ['ccnp', 'certification', 'network-cert'],
  ['comptia security+', 'certification', 'security-cert', 'security+'],
  ['comptia network+', 'certification', 'network-cert', 'network+'],
  ['comptia a+', 'certification', 'it-cert', 'a+ certification'],
  ['aws certified', 'certification', 'cloud-cert', 'aws certification'],
  ['azure certified', 'certification', 'cloud-cert'],
  ['gcp certified', 'certification', 'cloud-cert'],
  ['lean six sigma', 'certification', 'quality-cert'],
  ['six sigma black belt', 'certification', 'quality-cert', 'black belt'],
  ['six sigma green belt', 'certification', 'quality-cert', 'green belt'],
  ['usmle', 'certification', 'medical-cert'],
  ['mcq', 'certification', 'medical-cert'],
  ['toefl', 'certification', 'language-cert'],
  ['ielts', 'certification', 'language-cert'],
  ['acls', 'certification', 'medical-cert', 'advanced cardiac life support'],
  ['bls', 'certification', 'medical-cert', 'basic life support'],
  ['cpr', 'certification', 'medical-cert', 'cardiopulmonary resuscitation'],
  ['she', 'certification', 'medical-cert'],
  ['nrp', 'certification', 'medical-cert', 'neonatal resuscitation'],
  ['tncc', 'certification', 'medical-cert'],
  ['shrm-cp', 'certification', 'hr-cert', 'shrm'],
  ['shrm-scp', 'certification', 'hr-cert'],
  ['phr', 'certification', 'hr-cert', 'professional in human resources'],
  ['phrca', 'certification', 'hr-cert'],
  ['sphr', 'certification', 'hr-cert'],

  // --- Domain / industry knowledge ---
  ['fintech', 'domain', 'fintech', 'financial technology'],
  ['e-commerce', 'domain', 'ecommerce', 'ecommerce'],
  ['retail', 'domain', 'retail'],
  ['real estate', 'domain', 'realestate'],
  ['automotive', 'domain', 'automotive'],
  ['manufacturing', 'domain', 'manufacturing'],
  ['aerospace', 'domain', 'aerospace'],
  ['energy', 'domain', 'energy'],
  ['oil and gas', 'domain', 'energy'],
  ['telecommunications', 'domain', 'telecom', 'telecom'],
  ['media', 'domain', 'media'],
  ['entertainment', 'domain', 'media'],
  ['gaming', 'domain', 'gaming'],
  ['hospitality', 'domain', 'hospitality'],
  ['food service', 'domain', 'hospitality'],
  ['construction', 'domain', 'construction'],
  ['agriculture', 'domain', 'agriculture'],
  ['biotechnology', 'domain', 'pharma', 'biotech'],
  ['pharmaceuticals', 'domain', 'pharma', 'pharma'],
  ['insurance', 'domain', 'insurance'],
  ['banking', 'domain', 'finance'],
  ['capital markets', 'domain', 'finance'],
  ['wealth management', 'domain', 'finance'],
  ['payments', 'domain', 'fintech'],
  ['crypto', 'domain', 'fintech', 'cryptocurrency'],
  ['blockchain', 'domain', 'fintech'],
  ['web3', 'domain', 'fintech'],
  ['edtech', 'domain', 'edtech'],
  ['healthtech', 'domain', 'healthtech'],
  ['proptech', 'domain', 'proptech'],
  ['martech', 'domain', 'martech'],
  ['adtech', 'domain', 'adtech'],
  ['devtools', 'domain', 'devtools'],
  ['saas products', 'domain', 'saas'],
  ['consumer products', 'domain', 'consumer'],
  ['marketplace', 'domain', 'marketplace'],

  // --- Spoken languages ---
  ['english', 'language', 'language'],
  ['spanish', 'language', 'language'],
  ['french', 'language', 'language'],
  ['german', 'language', 'language'],
  ['mandarin', 'language', 'language', 'chinese'],
  ['hindi', 'language', 'language'],
  ['arabic', 'language', 'language'],
  ['portuguese', 'language', 'language'],
  ['japanese', 'language', 'language'],
  ['korean', 'language', 'language'],
  ['russian', 'language', 'language'],
  ['italian', 'language', 'language'],
  ['dutch', 'language', 'language'],
  ['bilingual', 'language', 'language'],
  ['multilingual', 'language', 'language'],
];

export const CONCEPTS: Concept[] = SPECS.map(spec => ({
  term: spec[0] as string,
  category: (spec[1] || 'other') as ConceptCategory,
  family: spec[2] as string | undefined,
  aliases: spec.slice(3).filter((a): a is string => Boolean(a)),
}));

const CONCEPT_TERMS: string[] = CONCEPTS.map(c => c.term);

// Token table: every canonical term + alias mapped to its canonical term, longest-first
// for maximal-munch matching so an alias like "js" can't match inside "node.js".
const CONCEPT_TOKENS: { pattern: string; term: string }[] = [];
for (const c of CONCEPTS) {
  CONCEPT_TOKENS.push({ pattern: c.term, term: c.term });
  for (const a of c.aliases) CONCEPT_TOKENS.push({ pattern: a, term: c.term });
}
CONCEPT_TOKENS.sort((a, b) => b.pattern.length - a.pattern.length);

const isAlphaNum = (ch: string | undefined): boolean => !!ch && /[a-z0-9]/.test(ch);

export function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findConceptsInText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  let i = 0;
  while (i < lower.length) {
    if (!/[a-z0-9]/.test(lower[i])) {
      i++;
      continue;
    }
    // Try the longest token anchored at this position first.
    let matched = false;
    for (const t of CONCEPT_TOKENS) {
      if (lower.startsWith(t.pattern, i)) {
        const before = lower[i - 1];
        const after = lower[i + t.pattern.length];
        if (!isAlphaNum(before) && !isAlphaNum(after)) {
          found.push(t.term);
          i += t.pattern.length;
          matched = true;
          break;
        }
      }
    }
    if (!matched) i++;
  }
  return found;
}

// A negated mention is NOT evidence of the skill. "No hands-on React" and
// "did not use TypeScript" describe absence, not experience, and must not earn
// match credit or advance the recency/tenure clocks. We detect a small set of
// explicit negators preceding the concept within the same clause.
const NEGATION_RE = /\b(no\s+(?:hands[\s-]?on\s+)?|not\s+(?:used?|work(?:ed)?\s+(?:with|in|on)\s+|touch(?:ed)?\s+|use|know)|never\s+(?:used?|touch(?:ed)?|work(?:ed)?)|lacking|cannot|could(?:\s+not)?\s+use)\b/i;

export function findEvidencedConceptsInText(text: string): string[] {
  const negated = new Set<string>();
  // Strip a short window (up to 40 chars) AFTER each negation so "no hands-on
  // React" hides React but "no experience with X, but built Y" still credits Y.
  const lower = text.toLowerCase();
  let n: RegExpExecArray | null;
  let from = 0;
  while ((n = NEGATION_RE.exec(lower.slice(from)))) {
    const start = from + n.index;
    const windowText = lower.slice(start, Math.min(lower.length, start + 60));
    findConceptsInText(windowText).forEach(c => {
      if (windowText.length <= 60) negated.add(c);
    });
    from = start + 60;
  }
  return findConceptsInText(text).filter(c => !negated.has(c));
}

export function conceptCategory(term: string): ConceptCategory {
  const c = CONCEPTS.find(x => x.term === term);
  return c ? c.category : 'other';
}

export function conceptFamily(term: string): string | undefined {
  const c = CONCEPTS.find(x => x.term === term);
  return c?.family;
}

// ---------------------------------------------------------------------------
// JD section detection + requirement extraction
// ---------------------------------------------------------------------------

interface SectionRule {
  importance: Importance;
  patterns: RegExp[];
}

const JD_SECTION_RULES: { name: string; rule: SectionRule }[] = [
  {
    name: 'requirements',
    rule: {
      importance: 'REQUIRED',
      patterns: [
        /\brequirements?\b/i, /\bqualifications?\b/i, /\bmust\s+have\b/i,
        /\bwhat\s+you(?:'|\x{2019}|’)?ll\s+need\b/i, /\bwhat\s+you\s+bring\b/i,
        /\bwhat\s+we\s+need\b/i, /\bwhat\s+we\s+are\s+looking\s+for\b/i,
        /\bessential\s+(?:skills|experience|qualifications)\b/i,
        /\brequired\s+(?:skills|experience|qualifications)\b/i,
        /\bminimum\s+(?:requirements|qualifications)\b/i,
        /\bthe\s+basics\b/i, /\bwe\s+expect\b/i, /\byou\s+have\b/i,
      ],
    },
  },
  {
    name: 'preferred',
    rule: {
      importance: 'PREFERRED',
      patterns: [
        /\bpreferred\b/i, /\bnice\s+to\s+have\b/i, /\bbonus\s+(?:points|if|skills|qualifications)?\b/i,
        /\bgood\s+to\s+have\b/i, /\bdesirable\b/i, /\bplus\s+if\b/i, /\bpluses\b/i,
        /\bbonus\s+qualifications\b/i, /\bits\s+a\s+plus\b/i,
      ],
    },
  },
  {
    name: 'responsibilities',
    rule: {
      importance: 'RESPONSIBILITY',
      patterns: [
        /\bresponsibilities?\b/i, /\bwhat\s+you(?:'|\x{2019}|’)?ll\s+do\b/i,
        /\bkey\s+responsibilities\b/i, /\babout\s+the\s+role\b/i, /\bthe\s+role\b/i,
        /\byour\s+day\s+to\s+day\b/i, /\bday\s+in\s+the\s+life\b/i, /\byour\s+scope\b/i,
        /\bsome\s+things\s+you(?:'|\x{2019}|’)?ll\s+do\b/i, /\bwhat\s+the\s+role\s+entails\b/i,
        /\bprimary\s+responsibilities\b/i, /\bday-to-day\b/i, /\bthe\s+opportunity\b/i,
      ],
    },
  },
  {
    name: 'about',
    rule: {
      importance: 'CONTEXT',
      patterns: [
        /\babout\s+(?:us|the\s+company|the\s+team|the\s+organisation|the\s+organization|the\s+brand)\b/i,
        /\bcompany\s+(?:overview|description|background)\b/i, /\bwho\s+we\s+are\b/i,
        /\bour\s+(?:mission|vision|values|culture)\b/i, /\bwhy\s+(?:join|work\s+(?:with|at)\s+us)\b/i,
        /\blife\s+at\b/i, /\bperks?\b/i, /\bbenefits?\b/i, /\bequal\s+opportunity\b/i,
        /\beeo\b/i, /\bdiversity\s+statement\b/i, /\bcommitment\s+to\s+diversity\b/i,
        /\bour\s+team\b/i, /\bwho\s+you(?:'|\x{2019}|’)?ll\s+work\s+with\b/i,
      ],
    },
  },
];

function isSectionHeader(line: string): { header: boolean; importance?: Importance; name?: string } {
  const t = line.trim().replace(/[:\-–—]*$/, '').trim();
  if (t.length < 2) return { header: false };
  // Headers are usually short lines (<= 80 chars) and may be ALL CAPS.
  if (t.length > 90 && t !== t.toUpperCase()) return { header: false };
  for (const { name, rule } of JD_SECTION_RULES) {
    if (rule.patterns.some(p => p.test(t))) {
      return { header: true, importance: rule.importance, name };
    }
  }
  return { header: false };
}

function splitRequirementText(text: string): string[] {
  // "B.A. or B.S. degree" lists alternative acceptable levels of ONE credential.
  // Splitting it into "B.A." and "B.S. degree" makes a single resume degree
  // satisfy both requirements ("B.S." >= "B.A." and == "B.S. degree"), double
  // counting one credential and inflating an otherwise-unrelated resume. Keep
  // pure level alternatives whole. Field-qualified unions ("B.S. in Finance or
  // Accounting", "Bachelor degree in business or operations") still split so the
  // field leniency on the education requirement stays strict.
  const EDU_LEVEL_ALT_RE = /^\s*(?:bachelor(?:'?s)?|b\.?a\.?|b\.?s\.?|b\.?e\.?|b\.?tech\.?|master(?:'?s)?|m\.?a\.?|m\.?s\.?|m\.?b\.?a\.?|ph\.?d\.?|associate(?:'?s)?|high\s+school|g\.?e\.?d\.?)\s+(?:or|and)\s+(?:bachelor(?:'?s)?|b\.?a\.?|b\.?s\.?|b\.?e\.?|b\.?tech\.?|master(?:'?s)?|m\.?a\.?|m\.?s\.?|m\.?b\.?a\.?|ph\.?d\.?|associate(?:'?s)?|high\s+school|g\.?e\.?d\.?)\s*(?:degree)?\.?\s*$/i;
  if (EDU_LEVEL_ALT_RE.test(text)) return [text.trim()];

  // Split a clause into sub-clauses around separators, keeping the whole text if it can't split.
  const clauses = text
    .split(/\s*(?:,|;)\s+|\s+and\s+|\s+or\s+/i)
    .map(s => s.trim())
    .filter(Boolean);
  // Drop fragments that are pure conjunction + vague qualifier with no
  // informational content (e.g. "or related field" from "M.S. in Statistics,
  // Data Science, or related field"). Such fragments inflate unrelated resumes:
  // an electrician's "field experience" would otherwise "exactly match" the
  // "related field" fragment. The leniency lives on the education requirement,
  // which already handles "or related".
  const junkRe = /^(?:and|or|&)?\s*(?:related\s*(?:field|degree|discipline)?|similar\s*(?:field|degree)?|equivalent\s*(?:field|degree)?|comparable\s*(?:field|experience)?|etc\.?|like\s+this|such\s+as|and\/or|preferred|desired|plus)$/i;
  const filtered = clauses.filter(c => !junkRe.test(c));
  return (filtered.length > 0 ? filtered : [text.trim()]);
}

export function extractRequirements(jdText: string): Requirement[] {
  const lines = jdText.split(/\r?\n/).map(l => l.trim());
  const reqs: Requirement[] = [];

  let currentSection: SectionRule = { importance: 'REQUIRED', patterns: [] };
  let foundAnyHeader = false;
  let inBulletBlock = false;
  let blockBuf: string[] = [];

  const flushBlock = () => {
    if (blockBuf.length === 0) return;
    if (currentSection.importance !== 'CONTEXT') {
      const blockText = blockBuf.join(' ');
      const clauses = splitRequirementText(blockText);
      for (const clause of clauses) {
        const r = buildRequirement(clause, currentSection.importance, reqs.length);
        if (r) reqs.push(r);
      }
    }
    blockBuf = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushBlock();
      inBulletBlock = false;
      continue;
    }

    const hdr = isSectionHeader(line);
    if (hdr.header && hdr.importance) {
      flushBlock();
      foundAnyHeader = true;
      currentSection = { importance: hdr.importance, patterns: [] };
      inBulletBlock = true;
      continue;
    }

    const looksBullet = /^[-•*‣⁃–—>|▪◦]\s+/.test(line) || /^\d+[.)]\s+/.test(line);
    const shortLine = line.length <= 120;

    if (looksBullet) {
      // Each bullet is its own requirement — flush any pending continuation block first.
      flushBlock();
      const content = line.replace(/^[-•*‣⁃–—>|▪◦]\s+|\d+[.)]\s+/, '');
      if (currentSection.importance !== 'CONTEXT') {
        const clauses = splitRequirementText(content);
        for (const clause of clauses) {
          const r = buildRequirement(clause, currentSection.importance, reqs.length);
          if (r) reqs.push(r);
        }
      }
      inBulletBlock = false;
    } else if (shortLine && foundAnyHeader) {
      // Continuation line — buffer it so multi-line clauses stay one requirement.
      blockBuf.push(line);
      inBulletBlock = true;
    } else if (shortLine && !foundAnyHeader) {
      // No section headers at all — treat substantive short lines as REQUIRED requirements.
      const r = buildRequirement(line, 'REQUIRED', reqs.length);
      if (r) reqs.push(r);
    } else {
      flushBlock();
      inBulletBlock = false;
    }
  }
  flushBlock();

  // Dedupe by (text, importance) — keep first occurrence.
  const seen = new Set<string>();
  const unique = reqs.filter(r => {
    const key = `${r.importance}::${r.text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique;
}

const EDU_LEVEL_ORDER = ['ASSOCIATE', 'BA', 'BACHELOR', 'BS', 'BE', 'BTECH', 'MA', 'MASTER', 'MS', 'ME', 'MBA', 'PHD', 'DOCTORATE'];

function buildRequirement(text: string, importance: Importance, id: number): Requirement | null {
  const concepts = findConceptsInText(text).filter(c => conceptCategory(c) !== 'language');
  const lower = text.toLowerCase();

  const yearsMatch = lower.match(/(\d+)\s*[+-]?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|work|hands-on)?/);
  const yearsRequired = yearsMatch ? parseInt(yearsMatch[1], 10) : undefined;
  if (yearsRequired && (yearsRequired < 0 || yearsRequired > 40)) return null;

  const seniorityWords = ['senior', 'lead', 'principal', 'staff', 'manager', 'director', 'architect', 'head', 'vp', 'vice president', 'executive', 'cfo', 'cto', 'ceo'];
  const seniority = seniorityWords.find(w => new RegExp(`\\b${escapeRe(w)}\\b`, 'i').test(text));

  let educationLevel: string | undefined;
  const eduMatch = lower.match(/\b(bachelor(?:'?s)?|b\.?a\.?|a\.?b\.?|b\.?s\.?|b\.?e\.?|b\.?tech\.?|master(?:'?s)?|m\.?a\.?|m\.?s\.?|m\.?b\.?a\.?|m\.?e\.?|ph\.?d\.?|doctorate|associate(?:'?s)?|high school diploma|high school|g\.?e\.?d\.?)\b/);
  if (eduMatch) {
    const level = eduMatch[1].replace(/\./g, '').toUpperCase();
    const norm = EDU_LEVEL_ORDER.find(o => level.startsWith(o)) || (level.includes('BACHELOR') ? 'BACHELOR' : level.includes('MASTER') ? 'MASTER' : undefined);
    educationLevel = norm || level;
  }

  // Education field ("M.S. in Statistics" -> field "Statistics"). Used to avoid
  // granting full credit for a degree in an unrelated field.
  let educationField: string | undefined;
  const fieldMatch = lower.match(/\b(?:in|of)\s+([a-z][a-z0-9 ,+./-]{2,48}?)(?:,|\(|\bor\b|\brelated\b|\bpreferred\b|\bdesired\b|\bdegree\b|$)/i);
  if (fieldMatch && educationLevel) {
    const raw = fieldMatch[1].replace(/\b(?:field|major|concentration|emphasis)\b/g, '').trim();
    if (raw && raw.length >= 2 && !/^(the|our|a|an|this|that)$/.test(raw)) educationField = raw;
  }

  const certConcepts = concepts.filter(c => conceptCategory(c) === 'certification');

  const locationMatch = text.match(/\b(remote|hybrid|onsite|on-site|in\s+(?:office|person)|travel|relocation)\b/i);
  const location = locationMatch ? locationMatch[1] : undefined;

  // Work authorization / legal eligibility is an explicit, scorable requirement.
  let workAuthorization: string | undefined;
  const authMatch = text.match(
    /\b((?:authorized?|eligible|legally)\s+to\s+work|work\s+authorization|visa\s+sponsorship|sponsorship|green\s+card|permanent\s+resident|us\s+citizen|citizen(?:ship)?|security\s+clearance|clearance)s?\b/i,
  );
  if (authMatch) workAuthorization = authMatch[1];

  // Licensing is a distinct, evidence-gated credential type — NOT a skill.
  // "Current RN license required" must not be matched by an unrelated skill like
  // "ICU". A license is only satisfied by explicit license/certification evidence.
  let license: string | undefined;
  const licenseWord = /\b(?:licen[cs]e|licensur|licen[cs]ed)\b/i.test(lower);
  if (licenseWord) {
    license = certConcepts[0] || concepts[0];
  }

  // Certification concept OR explicit "certified"/"certification" wording.
  const isCertification = certConcepts.length > 0
    || /\b(certified|certification|certificate|credential(?:s)?|accreditation(?:s)?)\b/i.test(lower);

  // Determine requirement type
  let type = 'other_explicit_requirement';
  if (importance === 'CONTEXT') {
    type = 'other';
  } else if (workAuthorization) {
    type = 'work_authorization';
  } else if (licenseWord) {
    type = 'license';
  } else if (isCertification) {
    type = 'certification';
  } else if (yearsRequired) {
    // Skill- or domain-specific years (has a non-language concept) is its own type;
    // generic "N+ years of experience" is plain years.
    type = concepts.length > 0 ? 'skill_years' : 'years';
  } else if (seniority) {
    type = 'seniority';
  } else if (educationLevel) {
    type = 'education';
  } else if (location) {
    // Location is the employer's setup constraint, not a candidate qualification.
    type = 'location';
  } else if (concepts.length) {
    const cat = conceptCategory(concepts[0]);
    type = cat === 'soft-skill' || cat === 'communication' ? 'soft_skill'
      : cat === 'methodology' ? 'methodology'
      : cat === 'domain' ? 'domain_experience'
      : cat === 'language' ? 'language'
      : cat === 'management' || cat === 'leadership' ? 'leadership'
      : 'skill';
  }

  if (type === 'other_explicit_requirement' && importance === 'RESPONSIBILITY') {
    type = 'responsibility';
  }

  // A generic years requirement with a domain qualifier that has no taxonomy
  // concept ("5+ years of experience in corporate finance", "product design
  // experience") carries that domain so EXACT can't be granted from raw career
  // length alone — 7 years as an electrician is not 7 years in corporate
  // finance. Only the qualifier is kept; stopwords and the years phrase strip
  // out.
  let yearsDomain: string | undefined;
  if (type === 'years') {
    const withoutYears = text
      .replace(/\d+\s*[+-]?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|work|hands-on)?/i, '')
      .trim();
    const stop = new Set(['and', 'or', 'the', 'a', 'an', 'of', 'in', 'for', 'with', 'to', 'within', 'at', 'on', 'plus']);
    const words = withoutYears.toLowerCase()
      .replace(/[^a-z0-9\s]/gi, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stop.has(w));
    // Keep only a tight window so we don't accidentally capture "experience".
    const domain = [...new Set(words.filter(w => w !== 'experience'))].slice(0, 4);
    if (domain.length > 0 && domain[0] !== 'experience') yearsDomain = domain.join(' ');
  }

  let note: string | undefined;
  if (type === 'other_explicit_requirement') {
    note = 'Explicit requirement with no taxonomy match — kept for denominator integrity; scored on raw phrase overlap only.';
  } else if (type === 'location') {
    note = 'Location is employer setup, not a candidate qualification; excluded from the scored denominator.';
  }

  // CONTEXT sections (about/company) carry no requirements.
  if (type === 'other' || importance === 'CONTEXT') return null;
  // Location ("remote/hybrid") is the employer's setup, not a candidate
  // qualification — excluded from the scored pool by design.
  if (type === 'location') return null;

  return {
    id,
    text: text.trim(),
    type,
    importance,
    concepts,
    yearsRequired,
    seniority,
    educationLevel,
    educationField,
    certification: certConcepts[0],
    license,
    location,
    workAuthorization,
    yearsDomain,
    parsedNote: note,
  };
}

// ---------------------------------------------------------------------------
// Resume evidence extraction
// ---------------------------------------------------------------------------

const SENIORITY_TERMS = ['senior', 'lead', 'principal', 'staff', 'manager', 'director', 'architect', 'head', 'vp', 'vice president', 'executive'];

export function buildResumeProfile(resumeText: string): ResumeProfile {
  // Normalize intra-line whitespace to single spaces so that a resume reformatted
  // with tabs (or double spaces) parses identically — formatting must never change
  // the semantic profile. Line boundaries are preserved.
  resumeText = resumeText.replace(/[ \t]+/g, ' ').trim();
  const lower = resumeText.toLowerCase();
  const concepts = new Set<string>(findConceptsInText(resumeText));
  const conceptCategoryMap = new Map<string, ConceptCategory>();
  concepts.forEach(t => conceptCategoryMap.set(t, conceptCategory(t)));

  const certifications = new Set<string>();
  concepts.forEach(t => {
    if (conceptCategory(t) === 'certification') certifications.add(t);
  });

  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Credentials stated in an explicit license/credential context. A line like
  // "B.S. in Nursing, 2018, RN license, ACLS, BLS" or "Series 7 licensed" proves
  // the credential; a bare Skills-list mention does not. Only these count toward
  // a license-gated requirement so an unrelated skill can never satisfy one.
  const licenses = new Set<string>();
  const licenseContextRe = /\b(licen[cs]e|licensur|licen[cs]ed|credential(?:s)?|bar\s+admission|admitted\s+to\s+practice)\b/i;
  for (const line of lines) {
    if (!licenseContextRe.test(line)) continue;
    findConceptsInText(line).forEach(t => licenses.add(t));
  }
  // Any standalone certification heading ("Certifications / Licenses: RN, CPA")
  // also counts — the section itself is the credential context.
  const licenseSection = resumeText.match(/(?:^|\n)\s*(certifications?|licenses?|licensures?)\s*:?\s*\n([\s\S]*?)(?=\n\s*\w[\w\s]{2,}\s*:|\n\s*experience\b|\n\s*skills\b|\n\s*education\b|$)/i);
  if (licenseSection && licenseSection[2]) {
    findConceptsInText(licenseSection[2]).forEach(t => licenses.add(t));
  }
  // "Registered Nurse at Memorial (2020 - Present)" role titles reinforce license
  // evidence. Bare skills-list mentions ("RN, ICU, critical care, ...") do NOT —
  // listing a credential as a keyword is a stated capability, not proof of the
  // license. Only role-title lines (which carry a date range) qualify here.
  const dateRangeLooseRe = /\b(19\d\d|20\d\d)\s*[-–—]\s*(19\d\d|20\d\d|present|current|now)\b/i;
  for (const line of lines) {
    if (!dateRangeLooseRe.test(line)) continue;
    if (!/\b(registered\s+nurse|lpn|rn|r\.?n\.?|doctor|physician|attorney|lawyer)\b/i.test(line)) continue;
    findConceptsInText(line).forEach(t => {
      if (conceptCategory(t) === 'healthcare' || conceptCategory(t) === 'certification' || conceptCategory(t) === 'legal') licenses.add(t);
    });
  }

  const seniority = new Set<string>(SENIORITY_TERMS.filter(w => new RegExp(`\\b${escapeRe(w)}\\b`, 'i').test(resumeText)));

  // Roles: date-range lines define a role; bullets after belong to it.
  const roles: RoleEvidence[] = [];
  let currentRole: RoleEvidence | null = null;
  const dateRangeRe = /\b(19\d\d|20\d\d)\s*[-–—]\s*(19\d\d|20\d\d|present|current|now)\b/i;
  const roleSpan = (title: string): { start?: number; end?: number } => {
    const m = title.match(/\b(19\d\d|20\d\d)\s*[-–—]\s*(19\d\d|20\d\d|present|current|now)\b/i);
    if (!m) return {};
    const start = parseInt(m[1], 10);
    const second = m[2].toLowerCase();
    const end = second === 'present' || second === 'current' || second === 'now' ? new Date().getFullYear() : parseInt(m[2], 10);
    return { start, end };
  };

  // Concepts evidenced in actual work (role titles + bullets), not merely listed
  // in a Skills section. Only evidenced concepts earn full EXACT match credit.
  const evidenceConcepts = new Set<string>();
  const conceptYears = new Map<string, number>();
  const conceptLatestYear = new Map<string, number>();
  const accrueConcept = (c: string, span: { start?: number; end?: number }) => {
    evidenceConcepts.add(c);
    if (span.start !== undefined && span.end !== undefined && span.end >= span.start) {
      const yrs = Math.max(1, Math.round((span.end - span.start) * 10) / 10);
      conceptYears.set(c, Math.max(yrs, conceptYears.get(c) || 0));
      conceptLatestYear.set(c, Math.max(span.end, conceptLatestYear.get(c) || 0));
    }
  };

  for (const line of lines) {
    if (dateRangeRe.test(line)) {
      const span = roleSpan(line);
      const titleConcepts = findEvidencedConceptsInText(line);
      currentRole = { title: line, concepts: titleConcepts, bullets: [], ...span };
      roles.push(currentRole);
      titleConcepts.forEach(c => accrueConcept(c, span));
    } else if (currentRole) {
      if (/^[-•*‣⁃–—>|▪◦]\s+|\d+[.)]\s+/.test(line)) {
        const bulletText = line.replace(/^[-•*‣⁃–—>|▪◦]\s+|\d+[.)]\s+/, '');
        currentRole.bullets.push(bulletText);
        const bulletConcepts = findEvidencedConceptsInText(bulletText);
        currentRole.concepts = [...new Set([...currentRole.concepts, ...bulletConcepts])];
        bulletConcepts.forEach(c => accrueConcept(c, currentRole));
      } else if (currentRole.bullets.length === 0) {
        // Title continuation
        currentRole.title += ' — ' + line;
      }
    }
  }

  // Summary section: keywords stated there are also treated as evidenced intent.
  const summarySection = lower.match(/(?:^|\n)(?:summary|professional summary|objective|profile)\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:experience|work history|education|skills|certifications)\b|$)/i);
  if (summarySection && summarySection[1]) {
    const now = { start: new Date().getFullYear() - 2, end: new Date().getFullYear() };
    findConceptsInText(summarySection[1]).forEach(c => accrueConcept(c, now));
  }

  // Certain roles ARE communication work: customer-facing support, social and
  // content marketing, editorial and brand roles all demonstrate the transferable
  // "communication" skill even when the resume never writes the word. Evidencing
  // such a role also evidences "communication", so a communication requirement is
  // creditable from demonstrated work rather than a lucky keyword. This lets a
  // communications-adjacent candidate (say, a social-media associate) outscore a
  // genuinely unrelated specialist on a people-focused JD.
  const COMMUNICATION_AFFIRMING = [
    'customer service', 'social media', 'email marketing', 'content marketing',
    'copywriting', 'public relations', 'presentation skills', 'public speaking',
    'storytelling', 'content strategy', 'client relations', 'support',
  ];
  const affirmingEvidence = [...evidenceConcepts].filter(c => COMMUNICATION_AFFIRMING.includes(c));
  if (affirmingEvidence.length > 0 && !evidenceConcepts.has('communication')) {
    evidenceConcepts.add('communication');
    concepts.add('communication');
    conceptCategoryMap.set('communication', conceptCategory('communication'));
    const spanYears = affirmingEvidence.map(c => conceptYears.get(c) || 0).reduce((a, b) => Math.max(a, b), 0);
    if (spanYears > 0) conceptYears.set('communication', Math.max(1, spanYears));
    const latestAnchor = [...conceptLatestYear.values()].reduce((a, b) => Math.max(a, b), 0);
    if (latestAnchor > 0) conceptLatestYear.set('communication', latestAnchor);
  }

  // Frontline communication behaviors — answering phones, staffing/scheduling
  // meetings, greeting and checking in guests, resolving customer/guest
  // requests — are hand-verified verbal-communication work. An office or
  // service assistant who "scheduled meetings and answered phones" genuinely
  // demonstrates the communication a people-focused JD asks for; the literal
  // word "communication" need not appear on the page. These are real resume
  // behaviors, not bare keyword mentions, so they earn evidenced credit.
  if (!evidenceConcepts.has('communication')) {
    const COMM_BEHAVIOR_RE = new RegExp(
      String.raw`\b(?:answered?(?: the)?\s+(?:phones?|calls?|inquiries?|queries?)|` +
      String.raw`answered?\s+(?:customer|client|guest)\s+(?:inquiries?|queries?|calls?)|` +
      String.raw`scheduled?\s+(?:and\s+coordinated\s+)?(?:meetings?|appointments?|calls?)|` +
      String.raw`greeted?\s+(?:guests?|customers?|visitors?)|` +
      String.raw`checked\s+in\s+(?:guests?|clients?|customers?)|` +
      String.raw`assisted?\s+(?:customers?|clients?|guests?|callers?)|` +
      String.raw`resolved?\s+(?:customer|client|guest)\s+(?:requests?|issues?|queries?|tickets?)|` +
      String.raw`liaised?\s+with|communicated\s+with)\b`,
      'i',
    );
    const behaviorFound = roles.some(r =>
      r.bullets.some(b => COMM_BEHAVIOR_RE.test(b)) || COMM_BEHAVIOR_RE.test(r.title));
    if (behaviorFound) {
      evidenceConcepts.add('communication');
      concepts.add('communication');
      conceptCategoryMap.set('communication', conceptCategory('communication'));
      const latestAnchor = [...conceptLatestYear.values()].reduce((a, b) => Math.max(a, b), 0);
      if (latestAnchor > 0) conceptLatestYear.set('communication', latestAnchor);
    }
  }

  // Education level + field
  const eduSection = lower.match(/(?:^|\n)education\b[\s\S]*?(?=\n\s*\w[\w\s]{2,}\s*:|\n\s*experience\b|\n\s*skills\b|\n\s*certifications\b|$)/i);
  const eduText = eduSection ? eduSection[0] : lower;
  let educationLevel: string | undefined;
  const eduLevelMatch = eduText.match(/\b(bachelor(?:'?s)?|b\.?a\.?|a\.?b\.?|b\.?s\.?|b\.?e\.?|b\.?tech\.?|master(?:'?s)?|m\.?a\.?|m\.?s\.?|m\.?b\.?a\.?|m\.?e\.?|ph\.?d\.?|doctorate|associate(?:'?s)?|high school|g\.?e\.?d\.?)\b/);
const EDU_LEVEL_ORDER = ['HIGHSCHOOL', 'GED', 'ASSOCIATE', 'BA', 'BACHELOR', 'BS', 'BE', 'BTECH', 'MA', 'MASTER', 'MS', 'ME', 'MBA', 'PHD', 'DOCTORATE'];
  if (eduLevelMatch) {
    const level = eduLevelMatch[1].replace(/[.\s]/g, '').toUpperCase();
    const norm = EDU_LEVEL_ORDER.find(o => level.startsWith(o)) || (level.includes('BACHELOR') ? 'BACHELOR' : level.includes('MASTER') ? 'MASTER' : undefined);
    educationLevel = norm || level;
  }
  const eduFieldMatch = eduText.match(/\bin\s+([a-z0-9 &+.-]{2,40})/i);
  const educationField = eduFieldMatch ? eduFieldMatch[1].trim() : undefined;

  return {
    concepts,
    conceptCategory: conceptCategoryMap,
    roles,
    years: estimateResumeYears(resumeText),
    conceptYears,
    conceptLatestYear,
    certifications,
    licenses,
    seniority,
    educationLevel,
    educationField,
    allText: resumeText,
    evidenceConcepts,
  };
}

export function estimateResumeYears(text: string): number {
  const yearRangeRegex = /\b(19\d\d|20\d\d)\s*[-–—]\s*(19\d\d|20\d\d|present|current|now)\b/gi;
  const matches = [...text.matchAll(yearRangeRegex)];

  let rangeYears = 0;
  if (matches.length > 0) {
    let totalMonths = 0;
    const ranges: { start: number; end: number }[] = matches.map(m => {
      const start = parseInt(m[1], 10);
      const second = m[2].toLowerCase();
      const end = second === 'present' || second === 'current' || second === 'now'
        ? new Date().getFullYear()
        : parseInt(second, 10);
      return { start, end };
    }).filter(r => r.end >= r.start);

    // Merge overlapping ranges to avoid double counting concurrent roles.
    ranges.sort((a, b) => a.start - b.start);
    let merged: { start: number; end: number }[] = [];
    for (const r of ranges) {
      const last = merged[merged.length - 1];
      if (last && r.start <= last.end) {
        last.end = Math.max(last.end, r.end);
      } else {
        merged.push({ ...r });
      }
    }
    totalMonths = merged.reduce((sum, r) => sum + (r.end - r.start) * 12, 0);
    rangeYears = Math.round(totalMonths / 12);
  }

  const yearsRegex = /(\d+)\s*\+?\s*(?:-\s*)?(?:years?|yrs?)\s+(?:of\s+)?(?:hands-on\s+)?(?:professional\s+)?experience/i;
  const match = text.match(yearsRegex);
  const explicitYears = match ? parseInt(match[1], 10) : 0;

  return Math.max(rangeYears, explicitYears);
}

// ---------------------------------------------------------------------------
// Semantic matching
// ---------------------------------------------------------------------------

export function evaluateRequirement(req: Requirement, profile: ResumeProfile): RequirementMatch {
  const evidenceFor = (term: string): string => {
    if (!term) return '';
    // Find the bullet/line that contains the matched concept.
    const needle = new RegExp(escapeRe(term).replace(/\\s/g, '\\s'), 'i');
    const bullet = profile.roles.flatMap(r => r.bullets).find(b => needle.test(b));
    if (bullet) return bullet;
    const line = profile.allText.split(/\r?\n/).find(l => needle.test(l));
    if (line) return line.trim();
    return '';
  };

  const evidenceForAny = (terms: string[]): string => {
    for (const t of terms) {
      const ev = evidenceFor(t);
      if (ev) return ev;
    }
    return '';
  };

  const resolved = resolveRequirementMatch(req, profile);
  const { level, matchTerm } = resolved;
  const gap = level === 'MISSING' || level === 'CONFLICT';
  const evidence = gap ? '' : evidenceForAny(matchTerm ? [matchTerm] : req.concepts);

  return {
    ...req,
    level,
    matchStrength: gap ? MISSING_FLOORS[req.importance] : MATCH_STRENGTH[level],
    evidence,
    gap,
  };
}

// A concept counts as evidenced when it appears in role titles/bullets or the
// summary directly, or when a directly-evidenced concept is related to it via
// the same family (e.g. JS framework "react" evidences language "javascript")
// or a shared head token (e.g. "react" evidences "react native").
// Fraction of the requirement's substantive tokens that appear in the resume.
// Used for generic/untyped requirements that the taxonomy can't classify, so
// they are still scored honestly instead of being silently zeroed.
function phraseOverlap(reqText: string, resumeText: string): number {
  const stop = new Set(['and', 'the', 'for', 'with', 'your', 'you', 'our', 'are', 'is', 'to', 'a', 'an', 'of', 'in', 'on', 'at', 'by', 'or', 'their', 'its', 'from', 'that', 'this', 'experience']);
  const words = (t: string): string[] =>
    t.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
  const reqWords = [...new Set(words(reqText))];
  if (reqWords.length === 0) return 0;
  const resumeLower = resumeText.toLowerCase();
  let matched = 0;
  for (const w of reqWords) {
    if (new RegExp(`\\b${escapeRe(w)}\\b`).test(resumeLower)) matched++;
  }
  return matched / reqWords.length;
}

// Count how many distinct content words of the requirement appear verbatim in the
// resume. Used to distinguish real clause overlap from single-vocabulary friction
// ("design" on a mechanical engineer's resume is not "design" the PM deliverable).
function matchedWordCount(reqText: string, resumeText: string): number {
  const stop = new Set(['and', 'the', 'for', 'with', 'your', 'you', 'our', 'are', 'is', 'to', 'a', 'an', 'of', 'in', 'on', 'at', 'by', 'or', 'their', 'its', 'from', 'that', 'this', 'experience']);
  const words = (t: string): string[] =>
    t.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
  const reqWords = [...new Set(words(reqText))];
  const resumeLower = resumeText.toLowerCase();
  let matched = 0;
  for (const w of reqWords) {
    if (new RegExp(`\\b${escapeRe(w)}\\b`).test(resumeLower)) matched++;
  }
  return matched;
}

function conceptHasEvidence(concept: string, profile: ResumeProfile): boolean {
  if (profile.evidenceConcepts.has(concept)) return true;
  const fam = conceptFamily(concept);
  const head = concept.split(' ')[0];
  for (const ev of profile.evidenceConcepts) {
    if (fam && conceptFamily(ev) === fam) return true;
    if (ev === concept) return true;
    if (head.length > 2 && (ev.split(' ')[0] === head || ev.includes(concept) || concept.includes(ev))) return true;
  }
  return false;
}

// The bare profession noun of a job title ("Senior Product Designer" -> "designer",
// "Software Engineer at Acme (2020 - Present)" -> "engineer"). Used to recognize
// when a candidate's role is in the same profession as a posting title whose
// specialization prefix differs.
function roleHeadNoun(text: string): string | undefined {
  let t = text
    .replace(/\((?:19|20)\d\d[^)]*\)/g, ' ')  // drop (2020 - Present)
    .replace(/\b(?:19|20)\d\d\s*[-–—]\s*(?:19|20\d\d|present|current|now)\b/gi, ' ')
    .split(/\bat\b/i)[0];  // drop " at <company>"
  const skip = new Set(['inc', 'llc', 'ltd', 'corp', 'company', 'co', 'group', 'consulting', 'services', 'systems', 'hospital', 'medical', 'clinic', 'center', 'university', 'firm', 'llp', 'plc']);
  const words = t.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(w => w.length > 1);
  while (words.length && skip.has(words[words.length - 1])) words.pop();
  return words.length ? words[words.length - 1] : undefined;
}

function resolveRequirementMatch(
  req: Requirement,
  profile: ResumeProfile
): { level: MatchLevel; matchTerm?: string } {
  if (req.importance === 'CONTEXT') return { level: 'MISSING' };

  if ((req.type === 'years' || req.type === 'skill_years') && req.yearsRequired !== undefined) {
    // "5+ years of experience with React" — judge on the React-specific career
    // years (derived from role date ranges), not total career length. An office
    // assistant with 6 years total does not satisfy "5+ years with React".
    const skillConcepts = req.concepts.filter(c => conceptCategory(c) !== 'language');
    const target = skillConcepts[0];
    const skillYears = (target && profile.conceptYears.get(target)) || 0;
    const requiredPool = skillConcepts.length > 0 ? skillYears : profile.years;
    const now = new Date().getFullYear();

    // Recency: requirements explicitly about CURRENT/RECENT skill use must be met
    // by work that is actually recent — React from 2012 cannot satisfy "recent
    // React". A stale-but-real skill earns PARTIAL credit, not full. Evaluated
    // before the plain years gate so it can override it.
    const recencyReq = /\b(recent|current|latest|up\s*to\s*date|202\d)\b/i.test(req.text);
    if (recencyReq && skillConcepts.length > 0) {
      const latestYear = (target && profile.conceptLatestYear.get(target)) || 0;
      const recentEnough = latestYear >= now - 4;
      if (requiredPool >= req.yearsRequired && recentEnough) return { level: 'EXACT' };
      if (requiredPool >= req.yearsRequired) return { level: 'PARTIAL' };
      if (conceptHasEvidence(target, profile)) return { level: 'PARTIAL' };
      return { level: 'MISSING' };
    }

    const evidencedSkillYears = skillConcepts.length === 0 // pure "5+ years experience"
      || (skillConcepts.every(c => conceptHasEvidence(c, profile)) && skillYears >= req.yearsRequired);

    // A generic years requirement that names a specific domain ("5+ years in
    // corporate finance") must not be satisfied by unrelated career length — 8
    // years as a structural engineer is not 5 years of product design. EXACT
    // needs the domain phrase present on the resume; otherwise partial only —
    // AND even partial credit demands some domain affinity ("billing" work is
    // in the finance family), so a career spent entirely outside the named
    // discipline resolves MISSING, not PARTIAL.
    if (req.type === 'years' && req.yearsDomain) {
      const lower = profile.allText.toLowerCase();
      const domainWords = req.yearsDomain.split(' ').filter(w => w.length > 2 && w !== 'experience');
      const domainOk = domainWords.length > 0
        && domainWords.every(w => new RegExp(`\\b${escapeRe(w)}\\b`).test(lower));
      const domConcepts = findConceptsInText(req.yearsDomain);
      const domAffinity = [...profile.concepts].some(pc =>
        domConcepts.some(dc => {
          const fam = conceptFamily(dc);
          return fam && conceptFamily(pc) === fam;
        }));
      if (requiredPool >= req.yearsRequired && evidencedSkillYears && domainOk) return { level: 'EXACT' };
      if (evidencedSkillYears && (domainOk || domAffinity)) return { level: 'PARTIAL' };
      return { level: 'MISSING' };
    }

    if (requiredPool >= req.yearsRequired && evidencedSkillYears) return { level: 'EXACT' };

    // EQUIVALENT: the requirement names a broad capability ("5+ years building
    // scalable cloud-native services") and the resume evidences the concrete
    // technologies that ARE that capability (Kubernetes/cloud work) for long
    // enough. Years come from the exemplar concepts' role spans.
    if (skillConcepts.length > 0) {
      const exemplarYearMax = skillConcepts
        .map(c => CAPABILITY_EXEMPLARS[c])
        .filter(Boolean)
        .flatMap(es => es.map(e => profile.conceptYears.get(e) || 0))
        .reduce((a, b) => Math.max(a, b), 0);
      const shown = skillConcepts
        .some(c => (CAPABILITY_EXEMPLARS[c] || []).some(e => profile.evidenceConcepts.has(e)));
      if (shown && exemplarYearMax >= req.yearsRequired) return { level: 'EQUIVALENT' };
      if (shown && exemplarYearMax >= req.yearsRequired * 0.6) return { level: 'PARTIAL' };
    }

    if (requiredPool >= req.yearsRequired * 0.6) return { level: 'PARTIAL' };
    // Partial floor even with the right discipline but insufficient depth.
    if (skillConcepts.length > 0 && conceptHasEvidence(target, profile)) return { level: 'PARTIAL' };
    // Total-career-years floor: ONLY for a generic "5+ years of experience"
    // requirement (no named discipline). A requirement that names a specific
    // skill ("5+ years of product management") cannot be satisfied by unrelated
    // career length — 4 years as a marketing associate is not 4 years of PM —
    // so without that skill evidenced it resolves MISSING, same as an unrelated
    // candidate. This keeps Weak (some signal) above Unrelated (none).
    if (skillConcepts.length === 0 && profile.years >= req.yearsRequired * 0.6) return { level: 'PARTIAL' };
    return { level: 'MISSING' };
  }

  if (req.type === 'license' && req.license) {
    // A license is only satisfied by explicit license/credential evidence
    // ("RN license", "Series 7 licensed", a Certifications header, or an RN
    // role title). A bare Skills-list or keyword mention is a stated capability,
    // NOT proof of a license, so it scores as MISSING — this is a hard gate.
    if (profile.licenses.has(req.license)) return { level: 'EXACT', matchTerm: req.license };
    // A different but family-related credential (e.g. req CPA, resume CMA) is related.
    const reqFam = conceptFamily(req.license);
    const related = [...profile.licenses].find(c => c !== req.license && conceptFamily(c) === reqFam);
    if (related) return { level: 'RELATED', matchTerm: related };
    return { level: 'MISSING' };
  }

  if (req.type === 'work_authorization') {
    // Employer-facing legal eligibility is not usually printed on a resume, but an
    // explicit statement ("authorized to work in the US") is the proof we can see.
    const authPhrase = req.workAuthorization || req.text;
    const resumeAuth = /\b(authorized?|eligible)\s+to\s+work|work\s+authorization|principals?|us\s+citizen|permanent\s+resident|green\s+card|visa\s+sponsorship\b/i.test(profile.allText);
    if (resumeAuth && phraseOverlap(req.text, profile.allText) >= 0.5) return { level: 'EXACT' };
    if (resumeAuth) return { level: 'PARTIAL' };
    return { level: 'MISSING' };
  }

  if (req.type === 'seniority' && req.seniority) {
    if (profile.seniority.has(req.seniority)) return { level: 'EXACT', matchTerm: req.seniority };
    // A "manager" JD with a resume showing leadership/team skills is a related signal.
    const leadershipFamilies = ['leadership', 'management'];
    const hasLeadership = [...profile.concepts].some(t => leadershipFamilies.includes(conceptCategory(t)));
    if (hasLeadership) return { level: 'RELATED' };
    return { level: 'MISSING' };
  }

  if (req.type === 'certification' && req.certification) {
    if (profile.certifications.has(req.certification)) return { level: 'EXACT', matchTerm: req.certification };
    const reqFam = conceptFamily(req.certification);
    const related = [...profile.certifications].some(c => conceptFamily(c) === reqFam && c !== req.certification);
    if (related) return { level: 'RELATED' };
    return { level: 'MISSING' };
  }

  if (req.type === 'education' && req.educationLevel) {
    if (!profile.educationLevel) return { level: 'MISSING' };
    const reqIdx = EDU_LEVEL_ORDER.indexOf(req.educationLevel);
    const resIdx = EDU_LEVEL_ORDER.indexOf(profile.educationLevel);
    let base: MatchLevel = 'MISSING';
    if (reqIdx !== -1 && resIdx !== -1) {
      base = resIdx >= reqIdx ? 'EXACT' : 'PARTIAL';
    } else if (req.educationLevel === profile.educationLevel) {
      base = 'EXACT';
    }
    // Degree FIELD matters when the JD states one strictly (no "or/related"
    // leniency). "B.S. in Nursing" ≠ a B.S. in Biology, even at the same level.
    const lenient = /\b(or|related|equivalent|similar)\b/i.test(req.text);
    if (base === 'EXACT' && !lenient && req.educationField && profile.educationField) {
      const rf = req.educationField.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
      const pf = profile.educationField.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
      const rfWords = rf.split(/\s+/).filter(w => w.length > 2);
      const pfWords = pf.split(/\s+/).filter(w => w.length > 2);
      const overlap = rfWords.some(w => pf.includes(w)) || pfWords.some(w => rf.includes(w));
      if (!overlap) base = 'MISSING';
    }
    return { level: base };
  }

  // Generic explicit requirements with no taxonomy match ("Manage vendor
  // contracts" responsibilities, untyped REQUIRED phrasing). Score honestly on
  // raw phrase overlap of the requirement text against the resume.
  if (req.type === 'other_explicit_requirement' || req.type === 'responsibility') {
    // A posting title line with no taxonomy concepts ("Frontend Engineer") is
    // asking about a profession ("engineer"). A resume that works in that same
    // profession ("Software Engineer at X") is at least PARTIALLY that role —
    // the candidate genuinely is an engineer — even when the specialization
    // prefix differs. The shared profession noun alone never grants FULL credit;
    // specialization and seniority are judged by the surrounding requirements.
    const reqNoun = roleHeadNoun(req.text);
    if (req.type === 'other_explicit_requirement' && reqNoun
      && profile.roles.some(r => roleHeadNoun(r.title) === reqNoun)) {
      return { level: 'PARTIAL' };
    }
    const overlap = phraseOverlap(req.text, profile.allText);
    const matched = matchedWordCount(req.text, profile.allText);
    // Both credit tiers demand at least two distinct content words actually
    // present in the resume. A single shared dictionary word ("design" matching
    // "structural design", or "experience" matching the literal resume header) is
    // vocabulary friction, not evidence — a bare one-word overlap resolves MISSING.
    if (overlap >= 0.5 && matched >= 2) return { level: 'EXACT' };
    if (overlap >= 0.3 && matched >= 2) return { level: 'PARTIAL' };
    return { level: 'MISSING' };
  }

  // Concept-based matching (skills, tools, domain, soft, methodology, responsibilities)
  if (req.concepts.length > 0) {
    // Full EXACT credit only when the concept is evidenced in actual work
    // (role titles/bullets) or the summary. A concept that merely appears in
    // the Skills list — or in bare keyword text with no experience — is a
    // stated capability, not demonstrated work, so it gets PARTIAL credit.
    const foundExact = req.concepts.filter(c => profile.concepts.has(c));
    if (foundExact.length > 0) {
      // Full credit demands the exact concept evidenced in actual work. A
      // family/synonym match (req "Typescript", resume evidences "Javascript")
      // is useful for RELATED credit, but it is not the same as demonstrated
      // TypeScript experience — that earns PARTIAL, since the skill is at least
      // present on the resume.
      const evidenced = foundExact.filter(c => profile.evidenceConcepts.has(c));
      // A multi-concept requirement ("critical care nursing" -> concepts
      // "critical care", "nursing") is only AS specific as its most specific
      // concept. Evidencing just the coarser base ("nursing" — e.g. a CNA whose
      // credential title contains the word) without the qualifying specifier
      // ("critical care") is partial credit, not a full match.
      const reqSpecific = [...req.concepts].sort((a, b) => b.split(' ').length - a.split(' ').length)[0];
      const specEvidenced = req.concepts.length > 1 && profile.evidenceConcepts.has(reqSpecific);
      // "Current React 18 knowledge"/"recent Kubernetes" — a genuinely current
      // skill must be backed by recent work; React from 2012 is a stated skill,
      // not current skill, and earns partial credit only.
      const recencyReq = /\b(recent|current|latest|up\s*to\s*date|202\d)\b/i.test(req.text);
      if (recencyReq && evidenced.length > 0) {
        const now = new Date().getFullYear();
        const target = evidenced[0];
        const latestYear = profile.conceptLatestYear.get(target) || 0;
        if (latestYear >= now - 4) return { level: 'EXACT', matchTerm: target };
        return { level: 'PARTIAL', matchTerm: target };
      }
      if (evidenced.length > 0) {
        if (req.concepts.length > 1 && !specEvidenced) return { level: 'PARTIAL', matchTerm: evidenced[0] };
        return { level: 'EXACT', matchTerm: evidenced[0] };
      }
      return { level: 'PARTIAL', matchTerm: foundExact[0] };
    }

    // Partial: resume has a term that is a prefix/expansion of the concept (e.g.
    // req "react" with resume "react native", or req "react native" with resume
    // "react"). A shared head token alone is NOT enough — "data warehouse" and
    // "data science" both start with "data" but are different disciplines, so a
    // requirement for warehouse modeling must not be credited by a stats degree.
    for (const c of req.concepts) {
      const partial = [...profile.concepts].find(pc =>
        pc !== c && (pc.includes(c) || c.includes(pc)) && pc.split(' ')[0].length > 2);
      if (partial) return { level: 'PARTIAL', matchTerm: partial };
    }

    // EQUIVALENT: the requirement is a broad capability and the resume evidences
    // a concrete technology that is the standard way to do that capability.
    // "cloud-native services" met by Kubernetes work; "container orchestration"
    // met by building a cluster on Kubernetes. This is deliberately checked after
    // the head-token partial so an exact name still wins, but before the generic
    // family fallback which would only grant RELATED.
    for (const c of req.concepts) {
      const exemplars = CAPABILITY_EXEMPLARS[c];
      if (!exemplars) continue;
      const shown = [...profile.evidenceConcepts].find(ev =>
        exemplars.some(e => e === ev || ev.split(' ')[0] === e.split(' ')[0]));
      if (shown) return { level: 'EQUIVALENT', matchTerm: c };
    }

    // Related: same family in resume.
    for (const c of req.concepts) {
      const fam = conceptFamily(c);
      if (fam) {
        const related = [...profile.concepts].find(pc => conceptFamily(pc) === fam && pc !== c);
        if (related) return { level: 'RELATED', matchTerm: related };
      }
    }



    return { level: 'MISSING' };
  }

  // Untyped requirement (e.g. responsibility with no detectable concept).
  return { level: 'MISSING' };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export interface MatchAnalysis {
  jobMatch: number;
  atsScore: number;
  requirementMatches: RequirementMatch[];
  criticalGaps: string[];
  matchedConcepts: string[];
  missingConcepts: string[];
  requirementCount: number;
  requirementsByImportance: Record<Importance, { total: number; matched: number; score: number }>;
}

// Fraction of the JD's 2-3 word phrases that appear verbatim in the resume.
// A high overlap means the resume is essentially a copy-paste of the posting.
function jdResumePhraseOverlap(jdText: string, resumeText: string): number {
  const stop = new Set(['and', 'the', 'for', 'with', 'your', 'you', 'our', 'are', 'is', 'to', 'a', 'an', 'of', 'in', 'on', 'at', 'by']);
  const tokenize = (t: string): string[] =>
    t.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(w => w && !stop.has(w));
  const phrases = (t: string): Set<string> => {
    const w = tokenize(t);
    const set = new Set<string>();
    for (let i = 0; i < w.length; i++) {
      if (i + 1 < w.length) set.add(w[i] + ' ' + w[i + 1]);
      if (i + 2 < w.length) set.add(w[i] + ' ' + w[i + 1] + ' ' + w[i + 2]);
    }
    return set;
  };
  const jd = phrases(jdText);
  if (jd.size === 0) return 0;
  const rs = phrases(resumeText);
  let matched = 0;
  jd.forEach(p => { if (rs.has(p)) matched++; });
  return matched / jd.size;
}

export function analyzeMatch(resumeText: string, jdText: string): MatchAnalysis {
  const profile = buildResumeProfile(resumeText);
  const requirements = extractRequirements(jdText).filter(r => r.importance !== 'CONTEXT');
  const matches = requirements.map(r => evaluateRequirement(r, profile));

  // Job Match = weighted sum of match strength / weighted total.
  let totalWeight = 0;
  let earned = 0;
  matches.forEach(m => {
    const w = IMPORTANCE_WEIGHTS[m.importance];
    totalWeight += w;
    earned += m.matchStrength * w;
  });

  let jobMatch = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;

  // Verbatim-copy guard: a resume that is largely a copy-paste of the JD
  // deserves a modest boost, not a perfect score. A candidate who literally
  // restates every requirement earns credit for the words, but a genuine
  // match requires independent evidence — so we cap the ceiling.
  const overlap = jdResumePhraseOverlap(jdText, resumeText);
  if (overlap >= 0.5) {
    jobMatch = Math.min(jobMatch, 90);
  }

  // License/certification gate: a REQUIRED license or certification that is
  // genuinely absent caps the ceiling hard. A candidate may match EVERY other
  // keyword, but without the mandatory credential ("CPA required", "Current RN
  // license") they cannot credibly be an Excellent match. This prevents many
  // minor matches from masking a single decisive credential gap.
  const hasUnmetCredentialGap = matches.some(m =>
    m.importance === 'REQUIRED' && m.gap && (m.type === 'license' || m.type === 'certification'));
  if (hasUnmetCredentialGap) {
    jobMatch = Math.min(jobMatch, LICENSE_GAP_CAP);
  }

  const byImportance: Record<Importance, { total: number; matched: number; score: number }> = {
    REQUIRED: { total: 0, matched: 0, score: 0 },
    PREFERRED: { total: 0, matched: 0, score: 0 },
    NICE_TO_HAVE: { total: 0, matched: 0, score: 0 },
    RESPONSIBILITY: { total: 0, matched: 0, score: 0 },
    CONTEXT: { total: 0, matched: 0, score: 0 },
  };
  matches.forEach(m => {
    const b = byImportance[m.importance];
    b.total++;
    if (!m.gap) b.matched++;
  });
  (Object.keys(byImportance) as Importance[]).forEach(k => {
    const b = byImportance[k];
    b.score = b.total > 0 ? Math.round((b.matched / b.total) * 100) : 0;
  });

  const criticalGaps = matches
    .filter(m => m.importance === 'REQUIRED' && m.gap)
    .map(m => m.text)
    .slice(0, 8);

  const matchedConcepts = [...new Set(matches.flatMap(m => m.level !== 'MISSING' ? m.concepts : []))];
  const missingConcepts = [...new Set(matches.flatMap(m => m.gap ? m.concepts : []))].filter(c => c);

  return {
    jobMatch,
    atsScore: computeAtsScore(resumeText, profile),
    requirementMatches: matches,
    criticalGaps,
    matchedConcepts,
    missingConcepts,
    requirementCount: matches.length,
    requirementsByImportance: byImportance,
  };
}

// ATS compatibility is about parseability, structure, format and keyword presence —
// deliberately separate from semantic Job Match.
export function computeAtsScore(resumeText: string, profile: ResumeProfile): number {
  const lower = resumeText.toLowerCase();

  const sectionChecks: [string, RegExp][] = [
    ['Contact', /(?:phone|email|linkedin|address|\@)/i],
    ['Experience', /\b(experience|employment|work history|professional background)\b/i],
    ['Education', /\b(education|academic|university|college|degree)\b/i],
    ['Skills', /\b(skills|core competencies|technologies|technical skills|expertise)\b/i],
    ['Summary', /\b(summary|professional summary|objective|profile)\b/i],
  ];
  const foundSections = sectionChecks.filter(([, re]) => re.test(lower)).length;
  const scoreSections = Math.round((foundSections / sectionChecks.length) * 100);

  let formatScore = 100;
  if (resumeText.includes('\t')) formatScore -= 25;
  if ((resumeText.match(/\|/g) || []).length > 3) formatScore -= 25;
  if (resumeText.includes('\u0000')) formatScore -= 25;
  formatScore = Math.max(0, formatScore);

  const words = resumeText.replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(Boolean).length;
  let lengthScore: number;
  if (words >= 300 && words <= 900) lengthScore = 100;
  else if (words >= 150) lengthScore = 75;
  else if (words >= 100) lengthScore = 50;
  else lengthScore = 25;

  // Bullet quality (action verbs + metrics)
  const bullets = resumeText.split('\n').map(l => l.trim()).filter(l =>
    (l.length > 10 && /^[-•*‣⁃–—>|]\s/.test(l)) || (l.length > 10 && /^\d+[.)]\s/.test(l)));
  let bulletScore = 50;
  if (bullets.length > 0) {
    const withNum = bullets.filter(b => /\d+/.test(b)).length;
    const numRate = withNum / bullets.length;
    bulletScore = Math.round((numRate * 0.6 + 0.4) * 100);
  }

  const ats = Math.round(
    scoreSections * 0.30 +
    formatScore * 0.20 +
    lengthScore * 0.20 +
    bulletScore * 0.30
  );
  return Math.max(0, Math.min(100, ats));
}

// ---------------------------------------------------------------------------
// Ghost-job assessment (honest: weak signals never raise risk on their own)
// ---------------------------------------------------------------------------

export interface GhostAssessment {
  risk: 'low' | 'medium' | 'high' | 'unknown';
  score: number;
  reasons: string[];
  label: string;
}

export function detectGhostJob(text: string): GhostAssessment {
  const lower = text.toLowerCase();

  if (text.trim().length < 120) {
    return {
      risk: 'unknown',
      score: 0,
      reasons: ['Job description is too short to evaluate ghost-job signals.'],
      label: 'Insufficient Evidence',
    };
  }

  const strong: string[] = [];
  const weak: string[] = [];

  // Strong signals — direct evidence the posting is evergreen / templated.
  if (/\[insert|\[company(?: name)?\]|\[job title\]|insert company|your email|email@company|placeholder/i.test(lower)) {
    strong.push('Contains draft placeholders (e.g. "[Company Name]")');
  }
  if (/\b(we are always looking|always hiring|rolling basis|ongoing recruitment|evergreen|resume bank|talent pool|open application|continuous recruitment)\b/i.test(lower)) {
    strong.push('Evergreen posting language ("always looking", "rolling basis")');
  }
  if (/\b(repost(?:ed)?|previously posted|posted on a recurring basis)\b/i.test(lower)) {
    strong.push('Listing shows signs of being reposted or recurring');
  }

  // Weak signals — contextual, only informative, never decisive alone.
  if (!/\b(about us|about the company|about the team|who we are|our mission|company overview)\b/i.test(lower)) {
    weak.push('Missing company background or team context');
  }
  if (!/\b(\$[\d,]+|\b\d{2,3}\s*-\s*\d{2,3}\s*k(?:\/yr)?\b|salary|compensation|pay range|hourly|annum|annual salary)\b/i.test(lower)) {
    weak.push('No compensation or salary range mentioned');
  }
  const genericPhrases = [
    'work with cross-functional teams', 'collaborate with stakeholders', 'fast-paced environment',
    'detail-oriented self-starter', 'excellent written and verbal communication', 'dynamic and growing company',
    'we are an equal opportunity employer', 'work with various teams',
  ];
  const genericCount = genericPhrases.filter(p => lower.includes(p)).length;
  if (genericCount >= 3) {
    weak.push('Overly generic responsibilities (multiple copy-paste phrases)');
  }
  if (/\b(ninja|rockstar|guru|wizard|unicorn|superhero|badass)\b/i.test(lower)) {
    weak.push('Buzzword-heavy job title language');
  }
  if (/urgent(?:ly)?\s+(?:hiring|need|required|fill)|immediate\s+(?:start|join|hire)/i.test(lower)) {
    weak.push('High-pressure urgency language ("urgently hiring")');
  }

  let risk: GhostAssessment['risk'];
  let label: string;
  if (strong.length >= 2) {
    risk = 'high';
    label = 'High Risk';
  } else if (strong.length === 1) {
    risk = 'medium';
    label = 'Medium Risk';
  } else if (weak.length >= 3) {
    risk = 'low';
    label = 'Low Risk';
  } else {
    risk = 'low';
    label = 'Looks Legitimate';
  }

  const reasons = [...strong, ...weak];
  const score = Math.min(100, reasons.length * 20);

  return { risk, score, reasons, label };
}
