import type { ComputedRef, Ref } from 'vue'
import { computed, readonly, ref } from 'vue'

export type Theme = 'light' | 'dark'

/** 共享主题状态，首次默认 light。 */
export interface ThemeStore {
  theme: Readonly<Ref<Theme>>
  isDark: ComputedRef<boolean>
  setTheme(theme: Theme): void
  toggleTheme(): void
}

const key = 'task-manager:theme:v1'
function loadTheme(): Theme {
  try {
    return localStorage.getItem(key) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}
const theme = ref<Theme>(loadTheme())
function applyTheme() {
  document.documentElement.dataset.theme = theme.value
}
applyTheme()

const store: ThemeStore = {
  theme: readonly(theme),
  isDark: computed(() => theme.value === 'dark'),
  setTheme(value) {
    theme.value = value
    applyTheme()
    try {
      localStorage.setItem(key, value)
    } catch {
      // 存储不可用时，仍允许当前页面切换主题。
    }
  },
  toggleTheme() { store.setTheme(theme.value === 'dark' ? 'light' : 'dark') },
}

export function useTheme(): ThemeStore {
  return store
}
