import type { Metadata } from "next";
import MCPSetupPageWrapper from "./MCPSetupPageWrapper";

export const metadata: Metadata = {
  title: "MCP Server Setup - Code Guardian Enterprise",
  description:
    "Connect Code Guardian's 19-tool security suite to Claude Desktop, Cursor, VS Code Copilot, or any HTTP-based AI client via the Model Context Protocol.",
};

export default function MCPSetupPage() {
  return <MCPSetupPageWrapper />;
}
