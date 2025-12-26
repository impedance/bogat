import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { BudgetDatabase, DATABASE_NAME } from '~/app/db/client'
import type { CategoryAssignment } from '~/app/types/budget'

beforeAll(() => {
  Dexie.dependencies.indexedDB = indexedDB
  Dexie.dependencies.IDBKeyRange = IDBKeyRange
})

let dbCounter = 0
let openDatabases: BudgetDatabase[] = []

function createTestDb(): BudgetDatabase {
  const dbName = `${DATABASE_NAME}-test-${dbCounter++}`
  const db = new BudgetDatabase(dbName)
  openDatabases.push(db)
  return db
}

async function cleanupDatabases() {
  await Promise.all(
    openDatabases.map(async (db) => {
      try {
        await db.delete()
      } catch {
        db.close()
      }
    })
  )
  openDatabases = []
}

afterEach(async () => {
  await cleanupDatabases()
})

const BASE_TIMESTAMP = '2025-11-18T00:00:00.000Z'

function createAssignment(override: Partial<CategoryAssignment> = {}): CategoryAssignment {
  return {
    id: override.id ?? '2025-12:cat_1',
    month: override.month ?? '2025-12',
    categoryId: override.categoryId ?? 'cat_1',
    assignedMinor: override.assignedMinor ?? 5_000,
    createdAt: override.createdAt ?? BASE_TIMESTAMP,
    updatedAt: override.updatedAt ?? BASE_TIMESTAMP
  }
}

describe('BudgetDatabase v2 migration', () => {
  it('initializes with version 2 and exposes categoryAssignments', async () => {
    const db = createTestDb()
    await db.open()

    expect(db.verno).toBe(2)
    expect(db.categoryAssignments.name).toBe('categoryAssignments')
    expect(db.tables.map((table) => table.name)).toEqual(
      expect.arrayContaining(['accounts', 'categories', 'transactions'])
    )
  })

  it('allows write and read of category assignments', async () => {
    const db = createTestDb()
    await db.open()
    const assignment = createAssignment()

    await db.categoryAssignments.add(assignment)

    const stored = await db.categoryAssignments.get(assignment.id)

    expect(stored).toEqual(assignment)
  })

  it('supports query by month using where().equals()', async () => {
    const db = createTestDb()
    await db.open()
    const assignments = [
      createAssignment({ id: '2025-12:cat_1', categoryId: 'cat_1' }),
      createAssignment({ id: '2025-12:cat_2', categoryId: 'cat_2' }),
      createAssignment({ id: '2025-11:cat_1', categoryId: 'cat_1', month: '2025-11' })
    ]

    await db.categoryAssignments.bulkAdd(assignments)

    const decemberAssignments = await db.categoryAssignments.where('month').equals('2025-12').toArray()

    expect(decemberAssignments).toHaveLength(2)
    expect(decemberAssignments.map((a) => a.id)).toEqual(['2025-12:cat_1', '2025-12:cat_2'])
  })
})
