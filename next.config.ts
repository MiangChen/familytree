import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',  // 静态导出
  images: {
    unoptimized: true,  // 静态导出需要禁用图片优化
  },
  // Gitee Pages 部署时可能需要设置 basePath
  // basePath: '/familytree',
};

export default nextConfig;
