<script setup lang="ts">
import type { Task } from '../types/task'

defineProps<{ task: Readonly<Task> }>()
const emit = defineEmits<{ edit: []; delete: [] }>()
const statusLabels = { todo: '待办', doing: '进行中', done: '已完成' }
const priorityLabels = { high: '高', medium: '中', low: '低' }
const priorityClasses = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-amber-100 text-amber-900 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
}
</script>

<template>
  <article class="border-b border-[#243d35]/20 py-6 first:pt-0">
    <div class="mb-3 flex flex-wrap items-center gap-2 text-xs">
      <span class="border px-2 py-1 font-semibold" :class="priorityClasses[task.priority]">{{ priorityLabels[task.priority] }}优先级</span>
      <span class="text-[#52685f]">{{ statusLabels[task.status] }}</span>
    </div>
    <h3 class="text-lg font-semibold [overflow-wrap:anywhere]">{{ task.title }}</h3>
    <p v-if="task.description" class="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#52685f] [overflow-wrap:anywhere]">{{ task.description }}</p>
    <div class="mt-4 flex gap-5 text-sm">
      <button type="button" class="underline underline-offset-4 hover:text-[#a2643b]" :aria-label="`编辑：${task.title}`" @click="emit('edit')">编辑</button>
      <button type="button" class="text-red-800 underline underline-offset-4 hover:text-red-600" :aria-label="`删除：${task.title}`" @click="emit('delete')">删除</button>
    </div>
  </article>
</template>
