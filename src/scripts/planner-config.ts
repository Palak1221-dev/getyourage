const STORAGE_KEY = 'tt_planner_configs';

interface PlannerConfigEntry {
  values: Record<string, string>;
  updatedAt: string;
  productId: string;
  productTitle: string;
}

interface PlannerConfigStore {
  [productId: string]: PlannerConfigEntry;
}

type SubscribeFn = (values: Record<string, string>, meta: { productTitle: string; updatedAt: string }) => void;
type Unsubscribe = () => void;

const listeners = new Map<string, Set<SubscribeFn>>();

function readStore(): PlannerConfigStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store: PlannerConfigStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage may be full or unavailable
  }
}

function notify(productId: string, entry: PlannerConfigEntry): void {
  const set = listeners.get(productId);
  if (set) {
    for (const fn of set) {
      try {
        fn(entry.values, { productTitle: entry.productTitle, updatedAt: entry.updatedAt });
      } catch {
        // swallow listener errors
      }
    }
  }
}

export const plannerConfig = {
  /** Load saved config values for a product. Returns null if never saved. */
  load(productId: string): Record<string, string> | null {
    const store = readStore();
    const entry = store[productId];
    return entry ? { ...entry.values } : null;
  },

  /** Save config values for a product. Persists immediately. */
  save(productId: string, values: Record<string, string>, productTitle?: string): void {
    const store = readStore();
    const existing = store[productId];
    store[productId] = {
      values: { ...values },
      updatedAt: new Date().toISOString(),
      productId,
      productTitle: productTitle || existing?.productTitle || '',
    };
    writeStore(store);
    notify(productId, store[productId]);
  },

  /** Merge partial values into existing config. Only overwrites specified keys. */
  merge(productId: string, partial: Record<string, string>, productTitle?: string): Record<string, string> {
    const existing = this.load(productId) ?? {};
    const merged = { ...existing, ...partial };
    this.save(productId, merged, productTitle);
    return merged;
  },

  /** Check if config exists for a product. */
  has(productId: string): boolean {
    const store = readStore();
    return productId in store;
  },

  /** Remove saved config for a product. */
  clear(productId: string): void {
    const store = readStore();
    if (productId in store) {
      delete store[productId];
      writeStore(store);
    }
  },

  /** Remove all saved configs. */
  clearAll(): void {
    writeStore({});
  },

  /** Get list of product IDs that have saved configs. */
  getSavedProductIds(): string[] {
    return Object.keys(readStore());
  },

  /** Get the timestamp of the last save for a product. */
  getUpdatedAt(productId: string): string | null {
    const store = readStore();
    return store[productId]?.updatedAt ?? null;
  },

  /** Get the stored product title for a product. */
  getProductTitle(productId: string): string | null {
    const store = readStore();
    return store[productId]?.productTitle ?? null;
  },

  /** Get all saved entries with metadata. */
  getAllEntries(): { productId: string; productTitle: string; updatedAt: string; values: Record<string, string> }[] {
    const store = readStore();
    return Object.entries(store).map(([_, entry]) => ({
      productId: entry.productId,
      productTitle: entry.productTitle,
      updatedAt: entry.updatedAt,
      values: { ...entry.values },
    }));
  },

  /** Render a personalized summary HTML string for the checkout modal. */
  renderSummary(
    customization: Record<string, string>,
    productTitle: string,
    personalization: { id: string; label: string }[],
    whatIncluded: string[]
  ): string {
    const labelMap = new Map(personalization.map(f => [f.id, f.label]));
    const entries = Object.entries(customization).filter(([, v]) => v && v.trim());

    const fieldHtml = entries.map(([id, val]) => {
      const label = labelMap.get(id) || id;
      const display = val.length > 40 ? val.slice(0, 40) + '…' : val;
      return `<div class="flex items-start justify-between gap-2 py-1.5 border-b border-hairline/40 last:border-0">
        <span class="text-xs font-medium text-mute shrink-0">${this.escapeHtml(label)}</span>
        <span class="text-xs font-bold text-ink text-right max-w-[60%]">${this.escapeHtml(display)}</span>
      </div>`;
    }).join('');

    const includedHtml = whatIncluded.map(item =>
      `<li class="flex items-center gap-2 text-[11px] text-body">
        <svg class="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${this.escapeHtml(item)}</span>
      </li>`
    ).join('');

    return `<div class="space-y-3">
      <div class="text-center pb-2 border-b border-hairline/40">
        <p class="text-xs font-bold text-ink">${this.escapeHtml(productTitle)}</p>
        <p class="text-[10px] text-mute">Your Personalized Summary</p>
      </div>
      <div class="space-y-0">${fieldHtml}</div>
      ${includedHtml ? `<div class="pt-2 border-t border-hairline/40">
        <p class="text-[10px] font-bold text-mute uppercase tracking-wider mb-2">What's Included</p>
        <ul class="space-y-1.5">${includedHtml}</ul>
      </div>` : ''}
    </div>`;
  },

  escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },

  /** Subscribe to changes for a specific product. Returns unsubscribe function. */
  subscribe(productId: string, fn: SubscribeFn): Unsubscribe {
    if (!listeners.has(productId)) {
      listeners.set(productId, new Set());
    }
    listeners.get(productId)!.add(fn);
    return () => {
      listeners.get(productId)?.delete(fn);
      if (listeners.get(productId)?.size === 0) {
        listeners.delete(productId);
      }
    };
  },
};
