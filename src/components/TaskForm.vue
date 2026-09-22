<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useTasks } from '../composables/useTasks'
import type { Task, TaskPriority, TaskStatus } from '../types/task'

const props = defineProps<{ task?: Readonly<Task> }>()
const emit = defineEmits<{ saved: []; cancel: [] }>()
const store = useTasks()
const titleInput = ref<HTMLInputElement>()
const error = ref('')
const draft = reactive({ title: '', description: '', status: 'todo' as TaskStatus, priority: 'medium' as TaskPriority })

function reset() {
  draft.title = props.task?.title ?? ''
  draft.description = props.task?.description ?? ''
  draft.status = props.task?.status ?? 'todo'
  draft.priority = props.task?.priority ?? 'medium'
  error.value = ''
}

watch(() => props.task, reset, { immediate: true })
// 外部拖拽更新状态时同步该字段，不清空用户正在编辑的其他草稿。
watch(() => props.task?.status, (status) => {
  if (status) draft.status = status
})

function save() {
  if (!draft.title.trim()) {
    error.value = '请输入任务标题，不能只包含空格。'
    titleInput.value?.focus()
    return
  }
  const result = props.task ? store.updateTask(props.task.id, draft) : store.addTask(draft)
  if (!result.success) {
    error.value = result.error === 'invalid-title' ? '请输入任务标题。' : '任务已不存在。'
    return
  }
  if (!props.task) reset()
  emit('saved')
}
</script>

<template>
  <form class="space-y-5 border border-[var(--line)] bg-[var(--surface)] p-6" novalidate @submit.prevent="save">
    <h2 class="text-xl font-semibold">{{ task ? '编辑任务' : '新增任务' }}</h2>
    <div>
      <label for="task-title" class="mb-2 block text-sm font-semibold">标题 <span class="text-[var(--danger)]">*</span></label>
      <input id="task-title" ref="titleInput" v-model="draft.title" class="field" required :aria-invalid="!!error" :aria-describedby="error ? 'task-error' : undefined" placeholder="要完成什么？" />
      <p v-if="error" id="task-error" role="alert" class="mt-2 text-sm text-[var(--danger)]">{{ error }}</p>
    </div>
    <div>
      <label for="task-description" class="mb-2 block text-sm font-semibold">描述 <span class="font-normal text-[var(--muted)]">（选填）</span></label>
      <textarea id="task-description" v-model="draft.description" class="field min-h-28 resize-y" rows="3" />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="task-status" class="mb-2 block text-sm font-semibold">状态</label>
        <select id="task-status" v-model="draft.status" class="field">
          <option value="todo">待办</option><option value="doing">进行中</option><option value="done">完成</option>
        </select>
      </div>
      <div>
        <label for="task-priority" class="mb-2 block text-sm font-semibold">优先级</label>
        <select id="task-priority" v-model="draft.priority" class="field">
          <option value="high">高</option><option value="medium">中</option><option value="low">低</option>
        </select>
      </div>
    </div>
    <div class="flex flex-wrap gap-3">
      <button type="submit" class="bg-[#243d35] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#39594c]">{{ task ? '保存修改' : '添加任务' }}</button>
      <button v-if="task" type="button" class="border border-[var(--line)] px-5 py-2.5 text-sm hover:bg-[var(--well)]" @click="emit('cancel')">取消编辑</button>
    </div>
  </form>
</template>
