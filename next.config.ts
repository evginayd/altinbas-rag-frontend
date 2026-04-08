import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Workspace root'u açıkça belirt - parent dizinlerdeki lockfile uyarısını engeller
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
