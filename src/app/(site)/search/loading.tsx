import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading results">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-80 max-w-full" />
      <Skeleton className="mt-6 h-14 max-w-2xl rounded-xl" />
      <div className="mt-5 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="space-y-3 rounded-xl p-5">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </Card>
        ))}
      </div>
    </div>
  )
}
