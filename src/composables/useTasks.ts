import type { ComputedRef, Ref } from 'vue'
import { computed, readonly, ref } from 'vue'
import type {
  CreateTaskInput,
  Task,
  TaskMutationResult,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task'

/** 所有组件共享同一份内存状态，刷新后重置。 */
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

const state = ref<Task[]>([])
const tasks = readonly(state)
const tasksByStatus = computed(() => ({
  todo: tasks.value.filter((task) => task.status === 'todo'),
  doing: tasks.value.filter((task) => task.status === 'doing'),
  done: tasks.value.filter((task) => task.status === 'done'),
}))

const store: TasksStore = {
  tasks,
  tasksByStatus,
  storageError: readonly(ref<string | null>(null)),
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
    return { success: true, data: readonly(task) }
  },
  deleteTask(id) {
    const index = state.value.findIndex((task) => task.id === id)
    if (index === -1) return { success: false, error: 'not-found' }
    state.value.splice(index, 1)
    return { success: true, data: undefined }
  },
  moveTask: (id, status) => store.updateTask(id, { status }),
}

export function useTasks(): TasksStore {
  return store
}
