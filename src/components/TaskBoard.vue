<script setup lang="ts">
import { ref } from 'vue'
import { useTasks } from '../composables/useTasks'
import TaskColumn from './TaskColumn.vue'
import type { Task, TaskStatus } from '../types/task'

const emit = defineEmits<{ edit: [task: Readonly<Task>]; delete: [task: Readonly<Task>] }>()
const { tasksByStatus, getTask, moveTask } = useTasks()
const columns: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: '待办' }, { status: 'doing', label: '进行中' }, { status: 'done', label: '完成' },
]
const draggingId = ref<string | null>(null)
const active = ref<TaskStatus | null>(null)
const announcement = ref('')
const dragType = 'application/x-task-id'

function start(event: DragEvent, id: string) {
  if (!event.dataTransfer) return
  draggingId.value = id
  event.dataTransfer.setData(dragType, id)
  event.dataTransfer.effectAllowed = 'move'
}
function end() {
  draggingId.value = null
  active.value = null
}
function over(event: DragEvent, status: TaskStatus) {
  if (!draggingId.value || !event.dataTransfer) return
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  active.value = status
}
function leave(event: DragEvent) {
  const target = event.currentTarget as HTMLElement
  if (!(event.relatedTarget instanceof Node) || !target.contains(event.relatedTarget)) active.value = null
}
function drop(event: DragEvent, status: TaskStatus) {
  const id = event.dataTransfer?.getData(dragType)
  const task = id && id === draggingId.value ? getTask(id) : undefined
  if (task && task.status !== status) {
    const result = moveTask(task.id, status)
    if (result.success) announcement.value = `已将「${task.title}」移至${columns.find((column) => column.status === status)!.label}`
  }
  end()
}
</script>

<template>
  <div>
    <p class="mb-4 text-xs text-[var(--muted)]">拖动卡片切换状态，也可通过编辑表单修改。</p>
    <div class="grid gap-4 md:grid-cols-3">
      <TaskColumn v-for="column in columns" :key="column.status" v-bind="column" :tasks="tasksByStatus[column.status]" :active="active === column.status" :dragging-id="draggingId" @start="start" @end="end" @over="over" @leave="leave" @drop="drop" @edit="emit('edit', $event)" @delete="emit('delete', $event)" />
    </div>
    <p class="sr-only" role="status">{{ announcement }}</p>
  </div>
</template>
