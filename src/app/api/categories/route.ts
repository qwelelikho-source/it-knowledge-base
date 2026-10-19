import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { slugify } from '@/lib/slug'
import { prismaCode } from '@/lib/prisma-errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60, 'Keep the name under 60 characters'),
})

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { guides: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name } = createCategorySchema.parse(await request.json())
    const slug = slugify(name)
    if (!slug) {
      return NextResponse.json(
        { error: 'Use at least one letter or number in the name' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({ data: { name, slug } })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }
    if (prismaCode(error) === 'P2002') {
      return NextResponse.json(
        { error: 'A category with that name already exists' },
        { status: 409 }
      )
    }
    console.error('Create category failed:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
