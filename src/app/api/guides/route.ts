import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { uniqueGuideSlug } from '@/lib/slug'
import { prismaCode } from '@/lib/prisma-errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createGuideSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  summary: z.string().trim().min(1, 'Summary is required'),
  categoryId: z.string().min(1, 'Choose a category'),
  published: z.boolean(),
  steps: z
    .array(
      z.object({
        title: z.string().trim().min(1, 'Every step needs a title'),
        body: z.string().trim().min(1, 'Every step needs instructions'),
        order: z.number(),
      })
    )
    .min(1, 'Add at least one step'),
})

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = createGuideSchema.parse(await request.json())
    const slug = await uniqueGuideSlug(data.title)

    const guide = await prisma.guide.create({
      data: {
        title: data.title,
        slug,
        summary: data.summary,
        categoryId: data.categoryId,
        published: data.published,
        steps: { create: data.steps },
      },
    })

    return NextResponse.json(guide, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }
    if (prismaCode(error) === 'P2003') {
      return NextResponse.json({ error: 'That category no longer exists' }, { status: 400 })
    }
    console.error('Create guide failed:', error)
    return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 })
  }
}
