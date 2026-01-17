import { eq, and, sql } from 'drizzle-orm'
import { db } from '../../db'
import { projects, tasks, developers, phases } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const developerId = session.user.id

  // Get developer's tasks
  const developerTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.developerId, developerId))

  // Get all projects that have this developer's tasks
  const projectIds = [...new Set(developerTasks.map(t => {
    // We need to get project ID from phase
    return null // Will be filled by join
  }))]

  // Calculate statistics
  const totalTasks = developerTasks.length
  const completedTasks = developerTasks.filter(t => t.status === 'completed').length
  const inProgressTasks = developerTasks.filter(t => t.status === 'in_progress').length
  const pendingTasks = developerTasks.filter(t => t.status === 'pending').length
  
  const totalWeight = developerTasks.reduce((sum, task) => sum + (task.calculatedWeight || 0), 0)
  const completedWeight = developerTasks
    .filter(t => t.status === 'completed')
    .reduce((sum, task) => sum + (task.calculatedWeight || 0), 0)

  // Get tasks with project info
  const tasksWithProjects = await db
    .select({
      task: tasks,
      phase: phases,
      project: projects,
    })
    .from(tasks)
    .leftJoin(phases, eq(tasks.phaseId, phases.id))
    .leftJoin(projects, eq(phases.projectId, projects.id))
    .where(eq(tasks.developerId, developerId))

  // Calculate estimated earnings per project
  const projectEarnings: Record<string, any> = {}
  
  for (const row of tasksWithProjects) {
    if (!row.project) continue
    
    const projectId = row.project.id
    if (!projectEarnings[projectId]) {
      projectEarnings[projectId] = {
        projectName: row.project.name,
        projectId: projectId,
        totalWeight: 0,
        completedWeight: 0,
        estimatedFee: 0,
        completedFee: 0,
        taskCount: 0,
        completedCount: 0,
      }
    }
    
    const taskWeight = row.task.calculatedWeight || 0
    projectEarnings[projectId].totalWeight += taskWeight
    projectEarnings[projectId].taskCount += 1
    
    if (row.task.status === 'completed') {
      projectEarnings[projectId].completedWeight += taskWeight
      projectEarnings[projectId].completedCount += 1
    }
    
    // Calculate fee (simplified - in real scenario, use fee distribution API)
    const totalBudget = row.project.totalBudget
    const safetyNet = totalBudget * (row.project.safetyNetPercent / 100)
    const managementFee = totalBudget * (row.project.managementFeePercent / 100)
    const deploymentFee = row.project.deploymentFee
    const teamFeePool = totalBudget - safetyNet - managementFee - deploymentFee
    const feePerPoint = teamFeePool / (row.project.estimatedTotalWeight || 1)
    
    projectEarnings[projectId].estimatedFee += taskWeight * feePerPoint
    if (row.task.status === 'completed') {
      projectEarnings[projectId].completedFee += taskWeight * feePerPoint
    }
  }

  // Get recent tasks (last 5)
  const recentTasks = tasksWithProjects
    .sort((a, b) => {
      const dateA = a.task.updatedAt ? new Date(a.task.updatedAt).getTime() : 0
      const dateB = b.task.updatedAt ? new Date(b.task.updatedAt).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 5)
    .map(row => ({
      id: row.task.id,
      name: row.task.name,
      status: row.task.status,
      weight: row.task.calculatedWeight,
      projectName: row.project?.name || 'Unknown',
      phaseName: row.phase?.name || 'Unknown',
      updatedAt: row.task.updatedAt,
    }))

  return {
    developer: session.user,
    stats: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      totalWeight: Math.round(totalWeight * 10) / 10,
      completedWeight: Math.round(completedWeight * 10) / 10,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
    projects: Object.values(projectEarnings),
    recentTasks,
  }
})
