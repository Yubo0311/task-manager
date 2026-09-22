<script setup lang="ts">
import TaskCard from './TaskCard.vue'
import type { Task, TaskStatus } from '../types/task'

defineProps<{
  status: TaskStatus
  label: string
  tasks: readonly Readonly<Task>[]
  active: boolean
  draggingId: string | null
}>()
const emit = defineEmits<{
  edit: [task: Readonly<Task>]
  delete: [task: Readonly<Task>]
  start: [event: DragEvent, id: string]
  end: []
  over: [event: DragEvent, status: TaskStatus]
  leave: [event: DragEvent]
  drop: [event: DragEvent, status: TaskStatus]
}>()
</script>

<template>
  <section :aria-labelledby="`column-${status}`" :data-status="status" class="min-w-0 border border-[var(--line)] bg-[var(--well)] p-4 transition-colors" :class="{ 'drop-active': active }" @dragover="emit('over', $event, status)" @dragleave="emit('leave', $event)" @drop.prevent="emit('drop', $event, status)">
    <div class="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
      <h2 :id="`column-${status}`" class="font-semibold">{{ label }}</h2>
      <span class="text-sm text-[var(--muted)]">{{ tasks.length }}</span>
    </div>
    <div class="min-h-48 space-y-4">
      <TaskCard v-for="task in tasks" :key="task.id" :task="task" draggable="true" class="cursor-grab active:cursor-grabbing" :class="{ 'opacity-40': draggingId === task.id }" @dragstart="emit('start', $event, task.id)" @dragend="emit('end')" @edit="emit('edit', task)" @delete="emit('delete', task)" />
      <p v-if="!tasks.length" class="py-12 text-center text-sm text-[var(--muted)]">暂无任务，可拖放到这里</p>
    </div>
  </section>
</template>
