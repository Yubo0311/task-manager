<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <header class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] py-6">
    <p class="text-sm font-semibold tracking-[0.18em]">TASK / MANAGER</p>
    <button type="button" class="border border-[var(--line)] px-4 py-2 text-sm" :aria-pressed="isDark" aria-label="深色模式" @click="toggleTheme">{{ isDark ? '切换浅色' : '切换深色' }}</button>
  </header>
</template>
