#!/bin/bash

# 家族照片墙 - 启动脚本

cd "$(dirname "$0")"

# 关闭已有的 next dev 进程
echo "🔄 检查并关闭已有进程..."
pkill -f "next dev" 2>/dev/null
rm -rf .next/dev/lock 2>/dev/null
sleep 1

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
fi

echo "🚀 启动家族照片墙..."
echo "📍 访问地址: http://localhost:3000"
echo ""

# 启动后自动打开浏览器
(sleep 2 && open http://localhost:3000) &

npm run dev
