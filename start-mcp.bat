@echo off
echo Starting Code Guardian MCP Server...
echo.
cd /d "%~dp0"
npm run mcp:stdio
