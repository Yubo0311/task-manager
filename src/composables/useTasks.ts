import type { ComputedRef, Ref } from 'vue'
import type {
  CreateTaskInput,
  Task,
  TaskMutationResult,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task'

/** 仅接口契约：后续实现 useTasks(): TasksStore，共享一份状态。 */
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
