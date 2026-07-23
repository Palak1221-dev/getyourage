import type { PlannerConfig, PlannerState } from './types';
import { PlannerStateManager } from './state';
import { PlannerPreviewRenderer } from './preview-renderer';

export interface PreviewBinding {
  fieldId: string;
  elementId: string;
  transform?: (value: string, allValues: Record<string, string>) => string;
}

export interface PreviewOptions {
  bindings: PreviewBinding[];
  progressElId?: string;
  barElId?: string;
  rendererContainerId?: string;
  onUpdate?: (state: PlannerState) => void;
}

export class PreviewEngine {
  private stateManager: PlannerStateManager;
  private config: PlannerConfig;
  private bindings: PreviewBinding[];
  private progressEl: HTMLElement | null = null;
  private barEl: HTMLElement | null = null;
  private onUpdate: ((state: PlannerState) => void) | null = null;
  renderer: PlannerPreviewRenderer | null = null;
  private unsubscribers: (() => void)[] = [];

  constructor(stateManager: PlannerStateManager, config: PlannerConfig, options: PreviewOptions) {
    this.stateManager = stateManager;
    this.config = config;
    this.bindings = options.bindings;
    this.onUpdate = options.onUpdate ?? null;

    if (options.progressElId) {
      this.progressEl = document.getElementById(options.progressElId);
    }
    if (options.barElId) {
      this.barEl = document.getElementById(options.barElId);
    }

    // Initialize the premium preview renderer
    if (options.rendererContainerId) {
      const container = document.getElementById(options.rendererContainerId);
      if (container) {
        this.renderer = new PlannerPreviewRenderer(container, config);
        this.renderer.mount(
          stateManager.getAll(),
          (fn: (latestValues: Record<string, string>) => void) => {
            this.unsubscribers.push(
              this.stateManager.subscribe((state) => {
                fn(state.values);
                this.syncSimpleBindings(state.values);
              })
            );
          }
        );
      }
    }

    this.unsubscribers.push(
      this.stateManager.subscribe((state) => this.syncAll(state))
    );

    this.syncAll(this.stateManager.getState());
  }

  addBinding(binding: PreviewBinding): void {
    this.bindings.push(binding);
    if (this.stateManager) {
      this.syncField(binding, this.stateManager.getAll());
    }
  }

  private syncField(binding: PreviewBinding, allValues: Record<string, string>): void {
    const el = document.getElementById(binding.elementId);
    if (!el) return;

    const raw = allValues[binding.fieldId] ?? '';
    const display = binding.transform ? binding.transform(raw, allValues) : raw;

    if (display) {
      el.textContent = display;
    }
  }

  private syncSimpleBindings(values: Record<string, string>): void {
    for (const binding of this.bindings) {
      this.syncField(binding, values);
    }
  }

  private syncAll(state: PlannerState): void {
    this.syncSimpleBindings(state.values);

    if (this.progressEl) {
      this.progressEl.textContent = state.percentage + '%';
    }
    if (this.barEl) {
      this.barEl.style.width = state.percentage + '%';
    }

    if (this.onUpdate) {
      this.onUpdate(state);
    }
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
    this.bindings = [];
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
  }
}
