# 三国人物关系力图

一个基于 Vue 3 + D3.js + Element Plus 的三国人物关系可视化应用。

## 功能特点

- 力导向图展示三国人物关系网络
- 按势力（魏蜀吴）和身份（主公/文臣/武将）进行颜色分类
- 点击人物查看简介及相关人物
- 查看人物间的相交经历
- 支持拖拽调整节点位置
- 响应式布局

## 技术栈

- **框架**: Vue 3
- **图表库**: D3.js
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **构建工具**: Vite

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 配置大模型 API

编辑 `.env` 文件，配置你的大模型 API：

```env
VITE_LLM_API_BASE_URL=http://localhost:11434/api/generate
VITE_LLM_API_MODEL=qwen2.5:7b
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
sanguo-vue-app/
├── public/
│   └── data/
│       └── characters.json      # 人物数据文件
├── src/
│   ├── components/
│   │   ├── ForceGraph.vue       # 力图组件
│   │   └── SideBar.vue          # 侧边栏组件
│   ├── stores/
│   │   └── characterStore.js    # 人物状态管理
│   ├── api/
│   │   └── llmApi.js            # 大模型 API 调用
│   ├── utils/
│   │   ├── colors.js            # 颜色配置
│   │   └── constants.js         # 常量定义
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── .env                          # 环境变量配置
├── vite.config.js
└── package.json
```

## 数据结构

### 人物数据 (characters.json)

```json
{
  "characters": [
    {
      "id": 1,
      "name": "刘备",
      "faction": "shu",      // 势力：wei/shu/wu/unknown
      "role": "lord"         // 身份：lord/minister/general/unknown
    }
  ],
  "relationships": [
    {
      "source": 1,
      "target": 2,
      "type": "结义兄弟"
    }
  ]
}
```

## 操作说明

- **点击人物**：显示人物简介和相关人物
- **双击人物**：切换到该人物
- **拖拽节点**：调整节点位置
- **点击相关人物**：查看相交经历
- **双击相关人物**：切换到该人物

## 颜色说明

### 边框颜色（代表势力）

- 蓝色 - 魏
- 绿色 - 蜀
- 橙色 - 吴
- 灰色 - 未知

### 填充颜色（代表身份）

- 金色 - 主公
- 天蓝色 - 文臣
- 番茄红 - 武将
- 白灰色 - 未知

## License

MIT
