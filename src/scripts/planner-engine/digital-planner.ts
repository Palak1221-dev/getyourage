import { FullPlannerPreview } from './preview-renderer';
import type { PlannerConfig } from './types';

const STORAGE_KEY = 'tt_digital_planner';

interface PageEntry { id: string; title: string; html: string }

type ZoomLevel = 'fit' | 0.75 | 1 | 1.25;

export interface DigitalPlannerOptions {
  /** Show sidebar for page navigation (default true) */
  sidebar?: boolean;
  /** Custom page generator (for products other than Study Planner Pro) */
  getPages?: (values: Record<string, string>, theme: any, title?: string, icon?: string) => PageEntry[];
  /** Render a read-only preview: no editing, no autosave, no export, no localStorage writes */
  previewOnly?: boolean;
  /** Render a cover-editable preview: only the Cover page stays editable, all other pages are strict read-only */
  coverEditablePreview?: boolean;
}

export class DigitalPlanner {
  private container: HTMLElement;
  private options: DigitalPlannerOptions;
  private pages: PageEntry[] = [];
  private currentId: string = 'cover';
  private currentIndex: number = 0;
  private zoom: ZoomLevel = 'fit';
  private sidebarNavWrap!: HTMLElement;
  private mainEl!: HTMLElement;
  private scrollEl!: HTMLElement;
  private pagesContainer!: HTMLElement;
  private savedData: Record<string, string> = {};
  private navCountEl!: HTMLElement;
  private navJumpEl!: HTMLSelectElement;
  private zoomBtns!: NodeListOf<HTMLElement>;
  private pageBuilder: (values: Record<string, string>, theme: any, title?: string, icon?: string) => PageEntry[];
  private previewOnly: boolean;
  private coverEditablePreview: boolean;
  private studyStreakDocListeners: {
    mousemove: ((e: MouseEvent) => void) | null;
    mouseup: (() => void) | null;
    touchmove: ((e: TouchEvent) => void) | null;
    touchend: (() => void) | null;
  } = { mousemove: null, mouseup: null, touchmove: null, touchend: null };

  private styleId: string = '';

  constructor(container: HTMLElement, values: Record<string, string>, theme: any, title?: string, icon?: string, options?: DigitalPlannerOptions) {
    this.container = container;
    this.options = options || {};
    this.previewOnly = options?.previewOnly || false;
    this.coverEditablePreview = options?.coverEditablePreview || false;
    this.styleId = 'dp-style-' + Math.random().toString(36).slice(2, 8);
    this.container = container;
    this.pageBuilder = options?.getPages || ((values, theme, title, icon) => {
      const preview = new FullPlannerPreview(values, theme, title, icon);
      return preview.getPageList();
    });
    this.pages = this.pageBuilder(values, theme, title, icon);
    this.loadSavedData();
  }

  private esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  mount(): void {
    this.container.innerHTML = '';

    // Create a child root div — never overwrite this.container's classes
    const root = document.createElement('div');
    root.className = 'digital-planner-root';
    this.container.appendChild(root);

    // Deduplicate style for re-mount support
    let style = document.getElementById(this.styleId) as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = this.styleId;
    }
    style.textContent = `
      .digital-planner-root {
        display:flex; flex-direction:column;
        width:100%; height:100%; overflow:hidden;
        background:#f5f2ed; font-family:Outfit,Inter,sans-serif;
      }
      .digital-planner-body {
        display:flex; flex:1; min-height:0;
      }

      /* --- Sidebar --- */
      .digital-planner-sidebar {
        width:200px; flex-shrink:0;
        background:#fffcf5; border-right:1px solid #ede4d8;
        display:flex; flex-direction:column; overflow:hidden;
      }
      .digital-planner-sidebar-title {
        padding:14px 16px 12px;
        font-size:12px; font-weight:700; color:#2d2a27;
        font-family:'Playfair Display',Outfit,serif;
        border-bottom:1px solid #ede4d8; flex-shrink:0;
      }
      .digital-planner-nav-wrap { flex:1; overflow-y:auto; overflow-x:hidden; padding:4px 0; }
      .digital-planner-nav-item {
        display:flex; align-items:center; gap:6px;
        padding:5px 14px; font-size:10px; color:#6b5f51;
        cursor:pointer; border-left:2px solid transparent; transition:all 0.1s;
      }
      .digital-planner-nav-item:hover { background:#f5f0ea; color:#2d2a27; }
      .digital-planner-nav-item.active { background:#f0ece6; color:#2d2a27; font-weight:600; border-left-color:#7c3aed; }
      .digital-planner-nav-item .page-icon { font-size:11px; width:16px; text-align:center; flex-shrink:0; opacity:0.6; }
      .digital-planner-nav-item.active .page-icon { opacity:1; }

      /* --- Main area (holds scrolling content) --- */
      .digital-planner-main {
        flex:1; min-width:0;
        display:flex; flex-direction:column; overflow:hidden;
      }
      .digital-planner-scroll {
        flex:1; overflow-y:auto; overflow-x:hidden;
        padding:24px 20px 40px;
        -webkit-overflow-scrolling:touch;
      }
      .digital-planner-page {
        display:none;
        width:100%;
      }
      .digital-planner-page.active { display:block; }
      .digital-planner-page img { max-width:100%; }

      /* --- Toolbar --- */
      .dp-toolbar {
        display:flex; align-items:center; gap:6px;
        padding:8px 16px; background:#fffcf5;
        border-bottom:1px solid #ede4d8; flex-shrink:0;
      }
      .dp-toolbar-group { display:flex; align-items:center; gap:4px; }
      .dp-toolbar-sep { width:1px; height:18px; background:#ede4d8; margin:0 6px; flex-shrink:0; }
      .dp-nav-btn {
        width:28px; height:28px; border-radius:6px;
        display:flex; align-items:center; justify-content:center;
        cursor:pointer; border:1px solid #ede4d8; background:#fffcf5;
        color:#6b5f51; flex-shrink:0;
      }
      .dp-nav-btn:hover { background:#f0ece6; color:#2d2a27; }
      .dp-nav-btn svg { width:14px; height:14px; }
      .dp-nav-label { font-size:10px; font-weight:600; color:#6b5f51; padding:0 6px; white-space:nowrap; }
      .dp-nav-select {
        font-size:10px; font-weight:600; color:#2d2a27;
        background:#f5f0ea; border:1px solid #ede4d8;
        border-radius:6px; padding:2px 6px; cursor:pointer; max-width:130px;
      }
      .dp-zoom-btn {
        padding:3px 9px; border-radius:5px; font-size:10px; font-weight:600;
        cursor:pointer; border:1px solid transparent; background:transparent;
        color:#6b5f51; white-space:nowrap;
      }
      .dp-zoom-btn:hover { background:#f0ece6; color:#2d2a27; }
      .dp-zoom-btn.active { background:#7c3aed; color:#fff; border-color:#7c3aed; }
      .dp-export-btn {
        margin-left:auto;
        padding:4px 10px; border-radius:5px; font-size:10px; font-weight:700;
        cursor:pointer; border:1px solid #7c3aed; background:#7c3aed; color:#fff;
        display:flex; align-items:center; gap:4px; white-space:nowrap;
      }
      .dp-export-btn:hover { background:#6d28d9; }

      /* --- Preview Mode badge --- */
      .dp-preview-badge {
        display:inline-flex; align-items:center; gap:4px;
        padding:3px 9px; border-radius:20px;
        font-size:9px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase;
        color:#6b5f51; background:#f5f0ea; border:1px solid #ede4d8;
        white-space:nowrap; flex-shrink:0;
      }

      /* --- Badge --- */
      .digital-planner-badge {
        position:fixed; bottom:20px; right:20px;
        background:#7c3aed; color:#fff; font-size:9px; font-weight:700;
        padding:6px 14px; border-radius:20px;
        box-shadow:0 2px 12px rgba(124,58,237,0.25);
        z-index:100; opacity:0; transition:opacity 0.3s; pointer-events:none;
      }
      .digital-planner-badge.show { opacity:1; }

      /* --- Contenteditable --- */
      .digital-planner-write { outline:none; }
      .digital-planner-write:focus { background:rgba(124,58,237,0.04); border-radius:2px; }
      /* --- Habit grid styles --- */
      [data-habit-cell] { transition:all 200ms ease !important; }
      [data-habit-cell]:hover { border-color:#93c5fd !important; box-shadow:0 0 0 2px rgba(37,99,235,0.1) !important; }
      .habit-grid-dragging { user-select:none !important; -webkit-user-select:none !important; }
      .habit-grid-dragging * { user-select:none !important; -webkit-user-select:none !important; }
    `;
    document.head.appendChild(style);

    // Toolbar
    const toolbar = this.createToolbar();
    root.appendChild(toolbar);

    // Body: sidebar + main
    const body = document.createElement('div');
    body.className = 'digital-planner-body';
    root.appendChild(body);

    // Sidebar (optional)
    if (this.options.sidebar !== false) {
      this.createSidebar(body);
    }

    // Main area
    this.mainEl = document.createElement('div');
    this.mainEl.className = 'digital-planner-main';
    body.appendChild(this.mainEl);

    // Scroll area
    this.scrollEl = document.createElement('div');
    this.scrollEl.className = 'digital-planner-scroll';
    this.mainEl.appendChild(this.scrollEl);

    // Pages container
    this.pagesContainer = document.createElement('div');
    this.scrollEl.appendChild(this.pagesContainer);

    // Save badge
    const badge = document.createElement('div');
    badge.className = 'digital-planner-badge';
    badge.id = 'planner-save-badge';
    badge.textContent = '✓ Saved';
    document.body.appendChild(badge);

    // Render all pages
    this.renderAll();

    if (this.previewOnly || this.coverEditablePreview) {
      const exportBtn = toolbar.querySelector('[data-action="export"]') as HTMLElement | null;
      const clearBtn = toolbar.querySelector('[data-action="clear"]') as HTMLElement | null;
      if (exportBtn) exportBtn.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
    }

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        if (this.previewOnly || this.coverEditablePreview) return;
        e.preventDefault();
        this.saveAll();
        this.showBadge('✓ Saved');
      }
    });

    // Apply zoom after render
    requestAnimationFrame(() => {
      this.applyZoom();
      // Validate all pages render correctly (dev-only diagnostic)
      if (typeof window !== 'undefined' && (window as any).__PLANNER_DEBUG) {
        setTimeout(() => this.validateAllPages(), 500);
      }
    });
  }

  /** Re-render all pages with updated values (for live preview updates) */
  setValues(values: Record<string, string>, theme: any, title?: string, icon?: string): void {
    this.pages = this.pageBuilder(values, theme, title || '', icon || '');
    // Re-render all pages in place
    this.renderAll();
    // Navigate to current page to sync sidebar + toolbar
    this.navigateTo(this.currentId);
    this.showBadge('Refreshed');
  }

  private createToolbar(): HTMLElement {
    const tb = document.createElement('div');
    tb.className = 'dp-toolbar';

    tb.innerHTML = `
      <div class="dp-toolbar-group">
        <button class="dp-nav-btn" data-action="prev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="dp-nav-label" id="dp-nav-count">1 / ${this.pages.length}</span>
        <button class="dp-nav-btn" data-action="next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <select class="dp-nav-select" id="dp-nav-jump">
          ${this.pages.map((p, i) => `<option value="${i}">${i + 1}. ${p.title}</option>`).join('')}
        </select>
      </div>
      <div class="dp-toolbar-sep"></div>
      <div class="dp-toolbar-group">
        <button class="dp-zoom-btn" data-zoom="0.75">75%</button>
        <button class="dp-zoom-btn" data-zoom="1">100%</button>
        <button class="dp-zoom-btn" data-zoom="1.25">125%</button>
        <button class="dp-zoom-btn active" data-zoom="fit">Fit Width</button>
      </div>
      <div class="dp-toolbar-sep"></div>
      <button class="dp-export-btn" data-action="export">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export
      </button>
      <button class="dp-nav-btn" data-action="clear" title="Clear All">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
      ${this.coverEditablePreview ? `<span class="dp-preview-badge">Preview Mode</span>` : ''}
    `;

    tb.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'prev') this.navPrev();
      else if (action === 'next') this.navNext();
      else if (action === 'export') this.exportAll();
      else if (action === 'clear') this.clearAll();
    });

    this.navCountEl = tb.querySelector('#dp-nav-count')!;
    this.navJumpEl = tb.querySelector('#dp-nav-jump')! as HTMLSelectElement;
    this.zoomBtns = tb.querySelectorAll('.dp-zoom-btn') as NodeListOf<HTMLElement>;

    this.navJumpEl.addEventListener('change', () => {
      const idx = parseInt(this.navJumpEl.value, 10);
      this.navigateTo(this.pages[idx]?.id);
    });

    this.zoomBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const z = btn.dataset.zoom as ZoomLevel;
        this.setZoom(z);
      });
    });

    return tb;
  }

  private createSidebar(body: HTMLElement): void {
    const sidebar = document.createElement('div');
    sidebar.className = 'digital-planner-sidebar';
    sidebar.innerHTML = `<div class="digital-planner-sidebar-title">✦ Study Planner</div>`;
    this.sidebarNavWrap = document.createElement('div');
    this.sidebarNavWrap.className = 'digital-planner-nav-wrap';
    sidebar.appendChild(this.sidebarNavWrap);

    this.pages.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'digital-planner-nav-item' + (i === 0 ? ' active' : '');
      item.dataset.page = p.id;
      item.innerHTML = `<span class="page-icon">${this.getIcon(p.id)}</span>${p.title}`;
      item.addEventListener('click', () => this.navigateTo(p.id));
      this.sidebarNavWrap.appendChild(item);
    });

    body.appendChild(sidebar);
  }

  private renderAll(): void {
    this.pagesContainer.innerHTML = '';
    const activeId = this.pages.some(p => p.id === this.currentId) ? this.currentId : (this.pages[0]?.id || this.currentId);
    this.pages.forEach((p) => {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'digital-planner-page' + (p.id === activeId ? ' active' : '');
      pageDiv.dataset.pageId = p.id;
      pageDiv.innerHTML = p.html;
      this.pagesContainer.appendChild(pageDiv);
      if (this.previewOnly) return;
      if (this.coverEditablePreview) {
        const isCover = p.id === 'cover' || p.id === 'wj-cover';
        if (!isCover) {
          this.makePageReadOnly(pageDiv);
          return;
        }
        this.makeWritable(pageDiv, p.id);
        return;
      }
      this.makeWritable(pageDiv, p.id);
    });
    if (this.previewOnly) return;
    if (this.coverEditablePreview) {
      this.initCover();
      this.initSMDCover();
      return;
    }
    this.restoreSavedData();
    this.initSubjectNames();
    this.initExamSubjectNames();
    this.pages.forEach(p => this.initCheckboxes(p.id));
    this.initCircleSelectors();
    this.initProgressBars();
    this.initHabitGrid();
    this.initExamReadiness();
    this.initExamStrategy();
    this.initAttendance();
    this.initWeeklyGrid();
    this.initEnergyTrackers();
    this.initStudyStreak();
    this.initSMDCover();
    this.initCover();
    this.initSMDChips();
    this.initSMDReplacements();
    this.initSMDAppDeepDive();
    this.initSMDMorningRitual();
    this.initSMDBedtimeRitual();
    this.initSMDBackout();
    this.initSMDFocusZone();
    this.initSMDWeeklyReview();
    this.initSMDRewards();
    this.initSMDMonthlyReview();
  }



  private initExamStrategy(): void {
    if (typeof document === 'undefined') return;
    var pageEl = this.pagesContainer.querySelector('[data-page-id="exam-strategy"]');
    if (!pageEl) return;
    var self = this;

    // Load saved exam strategy data on page load
    if (this.savedData['exam-strategy']) {
      try {
        var savedState = JSON.parse(this.savedData['exam-strategy']);
        if (savedState) {
          // Restore section names
          if (Array.isArray(savedState.sectionNames) && savedState.sectionNames.length === 3) {
            var nameEls = pageEl.querySelectorAll('[data-er="exam-strategy-section-name-"]') as NodeListOf<HTMLElement>;
            if (nameEls.length >= 3) {
              nameEls.forEach(function(el, idx) {
                if (idx < 3) {
                  el.textContent = savedState.sectionNames![idx];
                  self.savedData['exam-section-name:' + idx] = savedState.sectionNames![idx];
                }
              });
            }
          }

          // Restore days left
          if (savedState.daysLeft !== undefined) {
            var daysEl = pageEl.querySelector('[data-er="exam-strategy-days-left"]') as HTMLElement;
            if (daysEl) {
              var daysValue = Math.max(0, parseInt(savedState.daysLeft) || 30);
              daysEl.textContent = daysValue + ' days';

              var daysSlider = pageEl.querySelector('[data-er-range="exam-strategy-days-left"]') as HTMLInputElement;
              if (daysSlider) daysSlider.value = daysValue.toString();

              if (self.savedData['exam-strategy-days-left'] !== daysValue.toString()) {
                self.savedData['exam-strategy-days-left'] = daysValue.toString();
                self.persistSavedData();
              }
            }
          }

          // Restore confidence values
          if (Array.isArray(savedState.confs) && savedState.confs.length === 3) {
            for (var i = 0; i < 3; i++) {
              var key = 'exam-strategy-conf-' + i;
              var confValue = Math.max(1, Math.min(10, savedState.confs[i] || 5));
              var displayEl = pageEl.querySelector('[data-progress-input="' + key + '"]') as HTMLElement;
              if (displayEl) displayEl.textContent = confValue.toString();

              var slider = pageEl.querySelector('[data-er-range="exam-strategy-confidence"]') as HTMLInputElement;
              if (slider && i === 0) slider.value = confValue.toString();

              if (self.savedData['er-exam-strategy-confidence'] !== confValue.toString()) {
                self.savedData['er-exam-strategy-confidence'] = confValue.toString();
                self.persistSavedData();
              }
            }
          }

          // Restore timeline
          if (Array.isArray(savedState.timeline) && savedState.timeline.length === 5) {
            for (var i = 0; i < 5; i++) {
              var el = pageEl.querySelector('[data-er="exam-strategy-timeline-' + i + '"]') as HTMLElement;
              if (el && savedState.timeline[i]) {
                el.textContent = savedState.timeline[i];
              }
            }
          }
        }
      } catch (e) {
        console.error('Error loading saved Exam Strategy data:', e);
      }
    }

    // Listen to section name changes
    pageEl.querySelectorAll('[data-er-subject="section-name"]').forEach(function(el) {
      el.addEventListener('input', function() {
        var idx = (el as HTMLElement).dataset.erSubject;
        if (idx !== undefined) {
          var el2 = el as HTMLElement;
          var text = el2.textContent || '';
          if (self.savedData['exam-section-name:' + idx] !== text) {
            self.savedData['exam-section-name:' + idx] = text;
            self.persistSavedData();
          }
        }
      });
    });

    // Save exam strategy state
    function saveExamStrategyState(): void {
      var state: any = {};

      // Save section names
      var nameEls = pageEl.querySelectorAll('[data-er="exam-strategy-section-name-0"], [data-er="exam-strategy-section-name-1"], [data-er="exam-strategy-section-name-2"]');
      if (nameEls.length >= 3) {
        state.sectionNames = [];
        nameEls.forEach(function(el) {
          if (el instanceof HTMLElement) {
            state.sectionNames.push(el.textContent || '');
          }
        });
      }

      // Save days left
      var daysEl = pageEl.querySelector('[data-er="exam-strategy-days-left"]') as HTMLElement;
      if (daysEl) {
        var daysText = daysEl.textContent || '';
        var match = daysText.match(/^(\d+)/);
        if (match) state.daysLeft = match[1];
      }

      // Save confidences
      var confs: number[] = [];
      for (var i = 0; i < 3; i++) {
        var key = 'exam-strategy-conf-' + i;
        var el = pageEl.querySelector('[data-progress-input="' + key + '"]') as HTMLElement;
        var text = (el.textContent || '').replace(/[^0-9.]/g, '');
        var val = parseFloat(text) || 5;
        confs.push(Math.min(10, Math.max(1, val)));
      }
      state.confs = confs;

      // Save timeline
      state.timeline = [];
      for (var i = 0; i < 5; i++) {
        var el = pageEl.querySelector('[data-er="exam-strategy-timeline-' + i + '"]') as HTMLElement;
        if (el) state.timeline.push(el.textContent || '');
        else state.timeline.push('');
      }

      // Save to localStorage
      self.savedData['exam-strategy'] = JSON.stringify(state);
      self.persistSavedData();
    }

    // Attach event listeners
    pageEl.querySelectorAll('[data-er="exam-strategy-section-name-0"][contenteditable], [data-er="exam-strategy-section-name-1"][contenteditable], [data-er="exam-strategy-section-name-2"][contenteditable]').forEach(function(el) {
      el.addEventListener('input', saveExamStrategyState);
    });

    pageEl.querySelectorAll('[data-er="exam-strategy-days-left"][contenteditable]').forEach(function(el) {
      el.addEventListener('input', function() {
        var text = (el.textContent || '').replace(/\D/g, '');
        var match = text.match(/^(\d+)/);
        if (match) {
          var days = parseInt(match[1]);
          if (days > 0) {
            (el as HTMLElement).textContent = days + ' days';
            var daysSlider = pageEl.querySelector('[data-er-range="exam-strategy-days-left"]') as HTMLInputElement;
            if (daysSlider) daysSlider.value = days.toString();
            saveExamStrategyState();
          }
        }
      });
    });

    function getVal(dataEr: string, defaultVal: number): number {
      var el = pageEl!.querySelector('[data-er="' + dataEr + '"]') as HTMLElement;
      if (!el) return defaultVal;
      var text = (el.textContent || '').trim().replace(/[^0-9.]/g, '');
      var val = parseFloat(text) || 0;
      return val || defaultVal;
    }

    function updateAll(): void {
      var confs: number[] = [];
      for (var i = 0; i < 3; i++) {
        var key = 'exam-strategy-conf-' + i;
        var el = pageEl!.querySelector('[data-progress-input="' + key + '"]') as HTMLElement;
        if (!el) { confs.push(5); continue; }
        var text = (el.textContent || '').trim().replace(/[^0-9.]/g, '');
        var val = parseFloat(text) || 5;
        confs.push(Math.min(10, Math.max(1, val)));
      }
      var avgConf = (confs[0] + confs[1] + confs[2]) / 3;
      var readiness = Math.round((avgConf / 10) * 100);

      var ringFill = pageEl.querySelector('[data-exam-ring-fill]') as SVGCircleElement;
      if (ringFill) {
        var r = parseFloat(ringFill.getAttribute('r') || '32');
        var circ = 2 * Math.PI * r;
        ringFill.setAttribute('stroke-dasharray', String(circ));
        ringFill.setAttribute('stroke-dashoffset', String(circ * (1 - readiness / 100)));
      }
      var ringPct = pageEl.querySelector('[data-exam-ring-pct]');
      if (ringPct) ringPct.textContent = readiness + '%';

      var readinessEl = pageEl.querySelector('[data-exam-stat="readiness"]');
      if (readinessEl) readinessEl.textContent = readiness + '%';

      var daysLeft = Math.max(0, getVal('exam-strategy-days-left', 30));
      var daysEl = pageEl.querySelector('[data-er="exam-strategy-days-left"]') as HTMLElement;
      if (daysEl) daysEl.textContent = daysLeft + ' days';

      var sectionsEl = pageEl.querySelector('[data-er="exam-strategy-sections-count"]') as HTMLElement;
      if (sectionsEl) sectionsEl.textContent = '3/3';

      var timeTotal = Math.round(confs.reduce(function(s, c) { return s + (c * 20); }, 0));
      var timeEl = pageEl.querySelector('[data-er="exam-strategy-time-total"]') as HTMLElement;
      if (timeEl) timeEl.textContent = timeTotal + 'h';

      var strong: number[] = [], medium: number[] = [], weak: number[] = [];
      for (var i = 0; i < confs.length; i++) {
        var c = confs[i];
        var priorityEl = pageEl.querySelector('[data-exam-priority="' + i + '"]') as HTMLElement;
        if (c >= 7) {
          strong.push(i + 1);
          if (priorityEl) { priorityEl.textContent = 'Low'; priorityEl.style.color = '#10b981'; priorityEl.style.background = '#10b98108'; }
        } else if (c >= 4) {
          medium.push(i + 1);
          if (priorityEl) { priorityEl.textContent = 'Medium'; priorityEl.style.color = '#f59e0b'; priorityEl.style.background = '#f59e0b08'; }
        } else {
          weak.push(i + 1);
          if (priorityEl) { priorityEl.textContent = 'High'; priorityEl.style.color = '#ef4444'; priorityEl.style.background = '#ef444408'; }
        }
      }

      var strongEl = pageEl.querySelector('[data-exam-stat="strong-count"]') as HTMLElement;
      if (strongEl) strongEl.textContent = strong.length + ' strong';
      var mediumEl = pageEl.querySelector('[data-exam-stat="medium-count"]') as HTMLElement;
      if (mediumEl) mediumEl.textContent = medium.length + ' medium';
      var weakEl = pageEl.querySelector('[data-exam-stat="weak-count"]') as HTMLElement;
      if (weakEl) weakEl.textContent = weak.length + ' weak';
      var actionBadge = pageEl.querySelector('[data-exam-stat="action-badge"]') as HTMLElement;
      if (actionBadge) actionBadge.textContent = weak.length > 0 ? 'Focus on weak' : (readiness >= 80 ? 'Maintain' : 'Keep going');

      var strongAreasEl = pageEl.querySelector('[data-exam-stat="strong-areas"]') as HTMLElement;
      if (strongAreasEl) strongAreasEl.textContent = strong.length > 0 ? 'Section ' + strong.join(', ') + ' — confident!' : 'No strong areas yet.';

      var weakAreasEl = pageEl.querySelector('[data-exam-stat="weak-areas"]') as HTMLElement;
      if (weakAreasEl) weakAreasEl.textContent = weak.length > 0 ? 'Focus on Section ' + weak.join(', ') : medium.length > 0 ? 'Medium areas need attention.' : 'All sections look good!';

      var recEl = pageEl.querySelector('[data-exam-strategy-recommendation="main"]');
      if (recEl) {
        if (readiness >= 80) recEl.textContent = 'Great shape! Focus on practice tests and active recall.';
        else if (readiness >= 60) recEl.textContent = weak.length > 0 ? 'Prioritize Section ' + weak.join(', ') + ' to close gaps.' : 'Turn medium-confidence areas into strong ones.';
        else if (readiness >= 40) recEl.textContent = weak.length > 0 ? 'Start with Section ' + weak[0] + ' — build confidence there first.' : 'Create a focused study schedule.';
        else recEl.textContent = 'Build a strong foundation in your lowest-confidence sections first.';
      }

      var labelEl = pageEl.querySelector('[data-exam-stat="readiness-label"]');
      if (labelEl) {
        if (readiness >= 80) labelEl.textContent = 'Excellent readiness! You\'re well prepared.';
        else if (readiness >= 60) labelEl.textContent = 'Good progress! Keep closing gaps.';
        else if (readiness >= 40) labelEl.textContent = 'Building momentum. Focus on weak areas.';
        else labelEl.textContent = 'Getting started. Build your foundation first.';
      }
    }

    // Confidence changes → re-render ring + save
    pageEl.querySelectorAll('[data-progress-input]').forEach(function(el) {
      el.addEventListener('input', function() { updateAll(); saveExamStrategyState(); });
    });

    // Circle selector changes (difficulty) → re-render
    pageEl.addEventListener('circle-change', updateAll);

    // Timeline changes → save
    pageEl.querySelectorAll('[data-er^="exam-strategy-timeline-"][contenteditable]').forEach(function(el) {
      el.addEventListener('input', saveExamStrategyState);
    });

    // Initial render + save
    updateAll();
    saveExamStrategyState();
  }

  // ── Exam Readiness (Goal Roadmap) ──
  private initExamReadiness(): void {
    if (typeof document === 'undefined') return;
    var pageEl = this.pagesContainer.querySelector('[data-page-id="goal-setting"]');
    if (!pageEl) return;
    var self = this;
    var statusEl = pageEl.querySelector('[data-exam-status]') as HTMLElement | null;
    var emojiEl = pageEl.querySelector('[data-exam-status-emoji]') as HTMLElement | null;
    var recsEl = pageEl.querySelector('[data-exam-recs]') as HTMLElement | null;

    var STATUS = [
      { label: 'Just Started', emoji: '\uD83D\uDD34', color: '#ef4444' },
      { label: 'Needs Revision', emoji: '\uD83D\uDFE0', color: '#f97316' },
      { label: 'Almost Ready', emoji: '\uD83D\uDFE1', color: '#f59e0b' },
      { label: 'Ready for Mock Tests', emoji: '\uD83D\uDFE2', color: '#10b981' },
      { label: 'Exam Ready', emoji: '\uD83D\uDD35', color: '#2563eb' }
    ];

    var RECS = [
      ['Break your syllabus into manageable topics.', 'Set a daily study target to build momentum.', 'Start tracking progress to stay motivated.'],
      ['Prioritize your weakest topics first.', 'Complete another revision cycle.', 'Increase daily study time for challenging subjects.'],
      ['Attempt mock tests to identify remaining gaps.', 'Focus on areas where you feel least confident.', 'Review past mistakes carefully.'],
      ['Take timed mock exams to simulate exam conditions.', 'Review incorrect answers thoroughly.', 'Fine-tune your time management strategy.'],
      ['Rest well before the exam. Light review only.', 'Trust your preparation and stay calm.', 'Maintain your confidence — you are well prepared.']
    ];

    function getVal(key: string, def: number): number {
      var el = pageEl!.querySelector('[data-er="' + key + '"]') as HTMLElement;
      if (!el) return def;
      var text = (el.textContent || '').replace(/[^0-9.]/g, '');
      var val = parseFloat(text);
      return isNaN(val) ? def : Math.max(0, val);
    }

    function getExamStatus(): number {
      var revDone = getVal('revision-done', 0);
      var revTotal = getVal('revision-total', 0);
      var hasRev = revTotal > 0;
      var revPct = hasRev ? Math.min(100, Math.round((revDone / revTotal) * 100)) : 0;
      var conf = Math.min(10, Math.max(1, getVal('confidence', 5)));
      var weak = getVal('weak-topics', 0);

      if (hasRev && revPct >= 100 && conf >= 8 && weak === 0) return 4;
      if (hasRev && revPct >= 80 && conf >= 6 && weak <= 1) return 3;
      if (hasRev && revPct >= 50 && conf >= 4 && weak <= 3) return 2;
      if (hasRev && revPct > 0) return 1;
      return 0;
    }

    function syncRangeToDisplay(range: HTMLInputElement): void {
      var key = range.dataset.erRange;
      if (!key) return;
      var display = pageEl!.querySelector('[data-er="' + key + '"]') as HTMLElement;
      if (display) display.textContent = range.value;
    }

    function updateAll(): void {
      var idx = getExamStatus();
      var s = STATUS[idx];
      if (statusEl) { statusEl.textContent = s.label; statusEl.style.color = s.color; }
      if (emojiEl) emojiEl.textContent = s.emoji;
      if (recsEl) {
        var recs = RECS[idx];
        recsEl.innerHTML = recs.map(function(r) {
          return '<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:2px">' +
            '<span style="display:inline-block;width:14px;text-align:center;flex-shrink:0;font-size:9px;line-height:1.7">\u2022</span>' +
            '<span style="flex:1;font-size:9px;color:#4B5563;line-height:1.7">' + r + '</span>' +
          '</div>';
        }).join('');
      }
    }

    // Wire up range sliders
    pageEl.querySelectorAll('[data-er-range]').forEach(function(el) {
      var range = el as HTMLInputElement;
      var key = range.dataset.erRange;
      if (key) {
        var saved = self.savedData['er-' + key];
        if (saved !== undefined) range.value = saved;
      }
      syncRangeToDisplay(range);
      range.addEventListener('input', function() {
        syncRangeToDisplay(range);
        updateAll();
        self.savedData['er-' + range.dataset.erRange!] = range.value;
        self.persistSavedData();
      });
    });

    // Wire up contenteditable data-er fields
    pageEl.querySelectorAll('[data-er]').forEach(function(el) {
      var key = (el as HTMLElement).dataset.er;
      if (key && pageEl!.querySelector('[data-er-range="' + key + '"]')) return;
      el.addEventListener('input', function() {
        updateAll();
        self.persistSavedData();
      });
    });

    // Listen for circle-change events (from exam strategy page — harmless to keep)
    pageEl.addEventListener('circle-change', function() {
      updateAll();
      self.persistSavedData();
    });

    updateAll();
  }

  private initHabitGrid(): void {
    if (typeof document === 'undefined') return;
    const pageId = 'habit-tracker';
    const pageEl = this.pagesContainer.querySelector('[data-page-id="' + pageId + '"]');
    if (!pageEl) return;

    var self = this;
    var isDragging = false;
    var dragAction: boolean | null = null;

    function getKey(row: number, day: number): string {
      return 'habit-' + pageId + '-' + row + '-' + day;
    }

    // Restore saved states
    var cells = pageEl.querySelectorAll('[data-habit-cell]') as NodeListOf<HTMLElement>;
    cells.forEach(function (el) {
      var parts = (el.dataset.habitCell || '').split('-');
      var row = parseInt(parts[0], 10);
      var day = parseInt(parts[1], 10);
      var key = getKey(row, day);
      var saved = self.savedData[key];
      if (saved === '1') {
        el.style.background = '#2563eb';
        el.style.borderColor = '#2563eb';
      } else {
        el.style.background = 'white';
        el.style.borderColor = '#e5e7eb';
      }
    });

    function toggleCell(el: HTMLElement, complete: boolean): void {
      var parts = (el.dataset.habitCell || '').split('-');
      var row = parseInt(parts[0], 10);
      var day = parseInt(parts[1], 10);
      var key = getKey(row, day);

      if (complete) {
        el.style.background = '#2563eb';
        el.style.borderColor = '#2563eb';
        self.savedData[key] = '1';
      } else {
        el.style.background = 'white';
        el.style.borderColor = '#e5e7eb';
        self.savedData[key] = '0';
      }
      self.updateHabitStats();
    }

    function onStart(el: HTMLElement, x: number, y: number): void {
      var parts = (el.dataset.habitCell || '').split('-');
      var row = parseInt(parts[0], 10);
      var day = parseInt(parts[1], 10);
      var key = getKey(row, day);
      var currentlyChecked = self.savedData[key] === '1';
      dragAction = !currentlyChecked;
      isDragging = true;
      toggleCell(el, dragAction);
    }

    function onMove(el: HTMLElement): void {
      if (!isDragging || dragAction === null || !el.dataset.habitCell) return;
      toggleCell(el, dragAction);
    }

    function onEnd(): void {
      isDragging = false;
      dragAction = null;
      document.body.classList.remove('habit-grid-dragging');
      self.persistSavedData();
    }

    // Mouse drag (desktop) - handles both clicks and drags
    pageEl.addEventListener('mousedown', function (e) {
      var target = e.target as HTMLElement;
      if (target.dataset.habitCell === undefined) return;
      e.preventDefault();
      document.body.classList.add('habit-grid-dragging');
      onStart(target, e.clientX, e.clientY);
    });

    pageEl.addEventListener('mouseover', function (e) {
      var target = e.target as HTMLElement;
      if (target.dataset.habitCell === undefined) return;
      onMove(target);
    });

    document.addEventListener('mouseup', onEnd);

    // Touch drag (mobile)
    pageEl.addEventListener('touchstart', function (e) {
      var target = e.target as HTMLElement;
      if (target.dataset.habitCell === undefined) return;
      e.preventDefault();
      document.body.classList.add('habit-grid-dragging');
      var touch = e.touches[0];
      onStart(target, touch.clientX, touch.clientY);
    }, { passive: false });

    pageEl.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      e.preventDefault();
      var touch = e.touches[0];
      var el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
      if (el && el.dataset.habitCell !== undefined) {
        onMove(el);
      }
    }, { passive: false });

    pageEl.addEventListener('touchend', onEnd);

    // Initial stats update
    this.updateHabitStats();
  }

  private updateHabitStats(): void {
    var pageEl = this.pagesContainer.querySelector('[data-page-id="habit-tracker"]');
    if (!pageEl) return;

    var cells = pageEl.querySelectorAll('[data-habit-cell]') as NodeListOf<HTMLElement>;
    var totalCells = cells.length;
    var completedCount = 0;
    var perHabit: number[] = [];
    var daysInMonth = 0;

    cells.forEach(function (el) {
      var parts = (el.dataset.habitCell || '').split('-');
      var row = parseInt(parts[0], 10);
      var day = parseInt(parts[1], 10);
      if (day > daysInMonth) daysInMonth = day;
      if (!perHabit[row]) perHabit[row] = 0;
      if (el.style.background === 'rgb(37, 99, 235)' || el.style.background === '#2563eb') {
        completedCount++;
        perHabit[row]++;
      }
    });

    var totalHabits = perHabit.length;
    var overallPct = totalCells > 0 ? Math.round((completedCount / totalCells) * 100) : 0;
    var remaining = totalCells - completedCount;

    // Update stat cards
    var completionEl = pageEl.querySelector('[data-habit-stat="completion"]');
    if (completionEl) completionEl.textContent = overallPct + '%';

    var totalEl = pageEl.querySelector('[data-habit-stat="total"]');
    if (totalEl) totalEl.textContent = String(completedCount);

    var remainingEl = pageEl.querySelector('[data-habit-stat="remaining"]');
    if (remainingEl) remainingEl.textContent = String(remaining);

    // Compute streaks
    var streaks = this.getHabitStreaks(pageEl, daysInMonth, totalHabits);
    var bestStreakEl = pageEl.querySelector('[data-habit-stat="best-streak"]');
    if (bestStreakEl) bestStreakEl.textContent = streaks.best + 'd';

    var currentStreakEl = pageEl.querySelector('[data-habit-stat="current-streak"]');
    if (currentStreakEl) currentStreakEl.textContent = streaks.current + 'd';

    // Update per-habit progress bars and counts
    for (var i = 0; i < totalHabits; i++) {
      var count = perHabit[i] || 0;
      var pct = (count / daysInMonth) * 100;
      var progressEl = pageEl.querySelector('[data-habit-progress="' + i + '"]') as HTMLElement;
      if (progressEl) progressEl.style.width = pct + '%';
      var countEl = pageEl.querySelector('[data-habit-count="' + i + '"]');
      if (countEl) countEl.textContent = String(count);
    }
  }

  private getHabitStreaks(pageEl: Element, daysInMonth: number, totalHabits: number): { current: number; best: number } {
    // Best streak: longest consecutive day where AT LEAST ONE habit was completed
    var bestStreak = 0;
    var tempStreak = 0;
    var today = new Date().getDate();
    var currentStreak = 0;

    for (var day = 1; day <= daysInMonth; day++) {
      var anyCompleted = false;
      for (var h = 0; h < totalHabits; h++) {
        var cell = pageEl.querySelector('[data-habit-cell="' + h + '-' + day + '"]') as HTMLElement;
        if (cell && (cell.style.background === 'rgb(37, 99, 235)' || cell.style.background === '#2563eb')) {
          anyCompleted = true;
          break;
        }
      }
      if (anyCompleted) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Current streak: count backwards from today
    for (var day = today; day >= 1; day--) {
      var anyCompleted = false;
      for (var h = 0; h < totalHabits; h++) {
        var cell = pageEl.querySelector('[data-habit-cell="' + h + '-' + day + '"]') as HTMLElement;
        if (cell && (cell.style.background === 'rgb(37, 99, 235)' || cell.style.background === '#2563eb')) {
          anyCompleted = true;
          break;
        }
      }
      if (anyCompleted) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { current: currentStreak, best: bestStreak };
  }

private navigateTo(id: string): void {
    this.currentId = id;
    let idx = this.pages.findIndex(p => p.id === id);
    if (idx === -1) {
      idx = 0;
      this.currentId = this.pages[0]?.id || id;
    }
    this.currentIndex = idx;
    this.pagesContainer.querySelectorAll('.digital-planner-page').forEach(el => el.classList.remove('active'));
    const page = this.pagesContainer.querySelector(`[data-page-id="${this.currentId}"]`);
    if (page) page.classList.add('active');
    if (this.sidebarNavWrap) {
      this.sidebarNavWrap.querySelectorAll('.digital-planner-nav-item').forEach(el => el.classList.remove('active'));
      const item = this.sidebarNavWrap.querySelector(`[data-page="${id}"]`);
      if (item) item.classList.add('active');
    }
    this.scrollEl.scrollTop = 0;
    this.updateNavDisplay();
    
    if (id === 'exam-countdown') {
      this.attachReadinessRingUpdater();
    }
    
    requestAnimationFrame(() => {
      this.applyZoom();
      if (typeof window !== 'undefined' && (window as any).__PLANNER_DEBUG) {
        this.validateAllPages();
      }
    });
  }

  private initProgressBars(): void {
    if (typeof document === 'undefined') return;
    const inputs = this.pagesContainer.querySelectorAll('[data-progress-input]');
    inputs.forEach((inputEl) => {
      const input = inputEl as HTMLElement;
      const groupKey = input.dataset.progressInput || '';
      const max = parseInt(input.dataset.progressMax || '100', 10);
      const fill = this.pagesContainer.querySelector('[data-progress-fill="' + groupKey + '"]') as HTMLElement;
      if (!fill) return;

      const update = function() {
        const textBeforeSlash = (input.textContent || '').split('/')[0];
        const raw = textBeforeSlash.replace(/[^0-9.]/g, '');
        const val = parseFloat(raw) || 0;
        const pct = Math.min(100, Math.round((val / max) * 100));
        fill.style.width = pct + '%';
        const fc = fill.dataset.progressFixedcolor;
        if (!fc) {
          const color = pct <= 25 ? '#ef4444' : pct <= 50 ? '#f59e0b' : pct <= 75 ? '#3b82f6' : '#10b981';
          fill.style.background = color;
        }
      };

      update();
      input.addEventListener('input', update);
    });
  }

  private initCircleSelectors(): void {
    if (typeof document === 'undefined') return;
    const groups = this.pagesContainer.querySelectorAll('[data-circle-group]');
    groups.forEach((groupEl) => {
      const g = groupEl as HTMLElement;
      const groupKey = g.dataset.circleGroup!;
      const circles = g.querySelectorAll('.pp-circle');
      if (!circles.length) return;

      const savedVal = this.savedData['circle-' + groupKey];
      if (savedVal !== undefined) {
        const idx = parseInt(savedVal, 10);
        circles.forEach((c, i) => {
          const el = c as HTMLElement;
          const color = el.dataset.circleColor || '#e0d8cc';
          el.style.background = i <= idx ? color : 'transparent';
        });
        this.updateCircleLabel(g, idx);
      }

      circles.forEach((circle) => {
        const el = circle as HTMLElement;
        el.onclick = null;
        el.onclick = (e) => {
          e.stopPropagation();
          const val = parseInt(el.dataset.circleVal || '0', 10);
          circles.forEach((c) => {
            const ce = c as HTMLElement;
            const ci = parseInt(ce.dataset.circleVal || '0', 10);
            const color = ce.dataset.circleColor || '#e0d8cc';
            ce.style.background = ci <= val ? color : 'transparent';
          });
          this.savedData['circle-' + groupKey] = String(val);
          this.persistSavedData();
          this.updateCircleLabel(g, val);
          this.showBadge('✓ Saved');
          // Dispatch custom event for exam strategy
          g.dispatchEvent(new CustomEvent('circle-change', { bubbles: true }));
        };
      });
    });
  }

  private updateCircleLabel(groupEl: HTMLElement, idx: number): void {
    const raw = groupEl.dataset.circleLabels;
    if (!raw) return;
    try {
      const labels = JSON.parse(raw) as string[];
      const labelEl = groupEl.parentElement?.querySelector('.circle-group-label') || groupEl.nextElementSibling as HTMLElement;
      if (labelEl && labelEl.classList.contains('circle-group-label')) {
        labelEl.textContent = labels[idx] || '';
      }
    } catch {}
  }

  private attachReadinessRingUpdater(): void {
    if (typeof document === 'undefined') return;
    const pageEl = document.querySelector('[data-page-id="exam-countdown"]');
    if (!pageEl) return;
    const ring = pageEl.querySelector('[data-readiness-ring]') as HTMLElement;
    const circle = pageEl.querySelector('[data-readiness-circle]') as Element;
    const pctEl = pageEl.querySelector('[data-readiness-pct]') as HTMLElement;
    const input = pageEl.querySelector('[data-readiness-input]') as HTMLElement;
    if (!ring || !circle || !pctEl || !input) return;

    const ringSz = 72;
    const r = (ringSz - 8) / 2;
    const circ = 2 * Math.PI * r;

    const update = () => {
      const raw = (input.textContent || '').replace(/[^0-9]/g, '');
      const val = parseInt(raw, 10) || 0;
      const clamped = Math.min(Math.max(val, 0), 100);
      const color = clamped <= 25 ? '#ef4444' : clamped <= 50 ? '#f59e0b' : clamped <= 75 ? '#3b82f6' : '#10b981';
      const offset = circ * (1 - clamped / 100);
      circle.setAttribute('stroke', color);
      circle.setAttribute('stroke-dashoffset', String(offset));
      pctEl.textContent = clamped + '%';
    };

    input.addEventListener('input', update);
    // Run once to sync after restoreSavedData
    requestAnimationFrame(update);
  }

  private navPrev(): void {
    if (this.currentIndex > 0) {
      this.navigateTo(this.pages[this.currentIndex - 1].id);
    }
  }

  private navNext(): void {
    if (this.currentIndex < this.pages.length - 1) {
      this.navigateTo(this.pages[this.currentIndex + 1].id);
    }
  }

  private updateNavDisplay(): void {
    this.navCountEl.textContent = `${this.currentIndex + 1} / ${this.pages.length}`;
    this.navJumpEl.value = String(this.currentIndex);
  }

  setZoom(level: ZoomLevel): void {
    this.zoom = level;
    this.zoomBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.zoom === level);
    });
    this.applyZoom();
  }

  private applyZoom(): void {
    const activePage = this.pagesContainer.querySelector('.digital-planner-page.active') as HTMLElement;
    if (!activePage) return;

    const childBox = activePage.firstElementChild as HTMLElement | null;
    const targetWidth = childBox ? Math.max(childBox.offsetWidth || 800, 800) : 800;

    activePage.style.zoom = '';
    activePage.style.width = `${targetWidth}px`;
    activePage.style.margin = '0 auto';
    activePage.style.transformOrigin = 'top center';

    const scrollWidth = Math.max(this.scrollEl.clientWidth - 16, 280);

    if (this.zoom === 'fit') {
      const scale = scrollWidth / targetWidth;
      if (scale < 1) {
        activePage.style.transform = `scale(${scale})`;
      } else {
        activePage.style.transform = 'none';
      }
    } else {
      activePage.style.transform = `scale(${this.zoom})`;
    }
  }

  /** Make a page fully read-only: strip contenteditable, block interaction, default cursor */
  private makePageReadOnly(pageDiv: HTMLElement): void {
    pageDiv.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'));
    pageDiv.querySelectorAll('[tabindex]').forEach((el) => el.removeAttribute('tabindex'));
    pageDiv.querySelectorAll('[role]').forEach((el) => el.removeAttribute('role'));
    pageDiv.style.userSelect = 'none';
    pageDiv.style.cursor = 'default';
    pageDiv.style.pointerEvents = 'none';
  }

  private makeWritable(container: HTMLElement, pageId: string): void {    const candidates = container.querySelectorAll('div, span');
    let lineIndex = 0;
    candidates.forEach((el) => {
      const style = el.getAttribute('style') || '';
      const hasBorderBottom = style.includes('border-bottom') && !style.includes('none');
      const isHeader = style.includes('font-weight:700') || style.includes('font-weight:600');
      const isFlexOrGrid = style.includes('display:flex') || style.includes('display:grid');
      const isEmpty = !el.textContent?.trim() || el.textContent?.trim().length < 3;
      const hasPlaceholder = /_{2,}/.test(el.textContent?.trim() || '');
      const hasHeight = style.match(/(?:^|;)height:(\d+)px/);
      const lineH = hasHeight ? parseInt(hasHeight[1], 10) : 0;
      const isLineHeight = lineH >= 10 && lineH <= 24;
      const hasEr = el.hasAttribute('data-er');

      if (el.classList.contains('pp-cb')) return;
      let isWritable = false;
      if (hasBorderBottom && isEmpty && !isHeader && !isFlexOrGrid && isLineHeight) {
        isWritable = true;
      }
      if (hasPlaceholder && hasBorderBottom && !isFlexOrGrid && isLineHeight) {
        isWritable = true;
      }
      // Bare writing lines (last in group, no border-bottom): height in range, no background/width
      if (!hasBorderBottom && isEmpty && !isHeader && !isFlexOrGrid && isLineHeight &&
          !style.includes('background:') && !style.includes('width:')) {
        isWritable = true;
      }
      if (!hasBorderBottom && hasPlaceholder && !isFlexOrGrid && isLineHeight &&
          !style.includes('background:') && !style.includes('width:')) {
        isWritable = true;
      }
      // New data-er fields: editable even if they have placeholder text
      if (!isWritable && hasEr && hasBorderBottom && isLineHeight) {
        isWritable = true;
      }
      if (!isWritable) return;

      const key = `${pageId}:${lineIndex}`;
      el.contentEditable = 'true';
      el.className = (el.className || '') + ' digital-planner-write';
      el.dataset.writeKey = key;

      // Replace fixed height with min-height for typing area
      const newStyle = style
        .replace(/\bheight:(\d+)px/g, `min-height:${lineH}px`)
        .replace(new RegExp('line-height:[^;]+;?', 'g'), '');
      el.setAttribute('style', newStyle);
      el.style.lineHeight = `${lineH}px`;
      el.style.padding = '0';
      el.style.fontSize = `${Math.max(lineH - 4, 10)}px`;
      el.style.overflow = 'hidden';
      // Strip ___ placeholder text (renders as unwanted decorative lines inside editable fields)
      if (hasPlaceholder) {
        el.textContent = (el.textContent || '').replace(/_{3,}.*/g, '').trim();
      }

      el.addEventListener('input', () => {
        this.savedData[key] = el.innerHTML;
        this.persistSavedData();
        this.showBadge('✓ Saved');
      });
      lineIndex++;
    });
  }

  private initSubjectNames(): void {
    this.pagesContainer.querySelectorAll('[data-subject-name]').forEach((el) => {
      const el2 = el as HTMLElement;
      const idx = parseInt(el2.dataset.subjectName || '0', 10);
      const pageId = `subject-planner-${idx}`;

      // Restore saved name if available
      const savedName = this.savedData[`subject-name:${idx}`];
      if (savedName && savedName.trim()) {
        el2.textContent = savedName.trim();
      }

      // Make contenteditable with proper styling
      el2.contentEditable = 'true';
      el2.className = (el2.className || '') + ' digital-planner-write';
      el2.style.padding = '0';
      el2.style.overflow = 'hidden';

      // Sync sidebar with current name
      const name = (el2.textContent || '').trim();
      if (name) {
        this.updateSubjectNav(idx, name);
      }

      // Real-time sidebar update on input + persistent save
      el2.addEventListener('input', () => {
        const n = (el2.textContent || '').trim();
        if (n) {
          this.updateSubjectNav(idx, n);
        } else {
          this.updateSubjectNav(idx, `Subject ${idx + 1}`);
        }
        this.savedData[`subject-name:${idx}`] = n;
        this.persistSavedData();
      });

      // Restore placeholder on blur if empty
      el2.addEventListener('blur', () => {
        const n = (el2.textContent || '').trim();
        if (!n) {
          el2.textContent = `Subject ${idx + 1}`;
          this.updateSubjectNav(idx, `Subject ${idx + 1}`);
        }
        this.savedData[`subject-name:${idx}`] = el2.textContent || `Subject ${idx + 1}`;
        this.persistSavedData();
      });
    });
  }

  private initExamSubjectNames(): void {
    this.pagesContainer.querySelectorAll('[data-er-subject]').forEach((el) => {
      const el2 = el as HTMLElement;
      const idx = el2.dataset.erSubject || '0';
      const savedName = this.savedData[`exam-subject:${idx}`];
      if (savedName && savedName.trim()) {
        el2.textContent = savedName.trim();
      }
      el2.contentEditable = 'true';
      el2.style.padding = '0';
      el2.style.overflow = 'hidden';
      el2.addEventListener('input', () => {
        this.savedData[`exam-subject:${idx}`] = (el2.textContent || '').trim();
        this.persistSavedData();
      });
      el2.addEventListener('blur', () => {
        const n = (el2.textContent || '').trim();
        if (!n) {
          el2.textContent = 'Subject';
        }
        this.savedData[`exam-subject:${idx}`] = (el2.textContent || '').trim();
        this.persistSavedData();
      });
    });
  }

  private initCheckboxes(pageId: string): void {
    const pageEl = this.pagesContainer.querySelector(`[data-page-id="${pageId}"]`);
    if (!pageEl) return;
    let cbIdx = 0;
    pageEl.querySelectorAll('.pp-cb').forEach((el) => {
      const el2 = el as HTMLElement;
      const key = `cb-${pageId}-${cbIdx}`;
      el2.dataset.cb = String(cbIdx);

      // Save the original border color for restore on uncheck
      const origColor = el2.dataset.cbColor || el2.style.borderColor || '#d4c9bc';
      if (!el2.dataset.cbColor) el2.dataset.cbColor = origColor;

      // Determine if template default is checked (has non-transparent background)
      const bg = el2.style.backgroundColor || el2.style.background || '';
      const defaultChecked = bg && bg !== 'transparent' && bg !== '' && !bg.includes('none');

      // Restore saved state (overrides template default)
      const saved = this.savedData[key];
      if (saved === '1') {
        this.setCbChecked(el2, origColor);
      } else if (saved === '0') {
        this.setCbUnchecked(el2, origColor);
      } else if (defaultChecked) {
        // Template default is checked
        this.setCbChecked(el2, origColor);
      }

      // Click handler
      el2.addEventListener('click', (e) => {
        e.stopPropagation();
        const isChecked = el2.dataset.checked === '1';
        if (isChecked) {
          this.setCbUnchecked(el2, origColor);
          this.savedData[key] = '0';
        } else {
          this.setCbChecked(el2, origColor);
          this.savedData[key] = '1';
        }
        this.persistSavedData();
        this.showBadge('✓ Saved');
      });
      cbIdx++;
    });
  }

  private setCbChecked(el: HTMLElement, borderColor: string): void {
    el.dataset.checked = '1';
    el.style.background = '#10b981';
    el.style.borderColor = '#10b981';
    const dpr = window.devicePixelRatio || 1;
    const size = el.offsetWidth || 14;
    const chkSize = Math.max(Math.min(size - 6, 12), 4);
    if (!el.querySelector('svg')) {
      el.innerHTML = `<svg width="${chkSize}" height="${chkSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    }
  }

  private setCbUnchecked(el: HTMLElement, borderColor: string): void {
    delete el.dataset.checked;
    el.style.background = 'transparent';
    el.style.borderColor = borderColor;
    el.innerHTML = '';
  }

  private updateSubjectNav(index: number, name: string): void {
    const pageId = `subject-planner-${index}`;
    const display = name ? `${this.esc(name)} Planner` : `Subject ${index + 1} Planner`;

    // Update pages array
    const page = this.pages.find(p => p.id === pageId);
    if (page) page.title = display;

    // Update sidebar nav item
    const navItem = this.sidebarNavWrap?.querySelector(`[data-page="${pageId}"]`) as HTMLElement;
    if (navItem) {
      const icon = this.getIcon(pageId);
      navItem.innerHTML = `<span class="page-icon">${icon}</span>${display}`;
    }

    // Update toolbar select option
    const pageIdx = this.pages.findIndex(p => p.id === pageId);
    if (pageIdx >= 0 && this.navJumpEl) {
      const opt = this.navJumpEl.querySelector(`option[value="${pageIdx}"]`) as HTMLOptionElement;
      if (opt) opt.text = `${pageIdx + 1}. ${display}`;
    }
  }

  getPageCount(): number { return this.pages.length; }
  getCurrentPageIndex(): number { return this.currentIndex; }

  /** Validate all pages render with content. Returns diagnostic report. */
  validateAllPages(): { ok: boolean; pages: Array<{id:string;ok:boolean;issues:string[]}> } {
    const report: Array<{id:string;ok:boolean;issues:string[]}> = [];

    this.pages.forEach((p) => {
      const issues: string[] = [];
      const el = this.pagesContainer.querySelector(`[data-page-id="${p.id}"]`) as HTMLElement;
      if (!el) {
        issues.push('Page element not found in DOM');
        report.push({ id: p.id, ok: false, issues });
        return;
      }

      // Check inside the pageWrap wrapper (each page has 1 wrapper div)
      const inner = el.children[0] as HTMLElement;
      const innerContent = inner ? inner.innerHTML : el.innerHTML;
      const innerText = inner ? inner.textContent : el.textContent;
      const htmlLen = innerContent?.length || 0;
      const textLen = (innerText || '').trim().length;

      // Must have substantial HTML
      if (htmlLen < 50) issues.push(`HTML too short (${htmlLen} chars)`);

      // Must have visible text
      if (textLen < 10) issues.push(`Text too short (${textLen} chars)`);

      // Only check for header/writable on content pages (cover is static)
      if (p.id !== 'cover') {
        const headerEl = el.querySelector('[style*="font-weight:700"]');
        if (!headerEl) issues.push('No header/title');

        const writableCount = el.querySelectorAll('[data-write-key]').length;
        const editableCount = el.querySelectorAll('[contenteditable="true"]').length;
        if (writableCount < 1 && editableCount < 1) {
          issues.push(`No writable elements (w:${writableCount} e:${editableCount})`);
        }
      }

      report.push({ id: p.id, ok: issues.length === 0, issues });
    });

    const okCount = report.filter(r => r.ok).length;
    const allOk = okCount === report.length;

    if (allOk) {
      console.log(`[DigitalPlanner] All ${report.length} pages validated ✓`);
    } else {
      console.log(`[DigitalPlanner] Validation: ${okCount}/${report.length} pages OK`);
      report.filter(r => !r.ok).forEach(r => {
        console.warn(`[DigitalPlanner]  ✗ ${r.id}: ${r.issues.join('; ')}`);
      });
    }
    return { ok: allOk, pages: report };
  }

  private getIcon(id: string): string {
    const icons: Record<string, string> = {
      cover: '📔', dashboard: '📊', 'goal-setting': '🎯', 'semester-overview': '📅',
      'assignment-tracker': '📋', 'assignment-dashboard': '📊', 'assignment-log': '📝', 'assignment-planning': '📋',
      'exam-countdown': '⏳',
      'subject-planner-1': '📖', 'subject-planner-2': '📖',
      'subject-planner-3': '📖', 'subject-planner-4': '📖',
      'revision-tracker': '🔄', 'study-log': '📊',
      attendance: '📍', 'study-heatmap': '🔥', 'weekly-focus': '⭐',
      'weekly-planner-1': '📆', 'weekly-planner-2': '📆',
      'daily-planner': '📝', 'habit-tracker': '✅',
      'exam-strategy': '🧠', 'monthly-review': '📈',
      reflection: '💭', achievements: '🏆',
    };
    return icons[id] || '📄';
  }

  // ── Attendance Heatmap ──
  private initAttendance(): void {
    if (typeof document === 'undefined') return;
    var pageEl = this.pagesContainer.querySelector('[data-page-id="attendance"]');
    if (!pageEl) return;
    var grid = pageEl.querySelector('.att-grid') as HTMLElement;
    if (!grid) return;
    var self = this;
    var isDragging = false;
    var handledByMousedown = false;
    var dragMode: 'mark' | 'unmark' = 'mark';

    function getDateKey(fullDate: string): string {
      return 'att-' + fullDate;
    }

    function isPresent(cell: HTMLElement): boolean {
      return cell.classList.contains('att-present');
    }

    function setCell(cell: HTMLElement, present: boolean): void {
      var fullDate = cell.dataset.attDate;
      if (!fullDate) return;
      var key = getDateKey(fullDate);
      if (present) {
        cell.dataset.att = '1';
        cell.classList.add('att-present');
        self.savedData[key] = '1';
      } else {
        delete cell.dataset.att;
        cell.classList.remove('att-present');
        delete self.savedData[key];
      }
      // Play pop animation
      cell.classList.remove('att-toggle');
      void cell.offsetWidth;
      cell.classList.add('att-toggle');
      setTimeout(function() { cell.classList.remove('att-toggle'); }, 400);
    }

    function toggleCell(cell: HTMLElement): void {
      setCell(cell, !isPresent(cell));
    }

    function updateStats(): void {
      var allCells = grid.querySelectorAll('[data-att-date]');
      var present = 0;
      var total = 0;
      var dates: string[] = [];
      allCells.forEach(function(c) {
        var cell = c as HTMLElement;
        var dateStr = cell.dataset.attDate;
        if (!dateStr) return;
        total++;
        dates.push(dateStr);
        if (isPresent(cell)) present++;
      });
      var absent = total - present;
      var pct = total > 0 ? Math.round((present / total) * 100) : 0;

      var pctEl = pageEl.querySelector('[data-att-stat="pct"]');
      if (pctEl) pctEl.textContent = pct + '%';
      var presentEl = pageEl.querySelector('[data-att-stat="present"]');
      if (presentEl) presentEl.textContent = String(present);
      var absentEl = pageEl.querySelector('[data-att-stat="absent"]');
      if (absentEl) absentEl.textContent = String(absent);
      var daysLeftEl = pageEl.querySelector('[data-att-stat="days-left"]');
      if (daysLeftEl) daysLeftEl.textContent = String(total - present);

      var barEl = pageEl.querySelector('[data-att-stat="progress-bar"]') as HTMLElement;
      if (barEl) barEl.style.width = pct + '%';
      var fracEl = pageEl.querySelector('[data-att-stat="progress-frac"]');
      if (fracEl) fracEl.textContent = present + '/' + total;

      var sortedDates = dates.slice().sort();
      var currentStreak = 0;
      var bestStreak = 0;
      var streak = 0;
      var today = new Date();
      var todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

      for (var si = 0; si < sortedDates.length; si++) {
        var d = sortedDates[si];
        var cell = grid.querySelector('[data-att-date="' + d + '"]') as HTMLElement;
        if (cell && isPresent(cell)) {
          streak++;
          if (streak > bestStreak) bestStreak = streak;
          if (d <= todayStr) currentStreak = streak;
          else break;
        } else {
          streak = 0;
        }
      }

      var currentEl = pageEl.querySelector('[data-att-stat="streak-current"]');
      if (currentEl) currentEl.textContent = String(currentStreak);
      var bestEl = pageEl.querySelector('[data-att-stat="streak-best"]');
      if (bestEl) bestEl.textContent = String(bestStreak);
    }

    // Restore saved states
    var cells = grid.querySelectorAll('[data-att-date]');
    cells.forEach(function(c) {
      var cell = c as HTMLElement;
      var fullDate = cell.dataset.attDate;
      if (!fullDate) return;
      var key = getDateKey(fullDate);
      if (self.savedData[key] === '1') {
        cell.dataset.att = '1';
        cell.classList.add('att-present');
      }
    });

    cells.forEach(function(c) {
      var cell = c as HTMLElement;

      cell.addEventListener('click', function(e) {
        e.stopPropagation();
        if (handledByMousedown) {
          handledByMousedown = false;
          return;
        }
        toggleCell(cell);
        self.persistSavedData();
        updateStats();
        self.showBadge('\u2713 Saved');
      });

      cell.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          toggleCell(cell);
          self.persistSavedData();
          updateStats();
          self.showBadge('\u2713 Saved');
        }
      });

      cell.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDragging = true;
        handledByMousedown = true;
        dragMode = isPresent(cell) ? 'unmark' : 'mark';
        toggleCell(cell);
        self.persistSavedData();
        updateStats();
      });

      cell.addEventListener('mouseenter', function() {
        if (!isDragging) return;
        var currentlyPresent = isPresent(cell);
        if (dragMode === 'mark' && !currentlyPresent) {
          setCell(cell, true);
          self.persistSavedData();
          updateStats();
        } else if (dragMode === 'unmark' && currentlyPresent) {
          setCell(cell, false);
          self.persistSavedData();
          updateStats();
        }
      });

      cell.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        var target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
        if (target && target.dataset.attDate && target !== cell) {
          var currentlyPresent = isPresent(target);
          if (dragMode === 'mark' && !currentlyPresent) {
            setCell(target, true);
          } else if (dragMode === 'unmark' && currentlyPresent) {
            setCell(target, false);
          }
          self.persistSavedData();
          updateStats();
        }
      });
    });

    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        self.persistSavedData();
        self.showBadge('\u2713 Saved');
      }
    });

    updateStats();
  }

  // ── Weekly Grid (Assignment Planning) ──
  private initWeeklyGrid(): void {
    if (typeof document === 'undefined') return;
    var gridEl = this.pagesContainer.querySelector('[data-wg-grid="planning"]');
    if (!gridEl) return;
    var self = this;
    var isDragging = false;
    var handledByMousedown = false;
    var dragMode: 'mark' | 'unmark' = 'mark';

    function wgKey(r: number, c: number): string {
      return 'wg-planning-' + r + '-' + c;
    }

    function isChecked(cell: HTMLElement): boolean {
      return cell.classList.contains('wg-checked');
    }

    function setCell(cell: HTMLElement, checked: boolean): void {
      var r = cell.dataset.wgR;
      var c = cell.dataset.wgC;
      if (r === undefined || c === undefined) return;
      var key = wgKey(parseInt(r, 10), parseInt(c, 10));
      if (checked) {
        cell.classList.add('wg-checked');
        self.savedData[key] = '1';
      } else {
        cell.classList.remove('wg-checked');
        delete self.savedData[key];
      }
      // Play pop animation
      cell.classList.remove('wg-toggle');
      void cell.offsetWidth;
      cell.classList.add('wg-toggle');
      setTimeout(function() { cell.classList.remove('wg-toggle'); }, 300);
    }

    function toggleCell(cell: HTMLElement): void {
      setCell(cell, !isChecked(cell));
    }

    // Restore saved states
    var cells = gridEl.querySelectorAll('[data-wg-r]');
    cells.forEach(function(c) {
      var cell = c as HTMLElement;
      var r = cell.dataset.wgR;
      var c2 = cell.dataset.wgC;
      if (r === undefined || c2 === undefined) return;
      var key = wgKey(parseInt(r, 10), parseInt(c2, 10));
      if (self.savedData[key] === '1') {
        cell.classList.add('wg-checked');
      }
    });

    cells.forEach(function(c) {
      var cell = c as HTMLElement;

      cell.addEventListener('click', function(e) {
        e.stopPropagation();
        if (handledByMousedown) {
          handledByMousedown = false;
          return;
        }
        toggleCell(cell);
        self.persistSavedData();
      });

      cell.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          toggleCell(cell);
          self.persistSavedData();
        }
      });

      cell.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDragging = true;
        handledByMousedown = true;
        dragMode = isChecked(cell) ? 'unmark' : 'mark';
        toggleCell(cell);
      });

      cell.addEventListener('mouseenter', function() {
        if (!isDragging) return;
        var currentlyChecked = isChecked(cell);
        if (dragMode === 'mark' && !currentlyChecked) {
          setCell(cell, true);
        } else if (dragMode === 'unmark' && currentlyChecked) {
          setCell(cell, false);
        }
      });

      cell.addEventListener('touchstart', function(e) {
        isDragging = true;
        handledByMousedown = true;
        dragMode = isChecked(cell) ? 'unmark' : 'mark';
        toggleCell(cell);
        self.persistSavedData();
      }, { passive: true });

      cell.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        var target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
        if (target && target.dataset.wgR !== undefined && target.dataset.wgC !== undefined && target !== cell) {
          var currentlyChecked = isChecked(target);
          if (dragMode === 'mark' && !currentlyChecked) {
            setCell(target, true);
          } else if (dragMode === 'unmark' && currentlyChecked) {
            setCell(target, false);
          }
          self.persistSavedData();
        }
      }, { passive: true });
    });

    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        self.persistSavedData();
      }
    });

    document.addEventListener('touchend', function() {
      if (isDragging) {
        isDragging = false;
        self.persistSavedData();
      }
    });
  }

  // ── Energy Trackers ──
  private initEnergyTrackers(): void {
    if (typeof document === 'undefined') return;
    var containers = this.pagesContainer.querySelectorAll('[data-energy-week]');
    var self = this;

    function getEnergyLevel(pct: number): string {
      if (pct <= 15) return 'Very Low';
      if (pct <= 35) return 'Low';
      if (pct <= 60) return 'Moderate';
      if (pct <= 85) return 'Good';
      return 'Excellent';
    }

    containers.forEach(function(containerEl) {
      var container = containerEl as HTMLElement;
      var weekKey = container.dataset.energyWeek || '';
      if (!weekKey) return;
      var tracks = container.querySelectorAll('[data-energy-track]');

      function updateSingle(ek: string, pct: number): void {
        var fill = container.querySelector('[data-energy-fill="' + ek + '"]') as HTMLElement;
        var pctEl = container.querySelector('[data-energy-pct="' + ek + '"]') as HTMLElement;
        var levelEl = container.querySelector('[data-energy-level="' + ek + '"]') as HTMLElement;
        var track = container.querySelector('[data-energy-track="' + ek + '"]') as HTMLElement;
        if (fill) fill.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';
        if (levelEl) levelEl.textContent = getEnergyLevel(pct);
        if (track) track.setAttribute('aria-valuenow', String(pct));
        self.savedData['energy-' + ek] = String(pct);
      }

      function updateSummary(): void {
        var avgEl = container.querySelector('[data-energy-avg="' + weekKey + '"]');
        var highEl = container.querySelector('[data-energy-high="' + weekKey + '"]');
        var lowEl = container.querySelector('[data-energy-low="' + weekKey + '"]');
        var dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        var vals: { day: string; val: number }[] = [];
        tracks.forEach(function(t) {
          var el = t as HTMLElement;
          var ek = el.dataset.energyTrack || '';
          var raw = self.savedData['energy-' + ek];
          var v = parseInt(raw || '0', 10);
          var idx = parseInt(ek.split('-d')[1] || '0', 10);
          vals.push({ day: dayNames[idx] || '?', val: v });
        });
        var sum = vals.reduce(function(a, b) { return a + b.val; }, 0);
        var avg = Math.round(sum / vals.length);
        var highItem = vals.reduce(function(a, b) { return a.val >= b.val ? a : b; });
        var lowItem = vals.reduce(function(a, b) { return a.val <= b.val ? a : b; });
        if (avgEl) avgEl.textContent = avg + '%';
        if (highEl) highEl.textContent = highItem.val + '% (' + highItem.day + ')';
        if (lowEl) lowEl.textContent = lowItem.val + '% (' + lowItem.day + ')';
      }

      // Restore saved states
      tracks.forEach(function(t) {
        var el = t as HTMLElement;
        var ek = el.dataset.energyTrack || '';
        var saved = self.savedData['energy-' + ek];
        if (saved !== undefined) {
          var pct = Math.min(100, Math.max(0, parseInt(saved, 10) || 0));
          updateSingle(ek, pct);
        }
      });

      // Event handlers
      var dragState: { ek: string; track: HTMLElement } | null = null;

      function setFromEvent(track: HTMLElement, ek: string, clientX: number): void {
        var rect = track.getBoundingClientRect();
        var x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        var pct = Math.round((x / rect.width) * 100);
        updateSingle(ek, pct);
        self.persistSavedData();
        updateSummary();
      }

      tracks.forEach(function(t) {
        var track = t as HTMLElement;
        var ek = track.dataset.energyTrack || '';

        track.addEventListener('click', function(e) {
          e.stopPropagation();
          setFromEvent(track, ek, e.clientX);
        });

        track.addEventListener('mousedown', function(e) {
          e.preventDefault();
          dragState = { ek: ek, track: track };
          setFromEvent(track, ek, e.clientX);
        });

        track.addEventListener('touchstart', function(e) {
          var touch = e.touches[0];
          setFromEvent(track, ek, touch.clientX);
        });

        track.addEventListener('touchmove', function(e) {
          e.preventDefault();
          var touch = e.touches[0];
          setFromEvent(track, ek, touch.clientX);
        });

        track.addEventListener('keydown', function(e) {
          var current = parseInt(self.savedData['energy-' + ek] || '0', 10);
          var pct = current;
          if (e.key === 'ArrowRight') { pct = Math.min(100, current + 10); }
          else if (e.key === 'ArrowLeft') { pct = Math.max(0, current - 10); }
          else if (e.key === 'Home') { pct = 0; }
          else if (e.key === 'End') { pct = 100; }
          else return;
          e.preventDefault();
          e.stopPropagation();
          updateSingle(ek, pct);
          self.persistSavedData();
          updateSummary();
          self.showBadge('\u2713 Saved');
        });
      });

      // Document-level drag tracking
      document.addEventListener('mousemove', function(e) {
        if (!dragState) return;
        setFromEvent(dragState.track, dragState.ek, e.clientX);
      });

      document.addEventListener('mouseup', function() {
        if (dragState) {
          dragState = null;
          self.showBadge('\u2713 Saved');
        }
      });

      updateSummary();
    });
  }

  private initStudyStreak(): void {
    if (typeof document === 'undefined') return;

    // Cleanup existing document-level listeners to prevent duplicates on re-render
    if (this.studyStreakDocListeners.mousemove) {
      document.removeEventListener('mousemove', this.studyStreakDocListeners.mousemove);
      this.studyStreakDocListeners.mousemove = null;
    }
    if (this.studyStreakDocListeners.mouseup) {
      document.removeEventListener('mouseup', this.studyStreakDocListeners.mouseup);
      this.studyStreakDocListeners.mouseup = null;
    }
    if (this.studyStreakDocListeners.touchmove) {
      document.removeEventListener('touchmove', this.studyStreakDocListeners.touchmove);
      this.studyStreakDocListeners.touchmove = null;
    }
    if (this.studyStreakDocListeners.touchend) {
      document.removeEventListener('touchend', this.studyStreakDocListeners.touchend);
      this.studyStreakDocListeners.touchend = null;
    }

    var containers = this.pagesContainer.querySelectorAll('[data-study-streak]');
    if (!containers.length) return;
    var self = this;

    // Inject hover/focus styles once
    if (!document.getElementById('study-streak-style')) {
      var style = document.createElement('style');
      style.id = 'study-streak-style';
      style.textContent = `
        [data-streak-day]:hover { transform:scale(1.08);box-shadow:0 2px 8px rgba(37,99,235,0.2); }
        [data-streak-day]:focus-visible { outline:2px solid #2563eb;outline-offset:2px; }
        [data-streak-day][data-streak-checked="1"]:hover { box-shadow:0 2px 8px rgba(37,99,235,0.35); }
      `;
      document.head.appendChild(style);
    }

    function calcStreak(days: boolean[]): number {
      var streak = 0;
      for (var i = 0; i < days.length; i++) {
        if (days[i]) streak++;
        else break;
      }
      return streak;
    }

    function updateAll(container: HTMLElement, allDays: NodeListOf<Element>): void {
      var checkedCount = 0;
      var days: boolean[] = [];
      allDays.forEach(function(d) {
        var el = d as HTMLElement;
        var isChecked = el.dataset.streakChecked === '1';
        days.push(isChecked);
        if (isChecked) checkedCount++;
      });
      var streak = calcStreak(days);
      var pct = Math.round((checkedCount / 7) * 100);

      var valEl = container.querySelector('[data-streak-value]');
      if (valEl) valEl.textContent = String(streak);
      var pctEl = container.querySelector('[data-streak-pct]');
      if (pctEl) pctEl.textContent = String(pct);
      var totalEl = container.querySelector('[data-streak-total]');
      if (totalEl) totalEl.textContent = String(checkedCount);
    }

    function setDay(el: HTMLElement, checked: boolean): void {
      var label = el.dataset.dayLabel || 'Day';
      if (checked) {
        el.dataset.streakChecked = '1';
        el.setAttribute('aria-checked', 'true');
        el.setAttribute('aria-label', label + ': Studied');
        el.style.background = '#2563eb';
        el.style.borderColor = '#2563eb';
        el.style.color = 'white';
        el.style.transform = 'scale(1.08)';
        setTimeout(function() { el.style.transform = 'scale(1)'; }, 200);
      } else {
        delete el.dataset.streakChecked;
        el.setAttribute('aria-checked', 'false');
        el.setAttribute('aria-label', label + ': Not studied');
        el.style.background = '#ede4d8';
        el.style.borderColor = '#d4c9bc';
        el.style.color = '#8b7d6b';
        el.style.transform = 'scale(1)';
      }
    }

    containers.forEach(function(containerEl) {
      var container = containerEl as HTMLElement;
      var allDays = container.querySelectorAll('[data-streak-day]');

      // Restore saved states
      allDays.forEach(function(d) {
        var day = d as HTMLElement;
        var idx = day.dataset.streakDay || '';
        var saved = self.savedData['streak-achievements-' + idx];
        if (saved === '1') setDay(day, true);
      });
      updateAll(container, allDays);

      var dragState: { idx: string; el: HTMLElement; checked: boolean } | null = null;

      function toggleDay(el: HTMLElement): void {
        var isChecked = el.dataset.streakChecked === '1';
        setDay(el, !isChecked);
        var idx = el.dataset.streakDay || '';
        if (!isChecked) {
          self.savedData['streak-achievements-' + idx] = '1';
        } else {
          delete self.savedData['streak-achievements-' + idx];
        }
        self.persistSavedData();
        updateAll(container, allDays);
      }

      allDays.forEach(function(d) {
        var day = d as HTMLElement;
        var idx = day.dataset.streakDay || '';

        // Track if pointerdown already handled this interaction to prevent double-toggle from click event
        var pointerHandled = false;

        // pointerdown handles real clicks (mouse/touch) + drag initiation
        day.addEventListener('pointerdown', function(e) {
          if (e.button !== 0 && e.pointerType !== 'touch') return; // only left click or touch
          e.preventDefault();
          pointerHandled = true;
          var isChecked = day.dataset.streakChecked === '1';
          dragState = { idx: idx, el: day, checked: !isChecked };
          setDay(day, !isChecked);
          var dIdx = day.dataset.streakDay || '';
          if (!isChecked) {
            self.savedData['streak-achievements-' + dIdx] = '1';
          } else {
            delete self.savedData['streak-achievements-' + dIdx];
          }
          self.persistSavedData();
          updateAll(container, allDays);
        }, { passive: false });

        // Click handler for test environments and accessibility - only fires if pointerdown didn't handle it
        day.addEventListener('click', function(e) {
          e.stopPropagation();
          if (pointerHandled) { pointerHandled = false; return; }
          toggleDay(day);
        });

        // Keyboard handler
        day.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            toggleDay(day);
          }
        });
      });

      // Document-level drag tracking - use named functions for proper cleanup
      var selfDoc = document;

      var handlePointerMove = function(e: PointerEvent) {
        if (!dragState) return;
        var target = e.target as HTMLElement;
        if (target.dataset && target.dataset.streakDay !== undefined) {
          if (target !== dragState.el) {
            var targetChecked = target.dataset.streakChecked === '1';
            var shouldCheck = dragState.checked;
            if (targetChecked !== shouldCheck) {
              setDay(target, shouldCheck);
              var dIdx2 = target.dataset.streakDay || '';
              if (shouldCheck) {
                self.savedData['streak-achievements-' + dIdx2] = '1';
              } else {
                delete self.savedData['streak-achievements-' + dIdx2];
              }
            }
            dragState.el = target;
            dragState.idx = target.dataset.streakDay || '';
          }
        }
      };

      var handlePointerUp = function() {
        if (dragState) {
          self.persistSavedData();
          updateAll(container, allDays);
          self.showBadge('\u2713 Saved');
          dragState = null;
        }
      };

      // Remove previous document listeners if any
      if (self.studyStreakDocListeners.mousemove) {
        selfDoc.removeEventListener('pointermove', self.studyStreakDocListeners.mousemove);
      }
      if (self.studyStreakDocListeners.mouseup) {
        selfDoc.removeEventListener('pointerup', self.studyStreakDocListeners.mouseup);
      }

      // Add new document listeners and store references
      self.studyStreakDocListeners.mousemove = handlePointerMove;
      self.studyStreakDocListeners.mouseup = handlePointerUp;

      selfDoc.addEventListener('pointermove', handlePointerMove);
      selfDoc.addEventListener('pointerup', handlePointerUp);
    });
  }

  // ── Social Media Detox Cover ──
  private initSMDCover(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="cover"]') as HTMLElement;
    if (!page) return;
    var self = this;

    function key(field: string): string { return 'smd-cover-' + field; }

    function persist(): void { self.persistSavedData(); }

    page.querySelectorAll('[data-smd-cover]').forEach(function(el) {
      var field = el as HTMLElement;
      var fieldName = field.dataset.smdCover || '';
      var saved = self.savedData[key(fieldName)];
      if (saved && saved.trim()) {
        field.textContent = saved;
      }

      field.addEventListener('focus', function() {
        var val = (field.textContent || '').trim();
        if (!val || val === '___' || val === '—') {
          field.textContent = '';
        }
      });

      field.addEventListener('input', function() {
        var val = (field.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[key(fieldName)] = val;
        } else {
          delete self.savedData[key(fieldName)];
        }
        persist();
      });

      field.addEventListener('blur', function() {
        var val = (field.textContent || '').trim();
        if (!val || val === '___') {
          var defaults: Record<string, string> = {
            goal: 'Digital detox',
            topapp: '—',
            target: '—',
            commitment: 'I commit to reducing mindless scrolling and creating healthier digital habits.',
            name: 'Your Name',
            date: ''
          };
          field.textContent = defaults[fieldName] || '';
          delete self.savedData[key(fieldName)];
          persist();
        }
      });

      // Visual focus style
      field.style.transition = 'border-bottom-color 0.15s ease';
      field.addEventListener('mouseenter', function() {
        if (!field.dataset.smdCoverFocused) field.style.borderBottomColor = '#d4c9bc';
      });
      field.addEventListener('mouseleave', function() {
        if (!field.dataset.smdCoverFocused) field.style.borderBottomColor = 'transparent';
      });
      field.addEventListener('focusin', function() {
        field.dataset.smdCoverFocused = '1';
        field.style.borderBottomColor = '#0284c7';
      });
      field.addEventListener('focusout', function() {
        delete field.dataset.smdCoverFocused;
        var val = (field.textContent || '').trim();
        if (!val) {
          field.style.borderBottomColor = 'transparent';
        } else {
          field.style.borderBottomColor = '#d4c9bc';
        }
      });
    });
  }

  // ── Planner Cover personalization ──
  private initCover(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="cover"]') as HTMLElement;
    if (!page) return;
    var self = this;

    function key(field: string): string { return 'pp-cover-' + field; }

    function persist(): void { self.persistSavedData(); }

    page.querySelectorAll('[data-pp-cover]').forEach(function(el) {
      var field = el as HTMLElement;
      var fieldName = field.dataset.ppCover || '';
      var saved = self.savedData[key(fieldName)];
      if (saved && saved.trim() && saved !== '—') {
        field.textContent = saved;
      }

      field.addEventListener('focus', function() {
        var val = (field.textContent || '').trim();
        if (!val || val === '—') {
          field.textContent = '';
        }
        field.style.borderBottomColor = '#C4954A';
        field.style.borderBottomWidth = '0.5px';
        field.style.borderBottomStyle = 'solid';
      });

      field.addEventListener('input', function() {
        var val = (field.textContent || '').trim();
        if (val && val !== '—') {
          self.savedData[key(fieldName)] = val;
        } else {
          delete self.savedData[key(fieldName)];
        }
        persist();
      });

      field.addEventListener('blur', function() {
        var val = (field.textContent || '').trim();
        if (!val) {
          field.textContent = '—';
          delete self.savedData[key(fieldName)];
          persist();
        }
        if (fieldName === 'name') {
          field.style.borderBottomColor = 'rgba(196,148,74,0.3)';
        } else {
          field.style.borderBottomColor = 'transparent';
        }
      });
    });
  }

  // ── Social Media Detox Chips ──
  private initSMDChips(): void {
    if (typeof document === 'undefined') return;
    var chips = this.pagesContainer.querySelectorAll('[data-smd-chip]');
    if (!chips.length) return;
    var self = this;
    chips.forEach(function(el) {
      var chip = el as HTMLElement;
      var text = chip.dataset.smdChip || '';
      var pageEl = chip.closest('[data-page-id]') as HTMLElement;
      var pageId = pageEl ? pageEl.dataset.pageId || 'unknown' : 'unknown';
      var key = 'smd-chip-' + pageId + '-' + text;
      // Restore saved state
      if (self.savedData[key] === '1') {
        chip.classList.add('smd-active');
      }
      chip.addEventListener('click', function(e) {
        e.stopPropagation();
        chip.classList.toggle('smd-active');
        if (chip.classList.contains('smd-active')) {
          self.savedData[key] = '1';
        } else {
          delete self.savedData[key];
        }
        self.persistSavedData();
        self.showBadge('\u2713 Saved');
      });
    });
  }

  // ── Social Media Detox Replacement Activities ──
  private initSMDAppDeepDive(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="app-deep-dive"]') as HTMLElement;
    if (!page) return;
    var self = this;
    var pageId = 'deep';

    function key(field: string, idx?: number): string {
      return 'smd-' + pageId + '-' + field + (idx !== undefined ? '-' + idx : '');
    }

    function persist(): void { self.persistSavedData(); }

    function stripNonNum(v: string): string { return v.replace(/[^0-9.]/g, ''); }

    // Restore all saved data
    var nameFields = page.querySelectorAll('[data-smd-deep="name"]');
    nameFields.forEach(function(el, i) {
      var saved = self.savedData[key('name', i)] || '';
      if (saved) (el as HTMLElement).textContent = saved;
    });
    var hrsFields = page.querySelectorAll('[data-smd-deep="hrs"]');
    hrsFields.forEach(function(el, i) {
      var saved = self.savedData[key('hrs', i)] || '';
      if (saved) (el as HTMLElement).textContent = saved;
    });
    var purposeFields = page.querySelectorAll('[data-smd-deep="purpose"]');
    purposeFields.forEach(function(el, i) {
      var saved = self.savedData[key('purpose', i)] || '';
      if (saved) (el as HTMLElement).textContent = saved;
    });

    // Restore status selectors + row accents
    var rows = page.querySelectorAll('[data-smd-deep-row]');
    rows.forEach(function(el, ri) {
      var row = el as HTMLElement;
      var savedStatus = self.savedData[key('status', ri)] || '';
      if (savedStatus) {
        var btns = row.querySelectorAll('[data-smd-deep-status]');
        btns.forEach(function(b) {
          var btn = b as HTMLElement;
          if (btn.dataset.smdDeepStatus === savedStatus) {
            activateStatus(btn, row, savedStatus);
          }
        });
      }
    });

    function activateStatus(btn: HTMLElement, row: HTMLElement, status: string): void {
      // Deactivate all siblings
      var siblings = row.querySelectorAll('[data-smd-deep-status]');
      siblings.forEach(function(s) {
        var sb = s as HTMLElement;
        sb.classList.remove('smd-deep-active');
        sb.setAttribute('aria-pressed', 'false');
        sb.style.color = '#9CA3AF';
        sb.style.background = 'transparent';
        sb.style.borderColor = 'transparent';
      });
      // Activate this one
      btn.classList.add('smd-deep-active');
      btn.setAttribute('aria-pressed', 'true');
      if (status === 'keep') {
        btn.style.background = '#f0fdf5';
        btn.style.borderColor = '#86efac';
        btn.style.color = '#059669';
      } else if (status === 'limit') {
        btn.style.background = '#fffbeb';
        btn.style.borderColor = '#fde68a';
        btn.style.color = '#d97706';
      } else if (status === 'delete') {
        btn.style.background = '#fef2f2';
        btn.style.borderColor = '#fecaca';
        btn.style.color = '#dc2626';
      }
      // Row accent
      row.classList.remove('smd-deep-row-keep', 'smd-deep-row-limit', 'smd-deep-row-delete');
      if (status === 'keep') row.classList.add('smd-deep-row-keep');
      else if (status === 'limit') row.classList.add('smd-deep-row-limit');
      else if (status === 'delete') row.classList.add('smd-deep-row-delete');
      // Show copy button
      var copyBtn = row.querySelector('[data-smd-deep-copy]') as HTMLElement;
      if (copyBtn) {
        copyBtn.style.display = 'inline';
        copyBtn.style.color = status === 'keep' ? '#059669' : status === 'limit' ? '#d97706' : '#dc2626';
      }
    }

    function deactivateRow(row: HTMLElement): void {
      var btns = row.querySelectorAll('[data-smd-deep-status]');
      btns.forEach(function(s) {
        var sb = s as HTMLElement;
        sb.classList.remove('smd-deep-active');
        sb.setAttribute('aria-pressed', 'false');
        sb.style.color = '#9CA3AF';
        sb.style.background = 'transparent';
        sb.style.borderColor = 'transparent';
      });
      row.classList.remove('smd-deep-row-keep', 'smd-deep-row-limit', 'smd-deep-row-delete');
      var copyBtn = row.querySelector('[data-smd-deep-copy]') as HTMLElement;
      if (copyBtn) { copyBtn.style.display = 'none'; }
    }

    // Wire contenteditable save for all deep fields
    page.querySelectorAll('[data-smd-deep]').forEach(function(el) {
      var field = el as HTMLElement;
      var fieldType = field.dataset.smdDeep || '';
      var idx = field.dataset.smdIdx !== undefined ? parseInt(field.dataset.smdIdx || '0', 10) : undefined;
      var isNumeric = field.classList.contains('smd-deep-num');
      var lastVal = field.textContent || '';

      field.addEventListener('input', function() {
        var val = field.textContent || '';
        if (isNumeric) {
          var cleaned = stripNonNum(val);
          if (cleaned !== val) {
            field.textContent = cleaned;
            // Move cursor to end
            var sel = window.getSelection();
            if (sel) {
              var range = document.createRange();
              range.selectNodeContents(field);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
          val = cleaned;
        }
        lastVal = val;
        var savedVal = val && val !== '___' ? val : '';
        if (idx !== undefined) {
          if (savedVal) self.savedData[key(fieldType, idx)] = savedVal;
          else delete self.savedData[key(fieldType, idx)];
        } else {
          if (savedVal) self.savedData[key(fieldType)] = savedVal;
          else delete self.savedData[key(fieldType)];
        }
        persist();
      });

      // Strip placeholder on focus
      field.addEventListener('focus', function() {
        if (field.textContent === '___') {
          field.textContent = '';
        }
      });

      // Restore placeholder on blur if empty
      field.addEventListener('blur', function() {
        if (!field.textContent || field.textContent.trim() === '') {
          field.textContent = '';
          if (idx !== undefined) delete self.savedData[key(fieldType, idx)];
          else delete self.savedData[key(fieldType)];
          persist();
        }
      });
    });

    // Wire status selectors
    page.querySelectorAll('[data-smd-deep-status]').forEach(function(el) {
      var btn = el as HTMLElement;
      var ri = parseInt(btn.dataset.smdRow || '0', 10);
      var status = btn.dataset.smdDeepStatus || '';

      function selectThis(): void {
        var row = page.querySelector('[data-smd-deep-row="' + ri + '"]') as HTMLElement;
        if (!row) return;
        var currentStatus = self.savedData[key('status', ri)] || '';
        if (currentStatus === status) {
          // Toggle off
          deactivateRow(row);
          delete self.savedData[key('status', ri)];
        } else {
          activateStatus(btn, row, status);
          self.savedData[key('status', ri)] = status;
        }
        persist();
        self.showBadge('\u2713 Saved');
      }

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        selectThis();
      });

      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          selectThis();
        }
      });
    });

    // Wire copy buttons
    page.querySelectorAll('[data-smd-deep-copy]').forEach(function(el) {
      var copyBtn = el as HTMLElement;
      var ri = parseInt(copyBtn.dataset.smdDeepCopy || '0', 10);

      copyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        doCopy(ri);
      });

      copyBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          doCopy(ri);
        }
      });
    });

    function doCopy(ri: number): void {
      var status = self.savedData[key('status', ri)] || '';
      if (!status) return;
      var name = page.querySelector('[data-smd-deep="name"][data-smd-idx="' + ri + '"]') as HTMLElement;
      if (!name) return;
      var appName = (name.textContent || '').trim();
      if (!appName || appName === '___') return;

      var targetField: HTMLElement | null = null;
      if (status === 'keep') targetField = page.querySelector('[data-smd-deep="value"]');
      else if (status === 'limit') targetField = page.querySelector('[data-smd-deep="limit"]');
      else if (status === 'delete') targetField = page.querySelector('[data-smd-deep="delete"]');
      if (!targetField) return;

      var current = (targetField.textContent || '').trim();
      if (current === '___') { current = ''; }
      var lines = current ? current.split('\n') : [];
      if (lines.indexOf(appName) === -1) {
        var newVal = current ? current + '\n' + appName : appName;
        targetField.textContent = newVal;
        self.savedData[key(status)] = newVal;
        persist();
        self.showBadge('\u2713 Copied');
      } else {
        self.showBadge('Already added');
      }
    }

    // Restore bottom fields
    ['value', 'delete', 'limit', 'dailylimit'].forEach(function(field) {
      var saved = self.savedData[key(field)];
      if (saved) {
        var el = page.querySelector('[data-smd-deep="' + field + '"]') as HTMLElement;
        if (el) el.textContent = saved;
      }
    });
  }

  private initSMDMorningRitual(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="morning-ritual"]') as HTMLElement;
    if (!page) return;
    var self = this;
    var pageId = 'mr';

    function key(field: string, idx?: number): string {
      return 'smd-' + pageId + '-' + field + (idx !== undefined ? '-' + idx : '');
    }

    function persist(): void { self.persistSavedData(); }

    // Restore + wire all mr-fields (wakeup, phoneoff, gain)
    page.querySelectorAll('[data-smd-mr]').forEach(function(el) {
      var field = el as HTMLElement;
      var fieldName = field.dataset.smdMr || '';
      var saved = self.savedData[key(fieldName)] || '';
      if (saved) field.textContent = saved;

      field.addEventListener('focus', function() {
        if (field.textContent === '___') field.textContent = '';
      });

      field.addEventListener('input', function() {
        var val = (field.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[key(fieldName)] = val;
        } else {
          delete self.savedData[key(fieldName)];
        }
        persist();
      });

      field.addEventListener('blur', function() {
        var val = (field.textContent || '').trim();
        if (!val || val === '___') {
          if (fieldName === 'gain') {
            field.textContent = '';
          } else {
            // time fields don't restore placeholder
          }
          delete self.savedData[key(fieldName)];
          persist();
        }
      });
    });

    // Restore + wire all mr-labels (0-7 defaults, 8 personal)
    page.querySelectorAll('[data-smd-mr-label]').forEach(function(el) {
      var label = el as HTMLElement;
      var idx = label.dataset.smdMrLabel || '0';
      var saved = self.savedData[key('label', parseInt(idx, 10))] || '';
      if (saved) label.textContent = saved;

      label.addEventListener('focus', function() {
        if (label.textContent === '___') label.textContent = '';
      });

      label.addEventListener('input', function() {
        var val = (label.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[key('label', parseInt(idx, 10))] = val;
        } else {
          delete self.savedData[key('label', parseInt(idx, 10))];
        }
        persist();
      });

      label.addEventListener('blur', function() {
        var val = (label.textContent || '').trim();
        if (!val || val === '___') {
          label.textContent = '';
          delete self.savedData[key('label', parseInt(idx, 10))];
          persist();
        }
      });
    });
  }

  private initSMDBedtimeRitual(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="bedtime-routine"]') as HTMLElement;
    if (!page) return;
    var self = this;
    var pageId = 'br';

    function key(field: string, idx?: number): string {
      return 'smd-' + pageId + '-' + field + (idx !== undefined ? '-' + idx : '');
    }

    function persist(): void { self.persistSavedData(); }

    // Restore + wire all br-fields (bedtime, screentime, sleep)
    page.querySelectorAll('[data-smd-br]').forEach(function(el) {
      var field = el as HTMLElement;
      var fieldName = field.dataset.smdBr || '';
      var saved = self.savedData[key(fieldName)] || '';
      if (saved) field.textContent = saved;

      field.addEventListener('focus', function() {
        if (field.textContent === '___') field.textContent = '';
      });

      field.addEventListener('input', function() {
        var val = (field.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[key(fieldName)] = val;
        } else {
          delete self.savedData[key(fieldName)];
        }
        persist();
      });

      field.addEventListener('blur', function() {
        var val = (field.textContent || '').trim();
        if (!val || val === '___') {
          if (fieldName === 'sleep') {
            field.textContent = '';
          }
          delete self.savedData[key(fieldName)];
          persist();
        }
      });
    });

    // Restore + wire all br-labels (0-9 defaults, 10 personal)
    page.querySelectorAll('[data-smd-br-label]').forEach(function(el) {
      var label = el as HTMLElement;
      var idx = label.dataset.smdBrLabel || '0';
      var saved = self.savedData[key('label', parseInt(idx, 10))] || '';
      if (saved) label.textContent = saved;

      label.addEventListener('focus', function() {
        if (label.textContent === '___') label.textContent = '';
      });

      label.addEventListener('input', function() {
        var val = (label.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[key('label', parseInt(idx, 10))] = val;
        } else {
          delete self.savedData[key('label', parseInt(idx, 10))];
        }
        persist();
      });

      label.addEventListener('blur', function() {
        var val = (label.textContent || '').trim();
        if (!val || val === '___') {
          label.textContent = '';
          delete self.savedData[key('label', parseInt(idx, 10))];
          persist();
        }
      });
    });
  }

  private initSMDBackout(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="blackout-challenge"]') as HTMLElement;
    if (!page) return;
    var self = this;
    var pageId = 'bc';

    function key(field: string): string { return 'smd-' + pageId + '-' + field; }

    function persist(): void { self.persistSavedData(); }

    function activateDur(duration: number): void {
      var btns = page.querySelectorAll('[data-smd-bc-dur]');
      btns.forEach(function(b) {
        var btn = b as HTMLElement;
        var dur = parseInt(btn.dataset.smdBcDur || '0', 10);
        if (dur === duration) {
          btn.dataset.smdBcActive = 'true';
          btn.setAttribute('aria-checked', 'true');
          btn.style.background = '#0284c7';
          btn.style.borderColor = '#0284c7';
          var numEl = btn.querySelector('span:first-child') as HTMLElement;
          var labelEl = btn.querySelector('span:last-child') as HTMLElement;
          if (numEl) numEl.style.color = 'white';
          if (labelEl) labelEl.style.color = 'rgba(255,255,255,0.85)';
        } else {
          btn.dataset.smdBcActive = 'false';
          btn.setAttribute('aria-checked', 'false');
          btn.style.background = 'white';
          btn.style.borderColor = '#ede4d8';
          var numEl = btn.querySelector('span:first-child') as HTMLElement;
          var labelEl = btn.querySelector('span:last-child') as HTMLElement;
          if (numEl) numEl.style.color = '#4B5563';
          if (labelEl) labelEl.style.color = '#6B7280';
        }
      });
      // Show/hide day rows
      page.querySelectorAll('[data-smd-bc-day]').forEach(function(el) {
        var dayEl = el as HTMLElement;
        var dayNum = parseInt(dayEl.dataset.smdBcDay || '0', 10);
        dayEl.style.display = dayNum <= duration ? 'flex' : 'none';
      });
      self.savedData[key('duration')] = String(duration);
      persist();
    }

    // Restore duration
    var savedDur = parseInt(self.savedData[key('duration')] || '7', 10);
    activateDur(savedDur);

    // Wire duration selector
    page.querySelectorAll('[data-smd-bc-dur]').forEach(function(el) {
      var btn = el as HTMLElement;

      function selectThis(): void {
        var dur = parseInt(btn.dataset.smdBcDur || '0', 10);
        activateDur(dur);
        self.showBadge('\u2713 Duration set');
      }

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        selectThis();
      });

      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          selectThis();
        }
      });
    });

    // Wire all bc-fields (avoid, allow, day-N)
    page.querySelectorAll('[data-smd-bc-field]').forEach(function(el) {
      var field = el as HTMLElement;
      var fieldName = field.dataset.smdBcField || '';
      var saved = self.savedData[key(fieldName)] || '';
      if (saved) field.textContent = saved;

      field.addEventListener('focus', function() {
        if (field.textContent === '___') field.textContent = '';
      });

      field.addEventListener('input', function() {
        var val = (field.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[key(fieldName)] = val;
        } else {
          delete self.savedData[key(fieldName)];
        }
        persist();
      });

      field.addEventListener('blur', function() {
        var val = (field.textContent || '').trim();
        if (!val || val === '___') {
          field.textContent = '';
          delete self.savedData[key(fieldName)];
          persist();
        }
      });
    });
  }

  private initSMDFocusZone(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="focus-zone-planner"]') as HTMLElement;
    if (!page) return;
    var self = this;
    var pageId = 'fz';

    function key(field: string): string { return 'smd-' + pageId + '-' + field; }

    function persist(): void { self.persistSavedData(); }

    // Wire all fz-fields (areas, blocklen, blocks, besttime, review)
    page.querySelectorAll('[data-smd-fz]').forEach(function(el) {
      var field = el as HTMLElement;
      var fieldName = field.dataset.smdFz || '';
      var saved = self.savedData[key(fieldName)] || '';
      if (saved) field.textContent = saved;

      field.addEventListener('focus', function() {
        if (field.textContent === '___') field.textContent = '';
      });

      field.addEventListener('input', function() {
        var val = (field.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[key(fieldName)] = val;
        } else {
          delete self.savedData[key(fieldName)];
        }
        persist();
      });

      field.addEventListener('blur', function() {
        var val = (field.textContent || '').trim();
        if (!val || val === '___') {
          field.textContent = '';
          delete self.savedData[key(fieldName)];
          persist();
        }
      });
    });

    // Wire schedule labels (0, 1, 2)
    page.querySelectorAll('[data-smd-fz-sched]').forEach(function(el) {
      var label = el as HTMLElement;
      var idx = label.dataset.smdFzSched || '0';
      var saved = self.savedData[key('sched', parseInt(idx, 10))] || '';
      if (saved) label.textContent = saved;

      label.addEventListener('input', function() {
        var val = (label.textContent || '').trim();
        if (val) {
          self.savedData[key('sched', parseInt(idx, 10))] = val;
        } else {
          delete self.savedData[key('sched', parseInt(idx, 10))];
        }
        persist();
      });
    });

    // Wire schedule times (0, 1, 2)
    page.querySelectorAll('[data-smd-fz-schedtime]').forEach(function(el) {
      var time = el as HTMLElement;
      var idx = time.dataset.smdFzSchedtime || '0';
      var saved = self.savedData[key('schedtime', parseInt(idx, 10))] || '';
      if (saved) time.textContent = saved;

      time.addEventListener('input', function() {
        var val = (time.textContent || '').trim();
        if (val && val !== '--:--') {
          self.savedData[key('schedtime', parseInt(idx, 10))] = val;
        } else {
          delete self.savedData[key('schedtime', parseInt(idx, 10))];
        }
        persist();
      });
    });

    // Wire ritual labels (0-4)
    page.querySelectorAll('[data-smd-fz-ritual]').forEach(function(el) {
      var label = el as HTMLElement;
      var idx = label.dataset.smdFzRitual || '0';
      var saved = self.savedData[key('ritual', parseInt(idx, 10))] || '';
      if (saved) label.textContent = saved;

      label.addEventListener('input', function() {
        var val = (label.textContent || '').trim();
        if (val) {
          self.savedData[key('ritual', parseInt(idx, 10))] = val;
        } else {
          delete self.savedData[key('ritual', parseInt(idx, 10))];
        }
        persist();
      });
    });
  }

  private initSMDWeeklyReview(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="weekly-review"]') as HTMLElement;
    if (!page) return;
    var self = this;
    var pageId = 'wr';

    function key(field: string, idx?: number): string {
      return 'smd-' + pageId + '-' + field + (idx !== undefined ? '-' + idx : '');
    }

    function persist(): void { self.persistSavedData(); }

    var celebrateMsgs = [
      '✨ Great work reflecting on your week.',
      '🌿 Every intentional choice adds up.',
      '🎉 Another week reclaimed.',
      '🌟 Awareness is the first step to change.'
    ];

    function updateStats(): void {
      // Days Completed: count non-empty smd-bc-field-day-{N} entries
      var daysDone = 0;
      for (var d = 1; d <= 30; d++) {
        var dayVal = self.savedData['smd-bc-field-day-' + d];
        if (dayVal && dayVal.trim() && dayVal !== '___') daysDone++;
      }

      // Avg Screen Time: sum smd-deep-hrs-{idx} / 7
      var totalHrs = 0;
      var hasHrs = false;
      for (var hi = 0; hi < 6; hi++) {
        var hrsVal = self.savedData['smd-deep-hrs-' + hi];
        if (hrsVal && hrsVal.trim()) {
          var num = parseFloat(hrsVal.replace(/[^0-9.]/g, ''));
          if (!isNaN(num)) { totalHrs += num; hasHrs = true; }
        }
      }
      var avgScreen = hasHrs ? (totalHrs / 7) : 0;

      // Phone-Free Hrs/Day: read daily-tracker:{n} entries / count
      var pfTotal = 0;
      var pfCount = 0;
      for (var dk = 0; dk < 50; dk++) {
        var dtKey = 'daily-tracker:' + dk;
        var dtVal = self.savedData[dtKey];
        if (dtVal && dtVal.trim() && dtVal !== '___') {
          // daily-tracker:2 is phone-free hours
          if (dk === 2) {
            var pfNum = parseFloat(dtVal.replace(/[^0-9.]/g, ''));
            if (!isNaN(pfNum)) { pfTotal += pfNum; pfCount++; }
          }
        }
      }
      var avgPhoneFree = pfCount > 0 ? (pfTotal / pfCount) : 0;

      // Update stat displays
      var daysEl = page.querySelector('[data-smd-wr-stat="days"]') as HTMLElement;
      var screenEl = page.querySelector('[data-smd-wr-stat="screentime"]') as HTMLElement;
      var phoneEl = page.querySelector('[data-smd-wr-stat="phonefree"]') as HTMLElement;
      if (daysEl) daysEl.textContent = daysDone > 0 ? String(daysDone) : 'Complete your first day';
      if (screenEl) {
        screenEl.textContent = hasHrs ? avgScreen.toFixed(1) + 'h' : 'Start your challenge';
      }
      if (phoneEl) {
        phoneEl.textContent = pfCount > 0 ? avgPhoneFree.toFixed(1) + 'h' : 'Track phone-free hours';
      }

      // Update trend bars
      updateTrend(hasHrs);
    }

    function updateTrend(hasData: boolean): void {
      var emptyEl = page.querySelector('[data-smd-wr-trend-empty]') as HTMLElement;
      var barsEl = page.querySelector('[data-smd-wr-trend-bars]') as HTMLElement;
      if (!emptyEl || !barsEl) return;
      if (!hasData) {
        emptyEl.style.display = 'block';
        barsEl.style.display = 'none';
        return;
      }
      emptyEl.style.display = 'none';
      barsEl.style.display = 'block';
      // Read per-day screen time from daily-tracker entries (keys 0, 4, 8, ... or use random/pattern)
      var dayVals: number[] = [];
      for (var di = 0; di < 7; di++) {
        var dayKey = 'daily-tracker:' + (di * 2);
        var dv = self.savedData[dayKey];
        if (dv && dv.trim() && dv !== '___') {
          var n = parseFloat(dv.replace(/[^0-9.]/g, ''));
          dayVals.push(isNaN(n) ? 0 : n);
        } else {
          dayVals.push(-1); // no data for this day
        }
      }
      // Use app-deep-dive total as fallback: distribute evenly with variation
      if (dayVals.every(function(v) { return v < 0; })) {
        var base = totalHrs / 7;
        for (var di2 = 0; di2 < 7; di2++) {
          var variation = 0.5 + Math.random() * 1.5;
          dayVals[di2] = base * variation;
        }
      }
      var maxVal = 0;
      dayVals.forEach(function(v) { if (v > maxVal) maxVal = v; });
      var bars = barsEl.querySelectorAll('[data-smd-wr-bar]');
      var dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      bars.forEach(function(el, i) {
        var bar = el as HTMLElement;
        var val = dayVals[i];
        if (val < 0) {
          bar.style.height = '4px';
          bar.style.background = '#ede4d8';
          bar.style.title = dayNames[i] + ': No data';
        } else {
          var pct = maxVal > 0 ? (val / maxVal * 100) : 0;
          var h = Math.max(4, Math.round(pct * 36 / 100));
          bar.style.height = h + 'px';
          var intensity = Math.round(40 + (val / (maxVal || 1)) * 60);
          bar.style.background = 'linear-gradient(to top,' + A + ',' + A + intensity + ')';
          bar.title = dayNames[i] + ': ' + val.toFixed(1) + 'h';
        }
      });
    }

    // Provide access for updateTrend closure
    var totalHrs = 0;
    for (var hi2 = 0; hi2 < 6; hi2++) {
      var hrsVal2 = self.savedData['smd-deep-hrs-' + hi2];
      if (hrsVal2 && hrsVal2.trim()) {
        var num2 = parseFloat(hrsVal2.replace(/[^0-9.]/g, ''));
        if (!isNaN(num2)) totalHrs += num2;
      }
    }

    updateStats();

    // Wire reflection fields
    page.querySelectorAll('[data-smd-wr]').forEach(function(el) {
      var field = el as HTMLElement;
      var fieldName = field.dataset.smdWr || '';
      var saved = self.savedData[key(fieldName)] || '';
      if (saved) field.textContent = saved;

      field.addEventListener('focus', function() {
        if (field.textContent === '___') field.textContent = '';
      });

      field.addEventListener('input', function() {
        var val = (field.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[key(fieldName)] = val;
        } else {
          delete self.savedData[key(fieldName)];
        }
        persist();
        checkCompletion();
      });

      field.addEventListener('blur', function() {
        var val = (field.textContent || '').trim();
        if (!val || val === '___') {
          field.textContent = '';
          delete self.savedData[key(fieldName)];
          persist();
          checkCompletion();
        }
      });
    });

    function checkCompletion(): void {
      var allKeys = ['benefits-0', 'benefits-1', 'benefits-2', 'challenges-0', 'challenges-1', 'challenges-2', 'learned-0', 'learned-1', 'keepdoing-0', 'improve-0'];
      var filled = 0;
      allKeys.forEach(function(k) {
        var v = self.savedData[key(k)];
        if (v && v.trim() && v !== '___') filled++;
      });
      var celebrateEl = page.querySelector('[data-smd-wr-celebrate]') as HTMLElement;
      if (!celebrateEl) return;
      if (filled === allKeys.length) {
        var msg = celebrateMsgs[Math.floor(Math.random() * celebrateMsgs.length)];
        celebrateEl.textContent = msg;
        celebrateEl.style.display = 'block';
        celebrateEl.style.opacity = '0';
        setTimeout(function() { celebrateEl.style.opacity = '1'; }, 50);
      } else {
        celebrateEl.style.display = 'none';
        celebrateEl.textContent = '';
      }
    }

    checkCompletion();
  }

  private initSMDRewards(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="rewards-milestones"]') as HTMLElement;
    if (!page) return;
    var self = this;
    var pageId = 'rm';

    function key(field: string, idx?: string): string {
      return 'smd-' + pageId + '-' + field + (idx !== undefined ? '-' + idx : '');
    }

    function persist(): void { self.persistSavedData(); }

    var celebrateMsgs = [
      '✨ Amazing progress.',
      '🌿 You\'re building healthier habits.',
      '🎉 Keep going\u2014small wins matter.',
      '💫 Every step forward counts.'
    ];

    function updateStats(): void {
      var daysDone = 0;
      for (var d = 1; d <= 30; d++) {
        var dayVal = self.savedData['smd-bc-field-day-' + d];
        if (dayVal && dayVal.trim() && dayVal !== '___') daysDone++;
      }
      var streak = 0;
      for (var ds = 30; ds >= 1; ds--) {
        var val = self.savedData['smd-bc-field-day-' + ds];
        if (val && val.trim() && val !== '___') streak++;
        else break;
      }
      var daysEl = page.querySelector('[data-smd-rm-stat="days"]') as HTMLElement;
      var streakEl = page.querySelector('[data-smd-rm-stat="streak"]') as HTMLElement;
      if (daysEl) daysEl.textContent = daysDone > 0 ? String(daysDone) + ' days' : 'Complete a day';
      if (streakEl) streakEl.textContent = streak > 0 ? String(streak) + ' days' : 'Start a streak';
    }

    updateStats();

    // Wire milestone fields
    page.querySelectorAll('[data-smd-rm-milestone]').forEach(function(el) {
      var field = el as HTMLElement;
      var dayKey = field.dataset.smdRmMilestone || '7';
      var saved = self.savedData[key('milestone', dayKey)] || '';
      if (saved) field.textContent = saved;

      field.addEventListener('focus', function() {
        if (field.textContent === '___') field.textContent = '';
      });

      field.addEventListener('input', function() {
        var val = (field.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[key('milestone', dayKey)] = val;
        } else {
          delete self.savedData[key('milestone', dayKey)];
        }
        persist();
        checkCelebration();
      });

      field.addEventListener('blur', function() {
        var val = (field.textContent || '').trim();
        if (!val || val === '___') {
          field.textContent = '';
          delete self.savedData[key('milestone', dayKey)];
          persist();
          checkCelebration();
        }
      });
    });

    // Wire challenge labels
    page.querySelectorAll('[data-smd-rm-challenge]').forEach(function(el) {
      var label = el as HTMLElement;
      var idx = parseInt(label.dataset.smdRmChallenge || '0', 10);
      var saved = self.savedData[key('challenge', String(idx))] || '';
      if (saved) label.textContent = saved;

      label.addEventListener('input', function() {
        var val = (label.textContent || '').trim();
        if (val) {
          self.savedData[key('challenge', String(idx))] = val;
        } else {
          delete self.savedData[key('challenge', String(idx))];
        }
        persist();
      });
    });

    // Listen for checkbox clicks to trigger celebration
    page.addEventListener('click', function(e) {
      var target = e.target as HTMLElement;
      if (target.classList.contains('pp-cb')) {
        setTimeout(function() { checkCelebration(); }, 50);
      }
    });

    function checkCelebration(): void {
      var celebrateEl = page.querySelector('[data-smd-rm-celebrate]') as HTMLElement;
      if (!celebrateEl) return;

      var hasMilestone = false;
      ['7', '14', '21', '30'].forEach(function(d) {
        var v = self.savedData[key('milestone', d)];
        if (v && v.trim() && v !== '___') hasMilestone = true;
      });

      var hasCheckedChallenge = false;
      for (var ci = 0; ci < 5; ci++) {
        if (self.savedData['cb-rewards-milestones-' + ci] === '1') {
          hasCheckedChallenge = true;
          break;
        }
      }

      if (hasMilestone || hasCheckedChallenge) {
        var msg = celebrateMsgs[Math.floor(Math.random() * celebrateMsgs.length)];
        celebrateEl.textContent = msg;
        celebrateEl.style.display = 'block';
        celebrateEl.style.opacity = '0';
        setTimeout(function() { celebrateEl.style.opacity = '1'; }, 50);
      } else {
        celebrateEl.style.display = 'none';
        celebrateEl.textContent = '';
      }
    }

    checkCelebration();
  }

  private initSMDMonthlyReview(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="monthly-review"]') as HTMLElement;
    if (!page) return;
    var self = this;
    var pageId = 'mr2';

    function key(field: string): string {
      return 'smd-' + pageId + '-' + field;
    }

    function persist(): void { self.persistSavedData(); }

    var reflections = [
      'You spent less time scrolling and created more intentional offline moments.',
      'Your consistency improved throughout the month.',
      'You\'re becoming more mindful of when and why you reach for your phone.',
      'Small daily choices add up to meaningful change over time.',
      'You proved to yourself that you can step back and choose differently.'
    ];

    function updateStats(): void {
      var daysDone = 0;
      for (var d = 1; d <= 30; d++) {
        var dayVal = self.savedData['smd-bc-field-day-' + d];
        if (dayVal && dayVal.trim() && dayVal !== '___') daysDone++;
      }

      var totalHrs = 0;
      var hasHrs = false;
      for (var hi = 0; hi < 6; hi++) {
        var hrsVal = self.savedData['smd-deep-hrs-' + hi];
        if (hrsVal && hrsVal.trim()) {
          var num = parseFloat(hrsVal.replace(/[^0-9.]/g, ''));
          if (!isNaN(num)) { totalHrs += num; hasHrs = true; }
        }
      }

      var startVal = hasHrs ? totalHrs / 7 : 0;
      var endVal = hasHrs ? (totalHrs / 7) * Math.max(0.4, 1 - daysDone * 0.02) : 0;
      var reclaimed = (startVal - endVal) * Math.max(daysDone, 0);

      var daysEl = page.querySelector('[data-smd-mr2-stat="days"]') as HTMLElement;
      var startEl = page.querySelector('[data-smd-mr2-stat="start"]') as HTMLElement;
      var endEl = page.querySelector('[data-smd-mr2-stat="end"]') as HTMLElement;
      var reclaimEl = page.querySelector('[data-smd-mr2-stat="reclaimed"]') as HTMLElement;

      if (daysEl) daysEl.textContent = daysDone > 0 ? String(daysDone) + ' days' : 'No entries yet';
      if (startEl) startEl.textContent = hasHrs ? startVal.toFixed(1) + 'h' : '—';
      if (endEl) endEl.textContent = hasHrs ? endVal.toFixed(1) + 'h' : '—';
      if (reclaimEl) reclaimEl.textContent = reclaimed > 0 ? reclaimed.toFixed(1) + 'h' : 'Start tracking';
    }

    updateStats();

    // Generate personalized reflection if enough data
    var daysForReflection = 0;
    for (var dr = 1; dr <= 30; dr++) {
      var dv = self.savedData['smd-bc-field-day-' + dr];
      if (dv && dv.trim() && dv !== '___') daysForReflection++;
    }
    var hasHrsForReflection = false;
    for (var hr = 0; hr < 6; hr++) {
      var hv = self.savedData['smd-deep-hrs-' + hr];
      if (hv && hv.trim() && parseFloat(hv.replace(/[^0-9.]/g, '')) > 0) hasHrsForReflection = true;
    }

    var insightEl = page.querySelector('[data-smd-mr2-insight]') as HTMLElement;
    if (insightEl && (daysForReflection >= 1 || hasHrsForReflection)) {
      var idx = Math.min(daysForReflection, reflections.length - 1);
      var msg = reflections[idx] || reflections[0];
      insightEl.textContent = msg;
      insightEl.style.display = 'block';
      insightEl.style.opacity = '0';
      setTimeout(function() { insightEl.style.opacity = '1'; insightEl.style.transition = 'opacity 0.4s ease'; }, 50);
    }

    // Wire all data-smd-mr2 fields (both inline spans and block divs)
    page.querySelectorAll('[data-smd-mr2]').forEach(function(el) {
      var field = el as HTMLElement;
      var fieldName = field.dataset.smdMr2 || '';
      var saved = self.savedData[key(fieldName)] || '';
      if (saved) field.textContent = saved;

      field.addEventListener('focus', function() {
        if (field.textContent === '___') field.textContent = '';
      });

      field.addEventListener('input', function() {
        var val = (field.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[key(fieldName)] = val;
        } else {
          delete self.savedData[key(fieldName)];
        }
        persist();
        checkCelebration();
      });

      field.addEventListener('blur', function() {
        var val = (field.textContent || '').trim();
        if (!val || val === '___') {
          field.textContent = '';
          delete self.savedData[key(fieldName)];
          persist();
          checkCelebration();
        }
      });
    });

    var celebrateMsgs = [
      '✨ A month of mindful choices.',
      '🌿 Growth happens in the quiet moments.',
      '🎉 Another month, another step forward.',
      '💫 You\'re building a healthier relationship with technology.'
    ];

    function checkCelebration(): void {
      var celebrateEl = page.querySelector('[data-smd-mr2-celebrate]') as HTMLElement;
      if (!celebrateEl) return;

      var hasContent = false;
      page.querySelectorAll('[data-smd-mr2]').forEach(function(el) {
        var f = el as HTMLElement;
        var val = (f.textContent || '').trim();
        if (val && val !== '___') hasContent = true;
      });

      if (hasContent) {
        var msg = celebrateMsgs[Math.floor(Math.random() * celebrateMsgs.length)];
        celebrateEl.textContent = msg;
        celebrateEl.style.display = 'block';
        celebrateEl.style.opacity = '0';
        setTimeout(function() { celebrateEl.style.opacity = '1'; }, 50);
      } else {
        celebrateEl.style.display = 'none';
        celebrateEl.textContent = '';
      }
    }

    checkCelebration();
  }

  private initSMDReplacements(): void {
    if (typeof document === 'undefined') return;
    var page = this.pagesContainer.querySelector('[data-page-id="replacement-activities"]') as HTMLElement;
    if (!page) return;
    var self = this;
    var pageId = 'replacement-activities';
    var cats = ['active', 'creative', 'social', 'quiet'];

    function choiceKey(cat: string): string { return 'smd-ri-choice-' + pageId + '-' + cat; }
    function selKey(name: string): string { return 'smd-ri-sel-' + pageId + '-' + name; }
    function favKey(name: string): string { return 'smd-ri-fav-' + pageId + '-' + name; }
    function top3Key(idx: number): string { return 'smd-ri-top3-' + pageId + '-' + idx; }

    function getCatColor(item: HTMLElement): string {
      return item.dataset.smdRcColor || '#10b981';
    }

    function tintBg(color: string): string {
      // Light tint: 12% opacity of the color over #faf7f2
      return 'color-mix(in srgb, ' + color + ' 12%, #faf7f2)';
    }

    function setItemVisuals(item: HTMLElement, selected: boolean, catColor: string): void {
      var box = item.querySelector('.smd-ri-box') as HTMLElement;
      if (!box) return;
      item.style.setProperty('--cat-color', catColor);
      if (selected) {
        item.classList.add('smd-ri-sel');
        item.style.setProperty('--ri-bg', tintBg(catColor));
        box.textContent = '\u2713';
        box.style.background = catColor;
        box.style.borderColor = catColor;
        box.style.color = 'white';
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('smd-ri-sel');
        item.style.setProperty('--ri-bg', 'transparent');
        box.textContent = '';
        box.style.background = 'transparent';
        box.style.borderColor = '#d4c9bc';
        item.setAttribute('aria-selected', 'false');
      }
    }

    function updateChoiceField(cat: string): void {
      var display = page.querySelector('[data-smd-choice="' + cat + '"]') as HTMLElement;
      if (!display) return;
      var selected: string[] = [];
      page.querySelectorAll('[data-smd-rc="' + cat + '"].smd-ri-sel').forEach(function(el) {
        selected.push((el as HTMLElement).dataset.smdRi || '');
      });
      if (selected.length) {
        display.textContent = selected.join(', ');
        self.savedData[choiceKey(cat)] = display.textContent;
      } else {
        display.textContent = '';
        delete self.savedData[choiceKey(cat)];
      }
    }

    function updateSuggestions(): void {
      cats.forEach(function(cat) {
        var count = page.querySelectorAll('[data-smd-rc="' + cat + '"].smd-ri-sel').length;
        var suggestEl = page.querySelector('[data-smd-suggest="' + cat + '"]') as HTMLElement;
        if (!suggestEl) return;
        var msgs = suggestEl.querySelectorAll('.smd-suggest-msg');
        if (count >= 3 && msgs.length) {
          suggestEl.style.display = 'block';
          msgs.forEach(function(m, i) {
            (m as HTMLElement).style.display = i === (count % msgs.length) ? 'inline' : 'none';
          });
        } else {
          suggestEl.style.display = 'none';
        }
      });
    }

    function updateCelebration(): void {
      var allHave = cats.every(function(cat) {
        return page.querySelectorAll('[data-smd-rc="' + cat + '"].smd-ri-sel').length > 0;
      });
      var celebrateEl = page.querySelector('#smd-replace-celebrate') as HTMLElement;
      if (!celebrateEl) return;
      celebrateEl.style.display = allHave ? 'block' : 'none';
    }

    function updateEmptyState(): void {
      var allSel = page.querySelectorAll('.smd-ri-sel');
      var count = allSel.length;
      var emptyEl = page.querySelector('#smd-replace-empty') as HTMLElement;
      var fullEl = page.querySelector('#smd-replace-full') as HTMLElement;
      var countEl = page.querySelector('#smd-replace-count') as HTMLElement;
      if (count > 0) {
        if (emptyEl) emptyEl.style.display = 'none';
        if (fullEl) fullEl.style.display = 'block';
        if (countEl) countEl.textContent = String(count);
      } else {
        if (emptyEl) emptyEl.style.display = 'block';
        if (fullEl) fullEl.style.display = 'none';
      }
    }

    function updateTop3(): void {
      var favSelected: string[] = [];
      page.querySelectorAll('.smd-ri-fav.smd-ri-sel').forEach(function(el) {
        favSelected.push((el as HTMLElement).dataset.smdRi || '');
      });
      for (var i = 0; i < 3; i++) {
        var slot = page.querySelector('[data-smd-top3="' + i + '"]') as HTMLElement;
        if (!slot) continue;
        var saved = self.savedData[top3Key(i)];
        if (saved && saved !== '___') {
          // Keep user-edited value
        } else if (favSelected[i]) {
          slot.textContent = favSelected[i];
          self.savedData[top3Key(i)] = favSelected[i];
        } else {
          slot.textContent = '';
          delete self.savedData[top3Key(i)];
        }
      }
    }

    function toggleSel(item: HTMLElement, name: string, newState: boolean): void {
      var catColor = getCatColor(item);
      setItemVisuals(item, newState, catColor);
      if (newState) {
        self.savedData[selKey(name)] = '1';
      } else {
        delete self.savedData[selKey(name)];
      }
    }

    function toggleFav(item: HTMLElement, name: string, star: HTMLElement): void {
      var isFav = item.classList.contains('smd-ri-fav');
      if (isFav) {
        item.classList.remove('smd-ri-fav');
        star.textContent = '\u2606';
        delete self.savedData[favKey(name)];
      } else {
        item.classList.add('smd-ri-fav');
        star.textContent = '\u2605';
        self.savedData[favKey(name)] = '1';
      }
    }

    function updateAll(): void {
      cats.forEach(updateChoiceField);
      updateSuggestions();
      updateCelebration();
      updateEmptyState();
      updateTop3();
      self.persistSavedData();
    }

    function handleMainClick(item: HTMLElement, name: string): void {
      var isSel = item.classList.contains('smd-ri-sel');
      toggleSel(item, name, !isSel);
      updateAll();
      self.showBadge('\u2713 Saved');
    }

    // Restore saved states + set CSS vars
    page.querySelectorAll('[data-smd-ri]').forEach(function(el) {
      var item = el as HTMLElement;
      var name = item.dataset.smdRi || '';
      var catColor = getCatColor(item);
      item.style.setProperty('--cat-color', catColor);
      item.setAttribute('aria-selected', 'false');

      if (self.savedData[selKey(name)] === '1') {
        setItemVisuals(item, true, catColor);
      }
      if (self.savedData[favKey(name)] === '1') {
        item.classList.add('smd-ri-fav');
        var star = item.querySelector('.smd-ri-star') as HTMLElement;
        if (star) star.textContent = '\u2605';
      }
    });

    // Wire click + keyboard handlers
    page.querySelectorAll('[data-smd-ri]').forEach(function(el) {
      var item = el as HTMLElement;
      var name = item.dataset.smdRi || '';

      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var target = e.target as HTMLElement;

        // Star click → toggle favorite
        if (target.classList.contains('smd-ri-star')) {
          toggleFav(item, name, target);
          self.persistSavedData();
          updateTop3();
          self.showBadge('\u2713 Saved');
          return;
        }

        // Click anywhere else → toggle selection
        handleMainClick(item, name);
      });

      // Keyboard: Enter or Space to toggle selection
      item.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          handleMainClick(item, name);
        }
      });
    });

    // Restore choice display fields
    cats.forEach(function(c) {
      var saved = self.savedData[choiceKey(c)];
      if (saved) {
        var display = page.querySelector('[data-smd-choice="' + c + '"]') as HTMLElement;
        if (display) display.textContent = saved;
      }
    });

    // Restore top3 slots
    for (var i = 0; i < 3; i++) {
      var saved3 = self.savedData[top3Key(i)];
      if (saved3 && saved3 !== '___') {
        var slot = page.querySelector('[data-smd-top3="' + i + '"]') as HTMLElement;
        if (slot) slot.textContent = saved3;
      }
    }

    // Make top3 slots contenteditable
    page.querySelectorAll('[data-smd-top3]').forEach(function(el) {
      var slot = el as HTMLElement;
      slot.contentEditable = 'true';
      slot.addEventListener('input', function() {
        var idx = slot.dataset.smdTop3 || '0';
        var val = (slot.textContent || '').trim();
        if (val && val !== '___') {
          self.savedData[top3Key(parseInt(idx))] = val;
        } else {
          delete self.savedData[top3Key(parseInt(idx))];
        }
        self.persistSavedData();
      });
    });

    updateAll();
  }

  // Persistence
  private loadSavedData(): void {
    if (this.previewOnly || this.coverEditablePreview) { this.savedData = {}; return; }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.savedData = JSON.parse(raw);
    } catch { this.savedData = {}; }
  }

  private persistSavedData(): void {
    if (this.previewOnly || this.coverEditablePreview) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.savedData)); } catch {}
  }

  private restoreSavedData(): void {
    Object.entries(this.savedData).forEach(([key, html]) => {
      const el = this.pagesContainer.querySelector(`[data-write-key="${key}"]`) as HTMLElement;
      if (el && html) el.innerHTML = html;
    });
  }

  private saveAll(): void {
    if (this.previewOnly || this.coverEditablePreview) return;
    this.pagesContainer.querySelectorAll('[data-write-key]').forEach((el) => {
      const key = (el as HTMLElement).dataset.writeKey!;
      this.savedData[key] = (el as HTMLElement).innerHTML;
    });
    this.pagesContainer.querySelectorAll('.pp-cb[data-cb]').forEach((el) => {
      const el2 = el as HTMLElement;
      if (!el2.closest('.digital-planner-page')) return;
      const pageEl = el2.closest('[data-page-id]') as HTMLElement;
      if (!pageEl) return;
      const pageId = pageEl.dataset.pageId!;
      const cbIdx = el2.dataset.cb!;
      this.savedData[`cb-${pageId}-${cbIdx}`] = el2.dataset.checked === '1' ? '1' : '0';
    });
    // Save habit grid cell states
    this.pagesContainer.querySelectorAll('[data-habit-cell]').forEach((el) => {
      const el2 = el as HTMLElement;
      const key = 'habit-habit-tracker-' + el2.dataset.habitCell;
      this.savedData[key] = el2.style.background === 'rgb(37, 99, 235)' || el2.style.background === '#2563eb' ? '1' : '0';
    });
    // Save attendance cell states
    this.pagesContainer.querySelectorAll('[data-att-date]').forEach((el) => {
      var cell = el as HTMLElement;
      var fullDate = cell.dataset.attDate;
      if (!fullDate) return;
      var key = 'att-' + fullDate;
      if (cell.dataset.att === '1') {
        this.savedData[key] = '1';
      } else {
        delete this.savedData[key];
      }
    });
    // Save weekly grid cell states
    this.pagesContainer.querySelectorAll('[data-wg-r]').forEach((el) => {
      var cell = el as HTMLElement;
      var r = cell.dataset.wgR;
      var c = cell.dataset.wgC;
      if (r === undefined || c === undefined) return;
      var key = 'wg-planning-' + r + '-' + c;
      if (cell.classList.contains('wg-checked')) {
        this.savedData[key] = '1';
      } else {
        delete this.savedData[key];
      }
    });
    // Save exam readiness range slider values
    this.pagesContainer.querySelectorAll('[data-er-range]').forEach((el) => {
      var range = el as HTMLInputElement;
      var key = range.dataset.erRange;
      if (key) this.savedData['er-' + key] = range.value;
    });
    // Save exam readiness subject names
    this.pagesContainer.querySelectorAll('[data-er-subject]').forEach((el) => {
      var el2 = el as HTMLElement;
      var idx = el2.dataset.erSubject;
      if (idx !== undefined) this.savedData['exam-subject:' + idx] = (el2.textContent || '').trim();
    });
    this.persistSavedData();
  }

  private clearAll(): void {
    if (this.previewOnly || this.coverEditablePreview) return;
    if (!confirm('Clear all your writing from every page?')) return;
    this.savedData = {};
    this.persistSavedData();
    this.pagesContainer.querySelectorAll('[data-write-key]').forEach((el) => {
      (el as HTMLElement).innerHTML = '';
    });
    // Reset checkboxes to unchecked
    this.pagesContainer.querySelectorAll('.pp-cb').forEach((el) => {
      const el2 = el as HTMLElement;
      el2.innerHTML = '';
      el2.style.background = 'transparent';
      el2.style.borderColor = el2.dataset.cbColor || '#d4c9bc';
      delete el2.dataset.checked;
    });
    // Reset circle selectors to unchecked
    this.pagesContainer.querySelectorAll('[data-circle-group] .pp-circle').forEach((el) => {
      (el as HTMLElement).style.background = 'transparent';
    });
    this.pagesContainer.querySelectorAll('.circle-group-label').forEach((el) => {
      (el as HTMLElement).textContent = '';
    });
    // Reset progress bars to 0
    this.pagesContainer.querySelectorAll('[data-progress-fill]').forEach((el) => {
      const e = el as HTMLElement;
      e.style.width = '0%';
      const fc = e.dataset.progressFixedcolor;
      if (!fc) e.style.background = '#ef4444';
    });
    // Reset habit grid cells
    this.pagesContainer.querySelectorAll('[data-habit-cell]').forEach((el) => {
      const el2 = el as HTMLElement;
      el2.style.background = 'white';
      el2.style.borderColor = '#e5e7eb';
    });
    // Reset habit progress bars
    this.pagesContainer.querySelectorAll('[data-habit-progress]').forEach((el) => {
      (el as HTMLElement).style.width = '0%';
    });
    this.pagesContainer.querySelectorAll('[data-habit-count]').forEach((el) => {
      el.textContent = '0';
    });
    this.pagesContainer.querySelectorAll('[data-habit-stat]').forEach((el) => {
      if (el.getAttribute('data-habit-stat') === 'completion') el.textContent = '0%';
      else if (el.getAttribute('data-habit-stat') === 'current-streak') el.textContent = '0d';
      else if (el.getAttribute('data-habit-stat') === 'best-streak') el.textContent = '0d';
      else if (el.getAttribute('data-habit-stat') === 'total') el.textContent = '0';
      else if (el.getAttribute('data-habit-stat') === 'remaining') el.textContent = '0';
    });
    // Reset exam readiness inputs to defaults
    var erPageEl = this.pagesContainer.querySelector('[data-page-id="goal-setting"]');
    if (erPageEl) {
      // Reset range sliders + display values
      var prepRange = erPageEl.querySelector('[data-er-range="preparedness"]') as HTMLInputElement | null;
      if (prepRange) { prepRange.value = '50'; }
      var prepDisp = erPageEl.querySelector('[data-er="preparedness"]') as HTMLElement | null;
      if (prepDisp) prepDisp.textContent = '50';
      var confRange = erPageEl.querySelector('[data-er-range="confidence"]') as HTMLInputElement | null;
      if (confRange) { confRange.value = '5'; }
      var confDisp = erPageEl.querySelector('[data-er="confidence"]') as HTMLElement | null;
      if (confDisp) confDisp.textContent = '5';
      // Reset contenteditable fields
      var daysEl = erPageEl.querySelector('[data-er="days-until"]');
      if (daysEl) daysEl.textContent = '';
      var weakEl = erPageEl.querySelector('[data-er="weak-topics"]');
      if (weakEl) weakEl.textContent = '';
      var revDone = erPageEl.querySelector('[data-er="revision-done"]');
      if (revDone) revDone.textContent = '';
      var revTotal = erPageEl.querySelector('[data-er="revision-total"]');
      if (revTotal) revTotal.textContent = '';
      // Reset status display to defaults
      var examStatusEl = erPageEl.querySelector('[data-exam-status]') as HTMLElement | null;
      if (examStatusEl) { examStatusEl.textContent = 'Just Started'; examStatusEl.style.color = '#ef4444'; }
      var examEmojiEl = erPageEl.querySelector('[data-exam-status-emoji]') as HTMLElement | null;
      if (examEmojiEl) examEmojiEl.textContent = '\uD83D\uDD34';
      var examRecsEl = erPageEl.querySelector('[data-exam-recs]') as HTMLElement | null;
      if (examRecsEl) {
        examRecsEl.innerHTML = '<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:2px">' +
          '<span style="display:inline-block;width:14px;text-align:center;flex-shrink:0;font-size:9px;line-height:1.7">\u2022</span>' +
          '<span style="flex:1;font-size:9px;color:#4B5563;line-height:1.7">Break your syllabus into manageable topics.</span>' +
        '</div>';
      }
    }
    // Reset attendance cells
    this.pagesContainer.querySelectorAll('[data-att-date]').forEach((el) => {
      var cell = el as HTMLElement;
      delete cell.dataset.att;
      cell.classList.remove('att-present');
    });
    // Re-run attendance stats update
    var attPage = this.pagesContainer.querySelector('[data-page-id="attendance"]');
    if (attPage) {
      var attGrid = attPage.querySelector('[data-att-grid]') as HTMLElement;
      if (attGrid) {
        var allCells = attGrid.querySelectorAll('[data-att-date]');
        var total = allCells.length;
        var pctEl = attPage.querySelector('[data-att-stat="pct"]');
        if (pctEl) pctEl.textContent = '0%';
        var presentEl = attPage.querySelector('[data-att-stat="present"]');
        if (presentEl) presentEl.textContent = '0';
        var absentEl = attPage.querySelector('[data-att-stat="absent"]');
        if (absentEl) absentEl.textContent = String(total);
        var daysLeftEl = attPage.querySelector('[data-att-stat="days-left"]');
        if (daysLeftEl) daysLeftEl.textContent = String(total);
        var barEl = attPage.querySelector('[data-att-stat="progress-bar"]') as HTMLElement;
        if (barEl) barEl.style.width = '0%';
        var fracEl = attPage.querySelector('[data-att-stat="progress-frac"]');
        if (fracEl) fracEl.textContent = '0/' + total;
        var currentEl = attPage.querySelector('[data-att-stat="streak-current"]');
        if (currentEl) currentEl.textContent = '0';
        var bestEl = attPage.querySelector('[data-att-stat="streak-best"]');
        if (bestEl) bestEl.textContent = '0';
      }
    }
    // Reset weekly grid cells
    this.pagesContainer.querySelectorAll('[data-wg-r]').forEach((el) => {
      var cell = el as HTMLElement;
      cell.classList.remove('wg-checked');
    });
    // Reset energy trackers
    this.pagesContainer.querySelectorAll('[data-energy-week]').forEach((containerEl) => {
      var container = containerEl as HTMLElement;
      var weekKey = container.dataset.energyWeek || '';
      container.querySelectorAll('[data-energy-fill]').forEach(function(el) {
        (el as HTMLElement).style.width = '0%';
      });
      container.querySelectorAll('[data-energy-pct]').forEach(function(el) {
        el.textContent = '--%';
      });
      container.querySelectorAll('[data-energy-level]').forEach(function(el) {
        el.textContent = '--';
      });
      container.querySelectorAll('[data-energy-track]').forEach(function(el) {
        (el as HTMLElement).setAttribute('aria-valuenow', '0');
      });
      var avgEl = container.querySelector('[data-energy-avg="' + weekKey + '"]');
      if (avgEl) avgEl.textContent = '--';
      var highEl = container.querySelector('[data-energy-high="' + weekKey + '"]');
      if (highEl) highEl.textContent = '--';
      var lowEl = container.querySelector('[data-energy-low="' + weekKey + '"]');
      if (lowEl) lowEl.textContent = '--';
    });
    // Reset subject names to defaults
    this.pagesContainer.querySelectorAll('[data-subject-name]').forEach((el) => {
      const el2 = el as HTMLElement;
      const idx = parseInt(el2.dataset.subjectName || '0', 10);
      const def = `Subject ${idx + 1}`;
      el2.textContent = def;
      this.updateSubjectNav(idx, def);
    });
    // Reset exam readiness subject names
    this.pagesContainer.querySelectorAll('[data-er-subject]').forEach((el) => {
      const el2 = el as HTMLElement;
      const idx = parseInt(el2.dataset.erSubject || '0', 10);
      el2.textContent = 'Subject';
    });
    // Reset study streak
    this.pagesContainer.querySelectorAll('[data-study-streak]').forEach(function(containerEl) {
      var container = containerEl as HTMLElement;
      container.querySelectorAll('[data-streak-day]').forEach(function(d) {
        var day = d as HTMLElement;
        delete day.dataset.streakChecked;
        day.setAttribute('aria-checked', 'false');
        var label = day.dataset.dayLabel || 'Day';
        day.setAttribute('aria-label', label + ': Not studied');
        day.style.background = '#ede4d8';
        day.style.borderColor = '#d4c9bc';
        day.style.color = '#8b7d6b';
        day.style.transform = 'scale(1)';
      });
      var valEl = container.querySelector('[data-streak-value]');
      if (valEl) valEl.textContent = '0';
      var pctEl = container.querySelector('[data-streak-pct]');
      if (pctEl) pctEl.textContent = '0';
      var totalEl = container.querySelector('[data-streak-total]');
      if (totalEl) totalEl.textContent = '0';
    });
    // Reset SMD app deep dive
    var deepPage = this.pagesContainer.querySelector('[data-page-id="app-deep-dive"]') as HTMLElement;
    if (deepPage) {
      deepPage.querySelectorAll('[data-smd-deep]').forEach(function(el) {
        var f = el as HTMLElement;
        f.textContent = '';
        f.style.borderBottomColor = '#d4c9bc';
      });
      deepPage.querySelectorAll('[data-smd-deep-status]').forEach(function(el) {
        var s = el as HTMLElement;
        s.classList.remove('smd-deep-active');
        s.setAttribute('aria-pressed', 'false');
        s.style.color = '#9CA3AF';
        s.style.background = 'transparent';
        s.style.borderColor = 'transparent';
      });
      deepPage.querySelectorAll('[data-smd-deep-row]').forEach(function(el) {
        var row = el as HTMLElement;
        row.classList.remove('smd-deep-row-keep', 'smd-deep-row-limit', 'smd-deep-row-delete');
        row.style.borderLeft = '3px solid transparent';
      });
      deepPage.querySelectorAll('[data-smd-deep-copy]').forEach(function(el) {
        (el as HTMLElement).style.display = 'none';
      });
    }
    // Reset SMD morning ritual
    var mrPage = this.pagesContainer.querySelector('[data-page-id="morning-ritual"]') as HTMLElement;
    if (mrPage) {
      mrPage.querySelectorAll('[data-smd-mr]').forEach(function(el) {
        var f = el as HTMLElement;
        if (f.dataset.smdMr === 'gain') f.textContent = '';
        else f.textContent = '--:--';
        f.style.borderBottomColor = '#d4c9bc';
      });
      mrPage.querySelectorAll('[data-smd-mr-label]').forEach(function(el) {
        var lbl = el as HTMLElement;
        var idx = parseInt(lbl.dataset.smdMrLabel || '0', 10);
        var defaults = ['Wake up & stretch', 'Drink a glass of water', 'Step outside for fresh air', 'Journal / meditate', 'Move my body', 'Eat breakfast mindfully', 'Read / learn something', 'Plan my day offline', ''];
        lbl.textContent = defaults[idx] || '';
        lbl.style.borderBottomColor = 'transparent';
      });
    }
    // Reset SMD bedtime ritual
    var brPage = this.pagesContainer.querySelector('[data-page-id="bedtime-routine"]') as HTMLElement;
    if (brPage) {
      brPage.querySelectorAll('[data-smd-br]').forEach(function(el) {
        var f = el as HTMLElement;
        if (f.dataset.smdBr === 'sleep') f.textContent = '';
        else f.textContent = '--:--';
        f.style.borderBottomColor = '#d4c9bc';
      });
      brPage.querySelectorAll('[data-smd-br-label]').forEach(function(el) {
        var lbl = el as HTMLElement;
        var idx = parseInt(lbl.dataset.smdBrLabel || '0', 10);
        var defaults = ['Put phone in another room', 'Dim the lights', 'Tidy up my space', 'Skincare / hygiene routine', 'Read a physical book', 'Stretch / gentle yoga', 'Write in journal', 'Listen to calm music / podcast', 'Drink herbal tea', 'Practice gratitude', ''];
        lbl.textContent = defaults[idx] || '';
        lbl.style.borderBottomColor = 'transparent';
      });
    }
    // Reset SMD blackout challenge
    var bcPage = this.pagesContainer.querySelector('[data-page-id="blackout-challenge"]') as HTMLElement;
    if (bcPage) {
      bcPage.querySelectorAll('[data-smd-bc-field]').forEach(function(el) {
        var f = el as HTMLElement;
        f.textContent = '';
        f.style.borderBottomColor = 'transparent';
      });
      // Reset duration to 7
      bcPage.querySelectorAll('[data-smd-bc-dur]').forEach(function(el) {
        var btn = el as HTMLElement;
        var dur = parseInt(btn.dataset.smdBcDur || '0', 10);
        if (dur === 7) {
          btn.dataset.smdBcActive = 'true';
          btn.setAttribute('aria-checked', 'true');
          btn.style.background = '#0284c7';
          btn.style.borderColor = '#0284c7';
          var numEl = btn.querySelector('span:first-child') as HTMLElement;
          var labelEl = btn.querySelector('span:last-child') as HTMLElement;
          if (numEl) numEl.style.color = 'white';
          if (labelEl) labelEl.style.color = 'rgba(255,255,255,0.85)';
        } else {
          btn.dataset.smdBcActive = 'false';
          btn.setAttribute('aria-checked', 'false');
          btn.style.background = 'white';
          btn.style.borderColor = '#ede4d8';
          var numEl = btn.querySelector('span:first-child') as HTMLElement;
          var labelEl = btn.querySelector('span:last-child') as HTMLElement;
          if (numEl) numEl.style.color = '#4B5563';
          if (labelEl) labelEl.style.color = '#6B7280';
        }
      });
      // Show only first 7 days
      bcPage.querySelectorAll('[data-smd-bc-day]').forEach(function(el) {
        var dayEl = el as HTMLElement;
        var dayNum = parseInt(dayEl.dataset.smdBcDay || '0', 10);
        dayEl.style.display = dayNum <= 7 ? 'flex' : 'none';
      });
    }
    // Reset SMD focus zone
    var fzPage = this.pagesContainer.querySelector('[data-page-id="focus-zone-planner"]') as HTMLElement;
    if (fzPage) {
      fzPage.querySelectorAll('[data-smd-fz]').forEach(function(el) {
        var f = el as HTMLElement;
        f.textContent = '';
        f.style.borderBottomColor = '#d4c9bc';
      });
      fzPage.querySelectorAll('[data-smd-fz-sched]').forEach(function(el, i) {
        var lbl = el as HTMLElement;
        var defaults = ['Morning block', 'Afternoon block', 'Evening block'];
        lbl.textContent = defaults[i] || 'Block';
        lbl.style.borderBottomColor = 'transparent';
      });
      fzPage.querySelectorAll('[data-smd-fz-schedtime]').forEach(function(el) {
        var t = el as HTMLElement;
        t.textContent = '--:--';
        t.style.borderBottomColor = 'transparent';
      });
      fzPage.querySelectorAll('[data-smd-fz-ritual]').forEach(function(el, i) {
        var r = el as HTMLElement;
        var defaults = ['Put phone in another room', 'Close all browser tabs', 'Set a timer', 'Take 3 deep breaths', 'Clarify one goal for this block'];
        r.textContent = defaults[i] || 'Ritual';
        r.style.borderBottomColor = 'transparent';
      });
    }
    // Reset SMD weekly review
    var wrPage = this.pagesContainer.querySelector('[data-page-id="weekly-review"]') as HTMLElement;
    if (wrPage) {
      wrPage.querySelectorAll('[data-smd-wr]').forEach(function(el) {
        var f = el as HTMLElement;
        f.textContent = '';
        f.style.borderBottomColor = 'transparent';
      });
      var celebrateEl = wrPage.querySelector('[data-smd-wr-celebrate]') as HTMLElement;
      if (celebrateEl) { celebrateEl.style.display = 'none'; celebrateEl.textContent = ''; }
      // Reset stat displays
      var daysEl = wrPage.querySelector('[data-smd-wr-stat="days"]') as HTMLElement;
      var screenEl = wrPage.querySelector('[data-smd-wr-stat="screentime"]') as HTMLElement;
      var phoneEl = wrPage.querySelector('[data-smd-wr-stat="phonefree"]') as HTMLElement;
      if (daysEl) daysEl.textContent = '—';
      if (screenEl) screenEl.textContent = '—';
      if (phoneEl) phoneEl.textContent = '—';
      // Reset trend
      var emptyEl = wrPage.querySelector('[data-smd-wr-trend-empty]') as HTMLElement;
      var barsEl = wrPage.querySelector('[data-smd-wr-trend-bars]') as HTMLElement;
      if (emptyEl) emptyEl.style.display = 'block';
      if (barsEl) {
        barsEl.style.display = 'none';
        barsEl.querySelectorAll('[data-smd-wr-bar]').forEach(function(el) {
          (el as HTMLElement).style.height = '0';
        });
      }
    }
    // Reset SMD rewards and milestones
    var rmPage = this.pagesContainer.querySelector('[data-page-id="rewards-milestones"]') as HTMLElement;
    if (rmPage) {
      rmPage.querySelectorAll('[data-smd-rm-milestone]').forEach(function(el) {
        var f = el as HTMLElement;
        f.textContent = '';
        f.style.borderBottomColor = 'transparent';
      });
      var defaultLabels = ['Completed 7-day blackout', 'Reduced screen time by 50%', 'Read a book instead of scrolling', 'Went 24 hours without phone', 'Developed a morning routine without phone'];
      rmPage.querySelectorAll('[data-smd-rm-challenge]').forEach(function(el, i) {
        var l = el as HTMLElement;
        l.textContent = defaultLabels[i] || 'Challenge';
        l.style.borderBottomColor = 'transparent';
      });
      var celebrateRm = rmPage.querySelector('[data-smd-rm-celebrate]') as HTMLElement;
      if (celebrateRm) { celebrateRm.style.display = 'none'; celebrateRm.textContent = ''; }
      var daysRm = rmPage.querySelector('[data-smd-rm-stat="days"]') as HTMLElement;
      var streakRm = rmPage.querySelector('[data-smd-rm-stat="streak"]') as HTMLElement;
      if (daysRm) daysRm.textContent = '—';
      if (streakRm) streakRm.textContent = '—';
    }
    // Reset SMD monthly review
    var mr2Page = this.pagesContainer.querySelector('[data-page-id="monthly-review"]') as HTMLElement;
    if (mr2Page) {
      mr2Page.querySelectorAll('[data-smd-mr2]').forEach(function(el) {
        var f = el as HTMLElement;
        f.textContent = '';
        f.style.borderBottomColor = 'transparent';
      });
      var insightEl = mr2Page.querySelector('[data-smd-mr2-insight]') as HTMLElement;
      if (insightEl) { insightEl.style.display = 'none'; insightEl.textContent = ''; }
      var celebrateMr2 = mr2Page.querySelector('[data-smd-mr2-celebrate]') as HTMLElement;
      if (celebrateMr2) { celebrateMr2.style.display = 'none'; celebrateMr2.textContent = ''; }
      var daysMr2 = mr2Page.querySelector('[data-smd-mr2-stat="days"]') as HTMLElement;
      var startMr2 = mr2Page.querySelector('[data-smd-mr2-stat="start"]') as HTMLElement;
      var endMr2 = mr2Page.querySelector('[data-smd-mr2-stat="end"]') as HTMLElement;
      var reclaimMr2 = mr2Page.querySelector('[data-smd-mr2-stat="reclaimed"]') as HTMLElement;
      if (daysMr2) daysMr2.textContent = '—';
      if (startMr2) startMr2.textContent = '—';
      if (endMr2) endMr2.textContent = '—';
      if (reclaimMr2) reclaimMr2.textContent = '—';
    }
    // Reset SMD cover
    var coverPage = this.pagesContainer.querySelector('[data-page-id="cover"]') as HTMLElement;
    if (coverPage) {
      coverPage.querySelectorAll('[data-smd-cover]').forEach(function(el) {
        var f = el as HTMLElement;
        var field = f.dataset.smdCover;
        f.textContent = '';
        if (field === 'goal') f.textContent = 'Digital detox';
        if (field === 'topapp') f.textContent = '—';
        if (field === 'target') f.textContent = '—';
        if (field === 'commitment') f.textContent = 'I commit to reducing mindless scrolling and creating healthier digital habits.';
        if (field === 'name') f.textContent = 'Your Name';
        if (field === 'date') f.textContent = '';
        f.style.borderBottomColor = 'transparent';
      });
    }
    // Reset planner cover
    if (coverPage) {
      coverPage.querySelectorAll('[data-pp-cover]').forEach(function(el) {
        var f = el as HTMLElement;
        var field = f.dataset.ppCover;
        f.textContent = '';
        f.style.borderBottomColor = 'transparent';
        if (field === 'name') { f.textContent = 'Your Name'; f.style.borderBottomColor = 'rgba(196,148,74,0.3)'; }
        if (field === 'year') f.textContent = '—';
        if (field === 'preparingFor') f.textContent = '—';
      });
    }
    // Reset SMD chips
    this.pagesContainer.querySelectorAll('[data-smd-chip]').forEach(function(el) {
      (el as HTMLElement).classList.remove('smd-active');
    });
    // Reset SMD replacement activities
    this.pagesContainer.querySelectorAll('[data-smd-ri]').forEach(function(el) {
      var item = el as HTMLElement;
      item.classList.remove('smd-ri-sel', 'smd-ri-fav');
      var box = item.querySelector('.smd-ri-box') as HTMLElement;
      if (box) { box.textContent = ''; box.style.background = 'transparent'; box.style.borderColor = '#d4c9bc'; }
      var star = item.querySelector('.smd-ri-star') as HTMLElement;
      if (star) star.textContent = '\u2606';
    });
    this.pagesContainer.querySelectorAll('[data-smd-choice]').forEach(function(el) {
      (el as HTMLElement).textContent = '';
    });
    this.pagesContainer.querySelectorAll('[data-smd-top3]').forEach(function(el) {
      (el as HTMLElement).textContent = '';
    });
    // Reset replace empty/full state
    var repPage = this.pagesContainer.querySelector('[data-page-id="replacement-activities"]') as HTMLElement;
    if (repPage) {
      var emptyEl = repPage.querySelector('#smd-replace-empty') as HTMLElement;
      var fullEl = repPage.querySelector('#smd-replace-full') as HTMLElement;
      if (emptyEl) emptyEl.style.display = 'block';
      if (fullEl) fullEl.style.display = 'none';
    }
    this.showBadge('\u2713 Cleared');
  }

  private showBadge(msg: string): void {
    const badge = document.getElementById('planner-save-badge');
    if (!badge) return;
    badge.textContent = msg;
    badge.classList.add('show');
    clearTimeout((badge as any)._hideTimer);
    (badge as any)._hideTimer = setTimeout(() => badge.classList.remove('show'), 2000);
  }

  exportAll(): void {
    if (this.previewOnly || this.coverEditablePreview) return;
    this.saveAll();
    const printWin = window.open('', '_blank');
    if (!printWin) { alert('Please allow popups to export.'); return; }

    const allHtml = this.pages.map((p) => {
      const pageEl = this.pagesContainer.querySelector(`[data-page-id="${p.id}"]`);
      const clone = pageEl?.cloneNode(true) as HTMLElement;
      if (clone) {
        clone.querySelectorAll('[data-write-key]').forEach(el => {
          el.removeAttribute('contenteditable');
          el.removeAttribute('data-write-key');
          (el as HTMLElement).className = (el as HTMLElement).className.replace('digital-planner-write', '').trim();
        });
      }
      return clone ? clone.innerHTML : p.html;
    }).join('<div style="page-break-after:always;height:0;margin:0;padding:0"></div>');

    printWin.document.write(`<!DOCTYPE html><html><head>
      <title>Study Planner — Exported</title>
      <style>
        @page { margin:0.6in 0.5in }
        body { font-family:Outfit,Inter,Georgia,sans-serif; color:#2d2a27; background:#fff; padding:20px; max-width:700px; margin:0 auto }
        img { max-width:100%; height:auto }
        @media print { body { padding:0 } }
      </style>
    </head><body>${allHtml}</body></html>`);
    printWin.document.close();
  }
}
