import type { PlannerConfig, PreviewBinding, PDFDataPayload, OrderRecord } from './types';
import { PlannerStateManager } from './state';
import { renderForm } from './fields';
import { PreviewEngine } from './preview';
import { PDFDataCollector } from './pdf-collector';

export type { PlannerConfig, PlannerField, PlannerState, PDFDataPayload, OrderRecord, PreviewBinding } from './types';
export { PlannerStateManager } from './state';
export { renderField, renderForm, renderSection } from './fields';
export { PreviewEngine } from './preview';
export { PDFDataCollector } from './pdf-collector';

export interface PlannerEngineOptions {
  formContainerId: string;
  previewBindings: PreviewBinding[];
  progressElId?: string;
  barElId?: string;
  onPreviewUpdate?: (state: import('./types').PlannerState) => void;
}

export class PlannerEngine {
  readonly config: PlannerConfig;
  readonly state: PlannerStateManager;
  readonly preview: PreviewEngine;

  private constructor(config: PlannerConfig, options: PlannerEngineOptions) {
    this.config = config;
    this.state = new PlannerStateManager(config);

    const formContainer = document.getElementById(options.formContainerId);
    if (formContainer) {
      renderForm(config, this.state, formContainer);
    }

    this.preview = new PreviewEngine(this.state, config, {
      bindings: options.previewBindings,
      progressElId: options.progressElId,
      barElId: options.barElId,
      onUpdate: options.onPreviewUpdate,
    });
  }

  static init(config: PlannerConfig, options: PlannerEngineOptions): PlannerEngine {
    return new PlannerEngine(config, options);
  }

  collectPDFData(format: 'pdf' | 'docx' | 'csv' | 'printable' = 'pdf'): PDFDataPayload {
    const state = this.state.getState();
    return PDFDataCollector.collect(this.config, state, format);
  }

  createOrder(email: string): OrderRecord {
    const state = this.state.getState();
    return PDFDataCollector.createOrderFromState(this.config, state, email);
  }

  saveOrder(email: string): void {
    const order = this.createOrder(email);
    const orders: OrderRecord[] = JSON.parse(localStorage.getItem('tt_orders') || '[]');
    orders.push(order);
    localStorage.setItem('tt_orders', JSON.stringify(orders));
  }

  downloadPDFData(): void {
    const data = this.collectPDFData();
    PDFDataCollector.downloadJSON(data);
  }

  destroy(): void {
    this.preview.destroy();
  }
}
