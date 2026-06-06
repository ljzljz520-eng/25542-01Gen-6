# 实验版本记录系统

> 为研究人员设计的数据处理实验版本管理工具，支持保存脚本、参数和结果文件的完整版本历史，支持版本对比和安全回滚。

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [安装说明](#安装说明)
- [快速开始](#快速开始)
- [功能边界](#功能边界)
- [数据说明](#数据说明)
- [验证路径](#验证路径)
- [项目结构](#项目结构)
- [常见问题](#常见问题)

## 功能特性

### ✅ 已实现

1. **版本管理**
   - 保存数据处理脚本、参数配置和结果文件的完整版本
   - 自动递增版本号，版本说明强制非空验证
   - 版本时间线展示，支持快速切换查看历史版本
   - 支持拖拽上传和点击选择结果文件

2. **版本对比**
   - 脚本差异：逐行文本比较，绿色标记新增，红色标记删除
   - 参数差异：递归比较参数对象，区分新增/删除/修改/未变四种类型
   - 支持分栏视图和统一视图切换
   - 差异统计卡片展示变更概览

3. **版本回滚**
   - 安全回滚机制：恢复历史版本的参数和脚本
   - **核心保障**：回滚时创建新版本，保留所有历史结果文件（不删除任何数据）
   - 回滚版本有明确标记，记录回滚来源版本

4. **数据持久化**
   - 浏览器本地存储 (localStorage)，无需后端服务
   - 预置 3 个示例实验用于演示
   - 数据导出/导入（可扩展）

### ⏳ 待扩展

- 多用户协作和权限管理
- 云端数据同步
- 大文件分片上传
- Git 仓库集成
- 实验运行监控

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具 |
| Zustand | 5.x | 状态管理 |
| React Router DOM | 7.x | 路由管理 |
| TailwindCSS | 3.x | 样式框架 |
| Prism.js | 1.29.x | 代码语法高亮 |
| diff | 5.2.x | 文本差异比较 |
| Lucide React | 0.511.x | 图标库 |

## 安装说明

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 或 npm >= 9.0.0 或 yarn >= 1.22.0

### 依赖安装

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 启动开发服务器

```bash
pnpm dev
# 默认运行在 http://localhost:5173
```

### 生产构建

```bash
pnpm build
# 构建产物输出到 dist/ 目录
```

### 预览生产构建

```bash
pnpm preview
```

### 代码检查

```bash
# TypeScript 类型检查
pnpm check

# ESLint 检查
pnpm lint

# 类型检查 + 构建
pnpm build
```

## 快速开始

### 1. 查看示例实验

启动应用后，首页会展示 3 个预置的示例实验：

- **图像分类模型训练**：4 个版本，包含回滚版本演示
- **数据清洗流水线**：2 个版本，展示参数迭代
- **NLP 情感分析**：1 个版本，展示初始版本

### 2. 创建新实验

1. 点击首页右上角「新建实验」按钮
2. 填写实验名称和描述
3. 编写初始数据处理脚本（支持 Python、JavaScript、TypeScript）
4. 配置实验参数（JSON 格式）
5. **必填**：填写版本说明，描述本次实验的目的
6. 点击「创建实验」完成

### 3. 保存新版本

1. 进入实验详情页
2. 修改脚本或参数
3. 点击「保存新版本」按钮
4. **必填**：填写版本说明，描述改动内容
5. （可选）拖拽或点击上传结果文件（CSV、JSON、TXT、图片等）
6. 点击「保存版本」完成

### 4. 对比版本差异

1. 在实验详情页的版本时间线中
2. 点击版本卡片左侧的复选框，选择 2 个版本
3. 点击顶部「对比选中版本」按钮
4. 切换「脚本差异」和「参数差异」标签页查看详细对比

### 5. 回滚版本

1. 在版本时间线中点击选中要回滚到的历史版本
2. 点击顶部「回滚到此版本」按钮
3. 仔细阅读提示：**参数将恢复，但所有结果文件将永久保留**
4. **必填**：填写回滚说明，说明回滚原因
5. 点击「确认回滚」完成，系统将创建一个新的回滚版本

## 功能边界

### ✅ 支持的功能

| 功能 | 说明 | 限制 |
|------|------|------|
| 脚本保存 | 支持 Python、JavaScript、TypeScript、JSON、Bash | 纯文本，最大 1MB |
| 参数保存 | JSON 格式的任意参数配置 | 最大 500KB |
| 结果文件 | 支持文本类文件（CSV、JSON、TXT、XML 等） | 单个文件最大 10MB，单次最多上传 10 个文件 |
| 版本对比 | 脚本逐行对比，参数键级对比 | 仅支持文本差异，不支持二进制文件对比 |
| 版本回滚 | 恢复脚本和参数，保留所有结果文件 | 不能撤销回滚操作 |
| 版本说明 | 所有版本操作必须填写说明 | 不能为空，最大 500 字符 |

### ❌ 不支持的功能

- 二进制文件（如 .exe、.dll、压缩包）的内容预览和差异对比
- 实时协作编辑
- 版本删除（设计原则：所有版本永久保留）
- 权限管理和多用户隔离
- 数据加密存储
- 大文件（>10MB）上传

### ⚠️ 设计原则

1. **不可变性**：版本一旦保存，内容不可修改或删除
2. **数据完整性**：回滚操作只创建新版本，不修改或删除历史数据
3. **可追溯性**：每个版本必须有说明，记录变更原因
4. **结果保留**：所有历史结果文件永久保留，不因回滚而丢失

## 数据说明

### 数据模型

```typescript
// 实验
interface Experiment {
  id: string;                    // 唯一标识
  name: string;                  // 实验名称
  description: string;           // 实验描述
  currentVersionId: string;      // 当前版本 ID
  createdAt: string;             // 创建时间 (ISO 8601)
  updatedAt: string;             // 更新时间 (ISO 8601)
  versions: Version[];           // 所有版本列表
}

// 版本
interface Version {
  id: string;                    // 唯一标识
  experimentId: string;          // 所属实验 ID
  versionNumber: number;         // 版本号（自动递增）
  script: string;                // 脚本内容
  params: Record<string, any>;   // 参数配置
  description: string;           // 版本说明（非空）
  isRollback: boolean;           // 是否为回滚版本
  rollbackFromVersionId?: string;// 回滚来源版本 ID
  createdAt: string;             // 创建时间 (ISO 8601)
  resultFiles: ResultFile[];     // 结果文件列表
}

// 结果文件
interface ResultFile {
  id: string;                    // 唯一标识
  versionId: string;             // 所属版本 ID
  name: string;                  // 文件名
  size: string;                  // 文件大小（格式化后）
  type: string;                  // 文件类型（扩展名）
  content: string;               // 文件内容（Base64 或文本）
  createdAt: string;             // 创建时间 (ISO 8601)
}
```

### 存储位置

所有数据存储在浏览器的 `localStorage` 中，键名为 `experiment-versions`。

**注意**：
- 清除浏览器数据会导致所有实验数据丢失
- 不同浏览器之间数据不共享
- 建议定期导出重要数据（可扩展功能）

### 数据大小限制

| 数据类型 | 建议最大大小 | 硬限制 |
|----------|-------------|--------|
| 单个脚本 | 500KB | 1MB |
| 单个参数配置 | 100KB | 500KB |
| 单个结果文件 | 5MB | 10MB |
| 单实验总数据 | 50MB | 100MB |

超过限制可能导致浏览器性能下降或存储失败。

## 验证路径

### 功能验证清单

#### ✅ 基础功能验证

| 步骤 | 操作 | 预期结果 | 验证文件 |
|------|------|----------|---------|
| 1 | 启动应用 `pnpm dev` | 应用正常启动，首页加载完成 | [package.json](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/package.json) |
| 2 | 查看首页 | 显示 3 个示例实验，统计数据正确 | [OverviewPage.tsx](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/pages/OverviewPage.tsx) |
| 3 | 点击「图像分类模型训练」 | 进入实验详情页，显示 4 个版本 | [ExperimentDetailPage.tsx](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/pages/ExperimentDetailPage.tsx) |
| 4 | 在版本时间线点击 v1 | 右侧显示 v1 的脚本、参数和结果文件 | [VersionContent.tsx](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/components/version/VersionContent.tsx) |
| 5 | 点击「保存新版本」 | 弹出表单，包含脚本、参数、版本说明、结果文件上传 | [VersionForm.tsx](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/components/version/VersionForm.tsx) |

#### ✅ 版本说明非空验证

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 打开保存新版本表单 | 版本说明输入框标记为必填 |
| 2 | 不填写版本说明，点击「保存版本」 | 显示错误提示「版本说明不能为空」，按钮禁用 |
| 3 | 填写版本说明 | 错误提示消失，显示「✓ 版本说明已填写」 |
| 4 | 填写版本说明后提交 | 版本保存成功 |

**验证位置**：
- [ExperimentForm.tsx](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/components/experiment/ExperimentForm.tsx#L105-L130)
- [VersionForm.tsx](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/components/version/VersionForm.tsx#L57-L69)
- [RollbackModal.tsx](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/components/version/RollbackModal.tsx#L65-L77)

#### ✅ 结果文件上传验证

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 打开保存新版本表单 | 显示拖拽上传区域 |
| 2 | 拖拽 1-2 个文本文件到上传区域 | 文件添加到列表，显示文件名和大小 |
| 3 | 鼠标悬停在文件上 | 显示删除按钮 |
| 4 | 点击删除按钮 | 文件从列表中移除 |
| 5 | 点击上传区域 | 弹出文件选择对话框 |
| 6 | 选择多个文件 | 所有文件添加到列表 |
| 7 | 填写版本说明，提交表单 | 版本保存成功，结果文件关联到新版本 |

**验证位置**：
- [VersionForm.tsx](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/components/version/VersionForm.tsx#L248-L318)
- [useStore.ts](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/store/useStore.ts#L86-L95)

#### ✅ 版本对比验证

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 在实验详情页，勾选 v1 和 v2 两个版本 | 顶部显示「对比选中版本」按钮 |
| 2 | 点击「对比选中版本」 | 进入对比页，显示脚本差异 |
| 3 | 查看脚本差异 | 新增行绿色高亮，删除行红色高亮 |
| 4 | 切换到「参数差异」标签 | 显示新增、删除、修改、未变参数统计卡片和详情 |
| 5 | 点击「返回实验详情」 | 返回实验详情页 |

**验证位置**：
- [VersionDiff.tsx](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/components/version/VersionDiff.tsx)
- [diff.ts](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/utils/diff.ts)

#### ✅ 版本回滚验证（核心功能）

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 在版本时间线选中 v1（非当前版本） | 顶部显示「回滚到此版本」按钮 |
| 2 | 点击「回滚到此版本」 | 弹出确认弹窗，提示「参数将恢复，结果文件永久保留」 |
| 3 | 不填写说明尝试提交 | 显示错误提示「版本说明不能为空」 |
| 4 | 填写回滚说明，确认提交 | 创建新的回滚版本 v5 |
| 5 | 查看 v5 的脚本和参数 | 与 v1 的脚本和参数完全一致 |
| 6 | 查看 v5 的结果文件 | **包含所有历史版本（v1-v4）的全部结果文件** |
| 7 | 查看 v5 的标记 | 显示「回滚版本」标记，来源为 v1 |

**验证位置**：
- [RollbackModal.tsx](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/components/version/RollbackModal.tsx)
- [useStore.ts](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/store/useStore.ts#L113-L154)

**核心逻辑**：
```typescript
// 回滚时合并所有历史结果文件
const allResultFiles: ResultFile[] = experiment.versions.flatMap((v) => v.resultFiles);
```

#### ✅ 数据持久化验证

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 完成上述操作后，刷新浏览器 | 所有实验和版本数据保持不变 |
| 2 | 打开浏览器开发者工具 → Application → Local Storage | 存在 `experiment-versions` 键，包含所有数据 |
| 3 | 重启开发服务器 | 数据保持不变 |

**验证位置**：
- [storage.ts](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/utils/storage.ts)
- [mockData.ts](file:///Users/kkcarrot/solo/25542/25542-01Gen-6/src/utils/mockData.ts)

### 自动化验证

```bash
# 类型检查
pnpm check

# 代码质量检查
pnpm lint

# 构建验证
pnpm build

# 启动开发服务器（手动验证）
pnpm dev
```

## 项目结构

```
src/
├── types/              # TypeScript 类型定义
│   └── index.ts        # 核心接口定义
├── utils/              # 工具函数
│   ├── storage.ts      # localStorage 操作
│   ├── diff.ts         # 差异比较算法
│   └── mockData.ts     # 示例数据
├── store/              # 状态管理
│   └── useStore.ts     # Zustand store
├── components/         # React 组件
│   ├── common/         # 通用组件
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── TabView.tsx
│   │   ├── CodeEditor.tsx
│   │   └── DiffViewer.tsx
│   ├── layout/         # 布局组件
│   │   └── Header.tsx
│   ├── experiment/     # 实验相关组件
│   │   ├── ExperimentCard.tsx
│   │   ├── ExperimentForm.tsx
│   │   └── VersionTimeline.tsx
│   └── version/        # 版本相关组件
│       ├── VersionContent.tsx
│       ├── VersionForm.tsx
│       ├── RollbackModal.tsx
│       └── VersionDiff.tsx
├── pages/              # 页面组件
│   ├── OverviewPage.tsx
│   ├── ExperimentDetailPage.tsx
│   └── ComparePage.tsx
├── lib/                # 库工具
│   └── utils.ts        # cn 工具函数
├── App.tsx             # 应用入口（路由配置）
├── main.tsx            # React 挂载点
└── index.css           # 全局样式
```

## 常见问题

### Q: 数据会丢失吗？

A: 数据存储在浏览器 localStorage 中。除非您手动清除浏览器数据，否则数据会一直保留。但建议定期导出重要数据。

### Q: 可以删除某个版本吗？

A: 不可以。设计原则是所有版本永久保留，确保实验的可追溯性。如果需要撤销某个版本的改动，请使用「回滚」功能。

### Q: 回滚后之前的结果文件会丢失吗？

A: **绝对不会**。回滚操作会创建一个新版本，新版本会包含**所有历史版本**的全部结果文件。这是本系统的核心设计原则之一。

### Q: 支持哪些编程语言的脚本？

A: 语法高亮支持 Python、JavaScript、TypeScript、JSON、Bash。但脚本内容是纯文本存储，您可以保存任何语言的代码。

### Q: 可以在不同设备间同步数据吗？

A: 当前版本不支持云端同步。您可以通过浏览器的同步功能（如 Chrome 同步）间接同步 localStorage 数据，或扩展开发导出/导入功能。

### Q: 版本说明为什么不能为空？

A: 为了确保实验的可追溯性。每个版本的变更都应该有明确的记录，方便团队协作和日后查阅。这是科学研究的良好实践。

---

## License

MIT
