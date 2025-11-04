# LinkNote Web (React + Vite + TS)

Milestone 0: 脚手架、代理、布局、HTTP 封装与会话存储。

## 开发

```
cd web
npm install
npm run dev
```

开发代理：将 `/linknote` 代理到 `http://localhost:8080`，需确保后端在本地 8080 端口并带有上下文路径 `/linknote`。

## 构建

```
npm run build
npm run preview
```

## 环境变量
- `.env.development`: `VITE_API_BASE=/linknote`
- `.env.production`: `VITE_API_BASE=http://localhost:8080/linknote`

## 结构
- `src/lib/http.ts`：axios 实例与通用方法（含状态码处理）
- `src/store/session.ts`：Zustand 用户会话（localStorage 持久化）
- `src/App.tsx`：AntD 布局与导航
- `src/routes/`：路由注册
- `src/pages/*`：页面占位（后续里程碑实现）

后续里程碑将依次实现：Auth、Files、Notes、Questions、Wrong Answers、Ask。

