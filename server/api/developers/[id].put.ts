import { db } from '../../db'
import { developers } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Developer ID is required' })
    }
    
    const body = await readBody(event)
    
    const updateData: any = {
      name: body.name,
      email: body.email,
      role: body.role,
      skillFocus: body.skillFocus,
      isActive: body.isActive,
      updatedAt: new Date(),
    }
    
    // Only update password if provided
    if (body.password) {
      updateData.password = body.password // In production, hash this!
    }
    
    const [updatedDeveloper] = await db.update(developers)
      .set(updateData)
      .where(eq(developers.id, id))
      .returning()
    
    if (!updatedDeveloper) {
      throw createError({ statusCode: 404, message: 'Developer not found' })
    }
    
    // Don't return password in response
    const { password, ...developerData } = updatedDeveloper
    
    return developerData
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update developer',
    })
  }
})
