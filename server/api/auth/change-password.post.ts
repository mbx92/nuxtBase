import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { developers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const body = await readBody(event)
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    throw createError({
      statusCode: 400,
      message: 'Current password and new password are required',
    })
  }

  if (newPassword.length < 4) {
    throw createError({
      statusCode: 400,
      message: 'New password must be at least 4 characters',
    })
  }

  try {
    // Get current user
    const developer = await db
      .select()
      .from(developers)
      .where(eq(developers.id, session.user.id))
      .limit(1)
      .then(rows => rows[0])

    if (!developer) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    // Verify current password (plain text for demo - use bcrypt in production)
    if (developer.password !== currentPassword) {
      throw createError({
        statusCode: 400,
        message: 'Current password is incorrect',
      })
    }

    // Update password
    await db
      .update(developers)
      .set({ 
        password: newPassword, // In production, hash this with bcrypt!
        updatedAt: new Date(),
      })
      .where(eq(developers.id, session.user.id))

    return {
      success: true,
      message: 'Password changed successfully',
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to change password',
    })
  }
})
