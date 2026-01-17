import { db } from '../../db'
import { projects, phases, payments } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Project ID is required' })
    }
    
    const [project] = await db.select().from(projects).where(eq(projects.id, id))
    
    if (!project) {
      throw createError({ statusCode: 404, message: 'Project not found' })
    }
    
    // Get phases with tasks
    const projectPhases = await db.select().from(phases).where(eq(phases.projectId, id))
    
    // Get payments
    const projectPayments = await db.select().from(payments).where(eq(payments.projectId, id))
    
    return {
      ...project,
      phases: projectPhases,
      payments: projectPayments,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch project',
    })
  }
})
