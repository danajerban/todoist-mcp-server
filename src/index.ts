#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { CREATE_TASK_TOOL } from "./tools.js";

const server = new Server(
  {
    name: "todoist-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TODOIST_API_TOKEN = process.env.TODOIST_API_TOKEN!;
if (!TODOIST_API_TOKEN) {
  console.error("Error: TODOIST_API_TOKEN environment variable is required");
  console.error(
    "Please set your Todoist API token in the environment variable TODOIST_API_TOKEN"
  );
  console.error(
    "You can find your API token at: Todoist Settings → Integrations → Developer"
  );
  process.exit(1);
}

const todoistClient = new TodoistApi(TODOIST_API_TOKEN);

function isCreateTaskArgs(args: unknown): args is {
  content: string;
  description?: string;
  due_string?: string;
  priority?: number;
  project_id?: string;
  section_id?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "content" in args &&
    typeof (args as { content: string }).content === "string"
  );
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [CREATE_TASK_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    if (!args) {
      throw new Error("No arguments provided");
    }

    if (name === "todoist_create_task") {
      if (!isCreateTaskArgs(args)) {
        throw new Error("Invalid arguments for todoist_create_task");
      }

      const task = await todoistClient.addTask({
        content: args.content,
        description: args.description,
        dueString: args.due_string,
        priority: args.priority,
        projectId: args.project_id,
        sectionId: args.section_id,
      });

      return {
        content: [
          {
            type: "text",
            text: `Task created:\nTitle: ${task.content}${
              task.description ? `\nDescription: ${task.description}` : ""
            }${task.due ? `\nDue: ${task.due.string}` : ""}${
              task.priority ? `\nPriority: ${task.priority}` : ""
            }`,
          },
        ],
        isError: false,
      };
    }
    
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Todoist MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});