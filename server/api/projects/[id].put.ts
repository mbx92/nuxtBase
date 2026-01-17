import { db } from '../../db'
import { projects } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Project ID is required' })
    }
    
    const body = await readBody(event)
    
    const [updatedProject] = await db.update(projects)
      .set({
        name: body.name,
        description: body.description,
        totalBudget: body.totalBudget,
        safetyNetPercent: body.safetyNetPercent,
        managementFeePercent: body.managementFeePercent,
        deploymentFee: body.deploymentFee,
        daysDuration: body.daysDuration,
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning()
    
    if (!updatedProject) {
      throw createError({ statusCode: 404, message: 'Project not found' })
    }
    
    return updatedProject
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update project',
    })
  }
})
