const TONE_COLORS = {
  1: 'var(--tone-1)',
  2: 'var(--tone-2)',
  3: 'var(--tone-3)',
  4: 'var(--tone-4)',
  5: 'var(--tone-5)',
}

export function getToneColor(tone) {
  return TONE_COLORS[tone] || TONE_COLORS[5]
}

export function getToneFromPinyin(pinyin) {
  const toneMap = {
    'ā': 1, 'á': 1, 'ǎ': 1, 'à': 1,
    'ē': 1, 'é': 2, 'ě': 3, 'è': 4,
    'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4,
    'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4,
    'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4,
    'ǖ': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4,
  }

  // More precise: map diacritics to tones
  const toneMarks = {
    '\u0304': 1, // macron (tone 1)
    '\u0301': 2, // acute (tone 2)
    '\u030C': 3, // caron (tone 3)
    '\u0300': 4, // grave (tone 4)
  }

  // Check composed characters
  const composedMap = {
    'ā': 1, 'á': 2, 'ǎ': 3, 'à': 4,
    'ē': 1, 'é': 2, 'ě': 3, 'è': 4,
    'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4,
    'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4,
    'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4,
    'ǖ': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4,
  }

  for (const char of pinyin) {
    if (composedMap[char]) return composedMap[char]
  }

  // Check decomposed combining marks
  const normalized = pinyin.normalize('NFD')
  for (const char of normalized) {
    if (toneMarks[char]) return toneMarks[char]
  }

  return 5 // neutral tone
}
