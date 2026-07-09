// TYPES DEFINITIONS
  interface Milestone {
    text: string;
    completed: boolean;
  }

  interface FocusSession {
    id: string;
    activity: string;
    goal: string;
    milestones: Milestone[];
    durationMinutes: number;
    timeSpentSeconds: number;
    outcome: 'Completed' | 'Partial' | 'Failed';
    failedReason?: string;
    notes: string;
    timestamp: string;
  }

  // CENTRALIZED SAFE STORAGE UTILITY LAYER
  const isDev = false;
  let storageNotificationShown = false;

  /** Trigger the content-fade-in animation on a container after innerHTML update */
  function animateContent(el: HTMLElement) {
    el.classList.remove('content-fade-in');
    el.offsetWidth;
    el.classList.add('content-fade-in');
  }

  function showStorageWarning() {
    if (storageNotificationShown) return;
    storageNotificationShown = true;
    
    const appShell = document.getElementById('setup-panel') || document.body;
    const banner = document.createElement('div');
    banner.className = "p-3 mb-4 text-xs rounded-sm bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2 select-none animate-in fade-in slide-in-from-top-2 duration-300";
    banner.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>Progress cannot be saved on this device. (Local storage is unavailable)</span>
    `;
    const onboardingTracker = document.getElementById('onboarding-tracker');
    if (onboardingTracker && onboardingTracker.parentNode) {
      onboardingTracker.parentNode.insertBefore(banner, onboardingTracker);
    } else {
      appShell.prepend(banner);
    }
  }

  const SafeStorage = {
    getItem(key: string, fallback: string | null = null): string | null {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? val : fallback;
      } catch (e) {
        if (isDev) {
          console.warn(`[SafeStorage] Failed to read key "${key}":`, e);
        }
        showStorageWarning();
        return fallback;
      }
    },
    setItem(key: string, value: string): boolean {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        if (isDev) {
          console.warn(`[SafeStorage] Failed to write key "${key}":`, e);
        }
        showStorageWarning();
        return false;
      }
    },
    removeItem(key: string): boolean {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        if (isDev) {
          console.warn(`[SafeStorage] Failed to remove key "${key}":`, e);
        }
        showStorageWarning();
        return false;
      }
    }
  };

  // TOOLTAILS MODAL SYSTEM — Promise-based alert/confirm/toast with Tooltails styling
  const TooltailsModal = {
    _toastContainer: null as HTMLElement | null,

    _getToastContainer(): HTMLElement {
      if (!this._toastContainer) {
        this._toastContainer = document.createElement('div');
        this._toastContainer.id = 'tooltails-toast-container';
        this._toastContainer.className = 'fixed bottom-3 sm:bottom-6 right-3 sm:right-6 z-[99999] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(this._toastContainer);
      }
      return this._toastContainer;
    },

    _buildModal(message: string, type: 'alert' | 'confirm', destructive: boolean): string {
      const title = type === 'confirm' ? 'Confirm' : 'Tooltails Focus';
      const confirmLabel = destructive ? 'Delete' : 'Confirm';
      const confirmBtn = destructive
        ? 'px-4 h-11 bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] text-xs font-bold rounded-lg border border-red-500/25 transition-all cursor-pointer'
        : 'px-4 h-11 bg-link text-white hover:bg-link-hover hover:shadow-lg hover:shadow-link/20 active:scale-[0.98] text-xs font-bold rounded-lg border border-link/25 transition-all cursor-pointer';
      return `<div id="tooltails-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="tooltails-modal-title" class="fixed inset-0 z-[99999] bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
  <div id="tooltails-modal-card" class="w-full max-w-sm bg-canvas border border-hairline/40 rounded-2xl shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    <div class="p-4 border-b border-hairline flex items-center justify-between bg-canvas-soft-2/50">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-xl bg-canvas border border-hairline/40 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-mute/60"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <h3 id="tooltails-modal-title" class="text-sm font-bold text-ink">${title}</h3>
      </div>
    </div>
    <div class="p-5 space-y-4">
      <p class="text-sm text-body leading-relaxed">${message}</p>
      <div class="flex items-center justify-end gap-2 pt-1">
        ${type === 'confirm' ? '<button type="button" id="tooltails-modal-cancel" class="px-4 h-11 border border-hairline hover:bg-canvas-soft hover:border-hairline-strong active:scale-[0.98] text-xs font-semibold rounded-lg transition-all cursor-pointer text-body">Cancel</button>' : ''}
        <button type="button" id="tooltails-modal-ok" class="${confirmBtn}">${type === 'confirm' ? confirmLabel : 'OK'}</button>
      </div>
    </div>
  </div>
</div>`;
    },

    _focusTrap(e: KeyboardEvent, card: HTMLElement): void {
      const focusable = card.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    },

    alert(message: string): Promise<void> {
      return new Promise(resolve => {
        const existing = document.getElementById('tooltails-modal-overlay');
        if (existing) existing.remove();
        const root = document.createElement('div');
        root.innerHTML = this._buildModal(message, 'alert', false);
        document.body.appendChild(root);
        const overlay = document.getElementById('tooltails-modal-overlay') as HTMLElement;
        const okBtn = document.getElementById('tooltails-modal-ok') as HTMLButtonElement;
        const card = document.getElementById('tooltails-modal-card') as HTMLElement;
        const dismiss = () => { overlay?.remove(); resolve(); };
        okBtn?.addEventListener('click', dismiss);
        overlay?.addEventListener('click', (e: MouseEvent) => { if (e.target === overlay) dismiss(); });
        const keyHandler = (e: KeyboardEvent) => {
          if (e.key === 'Escape') dismiss();
          if (card) this._focusTrap(e, card);
        };
        document.addEventListener('keydown', keyHandler);
        setTimeout(() => okBtn?.focus(), 50);
      });
    },

    confirm(message: string, options?: { destructive?: boolean }): Promise<boolean> {
      return new Promise(resolve => {
        const existing = document.getElementById('tooltails-modal-overlay');
        if (existing) existing.remove();
        const root = document.createElement('div');
        root.innerHTML = this._buildModal(message, 'confirm', options?.destructive ?? false);
        document.body.appendChild(root);
        const overlay = document.getElementById('tooltails-modal-overlay') as HTMLElement;
        const okBtn = document.getElementById('tooltails-modal-ok') as HTMLButtonElement;
        const cancelBtn = document.getElementById('tooltails-modal-cancel') as HTMLButtonElement;
        const card = document.getElementById('tooltails-modal-card') as HTMLElement;
        const dismiss = (result: boolean) => { overlay?.remove(); resolve(result); };
        okBtn?.addEventListener('click', () => dismiss(true));
        cancelBtn?.addEventListener('click', () => dismiss(false));
        overlay?.addEventListener('click', (e: MouseEvent) => { if (e.target === overlay) dismiss(false); });
        const keyHandler = (e: KeyboardEvent) => {
          if (e.key === 'Escape') dismiss(false);
          if (e.key === 'Enter') dismiss(true);
          if (card) this._focusTrap(e, card);
        };
        document.addEventListener('keydown', keyHandler);
        setTimeout(() => cancelBtn?.focus(), 50);
      });
    },

    toast(message: string, duration: number = 4000): void {
      const container = this._getToastContainer();
      const toast = document.createElement('div');
      toast.className = 'pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300 bg-canvas border border-hairline/40 rounded-2xl shadow-elevated px-4 py-3 flex items-center gap-3 max-w-[calc(100vw-2rem)] sm:max-w-sm transition-all';
      toast.innerHTML = `<span class="text-xs text-body font-medium flex-1">${message}</span>
  <button type="button" class="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center p-1 text-mute hover:text-ink rounded hover:bg-canvas-soft-2 transition-colors cursor-pointer">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </button>`;
      container.appendChild(toast);
      const closeBtn = toast.querySelector('button');
      closeBtn?.addEventListener('click', () => { toast.remove(); });
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };

  // CORE APP STATES
  let activeTab: 'workspace' | 'analytics' | 'premium' = 'workspace';
  let history: FocusSession[] = [];
  
  // Timer state
  let timerDurationSeconds = 25 * 60;
  let timerRemainingSeconds = 25 * 60;
  let timerIntervalId: any = null;
  let isTimerRunning = false;
  let currentSessionMode: 'focus' | 'break' | 'idle' = 'idle';
  let focusMessageIndex = 0;
  const focusMessages = [
    "You're exactly where you need to be right now.",
    'Each minute of focus is a brick in your foundation.',
    'Be proud of yourself for showing up today.',
    'Your future self is cheering you on — keep going.',
    'This is your time. Protect it like it matters.',
    'You don\'t need to be perfect. You just need to begin.',
    'Every small step is still a step forward.',
    'Trust yourself — you\'ve handled harder things than this.',
  ];
  function warnBeforeUnload(e: BeforeUnloadEvent) {
    e.preventDefault();
    e.returnValue = '';
  }
  let timerSessionStartTimestamp = 0;
  let timerExpectedEndTimestamp = 0;
  
  // Session Configuration Data
  let selectedActivity = 'Study';
  let activeGoal = '';
  let activeWhyMatters = '';
  let activeMilestones: Milestone[] = [];
  let configuredFocusMinutes = 25;
  let configuredBreakMinutes = 5;

  interface WeeklyReflection {
    id: string;
    timestamp: string;
    content: string;
  }
  let reflections: WeeklyReflection[] = [];

  interface JournalEntry {
    id: string;
    date: string;
    updatedAt: string;
    dailyNotes: string;
    wins: string;
    distractions: string;
    moodBefore: number;
    moodAfter: number;
    lessons: string;
  }
  let journalEntries: JournalEntry[] = [];

  // Web Audio Context Synthesizer state
  const isWebAudioSupported = typeof window !== 'undefined' && !!(window.AudioContext || (window as any).webkitAudioContext);
  let audioCtx: AudioContext | null = null;
  let activeSoundNode: AudioWorkletNode | ScriptProcessorNode | OscillatorNode | AudioBufferSourceNode | null = null;
  let activeGainNode: GainNode | null = null;
  let currentAmbientSound: 'mute' | 'white' | 'brown' | 'rain' = 'mute';
  let lastActiveAmbientSound: 'mute' | 'white' | 'brown' | 'rain' = 'brown';

  // INITIALIZATION ON PAGE LOAD
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  // Hot reloading hook for Astro transitions
  document.addEventListener('astro:after-swap', () => {
    initApp();
  });

  // ONBOARDING WIZARD SYSTEM STATE
  let onboardingCurrentStep = 1;

  // FIRST-RUN EXPERIENCE
  const firstRunTemplates: Record<string, { goal: string; activity: string }> = {
    Study: { goal: 'Review Chapter 5 and summarize key concepts', activity: 'Study' },
    Coding: { goal: 'Build the user authentication flow', activity: 'Coding' },
    Reading: { goal: 'Read 20 pages and capture key insights', activity: 'Reading' },
    Writing: { goal: 'Draft the first section of the proposal', activity: 'Writing' },
  };

  function setupFirstRun() {
    const el = document.getElementById('first-run-experience');
    if (!el) return;

    const hasSeen = localStorage.getItem('tt-first-run');
    if (hasSeen) { el.remove(); return; }

    el.classList.remove('hidden');

    el.querySelectorAll('.first-run-example').forEach(btn => {
      btn.addEventListener('click', () => {
        const goal = (btn as HTMLElement).getAttribute('data-goal') || '';
        const activity = (btn as HTMLElement).getAttribute('data-activity') || 'Custom';
        const input = document.getElementById('session-goal') as HTMLInputElement;
        if (input) { input.value = goal; input.dispatchEvent(new Event('input', { bubbles: true })); }
        selectActivity(activity);
        dismissFirstRun(el);
      });
    });

    el.querySelectorAll('.first-run-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = (btn as HTMLElement).getAttribute('data-template') || '';
        const t = firstRunTemplates[key];
        if (t) {
          const input = document.getElementById('session-goal') as HTMLInputElement;
          if (input) { input.value = t.goal; input.dispatchEvent(new Event('input', { bubbles: true })); }
          selectActivity(t.activity);
        }
        dismissFirstRun(el);
      });
    });

    document.getElementById('first-run-skip')?.addEventListener('click', () => dismissFirstRun(el));
  }

  function dismissFirstRun(el: HTMLElement) {
    localStorage.setItem('tt-first-run', '1');
    el.style.transform = 'translateY(-8px)';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 350);
  }

  function initApp() {
    loadHistory();
    setupActivityButtons();
    setupPresetButtons();
    setupCustomSliders();
    setupMilestonesEngine();
    setupTimerControls();
    setupOutcomeForm();
    setupImmersiveTriggers();
    setupSoundButtons();
    setupKeyboardShortcuts();
    setupTabVisibilityListener();
    setupFocusVault();
    setupFirstRun();
    setupHistoryHelpers();
    
    // Load and render journal
    loadJournal();
    renderJournalEntries();
    setupJournalForm();
    
    // Load and render Focus Forecast goal tracking & Weekly Review
    loadForecastGoal();
    renderForecastEngine();
    renderWeeklyReview();
    
    // Seed initial dashboard stats
    updateDashboardStats();
    renderHistoryTable();
    renderHeatmap();
    renderOutcomeDonutChart();
    renderGrowthJourney();
    renderAchievements();
    
    // Set default preset styling
    selectActivity('Study');
    selectPreset(25, 5);
    
    // Initialize Onboarding Wizard Step 1
    advanceOnboardingStep(1);
  }

  // TAB SWITCHING NAVIGATION
  (window as any).switchTab = function(tab: 'workspace' | 'analytics' | 'premium') {
    activeTab = tab;
    
    // Update button styles (Linear style transition)
    const tabBtns = ['workspace', 'analytics', 'premium'];
    tabBtns.forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      const panel = document.getElementById(`tab-${t}`);
      if (t === tab) {
        btn?.setAttribute('aria-selected', 'true');
        btn?.classList.remove('text-body');
        btn?.classList.add('bg-canvas', 'text-ink', 'shadow-sm');
        panel?.classList.remove('hidden');
        panel?.classList.remove('tab-panel-enter');
        // Trigger reflow then add animation class for fade-in
        void (panel as HTMLElement)?.offsetWidth;
        panel?.classList.add('tab-panel-enter');
      } else {
        btn?.setAttribute('aria-selected', 'false');
        btn?.classList.add('text-body');
        btn?.classList.remove('bg-canvas', 'text-ink', 'shadow-sm');
        panel?.classList.add('hidden');
        panel?.classList.remove('tab-panel-enter');
      }
    });

    // Refresh charts if opening analytics
    if (tab === 'analytics') {
      renderHistoryTable();
      renderHeatmap();
      renderOutcomeDonutChart();
      renderWeeklyChart();
      renderGrowthJourney();
      renderAchievements();
      renderForecastEngine();
      if (typeof gtag !== 'undefined') { gtag('event', 'tab_progress_opened', {}); }
    }
    
    // Refresh Focus Forecast Engine if opening premium
    if (tab === 'premium') {
      renderForecastEngine();
      renderWeeklyReview();
      renderJournalEntries((document.getElementById('journal-search-input') as HTMLInputElement)?.value || '');
      renderTodaySessionsSummary();
      if (typeof gtag !== 'undefined') { gtag('event', 'tab_journal_opened', {}); }
    }
  };

  // STEP BY STEP NAVIGATION (Simplified for single-screen flow)
  function advanceOnboardingStep(step: number) {
    onboardingCurrentStep = step;
    updateCentralTimerLabels();
  }
  (window as any).advanceOnboardingStep = advanceOnboardingStep;

  function updateCentralTimerLabels() {
    const labelEl = document.getElementById('timer-session-label');
    const labelTextEl = document.getElementById('timer-session-text');
    const countdownEl = document.getElementById('timer-countdown');
    if (!labelEl || !countdownEl) return;

    if (currentSessionMode === 'idle') {
      if (labelTextEl) labelTextEl.textContent = 'Clear your mind. You\'ve got this.';
      updateTimerDisplay();
    }
    updateTimerGoalDisplay();
  }

  function updateTimerGoalDisplay() {
    const goalInput = document.getElementById('session-goal') as HTMLInputElement;
    const goalText = goalInput?.value.trim() || '';

    const timerCategoryEl = document.getElementById('timer-active-category');
    const timerGoalEl = document.getElementById('timer-active-goal');
    const timerNextStepEl = document.getElementById('timer-next-step');

    const activeCurrentStepText = document.getElementById('active-current-step-text');
    const activeCurrentStepContainer = document.getElementById('active-current-step-container');

    // 1. Show selected activity category
    if (timerCategoryEl) {
      if (selectedActivity) {
        timerCategoryEl.textContent = selectedActivity;
        timerCategoryEl.classList.remove('hidden');
      } else {
        timerCategoryEl.classList.add('hidden');
      }
    }

    // 2. Show active goal text — always visible while focusing
    if (timerGoalEl) {
      timerGoalEl.textContent = goalText || selectedActivity || 'This moment is yours';
    }

    // 3. Show Next Step (first incomplete milestone)
    const nextMilestone = activeMilestones.find(m => !m.completed);
    if (timerNextStepEl) {
      if (nextMilestone && currentSessionMode !== 'idle') {
        timerNextStepEl.textContent = `Next: ${nextMilestone.text}`;
        timerNextStepEl.classList.remove('hidden');
      } else {
        timerNextStepEl.classList.add('hidden');
      }
    }

    // 4. Update the Active Highlighted Target step above the timer
    if (activeCurrentStepText && activeCurrentStepContainer) {
      if (currentSessionMode !== 'idle') {
        if (activeMilestones.length === 0) {
          activeCurrentStepText.textContent = "Focus on your main goal";
          activeCurrentStepContainer.classList.remove('hidden');
        } else if (nextMilestone) {
          activeCurrentStepText.textContent = nextMilestone.text;
          activeCurrentStepContainer.classList.remove('hidden');
        } else {
          activeCurrentStepText.textContent = "All checkpoints completed!";
          activeCurrentStepContainer.classList.remove('hidden');
        }
      } else {
        activeCurrentStepContainer.classList.add('hidden');
      }
    }
  }

  function updateOnboardingSummaryCard() {
    // No-op placeholder since we unified summary layout
  }

  // LOCAL STORAGE PERSISTENCE & HISTORY LOGGING
  function loadHistory() {
    try {
      const stored = SafeStorage.getItem('tooltails-focus-history');
      if (stored) {
        history = JSON.parse(stored);
      } else {
        history = [];
      }
    } catch (e) {
      if (isDev) console.error("Failed to parse focus history", e);
      history = [];
    }
  }

  function saveHistory() {
    SafeStorage.setItem('tooltails-focus-history', JSON.stringify(history));
    updateDashboardStats();
  }

  // ACTIVITY SELECTION MANAGEMENT
  function setupActivityButtons() {
    const actBtns = document.querySelectorAll('.activity-btn');
    const customInput = document.getElementById('custom-activity-input') as HTMLInputElement;

    actBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const act = target.getAttribute('data-activity') || 'Custom';
        
        actBtns.forEach(b => { b.classList.remove('border-link', 'bg-link/5'); b.setAttribute('aria-pressed', 'false'); });
        target.setAttribute('aria-pressed', 'true');

        if (act === 'Custom') {
          customInput.classList.remove('hidden');
          selectedActivity = customInput.value || 'Custom';
          customInput.focus();
        } else {
          customInput.classList.add('hidden');
          selectedActivity = act;
        }
        updateCentralTimerLabels();
      });
    });

    customInput?.addEventListener('input', () => {
      selectedActivity = customInput.value || 'Custom';
    });
  }

  function selectActivity(actName: string) {
    const btn = Array.from(document.querySelectorAll('.activity-btn')).find(b => b.getAttribute('data-activity') === actName) as HTMLElement;
    if (btn) btn.click();
  }

  // PRESET SELECTION MANAGEMENT
  function setupPresetButtons() {
    const presetBtns = document.querySelectorAll('.preset-btn');
    const customPanel = document.getElementById('custom-presets-panel');

    presetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const focusVal = target.getAttribute('data-focus');
        const breakVal = target.getAttribute('data-break');

        presetBtns.forEach(b => { b.classList.remove('border-link', 'bg-link/5'); b.setAttribute('aria-pressed', 'false'); });
        target.setAttribute('aria-pressed', 'true');

        if (focusVal === 'custom') {
          customPanel?.classList.remove('hidden');
          // Trigger slider update
          updateCustomValues();
        } else {
          customPanel?.classList.add('hidden');
          selectPreset(parseInt(focusVal || '25'), parseInt(breakVal || '5'));
        }
      });
    });
  }

  function selectPreset(focusM: number, breakM: number) {
    configuredFocusMinutes = focusM;
    configuredBreakMinutes = breakM;
    
    // Only reset time if timer is IDLE
    if (currentSessionMode === 'idle') {
      timerDurationSeconds = focusM * 60;
      timerRemainingSeconds = timerDurationSeconds;
      updateTimerDisplay();
    }
  }

  // CUSTOM TIMER SLIDERS
  function setupCustomSliders() {
    const focusSlider = document.getElementById('custom-focus-slider') as HTMLInputElement;
    const breakSlider = document.getElementById('custom-break-slider') as HTMLInputElement;

    focusSlider?.addEventListener('input', updateCustomValues);
    breakSlider?.addEventListener('input', updateCustomValues);
  }

  function updateCustomValues() {
    const focusSlider = document.getElementById('custom-focus-slider') as HTMLInputElement;
    const breakSlider = document.getElementById('custom-break-slider') as HTMLInputElement;
    const focusValText = document.getElementById('custom-focus-val');
    const breakValText = document.getElementById('custom-break-val');

    if (!focusSlider || !breakSlider) return;

    const fMin = parseInt(focusSlider.value);
    const bMin = parseInt(breakSlider.value);

    if (focusValText) focusValText.textContent = `${fMin}m`;
    if (breakValText) breakValText.textContent = `${bMin}m`;

    selectPreset(fMin, bMin);
  }

  // GOAL CHECKPOINTS (GOAL PLANNING ENGINE)
  function applyGoalTemplate(type: string | null) {
    if (!type) return;
    
    const goalInput = document.getElementById('session-goal') as HTMLInputElement;
    if (!goalInput) return;

    let goalText = "";
    let milestones: string[] = [];
    let recDuration = 25;
    let recBreak = 5;
    let activity = "Study";

    switch(type) {
      case 'reading':
        goalText = "Read 30 pages of my book";
        milestones = [
          "Read first 15 pages and annotate key passages",
          "Read next 15 pages without checking phone",
          "Draft bulleted summary of core learnings"
        ];
        recDuration = 50;
        recBreak = 10;
        activity = "Reading";
        break;
      case 'coding':
        goalText = "Solve 2 coding interview problems";
        milestones = [
          "Understand boundary cases & sketch optimal approach",
          "Code logic & dry run tests for off-by-one errors",
          "Review memory/runtime bounds and save solution"
        ];
        recDuration = 90;
        recBreak = 0;
        activity = "Coding";
        break;
      case 'study':
        goalText = "Review course lectures & complete exercise pack";
        milestones = [
          "Deconstruct lecture slides & outline core terms",
          "Perform active recall questions on mock deck",
          "Submit problem pack and highlight mistakes"
        ];
        recDuration = 25;
        recBreak = 5;
        activity = "Study";
        break;
      case 'writing':
        goalText = "Draft 500-word section outline and summary";
        milestones = [
          "Organize structural outlines & layout references",
          "Write 500 words of draft without self-editing",
          "Polish transition links & verify phrasing flows"
        ];
        recDuration = 50;
        recBreak = 10;
        activity = "Writing";
        break;
      case 'fitness':
        goalText = "Complete focused core & flexibility training";
        milestones = [
          "10m joint dynamic mobilization & light cardio warm-up",
          "Execute 3 sets of strength & balance drills",
          "5m targeted core endurance & cool down stretch"
        ];
        recDuration = 25;
        recBreak = 5;
        activity = "Art";
        break;
    }

    // Set goal value
    goalInput.value = goalText;

    // Set milestones
    activeMilestones = milestones.map(m => ({ text: m, completed: false }));
    renderSetupMilestones();

    // Select the recommended activity
    selectedActivity = activity;
    document.querySelectorAll('.activity-btn').forEach(btn => {
      const act = btn.getAttribute('data-activity');
      if (act === activity) {
        document.querySelectorAll('.activity-btn').forEach(b => { b.classList.remove('border-link', 'bg-link/5'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('border-link', 'bg-link/5');
        btn.setAttribute('aria-pressed', 'true');
      }
    });

    // Select recommended preset duration in Step 3
    const presetBtns = document.querySelectorAll('.preset-btn');
    const customPanel = document.getElementById('custom-presets-panel');
    presetBtns.forEach(b => {
      const focusVal = b.getAttribute('data-focus');
      if (focusVal === String(recDuration)) {
        presetBtns.forEach(btn => { btn.classList.remove('border-link', 'bg-link/5'); btn.setAttribute('aria-pressed', 'false'); });
        b.classList.add('border-link', 'bg-link/5');
        b.setAttribute('aria-pressed', 'true');
        customPanel?.classList.add('hidden');
        document.getElementById('step-3-next-btn')?.classList.remove('hidden');
      }
    });

    configuredFocusMinutes = recDuration;
    configuredBreakMinutes = recBreak;
    if (currentSessionMode === 'idle') {
      timerDurationSeconds = recDuration * 60;
      timerRemainingSeconds = timerDurationSeconds;
      updateTimerDisplay();
    }

    // Provide dynamic styling indicator to the selected template button
    document.querySelectorAll('.goal-template-btn').forEach(btn => {
      if (btn.getAttribute('data-template') === type) {
        btn.classList.add('border-link', 'bg-link/[0.02]', 'ring-1', 'ring-link/20');
      } else {
        btn.classList.remove('border-link', 'bg-link/[0.02]', 'ring-1', 'ring-link/20');
      }
    });
    updateTimerGoalDisplay();
  }

  function setupMilestonesEngine() {
    const addBtn = document.getElementById('add-milestone-btn');
    const input = document.getElementById('milestone-input') as HTMLInputElement;
    const goalInput = document.getElementById('session-goal') as HTMLInputElement;

    addBtn?.addEventListener('click', () => {
      if (!input || !input.value.trim()) return;
      
      const val = input.value.trim();
      activeMilestones.push({ text: val, completed: false });
      input.value = '';
      
      renderSetupMilestones();
      if (typeof gtag !== 'undefined') { gtag('event', 'checkpoint_added', { total_checkpoints: activeMilestones.length }); }
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addBtn?.click();
      }
    });

    // Clear active template outlines when typing goal manually
    goalInput?.addEventListener('input', () => {
      document.querySelectorAll('.goal-template-btn').forEach(btn => {
        btn.classList.remove('border-link', 'bg-link/[0.02]', 'ring-1', 'ring-link/20');
      });
      updateTimerGoalDisplay();
    });

    // Goal templates quick triggers
    document.querySelectorAll('.goal-template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = (e.currentTarget as HTMLElement).getAttribute('data-template');
        applyGoalTemplate(type);
      });
    });
  }

  function renderSetupMilestones() {
    const list = document.getElementById('setup-milestones-list');
    if (!list) return;

    if (activeMilestones.length === 0) {
      list.innerHTML = `<li class="flex items-center justify-center gap-2 text-sm text-mute/60 py-3 text-left select-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0 opacity-50"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="M15 5l3 3"/></svg>
        What's your first step?
      </li>`;
      return;
    }

    list.innerHTML = activeMilestones.map((m, idx) => `
      <li class="flex items-center justify-between gap-3 px-1 py-1.5 text-xs text-ink group hover:bg-canvas-soft-2/30 rounded-sm transition-all duration-150">
        <div class="flex items-center gap-2 flex-grow min-w-0">
          <span class="w-1.5 h-1.5 rounded-full bg-mute/45 shrink-0"></span>
          <span class="editable-milestone-text font-medium outline-none focus:bg-canvas-soft-2 focus:ring-1 focus:ring-link/25 px-1.5 py-0.5 rounded cursor-text truncate w-full" contenteditable="true" data-index="${idx}">${m.text}</span>
        </div>
        <button type="button" class="text-mute/50 hover:text-error opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer delete-milestone-btn shrink-0 p-2.5 min-h-[44px] min-w-[44px] rounded-sm flex items-center justify-center" data-index="${idx}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </li>
    `).join('');
    animateContent(list);

    // Attach deletes
    list.querySelectorAll('.delete-milestone-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0');
        activeMilestones.splice(index, 1);
        renderSetupMilestones();
      });
    });

    // Attach inline editing blur/keydown events
    list.querySelectorAll('.editable-milestone-text').forEach(span => {
      span.addEventListener('blur', (e) => {
        const target = e.currentTarget as HTMLElement;
        const index = parseInt(target.getAttribute('data-index') || '0');
        const newText = target.textContent?.trim() || "";
        if (newText) {
          activeMilestones[index].text = newText;
        } else {
          // If edited to blank, delete it
          activeMilestones.splice(index, 1);
          renderSetupMilestones();
        }
      });

      span.addEventListener('keydown', (e) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === 'Enter') {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      });
    });
  }

  // TIMER LOGIC & DIGITAL RINGS
  function setupTimerControls() {
    const startSessionBtn = document.getElementById('start-session-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const skipBtn = document.getElementById('skip-btn');
    const goalInput = document.getElementById('session-goal') as HTMLInputElement;
    const quickStartBtn = document.getElementById('quick-start-btn');

    // Keyboard-first enter trigger
    goalInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('milestone-input')?.focus();
      }
    });

    // Real-time input synchronization for the dial goal label
    goalInput?.addEventListener('input', () => {
      updateTimerGoalDisplay();
    });

    quickStartBtn?.addEventListener('click', () => {
      // Overwrite configuration with defaults
      selectedActivity = 'Study';
      activeGoal = 'Focus Session';
      activeWhyMatters = '';
      activeMilestones = [];
      configuredFocusMinutes = 50;
      configuredBreakMinutes = 10;

      // Update active activity buttons styling visually
      const actBtns = document.querySelectorAll('.activity-btn');
      actBtns.forEach(b => {
        if (b.getAttribute('data-activity') === 'Study') {
          b.classList.add('border-link', 'bg-link/5');
        } else {
          b.classList.remove('border-link', 'bg-link/5');
        }
      });

      // Clear input custom activity views
      const customInput = document.getElementById('custom-activity-input') as HTMLInputElement;
      if (customInput) customInput.classList.add('hidden');

      // Update goal inputs in the background
      if (goalInput) goalInput.value = 'Focus Session';
      const goalWhyInput = document.getElementById('session-goal-why') as HTMLInputElement;
      if (goalWhyInput) goalWhyInput.value = '';

      // Setup active views
      document.getElementById('setup-panel')?.classList.add('hidden');
      document.getElementById('active-info-panel')?.classList.remove('hidden');
      document.getElementById('active-info-panel')?.classList.add('panel-enter');
      document.getElementById('timer-presets-section')?.classList.add('hidden');
      document.getElementById('setup-panel-below-fold')?.classList.add('hidden');
      document.getElementById('tab-workspace')?.classList.add('workspace-active-focus');
      document.getElementById('timer-container-card')?.classList.add('timer-active');
      document.getElementById('timer-active-glow')?.classList.remove('opacity-0');
      document.getElementById('timer-active-glow')?.classList.add('opacity-100');
      
      // Update names
      const titleEl = document.getElementById('active-goal-title');
      if (titleEl) titleEl.textContent = `Goal: ${activeGoal}`;
      
      const tagEl = document.getElementById('active-activity-tag');
      if (tagEl) {
        tagEl.textContent = selectedActivity;
        tagEl.className = "px-2.5 py-1 text-xs font-semibold rounded-md " + getActivityColorClass(selectedActivity);
      }

      // Hide why matters panel
      const whyPanel = document.getElementById('active-why-matters-panel');
      if (whyPanel) whyPanel.classList.add('hidden');

      // Render active milestones
      renderActiveMilestones();
      
      // Lock timer settings & start ticking
      currentSessionMode = 'focus';
      timerDurationSeconds = configuredFocusMinutes * 60;
      timerRemainingSeconds = timerDurationSeconds;
      
      playPauseBtn?.removeAttribute('disabled');
      skipBtn?.removeAttribute('disabled');
      document.getElementById('fullscreen-trigger-btn')?.removeAttribute('disabled');
      
      // Show keyboard shortcut hint
      document.getElementById('shortcuts-hint')?.classList.remove('hidden');

      toggleTimer(true);
      if (typeof gtag !== 'undefined') { gtag('event', 'goal_created', { activity: selectedActivity, source: 'quick_start' }); }
    });

    startSessionBtn?.addEventListener('click', () => {
      activeGoal = goalInput?.value.trim() || `Focus session: ${selectedActivity}`;
      
      const goalWhyInput = document.getElementById('session-goal-why') as HTMLInputElement;
      activeWhyMatters = goalWhyInput?.value.trim() || '';

      const whyPanel = document.getElementById('active-why-matters-panel');
      const whyText = document.getElementById('active-why-matters-text');
      if (whyPanel && whyText) {
        if (activeWhyMatters) {
          whyText.textContent = activeWhyMatters;
          whyPanel.classList.remove('hidden');
        } else {
          whyPanel.classList.add('hidden');
        }
      }

      // Setup active views
      document.getElementById('setup-panel')?.classList.add('hidden');
      document.getElementById('active-info-panel')?.classList.remove('hidden');
      document.getElementById('active-info-panel')?.classList.add('panel-enter');
      document.getElementById('timer-presets-section')?.classList.add('hidden');
      document.getElementById('setup-panel-below-fold')?.classList.add('hidden');
      document.getElementById('tab-workspace')?.classList.add('workspace-active-focus');
      document.getElementById('timer-container-card')?.classList.add('timer-active');
      document.getElementById('timer-active-glow')?.classList.remove('opacity-0');
      document.getElementById('timer-active-glow')?.classList.add('opacity-100');
      
      // Update names
      const titleEl = document.getElementById('active-goal-title');
      if (titleEl) titleEl.textContent = `Goal: ${activeGoal}`;
      
      const tagEl = document.getElementById('active-activity-tag');
      if (tagEl) {
        tagEl.textContent = selectedActivity;
        // Swap category colors
        tagEl.className = "px-2.5 py-1 text-xs font-semibold rounded-md " + getActivityColorClass(selectedActivity);
      }

      // Pre-fill active checks
      renderActiveMilestones();
      
      // Lock timer settings & start ticking
      currentSessionMode = 'focus';
      timerDurationSeconds = configuredFocusMinutes * 60;
      timerRemainingSeconds = timerDurationSeconds;
      
      playPauseBtn?.removeAttribute('disabled');
      skipBtn?.removeAttribute('disabled');
      document.getElementById('fullscreen-trigger-btn')?.removeAttribute('disabled');
      
      // Show keyboard shortcut hint
      document.getElementById('shortcuts-hint')?.classList.remove('hidden');

      toggleTimer(true);
      if (typeof gtag !== 'undefined') { gtag('event', 'goal_created', { activity: selectedActivity, source: 'manual', has_why: (activeWhyMatters.length > 0).toString() }); }
    });

    playPauseBtn?.addEventListener('click', () => {
      if (currentSessionMode === 'idle') {
        startSessionBtn?.click();
      } else {
        toggleTimer(!isTimerRunning);
      }
    });

    skipBtn?.addEventListener('click', () => {
      // Abort session -> trigger modal
      openOutcomeModal();
    });
  }

  function getActivityColorClass(act: string): string {
    switch (act) {
      case 'Coding': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400';
      case 'Study': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'Reading': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'Writing': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'Art': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      default: return 'bg-mute/10 text-body';
    }
  }

  function renderActiveMilestones() {
    const normalList = document.getElementById('active-milestones-list');
    const immersiveList = document.getElementById('immersive-milestones-list');
    
    const elements = [normalList, immersiveList];
    elements.forEach(list => {
      if (!list) return;
      if (activeMilestones.length === 0) {
        list.innerHTML = `<li class="flex items-center justify-center gap-2 text-xs text-mute/60 py-2 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0 opacity-50"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          Focus on your main goal without distraction
        </li>`;
        animateContent(list);
        return;
      }

      const activeIdx = activeMilestones.findIndex(m => !m.completed);

      list.innerHTML = activeMilestones.map((m, idx) => {
        const isActive = idx === activeIdx;
        return `
        <li class="flex items-center gap-3 px-3 py-2 bg-canvas border rounded-sm transition-all duration-200 select-none group ${m.completed ? 'opacity-50 border-transparent' : isActive ? 'border-link/25 bg-link/[0.02] shadow-[0_1px_3px_rgba(37,99,235,0.08)]' : 'border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.01)]'}">
          <label class="flex items-center gap-2.5 text-xs text-ink cursor-pointer w-full font-medium">
            <input type="checkbox" class="milestone-checkbox rounded border-hairline accent-link w-4 h-4 cursor-pointer focus:ring-2 focus:ring-link/10 transition-all" data-index="${idx}" ${m.completed ? 'checked' : ''} />
            <span class="transition-all ${m.completed ? 'line-through text-mute italic' : isActive ? 'font-semibold text-ink' : 'text-ink'}">${m.text}</span>
          </label>
        </li>`;
      }).join('');
      animateContent(list);

      // Add checked triggers
      list.querySelectorAll('.milestone-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          const index = parseInt(target.getAttribute('data-index') || '0');
          activeMilestones[index].completed = target.checked;

          // Re-render both lists to reflect active state change
          renderActiveMilestones();
        });
      });
    });

    updateMilestoneRatioIndicator();
  }

  function updateMilestoneRatioIndicator() {
    const total = activeMilestones.length;
    const completed = activeMilestones.filter(m => m.completed).length;
    const ratioEl = document.getElementById('timer-milestone-ratio');
    if (!ratioEl) return;

    if (currentSessionMode !== 'idle') {
      ratioEl.classList.remove('hidden');
      if (total > 0) {
        ratioEl.textContent = `${completed} of ${total} checkpoints completed`;
      } else {
        ratioEl.textContent = "You're in a focus flow right now";
      }
    } else {
      ratioEl.classList.add('hidden');
    }
    updateTimerGoalDisplay();
  }

  function toggleTimer(start: boolean) {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const immPlayPauseBtn = document.getElementById('immersive-play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const immPlayIcon = document.getElementById('imm-play-icon');
    const immPauseIcon = document.getElementById('imm-pause-icon');
    const playText = document.getElementById('play-btn-text');
    const immPlayText = document.getElementById('imm-play-btn-text');
    const timerContainer = document.getElementById('timer-container-card');

    isTimerRunning = start;

    if (start) {
      window.addEventListener('beforeunload', warnBeforeUnload);
      playPauseBtn?.setAttribute('aria-pressed', 'true');
      immPlayPauseBtn?.setAttribute('aria-pressed', 'true');
      timerContainer?.classList.add('timer-running');
      // Toggle play pause icons
      playIcon?.classList.add('hidden');
      immPlayIcon?.classList.add('hidden');
      pauseIcon?.classList.remove('hidden');
      pauseIcon?.classList.add('icon-swap');
      immPauseIcon?.classList.remove('hidden');
      immPauseIcon?.classList.add('icon-swap');
      if (playText) playText.textContent = "Pause — I'll be right back";
      if (immPlayText) immPlayText.textContent = "Pause for a moment";
      
      if (currentSessionMode === 'focus') {
        focusMessageIndex = 0;
        document.getElementById('timer-session-text').textContent = focusMessages[0];
      } else {
        document.getElementById('timer-session-text').textContent = 'Recharge — you\'ve earned this break';
      }

      // Start Audio Synth if sound is active
      if (currentAmbientSound !== 'mute') {
        playAmbientSound(currentAmbientSound);
      }

      // If we are starting a new timer run, record the session start
      if (timerRemainingSeconds === timerDurationSeconds) {
        timerSessionStartTimestamp = Date.now();
        if (currentSessionMode === 'focus' && typeof gtag !== 'undefined') {
          gtag('event', 'focus_start', { activity: selectedActivity, duration_minutes: configuredFocusMinutes });
        }
      } else {
        if (currentSessionMode === 'focus' && typeof gtag !== 'undefined') {
          gtag('event', 'focus_resume', { activity: selectedActivity });
        }
      }

      // Expected end time is now + remaining duration
      timerExpectedEndTimestamp = Date.now() + timerRemainingSeconds * 1000;

      let focusMessageTick = 0;
      timerIntervalId = setInterval(() => {
        const diffMs = timerExpectedEndTimestamp - Date.now();
        timerRemainingSeconds = Math.max(0, Math.ceil(diffMs / 1000));
        
        updateTimerDisplay();

        // Rotate encouraging message every ~15 seconds during focus
        if (currentSessionMode === 'focus') {
          focusMessageTick++;
          if (focusMessageTick % 15 === 0) {
            focusMessageIndex = (focusMessageIndex + 1) % focusMessages.length;
            document.getElementById('timer-session-text').textContent = focusMessages[focusMessageIndex];
          }
        }

        if (timerRemainingSeconds <= 0) {
          clearInterval(timerIntervalId);
          triggerTimerCompletion();
        }
      }, 1000);
    } else {
      playPauseBtn?.setAttribute('aria-pressed', 'false');
      immPlayPauseBtn?.setAttribute('aria-pressed', 'false');
      timerContainer?.classList.remove('timer-running');
      pauseIcon?.classList.add('hidden');
      immPauseIcon?.classList.add('hidden');
      playIcon?.classList.remove('hidden');
      playIcon?.classList.add('icon-swap');
      immPlayIcon?.classList.remove('hidden');
      immPlayIcon?.classList.add('icon-swap');
      if (playText) playText.textContent = "Ready to dive back in";
      if (immPlayText) immPlayText.textContent = "Let's keep going";
      
      document.getElementById('timer-session-text').textContent = 'Paused — pick up where you left off';

      clearInterval(timerIntervalId);
      stopAmbientSound();

      if (currentSessionMode === 'focus' && timerRemainingSeconds > 0 && typeof gtag !== 'undefined') {
        gtag('event', 'focus_pause', { activity: selectedActivity });
      }
    }
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timerRemainingSeconds / 60);
    const seconds = timerRemainingSeconds % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Page outputs
    document.getElementById('timer-countdown').textContent = formatted;
    document.getElementById('immersive-countdown').textContent = formatted;
    
    // Browser tab title
    // Removed live timer from tab title for a stable, professional label

    // SVG Circular Progress
    const ring = document.getElementById('timer-progress-ring') as SVGPathElement;
    if (ring) {
      const maxDash = 282.74; // Circumference of r=45 viewBox coordinate circle
      const ratio = timerDurationSeconds > 0 ? (timerRemainingSeconds / timerDurationSeconds) : 0;
      const offset = maxDash - (ratio * maxDash);
      ring.style.strokeDashoffset = offset.toString();
    }

    // Progress dot position — follows the arc end
    const dot = document.getElementById('timer-progress-dot');
    const dotGlow = document.getElementById('timer-progress-dot-glow');
    if (dot) {
      const percent = timerDurationSeconds > 0 ? 1 - (timerRemainingSeconds / timerDurationSeconds) : 0;
      const angle = percent * 2 * Math.PI - Math.PI / 2;
      const cx = 50 + 45 * Math.cos(angle);
      const cy = 50 + 45 * Math.sin(angle);
      dot.setAttribute('cx', cx.toFixed(2));
      dot.setAttribute('cy', cy.toFixed(2));
      if (dotGlow) {
        dotGlow.setAttribute('cx', cx.toFixed(2));
        dotGlow.setAttribute('cy', cy.toFixed(2));
      }
    }

    // Immersive progress bar
    const bar = document.getElementById('immersive-progress-bar');
    if (bar) {
      const percent = ((timerDurationSeconds - timerRemainingSeconds) / timerDurationSeconds) * 100;
      bar.style.width = `${percent}%`;
    }
  }

  function triggerTimerCompletion() {
    playNotificationSynth();
    
    if (currentSessionMode === 'focus') {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'focus_complete', { activity: selectedActivity, duration_minutes: configuredFocusMinutes });
      }
      // Focus done -> prompt evaluation
      openOutcomeModal();
    } else if (currentSessionMode === 'break') {
      // Break done -> return to focus setup or next
      TooltailsModal.toast("Break's over — whenever you feel ready, start your next session.", 5000);
      resetTimerToIdle();
    }
  }

  function resetTimerToIdle() {
    clearInterval(timerIntervalId);
    isTimerRunning = false;
    window.removeEventListener('beforeunload', warnBeforeUnload);
    currentSessionMode = 'idle';
    
    // Restore UI panels
    document.getElementById('setup-panel')?.classList.remove('hidden');
    document.getElementById('setup-panel')?.classList.add('panel-enter');
    document.getElementById('active-info-panel')?.classList.add('hidden');
    document.getElementById('timer-presets-section')?.classList.remove('hidden');
    document.getElementById('timer-presets-section')?.classList.add('panel-enter');
    document.getElementById('setup-panel-below-fold')?.classList.remove('hidden');
    document.getElementById('setup-panel-below-fold')?.classList.add('panel-enter');
    document.getElementById('tab-workspace')?.classList.remove('workspace-active-focus');
    document.getElementById('timer-container-card')?.classList.remove('timer-active', 'timer-running');
    document.getElementById('timer-active-glow')?.classList.remove('opacity-100');
    document.getElementById('timer-active-glow')?.classList.add('opacity-0');
    
    // Clear Goal Planner Engine states
    const goalInput = document.getElementById('session-goal') as HTMLInputElement;
    if (goalInput) goalInput.value = '';
    const goalWhyInput = document.getElementById('session-goal-why') as HTMLInputElement;
    if (goalWhyInput) goalWhyInput.value = '';
    activeGoal = '';
    activeWhyMatters = '';
    activeMilestones = [];
    renderSetupMilestones();
    updateTimerGoalDisplay();

    // Reset onboarding flow step back to 1
    advanceOnboardingStep(1);
    
    const playPauseBtn = document.getElementById('play-pause-btn') as HTMLButtonElement;
    const skipBtn = document.getElementById('skip-btn') as HTMLButtonElement;
    const fsBtn = document.getElementById('fullscreen-trigger-btn') as HTMLButtonElement;
    
    playPauseBtn?.removeAttribute('disabled');
    skipBtn?.setAttribute('disabled', 'true');
    fsBtn?.removeAttribute('disabled');
    
    if (document.getElementById('play-btn-text')) {
      document.getElementById('play-btn-text').textContent = "Ready for another round?";
    }
    
    timerDurationSeconds = configuredFocusMinutes * 60;
    timerRemainingSeconds = timerDurationSeconds;
    updateTimerDisplay();
    
    // Restore Title
    document.title = "Focus Timer with Goal Planning | Tooltails";

    stopAmbientSound();
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    exitImmersiveMode();

    // Hide keyboard shortcut hint
    document.getElementById('shortcuts-hint')?.classList.add('hidden');
  }

  // EVALUATION OUTCOME MODAL & DISTRACTION SCIENCE
  function openOutcomeModal() {
    const modal = document.getElementById('outcome-modal');
    const goalText = document.getElementById('modal-goal-text');
    const ratioText = document.getElementById('modal-milestone-ratio');
    
    if (!modal) return;

    if (goalText) goalText.textContent = activeGoal;
    
    const total = activeMilestones.length;
    const completed = activeMilestones.filter(m => m.completed).length;
    if (ratioText) {
      ratioText.textContent = total > 0 ? `${completed} of ${total} steps done` : "You showed up with a clear intention — that's what matters.";
    }

    // Toggle timer off while modal handles outcomes
    toggleTimer(false);

    modal.classList.remove('hidden');
    
    // Clear selections
    document.querySelectorAll('.outcome-radio-label').forEach(lbl => {
      lbl.classList.remove('border-link', 'bg-link/5');
      const radio = lbl.querySelector('input');
      if (radio) radio.checked = false;
    });

    document.getElementById('failed-context-panel')?.classList.add('hidden');
    document.getElementById('modal-recovery-advisor')?.classList.add('hidden');
    document.getElementById('modal-why-matters-support')?.classList.add('hidden');

    // Forecast attribution setup
    const forecastAttributionPanel = document.getElementById('outcome-forecast-attribution');
    if (activeForecastGoal) {
      forecastAttributionPanel?.classList.remove('hidden');
      const syncGoalDesc = document.getElementById('sync-goal-description');
      if (syncGoalDesc) syncGoalDesc.innerHTML = `Log progress for active track: <strong>${activeForecastGoal.title}</strong>`;
      const syncUnit = document.getElementById('sync-forecast-unit');
      if (syncUnit) syncUnit.textContent = activeForecastGoal.unit;
      const syncCheckbox = document.getElementById('sync-to-forecast') as HTMLInputElement;
      if (syncCheckbox) syncCheckbox.checked = false;
      const syncValue = document.getElementById('sync-forecast-value') as HTMLInputElement;
      if (syncValue) syncValue.value = '1';
      const syncNotes = document.getElementById('sync-forecast-notes') as HTMLInputElement;
      if (syncNotes) syncNotes.value = '';
    } else {
      forecastAttributionPanel?.classList.add('hidden');
    }
  }

  function setupOutcomeForm() {
    const form = document.getElementById('outcome-form');
    const closeBtn = document.getElementById('modal-close-x-btn');
    const failedContext = document.getElementById('failed-context-panel');
    const failedSelect = document.getElementById('failed-reason') as HTMLSelectElement;

    // Close button aborts session completely with no log
    closeBtn?.addEventListener('click', () => {
      TooltailsModal.confirm("Are you sure you want to close without saving? Any progress in this block won't be recorded.").then(confirmed => {
        if (confirmed) {
          document.getElementById('outcome-modal')?.classList.add('hidden');
          resetTimerToIdle();
        }
      });
    });

    // Toggle context panels based on outcome Selection
    document.querySelectorAll('.outcome-radio-label').forEach(label => {
      label.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const radio = target.querySelector('input[type="radio"]') as HTMLInputElement;
        
        if (!radio) return;
        radio.checked = true;
        
        document.querySelectorAll('.outcome-radio-label').forEach(l => l.classList.remove('border-link', 'bg-link/5'));
        target.classList.add('border-link', 'bg-link/5');

        if (radio.value === 'Failed' || radio.value === 'Partial') {
          failedContext?.classList.remove('hidden');
          triggerRecoveryAdvisor(radio.value, failedSelect.value);
          
          const supportPanel = document.getElementById('modal-why-matters-support');
          const supportText = document.getElementById('modal-why-matters-support-text');
          if (supportPanel && supportText) {
            if (activeWhyMatters) {
              supportText.textContent = `"${activeWhyMatters}"`;
            } else {
              supportText.textContent = `"Your personal growth, dedication, and focus."`;
            }
            supportPanel.classList.remove('hidden');
          }
        } else {
          failedContext?.classList.add('hidden');
          document.getElementById('modal-recovery-advisor')?.classList.add('hidden');
          document.getElementById('modal-why-matters-support')?.classList.add('hidden');
        }
      });
    });

    failedSelect?.addEventListener('change', () => {
      const activeOutcome = (document.querySelector('input[name="outcome"]:checked') as HTMLInputElement)?.value;
      if (activeOutcome) {
        triggerRecoveryAdvisor(activeOutcome, failedSelect.value);
      }
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const outcome = (document.querySelector('input[name="outcome"]:checked') as HTMLInputElement)?.value as any;
      if (!outcome) {
        TooltailsModal.toast("Please select a session outcome.", 3000);
        return;
      }

      const notes = (document.getElementById('reflection-notes') as HTMLTextAreaElement).value.trim();
      const failedReason = outcome !== 'Completed' ? failedSelect.value : undefined;
      const spent = timerDurationSeconds - timerRemainingSeconds;

      if (typeof gtag !== 'undefined') gtag('event', 'outcome_logged', { outcome });
      // Add entry to history
      const newSession: FocusSession = {
        id: Math.random().toString(36).substr(2, 9),
        activity: selectedActivity,
        goal: activeGoal,
        milestones: JSON.parse(JSON.stringify(activeMilestones)),
        durationMinutes: Math.round(timerDurationSeconds / 60),
        timeSpentSeconds: spent,
        outcome: outcome,
        failedReason: failedReason,
        notes: notes,
        timestamp: new Date().toISOString()
      };

      history.unshift(newSession);
      saveHistory();

      // Trigger floating celebration if completed!
      if (outcome === 'Completed') {
        triggerCelebration();
      }

      // Check if user synced to forecast goal
      const syncCheckbox = document.getElementById('sync-to-forecast') as HTMLInputElement;
      if (syncCheckbox && syncCheckbox.checked && activeForecastGoal) {
        const valInput = document.getElementById('sync-forecast-value') as HTMLInputElement;
        const val = valInput ? parseFloat(valInput.value) : 1;
        const noteInput = document.getElementById('sync-forecast-notes') as HTMLInputElement;
        const syncNotesVal = noteInput ? noteInput.value.trim() : "";
        
        if (!isNaN(val) && val > 0) {
          const newLog: ProgressLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            value: val,
            notes: syncNotesVal || `Synced from focus session outcome: "${outcome}"`
          };
          activeForecastGoal.logs.unshift(newLog);
          saveForecastGoal();
          renderForecastEngine();
        }
      }

      // Close modal & show session summary for every outcome
      document.getElementById('outcome-modal')?.classList.add('hidden');
      (document.getElementById('reflection-notes') as HTMLTextAreaElement).value = '';
      showCelebrationSummary(outcome);
    });
  }

  function showCelebrationSummary(outcome: string) {
    const overlay = document.getElementById('celebration-overlay');
    if (!overlay) return;

    // --- Stats ---
    const minutes = Math.floor((timerDurationSeconds - timerRemainingSeconds) / 60);
    const secs = (timerDurationSeconds - timerRemainingSeconds) % 60;
    const timeStr = minutes > 0 ? `${minutes} min${secs > 0 ? ` ${secs}s` : ''}` : `${secs}s`;
    document.getElementById('celebration-time').textContent = timeStr;
    document.getElementById('celebration-goal').textContent = activeGoal || 'This moment is yours';
    const total = activeMilestones.length;
    const completed = activeMilestones.filter(m => m.completed).length;
    document.getElementById('celebration-checkpoints').textContent = total > 0 ? `${completed} of ${total}` : '—';

    // --- Streak ---
    const streak = calculateDailyStreak(history);
    const streakEl = document.getElementById('celebration-streak');
    if (streakEl) {
      if (streak > 0) {
        streakEl.textContent = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> ${streak} day${streak > 1 ? 's' : ''}`;
      } else {
        streakEl.textContent = 'Start your streak!';
      }
    }

    // --- Outcome-specific emoji, heading, subhead, coaching ---
    let emoji: string, heading: string, subhead: string, coaching: string;

    switch (outcome) {
      case 'Completed':
        emoji = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
        heading = 'Nailed it!';
        subhead = 'You showed up and delivered. Here\'s your win:';
        if (streak > 1) {
          coaching = `You're on a <strong>${streak}-day streak</strong> — that's real momentum. Every session compounds. ${activeWhyMatters ? `Remember why you started: "${activeWhyMatters}"` : 'Keep this energy going into your next block.'}`;
        } else if (completed === total && total > 0) {
          coaching = `All ${total} checkpoints done. You set out to achieve something and you followed through. That's what growth looks like.`;
        } else {
          coaching = `You completed this session with intention. Every finished session builds confidence and sharpens your focus. Well done.`;
        }
        break;
      case 'Partial':
        emoji = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>';
        heading = 'Progress made!';
        if (total > 0) {
          subhead = `${completed} of ${total} checkpoints done — you moved forward.`;
        } else {
          subhead = 'You put in the time and showed up. That counts.';
        }
        if (streak > 1) {
          coaching = `Your <strong>${streak}-day streak</strong> is still alive because you showed up. Not every session is 100% — consistency beats perfection. ${activeWhyMatters ? `Keep "${activeWhyMatters}" close to heart.` : 'Reset, refocus, and try the next one.'}`;
        } else if (completed > 0) {
          coaching = `You got ${completed} of ${total} steps done. That's forward motion. Progress isn't always linear — the key is to keep showing up.`;
        } else {
          coaching = `Sometimes the win is just starting. Take a breath, note what distracted you, and come back with a sharper plan.`;
        }
        break;
      case 'Failed':
      default:
        emoji = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        heading = 'You tried — that matters.';
        subhead = 'Not every session is a victory lap, but every attempt teaches you something.';
        if (streak > 1) {
          coaching = `Your <strong>${streak}-day streak</strong> is paused, not erased. The habit you've built doesn't disappear overnight. Rest, reflect, and restart fresh. Growth isn't linear.`;
        } else {
          coaching = `This is just one data point, not your entire story. ${activeWhyMatters ? `Remember why "${activeWhyMatters}" matters to you. ` : ''}Even the most focused people have off days. Reset and try again.`;
        }
        break;
    }

    document.getElementById('celebration-emoji').textContent = emoji;
    document.getElementById('celebration-heading').textContent = heading;
    document.getElementById('celebration-subhead').textContent = subhead;
    document.getElementById('celebration-coaching-text').innerHTML = coaching;

    overlay.classList.remove('hidden');

    const breakBtn = document.getElementById('celebration-take-break');
    if (configuredBreakMinutes > 0) {
      breakBtn.classList.remove('hidden');
      breakBtn.textContent = `Take a ${configuredBreakMinutes}-minute break`;
    } else {
      breakBtn.classList.add('hidden');
    }
    document.getElementById('celebration-start-another').onclick = () => {
      overlay.classList.add('hidden');
      resetTimerToIdle();
    };
    breakBtn.onclick = () => {
      overlay.classList.add('hidden');
      startBreakBlock();
    };
    document.getElementById('celebration-done').onclick = () => {
      overlay.classList.add('hidden');
      resetTimerToIdle();
    };
  }

  function startBreakBlock() {
    currentSessionMode = 'break';
    timerDurationSeconds = configuredBreakMinutes * 60;
    timerRemainingSeconds = timerDurationSeconds;
    
    // Shift UI to break view
    document.getElementById('timer-session-text').textContent = 'Recharge — you\'ve earned this break';
    document.getElementById('setup-panel')?.classList.add('hidden');
    document.getElementById('active-info-panel')?.classList.remove('hidden');
    document.getElementById('active-info-panel')?.classList.add('panel-enter');
    document.getElementById('setup-panel-below-fold')?.classList.add('hidden');
    
    const activeTitle = document.getElementById('active-goal-title');
    if (activeTitle) activeTitle.textContent = "Step away, stretch, and give your mind a rest.";
    
    const activeList = document.getElementById('active-milestones-list');
    if (activeList) activeList.innerHTML = `<li class="text-xs text-mute/70 font-mono animate-pulse font-semibold">You're recharging — rest is part of the rhythm</li>`;
    
    toggleTimer(true);
  }

  // RECOVERY ADVISOR SYSTEM LOGIC
  function triggerRecoveryAdvisor(outcome: string, reason: string) {
    const panel = document.getElementById('modal-recovery-advisor');
    const recText = document.getElementById('modal-recovery-text');
    
    if (!panel || !recText) return;

    let recommendation = "";
    switch (reason) {
      case 'distraction':
        recommendation = "It happens to all of us. Try putting your phone in another room and closing tabs that aren't needed. Your next session could be a short 15-minute block — just enough to rebuild focus. <em>You've got the awareness to catch distractions, and that's already a win.</em>";
        break;
      case 'fatigue':
        recommendation = "Your brain needs a real break. Step away from the screen, stretch, splash some water on your face, and drink a glass of water. When you come back, try a lighter activity — reading or reflecting instead of creating. <em>Rest isn't weakness — it's how you stay strong for the long run.</em>";
        break;
      case 'goal-too-large':
        recommendation = "Your ambition is admirable — but big goals need small first steps. Take a short break, then pick just one tiny milestone you can finish in the next block. The only goal that matters right now is completing that first step. <em>Progress beats perfection, every time.</em>";
        break;
      case 'interruption':
        recommendation = "Life happens, and that's okay. You still made progress, and that counts. For your next block, try setting a smaller goal that works even with interruptions — or find a quieter spot if you can. <em>What matters is that you came back.</em>";
        break;
      default:
        recommendation = "Every session teaches you something. Take 5 minutes to reset, then try a shorter block with a simpler goal. <em>You're building a habit, and habits take time. Be patient with yourself.</em>";
        break;
    }

    recText.innerHTML = recommendation;
    panel.classList.remove('hidden');


  }

  // WEB AUDIO ambient noise system
  let soundButtonsRegistered = false;
  function setupSoundButtons() {
    if (soundButtonsRegistered) return;
    soundButtonsRegistered = true;
    const soundBtns = document.querySelectorAll('.sound-btn');
    const summaryBtns = document.querySelectorAll('.summary-sound-btn');

    if (!isWebAudioSupported) {
      const loadingSpinner = document.getElementById('sound-loading-spinner');
      if (loadingSpinner && loadingSpinner.parentElement) {
        const labelSpan = loadingSpinner.parentElement;
        labelSpan.innerHTML = '';
        labelSpan.appendChild(loadingSpinner);
        labelSpan.appendChild(document.createTextNode(' Web Audio Synth (Unsupported)'));
        labelSpan.classList.remove('text-link');
        labelSpan.classList.add('text-mute');
      }

      soundBtns.forEach(btn => {
        const sound = btn.getAttribute('data-sound');
        if (sound !== 'mute') {
          btn.setAttribute('disabled', 'true');
          btn.classList.add('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
        }
      });

      summaryBtns.forEach(btn => {
        const sound = btn.getAttribute('data-sound-sync');
        if (sound !== 'mute') {
          btn.setAttribute('disabled', 'true');
          btn.classList.add('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
        }
      });

      const immSoundBtn = document.getElementById('immersive-sound-btn');
      if (immSoundBtn) {
        immSoundBtn.setAttribute('disabled', 'true');
        immSoundBtn.classList.add('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
      }
    }

    soundBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const sound = target.getAttribute('data-sound') as any;
        
        if (!isWebAudioSupported && sound !== 'mute') return;

        // Skip redundant restarts if this sound is already the active sound
        if (sound === currentAmbientSound && activeSoundNode) {
          return;
        }

        soundBtns.forEach(b => { b.classList.remove('border-link', 'text-link'); b.setAttribute('aria-pressed', 'false'); });
        target.setAttribute('aria-pressed', 'true');

        currentAmbientSound = sound;
        if (sound !== 'mute') {
          lastActiveAmbientSound = sound;
        }
        
        // Sync Summary card sound buttons
        const sumBtn = document.querySelector(`.summary-sound-btn[data-sound-sync="${sound}"]`) as HTMLElement;
        if (sumBtn) {
          summaryBtns.forEach(b => b.classList.remove('border-link', 'text-link'));
          sumBtn.classList.add('border-link', 'text-link');
        }

        const statusEl = document.getElementById('immersive-sound-status');
        if (statusEl) statusEl.textContent = sound.charAt(0).toUpperCase() + sound.slice(1);
        const immSoundBtn = document.getElementById('immersive-sound-btn');
        if (immSoundBtn) immSoundBtn.setAttribute('aria-pressed', sound !== 'mute' ? 'true' : 'false');

        if (isTimerRunning) {
          playAmbientSound(sound);
        }
      });
    });

    // Summary buttons click event listeners
    summaryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const sound = target.getAttribute('data-sound-sync');
        
        if (!isWebAudioSupported && sound !== 'mute') return;

        // Forward click to corresponding primary sound button
        const actualBtn = document.querySelector(`.sound-btn[data-sound="${sound}"]`) as HTMLElement;
        actualBtn?.click();
      });
    });

    // Immersive sound toggle inside fullscreen
    const immSoundBtn = document.getElementById('immersive-sound-btn');
    immSoundBtn?.addEventListener('click', () => {
      if (!isWebAudioSupported) return;

      const soundStates: ('mute' | 'brown' | 'white' | 'rain')[] = ['mute', 'brown', 'white', 'rain'];
      let currIdx = soundStates.indexOf(currentAmbientSound);
      let nextIdx = (currIdx + 1) % soundStates.length;
      const nextSound = soundStates[nextIdx];

      // Sync normal button selections
      const matchingBtn = document.querySelector(`.sound-btn[data-sound="${nextSound}"]`) as HTMLElement;
      if (matchingBtn) matchingBtn.click();
    });

    // Resume AudioContext on user interaction to handle browser autoplay policies
    const resumeAudioCtxOnGesture = () => {
      if (isWebAudioSupported && audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(err => {
          console.warn("Failed to resume AudioContext on user gesture:", err);
        });
      }
    };
    
    document.addEventListener('click', resumeAudioCtxOnGesture, { capture: true, passive: true });
    document.addEventListener('keydown', resumeAudioCtxOnGesture, { capture: true, passive: true });
    document.addEventListener('touchstart', resumeAudioCtxOnGesture, { capture: true, passive: true });

    // Handle background tab suspension
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isTimerRunning && currentAmbientSound !== 'mute') {
        if (isWebAudioSupported && audioCtx) {
          if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(err => {
              console.warn("Failed to resume AudioContext on tab visibility change:", err);
            });
          } else if (audioCtx.state === 'interrupted' || audioCtx.state === 'closed') {
            // Browser destroyed the context — recreate and restart
            playAmbientSound(currentAmbientSound);
          }
        }
      }
    });
  }

  function playAmbientSound(type: 'mute' | 'white' | 'brown' | 'rain') {
    stopAmbientSound();
    if (type === 'mute' || !isWebAudioSupported) return;

    try {
      if (!audioCtx || audioCtx.state === 'closed' || audioCtx.state === 'interrupted') {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioCtxClass();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(err => {
          console.warn("Failed to resume AudioContext during play:", err);
        });
      }

      const spinner = document.getElementById('sound-loading-spinner');
      spinner?.classList.remove('hidden');

      const bufferSize = 2 * audioCtx.sampleRate;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === 'white') {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      } else if (type === 'brown') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + (0.02 * white)) / 1.02;
          output[i] = lastOut * 3.5;
        }
      } else if (type === 'rain') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Pink-ish filter base
          lastOut = (lastOut + (0.12 * white)) / 1.12;
          output[i] = lastOut * 2.5;

          // Rare click/crackle impulses for rain droplets
          if (Math.random() < 0.0008) {
            output[i] += (Math.random() * 0.4 - 0.2);
          }
        }
      }

      const sourceNode = audioCtx.createBufferSource();
      sourceNode.buffer = noiseBuffer;
      sourceNode.loop = true;

      // Apply Rain lowpass filter crackles
      if (type === 'rain') {
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        
        activeGainNode = audioCtx.createGain();
        activeGainNode.gain.value = 0.65;

        sourceNode.connect(filter);
        filter.connect(activeGainNode);
        activeGainNode.connect(audioCtx.destination);
      } else {
        activeGainNode = audioCtx.createGain();
        activeGainNode.gain.value = type === 'white' ? 0.25 : 0.75; // white noise is harsher

        sourceNode.connect(activeGainNode);
        activeGainNode.connect(audioCtx.destination);
      }

      sourceNode.start();
      activeSoundNode = sourceNode;
      spinner?.classList.add('hidden');
    } catch (e) {
      console.error("Synthesizer audio failed to compile", e);
      const spinner = document.getElementById('sound-loading-spinner');
      spinner?.classList.add('hidden');
    }
  }

  function stopAmbientSound() {
    if (activeSoundNode) {
      try {
        (activeSoundNode as AudioBufferSourceNode).stop();
      } catch (e) {}
      activeSoundNode = null;
    }
    if (activeGainNode) {
      activeGainNode.disconnect();
      activeGainNode = null;
    }
  }

  // Synthesize completing notification tones
  function playNotificationSynth() {
    if (!isWebAudioSupported) return;
    try {
      const ctxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new ctxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      // Close context after playback to prevent orphan AudioContext leak
      setTimeout(() => {
        ctx.close().catch(() => {});
      }, 1000);
    } catch (e) {
      console.warn("Synthesizer tone failed to play", e);
    }
  }

  // FULLSCREEN DISTRACTION-FREE VIEW
  function setupImmersiveTriggers() {
    const trigger = document.getElementById('fullscreen-trigger-btn');
    const exitBtn = document.getElementById('immersive-exit-btn');

    trigger?.addEventListener('click', enterImmersiveMode);
    exitBtn?.addEventListener('click', exitImmersiveMode);

    // Synchronize play state inside fullscreen
    const immPlayPause = document.getElementById('immersive-play-pause-btn');
    immPlayPause?.addEventListener('click', () => {
      const normalPlay = document.getElementById('play-pause-btn');
      normalPlay?.click();
    });
  }

  function enterImmersiveMode() {
    const overlay = document.getElementById('immersive-overlay');
    if (!overlay) return;

    overlay.classList.remove('immersive-hidden');
    document.body.style.overflow = 'hidden';

    // Set immersive strings
    document.getElementById('immersive-goal-title').textContent = activeGoal;
    
    const tagEl = document.getElementById('immersive-activity-tag');
    if (tagEl) {
      tagEl.textContent = selectedActivity;
      tagEl.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-soft-2 text-mute text-sm font-medium";
    }

    renderActiveMilestones();
    updateTimerDisplay();
  }

  function exitImmersiveMode() {
    const overlay = document.getElementById('immersive-overlay');
    if (!overlay) return;

    overlay.classList.add('immersive-hidden');
    document.body.style.overflow = '';
  }

  // KEYBOARD SHORTCUTS ENGINE
  let shortcutsRegistered = false;
  function setupKeyboardShortcuts() {
    if (shortcutsRegistered) return;
    shortcutsRegistered = true;

    document.addEventListener('keydown', (e) => {
      // Ignore shortcuts while typing in inputs, textareas, or contenteditable fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Space = Pause/Resume (same as clicking the play-pause button)
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling and focused button activation
        const playPauseBtn = document.getElementById('play-pause-btn');
        playPauseBtn?.click();
      }

      // F = Fullscreen
      if (e.key === 'f' || e.key === 'F') {
        const triggerBtn = document.getElementById('fullscreen-trigger-btn') as HTMLButtonElement;
        if (triggerBtn && !triggerBtn.disabled) {
          e.preventDefault();
          const overlay = document.getElementById('immersive-overlay');
          if (overlay?.classList.contains('hidden')) {
            enterImmersiveMode();
          } else {
            exitImmersiveMode();
          }
        }
      }

      // Esc = Exit Fullscreen
      if (e.key === 'Escape') {
        const overlay = document.getElementById('immersive-overlay');
        if (overlay && !overlay.classList.contains('hidden')) {
          e.preventDefault();
          exitImmersiveMode();
        }
      }

      // M = Toggle Ambient Audio
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleAmbientAudio();
      }
    });
  }

  function toggleAmbientAudio() {
    let nextSound: 'mute' | 'white' | 'brown' | 'rain';
    if (currentAmbientSound === 'mute') {
      nextSound = lastActiveAmbientSound || 'brown';
    } else {
      lastActiveAmbientSound = currentAmbientSound;
      nextSound = 'mute';
    }
    const matchingBtn = document.querySelector(`.sound-btn[data-sound="${nextSound}"]`) as HTMLElement;
    if (matchingBtn) matchingBtn.click();
  }

  // TAB VISIBILITY DRIFT ENGINE
  let visibilityListenerRegistered = false;
  function setupTabVisibilityListener() {
    if (visibilityListenerRegistered) return;
    visibilityListenerRegistered = true;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (isTimerRunning && currentSessionMode !== 'idle') {
          // Recalculate remaining seconds using expected end timestamp
          const diffMs = timerExpectedEndTimestamp - Date.now();
          timerRemainingSeconds = Math.max(0, Math.ceil(diffMs / 1000));
          
          updateTimerDisplay();

          if (timerRemainingSeconds <= 0) {
            clearInterval(timerIntervalId);
            triggerTimerCompletion();
          }
        }
      }
    });
  }

  // FOCUS VAULT (BACKUP & RESTORE)
  function setupFocusVault() {
    const exportBtn = document.getElementById('vault-export-btn');
    const importInput = document.getElementById('vault-import-input') as HTMLInputElement;
    const statusNotice = document.getElementById('vault-status-notice');

    function showStatus(msg: string, type: 'success' | 'error') {
      if (!statusNotice) return;
      statusNotice.textContent = msg;
      statusNotice.className = `text-xs mt-2 font-medium animate-in fade-in duration-200 ${type === 'success' ? 'text-success' : 'text-error'}`;
      statusNotice.classList.remove('hidden');
      setTimeout(() => {
        statusNotice.classList.add('hidden');
      }, 5000);
    }

    // 1. EXPORT USER DATA TO JSON
    exportBtn?.addEventListener('click', () => {
      try {
        const historyData = SafeStorage.getItem('tooltails-focus-history') || '[]';
        const forecastData = SafeStorage.getItem('tooltails-focus-forecast') || 'null';
        const reflectionsData = SafeStorage.getItem('tooltails-focus-reflections') || '[]';
        const journalData = SafeStorage.getItem('tooltails-focus-daily-journal') || '[]';

        const backupPayload = {
          version: "1.1",
          timestamp: new Date().toISOString(),
          data: {
            history: JSON.parse(historyData),
            forecast: JSON.parse(forecastData),
            reflections: JSON.parse(reflectionsData),
            journal: JSON.parse(journalData)
          }
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `tooltails-focus-backup-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        showStatus("Backup exported successfully!", "success");
      } catch (err) {
        if (isDev) console.error("Vault export error:", err);
        showStatus("Failed to export backup.", "error");
      }
    });

    // 2. IMPORT BACKUPS WITH INTEGRITY VALIDATION
    importInput?.addEventListener('change', (e) => {
      const file = importInput.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const rawContent = event.target?.result as string;
          const payload = JSON.parse(rawContent);

          // DATA VALIDATION LAYER
          if (!payload || typeof payload !== 'object') {
            throw new Error("Invalid backup payload format");
          }
          if (payload.version !== "1.0" && !payload.data) {
            throw new Error("Unsupported backup version or structure");
          }

          const data = payload.data;
          if (!data || typeof data !== 'object') {
            throw new Error("Backup file contains no data payload");
          }

          // Validate History Array
          if (data.history && !Array.isArray(data.history)) {
            throw new Error("Corrupted focus history block");
          }
          // Validate Reflections Array
          if (data.reflections && !Array.isArray(data.reflections)) {
            throw new Error("Corrupted reflections journal block");
          }

          // Ensure basic object structure verification on historical sessions
          if (data.history) {
            for (const item of data.history) {
              if (!item.id || !item.activity || !item.durationMinutes || !item.outcome) {
                throw new Error("Corrupted session entry in focus history");
              }
            }
          }

          // Save validated data into SafeStorage
          if (data.history) {
            SafeStorage.setItem('tooltails-focus-history', JSON.stringify(data.history));
            history = data.history;
          }
          if (data.forecast) {
            SafeStorage.setItem('tooltails-focus-forecast', JSON.stringify(data.forecast));
            activeForecastGoal = data.forecast;
          } else {
            SafeStorage.removeItem('tooltails-focus-forecast');
            activeForecastGoal = null;
          }
          if (data.reflections) {
            SafeStorage.setItem('tooltails-focus-reflections', JSON.stringify(data.reflections));
            reflections = data.reflections;
          }
          if (data.journal) {
            SafeStorage.setItem('tooltails-focus-daily-journal', JSON.stringify(data.journal));
            journalEntries = data.journal;
          }

          // Re-render UI & recalculate dashboards
          updateDashboardStats();
          renderHistoryTable();
          renderHeatmap();
          renderOutcomeDonutChart();
          renderGrowthJourney();
          renderAchievements();
          
          loadReflections();
          renderReflections();
          loadJournal();
          renderJournalEntries();
          
          loadForecastGoal();
          renderForecastEngine();
          renderWeeklyReview();

          showStatus("Backup restored successfully! Core flow data synchronized.", "success");
        } catch (err: any) {
          if (isDev) console.error("Vault import error:", err);
          showStatus(`Import failed: ${err?.message || 'Corrupted file payload'}`, "error");
        } finally {
          importInput.value = '';
        }
      };

      reader.onerror = () => {
        showStatus("Could not read backup file.", "error");
        importInput.value = '';
      };

      reader.readAsText(file);
    });
  }

  // DASHBOARD STATS CALCULATION
  function updateDashboardStats() {
    const totalSessions = history.length;
    const completedSessions = history.filter(s => s.outcome === 'Completed').length;
    const totalSeconds = history.reduce((sum, s) => sum + s.timeSpentSeconds, 0);

    // Compute Streaks
    const currentStreak = calculateDailyStreak(history);

    // Update Workspace Header badges
    const globalStreakVal = document.getElementById('global-streak-value');
    if (globalStreakVal) globalStreakVal.textContent = currentStreak.toString();

    const rate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    const globalRate = document.getElementById('global-success-rate');
    if (globalRate) globalRate.textContent = `${rate}%`;

    // Compute Focus Time Today
    const todayStr = new Date().toDateString();
    const todaySessions = history.filter(s => new Date(s.timestamp).toDateString() === todayStr);
    const todaySeconds = todaySessions.reduce((sum, s) => sum + s.timeSpentSeconds, 0);
    const todayMinutes = Math.round(todaySeconds / 60);
    let todayFocusFormatted = `${todayMinutes}m`;
    if (todayMinutes >= 60) {
      const h = Math.floor(todayMinutes / 60);
      const m = todayMinutes % 60;
      todayFocusFormatted = `${h}h ${m}m`;
    }

    // Update Workspace Today's Progress Elements
    const wsTodayFocus = document.getElementById('workspace-today-focus-time');
    if (wsTodayFocus) wsTodayFocus.textContent = todayFocusFormatted;

    const wsTodayStreak = document.getElementById('workspace-today-streak');
    if (wsTodayStreak) wsTodayStreak.innerHTML = `<span class="text-warning"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></span> ${currentStreak}d`;

    const wsTodayRate = document.getElementById('workspace-today-rate');
    if (wsTodayRate) wsTodayRate.textContent = `${rate}%`;

    // Dashboard card values
    const streakEl = document.getElementById('stat-streak');
    if (streakEl) {
      const span = streakEl.querySelector('span');
      if (span) span.textContent = currentStreak.toString();
    }

    const totalEl = document.getElementById('stat-total-sessions');
    if (totalEl) totalEl.textContent = totalSessions.toString();

    const todayFocusEl = document.getElementById('stat-today-focus');
    if (todayFocusEl) todayFocusEl.textContent = todayFocusFormatted;

    const goalsDoneEl = document.getElementById('stat-goals-completed');
    if (goalsDoneEl) goalsDoneEl.textContent = completedSessions.toString();

    // Average session length
    const avgSeconds = totalSessions > 0 ? totalSeconds / totalSessions : 0;
    const avgMinutes = Math.round(avgSeconds / 60);
    const avgEl = document.getElementById('stat-avg-session');
    if (avgEl) avgEl.textContent = avgMinutes > 0 ? `${avgMinutes}m` : '0m';

    // Most used activity
    let topActivity = '—';
    if (totalSessions > 0) {
      const activityCount = new Map<string, number>();
      history.forEach(s => activityCount.set(s.activity, (activityCount.get(s.activity) || 0) + 1));
      let maxCount = 0;
      activityCount.forEach((count, activity) => {
        if (count > maxCount) { maxCount = count; topActivity = activity; }
      });
    }
    const topActEl = document.getElementById('stat-top-activity');
    if (topActEl) topActEl.textContent = topActivity;

    // SEO / Hero statistics
    const totalMinutes = Math.round(totalSeconds / 60);
    const heroHours = Math.floor(totalMinutes / 60);
    const heroH = document.getElementById('hero-total-hours');
    if (heroH) heroH.textContent = `${heroHours}h`;
    
    const heroRate = document.getElementById('hero-success-rate');
    if (heroRate) heroRate.textContent = `${rate}%`;

    // Premium Engine stats
    const proMilestonesTotal = document.getElementById('pro-milestones-total');
    const proMilestonesRate = document.getElementById('pro-milestones-rate');
    
    const totalMilestones = history.reduce((sum, s) => sum + s.milestones.length, 0);
    const completedMilestones = history.reduce((sum, s) => sum + s.milestones.filter(m => m.completed).length, 0);
    const milestonesRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    if (proMilestonesTotal) proMilestonesTotal.textContent = totalMilestones.toString();
    if (proMilestonesRate) proMilestonesRate.textContent = `${milestonesRate}%`;

    // Refresh growth stages and badges
    renderGrowthJourney();
    renderAchievements();
    renderWeeklyChart();
    renderTodaySessionsSummary();
    renderQuickInsights();
  }

  function renderQuickInsights() {
    const container = document.getElementById('insights-panel');
    if (!container) return;

    if (history.length === 0) {
      container.innerHTML = '';
      return;
    }

    // 1. Best focus hour (hour with most completed focus minutes)
    let bestHour = -1;
    let bestHourMin = 0;
    const hourTotals: Record<number, number> = {};
    history.forEach(s => {
      const h = new Date(s.timestamp).getHours();
      hourTotals[h] = (hourTotals[h] || 0) + s.timeSpentSeconds;
    });
    Object.keys(hourTotals).forEach(h => {
      const mins = Math.round(hourTotals[parseInt(h)] / 60);
      if (mins > bestHourMin) { bestHourMin = mins; bestHour = parseInt(h); }
    });
    const bestHourLabel = bestHour >= 0
      ? `${bestHour % 12 || 12}${bestHour < 12 ? 'am' : 'pm'}`
      : '—';

    // 2. Most productive activity (by completion rate, min 2 sessions)
    const activityStatsMap: Record<string, { total: number; completed: number }> = {};
    history.forEach(s => {
      if (!activityStatsMap[s.activity]) activityStatsMap[s.activity] = { total: 0, completed: 0 };
      activityStatsMap[s.activity].total++;
      if (s.outcome === 'Completed') activityStatsMap[s.activity].completed++;
    });
    let bestActInsight = '—';
    let bestActRate = 0;
    Object.keys(activityStatsMap).forEach(a => {
      const stats = activityStatsMap[a];
      if (stats.total >= 2) {
        const rate = stats.completed / stats.total;
        if (rate > bestActRate) { bestActRate = rate; bestActInsight = a; }
      }
    });
    const bestActPct = bestActRate > 0 ? Math.round(bestActRate * 100) : 0;

    // 3. Longest streak ever (iterate sorted dates)
    const activeDates = Array.from(new Set(
      history.filter(s => s.outcome === 'Completed' || s.outcome === 'Partial')
        .map(s => s.timestamp.substring(0, 10))
    )).sort();
    let longestStreak = 0;
    let currentRun = 0;
    for (let i = 0; i < activeDates.length; i++) {
      if (i === 0) { currentRun = 1; }
      else {
        const prev = new Date(activeDates[i - 1]);
        const curr = new Date(activeDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) currentRun++;
        else { longestStreak = Math.max(longestStreak, currentRun); currentRun = 1; }
      }
    }
    longestStreak = Math.max(longestStreak, currentRun);

    // 4. Weekly focus time
    const oneWeekAgo = Date.now() - 7 * 86400000;
    const weekSessions = history.filter(s => new Date(s.timestamp).getTime() >= oneWeekAgo);
    const weekSec = weekSessions.reduce((sum, s) => sum + s.timeSpentSeconds, 0);
    const weekHours = Math.floor(weekSec / 3600);
    const weekMins = Math.floor((weekSec % 3600) / 60);
    const weekTimeText = weekHours > 0 ? `${weekHours}h ${weekMins}m` : `${weekMins}m`;

    // 5. Deep session count
    const deepSessions = history.filter(s => s.outcome === 'Completed' && s.durationMinutes >= 50).length;

    container.innerHTML = `
      <div class="bg-canvas p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-hairline/40 ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.02] space-y-5">
        <div class="flex items-center gap-2 select-none">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-link/10 to-link/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-link"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div>
            <h3 class="text-sm font-bold tracking-tight text-ink">Smart insights</h3>
            <p class="text-[11px] text-mute/50">Derived from ${history.length} session${history.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div class="insight-card bg-canvas-soft/40 rounded-2xl p-3.5 border border-hairline/15 space-y-1.5">
            <div class="flex items-center gap-1.5 text-[11px] text-mute/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Best focus hour
            </div>
            <div class="text-sm font-bold text-ink tabular-nums">${bestHourLabel}</div>
            <div class="text-[10px] text-mute/50 leading-tight">${bestHourMin > 0 ? `${bestHourMin} min of focus logged at this hour` : 'Complete a session and your best hour will appear here'}</div>
          </div>
          <div class="insight-card bg-canvas-soft/40 rounded-2xl p-3.5 border border-hairline/15 space-y-1.5">
            <div class="flex items-center gap-1.5 text-[11px] text-mute/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
              Best activity rate
            </div>
            <div class="text-sm font-bold text-ink truncate" title="${bestActInsight}">${bestActInsight}</div>
            <div class="text-[10px] text-mute/50 leading-tight">${bestActPct > 0 ? `${bestActPct}% completion rate` : 'Complete 2+ sessions in an activity to see your rate'}</div>
          </div>
          <div class="insight-card bg-canvas-soft/40 rounded-2xl p-3.5 border border-hairline/15 space-y-1.5">
            <div class="flex items-center gap-1.5 text-[11px] text-mute/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M17.687 9.581a5.87 5.87 0 0 0-4.887-2.91V3.25a.75.75 0 0 0-1.28-.53l-8.25 8.25a.75.75 0 0 0 .53 1.28h5.319v5.999a5.87 5.87 0 0 0 4.887 2.911l.248-.005a5.87 5.87 0 0 0 4.887-2.906A5.87 5.87 0 0 0 17.687 9.581Z"/></svg>
              Longest streak
            </div>
            <div class="text-sm font-bold text-ink tabular-nums">${longestStreak > 0 ? `${longestStreak} day${longestStreak !== 1 ? 's' : ''}` : '—'}</div>
            <div class="text-[10px] text-mute/50 leading-tight">${longestStreak > 0 ? 'Consecutive days with a session' : 'Focus today and come back tomorrow to start a streak'}</div>
          </div>
          <div class="insight-card bg-canvas-soft/40 rounded-2xl p-3.5 border border-hairline/15 space-y-1.5">
            <div class="flex items-center gap-1.5 text-[11px] text-mute/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
              Time this week
            </div>
            <div class="text-sm font-bold text-ink tabular-nums">${weekTimeText}</div>
            <div class="text-[10px] text-mute/50 leading-tight">${weekSessions.length} session${weekSessions.length !== 1 ? 's' : ''} ${weekSessions.length > 0 ? 'in the last 7 days' : 'this week'}</div>
          </div>
          <div class="insight-card bg-canvas-soft/40 rounded-2xl p-3.5 border border-hairline/15 space-y-1.5">
            <div class="flex items-center gap-1.5 text-[11px] text-mute/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Deep sessions
            </div>
            <div class="text-sm font-bold text-ink tabular-nums">${deepSessions}</div>
            <div class="text-[10px] text-mute/50 leading-tight">${deepSessions > 0 ? 'Sessions lasting 50+ minutes' : 'Try a longer block for deep flow'}</div>
          </div>
        </div>
      </div>
    `;
  }

  function calculateDailyStreak(sessions: FocusSession[]): number {
    if (sessions.length === 0) return 0;

    // Filter to completed/partial days
    const activeDates = new Set(sessions
      .filter(s => s.outcome === 'Completed' || s.outcome === 'Partial')
      .map(s => s.timestamp.substring(0, 10)) // YYYY-MM-DD
    );

    const sortedDates = Array.from(activeDates).sort().reverse();
    if (sortedDates.length === 0) return 0;

    const todayStr = new Date().toISOString().substring(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().substring(0, 10);

    // If no work done today or yesterday, streak is broken
    if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let currentCheck = activeDates.has(todayStr) ? new Date() : new Date(Date.now() - 86400000);

    while (true) {
      const checkStr = currentCheck.toISOString().substring(0, 10);
      if (activeDates.has(checkStr)) {
        streak++;
        // Go back 1 day
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // FOCUS HEATMAP SYSTEM (SVG contributions grid)
  function renderHeatmap() {
    const container = document.getElementById('heatmap-grid-container');
    if (!container) return;

    // We render the last 16 weeks (112 days)
    const totalDays = 16 * 7;
    const days: { dateStr: string; sessionsCount: number }[] = [];
    
    // Build days array starting from today backwards
    const now = new Date();
    // Align to the end of this week (Saturday)
    const dayOfWeek = now.getDay();
    const alignOffset = 6 - dayOfWeek;
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + alignOffset); // Align grid to end of week

    // Map history count per day
    const dayMap = new Map<string, number>();
    history.forEach(s => {
      const key = s.timestamp.substring(0, 10);
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    });

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      days.push({
        dateStr,
        sessionsCount: dayMap.get(dateStr) || 0
      });
    }

    // Split into 16 columns (weeks)
    let html = '';
    for (let w = 0; w < 16; w++) {
      html += `<div class="flex flex-col gap-1">`;
      for (let d = 0; d < 7; d++) {
        const index = w * 7 + d;
        const cell = days[index];
        const count = cell.sessionsCount;

        // Choose color density classes
        let colorClass = "bg-canvas border border-hairline hover:border-hairline-strong";
        if (count === 1) colorClass = "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/40 hover:scale-105";
        else if (count === 2) colorClass = "bg-blue-300 dark:bg-blue-700/50 border border-blue-400 dark:border-blue-600/50 hover:scale-105";
        else if (count >= 3 && count < 5) colorClass = "bg-blue-500 text-white hover:scale-105";
        else if (count >= 5) colorClass = "bg-blue-700 dark:bg-blue-300 hover:scale-105";

        const titleText = `${cell.dateStr}: ${count} session${count !== 1 ? 's' : ''} completed`;
        html += `<div class="w-2.5 h-2.5 rounded-[2px] transition-all cursor-pointer ${colorClass}" title="${titleText}"></div>`;
      }
      html += `</div>`;
    }

    container.innerHTML = html;
    animateContent(container);
  }

  // OUTCOME DONUT CHART (SVG dynamic offset mapping)
  function renderOutcomeDonutChart() {
    const cDonut = document.getElementById('donut-completed') as SVGCircleElement;
    const pDonut = document.getElementById('donut-partial') as SVGCircleElement;
    const fDonut = document.getElementById('donut-failed') as SVGCircleElement;

    if (!cDonut || !pDonut || !fDonut) return;

    const total = history.length;
    if (total === 0) {
      cDonut.style.strokeDashoffset = '251.2';
      pDonut.style.strokeDashoffset = '251.2';
      fDonut.style.strokeDashoffset = '251.2';
      
      document.getElementById('donut-center-percentage').textContent = "0%";
      document.getElementById('donut-center-label').textContent = "Start a session";
      
      document.getElementById('legend-completed-val').textContent = "0%";
      document.getElementById('legend-partial-val').textContent = "0%";
      document.getElementById('legend-failed-val').textContent = "0%";
      return;
    }

    const completed = history.filter(s => s.outcome === 'Completed').length;
    const partial = history.filter(s => s.outcome === 'Partial').length;
    const failed = history.filter(s => s.outcome === 'Failed').length;

    const cPercent = completed / total;
    const pPercent = partial / total;
    const fPercent = failed / total;

    // Circumference = 2 * Math.PI * r = 2 * 3.14159 * 40 = 251.2
    const totalCirc = 251.2;

    // Set offsets (stacked segments)
    const cStroke = cPercent * totalCirc;
    const pStroke = pPercent * totalCirc;
    const fStroke = fPercent * totalCirc;

    // Completed starts at offset 0 (which maps to full 251.2)
    cDonut.style.strokeDasharray = `${totalCirc}`;
    cDonut.style.strokeDashoffset = `${totalCirc - cStroke}`;

    // Partial starts immediately after Completed
    pDonut.style.strokeDasharray = `${totalCirc}`;
    pDonut.style.strokeDashoffset = `${totalCirc - pStroke}`;
    pDonut.style.transform = `rotate(${cPercent * 360}deg)`;

    // Failed starts immediately after Partial
    fDonut.style.strokeDasharray = `${totalCirc}`;
    fDonut.style.strokeDashoffset = `${totalCirc - fStroke}`;
    fDonut.style.transform = `rotate(${(cPercent + pPercent) * 360}deg)`;

    // Center stats percentage
    const successRate = Math.round(cPercent * 100);
    document.getElementById('donut-center-percentage').textContent = `${successRate}%`;
    document.getElementById('donut-center-label').textContent = "Success";

    // Legend percentages
    document.getElementById('legend-completed-val').textContent = `${Math.round(cPercent * 100)}%`;
    document.getElementById('legend-partial-val').textContent = `${Math.round(pPercent * 100)}%`;
    document.getElementById('legend-failed-val').textContent = `${Math.round(fPercent * 100)}%`;
  }

  // WEEKLY FOCUS CHART (SVG bar chart for 7 days)
  function renderWeeklyChart() {
    const svg = document.getElementById('weekly-chart-svg');
    if (!svg) return;

    const days: { label: string; completed: number; partial: number; failed: number; total: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      const daySessions = history.filter(s => s.timestamp.substring(0, 10) === dateStr);
      const completed = daySessions.filter(s => s.outcome === 'Completed').reduce((sum, s) => sum + s.timeSpentSeconds, 0);
      const partial = daySessions.filter(s => s.outcome === 'Partial').reduce((sum, s) => sum + s.timeSpentSeconds, 0);
      const failed = daySessions.filter(s => s.outcome === 'Failed').reduce((sum, s) => sum + s.timeSpentSeconds, 0);
      const total = completed + partial + failed;
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      days.push({ label, completed, partial, failed, total });
    }

    const maxVal = Math.max(...days.map(d => d.total), 1);
    const barWidth = 52;
    const barGap = 28;
    const chartHeight = 150;
    const baseY = 170;
    const startX = 50;

    // Grid line
    let grid = '';
    for (let g = 0; g <= 4; g++) {
      const gy = baseY - (g / 4) * chartHeight;
      grid += `<line x1="${startX - 10}" y1="${gy}" x2="${startX + 7 * (barWidth + barGap) + 10}" y2="${gy}" stroke="var(--color-hairline)" stroke-width="1" opacity="0.3"/>`;
    }

    let bars = '';
    days.forEach((day, i) => {
      const x = startX + i * (barWidth + barGap);
      const cH = maxVal > 0 ? (day.completed / maxVal) * chartHeight : 0;
      const pH = maxVal > 0 ? (day.partial / maxVal) * chartHeight : 0;
      const fH = maxVal > 0 ? (day.failed / maxVal) * chartHeight : 0;
      const totalH = cH + pH + fH;

      const minutes = Math.round(day.total / 60);
      const labelY = baseY + 16;
      const isToday = i === 6;

      bars += `
        <g class="group">
          <rect x="${x}" y="${baseY - totalH}" width="${barWidth}" height="${totalH || 2}" rx="6" fill="var(--color-hairline)" opacity="0.08"/>
          ${cH > 0 ? `<rect x="${x}" y="${baseY - cH}" width="${barWidth}" height="${cH}" rx="4" fill="var(--color-link)" opacity="0.75"/>
            <rect x="${x}" y="${baseY - cH}" width="${barWidth}" height="${Math.min(cH, 4)}" rx="2" fill="var(--color-link)" opacity="0.3"/>` : ''}
          ${pH > 0 ? `<rect x="${x}" y="${baseY - cH - pH}" width="${barWidth}" height="${pH}" rx="3" fill="var(--color-warning)" opacity="0.55"/>` : ''}
          ${fH > 0 ? `<rect x="${x}" y="${baseY - totalH}" width="${barWidth}" height="${fH}" rx="3" fill="var(--color-error)" opacity="0.35"/>` : ''}
          <text x="${x + barWidth / 2}" y="${labelY}" text-anchor="middle" fill="var(--color-mute)" font-size="10" font-family="system-ui" font-weight="${isToday ? '600' : '400'}">${day.label}</text>
          <text x="${x + barWidth / 2}" y="${labelY + 14}" text-anchor="middle" fill="var(--color-ink)" font-size="10" font-weight="600" font-family="system-ui" class="tabular-nums" opacity="${totalH > 0 ? '1' : '0.3'}">${minutes}m</text>
          ${isToday ? `<line x1="${x - 4}" y1="${baseY - totalH - 6}" x2="${x + barWidth + 4}" y2="${baseY - totalH - 6}" stroke="var(--color-link)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>` : ''}
          <rect x="${x}" y="${baseY - totalH}" width="${barWidth}" height="${totalH || 2}" rx="6" fill="transparent" class="cursor-pointer"/>
        </g>`;
    });

    svg.innerHTML = grid + bars;
  }

  // HISTORY LOG VIEW TABLE
  function renderHistoryTable() {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    if (history.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-14 text-center">
            <div class="flex flex-col items-center justify-center gap-4 max-w-xs mx-auto animate-in fade-in duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-mute/20"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <div class="space-y-1">
                <p class="text-sm font-semibold text-mute/60">Set a goal. Focus. Make progress.</p>
                <p class="text-xs text-mute/40 leading-relaxed">Set a meaningful goal, start the timer, and build momentum. Every session you complete adds a story to your history.</p>
              </div>
            </div>
          </td>
        </tr>
      `;
      animateContent(tbody);
      return;
    }

    // Update count badge
    const badge = document.getElementById('history-count-badge');
    if (badge) badge.textContent = `${history.length} session${history.length !== 1 ? 's' : ''}`;

    tbody.innerHTML = history.map((s, idx) => {
      const date = new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      let outcomeBadge = '';
      if (s.outcome === 'Completed') {
        outcomeBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-b from-emerald-500/12 to-emerald-500/8 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-full ring-1 ring-inset ring-emerald-500/15"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><polyline points="20 6 9 17 4 12"/></svg>Completed</span>`;
      } else if (s.outcome === 'Partial') {
        outcomeBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-b from-warning/12 to-warning/8 text-warning text-[11px] font-bold rounded-full ring-1 ring-inset ring-warning/15"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Partial</span>`;
      } else {
        outcomeBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-b from-error/12 to-error/8 text-error text-[11px] font-bold rounded-full ring-1 ring-inset ring-error/15"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Failed</span>`;
      }

      return `
        <tr class="history-row hover:bg-canvas-soft/50 group border-b border-hairline/20 transition-all duration-150">
          <td class="py-3.5 px-4 font-medium text-mute font-mono text-[11px]">${date}</td>
          <td class="py-3.5 px-4">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-canvas-soft/70 border border-hairline/20 ${getActivityColorClass(s.activity)}">${s.activity}</span>
          </td>
          <td class="py-3.5 px-4 max-w-[200px] truncate" title="${s.goal}">
            <div class="font-medium text-ink text-xs truncate">${s.goal}</div>
            ${s.notes ? `<div class="text-[11px] text-mute/50 truncate mt-0.5 italic">${s.notes}</div>` : ''}
          </td>
          <td class="py-3.5 px-4 text-center">${outcomeBadge}</td>
          <td class="py-3.5 px-4 font-mono text-[11px] text-mute/60">${s.durationMinutes} min</td>
          <td class="py-3.5 px-4 text-right">
            <button type="button" class="w-11 h-11 rounded-lg text-mute/40 hover:text-error hover:bg-error/5 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer delete-history-row-btn flex items-center justify-center" data-index="${idx}" aria-label="Delete history entry">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
    animateContent(tbody);

    // Attach row deletes
    tbody.querySelectorAll('.delete-history-row-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0');
        TooltailsModal.confirm("Delete this focus log entry?", { destructive: true }).then(confirmed => {
          if (confirmed) {
            history.splice(index, 1);
            saveHistory();
            renderHistoryTable();
            renderHeatmap();
            renderOutcomeDonutChart();
          }
        });
      });
    });
  }

  // DEMO MOCK SEEDING & CLEARING METHODS
  function setupHistoryHelpers() {
    const seedBtn = document.getElementById('seed-mock-btn');
    const clearBtn = document.getElementById('clear-history-btn');
    const reportBtn = document.getElementById('generate-report-btn');

    seedBtn?.addEventListener('click', () => {
      TooltailsModal.confirm("This will seed mock demonstration logs from the last 30 days to preview the heatmap and charts. Proceed?").then(confirmed => {
        if (confirmed) {
          seedMockData();
        }
      });
    });

    clearBtn?.addEventListener('click', () => {
      TooltailsModal.confirm("Permanently wipe all focus history and streaks?", { destructive: true }).then(confirmed => {
        if (confirmed) {
          history = [];
          saveHistory();
          renderHistoryTable();
          renderHeatmap();
          renderOutcomeDonutChart();
          updateDashboardStats();
        }
      });
    });

    reportBtn?.addEventListener('click', () => {
      generateMonthlyGrowthReport();
    });
  }

  function seedMockData() {
    const mockActivities = ['Coding', 'Study', 'Reading', 'Writing', 'Art'];
    const mockGoals = [
      'Refactor state hook architecture',
      'Read 2 chapters of Designing Data-Intensive Apps',
      'Draft newsletter outline and edits',
      'Paint landscape lighting studies',
      'Optimize database queries for Vercel deployment',
      'Review layout design guide principles',
      'Write technical summary of markdown templates',
      'Practice drawing anatomy shapes',
      'Learn about Web Audio oscillators and nodes'
    ];
    const outcomes: ('Completed' | 'Partial' | 'Failed')[] = ['Completed', 'Completed', 'Completed', 'Partial', 'Failed', 'Completed', 'Partial', 'Completed'];
    const reasons = ['distraction', 'fatigue', 'goal-too-large', 'interruption'];

    const mockHistory: FocusSession[] = [];
    const now = Date.now();

    // Generate 32 mock entries spread across 30 days
    for (let i = 0; i < 32; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = new Date(now - (daysAgo * 86400000) - (hoursAgo * 3600000)).toISOString();

      const activity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
      const goal = mockGoals[Math.floor(Math.random() * mockGoals.length)];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      const duration = [25, 25, 50, 50, 90][Math.floor(Math.random() * 5)];
      
      const session: FocusSession = {
        id: Math.random().toString(36).substr(2, 9),
        activity,
        goal,
        milestones: [
          { text: 'Understand core logic', completed: outcome === 'Completed' || (outcome === 'Partial' && Math.random() > 0.4) },
          { text: 'Develop implementation draft', completed: outcome === 'Completed' },
          { text: 'Test code parameters', completed: outcome === 'Completed' && Math.random() > 0.2 }
        ],
        durationMinutes: duration,
        timeSpentSeconds: outcome === 'Completed' ? duration * 60 : Math.floor(Math.random() * duration * 60),
        outcome,
        failedReason: outcome !== 'Completed' ? reasons[Math.floor(Math.random() * reasons.length)] : undefined,
        notes: outcome === 'Failed' ? 'Got derailed by slack notifications.' : outcome === 'Partial' ? 'Made decent progress, but got pulled into a meeting.' : 'Perfect flow, got it completed early.',
        timestamp
      };

      mockHistory.push(session);
    }

    // Sort chronologically reverse
    mockHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    history = mockHistory;
    saveHistory();
    
    // Refresh panels
    renderHistoryTable();
    renderHeatmap();
    renderOutcomeDonutChart();
    renderWeeklyChart();
    updateDashboardStats();

    // Trigger positive notification
    TooltailsModal.toast("Mock focus records seeded! Charts and analytics updated.", 5000);
  }

  function downloadHistoryCSV() {
    if (history.length === 0) {
      TooltailsModal.alert("Your focus story hasn't been written yet. Complete a few sessions first, then come back to export your progress.");
      return;
    }

    let csv = "ID,Timestamp,Activity,Goal,Duration(min),Outcome,Blocker,Notes\n";
    history.forEach(s => {
      const row = [
        s.id,
        s.timestamp,
        `"${s.activity}"`,
        `"${s.goal.replace(/"/g, '""')}"`,
        s.durationMinutes,
        s.outcome,
        s.failedReason || '',
        `"${(s.notes || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tooltails_focus_report_${new Date().toISOString().substring(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // FOCUS FORECAST SYSTEM STATE
  interface ProgressLog {
    id: string;
    timestamp: string;
    value: number;
    notes?: string;
  }

  interface ForecastGoal {
    id: string;
    title: string;
    targetValue: number;
    unit: string;
    startDate: string;
    endDate: string;
    logs: ProgressLog[];
  }

  let activeForecastGoal: ForecastGoal | null = null;

  function loadForecastGoal() {
    try {
      const stored = SafeStorage.getItem('tooltails-focus-forecast');
      if (stored) {
        activeForecastGoal = JSON.parse(stored);
      }
    } catch (e) {
      if (isDev) console.error("Failed to parse forecast goal", e);
    }
  }

  function saveForecastGoal() {
    if (activeForecastGoal) {
      SafeStorage.setItem('tooltails-focus-forecast', JSON.stringify(activeForecastGoal));
    } else {
      SafeStorage.removeItem('tooltails-focus-forecast');
    }
  }

  function renderForecastEngine() {
    const container = document.getElementById('forecast-engine-panel');
    const analyticsContainer = document.getElementById('analytics-forecast-panel');
    if (!container) return;

    if (!activeForecastGoal) {
      // Render setup form in premium tab
      const todayStr = new Date().toISOString().substring(0, 10);
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

      container.innerHTML = `
        <div class="bg-canvas p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-hairline/40 ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.02] space-y-6">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-mute/60" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <h3 class="text-2xl font-bold tracking-tighter text-ink mb-1">Track your long-term goals</h3>
          </div>
          <p class="text-xs text-body leading-relaxed max-w-xl">
            Working toward something bigger? Set a target — like reading 300 pages, solving 50 problems, or writing for 30 hours. We'll track your pace and show you when you're on track to finish.
          </p>
          
          <form id="forecast-setup-form" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div class="space-y-1.5 md:col-span-2">
              <label for="forecast-title" class="block text-xs font-medium text-mute tracking-tight">Goal objective</label>
              <input type="text" id="forecast-title" required class="w-full h-11 px-3 bg-canvas-soft border border-transparent rounded-sm text-xs text-ink placeholder:text-mute/45 focus:outline-none focus:bg-canvas focus:border-link/30 focus:ring-2 focus:ring-link/5 transition-all duration-200 shadow-sm" placeholder="e.g. Read 300 pages of Designing Data-Intensive Applications" />
            </div>
            
            <div class="space-y-1.5">
              <label for="forecast-target" class="block text-xs font-medium text-mute tracking-tight">Target value (quantity)</label>
              <input type="number" id="forecast-target" min="0.1" step="any" required class="w-full h-11 px-3 bg-canvas-soft border border-transparent rounded-sm text-xs text-ink placeholder:text-mute/45 focus:outline-none focus:bg-canvas focus:border-link/30 focus:ring-2 focus:ring-link/5 transition-all duration-200 shadow-sm" placeholder="e.g. 300" />
            </div>
            
            <div class="space-y-1.5">
              <label for="forecast-unit" class="block text-xs font-medium text-mute tracking-tight">Unit of measure</label>
              <input type="text" id="forecast-unit" required class="w-full h-11 px-3 bg-canvas-soft border border-transparent rounded-sm text-xs text-ink placeholder:text-mute/45 focus:outline-none focus:bg-canvas focus:border-link/30 focus:ring-2 focus:ring-link/5 transition-all duration-200 shadow-sm" placeholder="e.g. pages, problems, hours, paintings" />
            </div>

            <div class="space-y-1.5">
              <label for="forecast-start-date" class="block text-xs font-medium text-mute tracking-tight">Start date</label>
              <input type="date" id="forecast-start-date" value="${todayStr}" required class="w-full h-11 px-3 bg-canvas-soft border border-transparent rounded-sm text-sm text-ink focus:outline-none focus:bg-canvas focus:border-link/30 focus:ring-2 focus:ring-link/5 transition-all duration-200 shadow-sm" />
            </div>

            <div class="space-y-1.5">
              <label for="forecast-end-date" class="block text-xs font-medium text-mute tracking-tight">Target deadline</label>
              <input type="date" id="forecast-end-date" value="${thirtyDaysLater}" required class="w-full h-11 px-3 bg-canvas-soft border border-transparent rounded-sm text-sm text-ink focus:outline-none focus:bg-canvas focus:border-link/30 focus:ring-2 focus:ring-link/5 transition-all duration-200 shadow-sm" />
            </div>
            
            <div class="md:col-span-2 pt-2 flex justify-end">
              <button type="submit" class="w-full md:w-auto px-5 h-11 bg-link text-white hover:bg-link-hover hover:shadow-lg hover:shadow-link/20 active:scale-[0.98] text-sm font-bold rounded-sm border border-link/25 transition-all cursor-pointer">
                Start Forecast Tracking
              </button>
            </div>
          </form>
        </div>
      `;
      animateContent(container);

      // Render promo card in analytics tab
      if (analyticsContainer) {
        analyticsContainer.innerHTML = `
          <div class="bg-canvas p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-hairline/40 ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-5 select-none animate-in fade-in duration-200">
            <div class="flex items-start gap-4">
              <div class="p-3 bg-canvas-soft-2 rounded-full text-mute/60 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div class="space-y-1 text-left">
                <h3 class="text-sm font-semibold text-ink">Track a long-term goal</h3>
                <p class="text-xs text-mute max-w-xl leading-relaxed">
                  Working toward something bigger? Set a target in the Journal tab and we'll help you stay on pace.
                </p>
              </div>
            </div>
            <button type="button" class="w-full md:w-auto px-4 h-11 bg-link text-white hover:bg-link-hover hover:shadow-lg hover:shadow-link/20 active:scale-[0.98] text-xs font-bold rounded-sm border border-link/25 transition-all cursor-pointer whitespace-nowrap" onclick="switchTab('premium')">
              Start Goal Track
            </button>
          </div>
        `;
        animateContent(analyticsContainer);
      }

      // Set up form submission handler
      const setupForm = document.getElementById('forecast-setup-form');
      setupForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = (document.getElementById('forecast-title') as HTMLInputElement).value.trim();
        const target = parseFloat((document.getElementById('forecast-target') as HTMLInputElement).value);
        const unit = (document.getElementById('forecast-unit') as HTMLInputElement).value.trim();
        const startVal = (document.getElementById('forecast-start-date') as HTMLInputElement).value;
        const endVal = (document.getElementById('forecast-end-date') as HTMLInputElement).value;
        
        if (new Date(endVal) < new Date(startVal)) {
          TooltailsModal.toast("Deadline cannot be before the start date!", 4000);
          return;
        }

        activeForecastGoal = {
          id: Math.random().toString(36).substr(2, 9),
          title,
          targetValue: target,
          unit,
          startDate: startVal,
          endDate: endVal,
          logs: []
        };
        
        saveForecastGoal();
        renderForecastEngine();
        if (typeof gtag !== 'undefined') gtag('event', 'forecast_goal_created', { title, targetValue: target, unit });
      });
      return;
    }

    // Helper functions for date formating
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatDateShort = (dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    // Calculate parameters
    const dStart = new Date(activeForecastGoal.startDate + 'T00:00:00');
    const dEnd = new Date(activeForecastGoal.endDate + 'T00:00:00');
    const dToday = new Date(); dToday.setHours(0,0,0,0);
    
    const diffTimeTotal = dEnd.getTime() - dStart.getTime();
    const daysTotal = Math.max(1, Math.ceil(diffTimeTotal / (1000 * 60 * 60 * 24)) + 1); // +1 inclusive
    
    const diffTimeElapsed = dToday.getTime() - dStart.getTime();
    const daysElapsed = Math.max(1, Math.floor(diffTimeElapsed / (1000 * 60 * 60 * 24)) + 1); // +1 inclusive
    
    const diffTimeRemaining = dEnd.getTime() - dToday.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTimeRemaining / (1000 * 60 * 60 * 24))); // days left from tomorrow onwards
    
    // Progress sums
    const currentProgress = activeForecastGoal.logs.reduce((acc, log) => acc + log.value, 0);
    const pctComplete = Math.min(100, Math.round((currentProgress / activeForecastGoal.targetValue) * 100));
    
    // Pace calculations
    // Current Pace: units per day elapsed
    const currentPace = currentProgress / daysElapsed;
    
    // Required Pace: units per day remaining to reach target
    const remainingTarget = Math.max(0, activeForecastGoal.targetValue - currentProgress);
    const requiredPace = daysRemaining > 0 ? remainingTarget / daysRemaining : remainingTarget;
    
    // Forecast completion
    let forecastedDateStr = "Indefinite";
    let forecastRelativeText = "Cannot estimate (velocity is 0)";
    let forecastLabelColor = "text-mute";
    let isAhead = false;
    let isBehind = false;
    let isOnTrack = true;
    
    if (currentProgress >= activeForecastGoal.targetValue) {
      forecastedDateStr = "Completed!";
      forecastRelativeText = "Goal achieved successfully!";
      forecastLabelColor = "text-emerald-500 font-semibold";
    } else if (currentPace > 0) {
      const remainingDaysForecasted = remainingTarget / currentPace;
      const forecastedFinishTime = dToday.getTime() + (remainingDaysForecasted * 24 * 60 * 60 * 1000);
      const forecastedDate = new Date(forecastedFinishTime);
      forecastedDateStr = forecastedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      
      const forecastDiffTime = forecastedDate.getTime() - dEnd.getTime();
      const forecastDiffDays = Math.round(forecastDiffTime / (1000 * 60 * 60 * 24));
      
      if (forecastDiffDays < 0) {
        forecastRelativeText = `${Math.abs(forecastDiffDays)} day${Math.abs(forecastDiffDays) !== 1 ? 's' : ''} ahead of deadline`;
        forecastLabelColor = "text-emerald-500 font-semibold";
      } else if (forecastDiffDays > 0) {
        forecastRelativeText = `${forecastDiffDays} day${forecastDiffDays !== 1 ? 's' : ''} behind deadline`;
        forecastLabelColor = "text-rose-500 font-semibold";
      } else {
        forecastRelativeText = "On target to finish exactly on deadline";
        forecastLabelColor = "text-link font-semibold";
      }
    }
    
    // Expected progress today
    const expectedDailyPace = activeForecastGoal.targetValue / daysTotal;
    const expectedProgressToday = Math.min(activeForecastGoal.targetValue, expectedDailyPace * daysElapsed);
    
    const scheduleVariance = currentProgress - expectedProgressToday;
    let statusText = "On Track";
    let statusColorClasses = "text-link bg-link/10 border border-link/20";
    let statusDotClasses = "bg-link";
    
    if (currentProgress >= activeForecastGoal.targetValue) {
      statusText = "Completed";
      statusColorClasses = "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
      statusDotClasses = "bg-emerald-500";
    } else {
      // Pace ratio check
      const paceRatio = expectedProgressToday > 0 ? (currentProgress / expectedProgressToday) : 1;
      if (paceRatio >= 1.05) {
        statusText = "Ahead";
        statusColorClasses = "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
        statusDotClasses = "bg-emerald-500";
        isAhead = true;
        isOnTrack = false;
      } else if (paceRatio < 0.95) {
        statusText = "Behind";
        statusColorClasses = "text-rose-500 bg-rose-500/10 border border-rose-500/20";
        statusDotClasses = "bg-rose-500";
        isBehind = true;
        isOnTrack = false;
      }
    }

    const scheduleVarianceText = scheduleVariance >= 0 
      ? `+${Math.round(scheduleVariance)} ${activeForecastGoal.unit} ahead of schedule`
      : `${Math.round(Math.abs(scheduleVariance))} ${activeForecastGoal.unit} behind schedule`;

    const daysRemainingText = daysRemaining > 0 
      ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`
      : `Deadline passed`;

    const requiredPaceText = daysRemaining > 0
      ? `Must average to hit deadline`
      : `Goal is overdue`;

    const progressBarGradient = isBehind
      ? "from-rose-500 to-rose-400"
      : (currentProgress >= activeForecastGoal.targetValue || isAhead)
        ? "from-emerald-500 to-emerald-400"
        : "from-link to-blue-400";
    
    // Timeline percentage markers for rendering
    const timePct = Math.min(100, Math.max(0, Math.round((daysElapsed / daysTotal) * 100)));
    const progressPct = Math.min(100, Math.max(0, Math.round((currentProgress / activeForecastGoal.targetValue) * 100)));
    const expectedPct = Math.min(100, Math.max(0, Math.round((expectedProgressToday / activeForecastGoal.targetValue) * 100)));

    let verdictText = "";
    if (currentProgress >= activeForecastGoal.targetValue) {
      verdictText = `Congratulations! You have completed your goal of <strong>${activeForecastGoal.targetValue} ${activeForecastGoal.unit}</strong> early. Keep logging if you wish to exceed your target!`;
    } else if (daysRemaining <= 0) {
      verdictText = `The deadline has passed. You completed <strong>${currentProgress} / ${activeForecastGoal.targetValue} ${activeForecastGoal.unit}</strong>. Reset your goal to create a fresh tracking engine.`;
    } else if (isBehind) {
      verdictText = `You are currently behind schedule by <strong>${Math.abs(Math.round(scheduleVariance))} ${activeForecastGoal.unit}</strong>. To catch up by the deadline, you must increase your pace to <strong>${requiredPace.toFixed(1)} ${activeForecastGoal.unit}/day</strong> (current pace is ${currentPace.toFixed(1)} ${activeForecastGoal.unit}/day).`;
    } else if (isAhead) {
      verdictText = `Excellent work! You are currently ahead of schedule by <strong>${Math.round(scheduleVariance)} ${activeForecastGoal.unit}</strong>. At your current velocity, you will finish around <strong>${forecastedDateStr}</strong>. Keep it up!`;
    } else {
      verdictText = `You are precisely on track! Your current velocity of <strong>${currentPace.toFixed(1)} ${activeForecastGoal.unit}/day</strong> aligns with your expected pace of <strong>${expectedDailyPace.toFixed(1)} ${activeForecastGoal.unit}/day</strong>. You are projected to finish on schedule.`;
    }

    let logsHTML = "";
    if (activeForecastGoal.logs.length === 0) {
      logsHTML = `<div class="py-10 text-center">
        <div class="flex flex-col items-center justify-center gap-3 max-w-xs mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-mute/20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <div class="space-y-0.5">
            <p class="text-sm font-semibold text-mute/60">Ready to log your first step</p>
            <p class="text-xs text-mute/40 leading-relaxed">Add a progress entry above to see your pace. Every data point brings you closer to your goal.</p>
          </div>
        </div>
      </div>`;
    } else {
      logsHTML = activeForecastGoal.logs.map((log) => {
        const logDate = new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const noteText = log.notes ? `<div class="text-body italic text-[11px] mt-0.5">${log.notes}</div>` : '';
        return `
          <div class="py-2.5 flex items-start justify-between gap-4">
            <div class="space-y-0.5">
              <div class="font-bold text-ink">+${log.value} ${activeForecastGoal!.unit}</div>
              <div class="text-xs text-mute font-mono">${logDate}</div>
              ${noteText}
            </div>
            <button type="button" class="delete-forecast-log-btn text-mute hover:text-error min-h-[44px] min-w-[44px] flex items-center justify-center p-1 transition-colors cursor-pointer" data-id="${log.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        `;
      }).join("");
    }

    // Render workspace view in premium tab
    container.innerHTML = `
      <div class="bg-canvas p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-hairline/40 ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.02] space-y-6">
        <!-- Header: Title, Deadline, Status, and Reset -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline/30 pb-5">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-2xl font-bold tracking-tighter text-ink mb-1" id="goal-display-title">${activeForecastGoal.title}</h3>
              <span class="${statusColorClasses} px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1.5 animate-in zoom-in-95 duration-200">
                <span class="w-1.5 h-1.5 rounded-full ${statusDotClasses}"></span>
                ${statusText}
              </span>
            </div>
            <p class="text-xs text-mute flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-mute" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Timeframe: ${formatDate(activeForecastGoal.startDate)} to ${formatDate(activeForecastGoal.endDate)} (${daysTotal} days total) • ${daysRemainingText}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" id="reset-forecast-btn" class="px-3 h-11 border border-hairline hover:bg-canvas-soft text-xs text-body font-medium rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-mute" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              Reset Goal
            </button>
          </div>
        </div>

        <!-- Main Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Progress Summary -->
          <div class="bg-canvas rounded-2xl border border-hairline/15 p-3.5 text-center space-y-1">
            <div class="text-[11px] text-mute">Total progress</div>
            <div class="text-xl font-bold text-ink">${currentProgress} / ${activeForecastGoal.targetValue}</div>
            <div class="text-xs text-mute font-medium">${pctComplete}% Completed</div>
          </div>
          
          <!-- Current Velocity -->
          <div class="bg-canvas rounded-2xl border border-hairline/15 p-3.5 text-center space-y-1">
            <div class="text-[11px] text-mute">Current velocity</div>
            <div class="text-xl font-bold text-ink">${currentPace.toFixed(1)} <span class="text-xs font-normal text-body">${activeForecastGoal.unit}/day</span></div>
            <div class="text-xs text-mute font-medium">Over last ${daysElapsed} day${daysElapsed !== 1 ? 's' : ''}</div>
          </div>

          <!-- Required Velocity -->
          <div class="bg-canvas rounded-2xl border border-hairline/15 p-3.5 text-center space-y-1">
            <div class="text-[11px] text-mute">Required velocity</div>
            <div class="text-xl font-bold text-ink">${requiredPace.toFixed(1)} <span class="text-xs font-normal text-body">${activeForecastGoal.unit}/day</span></div>
            <div class="text-xs text-mute font-medium">${requiredPaceText}</div>
          </div>

          <!-- Forecasted Date -->
          <div class="bg-canvas rounded-2xl border border-hairline/15 p-3.5 text-center space-y-1">
            <div class="text-[11px] text-mute">Forecasted completion</div>
            <div class="text-xl font-bold text-ink">${forecastedDateStr}</div>
            <div class="text-[10px] ${forecastLabelColor} font-medium">${forecastRelativeText}</div>
          </div>
        </div>

        <!-- Linear Schedule Timeline Visualizer -->
        <div class="bg-canvas-soft/30 rounded-2xl p-4 md:p-5 space-y-4">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-ink">Schedule Alignment Timeline</span>
            <span class="text-mute font-mono text-xs">${scheduleVarianceText}</span>
          </div>
          
          <div class="relative pt-6 pb-6 px-1">
            <!-- Upper Track: Time Progress (Start -> Today -> Deadline) -->
            <div class="relative h-1.5 bg-hairline rounded-full mb-8">
              <!-- Start Label -->
              <div class="absolute -top-5 left-0 text-xs font-mono text-mute">${formatDateShort(activeForecastGoal.startDate)}</div>
              <!-- Deadline Label -->
              <div class="absolute -top-5 right-0 text-xs font-mono text-mute">${formatDateShort(activeForecastGoal.endDate)} (Deadline)</div>
              
              <!-- Timeline Fill up to Today -->
              <div class="absolute top-0 left-0 h-full bg-body/20 rounded-full" style="width: ${timePct}%"></div>
              
              <!-- Today Indicator Pin -->
              <div class="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style="left: ${timePct}%">
                <div class="w-3 h-3 rounded-full bg-body border-2 border-canvas shadow-sm"></div>
                <span class="absolute top-4 text-xs font-mono text-ink font-bold whitespace-nowrap bg-canvas px-1.5 py-0.5 border border-hairline rounded shadow-sm max-w-[100px] sm:max-w-none truncate sm:overflow-visible">Today (${timePct}% of time)</span>
              </div>
            </div>
            
            <!-- Lower Track: Progress Value (0 -> Expected Today -> Actual Progress -> Target) -->
            <div class="relative h-2.5 bg-hairline rounded-full">
              <!-- Min Value Label -->
              <div class="absolute top-4 left-0 text-xs font-mono text-mute">0 ${activeForecastGoal.unit}</div>
              <!-- Target Value Label -->
              <div class="absolute top-4 right-0 text-xs font-mono text-ink font-bold">${activeForecastGoal.targetValue} ${activeForecastGoal.unit}</div>
              
              <!-- Actual Progress Fill -->
              <div class="absolute top-0 left-0 h-full bg-gradient-to-r ${progressBarGradient} rounded-full" style="width: ${progressPct}%"></div>
              
              <!-- Expected Progress Marker (Vertical Dashed Pin) -->
              <div class="absolute top-1/2 -translate-y-1/2 h-6 w-0.5 border-r-2 border-dashed border-mute/60" style="left: ${expectedPct}%">
                <span class="absolute -top-6 -translate-x-1/2 text-xs font-mono text-mute whitespace-nowrap bg-canvas-soft border border-hairline rounded px-1.5 py-0.5 max-w-[120px] sm:max-w-none truncate sm:overflow-visible">Expected Today: ${Math.round(expectedProgressToday)}</span>
              </div>

              <!-- Actual Progress Pin -->
              <div class="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style="left: ${progressPct}%">
                <div class="w-4 h-4 rounded-full bg-link border-2 border-canvas shadow-md"></div>
                <span class="absolute top-4 text-xs font-mono text-link font-bold whitespace-nowrap bg-canvas px-1.5 py-0.5 border border-link/25 rounded shadow-md max-w-[100px] sm:max-w-none truncate sm:overflow-visible">Actual: ${currentProgress} (${progressPct}%)</span>
              </div>
            </div>
          </div>
          
          <div class="pt-4 border-t border-hairline text-xs text-body leading-relaxed flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-mute/50 shrink-0 mt-0.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <p id="forecast-verdict-summary">
              ${verdictText}
            </p>
          </div>
        </div>

        <!-- Bottom section: Quick Progress Logger & History Log List -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <!-- Log Progress Form (Col span 2) -->
          <div class="md:col-span-2 bg-canvas p-4 md:p-6 rounded-2xl border border-hairline/30 shadow-sm space-y-5">
            <h4 class="text-sm font-semibold tracking-tighter text-ink">Log progress manual entry</h4>
            <form id="forecast-log-form" class="space-y-3">
              <div class="space-y-1.5">
                <label for="log-value" class="block text-xs font-medium text-mute tracking-tight">Amount of progress</label>
                <div class="flex items-center gap-2">
                  <input type="number" id="log-value" min="0.1" step="any" required class="flex-grow h-11 px-3 bg-canvas-soft border border-transparent rounded-sm text-xs text-ink placeholder:text-mute/45 focus:outline-none focus:bg-canvas focus:border-link/30 focus:ring-2 focus:ring-link/5 transition-all duration-200 shadow-sm" placeholder="e.g. 15" />
                  <span class="text-xs text-mute font-mono py-2 bg-canvas-soft border border-hairline rounded-sm px-3">${activeForecastGoal.unit}</span>
                </div>
              </div>
              
              <!-- Quick Log Presets -->
              <div class="flex flex-wrap gap-1.5">
                <button type="button" class="quick-log-btn px-3 py-2 min-h-[44px] bg-canvas-soft border border-hairline hover:border-link text-xs font-mono text-ink rounded transition-all active:scale-95 cursor-pointer" data-val="1">+1</button>
                <button type="button" class="quick-log-btn px-3 py-2 min-h-[44px] bg-canvas-soft border border-hairline hover:border-link text-xs font-mono text-ink rounded transition-all active:scale-95 cursor-pointer" data-val="5">+5</button>
                <button type="button" class="quick-log-btn px-3 py-2 min-h-[44px] bg-canvas-soft border border-hairline hover:border-link text-xs font-mono text-ink rounded transition-all active:scale-95 cursor-pointer" data-val="10">+10</button>
                <button type="button" class="quick-log-btn px-3 py-2 min-h-[44px] bg-canvas-soft border border-hairline hover:border-link text-xs font-mono text-ink rounded transition-all active:scale-95 cursor-pointer" data-val="25">+25</button>
                <button type="button" class="quick-log-btn px-3 py-2 min-h-[44px] bg-canvas-soft border border-hairline hover:border-link text-xs font-mono text-ink rounded transition-all active:scale-95 cursor-pointer" data-val="50">+50</button>
              </div>

              <div class="space-y-1.5">
                <label for="log-notes" class="block text-xs font-medium text-mute tracking-tight">Notes (optional)</label>
                <input type="text" id="log-notes" class="w-full h-11 px-3 bg-canvas-soft border border-transparent rounded-sm text-xs text-ink placeholder:text-mute/45 focus:outline-none focus:bg-canvas focus:border-link/30 focus:ring-2 focus:ring-link/5 transition-all duration-200 shadow-sm" placeholder="e.g. Completed chapters 3 & 4" />
              </div>

              <button type="submit" class="w-full h-11 bg-link text-white hover:bg-link-hover active:scale-[0.98] text-sm font-bold rounded-sm border border-link/25 transition-all cursor-pointer">
                Commit Log Entry
              </button>
            </form>
          </div>

          <!-- History log timeline (Col span 3) -->
          <div class="md:col-span-3 bg-canvas p-4 md:p-6 rounded-2xl border border-hairline/30 shadow-sm flex flex-col justify-between">
            <div class="space-y-3">
              <h4 class="text-sm font-semibold tracking-tighter text-ink">Progress log history</h4>
              
              <div class="max-h-52 overflow-y-auto pr-1 divide-y divide-hairline text-xs">
                ${logsHTML}
              </div>
            </div>
            
            <div class="text-xs text-mute font-mono pt-3 border-t border-hairline flex items-center justify-between">
              <span>Tracking: Local Progress</span>
              <span>${activeForecastGoal.logs.length} logged entries</span>
            </div>
          </div>
        </div>
      </div>
    `;
    animateContent(container);

    // Render summary widget in analytics tab
    if (analyticsContainer) {
      analyticsContainer.innerHTML = `
        <div class="bg-canvas p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-hairline/40 ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.02] space-y-6">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 class="text-sm font-semibold text-ink">Active Forecast Goal Progress</h3>
              <p class="text-xs text-mute/60">${activeForecastGoal.title} (${daysRemainingText})</p>
            </div>
            <span class="${statusColorClasses} px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1">
              <span class="w-1 h-1 rounded-full ${statusDotClasses}"></span>
              ${statusText === 'Completed' ? 'Completed' : statusText + ' Schedule'}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-mono text-mute">
              <span>Progress: ${currentProgress} / ${activeForecastGoal.targetValue} ${activeForecastGoal.unit}</span>
              <span class="font-bold text-ink">${pctComplete}% Completed</span>
            </div>
            <div class="w-full h-2.5 bg-hairline rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r ${progressBarGradient}" style="width: ${progressPct}%"></div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-canvas rounded-2xl border border-hairline/15 p-2.5">
              <div class="text-[11px] text-mute">Current velocity</div>
              <div class="text-sm font-bold text-ink">${currentPace.toFixed(1)} ${activeForecastGoal.unit}/day</div>
            </div>
            <div class="bg-canvas rounded-2xl border border-hairline/15 p-2.5">
              <div class="text-[11px] text-mute">Required velocity</div>
              <div class="text-sm font-bold text-ink">${requiredPace.toFixed(1)} ${activeForecastGoal.unit}/day</div>
            </div>
            <div class="bg-canvas rounded-2xl border border-hairline/15 p-2.5">
              <div class="text-[11px] text-mute">Forecasted date</div>
              <div class="text-sm font-bold text-ink">${forecastedDateStr}</div>
            </div>
            <div class="bg-canvas rounded-2xl border border-hairline/15 p-2.5">
              <div class="text-[11px] text-mute">Schedule match</div>
              <div class="text-[11px] font-bold ${scheduleVariance >= 0 ? 'text-emerald-500' : 'text-rose-500'} truncate">${scheduleVarianceText}</div>
            </div>
          </div>

          <!-- Visual timeline visualizer (mini inline version) -->
          <div class="relative pt-4 pb-4 px-1">
            <!-- Combined Track: Timeline with indicators -->
            <div class="relative h-1.5 bg-hairline rounded-full">
              <!-- Time position today -->
              <div class="absolute top-0 left-0 h-full bg-body/15 rounded-full" style="width: ${timePct}%"></div>
              
              <!-- Expected Marker -->
              <div class="absolute top-1/2 -translate-y-1/2 h-4 w-0.5 bg-mute/40 -translate-x-1/2" style="left: ${expectedPct}%" title="Expected Progress Today"></div>
              
              <!-- Actual Progress Pin -->
              <div class="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-link border-2 border-canvas shadow-sm -translate-x-1/2" style="left: ${progressPct}%" title="Actual Progress: ${currentProgress}"></div>
              
              <!-- Today Indicator -->
              <div class="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-body border border-canvas shadow-sm -translate-x-1/2" style="left: ${timePct}%" title="Time Today"></div>
            </div>
            <div class="flex items-center justify-between text-xs font-mono text-mute mt-2">
              <span>Start: ${formatDateShort(activeForecastGoal.startDate)}</span>
              <span class="flex items-center gap-2">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-link"></span> Actual
                <span class="inline-block w-1.5 h-1.5 bg-mute/40"></span> Expected
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-body"></span> Today
              </span>
              <span>End: ${formatDateShort(activeForecastGoal.endDate)}</span>
            </div>
          </div>

          <!-- Action button to premium tab -->
          <div class="flex justify-between items-center text-xs pt-3 border-t border-hairline">
            <span class="text-mute">${verdictText.replace(/<\/?strong>/g, '')}</span>
            <button type="button" class="px-3 h-11 border border-hairline hover:bg-canvas-soft text-xs font-medium rounded-sm transition-colors cursor-pointer shrink-0" onclick="window.switchTab('premium')">
              Manage Goal Progress --
            </button>
          </div>
        </div>
      `;
      animateContent(analyticsContainer);
    }

    // Hook up reset button
    const resetBtn = document.getElementById('reset-forecast-btn');
    resetBtn?.addEventListener('click', () => {
      TooltailsModal.confirm("Reset current forecast goal and wipe its history logs? This cannot be undone.", { destructive: true }).then(confirmed => {
        if (confirmed) {
          activeForecastGoal = null;
          saveForecastGoal();
          renderForecastEngine();
        }
      });
    });

    // Hook up log form submit
    const logForm = document.getElementById('forecast-log-form');
    logForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!activeForecastGoal) return;
      
      const val = parseFloat((document.getElementById('log-value') as HTMLInputElement).value);
      const notes = (document.getElementById('log-notes') as HTMLInputElement).value.trim();
      
      const newLog: ProgressLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        value: val,
        notes: notes || undefined
      };
      
      activeForecastGoal.logs.unshift(newLog);
      saveForecastGoal();
      renderForecastEngine();
      if (typeof gtag !== 'undefined') gtag('event', 'forecast_progress_logged', { value: val });
    });

    // Hook up quick log buttons
    document.querySelectorAll('.quick-log-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnEl = e.currentTarget as HTMLButtonElement;
        const inputEl = document.getElementById('log-value') as HTMLInputElement;
        if (inputEl) {
          inputEl.value = btnEl.getAttribute('data-val') || '1';
        }
      });
    });

    // Hook up delete buttons
    document.querySelectorAll('.delete-forecast-log-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!activeForecastGoal) return;
        const btnEl = e.currentTarget as HTMLElement;
        const logId = btnEl.getAttribute('data-id');
        if (logId) {
          TooltailsModal.confirm("Delete this progress log entry?", { destructive: true }).then(confirmed => {
            if (confirmed) {
              activeForecastGoal.logs = activeForecastGoal.logs.filter(log => log.id !== logId);
              saveForecastGoal();
              renderForecastEngine();
            }
          });
        }
      });
    });
  }

  function renderWeeklyReview() {
    const container = document.getElementById('analytics-weekly-review-panel');
    if (!container) return;

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    // Filter history for last 7 days
    const weeklySessions = history.filter(s => new Date(s.timestamp).getTime() >= sevenDaysAgo);

    if (weeklySessions.length === 0) {
      container.innerHTML = `
        <div class="bg-canvas p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-hairline/40 ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.02] animate-in fade-in duration-200">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-canvas-soft-2 border border-hairline/30 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-mute/40"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div class="space-y-1">
              <h3 class="text-sm font-semibold text-mute/60">Your week is waiting</h3>
              <p class="text-xs text-mute/40 leading-relaxed max-w-md">Complete your first session and this space fills with your progress, peak times, and a personalized review. Every session builds a clearer picture of your growth.</p>
            </div>
        </div>
      </div>
    `;
      animateContent(container);
      return;
    }

    // Calculations
    const totalSec = weeklySessions.reduce((acc, s) => acc + s.timeSpentSeconds, 0);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const focusHoursText = `${hrs}h ${mins}m`;

    const completedSessions = weeklySessions.filter(s => s.outcome === 'Completed');
    const weeklyCompletionRate = Math.round((completedSessions.length / weeklySessions.length) * 100);

    const avgDuration = Math.round(weeklySessions.reduce((acc, s) => acc + s.durationMinutes, 0) / weeklySessions.length);

    const activeDays = new Set(weeklySessions.map(s => s.timestamp.substring(0, 10)));
    const weeklyStreak = activeDays.size;

    // Activity categories analysis
    const activityStats: { [key: string]: { total: number; completed: number; failed: number } } = {};
    weeklySessions.forEach(s => {
      if (!activityStats[s.activity]) {
        activityStats[s.activity] = { total: 0, completed: 0, failed: 0 };
      }
      activityStats[s.activity].total++;
      if (s.outcome === 'Completed') activityStats[s.activity].completed++;
      else activityStats[s.activity].failed++;
    });

    let bestAct = "None";
    let bestRate = -1;
    Object.keys(activityStats).forEach(act => {
      const rate = activityStats[act].completed / activityStats[act].total;
      if (rate > bestRate) {
        bestRate = rate;
        bestAct = act;
      }
    });

    let missedAct = "None";
    let worstRate = -1;
    Object.keys(activityStats).forEach(act => {
      const rate = activityStats[act].failed / activityStats[act].total;
      if (rate > worstRate && activityStats[act].failed > 0) {
        worstRate = rate;
        missedAct = act;
      }
    });

    // Actionable rule-based recommendations
    const insights: string[] = [];

    // Rule 1: Completion Rate Advisor
    if (weeklyCompletionRate >= 85) {
      insights.push(`<strong>Flow Mastery (Rate: ${weeklyCompletionRate}%):</strong> Excellent focus match! Your session completion rate is exceptional, indicating high productivity and accurate goal scope estimation. Keep this rhythm.`);
    } else if (weeklyCompletionRate < 60) {
      insights.push(`<strong>Scope Realignment (Rate: ${weeklyCompletionRate}%):</strong> You are completing less than 60% of your focus blocks. Your outcomes might be too ambitious for individual blocks. Try planning smaller milestones (<15m each) before starting.`);
    } else {
      insights.push(`<strong>Standard Consistency (Rate: ${weeklyCompletionRate}%):</strong> Steady progress. You are maintaining a healthy completion rate. Focus on eliminating external distractions to push past 80% next week.`);
    }

    // Rule 2: Workload check
    const focusHours = totalSec / 3600;
    if (focusHours >= 15) {
      insights.push(`<strong>High Workload (${focusHours.toFixed(1)}h):</strong> You have completed over 15 hours of deep focus this week. To prevent burnout and maintain creative flow, ensure you take a full screen-free rest break between sessions.`);
    } else if (focusHours < 4) {
      insights.push(`<strong>Low Flow Engagement (${focusHours.toFixed(1)}h):</strong> Focus hours are under 4 hours this week. Start with just one 25-minute Pomodoro session tomorrow morning to build up momentum without pressure.`);
    }

    // Rule 3: Failure Reason Advisor
    const reasonsMap: { [key: string]: number } = { distraction: 0, fatigue: 0, 'goal-too-large': 0, interruption: 0 };
    weeklySessions.forEach(s => {
      if (s.failedReason && reasonsMap[s.failedReason] !== undefined) {
        reasonsMap[s.failedReason]++;
      }
    });

    let topReason = "";
    let maxCount = 0;
    Object.keys(reasonsMap).forEach(r => {
      if (reasonsMap[r] > maxCount) {
        maxCount = reasonsMap[r];
        topReason = r;
      }
    });

    if (topReason === 'distraction') {
      insights.push(`<strong>Distraction Blocker:</strong> Digital noise is your main obstacle. Recommended action: Try browser-lock, turn off notifications, and keep a blank notepad next to your keyboard to park distracting thoughts.`);
    } else if (topReason === 'fatigue') {
      insights.push(`<strong>Fatigue Blocker:</strong> Cognitive fatigue is causing early session failures. Recommended action: Shorten focus blocks to 25 minutes, and use break time to hydrate, stretch, or move away from screen devices.`);
    } else if (topReason === 'goal-too-large') {
      insights.push(`<strong>Scope Blocker:</strong> Session objectives are too massive. Action: Use the Milestone Decomposer inside onboarding step 2. Break your main outcome into 3 tiny sub-tasks.`);
    } else if (topReason === 'interruption') {
      insights.push(`<strong>Interruption Blocker:</strong> External breaks are fracturing your session flow. Action: Declare a physical "do-not-disturb" window, or shift your core focus blocks to low-interrupt times early in the day.`);
    }

    // Rule 4: Best Activity Booster
    if (bestAct !== "None") {
      insights.push(`<strong>Activity Amplifier (${bestAct}):</strong> You are in high flow when <strong>${bestAct}</strong> is active. Plan your most demanding work within this category early in your daily workflow.`);
    }

    const coachingInsightsHTML = insights.map((insight, idx) => `
      <div class="py-2.5 flex items-start gap-2.5 ${idx > 0 ? 'border-t border-hairline' : ''}">
        <span class="w-1.5 h-1.5 rounded-full bg-mute/40 shrink-0 mt-1.5"></span>
        <div class="text-body">${insight}</div>
      </div>
    `).join("");

    container.innerHTML = `
      <div class="bg-canvas p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-hairline/40 ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.02] space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline/30 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-mute/60" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <h3 class="text-lg font-semibold tracking-tighter text-ink">Weekly review & coaching advisor</h3>
            </div>
            <p class="text-xs text-mute">Diagnostics and behavioral alignment from the last 7 days of focus blocks.</p>
          </div>
          <button type="button" id="export-weekly-review-btn" class="px-3.5 h-11 border border-hairline hover:bg-canvas-soft text-xs text-body font-semibold rounded-sm transition-all flex items-center gap-1.5 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-mute" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Summary Card
          </button>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div class="bg-canvas rounded-2xl border border-hairline/15 p-3.5 text-center space-y-1">
                  <div class="text-xs font-medium text-mute">Focus hours</div>
                  <div class="text-base font-bold text-ink">${focusHoursText}</div>
          </div>
          <div class="bg-canvas rounded-2xl border border-hairline/15 p-3.5 text-center space-y-1">
                  <div class="text-xs font-medium text-mute">Completion rate</div>
                  <div class="text-base font-bold text-ink">${weeklyCompletionRate}%</div>
          </div>
          <div class="bg-canvas rounded-2xl border border-hairline/15 p-3.5 text-center space-y-1">
                  <div class="text-xs font-medium text-mute">Best activity</div>
                  <div class="text-base font-bold text-ink truncate" title="${bestAct}">${bestAct}</div>
          </div>
          <div class="bg-canvas rounded-2xl border border-hairline/15 p-3.5 text-center space-y-1">
            <div class="text-xs font-medium text-mute">Most missed</div>
            <div class="text-base font-bold text-ink truncate" title="${missedAct}">${missedAct}</div>
          </div>
          <div class="bg-canvas rounded-2xl border border-hairline/15 p-3.5 text-center space-y-1">
            <div class="text-xs font-medium text-mute">Days active</div>
            <div class="text-base font-bold text-ink">${weeklyStreak} / 7</div>
          </div>
          <div class="bg-canvas rounded-2xl border border-hairline/15 p-3.5 text-center space-y-1">
            <div class="text-xs font-medium text-mute">Avg duration</div>
            <div class="text-base font-bold text-ink">${avgDuration}m</div>
          </div>
        </div>

        <!-- Coaching Advice Panel -->
        <div class="rounded-2xl p-4 bg-canvas-soft/40 border border-hairline/20 space-y-3.5">
          <div class="text-sm font-semibold tracking-tighter text-ink flex items-center gap-1.5">
            <span class="inline-block w-1.5 h-1.5 bg-mute/40 rounded-full animate-pulse"></span>
            Behavioral Diagnostics & Insights
          </div>
          
          <div class="divide-y divide-hairline text-xs leading-relaxed">
            ${coachingInsightsHTML}
          </div>
        </div>
      </div>
    `;
    animateContent(container);

    // Hook up export button
    const exportBtn = document.getElementById('export-weekly-review-btn');
    exportBtn?.addEventListener('click', () => {
      const formatDateShortLocal = (dStr: string) => {
        const d = new Date(dStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      };
      // Build summary review card text
      const dateRangeStr = `${formatDateShortLocal(new Date(sevenDaysAgo).toISOString())} to ${formatDateShortLocal(new Date().toISOString())}`;
      
      const cleanInsights = insights.map((ins, i) => {
        const plain = ins.replace(/<\/?strong>/g, '');
        return `${i + 1}. ${plain}`;
      }).join("\n");

      const cardText = `
--------------------------------------------------
     TOOLTAILS FOCUS - WEEKLY REVIEW CARD
--------------------------------------------------
Timeframe: ${dateRangeStr}
Focus Duration: ${focusHoursText}
Completion Rate: ${weeklyCompletionRate}%
Best Focus Loop: ${bestAct}
Most Interrupted: ${missedAct}
Active Workdays: ${weeklyStreak} days / 7
Average Session: ${avgDuration} minutes

COACH DIAGNOSTICS & RECOMMENDATIONS:
${cleanInsights}

Generated locally by Tooltails Focus (tooltails.com/focus)
--------------------------------------------------
`;
      downloadWeeklyReviewCard(cardText);
    });
  }

  function downloadWeeklyReviewCard(reviewText: string) {
    const blob = new Blob([reviewText], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tooltails_weekly_review_${new Date().toISOString().substring(0, 10)}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // FLOATING CELEBRATION EMOJIS
  function triggerCelebration() {
    const emojis = ['<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063A2 2 0 0 0 14.063 15.5l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.03-9-10-9Z"/></svg>', '😊', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', 'â­', '🤩'];
    const container = document.body;
    for (let i = 0; i < 60; i++) {
      const emojiEl = document.createElement('div');
      emojiEl.className = 'floating-celebration-emoji';
      emojiEl.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emojiEl.style.left = `${Math.random() * 100}vw`;
      emojiEl.style.bottom = `-50px`;
      emojiEl.style.fontSize = `${Math.random() * 24 + 18}px`;
      emojiEl.style.animationDelay = `${Math.random() * 2}s`;
      emojiEl.style.animationDuration = `${Math.random() * 2.5 + 2.5}s`;
      container.appendChild(emojiEl);
      // Remove element after animation completes
      setTimeout(() => emojiEl.remove(), 5500);
    }
  }

  // GROWTH JOURNEY PROGRESSION CARD
  function renderGrowthJourney() {
    const container = document.getElementById('analytics-growth-journey-panel');
    if (!container) return;

    const completedCount = history.filter(s => s.outcome === 'Completed').length;
    let stage = 'Seedling';
    let nextStage = 'Sprout';
    let requiredForNext = 1;
    let currentInStage = completedCount;
    let minForStage = 0;
    let description = 'Every journey begins with a single seed. Plant your intention and start your first focus block.';
    let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-emerald-600 dark:text-emerald-400"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`;

    if (completedCount >= 30) {
      stage = 'Forest';
      nextStage = 'Infinity';
      requiredForNext = 30;
      currentInStage = completedCount;
      minForStage = 30;
      description = 'You have cultivated a thriving sanctuary of deep focus and growth. Your consistency fuels an endless ecosystem of flow.';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-emerald-600 dark:text-emerald-400"><path d="M12 22v-8M5 13l7-7 7 7M9 13V9a3 3 0 0 1 6 0v4"/></svg>`;
    } else if (completedCount >= 15) {
      stage = 'Tree';
      nextStage = 'Forest';
      requiredForNext = 30;
      currentInStage = completedCount;
      minForStage = 15;
      description = 'Sturdy, rooted, and branching out. Your focus has become a solid habit, standing tall against distractions.';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-emerald-600 dark:text-emerald-400"><path d="M12 20V10M12 10a4 4 0 0 1 4-4M12 10a4 4 0 0 0-4-4M9 20h6"/></svg>`;
    } else if (completedCount >= 5) {
      stage = 'Sapling';
      nextStage = 'Tree';
      requiredForNext = 15;
      currentInStage = completedCount;
      minForStage = 5;
      description = 'Reaching upward! You are starting to establish a rhythmic flow. Your efforts are showing visible strength.';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-emerald-600 dark:text-emerald-400"><path d="M12 22V12M12 12a3 3 0 0 1 3-3M12 15a3 3 0 0 0-3-3"/></svg>`;
    } else if (completedCount >= 1) {
      stage = 'Sprout';
      nextStage = 'Sapling';
      requiredForNext = 5;
      currentInStage = completedCount;
      minForStage = 1;
      description = 'Your dedication has broken through the surface! A young sprout of focus is beginning to emerge.';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-emerald-600 dark:text-emerald-400"><path d="M12 22V16M12 16a2 2 0 0 1 2-2M10 16a2 2 0 0 1 2-2"/></svg>`;
    }

    const rangeInStage = requiredForNext - minForStage;
    const progressInStage = currentInStage - minForStage;
    const pct = nextStage === 'Infinity' ? 100 : Math.min(100, Math.round((progressInStage / rangeInStage) * 100));

    container.innerHTML = `
      <div class="bg-canvas p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-hairline/40 ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.02] space-y-6">
        <div class="flex items-center justify-between border-b border-hairline/30 pb-4">
          <div>
            <h3 class="text-base font-semibold tracking-tighter text-ink">Your growth journey</h3>
            <p class="text-xs text-mute/60">Nourish your focus to grow your digital sanctuary.</p>
          </div>
          <span class="px-2.5 py-1 bg-canvas-soft-2 text-mute/70 text-xs font-semibold rounded-xl">
            Stage: ${stage}
          </span>
        </div>

        <div class="flex flex-col md:flex-row items-center gap-5 pt-2">
          <!-- Big Stage Icon -->
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-canvas-soft to-canvas-soft border border-hairline/30 flex items-center justify-center shrink-0 shadow-sm relative">
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50"></div>
            ${iconSvg}
          </div>
          <!-- Info & Progress bar -->
          <div class="flex-grow space-y-2.5 w-full text-left">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-ink">Current Stage: ${stage}</span>
              <span class="font-mono text-mute/60">
                ${nextStage === 'Infinity' ? 'Forest Fully Grown' : `${completedCount} / ${requiredForNext} Completed Sessions`}
              </span>
            </div>
            <p class="text-sm text-body/80 leading-relaxed">${description}</p>
            
            ${nextStage !== 'Infinity' ? `
            <div class="space-y-1">
              <div class="w-full h-2 bg-hairline/60 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
                <div class="h-full bg-gradient-to-r from-link via-blue-400 to-link rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(37,99,235,0.2)]" style="width: ${pct}%"></div>
              </div>
              <div class="flex justify-between text-xs font-mono text-mute">
                <span>${stage} (${minForStage})</span>
                <span>Next: ${nextStage} (${requiredForNext})</span>
              </div>
            </div>
            ` : `
            <div class="w-full h-2 bg-gradient-to-r from-link via-emerald-500 to-purple-500 rounded-full"></div>
            `}
          </div>
        </div>
      </div>
    `;
    animateContent(container);
  }

  // FOCUS ACHIEVEMENTS & BADGES
  function renderAchievements() {
    const container = document.getElementById('analytics-achievements-panel');
    if (!container) return;

    const completedSessions = history.filter(s => s.outcome === 'Completed');
    const completedCount = completedSessions.length;

    // Check Streak
    const currentStreakValue = parseInt(document.getElementById('global-streak-value')?.textContent || '0');

    // Deep Flow Diver check
    const hasDeepSession = history.some(s => s.outcome === 'Completed' && s.durationMinutes >= 50);

    // Mindfulness Guru check: count sessions with notes
    const sessionsWithNotes = history.filter(s => s.notes && s.notes.trim().length >= 3).length;

    const achievements = [
      {
        id: 'first-spark',
        name: 'First Spark',
        desc: 'Complete your first focused session.',
        unlocked: completedCount >= 1,
        condition: '1 completed focus block',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="${completedCount >= 1 ? 'text-amber-500 animate-pulse' : 'text-mute'}"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>`
      },
      {
        id: 'streak-starter',
        name: 'Streak Starter',
        desc: 'Maintain dedication for 3 consecutive days.',
        unlocked: currentStreakValue >= 3,
        condition: '3-day focus streak',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="${currentStreakValue >= 3 ? 'text-rose-500' : 'text-mute'}"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
      },
      {
        id: 'deep-flow',
        name: 'Deep Flow Diver',
        desc: 'Complete an extended focus session (50m+).',
        unlocked: hasDeepSession,
        condition: '50m+ focus block',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="${hasDeepSession ? 'text-blue-500' : 'text-mute'}"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`
      },
      {
        id: 'mindfulness',
        name: 'Mindfulness Guru',
        desc: 'Cultivate self-awareness with 5 session journal reflections.',
        unlocked: sessionsWithNotes >= 5,
        condition: '5 reflection logs',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="${sessionsWithNotes >= 5 ? 'text-purple-500 animate-spin-slow' : 'text-mute'}"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6.5a2.5 2.5 0 1 1 2.5-2.5 2.5 2.5 0 0 1-2.5 2.5z"/></svg>`
      },
      {
        id: 'consistent-creator',
        name: 'Consistent Creator',
        desc: 'Complete 10 total outcomes to reinforce your flow habit.',
        unlocked: completedCount >= 10,
        condition: '10 completed sessions',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="${completedCount >= 10 ? 'text-emerald-500' : 'text-mute'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
      }
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    container.innerHTML = `
      <div class="bg-canvas p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-hairline/40 ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.02] space-y-6">
        <div class="flex items-center justify-between border-b border-hairline/30 pb-4">
          <div>
            <h3 class="text-base font-semibold tracking-tighter text-ink">Achievements & badges</h3>
            <p class="text-xs text-mute/60">Unlock rewards through consistent mindful work.</p>
          </div>
          <span class="text-xs font-mono font-bold text-mute/70">
            ${unlockedCount} / ${achievements.length} Unlocked
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          ${achievements.map(a => `
            <div class="p-3 border rounded-2xl flex flex-col justify-between min-h-[150px] transition-all duration-300 text-left ${
              a.unlocked 
                ? 'bg-gradient-to-b from-canvas to-canvas border-hairline/40 hover:bg-canvas-soft hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1 shadow-sm text-ink'
                : 'opacity-40 hover:opacity-70 bg-canvas border-hairline/15 border-dashed text-mute select-none hover:shadow-sm'
            }">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <div class="p-1.5 bg-gradient-to-br from-canvas-soft to-canvas border border-hairline/15 rounded-xl shadow-sm">
                    ${a.svg}
                  </div>
                  ${a.unlocked 
                    ? `<span class="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full ring-1 ring-inset ring-emerald-500/15">Unlocked</span>`
                    : `<span class="text-[10px] font-semibold text-mute/40 px-1.5 py-0.5">Locked</span>`
                  }
                </div>
                <div>
                  <h4 class="text-xs font-bold text-ink leading-snug ${a.unlocked ? '' : 'text-mute/60'}">${a.name}</h4>
                  <p class="text-xs text-mute leading-relaxed mt-0.5">${a.desc}</p>
                </div>
              </div>
              <div class="text-[10px] font-mono text-mute/50 border-t border-hairline/30 pt-1.5 mt-1">
                ${a.condition}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    animateContent(container);
  }

  // WEEKLY REFLECTIONS STORAGE & RENDER
  function loadReflections() {
    try {
      const stored = SafeStorage.getItem('tooltails-focus-reflections');
      reflections = stored ? JSON.parse(stored) : [];
    } catch (e) {
      if (isDev) console.error("Failed to parse reflections", e);
      reflections = [];
    }
  }

  function saveReflection(content: string) {
    const newReflection: WeeklyReflection = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      content: content.trim()
    };
    reflections.unshift(newReflection);
    SafeStorage.setItem('tooltails-focus-reflections', JSON.stringify(reflections));
    renderReflections();
  }

  function deleteReflection(id: string) {
    reflections = reflections.filter(r => r.id !== id);
    SafeStorage.setItem('tooltails-focus-reflections', JSON.stringify(reflections));
    renderReflections();
  }

  function renderReflections() {
    const list = document.getElementById('weekly-reflections-list');
    if (!list) return;

    if (reflections.length === 0) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center p-4 sm:p-6 border border-dashed border-hairline/30 rounded-xl text-center space-y-3 animate-in fade-in duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-mute/20"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          <div class="space-y-1">
            <p class="text-sm font-semibold text-mute/60">Your first reflection starts here</p>
            <p class="text-xs text-mute/40 leading-relaxed max-w-xs">Complete a session and take a moment to reflect on what worked. Small insights compound into big growth over time.</p>
          </div>
        </div>
      `;
      animateContent(list);
      return;
    }

    list.innerHTML = reflections.map(r => {
      const dateStr = new Date(r.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `
        <div class="p-3 bg-canvas border border-hairline rounded-sm text-xs text-ink space-y-1.5 relative group text-left">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono text-mute">${dateStr}</span>
            <button type="button" class="text-mute hover:text-error opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer delete-reflection-btn shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center p-1" data-id="${r.id}" aria-label="Delete reflection entry">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <p class="text-body whitespace-pre-line leading-relaxed italic">"${r.content}"</p>
        </div>
      `;
    }).join('');
    animateContent(list);

    // Attach deletes
    list.querySelectorAll('.delete-reflection-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (id) {
          TooltailsModal.confirm("Delete this reflection entry?", { destructive: true }).then(confirmed => {
            if (confirmed) {
              deleteReflection(id);
            }
          });
        }
      });
    });
  }

  function setupWeeklyReflectionForm() {
    const form = document.getElementById('weekly-reflection-form');
    if (!form) return;
    
    // Remove duplicate listeners if already attached
    const newForm = form.cloneNode(true);
    form.parentNode?.replaceChild(newForm, form);

    newForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const textarea = document.getElementById('weekly-reflection-text') as HTMLTextAreaElement;
      const content = textarea?.value.trim();
      if (content) {
        saveReflection(content);
        textarea.value = '';
        if (typeof gtag !== 'undefined') gtag('event', 'reflection_saved');
      }
    });
  }

  // DAILY JOURNAL SYSTEM
  function loadJournal() {
    try {
      const stored = SafeStorage.getItem('tooltails-focus-daily-journal');
      journalEntries = stored ? JSON.parse(stored) : [];
    } catch (e) {
      if (isDev) console.error('Failed to parse journal entries', e);
      journalEntries = [];
    }
  }

  function saveJournalToStorage() {
    SafeStorage.setItem('tooltails-focus-daily-journal', JSON.stringify(journalEntries));
  }

  function getTodayEntry(): JournalEntry | undefined {
    const today = new Date().toISOString().substring(0, 10);
    return journalEntries.find(e => e.date === today);
  }

  function upsertJournalEntry(data: { dailyNotes: string; wins: string; distractions: string; moodBefore: number; moodAfter: number; lessons: string }) {
    const today = new Date().toISOString().substring(0, 10);
    const existing = getTodayEntry();
    if (existing) {
      existing.dailyNotes = data.dailyNotes;
      existing.wins = data.wins;
      existing.distractions = data.distractions;
      existing.moodBefore = data.moodBefore;
      existing.moodAfter = data.moodAfter;
      existing.lessons = data.lessons;
      existing.updatedAt = new Date().toISOString();
    } else {
      const entry: JournalEntry = {
        id: Math.random().toString(36).substr(2, 9),
        date: today,
        updatedAt: new Date().toISOString(),
        ...data
      };
      journalEntries.unshift(entry);
    }
    saveJournalToStorage();
  }

  function renderJournalEntries(filter = '') {
    const list = document.getElementById('journal-entries-list');
    const countEl = document.getElementById('journal-entries-count');
    if (!list) return;

    const today = new Date().toISOString().substring(0, 10);
    let entries = journalEntries.filter(e => e.date !== today);

    if (filter) {
      const q = filter.toLowerCase();
      entries = entries.filter(e =>
        e.dailyNotes.toLowerCase().includes(q) ||
        e.wins.toLowerCase().includes(q) ||
        e.distractions.toLowerCase().includes(q) ||
        e.lessons.toLowerCase().includes(q)
      );
    }

    if (countEl) countEl.textContent = `${entries.length} entr${entries.length !== 1 ? 'ies' : 'y'}`;

    if (entries.length === 0) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center p-4 sm:p-6 border border-dashed border-hairline/30 rounded-xl text-center space-y-3 animate-in fade-in duration-200">
          ${filter ? `
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-mute/20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <div class="space-y-1">
              <p class="text-sm font-semibold text-mute/60">No entries match your search</p>
              <p class="text-xs text-mute/40 leading-relaxed">Try different keywords or clear your search to browse all entries.</p>
            </div>
          ` : `
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-mute/20"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="M2 3h6a4 4 0 0 1 4 4v14"/></svg>
            <div class="space-y-1">
              <p class="text-sm font-semibold text-mute/60">Your first entry is waiting</p>
              <p class="text-xs text-mute/40 leading-relaxed">After a session, jot down your wins and lessons above. Each entry becomes a thread in your growth story.</p>
            </div>
          `}
        </div>`;
      animateContent(list);
      return;
    }

    const moodEmojis = ['<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>'];

    list.innerHTML = entries.map(e => {
      const dateStr = new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const preview = (e.dailyNotes || e.wins || e.lessons || '').substring(0, 100);
      const moodDelta = e.moodAfter - e.moodBefore;
      const moodTrend = moodDelta > 0 ? 'text-emerald-500' : moodDelta < 0 ? 'text-rose-400' : 'text-mute/40';
      const moodArrow = moodDelta > 0 ? '↑' : moodDelta < 0 ? '↓' : '--';
      return `
          <div class="journal-entry-card pl-4 relative group text-left">
          <div class="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-link/15 via-link/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="p-3.5 bg-canvas border border-hairline/30 hover:border-hairline-strong/50 rounded-xl text-sm text-ink space-y-2 transition-all duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-mono text-mute/50">${dateStr}</span>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-medium text-mute/40 flex items-center gap-1" title="Mood before - after">${moodEmojis[e.moodBefore]}<span class="${moodTrend} text-[10px] font-bold">${moodArrow}</span>${moodEmojis[e.moodAfter]}</span>
                <button type="button" class="w-11 h-11 rounded-lg text-mute/30 hover:text-error hover:bg-error/5 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer delete-journal-btn shrink-0 flex items-center justify-center" data-id="${e.id}" aria-label="Delete entry">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            ${preview ? `<p class="text-body/80 leading-relaxed text-xs">${preview}${preview.length >= 100 ? '→' : ''}</p>` : ''}
            <div class="flex flex-wrap gap-1">
              ${e.wins ? `<span class="text-[10px] px-2 py-0.5 bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-full font-medium ring-1 ring-inset ring-emerald-500/12"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.03-9-10-9Z"/></svg> Win</span>` : ''}
              ${e.distractions ? `<span class="text-[10px] px-2 py-0.5 bg-gradient-to-b from-rose-500/10 to-rose-500/5 text-rose-500 rounded-full font-medium ring-1 ring-inset ring-rose-500/12"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="M21.174 6.812a2 2 0 1 0-2.986-2.987 2 2 0 0 0 2.986 2.987z"/></svg> Distraction</span>` : ''}
              ${e.lessons ? `<span class="text-[10px] px-2 py-0.5 bg-gradient-to-b from-purple-500/10 to-purple-500/5 text-purple-500 rounded-full font-medium ring-1 ring-inset ring-purple-500/12"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> Lesson</span>` : ''}
              ${e.dailyNotes ? `<span class="text-[10px] px-2 py-0.5 bg-gradient-to-b from-link/10 to-link/5 text-link rounded-full font-medium ring-1 ring-inset ring-link/12"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> Notes</span>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');
    animateContent(list);

    list.querySelectorAll('.delete-journal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (id) {
          TooltailsModal.confirm("Delete this journal entry?", { destructive: true }).then(confirmed => {
            if (confirmed) {
              journalEntries = journalEntries.filter(je => je.id !== id);
              saveJournalToStorage();
              renderJournalEntries((document.getElementById('journal-search-input') as HTMLInputElement)?.value || '');
            }
          });
        }
      });
    });
  }

  function setupJournalForm() {
    // Populate today's date
    const dateEl = document.getElementById('journal-today-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }

    // Load today's entry if exists
    const todayEntry = getTodayEntry();
    if (todayEntry) {
      const getVal = (id: string) => (document.getElementById(id) as HTMLTextAreaElement);
      const notes = getVal('journal-daily-notes');
      const wins = getVal('journal-wins');
      const dist = getVal('journal-distractions');
      const less = getVal('journal-lessons');
      if (notes) notes.value = todayEntry.dailyNotes;
      if (wins) wins.value = todayEntry.wins;
      if (dist) dist.value = todayEntry.distractions;
      if (less) less.value = todayEntry.lessons;
      const moodBefore = document.getElementById('journal-mood-before');
      const moodAfter = document.getElementById('journal-mood-after');
      if (moodBefore) moodBefore.setAttribute('data-mood', todayEntry.moodBefore.toString());
      if (moodAfter) moodAfter.setAttribute('data-mood', todayEntry.moodAfter.toString());
    }

    // Render today's sessions
    renderTodaySessionsSummary();

    // Setup mood pickers
    document.querySelectorAll('#journal-mood-before .mood-btn, #journal-mood-after .mood-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const parent = target.parentElement;
        if (!parent) return;
        const value = target.getAttribute('data-value');
        parent.setAttribute('data-mood', value || '2');
        parent.querySelectorAll('.mood-btn').forEach(b => {
          b.classList.remove('border-link/50', 'bg-link/8', 'text-ink', 'font-semibold', 'ring-1', 'ring-link/20', 'scale-110');
          b.classList.add('border-hairline/50');
        });
        target.classList.remove('border-hairline/50');
        target.classList.add('border-link/50', 'bg-link/8', 'text-ink', 'font-semibold', 'ring-1', 'ring-link/20', 'scale-110');
      });
    });

    // Save button
    const saveBtn = document.getElementById('journal-save-btn');
    if (saveBtn) {
      const newBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode?.replaceChild(newBtn, saveBtn);
      newBtn.addEventListener('click', () => {
        const getVal = (id: string) => ((document.getElementById(id) as HTMLTextAreaElement)?.value || '').trim();
        const dailyNotes = getVal('journal-daily-notes');
        const wins = getVal('journal-wins');
        const distractions = getVal('journal-distractions');
        const lessons = getVal('journal-lessons');
        const moodBefore = parseInt(document.getElementById('journal-mood-before')?.getAttribute('data-mood') || '2');
        const moodAfter = parseInt(document.getElementById('journal-mood-after')?.getAttribute('data-mood') || '2');

        upsertJournalEntry({ dailyNotes, wins, distractions, moodBefore, moodAfter, lessons });
        if (typeof gtag !== 'undefined') {
          gtag('event', 'journal_saved', { has_notes: (dailyNotes.length > 0).toString(), has_wins: (wins.length > 0).toString(), has_lessons: (lessons.length > 0).toString() });
        }

        // Feedback
        const feedback = document.getElementById('journal-save-feedback');
        if (feedback) {
          feedback.classList.remove('hidden');
          setTimeout(() => feedback.classList.add('hidden'), 2000);
        }

        renderJournalEntries((document.getElementById('journal-search-input') as HTMLInputElement)?.value || '');
      });
    }

    // Search input
    const searchInput = document.getElementById('journal-search-input');
    if (searchInput) {
      const newSearch = searchInput.cloneNode(true);
      searchInput.parentNode?.replaceChild(newSearch, searchInput);
      newSearch.addEventListener('input', (e) => {
        renderJournalEntries((e.currentTarget as HTMLInputElement).value);
      });
    }
  }

  function renderTodaySessionsSummary() {
    const el = document.getElementById('journal-today-sessions');
    if (!el) return;
    const todayStr = new Date().toISOString().substring(0, 10);
    const todaySessions = history.filter(s => s.timestamp.substring(0, 10) === todayStr);
    if (todaySessions.length === 0) {
      el.innerHTML = `
        <div class="flex items-start gap-3 text-sm">
          <div class="w-8 h-8 rounded-xl bg-canvas-soft-2 border border-hairline/30 flex items-center justify-center shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-mute/40"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="space-y-0.5">
            <p class="text-sm font-medium text-mute/60">Today is full of possibility</p>
            <p class="text-xs text-mute/40 leading-relaxed">Set a goal, start the timer, and take the first step. Your completed sessions will appear here.</p>
          </div>
        </div>`;
      animateContent(el);
      return;
    }
    const totalMin = Math.round(todaySessions.reduce((s, ses) => s + ses.timeSpentSeconds, 0) / 60);
    const completed = todaySessions.filter(s => s.outcome === 'Completed').length;
    const partial = todaySessions.filter(s => s.outcome === 'Partial').length;
    const failed = todaySessions.filter(s => s.outcome === 'Failed').length;
    el.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5 text-sm">
          <span class="w-7 h-7 rounded-lg bg-link/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-link"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </span>
          <div>
            <span class="font-bold text-ink">${todaySessions.length} session${todaySessions.length !== 1 ? 's' : ''}</span>
            <span class="text-mute/50 mx-1">·</span>
            <span class="text-mute/70 font-medium">${totalMin}m focused</span>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="text-link font-semibold flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><polyline points="20 6 9 17 4 12"/></svg>${completed} done</span>
          ${partial > 0 ? `<span class="text-warning font-semibold flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${partial} partial</span>` : ''}
          ${failed > 0 ? `<span class="text-error font-semibold flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>${failed} missed</span>` : ''}
        </div>
      </div>
      <div class="flex flex-wrap gap-1.5 mt-3">
        ${todaySessions.map(s => {
          const outcomeColors: Record<string, string> = { Completed: 'bg-link/8 text-link border-link/15', Partial: 'bg-warning/8 text-warning border-warning/15', Failed: 'bg-error/8 text-error border-error/15' };
          return `<span class="text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${outcomeColors[s.outcome] || 'border-hairline text-mute'}">${s.activity} · ${s.durationMinutes}m</span>`;
        }).join('')}
      </div>`;
    animateContent(el);
  }

  // MONTHLY GROWTH PDF REPORT COMPILER
  function generateMonthlyGrowthReport() {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const monthlySessions = history.filter(s => new Date(s.timestamp).getTime() >= thirtyDaysAgo);

    // Calculate core metrics
    const totalSec = monthlySessions.reduce((sum, s) => sum + s.timeSpentSeconds, 0);
    const focusHours = (totalSec / 3600).toFixed(1);
    
    const completedCount = monthlySessions.filter(s => s.outcome === 'Completed').length;
    const completionRate = monthlySessions.length > 0 ? Math.round((completedCount / monthlySessions.length) * 100) : 0;
    
    // Streaks
    const longestStreak = calculateLongestStreak(monthlySessions);

    // Most Successful Activity
    const actStats: { [key: string]: { total: number; completed: number } } = {};
    monthlySessions.forEach(s => {
      if (!actStats[s.activity]) {
        actStats[s.activity] = { total: 0, completed: 0 };
      }
      actStats[s.activity].total++;
      if (s.outcome === 'Completed') {
        actStats[s.activity].completed++;
      }
    });

    let bestAct = "None";
    let bestRate = -1;
    Object.keys(actStats).forEach(act => {
      const r = actStats[act].completed / actStats[act].total;
      if (r > bestRate) {
        bestRate = r;
        bestAct = act;
      }
    });
    const bestRatePct = bestRate >= 0 ? Math.round(bestRate * 100) : 0;

    // Biggest Growth Area
    const actHours: { [key: string]: number } = {};
    monthlySessions.forEach(s => {
      if (!actHours[s.activity]) {
        actHours[s.activity] = 0;
      }
      actHours[s.activity] += s.timeSpentSeconds;
    });

    let topAct = "None";
    let topTime = 0;
    Object.keys(actHours).forEach(act => {
      if (actHours[act] > topTime) {
        topTime = actHours[act];
        topAct = act;
      }
    });
    const topHrs = (topTime / 3600).toFixed(1);

    // Forecast goal details
    let goalProgressHTML = '<div style="border: 1px solid #ebebeb; border-radius: 10px; padding: 15px; background: #fafafa; font-size: 12px; color: #888; text-align: center;">Set a long-term goal in the Journal tab and track your progress here over time.</div>';
    if (activeForecastGoal) {
      const currentVal = activeForecastGoal.logs.reduce((sum, log) => sum + log.value, 0);
      const pct = Math.min(100, Math.round((currentVal / activeForecastGoal.targetValue) * 100));
      
      // Calculate pace
      const daysElapsed = Math.max(1, Math.round((Date.now() - new Date(activeForecastGoal.startDate).getTime()) / (1000 * 60 * 60 * 24)));
      const pace = currentVal / daysElapsed;
      const remainingTarget = Math.max(0, activeForecastGoal.targetValue - currentVal);
      const remainingDays = Math.max(1, Math.round((new Date(activeForecastGoal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      const requiredPace = remainingTarget / remainingDays;

      let statusBadge = 'On Track';
      let badgeClass = 'bg-blue-100 text-blue-800';
      if (pace > requiredPace * 1.1) {
        statusBadge = 'Ahead of Schedule';
        badgeClass = 'bg-emerald-100 text-emerald-800';
      } else if (pace < requiredPace * 0.9) {
        statusBadge = 'Behind Schedule';
        badgeClass = 'bg-rose-100 text-rose-800';
      }

      goalProgressHTML = `
        <div style="border: 1px solid #ebebeb; border-radius: 10px; padding: 15px; background: #fafafa; margin-bottom: 20px; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="margin: 0; font-size: 13px; font-weight: 600; color: #0a0a0a;">Active goal: ${activeForecastGoal.title}</h4>
            <span class="${badgeClass}" style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 3px;">${statusBadge}</span>
          </div>
          <div style="font-size: 11px; color: #333; margin-bottom: 6px;">
            Progress: <strong>${currentVal.toFixed(1)}</strong> of <strong>${activeForecastGoal.targetValue.toFixed(1)} ${activeForecastGoal.unit}</strong> (${pct}%)
          </div>
          <div class="progress-bar-outer">
            <div class="progress-bar-inner" style="width: ${pct}%;"></div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; font-size: 10px; color: #666; border-top: 1px solid #f3f4f6; padding-top: 8px;">
            <div>Pace: <strong>${pace.toFixed(2)} / day</strong></div>
            <div>Req. Pace: <strong>${requiredPace.toFixed(2)} / day</strong></div>
            <div>Time Remaining: <strong>${remainingDays} days</strong></div>
          </div>
        </div>
      `;
    }

    // Heatmap snapshot rendering
    const totalDays = 16 * 7;
    const daysArr: { dateStr: string; sessionsCount: number }[] = [];
    const alignOffset = 6 - new Date().getDay();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + alignOffset);

    const dayMap = new Map<string, number>();
    history.forEach(s => {
      const key = s.timestamp.substring(0, 10);
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    });

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      daysArr.push({
        dateStr,
        sessionsCount: dayMap.get(dateStr) || 0
      });
    }

    let heatmapHTML = '<div class="heatmap-container">';
    for (let w = 0; w < 16; w++) {
      heatmapHTML += `<div class="heatmap-column">`;
      for (let d = 0; d < 7; d++) {
        const index = w * 7 + d;
        const cell = daysArr[index];
        const count = cell.sessionsCount;

        let levelClass = "cell-0";
        if (count === 1) levelClass = "cell-1";
        else if (count === 2) levelClass = "cell-2";
        else if (count >= 3 && count < 5) levelClass = "cell-3";
        else if (count >= 5) levelClass = "cell-4";

        heatmapHTML += `<div class="heatmap-cell ${levelClass}" title="${cell.dateStr}: ${count} completed"></div>`;
      }
      heatmapHTML += `</div>`;
    }
    heatmapHTML += '</div>';

    // Reflections list filtering (last 30 days)
    const monthlyReflections = reflections.filter(r => new Date(r.timestamp).getTime() >= thirtyDaysAgo);
    let reflectionsHTML = '<div style="font-size: 12px; color: #888; text-align: center; padding: 10px 0;">No journal entries this month. Reflections help you see how far you have come — write one after your next session.</div>';
    if (monthlyReflections.length > 0) {
      reflectionsHTML = monthlyReflections.map(r => {
        const dateStr = new Date(r.timestamp).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        return `
          <div class="journal-entry">
            <div class="journal-date">${dateStr}</div>
            <div class="journal-text">"${r.content}"</div>
          </div>
        `;
      }).join('');
    }

    // Coaching notes text blocks
    let alignmentInsight = '';
    let recoveryAdvice = '';
    
    if (completionRate >= 80) {
      alignmentInsight = "Your focus alignment coefficient is exceptional. You show a balanced workload structure and high goal calibration accuracy. You successfully translate planning into execution without introducing cognitive bloat.";
    } else if (completionRate < 60) {
      alignmentInsight = "You are setting highly ambitious milestones. While stretch-goals can push performance boundaries, setting smaller, more achievable mini-milestones (<15 mins) during Flow Space onboarding will stabilize your execution confidence and build daily completion momentum.";
    } else {
      alignmentInsight = "You are maintaining a steady focus rate. To push consistency further, analyze distraction triggers logged during partial sessions and secure a single, completely offline 25-minute deep focus window daily.";
    }

    // Failure reason check
    const reasonsMap: { [key: string]: number } = { distraction: 0, fatigue: 0, 'goal-too-large': 0, interruption: 0 };
    monthlySessions.forEach(s => {
      if (s.failedReason && reasonsMap[s.failedReason] !== undefined) {
        reasonsMap[s.failedReason]++;
      }
    });
    let topReason = "";
    let maxCount = 0;
    Object.keys(reasonsMap).forEach(r => {
      if (reasonsMap[r] > maxCount) {
        maxCount = reasonsMap[r];
        topReason = r;
      }
    });

    if (topReason === 'distraction') {
      recoveryAdvice = "Digital noise is identified as your primary barrier. Consider implementing browser blockers, enabling hardware Do Not Disturb windows, and keeping a physical blank sheet of paper next to your keyboard to park side-thoughts during active flow blocks.";
    } else if (topReason === 'fatigue') {
      recoveryAdvice = "Cognitive depletion is triggering session setbacks. Shorten your focus preset target to 25 minutes, and explicitly dedicate break blocks to step away from all screens to hydrate, stretch, or practice light breathing.";
    } else if (topReason === 'goal-too-large') {
      recoveryAdvice = "Objective scope creep is introducing friction. Leverage the Milestone Decomposer inside onboarding Step 2. Never start a timer without defining precisely 2 or 3 tiny sub-tasks that lead to the session's overall intention.";
    } else if (topReason === 'interruption') {
      recoveryAdvice = "External environmental fractures are breaking your focus blocks. Try shifting your high-priority sessions to early morning hours or declare a physical visual signal (like headphone use) to mitigate external interruptions.";
    } else {
      recoveryAdvice = "Maintain a sustainable rhythm. Ensure you rest between sessions. Avoid consecutive focus blocks exceeding 90 minutes without a restorative screen-free recovery window.";
    }

    const coachingText = `
      <p style="margin-top: 0; margin-bottom: 12px;"><strong>Alignment Diagnostics:</strong> ${alignmentInsight}</p>
      <p style="margin-bottom: 0;"><strong>Distraction Science Advisory:</strong> ${recoveryAdvice}</p>
    `;

    // Calculate dates
    const endStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const startStr = new Date(thirtyDaysAgo).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    // Open print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      TooltailsModal.alert("Popup blocker blocked the report compiling window. Please enable popups for this site and try again.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tooltails Focus - Monthly Growth Report</title>
          <meta charset="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              color: #18181b;
              background: #ffffff;
              line-height: 1.6;
              margin: 0;
              padding: 50px;
            }
            h1, h2, h3, h4 {
              font-family: 'Outfit', sans-serif;
              color: #09090b;
              margin-top: 0;
            }
            .report-header {
              border-bottom: 2px solid #18181b;
              padding-bottom: 18px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .brand-logo {
              font-size: 22px;
              font-weight: 700;
              letter-spacing: -0.03em;
              color: #09090b;
            }
            .report-title {
              font-size: 13px;
              font-weight: 600;
              color: #71717a;
            }
            .grid-stats {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .stat-card {
              border: 1px solid #e4e4e7;
              padding: 16px 12px;
              border-radius: 12px;
              background: #f8fafc;
              text-align: center;
            }
            .stat-label {
              font-size: 11px;
              font-weight: 500;
              color: #71717a;
              margin-bottom: 4px;
            }
            .stat-value {
              font-size: 22px;
              font-weight: 700;
              color: #09090b;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              border-bottom: 1px solid #e4e4e7;
              padding-bottom: 8px;
              margin-bottom: 18px;
              margin-top: 36px;
              color: #09090b;
            }
            .heatmap-container {
              display: flex;
              gap: 3px;
              justify-content: start;
              margin-bottom: 20px;
              background: #f8fafc;
              border: 1px solid #e4e4e7;
              padding: 18px;
              border-radius: 12px;
              width: fit-content;
            }
            .heatmap-column {
              display: flex;
              flex-direction: column;
              gap: 3px;
            }
            .heatmap-cell {
              width: 10px;
              height: 10px;
              border-radius: 2px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .cell-0 { background-color: #f1f5f9; border: 1px solid #e2e8f0; }
            .cell-1 { background-color: #dbeafe; border: 1px solid #bfdbfe; }
            .cell-2 { background-color: #93c5fd; border: 1px solid #60a5fa; }
            .cell-3 { background-color: #2563eb; }
            .cell-4 { background-color: #1e3a8a; }
            
            .progress-bar-outer {
              width: 100%;
              height: 8px;
              background: #e2e8f0;
              border-radius: 9999px;
              overflow: hidden;
              margin-top: 8px;
            }
            .progress-bar-inner {
              height: 100%;
              background: #2563eb;
              border-radius: 9999px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .coaching-card {
              border: 1px solid #e4e4e7;
              border-left: 4px solid #2563eb;
              background: #f8fafc;
              padding: 20px;
              border-radius: 12px;
              font-size: 12px;
              line-height: 1.6;
              text-align: left;
            }
            
            .journal-entry {
              padding: 12px 0;
              border-bottom: 1px solid #e2e8f0;
              text-align: left;
            }
            .journal-entry:last-child {
              border-bottom: none;
            }
            .journal-date {
              font-size: 9px;
              color: #71717a;
              font-family: monospace;
            }
            .journal-text {
              font-style: italic;
              font-size: 11.5px;
              margin-top: 4px;
              color: #27272a;
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            
            .footer {
              margin-top: 50px;
              border-top: 1px solid #ebebeb;
              padding-top: 15px;
              font-size: 9px;
              color: #999;
              text-align: center;
            }
            
            @media print {
              body {
                padding: 0;
              }
              .no-print-btn {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;" class="no-print-btn">
            <button onclick="window.print();" style="padding: 8px 16px; background: #000; color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.1s;">
              Print / Save PDF
            </button>
          </div>

          <div class="report-header">
            <div>
              <span class="brand-logo">Tooltails Focus</span>
            </div>
            <div>
              <span class="report-title">Monthly growth & alignment register</span>
            </div>
          </div>

          <div style="font-size: 12px; color: #666; margin-bottom: 24px; text-align: left;">
            Period: <strong>${startStr}</strong> to <strong>${endStr}</strong> &bull; Generated locally in flow space
          </div>

          <!-- Section 1: The Core Metrics -->
          <div class="section-title">Core alignment metrics</div>
          <div class="grid-stats">
            <div class="stat-card">
              <div class="stat-label">Time Invested</div>
              <div class="stat-value">${focusHours} hrs</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Intention Success Rate</div>
              <div class="stat-value">${completionRate}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Longest Focus Streak</div>
              <div class="stat-value">${longestStreak} days</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Sessions Run</div>
              <div class="stat-value">${monthlySessions.length}</div>
            </div>
          </div>

          <!-- Section 2: Goal Progress -->
          <div class="section-title">Intentional outcomes & goals</div>
          ${goalProgressHTML}

          <!-- Section 3: Focus Heatmap -->
          <div class="section-title">Focus landscape (daily flow)</div>
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            ${heatmapHTML}
            <div style="display: flex; gap: 10px; font-size: 9px; color: #666; margin-top: -10px; margin-bottom: 20px;">
              <span>Less focus</span>
              <span style="display: inline-block; width: 10px; height: 10px;" class="cell-0"></span>
              <span style="display: inline-block; width: 10px; height: 10px;" class="cell-1"></span>
              <span style="display: inline-block; width: 10px; height: 10px;" class="cell-2"></span>
              <span style="display: inline-block; width: 10px; height: 10px;" class="cell-3"></span>
              <span style="display: inline-block; width: 10px; height: 10px;" class="cell-4"></span>
              <span>More focus</span>
            </div>
          </div>

          <!-- Section 4: Diagnostics and Coaching -->
          <div class="section-title">Diagnostics & personal coaching notes</div>
          <div class="coaching-card">
            ${coachingText}
          </div>

          <!-- Section 5: Activity & Growth DNA -->
          <div class="section-title">Focus DNA distribution</div>
          <div class="details-grid" style="text-align: left; font-size: 12px; margin-bottom: 24px;">
            <div style="border: 1px solid #ebebeb; border-radius: 10px; padding: 15px; background: #fafafa;">
              <h4 style="margin-bottom: 8px; font-size: 13px;">Most Successful Category</h4>
              <p style="margin: 0; color: #333;"><strong>${bestAct}</strong> (${bestRatePct}% completion rate). This indicates high alignment between your planning scope and attention capacity in this domain.</p>
            </div>
            <div style="border: 1px solid #ebebeb; border-radius: 10px; padding: 15px; background: #fafafa;">
              <h4 style="margin-bottom: 8px; font-size: 13px;">Biggest Growth Investment</h4>
              <p style="margin: 0; color: #333;"><strong>${topAct}</strong> (${topHrs} hours invested). You directed the majority of your cognitive energy here, building deep consistency.</p>
            </div>
          </div>

          <!-- Section 6: Mindful Reflections Log -->
          <div class="section-title">Growth journal logs</div>
          <div style="border: 1px solid #ebebeb; border-radius: 10px; padding: 15px; background: #fafafa;">
            ${reflectionsHTML}
          </div>

          <div class="footer">
            Tooltails Focus &bull; Personal Growth Register &bull; All data compiled securely in-browser (LocalStorage)
          </div>

          ${'<' + 'script>'}
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          ${'</' + 'script>'}
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Initialize keyboard shortcuts modal trigger
  const dialog = document.getElementById('shortcuts-dialog') as HTMLDialogElement;
  const trigger = document.getElementById('shortcuts-trigger-btn');
  if (trigger && dialog) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dialog.showModal();
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.close();
      }
    });
  }

  // Longest streak calculator for the report
  function calculateLongestStreak(sessions: FocusSession[]): number {
    if (sessions.length === 0) return 0;
    const dates = Array.from(new Set(sessions
      .filter(s => s.outcome === 'Completed' || s.outcome === 'Partial')
      .map(s => s.timestamp.substring(0, 10))
    )).sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;
    
    for (const dStr of dates) {
      const d = new Date(dStr);
      if (prevDate === null) {
        currentStreak = 1;
      } else {
        const diffTime = Math.abs(d.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      prevDate = d;
    }
    return Math.max(maxStreak, currentStreak);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/focus/' }).catch(() => {});
  }
