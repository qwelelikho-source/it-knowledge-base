import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { uniqueGuideSlug } from '@/lib/slug'
import { prismaCode } from '@/lib/prisma-errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateGuideSchema = z.object({
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

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Ctx) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  const guide = await prisma.guide.findUnique({
    where: { id },
    include: { steps: { orderBy: { order: 'asc' } } },
  })

  if (!guide) {
    return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
  }
  return NextResponse.json(guide)
}

export async function PUT(request: Request, { params }: Ctx) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    const data = updateGuideSchema.parse(await request.json())

    const existing = await prisma.guide.findUnique({
      where: { id },
      select: { title: true, slug: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
    }

    // Keep the URL stable unless the title actually changed.
    const slug =
      existing.title === data.title ? existing.slug : await uniqueGuideSlug(data.title, id)

    // One transaction so a failure can never leave a guide without its steps.
    const [, guide] = await prisma.$transaction([
      prisma.step.deleteMany({ where: { guideId: id } }),
      prisma.guide.update({
        where: { id },
        data: {
          title: data.title,
          slug,
          summary: data.summary,
          categoryId: data.categoryId,
          published: data.published,
          steps: {
            create: data.steps.map((s, i) => ({ title: s.title, body: s.body, order: i })),
          },
        },
      }),
    ])

    return NextResponse.json(guide)
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
    console.error('Update guide failed:', error)
    return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    await prisma.guide.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (prismaCode(error) === 'P2025') {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
    }
    console.error('Delete guide failed:', error)
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 })
  }
}
