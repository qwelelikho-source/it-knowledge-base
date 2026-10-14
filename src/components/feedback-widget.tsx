'use client'

import { useState } from 'react'

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
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-green-600 font-medium">Thank you for your feedback!</p>
      </div>
    )
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Was this guide helpful?
      </h3>
      <div className="flex gap-4">
        <button
          onClick={() => handleVote(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Yes
        </button>
        <button
          onClick={() => handleVote(false)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          No
        </button>
      </div>
    </div>
  )
}
