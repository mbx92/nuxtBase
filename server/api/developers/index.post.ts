import { db } from '../../db'
import { developers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Generate default password if not provided (email without @domain)
    const defaultPassword = body.password || body.email?.split('@')[0] || 'password123'
    
    const [newDeveloper] = await db.insert(developers).values({
      name: body.name,
      email: body.email,
      password: defaultPassword, // In production, hash this with bcrypt!
      role: body.role,
      skillFocus: body.skillFocus,
      isActive: body.isActive ?? true,
    }).returning()
    
    // Don't return password in response
    const { password, ...developerData } = newDeveloper
    
    return developerData
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create developer',
    })
  }
})
