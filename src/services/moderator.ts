/**
 * KarmaKount Auto-Moderation & Content Filter Engine
 * Enforces PG-13 / Family-Friendly standards across all IRL deeds, comments, and player profiles.
 * 
 * Rules:
 * 1. Gibberish & Keyboard-mash prevention
 * 2. Zero-tolerance Hate Speech & Slurs (with leetspeak normalization)
 * 3. Severe Profanity & Vulgarity filtering
 * 4. Sexually Explicit / NSFW filter
 * 5. Extreme Violence, Murder, Self-Harm & Felonies filter
 * 6. Hard Drugs & Illicit Narcotics filter
 */

export type ModerationViolation = 
  | 'GIBBERISH'
  | 'HATE_SPEECH'
  | 'PROFANITY'
  | 'SEXUAL_CONTENT'
  | 'VIOLENCE'
  | 'ILLICIT_DRUGS';

export interface ModerationResult {
  isValid: boolean;
  violation?: ModerationViolation;
  reason?: string;
  flaggedSnippet?: string;
}

// 1. Hate Speech & Slurs (Zero Tolerance)
const HATE_SPEECH_PATTERNS: RegExp[] = [
  /\bn[i1l!][g9q]{2,}[a4e3r]*[s5z]?\b/i,          // n-word variations (singular, plural, leetspeak)
  /\bn[e3]gr[o0][e3s5z]?\b/i,
  /\bf[a4@][g9q]+[s5z]?\b/i,                      // f-slur variations
  /\bf[a4@][g9q]{1,2}[o0e3]t[s5z]?\b/i,
  /\bd[y1!]k[e3][s5z]?\b/i,
  /\btr[a4@]nn[y1i][e3s5z]?\b/i,
  /\bk[i1!]k[e3][s5z]?\b/i,                      // antisemitic slurs
  /\bsp[i1!]c[s5z]?\b/i,
  /\bch[i1!]nk[s5z]?\b/i,
  /\bw[e3]tb[a4@]ck[s5z]?\b/i,
  /\bg[o0]{2}k[s5z]?\b/i,
  /\br[e3]t[a4@]rd([e3]d|[s5z])?\b/i,
  /\bzipperhead\b/i,
  /\bcoon[s5z]?\b/i,
];

// 2. Profanity & Vulgarity
const PROFANITY_PATTERNS: RegExp[] = [
  /\bf+u+c+k+(er|ing|ed|s)?\b/i,
  /\bf\*+c+k+\b/i,
  /\bfck\b/i,
  /\bsh[i1!]t+(s|y|ting|ted)?\b/i,
  /\bc+u+n+t+(s)?\b/i,
  /\bc\*+n+t+\b/i,
  /\bb[i1!]tch+(es|ing|y)?\b/i,
  /\ba[s$]{2}h[o0]l[e3](s)?\b/i,
  /\bd[i1!]ckh[e3][a4]d(s)?\b/i,
  /\bm[o0]th[e3]rf[u\*]ck[e3]r(s)?\b/i,
  /\bb[a4@]st[a4@]rd(s)?\b/i,
  /\bw[a4@]nk[e3]r(s)?\b/i,
  /\btw[a4@]t(s)?\b/i,
  /\bp[i1!]ss+(ed|ing|er)?\b/i,
];

// 3. Sexually Explicit & NSFW
const SEXUAL_PATTERNS: RegExp[] = [
  /\b(have|had|having)\s+sex\b/i,
  /\bsex\b/i,
  /\bsexy\b/i,
  /\bsexual(ly)?\b/i,
  /\bintercourse\b/i,
  /\bp[o0]rn([o0]|ography)?\b/i,
  /\bnsfw\b/i,
  /\bonlyfans\b/i,
  /\bhentai\b/i,
  /\bxxx\b/i,
  /\br[a4@]p[e3](d|st|ing|s)?\b/i,
  /\bm[o0]l[e3]st(ed|ing|ation|er)?\b/i,
  /\bbl[o0]wj[o0]b(s)?\b/i,
  /\bh[a4@]ndj[o0]b(s)?\b/i,
  /\bm[a4@]st[u\*]rb[a4@]t(e|ing|ion)?\b/i,
  /\bejacul[a4@]t(e|ion|ed)?\b/i,
  /\b[o0]rg[a4@]sm(s)?\b/i,
  /\bp[e3]n[i1!]s(es)?\b/i,
  /\bv[a4@]g[i1!]n[a4@](s)?\b/i,
  /\bp[u\*]ssy\b/i,
  /\bd[i1!]ld[o0](s)?\b/i,
  /\bb[o0]{2}b[s5z]\b/i,
  /\bt[i1!]t[s5z]\b/i,
  /\bcr[e3][a4@]mp[i1!]e\b/i,
  /\bthr[e3]{2}s[o0]m[e3]\b/i,
  /\bnud[e3](s)?\b/i,
  /\bn[a4@]k[e3]d\b/i,
  /\ber[o0]t[i1!]c\b/i,
  /\binc[e3]st\b/i,
  /\bp[e3]d[o0]ph[i1!]l(e|ia)?\b/i,
];

// 4. Extreme Violence, Murder, Felonies & Weapons
const VIOLENCE_PATTERNS: RegExp[] = [
  /\bmurd[e3]r(ed|er|ing|s)?\b/i,
  /\b(i\s+)?k[i1!]ll(ed)?\s+(some(one|body)|a\s+person|him|her|them|myself|people)\b/i,
  /\bh[o0]m[i1!]c[i1!]d[e3]\b/i,
  /\bsl[a4@]ught[e3]r(ed|ing)?\b/i,
  /\b(mass\s+)?sh[o0]{2}t\s+up\b/i,
  /\b(mass\s+)?sh[o0]{2}t[i1!]ng\b/i,
  /\bt[e3]rr[o0]r[i1!]st\b/i,
  /\bb[o0]mb(ing|ed)?\b/i,
  /\bsu[i1!]c[i1!]d[e3]\b/i,
  /\bk[y1!]s\b/i,
  /\bk[i1!]ll\s+y[o0]urs[e3]lf\b/i,
  /\bh[a4@]ng\s+y[o0]urs[e3]lf\b/i,
  /\bb[e3]h[e3][a4@]d(ed|ing)?\b/i,
  /\bst[a4@]bb(ed)?\s+(some(one|body)|him|her|them|to\s+death)\b/i,
  /\bhum[a4@]n\s+tr[a4@]ff[i1!]ck(ing)?\b/i,
  /\bstr[a4@]ngl(ed|ing)?\s+(some(one|body)|him|her|them)\b/i,
];

// 5. Hard Drugs & Illicit Narcotics
const DRUG_PATTERNS: RegExp[] = [
  /\bdrug[s5z]?\b/i,
  /\bh[e3]r[o0][i1!]n\b/i,
  /\bc[o0]c[a4@][i1!]n[e3]\b/i,
  /\bm[e3]th(amphetamine)?\b/i,
  /\bf[e3]nt[a4@]n[y1!]l\b/i,
  /\bcr[a4@]ck\s+c[o0]c[a4@][i1!]n[e3]\b/i,
  /\bk[e3]t[a4@]m[i1!]n[e3]\b/i,
  /\bpcp\b/i,
  /\b[e3]cst[a4@]sy\b/i,
  /\b(buy|bought|sell|selling|sold|deal|dealing)\s+(drugs|weed|pills|narcotics)\b/i,
];

/**
 * Normalizes text to defeat simple leetspeak and spaced-out obfuscation
 * e.g. "f u c k" -> "fuck", "n.i.g.g.e.r" -> "nigger", "s h ! t" -> "shit"
 */
function normalizeObfuscation(text: string): string {
  // Collapse single characters separated by spaces or punctuation: "f u c k" -> "fuck"
  const collapsedSpaced = text.replace(/\b([a-z0-9])\s+([a-z0-9])\s+([a-z0-9])\s+([a-z0-9])\b/gi, '$1$2$3$4');
  // Strip common obfuscation symbols within word-like tokens
  const cleanPunctuation = collapsedSpaced.replace(/([a-z0-9])[._\-*@#$!]([a-z0-9])/gi, '$1$2');
  return cleanPunctuation;
}

/**
 * Checks for gibberish, keyboard-mash, or spam inputs.
 * Examples flagged: "awdawdawdasfd", "asdfjklasdf", "zzzzzzzz", "111111111"
 */
export function checkGibberish(text: string): { isGibberish: boolean; reason?: string } {
  const clean = text.trim();
  if (clean.length === 0) {
    return { isGibberish: true, reason: 'Entry cannot be empty' };
  }

  // 1. Check for excessive repeated characters: 5+ in a row (e.g. "aaaaaa", "sdffffffff")
  if (/(.)\1{4,}/i.test(clean)) {
    return { isGibberish: true, reason: 'Excessive repeated characters detected' };
  }

  // Split into word tokens (alphabetic tokens of length >= 4)
  const words = clean.split(/\s+/);
  
  for (const word of words) {
    const lettersOnly = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    // Ignore short words or numbers with units (e.g. "$5", "150km/hr", "GPS", "IRL")
    if (lettersOnly.length < 6) continue;

    const vowels = lettersOnly.match(/[aeiouy]/g) || [];
    const vowelCount = vowels.length;
    const vowelRatio = vowelCount / lettersOnly.length;

    // A. Completely vowel-less long word (e.g., "sdfghjkl", "qwrtyp")
    if (vowelCount === 0 && lettersOnly.length >= 6) {
      return { isGibberish: true, reason: 'Unreadable character sequence (no vowels)' };
    }

    // B. Unnaturally low vowel ratio for words >= 8 characters (e.g., "awdawdawdasfd", "xrtpqlmzk")
    if (lettersOnly.length >= 8 && vowelRatio < 0.18) {
      return { isGibberish: true, reason: 'Unreadable keyboard mash detected' };
    }

    // C. 5+ consecutive consonants in a row (excluding rare English digraphs)
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(lettersOnly)) {
      // Allow legitimate English words like "strengths", "angsts"
      const allowedConsonantWords = new Set(['strengths', 'lengths', 'angsts', 'twelfths']);
      if (!allowedConsonantWords.has(lettersOnly)) {
        return { isGibberish: true, reason: 'Unnatural consonant cluster detected' };
      }
    }

    // D. Repeated 2-4 character keyboard loops (e.g., "awdawd", "asdfasdf", "qweqwe")
    if (lettersOnly.length >= 8) {
      const matchLoop = /(..+?)\1{2,}/i.test(lettersOnly);
      if (matchLoop) {
        return { isGibberish: true, reason: 'Repetitive keyboard pattern detected' };
      }
    }
  }

  return { isGibberish: false };
}

/**
 * Main auto-moderation entry point.
 * Scans content against all safety categories and returns a structured verdict.
 */
export function moderateContent(text: string): ModerationResult {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      violation: 'GIBBERISH',
      reason: 'Content cannot be empty',
    };
  }

  const rawText = text.trim();
  const normalized = normalizeObfuscation(rawText);

  // 1. Hate Speech & Slurs (Highest Priority)
  for (const pattern of HATE_SPEECH_PATTERNS) {
    const match = rawText.match(pattern) || normalized.match(pattern);
    if (match) {
      return {
        isValid: false,
        violation: 'HATE_SPEECH',
        reason: 'Hate speech and discriminatory slurs are strictly prohibited on KarmaKount.',
        flaggedSnippet: match[0],
      };
    }
  }

  // 2. Extreme Violence & Felonies
  for (const pattern of VIOLENCE_PATTERNS) {
    const match = rawText.match(pattern) || normalized.match(pattern);
    if (match) {
      return {
        isValid: false,
        violation: 'VIOLENCE',
        reason: 'Severe violence, murder, violent threats, and self-harm are strictly forbidden.',
        flaggedSnippet: match[0],
      };
    }
  }

  // 3. Sexually Explicit & NSFW
  for (const pattern of SEXUAL_PATTERNS) {
    const match = rawText.match(pattern) || normalized.match(pattern);
    if (match) {
      return {
        isValid: false,
        violation: 'SEXUAL_CONTENT',
        reason: 'KarmaKount is a family-friendly / PG-13 community. Explicit sexual content is not allowed.',
        flaggedSnippet: match[0],
      };
    }
  }

  // 4. Hard Drugs & Illicit Narcotics
  for (const pattern of DRUG_PATTERNS) {
    const match = rawText.match(pattern) || normalized.match(pattern);
    if (match) {
      return {
        isValid: false,
        violation: 'ILLICIT_DRUGS',
        reason: 'References to illicit drugs or narcotics violate the KarmaKount Codex.',
        flaggedSnippet: match[0],
      };
    }
  }

  // 5. Profanity & Vulgar Language
  for (const pattern of PROFANITY_PATTERNS) {
    const match = rawText.match(pattern) || normalized.match(pattern);
    if (match) {
      return {
        isValid: false,
        violation: 'PROFANITY',
        reason: 'Please keep language respectful and PG-13. Profanity is not allowed.',
        flaggedSnippet: match[0],
      };
    }
  }

  // 6. Gibberish & Quality Check
  const gibberishCheck = checkGibberish(rawText);
  if (gibberishCheck.isGibberish) {
    return {
      isValid: false,
      violation: 'GIBBERISH',
      reason: gibberishCheck.reason || 'Please provide clear, readable English deeds or comments.',
    };
  }

  return { isValid: true };
}

/**
 * Validates multiple text fields together (e.g. title + description + category).
 */
export function moderateTextBundle(fields: Record<string, string | undefined | null>): ModerationResult {
  for (const [fieldName, val] of Object.entries(fields)) {
    if (!val) continue;
    const res = moderateContent(val);
    if (!res.isValid) {
      return {
        ...res,
        reason: `[${fieldName}]: ${res.reason}`,
      };
    }
  }
  return { isValid: true };
}
