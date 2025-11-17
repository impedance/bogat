import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useTransactionsStore } from '~/stores/transactions'
import type {
  Transaction as BudgetTransaction,
  TransactionFilters,
  TransactionPayload
} from '~/app/types/budget'
import * as transactionsRepository from '~/app/repositories/transactions'

vi.mock('~/app/repositories/transactions', () => ({
  listTransactions: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn()
}))

const mockListTransactions = vi.mocked(transactionsRepository.listTransactions)
const mockCreateTransaction = vi.mocked(transactionsRepository.createTransaction)
const mockUpdateTransaction = vi.mocked(transactionsRepository.updateTransaction)
const mockDeleteTransaction = vi.mocked(transactionsRepository.deleteTransaction)

const BASE_TIMESTAMP = '2025-01-01T00:00:00.000Z'

function createTransactionFixture(
  override: Partial<BudgetTransaction> = {}
): BudgetTransaction {
  return {
    id: override.id ?? `tx-${Math.random().toString(36).slice(2)}`,
    accountId: 'account-1',
    categoryId: 'category-1',
    type: 'income',
    amountMinor: 1000,
    date: '2025-01-01',
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...override
  }
}

describe('transactions store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockListTransactions.mockResolvedValue([])
  })

  it('derives balances per account/category and totals', () => {
    const store = useTransactionsStore()
    store.$patch({
      transactions: [
        createTransactionFixture({
          id: 'income-1',
          accountId: 'cash',
          categoryId: 'salary',
          type: 'income',
          amountMinor: 10_000
        }),
        createTransactionFixture({
          id: 'expense-1',
          accountId: 'cash',
          categoryId: 'groceries',
          type: 'expense',
          amountMinor: 3_000
        }),
        createTransactionFixture({
          id: 'expense-2',
          accountId: 'card',
          categoryId: 'rent',
          type: 'expense',
          amountMinor: 5_000
        })
      ]
    })

    expect(store.balanceByAccount).toEqual({
      cash: 7_000,
      card: -5_000
    })
    expect(store.balanceByCategory).toEqual({
      salary: 10_000,
      groceries: -3_000,
      rent: -5_000
    })
    expect(store.incomeTotal).toBe(10_000)
    expect(store.expenseTotal).toBe(8_000)
    expect(store.overallBalance).toBe(2_000)
  })

  it('normalizes filters before fetching transactions', async () => {
    const store = useTransactionsStore()
    const filters: TransactionFilters = {
      search: '  орехи  ',
      dateRange: {
        from: '2025-02-01',
        to: null
      }
    }
    const sampleRows = [
      createTransactionFixture({
        id: 'expense-3',
        accountId: 'cash',
        categoryId: 'groceries',
        type: 'expense',
        amountMinor: 1_500,
        date: '2025-02-10'
      })
    ]
    mockListTransactions.mockResolvedValueOnce(sampleRows)

    await store.fetchTransactions(filters)

    expect(mockListTransactions).toHaveBeenCalledWith({
      dateRange: { from: '2025-02-01', to: null },
      search: 'орехи'
    })
    expect(store.transactions).toEqual(sampleRows)
    expect(store.filters.search).toBe('орехи')
  })

  it('refreshes current filters after create/update/delete actions', async () => {
    const store = useTransactionsStore()
    const scopedFilters: TransactionFilters = { accountId: 'cash' }
    const payload: TransactionPayload = {
      accountId: 'cash',
      categoryId: 'salary',
      type: 'income',
      amountMinor: 12_000,
      date: '2025-03-01',
      note: 'Salary'
    }

    mockListTransactions.mockResolvedValue([])
    await store.fetchTransactions(scopedFilters)
    mockListTransactions.mockClear()
    mockListTransactions.mockResolvedValue([])

    mockCreateTransaction.mockResolvedValue(createTransactionFixture())
    await store.createTransaction(payload)
    expect(mockCreateTransaction).toHaveBeenCalledWith(payload)
    expect(mockListTransactions).toHaveBeenLastCalledWith(scopedFilters)

    mockListTransactions.mockClear()
    mockListTransactions.mockResolvedValue([])
    mockUpdateTransaction.mockResolvedValue(
      createTransactionFixture({ id: 'existing', amountMinor: 1 })
    )
    await store.updateTransaction('existing', payload)
    expect(mockUpdateTransaction).toHaveBeenCalledWith('existing', payload)
    expect(mockListTransactions).toHaveBeenLastCalledWith(scopedFilters)

    mockListTransactions.mockClear()
    mockListTransactions.mockResolvedValue([])
    mockDeleteTransaction.mockResolvedValue()
    await store.deleteTransaction('existing')
    expect(mockDeleteTransaction).toHaveBeenCalledWith('existing')
    expect(mockListTransactions).toHaveBeenLastCalledWith(scopedFilters)
  })
})
