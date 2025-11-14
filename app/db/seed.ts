import type { Transaction } from 'dexie'
import { nanoid } from 'nanoid'

import type { Account, Category } from '~/app/types/budget'

const DEFAULT_ACCOUNTS: Array<Pick<Account, 'name' | 'type'>> = [
  { name: 'Наличные', type: 'cash' }
]

const DEFAULT_EXPENSE_CATEGORIES = [
  'Еда',
  'Транспорт',
  'Жильё',
  'Коммунальные',
  'Связь',
  'Одежда',
  'Здоровье',
  'Развлечения',
  'Путешествия',
  'Образование',
  'Подарки',
  'Прочее'
]

const DEFAULT_INCOME_CATEGORIES = ['Зарплата', 'Фриланс', 'Проценты', 'Подарки', 'Прочее']

async function seedAccounts(transaction: Transaction, now: string) {
  const payloads: Account[] = DEFAULT_ACCOUNTS.map((account) => ({
    id: nanoid(),
    currency: 'RUB',
    createdAt: now,
    updatedAt: now,
    ...account
  }))

  await transaction.table<Account>('accounts').bulkAdd(payloads)
}

async function seedCategories(transaction: Transaction, now: string) {
  const expenseSeeds: Category[] = DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
    id: nanoid(),
    name,
    type: 'expense',
    isDefault: true,
    createdAt: now,
    updatedAt: now
  }))

  const incomeSeeds: Category[] = DEFAULT_INCOME_CATEGORIES.map((name) => ({
    id: nanoid(),
    name,
    type: 'income',
    isDefault: true,
    createdAt: now,
    updatedAt: now
  }))

  await transaction.table<Category>('categories').bulkAdd([...expenseSeeds, ...incomeSeeds])
}

export async function seedDefaults(transaction: Transaction) {
  const now = new Date().toISOString()

  await Promise.all([seedAccounts(transaction, now), seedCategories(transaction, now)])
}
