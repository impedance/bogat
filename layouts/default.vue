<template>
  <div class="flex min-h-dvh flex-col">
    <header class="border-b border-slate-800 bg-surface-subtle/80 px-4 py-3 backdrop-blur">
      <div class="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
        <h1 class="text-lg font-semibold tracking-tight">YNAB-lite</h1>
        <p class="text-xs text-slate-400">Local-first budgeting MVP</p>
      </div>
    </header>

    <main class="flex-1">
      <div class="mx-auto w-full max-w-4xl px-4 py-6">
        <slot />
      </div>
    </main>
  </div>
</template>
