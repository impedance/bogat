<script setup lang="ts">
import { computed, ref } from 'vue'

import { createBackupSnapshot, importBackupSnapshot } from '~/app/repositories/backup'
import { backupSnapshotSchema, type BackupSnapshot } from '~/app/types/budget'
import { useAccountsStore } from '~/stores/accounts'
import { useCategoriesStore } from '~/stores/categories'
import { useTransactionsStore } from '~/stores/transactions'

type ImportStatus = 'idle' | 'parsing' | 'ready' | 'restoring' | 'success'

const accountsStore = useAccountsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()

const isExporting = ref(false)
const exportError = ref<string | null>(null)
const lastExportedAt = ref<string | null>(null)

const pendingSnapshot = ref<BackupSnapshot | null>(null)
const pendingFileName = ref<string | null>(null)
const importStatus = ref<ImportStatus>('idle')
const importError = ref<string | null>(null)
const importResult = ref<{ fileName: string; completedAt: string } | null>(null)

const snapshotPreview = computed(() => {
  if (!pendingSnapshot.value) {
    return []
  }

  return [
    { label: 'Счета', value: pendingSnapshot.value.accounts.length },
    { label: 'Категории', value: pendingSnapshot.value.categories.length },
    { label: 'Транзакции', value: pendingSnapshot.value.transactions.length }
  ]
})

const canImport = computed(
  () => pendingSnapshot.value !== null && importStatus.value !== 'restoring'
)

function formatIso(value: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString('ru-RU')
}

async function refreshAllStores() {
  await Promise.all([
    accountsStore.fetchAccounts({ includeArchived: true }),
    categoriesStore.fetchCategories({ includeArchived: true }),
    transactionsStore.fetchTransactions(transactionsStore.filters)
  ])
}

function triggerDownload(snapshot: BackupSnapshot) {
  if (!import.meta.client) {
    return
  }

  const timestamp = snapshot.exportedAt.replace(/[:.]/g, '-')
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `ynab-lite-backup-${timestamp}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

async function handleExport() {
  exportError.value = null
  isExporting.value = true

  try {
    const snapshot = await createBackupSnapshot()
    lastExportedAt.value = snapshot.exportedAt
    triggerDownload(snapshot)
  } catch (error) {
    exportError.value =
      error instanceof Error ? error.message : 'Не удалось подготовить файл экспорта.'
  } finally {
    isExporting.value = false
  }
}

async function handleFileSelection(event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]

  importError.value = null
  importStatus.value = 'idle'
  pendingSnapshot.value = null
  pendingFileName.value = null

  if (!file) {
    return
  }

  importStatus.value = 'parsing'

  try {
    const raw = await file.text()
    const parsed = backupSnapshotSchema.parse(JSON.parse(raw))
    pendingSnapshot.value = parsed
    pendingFileName.value = file.name
    importStatus.value = 'ready'
    importResult.value = null
  } catch (error) {
    importError.value =
      error instanceof Error ? error.message : 'Не удалось распознать JSON файл.'
    importStatus.value = 'idle'
  } finally {
    if (input) {
      input.value = ''
    }
  }
}

async function confirmImport() {
  if (!pendingSnapshot.value) {
    return
  }

  importError.value = null
  importStatus.value = 'restoring'

  try {
    await importBackupSnapshot(pendingSnapshot.value)
    await refreshAllStores()
    importResult.value = {
      fileName: pendingFileName.value ?? 'backup.json',
      completedAt: new Date().toISOString()
    }
    pendingSnapshot.value = null
    pendingFileName.value = null
    importStatus.value = 'success'
  } catch (error) {
    importError.value =
      error instanceof Error ? error.message : 'Не удалось импортировать данные.'
    importStatus.value = 'ready'
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <h2 class="text-2xl font-semibold tracking-tight">Настройки и бэкапы</h2>
      <p class="text-sm text-slate-400">
        Экспортируйте JSON-файл, чтобы хранить резервную копию локально, и импортируйте его для
        полного восстановления Dexie. Импорт заменяет все текущие данные, так что сначала сделайте
        бэкап.
      </p>
    </header>

    <section class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold">Экспорт JSON</h3>
          <p class="text-sm text-slate-400">
            Снимок содержит все счета, категории и транзакции вместе с временными метками.
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          :disabled="isExporting"
          @click="handleExport"
        >
          {{ isExporting ? 'Подготовка…' : 'Скачать JSON' }}
        </button>
      </div>
      <p v-if="lastExportedAt" class="mt-3 text-xs text-slate-500">
        Последний экспорт: {{ formatIso(lastExportedAt) }}
      </p>
      <p v-if="exportError" class="mt-3 text-sm text-rose-300">
        {{ exportError }}
      </p>
    </section>

    <section class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold">Импорт JSON</h3>
            <p class="text-sm text-slate-400">
              Загрузите ранее сохранённый файл. Мы покажем состав снапшота перед восстановлением.
            </p>
          </div>
          <label
            class="cursor-pointer rounded-lg border border-dashed border-slate-700 px-4 py-2 text-sm font-semibold text-indigo-200 hover:border-indigo-400"
          >
            <span>Выбрать файл</span>
            <input
              type="file"
              accept="application/json"
              class="hidden"
              @change="handleFileSelection"
            />
          </label>
        </div>

        <div
          v-if="pendingSnapshot"
          class="rounded-lg border border-slate-800 bg-slate-900/80 p-4"
        >
          <p class="text-sm font-semibold text-slate-200">
            Готов к импорту: {{ pendingFileName ?? 'backup.json' }}
          </p>
          <p class="text-xs text-slate-400">
            Экспортирован: {{ formatIso(pendingSnapshot.exportedAt) }} · Версия
            {{ pendingSnapshot.version }}
          </p>
          <dl class="mt-3 grid gap-3 sm:grid-cols-3">
            <div
              v-for="item in snapshotPreview"
              :key="item.label"
              class="rounded border border-slate-800 bg-slate-950/40 p-3 text-center"
            >
              <dt class="text-xs uppercase tracking-wide text-slate-500">{{ item.label }}</dt>
              <dd class="text-xl font-semibold text-white">{{ item.value }}</dd>
            </div>
          </dl>
        </div>

        <p
          v-if="importResult"
          class="rounded-lg border border-green-900/40 bg-green-900/10 p-3 text-sm text-green-200"
        >
          Данные заменены содержимым {{ importResult.fileName }} · {{ formatIso(importResult.completedAt) }}
        </p>

        <p v-if="importError" class="text-sm text-rose-300">
          {{ importError }}
        </p>

        <div class="flex items-center justify-between gap-4">
          <p class="text-xs text-slate-500">
            Импорт перезаписывает все текущие записи. Экспортируйте текущие данные перед
            восстановлением, если хотите иметь копию.
          </p>
          <button
            type="button"
            class="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
            :disabled="!canImport"
            @click="confirmImport"
          >
            {{
              importStatus === 'restoring'
                ? 'Восстановление…'
                : importStatus === 'success'
                  ? 'Импорт завершён'
                  : 'Импортировать'
            }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
