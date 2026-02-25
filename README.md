# AI赋能学习平台

全栈 AI 学习平台，集成通义千问大模型，提供智能阅读、论文分析、解题辅导等 11 个功能模块。

## 技术栈

**前端**: React 18 + TypeScript + Vite 5 + Tailwind CSS + Zustand + React Query

**后端**: Python 3 + Flask + SQLite + OpenAI SDK (DashScope)

**AI 模型**: 通义千问 qwen2.5-7b-instruct-1m

## 功能模块

| 模块 | 说明 |
|------|------|
| 书籍阅读 | 上传书籍(TXT/PDF/DOCX)，AI摘要，SQ3R阅读法指导，与作者对话 |
| 论文分析 | PDF上传，AI翻译，术语注释，论文问答 |
| 每日金句 | AI生成主题金句，收藏管理 |
| 解题辅导 | AI分析题目，引导式解题，提示系统 |
| 番茄钟 | 专注计时，学习统计 |
| 放松聊天 | AI情感陪伴，情绪识别 |
| 文档编辑 | 文档CRUD，AI结构建议与质量评估 |
| 资源搜索 | AI搜索策略，资源推荐 |
| 头脑风暴 | 四角色AI讨论，观点综合 |
| 作文批改 | AI多维度评分与反馈 |
| 错题本 | 错题管理，薄弱分析，AI生成练习 |

## 项目结构

```
learning_website/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── utils/
│   │   └── types/
│   └── package.json
├── backend/           # Flask 后端
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── schema.sql
│   ├── blueprints/    # 11个功能蓝图
│   ├── services/      # AI服务封装
│   └── utils/         # 工具函数
└── README.md
```

## 快速开始

### 后端

```bash
cd backend
pip install -r requirements.txt
python app.py
# 运行在 http://localhost:5000
```

### 前端

```bash
cd frontend
npm install
npm run dev
# 运行在 http://localhost:5173
```

## API 概览

后端提供 65 个 RESTful API 端点，基础路径 `/api/v1/`（番茄钟为 `/api/pomodoro`）。

健康检查: `GET /api/health`
