import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  BACKUP_SNAPSHOT_VERSION,
  type Account,
  type Category,
  type CategoryAssignment,
  type Transaction
} from '~/app/types/budget'
import { createBackupSnapshot, importBackupSnapshot } from '~/app/repositories/backup'

interface MockTable<T> {
  api: {
    toArray: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
    bulkAdd: ReturnType<typeof vi.fn>
  }
  setRows(rows: T[]): void
  getRows(): T[]
}

function createMockTable<T>(): MockTable<T> {
  let data: T[] = []

  return {
    api: {
      toArray: vi.fn(async () => data.map((row) => ({ ...row }))),
      clear: vi.fn(async () => {
        data = []
      }),
      bulkAdd: vi.fn(async (rows: T[]) => {
        data = [...data, ...rows.map((row) => ({ ...row }))]
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
    accounts: createMockTable<Account>(),
    categories: createMockTable<Category>(),
    transactions: createMockTable<Transaction>(),
    categoryAssignments: createMockTable<CategoryAssignment>(),
    transaction: vi.fn(async (...args: any[]) => {
      const callback = args[args.length - 1]
      await callback()
    })
  }
})

vi.mock('~/app/db/client', () => ({
  getBudgetDb: () => ({
    accounts: dexieMock.accounts.api,
    categories: dexieMock.categories.api,
    transactions: dexieMock.transactions.api,
    categoryAssignments: dexieMock.categoryAssignments.api,
    transaction: dexieMock.transaction
  })
}))

const BASE_TIMESTAMP = '2025-11-18T00:00:00.000Z'

function createAccount(override: Partial<Account> = {}): Account {
  return {
    id: override.id ?? 'account-1',
    name: override.name ?? 'Наличные',
    type: override.type ?? 'cash',
    currency: 'RUB',
    archived: override.archived ?? false,
    createdAt: override.createdAt ?? BASE_TIMESTAMP,
    updatedAt: override.updatedAt ?? BASE_TIMESTAMP
  }
}

function createCategory(override: Partial<Category> = {}): Category {
  return {
    id: override.id ?? 'category-1',
    name: override.name ?? 'Еда',
    type: override.type ?? 'expense',
    isDefault: override.isDefault ?? false,
    archived: override.archived ?? false,
    createdAt: override.createdAt ?? BASE_TIMESTAMP,
    updatedAt: override.updatedAt ?? BASE_TIMESTAMP
  }
}

function createTransaction(override: Partial<Transaction> = {}): Transaction {
  return {
    id: override.id ?? 'transaction-1',
    accountId: override.accountId ?? 'account-1',
    categoryId: override.categoryId ?? 'category-1',
    type: override.type ?? 'expense',
    amountMinor: override.amountMinor ?? 1_500,
    note: override.note ?? 'Обед',
    date: override.date ?? '2025-11-18',
    createdAt: override.createdAt ?? BASE_TIMESTAMP,
    updatedAt: override.updatedAt ?? BASE_TIMESTAMP
  }
}

function createCategoryAssignment(override: Partial<CategoryAssignment> = {}): CategoryAssignment {
  return {
    id: override.id ?? '2025-12:category-1',
    month: override.month ?? '2025-12',
    categoryId: override.categoryId ?? 'category-1',
    assignedMinor: override.assignedMinor ?? 5_000,
    createdAt: override.createdAt ?? BASE_TIMESTAMP,
    updatedAt: override.updatedAt ?? BASE_TIMESTAMP
  }
}

describe('backup repository', () => {
  beforeEach(() => {
    dexieMock.accounts.setRows([])
    dexieMock.categories.setRows([])
    dexieMock.transactions.setRows([])
    dexieMock.categoryAssignments.setRows([])
    vi.clearAllMocks()
  })

  it('creates a sanitized snapshot from Dexie tables', async () => {
    const account = createAccount()
    const category = createCategory()
    const transaction = createTransaction()
    dexieMock.accounts.setRows([account])
    dexieMock.categories.setRows([category])
    dexieMock.transactions.setRows([transaction])

    const snapshot = await createBackupSnapshot()

    expect(snapshot.version).toBe(BACKUP_SNAPSHOT_VERSION)
    expect(new Date(snapshot.exportedAt).toString()).not.toBe('Invalid Date')
    expect(snapshot.accounts).toEqual([account])
    expect(snapshot.categories).toEqual([category])
    expect(snapshot.transactions).toEqual([transaction])
    expect(snapshot.categoryAssignments).toEqual([])
  })

  it('includes categoryAssignments in snapshot when present', async () => {
    const account = createAccount()
    const category = createCategory()
    const assignment = createCategoryAssignment()
    dexieMock.accounts.setRows([account])
    dexieMock.categories.setRows([category])
    dexieMock.categoryAssignments.setRows([assignment])

    const snapshot = await createBackupSnapshot()

    expect(snapshot.categoryAssignments).toEqual([assignment])
  })

  it('replaces Dexie data when importing a snapshot', async () => {
    dexieMock.accounts.setRows([createAccount({ id: 'stale-account' })])
    dexieMock.categories.setRows([createCategory({ id: 'stale-category' })])
    dexieMock.transactions.setRows([createTransaction({ id: 'stale-transaction' })])
    dexieMock.categoryAssignments.setRows([createCategoryAssignment({ id: '2025-11:stale' })])

    const snapshotData = {
      version: BACKUP_SNAPSHOT_VERSION,
      exportedAt: '2025-11-18T12:00:00.000Z',
      accounts: [createAccount({ id: 'new-account', name: 'Депозит' })],
      categories: [createCategory({ id: 'new-category', name: 'Подарки' })],
      transactions: [createTransaction({ id: 'new-transaction', note: 'Gift' })],
      categoryAssignments: []
    }

    await importBackupSnapshot(snapshotData)

    expect(dexieMock.accounts.api.clear).toHaveBeenCalledTimes(1)
    expect(dexieMock.categories.api.clear).toHaveBeenCalledTimes(1)
    expect(dexieMock.transactions.api.clear).toHaveBeenCalledTimes(1)
    expect(dexieMock.categoryAssignments.api.clear).toHaveBeenCalledTimes(1)
    expect(dexieMock.accounts.getRows()).toEqual(snapshotData.accounts)
    expect(dexieMock.categories.getRows()).toEqual(snapshotData.categories)
    expect(dexieMock.transactions.getRows()).toEqual(snapshotData.transactions)
    expect(dexieMock.categoryAssignments.getRows()).toEqual([])
  })

  it('restores categoryAssignments along with other entities', async () => {
    const snapshotData = {
      version: BACKUP_SNAPSHOT_VERSION,
      exportedAt: '2025-12-25T12:00:00.000Z',
      accounts: [createAccount()],
      categories: [createCategory()],
      transactions: [createTransaction()],
      categoryAssignments: [
        createCategoryAssignment({ id: '2025-12:category-1', assignedMinor: 10_000 }),
        createCategoryAssignment({ id: '2025-12:category-2', categoryId: 'category-2', assignedMinor: 5_000 })
      ]
    }

    await importBackupSnapshot(snapshotData)

    expect(dexieMock.categoryAssignments.getRows()).toEqual(snapshotData.categoryAssignments)
  })

  it('validates snapshot shape before writing to Dexie', async () => {
    await expect(
      importBackupSnapshot({
        version: 999,
        exportedAt: 'invalid'
      })
    ).rejects.toThrowError()
  })

  it('rejects import of version 1 snapshots (v2-only strategy)', async () => {
    const v1Snapshot = {
      version: 1,
      exportedAt: '2025-12-25T12:00:00.000Z',
      accounts: [createAccount()],
      categories: [createCategory()],
      transactions: [createTransaction()]
    }

    await expect(
      importBackupSnapshot(v1Snapshot)
    ).rejects.toThrowError()
  })
})
