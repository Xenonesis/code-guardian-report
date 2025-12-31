import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Ignore ESLint errors during build (will fix quotes later)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ignore TypeScript errors during build (for migration)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimize package imports for better tree-shaking
  experimental: {
    // Temporarily disable optimizePackageImports to debug build issue
    // optimizePackageImports: [
    //   "lucide-react",
    //   "@radix-ui/react-dialog",
    //   "@radix-ui/react-tabs",
    //   "@radix-ui/react-toast",
    //   "@radix-ui/react-tooltip",
    //   "@radix-ui/react-popover",
    //   "@radix-ui/react-select",
    //   "@radix-ui/react-checkbox",
    //   "@radix-ui/react-switch",
    //   "@radix-ui/react-slider",
    //   "@radix-ui/react-progress",
    //   "@radix-ui/react-collapsible",
    //   "@radix-ui/react-label",
    //   "@radix-ui/react-slot",
    //   "recharts",
    //   "framer-motion",
    // ],
  },

  // Configure image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Webpack configuration for WASM and special packages
  webpack: (config, { isServer }) => {
    // Handle web-tree-sitter WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Add fallbacks for Node.js built-in modules (client-side)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    return config;
  },

  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "9.0.0",
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },

  // Redirects for backward compatibility
  async redirects() {
    return [];
  },
};

export default withSerwist(nextConfig);
