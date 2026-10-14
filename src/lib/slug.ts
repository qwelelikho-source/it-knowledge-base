import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slug-client'

export { slugify }

/** A guide slug that does not collide with another guide (appends -2, -3, ...). */
export async function uniqueGuideSlug(title: string, excludeId?: string) {
  const base = slugify(title) || 'guide'
  let candidate = base
  let n = 2
  // Small loop; collisions are rare and the table is small.
  while (
    await prisma.guide.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${n++}`
  }
  return candidate
}
