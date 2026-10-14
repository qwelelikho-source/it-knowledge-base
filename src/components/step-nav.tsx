'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function StepNav({ steps }: { steps: { id: string; title: string }[] }) {
  const [active, setActive] = useState(steps[0]?.id)

  useEffect(() => {
    const elements = steps
      .map((s) => document.getElementById(`step-${s.id}`))
      .filter((el): el is HTMLElement => !!el)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          setActive(visible[0].target.id.replace('step-', ''))
        }
      },
      { rootMargin: '-90px 0px -60% 0px' }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [steps])

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 font-medium">On this page</p>
      <ol className="space-y-1 border-l">
        {steps.map((step, i) => (
          <li key={step.id}>
            <a
              href={`#step-${step.id}`}
              aria-current={active === step.id ? 'step' : undefined}
              className={cn(
                '-ml-px flex gap-2 border-l-2 py-1.5 pl-3 pr-2 transition-colors',
                active === step.id
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="tabular-nums">{i + 1}.</span>
              <span className="line-clamp-2">{step.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
