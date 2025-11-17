import { defineStore } from 'pinia'

import {
  createAccount as createAccountRepository,
  listAccounts,
  setAccountArchived,
  updateAccount as updateAccountRepository,
  type ListAccountsOptions
} from '~/app/repositories/accounts'
import type { Account, AccountPayload } from '~/app/types/budget'

interface AccountsState {
  items: Account[]
  isLoading: boolean
  lastFetchOptions: ListAccountsOptions
}

const DEFAULT_FETCH_OPTIONS: ListAccountsOptions = {
  includeArchived: true
}

function resolveFetchOptions(options?: ListAccountsOptions): ListAccountsOptions {
  return {
    ...DEFAULT_FETCH_OPTIONS,
    ...options
  }
}

export const useAccountsStore = defineStore('accounts', {
  state: (): AccountsState => ({
    items: [],
    isLoading: false,
    lastFetchOptions: { ...DEFAULT_FETCH_OPTIONS }
  }),
  getters: {
    activeAccounts: (state) => state.items.filter((account) => !account.archived),
    accountMap: (state) =>
      state.items.reduce<Record<Account['id'], Account>>((map, account) => {
        map[account.id] = account
        return map
      }, {}),
    accountById: (state) => (id: Account['id']) => state.items.find((account) => account.id === id)
  },
  actions: {
    async fetchAccounts(options?: ListAccountsOptions) {
      const nextOptions = resolveFetchOptions(options ?? this.lastFetchOptions)
      this.isLoading = true

      try {
        this.items = await listAccounts(nextOptions)
        this.lastFetchOptions = nextOptions
      } finally {
        this.isLoading = false
      }
    },
    async refresh() {
      await this.fetchAccounts(this.lastFetchOptions)
    },
    async createAccount(payload: AccountPayload) {
      await createAccountRepository(payload)
      await this.refresh()
    },
    async updateAccount(id: Account['id'], payload: AccountPayload) {
      await updateAccountRepository(id, payload)
      await this.refresh()
    },
    async archiveAccount(id: Account['id']) {
      await setAccountArchived(id, true)
      await this.refresh()
    },
    async unarchiveAccount(id: Account['id']) {
      await setAccountArchived(id, false)
      await this.refresh()
    }
  }
})
