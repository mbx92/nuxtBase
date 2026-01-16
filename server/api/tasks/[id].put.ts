import { db } from '~/server/db'
import { tasks, calculateWorkWeight } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Task ID is required' })
    }
    
    const body = await readBody(event)
    
    // Recalculate work weight if scoring changed
    const k = body.complexity || 1
    const w = body.time || 1
    const r = body.risk || 1
    const d = body.dependency || 1
    const s = body.skill || 1
    
    const weight = calculateWorkWeight(k, w, r, d, s)
    
    const [updatedTask] = await db.update(tasks)
      .set({
        developerId: body.developerId,
        name: body.name,
        description: body.description,
        estimatedHours: body.estimatedHours,
        complexity: k,
        time: w,
        risk: r,
        dependency: d,
        skill: s,
        calculatedWeight: weight,
        status: body.status,
        priority: body.priority,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning()
    
    if (!updatedTask) {
      throw createError({ statusCode: 404, message: 'Task not found' })
    }
    
    return updatedTask
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update task',
    })
  }
})
