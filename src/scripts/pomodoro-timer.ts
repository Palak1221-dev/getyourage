  const DEFAULT_WORK = 25;
  const DEFAULT_SHORT = 5;
  const DEFAULT_LONG = 15;
  const DEFAULT_GOAL = 4;
  const GREETINGS = ["Whenever you're ready.", "One block at a time.", "You're here — that's enough.", "Small steps add up.", "Be kind to yourself today."];
  const WARM_ENCOURAGEMENTS = ["Showing up is how things get built.", "Steady and present — that's the way.", "No need to be perfect. Just be here.", "You don't need a perfect plan. Just start.", "Be kind to yourself. This is enough.", "One focus block can change your day.", "You're doing better than you think."];

  const FOCUS_INSIGHTS = [
    "🌱 Small progress still counts. Showing up is what matters.",
    "☕ One focused block is enough to shift your day.",
    "📚 Consistency beats intensity every time.",
    "✍️ Done is better than perfect. Start before you're ready.",
    "🎯 A clear intention changes everything. Name what you want to accomplish.",
    "💡 Your mind needs rest to focus deeply. Breaks aren't weakness.",
    "🔥 Motivation follows action. Start, and the energy will come.",
    "🌿 You don't need to be productive all day. A few good blocks are enough.",
  ];

  const QUICK_START_TEMPLATES = ['Study', 'Writing', 'Coding', 'Reading'];

  let currentMode: 'pomodoro' | 'short' | 'long' = 'pomodoro';
  let timeLeft = DEFAULT_WORK * 60;
  let totalDuration = DEFAULT_WORK * 60;
  let isRunning = false;
  let timerInterval: number | null = null;
  let currentTask = '';
  let pendingOutcomeDuration = 0;

  const timerDisplay = document.getElementById('timer-display');
  const timerStatusText = document.getElementById('timer-status-text');
  const progressRing = document.getElementById('timer-progress-ring') as unknown as SVGCircleElement;
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnReset = document.getElementById('btn-reset');
  const btnSkip = document.getElementById('btn-skip');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const modePomodoro = document.getElementById('mode-pomodoro');
  const modeShort = document.getElementById('mode-short');
  const modeLong = document.getElementById('mode-long');
  const taskInput = document.getElementById('task-input') as HTMLInputElement;
  const taskInputContainer = document.getElementById('task-input-container');
  const activeTaskContainer = document.getElementById('active-task-container');
  const activeTaskName = document.getElementById('active-task-name');
  const btnCompleteTask = document.getElementById('btn-complete-task');
  const toggleSound = document.getElementById('toggle-sound') as HTMLInputElement;
  const toggleNotifications = document.getElementById('toggle-notifications') as HTMLInputElement;
  const toggleAutostart = document.getElementById('toggle-autostart') as HTMLInputElement;
  const btnToggleSettings = document.getElementById('btn-toggle-settings');
  const settingsPanel = document.getElementById('settings-panel');
  const settingsWork = document.getElementById('settings-work') as HTMLInputElement;
  const settingsShort = document.getElementById('settings-short') as HTMLInputElement;
  const settingsLong = document.getElementById('settings-long') as HTMLInputElement;
  const settingsGoal = document.getElementById('settings-goal') as HTMLInputElement;
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const btnResetDurations = document.getElementById('btn-reset-durations');
  const statSessions = document.getElementById('stat-sessions');
  const statGoalTotal = document.getElementById('stat-goal-total');
  const statGoalBar = document.getElementById('stat-goal-bar');
  const statGoalPercentage = document.getElementById('stat-goal-percentage');
  const statStreak = document.getElementById('stat-streak');
  const statLongestStreak = document.getElementById('stat-longest-streak');
  const statFocusScore = document.getElementById('stat-focus-score');
  const focusScoreLabel = document.getElementById('focus-score-label');
  const statTotalTime = document.getElementById('stat-total-time');
  const goalDotsContainer = document.getElementById('goal-dots-container');
  const historyEmpty = document.getElementById('history-empty');
  const historyList = document.getElementById('history-list');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const recentTasksContainer = document.getElementById('recent-tasks-container');
  const recentTasksList = document.getElementById('recent-tasks-list');
  const dashSessions = document.getElementById('dash-sessions');
  const dashStreak = document.getElementById('dash-streak');
  const dashScore = document.getElementById('dash-score');
  const dashCompletion = document.getElementById('dash-completion');
  const dashBestStreak = document.getElementById('dash-best-streak');
  const dashTotalTime = document.getElementById('dash-total-time');
  const dashGoalBar = document.getElementById('dash-goal-bar');
  const dashEncouragement = document.getElementById('dash-encouragement');
  const timerPhase = document.getElementById('timer-phase');
  const timerPhaseContainer = document.getElementById('timer-phase-container');
  const timerPulse = document.getElementById('timer-pulse');
  const timerRingContainer = document.getElementById('timer-ring-container');
  const intentionCard = document.getElementById('intention-card');
  const intentionText = document.getElementById('intention-text');
  const statGoalNumber = document.getElementById('stat-goal-number');
  const statGoalNumberSide = document.getElementById('stat-goal-number-side');
  const weeklyConsistency = document.getElementById('weekly-consistency');
  const totalSessionsAll = document.getElementById('total-sessions-all');
  const totalHoursAll = document.getElementById('total-hours-all');
  const milestoneText = document.getElementById('milestone-text');
  const insightPrimeTime = document.getElementById('insight-prime-time');
  const insightTrend = document.getElementById('insight-trend');
  const insightActivity = document.getElementById('insight-activity');
  const achievementsContainer = document.getElementById('achievements-container');
  const sessionCounterText = document.getElementById('session-counter-text');
  const sessionTypeText = document.getElementById('session-type-text');
  const heroMotivation = document.getElementById('hero-motivation');
  const activeTaskFooter = document.getElementById('active-task-footer');
  const progressDailyCount = document.getElementById('progress-daily-count');
  const progressDailyPct = document.getElementById('progress-daily-pct');
  const progressDailyBar = document.getElementById('progress-daily-bar');
  const progressDailyText = document.getElementById('progress-daily-text');
  const progressStreakCount = document.getElementById('progress-streak-count');
  const progressStreakText = document.getElementById('progress-streak-text');
  const progressBestCount = document.getElementById('progress-best-count');
  const progressBestText = document.getElementById('progress-best-text');
  const progressWeeklyPct = document.getElementById('progress-weekly-pct');
  const progressWeeklyText = document.getElementById('progress-weekly-text');
  const progressRecentList = document.getElementById('progress-recent-list');
  const progressAchievements = document.getElementById('progress-achievements');
  const progressRecentBadge = document.getElementById('progress-recent-badge');

  // Focus Mode elements
  const focusModeOverlay = document.getElementById('focus-mode-overlay');
  const focusModeTimer = document.getElementById('focus-mode-timer');
  const focusModeTask = document.getElementById('focus-mode-task');
  const focusModeStatus = document.getElementById('focus-mode-status');
  const focusModeProgress = document.getElementById('focus-mode-progress');
  const focusModePause = document.getElementById('focus-mode-pause');
  const focusModePlay = document.getElementById('focus-mode-play');
  const focusModeExit = document.getElementById('focus-mode-exit');
  const btnFocusMode = document.getElementById('btn-focus-mode');

  // New elements
  const taskAddInput = document.getElementById('task-add-input') as HTMLInputElement;
  const taskAddBtn = document.getElementById('task-add-btn');
  const tasksList = document.getElementById('tasks-list');
  const tasksEmpty = document.getElementById('tasks-empty');
  const tasksCount = document.getElementById('tasks-count');
  const statTasks = document.getElementById('stat-tasks');
  const tasksCompletedSub = document.getElementById('tasks-completed-sub');
  const activeTaskContext = document.getElementById('active-task-context');
  const activeTaskContextName = document.getElementById('active-task-context-name');
  const sessionCounterDisplay = document.getElementById('session-counter-display');
  const taskEstimationText = document.getElementById('task-estimation-text');
  const taskEstimationBar = document.getElementById('task-estimation-bar');
  const taskEstimationPct = document.getElementById('task-estimation-pct');
  const outcomeModal = document.getElementById('outcome-modal');
  const outcomeModalTask = document.getElementById('outcome-modal-task');
  const btnOutcomeCompleted = document.getElementById('btn-outcome-completed');
  const btnOutcomePartial = document.getElementById('btn-outcome-partial');
  const btnOutcomeNotcompleted = document.getElementById('btn-outcome-notcompleted');
  const dailyTimelineContent = document.getElementById('daily-timeline-content');
  const timelineBadge = document.getElementById('timeline-badge');
  const activityFeedContent = document.getElementById('activity-feed-content');
  const activityFeedBadge = document.getElementById('activity-feed-badge');
  const focusScoreLabelFallback = document.getElementById('focus-score-label-fallback');
  const analyticsCompletionRate = document.getElementById('analytics-completion-rate');
  const analyticsCompletionLabel = document.getElementById('analytics-completion-label');
  const analyticsBestPeriod = document.getElementById('analytics-best-period');

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getTodayInsightIndex = () => {
    const stored = sessionStorage.getItem('pomodoro_insight_idx');
    if (stored !== null) return parseInt(stored, 10) % FOCUS_INSIGHTS.length;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % FOCUS_INSIGHTS.length;
  };

  const playChime = () => {
    if (toggleSound && !toggleSound.checked) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.50, now + 0.1);
      gain2.gain.setValueAtTime(0.15, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.error('Audio play failed:', e);
    }
  };

  const triggerNotification = (title: string, body: string) => {
    if (toggleNotifications && toggleNotifications.checked && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.svg' });
      } catch (err) {
        console.error('Desktop notification failed:', err);
      }
    }
  };

  const MOTIVATIONAL_POOL = [
    { threshold: 0.9, messages: ['You\'re doing it. One step at a time.', 'Right where you need to be.', 'This is how progress feels.'], color: 'text-link/60' },
    { threshold: 0.7, messages: ['You\'ve found your rhythm. Keep going.', 'Steady and calm. That\'s the way.', 'You\'re building something real.'], color: 'text-sky-500' },
    { threshold: 0.5, messages: ['Halfway. You\'ve already done so much.', 'The hardest part is showing up — you did that.', 'Look how far you\'ve come.'], color: 'text-amber-500' },
    { threshold: 0.3, messages: ['Almost there. Just a little further.', 'You\'ve got more left in you.', 'The finish line is closer than it feels.'], color: 'text-orange-500' },
    { threshold: 0.05, messages: ['So close now. You\'ve got this.', 'One last gentle push.', 'You\'re about to complete something.'], color: 'text-red-500' },
  ];

  let lastMsgIndex = -1;

  const updatePhase = (progress: number) => {
    if (!timerPhase) return;
    const completed = progress <= 0.01;
    if (completed) {
      timerPhase.textContent = 'Well done!';
      timerPhase.className = 'text-sm font-bold text-green-500 transition-colors duration-500';
      timerPhase.classList.remove('opacity-0');
      return;
    }
    const tier = MOTIVATIONAL_POOL.find(p => progress >= p.threshold) || MOTIVATIONAL_POOL[MOTIVATIONAL_POOL.length - 1];
    let pick: number;
    do {
      pick = Math.floor(Math.random() * tier.messages.length);
    } while (pick === lastMsgIndex && tier.messages.length > 1);
    lastMsgIndex = pick;
    timerPhase.textContent = tier.messages[pick];
    timerPhase.className = `text-sm font-semibold ${tier.color} transition-colors duration-500`;
    timerPhase.classList.remove('opacity-0');
  };

  const togglePulse = (running: boolean) => {
    if (!timerPulse || !timerRingContainer) return;
    if (running) {
      timerPulse.classList.remove('hidden');
      timerRingContainer.classList.add('animate-ring-pulse');
    } else {
      timerPulse.classList.add('hidden');
      timerRingContainer.classList.remove('animate-ring-pulse');
    }
  };

  const RING_COLORS = [
    { threshold: 0.8, cls: 'text-link' },
    { threshold: 0.6, cls: 'text-sky-500' },
    { threshold: 0.4, cls: 'text-amber-500' },
    { threshold: 0.2, cls: 'text-orange-500' },
    { threshold: 0.01, cls: 'text-red-500' },
  ];

  const updateRingColor = (progress: number) => {
    if (!progressRing) return;
    const tier = RING_COLORS.find(c => progress >= c.threshold) || RING_COLORS[RING_COLORS.length - 1];
    progressRing.setAttribute('class', `${tier.cls} transition-all duration-1000 ease-linear`);
    const filterEl = progressRing.getAttribute('filter');
    if (filterEl && isRunning) {
      progressRing.setAttribute('filter', 'url(#ring-glow)');
    }
  };

  const triggerCelebration = () => {
    const container = document.getElementById('celebration-container');
    if (!container) return;
    container.classList.remove('hidden');
    const colors = ['bg-link', 'bg-amber-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400', 'bg-sky-400', 'bg-orange-400'];
    for (let i = 0; i < 18; i++) {
      const particle = document.createElement('span');
      const angle = (i / 18) * 360;
      const rad = (angle * Math.PI) / 180;
      const dist = 20 + Math.random() * 30;
      particle.style.setProperty('--x', `${Math.cos(rad) * dist}px`);
      particle.style.setProperty('--y', `${Math.sin(rad) * dist}px`);
      particle.className = `celebration-particle ${colors[i % colors.length]}`;
      particle.style.animationDelay = `${Math.random() * 0.15}s`;
      particle.style.animationDuration = `${0.7 + Math.random() * 0.4}s`;
      container.appendChild(particle);
    }
    setTimeout(() => {
      container.classList.add('hidden');
      container.innerHTML = '';
    }, 1500);
  };

  const updateIntentionCard = () => {
    if (!intentionCard || !intentionText) return;
    const task = taskInput ? taskInput.value.trim() : '';
    const activeTask = activeTaskName ? activeTaskName.textContent : '';
    const displayTask = task || (activeTask !== 'Focus session' ? activeTask : '') || '';
    if (displayTask) {
      intentionText.textContent = `Finish: ${displayTask}`;
    } else {
      intentionText.textContent = 'Set a focus intention for this session';
    }
  };

  const calculateWeeklyConsistency = () => {
    const historyJson = localStorage.getItem('pomodoro_history') || '[]';
    let history = [];
    try { history = JSON.parse(historyJson); } catch (e) { history = []; }
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const daysWithSessions = new Set<string>();
    history.forEach((s: any) => {
      const sessionDate = new Date(s.date + ' ' + (s.time || ''));
      if (sessionDate >= monday && sessionDate <= now) {
        daysWithSessions.add(sessionDate.toDateString());
      }
    });
    const daysElapsed = Math.max(1, dayOfWeek === 0 ? 7 : dayOfWeek);
    const ratio = Math.min(1, daysWithSessions.size / daysElapsed);
    return Math.round(ratio * 100);
  };

  const getMilestoneCount = () => {
    const total = parseInt(localStorage.getItem('pomodoro_total_sessions') || '0');
    return Math.floor(total / 10);
  };

  const updateFocusJourney = () => {
    const total = parseInt(localStorage.getItem('pomodoro_total_sessions') || '0');
    const totalMins = parseInt(localStorage.getItem('pomodoro_total_minutes') || '0');
    const hours = Math.round(totalMins / 60);
    if (totalSessionsAll) totalSessionsAll.textContent = total.toString();
    if (totalHoursAll) totalHoursAll.textContent = hours.toString();
    if (milestoneText) {
      const allMilestones = [
        { label: 'First Steps', check: (s: number, m: number) => s >= 1 },
        { label: '10 Sessions', check: (s: number, m: number) => s >= 10 },
        { label: '5 Hours In', check: (s: number, m: number) => m >= 300 },
        { label: '25 Sessions', check: (s: number, m: number) => s >= 25 },
        { label: '10 Hours In', check: (s: number, m: number) => m >= 600 },
        { label: '50 Sessions', check: (s: number, m: number) => s >= 50 },
        { label: '25 Hours In', check: (s: number, m: number) => m >= 1500 },
        { label: '100 Sessions', check: (s: number, m: number) => s >= 100 },
        { label: '50 Hours In', check: (s: number, m: number) => m >= 3000 },
      ];
      const earned = allMilestones.filter(m => m.check(total, totalMins));
      const unearned = allMilestones.filter(m => !m.check(total, totalMins));
      const slice = earned.length > 3 ? earned.slice(-3) : earned;
      const next = unearned.length > 0 ? [unearned[0]] : [];
      const items = [...slice, ...next];
      milestoneText.innerHTML = items.map(m => {
        const done = m.check(total, totalMins);
        return `<div class="flex items-center gap-1.5 text-[10px]"><span class="${done ? 'text-green-500' : 'text-hairline'} text-xs shrink-0">${done ? '✓' : '○'}</span><span class="${done ? 'text-ink font-medium' : 'text-mute'}">${m.label}</span></div>`;
      }).join('');
    }
  };

  const generateInsight = () => {
    const historyJson = localStorage.getItem('pomodoro_history') || '[]';
    let history: any[] = [];
    try { history = JSON.parse(historyJson); } catch (e) { history = []; }
    const total = parseInt(localStorage.getItem('pomodoro_total_sessions') || '0');
    const fmtHour = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:00 ${period}`;
    };
    const getWeekStart = (d: Date) => {
      const s = new Date(d);
      const day = s.getDay();
      s.setDate(s.getDate() - (day === 0 ? 6 : day - 1));
      s.setHours(0, 0, 0, 0);
      return s;
    };

    if (insightPrimeTime) {
      if (history.length === 0) {
        insightPrimeTime.textContent = 'Begin a session to discover your rhythm';
      } else {
        const hourCounts: Record<number, number> = {};
        history.forEach((s: any) => {
          const t = s.time || '';
          const m = t.match(/(\d+):\d+\s*(AM|PM)/i);
          if (m) {
            let h = parseInt(m[1]);
            if (m[2].toUpperCase() === 'PM' && h !== 12) h += 12;
            if (m[2].toUpperCase() === 'AM' && h === 12) h = 0;
            hourCounts[h] = (hourCounts[h] || 0) + 1;
          }
        });
        let best = -1, bestC = 0;
        for (const h in hourCounts) {
          if (hourCounts[h] > bestC) { bestC = hourCounts[h]; best = parseInt(h); }
        }
        if (best >= 0) {
          const start = best > 0 ? best - 1 : best;
          insightPrimeTime.textContent = `${fmtHour(start)} – ${fmtHour(best + 1)}`;
        } else {
          insightPrimeTime.textContent = 'More sessions will reveal your patterns';
        }
      }
    }

    if (insightTrend) {
      if (total === 0) {
        insightTrend.textContent = 'Finish a session to see how you\'re trending';
        insightTrend.className = 'text-xs font-semibold text-mute text-right';
      } else {
        const now = new Date();
        const tws = getWeekStart(now);
        const lws = new Date(tws);
        lws.setDate(lws.getDate() - 7);
        let tw = 0, lw = 0;
        history.forEach((s: any) => {
          const sd = new Date(s.date + ' ' + (s.time || ''));
          if (sd >= tws) tw++;
          else if (sd >= lws && sd < tws) lw++;
        });
        if (lw === 0 && tw > 0) {
          insightTrend.textContent = `+${tw} this week — off to a great start!`;
          insightTrend.className = 'text-xs font-semibold text-green-500 text-right';
        } else if (lw === 0) {
          insightTrend.textContent = 'Keep going — more data coming next week';
          insightTrend.className = 'text-xs font-semibold text-mute text-right';
        } else {
          const ch = Math.round(((tw - lw) / lw) * 100);
          if (ch > 0) {
            insightTrend.textContent = `+${ch}% — building momentum!`;
            insightTrend.className = 'text-xs font-semibold text-green-500 text-right';
          } else if (ch < 0) {
            insightTrend.textContent = `${ch}% — time to refocus`;
            insightTrend.className = 'text-xs font-semibold text-red-400 text-right';
          } else {
            insightTrend.textContent = 'Holding steady';
            insightTrend.className = 'text-xs font-semibold text-mute text-right';
          }
        }
      }
    }

    if (insightActivity) {
      if (history.length === 0) {
        insightActivity.textContent = 'Your first session will appear here';
      } else {
        const counts: Record<string, number> = {};
        let maxC = 0, best = '';
        history.forEach((s: any) => {
          const task = (s.task || 'Focus session').trim();
          counts[task] = (counts[task] || 0) + 1;
          if (counts[task] > maxC || (counts[task] === maxC && best === 'Focus session')) {
            maxC = counts[task];
            best = task;
          }
        });
        insightActivity.textContent = best || 'Focus session';
      }
    }
  };

  const updateAchievements = () => {
    if (!achievementsContainer) return;
    const totalSessions = parseInt(localStorage.getItem('pomodoro_total_sessions') || '0');
    const totalMinutes = parseInt(localStorage.getItem('pomodoro_total_minutes') || '0');
    const streak = parseInt(localStorage.getItem('pomodoro_streak_current') || '0');
    const defs = [
      { icon: '🌱', label: 'First Steps', earned: totalSessions >= 1 },
      { icon: '💪', label: '3-Day Streak', earned: streak >= 3 },
      { icon: '🔥', label: '5-Day Streak', earned: streak >= 5 },
      { icon: '🌟', label: '25 Sessions', earned: totalSessions >= 25 },
      { icon: '⏱', label: '10 Hours In', earned: totalMinutes >= 600 },
      { icon: '🏅', label: '50 Sessions', earned: totalSessions >= 50 },
      { icon: '📚', label: '25 Hours In', earned: totalMinutes >= 1500 },
      { icon: '🎯', label: '100 Sessions', earned: totalSessions >= 100 },
    ];
    achievementsContainer.innerHTML = defs.map(a =>
      `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-colors ${
        a.earned
          ? 'bg-canvas-soft border-hairline text-ink'
          : 'bg-transparent border-hairline/30 text-mute/40'
      }">${a.icon} ${a.label}</span>`
    ).join('');
  };

  const updateProgressCards = () => {
    const sessions = parseInt(localStorage.getItem('pomodoro_sessions_completed_today') || '0');
    const goal = parseInt(localStorage.getItem('pomodoro_goal') || '') || DEFAULT_GOAL;
    const streak = parseInt(localStorage.getItem('pomodoro_streak_current') || '0');
    const longest = parseInt(localStorage.getItem('pomodoro_streak_longest') || '0');
    const minutes = parseInt(localStorage.getItem('pomodoro_minutes_focused_today') || '0');
    const totalSessions = parseInt(localStorage.getItem('pomodoro_total_sessions') || '0');
    const totalMinutes = parseInt(localStorage.getItem('pomodoro_total_minutes') || '0');
    const wc = calculateWeeklyConsistency();

    const pct = Math.min(100, Math.round((sessions / goal) * 100));

    if (progressDailyCount) progressDailyCount.textContent = `${sessions}/${goal}`;
    if (progressDailyPct) progressDailyPct.textContent = `${pct}%`;
    if (progressDailyBar) progressDailyBar.style.width = `${pct}%`;
    if (progressDailyText) {
      if (sessions === 0) progressDailyText.textContent = 'Your focus journey starts today.';
      else if (pct >= 100) progressDailyText.textContent = 'Goal reached. You showed up and followed through.';
      else if (pct >= 75) progressDailyText.textContent = 'Almost there. Finish strong!';
      else if (pct >= 50) progressDailyText.textContent = 'Over halfway! You\'re on a roll.';
      else if (pct >= 25) progressDailyText.textContent = 'Momentum is building. Keep showing up.';
      else progressDailyText.textContent = 'Great start! Every session counts.';
    }

    if (progressStreakCount) progressStreakCount.textContent = streak.toString();
    if (progressStreakText) {
      if (streak === 0) progressStreakText.textContent = '🔥 Start your streak today';
      else if (streak === 1) progressStreakText.textContent = 'One day down. Come back tomorrow.';
      else if (streak <= 3) progressStreakText.textContent = `${streak} days strong! Building momentum.`;
      else if (streak <= 6) progressStreakText.textContent = `${streak} days! You're on fire!`;
      else if (streak <= 13) progressStreakText.textContent = `${streak} days! A full week of discipline!`;
      else progressStreakText.textContent = `${streak} days. Absolutely unstoppable!`;
    }

    if (progressBestCount) progressBestCount.textContent = longest.toString();
    if (progressBestText) {
      if (longest === 0) progressBestText.textContent = 'Complete a session to set your best';
      else if (streak >= longest && streak > 0) progressBestText.textContent = 'Tying your best! Push for tomorrow.';
      else {
        const target = longest + 1;
        const diff = target - streak;
        if (diff === 1) progressBestText.textContent = `${diff} session away from a new record.`;
        else progressBestText.textContent = `${diff} sessions away from a new record.`;
      }
    }

    if (progressWeeklyPct) progressWeeklyPct.textContent = `${wc}%`;
    if (progressWeeklyText) {
      if (wc === 0) progressWeeklyText.textContent = "There's still time to begin this week";
      else if (wc <= 25) progressWeeklyText.textContent = 'Early days. Every session builds momentum.';
      else if (wc <= 50) progressWeeklyText.textContent = 'Building consistency. Keep showing up!';
      else if (wc <= 75) progressWeeklyText.textContent = `Strong week! You're finding your rhythm.`;
      else if (wc < 100) progressWeeklyText.textContent = 'Almost a perfect week! One more day.';
      else progressWeeklyText.textContent = `Perfect week. Every single day. That's dedication.`;
    }

    if (progressAchievements) {
      const defs = [
        { icon: '🌱', label: 'First Steps', earned: totalSessions >= 1 },
        { icon: '💪', label: '3-Day Streak', earned: streak >= 3 },
        { icon: '🔥', label: '5-Day Streak', earned: streak >= 5 },
        { icon: '🌟', label: '25 Sessions', earned: totalSessions >= 25 },
        { icon: '⏱', label: '10 Hours In', earned: totalMinutes >= 600 },
        { icon: '🏅', label: '50 Sessions', earned: totalSessions >= 50 },
        { icon: '📚', label: '25 Hours In', earned: totalMinutes >= 1500 },
        { icon: '🎯', label: '100 Sessions', earned: totalSessions >= 100 },
      ];
      const earned = defs.filter(a => a.earned);
      if (earned.length === 0) {
        progressAchievements.innerHTML = '<p class="text-xs text-body/50 w-full text-center py-1">Earn your first badge by completing a session.</p>';
      } else {
        progressAchievements.innerHTML = defs.map(a =>
          `<span class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[11px] font-semibold transition-colors ${
            a.earned
              ? 'bg-canvas-soft border-hairline text-ink'
              : 'bg-transparent border-hairline/30 text-mute/30'
          }">${a.icon} ${a.label}</span>`
        ).join('');
      }
    }

    if (progressRecentList) {
      const historyJson = localStorage.getItem('pomodoro_history') || '[]';
      let history: any[] = [];
      try { history = JSON.parse(historyJson); } catch (e) { history = []; }
      if (progressRecentBadge) progressRecentBadge.textContent = history.length > 0 ? `Last ${Math.min(history.length, 5)}` : '';
      if (history.length === 0) {
        progressRecentList.innerHTML = '<p class="text-xs text-body/50 text-center py-3">Complete a session to see your history here.</p>';
      } else {
        progressRecentList.innerHTML = history.slice(0, 5).map((s: any) => {
          const isWork = s.mode === 'pomodoro' || !s.mode;
          return `<div class="flex items-center gap-2.5 p-2 rounded-xl bg-canvas-soft-2/50 border border-hairline/30 hover:bg-canvas-soft-2 transition-colors">
            <span class="w-2 h-2 rounded-full shrink-0 ${isWork ? 'bg-link' : 'bg-green-500'}"></span>
            <div class="flex-1 min-w-0">
              <span class="text-xs font-semibold text-ink block truncate">${s.task || 'Focus session'}</span>
              <span class="text-[10px] text-mute block">${s.date || ''} · ${s.time || ''}</span>
            </div>
            <span class="text-xs font-bold text-ink shrink-0">${s.duration || 0}m</span>
          </div>`;
        }).join('');
      }
    }
  };

  const getModeDurationSeconds = (mode: 'pomodoro' | 'short' | 'long') => {
    const minStr = localStorage.getItem(`pomodoro_duration_${mode}`);
    if (minStr) return parseInt(minStr) * 60;
    if (mode === 'pomodoro') return DEFAULT_WORK * 60;
    if (mode === 'short') return DEFAULT_SHORT * 60;
    return DEFAULT_LONG * 60;
  };

  const initSettingsInputs = () => {
    if (settingsWork) settingsWork.value = (parseInt(localStorage.getItem('pomodoro_duration_pomodoro') || '') || DEFAULT_WORK).toString();
    if (settingsShort) settingsShort.value = (parseInt(localStorage.getItem('pomodoro_duration_short') || '') || DEFAULT_SHORT).toString();
    if (settingsLong) settingsLong.value = (parseInt(localStorage.getItem('pomodoro_duration_long') || '') || DEFAULT_LONG).toString();
  };

  const saveSettings = () => {
    const workVal = Math.max(1, Math.min(180, parseInt(settingsWork.value) || DEFAULT_WORK));
    const shortVal = Math.max(1, Math.min(60, parseInt(settingsShort.value) || DEFAULT_SHORT));
    const longVal = Math.max(1, Math.min(60, parseInt(settingsLong.value) || DEFAULT_LONG));
    localStorage.setItem('pomodoro_duration_pomodoro', workVal.toString());
    localStorage.setItem('pomodoro_duration_short', shortVal.toString());
    localStorage.setItem('pomodoro_duration_long', longVal.toString());
    settingsWork.value = workVal.toString();
    settingsShort.value = shortVal.toString();
    settingsLong.value = longVal.toString();
    if (!isRunning) resetTimer();
  };

  const checkDailyReset = () => {
    const today = getTodayString();
    const lastDate = localStorage.getItem('pomodoro_last_focus_date') || '';
    if (lastDate !== today) {
      localStorage.setItem('pomodoro_sessions_completed_today', '0');
      localStorage.setItem('pomodoro_breaks_taken_today', '0');
      localStorage.setItem('pomodoro_minutes_focused_today', '0');
      const yesterday = getYesterdayString();
      if (lastDate !== yesterday && lastDate !== '') {
        localStorage.setItem('pomodoro_streak_current', '0');
      }
    }
  };

  const incrementDailyStats = (mode: 'pomodoro' | 'short' | 'long', minutes: number) => {
    checkDailyReset();
    const today = getTodayString();
    localStorage.setItem('pomodoro_last_focus_date', today);
    if (mode === 'pomodoro') {
      const completed = parseInt(localStorage.getItem('pomodoro_sessions_completed_today') || '0') + 1;
      const minutesFocused = parseInt(localStorage.getItem('pomodoro_minutes_focused_today') || '0') + minutes;
      localStorage.setItem('pomodoro_sessions_completed_today', completed.toString());
      localStorage.setItem('pomodoro_minutes_focused_today', minutesFocused.toString());
      const lastDate = localStorage.getItem('pomodoro_last_focus_date_success') || '';
      if (lastDate !== today) {
        const currentStreak = parseInt(localStorage.getItem('pomodoro_streak_current') || '0');
        let newStreak = 1;
        if (lastDate === getYesterdayString()) {
          newStreak = currentStreak + 1;
        } else if (lastDate === today) {
          newStreak = currentStreak;
        }
        localStorage.setItem('pomodoro_streak_current', newStreak.toString());
        const longestStreak = parseInt(localStorage.getItem('pomodoro_streak_longest') || '0');
        if (newStreak > longestStreak) {
          localStorage.setItem('pomodoro_streak_longest', newStreak.toString());
        }
        localStorage.setItem('pomodoro_last_focus_date_success', today);
      }
    } else {
      const breaks = parseInt(localStorage.getItem('pomodoro_breaks_taken_today') || '0') + 1;
      localStorage.setItem('pomodoro_breaks_taken_today', breaks.toString());
    }
    updateAnalytics();
  };

  const updateAnalytics = () => {
    checkDailyReset();
    const sessions = parseInt(localStorage.getItem('pomodoro_sessions_completed_today') || '0');
    const breaks = parseInt(localStorage.getItem('pomodoro_breaks_taken_today') || '0');
    const minutes = parseInt(localStorage.getItem('pomodoro_minutes_focused_today') || '0');
    const streak = parseInt(localStorage.getItem('pomodoro_streak_current') || '0');
    const longest = parseInt(localStorage.getItem('pomodoro_streak_longest') || '0');
    const goal = parseInt(localStorage.getItem('pomodoro_goal') || '') || DEFAULT_GOAL;

    if (statSessions) statSessions.textContent = sessions.toString();
    if (statGoalTotal) statGoalTotal.textContent = goal.toString();
    if (statGoalNumber) statGoalNumber.textContent = goal.toString();
    if (statGoalNumberSide) statGoalNumberSide.textContent = goal.toString();
    if (statStreak) statStreak.textContent = streak.toString();
    if (statLongestStreak) statLongestStreak.textContent = longest.toString();
    if (statTotalTime) {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      statTotalTime.textContent = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    }
    if (dashSessions) dashSessions.textContent = sessions.toString();
    if (dashStreak) dashStreak.textContent = streak.toString();
    if (dashBestStreak) dashBestStreak.textContent = longest.toString();
    if (dashTotalTime) {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      dashTotalTime.textContent = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    }

    const percentage = Math.min(100, Math.round((sessions / goal) * 100));
    if (statGoalBar) statGoalBar.style.width = `${percentage}%`;
    if (statGoalPercentage) statGoalPercentage.textContent = `${percentage}%`;
    if (dashCompletion) dashCompletion.textContent = goal.toString();
    if (dashGoalBar) dashGoalBar.style.width = `${percentage}%`;

    if (goalDotsContainer) {
      goalDotsContainer.innerHTML = '';
      for (let i = 1; i <= goal; i++) {
        const dot = document.createElement('div');
        dot.className = `w-5 h-5 rounded-full border transition-colors duration-300 ${
          i <= sessions
            ? 'bg-link border-link shadow-sm shadow-link/20 flex items-center justify-center text-[8px] text-white font-bold'
            : 'bg-canvas-soft-2 border-hairline'
        }`;
        if (i <= sessions) {
          dot.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>`;
        }
        goalDotsContainer.appendChild(dot);
      }
    }

    const score = Math.min(100, (sessions * 20) + (breaks * 5));
    if (statFocusScore) statFocusScore.textContent = score.toString();
    if (dashScore) dashScore.textContent = score.toString();

    const trendSessionsEl = document.getElementById('trend-sessions');
    const trendTimeEl = document.getElementById('trend-time');
    const trendScoreEl = document.getElementById('trend-score');
    if (trendSessionsEl) trendSessionsEl.className = sessions > 0 ? 'text-[9px] font-semibold text-green-500' : 'hidden';
    if (trendTimeEl) trendTimeEl.className = minutes > 0 ? 'text-[9px] font-semibold text-green-500' : 'hidden';
    if (trendScoreEl) trendScoreEl.className = score > 0 ? 'text-[9px] font-semibold text-green-500' : 'hidden';

    const encouragement = document.getElementById('stat-encouragement');
    const encText = (pct: number) => {
      const warmMsgs = [
        'You showed up. That alone is worth celebrating.',
        'No session is too small. They all add up.',
        'This is how things get built — steadily, patiently.',
        'You\'re doing more than you think.',
        'Progress isn\'t always loud. Quiet consistency counts.',
        'Be proud of showing up today.',
      ];
      if (pct === 0) return WARM_ENCOURAGEMENTS[Math.floor(Math.random() * WARM_ENCOURAGEMENTS.length)];
      if (pct >= 100) return warmMsgs[Math.floor(Math.random() * warmMsgs.length)];
      const remaining = goal - sessions;
      if (remaining === 1) return 'One more to meet your goal. You\'ve got this.';
      if (remaining <= 3) return `${remaining} to go. You're building something real.`;
      if (pct < 25) return 'Every journey begins with a single step. This is yours.';
      if (pct < 50) return `You're finding your rhythm. That's where growth happens.`;
      if (pct < 75) return `Over halfway. Look what you're building.`;
      return `So close. You've already done the hard part — showing up.`;
    };
    if (encouragement) encouragement.textContent = encText(percentage);
    if (dashEncouragement) dashEncouragement.textContent = encText(percentage);

    let label = 'Every journey starts with one session';
    let labelColor = 'text-mute';
    if (score > 80) { label = `Wonderful flow. You're in your element.`; labelColor = 'text-link'; }
    else if (score > 50) { label = `You've found a good rhythm. Keep going.`; labelColor = 'text-ink'; }
    else if (score > 20) { label = 'Nice start. Momentum is building.'; labelColor = 'text-body'; }
    if (focusScoreLabel) {
      focusScoreLabel.textContent = label;
      focusScoreLabel.className = score > 0 ? `text-[11px] font-semibold ${labelColor}` : 'hidden';
    }
    if (focusScoreLabelFallback) {
      if (score > 0) focusScoreLabelFallback.textContent = label;
      else focusScoreLabelFallback.textContent = 'Start a session to see your score';
    }

    // Analytics enhancements
    const cr = getCompletionRate();
    if (analyticsCompletionRate) analyticsCompletionRate.textContent = cr.rate > 0 ? `${cr.rate}%` : '—';
    if (analyticsCompletionLabel) analyticsCompletionLabel.textContent = cr.label;
    if (analyticsBestPeriod) analyticsBestPeriod.textContent = getBestFocusPeriod();

    updateFocusJourney();
    generateInsight();
    updateAchievements();
    updateProgressCards();
    updateIntentionCard();
    if (sessionCounterText) {
      if (sessions === 0) sessionCounterText.textContent = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      else if (sessions >= goal) sessionCounterText.textContent = `You're showing up. That's what matters.`;
      else if (sessions === goal - 1) sessionCounterText.textContent = 'One more to meet your goal. You\'ve got this.';
      else if (sessions === 1) sessionCounterText.textContent = 'One down. You\'re building something real.';
      else sessionCounterText.textContent = `${sessions} of ${goal} today. Steady progress.`;
    }

    const streakContext = document.getElementById('streak-context');
    if (streakContext) {
      if (streak === 0) streakContext.textContent = '🔥 Start your streak today';
      else if (streak === 1) streakContext.textContent = 'You showed up today. That\'s how it begins.';
      else if (streak <= 3) streakContext.textContent = `${streak} days. A quiet, steady rhythm.`;
      else if (streak <= 6) streakContext.textContent = `${streak} days. Consistency is taking root.`;
      else if (streak <= 13) streakContext.textContent = `${streak} days. This is becoming part of your world.`;
      else streakContext.textContent = `${streak} days. Look what dedication looks like.`;
    }

    const bestContext = document.getElementById('best-context');
    if (bestContext) {
      if (longest === 0) bestContext.textContent = 'Your first session will be the start';
      else if (streak > 0 && streak >= longest) bestContext.textContent = 'You\'re matching your best. That takes heart.';
      else bestContext.textContent = `You're ${longest + 1 - streak} day${longest + 1 - streak === 1 ? '' : 's'} away from a new personal best`;
    }

    const wc = calculateWeeklyConsistency();
    if (weeklyConsistency) weeklyConsistency.textContent = `${wc}%`;
    const weeklyContext = document.getElementById('weekly-context');
    if (weeklyContext) {
      if (wc === 0) weeklyContext.textContent = "There's still time to begin this week";
      else if (wc <= 25) weeklyContext.textContent = 'Early days. Even one session matters.';
      else if (wc <= 50) weeklyContext.textContent = `You've been showing up. That's real progress.`;
      else if (wc <= 75) weeklyContext.textContent = 'A thoughtful week. Steady and true.';
      else if (wc < 100) weeklyContext.textContent = 'Almost every day. That takes intention.';
      else weeklyContext.textContent = `Every day this week. That's genuine commitment.`;
    }

    const totalAll = parseInt(localStorage.getItem('pomodoro_total_sessions') || '0');
    const totalMinsAll = parseInt(localStorage.getItem('pomodoro_total_minutes') || '0');
    const journeyContext = document.getElementById('journey-context');
    if (journeyContext) {
      if (totalAll === 0) journeyContext.textContent = 'Your story starts with session one';
      else if (totalAll < 10) journeyContext.textContent = `${totalAll} sessions in. You're in the early chapters.`;
      else if (totalAll < 25) journeyContext.textContent = `${totalAll} sessions. Building a solid foundation.`;
      else if (totalAll < 50) journeyContext.textContent = `${totalAll} sessions. Halfway to 50!`;
      else if (totalAll < 100) journeyContext.textContent = `${totalAll} sessions. Deep into your journey now.`;
      else journeyContext.textContent = `${totalAll} sessions. What a journey.`;
    }

    if (heroMotivation) {
      const msgs = [
        'Welcome back. Thank you for showing up.',
        'You don\'t have to be perfect. You just have to begin.',
        'Small steps, repeated gently — that\'s how it works.',
        'You showed up today. That\'s already enough.',
        'Progress isn\'t always visible. Trust the process.',
        'Quiet consistency — that\'s all it takes.',
        'You\'re right where you need to be.',
        'Kindness counts. Growth follows.',
      ];
      const idx = Math.min(sessions, msgs.length - 1);
      heroMotivation.textContent = msgs[idx];
    }

    // Update new dashboard elements
    updateTaskCount();
    updateActiveTaskContext();
    updateTimeline();
    updateActivityFeed();
    updateTaskMetrics();
  };

  const saveSessionToHistory = (taskName: string, minutes: number, mode: 'pomodoro' | 'short' | 'long', outcome = '') => {
    const historyJson = localStorage.getItem('pomodoro_history') || '[]';
    let history = [];
    try { history = JSON.parse(historyJson); } catch (e) { history = []; }
    const d = new Date();
    const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const isoDate = getTodayString();
    const newSession = { task: taskName || (mode === 'pomodoro' ? 'Focus session' : 'Rest break'), duration: minutes, time: timeString, date: dateString, isoDate, mode, outcome };
    history.unshift(newSession);
    history = history.slice(0, 50);
    localStorage.setItem('pomodoro_history', JSON.stringify(history));
    updateHistoryUI();
  };

  const updateHistoryUI = () => {
    const historyJson = localStorage.getItem('pomodoro_history') || '[]';
    let history = [];
    try { history = JSON.parse(historyJson); } catch (e) { history = []; }
    if (history.length === 0) {
      historyEmpty?.classList.remove('hidden');
      historyList?.classList.add('hidden');
      btnClearHistory?.classList.add('hidden');
    } else {
      historyEmpty?.classList.add('hidden');
      historyList?.classList.remove('hidden');
      btnClearHistory?.classList.remove('hidden');
      if (historyList) {
        historyList.innerHTML = '';
        history.forEach((session: any) => {
          const item = document.createElement('div');
          const isWork = session.mode === 'pomodoro' || !session.mode;
          item.className = 'p-2 bg-canvas-soft-2/60 border border-hairline rounded-lg flex items-center justify-between text-xs transition-colors hover:bg-canvas-soft-2';
          item.innerHTML = `
            <div class="flex items-center gap-2 truncate">
              <span class="w-1.5 h-1.5 rounded-full shrink-0 ${isWork ? 'bg-link' : 'bg-green-500'}"></span>
              <div class="truncate">
                <span class="font-semibold text-ink block truncate max-w-[140px] sm:max-w-[180px]" title="${session.task}">${session.task}</span>
                <span class="text-[10px] text-mute font-mono block">${session.date} &#8226; ${session.time}</span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="font-bold text-ink">${session.duration} min</span>
              <span class="text-[10px] text-mute block">${isWork ? 'focus' : 'break'}</span>
            </div>`;
          historyList.appendChild(item);
        });
      }
    }
  };

  const saveTaskToRecent = (task: string) => {
    if (!task || task.trim() === '') return;
    const cleanTask = task.trim();
    let recent = [];
    try { recent = JSON.parse(localStorage.getItem('pomodoro_recent_tasks') || '[]'); } catch (e) { recent = []; }
    recent = recent.filter((t: string) => t.toLowerCase() !== cleanTask.toLowerCase());
    recent.unshift(cleanTask);
    recent = recent.slice(0, 5);
    localStorage.setItem('pomodoro_recent_tasks', JSON.stringify(recent));
    updateRecentTasksUI();
  };

  const updateRecentTasksUI = () => {
    let recent = [];
    try { recent = JSON.parse(localStorage.getItem('pomodoro_recent_tasks') || '[]'); } catch (e) { recent = []; }
    if (recent.length === 0) {
      recentTasksContainer?.classList.add('hidden');
    } else {
      recentTasksContainer?.classList.remove('hidden');
      if (recentTasksList) {
        recentTasksList.innerHTML = '';
        recent.forEach((task: string) => {
          const tagBtn = document.createElement('button');
          tagBtn.className = 'px-2 py-2 min-h-9 text-[11px] font-semibold bg-canvas-soft-2 border border-hairline rounded-lg hover:border-link/30 hover:text-link text-body transition-all cursor-pointer truncate max-w-[110px]';
          tagBtn.textContent = task;
          tagBtn.title = task;
          tagBtn.type = 'button';
          tagBtn.addEventListener('click', () => { if (taskInput) taskInput.value = task; selectTaskByName(task); });
          recentTasksList.appendChild(tagBtn);
        });
      }
    }
  };

  const updateTimerDisplay = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (timerDisplay) timerDisplay.textContent = formatted;
    if (progressRing) {
      const progress = timeLeft / totalDuration;
      const offset = 716.28 * (1 - progress);
      progressRing.style.strokeDashoffset = offset.toString();
      if (currentMode === 'pomodoro') updateRingColor(progress);
    }
  };

  const setMode = (mode: 'pomodoro' | 'short' | 'long') => {
    currentMode = mode;
    timeLeft = getModeDurationSeconds(mode);
    totalDuration = timeLeft;
    const tabs = [
      { el: modePomodoro, mode: 'pomodoro', style: 'bg-link text-white shadow-sm' },
      { el: modeShort, mode: 'short', style: 'bg-link text-white shadow-sm' },
      { el: modeLong, mode: 'long', style: 'bg-link text-white shadow-sm' }
    ];
    tabs.forEach(tab => {
      if (tab.el) {
        if (tab.mode === mode) {
          tab.el.className = `flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${tab.style}`;
        } else {
          tab.el.className = "flex-1 py-2 text-xs sm:text-sm font-bold text-body hover:text-ink rounded-full transition-all cursor-pointer";
        }
      }
    });
    if (timerStatusText) {
      if (mode === 'pomodoro') {
        timerStatusText.textContent = 'Focus time';
        if (sessionTypeText) sessionTypeText.textContent = 'Pomodoro';
        if (progressRing) progressRing.setAttribute('class', 'text-link transition-colors duration-1000 ease-linear');
      } else {
        const label = mode === 'short' ? 'Short Break' : 'Long Break';
        timerStatusText.textContent = label;
        if (sessionTypeText) sessionTypeText.textContent = label;
        if (progressRing) progressRing.setAttribute('class', 'text-green-500 transition-colors duration-1000 ease-linear');
      }
    }
    pauseTimer();
    updateTimerDisplay();
  };

  const startTimer = () => {
    if (isRunning) return;
    isRunning = true;
    togglePulse(true);
    iconPlay?.classList.add('hidden');
    iconPause?.classList.remove('hidden');
    if (currentMode === 'pomodoro') {
      currentTask = taskInput ? taskInput.value.trim() : '';
      if (currentTask) {
        saveTaskToRecent(currentTask);
        if (activeTaskName) activeTaskName.textContent = currentTask;
        taskInputContainer?.classList.add('hidden');
        activeTaskContainer?.classList.remove('hidden');
      } else {
        if (activeTaskName) activeTaskName.textContent = 'Focus session';
        taskInputContainer?.classList.add('hidden');
        activeTaskContainer?.classList.remove('hidden');
      }
      updateIntentionCard();
      activeTaskFooter?.classList.remove('hidden');
      // Show active task context
      if (activeTaskContext) activeTaskContext.classList.remove('hidden');
      updateActiveTaskContext();
    }
    timerInterval = window.setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
        if (isFocusMode) syncFocusMode();
        if (currentMode === 'pomodoro') {
          const progress = timeLeft / totalDuration;
          updatePhase(progress);
        }
      }
      else { handleTimerCompletion(); }
    }, 1000);
  };

  const pauseTimer = () => {
    if (!isRunning) return;
    isRunning = false;
    togglePulse(false);
    iconPlay?.classList.remove('hidden');
    iconPause?.classList.add('hidden');
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  };

  const togglePlayPause = () => { if (isRunning) pauseTimer(); else startTimer(); };

  const resetTimer = () => {
    pauseTimer();
    timeLeft = getModeDurationSeconds(currentMode);
    totalDuration = timeLeft;
    updateTimerDisplay();
    if (currentMode === 'pomodoro') {
      taskInputContainer?.classList.remove('hidden');
      activeTaskContainer?.classList.add('hidden');
      activeTaskFooter?.classList.add('hidden');
    }
  };

  const skipTimer = () => { pauseTimer(); handleTimerCompletion(true); };

  const showOutcomeModal = (taskName: string) => {
    if (!outcomeModal || !outcomeModalTask) return;
    outcomeModalTask.textContent = taskName || 'Focus session';
    outcomeModal.classList.remove('hidden');
  };

  const hideOutcomeModal = () => {
    if (!outcomeModal) return;
    outcomeModal.classList.add('hidden');
  };

  const completeWithOutcome = (outcome: string) => {
    hideOutcomeModal();
    const durationMins = pendingOutcomeDuration;
    const taskName = currentTask || activeTaskName?.textContent || 'Focus session';

    // Save history with outcome
    saveSessionToHistory(taskName, durationMins, 'pomodoro', outcome);

    // Update all-time totals
    const totalSessions = parseInt(localStorage.getItem('pomodoro_total_sessions') || '0') + 1;
    const totalMinutes = parseInt(localStorage.getItem('pomodoro_total_minutes') || '0') + durationMins;
    localStorage.setItem('pomodoro_total_sessions', totalSessions.toString());
    localStorage.setItem('pomodoro_total_minutes', totalMinutes.toString());

    // Track task completion
    if (outcome === 'completed' && taskName) {
      trackTaskCompletion(taskName);
    }

    // Update analytics
    updateFocusJourney();
    generateInsight();
    updateAchievements();
    updateProgressCards();
    triggerNotification("Focus session complete", `Nice work — ${durationMins} minutes of focused time.`);

    // Switch mode
    const todaySessions = parseInt(localStorage.getItem('pomodoro_sessions_completed_today') || '0');
    const goal = parseInt(localStorage.getItem('pomodoro_goal') || '') || DEFAULT_GOAL;
    if (todaySessions > 0 && todaySessions % goal === 0) setMode('long');
    else setMode('short');

    // Reset UI
    taskInputContainer?.classList.remove('hidden');
    activeTaskContainer?.classList.add('hidden');
    activeTaskFooter?.classList.add('hidden');
    if (activeTaskContext) activeTaskContext.classList.add('hidden');

    // Auto-start
    if (toggleAutostart && toggleAutostart.checked) { setTimeout(() => { startTimer(); }, 300); }

    pendingOutcomeDuration = 0;
  };

  const handleTimerCompletion = (isSkipped = false) => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    isRunning = false;
    togglePulse(false);
    iconPlay?.classList.remove('hidden');
    iconPause?.classList.add('hidden');
    const durationMins = Math.round(totalDuration / 60);
    if (!isSkipped) {
      playChime();
      triggerCelebration();
      if (timerPhase) {
        timerPhase.textContent = 'Well done!';
        timerPhase.className = 'text-sm font-bold text-green-500 transition-colors duration-500';
        timerPhase.classList.remove('opacity-0');
      }
      if (timerDisplay) timerDisplay.textContent = 'Done!';
      if (progressRing) progressRing.setAttribute('class', 'text-green-500 transition-colors duration-1000 ease-linear');
      if (timerRingContainer) timerRingContainer.classList.add('celebration-flash-bg');
      setTimeout(() => timerRingContainer?.classList.remove('celebration-flash-bg'), 2000);
      if (currentMode === 'pomodoro') {
        incrementDailyStats('pomodoro', durationMins);
        pendingOutcomeDuration = durationMins;
        showOutcomeModal(currentTask || activeTaskName?.textContent || 'Focus session');
      } else {
        incrementDailyStats(currentMode, durationMins);
        saveSessionToHistory(currentMode === 'short' ? 'Short Break' : 'Long Break', durationMins, currentMode);
        triggerNotification("Break Over!", "Time to start focusing again. Let's get to work!");
        setMode('pomodoro');
        taskInputContainer?.classList.remove('hidden');
        activeTaskContainer?.classList.add('hidden');
        activeTaskFooter?.classList.add('hidden');
        if (activeTaskContext) activeTaskContext.classList.add('hidden');
        if (toggleAutostart && toggleAutostart.checked) { setTimeout(() => { startTimer(); }, 300); }
      }
    } else {
      if (currentMode === 'pomodoro') {
        const todaySessions = parseInt(localStorage.getItem('pomodoro_sessions_completed_today') || '0');
        const goal = parseInt(localStorage.getItem('pomodoro_goal') || '') || DEFAULT_GOAL;
        if (todaySessions > 0 && todaySessions % goal === 0) setMode('long');
        else setMode('short');
      } else { setMode('pomodoro'); }
      taskInputContainer?.classList.remove('hidden');
      activeTaskContainer?.classList.add('hidden');
      activeTaskFooter?.classList.add('hidden');
      if (activeTaskContext) activeTaskContext.classList.add('hidden');
    }
  };

  const requestNotificationPermission = () => {
    if (!('Notification' in window)) {
      alert('Desktop notifications are not supported by this browser.');
      return;
    }
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          localStorage.setItem('pomodoro_notifications_enabled', 'true');
        } else {
          localStorage.setItem('pomodoro_notifications_enabled', 'false');
        }
      });
    } else if (Notification.permission === 'granted') {
      localStorage.setItem('pomodoro_notifications_enabled', 'true');
    } else {
      alert('Notifications are blocked by browser settings. Please enable them in site settings.');
      localStorage.setItem('pomodoro_notifications_enabled', 'false');
    }
  };

  // ===== NEW: TASK MANAGEMENT =====

  interface Task {
    id: string;
    text: string;
    completed: boolean;
    estimatedPomodoros: number;
    completedPomodoros: number;
    order: number;
  }

  const TASKS_KEY = 'pomodoro_tasks';
  const TASK_COMPLETIONS_KEY = 'pomodoro_task_completions';

  const getTasks = (): Task[] => {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
  };

  const saveTasks = (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  };

  const generateTaskId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  };

  const addTask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const tasks = getTasks();
    const newTask: Task = {
      id: generateTaskId(),
      text: trimmed,
      completed: false,
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      order: tasks.length,
    };
    tasks.push(newTask);
    saveTasks(tasks);
    renderTasks();
    updateTaskMetrics();
    if (taskAddInput) taskAddInput.value = '';
  };

  const toggleTaskComplete = (id: string) => {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        // Save completion record
        trackTaskCompletion(task.text);
      }
      saveTasks(tasks);
      renderTasks();
      updateTaskMetrics();
    }
  };

  const deleteTask = (id: string) => {
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    renderTasks();
    updateTaskMetrics();
  };

  const selectTaskByName = (name: string) => {
    if (!name) return;
    if (taskInput) taskInput.value = name;
    const tasks = getTasks();
    const task = tasks.find(t => t.text === name && !t.completed);
    if (task) {
      updateActiveTaskContext();
    }
  };

  const selectTask = (id: string) => {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      if (taskInput) taskInput.value = task.text;
      updateActiveTaskContext();
    }
  };

  const updateTaskEstimation = (taskName: string) => {
    const tasks = getTasks();
    const task = tasks.find(t => t.text === taskName);
    if (task) {
      const maxPoms = task.estimatedPomodoros;
      const done = task.completedPomodoros;
      if (maxPoms > 0) {
        const pct = Math.min(100, Math.round((done / maxPoms) * 100));
        if (taskEstimationBar) taskEstimationBar.style.width = `${pct}%`;
        if (taskEstimationPct) taskEstimationPct.textContent = `${pct}%`;
        if (taskEstimationText) taskEstimationText.textContent = `${done} / ${maxPoms} pomodoros`;
        if (taskEstimationBar) taskEstimationBar.style.width = `${pct}%`;
      }
    }
  };

  const trackTaskCompletion = (taskName: string) => {
    if (!taskName || taskName === 'Focus session') return;
    const tasks = getTasks();
    const task = tasks.find(t => t.text === taskName);
    if (task) {
      task.completedPomodoros = (task.completedPomodoros || 0) + 1;
      saveTasks(tasks);
    }
    // Also track daily completions
    const today = getTodayString();
    const key = `${TASK_COMPLETIONS_KEY}_${today}`;
    let completions: string[] = [];
    try {
      completions = JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {}
    if (!completions.includes(taskName)) {
      completions.push(taskName);
    }
    localStorage.setItem(key, JSON.stringify(completions));
    renderTasks();
    updateTaskMetrics();
    updateActiveTaskContext();
  };

  const updateTaskMetrics = () => {
    const tasks = getTasks();
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    if (statTasks) statTasks.textContent = completed.toString();
    if (tasksCompletedSub) {
      if (total === 0) tasksCompletedSub.textContent = 'Add a task to get started';
      else if (completed === 0) tasksCompletedSub.textContent = `${total} task${total > 1 ? 's' : ''} waiting`;
      else if (completed === total) tasksCompletedSub.textContent = 'All tasks done. Well done.';
      else tasksCompletedSub.textContent = `${completed} of ${total} finished`;
    }
  };

  const updateTaskCount = () => {
    const tasks = getTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    if (tasksCount) {
      if (total === 0) tasksCount.textContent = '🌱 Nothing planned';
      else if (completed === total) tasksCount.textContent = `${total}/${total} done`;
      else tasksCount.textContent = `${total} tasks`;
    }
  };

  const renderTasks = () => {
    const tasks = getTasks();
    const isTimerActive = isRunning && currentMode === 'pomodoro';

    if (!tasksList || !tasksEmpty) return;

    if (tasks.length === 0) {
      tasksList.innerHTML = '';
      const emptyEl = document.createElement('li');
      emptyEl.className = 'text-xs text-body/50 text-center py-6';
      emptyEl.innerHTML = '<div class="text-lg mb-1">🌱</div>What do you want to work on today?';
      tasksList.appendChild(emptyEl);
      updateTaskCount();
      updateTaskMetrics();
      return;
    }

    tasksList.innerHTML = '';
    tasks.forEach((task, idx) => {
      const li = document.createElement('li');
      li.className = 'task-item flex items-center gap-2.5 p-2 rounded-xl hover:bg-canvas-soft-2/60 transition-colors group border border-transparent hover:border-hairline/30 cursor-pointer task-item-enter';
      li.dataset.taskId = task.id;

      // Checkbox
      const checkbox = document.createElement('button');
      checkbox.type = 'button';
      checkbox.className = `w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
        task.completed
          ? 'bg-green-500 border-green-500 text-white'
          : 'border-hairline-strong/40 hover:border-link/50 group-hover:border-link/30'
      }`;
      checkbox.innerHTML = task.completed
        ? '<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
        : '';
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTaskComplete(task.id);
      });
      li.appendChild(checkbox);

      // Task text + estimation
      const textWrap = document.createElement('div');
      textWrap.className = 'flex-1 min-w-0';

      const textSpan = document.createElement('span');
      textSpan.className = `text-sm font-semibold block truncate transition-colors ${task.completed ? 'text-mute/50 line-through' : 'text-ink'}`;
      textSpan.textContent = task.text;
      textWrap.appendChild(textSpan);

      if (task.estimatedPomodoros > 0) {
        const estSpan = document.createElement('span');
        const pct = task.estimatedPomodoros > 0 ? Math.round((task.completedPomodoros / task.estimatedPomodoros) * 100) : 0;
        estSpan.className = `text-[10px] font-medium ${task.completed ? 'text-mute/30' : 'text-mute'}`;
        estSpan.textContent = `${task.completedPomodoros}/${task.estimatedPomodoros} pomodoros`;
        textWrap.appendChild(estSpan);
      }

      li.appendChild(textWrap);

      // Estimation badges
      const actions = document.createElement('div');
      actions.className = 'flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity';

      // Quick select (when not completed and timer not running)
      if (!task.completed && !isTimerActive) {
        const focusBtn = document.createElement('button');
        focusBtn.type = 'button';
        focusBtn.title = 'Focus on this task';
        focusBtn.className = 'w-7 h-7 rounded-lg bg-link/10 text-link hover:bg-link/20 flex items-center justify-center transition-all text-xs font-bold';
        focusBtn.innerHTML = '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        focusBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectTask(task.id);
        });
        actions.appendChild(focusBtn);
      }

      // Delete
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.title = 'Delete task';
      delBtn.className = 'w-7 h-7 rounded-lg text-mute/40 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all';
      delBtn.innerHTML = '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
      });
      actions.appendChild(delBtn);

      li.appendChild(actions);

      // Click on row = select task
      if (!task.completed) {
        li.addEventListener('click', () => selectTask(task.id));
      }

      tasksList.appendChild(li);
    });

    updateTaskCount();
    updateTaskMetrics();
  };

  // ===== NEW: TIMELINE =====

  const updateTimeline = () => {
    if (!dailyTimelineContent || !timelineBadge) return;

    const historyJson = localStorage.getItem('pomodoro_history') || '[]';
    let history: any[] = [];
    try { history = JSON.parse(historyJson); } catch (e) { history = []; }

    const today = getTodayString();
    const todaySessions = history.filter((s: any) => {
      const sDate = s.isoDate || s.date || '';
      return sDate === today;
    });

    if (todaySessions.length === 0) {
      timelineBadge.textContent = '';
      const insightIdx = getTodayInsightIndex();
      const insight = FOCUS_INSIGHTS[insightIdx];
      dailyTimelineContent.innerHTML = `
        <div id="focus-insight-card" class="text-center py-5">
          <div class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-500/10 mb-3">
            <svg class="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <p class="text-sm font-medium text-body leading-relaxed max-w-[400px] mx-auto">${insight}</p>
          <button type="button" id="focus-insight-refresh" class="mt-3 text-[11px] font-semibold text-mute hover:text-link transition-colors cursor-pointer">Show another</button>
        </div>
      `;
      const refreshBtn = document.getElementById('focus-insight-refresh');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          const next = (getTodayInsightIndex() + 1) % FOCUS_INSIGHTS.length;
          sessionStorage.setItem('pomodoro_insight_idx', String(next));
          const p = refreshBtn.parentElement?.querySelector('p');
          if (p) p.textContent = FOCUS_INSIGHTS[next];
        });
      }
      return;
    }

    timelineBadge.textContent = `${todaySessions.length} today`;
    const timelineHtml = todaySessions.map((s: any, i: number) => {
      const isWork = s.mode === 'pomodoro' || !s.mode;
      const outcomeIcon = s.outcome === 'completed' ? '✓' : s.outcome === 'partial' ? '↺' : s.outcome === 'notcompleted' ? '✗' : '';
      const outcomeColor = s.outcome === 'completed' ? 'text-green-500' : s.outcome === 'partial' ? 'text-amber-500' : s.outcome === 'notcompleted' ? 'text-red-400' : '';
      const dotColor = isWork ? 'bg-link' : 'bg-green-500';
      return `
        <div class="flex items-center gap-3 py-1.5 group hover:bg-canvas-soft-2/40 -mx-2 px-2 rounded-lg transition-colors">
          <div class="flex flex-col items-center shrink-0">
            <span class="w-2 h-2 rounded-full ${dotColor} ${i === 0 ? 'timeline-dot-active' : ''}"></span>
            ${i < todaySessions.length - 1 ? '<div class="w-px h-4 bg-hairline/30 mt-0.5"></div>' : ''}
          </div>
          <span class="text-[11px] font-mono text-mute font-semibold w-12 shrink-0">${s.time || ''}</span>
          <span class="flex-1 text-xs font-semibold text-ink truncate">${s.task || 'Focus session'}</span>
          <span class="text-[11px] text-mute font-medium shrink-0">${s.duration || 0}m</span>
          ${outcomeIcon ? `<span class="text-xs font-bold ${outcomeColor} shrink-0">${outcomeIcon}</span>` : ''}
        </div>
      `;
    }).join('');

    dailyTimelineContent.innerHTML = timelineHtml;
  };

  // ===== NEW: ACTIVITY FEED =====

  const updateActivityFeed = () => {
    if (!activityFeedContent || !activityFeedBadge) return;

    const historyJson = localStorage.getItem('pomodoro_history') || '[]';
    let history: any[] = [];
    try { history = JSON.parse(historyJson); } catch (e) { history = []; }

    if (history.length === 0) {
      activityFeedBadge.textContent = '';
      activityFeedContent.innerHTML = `
        <div class="flex flex-col items-center justify-center py-6 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <svg class="w-6 h-6 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <p class="text-sm font-medium text-body max-w-[340px] leading-relaxed">🌱 Your first session is waiting.</p>
          <div class="flex gap-2 mt-4">
            <button type="button" class="quick-start-btn text-xs font-bold px-4 py-2 rounded-lg border border-hairline/40 bg-link/[0.04] hover:bg-link/[0.08] hover:border-link/20 transition-all cursor-pointer active:scale-95 text-ink" data-template="Study">Study</button>
            <button type="button" class="quick-start-btn text-xs font-bold px-4 py-2 rounded-lg border border-hairline/40 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] hover:border-amber-500/20 transition-all cursor-pointer active:scale-95 text-ink" data-template="Writing">Writing</button>
            <button type="button" class="quick-start-btn text-xs font-bold px-4 py-2 rounded-lg border border-hairline/40 bg-sky-500/[0.04] hover:bg-sky-500/[0.08] hover:border-sky-500/20 transition-all cursor-pointer active:scale-95 text-ink" data-template="Coding">Coding</button>
            <button type="button" class="quick-start-btn text-xs font-bold px-4 py-2 rounded-lg border border-hairline/40 bg-green-500/[0.04] hover:bg-green-500/[0.08] hover:border-green-500/20 transition-all cursor-pointer active:scale-95 text-ink" data-template="Reading">Reading</button>
          </div>
        </div>
      `;
      return;
    }

    activityFeedBadge.textContent = `${history.length} total`;

    const feedHtml = history.map((s: any) => {
      const isWork = s.mode === 'pomodoro' || !s.mode;
      const dotColor = isWork ? 'bg-link' : 'bg-green-500';
      const label = isWork ? 'focus' : 'break';

      let outcomeBadge = '';
      if (s.outcome === 'completed') {
        outcomeBadge = '<span class="text-[10px] font-bold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full">Completed</span>';
      } else if (s.outcome === 'partial') {
        outcomeBadge = '<span class="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">In progress</span>';
      } else if (s.outcome === 'notcompleted') {
        outcomeBadge = '<span class="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">Set aside</span>';
      }

      return `
        <div class="flex items-center gap-3 p-2.5 rounded-xl bg-canvas-soft-2/30 border border-hairline/20 hover:bg-canvas-soft-2/60 hover:border-hairline/40 transition-all feed-item-enter">
          <span class="w-2.5 h-2.5 rounded-full ${dotColor} shrink-0 ring-2 ring-${isWork ? 'link' : 'green-500'}/10"></span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-ink truncate">${s.task || 'Focus session'}</span>
              ${outcomeBadge}
            </div>
            <div class="flex items-center gap-2 text-[10px] text-mute font-medium mt-0.5">
              <span>${s.date || ''} · ${s.time || ''}</span>
              <span class="w-1 h-1 rounded-full bg-hairline"></span>
              <span class="${isWork ? 'text-link' : 'text-green-500'}">${label}</span>
            </div>
          </div>
          <span class="text-xs font-bold text-ink shrink-0 bg-canvas-soft-2 px-2 py-1 rounded-lg border border-hairline/30">${s.duration || 0}m</span>
        </div>
      `;
    }).join('');

    activityFeedContent.innerHTML = feedHtml;
  };

  // ===== NEW: ACTIVE TASK CONTEXT =====

  const updateActiveTaskContext = () => {
    if (!activeTaskContextName || !sessionCounterDisplay) return;

    const taskName = taskInput?.value?.trim() || activeTaskName?.textContent || '';
    if (taskName && taskName !== 'Focus session') {
      activeTaskContextName.textContent = taskName;
      activeTaskContextName.className = 'text-sm font-bold text-ink truncate';
    } else {
      activeTaskContextName.textContent = 'Select or add a task above';
      activeTaskContextName.className = 'text-sm font-medium text-mute/60 truncate';
    }

    // Update session counter
    const sessions = parseInt(localStorage.getItem('pomodoro_sessions_completed_today') || '0');
    const goal = parseInt(localStorage.getItem('pomodoro_goal') || '') || DEFAULT_GOAL;
    if (isRunning && currentMode === 'pomodoro') {
      sessionCounterDisplay.textContent = isRunning
        ? `Session ${sessions + 1} of ${goal}`
        : `Session ${sessions} of ${goal}`;
    } else {
      sessionCounterDisplay.textContent = `Session ${sessions} of ${goal}`;
    }

    // Update daily target progress
    const dailyTargetBar = document.getElementById('daily-target-bar');
    const dailyTargetText = document.getElementById('daily-target-text');
    const dailyTargetLargeText = document.getElementById('daily-target-large-text');
    const dailyTargetPct = document.getElementById('daily-target-pct');
    if (dailyTargetBar) {
      const pct = goal > 0 ? Math.min(100, Math.round((sessions / goal) * 100)) : 0;
      dailyTargetBar.style.width = `${pct}%`;
      if (dailyTargetText) dailyTargetText.textContent = `${sessions}/${goal}`;
      if (dailyTargetPct) dailyTargetPct.textContent = `${pct}%`;
      if (dailyTargetLargeText) {
        dailyTargetLargeText.textContent = `${sessions} of ${goal} sessions`;
      }
    }

    // Update estimation
    const tasks = getTasks();
    const task = tasks.find(t => t.text === taskName);
    if (task && task.estimatedPomodoros > 0) {
      const done = task.completedPomodoros;
      const pct = Math.min(100, Math.round((done / task.estimatedPomodoros) * 100));
      if (taskEstimationText) taskEstimationText.textContent = `${done} / ${task.estimatedPomodoros} pomodoros`;
      if (taskEstimationBar) taskEstimationBar.style.width = `${pct}%`;
      if (taskEstimationPct) taskEstimationPct.textContent = `${pct}%`;
    } else if (task) {
      if (taskEstimationText) taskEstimationText.textContent = '1 pomodoro estimated';
      if (taskEstimationBar) taskEstimationBar.style.width = '0%';
      if (taskEstimationPct) taskEstimationPct.textContent = '0%';
    } else {
      if (taskEstimationText) taskEstimationText.textContent = '';
      if (taskEstimationBar) taskEstimationBar.style.width = '0%';
      if (taskEstimationPct) taskEstimationPct.textContent = '0%';
    }
  };

  // ===== FOCUS MODE =====

  let isFocusMode = false;

  const syncFocusMode = () => {
    if (!focusModeTimer || !focusModeTask || !focusModeStatus || !focusModeProgress) return;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    focusModeTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const taskName = activeTaskName?.textContent || taskInput?.value?.trim() || 'Focus session';
    focusModeTask.textContent = taskName;
    if (currentMode === 'pomodoro') {
      focusModeStatus.textContent = 'Focus time';
    } else if (currentMode === 'short') {
      focusModeStatus.textContent = 'Short Break';
    } else {
      focusModeStatus.textContent = 'Long Break';
    }
    const progress = totalDuration > 0 ? timeLeft / totalDuration : 1;
    focusModeProgress.style.width = `${progress * 100}%`;
  };

  const enterFocusMode = () => {
    if (!focusModeOverlay) return;
    isFocusMode = true;
    syncFocusMode();
    focusModeOverlay.classList.remove('hidden', 'focus-mode-enter');
    void focusModeOverlay.getBoundingClientRect();
    focusModeOverlay.classList.add('focus-mode-enter');
    if (isRunning) {
      focusModePause?.classList.remove('hidden');
      focusModePlay?.classList.add('hidden');
    } else {
      focusModePause?.classList.add('hidden');
      focusModePlay?.classList.remove('hidden');
    }
  };

  const exitFocusMode = () => {
    if (!focusModeOverlay) return;
    isFocusMode = false;
    focusModeOverlay.classList.add('hidden');
    focusModeOverlay.classList.remove('focus-mode-enter');
  };

  // ===== WEEKLY HEATMAP =====

  const updateWeeklyHeatmap = () => {
    const container = document.getElementById('weekly-heatmap');
    const label = document.getElementById('heatmap-week-label');
    if (!container || !label) return;

    const historyJson = localStorage.getItem('pomodoro_history') || '[]';
    let history: any[] = [];
    try { history = JSON.parse(historyJson); } catch (e) { history = []; }

    // Build a map of date -> session count for the past 7 days
    const dayCounts: Record<string, number> = {};
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekDays: { date: string; label: string; dayName: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dayCounts[key] = 0;
      weekDays.push({
        date: key,
        label: `${monthNames[d.getMonth()]} ${d.getDate()}`,
        dayName: dayNames[d.getDay()],
        count: 0,
      });
    }

    history.forEach((s: any) => {
      const sDate = s.isoDate || s.date || '';
      if (dayCounts[sDate] !== undefined) {
        dayCounts[sDate]++;
      }
    });

    weekDays.forEach(d => { d.count = dayCounts[d.date] || 0; });

    const maxCount = Math.max(1, ...weekDays.map(d => d.count));
    const totalThisWeek = weekDays.reduce((sum, d) => sum + d.count, 0);
    label.textContent = `${totalThisWeek} sessions`;

    container.innerHTML = '';
    container.className = 'flex gap-1.5 min-h-[36px] items-end';

    weekDays.forEach(d => {
      const intensity = d.count / maxCount;
      let bgClass = 'bg-violet-50 dark:bg-violet-950/20 text-ink/30';
      if (intensity > 0.75) bgClass = 'bg-violet-500 dark:bg-violet-500 text-white shadow-sm shadow-violet-500/10';
      else if (intensity > 0.5) bgClass = 'bg-violet-400 dark:bg-violet-600/80 text-white';
      else if (intensity > 0.25) bgClass = 'bg-violet-300 dark:bg-violet-700/60 text-ink';
      else if (intensity > 0) bgClass = 'bg-violet-200 dark:bg-violet-800/40 text-ink';

      const height = Math.max(16, d.count * 8 + 8);
      const cell = document.createElement('div');
      cell.className = `heatmap-cell flex-1 rounded-[4px] ${bgClass} border border-violet-200/30 dark:border-violet-800/10 flex flex-col items-center justify-end transition-all hover:scale-105 hover:brightness-105 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] select-none`;
      cell.style.height = `${Math.min(height, 48)}px`;
      cell.title = `${d.dayName} ${d.label}: ${d.count} session${d.count !== 1 ? 's' : ''}`;

      const countLabel = document.createElement('span');
      countLabel.className = 'text-[9px] font-extrabold leading-none mb-0.5';
      countLabel.textContent = d.count > 0 ? d.count.toString() : '';
      cell.appendChild(countLabel);

      container.appendChild(cell);
    });

    // Day labels
    const labelRow = document.getElementById('weekly-heatmap-labels');
    if (labelRow) {
      labelRow.innerHTML = '';
      labelRow.className = 'flex gap-1.5 mt-1 select-none';
      weekDays.forEach(d => {
        const lbl = document.createElement('span');
        lbl.className = 'flex-1 text-[9px] text-center font-semibold text-ink/30';
        lbl.textContent = d.dayName.charAt(0);
        labelRow.appendChild(lbl);
      });
    }
  };

  // ===== ANALYTICS ENHANCEMENTS =====

  const getCompletionRate = () => {
    const historyJson = localStorage.getItem('pomodoro_history') || '[]';
    let history: any[] = [];
    try { history = JSON.parse(historyJson); } catch (e) { history = []; }
    const total = history.length;
    if (total === 0) return { rate: 0, label: 'No data yet' };
    const completed = history.filter((s: any) => s.outcome === 'completed').length;
    const rate = Math.round((completed / total) * 100);
    return { rate, label: `${completed}/${total} completed` };
  };

  const getBestFocusPeriod = () => {
    const historyJson = localStorage.getItem('pomodoro_history') || '[]';
    let history: any[] = [];
    try { history = JSON.parse(historyJson); } catch (e) { history = []; }
    if (history.length === 0) return '—';
    const hourCounts: Record<number, number> = {};
    history.forEach((s: any) => {
      const t = s.time || '';
      const m = t.match(/(\d+):\d+\s*(AM|PM)/i);
      if (m) {
        let h = parseInt(m[1]);
        if (m[2].toUpperCase() === 'PM' && h !== 12) h += 12;
        if (m[2].toUpperCase() === 'AM' && h === 12) h = 0;
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
    });
    let best = -1, bestC = 0;
    for (const h in hourCounts) {
      if (hourCounts[h] > bestC) { bestC = hourCounts[h]; best = parseInt(h); }
    }
    if (best < 0) return '—';
    const fmt = (h: number) => {
      const p = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:00 ${p}`;
    };
    return `${fmt(best)} (${bestC} sessions)`;
  };

  // ===== EVENT LISTENERS =====

  modePomodoro?.addEventListener('click', () => setMode('pomodoro'));
  modeShort?.addEventListener('click', () => setMode('short'));
  modeLong?.addEventListener('click', () => setMode('long'));
  btnPlayPause?.addEventListener('click', togglePlayPause);
  btnReset?.addEventListener('click', resetTimer);
  btnSkip?.addEventListener('click', skipTimer);
  btnCompleteTask?.addEventListener('click', () => {
    if (isRunning && currentMode === 'pomodoro') handleTimerCompletion();
    else {
      taskInputContainer?.classList.remove('hidden');
      activeTaskContainer?.classList.add('hidden');
      if (taskInput) taskInput.value = '';
    }
  });
  btnToggleSettings?.addEventListener('click', () => {
    const isExpanded = btnToggleSettings.getAttribute('aria-expanded') === 'true';
    btnToggleSettings.setAttribute('aria-expanded', String(!isExpanded));
    settingsPanel?.classList.toggle('hidden');
  });
  btnSaveSettings?.addEventListener('click', () => {
    saveSettings();
    btnToggleSettings?.setAttribute('aria-expanded', 'false');
    settingsPanel?.classList.add('hidden');
  });
  btnResetDurations?.addEventListener('click', () => {
    if (settingsWork) settingsWork.value = DEFAULT_WORK.toString();
    if (settingsShort) settingsShort.value = DEFAULT_SHORT.toString();
    if (settingsLong) settingsLong.value = DEFAULT_LONG.toString();
    saveSettings();
    btnToggleSettings?.setAttribute('aria-expanded', 'false');
    settingsPanel?.classList.add('hidden');
  });
  btnClearHistory?.addEventListener('click', () => {
    if (confirm('Clear your session history? This can\'t be undone.')) {
      localStorage.setItem('pomodoro_history', '[]');
      updateHistoryUI();
    }
  });
  toggleSound?.addEventListener('change', () => { localStorage.setItem('pomodoro_sound_enabled', String(toggleSound.checked)); });
  toggleNotifications?.addEventListener('change', () => {
    if (toggleNotifications.checked) requestNotificationPermission();
    else localStorage.setItem('pomodoro_notifications_enabled', 'false');
  });
  toggleAutostart?.addEventListener('change', () => { localStorage.setItem('pomodoro_autostart_enabled', String(toggleAutostart.checked)); });
  taskInput?.addEventListener('input', updateIntentionCard);
  // Focus Mode listeners
  btnFocusMode?.addEventListener('click', enterFocusMode);
  focusModePause?.addEventListener('click', () => { pauseTimer(); syncFocusMode(); });
  focusModePlay?.addEventListener('click', () => { startTimer(); syncFocusMode(); });
  focusModeExit?.addEventListener('click', exitFocusMode);

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isFocusMode && document.activeElement !== taskInput && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault();
      togglePlayPause();
    }
    if (e.code === 'Space' && isFocusMode) {
      e.preventDefault();
      if (isRunning) { pauseTimer(); syncFocusMode(); } else { startTimer(); syncFocusMode(); }
    }
    if (e.key === 'Escape' && isFocusMode) {
      exitFocusMode();
    }
    if (e.key === 'Enter' && document.activeElement === taskAddInput) {
      e.preventDefault();
      if (taskAddInput) addTask(taskAddInput.value);
    }
  });

  // Task system listeners
  taskAddBtn?.addEventListener('click', () => {
    if (taskAddInput) addTask(taskAddInput.value);
  });
  taskAddInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask(taskAddInput.value);
    }
  });

  // Quick Start template handlers
  const handleQuickStart = (template: string) => {
    const input = document.getElementById('task-add-input') as HTMLInputElement;
    const btn = document.getElementById('task-add-btn');
    if (input) {
      input.value = `${template} session`;
      input.focus();
      btn?.click();
    }
  };

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // Handle insight card refresh
    const refreshBtn = target.closest('#focus-insight-refresh');
    if (refreshBtn) {
      e.preventDefault();
      const next = (getTodayInsightIndex() + 1) % FOCUS_INSIGHTS.length;
      sessionStorage.setItem('pomodoro_insight_idx', String(next));
      const p = document.getElementById('focus-insight-text');
      if (p) p.textContent = FOCUS_INSIGHTS[next];
    }

    // Handle Quick Start templates click
    const quickStartBtn = target.closest('.quick-start-btn');
    if (quickStartBtn) {
      e.preventDefault();
      const template = quickStartBtn.getAttribute('data-template');
      if (template) handleQuickStart(template);
    }

    // Handle Save button rollup
    const saveBtn = target.closest('#btn-save-settings');
    if (saveBtn) {
      const panel = document.getElementById('settings-panel');
      const toggle = document.getElementById('btn-toggle-settings');
      if (panel) panel.classList.add('hidden');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    // Handle Reset Durations rollup
    const resetBtn = target.closest('#btn-reset-durations');
    if (resetBtn) {
      const panel = document.getElementById('settings-panel');
      const toggle = document.getElementById('btn-toggle-settings');
      if (panel) panel.classList.add('hidden');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    // Handle Add Task link in Current Task card
    const addTaskBtn = target.closest('#btn-current-task-add');
    if (addTaskBtn) {
      e.preventDefault();
      const input = document.getElementById('task-add-input');
      if (input) (input as HTMLInputElement).focus();
    }
  });

  // Outcome modal listeners
  btnOutcomeCompleted?.addEventListener('click', () => completeWithOutcome('completed'));
  btnOutcomePartial?.addEventListener('click', () => completeWithOutcome('partial'));
  btnOutcomeNotcompleted?.addEventListener('click', () => completeWithOutcome('notcompleted'));

  // Close modal on backdrop click
  outcomeModal?.addEventListener('click', (e) => {
    if (e.target === outcomeModal) {
      // Don't close on backdrop — force outcome selection
    }
  });

  const initApp = () => {
    checkDailyReset();
    initSettingsInputs();
    if (toggleSound) toggleSound.checked = localStorage.getItem('pomodoro_sound_enabled') !== 'false';
    if (toggleAutostart) toggleAutostart.checked = localStorage.getItem('pomodoro_autostart_enabled') === 'true';
    if (toggleNotifications) {
      toggleNotifications.checked = localStorage.getItem('pomodoro_notifications_enabled') === 'true';
    }
    setMode('pomodoro');
    updateAnalytics();
    updateHistoryUI();
    updateRecentTasksUI();
    renderTasks();
    updateTimeline();
    updateActivityFeed();
    updateActiveTaskContext();
    updateWeeklyHeatmap();
    if (weeklyConsistency) weeklyConsistency.textContent = `${calculateWeeklyConsistency()}%`;
    if (heroMotivation) heroMotivation.textContent = 'Welcome back. Every session builds something.';
    activeTaskFooter?.classList.add('hidden');
    pendingOutcomeDuration = 0;
  };
  initApp();
  document.querySelectorAll('[aria-busy=true]').forEach(el => el.setAttribute('aria-busy', 'false'));
