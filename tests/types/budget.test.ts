import { describe, expect, it } from 'vitest'

import {
  BACKUP_SNAPSHOT_VERSION,
  backupSnapshotSchema,
  categoryAssignmentSchema,
  monthKeySchema
} from '~/app/types/budget'

const BASE_TIMESTAMP = '2025-11-18T00:00:00.000Z'

const BASE_ACCOUNT = {
  id: 'account-1',
  name: 'Cash',
  type: 'cash',
  currency: 'RUB',
  archived: false,
  createdAt: BASE_TIMESTAMP,
  updatedAt: BASE_TIMESTAMP
}

const BASE_CATEGORY = {
  id: 'category-1',
  name: 'Food',
  type: 'expense',
  isDefault: false,
  archived: false,
  createdAt: BASE_TIMESTAMP,
  updatedAt: BASE_TIMESTAMP
}

const BASE_TRANSACTION = {
  id: 'transaction-1',
  accountId: 'account-1',
  categoryId: 'category-1',
  type: 'expense',
  amountMinor: 1500,
  date: '2025-12-01',
  createdAt: BASE_TIMESTAMP,
  updatedAt: BASE_TIMESTAMP
}

describe('monthKeySchema', () => {
  it('accepts valid YYYY-MM values', () => {
    expect(monthKeySchema.parse('2025-12')).toBe('2025-12')
  })

  it('rejects invalid month formats and ranges', () => {
    expect(() => monthKeySchema.parse('2025-1')).toThrowError()
    expect(() => monthKeySchema.parse('2025-13')).toThrowError()
  })
})

describe('categoryAssignmentSchema', () => {
  it('rejects negative assignments', () => {
    expect(() =>
      categoryAssignmentSchema.parse({
        id: '2025-12:category-1',
        month: '2025-12',
        categoryId: 'category-1',
        assignedMinor: -1,
        createdAt: BASE_TIMESTAMP,
        updatedAt: BASE_TIMESTAMP
      })
    ).toThrowError()
  })

  it('rejects invalid month keys', () => {
    expect(() =>
      categoryAssignmentSchema.parse({
        id: '2025-13:category-1',
        month: '2025-13',
        categoryId: 'category-1',
        assignedMinor: 0,
        createdAt: BASE_TIMESTAMP,
        updatedAt: BASE_TIMESTAMP
      })
    ).toThrowError()
  })
})

describe('backupSnapshotSchema', () => {
  it('rejects version 1 snapshots', () => {
    expect(() =>
      backupSnapshotSchema.parse({
        version: 1,
        exportedAt: BASE_TIMESTAMP,
        accounts: [BASE_ACCOUNT],
        categories: [BASE_CATEGORY],
        transactions: [BASE_TRANSACTION],
        categoryAssignments: []
      })
    ).toThrowError()
  })

  it('accepts version 2 snapshots with empty assignments', () => {
    const snapshot = backupSnapshotSchema.parse({
      version: BACKUP_SNAPSHOT_VERSION,
      exportedAt: BASE_TIMESTAMP,
      accounts: [BASE_ACCOUNT],
      categories: [BASE_CATEGORY],
      transactions: [BASE_TRANSACTION],
      categoryAssignments: []
    })

    expect(snapshot.categoryAssignments).toEqual([])
  })
})
