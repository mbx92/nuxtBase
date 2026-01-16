import { db } from '~/server/db'
import { projects } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Project ID is required' })
    }
    
    const [deletedProject] = await db.delete(projects)
      .where(eq(projects.id, id))
      .returning()
    
    if (!deletedProject) {
      throw createError({ statusCode: 404, message: 'Project not found' })
    }
    
    return { success: true, message: 'Project deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete project',
    })
  }
})
