// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => { localStorage.clear(); vi.resetModules(); delete document.documentElement.dataset.theme })
afterEach(() => vi.restoreAllMocks())

it('默认浅色，切换立即生效并保存，重新初始化恢复', async () => {
  const { useTheme } = await import('./useTheme')
  const store = useTheme()
  expect(store.theme.value).toBe('light')
  store.toggleTheme()
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(localStorage.getItem('task-manager:theme:v1')).toBe('dark')
  vi.resetModules()
  const restored = (await import('./useTheme')).useTheme()
  expect(restored.isDark.value).toBe(true)
  restored.toggleTheme()
  expect(document.documentElement.dataset.theme).toBe('light')
})

it('非法记录回退浅色，存储不可用也能切换', async () => {
  localStorage.setItem('task-manager:theme:v1', 'invalid')
  expect((await import('./useTheme')).useTheme().theme.value).toBe('light')
  vi.resetModules()
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied') })
  const store = (await import('./useTheme')).useTheme()
  expect(() => store.toggleTheme()).not.toThrow()
  expect(store.isDark.value).toBe(true)
  expect(document.documentElement.dataset.theme).toBe('dark')
})
