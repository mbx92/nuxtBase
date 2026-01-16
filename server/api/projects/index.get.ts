import { db } from '~/server/db'
import { projects } from '~/server/db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const result = await db.select().from(projects).orderBy(desc(projects.createdAt))
    return result
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch projects',
    })
  }
})
