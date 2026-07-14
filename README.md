# WeChat Chat Generator 微信聊天生成器

> 在私聊与群聊之间自由切换，在线编辑聊天角色与发言，生成 1179×2556 的 iPhone 微信聊天截图。

[![Deploy to GitHub Pages](https://github.com/gaopengbin/wechat-dialog-generator/actions/workflows/deploy.yml/badge.svg)](https://github.com/gaopengbin/wechat-dialog-generator/actions/workflows/deploy.yml)
[![GitHub](https://img.shields.io/github/license/gaopengbin/wechat-dialog-generator)](./LICENSE)

## 🔗 在线体验

👉 **[https://gaopengbin.github.io/wechat-dialog-generator/](https://gaopengbin.github.io/wechat-dialog-generator/)**

## ✨ 功能特性

- **私聊 / 群聊双模式** — 两套工作区独立保存，Tab 切换不会覆盖内容
- **iPhone 像素级预览** — 1179×2556 画布，复刻 iOS 状态栏、微信导航栏、气泡与底部输入区
- **多种消息类型** — 文字、图片、红包、转账、语音、时间节点
- **群成员管理** — 新增、改名、换头像、删除成员，成员数量自动同步
- **私聊角色管理** — 编辑双方名称、头像和“自己”身份
- **切换发言人** — 选择任意聊天角色，逐条添加任意类型消息
- **群聊标题** — 群名称与实时成员数自动显示在聊天界面
- **消息管理** — 查看最近消息并删除误添加的发言
- **自定义聊天背景** — 设置背景色或上传本地壁纸
- **iOS 状态设置** — 自定义时间、静音、信号、未读数与带数字电量
- **批量导入** — 支持 Markdown / 纯文本格式批量导入聊天记录
- **AI 生成** — 内置豆包 / ChatGPT Prompt 模板，一键生成聊天内容
- **自定义头像** — 为每个群成员上传自定义头像
- **设为自己** — 任意群成员可标记为“自己”，消息自动切换左右方向
- **外观设置** — 自定义气泡颜色、群聊名称、时间、信号、电量等
- **高清截图** — 一键导出 1179×2556 高清 PNG 图片
- **长截图** — 支持完整聊天记录长图导出
- **复制到剪贴板** — 截图直接复制，方便粘贴分享
- **图片本地上传** — 图片消息支持点击上传本地图片
- **纯前端** — 无需服务器，所有数据本地处理，保护隐私

## 📖 使用方法

### 方式一：直接编辑

通过页面顶部 Tab 选择「私聊」或「群聊」。私聊固定两位可编辑角色；群聊支持增加和删除成员，人数会自动同步到聊天标题。

### 方式二：文本导入

在左侧文本框中粘贴聊天记录，支持以下格式：

```
**【3月1日 14:32】**

**张三**：你好，在忙不？
**李四**：不忙，怎么了？
**张三**：[图片]
**李四**：[红包]恭喜发财
**张三**：[转账]200:饭钱
**李四**：[语音]5
```

### 方式三：AI 生成

展开「用豆包 / AI 生成聊天记录」面板，复制 Prompt 发给 AI，将返回内容粘贴导入即可。

## 🛠️ 技术栈

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide React** 图标库
- **html-to-image** 截图导出

## 🚀 本地开发

```bash
# 克隆仓库
git clone https://github.com/gaopengbin/wechat-dialog-generator.git
cd wechat-dialog-generator

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📝 消息格式参考

| 类型 | 格式 | 示例 |
|------|------|------|
| 文字 | `**用户名**：内容` | `**张三**：你好` |
| 图片 | `**用户名**：[图片]` 或 `**用户名**：[图片]URL` | `**张三**：[图片]` |
| 红包 | `**用户名**：[红包]备注` | `**张三**：[红包]恭喜发财` |
| 转账 | `**用户名**：[转账]金额:备注` | `**张三**：[转账]200:饭钱` |
| 语音 | `**用户名**：[语音]秒数` | `**张三**：[语音]5` |
| 时间 | `**【时间】**` | `**【3月1日 14:32】**` |

## 📄 License

MIT
