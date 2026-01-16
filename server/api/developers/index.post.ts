import { db } from '~/server/db'
import { developers } from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const [newDeveloper] = await db.insert(developers).values({
      name: body.name,
      email: body.email,
      role: body.role,
      skillFocus: body.skillFocus,
      isActive: body.isActive ?? true,
    }).returning()
    
    return newDeveloper
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create developer',
    })
  }
})
