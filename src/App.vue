<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import TaskForm from './components/TaskForm.vue'
import TaskCard from './components/TaskCard.vue'
import { computed, ref } from 'vue'
import { useTasks } from './composables/useTasks'
import type { Task } from './types/task'

const { tasks, getTask, deleteTask } = useTasks()
const editingId = ref<string>()
const editingTask = computed(() => editingId.value ? getTask(editingId.value) : undefined)

function removeTask(task: Readonly<Task>) {
  if (!window.confirm(`确定删除「${task.title}」吗？`)) return
  deleteTask(task.id)
  if (editingId.value === task.id) editingId.value = undefined
}
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-5xl flex-col px-6 sm:px-12">
    <AppHeader />
    <main class="flex-1 py-12">
      <p class="mb-6 text-xs font-semibold tracking-[0.22em] text-[#52685f]">把事情，一件件做好。</p>
      <h1 class="text-5xl font-semibold tracking-tight sm:text-7xl">任务管理</h1>
      <p class="mt-8 max-w-md text-base leading-8 text-[#52685f]">
        为每天要做的事，留一个清晰的位置。
      </p>
      <p class="mt-3 text-xs text-[#52685f]">任务保存在当前浏览器中。</p>
      <div class="mt-12 grid items-start gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <TaskForm :task="editingTask" @saved="editingId = undefined" @cancel="editingId = undefined" />
        <section aria-labelledby="task-list-heading" class="min-w-0">
          <div class="mb-6 flex items-baseline justify-between border-b border-[#243d35]/20 pb-4">
            <h2 id="task-list-heading" class="text-xl font-semibold">我的任务</h2>
            <span class="text-sm text-[#52685f]" aria-live="polite">{{ tasks.length }} 项</span>
          </div>
          <p v-if="!tasks.length" class="py-10 text-sm leading-7 text-[#52685f]">还没有任务。添加第一件要做的事吧。</p>
          <TaskCard v-for="task in tasks" :key="task.id" :task="task" @edit="editingId = task.id" @delete="removeTask(task)" />
        </section>
      </div>
    </main>
    <footer class="border-t border-[#243d35]/20 py-5 text-xs text-[#52685f]">
      软件工程 · 2026 秋
    </footer>
  </div>
</template>
