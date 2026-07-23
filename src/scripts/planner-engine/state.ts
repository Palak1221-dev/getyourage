import type { PlannerConfig, PlannerState, StateChangeHandler, FieldChangeHandler } from './types';

const STORAGE_PREFIX = 'tt_planner_';

export class PlannerStateManager {
  private config: PlannerConfig;
  private values: Record<string, string>;
  private stateListeners: StateChangeHandler[] = [];
  private fieldListeners: Map<string, FieldChangeHandler[]> = new Map();
  private storageKey: string;

  constructor(config: PlannerConfig) {
    this.config = config;
    this.storageKey = STORAGE_PREFIX + config.productId;
    this.values = {};
    this.load();
  }

  get(key: string): string {
    return this.values[key] ?? '';
  }

  set(key: string, value: string): void {
    const prev = this.values[key];
    if (prev === value) return;

    this.values[key] = value;
    this.persist();
    this.notifyField(key, value);
    this.notifyState();
  }

  setAll(updates: Record<string, string>): void {
    let changed = false;
    for (const [key, value] of Object.entries(updates)) {
      if (this.values[key] !== value) {
        this.values[key] = value;
        changed = true;
      }
    }
    if (!changed) return;
    this.persist();
    this.notifyState();
  }

  getAll(): Record<string, string> {
    return { ...this.values };
  }

  getState(): PlannerState {
    const fieldDefs = this.config.fields;
    let filled = 0;
    for (const field of fieldDefs) {
      const val = this.values[field.id] ?? '';
      if (val.trim().length > 0) filled++;
    }
    return {
      values: { ...this.values },
      filledCount: filled,
      totalCount: fieldDefs.length,
      percentage: fieldDefs.length > 0 ? Math.min(100, Math.round((filled / fieldDefs.length) * 100)) : 0,
    };
  }

  persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.values));
    } catch {
      // localStorage may be full or unavailable
    }
  }

  load(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string>;
        this.values = parsed;
      } else {
        this.values = this.buildDefaults();
        this.persist();
      }
    } catch {
      this.values = this.buildDefaults();
    }
  }

  reset(): void {
    this.values = this.buildDefaults();
    this.persist();
    this.notifyState();
  }

  subscribe(handler: StateChangeHandler): () => void {
    this.stateListeners.push(handler);
    return () => {
      this.stateListeners = this.stateListeners.filter(h => h !== handler);
    };
  }

  onFieldChange(fieldId: string, handler: FieldChangeHandler): () => void {
    const existing = this.fieldListeners.get(fieldId) ?? [];
    existing.push(handler);
    this.fieldListeners.set(fieldId, existing);
    return () => {
      const updated = (this.fieldListeners.get(fieldId) ?? []).filter(h => h !== handler);
      if (updated.length > 0) {
        this.fieldListeners.set(fieldId, updated);
      } else {
        this.fieldListeners.delete(fieldId);
      }
    };
  }

  private buildDefaults(): Record<string, string> {
    const defaults: Record<string, string> = {};
    for (const field of this.config.fields) {
      defaults[field.id] = field.defaultValue ?? '';
    }
    return defaults;
  }

  private notifyField(fieldId: string, value: string): void {
    const handlers = this.fieldListeners.get(fieldId);
    if (handlers) {
      const values = this.getAll();
      for (const h of handlers) h(fieldId, value, values);
    }
  }

  private notifyState(): void {
    const state = this.getState();
    for (const h of this.stateListeners) h(state);
  }
}
