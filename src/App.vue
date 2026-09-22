<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import TaskForm from './components/TaskForm.vue'
import TaskBoard from './components/TaskBoard.vue'
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
  <div class="mx-auto flex min-h-screen max-w-[1600px] flex-col px-6 sm:px-12">
    <AppHeader />
    <main class="flex-1 py-12">
      <p class="mb-6 text-xs font-semibold tracking-[0.22em] text-[var(--muted)]">把事情，一件件做好。</p>
      <h1 class="text-5xl font-semibold tracking-tight sm:text-7xl">任务管理</h1>
      <p class="mt-8 max-w-md text-base leading-8 text-[var(--muted)]">
        为每天要做的事，留一个清晰的位置。
      </p>
      <p class="mt-3 text-xs text-[var(--muted)]">任务保存在当前浏览器中。</p>
      <div class="mt-12 grid items-start gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <TaskForm :task="editingTask" @saved="editingId = undefined" @cancel="editingId = undefined" />
        <section aria-labelledby="task-list-heading" class="min-w-0">
          <div class="mb-6 flex items-baseline justify-between border-b border-[var(--line)] pb-4">
            <h2 id="task-list-heading" class="text-xl font-semibold">我的任务</h2>
            <span class="text-sm text-[var(--muted)]" aria-live="polite">{{ tasks.length }} 项</span>
          </div>
          <TaskBoard @edit="editingId = $event.id" @delete="removeTask" />
        </section>
      </div>
    </main>
    <footer class="border-t border-[var(--line)] py-5 text-xs text-[var(--muted)]">
      软件工程 · 2026 秋
    </footer>
  </div>
</template>
