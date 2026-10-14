'use client'

import { useState, useSyncExternalStore } from 'react'
import { Check, ThumbsDown, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const KEY = 'kb:votes'
const listeners = new Set<() => void>()

function readVotes(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

function saveVote(guideId: string, helpful: boolean) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readVotes(), [guideId]: helpful }))
  } catch {
    // Storage unavailable: the vote still counted on the server.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** 'up' | 'down' | '' — primitives keep the snapshot stable between renders. */
function useStoredVote(guideId: string) {
  return useSyncExternalStore(
    subscribe,
    () => {
      const v = readVotes()[guideId]
      return v === undefined ? '' : v ? 'up' : 'down'
    },
    () => ''
  )
}

export function FeedbackWidget({ guideId }: { guideId: string }) {
  const stored = useStoredVote(guideId)
  const [pending, setPending] = useState(false)

  const vote = async (helpful: boolean) => {
    setPending(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId, helpful }),
      })
      if (!res.ok) throw new Error('Request failed')
      saveVote(guideId, helpful)
    } catch {
      toast.error('Your feedback was not sent. Try again in a moment.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="p-6 text-center shadow-soft sm:p-8">
      {stored ? (
        <div className="animate-pop-in space-y-2" role="status">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="h-5 w-5" />
          </div>
          <p className="font-semibold">Thanks for the feedback</p>
          <p className="text-sm text-muted-foreground">
            {stored === 'up'
              ? 'Glad this helped.'
              : 'We will use this to improve the guide. Try searching for another fix.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Did this fix your problem?</h2>
            <p className="text-sm text-muted-foreground">Your answer helps us improve the guide.</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="lg" disabled={pending} onClick={() => vote(true)} className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              Yes, it helped
            </Button>
            <Button variant="outline" size="lg" disabled={pending} onClick={() => vote(false)} className="gap-2">
              <ThumbsDown className="h-4 w-4" />
              Not really
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
