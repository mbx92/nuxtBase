import { db } from '../../db'
import { projects } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const [newProject] = await db.insert(projects).values({
      name: body.name,
      description: body.description,
      totalBudget: body.totalBudget || 0,
      dpPercent: body.dpPercent || 50,
      completionPercent: body.completionPercent || 40,
      bufferPercent: body.bufferPercent || 10,
      safetyNetPercent: body.safetyNetPercent || 10,
      managementFeePercent: body.managementFeePercent || 10,
      deploymentFee: body.deploymentFee || 0,
      daysDuration: body.daysDuration || 12,
      estimatedTotalWeight: body.estimatedTotalWeight || 327.5,
      status: body.status || 'active',
    }).returning()
    
    return newProject
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create project',
    })
  }
})
