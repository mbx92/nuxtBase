import { db } from '../../db'
import { phases } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const projectId = query.projectId as string
    
    if (projectId) {
      const result = await db.select().from(phases)
        .where(eq(phases.projectId, projectId))
        .orderBy(phases.sortOrder)
      return result
    }
    
    const result = await db.select().from(phases).orderBy(desc(phases.createdAt))
    return result
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch phases',
    })
  }
})
