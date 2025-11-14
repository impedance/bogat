import { nanoid } from 'nanoid'

import { getBudgetDb } from '~/app/db/client'
import {
  accountPayloadSchema,
  accountSchema,
  type Account,
  type AccountPayload
} from '~/app/types/budget'
import { assertEntity, nowIsoString } from './utils'

const db = getBudgetDb()
const ACCOUNT_NOT_FOUND = 'Account not found.'

export interface ListAccountsOptions {
  includeArchived?: boolean
}

export async function listAccounts(options: ListAccountsOptions = {}): Promise<Account[]> {
  const { includeArchived = false } = options
  const collection = includeArchived
    ? db.accounts.toCollection()
    : db.accounts.filter((account) => !account.archived)

  const records = await collection.sortBy('name')
  return records.map((record) => accountSchema.parse(record))
}

export async function getAccountById(id: Account['id']): Promise<Account | undefined> {
  const record = await db.accounts.get(id)
  return record ? accountSchema.parse(record) : undefined
}

export async function createAccount(input: AccountPayload): Promise<Account> {
  const payload = accountPayloadSchema.parse(input)
  const now = nowIsoString()

  const entity: Account = {
    id: nanoid(),
    ...payload,
    archived: false,
    createdAt: now,
    updatedAt: now
  }

  await db.accounts.add(entity)
  return entity
}

export async function updateAccount(id: Account['id'], input: AccountPayload): Promise<Account> {
  const payload = accountPayloadSchema.parse(input)
  const current = await getAccountById(id)
  const existing = assertEntity(current, ACCOUNT_NOT_FOUND)

  const updated: Account = {
    ...existing,
    ...payload,
    updatedAt: nowIsoString()
  }

  await db.accounts.put(updated)
  return updated
}

export async function setAccountArchived(id: Account['id'], archived: boolean): Promise<Account> {
  const current = await getAccountById(id)
  const existing = assertEntity(current, ACCOUNT_NOT_FOUND)

  const updated: Account = {
    ...existing,
    archived,
    updatedAt: nowIsoString()
  }

  await db.accounts.put(updated)
  return updated
}
