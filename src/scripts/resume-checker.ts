import { calculateOverallScore } from './scoring-engine';

(function () {
  const resumeInput = document.getElementById('resume-input') as HTMLTextAreaElement;
  const jdInput = document.getElementById('jd-input') as HTMLTextAreaElement;
  const dashboard = document.getElementById('dashboard');
  const emptyState = document.getElementById('empty-state');
  const liveScore = document.getElementById('live-score');
  const liveGrade = document.getElementById('live-grade');
  const liveRating = document.getElementById('live-rating');
  const overallRatingDesc = document.getElementById('overall-rating-desc');
  const overallRating = document.getElementById('overall-rating');
  const scoreRing = document.getElementById('score-ring') as HTMLElement;
  const printPdfBtn = document.getElementById('print-pdf-btn');
  const clearBtn = document.getElementById('clear-btn');
  const sampleBtn = document.getElementById('sample-btn');

  const resumeOverlay = document.getElementById('resume-placeholder-overlay');
  const jdOverlay = document.getElementById('jd-placeholder-overlay');
  const analyzeBtn = document.getElementById('analyze-btn');
  const seeSuggestionsBtn = document.getElementById('see-suggestions-btn');
  const viewBreakdownBtn = document.getElementById('view-breakdown-btn');
  const viewAllSkillsBtn = document.getElementById('view-all-skills-btn');

  const STORAGE_KEY = 'rc-session';
  const BEST_KEY = 'rc-bests';

  let importedFileName = 'resume';
  let importedFileExt = 'txt';

  function updateInputOverlays() {
    if (resumeOverlay) {
      if (resumeInput.value || document.activeElement === resumeInput) {
        resumeOverlay.classList.add('hidden');
      } else {
        resumeOverlay.classList.remove('hidden');
      }
    }
    if (jdOverlay) {
      if (jdInput.value || document.activeElement === jdInput) {
        jdOverlay.classList.add('hidden');
      } else {
        jdOverlay.classList.remove('hidden');
      }
    }
  }

  function resetDashboard() {
    clearTimeout(insightTimeout1);
    clearTimeout(insightTimeout2);
    if (emptyState) emptyState.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
    if (liveScore) liveScore.textContent = '0';
    if (liveGrade) {
      liveGrade.textContent = '—';
      liveGrade.style.color = 'var(--rc-text-muted)';
      liveGrade.style.borderColor = 'var(--rc-border)';
    }
    if (liveRating) {
      liveRating.textContent = 'Awaiting';
      liveRating.style.color = 'var(--rc-text-muted)';
      liveRating.style.borderColor = 'var(--rc-border)';
    }
    const livePercentile = document.getElementById('live-percentile');
    if (livePercentile) {
      livePercentile.textContent = '— of candidates';
      livePercentile.style.color = '';
      livePercentile.style.borderColor = '';
    }
    const liveRanking = document.getElementById('live-ranking-badge');
    if (liveRanking) {
      liveRanking.textContent = '—';
      liveRanking.className = 'inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/20 leading-none';
    }
    const liveConfidence = document.getElementById('live-confidence-badge');
    if (liveConfidence) {
      liveConfidence.textContent = '—';
      liveConfidence.className = 'text-[9.5px] font-bold px-1.5 py-0.5 rounded border leading-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/40';
    }
    if (overallRatingDesc) {
      overallRatingDesc.textContent = 'Paste your resume + JD and see your ATS score';
    }
    const overallRatingBadge = document.getElementById('overall-rating-badge');
    if (overallRatingBadge) {
      overallRatingBadge.textContent = 'Awaiting';
      overallRatingBadge.className = 'mt-1.5 inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--rc-border)] text-[var(--rc-text-muted)] uppercase tracking-wider';
    }
    const statusIndicator = document.getElementById('live-status-indicator');
    if (statusIndicator) statusIndicator?.classList.add('hidden');
    if (overallRating) overallRating.textContent = 'Awaiting analysis';
    const percentileRank = document.getElementById('percentile-rank');
    if (percentileRank) percentileRank.textContent = '';

    const keywordBarValue = document.getElementById('score-bar-keyword-value');
    const keywordBarFill = document.getElementById('score-bar-keyword-fill');
    if (keywordBarValue) keywordBarValue.textContent = '0%';
    if (keywordBarFill) keywordBarFill.style.width = '0%';

    const skillsBarValue = document.getElementById('score-bar-skills-value');
    const skillsBarFill = document.getElementById('score-bar-skills-fill');
    if (skillsBarValue) skillsBarValue.textContent = '0%';
    if (skillsBarFill) skillsBarFill.style.width = '0%';

    const contentBarValue = document.getElementById('score-bar-content-value');
    const contentBarFill = document.getElementById('score-bar-content-fill');
    if (contentBarValue) contentBarValue.textContent = '0%';
    if (contentBarFill) contentBarFill.style.width = '0%';

    const recruiterBarValue = document.getElementById('score-bar-recruiter-value');
    const recruiterBarFill = document.getElementById('score-bar-recruiter-fill');
    if (recruiterBarValue) recruiterBarValue.textContent = '—';
    if (recruiterBarFill) recruiterBarFill.style.width = '0%';

    if (scoreRing) scoreRing.style.strokeDashoffset = '97.4';

    const deltaBadge = document.getElementById('delta-badge');
    if (deltaBadge) { deltaBadge.textContent = ''; deltaBadge.classList.add('hidden'); }
    const lastAnalyzed = document.getElementById('last-analyzed');
    if (lastAnalyzed) { lastAnalyzed.textContent = ''; lastAnalyzed.classList.add('hidden'); }
    const rawTextStream = document.getElementById('raw-text-stream');
    if (rawTextStream) rawTextStream.textContent = 'Waiting for input stream…';
    const benchmarkBar = document.getElementById('benchmark-bar');
    if (benchmarkBar) { benchmarkBar.innerHTML = ''; benchmarkBar.classList.add('hidden'); }
    const ghostBadge = document.getElementById('ghost-job-badge');
    if (ghostBadge) { ghostBadge.innerHTML = ''; ghostBadge.classList.add('hidden'); }
    const suggestionsPanel = document.getElementById('bullet-opt-suggestions');
    if (suggestionsPanel) suggestionsPanel.classList.add('hidden');
    const bulletOptResult = document.getElementById('bullet-opt-result');
    if (bulletOptResult) bulletOptResult.classList.add('hidden');
    const bulletOptInput = document.getElementById('bullet-opt-input') as HTMLTextAreaElement;
    if (bulletOptInput) bulletOptInput.value = '';
    
    updateInputOverlays();
  }

  function simpleHash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h = h & h; }
    return 'h' + Math.abs(h).toString(36);
  }

  function saveSession(resume: string, jd: string, results: any) {
    const sanitized = results ? { ...results, matchedWords: [...results.matchedWords], missingWords: [...results.missingWords] } : null;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ resume, jd, timestamp: Date.now(), results: sanitized })); } catch {}
  }

  function loadSession(): { resume?: string; jd?: string; results?: any; timestamp?: number } | null {
    try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
  }

  function clearSession() { try { localStorage.removeItem(STORAGE_KEY); } catch {} }

  function saveBestScore(jd: string, score: number) {
    try {
      const bests = JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
      const hash = simpleHash(jd);
      if (!bests[hash] || score > bests[hash].score) { bests[hash] = { score, timestamp: Date.now() }; localStorage.setItem(BEST_KEY, JSON.stringify(bests)); }
    } catch {}
  }

  function getBestScore(jd: string): { score: number; timestamp: number } | null {
    try { const bests = JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); return bests[simpleHash(jd)] || null; } catch { return null; }
  }

  function animateValue(el: HTMLElement, target: number, suffix = '', duration = 800) {
    const start = performance.now();
    const currentText = el.textContent || '0';
    const from = parseInt(currentText.replace(/[^0-9-]/g, '')) || 0;
    function frame(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `${Math.round(from + (target - from) * eased)}${suffix}`;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function animateRing(targetPercent: number, duration = 800) {
    const c = 97.4;
    const target = c - (targetPercent / 100) * c;
    const start = performance.now();
    const currentOffset = scoreRing ? parseFloat(scoreRing.style.strokeDashoffset) : c;
    const from = isNaN(currentOffset) ? c : currentOffset;
    const glowRing = document.getElementById('score-ring-glow');
    function frame(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const offsetVal = String(from + (target - from) * eased);
      if (scoreRing) scoreRing.style.strokeDashoffset = offsetVal;
      if (glowRing) glowRing.style.strokeDashoffset = offsetVal;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const ACTIVE_VERBS = [
    'achieved', 'accelerated', 'accomplished', 'acquired', 'adapted', 'addressed', 'administered',
    'advanced', 'advised', 'advocated', 'allocated', 'analyzed', 'applied', 'architected',
    'assembled', 'assessed', 'assigned', 'assisted', 'attained', 'audited', 'augmented',
    'authored', 'automated', 'balanced', 'benchmarked', 'boiled', 'boosted', 'broadened',
    'brokered', 'built', 'calculated', 'cataloged', 'catalyzed', 'chaired', 'championed',
    'changed', 'charted', 'checked', 'clarified', 'classified', 'closed', 'coached',
    'collaborated', 'collected', 'combined', 'communicated', 'compared', 'compiled',
    'completed', 'composed', 'computed', 'conceived', 'conceptualized', 'concluded',
    'conducted', 'configured', 'confirmed', 'connected', 'consolidated', 'constructed',
    'consulted', 'controlled', 'converted', 'conveyed', 'coordinated', 'corrected',
    'correlated', 'created', 'cultivated', 'customized', 'debugged', 'decided', 'decreased',
    'defined', 'delegated', 'delivered', 'demonstrated', 'deployed', 'depicted', 'derived',
    'designed', 'determined', 'developed', 'devised', 'diagnosed', 'directed', 'discovered',
    'dispatched', 'displayed', 'dissected', 'distributed', 'documented', 'doubled',
    'drafted', 'drove', 'earned', 'edited', 'educated', 'elected', 'eliminated', 'embraced',
    'emerged', 'emphasized', 'employed', 'enabled', 'enacted', 'encouraged', 'endorsed',
    'enforced', 'engaged', 'engineered', 'enhanced', 'enlisted', 'ensured', 'established',
    'estimated', 'evaluated', 'examined', 'exceeded', 'executed', 'exemplified', 'expanded',
    'expedited', 'explained', 'explored', 'extended', 'extracted', 'extrapolated', 'fabricated',
    'facilitated', 'finalized', 'financed', 'fixed', 'focused', 'forecasted', 'formulated',
    'fortified', 'fostered', 'founded', 'fueled', 'gained', 'gathered', 'generated', 'grew',
    'grouped', 'guided', 'hired', 'identified', 'illustrated', 'implemented', 'imported',
    'improved', 'improvised', 'incorporated', 'increased', 'incurred', 'indicated', 'influenced',
    'informed', 'infused', 'initiated', 'innovated', 'inoculated', 'inspired', 'installed',
    'instituted', 'integrated', 'intensified', 'interpreted', 'intervened', 'interviewed',
    'introduced', 'invented', 'inventoried', 'investigated', 'invested', 'invigorated',
    'involved', 'isolated', 'joined', 'judged', 'justified', 'launched', 'lead', 'led',
    'leveraged', 'licensed', 'linked', 'lobbied', 'logged', 'maintained', 'managed', 'mapped',
    'marketed', 'mastered', 'mediated', 'mentored', 'merged', 'measured', 'modeled',
    'moderated', 'modified', 'monitored', 'motivated', 'mounted', 'navigated', 'negotiated',
    'netted', 'networked', 'nominated', 'normalized', 'nurtured', 'observed', 'obtained',
    'opened', 'operated', 'optimized', 'orchestrated', 'ordered', 'organized', 'oriented',
    'originated', 'outfitted', 'outlined', 'outpaced', 'outsourced', 'overcame', 'overhauled',
    'oversaw', 'packaged', 'paired', 'parsed', 'participated', 'partnered', 'passed',
    'penned', 'perceived', 'perfected', 'performed', 'persuaded', 'piloted', 'pinpointed',
    'pioneered', 'placed', 'planned', 'polled', 'popularized', 'positioned', 'precipitated',
    'predicted', 'prepared', 'prescribed', 'presented', 'preserved', 'presided', 'prevented',
    'printed', 'prioritized', 'procured', 'produced', 'profiled', 'programmed', 'projected',
    'promoted', 'prompted', 'propelled', 'proposed', 'prosecuted', 'prospected', 'proved',
    'provided', 'publicized', 'published', 'purchased', 'pursued', 'qualified', 'quantified',
    'questioned', 'raised', 'ranked', 'rated', 'realized', 'received', 'recognized',
    'recommended', 'reconciled', 'recorded', 'recruited', 'rectified', 'redesigned',
    'reduced', 'reengineered', 'referenced', 'referred', 'refined', 'reformed', 'regained',
    'regulated', 'rehabilitated', 'reinforced', 'reinvigorated', 'reiterated', 'rejected',
    'rejuvenated', 'released', 'relied', 'remedied', 'remodeled', 'removed', 'rendered',
    'reorganized', 'repaired', 'replaced', 'replicated', 'replied', 'reported', 'represented',
    'reproduced', 'requested', 'rescued', 'researched', 'resolved', 'responded', 'restored',
    'restructured', 'retained', 'retrieved', 'revamped', 'revealed', 'reversed', 'reviewed',
    'revised', 'revitalized', 'saved', 'scheduled', 'screened', 'scrutinized', 'secured',
    'segmented', 'selected', 'separated', 'served', 'serviced', 'settled', 'shaped', 'shared',
    'shortened', 'showcased', 'shrank', 'shaped', 'signaled', 'simplified', 'simulated',
    'solved', 'sort', 'sourced', 'sparked', 'spawned', 'spearheaded', 'specified', 'spent',
    'splitted', 'spoke', 'sponsored', 'spotlighted', 'stabilized', 'staffed', 'standardized',
    'started', 'steered', 'stimulated', 'streamlined', 'strengthened', 'structured', 'studied',
    'succeeded', 'suggested', 'summarized', 'supervised', 'supplied', 'supported', 'surpassed',
    'surveyed', 'sustained', 'symbolized', 'synchronized', 'synthesized', 'systematized',
    'tabulated', 'tailored', 'targeted', 'tasked', 'taught', 'terminated', 'tested', 'tightened',
    'took', 'totaled', 'tracked', 'traded', 'trained', 'transcended', 'transferred', 'transformed',
    'transitioned', 'translated', 'transported', 'traveled', 'treated', 'tripled', 'troubleshot',
    'tutored', 'uncovered', 'understood', 'undertook', 'unified', 'united', 'updated', 'upgraded',
    'upheld', 'upskilled', 'utilized', 'validated', 'valued', 'ventured', 'verified', 'viewed',
    'visited', 'weighed', 'welcomed', 'widened', 'won', 'worked', 'wrote',
  ];

  const SECTION_PATTERNS: [string, RegExp][] = [
    ['Contact', /contact|phone|email|linkedin|github|portfolio|address/i],
    ['Summary', /summary|objective|profile|about me|professional summary/i],
    ['Experience', /experience|work history|employment|work experience|professional experience|relevant experience/i],
    ['Education', /education|academic|degree|university|college|school|bachelor|master|phd|diploma/i],
    ['Skills', /skills|technical skills|core competencies|expertise|proficiencies/i],
    ['Certifications', /certifications|certificates|licenses|accreditations/i],
    ['Projects', /projects|personal projects|key projects|project experience/i],
    ['Publications', /publications|papers|research|thesis/i],
    ['Languages', /languages|language proficiency/i],
    ['Volunteering', /volunteer|volunteering|community service/i],
  ];

  const REQUIRED_SECTIONS = ['Contact', 'Experience', 'Education', 'Skills'];

  const COMMON_SKILLS = [
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
    'tls', 'https', 'restful', 'soap', 'xml', 'json', 'yaml', 'toml', 'markdown',
    'docker compose', 'docker swarm', 'helm', 'istio', 'envoy', 'linkerd', 'consul',
    'vault', 'packer', 'vagrant', 'jenkins', 'circleci', 'github actions', 'gitlab ci',
    'travis ci', 'teamcity', 'bamboo', 'octopus', 'spinnaker', 'argo', 'flux',
    'ambassador', 'kong', 'apigee', 'mulesoft', 'tibco', 'webmethods', 'camel',
    'mule', 'spring boot', 'spring cloud', 'micronaut', 'quarkus', 'helidon',
    'vert.x', 'akka', 'play', 'grails', 'groovy', 'clojure', 'elixir',
    'phoenix', 'crystal', 'nim', 'zig', 'vlang', 'julia', 'haskell', 'erlang',
    'puppet', 'chef', 'saltstack', 'cloudformation', 'cdk', 'pulumi', 'crossplane',
    'kustomize', 'skaffold', 'tilt', 'devspace', 'okteto', 'telepresence',
    'splunk', 'dynatrace', 'datadog', 'new relic', 'appdynamics', 'instana',
    'jaeger', 'zipkin', 'skywalking', 'opentelemetry', 'fluentd', 'fluentbit',
    'filebeat', 'metricbeat', 'heartbeat', 'packetbeat', 'winlogbeat',
    'nagios', 'zabbix', 'icinga', 'sensu', 'riemann', 'syslog', 'snmp', 'netflow',
    'sflow', 'ipfix', 'netconf', 'yang', 'restconf', 'grpc', 'protobuf', 'avro',
    'parquet', 'orc', 'iceberg', 'hudi', 'delta lake', 'lakehouse', 'data mesh',
    'data fabric', 'data vault', 'star schema', 'snowflake schema', 'dimensional modeling',
    'erp', 'crm', 'hcm', 'scm', 'plm', 'mdm', 'cpm', 'epm', 'hfm', 'fccs',
    'netsuite', 'oracle', 'sap', 'workday', 'peoplesoft', 'jde', 'dynamics',
    'acumatica', 'intuit', 'quickbooks', 'xero', 'freshbooks', 'wave', 'zoho',
    'sage', 'epicor', 'infor', 'ifs', 'unit4', 'deltek', 'costpoint', 'govtribe',
    'procurement', 'purchasing', 'sourcing', 'supply chain', 'logistics',
    'inventory management', 'warehouse management', 'transportation management',
    'demand planning', 'supply planning', 'production planning', 'mrp',
    'shop floor', 'manufacturing', 'lean', 'six sigma', 'kaizen', 'kanban',
    'value stream mapping', 'root cause analysis', 'fmea', 'capability maturity model',
    'cmmi', 'iso', 'as9100', 'ts16949', 'fda', 'gmp', 'glp', 'gcp', 'gvp',
    'clinical', 'regulatory', 'pharmacovigilance', 'medical affairs', 'biostatistics',
    'sas', 'spss', 'stata', 'minitab', 'jmp', 'design expert', 'modde', 'simeca',
    'computational fluid dynamics', 'finite element analysis', 'cad', 'cam', 'cae',
    'solidworks', 'catia', 'nx', 'creo', 'inventor', 'autocad', 'revit', 'civil 3d',
    'microstation', 'bentley', 'tekla', 'navisworks', 'solidedge', 'fusion 360',
    'blender', 'maya', '3ds max', 'cinema 4d', 'houdini', 'unreal engine', 'unity',
    'godot', 'opengl', 'directx', 'vulkan', 'metal', 'webgl', 'webgpu', 'three.js',
    'babylon.js', 'playcanvas', 'aframe', '8th wall', 'unity3d', 'unreal',
    'ar', 'vr', 'mr', 'xr', 'hololens', 'oculus', 'quest', 'vive', 'playstation vr',
    'apple vision pro', 'meta', 'google', 'microsoft', 'amazon', 'apple', 'netflix',
    'spotify', 'uber', 'airbnb', 'twitter', 'linkedin', 'facebook', 'instagram',
  ];

  const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall',
    'can', 'are', 'it', 'its', 'this', 'that', 'these', 'those', 'we', 'our', 'you', 'your',
    'they', 'their', 'them', 'he', 'she', 'his', 'her', 'him', 'not', 'no', 'nor', 'so',
    'if', 'then', 'than', 'too', 'very', 'just', 'about', 'up', 'out', 'also', 'more',
    'most', 'some', 'any', 'each', 'every', 'all', 'both', 'few', 'much', 'many', 'into',
    'over', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because',
    'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
    'between', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
    'when', 'where', 'why', 'how', 'who', 'whom', 'what', 'which',
  ]);

  const GENERIC_HIRING_TERMS = new Set([
    'full', 'stack',
    'role', 'roles', 'position', 'positions', 'job', 'jobs', 'title', 'titles',
    'looking', 'join', 'seeking', 'search', 'searching', 'find', 'wanted', 'hiring',
    'experienced', 'experience',
    'required', 'preferred', 'qualification', 'qualifications', 'requirement', 'requirements',
    'responsibility', 'responsibilities',
    'team', 'teams', 'company', 'companies', 'organization', 'firm', 'agency', 'department',
    'strong', 'excellent', 'good', 'great', 'best', 'proven', 'track', 'record',
    'ability', 'able', 'demonstrated',
    'skill', 'skills',
    'knowledge', 'understanding',
    'proficiency', 'proficient',
    'expertise', 'expert', 'experts',
    'familiar', 'familiarity',
    'senior', 'junior', 'mid', 'level', 'levels', 'staff', 'principal',
    'remote', 'hybrid', 'onsite', 'office', 'based', 'location', 'headquartered',
    'year', 'years', 'month', 'months', 'weekly', 'quarterly', 'annual',
    'minimum', 'maximum', 'least',
    'plus', 'bonus', 'nice',
    'candidate', 'candidates', 'ideal',
    'including', 'include', 'includes', 'multiple', 'various', 'related', 'etc',
    'well',
    'back', 'end',
    'cross', 'functional',
    'about', 'what', 'you', 'will',
    'start', 'date', 'dates', 'now', 'urgent',
    'need', 'needs', 'needed',
    'responsible', 'oversee',
    'summary',
    'apply', 'applicant', 'application', 'submit', 'process', 'interview', 'offer',
    'day', 'days', 'daily', 'week', 'weeks',
    'help', 'helps', 'helping', 'support', 'supports', 'supporting',
    'new', 'existing',
    'per', 'within', 'across',
    'must', 'should',
    'collaborate', 'collaborates', 'collaborating', 'collaboration',
    'communicate', 'communicates', 'communicating', 'communication',
    'manage', 'manages', 'managing', 'management',
    'lead', 'leads', 'leading', 'leader', 'leadership',
  ]);

  let analysisTimeout: any = null;
  let insightTimeout1: any = null;
  let insightTimeout2: any = null;
  let currentResult: any = null;

  function extractWords(text: string): string[] {
    return text.toLowerCase().replace(/[^a-z0-9\s+#./-]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
  }

  function extractKeywords(text: string): Set<string> {
    return new Set(extractWords(text).filter(w => !GENERIC_HIRING_TERMS.has(w)));
  }

  function extractPhrases(text: string, maxLen = 3): string[] {
    const words = extractWords(text).filter(w => !GENERIC_HIRING_TERMS.has(w));
    const phrases: string[] = [];
    for (let i = 0; i < words.length; i++) {
      for (let len = 2; len <= maxLen; len++) {
        if (i + len <= words.length) phrases.push(words.slice(i, i + len).join(' '));
      }
    }
    return [...new Set(phrases)];
  }

  function findSkills(text: string): string[] {
    const lower = text.toLowerCase();
    return COMMON_SKILLS.filter(s => new RegExp('\\b' + s.replace(/[.+/-]/g, '\\$&') + '\\b', 'i').test(lower));
  }

  function detectSections(text: string): { name: string; found: boolean; required: boolean }[] {
    const lower = text.toLowerCase();
    return SECTION_PATTERNS.map(([name, pattern]) => ({
      name,
      found: pattern.test(lower),
      required: REQUIRED_SECTIONS.includes(name),
    }));
  }

  function extractBullets(text: string): string[] {
    return text.split('\n')
      .map(l => l.trim())
      .filter(l => (l.length > 10 && /^[-•*‣⁃–—>]\s/.test(l)) || (l.length > 10 && /^\d+[.)]\s/.test(l)));
  }

  function analyzeBulletQuality(bullets: string[]): {
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
      if (!hasAction && firstWord.length > 0 && !STOP_WORDS.has(firstWord)) {
        const firstLetter = firstWord[0];
        const candidates = ACTIVE_VERBS.filter(v => v.startsWith(firstLetter));
        if (candidates.length > 0) suggestedVerb = candidates[Math.floor(Math.random() * Math.min(candidates.length, 3))];
      }
      return { text: b, hasAction, hasQuantified, suggestedVerb };
    });
    return {
      total: bullets.length,
      actionVerbs: details.filter(d => d.hasAction).length,
      quantified: details.filter(d => d.hasQuantified).length,
      details,
    };
  }

  function detectGhostJob(text: string): { risk: 'low' | 'medium' | 'high'; score: number; reasons: string[]; label: string } {
    const lower = text.toLowerCase();
    const reasons: string[] = [];
    
    // 1. Placeholder check (Templates)
    if (/\[insert|\[company\]|insert company|your email|email@company/i.test(lower)) {
      reasons.push('Contains draft placeholders (e.g. "[Company Name]")');
    }
    // 2. Vague job titles
    if (/\b(ninja|rockstar|guru|wizard|unicorn|superhero)\b/i.test(lower)) {
      reasons.push('Vague or buzzword-heavy job title ("ninja", "rockstar", etc.)');
    }
    // 3. Evergreen / Pipeline postings
    if (/we are always looking for|rolling basis|ongoing recruitment|evergreen|pipeline|resume bank|build our talent pool/i.test(lower)) {
      reasons.push('Evergreen listing — likely used for resume farming rather than active hiring');
    }
    // 4. No company context
    if (!/about (us|the company|our team|who we are)|our mission|company overview/i.test(lower)) {
      reasons.push('Missing company background or organizational context');
    }
    // 5. Missing compensation transparency
    if (!/\$[\d,]+.*(?:k|year|annum|annual|salary|compensation|base)|salary.*range|pay.*range/i.test(lower)) {
      reasons.push('No compensation details or salary range provided');
    }
    // 6. Urgency language/Spam signals
    if (/urgent(?:ly)?\s+(?:hiring|need|required|fill)|immediate\s+(?:start|join|hire)/i.test(lower)) {
      reasons.push('Suspicious urgency language ("urgently hiring", "immediate start")');
    }
    // 7. Generic Copy-Paste JDs
    const genericPhrases = [
      'work with cross-functional teams', 
      'collaborate with stakeholders', 
      'participate in agile ceremonies', 
      'fast-paced environment', 
      'work with various teams', 
      'multiple stakeholders',
      'detail-oriented self-starter',
      'excellent written and verbal communication'
    ];
    const genericCount = genericPhrases.filter(p => lower.includes(p)).length;
    if (genericCount >= 3) {
      reasons.push('Overly generic responsibilities (contains multiple copy-paste clichés)');
    }
    // 8. No Reporting/Team Structure
    if (!/report(?:s|ing)\s+to|team of|manage\s+\d+|lead\s+(?:a\s+)?team|collaborate with/i.test(lower)) {
      reasons.push('No reporting structure, team size, or supervisor role described');
    }
    // 9. Unrealistic Requirements
    if (/10\+ years.*(?:react|node|python|typescript|aws|kubernetes|docker|cloud)/i.test(lower) && !/director|vp|principal|staff|architect|senior manager/i.test(lower)) {
      reasons.push('Unrealistic experience requirements for a non-executive role');
    }

    const score = Math.min(reasons.length * 20, 100);
    const risk = reasons.length >= 4 ? 'high' : reasons.length >= 2 ? 'medium' : 'low';
    const label = risk === 'high' ? 'High Risk' : risk === 'medium' ? 'Medium Risk' : 'Legitimate Listing';
    return { risk, score, reasons, label };
  }

  function getKeywordFrequency(words: string[]): Map<string, number> {
    const freq = new Map<string, number>();
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
    return freq;
  }

  function gradeScore(score: number): { letter: string; label: string; color: string } {
    if (score >= 90) return { letter: 'A+', label: 'Excellent', color: 'var(--rc-primary)' };
    if (score >= 80) return { letter: 'A', label: 'Strong', color: 'var(--rc-primary)' };
    if (score >= 70) return { letter: 'B+', label: 'Good', color: 'var(--rc-primary)' };
    if (score >= 60) return { letter: 'B', label: 'Decent', color: 'var(--rc-primary)' };
    if (score >= 50) return { letter: 'C+', label: 'Fair', color: 'var(--rc-warning)' };
    if (score >= 40) return { letter: 'C', label: 'Below Avg', color: 'var(--rc-warning)' };
    if (score >= 30) return { letter: 'D', label: 'Needs Work', color: 'var(--rc-error)' };
    return { letter: 'F', label: 'Major Gaps', color: 'var(--rc-error)' };
  }

  function extractYearsOfExperience(text: string): number {
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

  function estimateResumeYears(text: string): number {
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

  function calculateConfidence(resumeWords: number, matchedSignals: number): { level: string; color: string; reason: string } {
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

  function analyze(resumeText: string, jdText: string) {
    console.log('[RC] analyze called, text lengths:', resumeText.length, jdText.length);
    const resume = resumeText.trim();
    const jd = jdText.trim();

    const statusIndicator = document.getElementById('live-status-indicator');

    if (!resume || !jd) {
      resetDashboard();
      if (emptyState) emptyState.classList.remove('hidden');
      if (dashboard) dashboard.classList.add('hidden');
      printPdfBtn?.classList.add('hidden');
      if (statusIndicator) statusIndicator.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    if (statusIndicator) statusIndicator.classList.remove('hidden');
    printPdfBtn?.classList.remove('hidden');

    const contentIds = ['matched-keywords', 'missing-keywords', 'density-bars', 'section-list', 'bullet-list', 'priority-tips', 'red-flags-list', 'missing-skills-grid', 'skill-gap-required', 'skill-gap-found', 'skill-gap-missing', 'missing-keywords-critical', 'missing-keywords-important', 'missing-keywords-optional', 'content-metrics', 'top-reasons-list', 'missing-skills-matter'];
    contentIds.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });

    const r = calculateOverallScore(resume, jd);
    const ghostJob = jd.length > 100 ? detectGhostJob(jd) : { risk: 'low' as const, score: 0, reasons: [], label: 'Looks Legitimate' };
    currentResult = {
      ...r,
      ghostJob,
    };

    saveSession(resume, jd, currentResult);
    saveBestScore(jd, currentResult.overall);

    console.log('[RC] analysis complete, calling renderResults, overall:', currentResult.overall);
    renderResults(currentResult, resume, jd);
  }

  function renderResults(r: typeof currentResult, resumeText?: string, jdText?: string) {
    if (!r) return;

    animateValue(liveScore!, r.overall, '');
    const g = gradeScore(r.overall);
    if (liveGrade) {
      liveGrade.textContent = g.letter;
      liveGrade.style.color = g.color;
      liveGrade.style.borderColor = `color-mix(in srgb, ${g.color} 30%, transparent)`;
    }
    if (liveRating) {
      liveRating.textContent = `${g.label} Match`;
      liveRating.style.color = g.color;
      liveRating.style.borderColor = `color-mix(in srgb, ${g.color} 30%, transparent)`;
    }
    const livePercentile = document.getElementById('live-percentile');
    const liveRankingBadge = document.getElementById('live-ranking-badge');
    const liveConfidenceBadge = document.getElementById('live-confidence-badge');
    const pctl = r.overall >= 90 ? 'Top 5%' : r.overall >= 80 ? 'Top 12%' : r.overall >= 70 ? 'Top 25%' : r.overall >= 60 ? 'Top 40%' : r.overall >= 50 ? 'Top 55%' : r.overall >= 40 ? 'Top 68%' : r.overall >= 30 ? 'Top 80%' : 'Bottom 25%';
    
    const rankLabel = r.overall >= 90 ? 'Top 5%' : r.overall >= 80 ? 'Top 10%' : r.overall >= 70 ? 'Top 25%' : r.overall >= 50 ? 'Average' : 'Below Average';
    if (liveRankingBadge) {
      liveRankingBadge.textContent = rankLabel;
      if (r.overall >= 70) {
        liveRankingBadge.className = 'inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/20 leading-none select-none';
      } else if (r.overall >= 50) {
        liveRankingBadge.className = 'inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/20 leading-none select-none';
      } else {
        liveRankingBadge.className = 'inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/20 leading-none select-none';
      }
    }
    
    if (livePercentile) {
      livePercentile.textContent = `${pctl} of candidates`;
    }
    
    const matchedSignals = r.matchedWords.size + r.matchedSkills.length + r.matchedPhrases.length;
    const confidence = calculateConfidence(r.resumeWords, matchedSignals);
    if (liveConfidenceBadge) {
      liveConfidenceBadge.textContent = confidence.level;
      liveConfidenceBadge.className = `text-[9.5px] font-bold px-1.5 py-0.5 rounded border leading-none ${confidence.color} select-none`;
      liveConfidenceBadge.setAttribute('title', confidence.reason);
    }
    if (overallRating) overallRating.textContent = g.label;
    if (overallRatingDesc) {
      overallRatingDesc.textContent = r.overall >= 70 ? 'Your resume has a good match with this job description.' : r.overall >= 50 ? 'Your resume has a fair match with this job description. Consider optimization.' : 'Your resume has significant gaps compared to this job description.';
    }
    animateRing(r.overall);

    const keywordBarValue = document.getElementById('score-bar-keyword-value');
    const keywordBarFill = document.getElementById('score-bar-keyword-fill');
    if (keywordBarValue) keywordBarValue.textContent = `${r.scoreKeyword}%`;
    if (keywordBarFill) keywordBarFill.style.width = `${r.scoreKeyword}%`;

    const skillsBarValue = document.getElementById('score-bar-skills-value');
    const skillsBarFill = document.getElementById('score-bar-skills-fill');
    if (skillsBarValue) skillsBarValue.textContent = `${r.scoreSkills}%`;
    if (skillsBarFill) skillsBarFill.style.width = `${r.scoreSkills}%`;

    const contentBarValue = document.getElementById('score-bar-content-value');
    const contentBarFill = document.getElementById('score-bar-content-fill');
    if (contentBarValue) contentBarValue.textContent = `${r.scoreContent}%`;
    if (contentBarFill) contentBarFill.style.width = `${r.scoreContent}%`;

    const recruiterBarValue = document.getElementById('score-bar-recruiter-value');
    const recruiterBarFill = document.getElementById('score-bar-recruiter-fill');
    if (recruiterBarValue) recruiterBarValue.textContent = `${r.scoreExperience}%`;
    if (recruiterBarFill) recruiterBarFill.style.width = `${r.scoreExperience}%`;

    const overallRatingBadge = document.getElementById('overall-rating-badge');
    if (overallRatingBadge) {
      overallRatingBadge.textContent = `${g.label} Match`;
      const clr = r.overall >= 80 ? 'var(--rc-primary)' : r.overall >= 50 ? 'var(--rc-warning)' : 'var(--rc-error)';
      const clrSoft = r.overall >= 80 ? 'var(--rc-primary-soft)' : r.overall >= 50 ? 'var(--rc-warning-soft)' : 'var(--rc-error-soft)';
      overallRatingBadge.style.backgroundColor = clrSoft;
      overallRatingBadge.style.color = clr;
      overallRatingBadge.style.borderColor = `color-mix(in srgb, ${clr} 20%, transparent)`;
      overallRatingBadge.className = 'inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider border';
    }



    const redFlagsEl = document.getElementById('red-flags-list');
    if (redFlagsEl && r.redFlags) {
      const severityConfig: Record<string, { icon: string; bg: string; border: string; dot: string; label: string }> = {
        critical: { icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>', bg: 'bg-rose-50/50', border: 'border-rose-200/40', dot: 'bg-rose-500', label: 'Critical' },
        warning: { icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', bg: 'bg-amber-50/50', border: 'border-amber-200/40', dot: 'bg-amber-500', label: 'Warning' },
        info: { icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-sky-500 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>', bg: 'bg-sky-50/50', border: 'border-sky-200/40', dot: 'bg-sky-500', label: 'Info' },
      };
      redFlagsEl.innerHTML = r.redFlags.length > 0
        ? r.redFlags.map((f: any) => {
          const cfg = severityConfig[f.severity] || severityConfig.info;
          return `<div class="flex items-start gap-2.5 p-3 rounded-xl ${cfg.bg} ${cfg.border} border shadow-sm">
            ${cfg.icon}
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-xs font-bold text-ink">${f.title}</span>
                <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${f.severity === 'critical' ? 'bg-rose-200/50 text-rose-600' : f.severity === 'warning' ? 'bg-amber-200/50 text-amber-600' : 'bg-sky-200/50 text-sky-600'}">${cfg.label}</span>
              </div>
              <p class="text-[10px] text-mute leading-relaxed">${f.desc}</p>
            </div>
          </div>`;
        }).join('')
        : '<div class="flex items-center gap-2 p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/30"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg><span class="text-xs text-indigo-700 font-semibold">No red flags detected — your resume is ATS-friendly.</span></div>';
    }

    const matchCount = document.getElementById('match-count');
    const missingCount = document.getElementById('missing-count');
    const matchedEl = document.getElementById('matched-keywords');
    const missingEl = document.getElementById('missing-keywords');
    const densityBars = document.getElementById('density-bars');

    if (matchCount) matchCount.textContent = `${r.matchedWords.size}`;
    if (missingCount) missingCount.textContent = `${r.missingWords.size}`;

    if (matchedEl) {
      matchedEl.innerHTML = '';
      if (r.matchedWords.size > 0) {
        r.matchedWords.forEach((kw: string) => {
          matchedEl!.insertAdjacentHTML('beforeend', `<span class="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border bg-indigo-100/60 text-indigo-700 border-indigo-200/40">${kw}</span>`);
        });
      } else {
        matchedEl.innerHTML = '<p class="text-xs text-mute">No keyword matches found.</p>';
      }
    }

    if (missingEl) {
      missingEl.innerHTML = '';
      if (r.missingWords.size > 0) {
        r.missingWords.forEach((kw: string) => {
          missingEl!.insertAdjacentHTML('beforeend', `<span class="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border bg-rose-100/60 text-rose-700 border-rose-200/40">${kw}</span>`);
        });
      } else {
        missingEl.innerHTML = '<p class="text-xs text-mute">All keywords matched!</p>';
      }
    }

    const criticalEl = document.getElementById('missing-keywords-critical');
    const importantEl = document.getElementById('missing-keywords-important');
    const optionalEl = document.getElementById('missing-keywords-optional');
    if (criticalEl && importantEl && optionalEl) {
      const missingKw = r.keywordDensity.filter((k: any) => !k.present).sort((a: any, b: any) => b.count - a.count);
      const criticalItems = missingKw.filter((k: any) => k.count >= 4);
      const importantItems = missingKw.filter((k: any) => k.count >= 2 && k.count < 4);
      const optionalItems = missingKw.filter((k: any) => k.count < 2);
      criticalEl.innerHTML = criticalItems.length > 0
        ? criticalItems.map((k: any) =>
          `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-rose-100/60 text-rose-700 border-rose-200/40"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>${k.keyword} <span class="text-[10px] font-medium text-rose-500">x${k.count}</span></span>`
        ).join('')
        : missingKw.length === 0 ? '<p class="text-[10px] text-indigo-600 font-medium">All keywords present.</p>' : '<p class="text-[10px] text-mute">No high-frequency terms.</p>';
      importantEl.innerHTML = importantItems.length > 0
        ? importantItems.map((k: any) =>
          `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border bg-orange-100/60 text-orange-700 border-orange-200/40">${k.keyword} <span class="text-[10px] text-orange-500">x${k.count}</span></span>`
        ).join('')
        : missingKw.length === 0 ? '<p class="text-[10px] text-indigo-600 font-medium">All keywords present.</p>' : '<p class="text-[10px] text-mute">No medium-frequency terms.</p>';
      optionalEl.innerHTML = optionalItems.length > 0
        ? optionalItems.map((k: any) =>
          `<span class="inline-flex px-2 py-1 rounded-lg text-[10px] font-medium bg-slate-100/60 text-slate-600 border border-slate-200/40">${k.keyword}</span>`
        ).join('')
        : missingKw.length === 0 ? '<p class="text-[10px] text-indigo-600 font-medium">All keywords present.</p>' : '<p class="text-[10px] text-mute">No low-frequency terms.</p>';
    }



    const sectionList = document.getElementById('section-list');
    if (sectionList) {
      sectionList.innerHTML = r.sections.map((s: any) => {
        const icon = s.found
          ? '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-rose-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        const reqBadge = s.required ? '<span class="text-[10px] font-bold text-mute uppercase ml-1">Required</span>' : '';
        return `<div class="flex items-center justify-between py-1.5 px-3 rounded-xl ${s.found ? 'bg-gradient-to-r from-emerald-50/60 to-transparent border border-emerald-200/20' : 'bg-gradient-to-r from-rose-50/60 to-transparent border border-rose-200/20'}">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 flex items-center justify-center">${icon}</span>
            <span class="text-xs font-semibold text-ink">${s.name}</span>
            ${reqBadge}
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${s.found ? 'bg-emerald-200/40 text-emerald-700' : 'bg-rose-200/40 text-rose-600'}">${s.found ? 'Found' : 'Missing'}</span>
        </div>`;
      }).join('');
    }

    document.getElementById('total-bullets')!.textContent = `${r.bulletQuality.total}`;
    document.getElementById('action-verb-count')!.textContent = `${r.bulletQuality.actionVerbs}`;
    document.getElementById('quantified-count')!.textContent = `${r.bulletQuality.quantified}`;

    const bulletList = document.getElementById('bullet-list');
    if (bulletList) {
      bulletList.innerHTML = r.bulletQuality.details.map((b: any, i: number) => {
        const tier = b.hasAction && b.hasQuantified ? 'strong' : b.hasAction ? 'needs-metrics' : b.hasQuantified ? 'needs-verb' : 'weak';
        const cfg: Record<string, { label: string; border: string; bg: string; badge: string; icon: string; reason: string }> = {
          strong: {
            label: 'Strong', border: 'border-l-emerald-500', bg: 'bg-emerald-50/30', badge: 'bg-emerald-500/10 text-emerald-600',
            icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>',
            reason: 'Action verb + quantified result'
          },
          'needs-metrics': {
            label: 'Add metrics', border: 'border-l-amber-400', bg: 'bg-amber-50/20', badge: 'bg-amber-500/10 text-amber-600',
            icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 shrink-0"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
            reason: 'Add a specific number to show impact'
          },
          'needs-verb': {
            label: 'Add verb', border: 'border-l-amber-400', bg: 'bg-amber-50/20', badge: 'bg-amber-500/10 text-amber-600',
            icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 shrink-0"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
            reason: 'Start with a strong action verb'
          },
          weak: {
            label: 'Weak', border: 'border-l-rose-400', bg: 'bg-rose-50/20', badge: 'bg-rose-500/10 text-rose-600',
            icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            reason: 'Needs action verb + quantified result'
          },
        };
        const c = cfg[tier];
        const suggestionHtml = b.suggestedVerb && !b.hasAction
          ? `<div class="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-[var(--rc-border)]/30">
              <span class="text-[10px] text-[var(--rc-primary)] font-semibold">Try starting with:</span>
              <code class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--rc-primary)]/10 text-[var(--rc-primary)] border border-[var(--rc-primary)]/20">${b.suggestedVerb}</code>
              <button class="copy-suggestion-btn ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[var(--rc-primary)]/10 text-[var(--rc-primary)] hover:bg-[var(--rc-primary)]/20 transition-colors cursor-pointer" data-verb="${b.suggestedVerb}" data-index="${i}">Copy</button>
            </div>`
          : '';
        const needsMetricsHtml = b.hasAction && !b.hasQuantified
          ? `<div class="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-[var(--rc-border)]/30">
              <span class="text-[10px] text-amber-600 font-semibold">Tip:</span>
              <span class="text-[10px] text-[var(--rc-text-secondary)]">Add a percentage, dollar amount, or time saved to strengthen this bullet.</span>
            </div>`
          : '';
        return `<div class="border-l-[3px] ${c.border} ${c.bg} rounded-r-lg px-3 py-2 border border-y border-r border-[var(--rc-border)]/30">
          <div class="flex items-start gap-2">
            <span class="flex items-center gap-1 text-[10px] font-bold ${c.badge} px-1.5 py-0.5 rounded shrink-0">${c.icon} ${c.label}</span>
            <span class="text-[10px] text-[var(--rc-text-muted)] leading-relaxed flex-1">${c.reason}</span>
          </div>
          <div class="mt-1 text-xs text-[var(--rc-text-primary)] leading-relaxed">${b.text}</div>
          ${suggestionHtml}${needsMetricsHtml}
        </div>`;
      }).join('');
      bulletList.querySelectorAll('.copy-suggestion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const verb = (e.currentTarget as HTMLElement).getAttribute('data-verb') || '';
          navigator.clipboard.writeText(verb).catch(() => {});
          const orig = (e.currentTarget as HTMLElement).textContent;
          (e.currentTarget as HTMLElement).textContent = 'Copied!';
          setTimeout(() => { (e.currentTarget as HTMLElement).textContent = orig; }, 1500);
        });
      });
    }

    const contentMetrics = document.getElementById('content-metrics');
    if (contentMetrics) {
      const hasQuantified = r.bulletQuality.quantified;
      const wordCount = r.resumeWords;
      const avgBulletLen = r.bulletQuality.total > 0 ? Math.round(r.resumeWords / r.bulletQuality.total) : 0;
      contentMetrics.innerHTML = `
        <div class="flex items-center justify-between py-1.5 px-2 rounded-lg bg-canvas-soft/50"><span class="text-xs font-medium text-mute">Resume length</span><span class="text-xs font-bold text-ink">${wordCount} words</span></div>
        <div class="flex items-center justify-between py-1.5 px-2 rounded-lg bg-canvas-soft/50"><span class="text-xs font-medium text-mute">Quantified achievements</span><span class="text-xs font-bold text-ink">${hasQuantified}</span></div>
        <div class="flex items-center justify-between py-1.5 px-2 rounded-lg bg-canvas-soft/50"><span class="text-xs font-medium text-mute">Avg. bullet length</span><span class="text-xs font-bold text-ink">${avgBulletLen > 0 ? avgBulletLen + ' words' : '—'}</span></div>
        <div class="flex items-center justify-between py-1.5 px-2 rounded-lg bg-canvas-soft/50"><span class="text-xs font-medium text-mute">Sections detected</span><span class="text-xs font-bold text-ink">${r.sections.filter((s: any) => s.found).length}/${r.sections.length}</span></div>
      `;
    }

    const missingSkillsGrid = document.getElementById('missing-skills-grid');
    if (missingSkillsGrid) {
      missingSkillsGrid.innerHTML = r.missingSkills.length > 0
        ? r.missingSkills.map((s: string) => `<a href="https://www.google.com/search?q=learn+${encodeURIComponent(s)}+course+tutorial" target="_blank" title="Search for learning resources on ${s}" class="inline-flex px-2.5 py-1.5 rounded-lg text-[10px] font-bold border bg-rose-100/60 text-rose-700 border-rose-200/40 shadow-sm hover:scale-105 hover:bg-rose-200/60 transition-all cursor-pointer select-none">${s} <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="ml-1 shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`).join('')
        : '<p class="text-xs text-indigo-600 font-medium">All skills from the job description are present in your resume.</p>';
    }

    const skillGapRequired = document.getElementById('skill-gap-required');
    const skillGapFound = document.getElementById('skill-gap-found');
    const skillGapMissing = document.getElementById('skill-gap-missing');
    const skillGapFoundCount = document.getElementById('skill-gap-found-count');
    const skillGapMissingCount = document.getElementById('skill-gap-missing-count');
    const allJdSkills = [...new Set([...r.matchedSkills, ...r.missingSkills])];

    if (skillGapFoundCount) skillGapFoundCount.textContent = `${r.matchedSkills.length}`;
    if (skillGapMissingCount) skillGapMissingCount.textContent = `${r.missingSkills.length}`;

    if (skillGapRequired) {
      const sorted = allJdSkills.sort((a, b) => {
        const aFound = r.matchedSkills.includes(a);
        const bFound = r.matchedSkills.includes(b);
        if (aFound && !bFound) return -1;
        if (!aFound && bFound) return 1;
        return a.localeCompare(b);
      });
      skillGapRequired.innerHTML = sorted.length > 0
        ? sorted.map((s: string) => {
          const found = r.matchedSkills.includes(s);
          return found
            ? `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border shadow-sm bg-indigo-100/60 text-indigo-700 border-indigo-200/40">${s}</span>`
            : `<a href="https://www.google.com/search?q=learn+${encodeURIComponent(s)}+course+tutorial" target="_blank" title="Search for learning resources on ${s}" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border shadow-sm bg-rose-100/60 text-rose-700 border-rose-200/40 hover:scale-105 hover:bg-rose-200/60 transition-all cursor-pointer">${s} <span class="text-[10px] font-normal text-rose-500">✗</span></a>`;
        }).join('')
        : '<p class="text-[10px] text-mute">No skills detected in job description.</p>';
    }

    if (skillGapFound) {
      skillGapFound.innerHTML = r.matchedSkills.length > 0
        ? r.matchedSkills.sort().map((s: string) =>
          `<span class="inline-flex px-2.5 py-1.5 rounded-lg text-[10px] font-bold border bg-indigo-100/60 text-indigo-700 border-indigo-200/40">${s}</span>`
        ).join('')
        : '<p class="text-[10px] text-mute">No matching skills found.</p>';
    }

    if (skillGapMissing) {
      skillGapMissing.innerHTML = r.missingSkills.length > 0
        ? r.missingSkills.sort().map((s: string) =>
          `<a href="https://www.google.com/search?q=learn+${encodeURIComponent(s)}+course+tutorial" target="_blank" title="Search for learning resources on ${s}" class="inline-flex px-2.5 py-1.5 rounded-lg text-[10px] font-bold border bg-rose-100/60 text-rose-700 border-rose-200/40 hover:scale-105 hover:bg-rose-200/60 transition-all cursor-pointer">${s} <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="ml-1 shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`
        ).join('')
        : '<p class="text-[10px] text-mute">All skills matched!</p>';
    }

    const pctlEl = document.getElementById('percentile-rank');
    if (pctlEl) {
      pctlEl.textContent = pctl;
      pctlEl.classList.remove('hidden');
    }

    const benchmarkEl = document.getElementById('benchmark-bar');
    if (benchmarkEl) {
      const best = getBestScore(jdText || '');
      const bestScore = best ? Math.max(best.score, r.overall) : r.overall;
      benchmarkEl.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-50/80 dark:bg-indigo-950/30 text-[var(--rc-primary)] border border-indigo-200/20 select-none">
          🏆 ${pctl} of candidates
        </span>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/20 select-none">
          📈 Best score: ${bestScore}%
        </span>
      `;
      benchmarkEl.className = 'flex flex-wrap gap-2 pt-2 border-t border-[var(--rc-border)]/50';
    }

    const ghostBadge = document.getElementById('ghost-job-badge');
    if (ghostBadge && (r as any).ghostJob) {
      const gj = (r as any).ghostJob;
      const colors: Record<string, { bg: string; txt: string; border: string; icon: string; badge: string; desc: string }> = {
        low: { 
          bg: 'bg-emerald-500/5 dark:bg-emerald-500/10', 
          txt: 'text-emerald-700 dark:text-emerald-400', 
          border: 'border-emerald-500/20', 
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          desc: 'This posting has high transparency and contains specific, legitimate role requirements.',
          icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' 
        },
        medium: { 
          bg: 'bg-amber-500/5 dark:bg-amber-500/10', 
          txt: 'text-amber-700 dark:text-amber-400', 
          border: 'border-amber-500/20', 
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          desc: 'Detected suspicious elements (e.g. lack of salary transparency or generic text templates).',
          icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' 
        },
        high: { 
          bg: 'bg-rose-500/5 dark:bg-rose-500/10', 
          txt: 'text-rose-700 dark:text-rose-400', 
          border: 'border-rose-500/20', 
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          desc: 'High probability of resume harvesting, outdated role data, or evergreen hiring pool.',
          icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' 
        },
      };
      const c = colors[gj.risk] || colors.low;
      
      const reasonsList = gj.reasons.map((re: string) => `
        <li class="flex items-start gap-1.5 text-[10px] ${c.txt} opacity-85">
          <span class="mt-1 w-1 h-1 rounded-full bg-current shrink-0"></span>
          <span>${re}</span>
        </li>
      `).join('');

      ghostBadge.innerHTML = `
        <div class="w-full border ${c.border} ${c.bg} rounded-xl p-3 mt-3 animate-fade-in">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2">
              ${c.icon}
              <span class="text-[11px] font-bold ${c.txt}">Ghost Job Assessment:</span>
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${c.badge} border ${c.border}">
                ${gj.label}
              </span>
            </div>
            
            ${gj.reasons.length > 0 ? `
              <button type="button" id="toggle-ghost-reasons-btn" class="text-[10px] font-bold underline ${c.txt} hover:opacity-80 transition-opacity cursor-pointer">
                View Signals (${gj.reasons.length})
              </button>
            ` : ''}
          </div>
          
          <p class="text-[10px] ${c.txt} opacity-80 mt-1.5 leading-relaxed">
            ${c.desc}
          </p>
          
          ${gj.reasons.length > 0 ? `
            <div id="ghost-reasons-panel" class="hidden mt-2.5 pt-2.5 border-t border-current/10">
              <span class="text-[9px] font-bold uppercase tracking-wider ${c.txt} opacity-60 block mb-1.5">Detected Signals</span>
              <ul class="space-y-1">
                ${reasonsList}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
      ghostBadge.classList.remove('hidden');

      // Wire up collapse toggle
      const toggleBtn = ghostBadge.querySelector('#toggle-ghost-reasons-btn');
      const panel = ghostBadge.querySelector('#ghost-reasons-panel');
      if (toggleBtn && panel) {
        toggleBtn.addEventListener('click', () => {
          const isHidden = panel.classList.contains('hidden');
          if (isHidden) {
            panel.classList.remove('hidden');
            toggleBtn.textContent = 'Hide Signals';
          } else {
            panel.classList.add('hidden');
            toggleBtn.textContent = `View Signals (${gj.reasons.length})`;
          }
        });
      }
    }

    const deltaEl = document.getElementById('delta-badge');
    const lastEl = document.getElementById('last-analyzed');
    const saved = loadSession();
    if (deltaEl && jdText) {
      const best = getBestScore(jdText);
      if (best) {
        const diff = r.overall - best.score;
        if (diff > 0) {
          deltaEl.textContent = `${best.score}% (+${diff}% improved)`;
        } else if (diff < 0) {
          deltaEl.textContent = `${best.score}% (${Math.abs(diff)}% below best)`;
        } else {
          deltaEl.textContent = `${best.score}% (Best Score)`;
        }
      } else {
        deltaEl.textContent = `${r.overall}% (Best Score)`;
      }
      deltaEl.className = 'font-bold text-[var(--rc-text-primary)] text-sm mt-0.5 block';
      deltaEl.classList.remove('hidden');
    }
    if (lastEl && saved?.timestamp) {
      const ago = Math.round((Date.now() - saved.timestamp) / 60000);
      lastEl.textContent = ago < 1 ? 'Just now' : ago < 60 ? `${ago}m ago` : `${Math.round(ago / 60)}h ago`;
      lastEl.classList.remove('hidden');
    }

    // 1. Top 3 Reasons Your Score Is Not Higher
    const topReasonsList = document.getElementById('top-reasons-list');
    if (topReasonsList) {
      const reasons = [
        {
          title: 'Low Keyword Match',
          score: r.scoreKeyword,
          desc: 'Your resume lacks critical keywords from the job description.',
          action: 'Use the Score Optimizer Sandbox below to simulate and test matching keywords.'
        },
        {
          title: 'Important Skills Gaps',
          score: r.scoreSkills,
          desc: 'Several key skills listed in the job description are missing.',
          action: 'Incorporate missing skills like ' + (r.missingSkills.slice(0, 2).join(', ') || 'required tools') + '.'
        },
        {
          title: 'Bullet Points Need Impact',
          score: r.scoreBullets,
          desc: 'Your bullet points lack active verbs or measurable metrics.',
          action: 'Revise weak bullets using our line-by-line critiques in ATS Diagnostics below.'
        },
        {
          title: 'Incomplete Sections',
          score: r.scoreSections,
          desc: 'Standard sections (e.g. Summary or Projects) are missing or sparse.',
          action: 'Ensure Summary, Experience, Skills, and Projects are complete.'
        },
        {
          title: 'Experience Alignment Gap',
          score: r.scoreExperience,
          desc: 'The depth or structure of your work history doesn\'t match the JD requirements.',
          action: 'Reframe work experience to highlight responsibilities matching the JD.'
        }
      ];
      
      // Sort to get the worst 3 gaps
      reasons.sort((a, b) => a.score - b.score);
      const top3 = reasons.slice(0, 3);
      
      topReasonsList.innerHTML = top3.map(reason => `
        <div class="p-3.5 rounded-xl border border-rose-100 bg-rose-50/15 flex flex-col justify-between hover:border-rose-200 transition-colors select-none">
          <div>
            <div class="flex items-center gap-1.5 mb-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              <span class="text-xs font-bold text-[var(--rc-text-primary)]">${reason.title}</span>
            </div>
            <p class="text-[11px] text-[var(--rc-text-secondary)] leading-relaxed">${reason.desc}</p>
          </div>
          <div class="mt-2.5 pt-2 border-t border-[var(--rc-border)]/50">
            <span class="text-[10px] font-semibold text-rose-700/80 block">Fix:</span>
            <p class="text-[10px] text-[var(--rc-text-muted)] leading-relaxed mt-0.5">${reason.action}</p>
          </div>
        </div>
      `).join('');
    }
    // 2. Top 5 Resume Changes To Make Today (tipsContainer)
    const tipsContainer = document.getElementById('priority-tips');
    if (tipsContainer) {
      tipsContainer.innerHTML = '';
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      r.tips.sort((a: any, b: any) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);

      const categoryConfig: Record<string, { icon: string; bg: string; text: string }> = {
        keywords: { 
          icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>', 
          bg: 'bg-indigo-50 dark:bg-indigo-950/30', 
          text: 'text-indigo-600 dark:text-indigo-400'
        },
        content: { 
          icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', 
          bg: 'bg-amber-50 dark:bg-amber-950/30', 
          text: 'text-amber-600 dark:text-amber-400'
        },
        skills: { 
          icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--rc-primary)]"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', 
          bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
          text: 'text-emerald-600 dark:text-emerald-400'
        },
        sections: { 
          icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-violet-500"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>', 
          bg: 'bg-violet-50 dark:bg-violet-950/30', 
          text: 'text-violet-600 dark:text-violet-400'
        },
        format: { 
          icon: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-sky-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>', 
          bg: 'bg-sky-50 dark:bg-sky-950/30', 
          text: 'text-sky-600 dark:text-sky-400'
        },
      };

      r.tips.slice(0, 5).forEach((tip: any) => {
        const cat = categoryConfig[tip.category as keyof typeof categoryConfig] || categoryConfig.content;
        tipsContainer.insertAdjacentHTML('beforeend', `
          <div class="flex items-start gap-3 p-3 rounded-xl border border-[var(--rc-border)] bg-[var(--rc-card-bg)] hover:border-[var(--rc-border-strong)] transition-colors duration-200 select-none">
            <span class="w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center shrink-0 ${cat.text}">
              ${cat.icon}
            </span>
            <div>
              <p class="text-xs font-bold text-[var(--rc-text-primary)]">${tip.title}</p>
              <p class="text-[11px] text-[var(--rc-text-secondary)] mt-0.5 leading-relaxed font-medium">${tip.action}</p>
              <p class="text-[10px] text-[var(--rc-text-muted)] mt-1.5 italic">${tip.detail}</p>
            </div>
          </div>
        `);
      });
    }

    // 3. Recruiter Perspective description text
    const recruiterDesc = document.getElementById('recruiter-description');
    if (recruiterDesc) {
      const hasQuantified = r.bulletQuality.quantified >= Math.max(r.bulletQuality.total * 0.3, 1);
      const hasVerbs = r.bulletQuality.actionVerbs >= Math.max(r.bulletQuality.total * 0.5, 1);
      const hasSections = r.sections.filter((s: any) => s.required && s.found).length >= 3;
      const kwOk = r.matchedWords.size / Math.max(r.matchedWords.size + r.missingWords.size, 1) >= 0.5;
      const notes: string[] = [];
      if (hasQuantified) notes.push('strong quantified results in your experience section');
      if (hasVerbs) notes.push('consistent use of action verbs');
      if (!hasSections) notes.push('missing required sections');
      if (!kwOk) notes.push('missing key job description keywords');
      if (r.missingSkills.length > 3) notes.push(`${r.missingSkills.length} missing skills`);
      if (r.resumeWords < 200) notes.push('a thin resume profile');
      if (notes.length === 0) notes.push('a well-structured resume');
      const intro = r.overall >= 70 ? 'Your resume shows strong technical skills and relevant experience. Focus on adding more measurable achievements' : r.overall >= 50 ? 'Your resume shows decent alignment with the requirements, but we notice' : 'Your resume has significant gaps compared to the job requirements, notably';
      recruiterDesc.innerHTML = `${intro} like <strong class="text-[var(--rc-text-primary)]">${notes.slice(0, 2).join(', and ')}</strong>.${notes.length > 2 ? ` Additionally, try to address ${notes.slice(2, 4).join(', and ')}.` : ''}`;
    }

    // 4. Missing Skills That Matter Most
    const missingSkillsMatter = document.getElementById('missing-skills-matter');
    if (missingSkillsMatter) {
      const topSkills = r.missingSkills.sort().slice(0, 10);
      let html = topSkills.map((s: string) =>
        `<button type="button" class="add-skill-btn inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/30 hover:scale-105 transition-transform duration-200 cursor-pointer" data-skill="${s}" title="Click to add ${s} to your resume">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="mr-1 shrink-0"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          ${s}
        </button>`
      ).join('');
      if (r.missingSkills.length > 10) {
        html += `<button type="button" class="view-all-skills-trigger inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-[var(--rc-primary)] border border-indigo-200/30 hover:opacity-85 transition-opacity cursor-pointer select-none">+${r.missingSkills.length - 10} more</button>`;
      }
      missingSkillsMatter.innerHTML = html.length > 0 ? html : '<p class="text-[10px] text-[var(--rc-text-muted)] select-none">All skills from the job description are present in your resume.</p>';

      // Bind click listeners for adding missing skills
      missingSkillsMatter.querySelectorAll('.add-skill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const skill = (e.currentTarget as HTMLElement).getAttribute('data-skill');
          if (skill) {
            appendSkillToResume(skill);
          }
        });
      });
    }

    // Attach listeners for view all skills triggers
    document.querySelectorAll('.view-all-skills-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const details = document.querySelectorAll('details') as NodeListOf<HTMLDetailsElement>;
        const keywordDetails = details[1]; // Second accordion
        if (keywordDetails) {
          keywordDetails.open = true;
          const target = document.getElementById('skill-gap-required');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    });

    // Populate weak bullets suggestions in the Bullet Point Optimizer
    const weakBullets = r.bulletQuality.details.filter((b: any) => !b.hasAction || !b.hasQuantified);
    const suggestionsPanel = document.getElementById('bullet-opt-suggestions');
    const suggestionsList = document.getElementById('bullet-suggestions-list');

    if (suggestionsPanel && suggestionsList) {
      if (weakBullets.length > 0) {
        suggestionsList.innerHTML = weakBullets.map((b: any, idx: number) => {
          const typeLabel = !b.hasAction && !b.hasQuantified ? 'Weak Phrasing & No Metrics' : !b.hasAction ? 'Needs Action Verb' : 'Needs Quantifiable Metrics';
          const badgeClass = !b.hasAction && !b.hasQuantified ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
          return `
            <button type="button" class="w-full text-left p-2 rounded-lg border border-[var(--rc-border)] bg-[var(--rc-card-bg)] hover:border-[var(--rc-primary)]/40 transition-all flex items-start justify-between gap-3 group cursor-pointer" data-idx="${idx}">
              <div class="flex-1 min-w-0">
                <p class="text-[10px] text-[var(--rc-text-primary)] font-medium leading-relaxed truncate group-hover:text-[var(--rc-primary)]">
                  "${b.text}"
                </p>
              </div>
              <span class="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${badgeClass}">
                ${typeLabel}
              </span>
            </button>
          `;
        }).join('');

        suggestionsPanel.classList.remove('hidden');

        // Add click events to suggestions
        suggestionsList.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
            const targetBullet = weakBullets[idx];
            if (targetBullet) {
              const inputEl = document.getElementById('bullet-opt-input') as HTMLTextAreaElement;
              const focusEl = document.getElementById('bullet-opt-focus') as HTMLSelectElement;
              if (inputEl) {
                inputEl.value = targetBullet.text;
                // Automatically select appropriate focus
                if (focusEl) {
                  const txt = targetBullet.text.toLowerCase();
                  if (txt.includes('api') || txt.includes('backend') || txt.includes('service') || txt.includes('server') || txt.includes('latency') || txt.includes('speed') || txt.includes('performance')) {
                    focusEl.value = 'performance';
                  } else if (txt.includes('database') || txt.includes('query') || txt.includes('sql') || txt.includes('scale') || txt.includes('cloud') || txt.includes('aws')) {
                    focusEl.value = 'scale';
                  } else if (txt.includes('sale') || txt.includes('revenue') || txt.includes('growth') || txt.includes('conversion')) {
                    focusEl.value = 'revenue';
                  } else if (txt.includes('cost') || txt.includes('budget') || txt.includes('saving') || txt.includes('automation') || txt.includes('script')) {
                    focusEl.value = 'efficiency';
                  } else if (txt.includes('lead') || txt.includes('team') || txt.includes('manage') || txt.includes('mentor') || txt.includes('squad')) {
                    focusEl.value = 'leadership';
                  } else {
                    focusEl.value = 'general';
                  }
                }
                
                // Trigger optimize
                runBulletOptimizer();
                
                // Scroll optimizer result into view
                const resultEl = document.getElementById('bullet-opt-result');
                if (resultEl) {
                  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }
            }
          });
        });
      } else {
        suggestionsPanel.classList.add('hidden');
      }
    }

    const dashSections = document.querySelectorAll('#dashboard > *');
    dashSections.forEach((el, i) => {
      if (i === 0) return;
      el.classList.add('animate-fade-up');
      (el as HTMLElement).style.animationDelay = `${0.1 + i * 0.15}s`;
    });
  }

  function generateAISummary(r: typeof currentResult): string {
    const dims = [
      { name: 'Keyword Alignment', score: r.scoreKeyword, weight: 0.3 },
      { name: 'Skills Match', score: r.scoreSkills, weight: 0.2 },
      { name: 'Content Quality', score: r.scoreContent, weight: 0.15 },
      { name: 'Experience Depth', score: r.scoreExperience, weight: 0.1 },
    ];
    const sorted = [...dims].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const g = gradeScore(r.overall);
    const pctl = r.overall >= 90 ? 'top 5%' : r.overall >= 80 ? 'top 12%' : r.overall >= 70 ? 'top 25%' : r.overall >= 60 ? 'top 40%' : r.overall >= 50 ? 'top 55%' : r.overall >= 40 ? 'top 68%' : r.overall >= 30 ? 'top 80%' : 'bottom 25%';
    return `<div class="animate-fade-up"><div class="flex items-center gap-2 mb-1"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--rc-primary)] shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span class="text-[10px] font-bold text-[var(--rc-primary)] uppercase tracking-wider">AI Analysis</span></div><p class="text-xs text-[var(--rc-text-secondary)] leading-relaxed">Based on our analysis, your resume scores <strong class="text-[var(--rc-text-primary)]">${r.overall}%</strong> — a <strong class="text-[var(--rc-text-primary)]">${g.letter} (${g.label})</strong>. You rank in the <strong>${pctl}</strong> of candidates for this role. Your strongest dimension is <strong class="text-[var(--rc-primary)]">${best.name}</strong> (${best.score}%), but <strong class="text-rose-600">${worst.name}</strong> (${worst.score}%) needs the most improvement.</p></div>`;
  }

  function generateStrengthsWeaknesses(r: typeof currentResult): string {
    const checks: { label: string; good: boolean; detail: string }[] = [];
    const kwRate = r.matchedWords.size / Math.max(r.matchedWords.size + r.missingWords.size, 1);
    checks.push({ label: 'Keyword match rate', good: kwRate >= 0.5, detail: `${r.matchedWords.size} of ${r.matchedWords.size + r.missingWords.size} keywords matched` });
    checks.push({ label: 'Action verbs in bullets', good: r.bulletQuality.actionVerbs >= Math.max(r.bulletQuality.total * 0.5, 1), detail: `${r.bulletQuality.actionVerbs} of ${r.bulletQuality.total} bullets` });
    checks.push({ label: 'Quantified achievements', good: r.bulletQuality.quantified >= Math.max(r.bulletQuality.total * 0.3, 1), detail: `${r.bulletQuality.quantified} quantified bullets` });
    checks.push({ label: 'Required sections present', good: r.sections.filter((s: any) => s.required && s.found).length >= 3, detail: `${r.sections.filter((s: any) => s.required && s.found).length}/4 key sections` });
    checks.push({ label: 'Skills alignment', good: r.matchedSkills.length >= Math.max(r.missingSkills.length * 0.5, 1), detail: `${r.matchedSkills.length} matched, ${r.missingSkills.length} missing` });
    checks.push({ label: 'Resume length', good: r.resumeWords >= 200 && r.resumeWords <= 700, detail: `${r.resumeWords} words` });
    const strengths = checks.filter(c => c.good);
    const weaknesses = checks.filter(c => !c.good);
    return `<div class="animate-fade-up"><div class="flex items-center gap-2 mb-2"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--rc-primary)] shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span class="text-[10px] font-bold text-[var(--rc-text-primary)] uppercase tracking-wider">Snapshot</span></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${strengths.slice(0, 4).map(s => `<div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50/50 border border-indigo-200/20"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg><span class="text-[10px] font-medium text-indigo-700">${s.label}</span></div>`).join('')}${weaknesses.slice(0, 3).map(s => `<div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50/50 border border-rose-200/20"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500 shrink-0"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span class="text-[10px] font-medium text-rose-700">${s.label}</span></div>`).join('')}</div></div>`;
  }

  function generateRecruiterInsight(r: typeof currentResult): string {
    const hasQuantified = r.bulletQuality.quantified >= Math.max(r.bulletQuality.total * 0.3, 1);
    const hasVerbs = r.bulletQuality.actionVerbs >= Math.max(r.bulletQuality.total * 0.5, 1);
    const hasSections = r.sections.filter((s: any) => s.required && s.found).length >= 3;
    const kwOk = r.matchedWords.size / Math.max(r.matchedWords.size + r.missingWords.size, 1) >= 0.5;
    const notes: string[] = [];
    if (hasQuantified) notes.push('strong quantified results in your experience section that stand out to hiring managers');
    if (hasVerbs) notes.push('consistent use of action verbs — a signal of clear, confident communication');
    if (!hasSections) notes.push('missing required sections that could cause ATS parsing errors');
    if (!kwOk) notes.push('missing keywords from the job description that could hurt your ATS ranking');
    if (r.missingSkills.length > 3) notes.push(`${r.missingSkills.length} missing skills a recruiter would expect to see for this role`);
    if (r.resumeWords < 200) notes.push('a thin resume that may not provide enough context for an informed hiring decision');
    if (notes.length === 0) notes.push('a well-structured resume that presents your qualifications clearly');
    const intro = r.overall >= 70 ? 'A recruiter reviewing your resume would likely be impressed by' : r.overall >= 50 ? 'A recruiter reviewing your resume would notice' : 'A recruiter reviewing your resume would flag';
    return `<div class="animate-fade-up"><div class="flex items-center gap-2 mb-1"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span class="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Recruiter Perspective</span></div><p class="text-xs text-[var(--rc-text-secondary)] leading-relaxed">${intro} <strong class="text-[var(--rc-text-primary)]">${notes.slice(0, 2).join(', and ')}</strong>.${notes.length > 2 ? ` Additionally, ${notes.slice(2, 4).join(', and ')}.` : ''}</p></div>`;
  }

  function scheduleAnalysis(immediate = false) {
    console.log('[RC] scheduleAnalysis called, immediate:', immediate);
    clearTimeout(analysisTimeout);
    const resume = resumeInput.value;
    const jd = jdInput.value;
    console.log('[RC] resume length:', resume.length, 'jd length:', jd.length);
    if (!resume.trim() || !jd.trim()) {
      console.log('[RC] one or both empty, resetting');
      resetDashboard();
      printPdfBtn?.classList.add('hidden');
      return;
    }
    if (immediate) {
      console.log('[RC] running immediate analysis');
      analyze(resume, jd);
    } else {
      console.log('[RC] setting timeout for 400ms');
      analysisTimeout = setTimeout(() => {
        console.log('[RC] timeout fired!');
        analyze(resume, jd);
      }, 400);
    }
  }

  function updateCounts() {
    const rwc = document.getElementById('resume-word-count');
    const rcc = document.getElementById('resume-char-count');
    const jwc = document.getElementById('jd-word-count');
    const jcc = document.getElementById('jd-char-count');
    const rw = resumeInput.value.trim() ? resumeInput.value.trim().split(/\s+/).length : 0;
    const jw = jdInput.value.trim() ? jdInput.value.trim().split(/\s+/).length : 0;
    if (rwc) rwc.textContent = `${rw} words`;
    if (rcc) rcc.textContent = `${resumeInput.value.length} chars`;
    if (jwc) jwc.textContent = `${jw} words`;
    if (jcc) jcc.textContent = `${jdInput.value.length} chars`;
  }

  resumeInput.addEventListener('input', () => { updateCounts(); scheduleAnalysis(); updateInputOverlays(); });
  resumeInput.addEventListener('focus', () => { updateInputOverlays(); });
  resumeInput.addEventListener('blur', () => { updateInputOverlays(); });

  jdInput.addEventListener('input', () => { updateCounts(); scheduleAnalysis(); updateInputOverlays(); });
  jdInput.addEventListener('focus', () => { updateInputOverlays(); });
  jdInput.addEventListener('blur', () => { updateInputOverlays(); });

  resumeOverlay?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      document.getElementById('import-resume-btn')?.click();
    } else {
      resumeInput.focus();
    }
  });

  jdOverlay?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      document.getElementById('import-jd-btn')?.click();
    } else {
      jdInput.focus();
    }
  });

  analyzeBtn?.addEventListener('click', () => {
    scheduleAnalysis(true);
    if (resumeInput.value.trim() && jdInput.value.trim()) {
      setTimeout(() => {
        const targetEl = document.getElementById('dashboard');
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  });

  seeSuggestionsBtn?.addEventListener('click', () => {
    const improvementsCard = document.getElementById('improvements-card');
    if (improvementsCard) {
      improvementsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  viewBreakdownBtn?.addEventListener('click', () => {
    const details = document.querySelector('details.rc-card') as HTMLDetailsElement;
    if (details) {
      details.open = true;
      details.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  viewAllSkillsBtn?.addEventListener('click', () => {
    const details = document.querySelector('details.rc-card') as HTMLDetailsElement;
    if (details) {
      details.open = true;
      const target = document.getElementById('skill-gap-required');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  clearBtn?.addEventListener('click', () => {
    clearTimeout(analysisTimeout);
    resumeInput.value = '';
    jdInput.value = '';
    updateCounts();
    resetDashboard();
    printPdfBtn?.classList.add('hidden');
    currentResult = null;
    clearSession();
    
    // Clear Score Sandbox
    const sandboxInput = document.getElementById('sandbox-input') as HTMLInputElement;
    const sandboxResult = document.getElementById('sandbox-result');
    if (sandboxInput) sandboxInput.value = '';
    if (sandboxResult) sandboxResult.classList.add('hidden');
  });

  // --- Score Optimizer Sandbox & Custom Changes Form Setup ---
  const sandboxInput = document.getElementById('sandbox-input') as HTMLInputElement;
  const sandboxTestBtn = document.getElementById('sandbox-test-btn');
  const sandboxResult = document.getElementById('sandbox-result');

  sandboxTestBtn?.addEventListener('click', () => {
    simulateSandbox();
  });

  sandboxInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      simulateSandbox();
    }
  });

  function simulateSandbox() {
    if (!currentResult) {
      if (sandboxResult) {
        sandboxResult.innerHTML = `<span class="text-rose-500 font-semibold select-none">No scan data found. Please analyze your resume first.</span>`;
        sandboxResult.classList.remove('hidden');
      }
      return;
    }
    const val = sandboxInput?.value.trim();
    if (!val) {
      if (sandboxResult) sandboxResult.classList.add('hidden');
      return;
    }

    // Split by commas
    const terms = val.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
    if (terms.length === 0) {
      if (sandboxResult) sandboxResult.classList.add('hidden');
      return;
    }

    const matchedSkills: string[] = [];
    const matchedWords: string[] = [];

    const missingSkillsArr = currentResult.missingSkills.map((s: string) => s.toLowerCase());
    const missingWordsArr = Array.from(currentResult.missingWords).map((w: any) => w.toLowerCase());

    terms.forEach(term => {
      const skillMatchIndex = missingSkillsArr.findIndex((s: string) => s === term || s.includes(term) || term.includes(s));
      if (skillMatchIndex !== -1) {
        matchedSkills.push(currentResult.missingSkills[skillMatchIndex]);
      } else {
        const wordMatchIndex = missingWordsArr.findIndex((w: string) => w === term || w.includes(term) || term.includes(w));
        if (wordMatchIndex !== -1) {
          matchedWords.push(Array.from(currentResult.missingWords)[wordMatchIndex] as string);
        }
      }
    });

    const uniqueMatches = Array.from(new Set([...matchedSkills, ...matchedWords]));
    
    if (uniqueMatches.length === 0) {
      if (sandboxResult) {
        sandboxResult.innerHTML = `
          <div class="flex-grow select-none">
            <span class="font-bold text-amber-600">0% Simulated Score Impact</span>
            <p class="text-[10px] text-[var(--rc-text-secondary)] mt-0.5">Tested terms do not match any identified missing keywords or skills.</p>
          </div>
        `;
        sandboxResult.classList.remove('hidden');
      }
    } else {
      const boost = Math.min(uniqueMatches.length * 3.5, 100 - currentResult.overall);
      const newScore = Math.min(currentResult.overall + Math.round(boost), 100);
      const isActuallyBoosted = Math.round(boost) > 0;

      if (sandboxResult) {
        sandboxResult.innerHTML = `
          <div class="flex-grow select-none">
            <span class="font-bold ${isActuallyBoosted ? 'text-emerald-600' : 'text-indigo-600'}">${isActuallyBoosted ? '+' + Math.round(boost) + '%' : '0%'} simulated score increase</span>
            <p class="text-[10px] text-[var(--rc-text-secondary)] mt-0.5">
              Adding <span class="font-semibold text-[var(--rc-text-primary)]">${uniqueMatches.join(', ')}</span> would raise your score to <span class="font-bold text-[var(--rc-text-primary)]">${newScore}%</span>.
            </p>
          </div>
          ${isActuallyBoosted ? `
          <button id="sandbox-apply-btn" type="button" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors cursor-pointer shrink-0 select-none shadow-sm flex items-center gap-1">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"/></svg>
            Add to Resume
          </button>
          ` : ''}
        `;
        sandboxResult.classList.remove('hidden');

        const applyBtn = document.getElementById('sandbox-apply-btn');
        applyBtn?.addEventListener('click', () => {
          const currentResumeText = resumeInput.value;
          const appendage = `\n\nOptimized Skills & Keywords: ${uniqueMatches.join(', ')}`;
          resumeInput.value = currentResumeText + appendage;
          updateCounts();
          
          if (sandboxInput) sandboxInput.value = '';
          sandboxResult.classList.add('hidden');
          
          scheduleAnalysis(true);
        });
      }
    }
  }

  // --- Custom Checklist changes form ---
  const customTipsForm = document.getElementById('custom-tips-form');
  const customTipsInput = document.getElementById('custom-tips-input') as HTMLInputElement;

  customTipsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = customTipsInput?.value.trim();
    if (!val) return;

    const tipsContainer = document.getElementById('priority-tips');
    if (tipsContainer) {
      const uniqueId = `custom-tip-${Date.now()}`;
      
      const customHtml = `
        <div id="${uniqueId}" class="custom-checklist-item flex items-start gap-3 p-3 rounded-xl border border-indigo-200/60 bg-indigo-50/5 hover:border-indigo-300 transition-colors duration-200 select-none">
          <button type="button" class="custom-check-btn w-5 h-5 rounded-md border border-[var(--rc-border-strong)] bg-[var(--rc-card-bg)] hover:bg-emerald-50 hover:border-emerald-500 transition-colors flex items-center justify-center shrink-0 cursor-pointer mt-0.5">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600 hidden"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <div class="flex-grow">
            <p class="text-xs font-bold text-[var(--rc-text-primary)]">User Custom Check: ${val}</p>
            <p class="text-[10px] text-[var(--rc-text-secondary)] mt-0.5">Custom action item added by user to optimize ATS score.</p>
          </div>
          <button type="button" class="custom-delete-btn text-[var(--rc-text-muted)] hover:text-rose-500 transition-colors shrink-0 cursor-pointer mt-0.5" title="Remove change">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `;
      tipsContainer.insertAdjacentHTML('beforeend', customHtml);
      
      if (customTipsInput) customTipsInput.value = '';

      const itemEl = document.getElementById(uniqueId);
      if (itemEl) {
        const checkBtn = itemEl.querySelector('.custom-check-btn');
        const checkIcon = checkBtn?.querySelector('svg');
        const textEl = itemEl.querySelector('p');
        const deleteBtn = itemEl.querySelector('.custom-delete-btn');

        checkBtn?.addEventListener('click', () => {
          if (checkIcon) {
            checkIcon.classList.toggle('hidden');
            if (!checkIcon.classList.contains('hidden')) {
              textEl?.classList.add('line-through', 'opacity-50');
              itemEl.classList.remove('border-indigo-200/60', 'bg-indigo-50/5');
              itemEl.classList.add('border-emerald-200', 'bg-emerald-50/10');
            } else {
              textEl?.classList.remove('line-through', 'opacity-50');
              itemEl.classList.remove('border-emerald-200', 'bg-emerald-50/10');
              itemEl.classList.add('border-indigo-200/60', 'bg-indigo-50/5');
            }
          }
        });

        deleteBtn?.addEventListener('click', () => {
          itemEl.remove();
        });
      }
    }
  });

  function loadSampleData() {
    console.log('[RC] loadSampleData called');
    resumeInput.value = `John Doe
john.doe@email.com | linkedin.com/in/johndoe | (555) 123-4567

Professional Summary
Results-driven software engineer with 5+ years of experience building scalable web applications. Passionate about clean architecture and delivering measurable business impact through technology.

Professional Experience
Senior Software Engineer | TechCorp Inc. | Jan 2022 - Present
- Led development of a real-time analytics dashboard serving 50K+ daily users, improving data refresh latency by 60%
- Architected a microservices migration strategy that reduced deployment time from 4 hours to 15 minutes
- Mentored 4 junior engineers through structured code reviews and pair programming sessions
- Implemented CI/CD pipelines using GitHub Actions, achieving 99.9% deployment success rate
- Reduced cloud infrastructure costs by 35% through right-sizing and reserved instance optimization

Software Engineer | StartupXYZ | Mar 2019 - Dec 2021
- Built RESTful APIs handling 10M+ requests/month with 99.95% uptime
- Collaborated with product team to launch 3 major features, contributing to 40% user growth
- Automated ETL pipelines processing 500K+ records daily, saving 20 engineering hours per week
- Wrote comprehensive unit and integration tests achieving 92% code coverage

Junior Developer | WebAgency | Jun 2017 - Feb 2019
- Developed responsive web applications using React, TypeScript, and Node.js
- Optimized database queries reducing page load times by 45%
- Participated in agile ceremonies and contributed to sprint planning and retrospectives

Education
Bachelor of Science in Computer Science | State University | 2013 - 2017
- GPA: 3.7/4.0 | Dean's List 4 semesters

Technical Skills
Languages: JavaScript, TypeScript, Python, Java, SQL
Frontend: React, Next.js, HTML/CSS, Tailwind CSS
Backend: Node.js, Express, Django, PostgreSQL, MongoDB, Redis
DevOps: AWS, Docker, Kubernetes, Terraform, GitHub Actions, CI/CD
Tools: Git, Jira, Confluence, Figma, Datadog, Sentry

Certifications
AWS Solutions Architect - Associate (2023)
Google Cloud Associate Engineer (2022)`;
    jdInput.value = `Senior Full Stack Engineer

About the Role
We're looking for an experienced Full Stack Engineer to join our growing platform team. You'll architect and build features that serve millions of users while mentoring junior engineers and driving technical excellence.

Requirements
- 5+ years of professional software engineering experience
- Strong proficiency in JavaScript, TypeScript, React, and Node.js
- Experience designing and building RESTful APIs at scale (10M+ requests/month)
- Deep understanding of SQL and NoSQL databases (PostgreSQL, MongoDB, Redis)
- Hands-on experience with cloud infrastructure (AWS, Docker, Kubernetes)
- Track record of implementing CI/CD pipelines and automated testing
- Strong communication skills and experience mentoring other engineers

Preferred Qualifications
- Experience with microservices architecture
- Knowledge of performance optimization and cost optimization
- Familiarity with Terraform or infrastructure as code
- Contributions to open source projects

What You'll Do
- Design, build, and maintain scalable web applications serving 1M+ users
- Lead architectural decisions and drive engineering best practices
- Mentor junior team members through code reviews and technical guidance
- Collaborate with product, design, and data teams to deliver features
- Optimize application performance and cloud infrastructure costs
- Write comprehensive tests and maintain high code coverage standards

We Offer
- Competitive salary and equity package
- Remote-first culture with flexible working hours
- Professional development budget
- Health, dental, and vision coverage`;
    updateCounts();
    updateInputOverlays();
    if (emptyState) emptyState.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    scheduleAnalysis(true);
  }

  sampleBtn?.addEventListener('click', loadSampleData);
  document.getElementById('sample-btn-header')?.addEventListener('click', loadSampleData);



  const importBtn = document.getElementById('import-resume-btn');
  const fileInput = document.getElementById('resume-file-input') as HTMLInputElement;
  const importStatus = document.getElementById('import-status');
  const importJdBtn = document.getElementById('import-jd-btn');
  const jdFileInput = document.getElementById('jd-file-input') as HTMLInputElement;
  const importJdStatus = document.getElementById('import-jd-status');

  function setupDropZone(zoneId: string, inputId: string, statusId: string, textareaId: string, btnId: string) {
    const zone = document.getElementById(zoneId);
    const overlay = zone?.querySelector(`#${zoneId.replace('-dropzone', '-drop-overlay')}`) as HTMLElement;
    const btn = document.getElementById(btnId);

    if (!zone) return;

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('border-indigo-400', 'bg-indigo-50/30');
      if (overlay) overlay.style.opacity = '1';
    });

    zone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      zone.classList.remove('border-indigo-400', 'bg-indigo-50/30');
      if (overlay) overlay.style.opacity = '0';
    });

    zone.addEventListener('drop', async (e) => {
      e.preventDefault();
      zone.classList.remove('border-indigo-400', 'bg-indigo-50/30');
      if (overlay) overlay.style.opacity = '0';

      const file = e.dataTransfer?.files?.[0];
      if (!file) return;

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx', 'txt'].includes(ext || '')) return;

      const statusEl = document.getElementById(statusId);
      const ta = document.getElementById(textareaId) as HTMLTextAreaElement;
      btn?.setAttribute('disabled', 'true');
      btn?.classList.add('opacity-50', 'cursor-not-allowed');
      if (statusEl) { statusEl.textContent = `Parsing ${file.name}…`; statusEl.classList.remove('hidden'); }

      try {
        let text: string;
        if (ext === 'pdf') text = await parsePDF(file);
        else if (ext === 'docx') text = await parseDOCX(file);
        else text = await parseTXT(file);
        ta.value = text.trim();
        if (statusEl) statusEl.textContent = `Imported ${file.name} (${text.split(/\s+/).length} words)`;
        btn?.classList.remove('opacity-50', 'cursor-not-allowed');
        btn?.removeAttribute('disabled');
        setTimeout(() => { if (statusEl) statusEl.classList.add('hidden'); }, 3000);
        updateCounts();
        updateInputOverlays();
        if (emptyState) emptyState.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
        scheduleAnalysis(true);
      } catch (err) {
        if (statusEl) statusEl.textContent = `Error parsing ${file.name}. Try pasting manually.`;
        btn?.classList.remove('opacity-50', 'cursor-not-allowed');
        btn?.removeAttribute('disabled');
      }
    });
  }

  setupDropZone('resume-dropzone', 'resume-file-input', 'import-status', 'resume-input', 'import-resume-btn');
  setupDropZone('jd-dropzone', 'jd-file-input', 'import-jd-status', 'jd-input', 'import-jd-btn');

  async function parsePDF(file: File): Promise<string> {
    const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const items = content.items as any[];
      if (items.length === 0) continue;
      
      // Group items by vertical position transform[5] (y-coordinate)
      const linesMap: { [y: number]: any[] } = {};
      const yTolerance = 3; // Group items within 3px vertically
      
      items.forEach(item => {
        if (!item.str) return;
        const y = item.transform[5];
        
        let foundY = Object.keys(linesMap).map(Number).find(key => Math.abs(key - y) < yTolerance);
        if (foundY !== undefined) {
          linesMap[foundY].push(item);
        } else {
          linesMap[y] = [item];
        }
      });
      
      // Sort lines from top to bottom (y coordinate descending)
      const sortedYKeys = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
      
      let pageText = '';
      sortedYKeys.forEach(y => {
        const lineItems = linesMap[y];
        // Sort items on the same line from left to right (x coordinate ascending)
        lineItems.sort((a, b) => a.transform[4] - b.transform[4]);
        
        const lineText = lineItems.map(item => item.str).join(' ');
        if (lineText.trim()) {
          pageText += lineText + '\n';
        }
      });
      
      text += pageText + '\n';
    }
    return text.trim();
  }

  async function parseDOCX(file: File): Promise<string> {
    const mammothModule = await import('https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js');
    const mammoth = mammothModule.default || mammothModule || (window as any).mammoth;
    const data = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: data });
    return result.value;
  }

  async function parseTXT(file: File): Promise<string> {
    return await file.text();
  }

  importBtn?.addEventListener('click', () => fileInput?.click());
  importJdBtn?.addEventListener('click', () => jdFileInput?.click());

  async function handleFileImport(fileInput: HTMLInputElement, textarea: HTMLTextAreaElement, statusEl: HTMLElement | null, btn: HTMLElement | null) {
    const file = fileInput.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (statusEl) { statusEl.textContent = `Parsing ${file.name}…`; statusEl.classList.remove('hidden'); }
    btn?.setAttribute('disabled', 'true');
    btn?.classList.add('opacity-50', 'cursor-not-allowed');
    try {
      let text: string;
      if (ext === 'pdf') text = await parsePDF(file);
      else if (ext === 'docx') text = await parseDOCX(file);
      else text = await parseTXT(file);
      textarea.value = text.trim();
      if (textarea === resumeInput) {
        importedFileExt = ext || 'txt';
        importedFileName = file.name.replace(/\.[^/.]+$/, "");
      }
      if (statusEl) statusEl.textContent = `Imported ${file.name} (${text.split(/\s+/).length} words)`;
      btn?.classList.remove('opacity-50', 'cursor-not-allowed');
      btn?.removeAttribute('disabled');
      setTimeout(() => { if (statusEl) statusEl.classList.add('hidden'); }, 3000);
      updateCounts();
      updateInputOverlays();
      if (emptyState) emptyState.classList.add('hidden');
      if (dashboard) dashboard.classList.remove('hidden');
      scheduleAnalysis(true);
    } catch (err) {
      if (statusEl) statusEl.textContent = `Error parsing ${file.name}. Try pasting manually.`;
      btn?.classList.remove('opacity-50', 'cursor-not-allowed');
      btn?.removeAttribute('disabled');
    }
  }

  fileInput?.addEventListener('change', async () => {
    await handleFileImport(fileInput, resumeInput, importStatus, importBtn);
    fileInput.value = '';
  });

  jdFileInput?.addEventListener('change', async () => {
    await handleFileImport(jdFileInput, jdInput, importJdStatus, importJdBtn);
    jdFileInput.value = '';
  });

  // Print PDF button listener
  printPdfBtn?.addEventListener('click', () => {
    window.print();
  });

  // Bullet point rewriter logic
  const bulletOptBtn = document.getElementById('bullet-opt-btn');
  const bulletOptInput = document.getElementById('bullet-opt-input') as HTMLTextAreaElement;
  
  bulletOptBtn?.addEventListener('click', runBulletOptimizer);
  bulletOptInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      runBulletOptimizer();
    }
  });

  function runBulletOptimizer() {
    const inputEl = document.getElementById('bullet-opt-input') as HTMLTextAreaElement;
    const resultEl = document.getElementById('bullet-opt-result');
    const focusEl = document.getElementById('bullet-opt-focus') as HTMLSelectElement;
    if (!inputEl || !resultEl) return;

    const rawBullet = inputEl.value.trim();
    if (!rawBullet) {
      resultEl.innerHTML = `<span class="text-rose-500 font-semibold text-xs select-none">Please paste a bullet point to optimize.</span>`;
      resultEl.classList.remove('hidden');
      return;
    }

    const focusVal = focusEl ? focusEl.value : 'general';
    const lower = rawBullet.toLowerCase();

    // Clean up starting verbs and weak phrases
    let cleaned = rawBullet.replace(/^(?:responsible for|assisted with|helped in|worked on|handled|did|assisted in|participated in|tasked with|wrote|built|created|made|ran|used|worked|helped|assisted|spearheaded|architected|designed|implemented|optimized|orchestrated|led|restructured|automated|audited)\s+/i, '');
    cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    
    // Ensure it doesn't end with a period for string interpolation formatting
    cleaned = cleaned.replace(/\.$/, '');

    // Define variations based on selected focus
    interface Variant {
      title: string;
      verb: string;
      metric: string;
      text: string; // Plain text version for clipboard
      html: string; // HTML version with styled spans
    }
    
    let variants: Variant[] = [];

    if (focusVal === 'performance') {
      variants = [
        {
          title: '⚡ Latency & Reliability Focus',
          verb: 'Accelerated and optimized',
          metric: 'reducing API response latency by 35% and elevating system uptime to 99.9%',
          text: `Accelerated and optimized ${cleaned}, reducing API response latency by 35% and elevating system uptime to 99.9%.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Accelerated and optimized</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">reducing API response latency by 35% and elevating system uptime to 99.9%</span>.`
        },
        {
          title: '⚡ Compute Overhead Focus',
          verb: 'Spearheaded performance tuning for',
          metric: 'resulting in a 40% reduction in CPU overhead and faster page loading',
          text: `Spearheaded performance tuning for ${cleaned}, resulting in a 40% reduction in CPU overhead and faster page loading.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Spearheaded performance tuning for</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">resulting in a 40% reduction in CPU overhead and faster page loading</span>.`
        },
        {
          title: '⚡ Speed & User Retention Focus',
          verb: 'Refactored core algorithms of',
          metric: 'enhancing user responsiveness by 300ms for over 50,000 active visitors',
          text: `Refactored core algorithms of ${cleaned}, enhancing user responsiveness by 300ms for over 50,000 active visitors.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Refactored core algorithms of</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">enhancing user responsiveness by 300ms for over 50,000 active visitors</span>.`
        }
      ];
    } else if (focusVal === 'scale') {
      variants = [
        {
          title: '🌐 High Concurrent Traffic Focus',
          verb: 'Architected and scaled',
          metric: 'supporting a 150% surge in peak concurrent user transactions without downtime',
          text: `Architected and scaled ${cleaned}, supporting a 150% surge in peak concurrent user transactions without downtime.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Architected and scaled</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">supporting a 150% surge in peak concurrent user transactions without downtime</span>.`
        },
        {
          title: '🌐 Database Query Throughput Focus',
          verb: 'Designed and deployed a highly-available framework for',
          metric: 'successfully accommodating 10M+ daily database queries and operations',
          text: `Designed and deployed a highly-available framework for ${cleaned}, successfully accommodating 10M+ daily database queries and operations.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Designed and deployed a highly-available framework for</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">successfully accommodating 10M+ daily database queries and operations</span>.`
        },
        {
          title: '🌐 Distributed Cloud Focus',
          verb: 'Re-engineered the underlying architecture of',
          metric: 'paving the way for seamless multi-region cluster replication and auto-scaling',
          text: `Re-engineered the underlying architecture of ${cleaned}, paving the way for seamless multi-region cluster replication and auto-scaling.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Re-engineered the underlying architecture of</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">paving the way for seamless multi-region cluster replication and auto-scaling</span>.`
        }
      ];
    } else if (focusVal === 'revenue') {
      variants = [
        {
          title: '📈 Direct Financial Value Focus',
          verb: 'Spearheaded the development of',
          metric: 'generating $85,000 in direct incremental revenue within 6 months of rollout',
          text: `Spearheaded the development of ${cleaned}, generating $85,000 in direct incremental revenue within 6 months of rollout.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Spearheaded the development of</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">generating $85,000 in direct incremental revenue within 6 months of rollout</span>.`
        },
        {
          title: '📈 Customer Acquisition & Growth Focus',
          verb: 'Launched and optimized interactive features for',
          metric: 'raising onboarding customer sign-up rates by 22%',
          text: `Launched and optimized interactive features for ${cleaned}, raising onboarding customer sign-up rates by 22%.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Launched and optimized interactive features for</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">raising onboarding customer sign-up rates by 22%</span>.`
        },
        {
          title: '📈 User Retention Value Focus',
          verb: 'Monetized and modernized',
          metric: 'securing a 15% increase in customer lifetime value (LTV) and platform engagement',
          text: `Monetized and modernized ${cleaned}, securing a 15% increase in customer lifetime value (LTV) and platform engagement.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Monetized and modernized</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">securing a 15% increase in customer lifetime value (LTV) and platform engagement</span>.`
        }
      ];
    } else if (focusVal === 'efficiency') {
      variants = [
        {
          title: '💰 Infrastructure Cost Optimization Focus',
          verb: 'Streamlined and automated',
          metric: 'slashing cloud infrastructure overhead costs by 28% through schedule policies',
          text: `Streamlined and automated ${cleaned}, slashing cloud infrastructure overhead costs by 28% through schedule policies.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Streamlined and automated</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">slashing cloud infrastructure overhead costs by 28% through schedule policies</span>.`
        },
        {
          title: '💰 Development Velocity Focus',
          verb: 'Eliminated development bottlenecks in',
          metric: 'saving 8+ engineering hours per week for a 12-person engineering team',
          text: `Eliminated development bottlenecks in ${cleaned}, saving 8+ engineering hours per week for a 12-person engineering team.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Eliminated development bottlenecks in</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">saving 8+ engineering hours per week for a 12-person engineering team</span>.`
        },
        {
          title: '💰 Resource Optimization Focus',
          verb: 'Optimized resource allocation for',
          metric: 'reclaiming 30% of previously wasted system capacities',
          text: `Optimized resource allocation for ${cleaned}, reclaiming 30% of previously wasted system capacities.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Optimized resource allocation for</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">reclaiming 30% of previously wasted system capacities</span>.`
        }
      ];
    } else if (focusVal === 'leadership') {
      variants = [
        {
          title: '👑 Squad Lead & Delivery Focus',
          verb: 'Orchestrated and led the cross-functional squad managing',
          metric: 'delivering critical features 2 weeks ahead of original schedule targets',
          text: `Orchestrated and led the cross-functional squad managing ${cleaned}, delivering critical features 2 weeks ahead of original schedule targets.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Orchestrated and led the cross-functional squad managing</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">delivering critical features 2 weeks ahead of original schedule targets</span>.`
        },
        {
          title: '👑 Mentorship & Code Standards Focus',
          verb: 'Mentored 4 developers while leading technical execution of',
          metric: 'improving test coverage standards by 15% across repositories',
          text: `Mentored 4 developers while leading technical execution of ${cleaned}, improving test coverage standards by 15% across repositories.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Mentored 4 developers while leading technical execution of</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">improving test coverage standards by 15% across repositories</span>.`
        },
        {
          title: '👑 Roadmap Strategy Focus',
          verb: 'Spearheaded roadmap alignment and delivery for',
          metric: 'coordinating across 3 teams to ensure zero-defect product launches',
          text: `Spearheaded roadmap alignment and delivery for ${cleaned}, coordinating across 3 teams to ensure zero-defect product launches.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Spearheaded roadmap alignment and delivery for</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">coordinating across 3 teams to ensure zero-defect product launches</span>.`
        }
      ];
    } else {
      variants = [
        {
          title: '✨ Results-Driven Execution Focus',
          verb: 'Spearheaded and delivered',
          metric: 'boosting operational throughput by 20% while simplifying maintenance',
          text: `Spearheaded and delivered ${cleaned}, boosting operational throughput by 20% while simplifying maintenance.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Spearheaded and delivered</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">boosting operational throughput by 20% while simplifying maintenance</span>.`
        },
        {
          title: '✨ Code Quality Modernization Focus',
          verb: 'Modernized the codebases governing',
          metric: 'reducing incoming customer bug tickets by 15%',
          text: `Modernized the codebases governing ${cleaned}, reducing incoming customer bug tickets by 15%.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Modernized the codebases governing</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">reducing incoming customer bug tickets by 15%</span>.`
        },
        {
          title: '✨ End-User Value Focus',
          verb: 'Implemented and successfully shipped',
          metric: 'elevating user satisfaction CSAT index by 12 points',
          text: `Implemented and successfully shipped ${cleaned}, elevating user satisfaction CSAT index by 12 points.`,
          html: `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Implemented and successfully shipped</span> ${cleaned}, <span class="text-emerald-600 dark:text-emerald-400 font-semibold">elevating user satisfaction CSAT index by 12 points</span>.`
        }
      ];
    }

    const itemsHtml = variants.map((v, idx) => `
      <div class="p-3 rounded-xl border border-[var(--rc-border)] bg-[var(--rc-card-bg)] space-y-2 relative group transition-all hover:border-[var(--rc-primary)]/40">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold text-[var(--rc-text-primary)]">${v.title}</span>
          <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" class="copy-variation-btn text-[9px] font-bold px-2 py-1 rounded bg-[var(--rc-primary)]/10 text-[var(--rc-primary)] hover:bg-[var(--rc-primary)]/20 transition-colors cursor-pointer" data-idx="${idx}">
              Copy
            </button>
            <button type="button" class="test-variation-btn text-[9px] font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors cursor-pointer" data-idx="${idx}">
              Test in Sandbox
            </button>
            <button type="button" class="insert-variation-btn text-[9px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors cursor-pointer" data-idx="${idx}">
              Insert
            </button>
          </div>
        </div>
        
        <p class="text-[11px] text-[var(--rc-text-primary)] font-medium leading-relaxed pl-2 border-l border-[var(--rc-border)]">
          ${v.html}
        </p>
      </div>
    `).join('');

    resultEl.innerHTML = `
      <div class="space-y-3 animate-fade-in text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-[var(--rc-text-primary)]">ATS Optimization Results</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            📈 +25% Score Impact
          </span>
        </div>

        <div class="space-y-2">
          ${itemsHtml}
        </div>
        
        <div class="p-2.5 rounded-lg border border-[var(--rc-border)]/50 bg-[var(--rc-card-bg)] text-[10px] text-[var(--rc-text-muted)] leading-relaxed">
          <span class="font-bold text-[var(--rc-text-primary)] block mb-1">Color Legend & Rules:</span>
          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Action Verb</span>
            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Quantified Metric</span>
            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[var(--rc-text-primary)]"></span> Specific Context</span>
          </div>
        </div>
      </div>
    `;
    resultEl.classList.remove('hidden');

    // Attach copy, test, and insert listeners to variations
    variants.forEach((v, idx) => {
      const card = resultEl.querySelectorAll('.group')[idx];
      const copyBtn = card?.querySelector('.copy-variation-btn');
      const testBtn = card?.querySelector('.test-variation-btn');
      const insertBtn = card?.querySelector('.insert-variation-btn');

      copyBtn?.addEventListener('click', () => {
        navigator.clipboard.writeText(v.text).then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        });
      });

      testBtn?.addEventListener('click', () => {
        const sandboxInput = document.getElementById('sandbox-input') as HTMLInputElement;
        if (sandboxInput) {
          sandboxInput.value = v.text;
          const originalText = testBtn.textContent;
          testBtn.textContent = 'Added!';
          // Trigger sandbox test
          const sandboxTestBtn = document.getElementById('sandbox-test-btn');
          if (sandboxTestBtn) {
            (sandboxTestBtn as HTMLElement).click();
          }
          setTimeout(() => { testBtn.textContent = originalText; }, 2000);
        }
      });

      insertBtn?.addEventListener('click', () => {
        replaceBulletInResume(rawBullet, v.text);
        const originalText = insertBtn.textContent;
        insertBtn.textContent = 'Inserted!';
        setTimeout(() => { insertBtn.textContent = originalText; }, 2000);
      });
    });
  }

  function replaceBulletInResume(oldBullet: string, newBullet: string) {
    const text = resumeInput.value;
    if (!oldBullet || !newBullet) return;
    
    // Clean leading dashes, bullets, and spaces for matching
    const cleanOld = oldBullet.replace(/^[\s\-\*•\d\.]+/g, '').trim();
    
    // Try to find cleanOld in the resume text
    const lines = text.split('\n');
    let replaced = false;
    for (let i = 0; i < lines.length; i++) {
      const cleanLine = lines[i].replace(/^[\s\-\*•\d\.]+/g, '').trim();
      if (cleanLine === cleanOld && cleanLine.length > 5) {
        // Keep the original line's prefix bullet symbol if any
        const prefix = lines[i].match(/^[\s\-\*•\d\.]+/)?.[0] || '• ';
        lines[i] = prefix + newBullet;
        replaced = true;
        break;
      }
    }
    
    if (replaced) {
      resumeInput.value = lines.join('\n');
    } else {
      // Fallback: append at the bottom under experience
      resumeInput.value = text.trim() + `\n\n• ${newBullet}`;
    }
    updateCounts();
    scheduleAnalysis(true);
  }

  function appendSkillToResume(skill: string) {
    const text = resumeInput.value;
    if (!skill) return;

    // Check if a Skills/Technologies section exists in resume text (case-insensitive)
    const skillsRegex = /(?:skills|technologies|tools|competencies)(?:\s*[:\-\n])+/i;
    const match = text.match(skillsRegex);
    if (match && match.index !== undefined) {
      // Find the end of that match line
      const insertIdx = match.index + match[0].length;
      resumeInput.value = text.slice(0, insertIdx) + ` ${skill},` + text.slice(insertIdx);
    } else {
      resumeInput.value = text.trim() + `\n\nSkills: ${skill}`;
    }
    updateCounts();
    scheduleAnalysis(true);
  }

  // --- Split Screen Workspace Logic ---
  const layoutToggleBtn = document.getElementById('layout-toggle-btn');
  const splitEditorTabs = document.getElementById('split-editor-tabs');
  const tabEditResume = document.getElementById('tab-edit-resume');
  const tabEditJd = document.getElementById('tab-edit-jd');
  const resumeCard = document.getElementById('resume-card');
  const jdCard = document.getElementById('jd-card');
  const rcDashboardRoot = document.querySelector('.rc-dashboard');

  let isSplitActive = localStorage.getItem('rc-split-layout') === 'true';

  function applySplitState() {
    if (isSplitActive) {
      rcDashboardRoot?.classList.add('rc-split-active');
      layoutToggleBtn?.classList.add('border-indigo-500', 'text-indigo-600');
      // Set default tab: resume active
      switchSplitTab('resume');
    } else {
      rcDashboardRoot?.classList.remove('rc-split-active');
      layoutToggleBtn?.classList.remove('border-indigo-500', 'text-indigo-600');
      // Restore standard layout: both cards visible
      resumeCard?.classList.remove('hidden');
      jdCard?.classList.remove('hidden');
    }
  }

  function switchSplitTab(tab: 'resume' | 'jd') {
    if (tab === 'resume') {
      tabEditResume?.classList.add('border-indigo-600', 'text-indigo-600');
      tabEditResume?.classList.remove('border-transparent', 'text-[var(--rc-text-secondary)]');
      tabEditJd?.classList.remove('border-indigo-600', 'text-indigo-600');
      tabEditJd?.classList.add('border-transparent', 'text-[var(--rc-text-secondary)]');
      
      resumeCard?.classList.remove('hidden');
      jdCard?.classList.add('hidden');
    } else {
      tabEditJd?.classList.add('border-indigo-600', 'text-indigo-600');
      tabEditJd?.classList.remove('border-transparent', 'text-[var(--rc-text-secondary)]');
      tabEditResume?.classList.remove('border-indigo-600', 'text-indigo-600');
      tabEditResume?.classList.add('border-transparent', 'text-[var(--rc-text-secondary)]');
      
      jdCard?.classList.remove('hidden');
      resumeCard?.classList.add('hidden');
    }
  }

  layoutToggleBtn?.addEventListener('click', () => {
    isSplitActive = !isSplitActive;
    localStorage.setItem('rc-split-layout', String(isSplitActive));
    applySplitState();
  });

  tabEditResume?.addEventListener('click', () => switchSplitTab('resume'));
  tabEditJd?.addEventListener('click', () => switchSplitTab('jd'));

  // Save/Download resume button logic
  const downloadResumeBtn = document.getElementById('download-resume-btn');
  const resumePrintContainer = document.getElementById('resume-print-container');
  downloadResumeBtn?.addEventListener('click', () => {
    const text = resumeInput.value.trim();
    if (!text || !resumePrintContainer) return;
    
    resumePrintContainer.textContent = text;
    document.body.classList.add('printing-resume');
    
    // Trigger native browser printing flow
    window.print();
    
    // Clean up layout after printing dialog opens/closes
    window.addEventListener('afterprint', () => {
      document.body.classList.remove('printing-resume');
      resumePrintContainer.textContent = '';
    }, { once: true });
  });

  // Initialize Split State
  applySplitState();

  // Mouse tracking aura effect for premium cards
  document.querySelectorAll('.rc-card-aura').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      const x = (e as MouseEvent).clientX - rect.left;
      const y = (e as MouseEvent).clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    });
  });

  updateCounts();
  updateInputOverlays();

  // Restore session
  const saved = loadSession();
  if (saved?.resume && saved?.jd) {
    resumeInput.value = saved.resume;
    jdInput.value = saved.jd;
    updateCounts();
    updateInputOverlays();
    if (emptyState) emptyState.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    scheduleAnalysis(true);
  }
})();
