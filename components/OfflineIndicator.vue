<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const isOffline = ref(false)
const showRestored = ref(false)
let restoredTimer: ReturnType<typeof setTimeout> | null = null

function handleStatusChange() {
  if (typeof navigator === 'undefined') {
    return
  }
  const nowOnline = navigator.onLine
  isOffline.value = !nowOnline
  if (nowOnline) {
    showRestored.value = true
    if (restoredTimer) {
      clearTimeout(restoredTimer)
    }
    restoredTimer = window.setTimeout(() => {
      showRestored.value = false
      restoredTimer = null
    }, 4000)
  }
}

const bannerText = computed(() =>
  isOffline.value
    ? 'Нет соединения: данные сохраняются локально в IndexedDB.'
    : 'Соединение восстановлено — синхронизация обновлена.'
)

onMounted(() => {
  handleStatusChange()
  window.addEventListener('offline', handleStatusChange)
  window.addEventListener('online', handleStatusChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('offline', handleStatusChange)
  window.removeEventListener('online', handleStatusChange)
  if (restoredTimer) {
    clearTimeout(restoredTimer)
  }
})
</script>

<template>
  <transition name="fade-slide">
    <div
      v-if="isOffline"
      class="border-b border-amber-900/50 bg-amber-500/10 px-4 py-2 text-sm text-amber-100"
    >
      {{ bannerText }}
    </div>
  </transition>
  <transition name="fade-slide">
    <div
      v-if="!isOffline && showRestored"
      class="border-b border-emerald-900/50 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100"
    >
      {{ bannerText }}
    </div>
  </transition>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
