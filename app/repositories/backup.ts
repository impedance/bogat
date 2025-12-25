import { getBudgetDb } from '~/app/db/client'
import {
  accountSchema,
  backupSnapshotSchema,
  categorySchema,
  categoryAssignmentSchema,
  transactionSchema,
  BACKUP_SNAPSHOT_VERSION,
  type BackupSnapshot
} from '~/app/types/budget'
import { nowIsoString } from './utils'

const db = getBudgetDb()

export async function createBackupSnapshot(): Promise<BackupSnapshot> {
  const [accounts, categories, transactions, categoryAssignments] = await Promise.all([
    db.accounts.toArray(),
    db.categories.toArray(),
    db.transactions.toArray(),
    db.categoryAssignments.toArray()
  ])

  const snapshot: BackupSnapshot = backupSnapshotSchema.parse({
    version: BACKUP_SNAPSHOT_VERSION,
    exportedAt: nowIsoString(),
    accounts: accounts.map((record) => accountSchema.parse(record)),
    categories: categories.map((record) => categorySchema.parse(record)),
    transactions: transactions.map((record) => transactionSchema.parse(record)),
    categoryAssignments: categoryAssignments.map((record) => categoryAssignmentSchema.parse(record))
  })

  return snapshot
}

// AICODE-CONTRACT: Импорт снапшота полностью заменяет таблицы Dexie, чтобы восстановление точно соответствовало JSON без попытки слияния. [2025-11-18]
export async function importBackupSnapshot(input: unknown): Promise<BackupSnapshot> {
  const snapshot = backupSnapshotSchema.parse(input)

  await db.transaction('rw', db.accounts, db.categories, db.transactions, db.categoryAssignments, async () => {
    await db.accounts.clear()
    await db.categories.clear()
    await db.transactions.clear()
    await db.categoryAssignments.clear()

    if (snapshot.accounts.length) {
      await db.accounts.bulkAdd(snapshot.accounts)
    }

    if (snapshot.categories.length) {
      await db.categories.bulkAdd(snapshot.categories)
    }

    if (snapshot.transactions.length) {
      await db.transactions.bulkAdd(snapshot.transactions)
    }

    if (snapshot.categoryAssignments.length) {
      await db.categoryAssignments.bulkAdd(snapshot.categoryAssignments)
    }
  })

  return snapshot
}
