import type { PlannerConfig, PDFDataPayload, PlannerState, OrderRecord } from './types';

export class PDFDataCollector {
  static collect(config: PlannerConfig, state: PlannerState, format: 'pdf' | 'docx' | 'csv' | 'printable' = 'pdf'): PDFDataPayload {
    return {
      productId: config.productId,
      productTitle: config.productTitle,
      values: state.values,
      generatedAt: new Date().toISOString(),
      requestedFormat: format,
      meta: {
        slug: config.productSlug,
        price: config.productPrice,
      },
    };
  }

  static toJSON(data: PDFDataPayload): string {
    return JSON.stringify(data, null, 2);
  }

  static toBlob(data: PDFDataPayload): Blob {
    const json = this.toJSON(data);
    return new Blob([json], { type: 'application/json' });
  }

  static downloadJSON(data: PDFDataPayload, filename?: string): void {
    const blob = this.toBlob(data);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? `${data.productId}-planner-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static async generatePDF(data: PDFDataPayload): Promise<Blob | null> {
    // Placeholder for future PDF generation via a library like jsPDF or html2canvas.
    // Currently returns the data as JSON blob for development/testing.
    // TODO: Integrate with PDF generation library
    console.log('[PDFCollector] PDF generation requested for:', data.productTitle);
    console.log('[PDFCollector] Values:', data.values);

    // Return the data as downloadable JSON for now
    return this.toBlob(data);
  }

  static collectAllFormats(config: PlannerConfig, state: PlannerState): Record<string, PDFDataPayload> {
    const formats: ('pdf' | 'docx' | 'csv' | 'printable')[] = ['pdf', 'docx', 'csv', 'printable'];
    const result: Record<string, PDFDataPayload> = {};
    for (const format of formats) {
      result[format] = this.collect(config, state, format);
    }
    return result;
  }

  static createOrderFromState(
    config: PlannerConfig,
    state: PlannerState,
    email: string
  ): OrderRecord {
    return {
      id: 'ORD-' + Date.now().toString(36).toUpperCase(),
      product: config.productTitle,
      productId: config.productId,
      productSlug: config.productSlug,
      price: config.productPrice,
      email,
      customization: state.values,
      date: new Date().toISOString(),
    };
  }
}
