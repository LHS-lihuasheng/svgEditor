# 项目运行指南

## 环境准备
1. 安装 Node.js v18+ 和 pnpm 包管理器

## 安装依赖
```bash
pnpm install
```

## 启动开发服务器
```bash
pnpm run dev
```

## 访问应用
在浏览器中打开：
```bash
http://localhost:3000
```

## 其他常用命令
```bash
# 生产环境构建
pnpm run build

# 启动生产服务器
pnpm run start
```

## 注意事项
- 请确保已配置必要的环境变量（参考 .env.example 文件）
- 若 3000 端口被占用，会自动切换至可用端口（控制台会显示实际使用端口）