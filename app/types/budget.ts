import { z } from 'zod'

const BUDGET_ID_SCHEMA = z.string().min(1)
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/

export const accountTypeSchema = z.enum(['cash', 'card', 'bank'])
export const categoryTypeSchema = z.enum(['income', 'expense'])

export const moneyMinorSchema = z
  .number()
  .int('Amount must be represented in minor units (integer).')
  .finite()

const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true })

const dateOnlySchema = z
  .string()
  .regex(DATE_ONLY_REGEX, 'Expected YYYY-MM-DD date string.')

const baseTimestampsSchema = z.object({
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
})

const accountNameSchema = z
  .string()
  .trim()
  .min(1, 'Account name is required.')
  .max(64, 'Account name must be at most 64 characters.')

const categoryNameSchema = z
  .string()
  .trim()
  .min(1, 'Category name is required.')
  .max(64, 'Category name must be at most 64 characters.')

const noteSchema = z
  .string()
  .trim()
  .max(280, 'Note must be at most 280 characters.')

export const BACKUP_SNAPSHOT_VERSION = 1 as const

export const accountSchema = z
  .object({
    id: BUDGET_ID_SCHEMA,
    name: accountNameSchema,
    type: accountTypeSchema,
    currency: z.literal('RUB'),
    archived: z.boolean().optional()
  })
  .and(baseTimestampsSchema)

export const categorySchema = z
  .object({
    id: BUDGET_ID_SCHEMA,
    name: categoryNameSchema,
    type: categoryTypeSchema,
    isDefault: z.boolean().optional(),
    archived: z.boolean().optional()
  })
  .and(baseTimestampsSchema)

export const transactionSchema = z
  .object({
    id: BUDGET_ID_SCHEMA,
    accountId: BUDGET_ID_SCHEMA,
    categoryId: BUDGET_ID_SCHEMA,
    type: categoryTypeSchema,
    amountMinor: moneyMinorSchema,
    note: noteSchema.optional(),
    date: dateOnlySchema
  })
  .and(baseTimestampsSchema)

export const accountPayloadSchema = z.object({
  name: accountNameSchema,
  type: accountTypeSchema,
  currency: z.literal('RUB')
})

export const categoryPayloadSchema = z.object({
  name: categoryNameSchema,
  type: categoryTypeSchema
})

export const transactionPayloadSchema = z.object({
  accountId: BUDGET_ID_SCHEMA,
  categoryId: BUDGET_ID_SCHEMA,
  type: categoryTypeSchema,
  amountMinor: moneyMinorSchema,
  note: noteSchema.optional(),
  date: dateOnlySchema
})

export const dateRangeFilterSchema = z.object({
  from: dateOnlySchema.nullable().optional(),
  to: dateOnlySchema.nullable().optional()
})

export const transactionFiltersSchema = z.object({
  accountId: BUDGET_ID_SCHEMA.nullable().optional(),
  categoryId: BUDGET_ID_SCHEMA.nullable().optional(),
  type: categoryTypeSchema.nullable().optional(),
  dateRange: dateRangeFilterSchema.optional(),
  search: z
    .string()
    .trim()
    .max(120, 'Search input is capped to 120 characters.')
    .optional()
})

export const backupSnapshotSchema = z.object({
  version: z.literal(BACKUP_SNAPSHOT_VERSION),
  exportedAt: isoDateTimeSchema,
  accounts: z.array(accountSchema),
  categories: z.array(categorySchema),
  transactions: z.array(transactionSchema)
})

export type MoneyMinor = z.infer<typeof moneyMinorSchema>
export type AccountType = z.infer<typeof accountTypeSchema>
export type CategoryType = z.infer<typeof categoryTypeSchema>
export type Account = z.infer<typeof accountSchema>
export type Category = z.infer<typeof categorySchema>
export type Transaction = z.infer<typeof transactionSchema>
export type AccountPayload = z.infer<typeof accountPayloadSchema>
export type CategoryPayload = z.infer<typeof categoryPayloadSchema>
export type TransactionPayload = z.infer<typeof transactionPayloadSchema>
export type DateRangeFilter = z.infer<typeof dateRangeFilterSchema>
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>
export type BackupSnapshot = z.infer<typeof backupSnapshotSchema>
