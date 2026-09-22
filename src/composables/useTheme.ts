import type { ComputedRef, Ref } from 'vue'

export type Theme = 'light' | 'dark'

/** 仅接口契约：后续实现 useTheme(): ThemeStore，首次默认 light。 */
export interface ThemeStore {
  theme: Readonly<Ref<Theme>>
  isDark: ComputedRef<boolean>
  setTheme(theme: Theme): void
  toggleTheme(): void
}
