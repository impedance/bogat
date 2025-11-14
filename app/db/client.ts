import Dexie, { type Table } from 'dexie'

import type { Account, Category, Transaction } from '~/app/types/budget'
import { seedDefaults } from './seed'

const DATABASE_NAME = 'ynab-lite'

export class BudgetDatabase extends Dexie {
  accounts!: Table<Account>
  categories!: Table<Category>
  transactions!: Table<Transaction>

  constructor() {
    super(DATABASE_NAME)

    this.version(1)
      // AICODE-WHY: Keeping Dexie versioning collocated with the client makes offline migrations explicit in git history and reversible if schema bugs arise. [2025-11-15]
      .stores({
        accounts: 'id, type, archived',
        categories: 'id, type, archived',
        transactions: 'id, accountId, categoryId, date, type'
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
