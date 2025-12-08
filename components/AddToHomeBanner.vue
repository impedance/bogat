<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const bannerHidden = useState<boolean>('a2hs-banner-hidden', () => false)
const isStandalone = ref(false)
const isIos = ref(false)
const promptEvent = ref<BeforeInstallPromptEvent | null>(null)
const installState = ref<'idle' | 'installing' | 'accepted' | 'dismissed'>('idle')
let mediaQuery: MediaQueryList | null = null
let legacyMqListener: (() => void) | null = null

const shouldShow = computed(() => {
  if (bannerHidden.value) {
    return false
  }
  if (isStandalone.value) {
    return false
  }
  return isIos.value || promptEvent.value !== null
})

function updateStandalone() {
  if (typeof window === 'undefined') {
    return
  }
  const displayModeStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS specific flag
    // @ts-expect-error navigator.standalone существует только в Safari
    window.navigator.standalone === true
  isStandalone.value = Boolean(displayModeStandalone)
}

function detectIos() {
  if (typeof navigator === 'undefined') {
    return
  }
  const ua = navigator.userAgent.toLowerCase()
  const touchMac = ua.includes('macintosh') && typeof window !== 'undefined' && 'ontouchend' in window
  isIos.value = /iphone|ipad|ipod/.test(ua) || touchMac
}

async function installPwa() {
  if (!promptEvent.value) {
    return
  }
  installState.value = 'installing'
  const event = promptEvent.value
  await event.prompt()
  const result = await event.userChoice
  installState.value = result.outcome === 'accepted' ? 'accepted' : 'dismissed'
  promptEvent.value = null
  if (installState.value === 'accepted') {
    bannerHidden.value = true
  }
}

function dismissBanner() {
  bannerHidden.value = true
}

function handleBeforeInstallPrompt(event: Event) {
  event.preventDefault()
  promptEvent.value = event as BeforeInstallPromptEvent
  installState.value = 'idle'
}

onMounted(() => {
  detectIos()
  updateStandalone()
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  mediaQuery = window.matchMedia('(display-mode: standalone)')
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', updateStandalone)
  } else if (mediaQuery.addListener) {
    legacyMqListener = () => updateStandalone()
    mediaQuery.addListener(legacyMqListener)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  if (mediaQuery?.removeEventListener) {
    mediaQuery.removeEventListener('change', updateStandalone)
  } else if (mediaQuery?.removeListener && legacyMqListener) {
    mediaQuery.removeListener(legacyMqListener)
  }
})
</script>

<template>
  <transition name="fade-slide">
    <section
      v-if="shouldShow"
      class="rounded-xl border border-slate-800 bg-surface-subtle/60 p-5 shadow-lg shadow-black/20"
    >
      <div class="flex flex-wrap items-start gap-4">
        <div class="flex-1 space-y-2">
          <p class="text-xs uppercase tracking-wide text-slate-500">PWA</p>
          <h3 class="text-lg font-semibold text-white">Добавьте YNAB-lite на главный экран</h3>
          <p class="text-sm text-slate-400">
            Приложение работает офлайн: установка сохранит быстрый доступ и полноэкранный режим на
            iPhone SE и десктопе.
          </p>
          <template v-if="isIos">
            <ol class="mt-3 list-decimal space-y-1 pl-4 text-sm text-slate-300">
              <li>Откройте меню «Поделиться» в Safari.</li>
              <li>Выберите «На экран \"Домой\"».</li>
              <li>Подтвердите название и нажмите «Добавить».</li>
            </ol>
          </template>
          <template v-else>
            <p class="mt-3 text-sm text-slate-300">
              Нажмите кнопку ниже, чтобы установить приложение в один тап.
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                :disabled="installState === 'installing'"
                @click="installPwa"
              >
                {{
                  installState === 'installing'
                    ? 'Установка…'
                    : installState === 'accepted'
                      ? 'Установлено'
                      : 'Установить PWA'
                }}
              </button>
              <p
                v-if="installState === 'dismissed'"
                class="text-xs text-slate-400"
              >
                Можно повторить попытку позже через меню браузера.
              </p>
            </div>
          </template>
        </div>
        <button
          type="button"
          class="rounded-full border border-slate-800 bg-surface px-2 py-1 text-xs text-slate-400 hover:text-white"
          @click="dismissBanner"
        >
          Скрыть
        </button>
      </div>
    </section>
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
