import { db } from '../../db'
import { phases } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Phase ID is required' })
    }
    
    const [deletedPhase] = await db.delete(phases)
      .where(eq(phases.id, id))
      .returning()
    
    if (!deletedPhase) {
      throw createError({ statusCode: 404, message: 'Phase not found' })
    }
    
    return { success: true, message: 'Phase deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete phase',
    })
  }
})
