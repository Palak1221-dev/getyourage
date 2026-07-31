import type { PlannerConfig } from '../src/scripts/planner-engine/types.ts';

// ── Minimal DOM mocks ──

let store: Record<string, string> = {};

class MockStorage {
  getItem(key: string): string | null { return store[key] ?? null; }
  setItem(key: string, val: string): void { store[key] = val; }
  removeItem(key: string): void { delete store[key]; }
  clear(): void { store = {}; }
  get length(): number { return Object.keys(store).length; }
  key(_i: number): string | null { return null; }
}

globalThis.localStorage = new MockStorage() as unknown as Storage;

// Minimal document mock (for planner-config escapeHtml)
class MockTextNode {
  textContent: string;
  nodeType = 3;
  constructor(text: string) { this.textContent = text; }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

class MockElement {
  tagName = 'div';
  className = '';
  dataset: Record<string, string> = {};
  children: (MockElement | MockTextNode)[] = [];
  parentNode: MockElement | null = null;
  _listeners: Record<string, Function[]> = {};
  _innerHTML = '';
  _textContent = '';
  _value = '';
  _type = '';
  _placeholder = '';
  htmlFor = '';
  id = '';
  style: Record<string, string> = {};
  constructor(tag: string) { this.tagName = tag.toUpperCase(); }
  get innerHTML() {
    if (this._innerHTML) return this._innerHTML;
    return this.children.map(c => {
      if (c instanceof MockTextNode) {
        return escapeHtml(c.textContent);
      }
      return '';
    }).join('');
  }
  set innerHTML(v: string) { this._innerHTML = v; }
  get textContent() {
    return this.children.map(c => {
      if (c instanceof MockTextNode) return c.textContent;
      return (c as MockElement).textContent;
    }).join('');
  }
  set textContent(v: string) {
    this._textContent = v;
    this.children = [new MockTextNode(v)];
  }
  get value() { return this._value; }
  set value(v: string) { this._value = v; }
  get type() { return this._type; }
  set type(v: string) { this._type = v; }
  get placeholder() { return this._placeholder; }
  set placeholder(v: string) { this._placeholder = v; }
  appendChild(child: MockElement | MockTextNode): void {
    this.children.push(child);
    if (child instanceof MockElement) child.parentNode = this;
  }
  removeChild(child: MockElement | MockTextNode): void {
    this.children = this.children.filter(c => c !== child);
  }
  addEventListener(ev: string, fn: Function): void {
    if (!this._listeners[ev]) this._listeners[ev] = [];
    this._listeners[ev].push(fn);
  }
  removeEventListener(ev: string, fn: Function): void {
    if (this._listeners[ev]) {
      this._listeners[ev] = this._listeners[ev].filter(f => f !== fn);
    }
  }
  dispatchEvent(ev: Event): boolean { return true; }
  querySelectorAll(_sel: string): MockElement[] { return []; }
  querySelector(_sel: string): MockElement | null { return null; }
  getAttribute(_name: string): string | null { return null; }
  setAttribute(_name: string, _val: string): void {}
  focus(): void {}
}

class MockDocument {
  createElement(tag: string): any {
    return new MockElement(tag);
  }
  createTextNode(text: string): any {
    return new MockTextNode(text);
  }
  getElementById(_id: string): any { return null; }
  body: any = new MockElement('body');
}

globalThis.document = new MockDocument() as unknown as Document;

// ── Test helpers ──

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  \u2713 ${msg}`);
    passed++;
  } else {
    console.log(`  \u2717 ${msg}`);
    failed++;
  }
}

function assertEq<T>(actual: T, expected: T, msg: string) {
  const ok = actual === expected;
  if (ok) {
    console.log(`  \u2713 ${msg}`);
    passed++;
  } else {
    console.log(`  \u2717 ${msg} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ── Sample config ──

const sampleConfig: PlannerConfig = {
  productId: 'p1',
  productSlug: 'study-planner-pro',
  productTitle: 'Study Planner Pro',
  productPrice: 19.99,
  icon: '📅',
  sections: ['Personal Info', 'Course Setup'],
  fields: [
    { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Alex Johnson', required: true, section: 'Personal Info' },
    { id: 'term', label: 'Semester / Term', type: 'text', placeholder: 'Fall 2026', defaultValue: 'Fall 2026', required: true, section: 'Personal Info' },
    { id: 'subjects', label: 'Your Subjects', type: 'textarea', placeholder: 'Biology, Chemistry', required: true, section: 'Course Setup' },
    { id: 'examDate', label: 'First Exam Date', type: 'date', required: true, section: 'Course Setup' },
    { id: 'goal', label: 'This Term Goal', type: 'text', placeholder: 'Achieve a 3.8 GPA', section: 'Personal Info' },
    { id: 'color', label: 'Accent Color', type: 'select', options: [
      { label: 'Violet', value: 'violet' }, { label: 'Emerald', value: 'emerald' },
    ], defaultValue: 'violet', section: 'Personal Info' },
  ],
};

// ── Tests ──

console.log('\n=== PlannerStateManager ===');

const { PlannerStateManager } = await import('../src/scripts/planner-engine/state.ts');

// Test 1: Constructor loads defaults
store = {};
const mgr = new PlannerStateManager(sampleConfig);
assertEq(mgr.get('name'), '', 'default name is empty');
assertEq(mgr.get('term'), 'Fall 2026', 'default term from field default');
assertEq(mgr.get('color'), 'violet', 'default color from field default');

// Test 2: set/get
mgr.set('name', 'Alice');
assertEq(mgr.get('name'), 'Alice', 'set updates value');

// Test 3: setAll
mgr.setAll({ name: 'Bob', goal: 'A+ in Calculus' });
assertEq(mgr.get('name'), 'Bob', 'setAll updates name');
assertEq(mgr.get('goal'), 'A+ in Calculus', 'setAll updates goal');

// Test 4: getAll returns copy
const all = mgr.getAll();
all.name = 'Hacked';
assertEq(mgr.get('name'), 'Bob', 'getAll returns immutable copy');

// Test 5: getState calculates percentage
store = {};
const freshMgr = new PlannerStateManager(sampleConfig);
// Fill all 6 fields to get 100%
freshMgr.setAll({ name: 'Bob', term: 'Fall 2026', subjects: 'Math', examDate: '2026-12-01', goal: 'A+', color: 'emerald' });
const state = freshMgr.getState();
assertEq(state.filledCount, 6, 'filledCount = 6 (all fields filled)');
assertEq(state.totalCount, 6, 'totalCount = 6');
assertEq(state.percentage, 100, 'percentage = 100% when all filled');

// Test 6: 0% when empty (no defaults filled)
store = {};
const emptyMgr = new PlannerStateManager(sampleConfig);
const emptyState = emptyMgr.getState();
// term has defaultValue "Fall 2026", color has defaultValue "violet"
assertEq(emptyState.percentage, Math.round((2 / 6) * 100), 'percentage for 2 defaults');

// Test 7: reset clears to defaults
store = {};
const resetMgr = new PlannerStateManager(sampleConfig);
resetMgr.set('name', 'Charlie');
resetMgr.reset();
assertEq(resetMgr.get('name'), '', 'reset clears to default (empty)');
assertEq(resetMgr.get('term'), 'Fall 2026', 'reset preserves field-level defaults');

// Test 8: subscription
store = {};
const subMgr = new PlannerStateManager(sampleConfig);
let notified = 0;
const unsub = subMgr.subscribe(() => { notified++; });
subMgr.set('name', 'Charlie');
assertEq(notified, 1, 'subscribe triggers on set');
subMgr.set('name', 'Charlie'); // same value, should not notify
assertEq(notified, 1, 'no notification for unchanged value');
unsub();
subMgr.set('name', 'Dave');
assertEq(notified, 1, 'unsub stops notifications');

// Test 9: field-level subscription
store = {};
const fieldMgr = new PlannerStateManager(sampleConfig);
let fieldVal = '';
const unsubField = fieldMgr.onFieldChange('name', (id, val) => { fieldVal = val; });
fieldMgr.set('name', 'Eve');
assertEq(fieldVal, 'Eve', 'onFieldChange triggers with new value');
unsubField();

// Test 10: localStorage persistence
store = {};
const persistMgr = new PlannerStateManager(sampleConfig);
persistMgr.set('name', 'Persisted');
const raw = JSON.parse(store['tt_planner_p1']);
assertEq(raw.name, 'Persisted', 'persist writes to localStorage');

// Test 11: load from existing storage
store = { 'tt_planner_p1': JSON.stringify({ name: 'LoadTest', term: 'Spring 2026' }) };
const loadMgr = new PlannerStateManager(sampleConfig);
assertEq(loadMgr.get('name'), 'LoadTest', 'load reads from stored JSON');
assertEq(loadMgr.get('term'), 'Spring 2026', 'load reads term from stored JSON');

console.log('\n=== PDFDataCollector ===');

const { PDFDataCollector } = await import('../src/scripts/planner-engine/pdf-collector.ts');

// Test 12: collect
store = {};
const collMgr = new PlannerStateManager(sampleConfig);
collMgr.setAll({ name: 'Test', term: 'Fall' });
const collState = collMgr.getState();
const payload = PDFDataCollector.collect(sampleConfig, collState, 'pdf');
assertEq(payload.productId, 'p1', 'payload productId');
assertEq(payload.productTitle, 'Study Planner Pro', 'payload productTitle');
assertEq(payload.requestedFormat, 'pdf', 'payload format');
assertEq(payload.meta.slug, 'study-planner-pro', 'payload meta slug');
assertEq(payload.meta.price, 19.99, 'payload meta price');
assert(typeof payload.generatedAt === 'string', 'generatedAt is a string');
assert(typeof payload.values.name === 'string', 'payload contains values');

// Test 13: toJSON roundtrip
const json = PDFDataCollector.toJSON(payload);
const parsed = JSON.parse(json);
assertEq(parsed.productId, 'p1', 'toJSON roundtrip');

// Test 14: toBlob
const blob = PDFDataCollector.toBlob(payload);
assertEq(blob.type, 'application/json', 'blob type is json');

// Test 15: collectAllFormats
const allFormats = PDFDataCollector.collectAllFormats(sampleConfig, collState);
assertEq(Object.keys(allFormats).length, 4, '4 formats collected');
assertEq(allFormats['docx'].requestedFormat, 'docx', 'docx format');
assertEq(allFormats['csv'].requestedFormat, 'csv', 'csv format');
assertEq(allFormats['printable'].requestedFormat, 'printable', 'printable format');

// Test 16: createOrderFromState
const order = PDFDataCollector.createOrderFromState(sampleConfig, collState, 'test@example.com');
assertEq(order.product, 'Study Planner Pro', 'order product');
assertEq(order.productId, 'p1', 'order productId');
assertEq(order.price, 19.99, 'order price');
assertEq(order.email, 'test@example.com', 'order email');
assert(order.id.startsWith('ORD-'), 'order ID prefix');
assert(typeof order.date === 'string', 'order date is string');

// Test 17: generatePDF (placeholder)
const genBlob = await PDFDataCollector.generatePDF(payload);
assert(genBlob instanceof Blob, 'generatePDF returns Blob');

console.log('\n=== plannerConfig ===');

const { plannerConfig } = await import('../src/scripts/planner-config.ts');

// Test 18: CRUD cycle
store = {};
assert(!plannerConfig.has('p1'), 'no config initially');
plannerConfig.save('p1', { name: 'Test', term: 'Fall' }, 'Test Product');
assert(plannerConfig.has('p1'), 'config exists after save');

// Test 19: load
const loaded = plannerConfig.load('p1');
assertEq(loaded?.name, 'Test', 'load returns saved values');
assertEq(loaded?.term, 'Fall', 'load returns all values');

// Test 20: merge
plannerConfig.merge('p1', { goal: 'New Goal' });
const merged = plannerConfig.load('p1');
assertEq(merged?.name, 'Test', 'merge keeps existing');
assertEq(merged?.goal, 'New Goal', 'merge adds new key');

// Test 21: getSavedProductIds
const ids = plannerConfig.getSavedProductIds();
assert(ids.includes('p1'), 'saved IDs includes p1');

// Test 22: getUpdatedAt
const ts = plannerConfig.getUpdatedAt('p1');
assert(typeof ts === 'string', 'updatedAt is a string');

// Test 23: getProductTitle
const title = plannerConfig.getProductTitle('p1');
assertEq(title, 'Test Product', 'getProductTitle returns saved title');

// Test 24: clear
plannerConfig.clear('p1');
assert(!plannerConfig.has('p1'), 'config cleared');

// Test 25: clearAll
plannerConfig.save('p1', { a: '1' });
plannerConfig.save('p2', { b: '2' });
assertEq(plannerConfig.getSavedProductIds().length, 2, 'two configs saved');
plannerConfig.clearAll();
assertEq(plannerConfig.getSavedProductIds().length, 0, 'all configs cleared');

// Test 26: getAllEntries
plannerConfig.save('p1', { name: 'Alice' }, 'Product A');
plannerConfig.save('p2', { name: 'Bob' }, 'Product B');
const entries = plannerConfig.getAllEntries();
assertEq(entries.length, 2, 'getAllEntries returns 2 entries');

// Test 27: renderSummary
const summary = plannerConfig.renderSummary(
  { name: 'Alice', term: 'Fall' },
  'Study Planner Pro',
  [{ id: 'name', label: 'Your Name' }, { id: 'term', label: 'Term' }],
  ['PDF file', 'DOCX file']
);
assert(summary.includes('Alice'), 'summary contains field value');
assert(summary.includes('Study Planner Pro'), 'summary contains product title');
assert(summary.includes('PDF file'), 'summary contains what-included item');
assert(summary.includes('Term'), 'summary contains field label');

// Test 28: subscription
let subNotified = false;
const unsubSub = plannerConfig.subscribe('p1', () => { subNotified = true; });
plannerConfig.save('p1', { name: 'SubTest' });
assert(subNotified, 'subscribe triggers on save');
unsubSub();

// Test 29: escapeHtml
const safe = plannerConfig.escapeHtml('<script>alert("xss")</script>');
assert(!safe.includes('<script>'), 'escapeHtml removes tags');
assert(safe.includes('&lt;'), 'escapeHtml encodes HTML');

// Test 30: save preserves existing values when not overwritten
plannerConfig.save('p1', { name: 'OnlyName' });
const onlyLoaded = plannerConfig.load('p1');
assertEq(onlyLoaded?.name, 'OnlyName', 'save sets provided keys');
// save() replaces all values, it doesn't merge — that's by design, merge() exists for partial
assertEq(Object.keys(onlyLoaded!).length, 1, 'save replaces all values (merge for partial)');

console.log('\n=== Products Data ===');

const { products, categoryMeta } = await import('../src/data/products.ts');

// Test 31: Flag 4 flagship products
assert(products.length === 4, '4 flagship products defined');

// Test 32: Required product fields
for (const p of products) {
  assert(!!p.id, `product ${p.title} has id`);
  assert(!!p.slug, `product ${p.title} has slug`);
  assert(!!p.title, `product ${p.title} has title`);
  assert(typeof p.price === 'number' && p.price > 0, `product ${p.title} has valid price`);
  assert(['academic','productivity','wellness','goals'].includes(p.category),
    `product ${p.title} valid category`);
  const minWhatIncluded: Record<string, number> = {
    'p1': 9, 'p7': 6, 'p12': 8, 'p10': 17
  };
  const minItems = minWhatIncluded[p.id] ?? 8;
  assert(p.whatIncluded.length >= minItems, `product ${p.title} has >=${minItems} whatIncluded items`);
  assert(p.formats.length > 0, `product ${p.title} has formats`);
  assert(p.personalization.length > 0, `product ${p.title} has personalization`);
  const hasRequired = p.personalization.some(f => f.required);
  assert(hasRequired, `product ${p.title} has at least one required field`);
}

// Test 33: No duplicate slugs
const slugs = products.map(p => p.slug);
assertEq(new Set(slugs).size, slugs.length, 'no duplicate slugs');

// Test 34: Category meta covers all categories
const categories = new Set(products.map(p => p.category));
for (const cat of categories) {
  assert(!!categoryMeta[cat], `categoryMeta covers "${cat}"`);
}

// Test 35: Each category has at least 1 product
const catCounts: Record<string, number> = {};
for (const p of products) {
  catCounts[p.category] = (catCounts[p.category] || 0) + 1;
}
for (const [cat, count] of Object.entries(catCounts)) {
  assert(count >= 1, `category "${cat}" has >=1 product (${count})`);
}

// Test 36: Product slugs match pattern
for (const p of products) {
  assert(/^[a-z0-9-]+$/.test(p.slug), `product ${p.id} slug "${p.slug}" is kebab-case`);
}

// Test 37: Prices are reasonable
for (const p of products) {
  assert(p.price > 0 && p.price < 100, `product ${p.id} price ${p.price} is between $1-$99`);
}

console.log(`\n\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m\n`);
if (failed > 0) process.exit(1);
