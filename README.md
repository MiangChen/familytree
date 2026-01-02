# 家谱 - 中国家族树可视化系统

一个基于 Next.js 构建的现代化家谱管理系统，支持多代际展示、血脉连线、照片管理和故事记录。

## ✨ 功能特性

- 📊 **多代际展示** - 支持无限代际，清晰展示家族结构
- 🔗 **血脉连线** - 自动绘制父子关系连线，支持缩放适配
- 👫 **夫妻关系** - 支持一夫多妻历史情况，自动组合显示
- 📷 **照片管理** - 上传头像照片，支持裁剪调整显示区域
- 📖 **相册与故事** - 为每位成员添加相册和人生故事
- 🔺 **血脉回溯** - 选中某人后高亮显示其直系祖先
- 🔍 **缩放功能** - 25%-150% 缩放，适应不同家族规模
- 🎨 **多主题** - 古典中式、现代简约、温馨暖色、典雅深色
- 💾 **数据导入导出** - JSON 格式，方便备份和迁移
- 🐲 **生肖显示** - 根据出生年份自动显示生肖

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/upload/        # 照片上传 API
│   ├── globals.css        # 全局样式
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── FamilyTree.tsx     # 主组件
│   ├── MemberCard.tsx     # 成员卡片
│   ├── CoupleContainer.tsx # 夫妻容器
│   ├── ConnectionLines.tsx # 血脉连线
│   ├── EditModal.tsx      # 编辑弹窗
│   └── MemberDetailModal.tsx # 相册故事弹窗
├── context/               # React Context
│   └── FamilyContext.tsx  # 家族数据状态管理
├── lib/                   # 工具函数
│   ├── utils.ts           # 通用工具
│   └── zodiac.ts          # 生肖计算
├── types/                 # TypeScript 类型
│   └── family.ts          # 家族数据类型定义
public/
├── familyData.json        # 默认家族数据
└── photos/                # 上传的照片存储
```

## 📝 使用说明

### 添加成员
1. 点击代际行中的「+ 添加家族成员」按钮
2. 填写姓名、性别、出生年份等信息
3. 可选择父亲和配偶关系
4. 上传照片并调整显示区域

### 编辑成员
- 点击成员卡片打开编辑弹窗
- 可修改所有信息或删除成员

### 相册与故事
- 点击卡片底部的 📷 或 📖 图标
- 添加更多照片到相册
- 记录人生故事，支持按年份排序

### 血脉回溯
- 点击卡片底部的 🔺 图标
- 高亮显示该成员的所有直系祖先
- 其他成员变灰，便于追溯血脉

### 数据管理
- 点击右上角「⚙️ 设置」
- 可导出 JSON 数据备份
- 可导入已有数据恢复

## 🛠 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: CSS (CSS Variables 主题系统)
- **状态管理**: React Context
- **存储**: LocalStorage + 文件系统

## 📄 数据格式

```typescript
interface FamilyData {
  settings: {
    familyName: string;      // 家族名称
    subtitle: string;        // 副标题
    theme: string;           // 主题
    zoomLevel: number;       // 缩放比例
    showConnections: boolean; // 显示连线
  };
  generations: [{
    id: number;
    name: string;            // 代际名称（如：祖辈、父辈）
    members: [{
      id: number;
      name: string;
      gender: 'male' | 'female';
      birthYear?: number;
      deathYear?: number;
      photo?: string;
      parentId?: number;     // 父亲ID
      spouseIds?: number[];  // 配偶ID列表
      album?: string[];      // 相册
      stories?: Story[];     // 故事
    }]
  }]
}
```

## 📜 许可证

MIT License

## 🙏 致谢

感谢所有为家族历史传承做出贡献的人们。
