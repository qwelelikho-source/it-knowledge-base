import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { slugify } from '@/lib/slug'
import { prismaCode } from '@/lib/prisma-errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60, 'Keep the name under 60 characters'),
})

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Ctx) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    const { name } = updateCategorySchema.parse(await request.json())
    const slug = slugify(name)
    if (!slug) {
      return NextResponse.json(
        { error: 'Use at least one letter or number in the name' },
        { status: 400 }
      )
    }

    const category = await prisma.category.update({ where: { id }, data: { name, slug } })
    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }
    const code = prismaCode(error)
    if (code === 'P2002') {
      return NextResponse.json(
        { error: 'A category with that name already exists' },
        { status: 409 }
      )
    }
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    console.error('Update category failed:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    const guideCount = await prisma.guide.count({ where: { categoryId: id } })
    if (guideCount > 0) {
      return NextResponse.json(
        { error: `This category still has ${guideCount} guide${guideCount === 1 ? '' : 's'}. Move or delete them first.` },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (prismaCode(error) === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    console.error('Delete category failed:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
