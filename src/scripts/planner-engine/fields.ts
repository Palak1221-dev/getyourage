import type { PlannerField, PlannerConfig } from './types';
import { PlannerStateManager } from './state';

function createFieldContainer(field: PlannerField): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'planner-field';
  div.dataset.fieldId = field.id;
  return div;
}

function createLabel(field: PlannerField): HTMLLabelElement {
  const label = document.createElement('label');
  label.htmlFor = `pf-${field.id}`;
  label.className = 'block text-xs font-bold text-stone-700 mb-1';
  label.textContent = field.label;
  if (field.required) {
    const span = document.createElement('span');
    span.className = 'text-rose-500 ml-0.5';
    span.textContent = ' *';
    label.appendChild(span);
  }
  return label;
}

const INPUT_CLASSES = 'w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all text-stone-700 placeholder:text-stone-400';

function createTextInput(field: PlannerField, stateManager: PlannerStateManager): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'text';
  input.id = `pf-${field.id}`;
  input.className = INPUT_CLASSES;
  input.placeholder = field.placeholder ?? '';
  input.value = stateManager.get(field.id);
  input.addEventListener('input', () => stateManager.set(field.id, input.value));
  return input;
}

function createNumberInput(field: PlannerField, stateManager: PlannerStateManager): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'number';
  input.id = `pf-${field.id}`;
  input.className = INPUT_CLASSES;
  input.placeholder = field.placeholder ?? '';
  input.value = stateManager.get(field.id);
  input.addEventListener('input', () => stateManager.set(field.id, input.value));
  return input;
}

function createDateInput(field: PlannerField, stateManager: PlannerStateManager): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'date';
  input.id = `pf-${field.id}`;
  input.className = INPUT_CLASSES;
  input.value = stateManager.get(field.id);
  input.addEventListener('change', () => stateManager.set(field.id, input.value));
  return input;
}

function createTextarea(field: PlannerField, stateManager: PlannerStateManager): HTMLTextAreaElement {
  const textarea = document.createElement('textarea');
  textarea.id = `pf-${field.id}`;
  textarea.className = `${INPUT_CLASSES} min-h-[70px]`;
  textarea.placeholder = field.placeholder ?? '';
  textarea.value = stateManager.get(field.id);
  textarea.addEventListener('input', () => stateManager.set(field.id, textarea.value));
  return textarea;
}

function createSelect(field: PlannerField, stateManager: PlannerStateManager): HTMLSelectElement {
  const select = document.createElement('select');
  select.id = `pf-${field.id}`;
  select.className = INPUT_CLASSES;
  if (field.options) {
    for (const opt of field.options) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.value === (stateManager.get(field.id) || field.defaultValue)) {
        option.selected = true;
      }
      select.appendChild(option);
    }
  }
  select.addEventListener('change', () => stateManager.set(field.id, select.value));
  return select;
}

function createColorInput(field: PlannerField, stateManager: PlannerStateManager): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-wrap gap-2';

  const currentVal = stateManager.get(field.id) || field.defaultValue || 'violet';

  if (field.options) {
    for (const opt of field.options) {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.dataset.value = opt.value;
      swatch.className = `w-9 h-9 rounded-xl border-2 transition-all cursor-pointer ${opt.value === currentVal ? 'border-amber-500 ring-2 ring-amber-500/30 scale-110' : 'border-stone-200 hover:border-stone-300'}`;

      const colorMap: Record<string, string> = {
        violet: '#8B5CF6', emerald: '#10B981', sky: '#0EA5E9',
        rose: '#F43F5E', amber: '#F59E0B', blue: '#3B82F6',
        indigo: '#6366F1', teal: '#14B8A6', orange: '#F97316',
        pink: '#EC4899', slate: '#64748B', stone: '#78716C',
      };
      swatch.style.backgroundColor = colorMap[opt.value] || '#B88A6A';

      swatch.addEventListener('click', () => {
        wrapper.querySelectorAll('button').forEach(b => {
          b.className = 'w-9 h-9 rounded-xl border-2 border-stone-200 hover:border-stone-300 transition-all cursor-pointer';
          b.style.backgroundColor = colorMap[b.dataset.value!] || '#B88A6A';
        });
        swatch.className = 'w-9 h-9 rounded-xl border-2 border-amber-500 ring-2 ring-amber-500/30 scale-110 transition-all cursor-pointer';
        swatch.style.backgroundColor = colorMap[opt.value] || '#B88A6A';
        stateManager.set(field.id, opt.value);
      });

      wrapper.appendChild(swatch);
    }
  }

  return wrapper;
}

export function renderField(field: PlannerField, stateManager: PlannerStateManager): HTMLElement {
  const container = createFieldContainer(field);
  container.appendChild(createLabel(field));

  let input: HTMLElement;
  switch (field.type) {
    case 'select':
      input = createSelect(field, stateManager);
      break;
    case 'textarea':
      input = createTextarea(field, stateManager);
      break;
    case 'number':
      input = createNumberInput(field, stateManager);
      break;
    case 'date':
      input = createDateInput(field, stateManager);
      break;
    case 'color':
      input = createColorInput(field, stateManager);
      break;
    default:
      input = createTextInput(field, stateManager);
      break;
  }

  container.appendChild(input);
  return container;
}

export function renderSection(
  sectionName: string,
  fields: PlannerField[],
  stateManager: PlannerStateManager
): HTMLDivElement {
  const section = document.createElement('div');
  section.className = 'planner-section';

  const heading = document.createElement('h4');
  heading.className = 'text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2';
  heading.textContent = sectionName;
  section.appendChild(heading);

  const inner = document.createElement('div');
  inner.className = 'space-y-3';
  for (const field of fields) {
    inner.appendChild(renderField(field, stateManager));
  }
  section.appendChild(inner);

  return section;
}

export function renderForm(
  config: PlannerConfig,
  stateManager: PlannerStateManager,
  container: HTMLElement
): void {
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'flex items-center gap-2 mb-5 pb-3 border-b border-stone-100';
  header.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
    <span class="text-xs font-bold text-stone-700">Your Details</span>`;
  container.appendChild(header);

  const sorted = [...config.fields].sort((a, b) => (a.required === b.required ? 0 : a.required ? -1 : 1));

  for (const section of config.sections) {
    const sectionFields = sorted.filter(f => f.section === section);
    if (sectionFields.length > 0) {
      container.appendChild(renderSection(section, sectionFields, stateManager));
    }
  }
}
