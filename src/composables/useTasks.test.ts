import { beforeEach, describe, expect, it } from 'vitest'
import { useTasks } from './useTasks'

const store = useTasks()
beforeEach(() => {
  for (const task of [...store.tasks.value]) store.deleteTask(task.id)
})

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
