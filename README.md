# AI 赋能学习平台

一个基于 AI 的综合学习平台，提供多种智能学习工具，帮助用户高效学习。

## 功能模块

- **书籍阅读** — 在线阅读与管理书籍
- **论文管理** — 上传、阅读和管理学术论文
- **每日名言** — AI 生成励志名言，构建个人名言库
- **智能解题** — AI 辅助解答学习中遇到的问题
- **番茄钟** — 专注计时与学习统计，含森林可视化
- **放松聊天** — 与 AI 轻松对话，缓解学习压力
- **文档编辑** — 在线文档创建与编辑
- **资源搜索** — 智能搜索学习资源
- **头脑风暴** — AI 协助进行创意发散与思维整理
- **作文批改** — AI 批改作文并给出评分与建议
- **错题本** — 上传错题，AI 分析错因并提供解题思路

## 技术栈

**前端：** React 18 / TypeScript / Vite 5 / Tailwind CSS 3 / Zustand / React Query v5 / React Router v6 / Framer Motion

## 快速开始

```bash
# 安装依赖
cd frontend
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 环境变量

在 `frontend/` 目录下创建 `.env` 文件：

```env
VITE_API_URL=http://localhost:5000
```

## 项目结构

```
frontend/
├── src/
│   ├── components/    # 组件
│   ├── pages/         # 页面
│   ├── store/         # Zustand 状态管理
│   ├── types/         # TypeScript 类型定义
│   ├── utils/         # 工具函数（API 客户端等）
│   ├── App.tsx        # 路由配置
│   └── main.tsx       # 入口文件
├── package.json
└── vite.config.ts
```

## License

MIT
