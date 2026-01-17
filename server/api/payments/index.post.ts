import { db } from '../../db'
import { payments } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const [newPayment] = await db.insert(payments).values({
      projectId: body.projectId,
      developerId: body.developerId || null,
      type: body.type, // 'DP', 'COMPLETION', 'BUFFER', 'MANAGEMENT', 'DEPLOYMENT'
      amount: body.amount || 0,
      percentage: body.percentage,
      description: body.description,
      isPaid: body.isPaid || false,
      paidAt: body.isPaid ? new Date() : null,
    }).returning()
    
    return newPayment
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create payment',
    })
  }
})
