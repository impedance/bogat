export type MoneyMinor = number

export type AccountType = 'cash' | 'card' | 'bank'

export interface Account {
  id: string
  name: string
  type: AccountType
  currency: 'RUB'
  createdAt: string
  updatedAt: string
  archived?: boolean
}

export type CategoryType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  type: CategoryType
  isDefault?: boolean
  createdAt: string
  updatedAt: string
  archived?: boolean
}

export interface Transaction {
  id: string
  accountId: Account['id']
  categoryId: Category['id']
  type: CategoryType
  amountMinor: MoneyMinor
  note?: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface DateRangeFilter {
  from?: string | null
  to?: string | null
}

export interface TransactionFilters {
  accountId?: Account['id'] | null
  categoryId?: Category['id'] | null
  type?: CategoryType | null
  dateRange?: DateRangeFilter
  search?: string
}
