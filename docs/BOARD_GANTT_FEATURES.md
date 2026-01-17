# Board & Gantt Chart Features

## Overview
Added project management visualization tools (Board & Gantt) and customizable Down Payment (DP) structure for each project.

## New Features

### 1. Kanban Board (`/projects/[id]/board`)
Visual task management with drag-and-drop functionality.

**Features:**
- 4 status columns: To Do, In Progress, Review, Done
- Drag & drop tasks between columns to update status
- Visual badges for:
  - Phase assignment
  - Work category (Backend/Frontend/DevOps)
  - Work weight points
- Real-time status updates via API
- Category-based color coding

**Usage:**
1. Navigate to project detail page
2. Click "Board" button in header
3. Drag tasks between columns to change status
4. Task cards show: name, description, phase, category, and work weight

### 2. Gantt Chart (`/projects/[id]/gantt`)
Timeline visualization for project planning.

**Features:**
- Week-based timeline display
- Visual task bars showing duration
- Color-coded by status:
  - Gray: To Do
  - Blue: In Progress
  - Yellow: Review
  - Green: Done
- Progress indicator overlay (visual percentage)
- Category badges on each task
- Auto-scales to project timeline

**Usage:**
1. Navigate to project detail page
2. Click "Gantt" button in header
3. View task timeline and dependencies
4. Tasks without dates show placeholder

**Note:** Requires tasks to have `startDate` and `endDate` fields for proper visualization.

### 3. Customizable DP Structure

Each project can now have custom payment structure:

**New Fields in Project:**
- `dpPercent` - Down Payment percentage (default: 50%)
- `completionPercent` - Completion payment percentage (default: 40%)
- `bufferPercent` - Buffer/retention percentage (default: 10%)

**Benefits:**
- Different projects can have different payment terms
- DP payment displayed on project cards
- Fee distribution automatically calculated per project's payment structure
- Clear visibility of payment milestones for each developer

**Payment Structure Display:**
Developer fee breakdown now shows:
```
Base Fee: Rp X,XXX,XXX
DP (50%): Rp X,XXX,XXX        [green]
Completion (40%): Rp X,XXX,XXX [blue]
Buffer (10%): Rp X,XXX,XXX     [orange]
```

Percentages are dynamically shown based on project configuration.

## Database Schema Updates

### Projects Table
Added fields:
```typescript
dpPercent: real('dp_percent').notNull().default(50)
completionPercent: real('completion_percent').notNull().default(40)
bufferPercent: real('buffer_percent').notNull().default(10)
```

## API Updates

### `/api/projects` (POST)
Now accepts:
- `dpPercent`
- `completionPercent`
- `bufferPercent`

### `/api/projects/[id]` (PUT)
Now updates:
- `dpPercent`
- `completionPercent`
- `bufferPercent`

### `/api/calculations/fee-distribution` (GET)
Returns project-specific payment structure:
```typescript
{
  project: {
    dpPercent: number,
    completionPercent: number,
    bufferPercent: number,
    // ... other fields
  },
  developers: [
    {
      dpAmount: number,        // calculated as baseFee × (dpPercent/100)
      completionAmount: number, // calculated as baseFee × (completionPercent/100)
      bufferAmount: number      // calculated as baseFee × (bufferPercent/100)
    }
  ]
}
```

## File Structure

```
app/pages/projects/
  [id]/
    board.vue     # Kanban board view
    gantt.vue     # Gantt chart view
  [id].vue        # Updated with Board/Gantt navigation
  index.vue       # Updated with DP fields in form
```

## Navigation

Board and Gantt views are accessible from:
1. Project detail page header (two buttons: "Board" and "Gantt")
2. Direct URL: `/projects/{projectId}/board` or `/projects/{projectId}/gantt`

Both views have "Back" button to return to project detail.

## Usage Examples

### Creating Project with Custom DP
```javascript
{
  name: "E-commerce Platform",
  totalBudget: 50000000,
  dpPercent: 30,           // 30% DP
  completionPercent: 60,   // 60% on completion
  bufferPercent: 10,       // 10% retention
  // ... other fields
}
```

### Viewing Task Status on Board
1. Go to `/projects/{id}/board`
2. See all tasks organized by status
3. Drag task from "To Do" to "In Progress"
4. Status automatically updates in database

### Planning with Gantt Chart
1. Create tasks with start/end dates
2. Go to `/projects/{id}/gantt`
3. View timeline and identify overlaps
4. Adjust task scheduling as needed

## Best Practices

1. **Payment Structure:**
   - Ensure DP + Completion + Buffer = 100%
   - Common structures:
     - Conservative: 50/40/10
     - Aggressive: 30/60/10
     - Balanced: 40/50/10

2. **Board Usage:**
   - Keep "In Progress" column lean (WIP limit)
   - Move to "Review" when code complete
   - Only "Done" when reviewed and merged

3. **Gantt Planning:**
   - Always set realistic start/end dates
   - Leave buffer between dependent tasks
   - Review timeline weekly for adjustments

## Integration with Work Weight System

Both Board and Gantt charts integrate seamlessly with the work weight methodology:
- Each task card shows calculated work weight
- Fee estimates displayed on boards
- Timeline reflects realistic effort distribution
- Category breakdown visible for balanced workload

---

**Created:** January 16, 2026
**Version:** 1.0
