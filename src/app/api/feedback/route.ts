import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const feedbackSchema = z.object({
  guideId: z.string().min(1),
  helpful: z.boolean(),
})

export async function POST(request: Request) {
  try {
    const { guideId, helpful } = feedbackSchema.parse(await request.json())

    // Only published guides can receive feedback.
    const guide = await prisma.guide.findFirst({
      where: { id: guideId, published: true },
      select: { id: true },
    })
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
    }

    await prisma.feedback.create({ data: { guideId, helpful } })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Submit feedback failed:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
