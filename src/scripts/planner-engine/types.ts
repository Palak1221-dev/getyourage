export interface PlannerField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'color';
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string;
  required: boolean;
  section: string;
}

export interface PlannerConfig {
  productId: string;
  productSlug: string;
  productTitle: string;
  productPrice: number;
  icon: string;
  fields: PlannerField[];
  sections: string[];
}

export interface PlannerState {
  values: Record<string, string>;
  filledCount: number;
  totalCount: number;
  percentage: number;
}

export interface PDFDataPayload {
  productId: string;
  productTitle: string;
  values: Record<string, string>;
  generatedAt: string;
  requestedFormat: 'pdf' | 'docx' | 'csv' | 'printable';
  meta: {
    slug: string;
    price: number;
  };
}

export interface OrderRecord {
  id: string;
  product: string;
  productId: string;
  productSlug: string;
  price: number;
  email: string;
  customization: Record<string, string>;
  date: string;
}

export type FieldChangeHandler = (fieldId: string, value: string, values: Record<string, string>) => void;
export type StateChangeHandler = (state: PlannerState) => void;
