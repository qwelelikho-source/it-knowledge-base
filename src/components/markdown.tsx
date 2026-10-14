import { isValidElement, type ReactElement } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from '@/components/code-block'
import { cn } from '@/lib/utils'

function textOf(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement(node)) return textOf((node as ReactElement<{ children?: React.ReactNode }>).props.children)
  return ''
}

const components: Components = {
  p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-3">{children}</p>,
  h1: ({ children }) => <h3 className="mt-5 text-lg font-semibold">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-5 text-lg font-semibold">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-4 text-base font-semibold">{children}</h4>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-primary/40 pl-4 text-muted-foreground">{children}</blockquote>
  ),
  hr: () => <hr className="my-6" />,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b bg-muted/60 px-3 py-2 text-left font-medium">{children}</th>,
  td: ({ children }) => <td className="border-b px-3 py-2 last:border-b-0">{children}</td>,
  pre: ({ children }) => <CodeBlock code={textOf(children).replace(/\n$/, '')}>{children}</CodeBlock>,
  code: ({ className, children }) => {
    // Fenced blocks arrive with a language class or newlines; inline code does not.
    const isBlock = /language-/.test(className ?? '') || String(children).includes('\n')
    return isBlock ? (
      <code className={cn('font-mono', className)}>{children}</code>
    ) : (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>
    )
  },
}

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('text-[15px] text-foreground/90', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
