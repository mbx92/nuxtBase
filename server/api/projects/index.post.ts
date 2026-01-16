import { db } from '~/server/db'
import { projects } from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const [newProject] = await db.insert(projects).values({
      name: body.name,
      description: body.description,
      totalBudget: body.totalBudget || 0,
      safetyNetPercent: body.safetyNetPercent || 10,
      managementFeePercent: body.managementFeePercent || 10,
      deploymentFee: body.deploymentFee || 0,
      daysDuration: body.daysDuration || 12,
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
