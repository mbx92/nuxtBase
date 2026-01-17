import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { developers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required',
    })
  }

  // Find developer by email
  const developer = await db
    .select()
    .from(developers)
    .where(eq(developers.email, email))
    .limit(1)
    .then(rows => rows[0])

  if (!developer) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password',
    })
  }

  if (!developer.isActive) {
    throw createError({
      statusCode: 403,
      message: 'Account is inactive',
    })
  }

  // Simple password check (in production, use bcrypt or similar)
  // For now, we'll compare plain text (NOT SECURE - just for demo)
  if (developer.password !== password) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password',
    })
  }

  // Set session
  await setUserSession(event, {
    user: {
      id: developer.id,
      name: developer.name,
      email: developer.email,
      role: developer.role,
    },
  })

  return {
    success: true,
    user: {
      id: developer.id,
      name: developer.name,
      email: developer.email,
      role: developer.role,
      skillFocus: developer.skillFocus,
    },
  }
})
