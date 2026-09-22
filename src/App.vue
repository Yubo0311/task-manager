<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-5xl flex-col px-6 sm:px-12">
    <AppHeader />
    <main class="flex flex-1 flex-col justify-center py-20">
      <p class="mb-6 text-xs font-semibold tracking-[0.22em] text-[#52685f]">把事情，一件件做好。</p>
      <h1 class="text-5xl font-semibold tracking-tight sm:text-7xl">任务管理</h1>
      <p class="mt-8 max-w-md text-base leading-8 text-[#52685f]">
        为每天要做的事，留一个清晰的位置。
      </p>
      <section aria-label="页面状态" class="mt-14 border-l-2 border-[#a2643b] pl-5">
        <h2 class="text-sm font-semibold">工作空间准备中</h2>
        <p class="mt-2 text-sm leading-7 text-[#52685f]">任务管理功能将在后续课堂实践中逐步加入。</p>
      </section>
    </main>
    <footer class="border-t border-[#243d35]/20 py-5 text-xs text-[#52685f]">
      软件工程 · 2026 秋
    </footer>
  </div>
</template>
