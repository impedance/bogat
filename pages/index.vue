<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h2 class="text-2xl font-bold">Добро пожаловать в YNAB-lite</h2>
      <p class="text-sm text-slate-400">
        Stage 2 запущен: данные готовы, теперь выдвигаемся в UI — транзакции, формы, фильтры и поиск.
      </p>
    </header>

    <div class="grid gap-4 rounded-lg border border-slate-800 bg-surface-subtle/60 p-4">
      <p class="text-sm text-slate-300">
        Текущие шаги:
      </p>
      <ol class="list-decimal space-y-2 pl-5 text-sm text-slate-200">
        <li>Собрать формы/ленты транзакций (см. вкладку «Транзакции»).</li>
        <li>Подключить дашборд к селекторам балансов из Pinia.</li>
        <li>Подготовить PWA-манифест и проверить офлайн-режим.</li>
      </ol>
    </div>
  </section>
</template>
