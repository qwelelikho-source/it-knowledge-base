import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const guides = await prisma.guide.findMany({
    include: {
      category: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  const helpfulCounts = await Promise.all(
    guides.map(async (guide) => {
      const helpful = await prisma.feedback.count({
        where: { guideId: guide.id, helpful: true },
      })
      const notHelpful = await prisma.feedback.count({
        where: { guideId: guide.id, helpful: false },
      })
      return { guideId: guide.id, helpful, notHelpful }
    })
  )

  const feedbackMap = Object.fromEntries(
    helpfulCounts.map((fc) => [fc.guideId, fc])
  )

  return NextResponse.json({ guides, feedbackMap })
}
