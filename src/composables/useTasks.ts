import type { ComputedRef, Ref } from 'vue'
import { computed, readonly, ref } from 'vue'
import type {
  CreateTaskInput,
  Task,
  TaskMutationResult,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task'

/** 所有组件共享同一份状态，成功操作后同步持久化。 */
export interface TasksStore {
  tasks: Readonly<Ref<readonly Readonly<Task>[]>>
  tasksByStatus: ComputedRef<Record<TaskStatus, readonly Readonly<Task>[]>>
  storageError: Readonly<Ref<string | null>>
  getTask(id: string): Readonly<Task> | undefined
  addTask(input: CreateTaskInput): TaskMutationResult<Readonly<Task>>
  updateTask(id: string, input: UpdateTaskInput): TaskMutationResult<Readonly<Task>>
  deleteTask(id: string): TaskMutationResult
  moveTask(id: string, status: TaskStatus): TaskMutationResult<Readonly<Task>>
}

const STORAGE_KEY = 'task-manager:tasks:v1'
const storageError = ref<string | null>(null)

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const task = value as Record<string, unknown>
  return typeof task.id === 'string' && task.id.trim().length > 0 &&
    typeof task.title === 'string' && task.title.trim().length > 0 &&
    typeof task.description === 'string' &&
    ['todo', 'doing', 'done'].includes(task.status as string) &&
    ['high', 'medium', 'low'].includes(task.priority as string)
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data) || !data.every(isTask) ||
      new Set(data.map((task) => task.id)).size !== data.length) {
      storageError.value = '任务存储数据格式不正确，未能恢复。'
      return []
    }
    return data
  } catch {
    storageError.value = '无法读取任务存储数据。'
    return []
  }
}

const state = ref<Task[]>(loadTasks())

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    storageError.value = null
  } catch {
    storageError.value = '任务保存失败，当前修改仅保留在内存中。'
  }
}
const tasks = readonly(state)
const tasksByStatus = computed(() => ({
  todo: tasks.value.filter((task) => task.status === 'todo'),
  doing: tasks.value.filter((task) => task.status === 'doing'),
  done: tasks.value.filter((task) => task.status === 'done'),
}))

const store: TasksStore = {
  tasks,
  tasksByStatus,
  storageError: readonly(storageError),
  getTask: (id) => tasks.value.find((task) => task.id === id),
  addTask(input) {
    const title = input.title.trim()
    if (!title) return { success: false, error: 'invalid-title' }
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      description: input.description ?? '',
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
    }
    state.value.push(task)
    saveTasks()
    return { success: true, data: readonly(task) }
  },
  updateTask(id, input) {
    const task = state.value.find((item) => item.id === id)
    if (!task) return { success: false, error: 'not-found' }
    const title = input.title === undefined ? task.title : input.title.trim()
    if (!title) return { success: false, error: 'invalid-title' }
    task.title = title
    if (input.description !== undefined) task.description = input.description
    if (input.status !== undefined) task.status = input.status
    if (input.priority !== undefined) task.priority = input.priority
    saveTasks()
    return { success: true, data: readonly(task) }
  },
  deleteTask(id) {
    const index = state.value.findIndex((task) => task.id === id)
    if (index === -1) return { success: false, error: 'not-found' }
    state.value.splice(index, 1)
    saveTasks()
    return { success: true, data: undefined }
  },
  moveTask: (id, status) => store.updateTask(id, { status }),
}

export function useTasks(): TasksStore {
  return store
}
