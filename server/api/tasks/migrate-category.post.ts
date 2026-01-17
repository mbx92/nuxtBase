import { db } from '../../db'
import { tasks } from '../../db/schema'
import { isNull, or, eq } from 'drizzle-orm'

// One-time migration endpoint to set default category for existing tasks
export default defineEventHandler(async (event) => {
  try {
    // Count tasks without category
    const tasksToUpdate = await db.select()
      .from(tasks)
      .where(or(isNull(tasks.category), eq(tasks.category, '')))
    
    if (tasksToUpdate.length === 0) {
      return { 
        success: true, 
        message: 'All tasks already have categories assigned',
        updated: 0
      }
    }
    
    // Update all tasks with null/empty category to 'backend'
    for (const task of tasksToUpdate) {
      await db.update(tasks)
        .set({ category: 'backend' })
        .where(eq(tasks.id, task.id))
    }
    
    return { 
      success: true, 
      message: `Updated ${tasksToUpdate.length} task(s) to backend category`,
      updated: tasksToUpdate.length
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to migrate task categories',
    })
  }
})
