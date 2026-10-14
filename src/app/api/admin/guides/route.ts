import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [guides, counts] = await Promise.all([
    prisma.guide.findMany({
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.feedback.groupBy({
      by: ['guideId', 'helpful'],
      _count: { _all: true },
    }),
  ])

  const feedbackMap: Record<string, { helpful: number; notHelpful: number }> = {}
  for (const row of counts) {
    const entry = (feedbackMap[row.guideId] ??= { helpful: 0, notHelpful: 0 })
    if (row.helpful) entry.helpful = row._count._all
    else entry.notHelpful = row._count._all
  }

  return NextResponse.json({ guides, feedbackMap })
}
