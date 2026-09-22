// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => { localStorage.clear(); vi.resetModules() })
afterEach(() => vi.restoreAllMocks())

it('拖拽调用原 store，刷新恢复状态；同列及外部拖放不写入', async () => {
  const { useTasks } = await import('../composables/useTasks')
  const store = useTasks()
  store.addTask({ title: '测试卡片' })
  const move = vi.spyOn(store, 'moveTask')
  const { default: Board } = await import('./TaskBoard.vue')
  const wrapper = mount(Board)
  const values = new Map<string, string>()
  const dataTransfer = { setData: (key: string, value: string) => values.set(key, value), getData: (key: string) => values.get(key), effectAllowed: '', dropEffect: '' }
  await wrapper.get('article').trigger('dragstart', { dataTransfer })
  await wrapper.get('[data-status="doing"]').trigger('dragover', { dataTransfer })
  await wrapper.get('[data-status="doing"]').trigger('drop', { dataTransfer })
  expect(move).toHaveBeenCalledExactlyOnceWith(store.tasks.value[0]!.id, 'doing')
  expect(wrapper.findAll('[data-status="todo"] article')).toHaveLength(0)
  expect(wrapper.findAll('[data-status="doing"] article')).toHaveLength(1)
  await wrapper.get('article').trigger('dragstart', { dataTransfer })
  await wrapper.get('[data-status="doing"]').trigger('drop', { dataTransfer })
  await wrapper.get('[data-status="done"]').trigger('drop', { dataTransfer })
  expect(move).toHaveBeenCalledTimes(1)
  vi.resetModules()
  expect((await import('../composables/useTasks')).useTasks().tasks.value[0]!.status).toBe('doing')
  wrapper.unmount()
})

it('拖动正在编辑的任务后保存，保留新状态和其他草稿', async () => {
  const { useTasks } = await import('../composables/useTasks')
  const store = useTasks()
  store.addTask({ title: '原始标题' })
  const task = store.tasks.value[0]!
  const { default: Form } = await import('./TaskForm.vue')
  const wrapper = mount(Form, { props: { task } })
  await wrapper.get('#task-title').setValue('草稿标题')
  store.moveTask(task.id, 'done')
  await wrapper.vm.$nextTick()
  await wrapper.get('form').trigger('submit')
  expect(store.getTask(task.id)).toMatchObject({ title: '草稿标题', status: 'done' })
  wrapper.unmount()
})
