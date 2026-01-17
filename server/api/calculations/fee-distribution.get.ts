import { db } from '../../db'
import { projects, tasks, developers, phases } from '../../db/schema'
import { eq, sum } from 'drizzle-orm'

interface DeveloperFee {
  developerId: string
  developerName: string
  totalWeight: number
  percentage: number
  baseFee: number
  dpAmount: number
  completionAmount: number
  bufferAmount: number
}

interface FeeDistribution {
  project: {
    id: string
    name: string
    totalBudget: number
    dpPercent: number
    completionPercent: number
    bufferPercent: number
    safetyNetPercent: number
    managementFeePercent: number
    deploymentFee: number
    estimatedTotalWeight: number
  }
  breakdown: {
    totalBudget: number
    safetyNetAmount: number
    managementFeeAmount: number
    deploymentFeeAmount: number
    teamFeePool: number
    feePerPoint: number
  }
  developers: DeveloperFee[]
  totalWeight: number
  estimatedTotalWeight: number
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
    
    // Use estimated total weight from project for consistent fee per point
    const estimatedTotalWeight = project.estimatedTotalWeight || 327.5
    const feePerPoint = teamFeePool / estimatedTotalWeight
    
    for (const [devId, data] of developerWeights) {
      // Calculate fee based on weight × fee per point (linear)
      const baseFee = data.weight * feePerPoint
      const percentage = estimatedTotalWeight > 0 ? (data.weight / estimatedTotalWeight) * 100 : 0
      
      // Use project-specific payment structure
      const dpPercent = project.dpPercent || 50
      const completionPercent = project.completionPercent || 40
      const bufferPercent = project.bufferPercent || 10
      
      developerFees.push({
        developerId: devId,
        developerName: data.name,
        totalWeight: data.weight,
        percentage: Math.round(percentage * 10) / 10,
        baseFee: Math.round(baseFee),
        dpAmount: Math.round(baseFee * (dpPercent / 100)),
        completionAmount: Math.round(baseFee * (completionPercent / 100)),
        bufferAmount: Math.round(baseFee * (bufferPercent / 100)),
      })
    }
    
    // Sort by weight descending
    developerFees.sort((a, b) => b.totalWeight - a.totalWeight)
    
    return {
      project: {
        id: project.id,
        name: project.name,
        totalBudget: project.totalBudget,
        dpPercent: project.dpPercent || 50,
        completionPercent: project.completionPercent || 40,
        bufferPercent: project.bufferPercent || 10,
        safetyNetPercent: project.safetyNetPercent,
        managementFeePercent: project.managementFeePercent,
        deploymentFee: project.deploymentFee,
        estimatedTotalWeight: project.estimatedTotalWeight || 327.5,
      },
      breakdown: {
        totalBudget,
        safetyNetAmount: Math.round(safetyNetAmount),
        managementFeeAmount: Math.round(managementFeeAmount),
        deploymentFeeAmount: Math.round(deploymentFeeAmount),
        teamFeePool: Math.round(teamFeePool),
        feePerPoint: Math.round(feePerPoint * 100) / 100,
      },
      developers: developerFees,
      totalWeight,
      estimatedTotalWeight: project.estimatedTotalWeight || 327.5,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to calculate fee distribution',
    })
  }
})
