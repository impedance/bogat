import { defineStore } from 'pinia'

import {
  createTransaction as createTransactionRepository,
  deleteTransaction as deleteTransactionRepository,
  listTransactions,
  updateTransaction as updateTransactionRepository
} from '~/app/repositories/transactions'
import {
  transactionFiltersSchema,
  type Transaction as BudgetTransaction,
  type TransactionFilters,
  type TransactionPayload
} from '~/app/types/budget'

interface TransactionsState {
  transactions: BudgetTransaction[]
  filters: TransactionFilters
  isLoading: boolean
}

function transactionDelta(transaction: BudgetTransaction): number {
  return transaction.type === 'income' ? transaction.amountMinor : -transaction.amountMinor
}

function sanitizeFilters(filters?: TransactionFilters) {
  return transactionFiltersSchema.parse(filters ?? {})
}

export const useTransactionsStore = defineStore('transactions', {
  state: (): TransactionsState => ({
    transactions: [],
    filters: sanitizeFilters(),
    isLoading: false
  }),
  getters: {
    balanceByAccount: (state) =>
      state.transactions.reduce<Record<BudgetTransaction['accountId'], number>>(
        (map, transaction) => {
          map[transaction.accountId] = (map[transaction.accountId] ?? 0) + transactionDelta(transaction)
          return map
        },
        {}
      ),
    balanceByCategory: (state) =>
      state.transactions.reduce<Record<BudgetTransaction['categoryId'], number>>(
        (map, transaction) => {
          map[transaction.categoryId] =
            (map[transaction.categoryId] ?? 0) + transactionDelta(transaction)
          return map
        },
        {}
      ),
    incomeTotal: (state) =>
      state.transactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amountMinor, 0),
    expenseTotal: (state) =>
      state.transactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amountMinor, 0),
    overallBalance(): number {
      return Object.values(this.balanceByAccount).reduce((sum, amount) => sum + amount, 0)
    }
  },
  actions: {
    async fetchTransactions(filters?: TransactionFilters) {
      const nextFilters = sanitizeFilters(filters ?? this.filters)
      this.isLoading = true

      try {
        this.transactions = await listTransactions(nextFilters)
        this.filters = nextFilters
      } finally {
        this.isLoading = false
      }
    },
    async refresh() {
      await this.fetchTransactions(this.filters)
    },
    async setFilters(filters?: TransactionFilters) {
      await this.fetchTransactions(filters ?? {})
    },
    async createTransaction(payload: TransactionPayload) {
      await createTransactionRepository(payload)
      await this.refresh()
    },
    async updateTransaction(id: BudgetTransaction['id'], payload: TransactionPayload) {
      await updateTransactionRepository(id, payload)
      await this.refresh()
    },
    async deleteTransaction(id: BudgetTransaction['id']) {
      await deleteTransactionRepository(id)
      await this.refresh()
    }
  }
})
