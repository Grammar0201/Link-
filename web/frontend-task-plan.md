# LinkNote React 前端开发任务步骤
本文档整理了使用 React 技术栈实现 LinkNote 前端的开发步骤，按里程碑拆分以便团队协作和追踪。各里程碑相对独立，可按顺序迭代交付。

## 0. 技术栈与基础设施

- 框架：React 18 + TypeScript + Vite
- UI：Ant Design，配套使用 antd 的 `message/notification`
- 状态管理：Zustand（处理会话与全局状态）
- 路由：react-router-dom v6
- HTTP：axios，封装在 `src/lib/http.ts`
- 图表：ECharts 或 Recharts（用于错题分析）

## 1. 里程碑拆分

### Milestone 0 - 脚手架与基础设施（已完成）
- [x] 初始化 Vite React-TS 项目、配置路径别名
- [x] 配置开发代理 `/linknote -> http://localhost:8080`
- [x] 引入 Ant Design，搭建全局布局/导航/页脚
- [x] 创建 axios 客户端，统一处理 202/400/404/500
- [x] 建立用户会话 store（Zustand + localStorage）
- [x] 规划路由与占位页

### Milestone 1 - 认证流程（已完成）
- [x] 登录/注册页面表单与校验
- [x] 接入 `/api/auth/login`、`/api/auth/register`
- [x] 写入并持久化最小 User 信息；显示提示消息
- [x] 路由守卫 + 登录后跳转逻辑 + 退出操作

### Milestone 2 - 文件管理（已完成）
- [x] `/files` 页面
  - [x] 文件上传（FormData，附带 `userId` 字段）
  - [x] 列表展示 `PdfDocument[]`，支持手动刷新
  - [x] 删除文件（DELETE `/api/files/delete/{fileId}`）
  - [x] 处理 202 状态（展示处理中提示并轮询/刷新）

### Milestone 3 - 笔记管理
- [ ] `/notes` 页面
  - [ ] 新建笔记（POST `/api/files/note`）
  - [ ] 列出 `Note[]`，提供删除操作
  - [ ] 空态与错误处理

### Milestone 4 - 题目与答题
- [ ] `/questions` 页面
  - [ ] 生成题目（POST `/api/questions/generate`）
  - [ ] 获取未答题列表（GET `/api/questions/{userId}/unanswered`）
  - [ ] 答题提交（POST `/api/questions/submit`），展示对错反馈
  - [ ] 题目卡片组件（题干、选项、难度、关联文档）

### Milestone 5 - 错题管理与分析
- [ ] `/wrong-answers` 页面
  - [ ] 分页列表（GET `/page/{userid}`）
  - [ ] 全量/分类筛选（GET `/answers/{userid}` 与 `/wrong/{category}`）
  - [ ] 删除错题（DELETE `/delete/{id}`）
  - [ ] 分析图表（GET `/wrong/analyse/{userId}`）

### Milestone 6 - 问答服务
- [ ] `/ask` 页面
  - [ ] 表单提交问题（POST `/api/ask`）
  - [ ] 展示答案、加载与错误状态
  - [ ] 可选：支持切换至 Python 问答后端（配置可扩展）

### Milestone 7 - 体验打磨
- [ ] 统一空态/异常组件与 Loading 状态
- [ ] 删除确认、Toast 策略、表单校验提示
- [ ] 响应式布局与可访问性优化
- [ ] 代码清理（类型补全、文件组织）

## 2. 通用任务提醒

- 与后端保持环境同步：Base URL `http://localhost:8080/linknote`
- 注意文件/笔记删除都走 `/api/files/delete/{id}`，区分参数来源
- 留意后端返回 User 对象包含 `password` 字段，前端避免展示或持久化
- 上传文件大小受限于 30MB/60MB，前端可做前置校验
- Windows 本地上传返回 202 状态属于正常，需要提示用户等待处理

## 3. 建议的提交流程

1. 每个里程碑独立分支，完成后自测
2. 更新 `web/README.md` 或对应页面的 TODO 注释
3. 提交 PR/合并后再开始下一个里程碑

## 4. 参考资料

- `web/src/lib/http.ts`：HTTP 封装
- `web/src/store/session.ts`：会话管理
- `API接口文档.md`：后端端点说明
- `后端运行指南.md`：后端与数据库启动细节

如需新增需求，可在文档末尾追加新的里程碑或补充子任务。
