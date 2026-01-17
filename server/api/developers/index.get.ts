import { db } from '../../db'
import { developers } from '../../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const result = await db.select().from(developers).orderBy(desc(developers.createdAt))
    return result
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch developers',
    })
  }
})
