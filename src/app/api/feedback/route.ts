import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const feedbackSchema = z.object({
  guideId: z.string().min(1),
  helpful: z.boolean(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = feedbackSchema.parse(body)

    const feedback = await prisma.feedback.create({
      data: {
        guideId: validatedData.guideId,
        helpful: validatedData.helpful,
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
