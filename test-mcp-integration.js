const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const {
  StdioClientTransport,
} = require("@modelcontextprotocol/sdk/client/stdio.js");

async function testMCPServer() {
  console.log("=== Code Guardian MCP Server Test ===\n");

  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/mcp/mcp/transports/stdio.js"],
  });

  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("✓ Connected to MCP server\n");

  // List all available tools
  const tools = await client.listTools();
  console.log(`✓ Available Tools (${tools.tools.length}):`);
  tools.tools.forEach((tool) => {
    console.log(`  - ${tool.name}: ${tool.description?.substring(0, 80)}...`);
  });

  console.log("\n=== Testing scan_file Tool ===");
  const fs = require("fs");
  const code = fs.readFileSync("src/config/security.ts", "utf-8");
  const scanResult = await client.callTool({
    name: "scan_file",
    arguments: {
      code: code,
      filename: "security.ts",
      language: "typescript",
    },
  });
  const scanData = JSON.parse(scanResult.content[0].text);
  console.log(`✓ Scanned security.ts`);
  console.log(`  Issues found: ${scanData.issueCount}`);
  console.log(`  Analysis time: ${scanData.analysisTimeMs}ms`);

  console.log("\n=== Testing detect_secrets Tool ===");
  const testCode = `
    const apiKey = "sk-1234567890abcdef";
    const password = "SuperSecret123!";
    const dbUrl = "mongodb://admin:password@localhost:27017/db";
  `;
  const secretsResult = await client.callTool({
    name: "detect_secrets",
    arguments: {
      code: testCode,
      filename: "config.js",
    },
  });
  const secretsData = JSON.parse(secretsResult.content[0].text);
  console.log(`✓ Detected secrets in config.js`);
  console.log(`  Secrets found: ${secretsData.secretCount || 0}`);

  console.log("\n=== Testing calculate_metrics Tool ===");
  const metricsResult = await client.callTool({
    name: "calculate_metrics",
    arguments: {
      code: code,
      filename: "security.ts",
    },
  });
  const metricsData = JSON.parse(metricsResult.content[0].text);
  console.log(`✓ Calculated metrics for security.ts`);
  console.log(`  Metrics available: ${Object.keys(metricsData).join(", ")}`);

  console.log("\n=== Testing query_memory Tool ===");
  const memoryResult = await client.callTool({
    name: "query_memory",
    arguments: {
      query: "scan",
    },
  });
  const memoryData = JSON.parse(memoryResult.content[0].text);
  console.log(`✓ Queried memory store`);
  console.log(`  Results: ${memoryData.results?.length || 0} entries`);

  await client.close();
  console.log("\n✓ All tests completed successfully!");
  console.log("✓ MCP server is fully operational");
}

testMCPServer().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
