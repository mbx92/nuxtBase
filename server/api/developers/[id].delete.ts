import { db } from '../../db'
import { developers } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Developer ID is required' })
    }
    
    const [deletedDeveloper] = await db.delete(developers)
      .where(eq(developers.id, id))
      .returning()
    
    if (!deletedDeveloper) {
      throw createError({ statusCode: 404, message: 'Developer not found' })
    }
    
    return { success: true, message: 'Developer deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete developer',
    })
  }
})
