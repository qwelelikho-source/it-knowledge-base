import { Fragment } from 'react'
import { anyTermRegex } from '@/lib/search'

/** Wraps every match of the search terms in <mark>. */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>

  // One capture group, so split() puts the matches at the odd indexes.
  const parts = text.split(anyTermRegex(terms))

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-primary/15 px-0.5 font-medium text-foreground">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}
