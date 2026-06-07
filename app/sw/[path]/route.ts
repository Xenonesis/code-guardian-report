import { createSerwistRoute } from "@serwist/turbopack";

const swRoute = createSerwistRoute({
  swSrc: "src/sw.ts",
  globDirectory: process.cwd(),
});

export const GET = swRoute.GET;
export const generateStaticParams = swRoute.generateStaticParams;

// Must be static values per Next.js route segment config requirements
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;
