<div align="center">
  <a href="./README.en.md">English</a> | 简体中文
</div>

# 主页 | HomePage  

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/volzhang/HomePage/blob/main/LICENSE)
[![Vite](https://img.shields.io/badge/built%20with-Vite-%23646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/-TypeScript-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

![Screenshot-Desktop.png](screenshots/Screenshot-Desktop.png)

简洁 · 美观 · 完全本地 · 现代浏览器起始页

## 功能
- 🚀 **干净简洁** ：无数据上传，无广告，网络请求仅限必要功能（获取壁纸/图标）。
- 🎨 **高度自定义** ：自由设置背景壁纸、磁贴布局（快捷方式）和默认搜索引擎。
- 💾 **跨设备无缝** ：一键导出/导入 JSON 文件，轻松实现多设备间的迁移和备份。
- 🌍 **中英双语** ：支持英语和简体中文，界面简洁友好。

## 技术栈与当前状态

- Vite + TypeScript  
- React  
- TailwindCSS + shadcn/ui
- Zustand（逐步替换中） + idb-keyval（兼容 localforage 的 IndexedDB 数据）


项目正在进行重构，以减少第三方依赖并提升长期可维护性。

状态管理正在从 Zustand 迁移到自实现 Signal 框架，当前已迁移约 90%。

UI 组件逐步由自制实现替代 shadcn/ui，视觉风格保持一致，不影响现有使用体验。

## 立即体验

立即体验👉 **[https://volzhang.com](https://volzhang.com)**

或在 Edge 浏览器中安装本插件 👉 **[Edge扩展链接](https://microsoftedge.microsoft.com/addons/detail/%E4%B8%BB%E9%A1%B5/gblipikohcegedalbnljafomaadhdjdp)**

## 作为 Edge/Chrome 扩展安装（开发者模式）
1. 下载本仓库中 dist 文件夹
2. 打开 Edge → 扩展 → 打开“开发者模式”
3. 点击“加载已解压的扩展程序” → 选择 dist 文件夹
4. 在"来自其他源"中找到本扩展（Home Page 或 主页），点击启用

注意，请关闭其他修改起始页功能的插件，避免冲突。

## 🗺️ 后续计划 

目前项目还处于早期阶段，未来计划大致如下（按优先级排序）：

- 🌙 深色/浅色模式（v3.4.0 已实现初步版本)
- 🔍 搜索引擎增强：手动添加引擎 + 本地瓷砖搜索 + 高级模式 （v3.12.0 已实现初步版本）
- ⚙️ 瓷砖图标：自动抓取主流网站 favicon （v3.3.6 已实现）
- 💡 实用的本地小工具，比如，待办，便利贴。(v3.7.0 已实现初步版本)
- 📱 移动端 / 平板适配。

## 欢迎反馈
欢迎在👉 [Issues](https://github.com/volzhang/HomePage/issues) 提出你最想要的功能，我会根据反馈调整优先级～



