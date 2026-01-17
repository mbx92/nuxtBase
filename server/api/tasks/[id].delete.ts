import { db } from '../../db'
import { tasks } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Task ID is required' })
    }
    
    const [deletedTask] = await db.delete(tasks)
      .where(eq(tasks.id, id))
      .returning()
    
    if (!deletedTask) {
      throw createError({ statusCode: 404, message: 'Task not found' })
    }
    
    return { success: true, message: 'Task deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete task',
    })
  }
})
