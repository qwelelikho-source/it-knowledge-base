/**
 * Keyword search helpers.
 *
 * Matching happens in JavaScript (not in SQL) so it behaves the same on SQLite
 * and PostgreSQL, ignores case, and treats "wifi" and "Wi-Fi" as the same word.
 * That is plenty for a knowledge base with hundreds of guides. If this grows to
 * thousands, move to the database's full-text search.
 */

const SEPARATORS = /[-_.'’]/g
const SEP = `[-_.'’]?`

export function searchTerms(query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(SEPARATORS, ''))
    .filter(Boolean)
    .slice(0, 6)
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** One term -> regex source that matches at the start of a word, ignoring hyphens. */
function termSource(term: string) {
  return `(?<![A-Za-z0-9])${[...term].map(escapeRegExp).join(SEP)}`
}

export function termRegex(term: string, flags = 'i') {
  return new RegExp(termSource(term), flags)
}

/** Regex that matches any of the terms (used for highlighting). */
export function anyTermRegex(terms: string[]) {
  return new RegExp(`(${terms.map(termSource).join('|')})`, 'gi')
}

type Searchable = {
  title: string
  summary: string
  steps: { title: string; body: string }[]
}

/** Returns a relevance score, or 0 when any term is missing from the guide. */
export function scoreGuide(guide: Searchable, terms: string[]) {
  let score = 0
  for (const term of terms) {
    const re = termRegex(term)
    const inTitle = re.test(guide.title)
    const inSummary = re.test(guide.summary)
    const inSteps = guide.steps.some((s) => re.test(s.title) || re.test(s.body))
    if (!inTitle && !inSummary && !inSteps) return 0
    score += (inTitle ? 6 : 0) + (inSummary ? 3 : 0) + (inSteps ? 1 : 0)
  }
  return score
}

/** A short excerpt around the first match, or null. */
export function excerpt(text: string, terms: string[], radius = 70) {
  let hit = -1
  for (const term of terms) {
    const m = termRegex(term).exec(text)
    if (m && (hit === -1 || m.index < hit)) hit = m.index
  }
  if (hit === -1) return null
  const start = Math.max(0, hit - radius)
  const end = Math.min(text.length, hit + radius)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`
}

export function matchesTitleOrSummary(guide: { title: string; summary: string }, terms: string[]) {
  return terms.some((t) => {
    const re = termRegex(t)
    return re.test(guide.title) || re.test(guide.summary)
  })
}
