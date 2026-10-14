import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateGuideSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  categoryId: z.string().min(1),
  published: z.boolean(),
  steps: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1),
      body: z.string().min(1),
      order: z.number(),
    })
  ),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const guide = await prisma.guide.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!guide) {
    return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
  }

  return NextResponse.json(guide)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateGuideSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Delete existing steps
    await prisma.step.deleteMany({
      where: { guideId: id },
    })

    // Update guide and create new steps
    const guide = await prisma.guide.update({
      where: { id },
      data: {
        title: validatedData.title,
        slug,
        summary: validatedData.summary,
        categoryId: validatedData.categoryId,
        published: validatedData.published,
        steps: {
          create: validatedData.steps.map((s) => ({
            title: s.title,
            body: s.body,
            order: s.order,
          })),
        },
      },
    })

    return NextResponse.json(guide)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.guide.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 })
  }
}
