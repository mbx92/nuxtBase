import { db } from '../../db'
import { tasks, calculateWorkWeight } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    console.log('📝 Creating task with dates:', {
      startDate: body.startDate,
      endDate: body.endDate,
      startDateType: typeof body.startDate,
      endDateType: typeof body.endDate
    })
    
    // Calculate work weight based on 5 dimensions
    const k = body.complexity || 1  // Kompleksitas
    const w = body.time || 1        // Waktu
    const r = body.risk || 1        // Risiko
    const d = body.dependency || 1  // Dependensi
    const s = body.skill || 1       // Skill Required
    
    const weight = calculateWorkWeight(k, w, r, d, s)
    
    const [newTask] = await db.insert(tasks).values({
      phaseId: body.phaseId,
      developerId: body.developerId || null,
      category: body.category || 'backend',
      name: body.name,
      description: body.description,
      estimatedHours: body.estimatedHours,
      complexity: k,
      time: w,
      risk: r,
      dependency: d,
      skill: s,
      calculatedWeight: weight,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    }).returning()
    
    return newTask
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create task',
    })
  }
})
