'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsUpIcon, ThumbsDown } from 'lucide-react'

export function FeedbackWidget({ guideId }: { guideId: string }) {
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = async (helpful: boolean) => {
    // Check if already voted in localStorage
    const votedGuides = JSON.parse(localStorage.getItem('votedGuides') || '[]')
    if (votedGuides.includes(guideId)) {
      return
    }

    // Submit to API
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId, helpful }),
      })

      // Save to localStorage
      votedGuides.push(guideId)
      localStorage.setItem('votedGuides', JSON.stringify(votedGuides))

      setHasVoted(true)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  if (hasVoted) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
          <ThumbsUp className="h-5 w-5" />
          <span className="font-medium">Thank you for your feedback!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Was this guide helpful?
      </h3>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => handleVote(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-all hover:shadow-lg"
        >
          <ThumbsUp className="h-5 w-5" />
          Yes
        </button>
        <button
          onClick={() => handleVote(false)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium transition-all hover:shadow-lg"
        >
          <ThumbsDown className="h-5 w-5" />
          No
        </button>
      </div>
    </div>
  )
}
