import Dexie, { type Table } from 'dexie'

import type { Account, Category, Transaction, CategoryAssignment } from '~/app/types/budget'
import { seedDefaults } from './seed'

export const DATABASE_NAME = 'ynab-lite'

export class BudgetDatabase extends Dexie {
  accounts!: Table<Account>
  categories!: Table<Category>
  transactions!: Table<Transaction>
  categoryAssignments!: Table<CategoryAssignment>

  constructor(dbName: string = DATABASE_NAME) {
    super(dbName)

    this.version(1)
      // AICODE-NOTE: Keeping Dexie versioning collocated with the client makes offline migrations explicit in git history and reversible if schema bugs arise. [2025-11-15]
      .stores({
        accounts: 'id, type, archived',
        categories: 'id, type, archived',
        transactions: 'id, accountId, categoryId, date, type'
      })

    this.version(2)
      .stores({
        accounts: 'id, type, archived',
        categories: 'id, type, archived',
        transactions: 'id, accountId, categoryId, date, type',
        categoryAssignments: 'id, month, categoryId'
      })

    this.on('populate', (transaction) => {
      void seedDefaults(transaction)
    })
  }
}

let instance: BudgetDatabase | null = null

export function getBudgetDb(): BudgetDatabase {
  if (!instance) {
    instance = new BudgetDatabase()
  }

  return instance
}
