# AI 赋能学习平台 v1.0

一个全栈 AI 驱动的智能学习平台，集成 11 个功能模块，利用大语言模型为学习者提供个性化的学习辅助体验。

## 技术栈

**前端**: React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + Zustand + React Query v5 + Framer Motion

**后端**: Python Flask 3.0 + SQLite (WAL) + OpenAI SDK (阿里云 DashScope / 通义千问)

**AI 模型**: Qwen 2.5-7B (文本) / Qwen 2.5-VL-32B (视觉)

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 📚 AI 阅读助手 | `/books` | 上传书籍，AI 生成摘要，SQ3R 阅读法指导，作者角色对话 |
| 📄 AI 论文助手 | `/papers` | 上传 PDF 论文，全文翻译，智能问答，术语标注 |
| ✨ AI 名言生成 | `/quotes` | 按主题/风格生成名言，每日名言，名言库管理 |
| 🧮 AI 解题助手 | `/problems` | 逐步引导解题，提示系统，生成同类练习题 |
| 🍅 AI 番茄钟 | `/pomodoro` | 专注计时，学习统计，每日数据追踪 |
| 🌸 AI 心理放松 | `/relaxation` | 情感陪伴对话，情绪识别，压力追踪 |
| 📋 AI 文档协作 | `/documents` | 文档创建编辑，质量评估，内容扩展与优化建议 |
| 🧠 AI 头脑风暴 | `/brainstorm` | 四角色多视角讨论（乐观/悲观/现实/创意），综合建议 |
| ✍️ AI 作文批改 | `/essays` | 提交作文获取评分与反馈，优化示例，改进建议 |
| 📝 AI 错题管理 | `/error-questions` | 错题录入与分析，薄弱点识别，生成针对性练习 |
| 📓 AI 笔记助手 | `/notes` | 康奈尔笔记法 & 费曼学习法，间隔重复复习 |

## 快速开始

### 环境要求

- Python 3.8+
- Node.js 18+
- 阿里云 DashScope API Key

### 后端启动

```bash
cd backend
pip install -r requirements.txt
# 配置环境变量 DASHSCOPE_API_KEY
python app.py
# 服务运行在 http://localhost:5000
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
# 服务运行在 http://localhost:5173
```

## 项目结构

```
├── backend/
│   ├── app.py                 # Flask 应用入口
│   ├── config.py              # 配置（API Key、模型名称）
│   ├── database.py            # SQLite 数据库连接
│   ├── schema.sql             # 数据表定义（12 张表）
│   ├── blueprints/            # 11 个功能模块 API
│   ├── services/ai_service.py # LLM 调用封装
│   └── utils/                 # 工具函数（ID 生成、文件解析）
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # 12 个页面组件
│   │   ├── components/        # 50+ UI 组件
│   │   ├── store/             # Zustand 状态管理
│   │   ├── utils/api-client.ts # Axios API 客户端
│   │   └── types/             # TypeScript 类型定义
│   └── Dockerfile             # Docker 生产构建
```

## 开发命令

```bash
# 后端
python app.py                          # 启动服务
curl http://localhost:5000/api/health  # 健康检查

# 前端
npm run dev                    # 开发服务器
npm run build                  # 生产构建 (tsc + vite build)
npm run lint                   # ESLint 检查
npm run test                   # 运行测试
```

## License

MIT
