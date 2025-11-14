import { nanoid } from 'nanoid'

import { getBudgetDb } from '~/app/db/client'
import {
  categoryPayloadSchema,
  categorySchema,
  type Category,
  type CategoryPayload,
  type CategoryType
} from '~/app/types/budget'
import { assertEntity, nowIsoString } from './utils'

const db = getBudgetDb()
const CATEGORY_NOT_FOUND = 'Category not found.'

export interface ListCategoriesOptions {
  includeArchived?: boolean
  type?: CategoryType
}

export async function listCategories(options: ListCategoriesOptions = {}): Promise<Category[]> {
  const { includeArchived = false, type } = options

  let collection = type
    ? db.categories.where('type').equals(type)
    : db.categories.toCollection()

  if (!includeArchived) {
    collection = collection.filter((category) => !category.archived)
  }

  const records = await collection.sortBy('name')
  return records.map((record) => categorySchema.parse(record))
}

export async function getCategoryById(id: Category['id']): Promise<Category | undefined> {
  const record = await db.categories.get(id)
  return record ? categorySchema.parse(record) : undefined
}

export async function createCategory(input: CategoryPayload): Promise<Category> {
  const payload = categoryPayloadSchema.parse(input)
  const now = nowIsoString()

  const entity: Category = {
    id: nanoid(),
    ...payload,
    isDefault: false,
    archived: false,
    createdAt: now,
    updatedAt: now
  }

  await db.categories.add(entity)
  return entity
}

export async function updateCategory(id: Category['id'], input: CategoryPayload): Promise<Category> {
  const payload = categoryPayloadSchema.parse(input)
  const current = await getCategoryById(id)
  const existing = assertEntity(current, CATEGORY_NOT_FOUND)

  const updated: Category = {
    ...existing,
    ...payload,
    updatedAt: nowIsoString()
  }

  await db.categories.put(updated)
  return updated
}

export async function setCategoryArchived(id: Category['id'], archived: boolean): Promise<Category> {
  const current = await getCategoryById(id)
  const existing = assertEntity(current, CATEGORY_NOT_FOUND)

  const updated: Category = {
    ...existing,
    archived,
    updatedAt: nowIsoString()
  }

  await db.categories.put(updated)
  return updated
}
