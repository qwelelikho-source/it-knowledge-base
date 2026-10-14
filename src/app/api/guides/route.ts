import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createGuideSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  categoryId: z.string().min(1),
  published: z.boolean(),
  steps: z.array(
    z.object({
      title: z.string().min(1),
      body: z.string().min(1),
      order: z.number(),
    })
  ),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = createGuideSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const guide = await prisma.guide.create({
      data: {
        title: validatedData.title,
        slug,
        summary: validatedData.summary,
        categoryId: validatedData.categoryId,
        published: validatedData.published,
        steps: {
          create: validatedData.steps,
        },
      },
    })

    return NextResponse.json(guide)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 })
  }
}
