const PROTECTED_PATTERNS = [
  /https?:\/\/[\w\-\.\/\?\#\%\&\=\+\@\!\~\(\)]+[\w\-\/\#\%\&\=\+\@\!\~\(\)]/g,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?\b/g,
  /[vV]?\d+(?:\.\d+)+\b/g,
  /\b\d+\.\d+\b/g,
  /(?:[a-zA-Z]:\\|[\\\/])[a-zA-Z0-9._\-\/\\]+/g,
];

export interface CleanupResult {
  text: string;
  count: number;
}

const withProtectionCount = (text: string, transform: (t: string) => CleanupResult): CleanupResult => {
  const protectedMap = new Map<string, string>();
  let counter = 0;
  let processedText = text;

  PROTECTED_PATTERNS.forEach((pattern) => {
    processedText = processedText.replace(pattern, (match) => {
      const placeholder = `__CLEANUP_PROTECT_${counter++}__`;
      protectedMap.set(placeholder, match);
      return placeholder;
    });
  });

  const result = transform(processedText);
  let finalText = result.text;

  const placeholders = Array.from(protectedMap.keys()).reverse();
  placeholders.forEach((placeholder) => {
    const original = protectedMap.get(placeholder)!;
    finalText = finalText.replace(placeholder, () => original);
  });

  return { text: finalText, count: result.count };
};

export const normalizePunctuation = (text: string): CleanupResult => {
  return withProtectionCount(text, (t) => {
    let count = 0;
    const res = t.replace(/([.,!?])\1+/g, (match, p1) => {
      count++;
      return p1;
    });
    return { text: res, count };
  });
};

export const removeAllPunctuation = (text: string): CleanupResult => {
  return withProtectionCount(text, (t) => {
    let count = 0;
    const res = t.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]\"\'<>\\\|\?\@]/g, () => {
      count++;
      return "";
    });
    return { text: res, count };
  });
};

export const removeExtraSpaces = (text: string): CleanupResult => {
  let count = 0;
  let res = text.replace(/[ \t]{2,}/g, () => {
    count++;
    return ' ';
  });
  
  res = res.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed !== line) count++;
    return trimmed;
  }).join('\n');
  
  const finalTrimmed = res.trim();
  if (finalTrimmed !== res) count++;

  return { text: finalTrimmed, count };
};

export const removeEmptyLines = (text: string): CleanupResult => {
  let count = 0;
  const res = text.split('\n').filter(line => {
    if (line.trim() === '') {
      count++;
      return false;
    }
    return true;
  }).join('\n');
  return { text: res, count };
};

export const removeDuplicateWords = (text: string): CleanupResult => {
  return withProtectionCount(text, (t) => {
    let count = 0;
    const res = t.replace(/\b(\w+)(\s+\1)+\b/gi, (match, p1) => {
      const wordsCount = match.trim().split(/\s+/).length;
      count += (wordsCount - 1);
      return p1;
    });
    return { text: res, count };
  });
};

export const toTitleCase = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};
