import type { Collection } from 'dexie'
import { nanoid } from 'nanoid'

import { getBudgetDb } from '~/app/db/client'
import {
  transactionFiltersSchema,
  transactionPayloadSchema,
  transactionSchema,
  type Transaction as BudgetTransaction,
  type TransactionFilters,
  type TransactionPayload
} from '~/app/types/budget'
import { assertEntity, nowIsoString } from './utils'

const db = getBudgetDb()
const TRANSACTION_NOT_FOUND = 'Transaction not found.'

export async function listTransactions(
  filters?: TransactionFilters
): Promise<BudgetTransaction[]> {
  const parsedFilters = transactionFiltersSchema.parse(filters ?? {})
  const { accountId, categoryId, type, dateRange, search } = parsedFilters

  let collection: Collection<BudgetTransaction, string>
  let initialKey: 'accountId' | 'categoryId' | 'type' | null = null

  if (accountId) {
    collection = db.transactions.where('accountId').equals(accountId)
    initialKey = 'accountId'
  } else if (categoryId) {
    collection = db.transactions.where('categoryId').equals(categoryId)
    initialKey = 'categoryId'
  } else if (type) {
    collection = db.transactions.where('type').equals(type)
    initialKey = 'type'
  } else {
    collection = db.transactions.toCollection()
  }

  if (categoryId && initialKey !== 'categoryId') {
    collection = collection.filter((transaction) => transaction.categoryId === categoryId)
  }

  if (type && initialKey !== 'type') {
    collection = collection.filter((transaction) => transaction.type === type)
  }

  if (dateRange?.from) {
    collection = collection.filter((transaction) => transaction.date >= dateRange.from!)
  }

  if (dateRange?.to) {
    collection = collection.filter((transaction) => transaction.date <= dateRange.to!)
  }

  if (search) {
    const term = search.toLowerCase()
    collection = collection.filter((transaction) =>
      transaction.note ? transaction.note.toLowerCase().includes(term) : false
    )
  }

  const records = await collection.toArray()
  records.sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date)
    return dateDiff !== 0 ? dateDiff : b.createdAt.localeCompare(a.createdAt)
  })

  return records.map((record) => transactionSchema.parse(record))
}

export async function getTransactionById(
  id: BudgetTransaction['id']
): Promise<BudgetTransaction | undefined> {
  const record = await db.transactions.get(id)
  return record ? transactionSchema.parse(record) : undefined
}

export async function createTransaction(
  input: TransactionPayload
): Promise<BudgetTransaction> {
  const payload = transactionPayloadSchema.parse(input)
  const now = nowIsoString()

  const entity: BudgetTransaction = {
    id: nanoid(),
    ...payload,
    createdAt: now,
    updatedAt: now
  }

  await db.transactions.add(entity)
  return entity
}

export async function updateTransaction(
  id: BudgetTransaction['id'],
  input: TransactionPayload
): Promise<BudgetTransaction> {
  const payload = transactionPayloadSchema.parse(input)
  const current = await getTransactionById(id)
  const existing = assertEntity(current, TRANSACTION_NOT_FOUND)

  const updated: BudgetTransaction = {
    ...existing,
    ...payload,
    updatedAt: nowIsoString()
  }

  await db.transactions.put(updated)
  return updated
}

export async function deleteTransaction(id: BudgetTransaction['id']): Promise<void> {
  const current = await getTransactionById(id)
  assertEntity(current, TRANSACTION_NOT_FOUND)

  await db.transactions.delete(id)
}
