import { db } from '~/server/db'
import { phases } from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const [newPhase] = await db.insert(phases).values({
      projectId: body.projectId,
      name: body.name,
      description: body.description,
      dayStart: body.dayStart || 1,
      dayEnd: body.dayEnd || 1,
      sortOrder: body.sortOrder || 0,
    }).returning()
    
    return newPhase
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create phase',
    })
  }
})
