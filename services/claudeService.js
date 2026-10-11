import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { fileURLToPath } from "node:url";
import path from "node:path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const mcpClient = new Client({
  name: "employee-web-client",
  version: "1.0.0"
});

// Absolute path so server.js works from any directory
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(projectRoot, "server.js")],
  env: {
    ...process.env,
    DB_HOST: process.env.DB_HOST || "127.0.0.1"
  }
});

let claudeTools = [];

export async function connectMcp() {
  await mcpClient.connect(transport);

  const { tools } = await mcpClient.listTools();

  claudeTools = tools.map(tool => ({
    name: tool.name,
    description: tool.description || "",
    input_schema: tool.inputSchema
  }));

  console.log(
    "MCP tools connected:",
    claudeTools.map(tool => tool.name)
  );
}

export async function askClaude(question) {
  const messages = [
    {
      role: "user",
      content: question
    }
  ];

  for (let i = 0; i < 5; i++) {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      tools: claudeTools,
      messages
    });

    messages.push({
      role: "assistant",
      content: response.content
    });

    if (response.stop_reason !== "tool_use") {
      return response.content
        .filter(block => block.type === "text")
        .map(block => block.text)
        .join("\n");
    }

    const toolResults = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      console.log("Claude selected tool:", block.name);

      try {
        const result = await mcpClient.callTool({
          name: block.name,
          arguments: block.input
        });

        console.log("MCP TOOL RESULT:", JSON.stringify(result, null, 2));

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result.content),
          is_error: result.isError === true
        });
      } catch (error) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `Tool failed: ${error.message}`,
          is_error: true
        });
      }
    }

    messages.push({
      role: "user",
      content: toolResults
    });
  }

  return "The maximum number of tool calls was reached.";
}

export async function disconnectMcp() {
  await mcpClient.close();
}