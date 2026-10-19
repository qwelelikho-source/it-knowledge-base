import { Prisma } from '@prisma/client'

export function prismaCode(error: unknown): string | null {
  return error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null
}
