<div align="center">
  <h1>数据可视化大屏</h1>
  <p>基于 Three.js + React 19 + ECharts 的 3D 地图可视化大屏项目</p>
  <p>包含 3D 地图渲染、轮廓飞线、侧边扫光、多图表联动等丰富功能</p>

<p>
    <a href="https://github.com/knight-L/sc-datav/pulls">
      <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome">
    </a>
    <a href="https://react.dev/">
      <img src="https://img.shields.io/badge/React-19.1.1-61dafb?style=flat-square&logo=react" alt="React">
    </a>
    <a href="https://threejs.org/">
      <img src="https://img.shields.io/badge/Three.js-0.181.2-black?style=flat-square&logo=three.js" alt="Three.js">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
    </a>
    <a href="https://github.com/knight-L/datav/stargazers">
      <img src="https://img.shields.io/github/stars/knight-L/datav?style=flat-square" alt="GitHub stars">
    </a>
    <a href="https://github.com/knight-L/datav/network/members">
      <img src="https://img.shields.io/github/forks/knight-L/datav?style=flat-square" alt="GitHub forks">
    </a>
  </p>
</div>

## 预览

| [预览地址](https://knight-l.github.io/sc-datav/#/demo0) | [预览地址](https://knight-l.github.io/sc-datav/#/demo1) |
| ------------------------------------------------------- | ------------------------------------------------------- |
| ![demo1](./public/demo_0.jpg)                           | ![demo2](./public/demo_1.jpg)                           |

| [预览地址](https://knight-l.github.io/sc-datav/#/demo2) | [预览地址](https://knight-l.github.io/sc-datav/#/demo3) |
| ------------------------------------------------------- | ------------------------------------------------------- |
| ![demo3](./public/demo_2.jpg)                           | ![demo4](./public/demo_3.jpg)                           |

## 地图轮廓贴图下载工具

[https://github.com/knight-L/sat-hunter](https://github.com/knight-L/sat-hunter)

## 功能特性

1. **3D 地图可视化**: 基于 Three.js 的 3D 地图渲染，轮廓飞线动画效果，侧边扫光视觉效果
2. **省级地图展示**: 四川省地理轮廓精确呈现
3. **多图表联动**: 柱状图、折线图等多种数据可视化形式
4. **响应式设计**: 支持多种屏幕尺寸自适应
5. **实时调试面板**: 使用 Leva 实现参数实时调整

## 技术栈

本项目是一个基于现代 Web 技术的数据可视化大屏应用，主要技术栈包括：

- **核心框架**: React 19 + TypeScript
- **构建工具**: Vite (Rolldown 版本)
- **3D 可视化**: Three.js + @react-three/fiber + @react-three/drei
- **数据可视化**: ECharts
- **地理数据处理**: D3-geo
- **动画库**: GSAP
- **样式库**: Styled-components
- **调试工具**: Leva
- **自适应布局**: autofit.js

## 目录结构

```
src/
├── assets/             # 静态资源文件
│   ├── sc.json         # 四川省地理数据
│   └── sc_outline.json # 四川省轮廓数据
├── components/         # 通用组件
│   ├── chart.tsx       # 图表组件
│   └── seamVirtualScroll.tsx # 虚拟滚动组件
├── hooks/              # 自定义Hooks
├── pages/SCDataV/      # 数据大屏页面
│   ├── index.tsx       # 页面入口
│   ├── scMap.tsx       # 地图组件
│   ├── flyLine.tsx     # 飞线动画组件
│   ├── chart1.tsx      # 图表1
│   ├── chart2.tsx      # 图表2
│   ├── chart3.tsx      # 图表3
│   └── content.tsx     # 内容布局组件
└── App.tsx             # 应用根组件
```

## 开发指南

### 环境要求

- Node.js >= 18
- PNPM >= 8

### 安装依赖

```bash
pnpm install
```

### 开发运行

```bash
# 启动开发服务器
pnpm dev
```

### 构建部署

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```
