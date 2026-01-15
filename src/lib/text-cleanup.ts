export const FILLER_WORDS = [
  "um",
  "umm",
  "ummm",
  "uh",
  "uhh",
  "uhhh",
  "er",
  "err",
  "ah",
  "ahh",
  "like",
  "you know",
  "i mean",
  "basically",
  "actually",
  "literally",
  "so",
  "well",
  "right",
  "okay",
  "ok",
  "yeah",
  "yep",
  "hmm",
  "hmmm",
  "sort of",
  "kind of",
  "kinda",
  "sorta",
  "just",
  "really",
];

export function removeFillerWords(text: string): string {
  let cleaned = text;
  
  FILLER_WORDS.forEach(filler => {
    const pattern = new RegExp(`\\b${filler}\\b`, 'gi');
    cleaned = cleaned.replace(pattern, '');
  });
  
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

export function cleanupTranscript(text: string, maxWords?: number): string {
  const cleaned = removeFillerWords(text);
  
  const words = cleaned.split(' ').filter(w => w.length > 0);
  
  if (maxWords && words.length > maxWords) {
    return words.slice(0, maxWords).join(' ');
  }
  
  return words.join(' ');
}
