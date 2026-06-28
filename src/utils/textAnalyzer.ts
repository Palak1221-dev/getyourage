export interface TextAnalysisResults {
  wordCount: number;
  charCount: number;
  charCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeSec: number;
  speakingTimeSec: number;
  uniqueWordCount: number;
  avgWordLength: number;
  avgSentenceLength: number;
  longestWord: string;
  shortestWord: string;
  keywords: Array<{ word: string; count: number; density: number }>;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  socialLimits: {
    twitter: { count: number; percent: number };
    linkedin: { count: number; percent: number };
    instagram: { count: number; percent: number };
    meta: { count: number; percent: number };
  };
}

export const analyzeText = (text: string): TextAnalysisResults => {
  const cleanText = text.trim();
  
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  
  const words = cleanText ? cleanText.split(/\s+/).filter(w => w.length > 0) : [];
  const wordCount = words.length;
  
  const sentences = cleanText ? cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
  const sentenceCount = sentences.length;
  
  const paragraphs = cleanText ? cleanText.split(/\n+/).filter(p => p.trim().length > 0) : [];
  const paragraphCount = paragraphs.length;

  const readingTimeSec = Math.ceil((wordCount / 200) * 60);
  const speakingTimeSec = Math.ceil((wordCount / 130) * 60);

  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const uniqueWordCount = uniqueWords.size;

  const totalCharsInWords = words.reduce((acc, w) => acc + w.length, 0);
  const avgWordLength = wordCount > 0 ? Number((totalCharsInWords / wordCount).toFixed(1)) : 0;
  const avgSentenceLength = sentenceCount > 0 ? Number((wordCount / sentenceCount).toFixed(1)) : 0;

  let longestWord = '';
  let shortestWord = wordCount > 0 ? words[0] : '';
  
  words.forEach(w => {
    const cleanWord = w.replace(/[^\w]/g, '');
    if (cleanWord.length > longestWord.length) longestWord = cleanWord;
    if (cleanWord.length > 0 && cleanWord.length < shortestWord.length) shortestWord = cleanWord;
  });

  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'it', 'its', 'they', 'them', 'their', 'this', 'that', 'i', 'me', 'my', 'you', 'your', 'we', 'us', 'our', 'as', 'if', 'has', 'had', 'have', 'from', 'so', 'up', 'out', 'all', 'can', 'will', 'just', 'more', 'about', 'who', 'which', 'go', 'me']);
  
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    const cleanWord = w.toLowerCase().replace(/[^\w]/g, '');
    if (cleanWord && !stopWords.has(cleanWord)) {
      wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
    }
  });

  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      density: wordCount > 0 ? Number(((count / wordCount) * 100).toFixed(1)) : 0
    }));

  const getSyllables = (word: string) => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  };

  const totalSyllables = words.reduce((acc, w) => acc + getSyllables(w), 0);
  
  let fleschReadingEase = 0;
  if (wordCount > 0 && sentenceCount > 0) {
    fleschReadingEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (totalSyllables / wordCount);
    fleschReadingEase = Math.max(0, Math.min(100, Math.round(fleschReadingEase)));
  }

  let fleschKincaidGrade = 0;
  if (wordCount > 0 && sentenceCount > 0) {
    fleschKincaidGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (totalSyllables / wordCount) - 15.59;
    fleschKincaidGrade = Math.max(0, Math.round(fleschKincaidGrade));
  }

  const calculateLimit = (current: number, max: number) => ({
    count: current,
    percent: Math.min(100, Math.round((current / max) * 100))
  });

  return {
    wordCount,
    charCount,
    charCountNoSpaces,
    sentenceCount,
    paragraphCount,
    readingTimeSec,
    speakingTimeSec,
    uniqueWordCount,
    avgWordLength,
    avgSentenceLength,
    longestWord,
    shortestWord,
    keywords,
    fleschReadingEase,
    fleschKincaidGrade,
    socialLimits: {
      twitter: calculateLimit(charCount, 280),
      linkedin: calculateLimit(charCount, 3000),
      instagram: calculateLimit(charCount, 2200),
      meta: calculateLimit(charCount, 160)
    }
  };
};
