import { db } from '../../db'
import { phases } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Phase ID is required' })
    }
    
    const body = await readBody(event)
    
    const [updatedPhase] = await db.update(phases)
      .set({
        name: body.name,
        description: body.description,
        dayStart: body.dayStart,
        dayEnd: body.dayEnd,
        sortOrder: body.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(phases.id, id))
      .returning()
    
    if (!updatedPhase) {
      throw createError({ statusCode: 404, message: 'Phase not found' })
    }
    
    return updatedPhase
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update phase',
    })
  }
})
