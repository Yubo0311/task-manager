import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TasksStore } from './useTasks'

const key = 'task-manager:tasks:v1'
let store: TasksStore
let useTasks: () => TasksStore
let data: Map<string, string>
let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn> }
beforeEach(async () => {
  data = new Map()
  storage = {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { data.set(key, value) }),
  }
  vi.stubGlobal('localStorage', storage)
  vi.resetModules()
  ;({ useTasks } = await import('./useTasks'))
  store = useTasks()
})
afterEach(() => vi.unstubAllGlobals())

async function reload() {
  vi.resetModules()
  return (await import('./useTasks')).useTasks()
}

describe('内存任务状态', () => {
  it('创建任务时 trim 标题并应用默认值，各调用共享状态', () => {
    const result = store.addTask({ title: '  读书  ' })
    expect(result.success).toBe(true)
    expect(useTasks().tasks.value).toHaveLength(1)
    expect(store.tasks.value[0]).toMatchObject({ title: '读书', description: '', status: 'todo', priority: 'medium' })
    store.addTask({ title: '读书' })
    expect(store.tasks.value[0]!.id).not.toBe(store.tasks.value[1]!.id)
  })

  it('拒绝空标题和纯空白标题，不添加任务', () => {
    for (const title of ['', '  \n\t']) {
      expect(store.addTask({ title })).toEqual({ success: false, error: 'invalid-title' })
    }
    expect(store.tasks.value).toHaveLength(0)
  })

  it('编辑保留 ID，允许清空描述，验证失败不修改任何字段', () => {
    store.addTask({ title: '初稿', description: '内容', priority: 'high' })
    const id = store.tasks.value[0]!.id
    expect(store.updateTask(id, { title: ' ', description: '不应保存' }).success).toBe(false)
    expect(store.getTask(id)).toMatchObject({ title: '初稿', description: '内容' })
    expect(store.updateTask(id, { title: '  定稿 ', description: '', status: 'doing', priority: 'low' }).success).toBe(true)
    expect(store.tasks.value).toHaveLength(1)
    expect(store.getTask(id)).toEqual({ id, title: '定稿', description: '', status: 'doing', priority: 'low' })
    store.updateTask(id, { priority: 'medium' })
    expect(store.getTask(id)?.title).toBe('定稿')
  })

  it('状态分组随状态修改和删除更新', () => {
    store.addTask({ title: '任务' })
    const id = store.tasks.value[0]!.id
    expect(store.tasksByStatus.value.todo).toHaveLength(1)
    for (const status of ['doing', 'done', 'todo'] as const) {
      expect(store.moveTask(id, status).success).toBe(true)
      expect(store.tasksByStatus.value[status].map((task) => task.id)).toEqual([id])
    }
    expect(store.deleteTask(id).success).toBe(true)
    expect(store.getTask(id)).toBeUndefined()
    expect(store.tasksByStatus.value.todo).toHaveLength(0)
  })

  it('不存在的任务返回明确错误，保留其余任务', () => {
    store.addTask({ title: '保留' })
    const failure = { success: false, error: 'not-found' }
    expect(store.updateTask('missing', { title: '修改' })).toEqual(failure)
    expect(store.moveTask('missing', 'done')).toEqual(failure)
    expect(store.deleteTask('missing')).toEqual(failure)
    expect(store.tasks.value).toHaveLength(1)
    expect(store.storageError.value).toBeNull()
  })
})

describe('任务持久化', () => {
  it('无历史记录时不写入；所有成功操作立即保存，重新初始化恢复全部字段', async () => {
    expect(store.tasks.value).toEqual([])
    expect(storage.setItem).not.toHaveBeenCalled()
    store.addTask({ title: '阅读', description: '第二章', status: 'doing', priority: 'high' })
    const id = store.tasks.value[0]!.id
    expect(JSON.parse(data.get(key)!)).toEqual(store.tasks.value)
    let restored = await reload()
    expect(restored.tasks.value).toEqual(store.tasks.value)
    restored.updateTask(id, { title: '笔记', description: '', priority: 'low' })
    expect(JSON.parse(data.get(key)!)).toEqual(restored.tasks.value)
    restored.moveTask(id, 'done')
    restored = await reload()
    expect(restored.getTask(id)).toEqual({ id, title: '笔记', description: '', priority: 'low', status: 'done' })
    restored.deleteTask(id)
    expect(data.get(key)).toBe('[]')
    expect((await reload()).tasks.value).toEqual([])
  })

  it('校验失败和不存在的任务操作不写入', () => {
    store.addTask({ title: '保留' })
    storage.setItem.mockClear()
    store.addTask({ title: ' ' })
    store.updateTask(store.tasks.value[0]!.id, { title: '' })
    store.updateTask('missing', { title: '标题' })
    store.deleteTask('missing')
    store.moveTask('missing', 'doing')
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('拒绝损坏数据、非法字段和重复 ID，初始化不覆盖原始存储', async () => {
    const task = { id: 'one', title: '标题', description: '', status: 'todo', priority: 'medium' }
    const invalidData = [
      '{', 'null', '{}', '[null]',
      ...[{ id: '' }, { title: ' ' }, { description: 1 }, { status: 'unknown' }, { priority: 'unknown' }]
        .map((patch) => JSON.stringify([{ ...task, ...patch }])),
      JSON.stringify([task, task]),
    ]
    for (const raw of invalidData) {
      data.set(key, raw)
      const restored = await reload()
      expect(restored.tasks.value).toEqual([])
      expect(restored.storageError.value).not.toBeNull()
      expect(data.get(key)).toBe(raw)
    }
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('读取失败不阻止启动；写入失败保留内存，后续成功清除错误', async () => {
    storage.getItem.mockImplementationOnce(() => { throw new Error('denied') })
    const restored = await reload()
    expect(restored.tasks.value).toEqual([])
    expect(restored.storageError.value).not.toBeNull()
    storage.setItem.mockImplementationOnce(() => { throw new Error('quota') })
    expect(restored.addTask({ title: '内存任务' }).success).toBe(true)
    expect(restored.tasks.value).toHaveLength(1)
    expect(restored.storageError.value).not.toBeNull()
    expect(data.has(key)).toBe(false)
    restored.updateTask(restored.tasks.value[0]!.id, { title: '已保存' })
    expect(restored.storageError.value).toBeNull()
    expect((await reload()).tasks.value).toEqual(restored.tasks.value)
  })
})
