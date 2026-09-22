export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'

export interface Task {
  readonly id: string
  /** 保存前 trim，不能为空。校验将在功能轮次实现。 */
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
}

/** 默认 description = ''、status = 'todo'、priority = 'medium'。 */
export type CreateTaskInput = Pick<Task, 'title'> &
  Partial<Pick<Task, 'description' | 'status' | 'priority'>>

export type UpdateTaskInput = Partial<Omit<Task, 'id'>>

export type TaskMutationResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: 'invalid-title' | 'not-found' }
