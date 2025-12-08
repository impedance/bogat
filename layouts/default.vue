<template>
  <div class="flex min-h-dvh flex-col">
    <header class="border-b border-slate-800 bg-surface-subtle/80 px-4 py-3 backdrop-blur">
      <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
        <div class="flex items-center gap-6">
          <h1 class="text-lg font-semibold tracking-tight">YNAB-lite</h1>
          <nav class="flex items-center gap-3 text-sm text-slate-300">
            <NuxtLink to="/" class="hover:text-white">Дашборд</NuxtLink>
            <NuxtLink to="/transactions" class="hover:text-white">Транзакции</NuxtLink>
            <NuxtLink to="/accounts" class="hover:text-white">Счета</NuxtLink>
            <NuxtLink to="/categories" class="hover:text-white">Категории</NuxtLink>
          </nav>
        </div>
        <p class="text-xs text-slate-400">Local-first budgeting MVP</p>
      </div>
    </header>

    <OfflineIndicator />

    <main class="flex-1">
      <div class="mx-auto w-full max-w-4xl px-4 py-6">
        <slot />
      </div>
    </main>
  </div>
</template>
