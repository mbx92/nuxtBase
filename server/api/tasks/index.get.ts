import { db } from '~/server/db'
import { tasks, developers, phases } from '~/server/db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const phaseId = query.phaseId as string
    const developerId = query.developerId as string
    const projectId = query.projectId as string
    
    let result
    
    if (phaseId) {
      result = await db.select({
        task: tasks,
        developer: developers,
        phase: phases,
      })
        .from(tasks)
        .leftJoin(developers, eq(tasks.developerId, developers.id))
        .leftJoin(phases, eq(tasks.phaseId, phases.id))
        .where(eq(tasks.phaseId, phaseId))
        .orderBy(desc(tasks.createdAt))
    } else if (developerId) {
      result = await db.select({
        task: tasks,
        developer: developers,
        phase: phases,
      })
        .from(tasks)
        .leftJoin(developers, eq(tasks.developerId, developers.id))
        .leftJoin(phases, eq(tasks.phaseId, phases.id))
        .where(eq(tasks.developerId, developerId))
        .orderBy(desc(tasks.createdAt))
    } else if (projectId) {
      result = await db.select({
        task: tasks,
        developer: developers,
        phase: phases,
      })
        .from(tasks)
        .leftJoin(developers, eq(tasks.developerId, developers.id))
        .innerJoin(phases, eq(tasks.phaseId, phases.id))
        .where(eq(phases.projectId, projectId))
        .orderBy(desc(tasks.createdAt))
    } else {
      result = await db.select({
        task: tasks,
        developer: developers,
        phase: phases,
      })
        .from(tasks)
        .leftJoin(developers, eq(tasks.developerId, developers.id))
        .leftJoin(phases, eq(tasks.phaseId, phases.id))
        .orderBy(desc(tasks.createdAt))
    }
    
    return result.map(r => ({
      ...r.task,
      developer: r.developer,
      phase: r.phase,
    }))
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch tasks',
    })
  }
})
