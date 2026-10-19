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

// ---------------------------------------------------------------------------
// Relevance ranking for natural-language questions (used by the AI assistant).
// Unlike scoreGuide(), a guide does NOT need to contain every word.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(
  `a about after again all also am an and any are as at be because been before being but by can could did do does
   doing don dont for from get got had has have having he her here hers him his how i if in into is it its just
   keep keeps let like me more most my no not now of off on once only or other our out over own please really
   same she should so some such than that the their them then there these they this those through to too under
   until up us very was we were what when where which while who why will with would you your yours help need
   want tell show how-do not working doesnt isnt wont cant cannot
   didnt didn wasnt work works worked else next then first also still tried try using use anything something`
    .split(/\s+/)
    .filter(Boolean)
)

/** Meaningful words from a free-text question. */
export function questionTerms(question: string) {
  return [
    ...new Set(
      question
        .toLowerCase()
        .split(/[^a-z0-9'’-]+/)
        .map((t) => t.replace(SEPARATORS, ''))
        .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
    ),
  ].slice(0, 12)
}

/** Sum of weighted term hits. 0 means nothing in the guide relates to the question. */
export function relevance(guide: Searchable, terms: string[]) {
  let score = 0
  for (const term of terms) {
    const re = termRegex(term)
    if (re.test(guide.title)) score += 6
    if (re.test(guide.summary)) score += 3
    if (guide.steps.some((s) => re.test(s.title) || re.test(s.body))) score += 1
  }
  return score
}

export function rankGuides<T extends Searchable>(guides: T[], question: string, limit: number) {
  const terms = questionTerms(question)
  if (terms.length === 0) return []
  const scored = guides
    .map((guide) => ({ guide, score: relevance(guide, terms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
  if (scored.length === 0) return []

  // Drop weak matches (e.g. a single word buried in one step) when there is a clear winner.
  const cutoff = Math.max(2, scored[0].score * 0.35)
  return scored
    .filter((r) => r.score >= cutoff)
    .slice(0, limit)
    .map((r) => r.guide)
}
