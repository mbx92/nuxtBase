import { db } from '../../db'
import { projects, tasks, developers, phases, payments } from '../../db/schema'
import { sql, eq, count, sum } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  try {
    // Get all projects summary
    const allProjects = await db.select().from(projects)
    
    // Get all tasks
    const allTasks = await db.select().from(tasks)
    
    // Get all developers
    const allDevelopers = await db.select().from(developers)
    
    // Get all payments
    const allPayments = await db.select().from(payments)
    
    // Calculate project statistics
    const completedProjects = allProjects.filter(p => p.status === 'completed').length
    const inProgressProjects = allProjects.filter(p => p.status === 'in_progress' || p.status === 'active').length
    const pendingProjects = allProjects.filter(p => p.status === 'pending' || p.status === 'planning').length
    
    // Calculate financial statistics
    const totalBudget = allProjects.reduce((sum, p) => sum + (p.totalBudget || 0), 0)
    const totalPaid = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    
    // Calculate task statistics
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter(t => t.status === 'completed').length
    const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length
    
    // Calculate weight statistics
    const totalWeight = allTasks.reduce((sum, t) => sum + (t.calculatedWeight || 0), 0)
    const completedWeight = allTasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.calculatedWeight || 0), 0)
    
    // Developer statistics
    const activeDevelopers = allDevelopers.filter(d => d.isActive).length
    
    // Recent projects (last 5)
    const recentProjects = allProjects
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        totalBudget: p.totalBudget,
        createdAt: p.createdAt,
      }))

    return {
      summary: {
        totalProjects: allProjects.length,
        completedProjects,
        inProgressProjects,
        pendingProjects,
        totalBudget,
        totalPaid,
        outstandingPayments: totalBudget - totalPaid,
        totalDevelopers: allDevelopers.length,
        activeDevelopers,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalWeight: Math.round(totalWeight * 10) / 10,
        completedWeight: Math.round(completedWeight * 10) / 10,
      },
      recentProjects,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch dashboard summary',
    })
  }
})
