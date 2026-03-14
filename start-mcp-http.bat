@echo off
echo Starting Code Guardian MCP Server (HTTP Mode)...
echo.
cd /d "%~dp0"
npm run mcp:http
