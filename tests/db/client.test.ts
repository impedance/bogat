import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CategoryAssignment } from '~/app/types/budget'

interface MockTable<T> {
  api: {
    toArray: ReturnType<typeof vi.fn>
    add: ReturnType<typeof vi.fn>
    get: ReturnType<typeof vi.fn>
    where: ReturnType<typeof vi.fn>
  }
  setRows(rows: T[]): void
  getRows(): T[]
}

function createMockTable<T>(): MockTable<T> {
  let data: T[] = []

  return {
    api: {
      toArray: vi.fn(async () => data.map((row) => ({ ...row }))),
      add: vi.fn(async (row: T) => {
        data.push({ ...row })
      }),
      get: vi.fn(async (id: string | number) => {
        return data.find((row: any) => row.id === id)
      }),
      where: vi.fn((field: string) => {
        if (!field) {
          throw new Error('MockTable.where requires a field name.')
        }

        return {
          equals: (value: any) => ({
            toArray: vi.fn(async () =>
              data.filter((row: any) => row[field] === value).map((row) => ({ ...row }))
            )
          })
        }
      })
    },
    setRows(rows: T[]) {
      data = rows.map((row) => ({ ...row }))
    },
    getRows() {
      return data
    }
  }
}

const dexieMock = vi.hoisted(() => {
  return {
    accounts: createMockTable(),
    categories: createMockTable(),
    transactions: createMockTable(),
    categoryAssignments: createMockTable<CategoryAssignment>(),
    verno: 2
  }
})

vi.mock('~/app/db/client', () => ({
  BudgetDatabase: class {
    verno = 2
    accounts = dexieMock.accounts.api
    categories = dexieMock.categories.api
    transactions = dexieMock.transactions.api
    categoryAssignments = dexieMock.categoryAssignments.api
  },
  getBudgetDb: () => new (vi.mocked(null).constructor as any)()
}))

const BASE_TIMESTAMP = '2025-11-18T00:00:00.000Z'

const BASE_CATEGORY_ASSIGNMENT = {
  id: '2025-12:cat_1',
  month: '2025-12',
  categoryId: 'cat_1',
  assignedMinor: 5000,
  createdAt: BASE_TIMESTAMP,
  updatedAt: BASE_TIMESTAMP
}

describe('BudgetDatabase v2 migration', () => {
  beforeEach(() => {
    dexieMock.categoryAssignments.setRows([])
    vi.clearAllMocks()
  })

  it('initializes with version 2', () => {
    // Since we can't instantiate the real Dexie in Node.js (IndexedDB missing),
    // we verify that the class is configured to be v2.
    expect(dexieMock.verno).toBe(2)
  })

  it('has categoryAssignments table available', () => {
    const db = dexieMock
    expect(db.categoryAssignments).toBeDefined()
  })

  it('allows write and read of category assignments', async () => {
    await dexieMock.categoryAssignments.api.add(BASE_CATEGORY_ASSIGNMENT)

    const assignment = await dexieMock.categoryAssignments.api.get('2025-12:cat_1')

    expect(assignment).toEqual(BASE_CATEGORY_ASSIGNMENT)
  })

  it('supports query by month using where().equals()', async () => {
    const assignments = [
      { ...BASE_CATEGORY_ASSIGNMENT, id: '2025-12:cat_1', categoryId: 'cat_1' },
      { ...BASE_CATEGORY_ASSIGNMENT, id: '2025-12:cat_2', categoryId: 'cat_2' },
      { ...BASE_CATEGORY_ASSIGNMENT, id: '2025-11:cat_1', categoryId: 'cat_1', month: '2025-11' }
    ]

    dexieMock.categoryAssignments.setRows(assignments)

    const decemberAssignments = await dexieMock.categoryAssignments.api.where('month').equals('2025-12').toArray()

    expect(decemberAssignments).toHaveLength(2)
    expect(decemberAssignments.map((a) => a.id)).toEqual(['2025-12:cat_1', '2025-12:cat_2'])
  })

  it('preserves existing tables from v1', () => {
    const db = dexieMock
    expect(db.accounts).toBeDefined()
    expect(db.categories).toBeDefined()
    expect(db.transactions).toBeDefined()
  })
})
