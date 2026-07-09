(() => {
  const state = {
    exams: [],
    subjects: [],
    schedule: [],
    allTopics: [],
    daysOff: new Set(),
    completedTopics: new Set(JSON.parse(localStorage.getItem('ss_completed_topics') || '[]')),
    streakData: JSON.parse(localStorage.getItem('ss_streak') || '{"count":0,"dates":[],"lastDate":""}'),
    missedDays: 0,
    logHistory: JSON.parse(localStorage.getItem('ss_logs') || '[]')
  };
  window.state = state;

  function formatDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function friendlyDate(d) {
    return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  }
  function shortDate(d) {
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
  }
  function daysBetween(a, b) {
    if (!a || !b) return 0;
    const ad = parseAsDate(a);
    const bd = parseAsDate(b);
    if (!ad || !bd) return 0;
    return Math.ceil((bd.getTime() - ad.getTime()) / 86400000);
  }
  function addDays(date, n) {
    const r = new Date(date); r.setDate(r.getDate() + n); return r;
  }
  function parseAsDate(val) {
    if (val instanceof Date) return val;
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  }

  function initDefaults() {
    const today = new Date(); today.setHours(0,0,0,0);
    const examDate = addDays(today, 30);
    state.exams = [{ id: 'e1', name: 'Physics', date: examDate }];
    state.subjects = [{ id: 's1', name: 'Physics', topics: 'Quantum Mechanics\nThermodynamics\nElectromagnetism\nOptics & Waves', difficulty: 3, confidence: 3, examId: 'e1' }];
    state.daysOff = new Set([0]); // Sunday is off by default
    renderSetupExams();
    renderExamsPanel();
    renderSubjectsPanel();
    updateTTG();
    updateSetupProgress(); updateGenerateStatus();
  }

  function renderSetupExams() {
    const el = document.getElementById('exam-cards');
    el.innerHTML = state.exams.map((e, idx) => {
      const name = e.name || 'Untitled';
      const showClose = state.exams.length > 1;
      return `<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f6fa] border border-slate-100 text-slate-700 text-[11px] font-bold">
        <span>${name}</span>
        <span class="text-slate-400 font-normal">${e.date ? shortDate(e.date) : 'Pick date'}</span>
        ${showClose ? `
        <button type="button" class="setup-remove-exam-chip hover:text-red-500 text-slate-400 transition-colors cursor-pointer ml-0.5" data-idx="${idx}" aria-label="Remove exam">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>` : ''}
      </span>`;
    }).join('');
    
    el.querySelectorAll('.setup-remove-exam-chip').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        removeExam(parseInt(this.dataset.idx));
      });
    });
    updateSetupProgress(); updateGenerateStatus();
  }

  function renderExamsPanel() {
    const el = document.getElementById('exams-container');
    el.innerHTML = state.exams.map((e, i) => {
      const daysLeft = e.date ? Math.ceil((e.date.getTime() - Date.now()) / 86400000) : null;
      return `<div class="exam-card flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-violet-50/50 to-white border border-violet-100/60 shadow-sm transition-all">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-200/40 flex items-center justify-center text-violet-600 shrink-0 shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <input type="text" value="${e.name}" placeholder="Enter exam name" aria-label="Exam name" autocomplete="off" data-idx="${i}" class="exam-name-input w-full h-8 px-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-500/20 transition-all" />
          <div class="flex items-center gap-2 mt-1.5">
            <input type="date" value="${e.date ? formatDate(e.date) : ''}" aria-label="Exam date" autocomplete="off" data-idx="${i}" class="exam-date-input h-7 px-2 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-violet-400 transition-all" />
            ${daysLeft !== null ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${daysLeft <= 7 ? 'bg-red-50 text-red-700 border border-red-200/60' : daysLeft <= 30 ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'}">${daysLeft > 0 ? daysLeft + ' days left' : 'Today!'}</span>` : '<span class="text-[10px] text-slate-400 font-medium">Pick a date</span>'}
          </div>
        </div>
        <button class="remove-exam-btn w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer ${state.exams.length <= 1 ? 'opacity-20 pointer-events-none' : ''}" data-idx="${i}" style="touch-action: manipulation" aria-label="Remove exam">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
    }).join('');
    el.querySelectorAll('.exam-name-input').forEach(inp => {
      inp.addEventListener('input', function() { state.exams[parseInt(this.dataset.idx)].name = this.value; renderSetupExams(); syncSubjectExamDropdowns(); updateTTG(); });
    });
    el.querySelectorAll('.exam-date-input').forEach(inp => {
      inp.addEventListener('change', function() { state.exams[parseInt(this.dataset.idx)].date = new Date(this.value + 'T23:59:59'); renderSetupExams(); updateTTG(); });
    });
    el.querySelectorAll('.remove-exam-btn').forEach(btn => {
      btn.addEventListener('click', function() { removeExam(parseInt(this.dataset.idx)); });
    });
    toggleEmptyStateCards();
    updateSetupProgress(); updateGenerateStatus();
    renderPlannerPreview();
    updateReadinessSidebar();
  }

  function removeExam(idx) {
    if (state.exams.length <= 1) return;
    const removedId = state.exams[idx].id;
    state.exams.splice(idx, 1);
    state.subjects = state.subjects.map(s => s.examId === removedId ? { ...s, examId: state.exams[0].id } : s);
    renderSetupExams(); renderExamsPanel(); renderSubjectsPanel(); syncSubjectExamDropdowns(); updateTTG(); updateSetupProgress(); updateGenerateStatus();
  }

  function renderSubjectsPanel() {
    const el = document.getElementById('subject-cards');
    el.innerHTML = state.subjects.map((s, i) => {
      const diffOpts = [1,2,3,4,5].map(d => `<option value="${d}"${d===s.difficulty?' selected':''}>${['','Very Easy','Easy','Medium','Hard','Very Hard'][d]}</option>`).join('');
      const confOpts = [1,2,3,4,5].map(c => `<option value="${c}"${c===s.confidence?' selected':''}>${['','Very Low','Low','Medium','High','Very High'][c]}</option>`).join('');
      const examOpts = state.exams.map(e => `<option value="${e.id}"${e.id===s.examId?' selected':''}>${e.name||'Untitled'}</option>`).join('');
      const topics = s.topics.split('\n').map(t => t.trim()).filter(t => t.length > 0);
      const diffLabels = ['','Very Easy','Easy','Medium','Hard','Very Hard'];
      const confLabels = ['','Very Low','Low','Medium','High','Very High'];
      const diffColors = ['','bg-emerald-100 text-emerald-700','bg-green-100 text-green-700','bg-amber-100 text-amber-700','bg-orange-100 text-orange-700','bg-red-100 text-red-700'];
      const confColors = ['','bg-red-100 text-red-700','bg-orange-100 text-orange-700','bg-amber-100 text-amber-700','bg-green-100 text-green-700','bg-emerald-100 text-emerald-700'];
      return `<div class="subject-card rounded-xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-200/40 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <input type="text" value="${s.name}" placeholder="Subject name" aria-label="Subject name" autocomplete="off" data-idx="${i}" class="subject-name-input flex-1 h-8 px-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
          <select data-idx="${i}" class="subject-exam-select h-7 px-2 text-[10px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none focus:border-indigo-400 transition-all cursor-pointer" aria-label="Subject exam" autocomplete="off">${examOpts}</select>
          <button class="remove-subject-btn w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer ${state.subjects.length<=1?'opacity-20 pointer-events-none':''}" data-idx="${i}" style="touch-action: manipulation" aria-label="Remove subject">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="mb-3">
          <textarea rows="2" placeholder="Topics (one per line)" aria-label="Subject topics" autocomplete="off" data-idx="${i}" class="subject-topics-input w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none">${s.topics}</textarea>
          ${topics.length > 0 ? '<div class="flex flex-wrap gap-1 mt-1.5">' + topics.map(t => '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100/60">' + t + '</span>').join('') + '</div>' : '<p class="text-[10px] text-slate-400 mt-1">Enter topics above — one per line</p>'}
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-semibold text-slate-500">Difficulty</span>
            <select data-idx="${i}" class="subject-difficulty-select h-7 px-2 text-[10px] font-medium ${diffColors[s.difficulty]} border border-slate-200 rounded-lg outline-none focus:border-indigo-400 transition-all cursor-pointer bg-white" aria-label="Subject difficulty" autocomplete="off">${diffOpts}</select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-semibold text-slate-500">Confidence</span>
            <select data-idx="${i}" class="subject-confidence-select h-7 px-2 text-[10px] font-medium ${confColors[s.confidence]} border border-slate-200 rounded-lg outline-none focus:border-indigo-400 transition-all cursor-pointer bg-white" aria-label="Subject confidence" autocomplete="off">${confOpts}</select>
          </div>
          <div class="flex-1 flex items-center gap-2">
            <span class="text-[10px] font-semibold text-slate-500 shrink-0">Priority</span>
            <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div class="priority-bar h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" style="width:${Math.min(100, (s.difficulty*2+(6-s.confidence)*1.5)/14*100)}%"></div></div>
          </div>
        </div>
      </div>`;
    }).join('');
    el.querySelectorAll('.subject-name-input').forEach(inp => { inp.addEventListener('input', function() { state.subjects[parseInt(this.dataset.idx)].name = this.value; updateTTG(); updateSetupProgress(); updateGenerateStatus(); }); });
    el.querySelectorAll('.subject-topics-input').forEach(inp => { inp.addEventListener('input', function() { state.subjects[parseInt(this.dataset.idx)].topics = this.value; updateTTG(); updateSetupProgress(); updateGenerateStatus(); }); });
    el.querySelectorAll('.subject-difficulty-select').forEach(sel => { sel.addEventListener('change', function() { state.subjects[parseInt(this.dataset.idx)].difficulty = parseInt(this.value); updatePBar(this); updateTTG(); }); });
    el.querySelectorAll('.subject-confidence-select').forEach(sel => { sel.addEventListener('change', function() { state.subjects[parseInt(this.dataset.idx)].confidence = parseInt(this.value); updatePBar(this); updateTTG(); }); });
    el.querySelectorAll('.subject-exam-select').forEach(sel => { sel.addEventListener('change', function() { state.subjects[parseInt(this.dataset.idx)].examId = this.value; }); });
    el.querySelectorAll('.remove-subject-btn').forEach(btn => { btn.addEventListener('click', function() { if (state.subjects.length<=1) return; state.subjects.splice(parseInt(this.dataset.idx),1); renderSubjectsPanel(); updateTTG();     }); });
    toggleEmptyStateCards();
    updateSetupProgress(); updateGenerateStatus();
    renderPlannerPreview();
    updateReadinessSidebar();
  }

  function updatePBar(el) {
    const card = el.closest('.subject-card');
    const idx = parseInt(card.querySelector('[data-idx]')?.dataset.idx);
    if (idx===undefined) return;
    const s = state.subjects[idx]; if (!s) return;
    card.querySelector('.priority-bar').style.width = Math.min(100, (s.difficulty*2+(6-s.confidence)*1.5)/14*100)+'%';
  }

  function syncSubjectExamDropdowns() {
    document.querySelectorAll('.subject-exam-select').forEach(sel => {
      const idx = parseInt(sel.dataset.idx);
      const current = sel.value;
      sel.innerHTML = state.exams.map(e => `<option value="${e.id}"${e.id===current?' selected':''}>${e.name||'Untitled'}</option>`).join('');
      state.subjects[idx].examId = sel.value;
    });
  }

  function updateSetupProgress() {
    const s1 = document.getElementById('setup-step-1');
    const s2 = document.getElementById('setup-step-2');
    const s3 = document.getElementById('setup-step-3');
    if (!s1) return;
    const hasExam = state.exams.some(e => e.name.trim() && e.date);
    const hasSubject = state.subjects.some(s => s.name.trim() && s.topics.trim());
    const completed = [hasExam, hasSubject, hasExam && hasSubject];
    const active = [true, hasExam, hasExam && hasSubject];
    const steps = [s1, s2, s3];
    const labels = [1,2,3].map(i => document.getElementById('setup-label-' + i));
    const descs = [1,2,3].map(i => document.getElementById('setup-desc-' + i));
    const lines = [1,2].map(i => document.getElementById('setup-line-' + i));

    steps.forEach((el, i) => {
      const isCompleted = completed[i];
      const isActive = active[i];
      if (isCompleted) {
        el.className = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 shadow-sm shadow-emerald-500/20 bg-emerald-500 text-white ring-2 ring-emerald-500/20';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        if (labels[i]) { labels[i].className = 'text-[10px] font-bold text-emerald-600 leading-tight'; }
        if (descs[i]) { descs[i].className = 'text-[8px] text-emerald-400 leading-tight'; }
      } else if (isActive) {
        el.className = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 shadow-md shadow-violet-600/30 bg-violet-600 text-white ring-2 ring-violet-500/30 scale-110';
        el.textContent = String(i + 1);
        if (labels[i]) { labels[i].className = 'text-[10px] font-bold text-violet-700 leading-tight'; }
        if (descs[i]) { descs[i].className = 'text-[8px] text-violet-500 leading-tight'; }
      } else {
        el.className = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 bg-slate-200 text-slate-400';
        el.textContent = String(i + 1);
        if (labels[i]) { labels[i].className = 'text-[10px] font-bold text-slate-400 leading-tight'; }
        if (descs[i]) { descs[i].className = 'text-[8px] text-slate-300 leading-tight'; }
      }
    });

    // Connecting lines
    if (lines[0]) {
      lines[0].className = 'flex-1 h-0.5 rounded-full transition-all duration-300 max-w-[40px] ' + (hasExam ? 'bg-emerald-400' : 'bg-slate-200');
    }
    if (lines[1]) {
      lines[1].className = 'flex-1 h-0.5 rounded-full transition-all duration-300 max-w-[40px] ' + (hasSubject ? 'bg-emerald-400' : 'bg-slate-200');
    }

    // Progress percentage
    const total = 3;
    const done = (hasExam ? 1 : 0) + (hasSubject ? 1 : 0) + (hasExam && hasSubject ? 1 : 0);
    const pct = Math.round((done / total) * 100);
    const pctFill = document.getElementById('setup-pct-fill');
    const pctText = document.getElementById('setup-pct-text');
    if (pctFill) pctFill.style.width = pct + '%';
    if (pctText) pctText.textContent = pct + '%';
  }

  function updateGenerateStatus() {
    const msg = document.getElementById('generate-status-msg');
    const btn = document.getElementById('generate-step-btn');
    const summary = document.getElementById('pre-summary');
    if (!msg || !btn) return;

    const hasExam = state.exams.some(e => e.name.trim() && e.date);
    const hasSubject = state.subjects.some(s => s.name.trim() && s.topics.trim());
    const hoursInput = document.getElementById('hours-per-day');
    const hoursVal = hoursInput ? parseInt(hoursInput.value) : 0;
    const hasHours = !isNaN(hoursVal) && hoursVal > 0;
    const allMet = hasExam && hasSubject && hasHours;

    // Requirements checklist
    const reqs = [
      { id: 'req-exam', met: hasExam },
      { id: 'req-subject', met: hasSubject },
      { id: 'req-hours', met: hasHours },
    ];
    reqs.forEach(r => {
      const el = document.getElementById(r.id);
      if (!el) return;
      const dot = el.querySelector('span:first-child');
      const label = el.querySelector('span:last-child');
      if (r.met) {
        el.className = 'flex items-center gap-1 text-[10px] font-medium text-emerald-600';
        dot.className = 'w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center shrink-0';
        dot.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      } else {
        el.className = 'flex items-center gap-1 text-[10px] font-medium text-red-500';
        dot.className = 'w-3.5 h-3.5 rounded-full border-2 border-red-300 flex items-center justify-center shrink-0';
        dot.innerHTML = '';
      }
    });

    // Summary card
    if (summary) {
      if (hasExam || hasSubject) {
        summary.classList.remove('hidden');
        const totalTopics = state.subjects.reduce((acc, s) => acc + s.topics.split('\n').filter(t => t.trim()).length, 0);
        document.getElementById('pre-summary-exams').textContent = state.exams.filter(e => e.name.trim()).length;
        document.getElementById('pre-summary-subjects').textContent = state.subjects.length;
        document.getElementById('pre-summary-topics').textContent = totalTopics;
        document.getElementById('pre-summary-hours').textContent = hasHours ? hoursVal : '\u2014';
      } else {
        summary.classList.add('hidden');
      }
    }

    // Button state
    if (allMet) {
      btn.disabled = false;
      btn.className = 'h-10 px-5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all duration-300 cursor-pointer bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-md shadow-violet-600/15 hover:from-violet-700 hover:to-violet-800 hover:shadow-lg hover:shadow-violet-600/25 active:scale-[0.97]';
      msg.textContent = 'All set \u2014 ready to generate!';
      msg.className = 'text-[10px] font-semibold text-emerald-600 leading-tight';
      msg.classList.remove('hidden');
    } else {
      btn.disabled = true;
      btn.className = 'h-10 px-5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all duration-300 cursor-not-allowed bg-slate-200 text-slate-400 shadow-none';
      const missing = [];
      if (!hasExam) missing.push('exam');
      if (!hasSubject) missing.push('subjects');
      if (!hasHours) missing.push('study hours');
      msg.className = 'text-[10px] text-slate-400 font-medium leading-tight hidden';
    }
  }

  function toggleEmptyStateCards() {
    const examEmpty = document.getElementById('exam-empty-state');
    const examCompact = document.getElementById('add-exam-compact-btn');
    const hasExams = state.exams.length > 0;
    if (examEmpty) examEmpty.classList.toggle('hidden', hasExams);
    if (examCompact) examCompact.classList.toggle('hidden', !hasExams);

    const subjEmpty = document.getElementById('subject-empty-state');
    const subjCompact = document.getElementById('add-subject-compact-btn');
    const hasSubj = state.subjects.length > 0;
    if (subjEmpty) subjEmpty.classList.toggle('hidden', hasSubj);
    if (subjCompact) subjCompact.classList.toggle('hidden', !hasSubj);
  }
  window.toggleEmptyStateCards = toggleEmptyStateCards;

  // TTG
  function updateTTG() {
    const valid = state.subjects.filter(s => s.name.trim() && s.topics.trim());
    const topics = [];
    for (const s of valid) {
      const ts = s.topics.split('\n').map(t => t.trim()).filter(t => t.length > 0);
      for (const t of ts) topics.push(t);
    }
    const hpDay = parseFloat(document.getElementById('hours-per-day').value) || 4;
    const hpt = Math.max(0.5, Math.min(1.5, 1));
    const daysNeeded = Math.ceil(topics.length / Math.floor(hpDay / hpt));
    const totalHours = Math.ceil(topics.length * hpt);

    const el = document.getElementById('time-to-goal');
    if (topics.length === 0) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    document.getElementById('ttg-hours').textContent = totalHours;
    document.getElementById('ttg-days').textContent = daysNeeded;

    const earliest = state.exams
      .filter(e => e.name.trim() && e.date && !isNaN(parseAsDate(e.date)?.getTime()))
      .sort((a,b) => parseAsDate(a.date).getTime() - parseAsDate(b.date).getTime())[0];
    const verdictEl = document.getElementById('ttg-verdict');
    if (!earliest) { verdictEl.textContent = ''; return; }
    const today = new Date(); today.setHours(0,0,0,0);
    const avail = daysBetween(today, earliest.date);
    const offCount = state.daysOff.size;
    const actualAvail = Math.round(avail * (7 - offCount) / 7);
    if (daysNeeded <= actualAvail) {
      verdictEl.textContent = `${actualAvail - daysNeeded} buffer day${actualAvail-daysNeeded!==1?'s':''} remaining`;
      verdictEl.className = 'font-bold text-emerald-600';
    } else {
      verdictEl.textContent = `${daysNeeded - actualAvail} more day${daysNeeded-actualAvail!==1?'s':''} needed — adjust hours or days off`;
      verdictEl.className = 'font-bold text-rose-600';
    }
  }

  document.getElementById('hours-per-day')?.addEventListener('input', function() { updateTTG(); updateReadinessSidebar(); updateGenerateStatus(); });

  function setupDaysOff() {
    document.querySelectorAll('.day-off-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const day = parseInt(this.dataset.day);
        if (state.daysOff.has(day)) state.daysOff.delete(day); else state.daysOff.add(day);
        this.classList.toggle('active');
        updateTTG();
      });
    });
  }

  document.getElementById('add-exam-btn')?.addEventListener('click', function() {
    const today = new Date(); today.setHours(0,0,0,0);
    state.exams.push({ id: 'e'+Date.now(), name: '', date: null });
    renderSetupExams(); renderExamsPanel(); syncSubjectExamDropdowns(); updateTTG();
  });

  document.getElementById('add-subject-btn')?.addEventListener('click', function() {
    state.subjects.push({ id: 's'+Date.now(), name: '', topics: '', difficulty: 3, confidence: 3, examId: state.exams[0].id });
    renderSubjectsPanel(); updateTTG();
  });

  document.getElementById('add-exam-compact-btn')?.addEventListener('click', function() {
    const today = new Date(); today.setHours(0,0,0,0);
    state.exams.push({ id: 'e'+Date.now(), name: '', date: null });
    renderSetupExams(); renderExamsPanel(); syncSubjectExamDropdowns(); updateTTG();
  });

  document.getElementById('add-subject-compact-btn')?.addEventListener('click', function() {
    state.subjects.push({ id: 's'+Date.now(), name: '', topics: '', difficulty: 3, confidence: 3, examId: state.exams[0].id });
    renderSubjectsPanel(); updateTTG();
  });

  // ===== GENERATE =====
  let _generating = false;
  function generate() {
    if (_generating) return;
    const today = new Date(); today.setHours(0,0,0,0);
    const validExams = state.exams.filter(e => e.name.trim());
    if (validExams.length === 0) { alert('Please name at least one exam.'); return; }
    for (const e of validExams) { if (!e.date) { alert(`Please set a date for "${e.name}".`); return; } if (e.date <= today) { alert(`"${e.name}" date must be in the future.`); return; } }
    validExams.sort((a,b) => a.date - b.date);
    const validSubjects = state.subjects.filter(s => s.name.trim() && s.topics.trim());
    if (validSubjects.length === 0) { alert('Please add at least one subject with topics.'); return; }
    const hoursPerDayCheck = parseFloat(document.getElementById('hours-per-day')?.value || '0');
    if (!hoursPerDayCheck || hoursPerDayCheck <= 0) { alert('Please set your daily study hours above.'); return; }

    // Loading state
    _generating = true;
    const btn = document.getElementById('generate-step-btn');
    const btnText = document.getElementById('gen-btn-text');
    const btnIcon = document.getElementById('gen-btn-icon');
    const progressEl = document.getElementById('generate-progress');
    if (btn) { btn.disabled = true; btn.className = 'h-10 px-5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all duration-300 cursor-not-allowed bg-violet-500/20 text-violet-600 shadow-none'; }
    if (btnText) btnText.textContent = 'Generating\u2026';
    if (btnIcon) btnIcon.innerHTML = '<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke-dasharray="40" stroke-dashoffset="10"/></svg>';

    // Show progress feedback after 1s
    let progressTimer = setTimeout(() => {
      const p = document.getElementById('generate-progress');
      if (p) { p.classList.remove('hidden'); p.textContent = 'Building your plan\u2026'; }
    }, 1000);

    const hoursPerDay = parseFloat(document.getElementById('hours-per-day').value) || 4;
    const allTopics = [];

    for (const subj of validSubjects) {
      const targetExam = validExams.find(e => e.id === subj.examId) || validExams[0];
      const daysUntil = daysBetween(today, targetExam.date);
      const score = subj.difficulty * 2 + (6 - subj.confidence) * 1.5 + (1 / Math.max(1, daysUntil)) * 15;
      const topics = subj.topics.split('\n').map(t => t.trim()).filter(t => t.length > 0);
      for (const topic of topics) {
        allTopics.push({ subject: subj.name, topic, difficulty: subj.difficulty, confidence: subj.confidence, priorityScore: score, targetExam, studied: false, studyDay: null, revisionDays: [] });
      }
    }
    allTopics.sort((a,b) => b.priorityScore - a.priorityScore);

    const earliest = validExams[0];
    const availableDays = [];
    let cursor = new Date(today);
    while (cursor < earliest.date) {
      if (!state.daysOff.has(cursor.getDay())) availableDays.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }

    const schedule = [];
    const studiedSet = new Set();
    const hpt = Math.max(0.5, Math.min(1.5, (availableDays.length * hoursPerDay) / Math.max(1, allTopics.length) / 2));
    let ti = 0;

    for (let di = 0; di < availableDays.length && ti < allTopics.length; di++) {
      const day = availableDays[di]; const slots = []; let hu = 0; const hard = [], easy = [];
      while (ti < allTopics.length && hu + hpt <= hoursPerDay) {
        const t = allTopics[ti];
        if (!studiedSet.has(t.subject+'::'+t.topic)) { if (t.difficulty >= 4) hard.push(t); else easy.push(t); }
        ti++;
      }
      const picked = [];
      if (hard.length) picked.push(hard[0]);
      let hi = hard.length>0?1:0, ei = 0;
      while (picked.length < Math.floor(hoursPerDay / hpt)) {
        if (hi < hard.length && picked.length % 2 === 1) picked.push(hard[hi++]);
        else if (ei < easy.length) picked.push(easy[ei++]);
        else if (hi < hard.length) picked.push(hard[hi++]); else break;
      }
      const rem = allTopics.filter(t => !studiedSet.has(t.subject+'::'+t.topic)); let ri = 0;
      while (picked.length < Math.floor(hoursPerDay / hpt) && ri < rem.length) {
        const t = rem[ri]; if (!picked.includes(t)) picked.push(t); ri++;
      }
      for (const t of picked) {
        const key = t.subject+'::'+t.topic;
        if (!studiedSet.has(key)) {
          studiedSet.add(key); t.studied = true; t.studyDay = new Date(day);
          const ai = t.confidence <= 2 ? [1,2,4,8] : t.confidence === 3 ? [1,3,7,14] : [2,5,10,20];
          t.revisionDays = ai.map(d => addDays(day, d)).filter(d => d <= t.targetExam.date);
          slots.push(t); hu += hpt;
        }
      }
      if (slots.length > 0) schedule.push({ date: day, slots });
    }

    const unstudied = allTopics.filter(t => !t.studied);
    if (unstudied.length > 0 && validExams.length > 1) {
      for (const le of validExams.slice(1)) {
        const extraDays = [];
        let c2 = addDays(le.date > earliest.date ? new Date(Math.max(earliest.date.getTime(), today.getTime())) : today, 1);
        while (c2 < le.date) { if (!state.daysOff.has(c2.getDay())) extraDays.push(new Date(c2)); c2 = addDays(c2, 1); }
        const still = allTopics.filter(t => !t.studied && t.targetExam.id === le.id); let ti2 = 0;
        for (const ed of extraDays) {
          if (ti2 >= still.length) break; const slots = []; let hu = 0;
          while (ti2 < still.length && hu + hpt <= hoursPerDay) {
            const t = still[ti2]; const key = t.subject+'::'+t.topic;
            if (!studiedSet.has(key)) { studiedSet.add(key); t.studied = true; t.studyDay = new Date(ed);
              const ai = t.confidence <= 2 ? [1,2,4,8] : t.confidence === 3 ? [1,3,7,14] : [2,5,10,20];
              t.revisionDays = ai.map(d => addDays(ed, d)).filter(d => d <= t.targetExam.date);
              slots.push(t); hu += hpt; }
            ti2++;
          }
          if (slots.length > 0) schedule.push({ date: ed, slots });
        }
      }
    }

    // Fill all available days into schedule (empty slots where no new topics assigned)
    const schedSet = new Set(schedule.map(d => formatDate(d.date)));
    for (const day of availableDays) {
      if (!schedSet.has(formatDate(day))) {
        schedule.push({ date: day, slots: [] });
      }
    }

    // Merge revision sessions into schedule
    for (const t of allTopics.filter(t => t.studied && t.revisionDays && t.revisionDays.length > 0)) {
      for (const revDate of t.revisionDays) {
        let entry = schedule.find(d => formatDate(d.date) === formatDate(revDate));
        if (!entry) {
          entry = { date: revDate, slots: [] };
          schedule.push(entry);
        }
        const exists = entry.slots.some(s => s.subject === t.subject && s.topic === t.topic);
        if (!exists) {
          entry.slots.push({
            subject: t.subject,
            topic: t.topic,
            difficulty: t.difficulty,
            confidence: t.confidence,
            isRevision: true,
            studied: false,
            targetExam: t.targetExam,
            priorityScore: t.priorityScore
          });
        }
      }
    }

    schedule.sort((a, b) => (parseAsDate(a.date) || new Date()).getTime() - (parseAsDate(b.date) || new Date()).getTime());

    state.allTopics = allTopics; state.schedule = schedule;
    updateStreak(today);
    _renderDashboard(validExams, today);

    // Cleanup: clear progress timer, hide progress, reset button
    clearTimeout(progressTimer);
    if (progressEl) progressEl.classList.add('hidden');
    if (btn) btn.className = 'h-10 px-5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all duration-300 cursor-pointer bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-md shadow-violet-600/15 hover:from-violet-700 hover:to-violet-800 hover:shadow-lg hover:shadow-violet-600/25 active:scale-[0.97]';
    if (btnText) btnText.textContent = 'Generate Study Plan';
    if (btnIcon) btnIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063A2 2 0 0 0 14.063 15.5l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>';
    _generating = false;

    // Scroll to dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Highlight briefly
      dashboard.style.transition = 'box-shadow 0.3s ease';
      dashboard.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.3), 0 0 20px rgba(139,92,246,0.15)';
      setTimeout(() => { dashboard.style.boxShadow = ''; }, 2000);
      // Focus for accessibility
      setTimeout(() => { dashboard.focus({ preventScroll: true }); }, 400);
    }
  }

  function updateStreak(today) {
    const sd = state.streakData; const todayStr = formatDate(today);
    if (sd.lastDate === todayStr) return;
    const yesterday = formatDate(addDays(today, -1));
    if (sd.lastDate === yesterday) sd.count++; else if (sd.lastDate !== todayStr) sd.count = 1;
    sd.lastDate = todayStr;
    if (!sd.dates.includes(todayStr)) sd.dates.push(todayStr);
    if (sd.dates.length > 60) sd.dates = sd.dates.slice(-60);
    localStorage.setItem('ss_streak', JSON.stringify(sd)); state.streakData = sd;
  }

  function renderRecommendations(exams, today) {
    const section = document.getElementById('recommendations-section');
    const body = document.getElementById('recommendation-body');
    const count = document.getElementById('recommendation-count');
    const recs = [];
    const totalTopics = state.allTopics.length;
    const studiedTopics = state.allTopics.filter(t => t.studied).length;
    const avgConf = state.allTopics.length > 0 ? state.allTopics.reduce((s,t) => s + (t.confidence||1), 0) / state.allTopics.length : 0;

    // Catch-up pressure
    if (totalTopics > 0 && studiedTopics / totalTopics < 0.3) {
      recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', text: 'You\'ve covered less than 30% of topics. Try 2 short sessions today to build momentum.', type: 'focus' });
    } else if (studiedTopics === totalTopics && avgConf < 3) {
      recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>', text: 'All topics started! Now deepen them — re-study low-confidence topics to boost your avg above 3.', type: 'review' });
    }

    // Confidence holes
    const lowConf = state.allTopics.filter(t => t.confidence < 2);
    if (lowConf.length >= 2) {
      recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', text: `${lowConf.length} topics need attention (confidence < 2). A focused session on these will move your score most.`, type: 'warning' });
    }

    // Near exams
    const nearExam = exams.filter(e => daysBetween(today, e.date) <= 3 && daysBetween(today, e.date) >= 0);
    if (nearExam.length > 0) {
      recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>', text: `${nearExam[0].name} is in ${daysBetween(today, nearExam[0].date)} day${daysBetween(today, nearExam[0].date)>1?'s':''}! Focus on review over new material.`, type: 'urgent' });
    }

    // Burnout check
    const topicsToday = state.allTopics.filter(t => daysBetween(new Date(t.studiedDate||''), today) === 0).length;
    if (topicsToday >= 4) {
      recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><path d="M12 22v-5l-3-3 2-5"/><path d="M12 22v-5l3-3-2-5"/><path d="M9 11l-2 3 1 2"/><path d="M15 11l2 3-1 2"/></svg>', text: `You studied ${topicsToday} topics today. Take a break or do a light review session to avoid burnout.`, type: 'rest' });
    }

    // Streak encouragement
    if (state.streakData.count > 0 && state.streakData.count < 5) {
      recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>', text: `${state.streakData.count}-day streak! One more day unlocks the 5-day milestone.`, type: 'streak' });
    }

    if (recs.length === 0) { section.classList.add('hidden'); return; }

    section.classList.remove('hidden');
    count.textContent = `${recs.length} insight${recs.length>1?'s':''}`;
    body.innerHTML = recs.map((r, i) => {
      const colors = { focus: 'border-sky-500/20 bg-sky-500/[0.02]', review: 'border-indigo-500/20 bg-indigo-500/[0.02]', warning: 'border-amber-500/20 bg-amber-500/[0.02]', urgent: 'border-rose-500/20 bg-rose-500/[0.02]', rest: 'border-emerald-500/20 bg-emerald-500/[0.02]', streak: 'border-orange-500/20 bg-orange-500/[0.02]' };
      return `<div class="flex items-start gap-2 p-2 rounded-lg border ${colors[r.type]||colors.focus} card-enter" style="animation-delay:${i*0.08}s">
        <span class="text-xs shrink-0 mt-0.5">${r.icon}</span>
        <p class="text-[11px] text-ink/80 leading-snug">${r.text}</p>
      </div>`;
    }).join('');
  }

  function renderStreak(today) {
    const sd = state.streakData;
    document.getElementById('streak-count').textContent = sd.count;
    document.getElementById('streak-emoji').innerHTML = sd.count >= 7 ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>' : sd.count >= 3 ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
    document.getElementById('streak-message').textContent = sd.count === 0 ? 'Study today to start your streak!' : sd.count < 3 ? `Studied ${sd.count} day${sd.count>1?'s':''}. Keep it up!` : sd.count < 7 ? `${sd.count}-day streak! Don't break it!` : `Incredible! ${sd.count}-day streak!`;
    const dots = document.getElementById('streak-dots');
    const weekAgo = addDays(today, -6); dots.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekAgo, i); const ds = formatDate(d); const active = sd.dates.includes(ds);
      const dot = document.createElement('span');
      dot.className = `streak-dot w-3 h-3 rounded-sm ${active ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]' : 'bg-hairline/30'}`;
      dot.title = friendlyDate(d) + (active ? ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> studied' : ''); dots.appendChild(dot);
    }
  }

  function renderRoadmap(exam, today) {
    const d = daysBetween(today, exam.date);
    const studied = state.allTopics.filter(t => t.studied).length;
    const total = state.allTopics.length;
    const pct = total > 0 ? Math.min(100, (studied / total) * 100) : 0;
    document.getElementById('roadmap-progress').style.width = pct + '%';
    document.getElementById('roadmap-today').textContent = friendlyDate(today);
    document.getElementById('roadmap-exam-date').textContent = friendlyDate(exam.date) + ' (' + d + ' days)';
    document.getElementById('roadmap-exam-label').textContent = exam.name + ' Exam';

    const studyMarker = document.getElementById('roadmap-study-marker');
    const revMarker = document.getElementById('roadmap-revision-marker');
    studyMarker.classList.remove('hidden');
    revMarker.classList.remove('hidden');
    if (d <= 3) studyMarker.classList.add('hidden');
    if (d <= 7) revMarker.classList.add('hidden');
  }

  function _renderDashboard(exams, today) {
    document.getElementById('dashboard').classList.remove('hidden');

    renderStreak(today);
    renderRoadmap(exams[0], today);
    renderReadiness(exams, today);
    renderTodayHero(today, exams);
    renderForecast(exams, today);
    renderAdaptiveRevision(today);
    renderMissedDay(exams, today);
    renderWeeklyRoadmap(today);
    renderRecommendations(exams, today);
    renderStudyPlan(activePlanTab);
    renderPlannerPreview();
    updateReadinessSidebar();

    const totalDays = state.schedule.length;
    const totalTopics = state.allTopics.filter(t => t.studied).length;
    document.getElementById('roadmap-count').textContent = `${totalDays}d · ${totalTopics} topics`;
  }

  function updateReadinessSidebar() {
    const examsCount = state.exams.length;
    const subjectsCount = state.subjects.length;
    const hoursPerDay = parseInt(document.getElementById('hours-per-day')?.value || '0');

    // Scores: 0 or 1 per category
    const examScore = examsCount >= 1 ? 1 : 0;
    const subjectScore = subjectsCount >= 1 ? 1 : 0;
    const hoursScore = hoursPerDay > 0 ? 1 : 0;
    const total = ((examScore + subjectScore + hoursScore) / 3) * 100;

    // Ring
    const circ = 97.4;
    const ring = document.getElementById('sidebar-ring-progress');
    const pctEl = document.getElementById('sidebar-ring-pct');
    const labelEl = document.getElementById('sidebar-ring-label');
    const subEl = document.getElementById('sidebar-ring-sub');
    ring.style.strokeDashoffset = circ - (total / 100) * circ;
    pctEl.textContent = Math.round(total) + '%';

    // Status levels
    if (total >= 100) {
      labelEl.textContent = 'All set!';
      subEl.textContent = 'Ready to generate your plan.';
    } else if (total >= 66) {
      labelEl.textContent = 'Almost there';
      subEl.textContent = 'Configure study hours to finish.';
    } else if (total >= 33) {
      labelEl.textContent = 'Getting there';
      subEl.textContent = 'Add subjects to continue.';
    } else if (examScore > 0) {
      labelEl.textContent = 'Good start';
      subEl.textContent = 'Add subjects to continue.';
    } else {
      labelEl.textContent = 'Getting started';
      subEl.textContent = 'Add an exam to begin.';
    }

    // Checklist dots
    const checkIds = ['sidebar-check-exams', 'sidebar-check-subjects', 'sidebar-check-hours'];
    const scores = [examScore, subjectScore, hoursScore];
    checkIds.forEach((id, i) => {
      const dot = document.getElementById(id);
      if (scores[i]) {
        dot.style.borderColor = '#22c55e';
        dot.style.background = '#22c55e';
        dot.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      } else {
        dot.style.borderColor = '#cbd5e1';
        dot.style.background = 'transparent';
        dot.innerHTML = '';
      }
    });

    // Counts
    document.getElementById('sidebar-exams-count').textContent = examsCount;
    document.getElementById('sidebar-subjects-count').textContent = subjectsCount;
    document.getElementById('sidebar-hours-count').textContent = hoursPerDay;

    // Status message
    const statusEl = document.getElementById('sidebar-status');
    const statusDot = statusEl.querySelector('span');
    const statusText = statusEl.querySelector('span:last-child');
    if (total >= 100) {
      statusDot.style.background = '#22c55e';
      statusText.textContent = 'Your setup is complete! Generate your plan.';
    } else if (total >= 66) {
      statusDot.style.background = '#f59e0b';
      statusText.textContent = 'Set your daily study hours to finish setup.';
    } else if (total >= 33) {
      statusDot.style.background = '#f59e0b';
      statusText.textContent = 'Add subjects with topics to continue.';
    } else {
      statusDot.style.background = '#94a3b8';
      statusText.textContent = 'Add an exam to get started.';
    }
  }

  function renderPlannerPreview() {
    const today = new Date(); today.setHours(0,0,0,0);
    const exams = state.exams.filter(e => e.name.trim() && e.date && !isNaN(parseAsDate(e.date)?.getTime())).sort((a,b) => parseAsDate(a.date).getTime() - parseAsDate(b.date).getTime());
    const hasSubjects = state.subjects.some(s => s.name.trim() && s.topics.trim());

    const countdownSec = document.getElementById('preview-countdown');
    const readinessSec = document.getElementById('preview-readiness');
    const dailySec = document.getElementById('preview-daily');
    const revisionSec = document.getElementById('preview-revision');

    // ── Exam Countdown ──
    const cdName = document.getElementById('pr-countdown-name');
    const cdVal = document.getElementById('pr-countdown-val');
    const cdBar = document.getElementById('pr-countdown-bar');
    if (exams.length > 0) {
      const exam = exams[0];
      const daysLeft = daysBetween(today, exam.date);
      cdName.textContent = exam.name;
      cdName.className = 'text-[10px] font-bold text-slate-800 truncate';
      countdownSec.classList.remove('opacity-60');
      if (daysLeft > 0) {
        cdVal.textContent = daysLeft + 'd';
        cdVal.className = 'text-[10px] font-black shrink-0 ' + (daysLeft <= 7 ? 'text-rose-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-emerald-600');
        const barPct = Math.min(100, Math.max(5, 100 - (daysLeft / 365) * 100));
        cdBar.style.width = barPct + '%';
        cdBar.className = 'h-full rounded-full transition-all duration-500 ' + (daysLeft <= 7 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : daysLeft <= 30 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400');
      } else {
        cdVal.textContent = 'Today!';
        cdVal.className = 'text-[10px] font-black text-rose-600';
        cdBar.style.width = '100%';
        cdBar.className = 'h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400';
      }
    }

    // ── Readiness Score ──
    const all = state.allTopics;
    const total = all.length;
    const studied = all.filter(t => t.studied).length;
    const pct = total > 0 ? (studied / total) * 100 : 0;
    let confScore = 0;
    for (const t of all) confScore += t.confidence;
    const avgConf = all.length > 0 ? (confScore / all.length) * 20 : 0;
    const daysUntil = exams.length > 0 ? daysBetween(today, exams[0].date) : 0;
    const daysPct = daysUntil > 0 ? Math.min(100, (state.schedule.length / Math.max(1, daysUntil)) * 100) : 0;
    const rdVal = document.getElementById('pr-readiness-val');
    const rdBar = document.getElementById('pr-readiness-bar');
    if (hasSubjects && total > 0) {
      const readiness = Math.min(100, Math.round(pct * 0.35 + daysPct * 0.2 + avgConf * 0.45));
      readinessSec.classList.remove('opacity-60');
      rdVal.textContent = readiness + '%';
      rdVal.className = 'text-[10px] font-black text-violet-600';
      rdBar.style.width = readiness + '%';
      rdBar.className = 'h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500';
    }

    // ── Daily Schedule Snippet ──
    const todayStr = formatDate(today);
    const todayPlan = state.schedule.find(d => formatDate(d.date) === todayStr);
    const dailyCount = document.getElementById('pr-daily-count');
    const dailyList = document.getElementById('pr-daily-list');
    if (todayPlan && todayPlan.slots.length > 0) {
      dailySec.classList.remove('opacity-60');
      dailyCount.textContent = todayPlan.slots.length + ' topic' + (todayPlan.slots.length !== 1 ? 's' : '');
      dailyCount.className = 'text-[10px] font-medium text-emerald-600';
      dailyList.innerHTML = todayPlan.slots.slice(0, 3).map(t => {
        const key = t.subject + '::' + t.topic;
        const done = state.completedTopics.has(key);
        return '<div class="flex items-center gap-1.5">' +
          '<span class="w-3 h-3 rounded border ' + (done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300') + ' flex items-center justify-center shrink-0">' +
          (done ? '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
          '</span>' +
          '<span class="text-[10px] text-slate-800 truncate ' + (done ? 'line-through text-slate-500' : '') + '">' + t.topic + '</span>' +
          '<span class="text-[8px] text-slate-500 shrink-0 ml-auto">' + t.subject + '</span>' +
          '</div>';
      }).join('');
      if (todayPlan.slots.length > 3) {
        dailyList.innerHTML += '<div class="text-[9px] text-violet-500 font-semibold">+' + (todayPlan.slots.length - 3) + ' more</div>';
      }
    }

    // ── Revision Tracker Snippet ──
    const studiedWithRev = all.filter(t => t.studied && t.revisionDays && t.revisionDays.length > 0);
    const dueNow = [];
    for (const t of studiedWithRev) {
      for (const rd of t.revisionDays) {
        if (formatDate(rd) === todayStr) dueNow.push(t);
      }
    }
    const revCount = document.getElementById('pr-revision-count');
    const revList = document.getElementById('pr-revision-list');
    if (dueNow.length > 0) {
      revisionSec.classList.remove('opacity-60');
      revCount.textContent = dueNow.length + ' due today';
      revCount.className = 'text-[10px] font-bold text-amber-600';
      revList.innerHTML = dueNow.slice(0, 3).map(t => {
        const conf = t.confidence || 3;
        const badge = conf <= 2 ? 'Low' : conf === 3 ? 'Review' : 'Quick';
        const badgeCls = conf <= 2 ? 'bg-amber-500/10 text-amber-600' : conf === 3 ? 'bg-sky-500/10 text-sky-600' : 'bg-emerald-500/10 text-emerald-600';
        return '<div class="flex items-center gap-1.5">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 shrink-0"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>' +
        '<span class="text-[10px] text-slate-800 truncate">' + t.topic + '</span>' +
        '<span class="text-[7px] font-bold px-1 py-0.5 rounded ' + badgeCls + ' shrink-0 ml-auto">' + badge + '</span>' +
        '</div>';
      }).join('');
      if (dueNow.length > 3) {
        revList.innerHTML += '<div class="text-[9px] text-amber-600 font-semibold">+' + (dueNow.length - 3) + ' more</div>';
      }
    } else if (studiedWithRev.length > 0) {
      const soon = [];
      for (const t of studiedWithRev) {
        for (const rd of t.revisionDays) {
          if (rd > today && daysBetween(today, rd) <= 3) soon.push(t);
        }
      }
      if (soon.length > 0) {
        revisionSec.classList.remove('opacity-60');
        revCount.textContent = soon.length + ' in 3d';
        revCount.className = 'text-[10px] font-bold text-emerald-600';
        revList.innerHTML = '<div class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>' +
          'Caught up! Next reviews in 3 days.' +
          '</div>';
      } else if (state.schedule.length > 0) {
        revisionSec.classList.remove('opacity-60');
        revCount.textContent = '0 due';
        revCount.className = 'text-[10px] font-bold text-slate-400';
        revList.innerHTML = '<div class="text-[10px] text-slate-400 italic">All reviews done. Add more topics to keep going.</div>';
      }
    }
  }

  function renderReadiness(exams, today) {
    const all = state.allTopics; const total = all.length; const studied = all.filter(t => t.studied).length;
    const pct = total > 0 ? (studied / total) * 100 : 0;
    let confScore = 0; for (const t of all) confScore += t.confidence;
    const avgConf = all.length > 0 ? (confScore / all.length) * 20 : 0;
    const daysUntil = daysBetween(today, exams[0].date);
    const daysPct = daysUntil > 0 ? Math.min(100, (state.schedule.length / Math.max(1, daysUntil)) * 100) : 0;
    const readiness = Math.min(100, Math.round(pct * 0.35 + daysPct * 0.2 + avgConf * 0.45));
    const circ = 97.4;
    const ring = document.getElementById('readiness-ring');
    const scoreEl = document.getElementById('readiness-score');
    ring.style.strokeDashoffset = circ - (readiness / 100) * circ;
    scoreEl.textContent = readiness + '%';
    const levels = [
      { min: 90, label: 'Exam Ready', cls: 'bg-emerald-500/10 text-emerald-600' },
      { min: 70, label: 'Well Prepared', cls: 'bg-green-500/10 text-green-600' },
      { min: 45, label: 'Getting There', cls: 'bg-amber-500/10 text-amber-600' },
      { min: 20, label: 'Needs Work', cls: 'bg-orange-500/10 text-orange-600' },
      { min: 0, label: 'Just Started', cls: 'bg-rose-500/10 text-rose-600' }
    ];
    const level = levels.find(l => readiness >= l.min) || levels[4];
    document.getElementById('readiness-level').textContent = level.label;
    document.getElementById('readiness-level').className = `text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${level.cls}`;
    document.getElementById('readiness-detail').textContent =
      readiness >= 90 ? 'You are well prepared. Focus on maintenance reviews and rest.' :
      readiness >= 70 ? 'Good progress. Keep following the plan and target weak areas.' :
      readiness >= 45 ? 'You are making progress. Focus on high-difficulty, low-confidence topics.' :
      readiness >= 20 ? 'Prioritize studying for your earliest exam. You have time to catch up.' :
      'Start with the highest priority topics. Every session counts.';
    const breakdown = document.getElementById('readiness-breakdown');
    const colors = ['text-violet-600','text-emerald-600','text-amber-600','text-sky-600','text-rose-600'];
    breakdown.innerHTML = exams.map((exam, ei) => {
      const et = all.filter(t => t.targetExam.id === exam.id);
      const es = et.filter(t => t.studied).length;
      const ep = et.length > 0 ? Math.round((es / et.length) * 100) : 0;
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-canvas-soft-2 border border-hairline/20 text-[10px] font-bold ${colors[ei%colors.length]}">${exam.name} ${ep}%</span>`;
    }).join('');
    document.getElementById('readiness-topics-done').textContent = studied + '/' + total;
    document.getElementById('readiness-topics-left').textContent = total - studied;
    document.getElementById('readiness-days-left').textContent = daysUntil + ' day' + (daysUntil !== 1 ? 's' : '');
  }

  function renderTodayHero(today, exams) {
    const container = document.getElementById('today-hero-tasks');
    const countEl = document.getElementById('today-hero-count');
    const progressText = document.getElementById('today-hero-progress-text');
    const progressBar = document.getElementById('today-hero-bar');
    const todayStr = formatDate(today);
    const todayPlan = state.schedule.find(d => formatDate(d.date) === todayStr);
    const total = state.allTopics.length;

    if (todayPlan && todayPlan.slots.length > 0) {
      countEl.textContent = `${todayPlan.slots.length} topic${todayPlan.slots.length > 1 ? 's' : ''}`;
      const completed = todayPlan.slots.filter(t => state.completedTopics.has(`${t.subject}::${t.topic}`)).length;
      const pct = todayPlan.slots.length > 0 ? Math.round((completed / todayPlan.slots.length) * 100) : 0;
      progressText.textContent = `${completed} of ${todayPlan.slots.length} completed`;
      progressBar.style.width = pct + '%';
      const boost = total > 0 ? Math.round((1 / total) * 35) : 0;
      container.innerHTML = todayPlan.slots.map(t => {
        const key = `${t.subject}::${t.topic}`;
        const isDone = state.completedTopics.has(key);
        const pri = getPri(t.priorityScore);
        const estMin = [0, 15, 20, 25, 35, 45][t.difficulty] || 25;
        const impLabel = pri.score >= 14 ? 'High Impact' : pri.score >= 10 ? 'Recommended' : pri.score >= 7 ? 'Optional' : 'Quick';
        const impColor = pri.score >= 14 ? 'text-rose-600 bg-rose-500/10' : pri.score >= 10 ? 'text-amber-600 bg-amber-500/10' : pri.score >= 7 ? 'text-blue-600 bg-blue-500/10' : 'text-emerald-600 bg-emerald-500/10';
        return `<label class="flex items-start gap-2.5 p-2 rounded-xl cursor-pointer select-none border transition-all ${isDone ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-hairline/20 hover:bg-violet-500/[0.02] hover:border-violet-500/20'}">
          <input type="checkbox" class="task-checkbox w-4 h-4 rounded border-hairline text-violet-600 focus:ring-violet-500 cursor-pointer mt-0.5 shrink-0" data-key="${key}" ${isDone ? 'checked' : ''} />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-ink ${isDone ? 'line-through text-ink/40' : ''}">${toMission(t.topic, t.subject)}</span>
              <span class="text-[9px] text-ink/40">${t.subject}</span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[9px] text-ink/50 flex items-center gap-1">â± ${estMin} min</span>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${impColor}">${impLabel}</span>
              <span class="text-[9px] text-violet-600 font-semibold">+${boost}% readiness</span>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <span class="${pri.cls} text-[8px] font-bold px-1.5 py-0.5 rounded-md">${pri.label}</span>
          </div>
        </label>`;
      }).join('');
      document.getElementById('today-hero-log').classList.remove('hidden');
      populateLogSelect();
      // Attach checkbox listeners for hero card
      container.querySelectorAll('.task-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
          const k = this.getAttribute('data-key');
          if (this.checked) state.completedTopics.add(k);
          else state.completedTopics.delete(k);
          localStorage.setItem('ss_completed_topics', JSON.stringify(Array.from(state.completedTopics)));
          triggerDashboardRefresh();
        });
      });
    } else {
      const next = state.schedule.find(d => formatDate(d.date) > todayStr);
      const daysLeft = daysBetween(today, state.allTopics.length > 0 ? state.allTopics[0].targetExam.date : today);
      countEl.textContent = '0 topics';
      progressBar.style.width = '0%';
      if (daysLeft <= 0) {
        progressText.textContent = 'Exam day!';
        container.innerHTML = '<div class="text-center py-3 text-base font-extrabold text-violet-600">Best of luck! <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>';
      } else if (next) {
        const allDone = state.allTopics.length > 0 && state.allTopics.every(t => t.studied);
        progressText.textContent = allDone ? 'All topics covered!' : 'Rest day';
        container.innerHTML = `<div class="text-center py-3">
          <p class="text-sm font-bold text-ink">${allDone ? 'Great progress. Only reviews remain.' : 'Rest day — you\'ve earned it.'}</p>
          <p class="text-xs text-ink/50 mt-1">Next session: ${friendlyDate(next.date)}</p>
        </div>`;
      } else {
        progressText.textContent = 'No plan yet';
        container.innerHTML = '<div class="text-center py-3 text-xs text-ink/50 italic">Generate your study plan above.</div>';
      }
    }
  }

  function getPri(score) {
    if (score >= 14) return { label: 'Critical', cls: 'bg-rose-500/10 text-rose-600', score: 14 };
    if (score >= 10) return { label: 'High', cls: 'bg-amber-500/10 text-amber-600', score: 10 };
    if (score >= 7) return { label: 'Medium', cls: 'bg-blue-500/10 text-blue-600', score: 7 };
    return { label: 'Low', cls: 'bg-emerald-500/10 text-emerald-600', score: 4 };
  }

  function toMission(topic, subject) {
    const s = (subject || '').toLowerCase();
    const verbs = [
      [/math|algebra|geometry|calculus|trig|arithmetic|statistics/, 'Solve'],
      [/phys|mechanic|thermo|optics|wave|electric|magnetic|quantum|nuclear/, 'Master'],
      [/chem|element|compound|reaction|acid|base|organic|bond|mole/, 'Study'],
      [/bio|cell|genetic|ecolog|evolution|anatomy|physiolog|organ/, 'Review'],
      [/hist|world|ancient|medieval|modern|civil|war|revolution/, 'Map'],
      [/english|literature|grammar|vocabulary|writing|reading|essay/, 'Practice'],
      [/languag|spanish|french|german|chinese|hindi|japanese/, 'Practice'],
      [/geo|map|climate|population|landform|region/, 'Explore'],
      [/art|music|drama|theatre|dance|design/, 'Create'],
      [/comput|coding|program|algorithm|data|software|web/, 'Build'],
      [/econom|business|market|finance|accounting|trade/, 'Analyze'],
      [/philosoph|ethic|logic|reason|critical/, 'Examine'],
      [/psych|sociolog|culture|anthropol/, 'Understand'],
      [/religion|theol|scripture|faith/, 'Reflect'],
    ];
    for (const [pattern, verb] of verbs) {
      if (pattern.test(s)) return `${verb} ${topic}`;
    }
    return `Study ${topic}`;
  }

  function populateLogSelect() {
    const sel = document.getElementById('log-topic-select');
    const todayStr = formatDate(new Date());
    const todayPlan = state.schedule.find(d => formatDate(d.date) === todayStr);
    sel.innerHTML = (todayPlan?.slots || []).map(t => `<option value="${t.topic}|${t.subject}">${t.topic} (${t.subject})</option>`).join('');
    if (!sel.options.length) sel.innerHTML = '<option value="">No topics available</option>';
  }

  document.getElementById('log-session-btn')?.addEventListener('click', function() {
    const sel = document.getElementById('log-topic-select');
    const conf = parseInt(document.getElementById('log-confidence-select').value);
    const val = sel.value;
    if (!val) { alert('Select a topic to log.'); return; }
    const [topic, subject] = val.split('|');
    const match = state.allTopics.find(t => t.topic === topic && t.subject === subject);
    if (match) {
      match.confidence = conf;
      const log = { topic, subject, confidence: conf, date: formatDate(new Date()) };
      state.logHistory.push(log);
      localStorage.setItem('ss_logs', JSON.stringify(state.logHistory));
      // Recompute priority score
      const daysUntil = daysBetween(new Date(), match.targetExam.date);
      match.priorityScore = match.difficulty * 2 + (6 - conf) * 1.5 + (1 / Math.max(1, daysUntil)) * 15;
      // Re-render
      const today = new Date(); today.setHours(0,0,0,0);
      const exams = state.exams.filter(e => e.name.trim() && e.date && !isNaN(parseAsDate(e.date)?.getTime())).sort((a,b) => parseAsDate(a.date).getTime() - parseAsDate(b.date).getTime());
      _renderDashboard(exams, today);
    }
  });

  function renderForecast(exams, today) {
    const el = document.getElementById('forecast-content');
    const all = state.allTopics;
    const groups = {};
    for (const t of all) {
      const key = t.subject+'::'+t.targetExam.id;
      if (!groups[key]) groups[key] = { subject: t.subject, exam: t.targetExam, topics: [] };
      groups[key].topics.push(t);
    }
    el.innerHTML = Object.values(groups).map(g => {
      const total = g.topics.length; const studied = g.topics.filter(t => t.studied).length;
      const pct = total > 0 ? Math.round((studied/total)*100) : 0;
      const pace = Math.max(1, state.schedule.length);
      const pctPerDay = pace > 0 ? (studied / pace) : 0;
      const remaining = total - studied;
      let estDays = 999;
      let estDate = null;
      if (pctPerDay > 0) { estDays = Math.ceil(remaining / pctPerDay); estDate = addDays(today, estDays); }
      const isOnTrack = estDate && estDate <= g.exam.date;
      const statusText = !estDate ? 'Start' : (isOnTrack ? 'On track' : 'Behind');
      const statusIcon = !estDate ? '·' : (isOnTrack ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>');
      const statusColor = !estDate ? 'text-ink/40' : (isOnTrack ? 'text-emerald-600' : 'text-rose-600');
      return `<div class="schedule-day-enter mb-1.5 last:mb-0">
        <div class="flex items-center justify-between mb-0.5"><span class="text-[11px] font-bold text-ink truncate mr-2">${g.subject}</span><span class="text-[9px] text-ink/50 shrink-0">${studied}/${total}</span></div>
        <div class="w-full h-1.5 bg-hairline/30 rounded-full overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 progress-fill" style="width:${pct}%"></div></div>
        <div class="flex items-center justify-between mt-0.5">
          <span class="${statusColor} text-[9px] font-bold flex items-center gap-1">${statusIcon} ${statusText}</span>
          <span class="text-[8px] text-ink/50">${estDate ? shortDate(estDate) : ''}</span>
        </div>
      </div>`;
    }).join('') || '<div class="text-center py-2 text-xs text-ink/50 italic">Add subjects to see your study forecast.</div>';
  }

  function renderAdaptiveRevision(today) {
    const el = document.getElementById('revision-content'); const badge = document.getElementById('revision-count');
    const studied = state.allTopics.filter(t => t.studied && t.revisionDays.length > 0);
    if (studied.length === 0) { badge.textContent = ''; el.innerHTML = '<div class="text-center py-1.5 text-[11px] text-ink/50 italic">Start studying to see revision reminders here.</div>'; return; }
    const todayStr = formatDate(today); const dueNow = [], dueSoon = [];
    for (const t of studied) { for (const rd of t.revisionDays) { const ds = formatDate(rd); if (ds === todayStr) dueNow.push(t); else if (rd > today && daysBetween(today, rd) <= 3) dueSoon.push(t); } }
    const tc = dueNow.length; badge.textContent = `${tc} due today`;
    if (tc > 0) {
      el.innerHTML = `<div class="space-y-1"><p class="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Due today</p>${
        dueNow.slice(0,5).map(t => `<div class="flex items-center gap-1.5 p-1 rounded-lg bg-amber-500/[0.05] border border-amber-500/10 schedule-day-enter">
          <span class="text-[11px] font-semibold text-ink flex-1 min-w-0 truncate">${toMission(t.topic, t.subject)}</span>
          <span class="text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500/10 text-amber-600">${t.confidence <= 2 ? 'Low' : t.confidence === 3 ? 'Review' : 'Quick'}</span>
        </div>`).join('')
      }${dueSoon.length > 0 ? `<p class="text-[9px] text-ink/50 mt-1">${dueSoon.length} more within 3d</p>` : ''}</div>`;
    } else if (dueSoon.length > 0) {
      el.innerHTML = `<div class="flex items-center gap-1.5 text-[11px] text-ink/60"><span class="text-emerald-500 font-bold"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> Caught up. ${dueSoon.length} reviews in 3d.</div>`;
    } else {
      el.innerHTML = '<div class="flex items-center gap-1.5 text-[11px] text-ink/60"><span class="text-emerald-500 font-bold"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> All caught up — no reviews due right now.</div>';
    }
  }

  function renderMissedDay(exams, today) {
    const el = document.getElementById('missed-day-content');
    const all = state.allTopics;
    if (all.length === 0) { el.innerHTML = '<div class="text-center py-2 text-xs text-ink/50 italic">Generate your plan to explore how missed days affect your readiness.</div>'; return; }
    const studied = all.filter(t => t.studied).length; const total = all.length;
    const currentPct = total > 0 ? Math.round((studied / total) * 100) : 0;
    const hpDay = parseFloat(document.getElementById('hours-per-day').value) || 4;
    const hpt = Math.max(0.5, Math.min(1.5, 1));
    const topicsPerDay = Math.floor(hpDay / hpt);
    const impact = Math.max(0, currentPct - state.missedDays * 2);
    el.innerHTML = `
      <div class="flex items-center gap-2 mb-1.5">
        <span class="text-[10px] font-bold text-ink shrink-0">Miss</span>
        <input type="range" id="missed-slider" class="missed-slider flex-1" min="0" max="14" value="${state.missedDays}" />
        <span class="text-[10px] font-bold text-ink w-16 text-right"><span id="missed-day-count">${state.missedDays}</span>d</span>
      </div>
      <div class="flex items-center justify-between p-1.5 rounded-lg bg-rose-500/[0.04] border border-rose-500/10">
        <div>
          <span class="text-[9px] text-ink/60">Readiness would drop to</span>
          <div class="flex items-baseline gap-1">
            <span class="text-xs font-black ${impact >= currentPct*0.7 ? 'text-emerald-500' : impact >= currentPct*0.4 ? 'text-amber-500' : 'text-rose-500'}">${impact}%</span>
            <span class="text-[9px] text-ink/40">from ${currentPct}%</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-[9px] text-ink/60">Topics delayed</span>
          <div class="text-xs font-black text-ink">${Math.min(topicsPerDay * state.missedDays, total - studied)}</div>
        </div>
      </div>
      <p id="missed-warning" class="text-[8px] text-ink/50 mt-0.5 leading-snug">${state.missedDays === 0 ? 'Drag to see impact of missed days.' : state.missedDays <= 3 ? 'A short break is manageable.' : state.missedDays <= 7 ? 'This will noticeably impact readiness.' : 'Seriously affects preparation.'}</p>`;
    const slider = document.getElementById('missed-slider');
    slider.addEventListener('input', function() { state.missedDays = parseInt(this.value); renderMissedDay(exams, today); });
  }

  function renderWeeklyRoadmap(today) {
    const el = document.getElementById('weekly-roadmap');
    if (state.schedule.length === 0) { el.innerHTML = '<div class="text-center py-2 text-xs text-ink/50 italic">Your weekly schedule appears after you generate your plan.</div>'; return; }
    const todayStr = formatDate(today);
    el.innerHTML = state.schedule.map((day, di) => {
      const isToday = formatDate(day.date) === todayStr;
      return `<div class="p-2 rounded-xl ${isToday ? 'bg-violet-500/5 border border-violet-500/15' : 'bg-canvas-soft-2/20 border border-hairline/10'} schedule-day-enter" style="animation-delay:${di*30}ms">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-extrabold text-ink">${isToday ? 'Today' : friendlyDate(day.date)}</span>${isToday ? '<span class="text-[8px] font-bold text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Now</span>' : ''}
          <span class="text-[9px] text-ink/40 ml-auto">${day.slots.length} topic${day.slots.length>1?'s':''}</span>
        </div>
        <div class="flex flex-wrap gap-1">${day.slots.map(t => { const pri = getPri(t.priorityScore); return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-canvas border border-hairline/20 text-[10px] font-semibold text-ink"><span class="${pri.cls} text-[7px] font-bold px-1 py-0.25 rounded">${pri.label}</span> ${toMission(t.topic, t.subject)}</span>`; }).join('')}</div>
      </div>`;
    }).join('');
  }

  document.getElementById('generate-step-btn')?.addEventListener('click', generate);
  document.getElementById('generate-step-btn')?.addEventListener('touchstart', function(e) { if (!this._clicked) { this._clicked = true; generate(); } }, { passive: true });
  // Tab switching
  let activePlanTab = 'week';
  document.querySelectorAll('.study-plan-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.getAttribute('data-tab');
      if (tab) { activePlanTab = tab; renderStudyPlan(tab); }
    });
  });

  // PDF download
  document.getElementById('download-pdf-btn')?.addEventListener('click', downloadPDF);
  document.getElementById('download-planner-kit-btn')?.addEventListener('click', downloadPlannerKit);
  const plannerKitCta = document.getElementById('planner-kit-cta-btn');
  if (plannerKitCta) plannerKitCta.addEventListener('click', downloadPlannerKit);

  // Pre-load PDF libraries in background for fast download
  if (!window.html2canvas) {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  }
  if (!window.jspdf?.jsPDF) {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  }

  // ===== IMPORT EXAM SHEET =====
  function setProgress(pct, text) {
    document.getElementById('import-progress').classList.remove('hidden');
    document.getElementById('import-progress-bar').style.width = pct + '%';
    document.getElementById('import-progress-text').textContent = pct + '%';
    if (text) document.getElementById('import-status').textContent = text;
  }

  function showImportError(msg) {
    document.getElementById('import-progress').classList.add('hidden');
    document.getElementById('import-error').classList.remove('hidden');
    document.getElementById('import-error-text').textContent = msg;
  }

  function hideImportError() {
    document.getElementById('import-error').classList.add('hidden');
  }

  function openImportModal() { document.getElementById('import-modal').classList.remove('hidden'); hideImportError();
    document.getElementById('import-progress').classList.add('hidden'); }
  function closeImportModal() { document.getElementById('import-modal').classList.add('hidden'); }
  function openPreviewModal() { document.getElementById('preview-modal').classList.remove('hidden'); }
  function closePreviewModal() { document.getElementById('preview-modal').classList.add('hidden'); }

  // --- File parsing ---
  async function parseFileText(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'txt') return await file.text();
    if (ext === 'csv') return await file.text();
    if (ext === 'pdf') return await parsePDF(file);
    if (ext === 'docx') return await parseDOCX(file);
    throw new Error('Unsupported file type: .' + ext);
  }

  async function parsePDF(file) {
    const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
    const buf = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
  }

  async function parseDOCX(file) {
    const mammoth = await import('https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js');
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  }

  // --- Entity extraction ---
  function tryParseDate(str) {
    str = str.trim();
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      /^(\w+)\s+(\d{1,2}),?\s*(\d{4})$/i,
      /^(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)\s+(\d{4})$/i,
      /^(\w+)\s+(\d{4})$/i
    ];
    for (const rx of formats) {
      const m = str.match(rx);
      if (!m) continue;
      if (rx === formats[5]) return new Date(Date.parse(m[1] + ' 1, ' + m[2]));
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  function findDatesInText(text) {
    const dateRx = /(\d{1,2}\/\d{1,2}\/\d{4})|(\d{4}-\d{1,2}-\d{1,2})|(\d{1,2}-\d{1,2}-\d{4})|(\w+\s+\d{1,2},?\s*\d{4})|(\d{1,2}(?:st|nd|rd|th)?\s+\w+\s+\d{4})/gi;
    const dates = [];
    const seen = new Set();
    let match;
    while ((match = dateRx.exec(text)) !== null) {
      const raw = match[0].trim();
      const parsed = tryParseDate(raw);
      if (parsed && !seen.has(raw.toLowerCase())) {
        seen.add(raw.toLowerCase());
        dates.push({ raw, date: parsed });
      }
    }
    return dates;
  }

  function extractEntities(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const foundDates = findDatesInText(text);

    // Heuristic: detect exam names
    const examKeywords = /(exam|test|final|midterm|assessment|quiz|board|paper|evaluation|examination|semester|term[- ]?end)/i;
    const knownSubjects = ['math','mathematics','physics','chemistry','biology','english','history','geography','economics','computer','science','literature','art','music','physical education','pe','social studies','civics','geology','astronomy','psychology','sociology','philosophy','statistics','algebra','geometry','calculus','trigonometry','botany','zoology','biochemistry','ecology','genetics','anatomy','physiology','immunology','microbiology','pathology','pharmacology','neuroscience','organic','inorganic','physical chemistry','electrochemistry','thermodynamics','quantum','mechanics','electromagnetism','optics','waves','nuclear','particle','fluid','solid','circuit','signal','programming','algorithm','data structure','database','network','operating system','software engineering','web development','machine learning','artificial intelligence','deep learning','natural language','computer vision','robotics','cybersecurity','cryptography','blockchain','cloud computing','devops','accounting','finance','marketing','management','law','political science','anthropology','linguistics','archaeology'];
    const knownSubjectSet = new Set(knownSubjects);

    // Phase 1: identify exam blocks
    const exams = [];
    let currentExam = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Is this line an exam header?
      const isExamLine = examKeywords.test(line) || /^\d{1,2}\s*\.?\s*(final|midterm|exam|test)/i.test(line);

      if (isExamLine && line.length < 120) {
        // Find nearest date
        const lineDate = foundDates.find(d => Math.abs(text.indexOf(line) - text.indexOf(d.raw)) < 200);
        // Also look ahead up to 3 lines for a date
        let date = lineDate ? lineDate.date : null;
        if (!date) {
          for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
            const d = tryParseDate(lines[j]);
            if (d) { date = d; break; }
          }
        }
        if (!date && foundDates.length === 1) date = foundDates[0].date;
        const examName = line.replace(/^\d{1,2}\s*\.?\s*/, '').replace(/[:\-–].*$/, '').replace(/\s+/g, ' ').trim().slice(0, 60);
        currentExam = { name: examName, date, subjects: [], raw: true };
        exams.push(currentExam);
      }
    }

    // Fallback: if no exams detected, create one from found dates
    if (exams.length === 0 && foundDates.length > 0) {
      for (const fd of foundDates) {
        exams.push({ name: 'Exam ' + (exams.length + 1), date: fd.date, subjects: [], raw: true });
      }
    }
    if (exams.length === 0) {
      exams.push({ name: 'My Exam', date: addDays(new Date(), 30), subjects: [], raw: true });
    }

    // Phase 2: detect subjects and topics
    const allTopics = [];
    let currentSubject = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip lines that look like exam headers or dates
      if (examKeywords.test(line) && line.length < 80) continue;
      if (tryParseDate(line)) continue;
      if (line.length < 2) continue;

      // Check if it looks like a subject header
      const lower = line.toLowerCase();
      const isSubject = knownSubjectSet.has(lower) ||
        knownSubjects.some(s => lower.startsWith(s) || lower.includes(s + ' ') || lower.includes(s + ':') || lower.includes(s + ' —')) ||
        /^(chapter|module|unit|section|part|week)\s+\d+/i.test(line) ||
        /^[A-Z][a-z]+(\s+[A-Z][a-z]+){0,3}$/.test(line) && line.length < 50 && !line.endsWith('.') && !line.endsWith('?');

      if (isSubject && line.length < 60) {
        currentSubject = line.replace(/:\s*$/, '').trim();
        if (!currentSubject) continue;
        continue;
      }

      // Detect topic
      const topicLine = line.replace(/^[-–•·*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
      if (topicLine.length > 1 && topicLine.length < 120 && !examKeywords.test(line)) {
        const difficulty = topicLine.length > 40 ? 4 : topicLine.length > 20 ? 3 : 2;
        allTopics.push({
          topic: topicLine,
          subject: currentSubject || 'General',
          difficulty,
          confidence: 1,
          targetExam: exams[0]
        });
      }
    }

    // Map subjects to exams
    const subjectPerExam = {};
    // Distribute subjects across exams
    const uniqueSubjects = [...new Set(allTopics.map(t => t.subject))];
    uniqueSubjects.forEach((s, si) => {
      const examIdx = si % exams.length;
      subjectPerExam[s] = exams[examIdx];
    });
    allTopics.forEach(t => {
      t.targetExam = subjectPerExam[t.subject] || exams[0];
    });

    return { exams, topics: allTopics };
  }

  // --- Preview & confirm ---
  function renderPreview(data) {
    const body = document.getElementById('preview-body');
    let html = '';

    // Exam cards
    data.exams.forEach((exam, ei) => {
      const dateStr = exam.date ? exam.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Not detected';
      html += `<div class="preview-exam-card bg-canvas-soft-2/30 rounded-xl border border-hairline/20 p-3">
        <div class="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-violet-500 shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <input class="preview-edit-input text-xs font-extrabold text-ink flex-1" data-exam-idx="${ei}" data-field="name" value="${exam.name}" />
          <span class="extracted-tag ${exam.raw ? '' : 'weak'}">${exam.raw ? 'Detected' : 'Estimated'}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-ink/40 w-16 shrink-0">Date</span>
          <input class="preview-edit-input text-xs text-ink flex-1" data-exam-idx="${ei}" data-field="date" value="${dateStr}" placeholder="e.g. 06/15/2026" />
        </div>
      </div>`;
    });

    // Subjects & Topics
    const subjects = {};
    data.topics.forEach(t => {
      if (!subjects[t.subject]) subjects[t.subject] = [];
      subjects[t.subject].push(t);
    });

    html += `<div class="mt-2">
      <div class="flex items-center gap-2 mb-2">
        <h4 class="text-xs font-extrabold text-ink">Subjects & Topics</h4>
        <span class="text-[9px] text-ink/40">${data.topics.length} topics across ${Object.keys(subjects).length} subjects</span>
      </div>`;

    Object.entries(subjects).forEach(([subj, topics]) => {
      html += `<div class="bg-canvas-soft-2/20 rounded-xl border border-hairline/10 p-2.5 mb-2">
        <div class="flex items-center gap-2 mb-1.5">
          <input class="preview-edit-input text-[10px] font-bold text-ink flex-1 max-w-[200px]" data-subject="${subj}" value="${subj}" placeholder="Subject name" />
          <span class="text-[9px] text-ink/40">${topics.length} topics</span>
        </div>
        <div class="space-y-1">${topics.map((t, ti) => `<div class="preview-topic-row flex items-center gap-1.5 p-1 rounded-lg">
          <span class="text-[9px] text-ink/40 w-4 shrink-0 text-right">${ti+1}</span>
          <input class="preview-edit-input text-[10px] text-ink flex-1" data-topic="${t.topic}" value="${t.topic}" placeholder="Topic name" />
          <select class="preview-edit-input text-[10px] text-ink w-16 shrink-0" data-topic-diff="${t.topic}">
            <option value="2" ${t.difficulty===2?'selected':''}>Easy</option>
            <option value="3" ${t.difficulty===3?'selected':''}>Medium</option>
            <option value="4" ${t.difficulty===4?'selected':''}>Hard</option>
            <option value="5" ${t.difficulty===5?'selected':''}>Expert</option>
          </select>
        </div>`).join('')}</div>
      </div>`;
    });

    html += `</div>`;
    body.innerHTML = html;
  }

  function collectPreviewData() {
    const exams = [];
    document.querySelectorAll('#preview-body [data-exam-idx]').forEach(input => {
      const ei = parseInt(input.dataset.examIdx);
      if (!exams[ei]) exams[ei] = {};
      if (input.dataset.field === 'name') exams[ei].name = input.value;
      if (input.dataset.field === 'date') exams[ei].dateStr = input.value;
    });

    // Collect topics from the DOM structure
    const topics = [];
    const subjectBlocks = document.querySelectorAll('#preview-body [data-subject]');
    subjectBlocks.forEach(subjInput => {
      const subjName = subjInput.value;
      const block = subjInput.closest('.rounded-xl.border');
      if (!block) return;
      const rows = block.querySelectorAll('.preview-topic-row');
      rows.forEach(row => {
        const tInput = row.querySelector('[data-topic]');
        const diffSelect = row.querySelector('[data-topic-diff]');
        if (tInput && tInput.value.trim()) {
          topics.push({ topic: tInput.value.trim(), subject: subjName, difficulty: parseInt(diffSelect ? diffSelect.value : '3'), confidence: 1 });
        }
      });
    });

    // Fallback: if subjectBlocks empty, try linear scan
    if (subjectBlocks.length === 0) {
      document.querySelectorAll('#preview-body .preview-topic-row').forEach(row => {
        const tInput = row.querySelector('[data-topic]');
        const diffSelect = row.querySelector('[data-topic-diff]');
        if (tInput && tInput.value.trim()) {
          topics.push({ topic: tInput.value.trim(), subject: 'General', difficulty: parseInt(diffSelect ? diffSelect.value : '3'), confidence: 1 });
        }
      });
    }

    // Map dates
    exams.forEach((e, ei) => {
      if (e && e.dateStr) {
        const parsed = tryParseDate(e.dateStr);
        e.date = parsed || addDays(new Date(), 30);
      } else if (exams[ei]) {
        exams[ei].date = addDays(new Date(), 30);
      }
    });

    return { exams: exams.filter(Boolean), topics };
  }

  async function handleImportFile(file) {
    hideImportError();
    document.getElementById('import-progress').classList.remove('hidden');
    setProgress(10, 'Reading file\u2026');
    window.__importFileName = file.name;

    try {
      const text = await parseFileText(file);
      setProgress(50, 'Extracting exams, subjects, and topics\u2026');

      const data = extractEntities(text);
      setProgress(80, 'Preparing preview\u2026');

      // Deduplicate topics
      const seen = new Set();
      data.topics = data.topics.filter(t => {
        const key = t.topic.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Limit to reasonable count
      if (data.topics.length > 80) data.topics = data.topics.slice(0, 80);
      if (data.exams.length > 10) data.exams = data.exams.slice(0, 10);
      if (data.exams.length === 0) data.exams.push({ name: 'My Exam', date: addDays(new Date(), 30), raw: true });

      setProgress(100, 'Ready for review');
      setTimeout(() => {
        closeImportModal();
        renderPreview(data);
        window.__importData = data;
        openPreviewModal();
      }, 400);
    } catch (err) {
      console.error('Import error:', err);
      showImportError(err.message || 'Could not parse this file. Make sure it contains text content.');
    }
  }

  // --- Wire UI ---
  document.getElementById('import-btn')?.addEventListener('click', openImportModal);
  document.getElementById('import-modal-backdrop')?.addEventListener('click', closeImportModal);
  document.getElementById('import-modal-close')?.addEventListener('click', closeImportModal);
  document.getElementById('preview-modal-backdrop')?.addEventListener('click', closePreviewModal);
  document.getElementById('preview-modal-close')?.addEventListener('click', closePreviewModal);
  document.getElementById('preview-cancel')?.addEventListener('click', closePreviewModal);

  // Drag-and-drop visual feedback
  const dropZone = document.getElementById('drop-zone');
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(evt => {
      dropZone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('drop-zone-dragover'); });
    });
    ['dragleave', 'drop'].forEach(evt => {
      dropZone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('drop-zone-dragover'); });
    });
  }

  // File input change
  document.getElementById('file-input')?.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      handleImportFile(this.files[0]);
      this.value = '';
    }
  });

  // Confirm preview
  document.getElementById('preview-confirm')?.addEventListener('click', function() {
    const data = window.__importData;
    if (!data) return;
    const cleaned = collectPreviewData();
    const importFileName = window.__importFileName || 'file';

    // Populate planner
    state.exams = cleaned.exams.map(e => ({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(), name: e.name, date: e.date }));
    state.subjects = [];
    const subjMap = {};
    cleaned.topics.forEach(t => {
      const exam = state.exams.find(e => e.name === t.subject) || state.exams[0];
      if (!subjMap[t.subject]) {
        const subjId = crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random();
        subjMap[t.subject] = { id: subjId, name: t.subject, targetExam: exam.id, topics: [] };
        state.subjects.push(subjMap[t.subject]);
      }
      subjMap[t.subject].topics.push({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(), name: t.topic, difficulty: t.difficulty, confidence: t.confidence || 1 });
    });

    closePreviewModal();
    initDefaults();
    setupDaysOff();

    // Auto-scroll to generate button and flash it
    document.querySelector('.max-w-\\[1200px\\]').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const stepBtn = document.getElementById('generate-step-btn');
    if (stepBtn && !stepBtn.classList.contains('hidden')) {
      stepBtn.style.transform = 'scale(1.05)';
      setTimeout(() => { stepBtn.style.transform = ''; }, 300);
    }

    // Show toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-canvas border border-emerald-500/30 shadow-lg shadow-emerald-500/5 rounded-xl p-3 px-4 flex items-center gap-2 text-xs font-bold text-emerald-600 modal-overlay';
    toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ${cleaned.topics.length} topics imported from ${importFileName}. Click "Build My Study Plan" to generate your plan.`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(() => toast.remove(), 500); }, 4000);
  });

  // Drop event
  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImportFile(files[0]);
    }
  });

  // Keyboard: close modals on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeImportModal();
      closePreviewModal();
    }
  });

  // Custom Hours Input Buttons
  const hoursInput = document.getElementById('hours-per-day');
  const hoursDisplay = document.getElementById('hours-display-val');
  document.getElementById('hours-minus-btn')?.addEventListener('click', () => {
    let val = parseInt(hoursInput.value) || 4;
    if (val > 1) {
      val--;
      hoursInput.value = val;
      hoursDisplay.textContent = val;
      hoursInput.dispatchEvent(new Event('input'));
    }
  });
  document.getElementById('hours-plus-btn')?.addEventListener('click', () => {
    let val = parseInt(hoursInput.value) || 4;
    if (val < 16) {
      val++;
      hoursInput.value = val;
      hoursDisplay.textContent = val;
      hoursInput.dispatchEvent(new Event('input'));
    }
  });

  // Setup banner import button
  document.getElementById('setup-banner-import-btn')?.addEventListener('click', openImportModal);

  // Hero CTA buttons
  document.getElementById('hero-generate-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('.max-w-\\[1200px\\]').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => document.getElementById('add-exam-btn')?.click(), 400);
  });
  document.getElementById('hero-planner-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('planner-kit-cta-btn')?.click();
  });

  function renderStudyPlan(tab = 'today') {
    
    activePlanTab = tab;
    
    const tabs = document.querySelectorAll('.study-plan-tab');
    tabs.forEach(btn => {
      const btnTab = btn.getAttribute('data-tab') || btn.dataset.tab;
      if (btnTab === tab) {
        btn.classList.add('bg-violet-600', 'text-white');
        btn.classList.remove('text-ink/60', 'hover:text-ink');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('bg-violet-600', 'text-white');
        btn.classList.add('text-ink/60', 'hover:text-ink');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    const container = document.getElementById('study-plan-content');
    if (!container) return;
    
    if (!state.schedule || state.schedule.length === 0) {
      container.innerHTML = `<div class="text-center py-4 text-xs text-ink/50 italic">Your daily breakdown appears after you generate your plan.</div>`;
      return;
    }

    const today = new Date(); today.setHours(0,0,0,0);
    const todayTime = today.getTime();
    const todayStr = formatDate(today);

    const totalScheduledTopics = state.schedule.reduce((acc, d) => acc + d.slots.length, 0);
    const completedScheduledCount = state.schedule.reduce((acc, d) => {
      return acc + d.slots.filter(t => state.completedTopics.has(`${t.subject}::${t.topic}`)).length;
    }, 0);

    const oneWeekLater = addDays(today, 7);
    const oneWeekTime = oneWeekLater.getTime();
    const currentWeekDays = state.schedule.filter(d => {
      const dDate = d.date instanceof Date ? d.date : new Date(d.date);
      if (!dDate || isNaN(dDate.getTime())) return false;
      const checkDate = new Date(dDate);
      checkDate.setHours(0,0,0,0);
      const checkTime = checkDate.getTime();
      return checkTime >= todayTime && checkTime < oneWeekTime;
    });

    const slotIndexMap = new Map();
    let idx = 0;
    state.schedule.forEach(day => {
      day.slots.forEach(slot => {
        slotIndexMap.set(`${slot.subject}::${slot.topic}`, idx++);
      });
    });

    const milestone25 = Math.floor(totalScheduledTopics * 0.25);
    const milestone50 = Math.floor(totalScheduledTopics * 0.50);
    const milestone75 = Math.floor(totalScheduledTopics * 0.75);
    const milestone100 = totalScheduledTopics - 1;

    let filtered = [];
    if (tab === 'today') {
      filtered = state.schedule.filter(d => {
        const dDate = parseAsDate(d.date);
        return dDate ? formatDate(dDate) === todayStr : false;
      });
    } else if (tab === 'week') {
      filtered = currentWeekDays;
    } else {
      filtered = state.schedule;
    }

    if (filtered.length === 0) {
      const msg = tab === 'today' ? 'No study sessions scheduled for today. Enjoy your day off!' : 
                  tab === 'week' ? 'No study sessions scheduled for this week.' : 'No study sessions scheduled.';
      container.innerHTML = `<div class="text-center py-6 text-xs text-emerald-600 font-semibold italic bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl">${msg}</div>`;
      return;
    }

    // Pre-compute which filtered days contain milestones (only unlocked)
    const dayMilestones = new Map();
    filtered.forEach((day, di) => {
      const ms = [];
      day.slots.forEach(slot => {
        const key = `${slot.subject}::${slot.topic}`;
        const globalIdx = slotIndexMap.get(key);
        if (totalScheduledTopics >= 4) {
          if (globalIdx === milestone25 && completedScheduledCount >= Math.floor(totalScheduledTopics * 0.25))
            ms.push({ threshold: 25 });
          if (globalIdx === milestone50 && completedScheduledCount >= Math.floor(totalScheduledTopics * 0.50))
            ms.push({ threshold: 50 });
          if (globalIdx === milestone75 && completedScheduledCount >= Math.floor(totalScheduledTopics * 0.75))
            ms.push({ threshold: 75 });
          if (globalIdx === milestone100 && completedScheduledCount === totalScheduledTopics)
            ms.push({ threshold: 100 });
        }
      });
      if (ms.length > 0) dayMilestones.set(di, ms);
    });

    // Priority border helper
    function priBorder(score) {
      if (score >= 14) return 'border-l-rose-500/60';
      if (score >= 10) return 'border-l-amber-500/60';
      if (score >= 7) return 'border-l-blue-500/60';
      return 'border-l-emerald-500/60';
    }

    // Build compact timeline
    let html = `<div class="relative my-1">`;
    // Timeline line centered at 11px (center of 22px dots)
    html += `<div class="absolute left-[10px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>`;

    html += filtered.map((day, di) => {
      const dDate = parseAsDate(day.date) || new Date();
      const isToday = formatDate(dDate) === todayStr;
      const dateHeader = isToday ? 'Today' : friendlyDate(dDate);
      const dayFullyCompleted = day.slots.length > 0 && day.slots.every(slot => state.completedTopics.has(`${slot.subject}::${slot.topic}`));

      // ── Empty day: collapsed single line ──
      if (day.slots.length === 0) {
        const dow = dDate.getDay();
        const isDayOff = state.daysOff?.has(dow);
        let msg, iconSvg;
        if (isDayOff) {
          msg = 'Rest Day';
          iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
        } else if (dow === 0 || dow === 6) {
          msg = 'Weekend';
          iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/></svg>';
        } else {
          msg = 'Buffer Day';
          iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>';
        }
        return `<div class="flex items-center gap-3 py-1.5">
          <div class="w-[22px] h-[22px] rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-canvas shrink-0 relative z-10 flex items-center justify-center text-slate-300 dark:text-zinc-700">${iconSvg}</div>
          <div class="flex-1 flex items-center justify-between min-w-0">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-xs font-bold text-ink/60">${dateHeader}</span>
              <span class="text-[9px] font-medium text-ink/30">${msg}</span>
            </div>
          </div>
        </div>`;
      }

      // ── Day with tasks ──
      const dotColor = isToday ? 'bg-violet-500 ring-[3px] ring-violet-500/20' : 
                       dayFullyCompleted ? 'bg-emerald-500 ring-[3px] ring-emerald-500/20' : 
                       'bg-slate-400 dark:bg-zinc-600';
      
      const slotsHtml = day.slots.map(t => {
        const key = `${t.subject}::${t.topic}`;
        const isChecked = state.completedTopics.has(key);
        const pri = getPri(t.priorityScore);
        const estMin = [0, 15, 20, 25, 35, 45][t.difficulty] || 25;
        
        const priDot = pri.cls.split(' ')[0].replace('/10', '/50');
        
        return `<label class="flex items-center gap-2 p-2 rounded-lg cursor-pointer select-none border transition-all ${isChecked ? 'border-emerald-500/20 bg-emerald-500/[0.02] border-l-emerald-500/40' : 'border-transparent hover:bg-canvas-soft-2/50 border-l-[3px] ' + priBorder(t.priorityScore)}">
          <input type="checkbox" class="task-checkbox w-3.5 h-3.5 rounded border-hairline text-violet-600 focus:ring-violet-500 cursor-pointer shrink-0" data-key="${key}" ${isChecked ? 'checked' : ''} />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-[8px] font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-wider">${t.subject}</span>
              ${t.isRevision ? '<span class="text-[7px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-full">Rev</span>' : ''}
            </div>
            <div class="text-[11px] font-bold text-ink leading-tight mt-0.5 ${isChecked ? 'line-through text-ink/40' : ''}">${toMission(t.topic, t.subject)}</div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[8px] font-medium text-ink/40">${estMin}m</span>
            <span class="w-[6px] h-[6px] rounded-full ${priDot}"></span>
          </div>
        </label>`;
      }).join('');

      // Unlocked milestone indicators for this day
      const dayMsHtml = (dayMilestones.get(di) || [])
        .map(m => {
          const labels = { 25: '25% Complete', 50: 'Halfway There', 75: 'Almost There', 100: 'All Done!' };
          const colors = { 25: 'text-violet-600 border-violet-500/20 bg-violet-500/5', 50: 'text-indigo-600 border-indigo-500/20 bg-indigo-500/5', 75: 'text-purple-600 border-purple-500/20 bg-purple-500/5', 100: 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5' };
          const icons = {
            25: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            50: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>',
            75: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 8 6 8 9m8 0h1.5a2.5 2.5 0 0 0 0-5C17 4 16 6 16 9"/><path d="M9 13h6"/><path d="M12 22h-4v-5a4 4 0 0 1 8 0v5z"/></svg>',
            100: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
          };
          return `<div class="flex items-center gap-1.5 px-2 py-1 rounded-lg border ${colors[m.threshold]} my-1">
            <span class="shrink-0">${icons[m.threshold] || ''}</span>
            <span class="text-[8px] font-bold uppercase tracking-wider">${labels[m.threshold] || ''}</span>
          </div>`;
        }).join('');

      return `<div class="relative pt-0.5">
        <div class="flex items-start gap-2.5">
          <div class="w-[22px] h-[22px] rounded-full ${dotColor} shrink-0 relative z-10 mt-0.5 transition-all"></div>
          <div class="flex-1 min-w-0 pb-1.5">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-extrabold text-ink">${dateHeader}</span>
                ${isToday ? '<span class="text-[7px] font-bold text-violet-600 bg-violet-500/10 dark:bg-violet-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Now</span>' : ''}
              </div>
              <span class="text-[8px] font-medium text-ink/40">${day.slots.length} topic${day.slots.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="space-y-0.5">
              ${slotsHtml}
            </div>
            ${dayMsHtml ? `<div class="mt-1">${dayMsHtml}</div>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', function() {
        const key = this.getAttribute('data-key');
        if (this.checked) {
          state.completedTopics.add(key);
        } else {
          state.completedTopics.delete(key);
        }
        localStorage.setItem('ss_completed_topics', JSON.stringify(Array.from(state.completedTopics)));
        triggerDashboardRefresh();
      });
    });
  }

  function triggerDashboardRefresh() {
    const today = new Date(); today.setHours(0,0,0,0);
    const exams = state.exams.filter(e => e.name.trim() && e.date && !isNaN(parseAsDate(e.date)?.getTime())).sort((a,b) => parseAsDate(a.date).getTime() - parseAsDate(b.date).getTime());
    if (exams.length > 0) {
      _renderDashboard(exams, today);
    }
  }

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Script load error: ' + url));
      document.head.appendChild(script);
    });
  }

  function showToast(msg, type) {
    const existing = document.querySelector('.planner-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'planner-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl p-3 px-5 flex items-center gap-2.5 text-xs font-bold shadow-lg modal-overlay';
    const isError = type === 'error';
    toast.style.background = isError ? '#fef2f2' : '#f0fdf4';
    toast.style.color = isError ? '#dc2626' : '#16a34a';
    toast.style.border = isError ? '1px solid #fecaca' : '1px solid #bbf7d0';
    const icon = isError ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    toast.innerHTML = `<span style="width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;background:${isError ? '#dc2626' : '#16a34a'};color:#fff;">${icon}</span> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 500); }, 4000);
  }

  // ===== PDF GENERATION OVERLAY =====
  function showPdfProgressOverlay() {
    const overlay = document.getElementById('pdf-progress-overlay');
    if (overlay) overlay.classList.remove('hidden');
    const btns = [document.getElementById('download-pdf-btn'), document.getElementById('download-planner-kit-btn')];
    btns.forEach(b => { if (b) b.disabled = true; });
  }
  function hidePdfProgressOverlay() {
    const overlay = document.getElementById('pdf-progress-overlay');
    if (overlay) overlay.classList.add('hidden');
    const btns = [document.getElementById('download-pdf-btn'), document.getElementById('download-planner-kit-btn')];
    btns.forEach(b => { if (b) b.disabled = false; });
  }
  function updatePdfProgress(pct, currentPage, totalPages, label) {
    const bar = document.getElementById('pdf-progress-bar');
    const pctEl = document.getElementById('pdf-progress-pct');
    const labelEl = document.getElementById('pdf-progress-label');
    const pageEl = document.getElementById('pdf-progress-page');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    if (labelEl) labelEl.textContent = label || 'Generating PDF\u2026';
    if (pageEl) pageEl.textContent = 'Page ' + currentPage + ' of ' + totalPages;
  }

  async function downloadPDF() {
    showPdfProgressOverlay();
    const totalPages = 3;

    try {
      updatePdfProgress(5, 1, totalPages, 'Preparing template\u2026');
      const today = new Date(); today.setHours(0,0,0,0);
      const todayStr = formatDate(today);
      const activeExams = state.exams.filter(e => e.name.trim() && e.date && !isNaN(parseAsDate(e.date)?.getTime())).sort((a,b) => parseAsDate(a.date).getTime() - parseAsDate(b.date).getTime());

      // Toggle Empty State vs Active Plan Layout
      const hasPlan = state.schedule.length > 0;
      if (!hasPlan) {
        document.getElementById('pdf-empty-walkthrough-card').style.display = 'block';
        document.getElementById('pdf-today-plan-card').style.display = 'none';
        document.getElementById('pdf-columns-container').style.display = 'none';
        const pdfBottomRow = document.getElementById('pdf-bottom-row');
        if (pdfBottomRow) pdfBottomRow.style.display = 'none';
      } else {
        document.getElementById('pdf-empty-walkthrough-card').style.display = 'none';
        document.getElementById('pdf-today-plan-card').style.display = 'flex';
        document.getElementById('pdf-columns-container').style.display = 'flex';
        const pdfBottomRow = document.getElementById('pdf-bottom-row');
        if (pdfBottomRow) pdfBottomRow.style.display = 'flex';
      }

      // Progress Chart Card Visibility
      const hasLogs = state.logHistory && state.logHistory.length > 0;
      const progressCard = document.getElementById('pdf-progress-card-p2');
      if (progressCard) {
        progressCard.style.display = hasLogs ? 'flex' : 'none';
      }
      
      // Basic Info
      const pdfGenDate = document.getElementById('pdf-gen-date');
      if (pdfGenDate) pdfGenDate.textContent = friendlyDate(today);
      document.getElementById('pdf-student-name').textContent = state.studentName || '___________';
      document.getElementById('pdf-target-exam').textContent = activeExams.length > 0 ? activeExams[0].name : '___________';
      document.getElementById('pdf-exam-date').textContent = activeExams.length > 0 ? friendlyDate(activeExams[0].date) : '___________';
      
      // Countdown
      const countdownVal = activeExams.length > 0 ? daysBetween(today, activeExams[0].date) : 0;
      document.getElementById('pdf-countdown-val').textContent = Math.max(0, countdownVal);
      
      // Readiness Score & Level
      const scoreEl = document.getElementById('readiness-score');
      const scoreText = scoreEl ? scoreEl.textContent : '0%';
      const rawLevelText = document.getElementById('readiness-level')?.textContent || 'Needs Work';
      
      let printLevelText = rawLevelText;
      if (rawLevelText === 'Excellent' || rawLevelText === 'High') {
        printLevelText = 'Ready to Conquer! <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 16h14v3H5z"/></svg>';
      } else if (rawLevelText === 'Moderate' || rawLevelText === 'Medium') {
        printLevelText = 'Aiming High! <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>';
      } else {
        printLevelText = 'Keep Pushing! <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="M21.174 6.812a2 2 0 1 0-2.986-2.987 2 2 0 0 0 2.986 2.987z"/></svg>';
      }
      
      document.getElementById('pdf-readiness-score').textContent = scoreText;
      document.getElementById('pdf-readiness-level').innerHTML = printLevelText;

      // Update Conic Gradient Donut Chart
      const val = parseInt(scoreText) || 0;
      const readinessDonut = document.getElementById('pdf-readiness-donut');
      if (readinessDonut) {
        readinessDonut.style.background = `conic-gradient(#7c3aed 0% ${val}%, #f1f5f9 ${val}% 100%)`;
      }

      // Streak
      const streakEl = document.getElementById('streak-count');
      const streakCount = streakEl ? streakEl.textContent : '0';
      const pdfStreakValEl = document.getElementById('pdf-streak-val');
      if (pdfStreakValEl) pdfStreakValEl.textContent = streakCount;

      const streakVal = parseInt(streakCount) || 0;
      let streakRewardText = 'Keep it going! <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
      if (streakVal >= 5) {
        streakRewardText = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> Unlocked: Focus Master Badge!';
      } else if (streakVal >= 3) {
        streakRewardText = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063A2 2 0 0 0 14.063 15.5l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg> Unlocked: Bronze Scholar Theme!';
      } else if (streakVal > 0) {
        streakRewardText = `Next Reward: 3-Day Streak! (${3 - streakVal} left)`;
      }
      const pdfStreakRewardEl = document.getElementById('pdf-streak-reward');
      if (pdfStreakRewardEl) pdfStreakRewardEl.innerHTML = streakRewardText;

      // Streak Next Milestone
      const streakNextEl = document.getElementById('pdf-streak-next');
      if (streakNextEl) {
        if (streakVal >= 7) {
          streakNextEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> Legend status — keep it up!';
        } else {
          const nextMilestone = streakVal < 3 ? 3 : streakVal < 5 ? 5 : 7;
          streakNextEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> ' + (nextMilestone - streakVal) + ' more day' + (nextMilestone - streakVal === 1 ? '' : 's') + ' to ' + (nextMilestone === 3 ? 'Bronze' : nextMilestone === 5 ? 'Silver' : 'Gold');
        }
      }

      const totalScheduledTopics = state.schedule.reduce((acc, d) => acc + d.slots.length, 0);
      const completedScheduledCount = state.schedule.reduce((acc, d) => {
        return acc + d.slots.filter(t => state.completedTopics.has(`${t.subject}::${t.topic}`)).length;
      }, 0);

      // XP Calculation for PDF
      const xpFromCompleted = completedScheduledCount * 10;
      const xpFromStreak = streakVal * 5;
      const currentXp = xpFromCompleted + xpFromStreak;
      const xpForNextLevel = 100;
      const currentLevel = Math.floor(currentXp / xpForNextLevel) + 1;
      const xpInLevel = currentXp % xpForNextLevel;
      const xpBarEl = document.getElementById('pdf-xp-bar');
      if (xpBarEl) xpBarEl.style.width = `${Math.min(100, (xpInLevel / xpForNextLevel) * 100)}%`;
      const xpTextEl = document.getElementById('pdf-xp-text');
      if (xpTextEl) xpTextEl.textContent = `${xpInLevel} / ${xpForNextLevel} XP`;

      const levelEl = document.getElementById('pdf-study-level');
      if (levelEl) {
        const levelNames = ['Scholar <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>', 'Thinker <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-3.22-3.22A2.5 2.5 0 0 1 4.5 12a2.5 2.5 0 0 1-2.18-3.72 2.5 2.5 0 0 1 3.22-3.22A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 3.22-3.22A2.5 2.5 0 0 0 19.5 12a2.5 2.5 0 0 0 2.18-3.72 2.5 2.5 0 0 0-3.22-3.22A2.5 2.5 0 0 0 14.5 2z"/></svg>', 'Hero ⚡', 'Champion <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 16h14v3H5z"/></svg>', 'Legend <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'];
        const lvlName = levelNames[Math.min(currentLevel - 1, levelNames.length - 1)] || 'Scholar <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
        levelEl.innerHTML = `<span>Level ${currentLevel}: ${lvlName}</span>`;
      }

      // Sticky Note handwritten text customization
      const stickyTextEl = document.getElementById('pdf-sticky-text');
      if (stickyTextEl) {
        const name = state.studentName || 'Champion';
        const firstName = name.split(' ')[0];
        if (streakVal >= 5) {
          stickyTextEl.innerHTML = `${firstName},<br><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> Unstoppable!`;
        } else if (streakVal >= 3) {
          stickyTextEl.innerHTML = `${firstName},<br><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg> Locked In!`;
        } else if (completedScheduledCount >= 5) {
          stickyTextEl.innerHTML = `${firstName},<br><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-3.22-3.22A2.5 2.5 0 0 1 4.5 12a2.5 2.5 0 0 1-2.18-3.72 2.5 2.5 0 0 1 3.22-3.22A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 3.22-3.22A2.5 2.5 0 0 0 19.5 12a2.5 2.5 0 0 0 2.18-3.72 2.5 2.5 0 0 0-3.22-3.22A2.5 2.5 0 0 0 14.5 2z"/></svg> Deep Focus!`;
        } else {
          stickyTextEl.innerHTML = `${firstName},<br><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063A2 2 0 0 0 14.063 15.5l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg> Let's go!`;
        }
      }

      // XP Card: show level number + weekly hours in XP text
      const weeklyHours = state.schedule.slice(0, 7).reduce((acc, d) => acc + d.slots.length, 0);
      const totalXp = completedScheduledCount * 10 + streakVal * 5;
      const dfLevel = Math.floor(totalXp / 100) + 1;
      const pdfProgressTimeEl = document.getElementById('pdf-progress-time');
      if (pdfProgressTimeEl) pdfProgressTimeEl.textContent = `Lv ${dfLevel}`;

      // Top Priorities (Actual user top topics by low confidence or alphabetical)
      const topPrioritiesEl = document.getElementById('pdf-top-priorities');
      if (topPrioritiesEl) {
        const sortedTopics = [...state.allTopics].sort((a,b) => (a.confidence || 0) - (b.confidence || 0));
        const topTopics = sortedTopics.slice(0, 3);
        if (topTopics.length > 0) {
          topPrioritiesEl.innerHTML = topTopics.map(t => {
            return `
              <div style="display: flex; align-items: flex-start; gap: 4px; line-height: 1.4;">
                <span style="display: inline-flex; width: 10px; height: 10px; border-radius: 50%; background: #7c3aed; color: #ffffff; font-size: 7px; align-items: center; justify-content: center; font-weight: 900; flex-shrink: 0;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                <span>${toMission(t.topic, t.subject)}</span>
              </div>
            `;
          }).join('');
        } else {
          topPrioritiesEl.innerHTML = `<div style="color: #94a3b8; font-style: italic;">No topics yet</div>`;
        }
      }

      // Today's header date
      const todayPlan = state.schedule.find(d => formatDate(d.date) === todayStr) || (state.schedule.length > 0 ? state.schedule[0] : null);
      const pdfTodayHeader = document.getElementById('pdf-today-header');

      // Daily Schedule Card Visibility (collapse if no tasks scheduled today)
      const scheduleCard = document.getElementById('pdf-schedule-card');
      if (scheduleCard) {
        scheduleCard.style.display = (todayPlan && todayPlan.slots.length > 0) ? 'flex' : 'none';
      }
      if (todayPlan) {
        pdfTodayHeader.textContent = friendlyDate(todayPlan.date);
      } else {
        pdfTodayHeader.textContent = friendlyDate(today);
      }

      // Today's Checklist
      const pdfTodayChecklist = document.getElementById('pdf-today-checklist');
      let pctToday = 0;
      if (todayPlan && todayPlan.slots.length > 0) {
        const checklistSlots = todayPlan.slots;
        let checklistHtml = checklistSlots.map(t => {
          const isCompleted = state.completedTopics.has(`${t.subject}::${t.topic}`);
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 7px; border: 1.2px solid #e2e8f0; border-radius: 8px; background: #fafaf9; font-size: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; gap: 5px; flex: 1;">
                <span style="color: #7c3aed; font-size: 12px; flex-shrink: 0; font-weight: bold; line-height: 1.3;">${isCompleted ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><polyline points="8 12 11 15 16 9"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>'}</span>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-weight: 800; color: #1e293b; line-height: 1.4; word-break: break-word;">${toMission(t.topic, t.subject)}</span>
                  <span style="font-size: 6px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 1px; line-height: 1.3;">${t.subject}</span>
                </div>
              </div>
              <span style="font-size: 7px; font-weight: 800; background-color: #f5f3ff; color: #7c3aed; padding: 2px 5px; border-radius: 3px; flex-shrink: 0; border: 0.8px solid #ddd6fe; margin-left: 5px; line-height: 1.3;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 1h</span>
            </div>
          `;
        }).join('');
        const completedToday = todayPlan.slots.filter(t => state.completedTopics.has(`${t.subject}::${t.topic}`)).length;
        pctToday = Math.round((completedToday / todayPlan.slots.length) * 100);
        
        if (pctToday === 100) {
          checklistHtml = `
            <div style="grid-column: span 2; background: #f0fdf4; border: 2px dashed #bbf7d0; border-radius: 12px; padding: 8px 12px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 4px; box-sizing: border-box;">
              <div style="font-size: 14px; margin-bottom: 2px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 8 6 8 9m8 0h1.5a2.5 2.5 0 0 0 0-5C17 4 16 6 16 9M9 13h6m-3 9h-4v-5a4 4 0 0 1 8 0v5z"/></svg><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 19 18 12 15 5 18 8 12 1 7 8 7 12 2 16 7 23 7"/></svg></div>
              <div style="font-family: 'Fredoka', sans-serif; font-size: 9.5px; font-weight: 900; color: #15803d; letter-spacing: 0.2px;">DAILY MISSION ACCOMPLISHED!</div>
              <div style="font-size: 7.5px; color: #166534; font-weight: 700; margin-top: 3px; line-height: 1.3;">
                You crushed every single study topic scheduled for today! Your consistency is unstoppable. Take a well-deserved rest! <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              </div>
            </div>
          ` + checklistHtml;
        }
        if (pdfTodayChecklist) pdfTodayChecklist.innerHTML = checklistHtml;
        
        const compEl = document.getElementById('pdf-today-completion');
        if (compEl) compEl.textContent = `${pctToday}%`;
        const goalEl = document.getElementById('pdf-today-goal-hours');
        if (goalEl) goalEl.textContent = `Daily Goal: ${todayPlan.slots.length}h 00m`;
      } else {
        if (pdfTodayChecklist) pdfTodayChecklist.innerHTML = `<div style="grid-column: span 2; color: #94a3b8; font-size: 9px; font-style: italic; padding: 0.5rem 0; text-align: center;">Generate your plan to see today's study sessions</div>`;
        const compEl = document.getElementById('pdf-today-completion');
        if (compEl) compEl.textContent = '—';
        const goalEl = document.getElementById('pdf-today-goal-hours');
        if (goalEl) goalEl.textContent = 'No goal set';
      }

      // Today's mission count and earned XP
      const pdfTodayCountEl = document.getElementById('pdf-today-count');
      const pdfTodayEarnedXpEl = document.getElementById('pdf-today-earned-xp');
      if (todayPlan && todayPlan.slots.length > 0) {
        const completedToday = todayPlan.slots.filter(t => state.completedTopics.has(`${t.subject}::${t.topic}`)).length;
        if (pdfTodayCountEl) pdfTodayCountEl.textContent = `${completedToday}/${todayPlan.slots.length} tasks`;
        const todayXp = completedToday * 10;
        if (pdfTodayEarnedXpEl) pdfTodayEarnedXpEl.textContent = `+${todayXp} XP today`;
      } else {
        if (pdfTodayCountEl) pdfTodayCountEl.textContent = `0 tasks`;
        if (pdfTodayEarnedXpEl) pdfTodayEarnedXpEl.textContent = `+0 XP today`;
      }

      // Today's Progress Bar
      const pdfTodayProgressBar = document.getElementById('pdf-today-progress-bar');
      if (pdfTodayProgressBar) {
        pdfTodayProgressBar.style.width = `${pctToday}%`;
      }

      // Dynamic Top Tip from real recommendations triggers
      const recs = [];
      const totalTopicsCount = state.allTopics.length;
      const studiedTopicsCount = state.allTopics.filter(t => t.studied).length;
      const avgConfVal = state.allTopics.length > 0 ? state.allTopics.reduce((s,t) => s + (t.confidence||1), 0) / state.allTopics.length : 0;
      
      if (totalTopicsCount > 0 && studiedTopicsCount / totalTopicsCount < 0.3) {
        recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', text: "You've covered less than 30% of topics. Try 2 short sessions today to build momentum." });
      } else if (studiedTopicsCount === totalTopicsCount && avgConfVal < 3) {
        recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>', text: "All topics started! Now deepen them — re-study low-confidence topics to boost your average." });
      }
      const lowConfCount = state.allTopics.filter(t => t.confidence < 2).length;
      if (lowConfCount >= 2) {
        recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', text: `${lowConfCount} topics need attention (confidence < 2). Focus on these to improve your score most.` });
      }
      const nearExamList = activeExams.filter(e => daysBetween(today, e.date) <= 3 && daysBetween(today, e.date) >= 0);
      if (nearExamList.length > 0) {
        recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>', text: `${nearExamList[0].name} is in ${daysBetween(today, nearExamList[0].date)} day${daysBetween(today, nearExamList[0].date)>1?'s':''}! Focus on review over new material.` });
      }
      if (state.streakData.count > 0) {
        recs.push({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>', text: `${state.streakData.count}-day study streak! Keep the flame burning today.` });
      }
      
      const defaultTipText = "Focus on understanding concepts, not just memorizing. Practice makes perfect!";
      const selectedTip = recs.length > 0 ? recs[0] : { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>', text: defaultTipText };
      
      const tipIconEl = document.getElementById('pdf-tip-icon-p2');
      const tipTextEl = document.getElementById('pdf-tip-text-p2');
      if (tipIconEl && tipTextEl) {
        tipIconEl.innerHTML = selectedTip.icon;
        tipTextEl.textContent = selectedTip.text;
      }

      // (habits grid removed — part of Planner Kit workbook)

      // Daily Schedule: blank fillable rows (hardcoded in HTML)
      // Weekly Overview Grid: blank fillable cards (hardcoded in HTML)
      // Milestones: blank fillable list (hardcoded in HTML)

      // Revision Tracker: blank 10 fillable rows (hardcoded in template)

      // Daily Win text (based on today's completion)
      const pdfDailyWinEl = document.getElementById('pdf-daily-win-text-p2');
      if (pdfDailyWinEl) {
        if (pctToday === 100) {
          pdfDailyWinEl.innerHTML = 'All missions complete! You crushed today! <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
        } else if (pctToday >= 50) {
          pdfDailyWinEl.innerHTML = 'More than halfway there! Keep pushing! <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="M21.174 6.812a2 2 0 1 0-2.986-2.987 2 2 0 0 0 2.986 2.987z"/></svg>';
        } else if (pctToday > 0) {
          pdfDailyWinEl.innerHTML = 'Progress made! Stay consistent! <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
        } else {
          pdfDailyWinEl.textContent = 'Complete today\'s missions to claim your win!';
        }
      }

      // Reward badge and text
      const pdfRewardTextEl = document.getElementById('pdf-reward-text-p2');
      const pdfRewardBadgeEl = document.getElementById('pdf-reward-badge-p2');
      if (pdfRewardBadgeEl) {
        const rewardXp = completedScheduledCount * 10 + streakVal * 5;
        pdfRewardBadgeEl.textContent = `+${rewardXp}`;
      }
      if (pdfRewardTextEl) {
        const rewardMessages = [
          'Keep showing up and the XP will stack up!',
          'Hit 100% today for a bonus multiplier!',
          'Earn XP and unlock new achievements!',
          'Every session brings you closer to your goal!'
        ];
        const todayIdx = new Date().getDate();
        pdfRewardTextEl.textContent = rewardMessages[todayIdx % rewardMessages.length];
      }

      // 3. Balance layout: fill remaining space with dynamic lines
      void document.getElementById('planner-pdf-template').offsetHeight;
      await new Promise(r => setTimeout(r, 50));

      // Generate Weekly Focus rows (5-8 writing lines with checkboxes)
      const weeklyFocusRows = document.getElementById('pdf-weekly-focus-rows-p2');
      if (weeklyFocusRows) {
        const weeklyCard = weeklyFocusRows.closest('div');
        if (weeklyCard) {
          const availH = weeklyCard.offsetHeight;
          const headerH = 22;
          const gridEl = weeklyCard.querySelector('#pdf-weekly-grid-p2');
          const gridH = gridEl ? gridEl.offsetHeight : 18;
          const focusHeaderH = 18;
          const padding = 16;
          const remaining = Math.max(60, availH - headerH - gridH - focusHeaderH - padding);
          const rowH = 15;
          let rowCount = Math.floor(remaining / rowH);
          rowCount = Math.max(5, Math.min(rowCount, 8));
          let html = '';
          for (let i = 0; i < rowCount; i++) {
            html += '<div style="display: flex; align-items: center; gap: 2px;"><span style="font-size: 7px; color: #94a3b8; flex-shrink: 0;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></span><div style="flex: 1; border-bottom: 1px dashed #94a3b8; height: 9px;"></div></div>';
          }
          weeklyFocusRows.innerHTML = html;
        }
      }

      // Fill lines per card (removed — workbook elements moved to Planner Kit)

      const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
      const pdf = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      function setProgress(label) {
        const pi = label.includes('1') ? 1 : label.includes('2') ? 2 : label.includes('3') ? 3 : 0;
        updatePdfProgress(Math.round((pi / totalPages) * 90), pi, totalPages, label);
      }

      // Helper: capture a single template element as PDF page
      async function captureTemplateElement(el) {
        if (!el) return null;
        el.style.position = 'absolute';
        el.style.left = '0';
        el.style.top = '0';
        el.offsetHeight;
        await new Promise(r => requestAnimationFrame(r));
        const canvas = await window.html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#fdfbf7',
          logging: false
        });
        el.style.position = 'fixed';
        el.style.left = '-9999px';
        el.style.top = '0';
        return canvas;
      }

      function addCanvasToPdf(canvasEl) {
        if (!canvasEl || canvasEl.width === 0 || canvasEl.height === 0) return;
        const imgData = canvasEl.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
      }

      // Capture Page 1
      setProgress('Rendering page 1 of 3\u2026');
      const page1El = document.getElementById('planner-pdf-template');
      const page1Canvas = await captureTemplateElement(page1El);
      if (!page1Canvas) throw new Error('Failed to capture Page 1');
      addCanvasToPdf(page1Canvas);

      // Capture Page 2
      setProgress('Rendering page 2 of 3\u2026');
      const page2El = document.getElementById('planner-page-2');
      if (page2El) {
        const page2Canvas = await captureTemplateElement(page2El);
        if (page2Canvas) {
          pdf.addPage();
          addCanvasToPdf(page2Canvas);
        }
      }

      // Capture Revision page (single fixed page, 10 blank rows)
      setProgress('Rendering page 3 of 3\u2026');
      const revEl = document.getElementById('planner-revision-template');
      if (revEl) {
        pdf.addPage();
        const revCanvas = await captureTemplateElement(revEl);
        if (revCanvas) addCanvasToPdf(revCanvas);
      }

      updatePdfProgress(95, totalPages, totalPages, 'Saving PDF\u2026');

      const studentName = state.studentName || 'student';
      const examName = activeExams.length > 0 ? activeExams[0].name.replace(/[\s]+/g, '_') : 'study_plan';
      pdf.save(`${examName}_${studentName.replace(/[\s]+/g, '_')}_${formatDate(new Date())}.pdf`);
    } catch (err) {
      console.error(err);
      showToast('Could not generate study plan PDF. Please try again.', 'error');
    } finally {
      updatePdfProgress(100, totalPages, totalPages, 'Done!');
      setTimeout(hidePdfProgressOverlay, 600);
    }
  }

  function populatePlannerRows() {
    // Cover page: keep all fields blank (fillable by hand)
    // Quote: rotate daily for variety but keep it premium
    const quotes = [
      ['"Success is the sum of small efforts repeated every day."', '— Robert Collier'],
      ['"The secret of getting ahead is getting started."', '— Mark Twain'],
      ['"Believe you can, and you are halfway there."', '— Theodore Roosevelt'],
      ['"Small daily improvements lead to stunning results."', '— Robin Sharma'],
      ['"The future belongs to those who prepare for it today."', '— Malcolm X']
    ];
    const quoteIdx = Math.abs(new Date().toDateString().split(' ').reduce((a, c) => a + c.charCodeAt(0), 0)) % quotes.length;
    const coverQuote = document.getElementById('pk-cover-quote');
    const coverAuthor = document.getElementById('pk-cover-quote-author');
    if (coverQuote) coverQuote.textContent = quotes[quoteIdx][0];
    if (coverAuthor) coverAuthor.textContent = quotes[quoteIdx][1];

    // Page 2: Weekly grid (7 day columns with 12 writing lines each)
    const days = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
    const grid = document.getElementById('pk-weekly-grid');
    if (grid) {
      grid.innerHTML = days.map(d => `
        <div style="border: 2px solid #e2e8f0; border-radius: 16px; background: #ffffff; display: flex; flex-direction: column; overflow: hidden;">
          <div style="background: #f5f3ff; padding: 6px 4px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <span style="font-family: 'Fredoka', sans-serif; font-size: 11px; font-weight: 900; color: #7c3aed;">${d}</span>
          </div>
          <div style="flex: 1; padding: 6px; display: flex; flex-direction: column; gap: 3px;">
            ${Array(12).fill('<div style="border-bottom: 1px dashed #94a3b8; flex: 1;"></div>').join('')}
          </div>
          <div style="padding: 4px 6px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; gap: 4px; background: #fafaf9;">
            <span style="font-size: 10px; color: #7c3aed; font-weight: 800;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></span>
            <span style="font-size: 7px; color: #94a3b8; font-weight: 600;">Done</span>
          </div>
        </div>
      `).join('');
    }
    // Weekly goals + priorities
    const goalsEl = document.getElementById('pk-weekly-goals');
    if (goalsEl) goalsEl.innerHTML = Array(3).fill('<div style="display: flex; align-items: center; gap: 6px;"><span style="font-size: 14px; color: #7c3aed;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></span><div style="border-bottom: 1.5px dashed #e2e8f0; flex: 1; height: 16px;"></div></div>').join('');
    const priEl = document.getElementById('pk-weekly-priorities');
    if (priEl) priEl.innerHTML = [1,2,3].map(n => `<div style="display: flex; align-items: center; gap: 6px;"><span style="font-size: 8px; font-weight: 900; color: #7c3aed; width: 14px; height: 14px; border-radius: 50%; background: #f5f3ff; display: flex; align-items: center; justify-content: center;">${n}</span><div style="border-bottom: 1.5px dashed #e2e8f0; flex: 1; height: 16px;"></div></div>`).join('');

    // Page 3: Daily planner rows
    const goalEl = document.getElementById('pk-daily-goal');
    if (goalEl) goalEl.innerHTML = Array(5).fill('<div style="border-bottom: 1.5px dashed #e2e8f0; height: 18px;"></div>').join('');
    const dpriEl = document.getElementById('pk-daily-priorities');
    if (dpriEl) dpriEl.innerHTML = [1,2,3].map(n => `<div style="display: flex; align-items: center; gap: 6px;"><span style="font-size: 14px; color: #7c3aed;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></span><span style="font-size: 8px; font-weight: 800; color: #7c3aed; width: 14px;">P${n}</span><div style="border-bottom: 1.5px dashed #e2e8f0; flex: 1; height: 16px;"></div></div>`).join('');
    const schedEl = document.getElementById('pk-daily-schedule');
    if (schedEl) schedEl.innerHTML = ['7:00','8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'].map(t => `
      <div style="display: flex; align-items: center; border-bottom: 1px dashed #94a3b8; flex: 1; min-height: 0;">
        <span style="font-size: 7px; font-weight: 700; color: #94a3b8; width: 28px; flex-shrink: 0;">${t}</span>
        <div style="flex: 1; height: 100%;"></div>
        <span style="font-size: 8px; color: #cbd5e1;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></span>
      </div>
    `).join('');
    const notesEl = document.getElementById('pk-daily-notes');
    if (notesEl) notesEl.innerHTML = Array(3).fill('<div style="border-bottom: 1.5px dashed #fde68a; height: 16px;"></div>').join('');

    // Page 4: Revision tracker (10 blank rows)
    const revEl = document.getElementById('pk-revision-rows');
    if (revEl) revEl.innerHTML = Array(10).fill(`
      <div style="display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 1fr; border-bottom: 1px dashed #94a3b8; flex: 1; min-height: 0; align-items: center;">
        <div style="padding: 0 14px; border-right: 1px dashed #e2e8f0; display: flex; align-items: center; height: 100%;">
          <div style="border-bottom: 1px dashed #94a3b8; width: 100%;"></div>
        </div>
        ${Array(5).fill('<div style="text-align: center; display: flex; align-items: center; justify-content: center; height: 100%; border-right: 1px dashed #e2e8f0;"><span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #cbd5e1; border-radius: 50%;"></span></div>').join('')}
      </div>
    `).join('');

    // Page 5: Habit tracker (10 blank writing rows — student fills their own habits)
    const habitsEl = document.getElementById('pk-habits-rows');
    if (habitsEl) habitsEl.innerHTML = Array(10).fill().map((_, i) => `
      <div style="display: grid; grid-template-columns: 1.8fr repeat(7, 1fr) 0.8fr; border-bottom: 1px dashed #94a3b8; flex: 1; min-height: 0; align-items: center;">
        <div style="padding: 0 14px; display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 8px; font-weight: 700; color: #94a3b8; width: 12px;">${i+1}.</span>
          <div style="border-bottom: 1.5px dashed #cbd5e1; flex: 1; height: 14px;"></div>
        </div>
        ${Array(7).fill('<div style="text-align: center; display: flex; align-items: center; justify-content: center; height: 100%;"><span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #cbd5e1; border-radius: 3px;"></span></div>').join('')}
        <div style="text-align: center; display: flex; align-items: center; justify-content: center; height: 100%;">
          <span style="font-size: 9px; font-weight: 800; color: #7c3aed;">/7</span>
        </div>
      </div>
    `).join('');

    // Page 6: Countdown section rows
    const focusEl = document.getElementById('pk-countdown-focus');
    if (focusEl) focusEl.innerHTML = Array(4).fill('<div style="display: flex; align-items: center; gap: 6px;"><span style="font-size: 12px; color: #7c3aed;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></span><div style="border-bottom: 1.5px dashed #e2e8f0; flex: 1; height: 18px;"></div></div>').join('');
    const challengeEl = document.getElementById('pk-countdown-challenge');
    if (challengeEl) challengeEl.innerHTML = Array(2).fill('<div style="border-bottom: 1.5px dashed #fecaca; height: 20px;"></div>').join('');
    const actionEl = document.getElementById('pk-countdown-action');
    if (actionEl) actionEl.innerHTML = Array(3).fill('<div style="display: flex; align-items: center; gap: 6px;"><span style="font-size: 12px; color: #16a34a;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></span><div style="border-bottom: 1.5px dashed #bbf7d0; flex: 1; height: 16px;"></div></div>').join('');

    // Page 7: Notes lines (40 dashed rows)
    const notesLinesEl = document.getElementById('pk-notes-lines');
    if (notesLinesEl) notesLinesEl.innerHTML = Array(40).fill('<div style="border-bottom: 1px dashed #94a3b8; flex: 1; min-height: 0; display: flex; align-items: center;"><span style="font-size: 6px; color: #cbd5e1; width: 20px; text-align: right; padding-right: 6px;"></span></div>').join('');
  }

  async function downloadPlannerKit() {
    showPdfProgressOverlay();
    const totalPages = 7;

    updatePdfProgress(3, 1, totalPages, 'Loading scripts\u2026');

    try {
      if (!window.html2canvas) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      }
      if (!window.jspdf?.jsPDF) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }

      const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
      const pdf = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      populatePlannerRows();

      const pageIds = ['planner-cover', 'planner-weekly', 'planner-daily', 'planner-revision', 'planner-habits', 'planner-countdown', 'planner-notes'];

      const pdfContainer = document.createElement('div');
      pdfContainer.id = 'pdf-render-container';
      pdfContainer.style.cssText = 'position: fixed; left: -99999px; top: 0; width: 800px; pointer-events: none;';
      document.body.appendChild(pdfContainer);

      for (let pi = 0; pi < pageIds.length; pi++) {
        const el = document.getElementById(pageIds[pi]);
        if (!el) continue;

        updatePdfProgress(Math.round(((pi + 1) / totalPages) * 90), pi + 1, totalPages, 'Rendering page\u2026');

        const clone = el.cloneNode(true);
        clone.style.position = 'static';
        clone.style.left = 'auto';
        clone.style.top = 'auto';
        clone.style.right = 'auto';
        clone.style.bottom = 'auto';
        clone.style.transform = 'none';
        pdfContainer.appendChild(clone);

        await new Promise(r => requestAnimationFrame(r));

        const canvas = await window.html2canvas(clone, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#fdfbf7'
        });

        pdfContainer.removeChild(clone);

        if (pi > 0) pdf.addPage();
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
      }

      document.body.removeChild(pdfContainer);

      updatePdfProgress(95, totalPages, totalPages, 'Saving PDF\u2026');

      const studentName = state.studentName || 'student';
      pdf.save(`planner_kit_${studentName.replace(/[\s]+/g, '_')}_${formatDate(new Date())}.pdf`);
    } catch (err) {
      console.error(err);
      showToast('Could not generate planner kit PDF. Please try again.', 'error');
    } finally {
      updatePdfProgress(100, totalPages, totalPages, 'Done!');
      setTimeout(hidePdfProgressOverlay, 600);
    }
  }

  setupDaysOff();
  updateSetupProgress(); updateGenerateStatus();
})();
