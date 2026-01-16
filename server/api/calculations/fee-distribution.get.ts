import { db } from '~/server/db'
import { projects, tasks, developers, phases } from '~/server/db/schema'
import { eq, sum } from 'drizzle-orm'

interface DeveloperFee {
  developerId: string
  developerName: string
  totalWeight: number
  percentage: number
  baseFee: number
  dpAmount: number        // 50%
  completionAmount: number // 40%
  bufferAmount: number    // 10% or based on safetyNet
}

interface FeeDistribution {
  project: {
    id: string
    name: string
    totalBudget: number
    safetyNetPercent: number
    managementFeePercent: number
    deploymentFee: number
  }
  breakdown: {
    totalBudget: number
    safetyNetAmount: number
    managementFeeAmount: number
    deploymentFeeAmount: number
    teamFeePool: number
  }
  developers: DeveloperFee[]
  totalWeight: number
}

export default defineEventHandler(async (event): Promise<FeeDistribution> => {
  try {
    const query = getQuery(event)
    const projectId = query.projectId as string
    
    if (!projectId) {
      throw createError({ statusCode: 400, message: 'Project ID is required' })
    }
    
    // Get project
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId))
    
    if (!project) {
      throw createError({ statusCode: 404, message: 'Project not found' })
    }
    
    // Get all tasks for this project with developer info
    const projectTasks = await db.select({
      task: tasks,
      developer: developers,
    })
      .from(tasks)
      .innerJoin(phases, eq(tasks.phaseId, phases.id))
      .leftJoin(developers, eq(tasks.developerId, developers.id))
      .where(eq(phases.projectId, projectId))
    
    // Calculate totals
    const totalBudget = project.totalBudget
    const safetyNetAmount = totalBudget * (project.safetyNetPercent / 100)
    const managementFeeAmount = (totalBudget - safetyNetAmount) * (project.managementFeePercent / 100)
    const deploymentFeeAmount = project.deploymentFee
    const teamFeePool = totalBudget - safetyNetAmount - managementFeeAmount - deploymentFeeAmount
    
    // Group tasks by developer and sum weights
    const developerWeights = new Map<string, { name: string, weight: number }>()
    let totalWeight = 0
    
    for (const row of projectTasks) {
      const devId = row.developer?.id || 'unassigned'
      const devName = row.developer?.name || 'Unassigned'
      const weight = row.task.calculatedWeight || 0
      
      if (developerWeights.has(devId)) {
        developerWeights.get(devId)!.weight += weight
      } else {
        developerWeights.set(devId, { name: devName, weight })
      }
      totalWeight += weight
    }
    
    // Calculate fee distribution per developer
    const developerFees: DeveloperFee[] = []
    
    for (const [devId, data] of developerWeights) {
      const percentage = totalWeight > 0 ? (data.weight / totalWeight) * 100 : 0
      const baseFee = teamFeePool * (percentage / 100)
      
      developerFees.push({
        developerId: devId,
        developerName: data.name,
        totalWeight: data.weight,
        percentage: Math.round(percentage * 10) / 10,
        baseFee: Math.round(baseFee),
        dpAmount: Math.round(baseFee * 0.5),
        completionAmount: Math.round(baseFee * 0.4),
        bufferAmount: Math.round(baseFee * 0.1),
      })
    }
    
    // Sort by weight descending
    developerFees.sort((a, b) => b.totalWeight - a.totalWeight)
    
    return {
      project: {
        id: project.id,
        name: project.name,
        totalBudget: project.totalBudget,
        safetyNetPercent: project.safetyNetPercent,
        managementFeePercent: project.managementFeePercent,
        deploymentFee: project.deploymentFee,
      },
      breakdown: {
        totalBudget,
        safetyNetAmount: Math.round(safetyNetAmount),
        managementFeeAmount: Math.round(managementFeeAmount),
        deploymentFeeAmount: Math.round(deploymentFeeAmount),
        teamFeePool: Math.round(teamFeePool),
      },
      developers: developerFees,
      totalWeight,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to calculate fee distribution',
    })
  }
})
