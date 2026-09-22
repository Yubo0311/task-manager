# task-manager
A task manager demo project for Software Engineering, PKU, 2026fall

## 本轮范围

Vue 3 + TypeScript + Vite + Tailwind CSS 项目骨架，包括静态首页、Task 类型、
composable 接口契约和 ESLint 配置。尚未实现 CRUD、localStorage、Kanban 或 dark mode。
`useTasks.ts` 和 `useTheme.ts` 目前只导出类型，没有可调用的 composable 函数。

## 本地运行

使用 Node.js 20.19+（20.x）或 22.12+，执行：

```sh
npm ci
npm run dev
```

打开终端显示的本地 URL（默认 http://localhost:5173）。应看到米白底色的
“任务管理”静态首页和“工作空间准备中”提示。缩小窗口至手机宽度，检查文字无横向溢出；
刷新后页面正常，浏览器控制台无报错。此时没有任务操作按钮、看板或主题切换。

```sh
npm run lint
npm run build
npm run preview
```

build 包含 TypeScript 检查，产物输出到 `dist/`。preview 用于在浏览器检查生产构建，
打开终端显示的 URL（默认 http://localhost:4173）。

## 目录

```text
src/
├── main.ts
├── App.vue
├── vite-env.d.ts
├── assets/main.css
├── components/AppHeader.vue
├── types/task.ts
└── composables/
    ├── useTasks.ts   # 仅接口
    └── useTheme.ts   # 仅接口
```

## 后续实现约定

- Task 字段为 id、title、description、status、priority；id 不可修改。
- title 保存前 trim 且不能为空；description 默认为空字符串，status 默认为 todo，priority 默认为 medium。
- 任务通过共享 composable 修改，组件只读状态；操作失败返回明确结果且不修改任务。
- 存储错误单独通过 storageError 暴露；后续使用 `task-manager:tasks:v1` 和 `task-manager:theme:v1`。
- 后续新增 TaskForm、TaskCard、TaskColumn、TaskBoard，实现 CRUD 和跨列拖拽，不含列内排序。
- 后续实现主题切换和选择持久化，以及任务刷新恢复；首次访问默认浅色。
