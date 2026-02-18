import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  // Trigger new deployment for CSP update
  reactStrictMode: true,

  // Enable standalone output for Docker deployments
  output: isProd ? "standalone" : undefined,

  // TypeScript strict mode - catch errors at build time
  typescript: {
    ignoreBuildErrors: false,
  },

  // Powered by header (security through obscurity)
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Production source maps for error tracking
  productionBrowserSourceMaps: false, // Enable if using error tracking service

  // Compiler optimizations - Remove console.log in production
  compiler: {
    removeConsole: isProd
      ? {
          exclude: ["error", "warn", "info"], // Keep error, warn, and info logs
        }
      : false,
  },

  // Optimize package imports for better tree-shaking
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-switch",
      "@radix-ui/react-slider",
      "@radix-ui/react-progress",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
      "recharts",
      "framer-motion",
    ],
    // Enable server actions for future use
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Turbopack configuration for Next.js 16+
  // Set root to project directory to silence multiple lockfiles warning
  turbopack: {
    root: ".",
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
      {
        protocol: "https",
        hostname: "*.google.com",
      },
      {
        protocol: "https",
        hostname: "*.googleapis.com",
      },
    ],
    // Optimize images
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack configuration for WASM and special packages
  webpack: (config, { isServer, dev }) => {
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
        stream: false,
        buffer: false,
      };
    }

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Production optimizations
    if (!dev) {
      // Remove console.log in production (keep console.error, console.warn)
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...config.optimization.minimizer,
          // Note: Next.js already includes TerserPlugin, we're just configuring it
        ],
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module: { context?: string }) {
                // Get the name of the package
                const match = module.context?.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                );
                const packageName = match ? match[1] : "vendor";
                // npm package names are URL-safe, but some servers don't like @ symbols
                return `npm.${packageName.replace("@", "")}`;
              },
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "11.0.0",
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Headers for security and caching
  async headers() {
    return [
      // Global security headers
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
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Download-Options",
            value: "noopen",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          // Content Security Policy - Allow GitHub API access
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://vercel.live https://vitals.vercel-insights.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://*.github.com https://raw.githubusercontent.com https://codeload.github.com https://fonts.gstatic.com https://*.google.com https://*.firebaseio.com https://*.googleapis.com https://*.firebase.com https://*.google-analytics.com https://vercel.live https://vitals.vercel-insights.com https://va.vercel-insights.com wss://*.firebaseio.com; frame-src 'self' https://vercel.live https://*.firebaseapp.com https://*.firebase.com https://apis.google.com; worker-src 'self' blob:; manifest-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
          // HSTS - Strict Transport Security
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
      // Service Worker headers
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
      // Static assets - Long cache
      {
        source: "/assets/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Fonts - Long cache
      {
        source: "/(.*).woff2",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      // Images - Long cache
      {
        source: "/(.*).png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/(.*).jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/(.*).svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // API routes - No cache
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      // Health check - No cache
      {
        source: "/api/health",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
          {
            key: "Content-Type",
            value: "application/health+json",
          },
        ],
      },
    ];
  },

  // Redirects for backward compatibility and SEO
  async redirects() {
    return [
      // Old routes to new routes
      {
        source: "/dashboard",
        destination: "/",
        permanent: true,
      },
      {
        source: "/analyze",
        destination: "/?tab=upload",
        permanent: false,
      },
      {
        source: "/reports",
        destination: "/?tab=reports",
        permanent: false,
      },
      // Merge privacy and terms to legal
      {
        source: "/privacy",
        destination: "/legal?tab=privacy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/legal?tab=terms",
        permanent: true,
      },
      // Trailing slash normalization
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ];
  },

  // Rewrites for cleaner URLs
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default withSerwist(nextConfig);
