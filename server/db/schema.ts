import { pgTable, text, integer, real, timestamp, boolean, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  totalBudget: real('total_budget').notNull().default(0),
  safetyNetPercent: real('safety_net_percent').notNull().default(10),
  managementFeePercent: real('management_fee_percent').notNull().default(10),
  deploymentFee: real('deployment_fee').notNull().default(0),
  daysDuration: integer('days_duration').notNull().default(12),
  status: text('status').notNull().default('active'), // active, completed, cancelled
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Developers table
export const developers = pgTable('developers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email'),
  role: text('role'), // e.g., "Auth Lead", "Core APIs", "Billing + Frontend"
  skillFocus: text('skill_focus'), // e.g., "Prisma, JWT, Security"
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Phases table
export const phases = pgTable('phases', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  dayStart: integer('day_start').notNull().default(1),
  dayEnd: integer('day_end').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Tasks table with Work Weight scoring
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  phaseId: uuid('phase_id').notNull().references(() => phases.id, { onDelete: 'cascade' }),
  developerId: uuid('developer_id').references(() => developers.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  estimatedHours: real('estimated_hours'),
  
  // Work Weight Scoring (5 dimensions, scale 1-5)
  complexity: integer('complexity').notNull().default(1), // K - Kompleksitas
  time: integer('time').notNull().default(1),             // W - Waktu
  risk: integer('risk').notNull().default(1),             // R - Risiko
  dependency: integer('dependency').notNull().default(1), // D - Dependensi
  skill: integer('skill').notNull().default(1),           // S - Skill Required
  
  // Calculated weight: (K×2) + (W×1.5) + (R×1.5) + (D×1) + (S×1)
  calculatedWeight: real('calculated_weight').notNull().default(0),
  
  status: text('status').notNull().default('pending'), // pending, in_progress, completed
  priority: text('priority').notNull().default('medium'), // low, medium, high
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Payments table for tracking fee distribution
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  developerId: uuid('developer_id').references(() => developers.id, { onDelete: 'set null' }),
  type: text('type').notNull(), // 'DP', 'COMPLETION', 'BUFFER', 'MANAGEMENT', 'DEPLOYMENT'
  amount: real('amount').notNull().default(0),
  percentage: real('percentage'), // Percentage of total if applicable
  description: text('description'),
  isPaid: boolean('is_paid').notNull().default(false),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  phases: many(phases),
  payments: many(payments),
}))

export const developersRelations = relations(developers, ({ many }) => ({
  tasks: many(tasks),
  payments: many(payments),
}))

export const phasesRelations = relations(phases, ({ one, many }) => ({
  project: one(projects, {
    fields: [phases.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  phase: one(phases, {
    fields: [tasks.phaseId],
    references: [phases.id],
  }),
  developer: one(developers, {
    fields: [tasks.developerId],
    references: [developers.id],
  }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  project: one(projects, {
    fields: [payments.projectId],
    references: [projects.id],
  }),
  developer: one(developers, {
    fields: [payments.developerId],
    references: [developers.id],
  }),
}))

// Work Weight calculation helper
export function calculateWorkWeight(k: number, w: number, r: number, d: number, s: number): number {
  return (k * 2) + (w * 1.5) + (r * 1.5) + (d * 1) + (s * 1)
}

// Types export
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Developer = typeof developers.$inferSelect
export type NewDeveloper = typeof developers.$inferInsert
export type Phase = typeof phases.$inferSelect
export type NewPhase = typeof phases.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
