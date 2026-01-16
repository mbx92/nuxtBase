import { db } from '~/server/db'
import { payments } from '~/server/db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const projectId = query.projectId as string
    const developerId = query.developerId as string
    
    let result
    
    if (projectId && developerId) {
      result = await db.select().from(payments)
        .where(eq(payments.projectId, projectId))
        .orderBy(desc(payments.createdAt))
    } else if (projectId) {
      result = await db.select().from(payments)
        .where(eq(payments.projectId, projectId))
        .orderBy(desc(payments.createdAt))
    } else if (developerId) {
      result = await db.select().from(payments)
        .where(eq(payments.developerId, developerId))
        .orderBy(desc(payments.createdAt))
    } else {
      result = await db.select().from(payments)
        .orderBy(desc(payments.createdAt))
    }
    
    return result
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch payments',
    })
  }
})
