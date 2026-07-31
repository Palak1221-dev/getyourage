const dodoProductIdMap: Record<string, string> = {
  'p1': 'pdt_0NjnftTMCarA0cgDoHKjw',
  'p7': 'pdt_0Njng9pf8kj31sXC9u20c',
  'p10': 'pdt_0NjngaC7iuVS9esTr9tGY',
  'p12': 'pdt_0Njng19ufRxOW0jigjgl2',
};

const knownNames: Record<string, string> = {
  'study-planner-pro': 'p1',
  'master-your-day': 'p7',
  'social-media-detox': 'p10',
  'wellness-journal': 'p12',
  'study-planner': 'p1',
  'revision-tracker': 'p1',
  'habit-tracker': 'p12',
  'budget-planner': 'p10',
  'resume-optimizer-kit': 'p10',
};

export function resolveDodoProductId(internalId: string): string {
  const resolvedId = knownNames[internalId] || internalId;
  const dodoId = dodoProductIdMap[resolvedId];
  if (!dodoId) {
    throw new Error(`Unknown product: "${internalId}". No Dodo Product ID mapped.`);
  }
  return dodoId;
}
