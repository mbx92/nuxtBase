import { db } from '../../db'
import { payments } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Payment ID is required' })
    }
    
    const body = await readBody(event)
    
    const [updatedPayment] = await db.update(payments)
      .set({
        type: body.type,
        amount: body.amount,
        percentage: body.percentage,
        description: body.description,
        isPaid: body.isPaid,
        paidAt: body.isPaid ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning()
    
    if (!updatedPayment) {
      throw createError({ statusCode: 404, message: 'Payment not found' })
    }
    
    return updatedPayment
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update payment',
    })
  }
})
