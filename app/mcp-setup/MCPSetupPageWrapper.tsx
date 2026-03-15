"use client";

import dynamic from "next/dynamic";

const MCPSetupPageClient = dynamic(() => import("./MCPSetupPageClient"), {
  ssr: false,
  loading: () => null,
});

export default function MCPSetupPageWrapper() {
  return <MCPSetupPageClient />;
}
